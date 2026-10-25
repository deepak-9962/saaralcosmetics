"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  listHomepageTestimonials,
  createHomepageTestimonial,
  updateHomepageTestimonial,
  deleteHomepageTestimonial,
  reorderHomepageTestimonials,
  listAllProductsForAdmin,
  subscribeToProducts,
} from "@/lib/supabase/data";
import type { HomepageTestimonial, HomepageTestimonialInput, Product } from "@/lib/types";

export default function TestimonialsManager() {
  const [items, setItems] = useState<HomepageTestimonial[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HomepageTestimonial | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const avatarFileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<HomepageTestimonialInput>({
    name: "",
    location: "",
    rating: 5,
    avatar: "",
    quote: "",
    products: [],
    display_order: 0,
    is_active: true,
  });

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [customProductInput, setCustomProductInput] = useState("");

  const loadProducts = async () => {
    try {
      const prods = await listAllProductsForAdmin();
      setAllProducts(prods);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [testmData, prodsData] = await Promise.all([
        listHomepageTestimonials(false),
        listAllProductsForAdmin(),
      ]);
      setItems(testmData);
      setAllProducts(prodsData);
    } catch (err: any) {
      toast.error(err.message || "Failed to load testimonials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Subscribe to product changes so any newly added product appears in the dropdown immediately
    const unsub = subscribeToProducts(() => {
      loadProducts();
    });
    return () => {
      unsub();
    };
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({
      name: "",
      location: "",
      rating: 5,
      avatar: "",
      quote: "",
      products: [],
      display_order: items.length,
      is_active: true,
    });
    setSelectedProducts([]);
    setCustomProductInput("");
    loadProducts();
    setIsModalOpen(true);
  };

  const openEditModal = (item: HomepageTestimonial) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      location: item.location || "",
      rating: item.rating,
      avatar: item.avatar || "",
      quote: item.quote,
      products: item.products,
      display_order: item.display_order,
      is_active: item.is_active,
    });
    setSelectedProducts(item.products || []);
    setCustomProductInput("");
    loadProducts();
    setIsModalOpen(true);
  };

  const handleAddProduct = (productName: string) => {
    const trimmed = productName.trim();
    if (!trimmed) return;
    if (selectedProducts.includes(trimmed)) {
      toast.error(`"${trimmed}" is already added.`);
      return;
    }
    setSelectedProducts([...selectedProducts, trimmed]);
  };

  const handleRemoveProduct = (productName: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p !== productName));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "testimonials");

    try {
      setUploadingAvatar(true);
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setForm((prev) => ({ ...prev, avatar: data.url }));
      toast.success("Avatar image uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload avatar.");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Customer name is required.");
      return;
    }
    if (!form.quote.trim()) {
      toast.error("Testimonial review quote is required.");
      return;
    }

    // Fallback avatar if none provided
    const avatarUrl =
      form.avatar?.trim() ||
      `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(
        form.name.toLowerCase().replace(/\s+/g, "")
      )}&backgroundColor=ffd9b8`;

    const payload: HomepageTestimonialInput = {
      ...form,
      avatar: avatarUrl,
      products: selectedProducts,
      location: form.location?.trim() || null,
    };

    try {
      setIsSubmitting(true);
      if (editingItem) {
        await updateHomepageTestimonial(editingItem.id, payload);
        toast.success("Testimonial updated successfully!");
      } else {
        await createHomepageTestimonial(payload);
        toast.success("Testimonial created successfully!");
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save testimonial.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (item: HomepageTestimonial) => {
    try {
      const updated = !item.is_active;
      setItems((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, is_active: updated } : t))
      );
      await updateHomepageTestimonial(item.id, { is_active: updated });
      toast.success(updated ? `"${item.name}" enabled` : `"${item.name}" disabled`);
    } catch (err: any) {
      toast.error("Failed to update status.");
      loadData();
    }
  };

  const handleDelete = async (item: HomepageTestimonial) => {
    if (!window.confirm(`Are you sure you want to delete testimonial by "${item.name}"?`)) {
      return;
    }
    try {
      await deleteHomepageTestimonial(item.id);
      toast.success("Testimonial deleted.");
      setItems((prev) => prev.filter((t) => t.id !== item.id));
    } catch (err: any) {
      toast.error(err.message || "Failed to delete testimonial.");
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, moved);

    setItems(newItems);

    try {
      await reorderHomepageTestimonials(newItems.map((t) => t.id));
    } catch (err: any) {
      toast.error("Failed to reorder testimonials.");
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Bar ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface rounded-2xl p-6 border border-outline-variant/40 shadow-xs">
        <div>
          <h2 className="font-display text-[20px] font-bold text-on-surface">
            Homepage Customer Testimonials ({items.length})
          </h2>
          <p className="font-body text-[13px] text-on-surface-variant mt-0.5">
            Manage customer quotes and reviews rotating in the interactive pastel showcase carousel.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-body text-[13px] font-semibold hover:opacity-90 transition-opacity shadow-sm shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Testimonial
        </button>
      </div>

      {/* ── Loading state ────────────────────────────────────────── */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
          <p className="font-body text-sm text-on-surface-variant">Loading customer testimonials...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-outline-variant/40 p-8">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40 mb-2">
            format_quote
          </span>
          <p className="font-body text-on-surface-variant">No testimonials found.</p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 rounded-xl bg-primary text-on-primary font-body text-xs font-semibold"
          >
            Add Your First Testimonial
          </button>
        </div>
      ) : (
        /* ── Grid of Testimonials ────────────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`bg-surface rounded-2xl border transition-all duration-200 p-5 flex flex-col ${
                item.is_active
                  ? "border-outline-variant/50 shadow-xs hover:shadow-md"
                  : "border-outline-variant/30 opacity-60 bg-surface-container-low"
              }`}
            >
              {/* Header: Order & Reorder */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                  #{index + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMove(index, "up")}
                    className="p-1 rounded text-on-surface-variant hover:bg-surface-container-high disabled:opacity-20"
                    title="Move earlier"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                  </button>
                  <button
                    type="button"
                    disabled={index === items.length - 1}
                    onClick={() => handleMove(index, "down")}
                    className="p-1 rounded text-on-surface-variant hover:bg-surface-container-high disabled:opacity-20"
                    title="Move later"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                  </button>
                </div>
              </div>

              {/* Customer Avatar & Name */}
              <div className="flex items-center gap-3 mb-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-outline-variant shrink-0 bg-surface-container-high">
                  {item.avatar ? (
                    <Image
                      src={item.avatar}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-primary">
                      {item.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-display font-bold text-[15px] text-on-surface leading-tight">
                    {item.name}
                  </h3>
                  {item.location && (
                    <p className="font-body text-[11px] text-on-surface-variant mt-0.5">
                      {item.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Rating Stars */}
              <div className="flex items-center gap-1 text-[#D48B28] mb-2.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined text-[16px]"
                    style={{ fontVariationSettings: `'FILL' ${i < item.rating ? 1 : 0}` }}
                  >
                    star
                  </span>
                ))}
              </div>

              {/* Quote */}
              <p className="font-body text-[12px] text-on-surface-variant leading-relaxed line-clamp-3 mb-3 flex-grow italic">
                &ldquo;{item.quote}&rdquo;
              </p>

              {/* Tagged Products */}
              {item.products && item.products.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {item.products.map((p) => (
                    <span
                      key={p}
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-container-high text-on-surface-variant border border-outline-variant/30"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between mt-auto">
                <button
                  type="button"
                  onClick={() => handleToggleActive(item)}
                  className={`text-[11px] font-semibold px-2 py-1 rounded-lg ${
                    item.is_active
                      ? "text-emerald-700 hover:bg-emerald-50"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {item.is_active ? "Active" : "Disabled"}
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg border border-outline-variant/50 hover:bg-surface-container-high text-on-surface"
                    title="Edit testimonial"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="p-1.5 rounded-lg border border-outline-variant/50 hover:bg-error-container hover:text-on-error-container text-error"
                    title="Delete testimonial"
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
                {editingItem ? "Edit Testimonial" : "Add Testimonial"}
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
              {/* Customer Name & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Agalya Saravanan"
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary font-body text-[13px]"
                  />
                </div>
                <div>
                  <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={form.location || ""}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Kerala, Chennai, Mumbai"
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary font-body text-[13px]"
                  />
                </div>
              </div>

              {/* Star Rating Picker */}
              <div>
                <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5">
                  Star Rating (1 to 5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      className="p-1 text-[#D48B28] hover:scale-110 transition-transform"
                    >
                      <span
                        className="material-symbols-outlined text-[28px]"
                        style={{ fontVariationSettings: `'FILL' ${star <= (form.rating || 5) ? 1 : 0}` }}
                      >
                        star
                      </span>
                    </button>
                  ))}
                  <span className="font-body text-[13px] font-bold text-on-surface ml-2">
                    {form.rating || 5} Stars
                  </span>
                </div>
              </div>

              {/* Avatar Upload / URL */}
              <div>
                <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5">
                  Customer Avatar Photo
                </label>
                <div className="flex items-center gap-4 mb-2">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border border-outline-variant shrink-0 bg-surface-container-high">
                    {form.avatar ? (
                      <Image src={form.avatar} alt="Avatar" fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-on-surface-variant/60 font-body">
                        Auto
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={avatarFileRef}
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                    <button
                      type="button"
                      disabled={uploadingAvatar}
                      onClick={() => avatarFileRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-lg border border-outline-variant font-body text-[12px] font-semibold hover:bg-surface-container-high"
                    >
                      {uploadingAvatar ? "Uploading..." : "Upload Photo"}
                    </button>
                    <p className="font-body text-[11px] text-on-surface-variant/70 mt-1">
                      Leave empty to auto-generate an avatar icon.
                    </p>
                  </div>
                </div>
                <input
                  type="url"
                  value={form.avatar || ""}
                  onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                  placeholder="https://... (or leave empty for auto avatar)"
                  className="w-full px-4 py-2 rounded-xl border border-outline-variant font-mono text-[12px]"
                />
              </div>

              {/* Quote Text */}
              <div>
                <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5">
                  Customer Review Quote *
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.quote}
                  onChange={(e) => setForm({ ...form, quote: e.target.value })}
                  placeholder="Paste or write the customer review quote..."
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary font-body text-[13px] leading-relaxed"
                />
              </div>

              {/* Tagged Products — Dynamic Dropdown & Chips */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant">
                    Mentioned Products ({selectedProducts.length})
                  </label>
                  <span className="text-[11px] font-body text-on-surface-variant/70">
                    {allProducts.length} catalogue products available
                  </span>
                </div>

                {/* Selected Products Chips */}
                {selectedProducts.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40">
                    {selectedProducts.map((prodName) => (
                      <span
                        key={prodName}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-primary/10 text-primary border border-primary/25 shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[14px]">spa</span>
                        {prodName}
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(prodName)}
                          className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-primary/20 text-primary transition-colors ml-0.5 cursor-pointer"
                          title={`Remove ${prodName}`}
                        >
                          <span className="material-symbols-outlined text-[13px]">close</span>
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Dropdown for selecting from all catalogue products */}
                <div className="relative">
                  <select
                    value=""
                    onChange={(e) => {
                      handleAddProduct(e.target.value);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary font-body text-[13px] bg-surface cursor-pointer appearance-none pr-10 text-on-surface"
                  >
                    <option value="" disabled>
                      {allProducts.length > 0
                        ? "+ Select a product from catalogue to add..."
                        : "Loading products from catalogue..."}
                    </option>
                    {allProducts.map((p) => {
                      const isSelected = selectedProducts.includes(p.name);
                      return (
                        <option
                          key={p.id}
                          value={p.name}
                          disabled={isSelected}
                          className={isSelected ? "text-on-surface-variant/40" : ""}
                        >
                          {isSelected ? "✓ (Added) " : ""}
                          {p.name} {p.category ? `— [${p.category}]` : ""}
                        </option>
                      );
                    })}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                    arrow_drop_down
                  </span>
                </div>

                {/* Quick Add Custom Product Name Input (Optional fallback) */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={customProductInput}
                    onChange={(e) => setCustomProductInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (customProductInput.trim()) {
                          handleAddProduct(customProductInput.trim());
                          setCustomProductInput("");
                        }
                      }
                    }}
                    placeholder="Or type custom product name..."
                    className="flex-grow px-3.5 py-1.5 rounded-lg border border-outline-variant/60 text-[12px] font-body bg-surface focus:border-primary"
                  />
                  <button
                    type="button"
                    disabled={!customProductInput.trim()}
                    onClick={() => {
                      if (customProductInput.trim()) {
                        handleAddProduct(customProductInput.trim());
                        setCustomProductInput("");
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg border border-outline-variant font-body text-[12px] font-semibold hover:bg-surface-container-high disabled:opacity-40 shrink-0 text-on-surface"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="testm_is_active"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant cursor-pointer"
                />
                <label htmlFor="testm_is_active" className="font-body text-[13px] font-semibold text-on-surface cursor-pointer">
                  Display this testimonial on the homepage
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-outline-variant font-body text-[13px] font-semibold text-on-surface-variant hover:bg-surface-container-high"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-body text-[13px] font-semibold hover:opacity-90 disabled:opacity-50 shadow-sm"
                >
                  {isSubmitting ? "Saving..." : editingItem ? "Update Testimonial" : "Create Testimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
