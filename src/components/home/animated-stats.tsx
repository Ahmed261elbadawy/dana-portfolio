"use client";

import { useEffect, useRef, useState } from "react";

type Stat = { value: string; label: string };

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

function AnimatedStat({ stat, active }: { stat: Stat; active: boolean }) {
  const numMatch = stat.value.match(/^(\d+)(\+?)$/);
  const [display, setDisplay] = useState(stat.value);

  useEffect(() => {
    if (!active) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplay(stat.value);
      return;
    }

    let raf: number;
    const start = performance.now();

    if (numMatch) {
      const target = parseInt(numMatch[1], 10);
      const suffix = numMatch[2];
      const duration = 900;

      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        setDisplay(Math.round(progress * target) + suffix);
        if (progress < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    } else {
      const finalText = stat.value;
      const duration = 600;

      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const revealCount = Math.floor(progress * finalText.length);
        let out = "";
        for (let i = 0; i < finalText.length; i++) {
          if (i < revealCount || finalText[i] === " ") {
            out += finalText[i];
          } else {
            out +=
              SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          }
        }
        setDisplay(out);
        if (progress < 1) raf = requestAnimationFrame(tick);
        else setDisplay(finalText);
      };
      raf = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(raf);
  }, [active, stat.value, numMatch]);

  return (
    <div>
      <p className="font-display text-2xl tabular-nums text-yellow-deep">
        {display}
      </p>
      <p className="text-xs uppercase tracking-wide text-cream/50">
        {stat.label}
      </p>
    </div>
  );
}

export function AnimatedStats({ stats }: { stats: Stat[] }) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div ref={ref} className="flex flex-wrap gap-x-8 gap-y-3 pt-4">
      {stats.map((s) => (
        <AnimatedStat key={s.label} stat={s} active={inView} />
      ))}
    </div>
  );
}
