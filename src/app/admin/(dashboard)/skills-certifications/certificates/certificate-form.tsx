"use client";

import { useActionState, useState } from "react";
import { upsertCertificate } from "./actions";
import type { Certificate } from "@/lib/types/database";

export function CertificateForm({ certificate }: { certificate?: Certificate }) {
  const [state, formAction, pending] = useActionState(upsertCertificate, null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    certificate?.image_url ?? null,
  );

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      {certificate && <input type="hidden" name="id" value={certificate.id} />}

      <div className="space-y-1.5">
        <label htmlFor="title" className="text-sm font-medium text-ink/80">
          Certificate title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="Digital Marketing Certification"
          defaultValue={certificate?.title}
          className="w-full rounded-md border border-ink/15 px-3.5 py-3 text-base outline-none focus:border-burgundy"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="issuer" className="text-sm font-medium text-ink/80">
          Issuer (optional)
        </label>
        <input
          id="issuer"
          name="issuer"
          type="text"
          placeholder="Harvard Business School Online"
          defaultValue={certificate?.issuer ?? ""}
          className="w-full rounded-md border border-ink/15 px-3.5 py-3 text-base outline-none focus:border-burgundy"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="image" className="text-sm font-medium text-ink/80">
          Certificate image
          {certificate ? " (optional, leave blank to keep current)" : ""}
        </label>
        <p className="text-xs text-ink/50">
          A photo or scan of the certificate, shown as-is (no background
          removal, this one keeps its real image).
        </p>
        {imagePreview && (
          <div className="mb-2 aspect-[4/3] w-40 overflow-hidden rounded-card border border-ink/10 bg-paper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <input
          id="image"
          name="image"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setImagePreview(URL.createObjectURL(file));
          }}
          className="w-full text-sm"
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-ink/80">
        <input
          type="checkbox"
          name="published"
          defaultChecked={certificate?.published ?? true}
          className="h-4 w-4"
        />
        Published (visible on the public site)
      </label>

      {state?.error && (
        <p className="text-sm text-burgundy" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-pill bg-burgundy px-6 py-3 text-sm font-semibold text-cream disabled:opacity-60"
      >
        {pending ? "Saving…" : certificate ? "Save changes" : "Add certificate"}
      </button>
    </form>
  );
}
