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
  tall,
  onOpen,
}: {
  item: WorkGalleryItem;
  tall: boolean;
  onOpen: () => void;
}) {
  const isVideo = isVideoUrl(item.media_url);

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={item.alt_text || "Open media"}
      className={`group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-card bg-paper/10 ${
        tall ? "aspect-[3/4]" : "aspect-square"
      }`}
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

export function MediaGrid({ items }: { items: WorkGalleryItem[] }) {
  const [openItem, setOpenItem] = useState<WorkGalleryItem | null>(null);

  return (
    <>
      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
        {items.map((item, i) => (
          <MediaTile
            key={item.id}
            item={item}
            tall={i % 3 !== 1}
            onOpen={() => setOpenItem(item)}
          />
        ))}
      </div>

      {openItem && (
        <Lightbox item={openItem} onClose={() => setOpenItem(null)} />
      )}
    </>
  );
}
