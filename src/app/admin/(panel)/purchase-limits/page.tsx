"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import GradientBackground from "@/components/layout/GradientBackground";
import type {
  PurchaseLimitRule,
  CustomerPurchaseLimitUsage,
} from "@/lib/types";
import { formatPeriodLabel } from "@/lib/purchaseLimits";

type TabMode = "rules" | "usage";
type FilterStatus = "all" | "active" | "inactive";

function RuleStatusBadge({ rule }: { rule: PurchaseLimitRule }) {
  const now = new Date();
  const isExpired = rule.expires_at ? new Date(rule.expires_at) < now : false;
  const isScheduled = rule.starts_at ? new Date(rule.starts_at) > now : false;

  if (!rule.is_active) {
    return (
      <span className="px-2.5 py-1 rounded-full font-body text-[10px] tracking-[0.06em] font-medium bg-error-container/30 text-error">
        Inactive
      </span>
    );
  }
  if (isExpired) {
    return (
      <span className="px-2.5 py-1 rounded-full font-body text-[10px] tracking-[0.06em] font-medium bg-surface-container-high text-on-surface-variant">
        Expired
      </span>
    );
  }
  if (isScheduled) {
    return (
      <span className="px-2.5 py-1 rounded-full font-body text-[10px] tracking-[0.06em] font-medium bg-secondary-container/40 text-on-secondary-container">
        Scheduled
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded-full font-body text-[10px] tracking-[0.06em] font-semibold bg-emerald-100 text-emerald-800">
      Active
    </span>
  );
}

function RestrictionBadge({ type }: { type: PurchaseLimitRule["restriction_type"] }) {
  switch (type) {
    case "all":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
          Store-Wide
        </span>
      );
    case "category":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
          Category
        </span>
      );
    case "product":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          Product
        </span>
      );
    case "combo":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
          Combo
        </span>
      );
    default:
      return null;
  }
}

