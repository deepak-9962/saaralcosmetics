"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import DestinationSelector from "./DestinationSelector";
import {
  listHomepageCategories,
  createHomepageCategory,
  updateHomepageCategory,
  deleteHomepageCategory,
  reorderHomepageCategories,
} from "@/lib/supabase/data";
import type { HomepageCategory, HomepageCategoryInput } from "@/lib/types";

const PRESET_BLOB_COLORS = [
  { label: "Sky Blue", c1: "#C8DFF0", c2: "#B0CEEA" },
  { label: "Warm Peach", c1: "#F2D5C0", c2: "#EEC4A8" },
  { label: "Golden Herbal", c1: "#F0E0A8", c2: "#E8D090" },
  { label: "Soft Sage", c1: "#D0E8C8", c2: "#BCDCB0" },
  { label: "Vetpalai Green", c1: "#D8EAD2", c2: "#BFDCB4" },
  { label: "Honey Yellow", c1: "#F4E3B2", c2: "#E8CD8A" },
  { label: "Earthy Rose", c1: "#E2ECD8", c2: "#C5DCB2" },
  { label: "Blush Champagne", c1: "#F5E0C0", c2: "#EDD0A8" },
];

export default function CategoryCardsManager() {
  const [categories, setCategories] = useState<HomepageCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<HomepageCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<HomepageCategoryInput>({
    title: "",
    subtitle: "",
    image_url: "",
    link_url: "/products?category=face-wash",
    category_slug: "face-wash",
    category_id: null,
    destination_type: "category",
    destination_id: "face-wash",
    product_id: null,
    blob_color: "#F2D5C0",
    blob_color2: "#EEC4A8",
    display_order: 0,
    is_active: true,
  });

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadCategories = async () => {
    try {
      if (isMountedRef.current) setLoading(true);
      const data = await listHomepageCategories(false);
      if (isMountedRef.current) setCategories(data);
    } catch (err: any) {
      if (isMountedRef.current) toast.error(err.message || "Failed to load category cards.");
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCard(null);
    setForm({
      title: "",
      subtitle: "",
      image_url: "",
      link_url: "/products?category=face-wash",
      category_slug: "face-wash",
      category_id: null,
      destination_type: "category",
      destination_id: "face-wash",
      product_id: null,
      blob_color: "#F2D5C0",
      blob_color2: "#EEC4A8",
      display_order: categories.length,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (card: HomepageCategory) => {
    setEditingCard(card);
    const resolvedCatId = card.category_id || (card.destination_type === "category" ? card.destination_id : null);
    setForm({
      title: card.title,
      subtitle: card.subtitle || "",
      image_url: card.image_url,
      link_url: card.link_url,
      category_slug: card.category_slug,
      category_id: resolvedCatId || null,
      destination_type: card.destination_type || "category",
      destination_id: card.destination_id || card.category_id || card.category_slug || null,
      product_id: card.product_id || null,
      blob_color: card.blob_color || "#F2D5C0",
      blob_color2: card.blob_color2 || "#EEC4A8",
      display_order: card.display_order,
      is_active: card.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDestinationChange = useCallback((val: any) => {
    setForm((prev) => {
      const catSlug = val.type === "category" ? val.categorySlug || val.id : null;
      const catId = val.type === "category" ? val.categoryId || (val.id?.length === 36 ? val.id : null) : null;
      if (
        prev.destination_type === val.type &&
        prev.destination_id === val.id &&
        prev.category_id === catId &&
        prev.product_id === (val.productId || null) &&
        prev.category_slug === catSlug &&
        prev.link_url === val.url
      ) {
        return prev;
      }
      return {
        ...prev,
        destination_type: val.type,
        destination_id: val.id,
        category_id: catId,
        product_id: val.productId || null,
        category_slug: catSlug,
        link_url: val.url,
      };
    });
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "categories");

    try {
      setUploadingImage(true);
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setForm((prev) => ({ ...prev, image_url: data.url }));
      toast.success("Category card image uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Please enter a category title.");
      return;
    }
    if (!form.image_url.trim()) {
      toast.error("Please provide or upload a category image.");
      return;
    }
    if (form.destination_type === "category" && !form.destination_id) {
      toast.error("Please select a valid destination category.");
      return;
    }
    if (form.destination_type === "product" && !form.destination_id && !form.product_id) {
      toast.error("Please search and select a destination product from the catalogue.");
      return;
    }
    if (form.destination_type === "custom" && !form.link_url?.trim()) {
      toast.error("Please enter a valid destination URL.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingCard) {
        await updateHomepageCategory(editingCard.id, form);
        toast.success("Category card updated successfully!");
      } else {
        await createHomepageCategory(form);
        toast.success("Category card created successfully!");
      }
      setIsModalOpen(false);
      await loadCategories();
    } catch (err: any) {
      toast.error(err.message || "Failed to save category card.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (card: HomepageCategory) => {
    try {
      const updated = !card.is_active;
      setCategories((prev) =>
        prev.map((c) => (c.id === card.id ? { ...c, is_active: updated } : c))
      );
      await updateHomepageCategory(card.id, { is_active: updated });
      toast.success(updated ? `"${card.title}" enabled` : `"${card.title}" disabled`);
    } catch (err: any) {
      toast.error("Failed to update status.");
      loadCategories();
    }
  };

  const handleDelete = async (card: HomepageCategory) => {
    if (!window.confirm(`Are you sure you want to delete category card "${card.title}"?`)) {
      return;
    }
    try {
      await deleteHomepageCategory(card.id);
      toast.success("Category card deleted.");
      setCategories((prev) => prev.filter((c) => c.id !== card.id));
    } catch (err: any) {
      toast.error(err.message || "Failed to delete card.");
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newCats = [...categories];
    const [moved] = newCats.splice(index, 1);
    newCats.splice(targetIndex, 0, moved);

    setCategories(newCats);

    try {
      await reorderHomepageCategories(newCats.map((c) => c.id));
      toast.success("Order updated!");
    } catch (err: any) {
      toast.error("Failed to save reorder.");
      loadCategories();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface p-5 rounded-2xl border border-outline-variant/40 shadow-sm">
        <div>
          <h2 className="font-display text-[22px] font-semibold text-on-surface">Shop By Category Cards</h2>
          <p className="font-body text-[13px] text-on-surface-variant">
            Manage the category pill & blob cards displayed in the “Shop By Category” discovery strip on desktop and mobile.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-body text-[13px] font-semibold hover:bg-primary/90 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Category Card
        </button>
      </div>

      {/* Categories grid */}
      {loading ? (
        <div className="p-12 text-center text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-[32px] text-primary mb-2">progress_activity</span>
          <p className="font-body text-[14px]">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-surface p-12 text-center rounded-2xl border border-dashed border-outline-variant/60">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40 mb-2">category</span>
          <p className="font-body text-[15px] font-medium text-on-surface">No category cards found</p>
          <p className="font-body text-[13px] text-on-surface-variant mt-1 mb-4">Click below to add your first category card.</p>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary font-body text-[12px] font-semibold"
          >
            Add Category Card
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((card, index) => (
            <div
              key={card.id}
              className={`flex flex-col p-4 rounded-2xl border transition-all ${
                card.is_active
                  ? "bg-surface border-outline-variant/50 shadow-sm"
                  : "bg-surface-container-low/50 border-outline-variant/30 opacity-70"
              }`}
            >
              {/* Top: Reorder & Status badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1">
                  <span className="font-body text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    #{index + 1}
                  </span>
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMove(index, "up")}
                    className="p-1 rounded-md border border-outline-variant/40 hover:bg-surface-container-high disabled:opacity-20 text-on-surface-variant"
                    title="Move left/up"
                  >
                    <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                  </button>
                  <button
                    type="button"
                    disabled={index === categories.length - 1}
                    onClick={() => handleMove(index, "down")}
                    className="p-1 rounded-md border border-outline-variant/40 hover:bg-surface-container-high disabled:opacity-20 text-on-surface-variant"
                    title="Move right/down"
                  >
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    card.is_active
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  {card.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Visual Card Preview matching public site */}
              <div className="flex flex-col items-center justify-center p-4 bg-surface-container-low rounded-xl mb-3">
                <div className="relative flex items-end justify-center w-24 h-28">
                  {/* Pastel Blob circle */}
                  <div
                    className="absolute bottom-0 w-20 h-20 rounded-full"
                    style={{
                      background: `radial-gradient(circle at 42% 52%, ${card.blob_color || "#F2D5C0"} 0%, ${card.blob_color2 || "#EEC4A8"} 60%, rgba(255,255,255,0.45) 100%)`,
                      boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                    }}
                  />
                  {/* Image */}
                  <div className="relative z-10 w-20 h-24">
                    <Image
                      src={card.image_url}
                      alt={card.title}
                      fill
                      className="object-contain object-bottom"
                      sizes="80px"
                      unoptimized
                    />
                  </div>
                </div>

                {/* Pill label */}
                <div className="mt-2 px-3 py-1 rounded-full bg-white border border-[#D4A0B0] shadow-xs flex items-center gap-1">
                  <span className="font-body text-[11px] font-semibold text-[#3A2418]">
                    {card.title}
                  </span>
                  <span className="material-symbols-outlined text-[10px] text-[#B06080]">arrow_forward</span>
                </div>
              </div>

              {/* Details & Link */}
              <div className="text-center px-1 mb-3">
                <div className="flex items-center justify-center gap-1.5 font-body text-[10.5px]">
                  <span className="px-1.5 py-0.5 rounded text-[9.5px] font-semibold bg-surface-container-high text-on-surface-variant capitalize border border-outline-variant/30">
                    {card.destination_type || "category"}
                  </span>
                  <span className="font-mono text-primary truncate max-w-[140px] text-[10px]">
                    {card.link_url}
                  </span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-auto pt-2 border-t border-outline-variant/30 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleActive(card)}
                  className={`text-[11px] font-semibold px-2 py-1 rounded-lg ${
                    card.is_active
                      ? "text-emerald-700 hover:bg-emerald-50"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {card.is_active ? "Disable" : "Enable"}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(card)}
                    className="p-1.5 rounded-lg border border-outline-variant/50 hover:bg-surface-container-high text-on-surface"
                    title="Edit card"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(card)}
                    className="p-1.5 rounded-lg border border-outline-variant/50 hover:bg-error-container hover:text-on-error-container text-error"
                    title="Delete card"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CREATE / EDIT MODAL ────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-surface rounded-3xl border border-outline-variant/50 shadow-2xl p-6 md:p-8 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-outline-variant/30 pb-4">
              <h3 className="font-display text-[22px] font-bold text-on-surface">
                {editingCard ? "Edit Category Card" : "Add Category Card"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Title */}
              <div>
                <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Face Wash"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface font-body text-[14px] focus:outline-none focus:border-primary"
                />
              </div>

              {/* Subtitle / Ritual Ceremony name */}
              <div>
                <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5">
                  Subtitle (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cleanse & Refresh"
                  value={form.subtitle || ""}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface font-body text-[14px] focus:outline-none focus:border-primary"
                />
              </div>

              {/* Image Upload & URL */}
              <div>
                <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5">
                  Card Product Image (Transparent background PNG/AVIF recommended) *
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <input
                    type="text"
                    required
                    placeholder="Enter image URL or upload below"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    className="flex-1 w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface font-body text-[14px] focus:outline-none focus:border-primary"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="px-4 py-2.5 rounded-xl border border-primary/40 text-primary font-body text-[13px] font-semibold hover:bg-primary/5 transition-colors shrink-0 disabled:opacity-50"
                  >
                    {uploadingImage ? "Uploading..." : "Upload Image"}
                  </button>
                </div>
                {form.image_url && (
                  <div className="mt-3 flex items-center justify-center p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <div className="relative w-20 h-24">
                      <Image
                        src={form.image_url}
                        alt="Preview"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Structured Destination Selector */}
              <DestinationSelector
                key={editingCard ? editingCard.id : "new-category-card"}
                initialType={form.destination_type}
                initialId={form.category_id || form.destination_id || form.category_slug}
                initialProductId={form.product_id}
                initialUrl={form.link_url}
                onChange={handleDestinationChange}
                label="Card Destination"
                required
              />

              {/* Pastel Blob Colors */}
              <div>
                <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5">
                  Backdrop Blob Color Preset
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-3">
                  {PRESET_BLOB_COLORS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setForm({ ...form, blob_color: preset.c1, blob_color2: preset.c2 })}
                      className="flex flex-col items-center gap-1 p-1 rounded-lg border hover:border-primary transition-all"
                      style={{
                        borderColor: form.blob_color === preset.c1 ? "#B06080" : "transparent",
                      }}
                      title={preset.label}
                    >
                      <div
                        className="w-7 h-7 rounded-full shadow-inner"
                        style={{
                          background: `radial-gradient(circle, ${preset.c1}, ${preset.c2})`,
                        }}
                      />
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-on-surface-variant block mb-1">Color 1 (Inner)</span>
                    <input
                      type="text"
                      value={form.blob_color || "#F2D5C0"}
                      onChange={(e) => setForm({ ...form, blob_color: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-outline-variant/60 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-on-surface-variant block mb-1">Color 2 (Outer)</span>
                    <input
                      type="text"
                      value={form.blob_color2 || "#EEC4A8"}
                      onChange={(e) => setForm({ ...form, blob_color2: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-outline-variant/60 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Display Order & Active */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.display_order ?? 0}
                    onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface font-body text-[14px] focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="cat-active"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                  />
                  <label htmlFor="cat-active" className="font-body text-[14px] text-on-surface font-medium cursor-pointer">
                    Active (visible on homepage)
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant font-body text-[13px] font-medium hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-body text-[13px] font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingCard ? "Update Card" : "Create Card"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
