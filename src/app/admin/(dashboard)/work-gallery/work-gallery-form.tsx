"use client";

import { useActionState, useState } from "react";
import { upsertWorkGalleryItem } from "./actions";
import type { WorkGalleryCategory, WorkGalleryItem } from "@/lib/types/database";

const CATEGORY_OPTIONS: { value: WorkGalleryCategory; label: string }[] = [
  { value: "grids", label: "Grids" },
  { value: "production", label: "Production" },
  { value: "direction", label: "Direction" },
];

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i;

export function WorkGalleryForm({
  item,
  defaultCategory,
}: {
  item?: WorkGalleryItem;
  defaultCategory?: WorkGalleryCategory;
}) {
  const [state, formAction, pending] = useActionState(upsertWorkGalleryItem, null);
  const [preview, setPreview] = useState<string | null>(item?.media_url ?? null);
  const [previewIsVideo, setPreviewIsVideo] = useState(
    VIDEO_EXT.test(item?.media_url ?? ""),
  );

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      {item && <input type="hidden" name="id" value={item.id} />}

      <div className="space-y-1.5">
        <label htmlFor="category" className="text-sm font-medium text-ink/80">
          Category
        </label>
        <select
          id="category"
          name="category"
          required
          defaultValue={item?.category ?? defaultCategory ?? "grids"}
          className="w-full rounded-md border border-ink/15 px-3.5 py-3 text-base outline-none focus:border-burgundy"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="media" className="text-sm font-medium text-ink/80">
          Photo or video
          {item ? " (optional, leave blank to keep current)" : ""}
        </label>
        {preview && (
          <div className="mb-2 aspect-[4/5] w-40 overflow-hidden rounded-card border border-ink/10 bg-paper">
            {previewIsVideo ? (
              <video
                src={preview}
                className="h-full w-full object-cover"
                muted
                loop
                autoPlay
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-full w-full object-cover" />
            )}
          </div>
        )}
        <input
          id="media"
          name="media"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif,video/mp4,video/webm,video/quicktime"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setPreviewIsVideo(file.type.startsWith("video/"));
              setPreview(URL.createObjectURL(file));
            }
          }}
          className="w-full text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="alt_text" className="text-sm font-medium text-ink/80">
          Alt text (optional)
        </label>
        <input
          id="alt_text"
          name="alt_text"
          type="text"
          placeholder="Short description for accessibility"
          defaultValue={item?.alt_text ?? ""}
          className="w-full rounded-md border border-ink/15 px-3.5 py-3 text-base outline-none focus:border-burgundy"
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-ink/80">
        <input
          type="checkbox"
          name="published"
          defaultChecked={item?.published ?? true}
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
        {pending ? "Saving…" : item ? "Save changes" : "Add item"}
      </button>
    </form>
  );
}
