import { createClient } from "@/lib/supabase/server";
import { ProjectForm } from "../project-form";

export default async function NewProjectPage() {
  const supabase = await createClient();
  const { data: brandLogos } = await supabase
    .from("brand_logos")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-display-md">Add project</h1>
        <p className="mt-1 text-ink/60">
          Create a new card for the work grid.
        </p>
      </div>
      <ProjectForm brandLogos={brandLogos ?? []} />
    </div>
  );
}
