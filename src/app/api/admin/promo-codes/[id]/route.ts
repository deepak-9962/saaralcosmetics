/**
 * GET    /api/admin/promo-codes/[id] — fetch a single promo code
 * PATCH  /api/admin/promo-codes/[id] — update a promo code
 * DELETE /api/admin/promo-codes/[id] — delete or deactivate a promo code
 *
 * DELETE behaviour:
 *   - times_used === 0 → hard delete
 *   - times_used  > 0 → soft deactivate (is_active = false), returns 200 with
 *     { deactivated: true } so the UI can show the correct toast
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await (supabase as any)
    .from("promo_codes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found." }, { status: 404 });

  return NextResponse.json({ code: data });
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();

  // Sanitise incoming fields — only allow known columns
  const allowed = [
    "code", "discount_type", "discount_value", "max_discount_cap",
    "min_order_value", "usage_limit_total", "usage_limit_per_user",
    "applies_to", "applies_to_id", "starts_at", "expires_at",
    "is_active", "show_in_banner", "description",
  ] as const;

  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if ((body as Record<string, unknown>)[key] !== undefined) {
      patch[key] = (body as Record<string, unknown>)[key];
    }
  }
  // Always uppercase code if provided
  if (typeof patch.code === "string") {
    patch.code = patch.code.trim().toUpperCase();
  }

  const { data, error } = await (supabase as any)
    .from("promo_codes")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: `Code "${patch.code}" already exists.` },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ code: data });
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();

  // Fetch current times_used
  const { data: existing, error: fetchError } = await (supabase as any)
    .from("promo_codes")
    .select("id, times_used")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  if (existing.times_used > 0) {
    // Soft deactivate — preserve order history
    const { error: deactivateError } = await (supabase as any)
      .from("promo_codes")
      .update({ is_active: false })
      .eq("id", id);

    if (deactivateError) {
      return NextResponse.json({ error: deactivateError.message }, { status: 500 });
    }
    return NextResponse.json({
      deactivated: true,
      message:
        "This code has order history and cannot be permanently deleted. It has been deactivated instead.",
    });
  }

  // Hard delete — no order history
  const { error: deleteError } = await (supabase as any)
    .from("promo_codes")
    .delete()
    .eq("id", id);

  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  return NextResponse.json({ deleted: true });
}
