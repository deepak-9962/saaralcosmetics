/**
 * GET  /api/admin/purchase-limits — list all purchase limit rules
 * POST /api/admin/purchase-limits — create a new purchase limit rule
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServiceClient();

    const { searchParams } = new URL(request.url);
    const restrictionType = searchParams.get("type");
    const period = searchParams.get("period");
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim().toLowerCase();

    let query = (supabase as any)
      .from("purchase_limits")
      .select("*")
      .order("created_at", { ascending: false });

    if (restrictionType && restrictionType !== "all_types") {
      query = query.eq("restriction_type", restrictionType);
    }
    if (period && period !== "all_periods") {
      query = query.eq("period", period);
    }
    if (status === "active") {
      query = query.eq("is_active", true);
    } else if (status === "inactive") {
      query = query.eq("is_active", false);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let rules = data ?? [];

    if (search) {
      rules = rules.filter((r: any) =>
        r.name?.toLowerCase().includes(search) ||
        r.description?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ rules });
  } catch (err) {
    console.error("[admin/purchase-limits GET]", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServiceClient();

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const {
      name,
      description,
      restriction_type,
      target_ids,
      max_quantity,
      period,
      starts_at,
      expires_at,
      is_active,
    } = body;

    // Validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Rule name is required." }, { status: 400 });
    }

    const validTypes = ["all", "category", "product", "combo"];
    if (!validTypes.includes(restriction_type)) {
      return NextResponse.json({ error: "Invalid restriction_type." }, { status: 400 });
    }

    const maxQty = Number(max_quantity);
    if (!Number.isFinite(maxQty) || maxQty <= 0) {
      return NextResponse.json({ error: "Maximum purchase quantity must be a positive number." }, { status: 400 });
    }

    const validPeriods = ["per_order", "daily", "weekly", "monthly", "lifetime"];
    if (!validPeriods.includes(period)) {
      return NextResponse.json({ error: "Invalid limit period." }, { status: 400 });
    }

    const targetsArray: string[] = Array.isArray(target_ids)
      ? target_ids.map(String).filter(Boolean)
      : [];

    if (restriction_type !== "all" && targetsArray.length === 0 && restriction_type !== "combo") {
      return NextResponse.json(
        { error: `Please select at least one item for ${restriction_type} restriction.` },
        { status: 400 }
      );
    }

    const payload = {
      name: name.trim(),
      description: description ? String(description).trim() : null,
      restriction_type,
      target_ids: targetsArray,
      max_quantity: Math.floor(maxQty),
      period,
      starts_at: starts_at ? new Date(starts_at).toISOString() : null,
      expires_at: expires_at ? new Date(expires_at).toISOString() : null,
      is_active: is_active !== false,
    };

    const { data, error } = await (supabase as any)
      .from("purchase_limits")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rule: data }, { status: 201 });
  } catch (err) {
    console.error("[admin/purchase-limits POST]", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
