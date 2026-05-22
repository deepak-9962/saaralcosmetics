"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getCustomerByPhone, listOrdersByPhone } from "@/lib/supabase/data";
import { formatPrice } from "@/lib/utils";
import type { Customer } from "@/lib/supabase/data";
import type { Order } from "@/lib/types";

function getPaymentBadgeClass(status: Order["payment_status"]) {
  if (status === "paid") return "bg-emerald-100 text-emerald-800";
  if (status === "failed") return "bg-red-100 text-red-800";
  return "bg-yellow-100 text-yellow-800";
}

export default function CustomerDetailPage() {
  const params = useParams();
  const phone = decodeURIComponent(params.phone as string);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [c, o] = await Promise.all([
          getCustomerByPhone(phone),
          listOrdersByPhone(phone),
        ]);
        setCustomer(c);
        setOrders(o);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load customer.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [phone]);

  // Aggregate products bought
  const productsBought = useMemo(() => {
    const map = new Map<string, { name: string; totalQty: number; totalSpent: number }>();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = map.get(item.product_id);
        map.set(item.product_id, {
          name: item.name,
          totalQty: (existing?.totalQty ?? 0) + item.qty,
          totalSpent: (existing?.totalSpent ?? 0) + item.price * item.qty,
        });
      });
    });
    return Array.from(map.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.totalQty - a.totalQty);
  }, [orders]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3">
        <span className="material-symbols-outlined animate-spin text-primary text-[32px]">progress_activity</span>
        <p className="font-body text-[16px] text-on-surface-variant">Loading customer...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-8">
        <p className="font-body text-[16px] text-error">{error ?? "Customer not found."}</p>
        <Link href="/admin/customers" className="mt-4 inline-flex items-center gap-2 text-primary font-body text-[14px]">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div className="p-[var(--spacing-margin-mobile)] md:p-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto w-full flex-grow flex flex-col gap-[var(--spacing-stack-md)]">
      {/* Back */}
      <Link href="/admin/customers" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary font-body text-[13px] transition-colors w-fit">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        All Customers
      </Link>

      {/* Customer header */}
      <motion.section
        className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start gap-5 flex-wrap">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-body text-[22px] font-bold flex-shrink-0">
            {(customer.name ?? customer.phone).slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-[32px] leading-[1.2] text-on-surface">
              {customer.name ?? "Unknown Name"}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <a
                href={`https://wa.me/91${customer.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-body text-[14px] text-on-surface-variant hover:text-emerald-700 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-emerald-600">chat</span>
                {customer.phone}
              </a>
              {customer.email && (
                <span className="font-body text-[14px] text-on-surface-variant">{customer.email}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-body text-[12px]">
                First seen: {new Date(customer.first_seen_at).toLocaleDateString("en-IN")}
              </span>
              <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-body text-[12px]">
                Last order: {new Date(customer.last_seen_at).toLocaleDateString("en-IN")}
              </span>
              {customer.order_count > 1 && (
                <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-body text-[12px] font-medium">
                  ✦ Returning Customer
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-outline-variant/40">
          {[
            { label: "Total Orders", value: customer.order_count.toString() },
            { label: "Total Spent", value: formatPrice(customer.total_spent) },
            { label: "Avg per Order", value: customer.order_count > 0 ? formatPrice(customer.total_spent / customer.order_count) : "—" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-[24px] leading-[1.2] text-on-surface">{stat.value}</p>
              <p className="font-body text-[11px] text-on-surface-variant uppercase tracking-[0.1em] font-medium mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-[var(--spacing-gutter)]">
        {/* Products Bought */}
        <motion.section
          className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="p-5 border-b border-outline-variant/50">
            <h2 className="font-display text-[22px] leading-[1.4] text-on-surface">Products Bought</h2>
          </div>
          <div className="divide-y divide-outline-variant/30">
            {productsBought.length === 0 && (
              <p className="p-5 font-body text-[14px] text-on-surface-variant">No products yet.</p>
            )}
            {productsBought.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant font-body text-[12px] font-medium">
                    {index + 1}
                  </span>
                  <p className="font-body text-[14px] text-on-surface font-medium">{product.name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-body text-[14px] text-on-surface">{formatPrice(product.totalSpent)}</p>
                  <p className="font-body text-[12px] text-on-surface-variant">×{product.totalQty} units</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Order History */}
        <motion.section
          className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-5 border-b border-outline-variant/50">
            <h2 className="font-display text-[22px] leading-[1.4] text-on-surface">Order History</h2>
          </div>
          <div className="divide-y divide-outline-variant/30 max-h-96 overflow-y-auto custom-scrollbar">
            {orders.length === 0 && (
              <p className="p-5 font-body text-[14px] text-on-surface-variant">No orders yet.</p>
            )}
            {orders.map((order) => (
              <div key={order.id} className="p-4 hover:bg-surface-container-low/50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-body text-[14px] font-medium text-on-surface">{order.order_number}</p>
                    <p className="font-body text-[12px] text-on-surface-variant mt-0.5">
                      {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    <p className="font-body text-[12px] text-on-surface-variant">
                      {order.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-body text-[14px] font-medium text-on-surface">{formatPrice(order.total)}</p>
                    <div className="flex gap-1.5 mt-1 justify-end flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full font-body text-[10px] font-medium uppercase ${getPaymentBadgeClass(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-body text-[10px] font-medium uppercase">
                        {order.order_status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
