"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { listOrders } from "@/lib/supabase/data";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/lib/types";

const ORDER_STATUSES: Array<{
  status: Order["order_status"];
  label: string;
  colorClass: string;
}> = [
  { status: "new", label: "New", colorClass: "bg-blue-500" },
  { status: "processing", label: "Processing", colorClass: "bg-yellow-500" },
  { status: "shipped", label: "Shipped", colorClass: "bg-indigo-500" },
  { status: "delivered", label: "Delivered", colorClass: "bg-emerald-500" },
  { status: "cancelled", label: "Cancelled", colorClass: "bg-red-500" },
];

function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await listOrders();
        setOrders(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load orders.");
      }
    }

    loadOrders();
  }, []);

  const stats = useMemo(() => {
    const todayKey = getDateKey(new Date());
    const todayOrdersList = orders.filter((order) => getDateKey(new Date(order.created_at)) === todayKey);
    const paidOrders = orders.filter((order) => order.payment_status === "paid");
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
    const todayRevenue = todayOrdersList
      .filter((order) => order.payment_status === "paid")
      .reduce((sum, order) => sum + order.total, 0);
    const pendingOrders = orders.filter(
      (order) => order.order_status === "new" || order.order_status === "processing"
    ).length;
    const deliveredOrders = orders.filter((order) => order.order_status === "delivered").length;
    const cancelledOrders = orders.filter((order) => order.order_status === "cancelled").length;
    const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
    const paymentSuccessRate =
      orders.length > 0 ? Math.round((paidOrders.length / orders.length) * 100) : 0;

    return {
      totalOrders: orders.length,
      todayOrders: todayOrdersList.length,
      totalRevenue,
      todayRevenue,
      avgOrderValue,
      paymentSuccessRate,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
    };
  }, [orders]);

  const statusBreakdown = useMemo(() => {
    const total = orders.length;
    return ORDER_STATUSES.map(({ status, label, colorClass }) => {
      const count = orders.filter((order) => order.order_status === status).length;
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      return { status, label, colorClass, count, pct };
    });
  }, [orders]);

  const revenueByState = useMemo(() => {
    const revenueMap = new Map<string, number>();

    orders.forEach((order) => {
      if (order.payment_status !== "paid") {
        return;
      }
      revenueMap.set(order.state, (revenueMap.get(order.state) ?? 0) + order.total);
    });

    return Array.from(revenueMap.entries())
      .map(([state, revenue]) => ({ state, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [orders]);

  const maxRevenue = revenueByState[0]?.revenue ?? 0;

  const bestSellingProducts = useMemo(() => {
    const productMap = new Map<
      string,
      { productId: string; name: string; unitsSold: number; revenue: number }
    >();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = productMap.get(item.product_id);
        const nextEntry = {
          productId: item.product_id,
          name: item.name,
          unitsSold: (existing?.unitsSold ?? 0) + item.qty,
          revenue: (existing?.revenue ?? 0) + item.price * item.qty,
        };
        productMap.set(item.product_id, nextEntry);
      });
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);
  }, [orders]);

  const statCards = [
    {
      label: "Total Orders",
      value: stats.totalOrders.toString(),
      subtitle: `${stats.todayOrders} today`,
      icon: "all_inbox",
    },
    {
      label: "Total Revenue",
      value: formatPrice(stats.totalRevenue),
      subtitle: `${formatPrice(stats.todayRevenue)} today`,
      icon: "payments",
    },
    {
      label: "Avg Order Value",
      value: formatPrice(stats.avgOrderValue),
      subtitle: "from paid orders",
      icon: "trending_up",
    },
    {
      label: "Payment Success",
      value: `${stats.paymentSuccessRate}%`,
      subtitle: "orders paid",
      icon: "verified",
    },
    {
      label: "Pending / Processing",
      value: stats.pendingOrders.toString(),
      subtitle: "needs attention",
      icon: "pending_actions",
    },
    {
      label: "Delivered",
      value: stats.deliveredOrders.toString(),
      subtitle: "fulfilled orders",
      icon: "inventory_2",
    },
    {
      label: "Cancelled",
      value: stats.cancelledOrders.toString(),
      subtitle: "cancelled orders",
      icon: "cancel",
    },
    {
      label: "Today's Orders",
      value: stats.todayOrders.toString(),
      subtitle: new Date().toLocaleDateString("en-IN"),
      icon: "local_mall",
    },
  ];

  const recentOrders = orders.slice(0, 8);

  return (
    <div className="p-[var(--spacing-margin-mobile)] md:p-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto w-full flex-grow flex flex-col gap-[var(--spacing-stack-lg)] overflow-y-auto custom-scrollbar">
      <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-[36px] md:text-[48px] leading-[1.2] text-on-surface">
          Dashboard Overview
        </h1>
        <p className="font-body text-[18px] leading-[1.6] text-on-surface-variant mt-2">
          Live analytics across orders, payments, and fulfillment.
        </p>
      </motion.header>

      {error && <p className="font-body text-[14px] leading-[1.6] text-error">{error}</p>}

      <section className="grid grid-cols-2 md:grid-cols-4 gap-[var(--spacing-gutter)]">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">
                {card.label}
              </p>
              <span className="material-symbols-outlined text-primary text-[20px]">{card.icon}</span>
            </div>
            <p className="font-display text-[28px] leading-[1.2] text-on-surface">{card.value}</p>
            <p className="font-body text-[12px] leading-[1.4] text-on-surface-variant mt-1">
              {card.subtitle}
            </p>
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-[var(--spacing-gutter)]">
        <motion.section
          className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="font-display text-[24px] leading-[1.4] text-on-surface mb-4">Orders by Status</h2>
          <div className="space-y-4">
            {statusBreakdown.map(({ status, label, colorClass, count, pct }) => (
              <div key={status}>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-body text-[14px] leading-[1.6] text-on-surface">{label}</p>
                  <p className="font-body text-[14px] leading-[1.6] text-on-surface-variant">
                    {count} ({pct}%)
                  </p>
                </div>
                <div className="h-2 rounded-full bg-surface-container overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${colorClass}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <h2 className="font-display text-[24px] leading-[1.4] text-on-surface mb-4">Revenue by State</h2>
          {revenueByState.length === 0 ? (
            <p className="font-body text-[14px] leading-[1.6] text-on-surface-variant">
              No paid orders yet.
            </p>
          ) : (
            <div className="space-y-4">
              {revenueByState.map(({ state, revenue }) => {
                const widthPct = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={state}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-body text-[14px] leading-[1.6] text-on-surface">{state}</p>
                      <p className="font-body text-[14px] leading-[1.6] text-on-surface-variant">
                        {formatPrice(revenue)}
                      </p>
                    </div>
                    <div className="h-2 rounded-full bg-surface-container overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-tertiary-container"
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.section>
      </div>

      <motion.section
        className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="p-6 border-b border-outline-variant/50">
          <h2 className="font-display text-[24px] leading-[1.4] text-on-surface">Best-Selling Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-surface-container-low font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">
              <tr>
                <th className="p-4 font-normal text-left">#</th>
                <th className="p-4 font-normal text-left">Product</th>
                <th className="p-4 font-normal text-left">Units Sold</th>
                <th className="p-4 font-normal text-left">Revenue</th>
              </tr>
            </thead>
            <tbody className="font-body text-[15px] leading-[1.6] text-on-surface divide-y divide-outline-variant/30">
              {bestSellingProducts.length === 0 && (
                <tr>
                  <td className="p-4 text-on-surface-variant" colSpan={4}>
                    No order data yet.
                  </td>
                </tr>
              )}
              {bestSellingProducts.map((product, index) => (
                <tr key={product.productId} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-4 text-on-surface-variant">#{index + 1}</td>
                  <td className="p-4 font-medium">{product.name}</td>
                  <td className="p-4">{product.unitsSold}</td>
                  <td className="p-4">{formatPrice(product.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      <motion.section
        className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        <div className="p-6 border-b border-outline-variant/50 flex items-center justify-between">
          <h2 className="font-display text-[24px] leading-[1.4] text-on-surface">Recent Orders</h2>
          <Link href="/admin/orders" className="font-body text-[14px] leading-[1.6] text-primary hover:underline">
            View all →
          </Link>
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
              {recentOrders.length === 0 && (
                <tr>
                  <td className="p-4 text-on-surface-variant" colSpan={6}>
                    No orders yet.
                  </td>
                </tr>
              )}
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-4 font-medium">{order.order_number}</td>
                  <td className="p-4">{order.customer_name}</td>
                  <td className="p-4 text-on-surface-variant">
                    {new Date(order.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td className="p-4">{formatPrice(order.total)}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full font-body text-[10px] leading-[1.0] tracking-[0.1em] font-medium uppercase ${
                        order.payment_status === "paid"
                          ? "bg-emerald-100 text-emerald-800"
                          : order.payment_status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
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
