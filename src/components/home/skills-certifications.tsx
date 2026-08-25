import Image from "next/image";
import type { Certificate, Skill } from "@/lib/types/database";

function CertBadgeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 shrink-0 text-burgundy"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <circle cx="12" cy="8" r="5" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.5 7 21l5-2.5L17 21l-2-8.5"
      />
    </svg>
  );
}

export function SkillsCertifications({
  skills,
  certificates,
  educationBadge,
}: {
  skills: Skill[];
  certificates: Certificate[];
  educationBadge: string | null;
}) {
  return (
    <section
      data-nav-theme="light"
      className="bg-yellow px-5 py-14 sm:px-8 sm:py-20 lg:px-16"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left: skills grid + certificate name list, no frame */}
        <div className="space-y-8">
          {skills.length > 0 && (
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  title={skill.name}
                  className="flex aspect-square items-center justify-center rounded-xl bg-paper p-2.5 shadow-sm transition-transform hover:-translate-y-0.5 sm:p-3"
                >
                  <Image
                    src={skill.icon_url}
                    alt={skill.name}
                    width={36}
                    height={36}
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

          {certificates.length > 0 && (
            <ul className="space-y-4">
              {certificates.map((cert) => (
                <li
                  key={cert.id}
                  className="flex items-center gap-3.5 text-base text-ink/75"
                >
                  <CertBadgeIcon />
                  <span className="truncate">{cert.title}</span>
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
            <div className="mx-auto grid max-w-xs grid-cols-2 gap-3 sm:max-w-sm sm:gap-4">
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
