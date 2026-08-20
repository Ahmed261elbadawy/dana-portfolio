// Placeholder brand names until real logos are uploaded through the admin.
// Nine are pulled straight from the brief; the rest are filler so the strip
// reads full at fifteen.
const BRANDS = [
  "Marzipan",
  "Gala",
  "Amaretti",
  "360 Nutrition",
  "The Cut",
  "LAB101",
  "Superbowl",
  "Homehive",
  "Zeinab's Art Studio",
  "Cedar & Sage",
  "Nomad Coffee",
  "Willow Studio",
  "Verde Kitchen",
  "Faro Bakehouse",
  "Halcyon Fit",
];

export function TrustedStrip() {
  return (
    <div className="bg-yellow px-5 py-10 sm:px-8 sm:py-14 lg:px-16">
      <div className="mx-auto max-w-6xl space-y-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink/40">
          Brands I&apos;ve worked with
        </p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-5">
          {BRANDS.map((name) => (
            <div
              key={name}
              className="flex h-16 items-center justify-center rounded-card border border-ink/8 bg-paper px-3 text-center sm:h-20"
            >
              <span className="font-display text-sm italic text-ink/45 sm:text-base">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
