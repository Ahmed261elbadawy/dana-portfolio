"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { WorkGalleryCategory, WorkGalleryItem } from "@/lib/types/database";

export async function upsertWorkGalleryItem(
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const supabase = await createClient();

  const id = (formData.get("id") as string | null) || null;
  const category = String(formData.get("category") ?? "") as WorkGalleryCategory;
  const altText = String(formData.get("alt_text") ?? "").trim() || null;
  const published = formData.get("published") === "on";
  const mediaFile = formData.get("media") as File | null;

  if (!["grids", "production", "direction"].includes(category)) {
    return { error: "Choose a valid category." };
  }

  let mediaUrl: string | undefined;
  if (mediaFile && mediaFile.size > 0) {
    const isVideo = mediaFile.type.startsWith("video/");
    const bucket = isVideo ? "videos" : "images";
    const ext = mediaFile.name.split(".").pop() ?? (isVideo ? "mp4" : "jpg");
    const path = `work-${category}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, mediaFile, { upsert: true, contentType: mediaFile.type });
    if (uploadError) return { error: `Upload failed: ${uploadError.message}` };
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    mediaUrl = data.publicUrl;
  }

  if (id) {
    const update: Partial<WorkGalleryItem> = { category, alt_text: altText, published };
    if (mediaUrl) update.media_url = mediaUrl;
    const { error } = await supabase
      .from("work_gallery_items")
      .update(update)
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    if (!mediaUrl) return { error: "A photo or video is required." };

    const { count } = await supabase
      .from("work_gallery_items")
      .select("*", { count: "exact", head: true })
      .eq("category", category);

    const { error } = await supabase.from("work_gallery_items").insert({
      category,
      alt_text: altText,
      published,
      media_url: mediaUrl,
      sort_order: count ?? 0,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/work-gallery");
  revalidatePath("/work");
  redirect("/admin/work-gallery");
}

export async function deleteWorkGalleryItem(id: string) {
  const supabase = await createClient();
  await supabase.from("work_gallery_items").delete().eq("id", id);
  revalidatePath("/admin/work-gallery");
  revalidatePath("/work");
}

export async function moveWorkGalleryItem(
  id: string,
  category: WorkGalleryCategory,
  direction: "up" | "down",
) {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("work_gallery_items")
    .select("id, sort_order")
    .eq("category", category)
    .order("sort_order", { ascending: true });

  if (!items) return;

  const idx = items.findIndex((item) => item.id === id);
  if (idx === -1) return;

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= items.length) return;

  const current = items[idx];
  const swapWith = items[swapIdx];

  await supabase
    .from("work_gallery_items")
    .update({ sort_order: swapWith.sort_order })
    .eq("id", current.id);
  await supabase
    .from("work_gallery_items")
    .update({ sort_order: current.sort_order })
    .eq("id", swapWith.id);

  revalidatePath("/admin/work-gallery");
  revalidatePath("/work");
}
