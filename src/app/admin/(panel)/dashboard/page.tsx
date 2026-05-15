"use client";

import { motion } from "framer-motion";

const stats = [
  {
    label: "Total Orders",
    value: "12,485",
    trend: "+4.2% from last month",
    icon: "all_inbox",
    trendIcon: "trending_up",
    bgClass: "bg-surface-container-low",
    iconColor: "text-primary",
  },
  {
    label: "Today's Orders",
    value: "142",
    trend: "+12% from yesterday",
    icon: "local_mall",
    trendIcon: "trending_up",
    bgClass: "bg-surface-container-low",
    iconColor: "text-primary",
  },
  {
    label: "Today's Revenue",
    value: "$4,850.00",
    trend: "+8% from yesterday",
    icon: "payments",
    trendIcon: "trending_up",
    bgClass: "bg-tertiary-container/20",
    iconColor: "text-tertiary-container",
  },
  {
    label: "Pending Orders",
    value: "28",
    trend: "Requires attention",
    icon: "pending_actions",
    trendIcon: "info",
    bgClass: "bg-error-container/50",
    iconColor: "text-error",
  },
];

const recentOrders = [
  {
    id: "#ORD-9021",
    customer: "Eleanor Vance",
    initials: "EW",
    date: "Oct 24, 2023",
    total: "$125.00",
    payment: "Paid",
    paymentStyle: "bg-surface-container text-on-surface",
    status: "Processing",
    statusStyle: "bg-primary-container text-on-primary-container",
  },
  {
    id: "#ORD-9020",
    customer: "Julianne Moore",
    initials: "JD",
    date: "Oct 24, 2023",
    total: "$85.50",
    payment: "Paid",
    paymentStyle: "bg-surface-container text-on-surface",
    status: "Shipped",
    statusStyle: "bg-outline-variant/30 text-on-surface",
  },
  {
    id: "#ORD-9019",
    customer: "Arthur Mitchell",
    initials: "AM",
    date: "Oct 23, 2023",
    total: "$210.00",
    payment: "Failed",
    paymentStyle: "bg-error-container text-on-error-container",
    status: "Cancelled",
    statusStyle: "bg-surface-container text-on-surface-variant",
  },
  {
    id: "#ORD-9018",
    customer: "Sarah Landon",
    initials: "SL",
    date: "Oct 23, 2023",
    total: "$45.00",
    payment: "Pending",
    paymentStyle: "bg-tertiary-container text-on-tertiary-container",
    status: "Awaiting Payment",
    statusStyle: "bg-surface-container text-on-surface-variant",
  },
];

export default function AdminDashboard() {
  return (
    <div className="p-[var(--spacing-margin-mobile)] md:p-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto w-full flex-grow flex flex-col gap-[var(--spacing-stack-lg)]">
      {/* Page Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-[36px] md:text-[48px] leading-[1.2] text-on-surface">
          Dashboard Overview
        </h1>
        <p className="font-body text-[18px] leading-[1.6] text-on-surface-variant mt-2 max-w-2xl">
          Daily metrics and recent apothecary transactions.
        </p>
      </motion.header>

      {/* Stats Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[var(--spacing-gutter)]">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="bg-surface-container-lowest border rounded-xl p-6 flex flex-col justify-between h-full relative overflow-hidden border-outline-variant"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant">
                {stat.label}
              </h3>
              <div className={`p-2 ${stat.bgClass} rounded-lg`}>
                <span className={`material-symbols-outlined ${stat.iconColor}`}>
                  {stat.icon}
                </span>
              </div>
            </div>
            <div>
              <p className="font-display text-[32px] leading-[1.3] text-on-surface mb-1">
                {stat.value}
              </p>
              <p className="font-body text-[14px] leading-[1.6] text-on-surface-variant flex items-center gap-1">
                <span
                  className={`material-symbols-outlined text-[16px] ${stat.iconColor}`}
                >
                  {stat.trendIcon}
                </span>
                <span>{stat.trend}</span>
              </p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Recent Orders Table */}
      <motion.section
        className="bg-surface-container-lowest border rounded-xl overflow-hidden flex flex-col border-outline-variant"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-6 border-b border-outline-variant/50 flex justify-between items-center">
          <h2 className="font-display text-[24px] leading-[1.4] text-on-surface">
            Recent Orders
          </h2>
          <button className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-primary hover:text-primary-container transition-colors">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant">
              <tr>
                <th className="p-4 font-normal">Order #</th>
                <th className="p-4 font-normal">Customer</th>
                <th className="p-4 font-normal">Date</th>
                <th className="p-4 font-normal">Total</th>
                <th className="p-4 font-normal">Payment</th>
                <th className="p-4 font-normal">Status</th>
              </tr>
            </thead>
            <tbody className="font-body text-[16px] leading-[1.6] text-on-surface divide-y divide-outline-variant/30">
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                >
                  <td className="p-4 font-medium">{order.id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-body text-[10px] tracking-[0.1em] font-medium">
                        {order.initials}
                      </div>
                      <span>{order.customer}</span>
                    </div>
                  </td>
                  <td className="p-4 text-on-surface-variant">{order.date}</td>
                  <td className="p-4">{order.total}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full ${order.paymentStyle} font-body text-[10px] tracking-[0.1em] font-medium`}
                    >
                      {order.payment}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full ${order.statusStyle} font-body text-[10px] tracking-[0.1em] font-medium`}
                    >
                      {order.status}
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
