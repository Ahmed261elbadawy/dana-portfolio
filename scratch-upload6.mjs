import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";

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

  const file = await readFile("/tmp/converted-test6.mp4");
  console.log("converted file bytes:", file.length);

  const path = `test-cover-${Date.now()}.mp4`;
  const { error: upErr } = await supabase.storage
    .from("videos")
    .upload(path, file, { upsert: true, contentType: "video/mp4" });
  if (upErr) throw new Error("upload: " + upErr.message);

  const { data: pub } = supabase.storage.from("videos").getPublicUrl(path);
  console.log("public url:", pub.publicUrl);

  const { count } = await supabase
    .from("brands")
    .select("*", { count: "exact", head: true });

  const { data: row, error: insErr } = await supabase
    .from("brands")
    .insert({
      name: "Test 6",
      slug: "test-6-" + Date.now(),
      industry: "Test",
      services: ["content_creation"],
      published: true,
      cover_image_url: pub.publicUrl,
      sort_order: count ?? 0,
    })
    .select()
    .single();
  if (insErr) throw new Error("insert: " + insErr.message);

  console.log("created project:", row.id, row.slug);
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
