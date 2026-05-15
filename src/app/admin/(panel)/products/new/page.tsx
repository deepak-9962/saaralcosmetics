"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function AdminAddProductPage() {
  return (
    <>
      {/* Header */}
      <header className="flex items-center justify-between px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-[var(--spacing-stack-md)] border-b border-outline-variant/30 bg-surface/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2 text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h1 className="font-display text-[32px] leading-[1.3] text-on-surface tracking-tight">
              Add New Product
            </h1>
            <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
              Apothecary Heritage Collection
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <Link
            href="/admin/products"
            className="px-6 py-2 rounded border border-tertiary-container text-on-surface hover:bg-surface-container-low transition-colors duration-200 font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium"
          >
            Cancel
          </Link>
          <button className="px-6 py-2 rounded bg-tertiary-container text-on-tertiary-container hover:bg-tertiary-fixed-dim transition-colors duration-200 font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium shadow-sm">
            Save Product
          </button>
        </div>
      </header>

      {/* Form Area */}
      <motion.div
        className="p-[var(--spacing-margin-mobile)] md:p-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-[var(--spacing-stack-md)] lg:gap-[var(--spacing-gutter)] pb-[var(--spacing-stack-lg)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-[var(--spacing-stack-md)]">
          {/* Basic Info */}
          <section className="bg-surface p-6 md:p-8 rounded-xl border border-outline-variant/50 custom-shadow">
            <h2 className="font-display text-[24px] leading-[1.4] text-on-surface mb-[var(--spacing-stack-sm)] border-b border-outline-variant/30 pb-4">
              Basic Information
            </h2>
            <div className="space-y-6 mt-6">
              <div>
                <label className="block font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Saffron Radiance Serum"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 focus:outline-none focus:border-tertiary-container focus:ring-1 focus:ring-tertiary-container/30 transition-all font-body text-[16px] leading-[1.6] text-on-surface placeholder:text-outline"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <select className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 appearance-none focus:outline-none focus:border-tertiary-container focus:ring-1 focus:ring-tertiary-container/30 transition-all font-body text-[16px] leading-[1.6] text-on-surface">
                      <option>Select a category</option>
                      <option>Face Cream</option>
                      <option>Face Wash</option>
                      <option>Soap</option>
                      <option>Nalangu Maavu</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant mb-2">
                    Variant / Size
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 50ml Glass Dropper"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 focus:outline-none focus:border-tertiary-container focus:ring-1 focus:ring-tertiary-container/30 transition-all font-body text-[16px] leading-[1.6] text-on-surface placeholder:text-outline"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant mb-2">
                    Price (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">
                      $
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-8 pr-4 py-4 focus:outline-none focus:border-tertiary-container focus:ring-1 focus:ring-tertiary-container/30 transition-all font-body text-[16px] leading-[1.6] text-on-surface"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant mb-2">
                    Compare at Price (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">
                      $
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-8 pr-4 py-4 focus:outline-none focus:border-tertiary-container focus:ring-1 focus:ring-tertiary-container/30 transition-all font-body text-[16px] leading-[1.6] text-on-surface"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Product Story & Composition */}
          <section className="bg-surface p-6 md:p-8 rounded-xl border border-outline-variant/50 custom-shadow">
            <h2 className="font-display text-[24px] leading-[1.4] text-on-surface mb-[var(--spacing-stack-sm)] border-b border-outline-variant/30 pb-4">
              Product Story & Composition
            </h2>
            <div className="space-y-6 mt-6">
              <div>
                <label className="block font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant mb-2">
                  Description
                </label>
                <textarea
                  rows={5}
                  placeholder="Describe the product's origin, benefits, and sensory experience..."
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 focus:outline-none focus:border-tertiary-container focus:ring-1 focus:ring-tertiary-container/30 transition-all font-body text-[16px] leading-[1.6] text-on-surface placeholder:text-outline resize-y"
                />
              </div>
              <div>
                <label className="block font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant mb-2">
                  Key Ingredients
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Kashmiri Saffron, Cold-pressed Almond Oil, Rose Water..."
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 focus:outline-none focus:border-tertiary-container focus:ring-1 focus:ring-tertiary-container/30 transition-all font-body text-[16px] leading-[1.6] text-on-surface placeholder:text-outline resize-y"
                />
              </div>
              <div>
                <label className="block font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant mb-2">
                  Ritual / How to Use
                </label>
                <textarea
                  rows={3}
                  placeholder="Step-by-step application instructions..."
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 focus:outline-none focus:border-tertiary-container focus:ring-1 focus:ring-tertiary-container/30 transition-all font-body text-[16px] leading-[1.6] text-on-surface placeholder:text-outline resize-y"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-[var(--spacing-stack-md)]">
          {/* Image Upload */}
          <section className="bg-surface p-6 rounded-xl border border-outline-variant/50 custom-shadow">
            <h2 className="font-display text-[24px] leading-[1.4] text-on-surface mb-[var(--spacing-stack-sm)] border-b border-outline-variant/30 pb-4">
              Product Imagery
            </h2>
            <div className="mt-6 border-2 border-dashed border-outline-variant rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-tertiary-container hover:bg-surface-container-lowest transition-colors cursor-pointer group">
              <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-4 group-hover:bg-tertiary-container/10 transition-colors">
                <span className="material-symbols-outlined text-outline group-hover:text-tertiary-container text-3xl">
                  add_photo_alternate
                </span>
              </div>
              <p className="font-body text-[16px] leading-[1.6] text-on-surface mb-1">
                Drag & drop high-res images here
              </p>
              <p className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant">
                or click to browse files
              </p>
            </div>
          </section>

          {/* Availability */}
          <section className="bg-surface p-6 rounded-xl border border-outline-variant/50 custom-shadow">
            <h2 className="font-display text-[24px] leading-[1.4] text-on-surface mb-[var(--spacing-stack-sm)] border-b border-outline-variant/30 pb-4">
              Availability
            </h2>
            <div className="space-y-6 mt-6">
              <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/50">
                <div>
                  <p className="font-body text-[16px] leading-[1.6] font-medium text-on-surface">
                    Active Status
                  </p>
                  <p className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant mt-1">
                    Visible on boutique front
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary-container" />
                </label>
              </div>
              <div>
                <label className="block font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  defaultValue={50}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 focus:outline-none focus:border-tertiary-container focus:ring-1 focus:ring-tertiary-container/30 transition-all font-body text-[16px] leading-[1.6] text-on-surface"
                />
              </div>
              <div>
                <label className="block font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant mb-2">
                  SKU (Stock Keeping Unit)
                </label>
                <input
                  type="text"
                  placeholder="e.g. SAA-SER-001"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-4 focus:outline-none focus:border-tertiary-container focus:ring-1 focus:ring-tertiary-container/30 transition-all font-body text-[16px] leading-[1.6] text-on-surface placeholder:text-outline"
                />
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </>
  );
}
