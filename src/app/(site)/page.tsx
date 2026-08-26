import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { WorkGrid } from "@/components/home/work-grid";
import { MarqueeBand } from "@/components/home/marquee-band";
import { TrustedStrip } from "@/components/home/trusted-strip";
import { SkillsCertifications } from "@/components/home/skills-certifications";
import { Polaroid } from "@/components/home/polaroid";
import { AnimatedStats } from "@/components/home/animated-stats";
import { ContactBubbles } from "@/components/home/contact-bubbles";
import { Reveal } from "@/components/reveal";
import { BoldText } from "@/components/bold-text";
import { Magnetic } from "@/components/magnetic";
import { TiltCard } from "@/components/tilt-card";
import { Parallax } from "@/components/parallax";
import {
  FALLBACK_EMAIL,
  FALLBACK_INTRO,
  FALLBACK_ROLE_PARTS,
  FALLBACK_SERVICES,
  FALLBACK_STATS,
  FALLBACK_WHATSAPP,
} from "@/lib/content";

export const revalidate = 60;

// Set to true to bring the Skills & Certifications section back.
const SHOW_SKILLS_SECTION = false;

const SERVICE_BLOCKS = [
  { bg: "bg-pink", text: "text-ink" },
  { bg: "bg-yellow", text: "text-ink" },
  { bg: "bg-burgundy", text: "text-cream" },
  { bg: "bg-pink", text: "text-ink" },
  { bg: "bg-yellow", text: "text-ink" },
];

