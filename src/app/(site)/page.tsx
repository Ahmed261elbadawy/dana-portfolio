import { createClient } from "@/lib/supabase/server";
import { WorkGrid } from "@/components/home/work-grid";
import { MarqueeBand } from "@/components/home/marquee-band";
import { Polaroid } from "@/components/home/polaroid";
import { InquiryForm } from "@/components/home/inquiry-form";
import { AnimatedStats } from "@/components/home/animated-stats";
import { Reveal } from "@/components/reveal";
import { BoldText } from "@/components/bold-text";
import {
  FALLBACK_EMAIL,
  FALLBACK_INTRO,
  FALLBACK_ROLE_PARTS,
  FALLBACK_SERVICES,
  FALLBACK_STATS,
  FALLBACK_WHATSAPP,
} from "@/lib/content";

export const revalidate = 60;

const SERVICE_BLOCKS = [
  { bg: "bg-pink", text: "text-ink" },
  { bg: "bg-yellow", text: "text-ink" },
  { bg: "bg-burgundy", text: "text-cream" },
  { bg: "bg-pink", text: "text-ink" },
  { bg: "bg-yellow", text: "text-ink" },
];

export default async function Home() {
  const supabase = await createClient();

  const [{ data: projects }, { data: testimonials }, { data: settingsRows }] =
    await Promise.all([
      supabase
        .from("brands")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("testimonials")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true }),
      supabase.from("site_settings").select("*").limit(1),
    ]);

  const settings = settingsRows?.[0];
  const intro = settings?.intro_paragraph?.trim() || FALLBACK_INTRO;
  const email = settings?.email?.trim() || FALLBACK_EMAIL;
  const whatsapp = settings?.whatsapp?.trim() || FALLBACK_WHATSAPP;
  const whatsappHref = `https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`;
  const cvUrl = settings?.cv_url;
  const photoUrl = settings?.photo_url;

  return (
    <>
      {/* Hero: Dana Badawy */}
      <section
        id="about"
        className="scroll-mt-20 bg-burgundy px-5 pb-16 pt-28 text-cream sm:px-8 sm:pb-24 sm:pt-32 lg:px-16"
      >
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="space-y-7">
            <span className="flex flex-wrap items-center gap-x-1.5 text-xs font-semibold uppercase tracking-wide text-cream/60 sm:inline-flex sm:rounded-pill sm:bg-cream sm:px-4 sm:py-2 sm:text-burgundy sm:shadow-sm">
              {FALLBACK_ROLE_PARTS.map((part, i) => (
                <span key={part} className="whitespace-nowrap">
                  {i > 0 && <span className="mr-1.5">·</span>}
                  {part}
                </span>
              ))}
            </span>

            <h1 className="whitespace-nowrap font-display text-4xl italic leading-[0.9] sm:text-6xl lg:text-7xl xl:text-8xl">
              Dana Badawy
            </h1>

            <div className="max-w-2xl space-y-3 text-lg text-cream/80 sm:text-xl">
              {intro
                .split("\n\n")
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i}>
                    <BoldText text={para} />
                  </p>
                ))}
            </div>

            <AnimatedStats stats={FALLBACK_STATS} />
          </div>

          <div className="mx-auto w-full max-w-[280px] lg:max-w-none">
            <Polaroid
              photoUrl={photoUrl}
              name="Dana Badawy"
              caption="Let's talk ↓"
              captionHref="#contact"
            />
          </div>
        </div>
      </section>

      <MarqueeBand />

      {/* Services: what I actually do */}
      <section
        id="services"
        className="scroll-mt-20 px-5 py-14 sm:px-8 sm:py-20 lg:px-16"
      >
        <div className="mx-auto max-w-6xl space-y-10">
          <Reveal className="max-w-2xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-burgundy">
              What I actually do
            </p>
            <h2 className="font-display text-display-md">
              Five ways I plug into a brand
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FALLBACK_SERVICES.map((s, i) => {
              const block = SERVICE_BLOCKS[i % SERVICE_BLOCKS.length];
              return (
                <div
                  key={s.title}
                  className={`flex flex-col gap-4 rounded-card-lg p-6 ${block.bg} ${block.text} ${
                    i === 0 ? "sm:col-span-2 lg:col-span-1" : ""
                  }`}
                >
                  <span
                    className={`font-display text-3xl ${
                      block.text === "text-cream" ? "text-cream/40" : "text-ink/25"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-xl">{s.title}</h3>
                  <p className={block.text === "text-cream" ? "text-cream/75" : "text-ink/70"}>
                    {s.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured work */}
      <section
        id="work"
        className="scroll-mt-20 rounded-t-card-lg bg-burgundy px-5 py-14 text-cream sm:px-8 sm:py-20 lg:px-16"
      >
        <div className="mx-auto max-w-6xl space-y-8">
          <Reveal className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-display-md">Featured work</h2>
              <p className="mt-1 max-w-lg text-cream/70">
                Real brand work, one card per client, filter by what she did
                for them.
              </p>
            </div>
          </Reveal>

          {!projects?.length ? (
            <p className="rounded-card bg-paper p-6 text-ink/60">
              New work is on its way, check back soon.
            </p>
          ) : (
            <WorkGrid projects={projects} />
          )}
        </div>
      </section>

      {/* Feedback */}
      {testimonials && testimonials.length > 0 && (
        <section className="bg-burgundy px-5 py-14 text-cream sm:px-8 sm:py-20 lg:px-16">
          <div className="mx-auto max-w-6xl space-y-8">
            <Reveal>
              <h2 className="font-display text-display-md">Feedback</h2>
            </Reveal>
            <div className="no-scrollbar -mx-5 flex snap-x gap-4 overflow-x-auto px-5 sm:mx-0 sm:px-0">
              {testimonials.map((t) => (
                <figure
                  key={t.id}
                  className="w-[85%] shrink-0 snap-start rounded-card-lg bg-burgundy-light p-7 sm:w-[420px]"
                >
                  <span className="font-display text-4xl text-cream/30">
                    &ldquo;
                  </span>
                  <blockquote className="-mt-3 text-lg leading-relaxed">
                    {t.quote}
                  </blockquote>
                  <figcaption className="mt-4 text-sm text-cream/70">
                    {t.author}
                    {t.role ? `, ${t.role}` : ""}
                    {t.brand ? ` · ${t.brand}` : ""}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact: inquiry form + direct links */}
      <section
        id="contact"
        className="scroll-mt-20 bg-pink px-5 py-16 sm:px-8 sm:py-24 lg:px-16"
      >
        <div className="mx-auto max-w-3xl space-y-8">
          <Reveal className="space-y-3 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-burgundy">
              Let&apos;s work together
            </p>
            <h2 className="font-display text-display-lg leading-[0.95]">
              Let&apos;s make something.
            </h2>
            <p className="mx-auto max-w-md text-ink/70">
              Tell me what you need, or reach out directly, whatever&apos;s
              easiest.
            </p>
          </Reveal>

          <Reveal>
            <InquiryForm email={email} whatsappHref={whatsappHref} />
          </Reveal>

          {cvUrl && (
            <p className="text-center">
              <a
                href={cvUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-ink/60 underline underline-offset-4 hover:text-ink"
              >
                Download CV
              </a>
            </p>
          )}
        </div>
      </section>
    </>
  );
}
