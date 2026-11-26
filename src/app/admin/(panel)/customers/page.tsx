"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { listCustomers, listOrders, subscribeToCustomers, subscribeToOrders } from "@/lib/supabase/data";
import { formatPrice } from "@/lib/utils";
import type { Customer } from "@/lib/supabase/data";
import type { Order, OrderStatus } from "@/lib/types";

type PaymentFilter = "all" | "paid" | "pending" | "failed" | "unpaid_only";
type CustomerTypeFilter = "all" | "returning" | "first_time" | "vip";
type SortOption = "recent" | "oldest" | "highest_spend" | "lowest_spend" | "most_orders" | "name_asc";

interface CustomerOrderMeta {
  paidCount: number;
  pendingCount: number;
  failedCount: number;
  latestPaymentStatus: Order["payment_status"] | null;
  latestOrderStatus: OrderStatus | null;
  orderStatuses: Set<OrderStatus>;
  states: Set<string>;
  primaryState: string | null;
}

function normalizePhoneKey(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function getPaymentBadge(meta: CustomerOrderMeta | undefined) {
  if (!meta || !meta.latestPaymentStatus) {
    return { label: "No Orders", className: "bg-surface-container text-on-surface-variant" };
  }
  if (meta.paidCount > 0 && meta.pendingCount === 0 && meta.failedCount === 0) {
    return { label: "Paid", className: "bg-emerald-100 text-emerald-800" };
  }
  if (meta.paidCount > 0 && meta.pendingCount > 0) {
    return { label: `Paid (${meta.paidCount}) · Pending (${meta.pendingCount})`, className: "bg-emerald-50 text-emerald-800 border border-emerald-200" };
  }
  if (meta.pendingCount > 0) {
    return { label: "Pending", className: "bg-yellow-100 text-yellow-800" };
  }
  if (meta.failedCount > 0) {
    return { label: "Failed", className: "bg-red-100 text-red-800" };
  }
  return { label: "Pending", className: "bg-yellow-100 text-yellow-800" };
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | OrderStatus>("all");
  const [customerTypeFilter, setCustomerTypeFilter] = useState<CustomerTypeFilter>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [minSpendFilter, setMinSpendFilter] = useState<number>(0);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [customerData, orderData] = await Promise.all([listCustomers(), listOrders()]);
        setCustomers(customerData);
        setOrders(orderData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load customers.");
      } finally {
        setIsLoading(false);
      }
    }
    load();

    const unsubCustomers = subscribeToCustomers(() => {
      listCustomers().then(setCustomers).catch(console.error);
    });
    const unsubOrders = subscribeToOrders(
      (newOrder) => {
        setOrders((prev) => [newOrder, ...prev]);
      },
      (updatedOrder) => {
        setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
      }
    );

    return () => {
      unsubCustomers();
      unsubOrders();
    };
  }, []);

  // Build per-customer order metadata keyed by normalized phone
  const orderMetaByPhone = useMemo(() => {
    const map = new Map<string, CustomerOrderMeta>();
    for (const order of orders) {
      const key = normalizePhoneKey(order.customer_phone);
      let meta = map.get(key);
      if (!meta) {
        meta = {
          paidCount: 0,
          pendingCount: 0,
          failedCount: 0,
          latestPaymentStatus: order.payment_status,
          latestOrderStatus: order.order_status,
          orderStatuses: new Set<OrderStatus>(),
          states: new Set<string>(),
          primaryState: order.state?.trim() || null,
        };
        map.set(key, meta);
      }
      if (order.payment_status === "paid") meta.paidCount += 1;
      else if (order.payment_status === "pending") meta.pendingCount += 1;
      else if (order.payment_status === "failed") meta.failedCount += 1;

      meta.orderStatuses.add(order.order_status);
      const st = order.state?.trim();
      if (st) {
        meta.states.add(st);
        if (!meta.primaryState) meta.primaryState = st;
      }
    }
    return map;
  }, [orders]);

  // Distinct states for dropdown
  const availableStates = useMemo(() => {
    const set = new Set<string>();
    for (const meta of orderMetaByPhone.values()) {
      for (const st of meta.states) set.add(st);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [orderMetaByPhone]);

  // Counts for quick payment filter pills
  const paymentCounts = useMemo(() => {
    let paid = 0;
    let pending = 0;
    let failed = 0;
    let unpaidOnly = 0;
    for (const c of customers) {
      const meta = orderMetaByPhone.get(normalizePhoneKey(c.phone));
      if (!meta) continue;
      if (meta.paidCount > 0) paid += 1;
      if (meta.pendingCount > 0) pending += 1;
      if (meta.failedCount > 0) failed += 1;
      if (meta.paidCount === 0 && (meta.pendingCount > 0 || meta.failedCount > 0)) unpaidOnly += 1;
    }
    return { paid, pending, failed, unpaidOnly };
  }, [customers, orderMetaByPhone]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (paymentFilter !== "all") count += 1;
    if (orderStatusFilter !== "all") count += 1;
    if (customerTypeFilter !== "all") count += 1;
    if (stateFilter !== "all") count += 1;
    if (minSpendFilter > 0) count += 1;
    if (dateFrom) count += 1;
    if (dateTo) count += 1;
    return count;
  }, [paymentFilter, orderStatusFilter, customerTypeFilter, stateFilter, minSpendFilter, dateFrom, dateTo]);

  function clearAllFilters() {
    setSearchQuery("");
    setPaymentFilter("all");
    setOrderStatusFilter("all");
    setCustomerTypeFilter("all");
    setStateFilter("all");
    setMinSpendFilter(0);
    setDateFrom("");
    setDateTo("");
    setSortBy("recent");
  }

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = customers.filter((c) => {
      const meta = orderMetaByPhone.get(normalizePhoneKey(c.phone));

      if (q) {
        const matchesText =
          c.phone.toLowerCase().includes(q) ||
          (c.name ?? "").toLowerCase().includes(q) ||
          (c.email ?? "").toLowerCase().includes(q) ||
          (meta?.primaryState ?? "").toLowerCase().includes(q);
        if (!matchesText) return false;
      }

      if (paymentFilter !== "all") {
        if (!meta) return false;
        if (paymentFilter === "paid" && meta.paidCount === 0) return false;
        if (paymentFilter === "pending" && meta.pendingCount === 0) return false;
        if (paymentFilter === "failed" && meta.failedCount === 0) return false;
        if (paymentFilter === "unpaid_only" && meta.paidCount > 0) return false;
      }

      if (orderStatusFilter !== "all") {
        if (!meta || !meta.orderStatuses.has(orderStatusFilter)) return false;
      }

      if (customerTypeFilter === "returning" && c.order_count <= 1) return false;
      if (customerTypeFilter === "first_time" && c.order_count !== 1) return false;
      if (customerTypeFilter === "vip" && c.total_spent < 1000 && c.order_count < 3) return false;

      if (stateFilter !== "all") {
        if (!meta || !meta.states.has(stateFilter)) return false;
      }

      if (minSpendFilter > 0 && c.total_spent < minSpendFilter) return false;

      if (dateFrom) {
        const lastOrderDate = new Date(c.last_seen_at);
        const fromDate = new Date(`${dateFrom}T00:00:00`);
        if (lastOrderDate < fromDate) return false;
      }

      if (dateTo) {
        const lastOrderDate = new Date(c.last_seen_at);
        const toDate = new Date(`${dateTo}T23:59:59`);
        if (lastOrderDate > toDate) return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.last_seen_at).getTime() - new Date(b.last_seen_at).getTime();
      }
      if (sortBy === "highest_spend") return b.total_spent - a.total_spent;
      if (sortBy === "lowest_spend") return a.total_spent - b.total_spent;
      if (sortBy === "most_orders") return b.order_count - a.order_count;
      if (sortBy === "name_asc") return (a.name ?? a.phone).localeCompare(b.name ?? b.phone);
      // "recent"
      return new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime();
    });
  }, [
    customers,
    orderMetaByPhone,
    searchQuery,
    paymentFilter,
    orderStatusFilter,
    customerTypeFilter,
    stateFilter,
    minSpendFilter,
    dateFrom,
    dateTo,
    sortBy,
  ]);

  const hasActiveCriteria = activeFilterCount > 0 || searchQuery.trim().length > 0;
  const statsSource = hasActiveCriteria ? filteredCustomers : customers;
  const totalRevenue = useMemo(() => statsSource.reduce((s, c) => s + c.total_spent, 0), [statsSource]);
  const returningCount = useMemo(() => statsSource.filter((c) => c.order_count > 1).length, [statsSource]);

  return (
    <div className="p-[var(--spacing-margin-mobile)] md:p-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto w-full flex-grow flex flex-col gap-[var(--spacing-stack-md)]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-[36px] md:text-[48px] leading-[1.2] text-on-surface">Customers</h1>
        <p className="font-body text-[18px] leading-[1.6] text-on-surface-variant mt-1">
          All customers identified by phone number at checkout.
        </p>
      </motion.div>

      {/* Summary stats */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {[
          {
            label: hasActiveCriteria ? "Matching Customers" : "Total Customers",
            value: statsSource.length.toString(),
            icon: "group",
          },
          { label: "Returning", value: returningCount.toString(), icon: "repeat" },
          { label: "Total Revenue", value: formatPrice(totalRevenue), icon: "payments" },
          {
            label: "Avg Spend / Customer",
            value: statsSource.length > 0 ? formatPrice(totalRevenue / statsSource.length) : "—",
            icon: "trending_up",
          },
        ].map((card) => (
          <div key={card.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
            <div className="flex items-start justify-between mb-2">
              <p className="font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">
                {card.label}
              </p>
              <span className="material-symbols-outlined text-primary text-[18px]">{card.icon}</span>
            </div>
            <p className="font-display text-[26px] leading-[1.2] text-on-surface">{card.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Search & Quick Filter Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by name, phone, email, or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-surface-container-lowest border border-outline-variant rounded-xl font-body text-[14px] text-on-surface focus:outline-none focus:border-tertiary-container transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className={`h-11 px-4 rounded-xl border font-body text-[13px] leading-[1.0] tracking-[0.08em] font-medium inline-flex items-center justify-center gap-2 uppercase cursor-pointer transition-all ${
              showFilters || activeFilterCount > 0
                ? "bg-primary-container/50 border-primary/40 text-on-surface"
                : "bg-surface-container-low border-outline-variant/60 text-on-surface hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            Filters
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-primary text-white text-[10px] font-semibold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick Payment Status Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-body text-[11px] uppercase tracking-[0.08em] text-on-surface-variant mr-1">
            Payment:
          </span>
          {(
            [
              { id: "all", label: `All (${customers.length})`, dot: null },
              { id: "paid", label: `Paid (${paymentCounts.paid})`, dot: "bg-emerald-500" },
              { id: "pending", label: `Pending (${paymentCounts.pending})`, dot: "bg-yellow-500" },
              { id: "failed", label: `Failed (${paymentCounts.failed})`, dot: "bg-red-500" },
              { id: "unpaid_only", label: `Unpaid Only (${paymentCounts.unpaidOnly})`, dot: "bg-orange-500" },
            ] as const
          ).map((pill) => {
            const active = paymentFilter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setPaymentFilter(pill.id)}
                className={`h-8 px-3 rounded-full border font-body text-[12px] font-medium inline-flex items-center gap-1.5 cursor-pointer transition-all ${
                  active
                    ? "bg-primary-container border-primary/40 text-on-primary-container font-semibold shadow-xs"
                    : "bg-surface-container-lowest border-outline-variant/60 text-on-surface-variant hover:border-outline-variant hover:text-on-surface"
                }`}
              >
                {pill.dot && <span className={`w-2 h-2 rounded-full ${pill.dot}`} />}
                <span>{pill.label}</span>
              </button>
            );
          })}

          {hasActiveCriteria && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="ml-auto font-body text-[12px] font-medium text-primary hover:underline cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Collapsible Advanced Filters */}
        <AnimatePresence initial={false}>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Order Fulfillment Status */}
                  <div>
                    <label className="block font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase mb-2">
                      Order Status
                    </label>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value as "all" | OrderStatus)}
                      className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-[14px] text-on-surface focus:outline-none focus:border-tertiary-container"
                    >
                      <option value="all">All Order Statuses</option>
                      <option value="new">New</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Customer Segment */}
                  <div>
                    <label className="block font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase mb-2">
                      Customer Segment
                    </label>
                    <select
                      value={customerTypeFilter}
                      onChange={(e) => setCustomerTypeFilter(e.target.value as CustomerTypeFilter)}
                      className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-[14px] text-on-surface focus:outline-none focus:border-tertiary-container"
                    >
                      <option value="all">All Customers</option>
                      <option value="returning">Returning (2+ orders)</option>
                      <option value="first_time">First-Time (1 order)</option>
                      <option value="vip">VIP (₹1,000+ or 3+ orders)</option>
                    </select>
                  </div>

                  {/* State / Region */}
                  <div>
                    <label className="block font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase mb-2">
                      State / Region
                    </label>
                    <select
                      value={stateFilter}
                      onChange={(e) => setStateFilter(e.target.value)}
                      className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-[14px] text-on-surface focus:outline-none focus:border-tertiary-container"
                    >
                      <option value="all">All States</option>
                      {availableStates.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Minimum Spend */}
                  <div>
                    <label className="block font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase mb-2">
                      Minimum Total Spend
                    </label>
                    <select
                      value={minSpendFilter}
                      onChange={(e) => setMinSpendFilter(Number(e.target.value))}
                      className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-[14px] text-on-surface focus:outline-none focus:border-tertiary-container"
                    >
                      <option value={0}>Any Spend</option>
                      <option value={250}>₹250+</option>
                      <option value={500}>₹500+</option>
                      <option value={1000}>₹1,000+</option>
                      <option value={2500}>₹2,500+</option>
                      <option value={5000}>₹5,000+</option>
                    </select>
                  </div>

                  {/* Last Order Date From */}
                  <div>
                    <label className="block font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase mb-2">
                      Last Order From
                    </label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-[14px] text-on-surface focus:outline-none focus:border-tertiary-container"
                    />
                  </div>

                  {/* Last Order Date To */}
                  <div>
                    <label className="block font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase mb-2">
                      Last Order To
                    </label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-[14px] text-on-surface focus:outline-none focus:border-tertiary-container"
                    />
                  </div>

                  {/* Sort By */}
                  <div className="sm:col-span-2 lg:col-span-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-outline-variant/40">
                    <div className="flex items-center gap-2">
                      <label className="font-body text-[11px] tracking-[0.1em] font-medium text-on-surface-variant uppercase">
                        Sort By:
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="h-9 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-[13px] text-on-surface focus:outline-none focus:border-tertiary-container"
                      >
                        <option value="recent">Most Recent Order</option>
                        <option value="oldest">Oldest Order</option>
                        <option value="highest_spend">Highest Total Spent</option>
                        <option value="lowest_spend">Lowest Total Spent</option>
                        <option value="most_orders">Most Orders</option>
                        <option value="name_asc">Name (A–Z)</option>
                      </select>
                    </div>

                    <p className="font-body text-[12px] text-on-surface-variant">
                      Showing {filteredCustomers.length} of {customers.length} customers
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && <p className="font-body text-[14px] text-error border border-red-200 bg-red-50 rounded-lg p-3">{error}</p>}

      {isLoading ? (
        <div className="flex items-center gap-3 py-8">
          <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
          <p className="font-body text-[14px] text-on-surface-variant">Loading customers...</p>
        </div>
      ) : (
        <motion.section
          className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">
                <tr>
                  <th className="p-4 font-normal">Customer</th>
                  <th className="p-4 font-normal">Phone</th>
                  <th className="p-4 font-normal">Payment</th>
                  <th className="p-4 font-normal">Orders</th>
                  <th className="p-4 font-normal">Total Spent</th>
                  <th className="p-4 font-normal">Last Order</th>
                  <th className="p-4 font-normal">Joined</th>
                </tr>
              </thead>
              <tbody className="font-body text-[15px] leading-[1.6] text-on-surface divide-y divide-outline-variant/30">
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td className="p-6 text-on-surface-variant" colSpan={7}>
                      {hasActiveCriteria
                        ? "No customers match your current filters."
                        : "No customers yet — they appear automatically when orders are placed."}
                    </td>
                  </tr>
                )}
                {filteredCustomers.map((customer) => {
                  const meta = orderMetaByPhone.get(normalizePhoneKey(customer.phone));
                  const paymentBadge = getPaymentBadge(meta);

                  return (
                    <tr key={customer.id} className="hover:bg-surface-container-low/50 transition-colors cursor-pointer group">
                      <td className="p-4">
                        <Link href={`/admin/customers/${encodeURIComponent(customer.phone)}`} className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-body text-[13px] font-medium flex-shrink-0">
                            {(customer.name ?? customer.phone).slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-[14px] group-hover:text-primary transition-colors">
                              {customer.name ?? "—"}
                            </p>
                            {customer.email && (
                              <p className="text-[12px] text-on-surface-variant">{customer.email}</p>
                            )}
                            {meta?.primaryState && (
                              <p className="text-[11px] text-on-surface-variant/80">{meta.primaryState}</p>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="p-4">
                        <a
                          href={`https://wa.me/91${customer.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[14px] text-on-surface hover:text-emerald-700 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {customer.phone}
                          <span className="material-symbols-outlined text-[14px] text-emerald-600">chat</span>
                        </a>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap ${paymentBadge.className}`}>
                          {paymentBadge.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[12px] font-medium whitespace-nowrap ${
                          customer.order_count > 1
                            ? "bg-primary-container text-on-primary-container"
                            : "bg-surface-container text-on-surface-variant"
                        }`}>
                          {customer.order_count} {customer.order_count === 1 ? "order" : "orders"}
                          {customer.order_count > 1 && " ✦"}
                        </span>
                      </td>
                      <td className="p-4 font-medium">{formatPrice(customer.total_spent)}</td>
                      <td className="p-4 text-on-surface-variant text-[13px]">
                        {new Date(customer.last_seen_at).toLocaleDateString("en-IN")}
                      </td>
                      <td className="p-4 text-on-surface-variant text-[13px]">
                        {new Date(customer.first_seen_at).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.section>
      )}
    </div>
  );
}
