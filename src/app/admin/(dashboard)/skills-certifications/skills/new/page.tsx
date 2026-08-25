import { SkillForm } from "../skill-form";

export default function NewSkillPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-display-md">Add skill</h1>
        <p className="mt-1 text-ink/60">
          Shown in the skills grid on the homepage.
        </p>
      </div>
      <SkillForm />
    </div>
  );
}
