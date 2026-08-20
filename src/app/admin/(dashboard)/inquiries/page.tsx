import { createClient } from "@/lib/supabase/server";
import { deleteInquiry, markRead } from "./actions";
import { SERVICE_LABELS } from "@/lib/content";

export default async function InquiriesPage() {
  const supabase = await createClient();
  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-display-md">Inquiries</h1>
        <p className="mt-1 text-ink/60">
          Submissions from the contact form on the site.
        </p>
      </div>

      {!inquiries?.length ? (
        <p className="rounded-card bg-paper p-6 text-ink/60">
          No inquiries yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {inquiries.map((inquiry) => (
            <li
              key={inquiry.id}
              className={`rounded-card p-5 ${
                inquiry.read ? "bg-paper" : "bg-yellow-deep/20"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{inquiry.name}</p>
                  <a
                    href={`mailto:${inquiry.email}`}
                    className="text-sm text-burgundy underline"
                  >
                    {inquiry.email}
                  </a>
                  {inquiry.phone && (
                    <p className="text-sm text-ink/50">{inquiry.phone}</p>
                  )}
                </div>
                <p className="text-xs text-ink/40">
                  {new Date(inquiry.created_at).toLocaleDateString()}
                </p>
              </div>

              {inquiry.services?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {inquiry.services.map((s) => (
                    <span
                      key={s}
                      className="rounded-pill bg-cream px-2.5 py-1 text-xs font-medium text-ink/60"
                    >
                      {SERVICE_LABELS[s] ?? s}
                    </span>
                  ))}
                </div>
              )}

              {inquiry.message && (
                <p className="mt-3 text-sm text-ink/70">{inquiry.message}</p>
              )}

              <div className="mt-4 flex gap-2">
                <form action={markRead.bind(null, inquiry.id, !inquiry.read)}>
                  <button
                    type="submit"
                    className="rounded-md border border-ink/15 px-3 py-2 text-sm font-medium"
                  >
                    {inquiry.read ? "Mark unread" : "Mark read"}
                  </button>
                </form>
                <form action={deleteInquiry.bind(null, inquiry.id)}>
                  <button
                    type="submit"
                    className="rounded-md border border-burgundy/30 px-3 py-2 text-sm font-medium text-burgundy"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
