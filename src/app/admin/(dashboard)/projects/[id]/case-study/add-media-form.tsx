"use client";

import { useState } from "react";
import { addMedia } from "./actions";

export function AddMediaForm({ caseStudyId }: { caseStudyId: string }) {
  const [kind, setKind] = useState<"image" | "upload_video" | "embed">(
    "image",
  );

  return (
    <form action={addMedia} className="space-y-3 rounded-card bg-paper p-4">
      <input type="hidden" name="case_study_id" value={caseStudyId} />
      <input type="hidden" name="kind" value={kind} />

      <div className="flex flex-wrap gap-2">
        {(["image", "upload_video", "embed"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={`rounded-pill px-3 py-1.5 text-xs font-medium ${
              kind === k ? "bg-ink text-cream" : "bg-cream text-ink/60"
            }`}
          >
            {k === "image"
              ? "Image"
              : k === "upload_video"
                ? "Upload video"
                : "Embed link"}
          </button>
        ))}
      </div>

      {kind === "embed" ? (
        <input
          name="embed_url"
          type="url"
          placeholder="https://instagram.com/reel/..."
          className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
        />
      ) : (
        <input
          name="file"
          type="file"
          accept={kind === "image" ? "image/*" : "video/mp4,video/quicktime"}
          className="w-full text-sm"
        />
      )}

      <div className="flex flex-wrap gap-2">
        <input
          name="alt_text"
          type="text"
          placeholder="Alt text"
          className="flex-1 rounded-md border border-ink/15 px-3 py-2 text-sm"
        />
        <select
          name="aspect_ratio"
          defaultValue="9/16"
          className="rounded-md border border-ink/15 px-3 py-2 text-sm"
        >
          <option value="9/16">Portrait 9:16</option>
          <option value="1/1">Square 1:1</option>
          <option value="16/9">Landscape 16:9</option>
        </select>
      </div>

      <button
        type="submit"
        className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-cream"
      >
        Add media
      </button>
    </form>
  );
}
