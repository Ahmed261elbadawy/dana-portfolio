import { WorkGalleryForm } from "../work-gallery-form";
import type { WorkGalleryCategory } from "@/lib/types/database";

export default async function NewWorkGalleryItemPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const defaultCategory = ["grids", "production", "direction"].includes(
    category ?? "",
  )
    ? (category as WorkGalleryCategory)
    : undefined;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-display-md">Add work item</h1>
        <p className="mt-1 text-ink/60">
          Shown on the &ldquo;All work&rdquo; page.
        </p>
      </div>
      <WorkGalleryForm defaultCategory={defaultCategory} />
    </div>
  );
}
