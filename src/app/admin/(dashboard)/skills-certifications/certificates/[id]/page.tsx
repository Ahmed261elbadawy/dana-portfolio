import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CertificateForm } from "../certificate-form";

export default async function EditCertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: certificate } = await supabase
    .from("certificates")
    .select("*")
    .eq("id", id)
    .single();

  if (!certificate) notFound();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-display-md">Edit certificate</h1>
        <p className="mt-1 text-ink/60">{certificate.title}</p>
      </div>
      <CertificateForm certificate={certificate} />
    </div>
  );
}
