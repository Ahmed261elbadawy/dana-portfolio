"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { upsertSkill } from "./actions";
import type { Skill } from "@/lib/types/database";

export function SkillForm({ skill }: { skill?: Skill }) {
  const [state, formAction, pending] = useActionState(upsertSkill, null);
  const [iconPreview, setIconPreview] = useState<string | null>(
    skill?.icon_url ?? null,
  );

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      {skill && <input type="hidden" name="id" value={skill.id} />}

      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium text-ink/80">
          Skill / tool name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Canva"
          defaultValue={skill?.name}
          className="w-full rounded-md border border-ink/15 px-3.5 py-3 text-base outline-none focus:border-burgundy"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="icon" className="text-sm font-medium text-ink/80">
          Icon{skill ? " (optional — leave blank to keep current)" : ""}
        </label>
        <p className="text-xs text-ink/50">
          A square logo/icon works best — background is removed
          automatically.
        </p>
        {iconPreview && (
          <div className="mb-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border border-ink/10 bg-paper p-2">
            <Image
              src={iconPreview}
              alt=""
              width={48}
              height={48}
              className="max-h-full max-w-full object-contain"
              unoptimized
            />
          </div>
        )}
        <input
          id="icon"
          name="icon"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setIconPreview(URL.createObjectURL(file));
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
        Uncheck this if the icon has a badge/circle design and removal cuts
        into the artwork — the file uploads exactly as-is instead.
      </p>

      <label className="flex items-center gap-2 text-sm font-medium text-ink/80">
        <input
          type="checkbox"
          name="published"
          defaultChecked={skill?.published ?? true}
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
        {pending ? "Saving…" : skill ? "Save changes" : "Add skill"}
      </button>
    </form>
  );
}
