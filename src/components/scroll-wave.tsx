"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Portals a wave segment into a <WaveSlot /> declared as the first JSX
// child inside each themed section (see wave-slot.tsx) — that's the only
// way to get "behind this section's content but above its background"
// with plain CSS: the wave is a sibling of every section, and each
// section establishes its own stacking context (position:relative + the
// z-10 it needs for the rounded-corner overlap between sections), so no
// z-index set on a descendant can ever outrank an external sibling like a
// single global overlay — it only ranks locally within that section's own
// context. Injecting real segments as each section's own first child
// sidesteps that entirely: normal DOM paint order handles it.
//
// Each segment uses a flat SOLID color (not a gradient) — a gradient
// stroke combined with vector-effect="non-scaling-stroke" doesn't render
// reliably across browsers (confirmed earlier: valid geometry, nothing
// painted). Solid color + non-scaling-stroke is the combination that's
// been verified (via canvas pixel sampling) to actually paint.
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

    const probe = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path",
    );
    probe.setAttribute("d", master.path);
    lengthRef.current = probe.getTotalLength();

    // No rAF: two cheap inline style writes per segment, and the "only
    // schedule a frame if one isn't pending" pattern can wedge permanently
    // if that first frame is ever delayed (backgrounded tab during load).
    const update = () => {
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

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
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
              strokeWidth={1.4}
              strokeLinecap="round"
              className="transition-[stroke-dashoffset] duration-150 ease-out"
            />
          </svg>,
          s.slot,
        ),
      )}
    </>
  );
}
