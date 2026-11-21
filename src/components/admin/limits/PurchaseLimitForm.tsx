"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { listCategories } from "@/lib/supabase/data";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  PurchaseLimitRule,
  PurchaseLimitRestrictionType,
  PurchaseLimitPeriod,
  Category,
  Product,
} from "@/lib/types";

interface PurchaseLimitFormProps {
  initialData?: PurchaseLimitRule;
}

function toDateInputValue(iso?: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

// ── Multi-select checkbox list ───────────────────────────────────────────────
function MultiCheckList({
  items,
  selectedIds,
  onToggle,
  onSelectAll,
  onClearAll,
  label,
  emptyMsg = "No items found.",
  loading = false,
}: {
  items: { id: string; label: string; badge?: string }[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onSelectAll?: () => void;
  onClearAll?: () => void;
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
          {label}
        </span>
        <div className="flex items-center gap-2">
          {onSelectAll && items.length > 0 && (
            <button
              type="button"
              onClick={onSelectAll}
              className="font-body text-[11px] text-primary hover:underline font-medium"
            >
              Select All
            </button>
          )}
          {onClearAll && selectedIds.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="font-body text-[11px] text-outline hover:text-error transition-colors font-medium"
            >
              Clear
            </button>
          )}
          {selectedIds.length > 0 && (
            <span className="font-body text-[11px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">
              {selectedIds.length} selected
            </span>
          )}
        </div>
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
          <div className="p-3 text-on-surface-variant font-body text-[13px]">{emptyMsg}</div>
        )}
        {!loading &&
          filtered.map((item) => {
            const checked = selectedIds.includes(item.id);
            return (
              <label
                key={item.id}
                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-surface-container-low ${
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

export default function PurchaseLimitForm({ initialData }: PurchaseLimitFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  // Form State
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [restrictionType, setRestrictionType] = useState<PurchaseLimitRestrictionType>(
    initialData?.restriction_type ?? "product"
  );
  const [targetIds, setTargetIds] = useState<string[]>(initialData?.target_ids ?? []);
  const [maxQuantity, setMaxQuantity] = useState<string>(
    initialData?.max_quantity ? String(initialData.max_quantity) : "2"
  );
  const [period, setPeriod] = useState<PurchaseLimitPeriod>(
    initialData?.period ?? "monthly"
  );
  const [startsAt, setStartsAt] = useState(toDateInputValue(initialData?.starts_at));
  const [expiresAt, setExpiresAt] = useState(toDateInputValue(initialData?.expires_at));
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic Options
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [combos, setCombos] = useState<{ id: string; name: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Clear targets on type change (unless editing initial load)
  useEffect(() => {
    if (!isEditing) {
      setTargetIds([]);
    }
  }, [restrictionType, isEditing]);

  // Load categories
  useEffect(() => {
    if (restrictionType !== "category") return;
    setLoadingCategories(true);
    listCategories(false)
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoadingCategories(false));
  }, [restrictionType]);

  // Load products / combos
  useEffect(() => {
    if (restrictionType !== "product" && restrictionType !== "combo") return;
    setLoadingProducts(true);
    const supabase = getSupabaseBrowserClient() as any;

    if (restrictionType === "product") {
      supabase
        .from("products")
        .select("id, name, variant_name, is_active, is_combo")
        .eq("is_combo", false)
        .order("name")
        .then(({ data }: any) => {
          setProducts((data ?? []) as Product[]);
        })
        .catch(() => setProducts([]))
        .finally(() => setLoadingProducts(false));
    } else {
      supabase
        .from("products")
        .select("id, name, is_active")
        .eq("is_combo", true)
        .order("name")
        .then(({ data }: any) => {
          setCombos((data ?? []).map((r: any) => ({ id: r.id, name: r.name })));
        })
        .catch(() => setCombos([]))
        .finally(() => setLoadingProducts(false));
    }
  }, [restrictionType]);

  const toggleTargetId = (id: string) => {
    setTargetIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllTargets = () => {
    if (restrictionType === "category") {
      setTargetIds(categories.map((c) => c.slug));
    } else if (restrictionType === "product") {
      setTargetIds(products.map((p) => p.id));
    } else if (restrictionType === "combo") {
      setTargetIds(combos.map((c) => c.id));
    }
  };

  const handleClearAllTargets = () => {
    setTargetIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Rule name is required.");
      return;
    }

    const qty = Number(maxQuantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      setError("Maximum purchase quantity must be a positive integer (at least 1).");
      return;
    }

    if (
      restrictionType !== "all" &&
      restrictionType !== "combo" &&
      targetIds.length === 0
    ) {
      setError(`Please select at least one ${restrictionType} to apply this limit to.`);
      return;
    }

    setIsSaving(true);

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      restriction_type: restrictionType,
      target_ids: restrictionType === "all" ? [] : targetIds,
      max_quantity: Math.floor(qty),
      period,
      starts_at: startsAt ? new Date(`${startsAt}T00:00:00`).toISOString() : null,
      expires_at: expiresAt ? new Date(`${expiresAt}T23:59:59`).toISOString() : null,
      is_active: isActive,
    };

    try {
      const url = isEditing
        ? `/api/admin/purchase-limits/${initialData!.id}`
        : "/api/admin/purchase-limits";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Failed to save purchase limit rule.");
        return;
      }

      toast.success(
        isEditing
          ? "Purchase limit rule updated successfully!"
          : "Purchase limit rule created successfully!",
        { icon: "🛡️" }
      );
      router.push("/admin/purchase-limits");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all font-body text-[14px] leading-[1.6] text-on-surface placeholder:text-outline/50";
  const labelClass =
    "block font-body text-[11px] leading-[1.0] tracking-[0.1em] font-semibold text-on-surface-variant mb-1.5 uppercase";

  const restrictionOptions: {
    value: PurchaseLimitRestrictionType;
    label: string;
    icon: string;
    desc: string;
  }[] = [
    {
      value: "all",
      label: "All Products",
      icon: "storefront",
      desc: "Store-wide order cap across entire catalog",
    },
    {
      value: "category",
      label: "Category",
      icon: "category",
      desc: "Applies to selected product categories",
    },
    {
      value: "product",
      label: "Specific Products",
      icon: "inventory_2",
      desc: "Applies to individually selected products",
    },
    {
      value: "combo",
      label: "Combos",
      icon: "auto_awesome_motion",
      desc: "Applies to ritual combos or specific sets",
    },
  ];

  const periodOptions: {
    value: PurchaseLimitPeriod;
    label: string;
    desc: string;
  }[] = [
    { value: "per_order", label: "Per Order", desc: "Max limit allowed within a single checkout" },
    { value: "daily", label: "Daily (24h)", desc: "Rolling 24-hour customer purchase limit" },
    { value: "weekly", label: "Weekly (7d)", desc: "Rolling 7-day customer purchase limit" },
    { value: "monthly", label: "Monthly (30d)", desc: "Rolling 30-day customer purchase limit" },
    { value: "lifetime", label: "Lifetime", desc: "All-time customer account limit" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-error-container/20 border border-error/30 text-error font-body text-[13px] flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* 1. Basic Rule Info */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-[18px] text-on-surface">Rule Details</h2>

        <div>
          <label className={labelClass}>Rule Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Max 2 Red Wine Face Wash per month"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Description / Notes (Optional)</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Internal reason or campaign context..."
            className={inputClass}
          />
        </div>
      </div>

      {/* 2. Restriction Type & Target Selection */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-[18px] text-on-surface">Restriction Scope</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {restrictionOptions.map((opt) => {
            const selected = restrictionType === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRestrictionType(opt.value)}
                className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  selected
                    ? "bg-primary/5 border-primary shadow-xs ring-1 ring-primary/30"
                    : "bg-surface-container-lowest border-outline-variant/60 hover:border-primary/40 hover:bg-surface-container-low"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[24px] mt-0.5 ${
                    selected ? "text-primary" : "text-on-surface-variant"
                  }`}
                >
                  {opt.icon}
                </span>
                <div>
                  <div
                    className={`font-body text-[14px] font-semibold ${
                      selected ? "text-primary" : "text-on-surface"
                    }`}
                  >
                    {opt.label}
                  </div>
                  <div className="font-body text-[12px] text-on-surface-variant leading-snug mt-0.5">
                    {opt.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Global info */}
        {restrictionType === "all" && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-on-surface font-body text-[13px] flex items-center gap-2 mt-3">
            <span className="material-symbols-outlined text-primary text-[20px]">info</span>
            <span>This rule will enforce a store-wide limit across all products in the catalog.</span>
          </div>
        )}

        {/* Category picker */}
        {restrictionType === "category" && (
          <MultiCheckList
            label="Select Product Categories"
            items={categories.map((c) => ({ id: c.slug, label: c.name }))}
            selectedIds={targetIds}
            onToggle={toggleTargetId}
            onSelectAll={handleSelectAllTargets}
            onClearAll={handleClearAllTargets}
            loading={loadingCategories}
            emptyMsg="No categories found."
          />
        )}

        {/* Product picker */}
        {restrictionType === "product" && (
          <MultiCheckList
            label="Select Specific Products"
            items={products.map((p) => ({
              id: p.id,
              label: p.variant_name ? `${p.name} (${p.variant_name})` : p.name,
              badge: p.is_active ? undefined : "Inactive",
            }))}
            selectedIds={targetIds}
            onToggle={toggleTargetId}
            onSelectAll={handleSelectAllTargets}
            onClearAll={handleClearAllTargets}
            loading={loadingProducts}
            emptyMsg="No products found."
          />
        )}

        {/* Combo picker */}
        {restrictionType === "combo" && (
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant/60 cursor-pointer hover:bg-surface-container-low transition-colors">
              <input
                type="checkbox"
                checked={targetIds.length === 0}
                onChange={() => setTargetIds([])}
                className="w-4 h-4 accent-primary"
              />
              <div>
                <span className="font-body text-[13px] font-semibold text-on-surface">
                  All Combos & Ritual Sets
                </span>
                <p className="font-body text-[11px] text-on-surface-variant">
                  Apply limit automatically to all existing and newly created combo products.
                </p>
              </div>
            </label>

            {targetIds.length > 0 && (
              <p className="font-body text-[12px] text-on-surface-variant">
                Or uncheck to restrict specific combos:
              </p>
            )}

            <MultiCheckList
              label="Or Restrict Specific Combos"
              items={combos.map((c) => ({ id: c.id, label: c.name }))}
              selectedIds={targetIds}
              onToggle={toggleTargetId}
              onSelectAll={handleSelectAllTargets}
              onClearAll={handleClearAllTargets}
              loading={loadingProducts}
              emptyMsg="No combos found."
            />
          </div>
        )}
      </div>

      {/* 3. Limit Quantity & Period */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-[18px] text-on-surface">Limit & Frequency</h2>

        <div>
          <label className={labelClass}>Maximum Allowed Quantity (Units) *</label>
          <div className="flex items-center gap-3 max-w-xs">
            <input
              type="number"
              min={1}
              max={100}
              required
              value={maxQuantity}
              onChange={(e) => setMaxQuantity(e.target.value)}
              className={inputClass}
            />
            <span className="font-body text-[13px] text-on-surface-variant font-medium">units</span>
          </div>
          <p className="font-body text-[11px] text-on-surface-variant mt-1">
            The maximum number of units an eligible customer can purchase within the configured period.
          </p>
        </div>

        <div>
          <label className={labelClass}>Tracking Period *</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {periodOptions.map((opt) => {
              const selected = period === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPeriod(opt.value)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selected
                      ? "bg-primary/5 border-primary shadow-xs ring-1 ring-primary/30"
                      : "bg-surface-container-lowest border-outline-variant/60 hover:border-primary/40 hover:bg-surface-container-low"
                  }`}
                >
                  <div
                    className={`font-body text-[13px] font-semibold ${
                      selected ? "text-primary" : "text-on-surface"
                    }`}
                  >
                    {opt.label}
                  </div>
                  <div className="font-body text-[11px] text-on-surface-variant mt-0.5">
                    {opt.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Validity & Active Toggle */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-[18px] text-on-surface">Validity & Status</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Start Date (Optional)</label>
            <input
              type="date"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>End Date (Optional)</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <div>
              <span className="font-body text-[14px] font-semibold text-on-surface">
                Rule is Active
              </span>
              <p className="font-body text-[12px] text-on-surface-variant">
                When active, restrictions will be strictly enforced at product detail, cart, and checkout.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/admin/purchase-limits")}
          disabled={isSaving}
          className="px-5 py-3 rounded-xl border border-outline-variant text-on-surface font-body text-[14px] font-medium hover:bg-surface-container-low transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-7 py-3 rounded-xl bg-primary hover:bg-[#9d4d6e] active:scale-95 text-on-primary font-body text-[14px] font-semibold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[18px]">
                progress_activity
              </span>
              Saving...
            </>
          ) : isEditing ? (
            "Save Changes"
          ) : (
            "Create Purchase Limit"
          )}
        </button>
      </div>
    </form>
  );
}
