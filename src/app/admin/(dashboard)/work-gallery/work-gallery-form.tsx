"use client";

import { useActionState, useRef, useState } from "react";
import { upsertWorkGalleryItem } from "./actions";
import type { WorkGalleryCategory, WorkGalleryItem } from "@/lib/types/database";

const CATEGORY_OPTIONS: { value: WorkGalleryCategory; label: string }[] = [
  { value: "grids", label: "Grids" },
  { value: "production", label: "Production" },
  { value: "direction", label: "Direction" },
];

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i;

function clearPoster(input: HTMLInputElement | null) {
  if (input) input.value = "";
}

// Grabs a frame ~1s in and drops it into the hidden "poster" file input.
// Best effort: if the browser can't decode the video (some .mov codecs),
// the poster is simply skipped and the site falls back to the video's own
// first frame.
function captureVideoPoster(url: string, input: HTMLInputElement | null) {
  clearPoster(input);
  if (!input) return;

  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;

  video.addEventListener("loadeddata", () => {
    video.currentTime = Math.min(1, (video.duration || 1) / 2);
  });
  video.addEventListener("seeked", () => {
    const scale = Math.min(1, 720 / (video.videoWidth || 720));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const dt = new DataTransfer();
        dt.items.add(new File([blob], "poster.jpg", { type: "image/jpeg" }));
        input.files = dt.files;
      },
      "image/jpeg",
      0.82,
    );
  });
}

export function WorkGalleryForm({
  item,
  defaultCategory,
}: {
  item?: WorkGalleryItem;
  defaultCategory?: WorkGalleryCategory;
}) {
  const [state, formAction, pending] = useActionState(upsertWorkGalleryItem, null);
  const posterInputRef = useRef<HTMLInputElement>(null);
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
              const isVideo = file.type.startsWith("video/");
              const url = URL.createObjectURL(file);
              setPreviewIsVideo(isVideo);
              setPreview(url);
              if (isVideo) captureVideoPoster(url, posterInputRef.current);
              else clearPoster(posterInputRef.current);
            }
          }}
          className="w-full text-sm"
        />
        {/* Filled in automatically with a still frame when a video is
            picked; the save action stores it as the video's cover photo. */}
        <input
          ref={posterInputRef}
          name="poster"
          type="file"
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
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
