import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Server configuration missing." }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Server configuration missing." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof body.payments_enabled === "boolean") {
      updatePayload.payments_enabled = body.payments_enabled;
    }
    if (typeof body.payments_disabled_message === "string") {
      updatePayload.payments_disabled_message = body.payments_disabled_message.trim();
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data, error } = await supabase
      .from("store_settings")
      .update(updatePayload)
      .eq("id", "default")
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update store settings" },
      { status: 500 }
    );
  }
}

