"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/#work", label: "Work" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 px-5 py-4 sm:px-8 lg:px-16">
        {/* Desktop / tablet: logo left, glass pill nav centered, CTA right */}
        <div className="hidden sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <Link href="/" className="drop-shadow-[0_1px_4px_rgba(0,0,0,0.45)]">
            <Image
              src="/logo-mark-white.png"
              alt="Dana Badawy"
              width={34}
              height={34}
            />
          </Link>

          <nav className="col-start-2 flex items-center gap-1 rounded-pill border border-cream/25 bg-cream/10 px-1.5 py-1.5 backdrop-blur-xl">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-pill px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-cream/15"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="col-start-3 flex justify-end">
            <Link
              href="/#contact"
              className="rounded-pill bg-cream px-5 py-2.5 text-sm font-semibold text-burgundy transition-transform hover:scale-[1.03]"
            >
              Let&apos;s talk ↗
            </Link>
          </div>
        </div>

        {/* Mobile: bold wordmark + toggle */}
        <div className="flex items-center justify-between sm:hidden">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="drop-shadow-[0_1px_4px_rgba(0,0,0,0.45)]"
          >
            <Image
              src="/logo-mark-white.png"
              alt="Dana Badawy"
              width={30}
              height={30}
            />
          </Link>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label="Toggle menu"
            className="flex h-9 w-9 flex-col items-end justify-center gap-1.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.45)]"
          >
            <span
              className={`h-[2px] rounded-full bg-cream transition-all duration-300 ${
                open ? "w-6 -rotate-45 translate-y-[7px]" : "w-6"
              }`}
            />
            <span
              className={`h-[2px] rounded-full bg-cream transition-all duration-300 ${
                open ? "w-6 rotate-45 -translate-y-[7px]" : "w-4"
              }`}
            />
          </button>
        </div>
      </header>

      {/* Mobile dropdown panel */}
      <div
        aria-hidden={!open}
        className={`fixed inset-x-0 top-0 z-30 overflow-hidden bg-burgundy transition-[max-height] duration-300 ease-out sm:hidden ${
          open ? "max-h-72" : "pointer-events-none max-h-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-5 pb-6 pt-24">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              tabIndex={open ? undefined : -1}
              onClick={() => setOpen(false)}
              className="border-b border-cream/10 py-3 text-lg font-medium text-cream transition-opacity hover:opacity-70"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#contact"
            tabIndex={open ? undefined : -1}
            onClick={() => setOpen(false)}
            className="mt-4 inline-block w-fit rounded-pill bg-cream px-6 py-3 text-sm font-semibold text-burgundy"
          >
            Let&apos;s talk ↗
          </Link>
        </nav>
      </div>
    </>
  );
}
