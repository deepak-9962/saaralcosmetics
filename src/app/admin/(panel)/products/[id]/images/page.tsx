"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getProductById } from "@/lib/supabase/data";
import type { Product, ProductImage } from "@/lib/types";

type ImageItem = ProductImage & { localKey: string };

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGES = 6;

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProductImagesPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upload state
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Reorder / delete state
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hasUnsavedOrder, setHasUnsavedOrder] = useState(false);

  // ── Load data ─────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [productData, imagesData] = await Promise.all([
        getProductById(productId),
        getSupabaseBrowserClient()
          .from("product_images")
          .select("*")
          .eq("product_id", productId)
          .order("display_order", { ascending: true }),
      ]);

      if (!productData) {
        setError("Product not found.");
        return;
      }
      setProduct(productData);
      setImages(
        (imagesData.data ?? []).map((img) => ({
          ...img,
          localKey: img.id,
        }))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load product.");
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // ── Reorder: move up ──────────────────────────────────────────────────────
  const moveUp = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
    setHasUnsavedOrder(true);
  };

  // ── Reorder: move down ────────────────────────────────────────────────────
  const moveDown = (index: number) => {
    setImages((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
    setHasUnsavedOrder(true);
  };

  // ── Save order ────────────────────────────────────────────────────────────
  const saveOrder = async () => {
    setIsSavingOrder(true);
    try {
      const res = await fetch(`/api/products/${productId}/images`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: images.map((img) => img.id) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to save order.");
      toast.success("Image order saved!");
      setHasUnsavedOrder(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save order.");
    } finally {
      setIsSavingOrder(false);
    }
  };

  // ── Delete individual image ───────────────────────────────────────────────
  const deleteImage = async (image: ImageItem) => {
    if (images.length === 1) {
      toast.error("Products must have at least one image. Delete the product instead.");
      return;
    }
    setDeletingId(image.id);
    try {
      const res = await fetch(`/api/products/${productId}/images`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId: image.id, imagePath: image.image_path }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to delete image.");
      setImages((prev) => prev.filter((img) => img.id !== image.id));
      toast.success("Image deleted.");
      setHasUnsavedOrder(false); // server re-sorted after delete
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete image.");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Upload new files handler ──────────────────────────────────────────────
  const handleNewFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const incoming = Array.from(e.target.files ?? []);
    if (!incoming.length) return;
    e.target.value = "";

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setUploadError(`Maximum ${MAX_IMAGES} images per product. Remove some first.`);
      return;
    }

    const validated: File[] = [];
    for (const file of incoming.slice(0, remaining)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setUploadError(`"${file.name}": only JPG, PNG, WebP allowed.`);
        continue;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setUploadError(`"${file.name}" exceeds 5 MB.`);
        continue;
      }
      validated.push(file);
    }

    setUploadFiles((prev) => [...prev, ...validated]);
    setUploadPreviews((prev) => [
      ...prev,
      ...validated.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const removeUploadFile = (i: number) => {
    URL.revokeObjectURL(uploadPreviews[i]);
    setUploadFiles((prev) => prev.filter((_, idx) => idx !== i));
    setUploadPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  // ── Upload to server ──────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("product_id", productId);
      uploadFiles.forEach((f, i) => fd.append(`file_${i}`, f));

      const res = await fetch("/api/products/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed.");

      toast.success(`${uploadFiles.length} image${uploadFiles.length > 1 ? "s" : ""} added!`);
      // Revoke previews
      uploadPreviews.forEach((url) => URL.revokeObjectURL(url));
      setUploadFiles([]);
      setUploadPreviews([]);
      // Reload the images list
      await loadData();
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 p-8">
        <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
        <p className="font-body text-[14px] text-on-surface-variant">Loading images…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="font-body text-[14px] text-error">{error}</p>
        <Link href="/admin/products" className="mt-4 inline-flex items-center gap-1 text-on-surface-variant hover:text-primary font-body text-[14px]">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="p-[var(--spacing-margin-mobile)] md:p-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto w-full flex flex-col gap-6">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2 text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h1 className="font-display text-[28px] leading-[1.3] text-on-surface tracking-tight">
              Edit Images
            </h1>
            <p className="font-body text-[15px] text-on-surface-variant">
              {product?.name}
              {product?.variant_name ? ` · ${product.variant_name}` : ""}
            </p>
          </div>
        </div>

        {hasUnsavedOrder && (
          <button
            onClick={saveOrder}
            disabled={isSavingOrder}
            className="px-5 py-2.5 rounded-xl bg-tertiary-container text-on-tertiary-container hover:bg-tertiary-fixed-dim font-body text-[13px] font-medium shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {isSavingOrder ? (
              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">save</span>
            )}
            Save Order
          </button>
        )}
      </div>

      {/* ── Unsaved order banner ──────────────────────────────────────────── */}
      <AnimatePresence>
        {hasUnsavedOrder && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200"
          >
            <span className="material-symbols-outlined text-amber-600 text-[18px]">warning</span>
            <p className="font-body text-[13px] text-amber-800">
              You have unsaved order changes. Click <strong>Save Order</strong> to apply.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Current images grid ────────────────────────────────────────────── */}
      <section className="bg-surface rounded-xl border border-outline-variant/50 custom-shadow p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-[20px] text-on-surface">
            Gallery ({images.length}/{MAX_IMAGES})
          </h2>
          <p className="font-body text-[12px] text-on-surface-variant">
            First image = Main Thumbnail
          </p>
        </div>

        {images.length === 0 ? (
          <p className="font-body text-[14px] text-on-surface-variant text-center py-8">
            No images yet. Add images below.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <motion.div
                key={img.localKey}
                layout
                className="flex flex-col gap-2"
              >
                {/* Thumbnail */}
                <div
                  className="relative aspect-square rounded-xl overflow-hidden border border-outline-variant/40 group"
                  style={{ background: "linear-gradient(145deg, #F4E4DA 0%, #EDD5C8 100%)" }}
                >
                  <Image
                    src={img.image_url}
                    alt={img.alt_text ?? `Image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />

                  {/* Main badge */}
                  {index === 0 && (
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container font-body text-[10px] font-semibold shadow-sm">
                      Main
                    </div>
                  )}

                  {/* Delete overlay */}
                  <button
                    onClick={() => void deleteImage(img)}
                    disabled={deletingId === img.id}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-surface/90 border border-outline-variant text-on-surface hover:bg-error-container hover:text-on-error-container transition-all shadow-sm opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    title="Delete image"
                  >
                    {deletingId === img.id ? (
                      <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                    )}
                  </button>
                </div>

                {/* Reorder controls */}
                <div className="flex gap-1">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="flex-1 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    title="Move left"
                  >
                    <span className="material-symbols-outlined text-[14px]">chevron_left</span>
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === images.length - 1}
                    className="flex-1 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    title="Move right"
                  >
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ── Add new images ──────────────────────────────────────────────────── */}
      {images.length < MAX_IMAGES && (
        <section className="bg-surface rounded-xl border border-outline-variant/50 custom-shadow p-6 space-y-4">
          <h2 className="font-display text-[20px] text-on-surface">
            Add Images ({MAX_IMAGES - images.length} slot{MAX_IMAGES - images.length !== 1 ? "s" : ""} remaining)
          </h2>

          {/* Preview of files to upload */}
          {uploadPreviews.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {uploadPreviews.map((preview, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-outline-variant/40 group"
                  style={{ background: "linear-gradient(145deg, #F4E4DA 0%, #EDD5C8 100%)" }}>
                  <Image src={preview} alt={`Upload ${i + 1}`} fill className="object-cover" sizes="25vw" unoptimized />
                  <button
                    onClick={() => removeUploadFile(i)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-surface/90 border border-outline-variant text-on-surface hover:bg-error-container hover:text-on-error-container transition-all shadow-sm opacity-0 group-hover:opacity-100"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Drop zone */}
          <label
            htmlFor="add-images-input"
            className="flex flex-col items-center justify-center gap-3 w-full py-8 rounded-xl border-2 border-dashed border-outline-variant/60 cursor-pointer hover:border-primary/40 hover:bg-primary-fixed/30 transition-all"
          >
            <span className="material-symbols-outlined text-[36px] text-on-surface-variant/50">add_photo_alternate</span>
            <span className="font-body text-[14px] text-on-surface-variant">
              {uploadFiles.length > 0 ? `${uploadFiles.length} file${uploadFiles.length > 1 ? "s" : ""} selected — click to add more` : "Click to choose images"}
            </span>
            <span className="font-body text-[12px] text-on-surface-variant/60">JPG, PNG, WebP · Max 5 MB each</span>
          </label>
          <input
            id="add-images-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleNewFilesChange}
            className="sr-only"
          />

          {uploadError && (
            <p className="font-body text-[13px] text-error flex items-start gap-1.5">
              <span className="material-symbols-outlined text-[16px] mt-0.5 flex-shrink-0">error</span>
              {uploadError}
            </p>
          )}

          {uploadFiles.length > 0 && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full py-3 rounded-xl bg-tertiary-container text-on-tertiary-container hover:bg-tertiary-fixed-dim font-body text-[14px] font-medium shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  Uploading {uploadFiles.length} image{uploadFiles.length > 1 ? "s" : ""}…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                  Upload {uploadFiles.length} Image{uploadFiles.length > 1 ? "s" : ""}
                </>
              )}
            </button>
          )}
        </section>
      )}

      {/* ── Footer nav ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 font-body text-[14px] text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Products
        </Link>
        <Link
          href={`/products/${product?.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 font-body text-[14px] text-on-surface-variant hover:text-primary transition-colors"
        >
          View on store
          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
        </Link>
      </div>
    </div>
  );
}
