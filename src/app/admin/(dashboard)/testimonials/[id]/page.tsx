import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TestimonialForm } from "../testimonial-form";

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: testimonial } = await supabase
    .from("testimonials")
    .select("*")
    .eq("id", id)
    .single();

  if (!testimonial) notFound();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-display-md">Edit testimonial</h1>
        <p className="mt-1 text-ink/60">{testimonial.author}</p>
      </div>
      <TestimonialForm testimonial={testimonial} />
    </div>
  );
}
