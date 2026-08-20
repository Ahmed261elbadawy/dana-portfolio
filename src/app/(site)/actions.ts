"use server";

import { createClient } from "@/lib/supabase/server";
import type { ServiceType } from "@/lib/types/database";

export async function submitInquiry(
  _prevState: { error: string; success?: boolean } | null,
  formData: FormData,
) {
  // Honeypot: a real visitor never fills this hidden field, only bots do.
  // Pretend success so bots don't learn to look for a different signal.
  if (String(formData.get("company_website") ?? "").trim() !== "") {
    return { error: "", success: true };
  }

  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const services = formData.getAll("services").map(String) as ServiceType[];
  const message = String(formData.get("message") ?? "").trim() || null;

  if (!name) return { error: "Name is required." };
  if (!email) return { error: "Email is required." };
  if (services.length === 0) {
    return { error: "Pick at least one service." };
  }

  const { error } = await supabase.from("inquiries").insert({
    name,
    email,
    phone,
    services,
    message,
  });

  if (error) return { error: "Something went wrong. Please try again." };

  return { error: "", success: true };
}
