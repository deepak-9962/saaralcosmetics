"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import { listOrders, updateOrderStatus, updateOrderNotes, updateOrderPaymentStatus, subscribeToOrders } from "@/lib/supabase/data";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types";

const tabs = ["All", "New", "Processing", "Shipped", "Delivered", "Cancelled"];

function getPaymentBadgeClass(status: Order["payment_status"]) {
  if (status === "paid") {
    return "bg-emerald-100 text-emerald-800";
  }
  if (status === "failed") {
    return "bg-red-100 text-red-800";
  }
  return "bg-yellow-100 text-yellow-800";
}

function getTabStatus(tab: string): OrderStatus | null {
  if (tab === "New") return "new";
  if (tab === "Processing") return "processing";
  if (tab === "Shipped") return "shipped";
  if (tab === "Delivered") return "delivered";
  if (tab === "Cancelled") return "cancelled";
  return null;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "pending" | "paid" | "failed">("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const detailPanelRef = useRef<HTMLDivElement | null>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await listOrders();
        setOrders(data);
        setSelectedOrderId(data[0]?.id ?? null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load orders.");
      }
    }
    loadOrders();

    // Realtime subscription
    const unsubscribe = subscribeToOrders(
      (newOrder) => {
        setOrders((prev) => [newOrder, ...prev]);
        if (!isFirstLoad.current) {
          toast.success(`🛍️ New order: ${newOrder.order_number}`, { duration: 5000 });
        }
      },
      (updatedOrder) => {
        setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
      }
    );

    setTimeout(() => { isFirstLoad.current = false; }, 3000);
    return unsubscribe;
  }, []);

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (activeTab !== "All") {
      const tabStatus = getTabStatus(activeTab);
      if (tabStatus) {
        result = result.filter((order) => order.order_status === tabStatus);
      }
    }

    const query = searchTerm.trim().toLowerCase();
    if (query) {
      result = result.filter((order) => {
        return (
          order.order_number.toLowerCase().includes(query) ||
          order.customer_name.toLowerCase().includes(query) ||
          order.customer_phone.toLowerCase().includes(query)
        );
      });
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      result = result.filter((order) => new Date(order.created_at) >= from);
    }

    if (dateTo) {
      const to = new Date(`${dateTo}T23:59:59`);
      result = result.filter((order) => new Date(order.created_at) <= to);
    }

    if (paymentFilter !== "all") {
      result = result.filter((order) => order.payment_status === paymentFilter);
    }

    if (stateFilter !== "all") {
      result = result.filter((order) => order.state === stateFilter);
    }

    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === "highest") {
        return b.total - a.total;
      }
      return a.total - b.total;
    });

    return result;
  }, [orders, activeTab, searchTerm, dateFrom, dateTo, paymentFilter, stateFilter, sortBy]);

  const availableStates = useMemo(() => {
    return [...new Set(orders.map((order) => order.state))].sort();
  }, [orders]);

  const tabCounts = useMemo(() => {
    return tabs.reduce<Record<string, number>>((acc, tab) => {
      const tabStatus = getTabStatus(tab);
      if (!tabStatus) {
        acc[tab] = orders.length;
      } else {
        acc[tab] = orders.filter((order) => order.order_status === tabStatus).length;
      }
      return acc;
    }, {});
  }, [orders]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (dateFrom) count += 1;
    if (dateTo) count += 1;
    if (paymentFilter !== "all") count += 1;
    if (stateFilter !== "all") count += 1;
    if (sortBy !== "newest") count += 1;
    return count;
  }, [dateFrom, dateTo, paymentFilter, stateFilter, sortBy]);

  const selectedOrder = useMemo(() => {
    if (filteredOrders.length === 0) {
      return null;
    }
    const matched = filteredOrders.find((order) => order.id === selectedOrderId);
    return matched ?? filteredOrders[0];
  }, [filteredOrders, selectedOrderId]);

  function handleSelectOrder(order: Order) {
    setSelectedOrderId(order.id);
    setEditingNotes(false);
    setNotesValue(order.notes ?? "");
  }

  async function handleUpdateStatus(nextStatus: OrderStatus) {
    if (!selectedOrder) {
      return;
    }

    setIsUpdating(true);
    setError(null);
    try {
      await updateOrderStatus(selectedOrder.id, nextStatus);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === selectedOrder.id
            ? {
                ...order,
                order_status: nextStatus,
              }
            : order
        )
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update order status.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleSaveNotes() {
    if (!selectedOrder) {
      return;
    }

    setIsUpdating(true);
    setError(null);
    try {
      const nextNotes = notesValue.trim() || null;
      await updateOrderNotes(selectedOrder.id, nextNotes);
      setOrders((prev) =>
        prev.map((order) => (order.id === selectedOrder.id ? { ...order, notes: nextNotes } : order))
      );
      setEditingNotes(false);
    } catch (notesError) {
      setError(notesError instanceof Error ? notesError.message : "Failed to update order notes.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleUpdatePaymentStatus(nextStatus: Order["payment_status"]) {
    if (!selectedOrder) return;
    setIsUpdating(true);
    setError(null);
    try {
      await updateOrderPaymentStatus(selectedOrder.id, nextStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, payment_status: nextStatus } : o))
      );
      toast.success(`Payment marked as ${nextStatus}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update payment status.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleCopyText(value: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch (clipboardError) {
      setError(clipboardError instanceof Error ? clipboardError.message : "Failed to copy.");
    }
  }

  function clearAllFilters() {
    setDateFrom("");
    setDateTo("");
    setPaymentFilter("all");
    setStateFilter("all");
    setSortBy("newest");
  }

  function renderStatusActions(order: Order) {
    if (order.order_status === "delivered") {
      return (
        <span className="inline-flex items-center px-3 py-2 rounded-lg bg-primary-container text-on-primary-container font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium uppercase">
          Order Complete
        </span>
      );
    }

    if (order.order_status === "cancelled") {
      return (
        <span className="inline-flex items-center px-3 py-2 rounded-lg bg-red-100 text-red-700 font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium uppercase">
          Cancelled
        </span>
      );
    }

    if (order.order_status === "new") {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleUpdateStatus("processing")}
            disabled={isUpdating}
            className="px-4 py-2 rounded-lg bg-tertiary-container text-on-background font-body text-[14px] leading-[1.4] disabled:opacity-50"
          >
            Mark Processing
          </button>
          <button
            type="button"
            onClick={() => handleUpdateStatus("cancelled")}
            disabled={isUpdating}
            className="px-4 py-2 rounded-lg border border-red-300 text-red-700 bg-red-50 font-body text-[14px] leading-[1.4] disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      );
    }

    if (order.order_status === "processing") {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleUpdateStatus("shipped")}
            disabled={isUpdating}
            className="px-4 py-2 rounded-lg bg-tertiary-container text-on-background font-body text-[14px] leading-[1.4] disabled:opacity-50"
          >
            Mark Shipped
          </button>
          <button
            type="button"
            onClick={() => handleUpdateStatus("cancelled")}
            disabled={isUpdating}
            className="px-4 py-2 rounded-lg border border-red-300 text-red-700 bg-red-50 font-body text-[14px] leading-[1.4] disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleUpdateStatus("delivered")}
          disabled={isUpdating}
          className="px-4 py-2 rounded-lg bg-tertiary-container text-on-background font-body text-[14px] leading-[1.4] disabled:opacity-50"
        >
          Mark Delivered
        </button>
        <button
          type="button"
          onClick={() => handleUpdateStatus("cancelled")}
          disabled={isUpdating}
          className="px-4 py-2 rounded-lg border border-red-300 text-red-700 bg-red-50 font-body text-[14px] leading-[1.4] disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex-grow flex overflow-hidden">
      <div className="flex-grow flex flex-col overflow-y-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-[var(--spacing-stack-md)] border-r border-outline-variant/30 custom-scrollbar">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
              <h2 className="font-display text-[32px] leading-[1.3] text-on-background tracking-tight">
                Order Management
              </h2>

              <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto xl:min-w-[560px]">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search order #, customer, phone..."
                    className="w-full h-12 pl-12 pr-4 bg-surface-container-lowest border border-outline-variant rounded-xl font-body text-[16px] leading-[1.6] text-on-surface focus:outline-none focus:border-tertiary-container focus:ring-1 focus:ring-tertiary-container/30 transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilters((prev) => !prev)}
                  className="h-12 px-4 rounded-xl bg-surface-container-low border border-outline-variant/50 font-body text-[14px] leading-[1.0] tracking-[0.08em] font-medium text-on-surface inline-flex items-center gap-2 uppercase"
                >
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-primary-container text-on-primary-container text-[10px] leading-[1.0] tracking-[0.08em] font-medium">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-surface-container-low border border-outline-variant/50 rounded-xl p-4 mt-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase mb-2">
                          Date From
                        </label>
                        <input
                          type="date"
                          value={dateFrom}
                          onChange={(event) => setDateFrom(event.target.value)}
                          className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-[14px] leading-[1.4] text-on-surface focus:outline-none focus:border-tertiary-container"
                        />
                      </div>

                      <div>
                        <label className="block font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase mb-2">
                          Date To
                        </label>
                        <input
                          type="date"
                          value={dateTo}
                          onChange={(event) => setDateTo(event.target.value)}
                          className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-[14px] leading-[1.4] text-on-surface focus:outline-none focus:border-tertiary-container"
                        />
                      </div>

                      <div>
                        <label className="block font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase mb-2">
                          Payment Status
                        </label>
                        <select
                          value={paymentFilter}
                          onChange={(event) =>
                            setPaymentFilter(event.target.value as "all" | "pending" | "paid" | "failed")
                          }
                          className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-[14px] leading-[1.4] text-on-surface focus:outline-none focus:border-tertiary-container"
                        >
                          <option value="all">All</option>
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase mb-2">
                          Sort By
                        </label>
                        <select
                          value={sortBy}
                          onChange={(event) =>
                            setSortBy(event.target.value as "newest" | "oldest" | "highest" | "lowest")
                          }
                          className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-[14px] leading-[1.4] text-on-surface focus:outline-none focus:border-tertiary-container"
                        >
                          <option value="newest">Newest</option>
                          <option value="oldest">Oldest</option>
                          <option value="highest">Highest Total</option>
                          <option value="lowest">Lowest Total</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase mb-2">
                          State
                        </label>
                        <select
                          value={stateFilter}
                          onChange={(event) => setStateFilter(event.target.value)}
                          className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-[14px] leading-[1.4] text-on-surface focus:outline-none focus:border-tertiary-container"
                        >
                          <option value="all">All States</option>
                          {availableStates.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="mt-4 font-body text-[13px] leading-[1.6] text-primary hover:underline"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {error && (
          <p className="mt-4 font-body text-[14px] leading-[1.6] text-error border border-red-200 bg-red-50 rounded-lg p-3">
            {error}
          </p>
        )}

        <div className="mt-5 flex gap-4 border-b border-outline-variant overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 border-b-2 font-body text-[14px] leading-[1.0] tracking-[0.08em] font-medium uppercase whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab} ({tabCounts[tab] ?? 0})
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-4 pb-8">
          {filteredOrders.length === 0 && (
            <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">No orders found.</p>
          )}

          {filteredOrders.map((order) => (
            <motion.button
              key={order.id}
              type="button"
              onClick={() => handleSelectOrder(order)}
              className={`w-full text-left rounded-xl p-4 flex items-center justify-between gap-4 transition-all ${
                selectedOrder?.id === order.id
                  ? "bg-primary-container/10 border border-primary/20"
                  : "bg-surface-container-lowest border border-outline-variant/50 hover:bg-surface-container-low/50"
              }`}
              whileHover={{ scale: 1.003 }}
              whileTap={{ scale: 0.997 }}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium ${
                    selectedOrder?.id === order.id
                      ? "bg-primary-container text-on-primary-container"
                      : "bg-surface-container text-on-surface-variant"
                  }`}
                >
                  {order.customer_name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-body text-[18px] leading-[1.6] text-on-surface font-medium truncate">
                    {order.order_number}
                  </p>
                  <p className="font-body text-[14px] leading-[1.6] text-on-surface-variant truncate">
                    {order.customer_name} • {order.customer_phone}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <p className="font-body text-[16px] leading-[1.6] text-on-surface">{formatPrice(order.total)}</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full font-body text-[10px] leading-[1.0] tracking-[0.1em] font-medium uppercase ${getPaymentBadgeClass(order.payment_status)}`}
                  >
                    {order.payment_status}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary-container text-on-primary-container font-body text-[10px] leading-[1.0] tracking-[0.1em] font-medium uppercase">
                    {order.order_status}
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div
        ref={detailPanelRef}
        className="hidden lg:flex flex-col w-[400px] xl:w-[500px] bg-surface-container-lowest border-l border-outline-variant/30 overflow-y-auto custom-scrollbar"
      >
        <div className="p-[var(--spacing-gutter)] border-b border-outline-variant/50 sticky top-0 bg-surface-container-lowest/95 backdrop-blur z-10">
          <h3 className="font-display text-[24px] leading-[1.4] text-on-surface">Order Details</h3>
        </div>

        {!selectedOrder ? (
          <div className="p-6">
            <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
              Select an order to view details.
            </p>
          </div>
        ) : (
          <div className="p-[var(--spacing-gutter)] flex flex-col gap-[var(--spacing-stack-md)]">
            <section className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-display text-[36px] leading-[1.2] text-on-surface">
                  {selectedOrder.order_number}
                </h4>
                <p className="font-body text-[14px] leading-[1.6] text-on-surface-variant mt-1">
                  {new Date(selectedOrder.created_at).toLocaleString("en-IN")}
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-2 rounded-lg bg-primary-container text-on-primary-container font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium uppercase">
                {selectedOrder.order_status}
              </span>
            </section>

            <section className="bg-surface-container-low border border-outline-variant/40 rounded-xl p-4">
              <h5 className="font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase mb-3">
                Customer Information
              </h5>
              <div className="flex items-start justify-between gap-2">
                <p className="font-body text-[16px] leading-[1.6] text-on-surface font-medium">
                  {selectedOrder.customer_name}
                </p>
                <Link
                  href={`/admin/customers/${encodeURIComponent(selectedOrder.customer_phone)}`}
                  className="text-primary font-body text-[12px] hover:underline flex items-center gap-1 flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-[14px]">person</span>
                  Profile
                </Link>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-body text-[14px] leading-[1.6] text-on-surface-variant">
                  {selectedOrder.customer_phone}
                </p>
                <a
                  href={`https://wa.me/91${selectedOrder.customer_phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-body text-[11px] font-medium hover:bg-emerald-100 transition-colors"
                >
                  <span className="material-symbols-outlined text-[13px]">chat</span>
                  WhatsApp
                </a>
              </div>
              {selectedOrder.customer_email && (
                <p className="font-body text-[14px] leading-[1.6] text-on-surface-variant">
                  {selectedOrder.customer_email}
                </p>
              )}
              <div className="h-px bg-outline-variant/40 my-4" />
              <p className="font-body text-[14px] leading-[1.6] text-on-surface whitespace-pre-line">
                {selectedOrder.address_line1}
                {selectedOrder.address_line2 ? `\n${selectedOrder.address_line2}` : ""}
                {`\n${selectedOrder.city}, ${selectedOrder.state} - ${selectedOrder.pincode}`}
              </p>
              {selectedOrder.razorpay_payment_id && (
                <div className="mt-4 flex items-center justify-between gap-2 bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-3 py-2">
                  <p className="font-body text-[12px] leading-[1.6] text-on-surface-variant truncate">
                    Payment ID: {selectedOrder.razorpay_payment_id}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopyText(selectedOrder.razorpay_payment_id as string)}
                    className="inline-flex items-center gap-1 text-primary font-body text-[12px] leading-[1.4]"
                  >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                    Copy
                  </button>
                </div>
              )}
            </section>

            <section>
              <h5 className="font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase mb-3">
                Order Items
              </h5>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div
                    key={`${item.product_id}-${index}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30"
                  >
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-surface-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-outline">inventory_2</span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-body text-[14px] leading-[1.6] text-on-surface font-medium truncate">
                        {item.name}
                      </p>
                      {item.variant && (
                        <p className="font-body text-[12px] leading-[1.4] text-on-surface-variant truncate">
                          {item.variant}
                        </p>
                      )}
                      <p className="font-body text-[12px] leading-[1.4] text-on-surface-variant">
                        Qty: {item.qty}
                      </p>
                    </div>
                    <p className="font-body text-[14px] leading-[1.6] text-on-surface">
                      {formatPrice(item.price * item.qty)}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <p className="font-body text-[14px] leading-[1.6] text-on-surface-variant">Subtotal</p>
                <p className="font-body text-[14px] leading-[1.6] text-on-surface">
                  {formatPrice(selectedOrder.subtotal)}
                </p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="font-body text-[14px] leading-[1.6] text-on-surface-variant">Shipping</p>
                <p className="font-body text-[14px] leading-[1.6] text-on-surface">
                  {formatPrice(selectedOrder.shipping_charge)}
                </p>
              </div>
              <div className="h-px bg-outline-variant/40 my-3" />
              <div className="flex items-center justify-between">
                <p className="font-display text-[24px] leading-[1.4] text-on-surface">Total</p>
                <p className="font-display text-[24px] leading-[1.4] text-on-surface">
                  {formatPrice(selectedOrder.total)}
                </p>
              </div>
            </section>

            <section className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">
                  Notes
                </h5>
                {!editingNotes && (
                  <button
                    type="button"
                    onClick={() => {
                      setNotesValue(selectedOrder.notes ?? "");
                      setEditingNotes(true);
                    }}
                    className="inline-flex items-center gap-1 text-primary font-body text-[12px] leading-[1.4]"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    Edit
                  </button>
                )}
              </div>

              {editingNotes ? (
                <div className="space-y-3">
                  <textarea
                    value={notesValue}
                    onChange={(event) => setNotesValue(event.target.value)}
                    rows={4}
                    className="w-full resize-none bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body text-[14px] leading-[1.6] text-on-surface focus:outline-none focus:border-tertiary-container"
                    placeholder="Add internal notes..."
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      disabled={isUpdating}
                      className="px-4 py-2 rounded-lg bg-tertiary-container text-on-background font-body text-[14px] leading-[1.4] disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNotes(false);
                        setNotesValue(selectedOrder.notes ?? "");
                      }}
                      disabled={isUpdating}
                      className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface font-body text-[14px] leading-[1.4] disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="font-body text-[14px] leading-[1.6] text-on-surface">
                  {selectedOrder.notes ?? "No notes"}
                </p>
              )}
            </section>

            <section className="space-y-3">
              <h5 className="font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">
                Status Actions
              </h5>
              {renderStatusActions(selectedOrder)}
              {/* Payment status override for COD */}
              {selectedOrder.payment_status !== "paid" && (
                <button
                  type="button"
                  onClick={() => handleUpdatePaymentStatus("paid")}
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 font-body text-[14px] leading-[1.4] disabled:opacity-50 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">payments</span>
                  Mark as Paid (COD)
                </button>
              )}
            </section>

            <section className="flex flex-wrap gap-2 pb-4">
              <button
                type="button"
                onClick={() => handleCopyText(selectedOrder.order_number)}
                className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface font-body text-[13px] leading-[1.4] inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                Copy Order Number
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface font-body text-[13px] leading-[1.4] inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                Print Invoice
              </button>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
