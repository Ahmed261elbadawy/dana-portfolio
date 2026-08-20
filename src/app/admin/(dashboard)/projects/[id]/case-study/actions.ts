"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CaseStudy } from "@/lib/types/database";

export async function upsertCaseStudy(
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const supabase = await createClient();

  const brandId = String(formData.get("brand_id"));
  const caseStudyId = (formData.get("case_study_id") as string | null) || null;
  const one_line_brief = String(formData.get("one_line_brief") ?? "").trim();
  const challenge = String(formData.get("challenge") ?? "").trim();
  const approach = String(formData.get("approach") ?? "").trim();
  const art_direction = String(formData.get("art_direction") ?? "").trim();
  const deliverables = String(formData.get("deliverables") ?? "")
    .split("\n")
    .map((d) => d.trim())
    .filter(Boolean);
  const published = formData.get("published") === "on";
  const heroFile = formData.get("hero_media") as File | null;

  let heroUrl: string | undefined;
  if (heroFile && heroFile.size > 0) {
    const ext = heroFile.name.split(".").pop() ?? "jpg";
    const path = `${brandId}-hero-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(path, heroFile, { upsert: true });
    if (uploadError)
      return { error: `Hero image upload failed: ${uploadError.message}` };
    const { data } = supabase.storage.from("images").getPublicUrl(path);
    heroUrl = data.publicUrl;
  }

  const payload: Partial<CaseStudy> = {
    brand_id: brandId,
    one_line_brief,
    challenge,
    approach,
    art_direction,
    deliverables,
    published,
  };
  if (heroUrl) {
    payload.hero_media_url = heroUrl;
    payload.hero_media_kind = "image";
  }

  if (caseStudyId) {
    const { error } = await supabase
      .from("case_studies")
      .update(payload)
      .eq("id", caseStudyId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("case_studies").insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath(`/admin/projects/${brandId}/case-study`);
  revalidatePath("/");
  redirect(`/admin/projects/${brandId}/case-study`);
}

export async function addMedia(formData: FormData) {
  const supabase = await createClient();

  const caseStudyId = String(formData.get("case_study_id"));
  const kind = String(formData.get("kind")) as
    | "image"
    | "upload_video"
    | "embed";
  const altText = String(formData.get("alt_text") ?? "");
  const aspectRatio = String(formData.get("aspect_ratio") ?? "9/16");
  const file = formData.get("file") as File | null;
  const embedUrl = String(formData.get("embed_url") ?? "").trim();

  let url = "";
  let provider: "instagram" | "youtube" | "vimeo" | null = null;

  if (kind === "embed") {
    if (!embedUrl) return;
    url = embedUrl;
    if (/instagram\.com/.test(embedUrl)) provider = "instagram";
    else if (/youtube\.com|youtu\.be/.test(embedUrl)) provider = "youtube";
    else if (/vimeo\.com/.test(embedUrl)) provider = "vimeo";
  } else if (file && file.size > 0) {
    const bucket = kind === "image" ? "images" : "videos";
    const ext = file.name.split(".").pop() ?? (kind === "image" ? "jpg" : "mp4");
    const path = `${caseStudyId}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });
    if (uploadError) return;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    url = data.publicUrl;
  } else {
    return;
  }

  const { count } = await supabase
    .from("media")
    .select("*", { count: "exact", head: true })
    .eq("case_study_id", caseStudyId);

  await supabase.from("media").insert({
    case_study_id: caseStudyId,
    kind,
    url,
    provider,
    alt_text: altText,
    aspect_ratio: aspectRatio,
    sort_order: count ?? 0,
  });

  revalidatePath("/admin/projects");
  revalidatePath("/work");
  revalidatePath("/");
}

export async function deleteMedia(id: string) {
  const supabase = await createClient();
  await supabase.from("media").delete().eq("id", id);
  revalidatePath("/admin/projects");
  revalidatePath("/");
}

export async function moveMedia(
  id: string,
  caseStudyId: string,
  direction: "up" | "down",
) {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("media")
    .select("id, sort_order")
    .eq("case_study_id", caseStudyId)
    .order("sort_order", { ascending: true });

  if (!items) return;

  const idx = items.findIndex((m) => m.id === id);
  if (idx === -1) return;

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= items.length) return;

  const current = items[idx];
  const swapWith = items[swapIdx];

  await supabase
    .from("media")
    .update({ sort_order: swapWith.sort_order })
    .eq("id", current.id);
  await supabase
    .from("media")
    .update({ sort_order: current.sort_order })
    .eq("id", swapWith.id);

  revalidatePath("/admin/projects");
  revalidatePath("/");
}

export async function addMetric(formData: FormData) {
  const supabase = await createClient();

  const caseStudyId = String(formData.get("case_study_id"));
  const label = String(formData.get("label") ?? "").trim();
  const value = String(formData.get("value") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim() || null;
  if (!label || !value) return;

  const { count } = await supabase
    .from("metrics")
    .select("*", { count: "exact", head: true })
    .eq("case_study_id", caseStudyId);

  await supabase.from("metrics").insert({
    case_study_id: caseStudyId,
    label,
    value,
    note,
    sort_order: count ?? 0,
  });

  revalidatePath("/admin/projects");
  revalidatePath("/");
}

export async function deleteMetric(id: string) {
  const supabase = await createClient();
  await supabase.from("metrics").delete().eq("id", id);
  revalidatePath("/admin/projects");
  revalidatePath("/");
}
