"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markRead(id: string, read: boolean) {
  const supabase = await createClient();
  await supabase.from("inquiries").update({ read }).eq("id", id);
  revalidatePath("/admin/inquiries");
}

export async function deleteInquiry(id: string) {
  const supabase = await createClient();
  await supabase.from("inquiries").delete().eq("id", id);
  revalidatePath("/admin/inquiries");
}
