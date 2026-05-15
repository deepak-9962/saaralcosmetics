"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const mockOrders = [
  {
    id: "ORD-0942",
    customer: "Eleanor Vance",
    initials: "EL",
    items: 3,
    total: "$145.00",
    date: "Today, 10:42 AM",
    status: "Pending",
    statusStyle: "bg-tertiary-container/20 text-tertiary",
    email: "eleanor.v@example.com",
    address: "123 Heritage Lane\nApt 4B\nPortland, OR 97205",
    payment: "Ending in 4242",
    orderItems: [
      { name: "Rose Quartz Ritual Roller", qty: 1, price: "$45.00" },
      { name: "Golden Hour Botanical Oil", qty: 1, price: "$68.00" },
      { name: "Saffron Glow Mask", qty: 1, price: "$32.00" },
    ],
    subtotal: "$113.00",
    shipping: "$12.00",
    tax: "$20.00",
    orderTotal: "$145.00",
  },
  {
    id: "ORD-0941",
    customer: "Marcus Reed",
    initials: "MR",
    items: 1,
    total: "$85.00",
    date: "Yesterday, 4:15 PM",
    status: "Paid",
    statusStyle: "bg-primary/10 text-primary",
    email: "marcus.r@example.com",
    address: "45 Elm Street\nNew York, NY 10001",
    payment: "Ending in 1234",
    orderItems: [
      { name: "Kumkumadi Radiance Elixir", qty: 1, price: "$85.00" },
    ],
    subtotal: "$85.00",
    shipping: "$0.00",
    tax: "$0.00",
    orderTotal: "$85.00",
  },
  {
    id: "ORD-0940",
    customer: "Sarah Jenkins",
    initials: "SJ",
    items: 5,
    total: "$320.00",
    date: "Oct 24, 2023",
    status: "Shipped",
    statusStyle: "bg-surface-container-high text-on-surface-variant",
    email: "sarah.j@example.com",
    address: "789 Oak Ave\nSan Francisco, CA 94102",
    payment: "Ending in 5678",
    orderItems: [
      { name: "Botanical Cleansing Oil", qty: 2, price: "$90.00" },
      { name: "Heritage Nalangu Maavu", qty: 3, price: "$135.00" },
    ],
    subtotal: "$280.00",
    shipping: "$15.00",
    tax: "$25.00",
    orderTotal: "$320.00",
  },
];

