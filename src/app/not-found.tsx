import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-cream px-6 text-center">
      <p className="font-wordmark text-display-lg text-burgundy">404</p>
      <h1 className="font-display text-display-sm">
        This page wandered off-brief.
      </h1>
      <p className="max-w-sm text-ink/70">
        The page you&apos;re looking for doesn&apos;t exist, but the work is
        still here.
      </p>
      <Link
        href="/"
        className="rounded-pill bg-burgundy px-7 py-3.5 text-sm font-semibold text-cream transition-transform hover:scale-[1.03]"
      >
        Back to the homepage
      </Link>
    </main>
  );
}
