"use client";

import { motion } from "framer-motion";

export default function AdminExportPage() {
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
          Download your business data as CSV or Excel files.
        </p>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-gutter)]">
        {/* All Orders */}
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
            Export all order records with customer details, items, payment
            status, and fulfillment status.
          </p>
          <button className="mt-auto bg-tertiary-container text-on-tertiary-container py-3 rounded-xl font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              download
            </span>
            Download CSV
          </button>
        </motion.div>

        {/* Orders by Date Range */}
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
              className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body text-[14px] text-on-surface focus:outline-none focus:border-tertiary-container"
            />
            <input
              type="date"
              className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body text-[14px] text-on-surface focus:outline-none focus:border-tertiary-container"
            />
          </div>
          <button className="mt-auto bg-tertiary-container text-on-tertiary-container py-3 rounded-xl font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              download
            </span>
            Download CSV
          </button>
        </motion.div>

        {/* Customer List */}
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
            Export customer contact list — name, phone, email, and city for
            marketing.
          </p>
          <button className="mt-auto bg-tertiary-container text-on-tertiary-container py-3 rounded-xl font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              download
            </span>
            Download Excel
          </button>
        </motion.div>
      </div>
    </div>
  );
}
