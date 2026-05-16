"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { listOrders } from "@/lib/supabase/data";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/lib/types";

function exportToCSV(data: Order[]) {
  const headers = [
    "Order Number",
    "Customer Name",
    "Phone",
    "Email",
    "Address Line 1",
    "Address Line 2",
    "City",
    "State",
    "Pincode",
    "Items",
    "Subtotal",
    "Shipping",
    "Total",
    "Payment Status",
    "Order Status",
    "Date",
  ];
  const rows = data.map((o) => [
    o.order_number,
    o.customer_name,
    o.customer_phone,
    o.customer_email ?? "",
    o.address_line1,
    o.address_line2 ?? "",
    o.city,
    o.state,
    o.pincode,
    o.items.map((i) => `${i.name}(x${i.qty})`).join("; "),
    o.subtotal.toFixed(2),
    o.shipping_charge.toFixed(2),
    o.total.toFixed(2),
    o.payment_status,
    o.order_status,
    new Date(o.created_at).toLocaleDateString("en-IN"),
  ]);
  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `saaral-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function getPaymentBadgeClass(status: Order["payment_status"]) {
  if (status === "paid") return "bg-emerald-100 text-emerald-800";
  if (status === "failed") return "bg-red-100 text-red-800";
  return "bg-yellow-100 text-yellow-800";
}

export default function AdminExportPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

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
      if (dateFrom && new Date(order.created_at) < new Date(dateFrom)) {
        return false;
      }

      if (dateTo && new Date(order.created_at) > new Date(`${dateTo}T23:59:59`)) {
        return false;
      }

      if (statusFilter !== "all" && order.order_status !== statusFilter) {
        return false;
      }

      if (paymentFilter !== "all" && order.payment_status !== paymentFilter) {
        return false;
      }

      return true;
    });
  }, [orders, dateFrom, dateTo, statusFilter, paymentFilter]);

  const previewRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, order) => sum + order.total, 0);
  }, [filteredOrders]);

  const previewRows = useMemo(() => filteredOrders.slice(0, 10), [filteredOrders]);

  async function handleDownload() {
    setIsDownloading(true);
    setError(null);
    try {
      exportToCSV(filteredOrders);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "Failed to export CSV.");
    } finally {
      setIsDownloading(false);
    }
  }

  function clearFilters() {
    setDateFrom("");
    setDateTo("");
    setStatusFilter("all");
    setPaymentFilter("all");
  }

  return (
    <div className="p-[var(--spacing-margin-mobile)] md:p-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto w-full flex-grow flex flex-col gap-[var(--spacing-stack-lg)] overflow-y-auto custom-scrollbar">
      <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-[36px] md:text-[48px] leading-[1.2] text-on-surface">
          Export Orders
        </h1>
        <p className="font-body text-[18px] leading-[1.6] text-on-surface-variant mt-2">
          Download filtered order data as CSV
        </p>
      </motion.header>

      {error && <p className="font-body text-[14px] leading-[1.6] text-error">{error}</p>}

      <motion.section
        className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between gap-3 mb-5">
          <h2 className="font-display text-[24px] leading-[1.4] text-on-surface inline-flex items-center gap-2">
            <span className="material-symbols-outlined">tune</span>
            Filter Export Data
          </h2>
          <button
            type="button"
            onClick={clearFilters}
            className="font-body text-[13px] leading-[1.6] text-primary hover:underline"
          >
            Clear Filters
          </button>
        </div>

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
              Order Status
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-[14px] leading-[1.4] text-on-surface focus:outline-none focus:border-tertiary-container"
            >
              <option value="all">All</option>
              <option value="new">New</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase mb-2">
              Payment Status
            </label>
            <select
              value={paymentFilter}
              onChange={(event) => setPaymentFilter(event.target.value)}
              className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-[14px] leading-[1.4] text-on-surface focus:outline-none focus:border-tertiary-container"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-gutter)]"
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
          <p className="font-display text-[32px] leading-[1.2] text-on-surface mt-2">
            {formatPrice(previewRevenue)}
          </p>
        </div>

        <div className="bg-surface-container rounded-xl p-4 text-center border border-outline-variant/40">
          <p className="font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">
            Date Range
          </p>
          <p className="font-body text-[16px] leading-[1.6] text-on-surface mt-2">
            {dateFrom || "All time"} → {dateTo || "Now"}
          </p>
        </div>
      </motion.section>

      <motion.section
        className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full bg-tertiary-container text-on-background py-4 rounded-xl font-body text-[18px] leading-[1.6] font-medium hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
        >
          {isDownloading ? (
            <>
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              Downloading...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">download</span>
              Download CSV ({filteredOrders.length} orders)
            </>
          )}
        </button>
        <p className="font-body text-[12px] leading-[1.6] text-on-surface-variant mt-3">
          File will be saved as saaral-orders-YYYY-MM-DD.csv
        </p>
      </motion.section>

      <motion.section
        className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="p-6 border-b border-outline-variant/50">
          <h2 className="font-display text-[24px] leading-[1.4] text-on-surface">
            Preview (first 10 of {filteredOrders.length} orders)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-surface-container-low font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">
              <tr>
                <th className="p-4 font-normal text-left">Order #</th>
                <th className="p-4 font-normal text-left">Customer</th>
                <th className="p-4 font-normal text-left">Date</th>
                <th className="p-4 font-normal text-left">Total</th>
                <th className="p-4 font-normal text-left">Payment</th>
                <th className="p-4 font-normal text-left">Status</th>
              </tr>
            </thead>
            <tbody className="font-body text-[15px] leading-[1.6] text-on-surface divide-y divide-outline-variant/30">
              {previewRows.length === 0 && (
                <tr>
                  <td className="p-4 text-on-surface-variant" colSpan={6}>
                    No orders match the selected filters.
                  </td>
                </tr>
              )}
              {previewRows.map((order) => (
                <tr key={order.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-4 font-medium">{order.order_number}</td>
                  <td className="p-4">{order.customer_name}</td>
                  <td className="p-4 text-on-surface-variant">
                    {new Date(order.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td className="p-4">{formatPrice(order.total)}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full font-body text-[10px] leading-[1.0] tracking-[0.1em] font-medium uppercase ${getPaymentBadgeClass(order.payment_status)}`}
                    >
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary-container text-on-primary-container font-body text-[10px] leading-[1.0] tracking-[0.1em] font-medium uppercase">
                      {order.order_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  );
}
