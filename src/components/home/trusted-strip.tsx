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

        <div className="flex flex-wrap items-center justify-center">
          {logos.map((logo, i) => (
            <span key={logo.id} className="relative px-4 sm:px-5">
              <Image
                src={logo.logo_url}
                alt={logo.name}
                width={100}
                height={32}
                unoptimized
                className="h-6 w-auto max-w-[100px] object-contain opacity-70 grayscale transition-opacity hover:opacity-100 sm:h-7"
              />
              {i < logos.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-burgundy/35"
                >
                  ·
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
