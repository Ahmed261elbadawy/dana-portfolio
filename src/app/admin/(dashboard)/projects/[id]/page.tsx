import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectForm } from "../project-form";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("brands")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) notFound();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-display-md">Edit project</h1>
          <p className="mt-1 text-ink/60">{project.name}</p>
        </div>
        <Link
          href={`/admin/projects/${project.id}/case-study`}
          className="rounded-pill border border-ink/15 px-5 py-2.5 text-sm font-semibold"
        >
          Edit case study ↗
        </Link>
      </div>
      <ProjectForm project={project} />
    </div>
  );
}
