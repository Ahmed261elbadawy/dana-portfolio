"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { upsertBrand } from "./actions";
import type { Brand as Project } from "@/lib/types/database";

const SERVICE_OPTIONS = [
  { value: "campaign", label: "Campaign" },
  { value: "strategy", label: "Strategy" },
  { value: "content_creation", label: "Content creation" },
  { value: "art_direction", label: "Creative direction" },
  { value: "social_media_management", label: "Social media management" },
] as const;

export function ProjectForm({ project }: { project?: Project }) {
  const [state, formAction, pending] = useActionState(upsertBrand, null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    project?.logo_url ?? null,
  );
  const [coverPreview, setCoverPreview] = useState<string | null>(
    project?.cover_image_url ?? null,
  );
  const [isCoverVideo, setIsCoverVideo] = useState(
    /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i.test(project?.cover_image_url ?? ""),
  );

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      {project && <input type="hidden" name="id" value={project.id} />}

      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium text-ink/80">
          Project name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={project?.name}
          className="w-full rounded-md border border-ink/15 px-3.5 py-3 text-base outline-none focus:border-burgundy"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="slug" className="text-sm font-medium text-ink/80">
          URL slug
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          placeholder="auto-generated from name if left blank"
          defaultValue={project?.slug}
          className="w-full rounded-md border border-ink/15 px-3.5 py-3 text-base outline-none focus:border-burgundy"
        />
        <p className="text-xs text-ink/50">
          Used in the case study web address, e.g. /work/marzipan
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="industry" className="text-sm font-medium text-ink/80">
          Industry
        </label>
        <input
          id="industry"
          name="industry"
          type="text"
          placeholder="e.g. Food & Beverage"
          defaultValue={project?.industry}
          className="w-full rounded-md border border-ink/15 px-3.5 py-3 text-base outline-none focus:border-burgundy"
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-ink/80">
          What you did for them
        </legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SERVICE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 rounded-md border border-ink/15 px-3 py-2.5 text-sm"
            >
              <input
                type="checkbox"
                name="services"
                value={opt.value}
                defaultChecked={project?.services?.includes(opt.value)}
                className="h-4 w-4"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-1.5">
        <label htmlFor="cover" className="text-sm font-medium text-ink/80">
          Cover photo or video
        </label>
        <p className="text-xs text-ink/50">
          The big media on the work card and case study, a real photo or
          video from the project, not the logo. A video plays muted and on
          loop automatically on the homepage grid.
        </p>
        {coverPreview && (
          <div className="mb-2 aspect-[4/3] w-full max-w-xs overflow-hidden rounded-card border border-ink/10 bg-paper">
            {isCoverVideo ? (
              <video
                src={coverPreview}
                className="h-full w-full object-cover"
                muted
                loop
                autoPlay
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverPreview}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
          </div>
        )}
        <input
          id="cover"
          name="cover"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif,video/mp4,video/webm,video/quicktime"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setIsCoverVideo(file.type.startsWith("video/"));
              setCoverPreview(URL.createObjectURL(file));
            }
          }}
          className="w-full text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="logo" className="text-sm font-medium text-ink/80">
          Logo
        </label>
        <p className="text-xs text-ink/50">
          Small badge shown on top of the cover photo, square or circular
          works best.
        </p>
        {logoPreview && (
          <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-card border border-ink/10 bg-paper p-2">
            <Image
              src={logoPreview}
              alt=""
              width={64}
              height={64}
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

      <div className="space-y-1.5">
        <label
          htmlFor="accent_color"
          className="text-sm font-medium text-ink/80"
        >
          Accent color (optional)
        </label>
        <input
          id="accent_color"
          name="accent_color"
          type="text"
          placeholder="#F7D3E0"
          defaultValue={project?.accent_color ?? ""}
          className="w-full rounded-md border border-ink/15 px-3.5 py-3 text-base outline-none focus:border-burgundy"
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-ink/80">
        <input
          type="checkbox"
          name="published"
          defaultChecked={project?.published}
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
        className="w-full rounded-pill bg-burgundy px-6 py-3 text-sm font-semibold text-cream disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Saving…" : project ? "Save changes" : "Add project"}
      </button>
    </form>
  );
}
