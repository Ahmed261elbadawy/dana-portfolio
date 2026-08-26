import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const envText = await readFile(".env.local", "utf8");
for (const line of envText.split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

async function main() {
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: "danasherif6@gmail.com",
    password: "dana12345",
  });
  if (authError) throw new Error("auth: " + authError.message);
  console.log("signed in");

  const file = await readFile(join(tmpdir(), "converted-test5.mp4"));
  console.log("converted file bytes:", file.length);

  const path = `test-cover-${Date.now()}.mp4`;
  const { error: upErr } = await supabase.storage
    .from("videos")
    .upload(path, file, { upsert: true, contentType: "video/mp4" });
  if (upErr) throw new Error("upload: " + upErr.message);

  const { data: pub } = supabase.storage.from("videos").getPublicUrl(path);
  console.log("public url:", pub.publicUrl);

  const { error: updErr } = await supabase
    .from("brands")
    .update({ cover_image_url: pub.publicUrl })
    .eq("id", "ee400ebb-ffc1-4f5a-a5cf-a5fa4fbca24c");
  if (updErr) throw new Error("update: " + updErr.message);

  console.log("updated Test 5 cover to converted mp4");
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
