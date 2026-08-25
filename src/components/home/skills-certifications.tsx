import Image from "next/image";
import type { Certificate, Skill } from "@/lib/types/database";

const ROTATIONS = [
  "sm:-rotate-3",
  "sm:rotate-2",
  "sm:-rotate-2",
  "sm:rotate-3",
];

export function SkillsCertifications({
  skills,
  certificates,
}: {
  skills: Skill[];
  certificates: Certificate[];
}) {
  return (
    <section
      data-nav-theme="light"
      className="bg-pink px-5 py-14 sm:px-8 sm:py-20 lg:px-16"
    >
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="space-y-1 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-burgundy">
            How I work
          </p>
          <h2 className="font-display text-display-md text-burgundy">
            Skills &amp; <span className="italic">certifications</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          {/* Skills grid */}
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

          {/* Certificates */}
          {certificates.length > 0 && (
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-0">
              {certificates.map((cert, i) => (
                <div
                  key={cert.id}
                  className={`w-56 shrink-0 rounded-card-lg border border-ink/5 bg-paper p-3 shadow-md transition-transform hover:z-10 hover:-translate-y-1 hover:rotate-0 hover:shadow-lg sm:-ml-8 sm:first:ml-0 ${
                    ROTATIONS[i % ROTATIONS.length]
                  }`}
                >
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-md bg-cream">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cert.image_url}
                      alt={cert.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="mt-3 space-y-0.5 px-1 pb-1">
                    <p className="line-clamp-2 text-sm font-semibold text-ink">
                      {cert.title}
                    </p>
                    {cert.issuer && (
                      <p className="truncate text-xs text-ink/50">
                        {cert.issuer}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
