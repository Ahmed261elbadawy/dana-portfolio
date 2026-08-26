"use client";

import { useEffect, useRef } from "react";

/**
 * Floating icon bubbles for the "Get in touch" section only.
 *
 * The simulation is hand-rolled (no physics library) and is driven by a single
 * rAF loop that only runs while the section is on screen, so it costs nothing
 * on the rest of the page. Positions are written straight to the DOM rather
 * than through React state to avoid re-rendering 8 nodes per frame.
 *
 * Input:
 *  - pointer moves push bubbles away and they drift back
 *  - dragging a bubble throws it
 *  - device tilt acts as gravity (Android; iOS withholds this without a
 *    permission prompt, which we deliberately don't show)
 *  - scrolling past the section jostles them, so phones that give us no tilt
 *    still see the bubbles react
 */

const BRAND_PATHS = {
  // Official marks, taken verbatim from simple-icons.
  instagram:
    "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077",
  tiktok:
    "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  facebook:
    "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z",
  pinterest:
    "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z",
} as const;

type IconKey =
  | keyof typeof BRAND_PATHS
  | "canva"
  | "youtube"
  | "camera"
  | "food";

function Icon({ name }: { name: IconKey }) {
  const common = {
    viewBox: "0 0 24 24",
    className: "h-full w-full",
    "aria-hidden": true as const,
  };

  if (name === "youtube") {
    // Rounded rect + play triangle, drawn as two shapes instead of relying
    // on the official path's fill-winding, which was rendering wrong at
    // small sizes and single-color fill.
    return (
      <svg {...common}>
        <rect x="1.5" y="4.5" width="21" height="15" rx="5" fill="currentColor" />
        <path d="M10 8.7l6 3.3-6 3.3z" fill="var(--color-cream, #F7F1E6)" />
      </svg>
    );
  }

  if (name in BRAND_PATHS) {
    return (
      <svg {...common} fill="currentColor">
        <path d={BRAND_PATHS[name as keyof typeof BRAND_PATHS]} />
      </svg>
    );
  }

  if (name === "canva") {
    // Bold ring open on the right, matching Canva's thick cursive "C",
    // with a small terminal dot for its tail-hook.
    return (
      <svg {...common} fill="none">
        <circle cx="12" cy="12" r="11.5" fill="currentColor" />
        <path
          d="M17.6 7.3A7.3 7.3 0 1 0 17.6 16.7"
          stroke="var(--color-cream, #F7F1E6)"
          strokeWidth="4.2"
          strokeLinecap="round"
        />
        <circle cx="17.6" cy="7.3" r="1.1" fill="var(--color-cream, #F7F1E6)" />
      </svg>
    );
  }

  if (name === "camera") {
    return (
      <svg {...common} fill="currentColor" fillRule="evenodd">
        <path d="M9.2 2.5h5.6l1.3 2.2h3.4A2.5 2.5 0 0 1 22 7.2v11.3a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 18.5V7.2a2.5 2.5 0 0 1 2.5-2.5h3.4l1.3-2.2Zm2.8 5.4a5.3 5.3 0 1 0 0 10.6 5.3 5.3 0 0 0 0-10.6Zm0 2.2a3.1 3.1 0 1 1 0 6.2 3.1 3.1 0 0 1 0-6.2Z" />
      </svg>
    );
  }

  // Fork and spoon: the food-and-lifestyle cue.
  return (
    <svg {...common} fill="currentColor">
      <path d="M5.1 2a.9.9 0 0 1 .9.9v4.2h1V2.9a.9.9 0 1 1 1.8 0v4.2h1V2.9a.9.9 0 1 1 1.8 0v5a3.1 3.1 0 0 1-2.2 2.96V21.1a1.1 1.1 0 0 1-2.2 0V10.86A3.1 3.1 0 0 1 4.2 7.9v-5A.9.9 0 0 1 5.1 2Z" />
      <path d="M17.4 2c1.9 0 3.4 2.4 3.4 5.2 0 2.35-1.05 4.35-2.5 4.95v8.95a1.1 1.1 0 0 1-2.2 0v-8.95c-1.45-.6-2.5-2.6-2.5-4.95C13.6 4.4 15.5 2 17.4 2Z" />
    </svg>
  );
}

const ICONS: IconKey[] = [
  "instagram",
  "tiktok",
  "facebook",
  "pinterest",
  "canva",
  "youtube",
  "camera",
  "food",
];

