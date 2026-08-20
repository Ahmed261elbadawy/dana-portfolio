import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CaseStudyForm } from "./case-study-form";
import { AddMediaForm } from "./add-media-form";
import { addMetric, deleteMedia, deleteMetric, moveMedia } from "./actions";

export default async function CaseStudyEditorPage({
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

  const { data: caseStudy } = await supabase
    .from("case_studies")
    .select("*")
    .eq("brand_id", id)
    .maybeSingle();

  const [{ data: media }, { data: metrics }] = await Promise.all([
    caseStudy
      ? supabase
          .from("media")
          .select("*")
          .eq("case_study_id", caseStudy.id)
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: null }),
    caseStudy
      ? supabase
          .from("metrics")
          .select("*")
          .eq("case_study_id", caseStudy.id)
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: null }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <Link href="/admin/projects" className="text-sm text-ink/50 underline">
          ← Back to projects
        </Link>
        <h1 className="mt-2 font-display text-display-md">Case study</h1>
        <p className="mt-1 text-ink/60">{project.name}</p>
      </div>

      <CaseStudyForm brandId={project.id} caseStudy={caseStudy ?? undefined} />

      {!caseStudy ? (
        <p className="max-w-xl rounded-card bg-paper p-6 text-ink/60">
          Save the case study above first, then you can add gallery media
          and outcome metrics.
        </p>
      ) : (
        <>
          <section className="max-w-2xl space-y-4">
            <h2 className="font-display text-2xl">Gallery media</h2>

            {media && media.length > 0 && (
              <ul className="space-y-2">
                {media.map((m, i) => (
                  <li
                    key={m.id}
                    className="flex items-center gap-3 rounded-card bg-paper p-3"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-cream">
                      {m.kind === "embed" ? (
                        <span className="text-xs text-ink/40">
                          {m.provider ?? "link"}
                        </span>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.poster_url ?? m.url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {m.kind}
                        {m.provider ? ` · ${m.provider}` : ""}
                      </p>
                      <p className="truncate text-xs text-ink/50">{m.url}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <form action={moveMedia.bind(null, m.id, caseStudy.id, "up")}>
                        <button
                          type="submit"
                          disabled={i === 0}
                          className="rounded-md border border-ink/15 px-2 py-1.5 text-sm disabled:opacity-30"
                        >
                          ↑
                        </button>
                      </form>
                      <form
                        action={moveMedia.bind(null, m.id, caseStudy.id, "down")}
                      >
                        <button
                          type="submit"
                          disabled={i === media.length - 1}
                          className="rounded-md border border-ink/15 px-2 py-1.5 text-sm disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </form>
                      <form action={deleteMedia.bind(null, m.id)}>
                        <button
                          type="submit"
                          className="rounded-md border border-burgundy/30 px-2 py-1.5 text-sm text-burgundy"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <AddMediaForm caseStudyId={caseStudy.id} />
          </section>

          <section className="max-w-2xl space-y-4">
            <h2 className="font-display text-2xl">Outcome metrics</h2>
            <p className="text-sm text-ink/50">
              The concrete numbers, reach, engagement, follower growth. At
              least one is strongly recommended.
            </p>

            {metrics && metrics.length > 0 && (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {metrics.map((m) => (
                  <li key={m.id} className="space-y-1 rounded-card bg-paper p-4">
                    <p className="font-display text-2xl">{m.value}</p>
                    <p className="text-xs text-ink/50">{m.label}</p>
                    <form action={deleteMetric.bind(null, m.id)}>
                      <button
                        type="submit"
                        className="mt-1 text-xs text-burgundy underline"
                      >
                        Remove
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}

            <form action={addMetric} className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="case_study_id" value={caseStudy.id} />
              <div className="space-y-1">
                <label className="text-xs text-ink/60">Label</label>
                <input
                  name="label"
                  type="text"
                  placeholder="Reach"
                  required
                  className="rounded-md border border-ink/15 px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-ink/60">Value</label>
                <input
                  name="value"
                  type="text"
                  placeholder="1.2M"
                  required
                  className="rounded-md border border-ink/15 px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-ink/60">Note (optional)</label>
                <input
                  name="note"
                  type="text"
                  placeholder="in 30 days"
                  className="rounded-md border border-ink/15 px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-cream"
              >
                Add metric
              </button>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
