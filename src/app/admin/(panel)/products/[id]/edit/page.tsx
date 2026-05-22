"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { getProductById, updateProduct } from "@/lib/supabase/data";
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

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [form, setForm] = useState<ProductFormState | null>(null);
  const [slug, setSlug] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        const product = await getProductById(productId);
        if (!product) {
          setError("Product not found.");
          setIsLoading(false);
          return;
        }
        setSlug(product.slug);
        setForm({
          name: product.name,
          category: product.category,
          variant_name: product.variant_name ?? "",
          price: product.price.toString(),
          compare_price: product.compare_price?.toString() ?? "",
          description: product.description ?? "",
          ingredients: product.ingredients ?? "",
          how_to_use: product.how_to_use ?? "",
          images: product.images.join(", "),
          stock: product.stock.toString(),
          is_active: product.is_active,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load product.");
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    if (!form) return;
    const target = event.target;
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setForm((prev) => prev ? { ...prev, [target.name]: target.checked } : prev);
      return;
    }
    setForm((prev) => prev ? { ...prev, [target.name]: target.value } : prev);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form) return;
    setError(null);

    const parsedPrice = Number(form.price);
    const parsedStock = Number(form.stock);
    const parsedComparePrice = form.compare_price ? Number(form.compare_price) : null;
    const imageList = form.images.split(",").map((s) => s.trim()).filter(Boolean);

    if (!form.name.trim()) { setError("Product name is required."); return; }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) { setError("Enter a valid product price."); return; }
    if (!Number.isFinite(parsedStock) || parsedStock < 0) { setError("Enter a valid stock quantity."); return; }
    if (imageList.length === 0) { setError("Add at least one product image URL."); return; }

    try {
      setIsSaving(true);
      await updateProduct(productId, {
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
      toast.success("Product updated!");
      router.push("/admin/products");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update product.");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3">
        <span className="material-symbols-outlined animate-spin text-primary text-[32px]">progress_activity</span>
        <p className="font-body text-[16px] text-on-surface-variant">Loading product...</p>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="p-8">
        <p className="font-body text-[16px] text-error">{error}</p>
        <Link href="/admin/products" className="mt-4 inline-flex items-center gap-2 text-primary font-body text-[14px]">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Products
        </Link>
      </div>
    );
  }

  if (!form) return null;

  return (
    <form onSubmit={handleSubmit}>
      {/* Sticky header */}
      <header className="flex items-center justify-between px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-[var(--spacing-stack-md)] border-b border-outline-variant/30 bg-surface/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-lg hover:bg-primary-container"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h1 className="font-display text-[28px] leading-[1.3] text-on-surface tracking-tight">Edit Product</h1>
            <p className="font-body text-[12px] leading-[1.0] tracking-[0.1em] text-on-surface-variant">
              slug: <span className="font-mono text-primary">{slug}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/products"
            className="px-5 py-2 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors font-body text-[13px] font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-tertiary-container text-on-tertiary-container hover:bg-tertiary-fixed-dim transition-colors font-body text-[13px] font-medium shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <><span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>Saving...</>
            ) : (
              <><span className="material-symbols-outlined text-[16px]">save</span>Save Changes</>
            )}
          </button>
        </div>
      </header>

      <motion.div
        className="p-[var(--spacing-margin-mobile)] md:p-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-[var(--spacing-gutter)] pb-[var(--spacing-stack-lg)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Basics */}
        <section className="bg-surface p-6 md:p-8 rounded-xl border border-outline-variant/50 custom-shadow space-y-5">
          <h2 className="font-display text-[24px] leading-[1.4] text-on-surface">Basics</h2>

          <div className="space-y-2">
            <label className="font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">Product Name</label>
            <input name="name" value={form.name} onChange={handleChange} required className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body text-[15px] text-on-surface focus:outline-none focus:border-tertiary-container transition-all" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body text-[15px] text-on-surface focus:outline-none focus:border-tertiary-container">
                <option value="face-cream">Face Cream</option>
                <option value="face-wash">Face Wash</option>
                <option value="soap">Soap</option>
                <option value="nalangu-maavu">Nalangu Maavu</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">Variant (e.g. 50g)</label>
              <input name="variant_name" value={form.variant_name} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body text-[15px] text-on-surface focus:outline-none focus:border-tertiary-container transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">Price (₹)</label>
              <input name="price" type="number" value={form.price} onChange={handleChange} required className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body text-[15px] text-on-surface focus:outline-none focus:border-tertiary-container transition-all" />
            </div>
            <div className="space-y-2">
              <label className="font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">Compare Price (₹ optional)</label>
              <input name="compare_price" type="number" value={form.compare_price} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body text-[15px] text-on-surface focus:outline-none focus:border-tertiary-container transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">Stock Quantity</label>
            <input name="stock" type="number" value={form.stock} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body text-[15px] text-on-surface focus:outline-none focus:border-tertiary-container transition-all" />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input name="is_active" type="checkbox" checked={form.is_active} onChange={handleChange} className="w-4 h-4 accent-primary" />
            <span className="font-body text-[14px] leading-[1.6] text-on-surface">Active — visible on storefront</span>
          </label>

          {/* Current images preview */}
          {form.images.split(",").filter(Boolean).length > 0 && (
            <div className="space-y-2">
              <p className="font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">Current Images Preview</p>
              <div className="flex gap-2 flex-wrap">
                {form.images.split(",").map((url, i) => (
                  url.trim() && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={url.trim()} alt="" className="w-16 h-16 rounded-lg object-cover border border-outline-variant" />
                  )
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Details */}
        <section className="bg-surface p-6 md:p-8 rounded-xl border border-outline-variant/50 custom-shadow space-y-5">
          <h2 className="font-display text-[24px] leading-[1.4] text-on-surface">Details</h2>

          <div className="space-y-2">
            <label className="font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">Description</label>
            <textarea name="description" rows={4} value={form.description} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body text-[15px] text-on-surface focus:outline-none focus:border-tertiary-container resize-none transition-all" />
          </div>

          <div className="space-y-2">
            <label className="font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">Ingredients</label>
            <textarea name="ingredients" rows={3} value={form.ingredients} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body text-[15px] text-on-surface focus:outline-none focus:border-tertiary-container resize-none transition-all" />
          </div>

          <div className="space-y-2">
            <label className="font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">How to Use</label>
            <textarea name="how_to_use" rows={3} value={form.how_to_use} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body text-[15px] text-on-surface focus:outline-none focus:border-tertiary-container resize-none transition-all" />
          </div>

          <div className="space-y-2">
            <label className="font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">Image URLs (comma-separated)</label>
            <textarea
              name="images"
              rows={4}
              value={form.images}
              onChange={handleChange}
              placeholder="https://.../image-1.jpg, https://.../image-2.jpg"
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body text-[14px] text-on-surface focus:outline-none focus:border-tertiary-container resize-none transition-all"
            />
          </div>
        </section>

        {error && (
          <p className="lg:col-span-2 font-body text-[14px] leading-[1.6] text-error border border-red-200 bg-red-50 rounded-lg p-3">
            {error}
          </p>
        )}
      </motion.div>
    </form>
  );
}
