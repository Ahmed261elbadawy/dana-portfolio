const WORDS = [
  "Content Creation",
  "Brand Strategy",
  "Art Direction",
  "Social Media",
  "Campaigns",
];

export function MarqueeBand() {
  const track = [...WORDS, ...WORDS];

  return (
    <div className="overflow-hidden border-y border-ink/10 bg-cream py-2">
      <div className="marquee-track flex w-max items-center gap-5 motion-reduce:animate-none">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center gap-5">
            {track.map((word, i) => (
              <div key={`${copy}-${i}`} className="flex items-center gap-5">
                <span className="font-display text-sm text-ink/70 sm:text-base">
                  {word}
                </span>
                <span className="text-sm text-burgundy sm:text-base">✦</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
