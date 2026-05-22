"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import { listAllProductsForAdmin, updateProductActive, deleteProduct, subscribeToProducts } from "@/lib/supabase/data";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[11px] font-medium font-body">Out of Stock</span>;
  if (stock < 10) return <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-medium font-body">Low ({stock})</span>;
  return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-medium font-body">{stock}</span>;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadProducts() {
    try {
      setError(null);
      const data = await listAllProductsForAdmin();
      setProducts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load products.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
    // Realtime: reload when any product changes
    const unsubscribe = subscribeToProducts(() => {
      listAllProductsForAdmin().then(setProducts).catch(console.error);
    });
    return unsubscribe;
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category === categoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, categoryFilter, searchQuery]);

  const handleToggleActive = async (product: Product, nextValue: boolean) => {
    try {
      await updateProductActive(product.id, nextValue);
      setProducts((prev) =>
        prev.map((item) => (item.id === product.id ? { ...item, is_active: nextValue } : item))
      );
      toast.success(nextValue ? "Product activated" : "Product deactivated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update product.");
    }
  };

  const handleDelete = async (productId: string) => {
    setIsDeleting(true);
    try {
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success("Product deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete product.");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "face-cream", label: "Face Cream" },
    { value: "face-wash", label: "Face Wash" },
    { value: "soap", label: "Soap" },
    { value: "nalangu-maavu", label: "Nalangu Maavu" },
  ];

  return (
    <div className="p-[var(--spacing-margin-mobile)] md:p-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto w-full flex-grow flex flex-col gap-[var(--spacing-stack-md)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[32px] leading-[1.3] text-on-surface tracking-tight">Products</h1>
          <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
            {products.length} products · {products.filter((p) => p.is_active).length} active
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="px-5 py-2.5 rounded-xl bg-tertiary-container text-on-tertiary-container hover:bg-tertiary-fixed-dim transition-colors font-body text-[13px] leading-[1.0] tracking-[0.08em] font-medium shadow-sm flex items-center gap-2 w-fit"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
          <input
            type="text"
            placeholder="Search by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-surface-container-lowest border border-outline-variant rounded-xl font-body text-[14px] text-on-surface focus:outline-none focus:border-tertiary-container transition-all"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-11 px-4 bg-surface-container-lowest border border-outline-variant rounded-xl font-body text-[14px] text-on-surface focus:outline-none focus:border-tertiary-container"
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {error && <p className="font-body text-[14px] leading-[1.6] text-error border border-red-200 bg-red-50 rounded-lg p-3">{error}</p>}

      {isLoading ? (
        <div className="flex items-center gap-3 py-8">
          <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
          <p className="font-body text-[14px] text-on-surface-variant">Loading products...</p>
        </div>
      ) : (
        <motion.section
          className="bg-surface-container-lowest border rounded-xl overflow-hidden border-outline-variant"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">
                <tr>
                  <th className="p-4 font-normal">Product</th>
                  <th className="p-4 font-normal">Category</th>
                  <th className="p-4 font-normal">Price</th>
                  <th className="p-4 font-normal">Stock</th>
                  <th className="p-4 font-normal">Active</th>
                  <th className="p-4 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="font-body text-[15px] leading-[1.6] text-on-surface divide-y divide-outline-variant/30">
                {filteredProducts.length === 0 && (
                  <tr>
                    <td className="p-6 text-on-surface-variant" colSpan={6}>
                      No products match your search.
                    </td>
                  </tr>
                )}
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-surface-container-low/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-[15px]">{product.name}</p>
                          <p className="text-[12px] text-on-surface-variant">{product.variant_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-surface-container text-[12px] font-body capitalize">
                        {product.category.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                      </span>
                    </td>
                    <td className="p-4 font-medium">{formatPrice(product.price)}</td>
                    <td className="p-4"><StockBadge stock={product.stock} /></td>
                    <td className="p-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={product.is_active}
                          onChange={(e) => handleToggleActive(product, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary-container" />
                      </label>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-1.5 rounded-lg hover:bg-primary-container text-on-surface-variant hover:text-on-primary-container transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(product.id)}
                          className="p-1.5 rounded-lg hover:bg-red-100 text-on-surface-variant hover:text-red-700 transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
            <motion.div
              className="relative bg-surface border border-outline-variant rounded-2xl p-7 shadow-2xl max-w-sm w-full"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-600" style={{ fontVariationSettings: "'FILL' 1" }}>delete</span>
                </div>
                <h3 className="font-display text-[20px] text-on-surface">Delete Product?</h3>
              </div>
              <p className="font-body text-[14px] text-on-surface-variant leading-[1.6] mb-6">
                This will permanently remove the product from your store. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-outline-variant font-body text-[14px] font-medium text-on-surface hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteConfirmId)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-body text-[14px] font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
