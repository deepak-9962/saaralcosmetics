"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import type { PromoCode, Category, Product } from "@/lib/types";
import { listCategories, listAllProductsForAdmin, listCombos } from "@/lib/supabase/data";

interface PromoCodeFormProps {
  initialData?: PromoCode;
}

type AppliesTo = "all" | "category" | "product" | "combo";

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

// ── Multi-select checkbox list ───────────────────────────────────────────────
function MultiCheckList({
  items,
  selectedIds,
  onToggle,
  onRetry,
  label,
  emptyMsg = "No items found.",
  loading = false,
}: {
  items: { id: string; label: string; badge?: string }[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onRetry?: () => void;
  label: string;
  emptyMsg?: string;
  loading?: boolean;
}) {
  const [search, setSearch] = useState("");
  const filtered = items.filter((it) =>
    it.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-body text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">
          {label} ({items.length})
        </span>
        {selectedIds.length > 0 && (
          <span className="font-body text-[11px] text-primary font-medium">
            {selectedIds.length} selected
          </span>
        )}
      </div>
      <input
        type="text"
        placeholder="Search…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2 text-[13px] font-body text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary transition-all"
      />
      <div className="max-h-56 overflow-y-auto rounded-xl border border-outline-variant/50 divide-y divide-outline-variant/20">
        {loading && (
          <div className="flex items-center gap-2 p-3 text-on-surface-variant font-body text-[13px]">
            <span className="material-symbols-outlined animate-spin text-[16px]">
              progress_activity
            </span>
            Loading…
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="p-3 text-on-surface-variant font-body text-[13px] flex items-center justify-between">
            <span>{emptyMsg}</span>
            {items.length === 0 && onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="font-body text-[12px] text-primary hover:underline font-medium flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                Reload
              </button>
            )}
          </div>
        )}
        {!loading &&
          filtered.map((item) => {
            const checked = selectedIds.includes(item.id);
            return (
              <label
                key={item.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-surface-container-low ${
                  checked ? "bg-primary/5" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(item.id)}
                  className="w-4 h-4 accent-primary shrink-0"
                />
                <span className="font-body text-[13px] text-on-surface flex-1 leading-tight">
                  {item.label}
                </span>
                {item.badge && (
                  <span className="font-body text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant/40">
                    {item.badge}
                  </span>
                )}
              </label>
            );
          })}
      </div>
    </div>
  );
}

// ── Main form ────────────────────────────────────────────────────────────────
export default function PromoCodeForm({ initialData }: PromoCodeFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  // ── Form state ─────────────────────────────────────────────────────────────
  const [code, setCode] = useState(initialData?.code ?? "");
  const [discountType, setDiscountType] = useState<"percentage" | "flat" | "free_shipping">(
    initialData?.discount_type ?? "percentage"
  );
  const [discountValue, setDiscountValue] = useState(
    initialData?.discount_value?.toString() ?? ""
  );
  const [maxDiscountCap, setMaxDiscountCap] = useState(
    initialData?.max_discount_cap?.toString() ?? ""
  );
  const [minOrderValue, setMinOrderValue] = useState(
    initialData?.min_order_value?.toString() ?? ""
  );
  const [usageLimitTotal, setUsageLimitTotal] = useState(
    initialData?.usage_limit_total?.toString() ?? ""
  );
  const [usageLimitPerUser, setUsageLimitPerUser] = useState(
    initialData?.usage_limit_per_user?.toString() ?? ""
  );
  const [appliesTo, setAppliesTo] = useState<AppliesTo>(
    (initialData?.applies_to as AppliesTo) ?? "all"
  );
  // Multi-select: array of slugs (category) or UUIDs (product/combo)
  const [appliesToIds, setAppliesToIds] = useState<string[]>(
    initialData?.applies_to_ids?.length
      ? initialData.applies_to_ids
      : initialData?.applies_to_id
      ? [initialData.applies_to_id]
      : []
  );
  const [startsAt, setStartsAt] = useState(toDateInputValue(initialData?.starts_at));
  const [expiresAt, setExpiresAt] = useState(toDateInputValue(initialData?.expires_at));
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [showInBanner, setShowInBanner] = useState(initialData?.show_in_banner ?? false);
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Data for multi-select pickers ─────────────────────────────────────────
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [combos, setCombos] = useState<{ id: string; name: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Reset selection when scope changes after initial load
  const prevAppliesToRef = useRef(appliesTo);
  useEffect(() => {
    if (prevAppliesToRef.current !== appliesTo) {
      setAppliesToIds([]);
      prevAppliesToRef.current = appliesTo;
    }
  }, [appliesTo]);

  const loadCatalogData = useCallback(async () => {
    setLoadingProducts(true);
    setLoadingCategories(true);

    try {
      const res = await fetch("/api/admin/catalog");
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.products) && json.products.length > 0) {
          setProducts(json.products);
        }
        if (Array.isArray(json.combos) && json.combos.length > 0) {
          setCombos(json.combos);
        }
        if (Array.isArray(json.categories) && json.categories.length > 0) {
          setCategories(json.categories);
        }
        setLoadingProducts(false);
        setLoadingCategories(false);
        return;
      }
    } catch (err) {
      console.warn("Failed to load /api/admin/catalog in PromoCodeForm, trying fallback:", err);
    }

    // Fallback if API route is unreachable
    try {
      const [cats, prods, cmbs] = await Promise.all([
        listCategories(false).catch(() => []),
        listAllProductsForAdmin().catch(() => []),
        listCombos(false).catch(() => []),
      ]);
      if (cats.length > 0) setCategories(cats);
      if (prods.length > 0) setProducts(prods);
      if (cmbs.length > 0) setCombos(cmbs.map((c) => ({ id: c.id, name: c.name })));
    } catch (err) {
      console.error("Fallback catalog loading failed in PromoCodeForm:", err);
    } finally {
      setLoadingProducts(false);
      setLoadingCategories(false);
    }
  }, []);

  // Pre-load all catalog data immediately on mount
  useEffect(() => {
    loadCatalogData();
  }, [loadCatalogData]);

  // If a scope is selected and options are still empty, trigger load
  useEffect(() => {
    if (appliesTo === "category" && categories.length === 0) {
      loadCatalogData();
    } else if (appliesTo === "product" && products.length === 0) {
      loadCatalogData();
    } else if (appliesTo === "combo" && combos.length === 0) {
      loadCatalogData();
    }
  }, [appliesTo, categories.length, products.length, combos.length, loadCatalogData]);

  const toggleId = (id: string) => {
    setAppliesToIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError("Promo code is required.");
      return;
    }
    if (
      discountType !== "free_shipping" &&
      (!discountValue || isNaN(Number(discountValue)) || Number(discountValue) <= 0)
    ) {
      setError("Discount value must be a positive number.");
      return;
    }
    if (discountType === "percentage" && Number(discountValue) > 100) {
      setError("Percentage discount cannot exceed 100%.");
      return;
    }
    if (appliesTo === "category" && appliesToIds.length === 0) {
      setError("Please select at least one category to apply this code to.");
      return;
    }
    if (appliesTo === "product" && appliesToIds.length === 0) {
      setError("Please select at least one product to apply this code to.");
      return;
    }

    setIsSaving(true);

    const payload = {
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: discountType === "free_shipping" ? 0 : Number(discountValue),
      max_discount_cap:
        discountType === "percentage" && maxDiscountCap ? Number(maxDiscountCap) : null,
      min_order_value: minOrderValue ? Number(minOrderValue) : 0,
      usage_limit_total: usageLimitTotal ? Number(usageLimitTotal) : null,
      usage_limit_per_user: usageLimitPerUser ? Number(usageLimitPerUser) : null,
      applies_to: appliesTo,
      applies_to_ids: appliesTo === "all" ? [] : appliesToIds,
      starts_at: startsAt ? new Date(`${startsAt}T00:00:00`).toISOString() : null,
      expires_at: expiresAt ? new Date(`${expiresAt}T23:59:59`).toISOString() : null,
      is_active: isActive,
      show_in_banner: showInBanner,
      description: description.trim() || null,
    };

    try {
      const url = isEditing
        ? `/api/admin/promo-codes/${initialData!.id}`
        : "/api/admin/promo-codes";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Failed to save promo code.");
        return;
      }

      toast.success(
        isEditing ? "Promo code updated!" : "Promo code created!",
        { icon: "🎟️" }
      );
      router.push("/admin/promo-codes");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:border-tertiary-container focus:ring-1 focus:ring-tertiary-container/30 transition-all font-body text-[14px] leading-[1.6] text-on-surface placeholder:text-outline";
  const labelClass =
    "block font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant mb-1.5 uppercase";

  const scopeOptions: { value: AppliesTo; label: string; icon: string; desc: string }[] = [
    {
      value: "all",
      label: "All Products",
      icon: "inventory_2",
      desc: "Applies to every item in cart",
    },
    {
      value: "category",
      label: "Categories",
      icon: "category",
      desc: "Pick one or more categories",
    },
    {
      value: "product",
      label: "Specific Products",
      icon: "local_offer",
      desc: "Pick one or more individual products",
    },
    {
      value: "combo",
      label: "Combos",
      icon: "auto_awesome_motion",
      desc: "Pick one or more combo packs",
    },
  ];

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* ── Code & Discount Type ────────────────────────────────────────── */}
      <div className="bg-surface rounded-xl border border-outline-variant/50 custom-shadow p-6 space-y-5">
        <h2 className="font-display text-[18px] text-on-surface">Code Details</h2>

        <div>
          <label className={labelClass}>Promo Code *</label>
          <input
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. SAVE20"
            className={inputClass}
            spellCheck={false}
          />
          <p className="mt-1 font-body text-[11px] text-on-surface-variant/60">
            Automatically uppercased. Must be unique.
          </p>
        </div>

        {/* Discount Type */}
        <div>
          <label className={labelClass}>Discount Type *</label>
          <div className="flex gap-3">
            {(["percentage", "flat", "free_shipping"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setDiscountType(type)}
                className={`flex-1 py-2.5 rounded-xl border font-body text-[13px] font-medium transition-all ${
                  discountType === type
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:border-primary/40"
                }`}
              >
                {type === "percentage"
                  ? "Percentage (%)"
                  : type === "flat"
                  ? "Flat Amount (₹)"
                  : "Free Shipping"}
              </button>
            ))}
          </div>
        </div>

        {discountType !== "free_shipping" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Discount Value * {discountType === "percentage" ? "(%)" : "(₹)"}
              </label>
              <input
                type="number"
                required
                min={0.01}
                step={0.01}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "percentage" ? "20" : "200"}
                className={inputClass}
              />
            </div>

            {discountType === "percentage" && (
              <div>
                <label className={labelClass}>Max Discount Cap (₹)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={maxDiscountCap}
                  onChange={(e) => setMaxDiscountCap(e.target.value)}
                  placeholder="e.g. 500 (optional)"
                  className={inputClass}
                />
                <p className="mt-1 font-body text-[11px] text-on-surface-variant/60">
                  Caps the maximum rupee discount for percentage codes.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-on-surface font-body text-[13px]">
            <p className="font-medium text-primary">Free Delivery Promo</p>
            <p className="text-on-surface-variant text-[12px] mt-0.5">
              This code grants ₹0 shipping on all qualifying orders regardless of cart total or delivery state.
            </p>
          </div>
        )}
      </div>

      {/* ── Conditions ──────────────────────────────────────────────────── */}
      <div className="bg-surface rounded-xl border border-outline-variant/50 custom-shadow p-6 space-y-5">
        <h2 className="font-display text-[18px] text-on-surface">Conditions</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Min Order Value (₹)</label>
            <input
              type="number"
              min={0}
              step={1}
              value={minOrderValue}
              onChange={(e) => setMinOrderValue(e.target.value)}
              placeholder="0 (no minimum)"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Usage Limit (Total)</label>
            <input
              type="number"
              min={1}
              step={1}
              value={usageLimitTotal}
              onChange={(e) => setUsageLimitTotal(e.target.value)}
              placeholder="Unlimited"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Usage Limit (Per User)</label>
            <input
              type="number"
              min={1}
              step={1}
              value={usageLimitPerUser}
              onChange={(e) => setUsageLimitPerUser(e.target.value)}
              placeholder="Unlimited"
              className={inputClass}
            />
            <p className="mt-1 font-body text-[11px] text-on-surface-variant/60">
              Applies only to logged-in users.
            </p>
          </div>
        </div>

        {/* ── Applies To — multi-target scope picker ─────────────────── */}
        <div>
          <label className={labelClass}>Applies To</label>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {scopeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAppliesTo(opt.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${
                  appliesTo === opt.value
                    ? "bg-tertiary-container/60 text-on-tertiary-container border-[#C9A74D]/60 shadow-sm"
                    : "bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:border-primary/40 hover:bg-surface-container-low"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[22px] ${
                    appliesTo === opt.value ? "text-[#8A6A00]" : "text-on-surface-variant"
                  }`}
                >
                  {opt.icon}
                </span>
                <span className="font-body text-[12px] font-semibold leading-tight">{opt.label}</span>
                <span className="font-body text-[10px] text-on-surface-variant/70 leading-tight">
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>

          {/* Category multi-select */}
          <AnimatePresence>
            {appliesTo === "category" && (
              <motion.div
                key="cat"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <MultiCheckList
                  label="Select Categories (multiple allowed)"
                  items={categories.map((c) => ({
                    id: c.slug,
                    label: c.name,
                    badge: c.is_active ? undefined : "Inactive",
                  }))}
                  selectedIds={appliesToIds}
                  onToggle={toggleId}
                  emptyMsg="No categories found."
                  loading={loadingCategories}
                  onRetry={loadCatalogData}
                />
              </motion.div>
            )}

            {/* Product multi-select */}
            {appliesTo === "product" && (
              <motion.div
                key="prod"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <MultiCheckList
                  label="Select Products (multiple allowed)"
                  items={products.map((p) => ({
                    id: p.id,
                    label: p.name + (p.variant_name ? ` — ${p.variant_name}` : ""),
                    badge: p.is_active ? undefined : "Inactive",
                  }))}
                  selectedIds={appliesToIds}
                  onToggle={toggleId}
                  emptyMsg="No products found."
                  loading={loadingProducts}
                  onRetry={loadCatalogData}
                />
              </motion.div>
            )}

            {/* Combo multi-select */}
            {appliesTo === "combo" && (
              <motion.div
                key="combo"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <p className="mt-3 font-body text-[12px] text-on-surface-variant">
                  Leave all unchecked to apply the discount to{" "}
                  <strong>all combos</strong> in the cart.
                </p>
                <MultiCheckList
                  label="Select Specific Combos (optional)"
                  items={combos.map((c) => ({ id: c.id, label: c.name }))}
                  selectedIds={appliesToIds}
                  onToggle={toggleId}
                  emptyMsg="No combos found."
                  loading={loadingProducts}
                  onRetry={loadCatalogData}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Summary of selections */}
          {appliesTo !== "all" && appliesToIds.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {appliesToIds.map((id) => {
                const label =
                  appliesTo === "category"
                    ? categories.find((c) => c.slug === id)?.name ?? id
                    : appliesTo === "product"
                    ? (() => {
                        const p = products.find((pr) => pr.id === id);
                        return p ? p.name + (p.variant_name ? ` — ${p.variant_name}` : "") : id;
                      })()
                    : combos.find((c) => c.id === id)?.name ?? id;
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 font-body text-[11px] text-primary font-medium"
                  >
                    {label}
                    <button
                      type="button"
                      onClick={() => toggleId(id)}
                      className="ml-1 text-primary/60 hover:text-error transition-colors cursor-pointer"
                      aria-label={`Remove ${label}`}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Date range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Start Date</label>
            <input
              type="date"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Expiry Date</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* ── Banner & Visibility ─────────────────────────────────────────── */}
      <div className="bg-surface rounded-xl border border-outline-variant/50 custom-shadow p-6 space-y-5">
        <h2 className="font-display text-[18px] text-on-surface">Visibility</h2>

        <div>
          <label className={labelClass}>Banner Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Product of the Month — 20% off Vetpalai Soap"
            className={inputClass}
            maxLength={120}
          />
          <p className="mt-1 font-body text-[11px] text-on-surface-variant/60">
            Shown in the header banner. If blank, auto-formatted from discount type.
          </p>
        </div>

        {/* Toggle row */}
        <div className="space-y-3">
          {[
            {
              id: "is_active",
              label: "Active",
              description: "Code can be applied at checkout",
              value: isActive,
              onChange: setIsActive,
            },
            {
              id: "show_in_banner",
              label: "Show in Header Banner",
              description: "Rotates through the top promo bar",
              value: showInBanner,
              onChange: setShowInBanner,
            },
          ].map((toggle) => (
            <label
              key={toggle.id}
              className="flex items-center justify-between p-4 rounded-xl border border-outline-variant/40 hover:border-outline-variant cursor-pointer transition-colors"
            >
              <div>
                <p className="font-body text-[14px] text-on-surface font-medium">{toggle.label}</p>
                <p className="font-body text-[12px] text-on-surface-variant">{toggle.description}</p>
              </div>
              <div
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  toggle.value ? "bg-primary" : "bg-outline-variant"
                }`}
                onClick={() => toggle.onChange(!toggle.value)}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    toggle.value ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* ── Error & Actions ─────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-error-container/30 border border-error/20">
          <span className="material-symbols-outlined text-error text-[18px]">error</span>
          <p className="font-body text-[13px] text-error">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/promo-codes")}
          className="flex-1 py-3 rounded-xl border border-outline-variant font-body text-[13px] text-on-surface-variant hover:text-on-surface hover:border-outline transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-body text-[13px] font-medium hover:bg-[#9d4d6e] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[18px]">
                progress_activity
              </span>
              Saving…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">save</span>
              {isEditing ? "Save Changes" : "Create Code"}
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
}
