"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Certificate } from "@/lib/types/database";

export async function upsertCertificate(
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const supabase = await createClient();

  const id = (formData.get("id") as string | null) || null;
  const title = String(formData.get("title") ?? "").trim();
  const issuer = String(formData.get("issuer") ?? "").trim() || null;
  const published = formData.get("published") === "on";
  const imageFile = formData.get("image") as File | null;

  if (!title) return { error: "Title is required." };

  let imageUrl: string | undefined;
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split(".").pop() ?? "jpg";
    const path = `certificate-${title.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(path, imageFile, { upsert: true });
    if (uploadError) return { error: `Image upload failed: ${uploadError.message}` };
    const { data } = supabase.storage.from("images").getPublicUrl(path);
    imageUrl = data.publicUrl;
  }

  if (id) {
    const update: Partial<Certificate> = { title, issuer, published };
    if (imageUrl) update.image_url = imageUrl;
    const { error } = await supabase.from("certificates").update(update).eq("id", id);
    if (error) return { error: error.message };
  } else {
    if (!imageUrl) return { error: "A certificate image is required." };

    const { count } = await supabase
      .from("certificates")
      .select("*", { count: "exact", head: true });

    const { error } = await supabase.from("certificates").insert({
      title,
      issuer,
      published,
      image_url: imageUrl,
      sort_order: count ?? 0,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/skills-certifications");
  revalidatePath("/");
  redirect("/admin/skills-certifications");
}

export async function deleteCertificate(id: string) {
  const supabase = await createClient();
  await supabase.from("certificates").delete().eq("id", id);
  revalidatePath("/admin/skills-certifications");
  revalidatePath("/");
}

export async function moveCertificate(id: string, direction: "up" | "down") {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("certificates")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });

  if (!items) return;

  const idx = items.findIndex((c) => c.id === id);
  if (idx === -1) return;

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= items.length) return;

  const current = items[idx];
  const swapWith = items[swapIdx];

  await supabase
    .from("certificates")
    .update({ sort_order: swapWith.sort_order })
    .eq("id", current.id);
  await supabase
    .from("certificates")
    .update({ sort_order: current.sort_order })
    .eq("id", swapWith.id);

  revalidatePath("/admin/skills-certifications");
  revalidatePath("/");
}
