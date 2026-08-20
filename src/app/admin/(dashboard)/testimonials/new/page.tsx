import { TestimonialForm } from "../testimonial-form";

export default function NewTestimonialPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-display-md">Add testimonial</h1>
        <p className="mt-1 text-ink/60">
          A quote for the feedback section on the homepage.
        </p>
      </div>
      <TestimonialForm />
    </div>
  );
}
