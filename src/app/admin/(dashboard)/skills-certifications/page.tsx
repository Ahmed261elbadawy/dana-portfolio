import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteSkill, moveSkill } from "./skills/actions";
import { deleteCertificate, moveCertificate } from "./certificates/actions";
import { ConfirmSubmitButton } from "./confirm-submit-button";

export default async function SkillsCertificationsPage() {
  const supabase = await createClient();
  const [{ data: skills }, { data: certificates }] = await Promise.all([
    supabase.from("skills").select("*").order("sort_order", { ascending: true }),
    supabase
      .from("certificates")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-display text-display-md">
          Skills &amp; certifications
        </h1>
        <p className="mt-1 text-ink/60">
          The skills grid and certificates shown before the testimonials
          section on the homepage.
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-xl">Skills &amp; tools</h2>
          <Link
            href="/admin/skills-certifications/skills/new"
            className="rounded-pill bg-burgundy px-5 py-2.5 text-sm font-semibold text-cream"
          >
            Add skill ↗
          </Link>
        </div>

        {!skills?.length ? (
          <p className="rounded-card bg-paper p-6 text-ink/60">
            No skills yet. Add your first one.
          </p>
        ) : (
          <ul className="space-y-3">
            {skills.map((skill, i) => (
              <li
                key={skill.id}
                className="flex flex-wrap items-center gap-4 rounded-card bg-paper p-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-ink/10 bg-cream p-1.5">
                  <Image
                    src={skill.icon_url}
                    alt=""
                    width={36}
                    height={36}
                    className="max-h-full max-w-full object-contain"
                    unoptimized
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{skill.name}</p>
                </div>

                <span
                  className={`shrink-0 rounded-pill px-3 py-1 text-xs font-medium ${
                    skill.published
                      ? "bg-yellow-deep/40 text-ink"
                      : "bg-ink/10 text-ink/50"
                  }`}
                >
                  {skill.published ? "Published" : "Draft"}
                </span>

                <div className="flex shrink-0 items-center gap-1">
                  <form action={moveSkill.bind(null, skill.id, "up")}>
                    <button
                      type="submit"
                      disabled={i === 0}
                      aria-label="Move up"
                      className="rounded-md border border-ink/15 px-2.5 py-2 text-sm disabled:opacity-30"
                    >
                      ↑
                    </button>
                  </form>
                  <form action={moveSkill.bind(null, skill.id, "down")}>
                    <button
                      type="submit"
                      disabled={i === skills.length - 1}
                      aria-label="Move down"
                      className="rounded-md border border-ink/15 px-2.5 py-2 text-sm disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </form>
                  <Link
                    href={`/admin/skills-certifications/skills/${skill.id}`}
                    className="rounded-md border border-ink/15 px-3 py-2 text-sm font-medium"
                  >
                    Edit
                  </Link>
                  <form action={deleteSkill.bind(null, skill.id)}>
                    <ConfirmSubmitButton
                      confirmMessage={`Delete ${skill.name}?`}
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
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-xl">Certificates</h2>
          <Link
            href="/admin/skills-certifications/certificates/new"
            className="rounded-pill bg-burgundy px-5 py-2.5 text-sm font-semibold text-cream"
          >
            Add certificate ↗
          </Link>
        </div>

        {!certificates?.length ? (
          <p className="rounded-card bg-paper p-6 text-ink/60">
            No certificates yet. Add your first one.
          </p>
        ) : (
          <ul className="space-y-3">
            {certificates.map((cert, i) => (
              <li
                key={cert.id}
                className="flex flex-wrap items-center gap-4 rounded-card bg-paper p-4"
              >
                <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md border border-ink/10 bg-cream">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cert.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{cert.title}</p>
                  <p className="truncate text-sm text-ink/50">
                    {cert.issuer || "No issuer set"}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-pill px-3 py-1 text-xs font-medium ${
                    cert.published
                      ? "bg-yellow-deep/40 text-ink"
                      : "bg-ink/10 text-ink/50"
                  }`}
                >
                  {cert.published ? "Published" : "Draft"}
                </span>

                <div className="flex shrink-0 items-center gap-1">
                  <form action={moveCertificate.bind(null, cert.id, "up")}>
                    <button
                      type="submit"
                      disabled={i === 0}
                      aria-label="Move up"
                      className="rounded-md border border-ink/15 px-2.5 py-2 text-sm disabled:opacity-30"
                    >
                      ↑
                    </button>
                  </form>
                  <form action={moveCertificate.bind(null, cert.id, "down")}>
                    <button
                      type="submit"
                      disabled={i === certificates.length - 1}
                      aria-label="Move down"
                      className="rounded-md border border-ink/15 px-2.5 py-2 text-sm disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </form>
                  <Link
                    href={`/admin/skills-certifications/certificates/${cert.id}`}
                    className="rounded-md border border-ink/15 px-3 py-2 text-sm font-medium"
                  >
                    Edit
                  </Link>
                  <form action={deleteCertificate.bind(null, cert.id)}>
                    <ConfirmSubmitButton
                      confirmMessage={`Delete ${cert.title}?`}
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
      </section>
    </div>
  );
}
