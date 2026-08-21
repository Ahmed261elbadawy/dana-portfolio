import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const sessionId = typeof body?.sessionId === "string" ? body.sessionId : null;
  const path = typeof body?.path === "string" ? body.path : null;

  if (!sessionId || !path) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const supabase = await createClient();
  await supabase.from("page_views").insert({ session_id: sessionId, path });

  return NextResponse.json({ ok: true });
}
