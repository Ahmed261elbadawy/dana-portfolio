import Image from "next/image";
import type { BrandLogo } from "@/lib/types/database";

function groupByCategory(logos: BrandLogo[]) {
  const groups = new Map<string, BrandLogo[]>();
  for (const logo of logos) {
    const key = logo.category?.trim() || "";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(logo);
  }
  return [...groups.entries()];
}

function LogoGrid({ logos }: { logos: BrandLogo[] }) {
  return (
    <div className="grid grid-cols-3 gap-x-6 gap-y-8 sm:grid-cols-4 lg:grid-cols-5">
      {logos.map((logo) => (
        <div
          key={logo.id}
          className="flex h-10 items-center justify-center sm:h-12"
        >
          <Image
            src={logo.logo_url}
            alt={logo.name}
            width={120}
            height={48}
            unoptimized
            className="max-h-full max-w-full object-contain opacity-60 grayscale transition-opacity hover:opacity-100"
          />
        </div>
      ))}
    </div>
  );
}

export function TrustedStrip({ logos }: { logos: BrandLogo[] }) {
  const groups = groupByCategory(logos);

  return (
    <div
      data-nav-theme="light"
      className="bg-yellow px-5 py-10 sm:px-8 sm:py-14 lg:px-16"
    >
      <div className="mx-auto max-w-6xl space-y-10">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink/40">
          Brands I&apos;ve worked with
        </p>

        {groups.map(([category, groupLogos]) => (
          <div key={category || "uncategorized"} className="space-y-4">
            {category && (
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">
                {category}
              </p>
            )}
            <LogoGrid logos={groupLogos} />
          </div>
        ))}
      </div>
    </div>
  );
}
