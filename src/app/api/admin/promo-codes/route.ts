/**
 * GET  /api/admin/promo-codes — list all promo codes
 * POST /api/admin/promo-codes — create a new promo code
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

function authGuard(_request: NextRequest) {
  return getSupabaseServiceClient();
}

export async function GET(request: NextRequest) {
  try {
    const supabase = authGuard(request);

    const { data, error } = await (supabase as any)
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ codes: data ?? [] });
  } catch (err) {
    console.error("[admin/promo-codes GET]", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = authGuard(request);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const {
      code,
      discount_type,
      discount_value,
      max_discount_cap,
      min_order_value,
      usage_limit_total,
      usage_limit_per_user,
      applies_to,
      applies_to_ids,
      starts_at,
      expires_at,
      is_active,
      show_in_banner,
      description,
    } = body as Record<string, unknown>;

    // Validation
    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ error: "Code is required." }, { status: 400 });
    }
    if (discount_type !== "percentage" && discount_type !== "flat") {
      return NextResponse.json({ error: "discount_type must be 'percentage' or 'flat'." }, { status: 400 });
    }
    const discountVal = Number(discount_value);
    if (!Number.isFinite(discountVal) || discountVal <= 0) {
      return NextResponse.json({ error: "discount_value must be a positive number." }, { status: 400 });
    }
    const validScopes = ["all", "category", "product", "combo"];
    const scope = (applies_to as string) ?? "all";
    if (!validScopes.includes(scope)) {
      return NextResponse.json({ error: "Invalid applies_to value." }, { status: 400 });
    }

    // Normalize applies_to_ids — always an array of strings
    const idsArray: string[] = Array.isArray(applies_to_ids)
      ? (applies_to_ids as unknown[]).map(String).filter(Boolean)
      : [];

    const UUID_REGEX =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const firstId = idsArray.length > 0 ? idsArray[0] : null;
    const legacyAppliesToId = firstId && UUID_REGEX.test(firstId) ? firstId : null;

    const payload = {
      code: code.trim().toUpperCase(),
      discount_type: discount_type as "percentage" | "flat",
      discount_value: discountVal,
      max_discount_cap: max_discount_cap != null ? Number(max_discount_cap) : null,
      min_order_value: min_order_value != null ? Number(min_order_value) : 0,
      usage_limit_total: usage_limit_total != null ? Number(usage_limit_total) : null,
      usage_limit_per_user: usage_limit_per_user != null ? Number(usage_limit_per_user) : null,
      applies_to: scope,
      // Only set legacy applies_to_id if the value is a valid UUID (not a category slug)
      applies_to_id: legacyAppliesToId,
      applies_to_ids: idsArray,
      starts_at: starts_at ? String(starts_at) : null,
      expires_at: expires_at ? String(expires_at) : null,
      is_active: is_active !== false,
      show_in_banner: show_in_banner === true,
      description: description ? String(description) : null,
    };

    const { data, error } = await (supabase as any)
      .from("promo_codes")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: `Code "${payload.code}" already exists. Use a different code.` },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ code: data }, { status: 201 });
  } catch (err) {
    console.error("[admin/promo-codes POST]", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
