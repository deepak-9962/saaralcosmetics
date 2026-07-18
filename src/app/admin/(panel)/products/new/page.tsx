"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import type { Product } from "@/lib/types";

// ── Types ────────────────────────────────────────────────────────────────────
type ProductFormState = {
  name: string;
  category: Product["category"];
  variant_name: string;
  price: string;
  compare_price: string;
  description: string;
  ingredients: string;
  how_to_use: string;
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
  stock: "0",
  is_active: true,
};

/** Allowed file types — mirrors the bucket's allowed_mime_types */
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_SIZE_LABEL = "5 MB";

// ── Label helper ─────────────────────────────────────────────────────────────
const inputClass =
  "w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body text-[16px] leading-[1.6] text-on-surface focus:outline-none focus:border-tertiary-container focus:ring-1 focus:ring-tertiary-container/30 transition-all";
const labelClass =
  "font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant";

export default function AdminAddProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProductFormState>(initialState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // ── Field change handler ─────────────────────────────────────────────────
  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const target = event.target;
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setForm((prev) => ({ ...prev, [target.name]: target.checked }));
      return;
    }
    setForm((prev) => ({ ...prev, [target.name]: target.value }));
  };

  // ── File picker handler ──────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0] ?? null;

    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    // Client-side validation (server also validates as defence-in-depth)
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError("Only JPG, PNG, or WebP images are allowed.");
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setFileError(`Image must be smaller than ${MAX_SIZE_LABEL}.`);
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setImageFile(file);
    // Generate a local object URL for the instant preview
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setFileError(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    // Basic client-side validation
    if (!form.name.trim()) {
      setFormError("Product name is required.");
      return;
    }
    const parsedPrice = Number(form.price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setFormError("Enter a valid product price.");
      return;
    }
    const parsedStock = Number(form.stock);
    if (!Number.isFinite(parsedStock) || parsedStock < 0) {
      setFormError("Enter a valid stock quantity.");
      return;
    }
    if (!imageFile) {
      setFormError("Please select a product image to upload.");
      return;
    }

    try {
      setIsSaving(true);

      // Build multipart/form-data — the API route handles upload + DB insert
      const fd = new FormData();
      fd.append("file", imageFile);
      fd.append("name", form.name.trim());
      fd.append("category", form.category);
      fd.append("variant_name", form.variant_name.trim());
      fd.append("price", String(parsedPrice));
      fd.append("compare_price", form.compare_price || "");
      fd.append("description", form.description.trim());
      fd.append("ingredients", form.ingredients.trim());
      fd.append("how_to_use", form.how_to_use.trim());
      fd.append("stock", String(parsedStock));
      fd.append("is_active", String(form.is_active));

      const response = await fetch("/api/products/upload", {
        method: "POST",
        body: fd,
        // Do NOT set Content-Type — browser sets it automatically with the correct boundary
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error ?? "Upload failed. Please try again.");
      }

      toast.success("Product created successfully!");
      router.push("/admin/products");
    } catch (saveError) {
      const msg =
        saveError instanceof Error
          ? saveError.message
          : "Failed to create product.";
      setFormError(msg);
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ── Sticky header ─────────────────────────────────────────────────── */}
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
            className="px-6 py-2 rounded bg-tertiary-container text-on-tertiary-container hover:bg-tertiary-fixed-dim transition-colors duration-200 font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">
                  progress_activity
                </span>
                Uploading...
              </>
            ) : (
              "Save Product"
            )}
          </button>
        </div>
      </header>

      <motion.div
        className="p-[var(--spacing-margin-mobile)] md:p-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-[var(--spacing-gutter)] pb-[var(--spacing-stack-lg)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* ── LEFT COLUMN — Basics & Image ──────────────────────────────── */}
        <div className="flex flex-col gap-[var(--spacing-gutter)]">
          <section className="bg-surface p-6 md:p-8 rounded-xl border border-outline-variant/50 custom-shadow space-y-5">
            <h2 className="font-display text-[24px] leading-[1.4] text-on-surface">
              Basics
            </h2>

            <div className="space-y-2">
              <label className={labelClass}>Product Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClass}>Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="face-cream">Face Cream</option>
                  <option value="face-wash">Face Wash</option>
                  <option value="soap">Soap</option>
                  <option value="nalangu-maavu">Nalangu Maavu</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Variant</label>
                <input
                  name="variant_name"
                  value={form.variant_name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. 50g, Rose"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClass}>Price (INR)</label>
                <input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  required
                  min={0}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Compare Price (Optional)</label>
                <input
                  name="compare_price"
                  type="number"
                  value={form.compare_price}
                  onChange={handleChange}
                  min={0}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Stock</label>
              <input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                min={0}
                className={inputClass}
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                name="is_active"
                type="checkbox"
                checked={form.is_active}
                onChange={handleChange}
                className="w-4 h-4 accent-primary"
              />
              <span className="font-body text-[14px] leading-[1.6] text-on-surface">
                Active product (visible in store)
              </span>
            </label>
          </section>

          {/* ── Product Image Upload ─────────────────────────────────────── */}
          <section className="bg-surface p-6 md:p-8 rounded-xl border border-outline-variant/50 custom-shadow space-y-4">
            <div>
              <h2 className="font-display text-[24px] leading-[1.4] text-on-surface">
                Product Image
              </h2>
              <p className="font-body text-[13px] text-on-surface-variant mt-1">
                JPG, PNG, or WebP · Max {MAX_SIZE_LABEL}
              </p>
            </div>

            {/* Preview area */}
            {imagePreview ? (
              <div className="relative">
                <div
                  className="relative w-full aspect-square rounded-xl overflow-hidden border border-outline-variant/40"
                  style={{
                    background:
                      "linear-gradient(145deg, #F4E4DA 0%, #EDD5C8 100%)",
                  }}
                >
                  <Image
                    src={imagePreview}
                    alt="Product preview"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized // local blob URL — Next.js optimiser can't process it
                  />
                </div>
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-surface/90 border border-outline-variant text-on-surface hover:bg-error-container hover:text-on-error-container transition-all shadow-sm"
                  aria-label="Remove image"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    close
                  </span>
                </button>
                <p className="mt-2 font-body text-[12px] text-on-surface-variant text-center">
                  {imageFile?.name} ({(imageFile!.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            ) : (
              /* Drop / click zone */
              <label
                className="flex flex-col items-center justify-center gap-3 w-full aspect-square rounded-xl border-2 border-dashed border-outline-variant/60 cursor-pointer hover:border-primary/40 hover:bg-primary-fixed/30 transition-all"
                htmlFor="product-image-input"
              >
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant/50">
                  add_photo_alternate
                </span>
                <span className="font-body text-[14px] text-on-surface-variant">
                  Click to choose or drag an image
                </span>
                <span className="font-body text-[12px] text-on-surface-variant/60">
                  JPG, PNG, WebP · Max {MAX_SIZE_LABEL}
                </span>
              </label>
            )}

            {/* Hidden file input */}
            <input
              id="product-image-input"
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="sr-only"
            />

            {/* Inline file validation error */}
            {fileError && (
              <p className="font-body text-[13px] text-error flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">
                  error
                </span>
                {fileError}
              </p>
            )}

            {imagePreview && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 rounded-xl border border-outline-variant text-on-surface-variant hover:border-primary/40 hover:text-primary transition-all font-body text-[13px] font-medium"
              >
                Choose a different image
              </button>
            )}
          </section>
        </div>

        {/* ── RIGHT COLUMN — Details ────────────────────────────────────── */}
        <section className="bg-surface p-6 md:p-8 rounded-xl border border-outline-variant/50 custom-shadow space-y-5 self-start">
          <h2 className="font-display text-[24px] leading-[1.4] text-on-surface">
            Details
          </h2>

          <div className="space-y-2">
            <label className={labelClass}>Description</label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className={labelClass}>Ingredients</label>
            <textarea
              name="ingredients"
              rows={3}
              value={form.ingredients}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className={labelClass}>How to Use</label>
            <textarea
              name="how_to_use"
              rows={3}
              value={form.how_to_use}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </section>

        {/* ── Global form error ─────────────────────────────────────────── */}
        {formError && (
          <div className="lg:col-span-2 flex items-center gap-2 p-4 rounded-xl bg-error-container border border-error/20">
            <span className="material-symbols-outlined text-error text-[20px]">
              error
            </span>
            <p className="font-body text-[14px] leading-[1.6] text-on-error-container">
              {formError}
            </p>
          </div>
        )}
      </motion.div>
    </form>
  );
}
