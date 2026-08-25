import sharp from "sharp";

// Chroma-keys out a flat background color (the common case for a logo
// exported on white/solid background) so logos display transparently.
// If the four corners don't agree on a single color — a photo, a
// gradient, art with corner detail — the image is returned untouched
// rather than risk cutting real content.
export async function removeSolidBackground(input: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  if (width < 2 || height < 2) return input;

  const corners = [
    0,
    (width - 1) * channels,
    (height - 1) * width * channels,
    ((height - 1) * width + (width - 1)) * channels,
  ];

  let r = 0;
  let g = 0;
  let b = 0;
  for (const idx of corners) {
    r += data[idx];
    g += data[idx + 1];
    b += data[idx + 2];
  }
  r /= corners.length;
  g /= corners.length;
  b /= corners.length;

  const maxCornerDist = Math.max(
    ...corners.map((idx) =>
      Math.hypot(data[idx] - r, data[idx + 1] - g, data[idx + 2] - b),
    ),
  );
  if (maxCornerDist > 24) return input;

  const threshold = 40;
  const softEdge = 25;

  for (let i = 0; i < data.length; i += channels) {
    const dist = Math.hypot(data[i] - r, data[i + 1] - g, data[i + 2] - b);
    if (dist < threshold) {
      data[i + 3] = 0;
    } else if (dist < threshold + softEdge) {
      const t = (dist - threshold) / softEdge;
      data[i + 3] = Math.round(data[i + 3] * t);
    }
  }

  return sharp(data, { raw: { width, height, channels } }).png().toBuffer();
}
