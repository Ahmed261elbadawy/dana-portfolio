"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function getSessionId() {
  const key = "dana_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

export function SiteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const sessionId = getSessionId();

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, path: pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  useEffect(() => {
    const sessionId = getSessionId();
    const supabase = createClient();
    const channel = supabase.channel("site-presence", {
      config: { presence: { key: sessionId } },
    });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channel.track({ online_at: new Date().toISOString() });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
