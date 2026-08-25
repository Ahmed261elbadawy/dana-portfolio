import Image from "next/image";
import type { Certificate, Skill } from "@/lib/types/database";

export function SkillsCertifications({
  skills,
  certificates,
  educationBadge,
  credentialLines,
}: {
  skills: Skill[];
  certificates: Certificate[];
  educationBadge: string | null;
  credentialLines: string[];
}) {
  return (
    <section
      data-nav-theme="light"
      className="bg-pink px-5 py-14 sm:px-8 sm:py-20 lg:px-16"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left: skills grid, education highlight, credential list */}
        <div className="space-y-6">
          {skills.length > 0 && (
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  title={skill.name}
                  className="flex aspect-square items-center justify-center rounded-2xl bg-paper p-3 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md sm:p-4"
                >
                  <Image
                    src={skill.icon_url}
                    alt={skill.name}
                    width={40}
                    height={40}
                    unoptimized
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ))}
            </div>
          )}

          {educationBadge && (
            <div className="rounded-card bg-burgundy px-5 py-4 text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-cream">
                {educationBadge}
              </p>
            </div>
          )}

          {credentialLines.length > 0 && (
            <ul className="space-y-3">
              {credentialLines.map((line, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm text-ink/70"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4 shrink-0 text-burgundy"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <circle cx="12" cy="8" r="5" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.5 7 21l5-2.5L17 21l-2-8.5"
                    />
                  </svg>
                  {line}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right: heading + certificate grid */}
        <div className="space-y-6">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-burgundy">
              How I work
            </p>
            <h2 className="font-display text-display-md text-burgundy">
              Skills &amp; <span className="italic">certifications</span>
            </h2>
          </div>

          {certificates.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="aspect-[4/3] w-full overflow-hidden border border-ink/10 bg-paper shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cert.image_url}
                    alt={cert.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
