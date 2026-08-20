"use client";

import { useActionState, useState } from "react";
import { upsertCaseStudy } from "./actions";
import type { CaseStudy } from "@/lib/types/database";

export function CaseStudyForm({
  brandId,
  caseStudy,
}: {
  brandId: string;
  caseStudy?: CaseStudy;
}) {
  const [state, formAction, pending] = useActionState(upsertCaseStudy, null);
  const [heroPreview, setHeroPreview] = useState<string | null>(
    caseStudy?.hero_media_url ?? null,
  );

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <input type="hidden" name="brand_id" value={brandId} />
      {caseStudy && (
        <input type="hidden" name="case_study_id" value={caseStudy.id} />
      )}

      <Field
        label="One-line brief"
        name="one_line_brief"
        defaultValue={caseStudy?.one_line_brief}
        placeholder="A launch campaign that repositioned the brand for a younger audience."
      />
      <TextArea
        label="The challenge"
        name="challenge"
        defaultValue={caseStudy?.challenge}
        placeholder="What the brand needed."
      />
      <TextArea
        label="The approach"
        name="approach"
        defaultValue={caseStudy?.approach}
        placeholder="Strategy and creative direction decisions."
      />
      <TextArea
        label="Art direction"
        name="art_direction"
        defaultValue={caseStudy?.art_direction}
        placeholder="Imagery, stills, video direction notes."
      />

      <div className="space-y-1.5">
        <label htmlFor="deliverables" className="text-sm font-medium text-ink/80">
          Deliverables
        </label>
        <p className="text-xs text-ink/50">
          One per line, e.g. 4 reels, campaign key art, 2 shoot days
        </p>
        <textarea
          id="deliverables"
          name="deliverables"
          rows={4}
          defaultValue={caseStudy?.deliverables?.join("\n")}
          className="w-full rounded-md border border-ink/15 px-3.5 py-3 text-base outline-none focus:border-burgundy"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="hero_media" className="text-sm font-medium text-ink/80">
          Hero image
        </label>
        {heroPreview && (
          <div className="mb-2 aspect-[16/9] w-full max-w-md overflow-hidden rounded-card border border-ink/10 bg-paper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroPreview}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <input
          id="hero_media"
          name="hero_media"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setHeroPreview(URL.createObjectURL(file));
          }}
          className="w-full text-sm"
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-ink/80">
        <input
          type="checkbox"
          name="published"
          defaultChecked={caseStudy?.published}
          className="h-4 w-4"
        />
        Published (visible on the case study page)
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
        {pending ? "Saving…" : "Save case study"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium text-ink/80">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-md border border-ink/15 px-3.5 py-3 text-base outline-none focus:border-burgundy"
      />
    </div>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium text-ink/80">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={4}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-md border border-ink/15 px-3.5 py-3 text-base outline-none focus:border-burgundy"
      />
    </div>
  );
}
