import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SERVICE_LABELS } from "@/lib/content";

export const revalidate = 60;

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("brands")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!project) notFound();

  const { data: caseStudy } = await supabase
    .from("case_studies")
    .select("*")
    .eq("brand_id", project.id)
    .eq("published", true)
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
    <article className="px-5 py-14 sm:px-8 sm:py-20 lg:px-16">
      <div className="mx-auto max-w-3xl space-y-12">
        <Link href="/#work" className="text-sm text-ink/50 underline">
          ← Back to work
        </Link>

        <header className="space-y-4">
          <div className="flex items-center gap-4">
            {project.logo_url && (
              <div className="flex h-14 w-14 items-center justify-center rounded-md border border-ink/10 bg-paper p-2">
                <Image
                  src={project.logo_url}
                  alt=""
                  width={40}
                  height={40}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}
            <div>
              <h1 className="font-display text-display-lg">{project.name}</h1>
              <p className="text-ink/50">{project.industry}</p>
            </div>
          </div>

          {project.services?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.services.map((s) => (
                <span
                  key={s}
                  className="rounded-pill bg-pink px-3 py-1 text-xs font-medium text-ink/70"
                >
                  {SERVICE_LABELS[s] ?? s}
                </span>
              ))}
            </div>
          )}

          {caseStudy?.one_line_brief && (
            <p className="text-xl text-ink/80">{caseStudy.one_line_brief}</p>
          )}
        </header>

        {!caseStudy ? (
          <p className="rounded-card bg-paper p-6 text-ink/60">
            The full case study for {project.name} is coming soon.
          </p>
        ) : (
          <>
            {caseStudy.hero_media_url && (
              <div className="relative aspect-[16/9] overflow-hidden rounded-card-lg bg-paper">
                <Image
                  src={caseStudy.hero_media_url}
                  alt={`${project.name} case study hero`}
                  fill
                  priority
                  sizes="(min-width: 768px) 768px, 100vw"
                  className="object-cover"
                />
              </div>
            )}

            {caseStudy.challenge && (
              <Section title="The challenge" body={caseStudy.challenge} />
            )}
            {caseStudy.approach && (
              <Section title="The approach" body={caseStudy.approach} />
            )}
            {caseStudy.art_direction && (
              <Section title="Creative direction" body={caseStudy.art_direction} />
            )}

            {media && media.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {media.map((m) => (
                  <div
                    key={m.id}
                    className="relative overflow-hidden rounded-card bg-paper"
                    style={{ aspectRatio: m.aspect_ratio.replace("/", " / ") }}
                  >
                    {m.kind === "embed" ? (
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-full w-full flex-col items-center justify-center gap-2 bg-ink text-cream transition-opacity hover:opacity-90"
                      >
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cream text-ink">
                          ▶
                        </span>
                        <span className="text-xs capitalize text-cream/70">
                          {m.provider ?? "Watch"}
                        </span>
                      </a>
                    ) : (
                      <Image
                        src={m.poster_url ?? m.url}
                        alt={m.alt_text || `${project.name} project image`}
                        fill
                        sizes="(min-width: 640px) 33vw, 50vw"
                        className="object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {caseStudy.deliverables?.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-display text-2xl">Deliverables</h2>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {caseStudy.deliverables.map((d) => (
                    <li
                      key={d}
                      className="rounded-md bg-cream px-4 py-3 text-ink/80"
                    >
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {metrics && metrics.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-display text-2xl">Outcome</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {metrics.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-card bg-burgundy p-4 text-cream"
                    >
                      <p className="font-display text-2xl">{m.value}</p>
                      <p className="text-xs text-cream/70">{m.label}</p>
                      {m.note && (
                        <p className="mt-1 text-xs text-cream/50">{m.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </article>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div className="space-y-2">
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="whitespace-pre-line text-ink/70">{body}</p>
    </div>
  );
}
