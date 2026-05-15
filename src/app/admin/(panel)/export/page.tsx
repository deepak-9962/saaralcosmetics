"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { listOrders } from "@/lib/supabase/data";
import type { Order } from "@/lib/types";

function createCsv(rows: Array<Record<string, string | number | null>>) {
  if (rows.length === 0) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const escapeCell = (value: string | number | null) => {
    const valueString = value === null ? "" : String(value);
    return `"${valueString.replaceAll('"', '""')}"`;
  };

  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escapeCell(row[header] ?? "")).join(",")),
  ];

  return lines.join("\n");
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AdminExportPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

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

  const dateFilteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = new Date(order.created_at);
      const orderDay = new Date(
        orderDate.getFullYear(),
        orderDate.getMonth(),
        orderDate.getDate()
      );

      if (fromDate) {
        const fromDay = new Date(fromDate);
        if (orderDay < fromDay) {
          return false;
        }
      }

      if (toDate) {
        const toDay = new Date(toDate);
        if (orderDay > toDay) {
          return false;
        }
      }

      return true;
    });
  }, [orders, fromDate, toDate]);

  const exportAllOrders = () => {
    const rows = orders.map((order) => ({
      order_number: order.order_number,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_email: order.customer_email,
      city: order.city,
      state: order.state,
      pincode: order.pincode,
      subtotal: order.subtotal,
      shipping_charge: order.shipping_charge,
      total: order.total,
      payment_status: order.payment_status,
      order_status: order.order_status,
      created_at: order.created_at,
    }));

    downloadCsv("orders.csv", createCsv(rows));
  };

  const exportDateFilteredOrders = () => {
    const rows = dateFilteredOrders.map((order) => ({
      order_number: order.order_number,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_email: order.customer_email,
      city: order.city,
      state: order.state,
      pincode: order.pincode,
      subtotal: order.subtotal,
      shipping_charge: order.shipping_charge,
      total: order.total,
      payment_status: order.payment_status,
      order_status: order.order_status,
      created_at: order.created_at,
    }));

    downloadCsv("orders-by-date.csv", createCsv(rows));
  };

  const exportCustomers = () => {
    const uniqueCustomers = new Map<
      string,
      { name: string; phone: string; email: string | null; city: string; state: string }
    >();

    orders.forEach((order) => {
      const key = order.customer_phone;
      if (!uniqueCustomers.has(key)) {
        uniqueCustomers.set(key, {
          name: order.customer_name,
          phone: order.customer_phone,
          email: order.customer_email,
          city: order.city,
          state: order.state,
        });
      }
    });

    const rows = Array.from(uniqueCustomers.values()).map((customer) => ({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      city: customer.city,
      state: customer.state,
    }));

    downloadCsv("customer-contacts.csv", createCsv(rows));
  };

  return (
    <div className="p-[var(--spacing-margin-mobile)] md:p-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto w-full flex-grow flex flex-col gap-[var(--spacing-stack-lg)]">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-[36px] md:text-[48px] leading-[1.2] text-on-surface">
          Export Data
        </h1>
        <p className="font-body text-[18px] leading-[1.6] text-on-surface-variant mt-2 max-w-2xl">
          Download your Supabase orders and customer data as CSV files.
        </p>
      </motion.header>

      {error && <p className="font-body text-[14px] leading-[1.6] text-error">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-gutter)]">
        <motion.div
          className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="p-3 bg-surface-container-low rounded-lg w-fit">
            <span className="material-symbols-outlined text-primary text-2xl">
              receipt_long
            </span>
          </div>
          <h3 className="font-display text-[24px] leading-[1.4] text-on-surface">
            All Orders
          </h3>
          <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
            Export all order records with customer details, payment status, and
            fulfillment status.
          </p>
          <button
            onClick={exportAllOrders}
            className="mt-auto bg-tertiary-container text-on-tertiary-container py-3 rounded-xl font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Download CSV
          </button>
        </motion.div>

        <motion.div
          className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-3 bg-surface-container-low rounded-lg w-fit">
            <span className="material-symbols-outlined text-primary text-2xl">
              date_range
            </span>
          </div>
          <h3 className="font-display text-[24px] leading-[1.4] text-on-surface">
            Orders by Date
          </h3>
          <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
            Filter orders by a specific date range before exporting.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body text-[14px] text-on-surface focus:outline-none focus:border-tertiary-container"
            />
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body text-[14px] text-on-surface focus:outline-none focus:border-tertiary-container"
            />
          </div>
          <button
            onClick={exportDateFilteredOrders}
            className="mt-auto bg-tertiary-container text-on-tertiary-container py-3 rounded-xl font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Download CSV
          </button>
        </motion.div>

        <motion.div
          className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="p-3 bg-surface-container-low rounded-lg w-fit">
            <span className="material-symbols-outlined text-primary text-2xl">
              group
            </span>
          </div>
          <h3 className="font-display text-[24px] leading-[1.4] text-on-surface">
            Customer Contacts
          </h3>
          <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
            Export unique customer contact list for follow-up and campaigns.
          </p>
          <button
            onClick={exportCustomers}
            className="mt-auto bg-tertiary-container text-on-tertiary-container py-3 rounded-xl font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Download CSV
          </button>
        </motion.div>
      </div>
    </div>
  );
}
