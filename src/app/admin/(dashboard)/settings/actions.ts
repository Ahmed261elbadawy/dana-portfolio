"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/lib/types/database";

export async function updateSiteSettings(
  _prevState: { error: string; success?: boolean } | null,
  formData: FormData,
) {
  const supabase = await createClient();

  const intro_paragraph = String(formData.get("intro_paragraph") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const services = String(formData.get("services") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const email = String(formData.get("email") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const education_badge =
    String(formData.get("education_badge") ?? "").trim() || null;
  const credential_lines = String(formData.get("credential_lines") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const cvFile = formData.get("cv") as File | null;
  const photoFile = formData.get("photo") as File | null;

  const update: Partial<SiteSettings> = {
    intro_paragraph,
    bio,
    services,
    email,
    whatsapp,
    education_badge,
    credential_lines,
  };

  if (cvFile && cvFile.size > 0) {
    const path = `cv-${Date.now()}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(path, cvFile, { upsert: true });
    if (uploadError) return { error: `CV upload failed: ${uploadError.message}` };
    const { data } = supabase.storage.from("documents").getPublicUrl(path);
    update.cv_url = data.publicUrl;
  }

  if (photoFile && photoFile.size > 0) {
    const ext = photoFile.name.split(".").pop() ?? "jpg";
    const path = `profile-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, photoFile, { upsert: true });
    if (uploadError) return { error: `Photo upload failed: ${uploadError.message}` };
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    update.photo_url = data.publicUrl;
  }

  const { error } = await supabase
    .from("site_settings")
    .update(update)
    .eq("id", true);

  if (error) return { error: error.message };

  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { error: "", success: true };
}
