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

export function ScrollWave() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const lengthRef = useRef(0);
  const [geometry, setGeometry] = useState<{
    height: number;
    path: string;
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
            : { height, path: buildWavePath(height) },
        );
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrapper);
    return () => ro.disconnect();
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
            className="absolute inset-0 h-full w-full mix-blend-difference"
            viewBox={`0 0 ${VB_WIDTH} ${geometry.height}`}
            preserveAspectRatio="none"
          >
            <path
              ref={pathRef}
              d={geometry.path}
              fill="none"
              stroke="#F7F1E6"
              strokeWidth={7}
              strokeLinecap="round"
              className="transition-[stroke-dashoffset] duration-150 ease-out"
            />
          </svg>
          <div
            ref={dotRef}
            className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream shadow-[0_0_10px_rgba(255,255,255,0.85)] mix-blend-difference"
            style={{ left: "50%", top: "0%" }}
          />
        </>
      )}
    </div>
  );
}
