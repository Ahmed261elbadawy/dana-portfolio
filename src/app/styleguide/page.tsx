const swatches = [
  { name: "Cream", className: "bg-cream", textClass: "text-ink" },
  { name: "Pink", className: "bg-pink", textClass: "text-ink" },
  { name: "Pink deep", className: "bg-pink-deep", textClass: "text-ink" },
  { name: "Yellow", className: "bg-yellow", textClass: "text-ink" },
  { name: "Yellow deep", className: "bg-yellow-deep", textClass: "text-ink" },
  { name: "Burgundy", className: "bg-burgundy", textClass: "text-cream" },
  {
    name: "Burgundy light",
    className: "bg-burgundy-light",
    textClass: "text-cream",
  },
  { name: "Ink", className: "bg-ink", textClass: "text-cream" },
  {
    name: "Paper",
    className: "bg-paper border border-ink/10",
    textClass: "text-ink",
  },
];

export default function StyleguidePage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16 space-y-16">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-ink/50">
          Internal — design review
        </p>
        <h1 className="font-display text-display-lg">Styleguide</h1>
        <p className="text-ink/70 max-w-prose">
          Tokens, type, buttons, and cards for Dana&apos;s portfolio. Reviewed
          against the reference screenshots before any real page is built.
        </p>
      </header>

      {/* Color */}
      <section className="space-y-4">
        <h2 className="font-display text-display-sm">Color</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {swatches.map((s) => (
            <div
              key={s.name}
              className={`${s.className} ${s.textClass} rounded-card flex h-24 items-end p-3 text-sm font-medium`}
            >
              {s.name}
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-6">
        <h2 className="font-display text-display-sm">Typography</h2>
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink/40 mb-1">
              Wordmark — Archivo Black
            </p>
            <p className="font-wordmark text-display-xl leading-[0.95]">
              Dana Badawy
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink/40 mb-1">
              Display XL — Fraunces
            </p>
            <p className="font-display text-display-xl leading-[0.95]">
              Content, screen-ready, confident
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink/40 mb-1">
              Display LG — Fraunces
            </p>
            <p className="font-display text-display-lg leading-tight">
              Content, strategy, and screen-ready direction
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink/40 mb-1">
              Display MD — Fraunces
            </p>
            <p className="font-display text-display-md leading-tight">
              Featured work
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink/40 mb-1">
              Body — Inter
            </p>
            <p className="max-w-prose text-base sm:text-lg text-ink/80">
              This is body copy in a clean sans-serif — used for descriptions,
              captions, and everyday text throughout the site. 2+ years of
              hands-on experience from the first idea to the final frame.
            </p>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="font-display text-display-sm">Buttons</h2>
        <div className="flex flex-wrap items-center gap-4 rounded-card-lg bg-burgundy p-6">
          <button className="rounded-pill bg-cream px-6 py-3 text-sm font-semibold text-burgundy transition-transform hover:scale-[1.03] active:scale-[0.98]">
            Rounded button ↗
          </button>
          <button className="rounded-md border border-cream px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-cream hover:text-burgundy">
            Sharp button
          </button>
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-4">
        <h2 className="font-display text-display-sm">Cards</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-card-lg bg-pink p-6 space-y-2">
            <h3 className="font-display text-2xl">Featured work</h3>
            <p className="text-ink/70">
              Serif for the headline, sans for supporting text — pastel
              section.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="aspect-[9/16] rounded-card bg-ink" />
              <div className="aspect-[9/16] rounded-card bg-yellow-deep" />
            </div>
          </div>
          <div className="rounded-card-lg bg-burgundy p-6 text-cream space-y-2">
            <h3 className="font-display text-2xl">Burgundy block</h3>
            <p className="text-cream/80">
              Used as a full section, not just text or buttons, to break up
              the pastel areas with bold weight.
            </p>
            <div className="mt-4 flex gap-3">
              <button className="rounded-pill bg-cream px-5 py-2.5 text-sm font-semibold text-burgundy">
                Rounded ↗
              </button>
              <button className="rounded-md border border-cream px-5 py-2.5 text-sm font-semibold text-cream">
                Sharp
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile check */}
      <section className="space-y-4">
        <h2 className="font-display text-display-sm">Mobile note</h2>
        <p className="text-ink/70 max-w-prose">
          Resize to 375px width to confirm the display type scale stays
          dramatic and buttons stay thumb-sized (min 44px tall).
        </p>
      </section>
    </main>
  );
}
