/**
 * GET /auth/callback
 *
 * Supabase redirects the user here after:
 *  - Google OAuth sign-in / sign-up
 *  - Email confirmation (if enabled)
 *  - Password reset email links
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
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle provider / OAuth errors (e.g. user cancelled)
  if (error) {
    console.error("[auth/callback] OAuth provider error:", error, errorDescription);
    const msg = encodeURIComponent(errorDescription || error);
    return NextResponse.redirect(`${origin}/account/login?error=${msg}`);
  }

  if (code) {
    const supabase = await getSupabaseSSRClient();
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // For password recovery links, always go to the reset-password page
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/account/reset-password`);
      }

      // Ensure customer profile row exists in public.profiles (e.g., for Google OAuth users)
      const user = data?.user ?? (await supabase.auth.getUser()).data.user;
      if (user) {
        const fullName =
          (user.user_metadata?.full_name as string | undefined) ||
          (user.user_metadata?.name as string | undefined) ||
          (user.user_metadata?.user_name as string | undefined) ||
          "";

        try {
          const client = supabase as any;
          const { data: existingProfile } = await client
            .from("profiles")
            .select("id, full_name")
            .eq("id", user.id)
            .maybeSingle();

          if (!existingProfile) {
            await client.from("profiles").insert({
              id: user.id,
              full_name: fullName,
            });
          } else if (!existingProfile.full_name && fullName) {
            await client
              .from("profiles")
              .update({ full_name: fullName })
              .eq("id", user.id);
          }
        } catch (profileErr) {
          console.error("[auth/callback] Error syncing customer profile:", profileErr);
        }
      }

      // Safe redirect target (prevent open redirect vulnerabilities)
      const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account/dashboard";
      return NextResponse.redirect(`${origin}${safeNext}`);
    }

    console.error("[auth/callback] Code exchange error:", exchangeError.message);
  }

  // Something went wrong — redirect to login with a friendly error hint
  return NextResponse.redirect(`${origin}/account/login?error=auth_callback_failed`);
}
