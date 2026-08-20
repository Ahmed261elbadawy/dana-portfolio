import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-display-md">Site settings</h1>
        <p className="mt-1 text-ink/60">
          Global content, bio, contact details, and the homepage intro.
        </p>
      </div>
      <SettingsForm settings={settings ?? undefined} />
    </div>
  );
}
