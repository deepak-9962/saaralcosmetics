import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import {
  isRuleCurrentlyActive,
  getPeriodStartTime,
  doesRuleApplyToProduct,
  calculateResetDate,
  type TargetProductMeta,
} from "@/lib/purchaseLimits";
import type {
  PurchaseLimitRule,
  CustomerPurchaseLimitUsage,
} from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServiceClient();
    const { searchParams } = new URL(request.url);
    const limitReachedOnly = searchParams.get("reached") === "true";
    const ruleFilter = searchParams.get("rule_id");
    const search = searchParams.get("search")?.trim().toLowerCase();

    // 1. Fetch active rules
    let rulesQuery = (supabase as any)
      .from("purchase_limits")
      .select("*")
      .eq("is_active", true);

    if (ruleFilter) {
      rulesQuery = rulesQuery.eq("id", ruleFilter);
    }

    const { data: rulesData, error: rulesError } = await rulesQuery;
    if (rulesError) {
      return NextResponse.json({ error: rulesError.message }, { status: 500 });
    }

    const now = new Date();
    const activeRules: PurchaseLimitRule[] = (rulesData ?? []).filter((r: any) =>
      isRuleCurrentlyActive(r, now)
    );

    if (activeRules.length === 0) {
      return NextResponse.json({ usages: [] });
    }

    // 2. Fetch products & categories for name resolution
    const [productsRes, categoriesRes, combosRes] = await Promise.all([
      (supabase as any).from("products").select("id, name, slug, category, category_id"),
      (supabase as any).from("categories").select("id, name, slug"),
      (supabase as any).from("combos").select("id, name, slug"),
    ]);

    const productMap = new Map<string, TargetProductMeta>();
    const productNameMap = new Map<string, string>();
    (productsRes.data ?? []).forEach((p: any) => {
      productMap.set(p.id, {
        id: p.id,
        name: p.name,
        category: p.category,
        category_id: p.category_id,
        is_combo: p.category === "combos" || p.slug?.includes("combo"),
      });
      productNameMap.set(p.id, p.name);
    });

    const categoryNameMap = new Map<string, string>();
    (categoriesRes.data ?? []).forEach((c: any) => {
      categoryNameMap.set(c.slug, c.name);
      categoryNameMap.set(c.id, c.name);
    });

    (combosRes.data ?? []).forEach((c: any) => {
      productNameMap.set(c.id, c.name);
    });

    // Helper to resolve human-readable target names for a rule
    function resolveTargetNames(rule: PurchaseLimitRule): string[] {
      if (rule.restriction_type === "all") return ["All Store Products"];
      if (rule.restriction_type === "category") {
        return rule.target_ids.map((id) => categoryNameMap.get(id) || id);
      }
      if (rule.restriction_type === "combo") {
        if (rule.target_ids.length === 0) return ["All Combos"];
        return rule.target_ids.map((id) => productNameMap.get(id) || id);
      }
      return rule.target_ids.map((id) => productNameMap.get(id) || id);
    }

    // 3. Find maximum lookback window across active rules
    let maxDays = 0;
    for (const r of activeRules) {
      if (r.period === "daily") maxDays = Math.max(maxDays, 1);
      else if (r.period === "weekly") maxDays = Math.max(maxDays, 7);
      else if (r.period === "monthly") maxDays = Math.max(maxDays, 30);
      else if (r.period === "lifetime") maxDays = Math.max(maxDays, 3650);
    }

    const windowStart = new Date(now.getTime() - maxDays * 24 * 60 * 60 * 1000).toISOString();

    // 4. Fetch eligible orders with customer details
    const { data: orders, error: ordersError } = await (supabase as any)
      .from("orders")
      .select("id, user_id, customer_name, customer_phone, customer_email, created_at, items, payment_status, order_status")
      .not("user_id", "is", null)
      .neq("order_status", "cancelled")
      .neq("payment_status", "failed")
      .gte("created_at", windowStart)
      .order("created_at", { ascending: true });

    if (ordersError) {
      return NextResponse.json({ error: ordersError.message }, { status: 500 });
    }

    // Group orders by user_id
    const customerOrders = new Map<string, {
      name: string;
      phone: string;
      email: string | null;
      orders: any[];
    }>();

    for (const o of orders ?? []) {
      const uId = o.user_id;
      if (!uId) continue;
      if (!customerOrders.has(uId)) {
        customerOrders.set(uId, {
          name: o.customer_name || "Customer",
          phone: o.customer_phone || "",
          email: o.customer_email || null,
          orders: [],
        });
      }
      customerOrders.get(uId)!.orders.push(o);
    }

    // 5. For each customer and active rule, compute purchase tracking
    const usages: CustomerPurchaseLimitUsage[] = [];

    for (const [userId, custInfo] of customerOrders.entries()) {
      for (const rule of activeRules) {
        if (rule.period === "per_order") continue; // per_order is order-time only

        const periodStart = getPeriodStartTime(rule.period, now);
        let purchasedQty = 0;
        let oldestOrderDate: string | null = null;

        for (const order of custInfo.orders) {
          const oDate = new Date(order.created_at);
          if (periodStart && oDate < periodStart) continue;

          const orderItems = Array.isArray(order.items) ? order.items : [];
          for (const item of orderItems) {
            const pId = item.product_id || item.productId;
            const qty = Number(item.qty || item.quantity || 0);
            if (!pId || qty <= 0) continue;

            const itemMeta = productMap.get(pId) || {
              id: pId,
              name: item.name,
              category: item.category,
              category_id: item.category_id,
              is_combo: item.is_combo,
            };

            if (doesRuleApplyToProduct(rule, itemMeta)) {
              purchasedQty += qty;
              if (!oldestOrderDate) {
                oldestOrderDate = order.created_at;
              }
            }
          }
        }

        if (purchasedQty > 0) {
          const remainingQuantity = Math.max(0, rule.max_quantity - purchasedQty);
          const isReached = remainingQuantity <= 0;
          const resetDate = calculateResetDate(rule.period, oldestOrderDate);

          usages.push({
            customerId: userId,
            customerName: custInfo.name,
            customerPhone: custInfo.phone,
            customerEmail: custInfo.email,
            ruleId: rule.id,
            ruleName: rule.name,
            restrictionType: rule.restriction_type,
            targetNames: resolveTargetNames(rule),
            maxQuantity: rule.max_quantity,
            purchasedQuantity: purchasedQty,
            remainingQuantity,
            period: rule.period,
            resetDate,
            isLimitReached: isReached,
          });
        }
      }
    }

    let filteredUsages = usages;
    if (limitReachedOnly) {
      filteredUsages = filteredUsages.filter((u) => u.isLimitReached);
    }
    if (search) {
      filteredUsages = filteredUsages.filter(
        (u) =>
          u.customerName.toLowerCase().includes(search) ||
          u.customerPhone.includes(search) ||
          (u.customerEmail && u.customerEmail.toLowerCase().includes(search)) ||
          u.ruleName.toLowerCase().includes(search)
      );
    }

    // Sort by limit reached first, then most purchased
    filteredUsages.sort((a, b) => {
      if (a.isLimitReached && !b.isLimitReached) return -1;
      if (!a.isLimitReached && b.isLimitReached) return 1;
      return b.purchasedQuantity - a.purchasedQuantity;
    });

    return NextResponse.json({ usages: filteredUsages });
  } catch (err) {
    console.error("[admin/purchase-limits/usage GET]", err);
    return NextResponse.json({ error: "Failed to generate usage report." }, { status: 500 });
  }
}
