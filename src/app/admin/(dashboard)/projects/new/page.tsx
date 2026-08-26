import { ProjectForm } from "../project-form";

// A video cover upload goes through server-side transcoding, which can
// take longer than the platform's default function timeout.
export const maxDuration = 60;

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
