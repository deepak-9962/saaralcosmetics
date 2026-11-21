import type {
  PurchaseLimitRule,
  PurchaseLimitPeriod,
  ProductLimitStatus,
  PurchaseLimitValidationResult,
  Product,
} from "./types";

/**
 * Checks if a purchase limit rule is currently active and within its effective date range.
 */
export function isRuleCurrentlyActive(rule: PurchaseLimitRule, now = new Date()): boolean {
  if (!rule.is_active) return false;
  if (rule.starts_at && new Date(rule.starts_at) > now) return false;
  if (rule.expires_at && new Date(rule.expires_at) < now) return false;
  return true;
}

/**
 * Calculates the window start time for a given period relative to now.
 * Returns null for 'per_order' since it does not look into past orders.
 */
export function getPeriodStartTime(period: PurchaseLimitPeriod, now = new Date()): Date | null {
  switch (period) {
    case "per_order":
      return null;
    case "daily":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "weekly":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "monthly":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "lifetime":
      return new Date(0);
    default:
      return null;
  }
}

export interface TargetProductMeta {
  id: string;
  name: string;
  category?: string;
  category_id?: string | null;
  is_combo?: boolean;
}

/**
 * Determines whether a purchase limit rule applies to a specific product.
 */
export function doesRuleApplyToProduct(
  rule: PurchaseLimitRule,
  product: TargetProductMeta
): boolean {
  if (rule.restriction_type === "all") {
    return true;
  }

  if (rule.restriction_type === "product") {
    return rule.target_ids.includes(product.id);
  }

  if (rule.restriction_type === "category") {
    const isTargetCategory =
      (product.category && rule.target_ids.includes(product.category)) ||
      (product.category_id && rule.target_ids.includes(product.category_id)) ||
      (rule.target_ids.includes("combos") && product.is_combo === true);
    return Boolean(isTargetCategory);
  }

  if (rule.restriction_type === "combo") {
    const isCombo = product.is_combo === true || product.category === "combos";
    if (!isCombo) return false;
    // Empty target_ids means all combos, otherwise check specific combo ID
    return rule.target_ids.length === 0 || rule.target_ids.includes(product.id);
  }

  return false;
}

export interface HistoricalPurchaseSummary {
  ruleId: string;
  purchasedQty: number;
  oldestOrderDate: string | null;
}

/**
 * Calculates human-readable reset date string from period and oldest order date.
 */
export function calculateResetDate(
  period: PurchaseLimitPeriod,
  oldestOrderDate: string | null
): string | null {
  if (!oldestOrderDate) return null;
  const orderTime = new Date(oldestOrderDate).getTime();
  if (isNaN(orderTime)) return null;

  let resetTime: number;
  switch (period) {
    case "daily":
      resetTime = orderTime + 24 * 60 * 60 * 1000;
      break;
    case "weekly":
      resetTime = orderTime + 7 * 24 * 60 * 60 * 1000;
      break;
    case "monthly":
      resetTime = orderTime + 30 * 24 * 60 * 60 * 1000;
      break;
    case "per_order":
    case "lifetime":
    default:
      return null;
  }

  return new Date(resetTime).toISOString();
}

export function formatPeriodLabel(period?: PurchaseLimitPeriod | null): string {
  if (!period) return "order";
  switch (period) {
    case "per_order":
      return "order";
    case "daily":
      return "day";
    case "weekly":
      return "week";
    case "monthly":
      return "month";
    case "lifetime":
      return "customer lifetime";
    default:
      return period;
  }
}

/**
 * Validates a cart / checkout submission against all active purchase limits.
 *
 * @param supabase - Supabase client (service role client recommended on server)
 * @param params.items - Cart items with { productId, quantity }
 * @param params.userId - Authenticated user's unique ID, or null for guest
 */
