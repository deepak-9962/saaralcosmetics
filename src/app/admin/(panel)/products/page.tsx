"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { listAllProductsForAdmin, updateProductActive } from "@/lib/supabase/data";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        setError(null);
        setIsLoading(true);
        const data = await listAllProductsForAdmin();
        setProducts(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load products.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

  const handleToggleActive = async (product: Product, nextValue: boolean) => {
    try {
      await updateProductActive(product.id, nextValue);
      setProducts((prev) =>
        prev.map((item) =>
          item.id === product.id ? { ...item, is_active: nextValue } : item
        )
      );
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Failed to update product.");
    }
  };

  return (
    <div className="p-[var(--spacing-margin-mobile)] md:p-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto w-full flex-grow flex flex-col gap-[var(--spacing-stack-md)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[32px] leading-[1.3] text-on-surface tracking-tight">
            Products
          </h1>
          <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
            Manage your apothecary collection
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="px-6 py-2 rounded bg-tertiary-container text-on-tertiary-container hover:bg-tertiary-fixed-dim transition-colors duration-200 font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium shadow-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Product
        </Link>
      </div>

      {error && <p className="font-body text-[14px] leading-[1.6] text-error">{error}</p>}
      {isLoading && (
        <p className="font-body text-[14px] leading-[1.6] text-on-surface-variant">
          Loading products...
        </p>
      )}

      <motion.section
        className="bg-surface-container-lowest border rounded-xl overflow-hidden border-outline-variant"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant">
              <tr>
                <th className="p-4 font-normal">Product</th>
                <th className="p-4 font-normal">Category</th>
                <th className="p-4 font-normal">Price</th>
                <th className="p-4 font-normal">Stock</th>
                <th className="p-4 font-normal">Active</th>
              </tr>
            </thead>
            <tbody className="font-body text-[16px] leading-[1.6] text-on-surface divide-y divide-outline-variant/30">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-surface-container-low/50 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-[14px] text-on-surface-variant">
                          {product.variant_name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded bg-surface-container text-[14px]">
                      {product.category
                        .split("-")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")}
                    </span>
                  </td>
                  <td className="p-4">{formatPrice(product.price)}</td>
                  <td className="p-4">{product.stock}</td>
                  <td className="p-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={product.is_active}
                        onChange={(event) => handleToggleActive(product, event.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary-container" />
                    </label>
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
