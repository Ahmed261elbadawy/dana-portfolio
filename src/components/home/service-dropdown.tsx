"use client";

import { useEffect, useRef, useState } from "react";

const SERVICE_OPTIONS = [
  { value: "campaign", label: "Campaign" },
  { value: "strategy", label: "Strategy" },
  { value: "content_creation", label: "Content creation" },
  { value: "art_direction", label: "Creative direction" },
  { value: "social_media_management", label: "Social media management" },
] as const;

export function ServiceDropdown() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggle(value: string) {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value],
    );
  }

  const summary =
    selected.length === 0
      ? "What do you need?"
      : selected
          .map((v) => SERVICE_OPTIONS.find((o) => o.value === v)?.label)
          .join(", ");

  return (
    <div ref={ref} className="relative">
      {selected.map((v) => (
        <input key={v} type="hidden" name="services" value={v} />
      ))}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between rounded-md border border-ink/15 px-3.5 py-3 text-left text-base outline-none focus:border-burgundy ${
          selected.length === 0 ? "text-ink/40" : "text-ink"
        }`}
      >
        <span className="truncate">{summary}</span>
        <span className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute z-10 mt-1.5 w-full space-y-1 rounded-md border border-ink/15 bg-paper p-2 shadow-lg">
          {SERVICE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm hover:bg-cream"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                className="h-4 w-4"
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
