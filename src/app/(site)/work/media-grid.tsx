"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { WorkGalleryItem } from "@/lib/types/database";

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i;

function isVideoUrl(url: string) {
  return VIDEO_EXT.test(url);
}

function MediaTile({
  item,
  onOpen,
}: {
  item: WorkGalleryItem;
  onOpen: () => void;
}) {
  const isVideo = isVideoUrl(item.media_url);

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={item.alt_text || "Open media"}
      className="group relative block aspect-[3/4] w-full overflow-hidden rounded-card bg-paper/10"
    >
      {isVideo ? (
        <video
          src={item.media_url}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <Image
          src={item.media_url}
          alt={item.alt_text ?? ""}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      )}
    </button>
  );
}

function Lightbox({
  item,
  onClose,
}: {
  item: WorkGalleryItem;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const isVideo = isVideoUrl(item.media_url);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4 sm:p-10"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-cream/10 text-2xl leading-none text-cream transition-colors hover:bg-cream/20"
      >
        ×
      </button>

      <div
        className="relative max-h-[90vh] max-w-[92vw]"
        onClick={(e) => e.stopPropagation()}
      >
        {isVideo ? (
          <video
            src={item.media_url}
            className="max-h-[90vh] max-w-[92vw] rounded-card"
            controls
            autoPlay
            playsInline
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.media_url}
            alt={item.alt_text ?? ""}
            className="max-h-[90vh] max-w-[92vw] rounded-card object-contain"
          />
        )}
      </div>
    </div>
  );
}

const PREVIEW_COUNT_MOBILE = 4;
const PREVIEW_COUNT_DESKTOP = 8;

const FADE_FROM: Record<string, string> = {
  dark: "from-burgundy",
  light: "from-cream",
  tint: "from-pink",
};

export function MediaGrid({
  items,
  theme,
}: {
  items: WorkGalleryItem[];
  theme: "dark" | "light" | "tint";
}) {
  const [openItem, setOpenItem] = useState<WorkGalleryItem | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [previewCount, setPreviewCount] = useState(PREVIEW_COUNT_DESKTOP);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () =>
      setPreviewCount(mq.matches ? PREVIEW_COUNT_DESKTOP : PREVIEW_COUNT_MOBILE);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const hasMore = items.length > previewCount;
  const visible = expanded ? items : items.slice(0, previewCount);

  return (
    <>
      <div className="relative">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((item) => (
            <MediaTile
              key={item.id}
              item={item}
              onOpen={() => setOpenItem(item)}
            />
          ))}
        </div>

        {hasMore && !expanded && (
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 flex h-40 items-end justify-center bg-gradient-to-t ${FADE_FROM[theme]} to-transparent pb-4 sm:h-48`}
          >
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="pointer-events-auto rounded-pill border border-current/25 bg-current/10 px-6 py-2.5 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-current/20"
            >
              See all
            </button>
          </div>
        )}
      </div>

      {openItem && (
        <Lightbox item={openItem} onClose={() => setOpenItem(null)} />
      )}
    </>
  );
}
