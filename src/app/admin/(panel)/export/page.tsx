"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { listOrders } from "@/lib/supabase/data";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/lib/types";

// ── Field Definitions ─────────────────────────────────────────────────────────

type FieldKey =
  | "order_number"
  | "customer_name"
  | "customer_phone"
  | "customer_email"
  | "address_line1"
  | "address_line2"
  | "city"
  | "state"
  | "pincode"
  | "items_summary"
  | "items_quantity"
  | "items_price"
  | "subtotal"
  | "shipping_charge"
  | "discount_amount"
  | "promo_code"
  | "total"
  | "payment_status"
  | "razorpay_payment_id"
  | "order_status"
  | "date"
  | "time";

interface FieldDefinition {
  key: FieldKey;
  label: string;
  group: "customer" | "address" | "products" | "pricing" | "order";
  description?: string;
}

const ALL_FIELDS: FieldDefinition[] = [
  // Customer
  { key: "customer_name",      label: "Customer Name",       group: "customer",  description: "Full name of the customer" },
  { key: "customer_phone",     label: "Phone Number",         group: "customer",  description: "Mobile/phone number" },
  { key: "customer_email",     label: "Email ID",             group: "customer",  description: "Email address if provided" },
  // Address
  { key: "address_line1",      label: "Address Line 1",       group: "address" },
  { key: "address_line2",      label: "Address Line 2",       group: "address" },
  { key: "city",               label: "City",                 group: "address" },
  { key: "state",              label: "State",                group: "address" },
  { key: "pincode",            label: "Pincode",              group: "address" },
  // Products
  { key: "items_summary",      label: "Products Bought",      group: "products",  description: "Product names and quantities, e.g. Face Wash (x2); Soap (x1)" },
  { key: "items_quantity",     label: "Total Items Count",    group: "products",  description: "Total number of item units in the order" },
  { key: "items_price",        label: "Product-wise Price",   group: "products",  description: "Line-item prices: Product ₹X (qty)" },
  // Pricing
  { key: "subtotal",           label: "Subtotal",             group: "pricing" },
  { key: "shipping_charge",    label: "Shipping Charge",      group: "pricing" },
  { key: "discount_amount",    label: "Discount Amount",      group: "pricing" },
  { key: "promo_code",         label: "Promo Code Used",      group: "pricing" },
  { key: "total",              label: "Total Amount Paid",    group: "pricing" },
  // Order
  { key: "order_number",       label: "Order Number",         group: "order" },
  { key: "payment_status",     label: "Payment Status",       group: "order" },
  { key: "razorpay_payment_id",label: "Razorpay Payment ID",  group: "order" },
  { key: "order_status",       label: "Order Status",         group: "order" },
  { key: "date",               label: "Order Date",           group: "order" },
  { key: "time",               label: "Order Time",           group: "order" },
];

const DEFAULT_FIELDS: FieldKey[] = [
  "order_number", "customer_name", "customer_phone", "customer_email",
  "items_summary", "total", "payment_status", "order_status", "date",
];

const GROUPS: { key: FieldDefinition["group"]; label: string; icon: string }[] = [
  { key: "customer",  label: "Customer Info",  icon: "person" },
  { key: "address",   label: "Delivery Address", icon: "home" },
  { key: "products",  label: "Products Bought", icon: "inventory_2" },
  { key: "pricing",   label: "Pricing & Promo", icon: "payments" },
  { key: "order",     label: "Order Details",  icon: "receipt_long" },
];

// ── CSV Export Engine ──────────────────────────────────────────────────────────

function getCellValue(order: Order, key: FieldKey): string {
  switch (key) {
    case "order_number":        return order.order_number;
    case "customer_name":       return order.customer_name;
    case "customer_phone":      return order.customer_phone;
    case "customer_email":      return order.customer_email ?? "";
    case "address_line1":       return order.address_line1;
    case "address_line2":       return order.address_line2 ?? "";
    case "city":                return order.city;
    case "state":               return order.state;
    case "pincode":             return order.pincode;
    case "items_summary":       return order.items.map((i) => `${i.name}(x${i.qty})`).join("; ");
    case "items_quantity":      return String(order.items.reduce((s, i) => s + i.qty, 0));
    case "items_price":         return order.items.map((i) => `${i.name}: ₹${(i.price * i.qty).toFixed(2)} (qty ${i.qty})`).join("; ");
    case "subtotal":            return order.subtotal.toFixed(2);
    case "shipping_charge":     return order.shipping_charge.toFixed(2);
    case "discount_amount":     return order.discount_amount.toFixed(2);
    case "promo_code":          return order.promo_code_snapshot ?? "";
    case "total":               return order.total.toFixed(2);
    case "payment_status":      return order.payment_status;
    case "razorpay_payment_id": return order.razorpay_payment_id ?? "";
    case "order_status":        return order.order_status;
    case "date":                return new Date(order.created_at).toLocaleDateString("en-IN");
    case "time":                return new Date(order.created_at).toLocaleTimeString("en-IN");
    default:                    return "";
  }
}

