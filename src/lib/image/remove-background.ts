function colorDist(
  data: Buffer | Uint8Array,
  idx: number,
  r: number,
  g: number,
  b: number,
) {
  return Math.hypot(data[idx] - r, data[idx + 1] - g, data[idx + 2] - b);
}

// Never throws - background removal is a nice-to-have, not something that
// should ever crash an upload. Any failure (unsupported format, a tricky
// SVG, an unexpected color space) falls back to the original file, with
// `processed: false` so the caller can keep the original extension/type.
export async function safeRemoveSolidBackground(
  input: Buffer,
): Promise<{ buffer: Buffer; processed: boolean }> {
  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("background removal timed out")), 6000),
    );
    const buffer = await Promise.race([removeSolidBackground(input), timeout]);
    return { buffer, processed: true };
  } catch (err) {
    console.error("removeSolidBackground failed, uploading original", err);
    return { buffer: input, processed: false };
  }
}

// Keys out a flat background color, estimated from the full border
// perimeter (not just corner pixels, which are too easily thrown off by
// compression noise or antialiasing). The key is applied globally rather
// than restricted to pixels connected to the edge, so enclosed holes that
// match the background (e.g. the inside of an "O" or a ring logo) also
// clear correctly. If the border itself isn't reasonably uniform (a photo,
// busy edge-to-edge art), the image is returned untouched.
export async function removeSolidBackground(input: Buffer): Promise<Buffer> {
  const { default: sharp } = await import("sharp");
  const { data, info } = await sharp(input)
    // These are small icons/logos, never displayed larger than a couple
    // hundred pixels - capping the working size keeps the per-pixel loops
    // below from ever running long enough to hit a serverless function's
    // execution time limit, regardless of how large the original upload is.
    .resize({ width: 1000, height: 1000, fit: "inside", withoutEnlargement: true })
    .toColourspace("srgb")
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  if (width < 3 || height < 3 || channels < 4) return input;

  const borderIdx: number[] = [];
  for (let x = 0; x < width; x++) {
    borderIdx.push(x * channels, ((height - 1) * width + x) * channels);
  }
  for (let y = 1; y < height - 1; y++) {
    borderIdx.push(y * width * channels, (y * width + width - 1) * channels);
  }

  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  for (const idx of borderIdx) {
    sumR += data[idx];
    sumG += data[idx + 1];
    sumB += data[idx + 2];
  }
  const avgR = sumR / borderIdx.length;
  const avgG = sumG / borderIdx.length;
  const avgB = sumB / borderIdx.length;

  let sumSq = 0;
  for (const idx of borderIdx) {
    sumSq += colorDist(data, idx, avgR, avgG, avgB) ** 2;
  }
  const stdDev = Math.sqrt(sumSq / borderIdx.length);
  if (stdDev > 34) return input;

  const threshold = 42;
  const softEdge = 22;

  for (let p = 0; p < width * height; p++) {
    const idx = p * channels;
    const dist = colorDist(data, idx, avgR, avgG, avgB);
    if (dist < threshold) {
      data[idx + 3] = 0;
    } else if (dist < threshold + softEdge) {
      const t = (dist - threshold) / softEdge;
      data[idx + 3] = Math.round(data[idx + 3] * t);
    }
  }

  removeLargeSolidBlobs(data, width, height, channels);
  recolorWhiteForeground(data, width, height, channels);

  return sharp(data, { raw: { width, height, channels } }).png().toBuffer();
}

// Some logos are exported as a mark already sitting inside its own solid
// badge (a white or near-white circle/rounded-square "seal"), not touching
// the image edges - the border-based key above can't see that, since it
// only samples the perimeter. This finds any connected near-white region
// that's large relative to the whole image (a real badge shape, not just
// an antialiasing fleck or a letter's counter) and clears it too. Small
// or already-clear regions are left alone.
function removeLargeSolidBlobs(
  data: Buffer,
  width: number,
  height: number,
  channels: number,
) {
  const total = width * height;
  const nearWhiteThreshold = 46;
  const minBlobFraction = 0.1;
  const visited = new Uint8Array(total);

  for (let start = 0; start < total; start++) {
    if (visited[start]) continue;
    const startIdx = start * channels;
    if (data[startIdx + 3] === 0) {
      visited[start] = 1;
      continue;
    }
    if (colorDist(data, startIdx, 255, 255, 255) >= nearWhiteThreshold) {
      continue;
    }

    const region: number[] = [start];
    visited[start] = 1;
    let head = 0;
    while (head < region.length) {
      const p = region[head++];
      const x = p % width;
      const y = (p / width) | 0;
      const neighbors = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ];
      for (const [nx, ny] of neighbors) {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const np = ny * width + nx;
        if (visited[np]) continue;
        const nIdx = np * channels;
        if (data[nIdx + 3] === 0) {
          visited[np] = 1;
          continue;
        }
        if (colorDist(data, nIdx, 255, 255, 255) < nearWhiteThreshold) {
          visited[np] = 1;
          region.push(np);
        }
      }
    }

    if (region.length / total >= minBlobFraction) {
      for (const p of region) {
        data[p * channels + 3] = 0;
      }
    }
  }
}

// After the background is cleared, a white/near-white logo (common for
// marks designed to sit on a dark surface) becomes invisible once it's
// composited onto a light page. This looks at the brightest ~15% of
// remaining foreground pixels (ignoring the antialiased blend halo around
// thin strokes, which otherwise drags a simple average down) and, if that
// core color is white/near-white and low-saturation, recolors the whole
// foreground to near-black. Genuinely colored logos are left alone.
function recolorWhiteForeground(
  data: Buffer,
  width: number,
  height: number,
  channels: number,
) {
  const lums: number[] = [];
  const idxs: number[] = [];

  for (let p = 0; p < width * height; p++) {
    const idx = p * channels;
    if (data[idx + 3] === 0) continue;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    lums.push(0.299 * r + 0.587 * g + 0.114 * b);
    idxs.push(idx);
  }
  if (!lums.length) return;

  const sorted = [...lums].sort((a, b) => a - b);
  const p85 = sorted[Math.floor(sorted.length * 0.85)];

  let satSum = 0;
  let satCount = 0;
  for (let i = 0; i < lums.length; i++) {
    if (lums[i] < p85 * 0.9) continue;
    const idx = idxs[i];
    satSum += Math.max(data[idx], data[idx + 1], data[idx + 2]) -
      Math.min(data[idx], data[idx + 1], data[idx + 2]);
    satCount++;
  }
  const avgSat = satCount ? satSum / satCount : 0;

  if (p85 < 225 || avgSat > 28) return;

  for (const idx of idxs) {
    data[idx] = 20;
    data[idx + 1] = 20;
    data[idx + 2] = 20;
  }
}