export default function PurchaseLimitsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabMode>("rules");

  // Rules State
  const [rules, setRules] = useState<PurchaseLimitRule[]>([]);
  const [loadingRules, setLoadingRules] = useState(true);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [typeFilter, setTypeFilter] = useState("all_types");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Customer Usage State
  const [usages, setUsages] = useState<CustomerPurchaseLimitUsage[]>([]);
  const [loadingUsages, setLoadingUsages] = useState(false);
  const [usageSearch, setUsageSearch] = useState("");
  const [limitReachedOnly, setLimitReachedOnly] = useState(false);

  // Fetch Rules
  const fetchRules = useCallback(async () => {
    try {
      setLoadingRules(true);
      const res = await fetch("/api/admin/purchase-limits");
      const json = await res.json();
      if (res.ok) {
        setRules(json.rules ?? []);
      } else {
        toast.error(json.error ?? "Failed to load rules.");
      }
    } catch {
      toast.error("Network error loading rules.");
    } finally {
      setLoadingRules(false);
    }
  }, []);

  // Fetch Usages
  const fetchUsages = useCallback(async () => {
    try {
      setLoadingUsages(true);
      const params = new URLSearchParams();
      if (limitReachedOnly) params.set("reached", "true");
      if (usageSearch.trim()) params.set("search", usageSearch.trim());

      const res = await fetch(`/api/admin/purchase-limits/usage?${params.toString()}`);
      const json = await res.json();
      if (res.ok) {
        setUsages(json.usages ?? []);
      } else {
        toast.error(json.error ?? "Failed to load usage report.");
      }
    } catch {
      toast.error("Network error loading usage report.");
    } finally {
      setLoadingUsages(false);
    }
  }, [limitReachedOnly, usageSearch]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  useEffect(() => {
    if (tab === "usage") {
      fetchUsages();
    }
  }, [tab, fetchUsages]);

  // Toggle active/inactive
  const handleToggleActive = async (rule: PurchaseLimitRule) => {
    const nextState = !rule.is_active;
    try {
      const res = await fetch(`/api/admin/purchase-limits/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: nextState }),
      });
      if (res.ok) {
        toast.success(
          nextState
            ? `"${rule.name}" activated!`
            : `"${rule.name}" deactivated!`
        );
        setRules((prev) =>
          prev.map((r) => (r.id === rule.id ? { ...r, is_active: nextState } : r))
        );
      } else {
        toast.error("Failed to update status.");
      }
    } catch {
      toast.error("Network error.");
    }
  };

  // Delete rule
  const handleDelete = async (rule: PurchaseLimitRule) => {
    if (!confirm(`Delete purchase limit "${rule.name}"? This cannot be undone.`)) {
      return;
    }
    setDeletingId(rule.id);
    try {
      const res = await fetch(`/api/admin/purchase-limits/${rule.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(`"${rule.name}" deleted.`);
        setRules((prev) => prev.filter((r) => r.id !== rule.id));
      } else {
        toast.error("Failed to delete rule.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered Rules
  const filteredRules = rules.filter((r) => {
    if (statusFilter === "active" && !r.is_active) return false;
    if (statusFilter === "inactive" && r.is_active) return false;
    if (typeFilter !== "all_types" && r.restriction_type !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return r.name.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="p-[var(--spacing-margin-mobile)] md:p-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto w-full flex-grow flex flex-col gap-[var(--spacing-stack-lg)] overflow-y-auto custom-scrollbar">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-[32px] md:text-[40px] text-on-surface leading-tight">
            Purchase Limits
          </h1>
          <p className="font-body text-[15px] text-on-surface-variant mt-1">
            Configure order and periodic purchase caps across products, categories, combos, and store-wide.
          </p>
        </div>

        <Link
          href="/admin/purchase-limits/new"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-[#9d4d6e] active:scale-95 text-on-primary font-body text-[14px] font-semibold transition-all shadow-sm self-start sm:self-auto shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          New Limit Rule
        </Link>
      </motion.header>

      {/* Main Tabs: Rules vs Usage Reporting */}
      <div className="flex items-center gap-2 border-b border-outline-variant/50 pb-1">
        <button
          type="button"
          onClick={() => setTab("rules")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-body text-[14px] font-semibold transition-all cursor-pointer ${
            tab === "rules"
              ? "bg-primary text-on-primary shadow-xs"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">rule</span>
          Limit Rules ({rules.length})
        </button>

        <button
          type="button"
          onClick={() => setTab("usage")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-body text-[14px] font-semibold transition-all cursor-pointer ${
            tab === "usage"
              ? "bg-primary text-on-primary shadow-xs"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">analytics</span>
          Customer Usage & Reports
        </button>
      </div>

      {/* TAB 1: RULES MANAGEMENT */}
      {tab === "rules" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search rules by name or description..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-outline-variant/60 font-body text-[13px] text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-outline-variant/60 font-body text-[13px] text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="all_types">All Scopes</option>
                <option value="all">Store-Wide</option>
                <option value="category">Category</option>
                <option value="product">Product</option>
                <option value="combo">Combos</option>
              </select>

              {/* Status Filter */}
              <div className="flex items-center bg-surface-container-low rounded-xl p-1 border border-outline-variant/40">
                {(["all", "active", "inactive"] as FilterStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg font-body text-[12px] font-medium capitalize transition-all cursor-pointer ${
                      statusFilter === st
                        ? "bg-white text-primary shadow-xs font-semibold"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Rules Table */}
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-surface-container-low font-body text-[11px] leading-[1.0] tracking-[0.1em] font-semibold text-on-surface-variant uppercase">
                  <tr>
                    <th className="p-4 text-left">Rule Name</th>
                    <th className="p-4 text-left">Scope</th>
                    <th className="p-4 text-left">Limit</th>
                    <th className="p-4 text-left">Period</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="font-body text-[14px] divide-y divide-outline-variant/20 text-on-surface">
                  {loadingRules ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                        <div className="flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined animate-spin text-[20px] text-primary">
                            progress_activity
                          </span>
                          Loading purchase limits...
                        </div>
                      </td>
                    </tr>
                  ) : filteredRules.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                        <div className="flex flex-col items-center gap-2">
                          <span className="material-symbols-outlined text-[32px] text-outline/50">
                            production_quantity_limits
                          </span>
                          <p className="font-semibold">No purchase limit rules found.</p>
                          <p className="text-[12px]">
                            {search || statusFilter !== "all" || typeFilter !== "all_types"
                              ? "Try adjusting your filters or search query."
                              : "Click 'New Limit Rule' to create your first purchase restriction."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRules.map((rule) => (
                      <tr
                        key={rule.id}
                        className="hover:bg-surface-container-low/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-semibold text-on-surface">{rule.name}</div>
                          {rule.description && (
                            <div className="text-[12px] text-on-surface-variant line-clamp-1 mt-0.5">
                              {rule.description}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <RestrictionBadge type={rule.restriction_type} />
                        </td>
                        <td className="p-4 font-semibold text-primary">
                          {rule.max_quantity} {rule.max_quantity === 1 ? "unit" : "units"}
                        </td>
                        <td className="p-4 capitalize">
                          {formatPeriodLabel(rule.period)}
                        </td>
                        <td className="p-4">
                          <RuleStatusBadge rule={rule} />
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Quick status toggle */}
                            <button
                              type="button"
                              onClick={() => handleToggleActive(rule)}
                              title={rule.is_active ? "Deactivate Rule" : "Activate Rule"}
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                rule.is_active
                                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "border-outline-variant bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                              }`}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {rule.is_active ? "toggle_on" : "toggle_off"}
                              </span>
                            </button>

                            {/* Edit */}
                            <Link
                              href={`/admin/purchase-limits/${rule.id}/edit`}
                              className="p-1.5 rounded-lg border border-outline-variant hover:border-primary/40 hover:bg-primary/5 text-on-surface-variant hover:text-primary transition-all"
                              title="Edit Rule"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </Link>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDelete(rule)}
                              disabled={deletingId === rule.id}
                              className="p-1.5 rounded-lg border border-outline-variant hover:border-error/40 hover:bg-error-container/20 text-on-surface-variant hover:text-error transition-all cursor-pointer disabled:opacity-40"
                              title="Delete Rule"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMER USAGE REPORTING */}
      {tab === "usage" && (
        <div className="space-y-4">
          {/* Usage Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                search
              </span>
              <input
                type="text"
                value={usageSearch}
                onChange={(e) => setUsageSearch(e.target.value)}
                placeholder="Search by customer name, phone, email, or rule..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-outline-variant/60 font-body text-[13px] text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={limitReachedOnly}
                  onChange={(e) => setLimitReachedOnly(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="font-body text-[13px] font-semibold text-error">
                  Limits Reached Only
                </span>
              </label>

              <button
                type="button"
                onClick={fetchUsages}
                className="p-2 rounded-xl border border-outline-variant hover:bg-surface-container-low transition-colors"
                title="Refresh Report"
              >
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                  refresh
                </span>
              </button>
            </div>
          </div>

          {/* Usage Table */}
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-surface-container-low font-body text-[11px] leading-[1.0] tracking-[0.1em] font-semibold text-on-surface-variant uppercase">
                  <tr>
                    <th className="p-4 text-left">Customer</th>
                    <th className="p-4 text-left">Restricted Rule</th>
                    <th className="p-4 text-left">Purchased</th>
                    <th className="p-4 text-left">Remaining</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Period Reset</th>
                  </tr>
                </thead>
                <tbody className="font-body text-[14px] divide-y divide-outline-variant/20 text-on-surface">
                  {loadingUsages ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                        <div className="flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined animate-spin text-[20px] text-primary">
                            progress_activity
                          </span>
                          Analyzing customer order compliance...
                        </div>
                      </td>
                    </tr>
                  ) : usages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                        <div className="flex flex-col items-center gap-2">
                          <span className="material-symbols-outlined text-[32px] text-emerald-500">
                            verified
                          </span>
                          <p className="font-semibold">No customers have violated or reached purchase limits.</p>
                          <p className="text-[12px]">All customer orders are fully compliant with active rules.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    usages.map((u, idx) => (
                      <tr
                        key={`${u.customerId}-${u.ruleId}-${idx}`}
                        className={`hover:bg-surface-container-low/50 transition-colors ${
                          u.isLimitReached ? "bg-red-50/30" : ""
                        }`}
                      >
                        <td className="p-4">
                          <div className="font-semibold text-on-surface">{u.customerName}</div>
                          <div className="text-[12px] text-on-surface-variant flex items-center gap-2">
                            <span>{u.customerPhone}</span>
                            {u.customerEmail && <span>• {u.customerEmail}</span>}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-on-surface">{u.ruleName}</div>
                          <div className="text-[11px] text-on-surface-variant capitalize">
                            {u.restrictionType} limit ({formatPeriodLabel(u.period)})
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-on-surface">
                            {u.purchasedQuantity}
                          </span>{" "}
                          <span className="text-[12px] text-on-surface-variant">
                            / {u.maxQuantity} units
                          </span>
                        </td>
                        <td className="p-4 font-semibold">
                          <span
                            className={
                              u.remainingQuantity === 0
                                ? "text-error"
                                : "text-emerald-700"
                            }
                          >
                            {u.remainingQuantity} remaining
                          </span>
                        </td>
                        <td className="p-4">
                          {u.isLimitReached ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-error-container text-error border border-error/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-error" />
                              Limit Reached
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              Eligible
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-[12px] text-on-surface-variant">
                          {u.resetDate
                            ? new Date(u.resetDate).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : u.period === "lifetime"
                            ? "Never (Lifetime)"
                            : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
