/**
 * GET /auth/callback
 *
 * Supabase redirects the user here after:
 *  - Email confirmation (if enabled)
 *  - Password reset email links
 *  - OAuth sign-ins (future)
 *
 * The ?code param is exchanged for a session cookie. The user is then
 * redirected to the intended page (or /account/dashboard by default).
 */

import { NextResponse } from "next/server";
import { getSupabaseSSRClient } from "@/lib/supabase/ssr-client";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account/dashboard";
  const type = searchParams.get("type"); // 'recovery' for password resets

  if (code) {
    const supabase = await getSupabaseSSRClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // For password recovery links, always go to the reset-password page
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/account/reset-password`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("[auth/callback] Code exchange error:", error.message);
  }

  // Something went wrong — redirect to login with an error hint
  return NextResponse.redirect(`${origin}/account/login?error=auth_callback_failed`);
}