// Some marks have more built-in padding than others at the same viewBox,
// so a per-icon nudge keeps them visually the same weight inside the bubble.
const ICON_SCALE: Partial<Record<IconKey, number>> = {
  pinterest: 1.35,
  facebook: 1.2,
};

type Bubble = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  el: HTMLElement;
};

const DAMPING = 0.99;
const RESTITUTION = 0.75;
const POINTER_RADIUS = 130;
const POINTER_FORCE = 1.1;
const JITTER = 0.03;
const MAX_SPEED = 14;

export function ContactBubbles() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const els = Array.from(
      layer.querySelectorAll<HTMLElement>("[data-bubble]"),
    );
    if (els.length === 0) return;

    let width = layer.clientWidth;
    let height = layer.clientHeight;

    // The headline/buttons block bubbles must stay clear of.
    let safe = { x: 0, y: 0, w: 0, h: 0 };
    const measureSafe = () => {
      const el = layer.parentElement?.querySelector<HTMLElement>(
        "[data-bubble-safe]",
      );
      if (!el) return;
      const a = el.getBoundingClientRect();
      const b = layer.getBoundingClientRect();
      const pad = 14;
      safe = {
        x: a.left - b.left - pad,
        y: a.top - b.top - pad,
        w: a.width + pad * 2,
        h: a.height + pad * 2,
      };
    };

    measureSafe();

    // Pushes a bubble out of the text safe-zone. On mobile the safe box
    // nearly spans the section width, so escaping sideways can be
    // impossible within the walls — only candidates that actually fit
    // inside [r, width-r] / [r, height-r] are considered, and among those
    // the cheapest move wins. Used both for the initial layout (so a
    // static, reduced-motion page is never wrong) and every sim step.
    const resolveSafeOverlap = (b: { x: number; y: number; r: number }) => {
      if (safe.w <= 0) return;
      const cx = safe.x + safe.w / 2;
      const cy = safe.y + safe.h / 2;
      const ox = safe.w / 2 + b.r - Math.abs(b.x - cx);
      const oy = safe.h / 2 + b.r - Math.abs(b.y - cy);
      if (ox <= 0 || oy <= 0) return;

      const candidates: { axis: "x" | "y"; value: number; cost: number }[] =
        [];
      const left = safe.x - b.r;
      const right = safe.x + safe.w + b.r;
      const top = safe.y - b.r;
      const bottom = safe.y + safe.h + b.r;

      if (left >= b.r) candidates.push({ axis: "x", value: left, cost: Math.abs(b.x - left) });
      if (right <= width - b.r) candidates.push({ axis: "x", value: right, cost: Math.abs(b.x - right) });
      if (top >= b.r) candidates.push({ axis: "y", value: top, cost: Math.abs(b.y - top) });
      if (bottom <= height - b.r) candidates.push({ axis: "y", value: bottom, cost: Math.abs(b.y - bottom) });

      if (candidates.length === 0) {
        // No escape fits (safe box larger than the section) — best effort.
        if (ox < oy) b.x += b.x < cx ? -ox : ox;
        else b.y += b.y < cy ? -oy : oy;
        return;
      }

      candidates.sort((a, b2) => a.cost - b2.cost);
      const pick = candidates[0];
      if (pick.axis === "x") b.x = pick.value;
      else b.y = pick.value;
    };

    // On mobile the safe box already takes up almost the whole section, so
    // instead of scattering bubbles around the text, line them up in a
    // small row underneath the buttons — a mini icon strip, not a float.
    const isMobile = width < 640;

    const bubbles: Bubble[] = els.map((el, i) => {
      const r = el.offsetWidth / 2;

      if (isMobile) {
        const cols = 4;
        const col = i % cols;
        const row = Math.floor(i / cols);
        const marginX = r + 10;
        const usable = Math.max(width - marginX * 2, 1);
        const rowTop = safe.y + safe.h + 14 + r;
        const b = {
          r,
          x: marginX + (usable * (col + 0.5)) / cols,
          y: rowTop + row * (r * 2 + 12),
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          el,
        };
        b.x = Math.min(Math.max(b.x, b.r), Math.max(width - b.r, b.r));
        b.y = Math.min(Math.max(b.y, b.r), Math.max(height - b.r, b.r));
        return b;
      }

      // Seed around the perimeter so nothing starts buried under the text.
      const t = (i / els.length) * Math.PI * 2;
      const b = {
        r,
        x: width / 2 + Math.cos(t) * (width / 2 - r - 6),
        y: height / 2 + Math.sin(t) * (height / 2 - r - 6),
        vx: Math.cos(t * 3) * 1.4,
        vy: Math.sin(t * 2) * 1.4,
        el,
      };
      // A tall/narrow section can make the perimeter ellipse pass straight
      // through the text block — settle out of it before first paint.
      // Clamping to the walls can push a bubble back into the safe zone, so
      // alternate the two constraints until both hold.
      for (let pass = 0; pass < 6; pass++) {
        b.x = Math.min(Math.max(b.x, b.r), Math.max(width - b.r, b.r));
        b.y = Math.min(Math.max(b.y, b.r), Math.max(height - b.r, b.r));
        resolveSafeOverlap(b);
      }
      b.x = Math.min(Math.max(b.x, b.r), Math.max(width - b.r, b.r));
      b.y = Math.min(Math.max(b.y, b.r), Math.max(height - b.r, b.r));
      return b;
    });

    const draw = () => {
      for (const b of bubbles) {
        b.el.style.transform = `translate3d(${b.x - b.r}px, ${b.y - b.r}px, 0)`;
      }
    };

    const measure = () => {
      width = layer.clientWidth;
      height = layer.clientHeight;
      measureSafe();
      for (const b of bubbles) {
        b.r = b.el.offsetWidth / 2;
        for (let pass = 0; pass < 6; pass++) {
          b.x = Math.min(Math.max(b.x, b.r), Math.max(width - b.r, b.r));
          b.y = Math.min(Math.max(b.y, b.r), Math.max(height - b.r, b.r));
          resolveSafeOverlap(b);
        }
        b.x = Math.min(Math.max(b.x, b.r), Math.max(width - b.r, b.r));
        b.y = Math.min(Math.max(b.y, b.r), Math.max(height - b.r, b.r));
      }
      draw();
    };

    draw();

    if (reduced) {
      // Static scatter, no simulation at all.
      return;
    }

    const ro = new ResizeObserver(measure);
    ro.observe(layer);

    // ---- input ----------------------------------------------------------
    const pointer = { x: -9999, y: -9999, active: false };
    let dragged: Bubble | null = null;
    let dragPrev = { x: 0, y: 0 };
    const gravity = { x: 0, y: 0 };

    const onPointerMove = (e: PointerEvent) => {
      const b = layer.getBoundingClientRect();
      pointer.x = e.clientX - b.left;
      pointer.y = e.clientY - b.top;
      pointer.active = true;

      if (dragged) {
        dragged.vx = pointer.x - dragPrev.x;
        dragged.vy = pointer.y - dragPrev.y;
        dragged.x = pointer.x;
        dragged.y = pointer.y;
        dragPrev = { x: pointer.x, y: pointer.y };
      }
    };
    const onPointerLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>(
        "[data-bubble]",
      );
      if (!target) return;
      const hit = bubbles.find((b) => b.el === target);
      if (!hit) return;
      const b = layer.getBoundingClientRect();
      dragPrev = { x: e.clientX - b.left, y: e.clientY - b.top };
      dragged = hit;
      target.setPointerCapture(e.pointerId);
    };
    const onPointerUp = () => {
      dragged = null;
    };

    layer.addEventListener("pointermove", onPointerMove);
    layer.addEventListener("pointerleave", onPointerLeave);
    layer.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);

    // Device tilt as gravity. Android gives this freely; iOS returns nulls
    // unless the user grants motion access, which we intentionally don't ask
    // for, so those phones fall back to drag + scroll impulses below.
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      const clamp = (v: number) => Math.max(-1, Math.min(1, v / 45));
      gravity.x = clamp(e.gamma) * 0.5;
      gravity.y = clamp(e.beta - 45) * 0.5;
    };
    window.addEventListener("deviceorientation", onTilt);

    // Scroll velocity jostles the bubbles so every phone gets some motion.
    let lastScroll = window.scrollY;
    const onScroll = () => {
      const d = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      const kick = Math.max(-6, Math.min(6, d * 0.25));
      for (const b of bubbles) {
        b.vy -= kick * 0.5;
        b.vx += (Math.random() - 0.5) * Math.abs(kick) * 0.4;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ---- simulation -----------------------------------------------------
    const step = () => {
      for (const b of bubbles) {
        if (b === dragged) continue;

        b.vx += gravity.x + (Math.random() - 0.5) * JITTER;
        b.vy += gravity.y + (Math.random() - 0.5) * JITTER;

        // Pointer pushes bubbles away, with falloff.
        if (pointer.active) {
          const dx = b.x - pointer.x;
          const dy = b.y - pointer.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < POINTER_RADIUS + b.r) {
            const f = (1 - dist / (POINTER_RADIUS + b.r)) * POINTER_FORCE;
            b.vx += (dx / dist) * f * 4;
            b.vy += (dy / dist) * f * 4;
          }
        }

        b.vx *= DAMPING;
        b.vy *= DAMPING;

        const speed = Math.hypot(b.vx, b.vy);
        if (speed > MAX_SPEED) {
          b.vx = (b.vx / speed) * MAX_SPEED;
          b.vy = (b.vy / speed) * MAX_SPEED;
        }

        b.x += b.vx;
        b.y += b.vy;

        // Walls.
        if (b.x - b.r < 0) {
          b.x = b.r;
          b.vx = Math.abs(b.vx) * RESTITUTION;
        } else if (b.x + b.r > width) {
          b.x = width - b.r;
          b.vx = -Math.abs(b.vx) * RESTITUTION;
        }
        if (b.y - b.r < 0) {
          b.y = b.r;
          b.vy = Math.abs(b.vy) * RESTITUTION;
        } else if (b.y + b.r > height) {
          b.y = height - b.r;
          b.vy = -Math.abs(b.vy) * RESTITUTION;
        }

        // Text block: push out to whichever escape actually fits.
        {
          const preX = b.x;
          const preY = b.y;
          resolveSafeOverlap(b);
          if (b.x !== preX) b.vx = (b.x < preX ? -1 : 1) * Math.abs(b.vx) * RESTITUTION;
          if (b.y !== preY) b.vy = (b.y < preY ? -1 : 1) * Math.abs(b.vy) * RESTITUTION;
        }
      }

      // Bubble-to-bubble.
      for (let i = 0; i < bubbles.length; i++) {
        for (let j = i + 1; j < bubbles.length; j++) {
          const a = bubbles[i];
          const c = bubbles[j];
          const dx = c.x - a.x;
          const dy = c.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.01;
          const overlap = a.r + c.r - dist;
          if (overlap <= 0) continue;

          const nx = dx / dist;
          const ny = dy / dist;
          const shift = overlap / 2;
          if (a !== dragged) {
            a.x -= nx * shift;
            a.y -= ny * shift;
          }
          if (c !== dragged) {
            c.x += nx * shift;
            c.y += ny * shift;
          }

          const rvx = c.vx - a.vx;
          const rvy = c.vy - a.vy;
          const sep = rvx * nx + rvy * ny;
          if (sep > 0) continue;
          const imp = -(1 + RESTITUTION) * sep * 0.5;
          if (a !== dragged) {
            a.vx -= imp * nx;
            a.vy -= imp * ny;
          }
          if (c !== dragged) {
            c.vx += imp * nx;
            c.vy += imp * ny;
          }
        }
      }

      draw();
    };

    // Only simulate while the section is actually on screen.
    let raf = 0;
    let running = false;
    const loop = () => {
      step();
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          lastScroll = window.scrollY;
          raf = requestAnimationFrame(loop);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 },
    );
    io.observe(layer);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      layer.removeEventListener("pointermove", onPointerMove);
      layer.removeEventListener("pointerleave", onPointerLeave);
      layer.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("deviceorientation", onTilt);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      ref={layerRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden [&>*]:pointer-events-auto"
      >
        {ICONS.map((name) => (
          <span
            key={name}
            data-bubble
            style={{ willChange: "transform" }}
            className="absolute left-0 top-0 grid h-9 w-9 touch-none place-items-center rounded-full bg-cream/20 p-1.5 text-burgundy shadow-[0_6px_20px_rgba(74,18,38,0.1)] ring-1 ring-burgundy/10 sm:h-11 sm:w-11 sm:p-2"
          >
            <span
              className="block h-full w-full"
              style={{ transform: `scale(${ICON_SCALE[name] ?? 1})` }}
            >
              <Icon name={name} />
            </span>
        </span>
      ))}
    </div>
  );
}
