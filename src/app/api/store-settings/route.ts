import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({
      payments_enabled: true,
      payments_disabled_message: "Online payments are temporarily paused for maintenance.",
    });
  }

  const supabase = createClient(supabaseUrl, anonKey);
  const { data, error } = await supabase
    .from("store_settings")
    .select("payments_enabled, payments_disabled_message, updated_at")
    .eq("id", "default")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({
      payments_enabled: true,
      payments_disabled_message: "Online payments are temporarily paused for maintenance.",
      updated_at: new Date().toISOString(),
    });
  }

  return NextResponse.json(
    {
      payments_enabled: data.payments_enabled ?? true,
      payments_disabled_message:
        data.payments_disabled_message ||
        "Online payments are temporarily paused for maintenance.",
      updated_at: data.updated_at,
    },
    {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    }
  );
}