function exportToCSV(data: Order[], selectedFields: FieldKey[], fileName: string) {
  const fieldDefs = ALL_FIELDS.filter((f) => selectedFields.includes(f.key));
  const headers = fieldDefs.map((f) => f.label);
  const rows = data.map((order) => fieldDefs.map((f) => getCellValue(order, f.key)));
  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const BOM = "\uFEFF"; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function getPaymentBadgeClass(status: Order["payment_status"]) {
  if (status === "paid") return "bg-emerald-100 text-emerald-800";
  if (status === "failed") return "bg-red-100 text-red-800";
  return "bg-yellow-100 text-yellow-800";
}

// ── Field Selector Toggle ──────────────────────────────────────────────────────

function FieldToggle({
  field,
  checked,
  onChange,
}: {
  field: FieldDefinition;
  checked: boolean;
  onChange: (key: FieldKey, val: boolean) => void;
}) {
  return (
    <label
      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all select-none ${
        checked
          ? "bg-primary-container/15 border-primary/30"
          : "bg-surface-container-lowest border-outline-variant/40 hover:bg-surface-container-low/60"
      }`}
    >
      <div
        className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          checked
            ? "bg-primary border-primary"
            : "bg-surface-container-lowest border-outline-variant"
        }`}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div className="min-w-0">
        <p className={`font-body text-[13px] leading-[1.4] font-medium ${checked ? "text-primary" : "text-on-surface"}`}>
          {field.label}
        </p>
        {field.description && (
          <p className="font-body text-[11px] leading-[1.4] text-on-surface-variant mt-0.5">
            {field.description}
          </p>
        )}
      </div>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(field.key, e.target.checked)}
      />
    </label>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminExportPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedFields, setSelectedFields] = useState<Set<FieldKey>>(new Set(DEFAULT_FIELDS));
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await listOrders();
        setOrders(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load export data.");
      }
    }
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (dateFrom && new Date(order.created_at) < new Date(dateFrom)) return false;
      if (dateTo && new Date(order.created_at) > new Date(`${dateTo}T23:59:59`)) return false;
      if (statusFilter !== "all" && order.order_status !== statusFilter) return false;
      if (paymentFilter !== "all" && order.payment_status !== paymentFilter) return false;
      return true;
    });
  }, [orders, dateFrom, dateTo, statusFilter, paymentFilter]);

  const previewRevenue = useMemo(() =>
    filteredOrders.reduce((sum, o) => sum + o.total, 0),
    [filteredOrders]
  );

  const previewRows = useMemo(() =>
    filteredOrders.slice(0, previewExpanded ? 50 : 10),
    [filteredOrders, previewExpanded]
  );

  const selectedFieldsArray = useMemo(() =>
    ALL_FIELDS.filter((f) => selectedFields.has(f.key)).map((f) => f.key),
    [selectedFields]
  );

  function toggleField(key: FieldKey, val: boolean) {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      if (val) next.add(key); else next.delete(key);
      return next;
    });
  }

  function selectGroup(group: FieldDefinition["group"]) {
    const groupKeys = ALL_FIELDS.filter((f) => f.group === group).map((f) => f.key);
    setSelectedFields((prev) => {
      const next = new Set(prev);
      const allSelected = groupKeys.every((k) => next.has(k));
      if (allSelected) {
        groupKeys.forEach((k) => next.delete(k));
      } else {
        groupKeys.forEach((k) => next.add(k));
      }
      return next;
    });
  }

  function selectAll() {
    setSelectedFields(new Set(ALL_FIELDS.map((f) => f.key)));
  }

  function resetToDefault() {
    setSelectedFields(new Set(DEFAULT_FIELDS));
  }

  function clearAllFields() {
    setSelectedFields(new Set());
  }

  function clearFilters() {
    setDateFrom("");
    setDateTo("");
    setStatusFilter("all");
    setPaymentFilter("all");
  }

  async function handleDownload() {
    if (selectedFieldsArray.length === 0) {
      setError("Please select at least one field to export.");
      return;
    }
    setIsDownloading(true);
    setError(null);
    try {
      exportToCSV(filteredOrders, selectedFieldsArray, "saaral-orders");
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "Failed to export CSV.");
    } finally {
      setIsDownloading(false);
    }
  }

  // Quick date presets
  function setDatePreset(preset: "today" | "week" | "month" | "last3months") {
    const now = new Date();
    const to = now.toISOString().slice(0, 10);
    let from = "";
    if (preset === "today") {
      from = to;
    } else if (preset === "week") {
      const d = new Date(now); d.setDate(d.getDate() - 7);
      from = d.toISOString().slice(0, 10);
    } else if (preset === "month") {
      const d = new Date(now); d.setDate(1);
      from = d.toISOString().slice(0, 10);
    } else if (preset === "last3months") {
      const d = new Date(now); d.setMonth(d.getMonth() - 3);
      from = d.toISOString().slice(0, 10);
    }
    setDateFrom(from);
    setDateTo(to);
  }

  return (
    <div className="p-[var(--spacing-margin-mobile)] md:p-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto w-full flex-grow flex flex-col gap-[var(--spacing-stack-lg)] overflow-y-auto custom-scrollbar">

      {/* ── Header ── */}
      <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-[36px] md:text-[48px] leading-[1.2] text-on-surface">
          Export Orders
        </h1>
        <p className="font-body text-[18px] leading-[1.6] text-on-surface-variant mt-2">
          Choose your fields and filters, then download as CSV.
        </p>
      </motion.header>

      {error && (
        <p className="font-body text-[14px] leading-[1.6] text-error border border-red-200 bg-red-50 rounded-lg p-3">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-[var(--spacing-stack-lg)]">

        {/* ── Left Column: Field Selector ── */}
        <motion.div
          className="xl:col-span-2 flex flex-col gap-5"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-outline-variant/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">checklist</span>
                <h2 className="font-display text-[20px] leading-[1.3] text-on-surface">
                  Select Columns
                </h2>
                <span className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-primary-container text-on-primary-container font-body text-[11px] font-semibold">
                  {selectedFields.size}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="font-body text-[12px] text-primary hover:underline cursor-pointer"
                >
                  All
                </button>
                <span className="text-outline-variant">·</span>
                <button
                  type="button"
                  onClick={resetToDefault}
                  className="font-body text-[12px] text-on-surface-variant hover:underline cursor-pointer"
                >
                  Default
                </button>
                <span className="text-outline-variant">·</span>
                <button
                  type="button"
                  onClick={clearAllFields}
                  className="font-body text-[12px] text-error hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Groups */}
            <div className="divide-y divide-outline-variant/30">
              {GROUPS.map((group) => {
                const groupFields = ALL_FIELDS.filter((f) => f.group === group.key);
                const selectedCount = groupFields.filter((f) => selectedFields.has(f.key)).length;
                const allSelected = selectedCount === groupFields.length;
                return (
                  <div key={group.key} className="p-4">
                    {/* Group Header */}
                    <button
                      type="button"
                      onClick={() => selectGroup(group.key)}
                      className="w-full flex items-center gap-2 mb-3 group cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                        {group.icon}
                      </span>
                      <span className="font-body text-[11px] leading-[1.0] tracking-[0.1em] font-semibold text-on-surface-variant uppercase flex-1 text-left">
                        {group.label}
                      </span>
                      <span
                        className={`font-body text-[11px] font-medium px-2 py-0.5 rounded-full transition-colors ${
                          allSelected
                            ? "bg-primary-container text-primary"
                            : selectedCount > 0
                            ? "bg-surface-container text-on-surface-variant"
                            : "text-on-surface-variant"
                        }`}
                      >
                        {selectedCount}/{groupFields.length}
                      </span>
                      <span className="font-body text-[11px] text-primary group-hover:underline cursor-pointer">
                        {allSelected ? "Deselect all" : "Select all"}
                      </span>
                    </button>

                    {/* Fields */}
                    <div className="grid grid-cols-1 gap-2">
                      {groupFields.map((field) => (
                        <FieldToggle
                          key={field.key}
                          field={field}
                          checked={selectedFields.has(field.key)}
                          onChange={toggleField}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ── Right Column: Filters + Download + Preview ── */}
        <div className="xl:col-span-3 flex flex-col gap-5">

          {/* Filters */}
          <motion.div
            className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="font-display text-[20px] leading-[1.3] text-on-surface inline-flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                Filter Export Data
              </h2>
              <button
                type="button"
                onClick={clearFilters}
                className="font-body text-[13px] leading-[1.6] text-primary hover:underline cursor-pointer"
              >
                Clear Filters
              </button>
            </div>

            {/* Date Presets */}
            <div className="mb-4">
              <label className="block font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase mb-2">
                Quick Date Range
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Today", preset: "today" as const },
                  { label: "Last 7 days", preset: "week" as const },
                  { label: "This month", preset: "month" as const },
                  { label: "Last 3 months", preset: "last3months" as const },
                ].map(({ label, preset }) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDatePreset(preset)}
                    className="px-3 py-1.5 rounded-lg border border-outline-variant/50 bg-surface-container-low font-body text-[12px] text-on-surface hover:border-primary/40 hover:bg-primary-container/10 hover:text-primary transition-all cursor-pointer"
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => { setDateFrom(""); setDateTo(""); }}
                  className="px-3 py-1.5 rounded-lg border border-outline-variant/50 bg-surface-container-low font-body text-[12px] text-on-surface-variant hover:border-error/40 hover:text-error transition-all cursor-pointer"
                >
                  All time
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date From */}
              <div>
                <label className="block font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase mb-2">
                  Date From
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-[14px] leading-[1.4] text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase mb-2">
                  Date To
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-[14px] leading-[1.4] text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              {/* Order Status */}
              <div>
                <label className="block font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase mb-2">
                  Order Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-[14px] leading-[1.4] text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Payment Status */}
              <div>
                <label className="block font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase mb-2">
                  Payment Status
                </label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-[14px] leading-[1.4] text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="all">All Payments</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Summary Stats */}
          <motion.div
            className="grid grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-surface-container rounded-xl p-4 text-center border border-outline-variant/40">
              <p className="font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">
                Orders to Export
              </p>
              <p className="font-display text-[32px] leading-[1.2] text-on-surface mt-2">
                {filteredOrders.length}
              </p>
            </div>
            <div className="bg-surface-container rounded-xl p-4 text-center border border-outline-variant/40">
              <p className="font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">
                Total Revenue
              </p>
              <p className="font-display text-[24px] leading-[1.2] text-on-surface mt-2">
                {formatPrice(previewRevenue)}
              </p>
            </div>
            <div className="bg-surface-container rounded-xl p-4 text-center border border-outline-variant/40">
              <p className="font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">
                Columns Selected
              </p>
              <p className="font-display text-[32px] leading-[1.2] text-on-surface mt-2">
                {selectedFields.size}
              </p>
            </div>
          </motion.div>

          {/* Selected Columns Preview Chips */}
          {selectedFields.size > 0 && (
            <motion.div
              className="bg-surface-container-low border border-outline-variant/40 rounded-xl p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <p className="font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase mb-3">
                CSV Column Order
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedFieldsArray.map((key, index) => {
                  const field = ALL_FIELDS.find((f) => f.key === key)!;
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-container/20 border border-primary/20 font-body text-[12px] text-on-primary-container"
                    >
                      <span className="text-primary/50 text-[10px] font-semibold">{index + 1}</span>
                      {field.label}
                      <button
                        type="button"
                        onClick={() => toggleField(key, false)}
                        className="text-on-primary-container/50 hover:text-error cursor-pointer ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Download Button */}
          <motion.div
            className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading || filteredOrders.length === 0 || selectedFields.size === 0}
              className="w-full bg-tertiary-container text-on-background py-4 rounded-xl font-body text-[18px] leading-[1.6] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {isDownloading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Preparing CSV…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">download</span>
                  Download CSV — {filteredOrders.length} orders · {selectedFields.size} columns
                </>
              )}
            </button>
            <div className="flex items-center gap-2 mt-3">
              <span className="material-symbols-outlined text-[14px] text-on-surface-variant">info</span>
              <p className="font-body text-[12px] leading-[1.6] text-on-surface-variant">
                File saved as <strong>saaral-orders-YYYY-MM-DD.csv</strong> · UTF-8 with BOM (Excel-compatible)
              </p>
            </div>
          </motion.div>

          {/* Data Preview Table */}
          <motion.div
            className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="px-5 py-4 border-b border-outline-variant/50 flex items-center justify-between gap-3">
              <h2 className="font-display text-[20px] leading-[1.3] text-on-surface">
                Preview — {previewRows.length} of {filteredOrders.length} orders
              </h2>
              <span className="font-body text-[12px] text-on-surface-variant">
                (Showing key columns)
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-surface-container-low font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">
                  <tr>
                    {selectedFields.has("order_number") && <th className="p-4 font-normal text-left whitespace-nowrap">Order #</th>}
                    {selectedFields.has("customer_name") && <th className="p-4 font-normal text-left whitespace-nowrap">Customer</th>}
                    {selectedFields.has("customer_phone") && <th className="p-4 font-normal text-left whitespace-nowrap">Phone</th>}
                    {selectedFields.has("customer_email") && <th className="p-4 font-normal text-left whitespace-nowrap">Email</th>}
                    {selectedFields.has("items_summary") && <th className="p-4 font-normal text-left whitespace-nowrap">Products</th>}
                    {selectedFields.has("total") && <th className="p-4 font-normal text-left whitespace-nowrap">Total</th>}
                    {selectedFields.has("payment_status") && <th className="p-4 font-normal text-left whitespace-nowrap">Payment</th>}
                    {selectedFields.has("order_status") && <th className="p-4 font-normal text-left whitespace-nowrap">Status</th>}
                    {selectedFields.has("date") && <th className="p-4 font-normal text-left whitespace-nowrap">Date</th>}
                    {/* Show all other selected fields */}
                    {["state", "city", "subtotal", "shipping_charge", "discount_amount", "promo_code", "items_quantity"].map(
                      (key) =>
                        selectedFields.has(key as FieldKey) && (
                          <th key={key} className="p-4 font-normal text-left whitespace-nowrap">
                            {ALL_FIELDS.find((f) => f.key === key)?.label ?? key}
                          </th>
                        )
                    )}
                  </tr>
                </thead>
                <tbody className="font-body text-[13px] leading-[1.6] text-on-surface divide-y divide-outline-variant/30">
                  {previewRows.length === 0 && (
                    <tr>
                      <td className="p-4 text-on-surface-variant" colSpan={12}>
                        No orders match the selected filters.
                      </td>
                    </tr>
                  )}
                  {previewRows.map((order) => (
                    <tr key={order.id} className="hover:bg-surface-container-low/50 transition-colors">
                      {selectedFields.has("order_number") && <td className="p-4 font-medium whitespace-nowrap">{order.order_number}</td>}
                      {selectedFields.has("customer_name") && <td className="p-4 whitespace-nowrap">{order.customer_name}</td>}
                      {selectedFields.has("customer_phone") && <td className="p-4 whitespace-nowrap">{order.customer_phone}</td>}
                      {selectedFields.has("customer_email") && <td className="p-4 whitespace-nowrap text-on-surface-variant">{order.customer_email ?? "—"}</td>}
                      {selectedFields.has("items_summary") && (
                        <td className="p-4 max-w-[200px]">
                          <span className="block truncate" title={order.items.map((i) => `${i.name}(x${i.qty})`).join("; ")}>
                            {order.items.map((i) => `${i.name}(x${i.qty})`).join("; ")}
                          </span>
                        </td>
                      )}
                      {selectedFields.has("total") && <td className="p-4 whitespace-nowrap font-medium">{formatPrice(order.total)}</td>}
                      {selectedFields.has("payment_status") && (
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full font-body text-[10px] leading-[1.0] tracking-[0.1em] font-medium uppercase ${getPaymentBadgeClass(order.payment_status)}`}>
                            {order.payment_status}
                          </span>
                        </td>
                      )}
                      {selectedFields.has("order_status") && (
                        <td className="p-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary-container text-on-primary-container font-body text-[10px] leading-[1.0] tracking-[0.1em] font-medium uppercase">
                            {order.order_status}
                          </span>
                        </td>
                      )}
                      {selectedFields.has("date") && <td className="p-4 whitespace-nowrap text-on-surface-variant">{new Date(order.created_at).toLocaleDateString("en-IN")}</td>}
                      {selectedFields.has("state") && <td className="p-4 whitespace-nowrap">{order.state}</td>}
                      {selectedFields.has("city") && <td className="p-4 whitespace-nowrap">{order.city}</td>}
                      {selectedFields.has("subtotal") && <td className="p-4 whitespace-nowrap">{formatPrice(order.subtotal)}</td>}
                      {selectedFields.has("shipping_charge") && <td className="p-4 whitespace-nowrap">{formatPrice(order.shipping_charge)}</td>}
                      {selectedFields.has("discount_amount") && <td className="p-4 whitespace-nowrap">{order.discount_amount > 0 ? formatPrice(order.discount_amount) : "—"}</td>}
                      {selectedFields.has("promo_code") && <td className="p-4 whitespace-nowrap">{order.promo_code_snapshot ?? "—"}</td>}
                      {selectedFields.has("items_quantity") && <td className="p-4 whitespace-nowrap">{order.items.reduce((s, i) => s + i.qty, 0)}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredOrders.length > 10 && (
              <div className="px-5 py-3 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setPreviewExpanded((p) => !p)}
                  className="font-body text-[13px] text-primary hover:underline cursor-pointer"
                >
                  {previewExpanded
                    ? "Show fewer rows"
                    : `Show more rows (${Math.min(50, filteredOrders.length) - 10} more)`}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
