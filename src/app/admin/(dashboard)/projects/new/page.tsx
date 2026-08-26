import { ProjectForm } from "../project-form";

export default function NewProjectPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-display-md">Add project</h1>
        <p className="mt-1 text-ink/60">
          Create a new card for the work grid.
        </p>
      </div>
      <ProjectForm />
    </div>
  );
}
