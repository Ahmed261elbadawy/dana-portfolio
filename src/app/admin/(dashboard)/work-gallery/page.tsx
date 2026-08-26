import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteWorkGalleryItem, moveWorkGalleryItem } from "./actions";
import { ConfirmSubmitButton } from "./confirm-submit-button";
import type { WorkGalleryCategory, WorkGalleryItem } from "@/lib/types/database";

const CATEGORIES: { value: WorkGalleryCategory; label: string }[] = [
  { value: "grids", label: "Grids" },
  { value: "production", label: "Production" },
  { value: "direction", label: "Direction" },
];

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i;

function CategorySection({
  category,
  label,
  items,
}: {
  category: WorkGalleryCategory;
  label: string;
  items: WorkGalleryItem[];
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-xl">{label}</h2>
        <Link
          href={`/admin/work-gallery/new?category=${category}`}
          className="rounded-pill bg-burgundy px-5 py-2.5 text-sm font-semibold text-cream"
        >
          Add to {label} ↗
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="rounded-card bg-paper p-6 text-ink/60">
          Nothing here yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center gap-4 rounded-card bg-paper p-4"
            >
              <div className="h-14 w-11 shrink-0 overflow-hidden rounded-md border border-ink/10 bg-cream">
                {VIDEO_EXT.test(item.media_url) ? (
                  <video src={item.media_url} className="h-full w-full object-cover" muted />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.media_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink/70">
                  {item.alt_text || "No alt text set"}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-pill px-3 py-1 text-xs font-medium ${
                  item.published
                    ? "bg-yellow-deep/40 text-ink"
                    : "bg-ink/10 text-ink/50"
                }`}
              >
                {item.published ? "Published" : "Draft"}
              </span>

              <div className="flex shrink-0 items-center gap-1">
                <form action={moveWorkGalleryItem.bind(null, item.id, category, "up")}>
                  <button
                    type="submit"
                    disabled={i === 0}
                    aria-label="Move up"
                    className="rounded-md border border-ink/15 px-2.5 py-2 text-sm disabled:opacity-30"
                  >
                    ↑
                  </button>
                </form>
                <form action={moveWorkGalleryItem.bind(null, item.id, category, "down")}>
                  <button
                    type="submit"
                    disabled={i === items.length - 1}
                    aria-label="Move down"
                    className="rounded-md border border-ink/15 px-2.5 py-2 text-sm disabled:opacity-30"
                  >
                    ↓
                  </button>
                </form>
                <Link
                  href={`/admin/work-gallery/${item.id}`}
                  className="rounded-md border border-ink/15 px-3 py-2 text-sm font-medium"
                >
                  Edit
                </Link>
                <form action={deleteWorkGalleryItem.bind(null, item.id)}>
                  <ConfirmSubmitButton
                    confirmMessage="Delete this item?"
                    className="rounded-md border border-burgundy/30 px-3 py-2 text-sm font-medium text-burgundy"
                  >
                    Delete
                  </ConfirmSubmitButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function WorkGalleryPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("work_gallery_items")
    .select("*")
    .order("sort_order", { ascending: true });

  const byCategory = (category: WorkGalleryCategory) =>
    (items ?? []).filter((item) => item.category === category);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-display text-display-md">All work page</h1>
        <p className="mt-1 text-ink/60">
          Manages the &ldquo;See all&rdquo; landing page linked from Featured
          Work, three galleries: Grids, Production, Direction.
        </p>
      </div>

      {CATEGORIES.map((cat) => (
        <CategorySection
          key={cat.value}
          category={cat.value}
          label={cat.label}
          items={byCategory(cat.value)}
        />
      ))}
    </div>
  );
}
