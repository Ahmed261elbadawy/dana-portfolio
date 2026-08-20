"use client";

import { useActionState, useState } from "react";
import { updateSiteSettings } from "./actions";
import type { SiteSettings } from "@/lib/types/database";
import {
  FALLBACK_EMAIL,
  FALLBACK_INTRO,
  FALLBACK_WHATSAPP,
} from "@/lib/content";

export function SettingsForm({ settings }: { settings?: SiteSettings }) {
  const [state, formAction, pending] = useActionState(
    updateSiteSettings,
    null,
  );
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    settings?.photo_url ?? null,
  );

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <div className="space-y-1.5">
        <label htmlFor="photo" className="text-sm font-medium text-ink/80">
          Profile photo (shown in the About section)
        </label>
        {photoPreview && (
          <div className="mb-2 h-24 w-24 overflow-hidden rounded-full border border-ink/10 bg-paper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoPreview}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <input
          id="photo"
          name="photo"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setPhotoPreview(URL.createObjectURL(file));
          }}
          className="w-full text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="intro_paragraph"
          className="text-sm font-medium text-ink/80"
        >
          Homepage intro paragraph
        </label>
        <textarea
          id="intro_paragraph"
          name="intro_paragraph"
          rows={6}
          defaultValue={settings?.intro_paragraph || FALLBACK_INTRO}
          className="w-full rounded-md border border-ink/15 px-3.5 py-3 text-base outline-none focus:border-burgundy"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="bio" className="text-sm font-medium text-ink/80">
          Longer bio (for the About section)
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={5}
          defaultValue={settings?.bio}
          className="w-full rounded-md border border-ink/15 px-3.5 py-3 text-base outline-none focus:border-burgundy"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="services" className="text-sm font-medium text-ink/80">
          Services list (optional, one per line)
        </label>
        <textarea
          id="services"
          name="services"
          rows={4}
          defaultValue={settings?.services?.join("\n")}
          className="w-full rounded-md border border-ink/15 px-3.5 py-3 text-base outline-none focus:border-burgundy"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-ink/80">
          Contact email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={settings?.email || FALLBACK_EMAIL}
          className="w-full rounded-md border border-ink/15 px-3.5 py-3 text-base outline-none focus:border-burgundy"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="whatsapp" className="text-sm font-medium text-ink/80">
          WhatsApp number
        </label>
        <input
          id="whatsapp"
          name="whatsapp"
          type="text"
          placeholder="+20 111 477 1229"
          defaultValue={settings?.whatsapp || FALLBACK_WHATSAPP}
          className="w-full rounded-md border border-ink/15 px-3.5 py-3 text-base outline-none focus:border-burgundy"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="cv" className="text-sm font-medium text-ink/80">
          CV / capability deck (PDF, optional)
        </label>
        {settings?.cv_url && (
          <a
            href={settings.cv_url}
            target="_blank"
            rel="noreferrer"
            className="block text-sm text-burgundy underline"
          >
            Current file ↗
          </a>
        )}
        <input
          id="cv"
          name="cv"
          type="file"
          accept="application/pdf"
          className="w-full text-sm"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-burgundy" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-ink/60" role="status">
          Saved.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-pill bg-burgundy px-6 py-3 text-sm font-semibold text-cream disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
