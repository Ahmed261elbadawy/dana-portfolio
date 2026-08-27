"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// The wave is injected as the first child *inside* each themed section
// (not as one overlay sibling above everything), so it paints above that
// section's own background but behind the section's real content — which
// is the only way to get "behind text/photos" without a section's opaque
// background just hiding it again.
const VB_WIDTH = 100;
const WAVELENGTH_PX = 520; // one full left-right swing, in real pixels
const AMPLITUDE = 26; // swing distance from center, in viewBox units
const MID_X = VB_WIDTH / 2;
const CREAM = "#F7F1E6";
const BURGUNDY = "#4A1226";

function buildWavePath(height: number) {
  const cycles = Math.max(1, Math.ceil(height / WAVELENGTH_PX));
  const cycleH = height / cycles;
  let d = `M ${MID_X} 0`;
  for (let i = 0; i < cycles; i++) {
    const y0 = i * cycleH;
    const dir = i % 2 === 0 ? 1 : -1;
    const cx = MID_X + dir * AMPLITUDE;
    d += ` C ${cx} ${y0 + cycleH * 0.28} ${cx} ${y0 + cycleH * 0.72} ${MID_X} ${y0 + cycleH}`;
  }
  return d;
}

type Segment = {
  el: HTMLElement;
  container: HTMLDivElement;
  top: number;
  height: number;
  color: string;
};

export function ScrollWave() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [master, setMaster] = useState<{ height: number; path: string } | null>(
    null,
  );
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const lengthRef = useRef(0);

  useEffect(() => {
    // Only sections that already establish a positioning context (all the
    // main page sections do — "relative z-10") are safe to insert an
    // absolutely-positioned child into; small utility bands without their
    // own position (marquee, trusted-logos strip) are skipped rather than
    // risk breaking their layout.
    const all = Array.from(
      document.querySelectorAll<HTMLElement>("[data-nav-theme]"),
    );
    const els = all.filter(
      (el) => getComputedStyle(el).position !== "static",
    );
    if (els.length === 0) return;

    const originTop = els[0].getBoundingClientRect().top + window.scrollY;

    const segs: Segment[] = els.map((el) => {
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY - originTop;
      const container = document.createElement("div");
      container.setAttribute("aria-hidden", "true");
      container.style.position = "absolute";
      container.style.inset = "0";
      container.style.pointerEvents = "none";
      container.style.overflow = "hidden";
      el.insertBefore(container, el.firstChild);
      return {
        el,
        container,
        top,
        height: rect.height,
        color: el.getAttribute("data-nav-theme") === "dark" ? CREAM : BURGUNDY,
      };
    });

    const totalHeight = segs[segs.length - 1].top + segs[segs.length - 1].height;
    setMaster({ height: totalHeight, path: buildWavePath(totalHeight) });
    setSegments(segs);

    return () => {
      segs.forEach((s) => s.container.remove());
    };
  }, []);

  useEffect(() => {
    if (!master || segments.length === 0) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // All segment paths share the same "d", so a single offscreen probe
    // gives the true total length to use for every copy's dash values.
    const probe = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path",
    );
    probe.setAttribute("d", master.path);
    lengthRef.current = probe.getTotalLength();

    let raf = 0;

    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0;
      const length = lengthRef.current;
      const dashoffset = length * (1 - pct);

      for (const p of pathRefs.current) {
        if (!p) continue;
        p.style.strokeDasharray = `${length}`;
        p.style.strokeDashoffset = `${dashoffset}`;
        if (reduced) p.style.transition = "none";
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [master, segments]);

  if (!master) return null;

  return (
    <>
      {segments.map((s, i) =>
        createPortal(
          <svg
            key={i}
            className="absolute inset-0 h-full w-full"
            viewBox={`0 ${s.top} ${VB_WIDTH} ${s.height}`}
            preserveAspectRatio="none"
          >
            <path
              ref={(el) => {
                pathRefs.current[i] = el;
              }}
              d={master.path}
              fill="none"
              stroke={s.color}
              strokeWidth={2.5}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className="transition-[stroke-dashoffset] duration-150 ease-out"
            />
          </svg>,
          s.container,
        ),
      )}
    </>
  );
}
