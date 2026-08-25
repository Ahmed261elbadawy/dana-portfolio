import sharp from "sharp";

function colorDist(
  data: Buffer | Uint8Array,
  idx: number,
  r: number,
  g: number,
  b: number,
) {
  return Math.hypot(data[idx] - r, data[idx + 1] - g, data[idx + 2] - b);
}

// Flood-fills a background color out to transparent, starting from the
// image's border pixels. Unlike a global chroma key, this only clears
// background that's actually connected to the edge, so it survives
// compression noise / antialiasing and won't eat interior artwork that
// happens to share a similar tone (e.g. a dark circle badge on a dark
// square). If the border itself isn't reasonably uniform (a photo, busy
// edge-to-edge art), the image is returned untouched.
export async function removeSolidBackground(input: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  if (width < 3 || height < 3) return input;

  const borderIdx: number[] = [];
  for (let x = 0; x < width; x++) {
    borderIdx.push((x) * channels, ((height - 1) * width + x) * channels);
  }
  for (let y = 1; y < height - 1; y++) {
    borderIdx.push((y * width) * channels, (y * width + width - 1) * channels);
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

  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  function maybeSeed(x: number, y: number) {
    const p = y * width + x;
    if (visited[p]) return;
    const idx = p * channels;
    if (colorDist(data, idx, avgR, avgG, avgB) < threshold) {
      visited[p] = 1;
      data[idx + 3] = 0;
      queue.push(p);
    }
  }

  for (let x = 0; x < width; x++) {
    maybeSeed(x, 0);
    maybeSeed(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    maybeSeed(0, y);
    maybeSeed(width - 1, y);
  }

  while (queue.length) {
    const p = queue.pop()!;
    const x = p % width;
    const y = (p / width) | 0;

    const neighbors: [number, number][] = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ];

    for (const [nx, ny] of neighbors) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const np = ny * width + nx;
      if (visited[np]) continue;
      const idx = np * channels;
      const dist = colorDist(data, idx, avgR, avgG, avgB);

      if (dist < threshold) {
        visited[np] = 1;
        data[idx + 3] = 0;
        queue.push(np);
      } else if (dist < threshold + softEdge) {
        visited[np] = 1;
        const t = (dist - threshold) / softEdge;
        data[idx + 3] = Math.round(data[idx + 3] * t);
      }
    }
  }

  return sharp(data, { raw: { width, height, channels } }).png().toBuffer();
}
