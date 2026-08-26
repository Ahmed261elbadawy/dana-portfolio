import Image from "next/image";
import Link from "next/link";
import { FALLBACK_EMAIL, FALLBACK_WHATSAPP } from "@/lib/content";

export function SiteFooter({
  email,
  whatsapp,
}: {
  email?: string;
  whatsapp?: string;
}) {
  const contactEmail = email || FALLBACK_EMAIL;
  const contactWhatsapp = whatsapp || FALLBACK_WHATSAPP;
  const whatsappHref = `https://wa.me/${contactWhatsapp.replace(/[^\d]/g, "")}`;

  return (
    <footer className="relative z-10 -mt-7 rounded-t-card-lg bg-ink px-5 pb-24 pt-16 text-cream sm:px-8 sm:pb-10 sm:pt-20 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-[1.3fr_1fr_1fr]">
          <div className="space-y-4">
            <Image
              src="/logo-mark-white.png"
              alt="Dana Badawy"
              width={34}
              height={34}
            />
            <p className="max-w-xs text-sm leading-relaxed text-cream/50">
              Content, brand strategy, and social media marketing for food
              and lifestyle brands.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-cream/40">
              Explore
            </p>
            <nav className="flex flex-col gap-3 text-sm text-cream/70">
              <Link href="/#work" className="w-fit transition-colors hover:text-cream">
                Work
              </Link>
              <Link href="/#about" className="w-fit transition-colors hover:text-cream">
                About
              </Link>
              <Link href="/#contact" className="w-fit transition-colors hover:text-cream">
                Contact
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-cream/40">
              Get in touch
            </p>
            <div className="flex flex-col gap-3 text-sm text-cream/70">
              <a
                href={`mailto:${contactEmail}`}
                className="w-fit break-all transition-colors hover:text-cream"
              >
                {contactEmail}
              </a>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="w-fit transition-colors hover:text-cream"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-cream/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-cream/40">
            © {new Date().getFullYear()} Dana Badawy. All rights reserved.
          </p>
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
      </div>
    </footer>
  );
}
