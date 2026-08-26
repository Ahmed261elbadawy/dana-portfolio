import Image from "next/image";
import type { BrandLogo } from "@/lib/types/database";

export function TrustedStrip({ logos }: { logos: BrandLogo[] }) {
  return (
    <div
      data-nav-theme="light"
      className="bg-paper px-5 py-10 sm:px-8 sm:py-14 lg:px-16"
    >
      <div className="mx-auto max-w-6xl space-y-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-burgundy/55">
          Brands I&apos;ve worked with
        </p>

        <div className="grid grid-cols-3 gap-x-6 gap-y-8 sm:grid-cols-4 sm:gap-x-8 lg:grid-cols-5">
          {logos.map((logo) => (
            <div
              key={logo.id}
              className="flex h-12 items-center justify-center sm:h-14"
            >
              <Image
                src={logo.logo_url}
                alt={logo.name}
                width={160}
                height={56}
                unoptimized
                className="h-full w-full object-contain opacity-70 grayscale transition-opacity hover:opacity-100"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
