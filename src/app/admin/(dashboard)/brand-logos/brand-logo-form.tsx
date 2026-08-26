"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { upsertBrandLogo } from "./actions";
import type { BrandLogo } from "@/lib/types/database";

export function BrandLogoForm({ brandLogo }: { brandLogo?: BrandLogo }) {
  const [state, formAction, pending] = useActionState(upsertBrandLogo, null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    brandLogo?.logo_url ?? null,
  );

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      {brandLogo && <input type="hidden" name="id" value={brandLogo.id} />}

      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium text-ink/80">
          Brand name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Oh Betty"
          defaultValue={brandLogo?.name}
          className="w-full rounded-md border border-ink/15 px-3.5 py-3 text-base outline-none focus:border-burgundy"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="category" className="text-sm font-medium text-ink/80">
          Category (optional)
        </label>
        <p className="text-xs text-ink/50">
          Groups logos under a heading on the homepage, e.g. Food &amp;
          Beverage. Leave blank to show it ungrouped.
        </p>
        <input
          id="category"
          name="category"
          type="text"
          placeholder="Food & Beverage"
          defaultValue={brandLogo?.category ?? ""}
          className="w-full rounded-md border border-ink/15 px-3.5 py-3 text-base outline-none focus:border-burgundy"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="logo" className="text-sm font-medium text-ink/80">
          Logo{brandLogo ? " (optional, leave blank to keep current)" : ""}
        </label>
        <p className="text-xs text-ink/50">
          A transparent PNG or SVG works best, it&apos;s shown grayscale in
          a uniform grid.
        </p>
        {logoPreview && (
          <div className="mb-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border border-ink/10 bg-paper p-2">
            <Image
              src={logoPreview}
              alt=""
              width={48}
              height={48}
              className="max-h-full max-w-full object-contain"
              unoptimized
            />
          </div>
        )}
        <input
          id="logo"
          name="logo"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setLogoPreview(URL.createObjectURL(file));
          }}
          className="w-full text-sm"
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-ink/80">
        <input
          type="checkbox"
          name="remove_bg"
          defaultChecked={true}
          className="h-4 w-4"
        />
        Auto-remove background
      </label>
      <p className="-mt-4 text-xs text-ink/50">
        Uncheck this if the logo has a badge/circle design and removal cuts
        into the artwork, the file uploads exactly as-is instead.
      </p>

      <label className="flex items-center gap-2 text-sm font-medium text-ink/80">
        <input
          type="checkbox"
          name="published"
          defaultChecked={brandLogo?.published ?? true}
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
        {pending ? "Saving…" : brandLogo ? "Save changes" : "Add logo"}
      </button>
    </form>
  );
}
