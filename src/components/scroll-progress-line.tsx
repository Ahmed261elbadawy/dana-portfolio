"use client";

import { useEffect, useRef } from "react";

/**
 * A vertical line fixed to the left edge that fills downward as the page
 * scrolls, giving a constant "you are here" read on how far through the
 * page you are. Rendered with mix-blend-difference so it stays visible
 * against every section color without per-section theme tracking.
 */
export function ScrollProgressLine() {
  const fillRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let raf = 0;

    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0;

      if (fillRef.current) {
        fillRef.current.style.height = `${pct * 100}%`;
      }
      if (dotRef.current) {
        dotRef.current.style.top = `${pct * 100}%`;
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    if (reduced) {
      // Skip the transition so the fill jumps straight to position instead
      // of animating, but the indicator itself still stays useful.
      fillRef.current?.style.setProperty("transition", "none");
      dotRef.current?.style.setProperty("transition", "none");
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-3 top-1/2 z-40 h-[32vh] w-px -translate-y-1/2 sm:left-5 sm:h-[42vh]"
    >
      <div className="absolute inset-0 bg-cream/25 mix-blend-difference" />
      <div
        ref={fillRef}
        className="absolute left-0 top-0 w-px bg-cream transition-[height] duration-150 ease-out mix-blend-difference"
        style={{ height: "0%" }}
      />
      <div
        ref={dotRef}
        className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream shadow-[0_0_6px_rgba(255,255,255,0.8)] transition-[top] duration-150 ease-out mix-blend-difference"
        style={{ top: "0%" }}
      />
    </div>
  );
}
