import Image from "next/image";
import Link from "next/link";
import { FALLBACK_EMAIL } from "@/lib/content";

export function SiteFooter({ email }: { email?: string }) {
  const contactEmail = email || FALLBACK_EMAIL;

  return (
    <footer className="bg-ink px-5 pb-24 pt-10 text-cream sm:px-8 sm:pb-10 lg:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Image src="/logo-mark-white.png" alt="Dana Badawy" width={30} height={30} />
          <p className="text-sm text-cream/50">
            Content, brand strategy, social media marketing.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-cream/70">
          <Link href="/#work" className="hover:text-cream">
            Work
          </Link>
          <Link href="/#about" className="hover:text-cream">
            About
          </Link>
          <a href={`mailto:${contactEmail}`} className="hover:text-cream">
            {contactEmail}
          </a>
        </nav>

        <p className="text-xs text-cream/40">
          © {new Date().getFullYear()} Dana Badawy
        </p>
      </div>

      <div className="mx-auto mt-6 max-w-6xl border-t border-cream/10 pr-16 pt-6 sm:pr-0">
        <p className="flex items-center text-xs text-cream/40">
          <span className="mr-1.5">Developed by</span>
          <Image
            src="/loopify-icon.png"
            alt=""
            width={16}
            height={12}
            className="opacity-60"
          />
          <a
            href="https://loopifyeg.com"
            target="_blank"
            rel="noreferrer"
            className="text-cream/60 underline underline-offset-2 hover:text-cream"
          >
            Loopify
          </a>
        </p>
      </div>
    </footer>
  );
}
