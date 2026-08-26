import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/admin/actions";
import { InstallAppButton } from "@/components/admin/install-app-button";

const navItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/work-gallery", label: "All work page" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/brand-logos", label: "Brand logos" },
  { href: "/admin/skills-certifications", label: "Skills & certifications" },
  { href: "/admin/settings", label: "Site settings" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-cream lg:flex-row">
      <aside className="flex shrink-0 flex-col gap-6 border-b border-ink/10 bg-paper p-5 lg:w-64 lg:border-b-0 lg:border-r lg:p-6">
        <div>
          <p className="font-wordmark text-lg">Dana Badawy</p>
          <p className="text-xs text-ink/50">Admin dashboard</p>
        </div>

        <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-md px-3 py-2.5 text-sm font-medium text-ink/70 transition-colors hover:bg-cream hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-2 pt-4 lg:pt-0">
          <InstallAppButton />
          <p className="truncate text-xs text-ink/50">{user?.email}</p>
          <form action={signOut}>
            <button
              type="submit"
              className="w-full rounded-md border border-ink/15 px-3 py-2.5 text-left text-sm font-medium text-ink/70 transition-colors hover:bg-cream"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-5 sm:p-8">{children}</main>
    </div>
  );
}
