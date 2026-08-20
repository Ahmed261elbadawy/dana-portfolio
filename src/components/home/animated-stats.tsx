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
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

function randomWord(text: string) {
  let out = "";
  for (const ch of text) {
    out += ch === " " ? " " : SCRAMBLE_CHARS[(Math.random() * 26) | 0];
  }
  return out;
}

function AnimatedStat({ stat, active }: { stat: Stat; active: boolean }) {
  const [display, setDisplay] = useState(stat.value);

  // Runs exactly once, when this stat becomes visible.
  useEffect(() => {
    if (!active) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const numMatch = stat.value.match(/^(\d+)(\+?)$/);

    if (numMatch) {
      const target = parseInt(numMatch[1], 10);
      const suffix = numMatch[2];
      const steps = Math.min(target, 16) || 1;
      setDisplay("0" + suffix);
      let step = 0;
      const id = setInterval(() => {
        step++;
        const value = Math.round((step / steps) * target);
        setDisplay(value + suffix);
        if (step >= steps) clearInterval(id);
      }, 900 / steps);
      return () => clearInterval(id);
    }

    // Scramble: whole word randomizes, then locks to the real text.
    const finalText = stat.value;
    const scrambleDuration = 1000;
    const tickMs = 70;
    const start = Date.now();
    const id = setInterval(() => {
      if (Date.now() - start >= scrambleDuration) {
        setDisplay(finalText);
        clearInterval(id);
      } else {
        setDisplay(randomWord(finalText));
      }
    }, tickMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

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
