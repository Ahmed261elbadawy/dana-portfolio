"use client";

import { useRef } from "react";

const PULL = 0.35;
const MAX_OFFSET = 10;

export function Magnetic({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);

    const dx = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, x * PULL));
    const dy = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, y * PULL));

    el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
  }

  function reset() {
    const el = ref.current;
    if (el) el.style.transform = "";
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      className={`inline-block transition-transform duration-200 ease-out ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
