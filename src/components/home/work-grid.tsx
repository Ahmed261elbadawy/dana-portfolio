"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Brand } from "@/lib/types/database";
import { SERVICE_LABELS } from "@/lib/content";
import { TiltCard } from "@/components/tilt-card";

const TILTS = ["-2deg", "1.5deg", "-1deg", "2deg", "-1.5deg"];
const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i;

function isVideoUrl(url: string) {
  return VIDEO_EXT.test(url);
}

export function WorkGrid({ projects }: { projects: Brand[] }) {
  const [filter, setFilter] = useState<string | null>(null);

  const allServices = Array.from(
    new Set(projects.flatMap((p) => p.services ?? [])),
  );

  const visible = filter
    ? projects.filter((p) => p.services?.includes(filter as never))
    : projects;

  return (
    <div className="space-y-6">
      {allServices.length > 1 && (
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
          <button
            onClick={() => setFilter(null)}
            className={`shrink-0 rounded-pill px-4 py-2.5 text-sm font-medium transition-colors ${
              filter === null
                ? "bg-ink text-cream"
                : "bg-paper text-ink/70 hover:bg-ink/5"
            }`}
          >
            All work
          </button>
          {allServices.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`shrink-0 rounded-pill px-4 py-2.5 text-sm font-medium transition-colors ${
                filter === s
                  ? "bg-ink text-cream"
                  : "bg-paper text-ink/70 hover:bg-ink/5"
              }`}
            >
              {SERVICE_LABELS[s] ?? s}
            </button>
          ))}
        </div>
      )}

      <div className="no-scrollbar -mx-5 flex snap-x gap-4 overflow-x-auto px-6 pb-4 pt-4 sm:mx-0 sm:gap-7 sm:px-2">
        {visible.map((project, i) => {
          const tilt = TILTS[i % TILTS.length];

          return (
            <Link
              key={project.id}
              href={`/work/${project.slug}`}
              className="group w-[50%] min-w-[168px] shrink-0 snap-start sm:w-72"
            >
              <TiltCard>
              <div
                className="rounded-sm bg-paper p-2.5 pb-4 shadow-[0_18px_40px_-14px_rgba(20,20,20,0.28)] transition-transform duration-300 ease-out group-hover:!rotate-0 group-hover:-translate-y-1.5 group-hover:shadow-[0_26px_50px_-14px_rgba(20,20,20,0.34)] sm:p-3.5 sm:pb-5"
                style={{ transform: `rotate(${tilt})` }}
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-pink">
                  {project.cover_image_url ? (
                    isVideoUrl(project.cover_image_url) ? (
                      <video
                        src={project.cover_image_url}
                        className="absolute inset-0 h-full w-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <Image
                        src={project.cover_image_url}
                        alt={`${project.name}, ${project.industry || "project"} cover`}
                        fill
                        sizes="(min-width: 640px) 288px, 52vw"
                        className="object-cover"
                      />
                    )
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="font-display text-6xl text-ink/15">
                        {project.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  {project.logo_url && (
                    <div className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-paper p-1.5 shadow-md sm:bottom-3 sm:left-3 sm:h-10 sm:w-10 sm:p-2">
                      <Image
                        src={project.logo_url}
                        alt=""
                        width={26}
                        height={26}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-2.5 text-center sm:pt-3.5">
                  <p className="font-display text-base italic text-ink sm:text-xl">
                    {project.name}
                  </p>
                  <p className="mt-0.5 text-xs text-ink/55">
                    {project.industry}
                  </p>

                  {project.services?.length > 0 && (
                    <div className="mt-2 flex flex-wrap justify-center gap-1">
                      {project.services.map((s) => (
                        <span
                          key={s}
                          className="rounded-pill bg-cream px-1.5 py-0.5 text-[9px] font-medium text-ink/60 sm:px-2.5 sm:py-1 sm:text-xs"
                        >
                          {SERVICE_LABELS[s] ?? s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              </TiltCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
