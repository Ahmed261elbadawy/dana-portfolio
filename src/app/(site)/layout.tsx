import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsappButton } from "@/components/whatsapp-button";
import { CustomCursor } from "@/components/custom-cursor";
import { ScrollWave } from "@/components/scroll-wave";
import { SiteTracker } from "@/components/site-tracker";
import { createClient } from "@/lib/supabase/server";
import { FALLBACK_WHATSAPP } from "@/lib/content";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("email, whatsapp")
    .limit(1)
    .maybeSingle();

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <div className="relative flex-1">
        <ScrollWave />
        {children}
      </div>
      <SiteFooter
        email={settings?.email ?? undefined}
        whatsapp={settings?.whatsapp ?? undefined}
      />
      <WhatsappButton whatsapp={settings?.whatsapp || FALLBACK_WHATSAPP} />
      <CustomCursor />
      <SiteTracker />
    </div>
  );
}
