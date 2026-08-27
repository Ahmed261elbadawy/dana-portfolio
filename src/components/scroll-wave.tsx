"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Portals into a <WaveSlot /> declared as the first JSX child inside each
// themed section (see wave-slot.tsx) — that's what lets the line paint
// above a section's own background but behind its real content. An
// earlier version tried to achieve this by inserting a raw DOM node with
// insertBefore, which React didn't know about and could silently wipe out
// on any re-render of that section; this version only ever portals into
// nodes React itself rendered and owns.
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
  slot: HTMLElement;
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
    const measure = () => {
      const slots = Array.from(
        document.querySelectorAll<HTMLElement>("[data-wave-slot]"),
      );
      if (slots.length === 0) return;

      const originTop = slots[0].getBoundingClientRect().top + window.scrollY;

      const segs: Segment[] = slots.map((slot) => {
        const section = slot.closest<HTMLElement>("[data-nav-theme]");
        const rect = (section ?? slot).getBoundingClientRect();
        const top = rect.top + window.scrollY - originTop;
        return {
          slot,
          top,
          height: rect.height,
          color:
            section?.getAttribute("data-nav-theme") === "dark"
              ? CREAM
              : BURGUNDY,
        };
      });

      const last = segs[segs.length - 1];
      const totalHeight = last.top + last.height;
      setMaster((prev) =>
        prev && Math.abs(prev.height - totalHeight) < 40
          ? prev
          : { height: totalHeight, path: buildWavePath(totalHeight) },
      );
      setSegments(segs);
    };

    measure();
    const t1 = setTimeout(measure, 300);
    const t2 = setTimeout(measure, 1200);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", measure);
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
          s.slot,
        ),
      )}
    </>
  );
}
