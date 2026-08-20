import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteTestimonial, moveTestimonial } from "./actions";
import { ConfirmSubmitButton } from "./confirm-submit-button";

export default async function TestimonialsPage() {
  const supabase = await createClient();
  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-display-md">Testimonials</h1>
          <p className="mt-1 text-ink/60">
            Quotes shown in the feedback section on the homepage.
          </p>
        </div>
        <Link
          href="/admin/testimonials/new"
          className="rounded-pill bg-burgundy px-6 py-3 text-sm font-semibold text-cream"
        >
          Add testimonial ↗
        </Link>
      </div>

      {!testimonials?.length ? (
        <p className="rounded-card bg-paper p-6 text-ink/60">
          No testimonials yet. Add your first one.
        </p>
      ) : (
        <ul className="space-y-3">
          {testimonials.map((t, i) => (
            <li
              key={t.id}
              className="flex flex-wrap items-center gap-4 rounded-card bg-paper p-4"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-ink/10 bg-cream">
                {t.avatar_url ? (
                  <Image
                    src={t.avatar_url}
                    alt=""
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-sm text-ink/30">
                    {t.author.charAt(0)}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{t.author}</p>
                <p className="truncate text-sm text-ink/50">
                  {[t.role, t.brand].filter(Boolean).join(" · ") || "No role or brand set"}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-pill px-3 py-1 text-xs font-medium ${
                  t.published
                    ? "bg-yellow-deep/40 text-ink"
                    : "bg-ink/10 text-ink/50"
                }`}
              >
                {t.published ? "Published" : "Draft"}
              </span>

              <div className="flex shrink-0 items-center gap-1">
                <form action={moveTestimonial.bind(null, t.id, "up")}>
                  <button
                    type="submit"
                    disabled={i === 0}
                    aria-label="Move up"
                    className="rounded-md border border-ink/15 px-2.5 py-2 text-sm disabled:opacity-30"
                  >
                    ↑
                  </button>
                </form>
                <form action={moveTestimonial.bind(null, t.id, "down")}>
                  <button
                    type="submit"
                    disabled={i === testimonials.length - 1}
                    aria-label="Move down"
                    className="rounded-md border border-ink/15 px-2.5 py-2 text-sm disabled:opacity-30"
                  >
                    ↓
                  </button>
                </form>
                <Link
                  href={`/admin/testimonials/${t.id}`}
                  className="rounded-md border border-ink/15 px-3 py-2 text-sm font-medium"
                >
                  Edit
                </Link>
                <form action={deleteTestimonial.bind(null, t.id)}>
                  <ConfirmSubmitButton
                    confirmMessage={`Delete this testimonial from ${t.author}?`}
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
    </div>
  );
}
