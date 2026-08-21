import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LiveVisitors } from "@/components/admin/live-visitors";

export const dynamic = "force-dynamic";

function startOfDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

export default async function AdminHomePage() {
  const supabase = await createClient();

  const since30d = startOfDaysAgo(30);

  const [
    { count: projectCount },
    { count: publishedCount },
    { count: testimonialCount },
    { data: viewRows },
  ] = await Promise.all([
    supabase.from("brands").select("*", { count: "exact", head: true }),
    supabase
      .from("brands")
      .select("*", { count: "exact", head: true })
      .eq("published", true),
    supabase.from("testimonials").select("*", { count: "exact", head: true }),
    supabase
      .from("page_views")
      .select("session_id, path, created_at")
      .gte("created_at", since30d.toISOString()),
  ]);

  const stats = [
    { label: "Projects", value: projectCount ?? 0, href: "/admin/projects" },
    { label: "Published", value: publishedCount ?? 0, href: "/admin/projects" },
    {
      label: "Testimonials",
      value: testimonialCount ?? 0,
      href: "/admin/testimonials",
    },
  ];

  const views = viewRows ?? [];
  const now = Date.now();
  const windows = [
    { label: "Last 24 hours", ms: 24 * 60 * 60 * 1000 },
    { label: "Last 7 days", ms: 7 * 24 * 60 * 60 * 1000 },
    { label: "Last 30 days", ms: 30 * 24 * 60 * 60 * 1000 },
  ];

  const viewStats = windows.map(({ label, ms }) => {
    const inWindow = views.filter(
      (v) => now - new Date(v.created_at).getTime() <= ms,
    );
    const uniqueSessions = new Set(inWindow.map((v) => v.session_id)).size;
    return { label, visitors: uniqueSessions, views: inWindow.length };
  });

  const pathCounts = new Map<string, number>();
  for (const v of views) {
    pathCounts.set(v.path, (pathCounts.get(v.path) ?? 0) + 1);
  }
  const topPaths = [...pathCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const dayBuckets = new Map<string, Set<string>>();
  for (const v of views) {
    const day = new Date(v.created_at).toISOString().slice(0, 10);
    if (!dayBuckets.has(day)) dayBuckets.set(day, new Set());
    dayBuckets.get(day)!.add(v.session_id);
  }
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = startOfDaysAgo(13 - i);
    const key = d.toISOString().slice(0, 10);
    return { day: key, visitors: dayBuckets.get(key)?.size ?? 0 };
  });
  const maxDayVisitors = Math.max(1, ...last14.map((d) => d.visitors));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-display-md">Overview</h1>
        <p className="mt-1 text-ink/60">
          Add project work, write case studies, and manage what&apos;s live
          on the site.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

      <div className="space-y-4">
        <h2 className="font-display text-xl">Analytics</h2>

        <LiveVisitors />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {viewStats.map((s) => (
            <div key={s.label} className="rounded-card bg-paper p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-ink/50">
                {s.label}
              </p>
              <p className="mt-2 font-display text-3xl text-burgundy">
                {s.visitors}
              </p>
              <p className="text-sm text-ink/60">
                visitors · {s.views} pageviews
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-card bg-paper p-5">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/50">
            Visitors per day (last 14 days)
          </p>
          <div className="flex h-32 items-end gap-1.5">
            {last14.map((d) => (
              <div
                key={d.day}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <div
                  className="w-full rounded-t-sm bg-burgundy"
                  style={{
                    height: `${(d.visitors / maxDayVisitors) * 100}%`,
                    minHeight: d.visitors > 0 ? "4px" : "0px",
                  }}
                />
                <span className="text-[10px] text-ink/40">
                  {d.day.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-card bg-paper p-5">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/50">
            Top pages (last 30 days)
          </p>
          {topPaths.length === 0 ? (
            <p className="text-sm text-ink/50">No pageviews recorded yet.</p>
          ) : (
            <ul className="space-y-2">
              {topPaths.map(([path, count]) => (
                <li
                  key={path}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-ink/80">{path}</span>
                  <span className="font-semibold text-ink/50">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
