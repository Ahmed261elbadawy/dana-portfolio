"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { BrandLogo } from "@/lib/types/database";
import { safeRemoveSolidBackground } from "@/lib/image/remove-background";

export async function upsertBrandLogo(
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const supabase = await createClient();

  const id = (formData.get("id") as string | null) || null;
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim() || null;
  const published = formData.get("published") === "on";
  const removeBg = formData.get("remove_bg") === "on";
  const logoFile = formData.get("logo") as File | null;

  if (!name) return { error: "Brand name is required." };

  let logoUrl: string | undefined;
  if (logoFile && logoFile.size > 0) {
    const original = Buffer.from(await logoFile.arrayBuffer());
    const { buffer, processed } = removeBg
      ? await safeRemoveSolidBackground(original)
      : { buffer: original, processed: false };
    const ext = processed ? "png" : (logoFile.name.split(".").pop() ?? "png");
    const contentType = processed ? "image/png" : logoFile.type || "image/png";
    const path = `brand-${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(path, buffer, { upsert: true, contentType });
    if (uploadError) return { error: `Logo upload failed: ${uploadError.message}` };
    const { data } = supabase.storage.from("logos").getPublicUrl(path);
    logoUrl = data.publicUrl;
  }

  if (id) {
    const update: Partial<BrandLogo> = { name, category, published };
    if (logoUrl) update.logo_url = logoUrl;
    const { error } = await supabase.from("brand_logos").update(update).eq("id", id);
    if (error) return { error: error.message };
  } else {
    if (!logoUrl) return { error: "A logo image is required." };

    const { count } = await supabase
      .from("brand_logos")
      .select("*", { count: "exact", head: true });

    const { error } = await supabase.from("brand_logos").insert({
      name,
      category,
      published,
      logo_url: logoUrl,
      sort_order: count ?? 0,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/brand-logos");
  revalidatePath("/");
  redirect("/admin/brand-logos");
}

export async function deleteBrandLogo(id: string) {
  const supabase = await createClient();
  await supabase.from("brand_logos").delete().eq("id", id);
  revalidatePath("/admin/brand-logos");
  revalidatePath("/");
}

export async function moveBrandLogo(id: string, direction: "up" | "down") {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("brand_logos")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });

  if (!items) return;

  const idx = items.findIndex((b) => b.id === id);
  if (idx === -1) return;

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= items.length) return;

  const current = items[idx];
  const swapWith = items[swapIdx];

  await supabase
    .from("brand_logos")
    .update({ sort_order: swapWith.sort_order })
    .eq("id", current.id);
  await supabase
    .from("brand_logos")
    .update({ sort_order: current.sort_order })
    .eq("id", swapWith.id);

  revalidatePath("/admin/brand-logos");
  revalidatePath("/");
}