const tabs = ["All Orders", "Pending", "Paid", "Shipped"];

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState("All Orders");
  const [selectedOrder, setSelectedOrder] = useState(mockOrders[0]);

  return (
    <div className="flex-grow flex overflow-hidden">
      {/* Orders List (Left) */}
      <div className="flex-grow flex flex-col overflow-y-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-[var(--spacing-stack-md)] border-r border-outline-variant/30 custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-[32px] leading-[1.3] text-on-background tracking-tight">
            Order Management
          </h2>
          <div className="relative w-full max-w-md hidden md:block ml-6">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
            <input
              type="text"
              placeholder="Search orders, customers..."
              className="w-full h-12 pl-12 pr-4 bg-surface-container-lowest border border-outline-variant rounded-xl font-body text-[16px] leading-[1.6] text-on-surface focus:outline-none focus:border-tertiary-container focus:ring-1 focus:ring-tertiary-container transition-all custom-shadow"
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-6 border-b border-outline-variant mb-[var(--spacing-stack-md)] overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 border-b-2 font-body text-[16px] leading-[1.6] whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "border-primary text-primary font-bold"
                  : "border-transparent text-on-surface-variant hover:text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Order Items */}
        <div className="flex flex-col gap-4">
          {mockOrders.map((order) => (
            <motion.div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className={`rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all custom-shadow ${
                selectedOrder.id === order.id
                  ? "bg-primary-container/10 border border-primary/20 hover:bg-primary-container/20"
                  : "bg-surface-container-lowest border border-outline-variant/50 hover:shadow-sm"
              }`}
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    selectedOrder.id === order.id
                      ? "bg-surface-container text-primary"
                      : "bg-surface-container text-on-surface-variant"
                  }`}
                >
                  {order.initials}
                </div>
                <div>
                  <h3
                    className={`font-body text-[18px] leading-[1.6] text-on-surface ${
                      selectedOrder.id === order.id ? "font-bold" : "font-medium"
                    }`}
                  >
                    #{order.id}
                  </h3>
                  <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
                    {order.customer} • {order.items} items
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <p className="font-body text-[18px] leading-[1.6] text-on-surface">
                    {order.total}
                  </p>
                  <p className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant mt-1">
                    {order.date}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium ${order.statusStyle}`}
                >
                  {order.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Order Detail Panel (Right) */}
      <div className="hidden lg:flex flex-col w-[400px] xl:w-[500px] bg-surface-container-lowest border-l border-outline-variant/30 overflow-y-auto custom-scrollbar">
        <div className="p-[var(--spacing-gutter)] border-b border-outline-variant/50 flex items-center justify-between sticky top-0 bg-surface-container-lowest/90 backdrop-blur z-10">
          <h2 className="font-display text-[24px] leading-[1.4] text-on-surface">
            Order Details
          </h2>
          <div className="flex gap-2">
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container">
              <span className="material-symbols-outlined">print</span>
            </button>
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </div>

        <div className="p-[var(--spacing-gutter)] flex flex-col gap-[var(--spacing-stack-md)]">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-display text-[36px] leading-[1.2] text-on-background mb-1">
                #{selectedOrder.id}
              </h3>
              <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
                Placed on {selectedOrder.date}
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-surface-container border border-outline-variant rounded-lg">
              <span className="w-2 h-2 rounded-full bg-tertiary-container" />
              <span className="font-body text-[16px] leading-[1.6] font-medium text-on-surface">
                {selectedOrder.status}
              </span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30">
            <h4 className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant mb-4">
              Customer Information
            </h4>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-tertiary-container/20 flex items-center justify-center text-tertiary font-display text-[24px] leading-[1.4]">
                {selectedOrder.initials}
              </div>
              <div>
                <p className="font-body text-[18px] leading-[1.6] text-on-surface font-medium">
                  {selectedOrder.customer}
                </p>
                <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
                  {selectedOrder.email}
                </p>
              </div>
            </div>
            <div className="h-px bg-outline-variant/30 w-full mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant mb-1">
                  Shipping Address
                </p>
                <p className="font-body text-[16px] leading-[1.6] text-on-surface whitespace-pre-line">
                  {selectedOrder.address}
                </p>
              </div>
              <div>
                <p className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant mb-1">
                  Payment Method
                </p>
                <p className="font-body text-[16px] leading-[1.6] text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">
                    credit_card
                  </span>
                  {selectedOrder.payment}
                </p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h4 className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant mb-4">
              Order Items
            </h4>
            <div className="flex flex-col gap-4">
              {selectedOrder.orderItems.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-surface-container overflow-hidden flex items-center justify-center">
                    <span className="material-symbols-outlined text-outline-variant">
                      inventory_2
                    </span>
                  </div>
                  <div className="flex-grow">
                    <p className="font-body text-[16px] leading-[1.6] text-on-surface font-medium">
                      {item.name}
                    </p>
                    <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
                      Qty: {item.qty}
                    </p>
                  </div>
                  <p className="font-body text-[18px] leading-[1.6] text-on-surface">
                    {item.price}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-surface-container-lowest border-t border-outline-variant/50 pt-4">
            <div className="flex justify-between mb-2">
              <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
                Subtotal
              </p>
              <p className="font-body text-[16px] leading-[1.6] text-on-surface">
                {selectedOrder.subtotal}
              </p>
            </div>
            <div className="flex justify-between mb-2">
              <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
                Shipping
              </p>
              <p className="font-body text-[16px] leading-[1.6] text-on-surface">
                {selectedOrder.shipping}
              </p>
            </div>
            <div className="flex justify-between mb-4">
              <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
                Tax
              </p>
              <p className="font-body text-[16px] leading-[1.6] text-on-surface">
                {selectedOrder.tax}
              </p>
            </div>
            <div className="h-px bg-outline-variant/30 w-full mb-4" />
            <div className="flex justify-between items-center">
              <p className="font-display text-[24px] leading-[1.4] text-on-surface font-bold">
                Total
              </p>
              <p className="font-display text-[24px] leading-[1.4] text-on-surface font-bold">
                {selectedOrder.orderTotal}
              </p>
            </div>
            <button className="w-full mt-6 bg-tertiary-container text-on-background font-body text-[18px] leading-[1.6] py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 custom-shadow">
              <span className="material-symbols-outlined">local_shipping</span>
              Mark as Shipped
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
