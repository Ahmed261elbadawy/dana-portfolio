"use client";

import { useActionState } from "react";
import { submitInquiry } from "@/app/(site)/actions";
import { ServiceDropdown } from "./service-dropdown";

export function InquiryForm({
  email,
  whatsappHref,
}: {
  email: string;
  whatsappHref: string;
}) {
  const [state, formAction, pending] = useActionState(submitInquiry, null);

  if (state?.success) {
    return (
      <div className="rounded-card-lg bg-paper p-8 text-center">
        <p className="font-display text-2xl">Got it, thank you.</p>
        <p className="mt-2 text-ink/60">Dana will get back to you soon.</p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-card-lg bg-paper p-6 sm:p-8"
    >
      {/* Honeypot: hidden from real visitors, bots tend to fill every field */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="company_website">Website</label>
        <input
          id="company_website"
          name="company_website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium text-ink/80">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-md border border-ink/15 px-3.5 py-3 text-base outline-none focus:border-burgundy"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-ink/80">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-md border border-ink/15 px-3.5 py-3 text-base outline-none focus:border-burgundy"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="phone" className="text-sm font-medium text-ink/80">
          Phone number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="w-full rounded-md border border-ink/15 px-3.5 py-3 text-base outline-none focus:border-burgundy"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-ink/80">
          What do you need?
        </label>
        <ServiceDropdown />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="message" className="text-sm font-medium text-ink/80">
          Tell me about the project (optional)
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="w-full rounded-md border border-ink/15 px-3.5 py-3 text-base outline-none focus:border-burgundy"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-burgundy" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-pill bg-burgundy px-7 py-3.5 text-sm font-semibold text-cream disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Sending..." : "Send it over"}
      </button>

      <div className="flex flex-wrap items-center gap-3 border-t border-ink/10 pt-6">
        <p className="w-full text-sm text-ink/50 sm:w-auto sm:mr-2">
          Or reach out directly:
        </p>
        <a
          href={`mailto:${email}`}
          className="rounded-pill border border-ink/15 px-6 py-3 text-sm font-semibold transition-colors hover:bg-ink hover:text-cream"
        >
          Email ↗
        </a>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="rounded-pill border border-ink/15 px-6 py-3 text-sm font-semibold transition-colors hover:bg-ink hover:text-cream"
        >
          WhatsApp ↗
        </a>
      </div>
    </form>
  );
}
