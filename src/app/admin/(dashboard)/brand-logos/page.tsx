import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteBrandLogo, moveBrandLogo } from "./actions";
import { ConfirmSubmitButton } from "./confirm-submit-button";

export default async function BrandLogosPage() {
  const supabase = await createClient();
  const { data: logos } = await supabase
    .from("brand_logos")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-display-md">Brand logos</h1>
          <p className="mt-1 text-ink/60">
            The &ldquo;Brands I&apos;ve worked with&rdquo; grid on the
            homepage.
          </p>
        </div>
        <Link
          href="/admin/brand-logos/new"
          className="rounded-pill bg-burgundy px-6 py-3 text-sm font-semibold text-cream"
        >
          Add logo ↗
        </Link>
      </div>

      {!logos?.length ? (
        <p className="rounded-card bg-paper p-6 text-ink/60">
          No brand logos yet. Add your first one.
        </p>
      ) : (
        <ul className="space-y-3">
          {logos.map((logo, i) => (
            <li
              key={logo.id}
              className="flex flex-wrap items-center gap-4 rounded-card bg-paper p-4"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-ink/10 bg-cream p-1.5">
                <Image
                  src={logo.logo_url}
                  alt=""
                  width={36}
                  height={36}
                  className="max-h-full max-w-full object-contain"
                  unoptimized
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{logo.name}</p>
                <p className="truncate text-sm text-ink/50">
                  {logo.category || "No category set"}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-pill px-3 py-1 text-xs font-medium ${
                  logo.published
                    ? "bg-yellow-deep/40 text-ink"
                    : "bg-ink/10 text-ink/50"
                }`}
              >
                {logo.published ? "Published" : "Draft"}
              </span>

              <div className="flex shrink-0 items-center gap-1">
                <form action={moveBrandLogo.bind(null, logo.id, "up")}>
                  <button
                    type="submit"
                    disabled={i === 0}
                    aria-label="Move up"
                    className="rounded-md border border-ink/15 px-2.5 py-2 text-sm disabled:opacity-30"
                  >
                    ↑
                  </button>
                </form>
                <form action={moveBrandLogo.bind(null, logo.id, "down")}>
                  <button
                    type="submit"
                    disabled={i === logos.length - 1}
                    aria-label="Move down"
                    className="rounded-md border border-ink/15 px-2.5 py-2 text-sm disabled:opacity-30"
                  >
                    ↓
                  </button>
                </form>
                <Link
                  href={`/admin/brand-logos/${logo.id}`}
                  className="rounded-md border border-ink/15 px-3 py-2 text-sm font-medium"
                >
                  Edit
                </Link>
                <form action={deleteBrandLogo.bind(null, logo.id)}>
                  <ConfirmSubmitButton
                    confirmMessage={`Delete ${logo.name}?`}
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
