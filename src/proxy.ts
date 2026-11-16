import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Only the admin area needs a session check/refresh. This used to run on
// every request to the whole site, so each public page view waited on a
// Supabase auth round-trip — and one slow moment at Supabase surfaced as a
// site-wide 504 (MIDDLEWARE_INVOCATION_TIMEOUT). Public pages never use the
// session, so they now skip this entirely.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
