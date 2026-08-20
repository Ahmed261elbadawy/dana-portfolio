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
    <div className="overflow-hidden border-y border-ink/10 bg-cream py-4">
      <div className="marquee-track flex w-max items-center gap-8 motion-reduce:animate-none">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center gap-8">
            {track.map((word, i) => (
              <div key={`${copy}-${i}`} className="flex items-center gap-8">
                <span className="font-display text-2xl text-ink/70 sm:text-3xl">
                  {word}
                </span>
                <span className="text-2xl text-burgundy sm:text-3xl">✦</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
