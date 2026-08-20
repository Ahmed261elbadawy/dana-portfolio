import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminHomePage() {
  const supabase = await createClient();

  const [
    { count: projectCount },
    { count: publishedCount },
    { count: testimonialCount },
    { count: unreadCount },
  ] = await Promise.all([
    supabase.from("brands").select("*", { count: "exact", head: true }),
    supabase
      .from("brands")
      .select("*", { count: "exact", head: true })
      .eq("published", true),
    supabase.from("testimonials").select("*", { count: "exact", head: true }),
    supabase
      .from("inquiries")
      .select("*", { count: "exact", head: true })
      .eq("read", false),
  ]);

  const stats = [
    {
      label: "New inquiries",
      value: unreadCount ?? 0,
      href: "/admin/inquiries",
    },
    { label: "Projects", value: projectCount ?? 0, href: "/admin/projects" },
    { label: "Published", value: publishedCount ?? 0, href: "/admin/projects" },
    {
      label: "Testimonials",
      value: testimonialCount ?? 0,
      href: "/admin/testimonials",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-display-md">Overview</h1>
        <p className="mt-1 text-ink/60">
          Add project work, write case studies, and manage what&apos;s live
          on the site.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-card bg-paper p-5 transition-shadow hover:shadow-md"
          >
            <p className="text-3xl font-semibold">{s.value}</p>
            <p className="text-sm text-ink/60">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-card-lg bg-pink p-6">
        <h2 className="font-display text-xl">Start here</h2>
        <p className="mt-1 max-w-prose text-ink/70">
          Add a project, then attach a case study with media and outcome
          metrics. Nothing shows on the public site until you flip it to
          published.
        </p>
        <Link
          href="/admin/projects/new"
          className="mt-4 inline-block rounded-pill bg-burgundy px-6 py-3 text-sm font-semibold text-cream"
        >
          Add a project ↗
        </Link>
      </div>
    </div>
  );
}
