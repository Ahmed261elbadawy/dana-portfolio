import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SkillForm } from "../skill-form";

export default async function EditSkillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: skill } = await supabase
    .from("skills")
    .select("*")
    .eq("id", id)
    .single();

  if (!skill) notFound();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-display-md">Edit skill</h1>
        <p className="mt-1 text-ink/60">{skill.name}</p>
      </div>
      <SkillForm skill={skill} />
    </div>
  );
}
