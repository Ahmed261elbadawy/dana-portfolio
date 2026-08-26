import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkGalleryForm } from "../work-gallery-form";

export default async function EditWorkGalleryItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: item } = await supabase
    .from("work_gallery_items")
    .select("*")
    .eq("id", id)
    .single();

  if (!item) notFound();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-display-md">Edit work item</h1>
        <p className="mt-1 text-ink/60 capitalize">{item.category}</p>
      </div>
      <WorkGalleryForm item={item} />
    </div>
  );
}
