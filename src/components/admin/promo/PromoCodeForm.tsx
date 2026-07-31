"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import type { PromoCode } from "@/lib/types";

interface PromoCodeFormProps {
  /** If provided, we are editing an existing code */
  initialData?: PromoCode;
}

const CATEGORY_OPTIONS = [
  { value: "face-cream", label: "Face Cream" },
  { value: "face-wash", label: "Face Wash" },
  { value: "soap", label: "Soap" },
  { value: "nalangu-maavu", label: "Nalangu Maavu" },
];

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  // Convert ISO to YYYY-MM-DD for <input type="date">
  return iso.slice(0, 10);
}

export default function PromoCodeForm({ initialData }: PromoCodeFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [code, setCode] = useState(initialData?.code ?? "");
  const [discountType, setDiscountType] = useState<"percentage" | "flat">(
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
  const [appliesTo, setAppliesTo] = useState<"all" | "category" | "product">(
    initialData?.applies_to ?? "all"
  );
  const [appliesToId, setAppliesToId] = useState(initialData?.applies_to_id ?? "");
  const [startsAt, setStartsAt] = useState(toDateInputValue(initialData?.starts_at));
  const [expiresAt, setExpiresAt] = useState(toDateInputValue(initialData?.expires_at));
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [showInBanner, setShowInBanner] = useState(initialData?.show_in_banner ?? false);
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError("Promo code is required.");
      return;
    }
    if (!discountValue || isNaN(Number(discountValue)) || Number(discountValue) <= 0) {
      setError("Discount value must be a positive number.");
      return;
    }
    if (discountType === "percentage" && Number(discountValue) > 100) {
      setError("Percentage discount cannot exceed 100%.");
      return;
    }

    setIsSaving(true);

    const payload = {
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: Number(discountValue),
      max_discount_cap: maxDiscountCap ? Number(maxDiscountCap) : null,
      min_order_value: minOrderValue ? Number(minOrderValue) : 0,
      usage_limit_total: usageLimitTotal ? Number(usageLimitTotal) : null,
      usage_limit_per_user: usageLimitPerUser ? Number(usageLimitPerUser) : null,
      applies_to: appliesTo,
      applies_to_id: appliesTo !== "all" && appliesToId ? appliesToId : null,
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

  // Shared input classes
  const inputClass =
    "w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:border-tertiary-container focus:ring-1 focus:ring-tertiary-container/30 transition-all font-body text-[14px] leading-[1.6] text-on-surface placeholder:text-outline";
  const labelClass =
    "block font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant mb-1.5 uppercase";

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
            {(["percentage", "flat"] as const).map((type) => (
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
                {type === "percentage" ? "Percentage (%)" : "Flat Amount (₹)"}
              </button>
            ))}
          </div>
        </div>

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

        {/* Applies to */}
        <div>
          <label className={labelClass}>Applies To</label>
          <div className="flex gap-3 flex-wrap">
            {(["all", "category", "product"] as const).map((scope) => (
              <button
                key={scope}
                type="button"
                onClick={() => setAppliesTo(scope)}
                className={`px-4 py-2 rounded-lg border font-body text-[12px] font-medium transition-all capitalize ${
                  appliesTo === scope
                    ? "bg-tertiary-container text-on-tertiary-container border-tertiary-container"
                    : "bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:border-primary/40"
                }`}
              >
                {scope === "all" ? "All Products" : scope === "category" ? "Category" : "Specific Product"}
              </button>
            ))}
          </div>

          {appliesTo === "category" && (
            <div className="mt-3">
              <label className={labelClass}>Category</label>
              <select
                value={appliesToId}
                onChange={(e) => setAppliesToId(e.target.value)}
                className={`${inputClass} appearance-none`}
              >
                <option value="">Select category…</option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {appliesTo === "product" && (
            <div className="mt-3">
              <label className={labelClass}>Product ID (UUID)</label>
              <input
                type="text"
                value={appliesToId}
                onChange={(e) => setAppliesToId(e.target.value)}
                placeholder="Paste product UUID"
                className={inputClass}
              />
              <p className="mt-1 font-body text-[11px] text-on-surface-variant/60">
                Find the UUID from the Products admin page.
              </p>
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
