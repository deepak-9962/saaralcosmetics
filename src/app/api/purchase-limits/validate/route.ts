import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { validatePurchaseLimits } from "@/lib/purchaseLimits";

export async function POST(request: NextRequest) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { items, userId: rawUserId } = body || {};

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "items array is required" }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();

    // Resolve authenticated user id from header if present, fallback to rawUserId
    let resolvedUserId: string | null = rawUserId || null;
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      if (user?.id) {
        resolvedUserId = user.id;
      }
    }

    const validation = await validatePurchaseLimits(supabase, {
      items: items.map((i: any) => ({
        productId: String(i.productId || i.product_id),
        quantity: Math.max(1, Number(i.quantity || i.qty || 1)),
      })),
      userId: resolvedUserId,
    });

    return NextResponse.json(validation);
  } catch (error) {
    console.error("[api/purchase-limits/validate] Error:", error);
    return NextResponse.json(
      { valid: true, limits: {}, errors: ["Failed to validate purchase limits."] },
      { status: 500 }
    );
  }
}
