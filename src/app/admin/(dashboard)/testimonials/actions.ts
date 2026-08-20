"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Testimonial } from "@/lib/types/database";

export async function upsertTestimonial(
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const supabase = await createClient();

  const id = (formData.get("id") as string | null) || null;
  const quote = String(formData.get("quote") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim() || null;
  const brand = String(formData.get("brand") ?? "").trim() || null;
  const published = formData.get("published") === "on";
  const avatarFile = formData.get("avatar") as File | null;

  if (!quote) return { error: "Quote is required." };
  if (!author) return { error: "Author is required." };

  let avatarUrl: string | undefined;
  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split(".").pop() ?? "jpg";
    const path = `${author.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, avatarFile, { upsert: true });
    if (uploadError) return { error: `Photo upload failed: ${uploadError.message}` };
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    avatarUrl = data.publicUrl;
  }

  if (id) {
    const update: Partial<Testimonial> = { quote, author, role, brand, published };
    if (avatarUrl) update.avatar_url = avatarUrl;
    const { error } = await supabase.from("testimonials").update(update).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { count } = await supabase
      .from("testimonials")
      .select("*", { count: "exact", head: true });

    const { error } = await supabase.from("testimonials").insert({
      quote,
      author,
      role,
      brand,
      published,
      avatar_url: avatarUrl ?? null,
      sort_order: count ?? 0,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  redirect("/admin/testimonials");
}

export async function deleteTestimonial(id: string) {
  const supabase = await createClient();
  await supabase.from("testimonials").delete().eq("id", id);
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

export async function moveTestimonial(id: string, direction: "up" | "down") {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("testimonials")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });

  if (!items) return;

  const idx = items.findIndex((t) => t.id === id);
  if (idx === -1) return;

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= items.length) return;

  const current = items[idx];
  const swapWith = items[swapIdx];

  await supabase
    .from("testimonials")
    .update({ sort_order: swapWith.sort_order })
    .eq("id", current.id);
  await supabase
    .from("testimonials")
    .update({ sort_order: current.sort_order })
    .eq("id", swapWith.id);

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}
