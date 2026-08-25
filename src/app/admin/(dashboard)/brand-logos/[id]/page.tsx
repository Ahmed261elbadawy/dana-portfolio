import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BrandLogoForm } from "../brand-logo-form";

export default async function EditBrandLogoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: brandLogo } = await supabase
    .from("brand_logos")
    .select("*")
    .eq("id", id)
    .single();

  if (!brandLogo) notFound();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-display-md">Edit brand logo</h1>
        <p className="mt-1 text-ink/60">{brandLogo.name}</p>
      </div>
      <BrandLogoForm brandLogo={brandLogo} />
    </div>
  );
}
