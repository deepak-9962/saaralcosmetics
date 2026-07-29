"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import GradientBackground from "@/components/layout/GradientBackground";
import type { PromoCode } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

type FilterTab = "all" | "active" | "inactive" | "expired";

function StatusBadge({ promo }: { promo: PromoCode }) {
  const now = new Date();
  const isExpired = promo.expires_at ? new Date(promo.expires_at) < now : false;
  const isNotStarted = promo.starts_at ? new Date(promo.starts_at) > now : false;

  if (!promo.is_active)
    return (
      <span className="px-2.5 py-1 rounded-full font-body text-[10px] tracking-[0.06em] font-medium bg-error-container/30 text-error">
        Inactive
      </span>
    );
  if (isExpired)
    return (
      <span className="px-2.5 py-1 rounded-full font-body text-[10px] tracking-[0.06em] font-medium bg-surface-container-high text-on-surface-variant">
        Expired
      </span>
    );
  if (isNotStarted)
    return (
      <span className="px-2.5 py-1 rounded-full font-body text-[10px] tracking-[0.06em] font-medium bg-secondary-container/40 text-on-secondary-container">
        Scheduled
      </span>
    );
  return (
    <span className="px-2.5 py-1 rounded-full font-body text-[10px] tracking-[0.06em] font-medium bg-emerald-100 text-emerald-700">
      Active
    </span>
  );
}

function formatDiscount(promo: PromoCode): string {
  if (promo.discount_type === "percentage") {
    const cap = promo.max_discount_cap ? ` (max ₹${promo.max_discount_cap})` : "";
    return `${promo.discount_value}%${cap}`;
  }
  return formatPrice(promo.discount_value);
}

function isExpired(promo: PromoCode): boolean {
  return !!promo.expires_at && new Date(promo.expires_at) < new Date();
}

export default function PromoCodesPage() {
  const router = useRouter();
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCodes = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/promo-codes");
      const json = await res.json();
      if (res.ok) {
        setCodes(json.codes ?? []);
      } else {
        toast.error(json.error ?? "Failed to load promo codes.");
      }
    } catch {
      toast.error("Network error loading promo codes.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const handleDelete = async (promo: PromoCode) => {
    const confirmed = confirm(
      promo.times_used > 0
        ? `"${promo.code}" has been used ${promo.times_used} time(s) and cannot be permanently deleted. Deactivate it instead?`
        : `Permanently delete code "${promo.code}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(promo.id);
    try {
      const res = await fetch(`/api/admin/promo-codes/${promo.id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "Failed.");
        return;
      }
      if (json.deactivated) {
        toast("Code deactivated (has order history).", { icon: "⚠️", duration: 4000 });
      } else {
        toast.success(`"${promo.code}" deleted.`);
      }
      fetchCodes();
    } catch {
      toast.error("Network error.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = codes.filter((c) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return c.is_active && !isExpired(c);
    if (activeTab === "inactive") return !c.is_active;
    if (activeTab === "expired") return isExpired(c);
    return true;
  });

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "inactive", label: "Inactive" },
    { key: "expired", label: "Expired" },
  ];

  return (
    <div className="min-h-screen relative">
      <GradientBackground />
      <div className="relative max-w-[1100px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-[32px] text-on-surface">Promo Codes</h1>
            <p className="font-body text-[14px] text-on-surface-variant mt-1">
              {codes.length} code{codes.length !== 1 ? "s" : ""} total
            </p>
          </div>
          <Link
            href="/admin/promo-codes/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-on-primary font-body text-[13px] font-medium hover:bg-[#9d4d6e] active:scale-95 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Code
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg font-body text-[12px] font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-on-primary"
                  : "bg-surface border border-outline-variant text-on-surface-variant hover:border-primary/40 hover:text-on-surface"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <span className="material-symbols-outlined animate-spin text-[32px] text-primary">
              progress_activity
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline">local_offer</span>
            <p className="font-body text-[16px] text-on-surface-variant">
              {activeTab === "all" ? "No promo codes yet." : `No ${activeTab} codes.`}
            </p>
            {activeTab === "all" && (
              <Link
                href="/admin/promo-codes/new"
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-body text-[13px] font-medium hover:bg-[#9d4d6e] transition-all"
              >
                Create your first code
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-surface rounded-xl border border-outline-variant/50 overflow-hidden">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[2fr_1.2fr_1fr_1fr_0.6fr_0.8fr] gap-4 px-5 py-3 border-b border-outline-variant/30 bg-surface-container-low font-body text-[10px] tracking-[0.1em] uppercase font-medium text-on-surface-variant">
              <span>Code</span>
              <span>Discount</span>
              <span>Usage</span>
              <span>Status</span>
              <span>Banner</span>
              <span className="text-right">Actions</span>
            </div>

            <AnimatePresence initial={false}>
              {filtered.map((promo, i) => (
                <motion.div
                  key={promo.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="grid grid-cols-1 md:grid-cols-[2fr_1.2fr_1fr_1fr_0.6fr_0.8fr] gap-2 md:gap-4 items-start md:items-center px-5 py-4 border-b border-outline-variant/20 last:border-0 hover:bg-surface-container-lowest transition-colors"
                >
                  {/* Code */}
                  <div className="flex flex-col gap-0.5">
                    <span className="font-body text-[14px] font-semibold text-on-surface tracking-wider">
                      {promo.code}
                    </span>
                    {promo.description && (
                      <span className="font-body text-[11px] text-on-surface-variant/70 truncate max-w-[280px]">
                        {promo.description}
                      </span>
                    )}
                    {promo.expires_at && (
                      <span className="font-body text-[10px] text-on-surface-variant/50">
                        Expires {new Date(promo.expires_at).toLocaleDateString("en-IN")}
                      </span>
                    )}
                  </div>

                  {/* Discount */}
                  <span className="font-body text-[13px] text-on-surface">
                    {formatDiscount(promo)}
                    {promo.min_order_value ? (
                      <span className="block text-[10px] text-on-surface-variant/60 mt-0.5">
                        Min ₹{promo.min_order_value}
                      </span>
                    ) : null}
                  </span>

                  {/* Usage */}
                  <span className="font-body text-[13px] text-on-surface">
                    {promo.times_used}
                    {promo.usage_limit_total ? ` / ${promo.usage_limit_total}` : ""}
                    <span className="block text-[10px] text-on-surface-variant/60 mt-0.5">times used</span>
                  </span>

                  {/* Status */}
                  <div>
                    <StatusBadge promo={promo} />
                  </div>

                  {/* Banner */}
                  <div>
                    {promo.show_in_banner ? (
                      <span className="inline-flex items-center gap-1 font-body text-[10px] text-emerald-600">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        On
                      </span>
                    ) : (
                      <span className="font-body text-[10px] text-on-surface-variant/40">Off</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => router.push(`/admin/promo-codes/${promo.id}/edit`)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(promo)}
                      disabled={deletingId === promo.id}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/5 transition-all disabled:opacity-40"
                      title={promo.times_used > 0 ? "Deactivate" : "Delete"}
                    >
                      {deletingId === promo.id ? (
                        <span className="material-symbols-outlined animate-spin text-[16px]">
                          progress_activity
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-[18px]">
                          {promo.times_used > 0 ? "block" : "delete"}
                        </span>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
