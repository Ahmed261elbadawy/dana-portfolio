"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Skill } from "@/lib/types/database";
import { safeRemoveSolidBackground } from "@/lib/image/remove-background";

export async function upsertSkill(
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const supabase = await createClient();

  const id = (formData.get("id") as string | null) || null;
  const name = String(formData.get("name") ?? "").trim();
  const published = formData.get("published") === "on";
  const removeBg = formData.get("remove_bg") === "on";
  const iconFile = formData.get("icon") as File | null;

  if (!name) return { error: "Name is required." };

  let iconUrl: string | undefined;
  if (iconFile && iconFile.size > 0) {
    const original = Buffer.from(await iconFile.arrayBuffer());
    const { buffer, processed } = removeBg
      ? await safeRemoveSolidBackground(original)
      : { buffer: original, processed: false };
    const ext = processed ? "png" : (iconFile.name.split(".").pop() ?? "png");
    const contentType = processed ? "image/png" : iconFile.type || "image/png";
    const path = `skill-${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(path, buffer, { upsert: true, contentType });
    if (uploadError) return { error: `Icon upload failed: ${uploadError.message}` };
    const { data } = supabase.storage.from("logos").getPublicUrl(path);
    iconUrl = data.publicUrl;
  }

  if (id) {
    const update: Partial<Skill> = { name, published };
    if (iconUrl) update.icon_url = iconUrl;
    const { error } = await supabase.from("skills").update(update).eq("id", id);
    if (error) return { error: error.message };
  } else {
    if (!iconUrl) return { error: "An icon image is required." };

    const { count } = await supabase
      .from("skills")
      .select("*", { count: "exact", head: true });

    const { error } = await supabase.from("skills").insert({
      name,
      published,
      icon_url: iconUrl,
      sort_order: count ?? 0,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/skills-certifications");
  revalidatePath("/");
  redirect("/admin/skills-certifications");
}

export async function deleteSkill(id: string) {
  const supabase = await createClient();
  await supabase.from("skills").delete().eq("id", id);
  revalidatePath("/admin/skills-certifications");
  revalidatePath("/");
}

export async function moveSkill(id: string, direction: "up" | "down") {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("skills")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });

  if (!items) return;

  const idx = items.findIndex((s) => s.id === id);
  if (idx === -1) return;

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= items.length) return;

  const current = items[idx];
  const swapWith = items[swapIdx];

  await supabase.from("skills").update({ sort_order: swapWith.sort_order }).eq("id", current.id);
  await supabase.from("skills").update({ sort_order: current.sort_order }).eq("id", swapWith.id);

  revalidatePath("/admin/skills-certifications");
  revalidatePath("/");
}
