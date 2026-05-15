"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { createProduct } from "@/lib/supabase/data";
import type { Product } from "@/lib/types";

type ProductFormState = {
  name: string;
  category: Product["category"];
  variant_name: string;
  price: string;
  compare_price: string;
  description: string;
  ingredients: string;
  how_to_use: string;
  images: string;
  stock: string;
  is_active: boolean;
};

const initialState: ProductFormState = {
  name: "",
  category: "face-cream",
  variant_name: "",
  price: "",
  compare_price: "",
  description: "",
  ingredients: "",
  how_to_use: "",
  images: "",
  stock: "0",
  is_active: true,
};

export default function AdminAddProductPage() {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormState>(initialState);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = event.target;
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setForm((prev) => ({ ...prev, [target.name]: target.checked }));
      return;
    }

    setForm((prev) => ({ ...prev, [target.name]: target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const parsedPrice = Number(form.price);
    const parsedStock = Number(form.stock);
    const parsedComparePrice = form.compare_price ? Number(form.compare_price) : null;
    const imageList = form.images
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError("Enter a valid product price.");
      return;
    }
    if (!Number.isFinite(parsedStock) || parsedStock < 0) {
      setError("Enter a valid stock quantity.");
      return;
    }
    if (imageList.length === 0) {
      setError("Add at least one product image URL.");
      return;
    }

    try {
      setIsSaving(true);
      await createProduct({
        name: form.name.trim(),
        category: form.category,
        variant_name: form.variant_name.trim() || null,
        price: parsedPrice,
        compare_price: parsedComparePrice,
        description: form.description.trim() || null,
        ingredients: form.ingredients.trim() || null,
        how_to_use: form.how_to_use.trim() || null,
        images: imageList,
        stock: parsedStock,
        is_active: form.is_active,
      });

      toast.success("Product created");
      router.push("/admin/products");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to create product.");
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 rounded bg-tertiary-container text-on-tertiary-container hover:bg-tertiary-fixed-dim transition-colors duration-200 font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium shadow-sm disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Product"}
          </button>
        </div>
      </header>

      <motion.div
        className="p-[var(--spacing-margin-mobile)] md:p-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-[var(--spacing-gutter)] pb-[var(--spacing-stack-lg)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <section className="bg-surface p-6 md:p-8 rounded-xl border border-outline-variant/50 custom-shadow space-y-5">
          <h2 className="font-display text-[24px] leading-[1.4] text-on-surface">Basics</h2>

          <div className="space-y-2">
            <label className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant">
              Product Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3"
              >
                <option value="face-cream">Face Cream</option>
                <option value="face-wash">Face Wash</option>
                <option value="soap">Soap</option>
                <option value="nalangu-maavu">Nalangu Maavu</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant">
                Variant
              </label>
              <input
                name="variant_name"
                value={form.variant_name}
                onChange={handleChange}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant">
                Price (INR)
              </label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                required
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3"
              />
            </div>
            <div className="space-y-2">
              <label className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant">
                Compare Price (Optional)
              </label>
              <input
                name="compare_price"
                type="number"
                value={form.compare_price}
                onChange={handleChange}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant">
              Stock
            </label>
            <input
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3"
            />
          </div>

          <label className="flex items-center gap-3">
            <input
              name="is_active"
              type="checkbox"
              checked={form.is_active}
              onChange={handleChange}
            />
            <span className="font-body text-[14px] leading-[1.6] text-on-surface">
              Active product
            </span>
          </label>
        </section>

        <section className="bg-surface p-6 md:p-8 rounded-xl border border-outline-variant/50 custom-shadow space-y-5">
          <h2 className="font-display text-[24px] leading-[1.4] text-on-surface">Details</h2>

          <div className="space-y-2">
            <label className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant">
              Description
            </label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3"
            />
          </div>

          <div className="space-y-2">
            <label className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant">
              Ingredients
            </label>
            <textarea
              name="ingredients"
              rows={3}
              value={form.ingredients}
              onChange={handleChange}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3"
            />
          </div>

          <div className="space-y-2">
            <label className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant">
              How to Use
            </label>
            <textarea
              name="how_to_use"
              rows={3}
              value={form.how_to_use}
              onChange={handleChange}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3"
            />
          </div>

          <div className="space-y-2">
            <label className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant">
              Image URLs (comma-separated)
            </label>
            <textarea
              name="images"
              rows={4}
              value={form.images}
              onChange={handleChange}
              placeholder="https://.../image-1.jpg, https://.../image-2.jpg"
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3"
            />
          </div>
        </section>

        {error && (
          <p className="lg:col-span-2 font-body text-[14px] leading-[1.6] text-error">{error}</p>
        )}
      </motion.div>
    </form>
  );
}
