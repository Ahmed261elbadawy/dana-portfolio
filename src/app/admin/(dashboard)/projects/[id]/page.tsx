import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectForm } from "../project-form";

// A video cover upload goes through server-side transcoding, which can
// take longer than the platform's default function timeout.
export const maxDuration = 60;

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
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-display-md">Edit project</h1>
          <Link
            href={`/admin/projects/${project.id}/case-study`}
            className="shrink-0 rounded-pill border border-ink/15 px-5 py-2.5 text-sm font-semibold"
          >
            Edit case study ↗
          </Link>
        </div>
        <p className="text-ink/60">{project.name}</p>
      </div>
      <ProjectForm project={project} />
    </div>
  );
}
