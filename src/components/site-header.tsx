"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Magnetic } from "@/components/magnetic";

const NAV_LINKS = [
  { href: "/#about", label: "About" },
  { href: "/#work", label: "Work" },
  { href: "/#contact", label: "Contact" },
];

const HEADER_HEIGHT = 64;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);

  // Tracks whichever [data-nav-theme] section currently sits right behind
  // the fixed header, so the nav can flip to a dark reading whenever it's
  // over a light-background section.
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-nav-theme]"),
    );
    if (!sections.length) return;

    let raf = 0;
    const checkLine = HEADER_HEIGHT / 2;

    function update() {
      raf = 0;
      let current: HTMLElement | null = null;
      for (const s of sections) {
        const rect = s.getBoundingClientRect();
        if (rect.top <= checkLine && rect.bottom > checkLine) {
          current = s;
          break;
        }
      }
      if (current) {
        setDark(current.getAttribute("data-nav-theme") === "dark");
      }
    }

    function onScroll() {
      if (!raf) raf = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const textColor = dark ? "text-cream" : "text-ink";
  const textShadow = dark ? "drop-shadow-[0_1px_4px_rgba(0,0,0,0.45)]" : "";
  const logoSrc = dark ? "/logo-mark-white.png" : "/logo-mark.png";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 px-5 py-4 sm:px-8 lg:px-16">
        {/* Desktop / tablet: logo left, glass pill nav centered, CTA right */}
        <div className="hidden sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <Link href="/" className={textShadow}>
            <Image src={logoSrc} alt="Dana Badawy" width={34} height={34} />
          </Link>

          <nav
            className={`col-start-2 flex items-center gap-1 rounded-pill border px-1.5 py-1.5 backdrop-blur-xl transition-colors ${
              dark
                ? "border-cream/25 bg-cream/10"
                : "border-ink/15 bg-paper/60"
            }`}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-pill px-4 py-2 text-sm font-medium transition-colors ${textColor} ${
                  dark ? "hover:bg-cream/15" : "hover:bg-ink/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="col-start-3 flex justify-end">
            <Magnetic>
              <Link
                href="/#contact"
                className="rounded-pill bg-cream px-5 py-2.5 text-sm font-semibold text-burgundy shadow-sm transition-transform hover:scale-[1.03]"
              >
                Let&apos;s talk ↗
              </Link>
            </Magnetic>
          </div>
        </div>

        {/* Mobile: bold wordmark + toggle */}
        <div className="flex items-center justify-between sm:hidden">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className={textShadow}
          >
            <Image src={logoSrc} alt="Dana Badawy" width={30} height={30} />
          </Link>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label="Toggle menu"
            className={`flex h-9 w-9 flex-col items-end justify-center gap-1.5 ${textShadow}`}
          >
            <span
              className={`h-[2px] rounded-full transition-all duration-300 ${
                open || dark ? "bg-cream" : "bg-ink"
              } ${open ? "w-6 -rotate-45 translate-y-[7px]" : "w-6"}`}
            />
            <span
              className={`h-[2px] rounded-full transition-all duration-300 ${
                open || dark ? "bg-cream" : "bg-ink"
              } ${open ? "w-6 rotate-45 -translate-y-[7px]" : "w-4"}`}
            />
          </button>
        </div>
      </header>

      {/* Mobile dropdown panel */}
      <div
        aria-hidden={!open}
        className={`fixed inset-x-0 top-0 z-30 overflow-y-auto rounded-b-card-lg bg-ink shadow-2xl transition-[opacity,transform] duration-300 ease-out sm:hidden ${
          open ? "" : "pointer-events-none"
        }`}
        style={{
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(-24px)",
        }}
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
            Let&apos;s talk
          </Link>
        </nav>
      </div>
    </>
  );
}
