"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { upsertTestimonial } from "./actions";
import type { Testimonial } from "@/lib/types/database";

export function TestimonialForm({ testimonial }: { testimonial?: Testimonial }) {
  const [state, formAction, pending] = useActionState(upsertTestimonial, null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    testimonial?.avatar_url ?? null,
  );

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      {testimonial && (
        <input type="hidden" name="id" value={testimonial.id} />
      )}

      <div className="space-y-1.5">
        <label htmlFor="quote" className="text-sm font-medium text-ink/80">
          Quote
        </label>
        <textarea
          id="quote"
          name="quote"
          rows={4}
          required
          defaultValue={testimonial?.quote}
          className="w-full rounded-md border border-ink/15 px-3.5 py-3 text-base outline-none focus:border-burgundy"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="author" className="text-sm font-medium text-ink/80">
          Author
        </label>
        <input
          id="author"
          name="author"
          type="text"
          required
          defaultValue={testimonial?.author}
          className="w-full rounded-md border border-ink/15 px-3.5 py-3 text-base outline-none focus:border-burgundy"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="role" className="text-sm font-medium text-ink/80">
            Role (optional)
          </label>
          <input
            id="role"
            name="role"
            type="text"
            placeholder="Marketing Director"
            defaultValue={testimonial?.role ?? ""}
            className="w-full rounded-md border border-ink/15 px-3.5 py-3 text-base outline-none focus:border-burgundy"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="brand" className="text-sm font-medium text-ink/80">
            Brand (optional)
          </label>
          <input
            id="brand"
            name="brand"
            type="text"
            placeholder="Marzipan"
            defaultValue={testimonial?.brand ?? ""}
            className="w-full rounded-md border border-ink/15 px-3.5 py-3 text-base outline-none focus:border-burgundy"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="avatar" className="text-sm font-medium text-ink/80">
          Photo (optional)
        </label>
        {avatarPreview && (
          <div className="mb-2 h-16 w-16 overflow-hidden rounded-full border border-ink/10 bg-paper">
            <Image
              src={avatarPreview}
              alt=""
              width={64}
              height={64}
              className="h-full w-full object-cover"
              unoptimized
            />
          </div>
        )}
        <input
          id="avatar"
          name="avatar"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setAvatarPreview(URL.createObjectURL(file));
          }}
          className="w-full text-sm"
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-ink/80">
        <input
          type="checkbox"
          name="published"
          defaultChecked={testimonial?.published}
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
        {pending ? "Saving…" : testimonial ? "Save changes" : "Add testimonial"}
      </button>
    </form>
  );
}
