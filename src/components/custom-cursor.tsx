"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dot = dotRef.current;
    if (!dot) return;

    let raf = 0;

    function move(e: PointerEvent) {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          if (dot) {
            dot.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0) translate(-50%, -50%)`;
          }
        });
      }
    }

    function onOver(e: PointerEvent) {
      const target = e.target as HTMLElement;
      if (dot && target.closest("a, button, [role='button']")) {
        dot.classList.add("scale-[2.5]", "opacity-40");
      }
    }

    function onOut(e: PointerEvent) {
      const target = e.target as HTMLElement;
      if (dot && target.closest("a, button, [role='button']")) {
        dot.classList.remove("scale-[2.5]", "opacity-40");
      }
    }

    document.body.classList.add("cursor-none");
    dot.classList.remove("hidden");
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);

    return () => {
      document.body.classList.remove("cursor-none");
      dot.classList.add("hidden");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-3 w-3 rounded-full bg-burgundy opacity-70 transition-[transform,opacity] duration-150 ease-out will-change-transform"
    />
  );
}
