"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Brand, ServiceType } from "@/lib/types/database";
import { safeRemoveSolidBackground } from "@/lib/image/remove-background";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function upsertBrand(
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const supabase = await createClient();

  const id = (formData.get("id") as string | null) || null;
  const name = String(formData.get("name") ?? "").trim();
  const industry = String(formData.get("industry") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || name);
  const accentColor = String(formData.get("accent_color") ?? "").trim() || null;
  const published = formData.get("published") === "on";
  const services = formData.getAll("services").map(String) as ServiceType[];
  const logoFile = formData.get("logo") as File | null;
  const coverFile = formData.get("cover") as File | null;

  if (!name) return { error: "Name is required." };
  if (!slug) return { error: "Couldn't generate a slug, check the name." };

  let logoUrl: string | undefined;
  if (logoFile && logoFile.size > 0) {
    const original = Buffer.from(await logoFile.arrayBuffer());
    const { buffer, processed } = await safeRemoveSolidBackground(original);
    const ext = processed ? "png" : (logoFile.name.split(".").pop() ?? "png");
    const contentType = processed ? "image/png" : logoFile.type || "image/png";
    const path = `${slug}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(path, buffer, { upsert: true, contentType });
    if (uploadError) return { error: `Logo upload failed: ${uploadError.message}` };
    const { data } = supabase.storage.from("logos").getPublicUrl(path);
    logoUrl = data.publicUrl;
  }

  let coverUrl: string | undefined;
  if (coverFile && coverFile.size > 0) {
    const ext = coverFile.name.split(".").pop() ?? "jpg";
    const path = `${slug}-cover-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(path, coverFile, { upsert: true });
    if (uploadError)
      return { error: `Cover photo upload failed: ${uploadError.message}` };
    const { data } = supabase.storage.from("images").getPublicUrl(path);
    coverUrl = data.publicUrl;
  }

  if (id) {
    const update: Partial<Brand> = {
      name,
      industry,
      slug,
      accent_color: accentColor,
      published,
      services,
    };
    if (logoUrl) update.logo_url = logoUrl;
    if (coverUrl) update.cover_image_url = coverUrl;

    const { error } = await supabase.from("brands").update(update).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { count } = await supabase
      .from("brands")
      .select("*", { count: "exact", head: true });

    const { error } = await supabase.from("brands").insert({
      name,
      industry,
      slug,
      accent_color: accentColor,
      published,
      services,
      logo_url: logoUrl ?? null,
      cover_image_url: coverUrl ?? null,
      sort_order: count ?? 0,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/projects");
  revalidatePath("/");
  redirect("/admin/projects");
}

export async function deleteBrand(id: string) {
  const supabase = await createClient();
  await supabase.from("brands").delete().eq("id", id);
  revalidatePath("/admin/projects");
  revalidatePath("/");
}

export async function moveBrand(id: string, direction: "up" | "down") {
  const supabase = await createClient();
  const { data: brands } = await supabase
    .from("brands")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });

  if (!brands) return;

  const idx = brands.findIndex((b) => b.id === id);
  if (idx === -1) return;

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= brands.length) return;

  const current = brands[idx];
  const swapWith = brands[swapIdx];

  await supabase
    .from("brands")
    .update({ sort_order: swapWith.sort_order })
    .eq("id", current.id);
  await supabase
    .from("brands")
    .update({ sort_order: current.sort_order })
    .eq("id", swapWith.id);

  revalidatePath("/admin/projects");
  revalidatePath("/");
}
