import Image from "next/image";

export function Polaroid({
  photoUrl,
  name,
}: {
  photoUrl?: string | null;
  name: string;
}) {
  return (
    <div className="relative mx-auto w-full max-w-xs -rotate-3 rounded-sm bg-cream p-3 pb-5 shadow-2xl transition-transform duration-300 hover:rotate-0 sm:max-w-sm">
      <span
        aria-hidden
        className="absolute -top-3 left-1/2 h-7 w-24 -translate-x-1/2 -rotate-2 bg-yellow-deep/70"
        style={{
          clipPath:
            "polygon(0% 15%, 100% 0%, 100% 85%, 0% 100%)",
        }}
      />

      <div className="relative aspect-[4/5] w-full overflow-hidden bg-pink">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={name}
            fill
            sizes="(min-width: 640px) 384px, 320px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-wordmark text-6xl text-ink/20">
              {name.charAt(0)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
