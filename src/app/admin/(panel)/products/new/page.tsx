"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import type { Product } from "@/lib/types";

// ── Types ─────────────────────────────────────────────────────────────────────

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

type ImageItem = {
  /** Unique local key for React lists */
  localId: string;
  file: File;
  /** Object URL for preview — revoked on remove */
  preview: string;
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

/** Allowed MIME types — mirrors the bucket's allowed_mime_types */
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_SIZE_LABEL = "5 MB";
const MAX_IMAGES = 6;

// ── Shared class helpers ──────────────────────────────────────────────────────
const inputClass =
  "w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body text-[16px] leading-[1.6] text-on-surface focus:outline-none focus:border-tertiary-container focus:ring-1 focus:ring-tertiary-container/30 transition-all";
const labelClass =
  "font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant";

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminAddProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProductFormState>(initialState);
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // ── Field change handler ──────────────────────────────────────────────────
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

  // ── File picker handler ───────────────────────────────────────────────────
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const incoming = Array.from(e.target.files ?? []);
    if (incoming.length === 0) return;

    // Reset input so the same files can be picked again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";

    const validated: ImageItem[] = [];
    for (const file of incoming) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setFileError(`"${file.name}" is not allowed. Only JPG, PNG, or WebP images accepted.`);
        continue;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setFileError(`"${file.name}" exceeds the ${MAX_SIZE_LABEL} limit.`);
        continue;
      }
      validated.push({
        localId: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      });
    }

    setImageItems((prev) => {
      const combined = [...prev, ...validated];
      if (combined.length > MAX_IMAGES) {
        setFileError(`Maximum ${MAX_IMAGES} images allowed. Some files were not added.`);
        // Revoke object URLs for items that won't be used
        combined.slice(MAX_IMAGES).forEach((item) => URL.revokeObjectURL(item.preview));
        return combined.slice(0, MAX_IMAGES);
      }
      return combined;
    });
  };

  // ── Reorder: move up (swap with previous) ────────────────────────────────
  const moveUp = (index: number) => {
    if (index === 0) return;
    setImageItems((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  // ── Reorder: move down (swap with next) ──────────────────────────────────
  const moveDown = (index: number) => {
    setImageItems((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  // ── Remove individual image ───────────────────────────────────────────────
  const removeImage = (index: number) => {
    setImageItems((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
    setFileError(null);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    // Client-side validation
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
    if (imageItems.length === 0) {
      setFormError("Please select at least one product image.");
      return;
    }

    try {
      setIsSaving(true);

      // Build FormData — files sent as file_0, file_1, … file_N
      const fd = new FormData();
      imageItems.forEach((item, i) => fd.append(`file_${i}`, item.file));
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
        // Do NOT set Content-Type — browser auto-sets it with the boundary
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error ?? "Upload failed. Please try again.");
      }

      toast.success(`Product created with ${imageItems.length} image${imageItems.length > 1 ? "s" : ""}!`);
      router.push("/admin/products");
    } catch (saveError) {
      const msg =
        saveError instanceof Error ? saveError.message : "Failed to create product.";
      setFormError(msg);
      setIsSaving(false);
    }
  };

  const canAddMore = imageItems.length < MAX_IMAGES;

  return (
    <form onSubmit={handleSubmit}>
      {/* ── Sticky header ───────────────────────────────────────────────────── */}
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
                Uploading…
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
        {/* ── LEFT COLUMN — Basics & Images ──────────────────────────────── */}
        <div className="flex flex-col gap-[var(--spacing-gutter)]">

          {/* Basics */}
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

          {/* ── Product Images ───────────────────────────────────────────── */}
          <section className="bg-surface p-6 md:p-8 rounded-xl border border-outline-variant/50 custom-shadow space-y-5">
            <div>
              <h2 className="font-display text-[24px] leading-[1.4] text-on-surface">
                Product Images
              </h2>
              <p className="font-body text-[13px] text-on-surface-variant mt-1">
                Upload 1–{MAX_IMAGES} images · JPG, PNG, WebP · Max {MAX_SIZE_LABEL} each ·
                First image is the <strong>Main / Thumbnail</strong>
              </p>
            </div>

            {/* Image grid */}
            {imageItems.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {imageItems.map((item, index) => (
                  <div
                    key={item.localId}
                    className="relative group flex flex-col gap-1.5"
                  >
                    {/* Thumbnail */}
                    <div
                      className="relative aspect-square rounded-xl overflow-hidden border border-outline-variant/40"
                      style={{
                        background:
                          "linear-gradient(145deg, #F4E4DA 0%, #EDD5C8 100%)",
                      }}
                    >
                      <Image
                        src={item.preview}
                        alt={`Image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 33vw"
                        unoptimized // local blob URL
                      />

                      {/* Main badge */}
                      {index === 0 && (
                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container font-body text-[10px] font-semibold tracking-wide shadow-sm">
                          Main
                        </div>
                      )}

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-surface/90 border border-outline-variant text-on-surface hover:bg-error-container hover:text-on-error-container transition-all shadow-sm opacity-0 group-hover:opacity-100"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          close
                        </span>
                      </button>
                    </div>

                    {/* File name */}
                    <p className="font-body text-[11px] text-on-surface-variant truncate px-0.5">
                      {item.file.name}
                    </p>

                    {/* Up / Down reorder buttons */}
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="flex-1 py-1 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-body text-[11px] flex items-center justify-center gap-0.5"
                        title="Move left / promote"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          arrow_back
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveDown(index)}
                        disabled={index === imageItems.length - 1}
                        className="flex-1 py-1 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-body text-[11px] flex items-center justify-center gap-0.5"
                        title="Move right / demote"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          arrow_forward
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add more / Drop zone */}
            {canAddMore && (
              <label
                className="flex flex-col items-center justify-center gap-3 w-full py-8 rounded-xl border-2 border-dashed border-outline-variant/60 cursor-pointer hover:border-primary/40 hover:bg-primary-fixed/30 transition-all"
                htmlFor="product-images-input"
              >
                <span className="material-symbols-outlined text-[40px] text-on-surface-variant/50">
                  add_photo_alternate
                </span>
                <span className="font-body text-[14px] text-on-surface-variant text-center">
                  {imageItems.length === 0
                    ? "Click to choose images or drag & drop"
                    : `Add more images (${imageItems.length}/${MAX_IMAGES})`}
                </span>
                <span className="font-body text-[12px] text-on-surface-variant/60">
                  JPG, PNG, WebP · Max {MAX_SIZE_LABEL} each
                </span>
              </label>
            )}

            {/* Hidden file input — multiple selection allowed */}
            <input
              id="product-images-input"
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFilesChange}
              className="sr-only"
            />

            {/* Validation error */}
            {fileError && (
              <p className="font-body text-[13px] text-error flex items-start gap-1.5">
                <span className="material-symbols-outlined text-[16px] mt-0.5 flex-shrink-0">
                  error
                </span>
                {fileError}
              </p>
            )}

            {/* Image count summary */}
            {imageItems.length > 0 && (
              <p className="font-body text-[12px] text-on-surface-variant">
                {imageItems.length} of {MAX_IMAGES} images selected ·
                First image will be the main thumbnail shown in product listings.
              </p>
            )}
          </section>
        </div>

        {/* ── RIGHT COLUMN — Details ─────────────────────────────────────── */}
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

        {/* ── Global form error ──────────────────────────────────────────── */}
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
