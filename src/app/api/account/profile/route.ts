/**
 * PATCH /api/account/profile
 *
 * Updates the authenticated customer's profile in public.profiles.
 * Uses the SSR client so the session cookie is read server-side.
 * Only allows updating full_name and phone — never the id.
 */

import { NextResponse } from "next/server";
import { getSupabaseSSRClient } from "@/lib/supabase/ssr-client";

const PHONE_RE = /^[+]?[\d\s\-().]{7,15}$/;

export async function PATCH(request: Request) {
  try {
    const supabase = await getSupabaseSSRClient();

    // Verify the caller is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { full_name, phone } = body as Record<string, unknown>;

    // Validate
    if (typeof full_name !== "string" || !full_name.trim()) {
      return NextResponse.json({ error: "full_name is required." }, { status: 400 });
    }
    if (phone !== null && phone !== undefined && phone !== "") {
      if (typeof phone !== "string" || !PHONE_RE.test(phone as string)) {
        return NextResponse.json({ error: "Invalid phone number." }, { status: 400 });
      }
    }

    const { error: updateError } = await (supabase as any)
      .from("profiles")
      .update({
        full_name: full_name.trim(),
        phone: (phone as string)?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id); // RLS also enforces this

    if (updateError) {
      console.error("[api/account/profile PATCH]", updateError.message);
      return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/account/profile PATCH] unhandled:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await getSupabaseSSRClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
    }

    const { data: profile, error: profileError } = await (supabase as any)
      .from("profiles")
      .select("id, full_name, phone, created_at, updated_at")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (err) {
    console.error("[api/account/profile GET] unhandled:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
