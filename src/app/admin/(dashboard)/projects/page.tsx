import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteBrand, moveBrand } from "./actions";
import { ConfirmSubmitButton } from "./confirm-submit-button";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("brands")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-display-md">Projects</h1>
          <p className="mt-1 text-ink/60">
            One card per project on the public work grid.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="rounded-pill bg-burgundy px-6 py-3 text-sm font-semibold text-cream"
        >
          Add project ↗
        </Link>
      </div>

      {!projects?.length ? (
        <p className="rounded-card bg-paper p-6 text-ink/60">
          No projects yet. Add your first one.
        </p>
      ) : (
        <ul className="space-y-3">
          {projects.map((project, i) => (
            <li
              key={project.id}
              className="flex flex-wrap items-center gap-4 rounded-card bg-paper p-4"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-ink/10 bg-cream p-2">
                {project.logo_url ? (
                  <Image
                    src={project.logo_url}
                    alt=""
                    width={40}
                    height={40}
                    className="max-h-full max-w-full object-contain"
                    unoptimized
                  />
                ) : (
                  <span className="text-xs text-ink/30">No logo</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{project.name}</p>
                <p className="truncate text-sm text-ink/50">
                  {project.industry || "No industry set"}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-pill px-3 py-1 text-xs font-medium ${
                  project.published
                    ? "bg-yellow-deep/40 text-ink"
                    : "bg-ink/10 text-ink/50"
                }`}
              >
                {project.published ? "Published" : "Draft"}
              </span>

              <div className="flex shrink-0 items-center gap-1">
                <form action={moveBrand.bind(null, project.id, "up")}>
                  <button
                    type="submit"
                    disabled={i === 0}
                    aria-label="Move up"
                    className="rounded-md border border-ink/15 px-2.5 py-2 text-sm disabled:opacity-30"
                  >
                    ↑
                  </button>
                </form>
                <form action={moveBrand.bind(null, project.id, "down")}>
                  <button
                    type="submit"
                    disabled={i === projects.length - 1}
                    aria-label="Move down"
                    className="rounded-md border border-ink/15 px-2.5 py-2 text-sm disabled:opacity-30"
                  >
                    ↓
                  </button>
                </form>
                <Link
                  href={`/admin/projects/${project.id}`}
                  className="rounded-md border border-ink/15 px-3 py-2 text-sm font-medium"
                >
                  Edit
                </Link>
                <form action={deleteBrand.bind(null, project.id)}>
                  <ConfirmSubmitButton
                    confirmMessage={`Delete ${project.name}? This can't be undone.`}
                    className="rounded-md border border-burgundy/30 px-3 py-2 text-sm font-medium text-burgundy"
                  >
                    Delete
                  </ConfirmSubmitButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