export default async function Home() {
  const supabase = await createClient();

  const [
    { data: projects },
    { data: testimonials },
    { data: settingsRows },
    { data: brandLogos },
    { data: skills },
    { data: certificates },
  ] = await Promise.all([
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
    supabase
      .from("brand_logos")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("skills")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("certificates")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true }),
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
        data-nav-theme="dark"
        className="scroll-mt-20 bg-burgundy px-5 pb-16 pt-28 text-cream sm:px-8 sm:pb-24 sm:pt-32 lg:px-16"
      >
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-7 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-x-16 lg:gap-y-7">
          <h1
            className="animate-rise-in order-1 whitespace-nowrap text-center font-display text-5xl italic leading-[0.9] sm:text-6xl lg:order-2 lg:col-start-1 lg:text-left lg:text-7xl xl:text-8xl"
            style={{ animationDelay: "0ms" }}
          >
            Dana Badawy
          </h1>

          <span
            className="animate-rise-in order-2 flex flex-wrap items-center justify-center gap-x-1.5 text-xs font-semibold uppercase tracking-wide text-cream/60 sm:inline-flex sm:justify-start sm:rounded-pill sm:bg-cream sm:px-4 sm:py-2 sm:text-burgundy sm:shadow-sm lg:order-1 lg:col-start-1"
            style={{ animationDelay: "90ms" }}
          >
            {FALLBACK_ROLE_PARTS.map((part, i) => (
              <span key={part} className="whitespace-nowrap">
                {i > 0 && <span className="mr-1.5">·</span>}
                {part}
              </span>
            ))}
          </span>

          <div
            className="animate-rise-in order-4 max-w-2xl space-y-3 text-base text-cream/80 sm:text-xl lg:order-3 lg:col-start-1"
            style={{ animationDelay: "180ms" }}
          >
            {intro
              .split("\n\n")
              .filter(Boolean)
              .map((para, i) => (
                <p key={i}>
                  <BoldText text={para} />
                </p>
              ))}
          </div>

          <div
            className="animate-rise-in order-3 lg:order-4 lg:col-start-1"
            style={{ animationDelay: "220ms" }}
          >
            <AnimatedStats stats={FALLBACK_STATS} />
          </div>

          <Parallax
            strength={0.06}
            className="order-5 mx-auto w-full max-w-[280px] lg:order-1 lg:col-start-2 lg:row-start-1 lg:row-span-4 lg:max-w-none lg:self-center"
          >
            <TiltCard
              className="animate-rise-in"
              style={{ animationDelay: "280ms" }}
            >
              <Polaroid
                photoUrl={photoUrl}
                name="Dana Badawy"
                caption="Explore my work ↓"
                captionHref="/work"
              />
            </TiltCard>
          </Parallax>
        </div>
      </section>

      <MarqueeBand />
      {brandLogos && brandLogos.length > 0 && (
        <TrustedStrip logos={brandLogos} />
      )}

      {/* Services: what I actually do */}
      <section
        id="services"
        data-nav-theme="light"
        className="relative z-10 -mt-7 scroll-mt-20 rounded-t-card-lg bg-cream px-5 py-14 sm:px-8 sm:py-20 lg:px-16"
      >
        <div className="mx-auto max-w-6xl space-y-10">
          <Reveal className="max-w-2xl space-y-3">
            <p className="text-lg font-semibold uppercase tracking-wide text-burgundy">
              What I actually do
            </p>
            <h2 className="font-display text-2xl text-burgundy sm:text-3xl">
              Five ways I plug into a brand
            </h2>
          </Reveal>

          <div className="flex flex-wrap justify-center gap-4">
            {FALLBACK_SERVICES.map((s, i) => {
              const block = SERVICE_BLOCKS[i % SERVICE_BLOCKS.length];
              return (
                <Reveal
                  key={s.title}
                  delayMs={i * 80}
                  className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]"
                >
                  <TiltCard
                    className={`flex h-full flex-col gap-4 rounded-card-lg p-6 ${block.bg} ${block.text}`}
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
                  </TiltCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured work */}
      <section
        id="work"
        data-nav-theme="dark"
        className="relative z-10 -mt-7 scroll-mt-20 rounded-t-card-lg bg-burgundy pb-14 pt-12 text-cream sm:pb-20 sm:pt-12"
      >
        <div className="mx-auto max-w-6xl space-y-10 px-5 sm:px-8 lg:px-16">
          <Reveal className="flex items-center justify-between gap-4 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:justify-normal">
            <span aria-hidden="true" className="hidden sm:block" />
            <h2 className="font-display text-display-md sm:text-center">
              Featured work
            </h2>
            <Link
              href="/work"
              className="justify-self-end whitespace-nowrap rounded-pill border border-cream/25 px-4 py-2 text-sm font-medium text-cream/80 transition-colors hover:bg-cream/10"
            >
              See all
            </Link>
          </Reveal>

          {!projects?.length && (
            <p className="rounded-card bg-paper p-6 text-ink/60">
              New work is on its way, check back soon.
            </p>
          )}
        </div>

        {projects?.length ? <WorkGrid projects={projects} /> : null}
      </section>

      {/* Hidden for now at Dana's request - set SHOW_SKILLS_SECTION back
          to true once ready to show it again. */}
      {SHOW_SKILLS_SECTION &&
        ((skills && skills.length > 0) ||
          (certificates && certificates.length > 0)) && (
          <SkillsCertifications
            skills={skills ?? []}
            certificates={certificates ?? []}
            educationBadge={settings?.education_badge ?? null}
          />
        )}

      {/* Feedback */}
      {testimonials && testimonials.length > 0 && (
        <section
          data-nav-theme="light"
          className="relative z-10 -mt-7 rounded-t-card-lg bg-cream px-5 py-14 sm:px-8 sm:py-20 lg:px-16"
        >
          <div className="mx-auto max-w-6xl space-y-8">
            <Reveal className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-burgundy">
                Testimonials
              </p>
              <h2 className="font-display text-display-md text-burgundy">
                of clients
              </h2>
            </Reveal>
            <div className="no-scrollbar -mx-5 flex snap-x justify-center gap-6 overflow-x-auto px-5 pt-7 sm:mx-0 sm:px-0">
              {testimonials.map((t, i) => {
                const dark = i % 2 === 0;
                return (
                  <figure
                    key={t.id}
                    className={`relative flex w-[62%] shrink-0 snap-start flex-col items-center rounded-card-lg px-6 pb-12 pt-9 text-center sm:w-[280px] ${
                      dark ? "bg-burgundy text-cream" : "bg-pink text-ink"
                    }`}
                  >
                    {t.avatar_url && (
                      <div className="absolute -top-5 left-1/2 flex h-11 w-11 -translate-x-1/2 items-center justify-center overflow-hidden rounded-full bg-paper p-1.5 shadow-md">
                        <Image
                          src={t.avatar_url}
                          alt=""
                          width={28}
                          height={28}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    )}
                    <span
                      className={`font-display text-4xl leading-none ${
                        dark ? "text-cream/30" : "text-ink/20"
                      }`}
                    >
                      &ldquo;
                    </span>
                    <blockquote className="mt-2 line-clamp-6 text-base leading-relaxed">
                      {t.quote}
                    </blockquote>
                    <figcaption
                      className={`mt-auto pt-5 text-sm ${
                        dark ? "text-cream/70" : "text-ink/60"
                      }`}
                    >
                      <span className="block font-semibold">{t.author}</span>
                      {t.role && <span className="block">{t.role}</span>}
                      {t.brand && <span className="block">{t.brand}</span>}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Contact: direct links */}
      <section
        id="contact"
        data-nav-theme="light"
        className="relative z-10 -mt-7 scroll-mt-20 overflow-hidden rounded-t-card-lg bg-pink px-5 py-20 sm:px-8 sm:py-28 lg:px-16"
      >
        <ContactBubbles />
        <div
          data-bubble-safe
          className="relative z-10 mx-auto w-full max-w-3xl"
        >
        <Reveal className="space-y-7 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-burgundy">
            Get in touch
          </p>
          <h2 className="font-display text-display-lg leading-[0.95]">
            Let&apos;s work together.
          </h2>
          <p className="mx-auto max-w-md text-ink/70">
            Reach out for brand strategy, content creation, or a full
            campaign, whatever the brief is.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Magnetic>
              <a
                href={`mailto:${email}`}
                className="inline-block rounded-pill bg-burgundy px-8 py-4 text-sm font-semibold text-cream transition-transform hover:scale-[1.03]"
              >
                Email
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-block rounded-md border border-ink/20 px-8 py-4 text-sm font-semibold transition-colors hover:bg-ink hover:text-cream"
              >
                WhatsApp
              </a>
            </Magnetic>
            {cvUrl && (
              <a
                href={cvUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-ink/60 underline underline-offset-4 hover:text-ink"
              >
                Download CV
              </a>
            )}
          </div>
        </Reveal>
        </div>
      </section>
    </>
  );
}
