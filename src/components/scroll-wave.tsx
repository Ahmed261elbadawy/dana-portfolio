"use client";

import { useEffect, useRef, useState } from "react";

// The viewBox height is set to the page's real measured pixel height (not
// a guessed constant), so one wave swing is always a fixed ~520px on
// screen no matter how long the page ends up being — a short page gets a
// couple of big waves, a long one gets several, instead of either looking
// stretched or squeezed into a busy zigzag.
const VB_WIDTH = 100;
const WAVELENGTH_PX = 520; // one full left-right swing
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

// Instead of mix-blend-mode (which turned out unreliable here for an SVG
// stroke), the line gets its contrast the same way the header nav does:
// reading each [data-nav-theme] section's actual color and switching to
// whichever line color reads on it. A hard-stop gradient encodes that as
// flat color bands instead of a blend trick.
function buildStops(wrapper: HTMLElement, height: number): Stop[] {
  // The themed sections are siblings of this wrapper (both children of the
  // shared layout container), not descendants of it — scope the search to
  // that shared parent instead of the wrapper itself.
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
  const bands = sections
    .map((s) => {
      const rect = s.getBoundingClientRect();
      const top = rect.top + window.scrollY - wrapperTop;
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

    // Gap before this section: hold the previous color (or burgundy as a
    // sensible default for the cream page background) up to here.
    if (startFrac > cursor) {
      const prevColor = stops.length
        ? stops[stops.length - 1].color
        : BURGUNDY;
      stops.push({ offset: cursor, color: prevColor });
      stops.push({ offset: Math.max(cursor, startFrac - EPS), color: prevColor });
    }

    stops.push({ offset: startFrac, color: band.color });
    stops.push({ offset: Math.max(startFrac, endFrac - EPS), color: band.color });
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
  const dotRef = useRef<HTMLDivElement>(null);
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

    // Sections can still be shifting size right after mount (fonts,
    // images), so measure a couple more times shortly after.
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
    const dot = dotRef.current;
    if (!path || !geometry) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    lengthRef.current = path.getTotalLength();
    path.style.strokeDasharray = `${lengthRef.current}`;
    path.style.strokeDashoffset = `${lengthRef.current}`;
    if (reduced) {
      path.style.transition = "none";
      if (dot) dot.style.transition = "none";
    }

    let raf = 0;

    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0;
      const length = lengthRef.current;

      path.style.strokeDashoffset = `${length * (1 - pct)}`;

      if (dot) {
        // A plain DOM dot positioned by percentage, not an SVG shape, so it
        // stays perfectly round regardless of the path's own scaling.
        const point = path.getPointAtLength(length * pct);
        dot.style.left = `${(point.x / VB_WIDTH) * 100}%`;
        dot.style.top = `${(point.y / geometry.height) * 100}%`;
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
                  <stop
                    key={i}
                    offset={s.offset}
                    stopColor={s.color}
                  />
                ))}
              </linearGradient>
            </defs>
            <path
              ref={pathRef}
              d={geometry.path}
              fill="none"
              stroke={`url(#${GRADIENT_ID})`}
              strokeWidth={7}
              strokeLinecap="round"
              className="transition-[stroke-dashoffset] duration-150 ease-out"
            />
          </svg>
          <div
            ref={dotRef}
            className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream shadow-[0_0_0_3px_rgba(74,18,38,0.35),0_0_10px_rgba(0,0,0,0.4)]"
            style={{ left: "50%", top: "0%" }}
          />
        </>
      )}
    </div>
  );
}
