import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Never throws - transcoding is a nice-to-have, not something that should
// ever crash an upload. Any failure (unsupported codec, ffmpeg missing,
// running too long) falls back to the original file, with
// `transcoded: false` so the caller can keep the original extension/type.
export async function safeTranscodeToMp4(
  input: Buffer,
): Promise<{ buffer: Buffer; transcoded: boolean }> {
  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("video transcode timed out")), 40000),
    );
    const buffer = await Promise.race([transcodeToMp4(input), timeout]);
    return { buffer, transcoded: true };
  } catch (err) {
    console.error("transcodeToMp4 failed, uploading original", err);
    return { buffer: input, transcoded: false };
  }
}

// Re-encodes any uploaded video (a phone .mov with HEVC, a screen
// recording, whatever) into a widely-compatible H.264/AAC MP4, so it
// reliably autoplays across browsers instead of silently failing to
// decode. Downscaled to a max width since these only ever show as a
// homepage card cover, which also keeps the file (and transcode time)
// small. "ultrafast" trades file size for speed - this only needs to run
// once at upload time, not repeatedly.
async function transcodeToMp4(input: Buffer): Promise<Buffer> {
  const { default: ffmpegPath } = await import("ffmpeg-static");
  if (!ffmpegPath) throw new Error("ffmpeg binary not found");

  const dir = await mkdtemp(join(tmpdir(), "video-"));
  const inPath = join(dir, "in");
  const outPath = join(dir, "out.mp4");

  try {
    await writeFile(inPath, input);

    await new Promise<void>((resolve, reject) => {
      const proc = spawn(ffmpegPath, [
        "-y",
        "-i", inPath,
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-crf", "28",
        "-vf", "scale='min(1280,iw)':-2",
        "-movflags", "+faststart",
        "-c:a", "aac",
        "-b:a", "96k",
        outPath,
      ]);
      proc.on("error", reject);
      proc.on("close", (code) =>
        code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`)),
      );
    });

    return await readFile(outPath);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
