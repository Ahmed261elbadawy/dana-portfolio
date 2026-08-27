"use client";

import { useEffect, useRef, useState } from "react";

// A thin wavy line that draws itself in as the page scrolls. It renders as
// one overlay above section content (thin + a real stroke color per
// section, not a blend trick) — an earlier version tried rendering it
// *behind* content instead, which was correct in principle but meant it
// was invisible almost everywhere: section content (cards, photos, text
// blocks with solid backgrounds) painted over it, especially on mobile
// where content spans nearly the full section width. A thin line sitting
// on top is a far smaller visual intrusion than that trade-off.
const VB_WIDTH = 100;
const WAVELENGTH_PX = 520; // one full left-right swing, in real pixels
const AMPLITUDE = 26; // swing distance from center, in viewBox units
const MID_X = VB_WIDTH / 2;

const CREAM = "#F7F1E6";
const BURGUNDY = "#4A1226";
const GRADIENT_ID = "scroll-wave-gradient";

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

type Stop = { offset: number; color: string };

// Contrast comes from reading each [data-nav-theme] section's own color and
// switching the line to whichever reads on it — the same idea the header
// nav already uses reliably — encoded as a hard-stop gradient instead of a
// runtime blend mode (which didn't render reliably for this SVG stroke).
function buildStops(wrapper: HTMLElement, height: number): Stop[] {
  const scope = wrapper.parentElement ?? document;
  const sections = Array.from(
    scope.querySelectorAll<HTMLElement>("[data-nav-theme]"),
  );
  if (sections.length === 0 || height <= 0) {
    return [
      { offset: 0, color: BURGUNDY },
      { offset: 1, color: BURGUNDY },
    ];
  }

  const wrapperTop = wrapper.getBoundingClientRect().top + window.scrollY;
  // Sections overlap their predecessor by ~28px (the rounded-corner reveal
  // trick), so a section's own measured top lags behind where it actually
  // starts reading visually — pull every boundary up to compensate.
  const BOUNDARY_NUDGE = 44;
  const bands = sections
    .map((s) => {
      const rect = s.getBoundingClientRect();
      const top = rect.top + window.scrollY - wrapperTop - BOUNDARY_NUDGE;
      const bottom = top + rect.height;
      const color =
        s.getAttribute("data-nav-theme") === "dark" ? CREAM : BURGUNDY;
      return { top, bottom, color };
    })
    .sort((a, b) => a.top - b.top);

  const stops: Stop[] = [];
  const EPS = 0.001;
  let cursor = 0;

  for (const band of bands) {
    const startFrac = Math.max(0, Math.min(1, band.top / height));
    const endFrac = Math.max(0, Math.min(1, band.bottom / height));
    if (endFrac <= cursor) continue;

    if (startFrac > cursor) {
      const prevColor = stops.length
        ? stops[stops.length - 1].color
        : BURGUNDY;
      stops.push({ offset: cursor, color: prevColor });
      stops.push({
        offset: Math.max(cursor, startFrac - EPS),
        color: prevColor,
      });
    }

    stops.push({ offset: startFrac, color: band.color });
    stops.push({
      offset: Math.max(startFrac, endFrac - EPS),
      color: band.color,
    });
    cursor = endFrac;
  }

  if (cursor < 1) {
    const lastColor = stops.length ? stops[stops.length - 1].color : BURGUNDY;
    stops.push({ offset: cursor, color: lastColor });
    stops.push({ offset: 1, color: lastColor });
  }

  return stops;
}

export function ScrollWave() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const lengthRef = useRef(0);
  const [geometry, setGeometry] = useState<{
    height: number;
    path: string;
    stops: Stop[];
  } | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const measure = () => {
      const height = wrapper.getBoundingClientRect().height;
      if (height > 0) {
        setGeometry((prev) =>
          prev && Math.abs(prev.height - height) < 40
            ? prev
            : {
                height,
                path: buildWavePath(height),
                stops: buildStops(wrapper, height),
              },
        );
      }
    };

    measure();
    const t1 = setTimeout(measure, 300);
    const t2 = setTimeout(measure, 1200);
    const ro = new ResizeObserver(measure);
    ro.observe(wrapper);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const path = pathRef.current;
    if (!path || !geometry) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    lengthRef.current = path.getTotalLength();
    path.style.strokeDasharray = `${lengthRef.current}`;
    path.style.strokeDashoffset = `${lengthRef.current}`;
    if (reduced) {
      path.style.transition = "none";
    }

    // No rAF here: this is one cheap inline style write, and the "only
    // schedule a frame if one isn't pending" pattern can wedge permanently
    // if that first frame is ever delayed (backgrounded tab during load).
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0;
      const length = lengthRef.current;

      path.style.strokeDashoffset = `${length * (1 - pct)}`;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [geometry]);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
    >
      {geometry && (
        <>
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${VB_WIDTH} ${geometry.height}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id={GRADIENT_ID}
                x1="0"
                y1="0"
                x2="0"
                y2={geometry.height}
                gradientUnits="userSpaceOnUse"
              >
                {geometry.stops.map((s, i) => (
                  <stop key={i} offset={s.offset} stopColor={s.color} />
                ))}
              </linearGradient>
            </defs>
            <path
              ref={pathRef}
              d={geometry.path}
              fill="none"
              stroke={`url(#${GRADIENT_ID})`}
              strokeWidth={1.4}
              strokeLinecap="round"
              className="transition-[stroke-dashoffset] duration-150 ease-out"
            />
          </svg>
        </>
      )}
    </div>
  );
}
