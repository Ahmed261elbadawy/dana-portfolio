import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { WorkGalleryCategory } from "@/lib/types/database";
import { MediaGrid } from "./media-grid";

export const revalidate = 60;

const SECTIONS: {
  category: WorkGalleryCategory;
  kicker: string;
  title: string;
  theme: "dark" | "light" | "tint";
}[] = [
  { category: "grids", kicker: "01", title: "Grids", theme: "light" },
  { category: "production", kicker: "02", title: "Production", theme: "dark" },
  { category: "direction", kicker: "03", title: "Direction", theme: "tint" },
];

const THEME_CLASSES: Record<string, string> = {
  dark: "bg-burgundy text-cream",
  light: "bg-cream text-ink",
  tint: "bg-pink text-ink",
};

export default async function AllWorkPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("work_gallery_items")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });

  const byCategory = (category: WorkGalleryCategory) =>
    (items ?? []).filter((item) => item.category === category);

  return (
    <article>
      {/* Header */}
      <header
        data-nav-theme="dark"
        className="bg-burgundy px-5 pb-14 pt-28 text-cream sm:px-8 sm:pb-20 sm:pt-32 lg:px-16"
      >
        <Link
          href="/#work"
          className="text-sm text-cream/60 underline underline-offset-4"
        >
          ← Back to home
        </Link>
        <h1 className="mt-6 font-display text-4xl italic leading-[0.95] sm:text-6xl lg:text-7xl">
          Every project, <span className="not-italic">every angle.</span>
        </h1>
      </header>

      {SECTIONS.map(({ category, kicker, title, theme }) => {
        const sectionItems = byCategory(category);
        if (sectionItems.length === 0) return null;

        return (
          <section
            key={category}
            data-nav-theme={theme === "dark" ? "dark" : "light"}
            className={`px-5 py-14 sm:px-8 sm:py-20 lg:px-16 ${THEME_CLASSES[theme]}`}
          >
            <div className="mx-auto max-w-6xl">
              <div className="mb-8 flex items-baseline gap-4">
                <span
                  className={`font-display text-3xl italic ${
                    theme === "dark" ? "text-cream/30" : "text-ink/25"
                  }`}
                >
                  {kicker}
                </span>
                <h2 className="font-display text-display-md">{title}</h2>
              </div>

              <MediaGrid items={sectionItems} theme={theme} />
            </div>
          </section>
        );
      })}

      {!items?.length && (
        <div className="bg-cream px-5 py-24 text-center text-ink/50">
          More work is on its way, check back soon.
        </div>
      )}
    </article>
  );
}