export async function validatePurchaseLimits(
  supabase: any,
  params: {
    items: Array<{ productId: string; quantity: number }>;
    userId?: string | null;
  }
): Promise<PurchaseLimitValidationResult> {
  const { items, userId } = params;

  if (!items || items.length === 0) {
    return { valid: true, limits: {}, errors: [] };
  }

  // 1. Fetch all active purchase limit rules
  const { data: rulesData, error: rulesError } = await supabase
    .from("purchase_limits")
    .select("*")
    .eq("is_active", true);

  if (rulesError || !rulesData || rulesData.length === 0) {
    // If no rules exist or table doesn't have active rules, allow purchase
    return { valid: true, limits: {}, errors: [] };
  }

  const now = new Date();
  const activeRules: PurchaseLimitRule[] = (rulesData as PurchaseLimitRule[]).filter((r) =>
    isRuleCurrentlyActive(r, now)
  );

  if (activeRules.length === 0) {
    return { valid: true, limits: {}, errors: [] };
  }

  // 2. Fetch product details for all cart items (handling both products and combos tables)
  const productIds = Array.from(new Set(items.map((i) => i.productId)));
  const { data: dbProducts, error: prodError } = await supabase
    .from("products")
    .select("id, name, slug, category, category_id, stock")
    .in("id", productIds);

  if (prodError && (!dbProducts || dbProducts.length === 0)) {
    return { valid: true, limits: {}, errors: [] };
  }

  const foundProductIds = new Set((dbProducts ?? []).map((p: any) => p.id));
  const missingIds = productIds.filter((id) => !foundProductIds.has(id));

  let dbCombos: any[] = [];
  if (missingIds.length > 0) {
    const { data: combosData } = await supabase
      .from("combos")
      .select("id, name, slug")
      .in("id", missingIds);
    if (combosData) {
      dbCombos = combosData;
    }
  }

  const productMap = new Map<string, TargetProductMeta>();

  (dbProducts ?? []).forEach((p: any) => {
    productMap.set(p.id, {
      id: p.id,
      name: p.name,
      category: p.category,
      category_id: p.category_id,
      is_combo: p.category === "combos" || p.slug?.includes("combo"),
    });
  });

  dbCombos.forEach((c: any) => {
    productMap.set(c.id, {
      id: c.id,
      name: c.name,
      category: "combos",
      category_id: null,
      is_combo: true,
    });
  });

  // 3. If authenticated user, fetch historical orders within the maximum period window
  // Find maximum historical window needed across all rules
  let maxHistoryDays = 0;
  for (const r of activeRules) {
    if (r.period === "daily") maxHistoryDays = Math.max(maxHistoryDays, 1);
    else if (r.period === "weekly") maxHistoryDays = Math.max(maxHistoryDays, 7);
    else if (r.period === "monthly") maxHistoryDays = Math.max(maxHistoryDays, 30);
    else if (r.period === "lifetime") maxHistoryDays = Math.max(maxHistoryDays, 3650);
  }

  // Map of ruleId -> { purchasedQty, oldestOrderDate }
  const ruleUsageMap = new Map<string, { purchasedQty: number; oldestOrderDate: string | null }>();

  // Initialize for all active rules
  for (const r of activeRules) {
    ruleUsageMap.set(r.id, { purchasedQty: 0, oldestOrderDate: null });
  }

  if (userId && maxHistoryDays > 0) {
    const windowStart = new Date(now.getTime() - maxHistoryDays * 24 * 60 * 60 * 1000).toISOString();

    const { data: pastOrders } = await supabase
      .from("orders")
      .select("id, created_at, items, payment_status, order_status")
      .eq("user_id", userId)
      .neq("order_status", "cancelled")
      .neq("payment_status", "failed")
      .gte("created_at", windowStart)
      .order("created_at", { ascending: true });

    if (pastOrders && pastOrders.length > 0) {
      // For each active rule, sum up quantities in eligible orders within that rule's period
      for (const rule of activeRules) {
        if (rule.period === "per_order") continue;

        const periodStart = getPeriodStartTime(rule.period, now);
        let rulePurchased = 0;
        let oldestOrderDate: string | null = null;

        for (const order of pastOrders as any[]) {
          const orderDate = new Date(order.created_at);
          if (periodStart && orderDate < periodStart) {
            continue;
          }

          const orderItems = Array.isArray(order.items) ? order.items : [];
          for (const item of orderItems) {
            const pId = item.product_id || item.productId;
            const qty = Number(item.qty || item.quantity || 0);
            if (!pId || qty <= 0) continue;

            // Check if this item matches the rule
            const itemMeta = productMap.get(pId) || {
              id: pId,
              name: item.name || "Product",
              category: item.category,
              category_id: item.category_id,
              is_combo: item.is_combo,
            };

            if (doesRuleApplyToProduct(rule, itemMeta)) {
              rulePurchased += qty;
              if (!oldestOrderDate) {
                oldestOrderDate = order.created_at;
              }
            }
          }
        }

        ruleUsageMap.set(rule.id, { purchasedQty: rulePurchased, oldestOrderDate });
      }
    }
  }

  // 4. Validate each cart item and the aggregate order
  const errors: string[] = [];
  const limits: Record<string, ProductLimitStatus> = {};

  // Track quantities in cart by rule for aggregate enforcement (categories and store-wide)
  const cartQtyByRule = new Map<string, number>();

  for (const cartItem of items) {
    const product = productMap.get(cartItem.productId);
    if (!product) continue;

    // Find all active rules matching this product
    const matchingRules = activeRules.filter((r) => doesRuleApplyToProduct(r, product));

    let minRemaining = Infinity;
    let mostRestrictiveRule: PurchaseLimitRule | null = null;
    let mostRestrictivePurchased = 0;
    let mostRestrictiveOldestDate: string | null = null;

    for (const rule of matchingRules) {
      // Accumulate cart quantity for this rule
      const currentCartInRule = (cartQtyByRule.get(rule.id) ?? 0) + cartItem.quantity;
      cartQtyByRule.set(rule.id, currentCartInRule);

      const usage = ruleUsageMap.get(rule.id) ?? { purchasedQty: 0, oldestOrderDate: null };
      const remainingForThisRule = Math.max(0, rule.max_quantity - usage.purchasedQty);

      if (remainingForThisRule < minRemaining) {
        minRemaining = remainingForThisRule;
        mostRestrictiveRule = rule;
        mostRestrictivePurchased = usage.purchasedQty;
        mostRestrictiveOldestDate = usage.oldestOrderDate;
      }
    }

    if (mostRestrictiveRule) {
      const resetDate = calculateResetDate(
        mostRestrictiveRule.period,
        mostRestrictiveOldestDate
      );

      limits[cartItem.productId] = {
        productId: cartItem.productId,
        isRestricted: true,
        maxAllowed: mostRestrictiveRule.max_quantity,
        purchasedInPeriod: mostRestrictivePurchased,
        remainingAllowed: minRemaining,
        period: mostRestrictiveRule.period,
        ruleName: mostRestrictiveRule.name,
        resetDate,
        isLimitReached: minRemaining <= 0,
      };

      // Check if this item's requested quantity alone exceeds its remaining limit
      if (cartItem.quantity > minRemaining) {
        const periodStr = formatPeriodLabel(mostRestrictiveRule.period);
        const reason =
          minRemaining === 0
            ? `You have reached the ${periodStr} purchase limit (${mostRestrictiveRule.max_quantity} units) for "${product.name}".`
            : `You can only purchase up to ${minRemaining} more unit(s) of "${product.name}" (${mostRestrictiveRule.max_quantity} ${periodStr} limit).`;
        errors.push(reason);
      }
    } else {
      limits[cartItem.productId] = {
        productId: cartItem.productId,
        isRestricted: false,
        maxAllowed: 9999,
        purchasedInPeriod: 0,
        remainingAllowed: 9999,
        period: null,
        ruleName: null,
        resetDate: null,
        isLimitReached: false,
      };
    }
  }

  // 5. Aggregate Rule Check (e.g. Category-level and Store-wide limits across multiple cart items)
  for (const rule of activeRules) {
    const totalInCartForRule = cartQtyByRule.get(rule.id) ?? 0;
    if (totalInCartForRule <= 0) continue;

    const usage = ruleUsageMap.get(rule.id) ?? { purchasedQty: 0, oldestOrderDate: null };
    const remainingForRule = Math.max(0, rule.max_quantity - usage.purchasedQty);

    if (totalInCartForRule > remainingForRule) {
      const periodStr = formatPeriodLabel(rule.period);
      const ruleTargetDesc =
        rule.restriction_type === "all"
          ? "store-wide order"
          : rule.restriction_type === "category"
          ? `category limit for "${rule.name}"`
          : rule.restriction_type === "combo"
          ? "combos limit"
          : `rule "${rule.name}"`;

      const aggregateErr = `Total quantity (${totalInCartForRule} units) exceeds the ${ruleTargetDesc} of ${rule.max_quantity} ${periodStr} (remaining: ${remainingForRule} units).`;
      if (!errors.includes(aggregateErr)) {
        errors.push(aggregateErr);
      }
    }
  }

  return {
    valid: errors.length === 0,
    limits,
    errors,
  };
}
