"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LiveVisitors() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("site-presence");

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setCount(Object.keys(state).length);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="rounded-card bg-burgundy p-6 text-cream">
      <p className="text-sm font-semibold uppercase tracking-wide text-cream/60">
        Live on site right now
      </p>
      <p className="mt-2 font-display text-5xl">
        {count === null ? "…" : count}
      </p>
    </div>
  );
}
