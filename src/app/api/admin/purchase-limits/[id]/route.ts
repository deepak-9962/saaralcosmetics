/**
 * GET    /api/admin/purchase-limits/[id] — fetch single rule
 * PATCH  /api/admin/purchase-limits/[id] — update rule
 * DELETE /api/admin/purchase-limits/[id] — delete rule
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Invalid rule id." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await (supabase as any)
    .from("purchase_limits")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Rule not found." }, { status: 404 });

  return NextResponse.json({ rule: data });
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Invalid rule id." }, { status: 400 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();

  const allowed = [
    "name",
    "description",
    "restriction_type",
    "target_ids",
    "max_quantity",
    "period",
    "starts_at",
    "expires_at",
    "is_active",
  ] as const;

  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      patch[key] = body[key];
    }
  }

  if (patch.name !== undefined) {
    if (typeof patch.name !== "string" || !patch.name.trim()) {
      return NextResponse.json({ error: "Rule name cannot be empty." }, { status: 400 });
    }
    patch.name = patch.name.trim();
  }

  if (patch.max_quantity !== undefined) {
    const qty = Number(patch.max_quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return NextResponse.json({ error: "Maximum purchase quantity must be a positive integer." }, { status: 400 });
    }
    patch.max_quantity = Math.floor(qty);
  }

  if (patch.target_ids !== undefined) {
    patch.target_ids = Array.isArray(patch.target_ids)
      ? patch.target_ids.map(String).filter(Boolean)
      : [];
  }

  if (patch.starts_at !== undefined) {
    patch.starts_at = patch.starts_at ? new Date(patch.starts_at as string).toISOString() : null;
  }

  if (patch.expires_at !== undefined) {
    patch.expires_at = patch.expires_at ? new Date(patch.expires_at as string).toISOString() : null;
  }

  const { data, error } = await (supabase as any)
    .from("purchase_limits")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ rule: data });
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Invalid rule id." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await (supabase as any)
    .from("purchase_limits")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, deleted: true });
}
