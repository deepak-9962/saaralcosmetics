"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  listTransformations,
  createTransformation,
  updateTransformation,
  deleteTransformation,
  reorderTransformations,
  listAllProductsForAdmin,
  subscribeToProducts,
} from "@/lib/supabase/data";
import type { CustomerTransformation, CustomerTransformationInput, Product } from "@/lib/types";

const ACCENT_COLOR_PRESETS = [
  { label: "Deep Rose", color: "#7A2040" },
  { label: "Forest Green", color: "#4A7C59" },
  { label: "Ayurvedic Gold", color: "#C9A74D" },
  { label: "Plum Berry", color: "#B06080" },
  { label: "Royal Indigo", color: "#7E6B9A" },
  { label: "Earthy Amber", color: "#A87A40" },
];

export default function TransformationsManager() {
  const [items, setItems] = useState<CustomerTransformation[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CustomerTransformation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);

  const beforeFileRef = useRef<HTMLInputElement>(null);
  const afterFileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<CustomerTransformationInput>({
    customer: "",
    location: "",
    duration: "6 weeks",
    product: "",
    product_href: "/products",
    product1_label: "View Product",
    product_href2: "",
    product2_label: "",
    concerns: [],
    result: "",
    before_src: "",
    after_src: "",
    accent_color: "#7A2040",
    tag_label: "Glow & Radiance",
    display_order: 0,
    is_active: true,
  });

  const [concernsText, setConcernsText] = useState("");

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
      const [transData, prodsData] = await Promise.all([
        listTransformations(false),
        listAllProductsForAdmin(),
      ]);
      setItems(transData);
      setAllProducts(prodsData);
    } catch (err: any) {
      toast.error(err.message || "Failed to load transformations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToProducts(() => {
      loadProducts();
    });
    return () => {
      unsub();
    };
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    loadProducts();
    setForm({
      customer: "",
      location: "",
      duration: "6 weeks",
      product: "",
      product_href: "/products",
      product1_label: "View Product",
      product_href2: "",
      product2_label: "",
      concerns: [],
      result: "",
      before_src: "",
      after_src: "",
      accent_color: "#7A2040",
      tag_label: "Transformation",
      display_order: items.length,
      is_active: true,
    });
    setConcernsText("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: CustomerTransformation) => {
    setEditingItem(item);
    loadProducts();
    setForm({
      customer: item.customer,
      location: item.location || "",
      duration: item.duration,
      product: item.product,
      product_href: item.product_href,
      product1_label: item.product1_label,
      product_href2: item.product_href2 || "",
      product2_label: item.product2_label || "",
      concerns: item.concerns,
      result: item.result,
      before_src: item.before_src || "",
      after_src: item.after_src || "",
      accent_color: item.accent_color || "#7A2040",
      tag_label: item.tag_label || "Transformation",
      display_order: item.display_order,
      is_active: item.is_active,
    });
    setConcernsText(item.concerns.join(", "));
    setIsModalOpen(true);
  };

  const handleImageUpload = async (file: File, type: "before" | "after") => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "customer-transformations");

    try {
      if (type === "before") setUploadingBefore(true);
      else setUploadingAfter(true);

      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      if (type === "before") {
        setForm((prev) => ({ ...prev, before_src: data.url }));
        toast.success("Before photo uploaded!");
      } else {
        setForm((prev) => ({ ...prev, after_src: data.url }));
        toast.success("After photo uploaded!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photo.");
    } finally {
      if (type === "before") setUploadingBefore(false);
      else setUploadingAfter(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer.trim()) {
      toast.error("Customer name is required.");
      return;
    }
    if (!form.result.trim()) {
      toast.error("Transformation result story is required.");
      return;
    }

    const parsedConcerns = concernsText
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const payload: CustomerTransformationInput = {
      ...form,
      concerns: parsedConcerns,
      product_href2: form.product_href2?.trim() || null,
      product2_label: form.product2_label?.trim() || null,
      location: form.location?.trim() || null,
    };

    try {
      setIsSubmitting(true);
      if (editingItem) {
        await updateTransformation(editingItem.id, payload);
        toast.success("Transformation story updated successfully!");
      } else {
        await createTransformation(payload);
        toast.success("Transformation story created successfully!");
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save transformation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (item: CustomerTransformation) => {
    try {
      const updated = !item.is_active;
      setItems((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, is_active: updated } : t))
      );
      await updateTransformation(item.id, { is_active: updated });
      toast.success(updated ? `"${item.customer}" enabled` : `"${item.customer}" disabled`);
    } catch (err: any) {
      toast.error("Failed to update status.");
      loadData();
    }
  };

  const handleDelete = async (item: CustomerTransformation) => {
    if (!window.confirm(`Are you sure you want to delete transformation story for "${item.customer}"?`)) {
      return;
    }
    try {
      await deleteTransformation(item.id);
      toast.success("Transformation story deleted.");
      setItems((prev) => prev.filter((t) => t.id !== item.id));
    } catch (err: any) {
      toast.error(err.message || "Failed to delete.");
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
      await reorderTransformations(newItems.map((t) => t.id));
    } catch (err: any) {
      toast.error("Failed to reorder items.");
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Bar ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface rounded-2xl p-6 border border-outline-variant/40 shadow-xs">
        <div>
          <h2 className="font-display text-[20px] font-bold text-on-surface">
            Customer Transformations ({items.length})
          </h2>
          <p className="font-body text-[13px] text-on-surface-variant mt-0.5">
            Manage the interactive Before/After comparison stories shown in the homepage carousel.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-body text-[13px] font-semibold hover:opacity-90 transition-opacity shadow-sm shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Transformation
        </button>
      </div>

      {/* ── Loading state ────────────────────────────────────────── */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
          <p className="font-body text-sm text-on-surface-variant">Loading customer transformations...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-outline-variant/40 p-8">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40 mb-2">
            compare
          </span>
          <p className="font-body text-on-surface-variant">No transformation stories found.</p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 rounded-xl bg-primary text-on-primary font-body text-xs font-semibold"
          >
            Create Your First Story
          </button>
        </div>
      ) : (
        /* ── Grid of Transformations ────────────────────────────────────────── */
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
              {/* Top Meta & Order */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                    #{index + 1}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                    style={{ background: item.accent_color || "#7A2040" }}
                  >
                    {item.tag_label || "Transformation"}
                  </span>
                </div>
                {/* Reorder Buttons */}
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

              {/* Before / After Photos Preview */}
              <div className="grid grid-cols-2 gap-2 mb-3 rounded-xl overflow-hidden bg-surface-container-high p-1">
                <div className="relative aspect-4/5 rounded-lg overflow-hidden bg-black/10">
                  {item.before_src ? (
                    <Image
                      src={item.before_src}
                      alt={`${item.customer} before`}
                      fill
                      className="object-cover"
                      sizes="150px"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-on-surface-variant/60 font-body">
                      No Photo
                    </div>
                  )}
                  <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold uppercase tracking-wider bg-black/60 text-white px-1.5 py-0.5 rounded">
                    Before
                  </span>
                </div>
                <div className="relative aspect-4/5 rounded-lg overflow-hidden bg-black/10">
                  {item.after_src ? (
                    <Image
                      src={item.after_src}
                      alt={`${item.customer} after`}
                      fill
                      className="object-cover"
                      sizes="150px"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-on-surface-variant/60 font-body">
                      No Photo
                    </div>
                  )}
                  <span className="absolute bottom-1.5 right-1.5 text-[9px] font-bold uppercase tracking-wider bg-black/60 text-white px-1.5 py-0.5 rounded">
                    After
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-1.5 mb-4 flex-grow">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display font-bold text-[16px] text-on-surface">
                    {item.customer}
                  </h3>
                  <span className="font-body text-[11px] text-on-surface-variant font-medium">
                    {item.duration}
                  </span>
                </div>
                {item.location && (
                  <p className="font-body text-[11px] text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">location_on</span>
                    {item.location}
                  </p>
                )}

                {/* Products */}
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-primary/10 text-primary">
                    {item.product1_label}
                  </span>
                  {item.product2_label && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-primary/10 text-primary">
                      {item.product2_label}
                    </span>
                  )}
                </div>

                {/* Result snippet */}
                <p className="font-body text-[12px] text-on-surface-variant line-clamp-2 pt-1 leading-relaxed">
                  &ldquo;{item.result}&rdquo;
                </p>
              </div>

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
                    title="Edit story"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="p-1.5 rounded-lg border border-outline-variant/50 hover:bg-error-container hover:text-on-error-container text-error"
                    title="Delete story"
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
          <div className="relative w-full max-w-2xl bg-surface rounded-3xl border border-outline-variant/50 shadow-2xl p-6 md:p-8 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-outline-variant/30 pb-4">
              <h3 className="font-display text-[22px] font-bold text-on-surface">
                {editingItem ? "Edit Transformation Story" : "Add Transformation Story"}
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
                    value={form.customer}
                    onChange={(e) => setForm({ ...form, customer: e.target.value })}
                    placeholder="e.g. Chitra"
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary bg-surface font-body text-[13px]"
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
                    placeholder="e.g. Chennai, Tamil Nadu"
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary bg-surface font-body text-[13px]"
                  />
                </div>
              </div>

              {/* Duration & Tag Label */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5">
                    Duration *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="e.g. 6 weeks, 10 weeks"
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary bg-surface font-body text-[13px]"
                  />
                </div>
                <div>
                  <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5">
                    Badge / Tag Label
                  </label>
                  <input
                    type="text"
                    value={form.tag_label || ""}
                    onChange={(e) => setForm({ ...form, tag_label: e.target.value })}
                    placeholder="e.g. Glow & Radiance, Anti-Aging"
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary bg-surface font-body text-[13px]"
                  />
                </div>
              </div>

              {/* Accent Color Preset Selector */}
              <div>
                <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5">
                  Badge Accent Color
                </label>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {ACCENT_COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.color}
                      type="button"
                      onClick={() => setForm({ ...form, accent_color: preset.color })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-body text-[12px] transition-all ${
                        form.accent_color === preset.color
                          ? "border-primary ring-1 ring-primary font-bold shadow-xs"
                          : "border-outline-variant/60 hover:bg-surface-container-high"
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full" style={{ background: preset.color }} />
                      {preset.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={form.accent_color || ""}
                  onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                  placeholder="#7A2040"
                  className="w-full px-4 py-2 rounded-xl border border-outline-variant focus:border-primary font-mono text-[12px]"
                />
              </div>

              {/* Before & After Photo Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-outline-variant/30 pt-4">
                {/* Before Photo */}
                <div>
                  <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5">
                    Before Photo
                  </label>
                  <div className="flex items-center gap-3 mb-2">
                    {form.before_src ? (
                      <div className="relative w-16 h-20 rounded-lg overflow-hidden border border-outline-variant shrink-0">
                        <Image src={form.before_src} alt="Before" fill className="object-cover" unoptimized />
                      </div>
                    ) : (
                      <div className="w-16 h-20 rounded-lg bg-surface-container-high flex items-center justify-center text-[11px] text-on-surface-variant/60 shrink-0">
                        None
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <input
                        type="file"
                        ref={beforeFileRef}
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, "before");
                        }}
                      />
                      <button
                        type="button"
                        disabled={uploadingBefore}
                        onClick={() => beforeFileRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg border border-outline-variant font-body text-[12px] font-semibold hover:bg-surface-container-high"
                      >
                        {uploadingBefore ? "Uploading..." : "Upload Before"}
                      </button>
                    </div>
                  </div>
                  <input
                    type="url"
                    value={form.before_src || ""}
                    onChange={(e) => setForm({ ...form, before_src: e.target.value })}
                    placeholder="https://... (or upload)"
                    className="w-full px-3 py-1.5 rounded-lg border border-outline-variant text-[12px] font-mono"
                  />
                </div>

                {/* After Photo */}
                <div>
                  <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5">
                    After Photo
                  </label>
                  <div className="flex items-center gap-3 mb-2">
                    {form.after_src ? (
                      <div className="relative w-16 h-20 rounded-lg overflow-hidden border border-outline-variant shrink-0">
                        <Image src={form.after_src} alt="After" fill className="object-cover" unoptimized />
                      </div>
                    ) : (
                      <div className="w-16 h-20 rounded-lg bg-surface-container-high flex items-center justify-center text-[11px] text-on-surface-variant/60 shrink-0">
                        None
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <input
                        type="file"
                        ref={afterFileRef}
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, "after");
                        }}
                      />
                      <button
                        type="button"
                        disabled={uploadingAfter}
                        onClick={() => afterFileRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg border border-outline-variant font-body text-[12px] font-semibold hover:bg-surface-container-high"
                      >
                        {uploadingAfter ? "Uploading..." : "Upload After"}
                      </button>
                    </div>
                  </div>
                  <input
                    type="url"
                    value={form.after_src || ""}
                    onChange={(e) => setForm({ ...form, after_src: e.target.value })}
                    placeholder="https://... (or upload)"
                    className="w-full px-3 py-1.5 rounded-lg border border-outline-variant text-[12px] font-mono"
                  />
                </div>
              </div>

              {/* Primary Product */}
              <div className="border-t border-outline-variant/30 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-body text-[12px] font-bold text-on-surface uppercase tracking-wider">
                    Primary Product Details *
                  </h4>
                  <span className="text-[11px] font-body text-on-surface-variant/70">
                    {allProducts.length} catalogue products available
                  </span>
                </div>

                {/* Dropdown to select primary product from catalogue */}
                <div className="relative">
                  <select
                    value=""
                    onChange={(e) => {
                      const found = allProducts.find((p) => p.id === e.target.value);
                      if (found) {
                        setForm((prev) => ({
                          ...prev,
                          product: found.name,
                          product_href: `/products/${found.slug}`,
                          product1_label:
                            prev.product1_label && prev.product1_label !== "View Product"
                              ? prev.product1_label
                              : found.name,
                        }));
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface text-[12.5px] font-body appearance-none cursor-pointer pr-10 focus:border-primary text-on-surface"
                  >
                    <option value="" disabled>
                      {allProducts.length > 0
                        ? "⚡ Select primary product from catalogue to auto-fill..."
                        : "Loading products from catalogue..."}
                    </option>
                    {allProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.category ? `— [${p.category}]` : ""}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                    arrow_drop_down
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block font-body text-[11px] text-on-surface-variant mb-1">
                      Full Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.product}
                      onChange={(e) => setForm({ ...form, product: e.target.value })}
                      placeholder="e.g. Skin Whitening Cream + Redwine Face Wash"
                      className="w-full px-3 py-2 rounded-lg border border-outline-variant text-[13px] font-body"
                    />
                  </div>
                  <div>
                    <label className="block font-body text-[11px] text-on-surface-variant mb-1">
                      Button Label *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.product1_label}
                      onChange={(e) => setForm({ ...form, product1_label: e.target.value })}
                      placeholder="e.g. Whitening Cream"
                      className="w-full px-3 py-2 rounded-lg border border-outline-variant text-[13px] font-body"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-body text-[11px] text-on-surface-variant mb-1">
                    Primary Product URL *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.product_href}
                    onChange={(e) => setForm({ ...form, product_href: e.target.value })}
                    placeholder="/products/saaral-skin-whitening-cream-15g"
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant text-[12px] font-mono"
                  />
                </div>
              </div>

              {/* Secondary Product (Optional) */}
              <div className="border-t border-outline-variant/30 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-body text-[12px] font-bold text-on-surface uppercase tracking-wider">
                    Secondary Product Details (Optional)
                  </h4>
                </div>

                {/* Dropdown to select second product from catalogue */}
                <div className="relative">
                  <select
                    value=""
                    onChange={(e) => {
                      const found = allProducts.find((p) => p.id === e.target.value);
                      if (found) {
                        setForm((prev) => ({
                          ...prev,
                          product_href2: `/products/${found.slug}`,
                          product2_label: prev.product2_label ? prev.product2_label : found.name,
                        }));
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface text-[12.5px] font-body appearance-none cursor-pointer pr-10 focus:border-primary text-on-surface"
                  >
                    <option value="" disabled>
                      {allProducts.length > 0
                        ? "⚡ Select secondary product from catalogue to auto-fill..."
                        : "Loading products from catalogue..."}
                    </option>
                    {allProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.category ? `— [${p.category}]` : ""}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                    arrow_drop_down
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-body text-[11px] text-on-surface-variant mb-1">
                      Second Button Label
                    </label>
                    <input
                      type="text"
                      value={form.product2_label || ""}
                      onChange={(e) => setForm({ ...form, product2_label: e.target.value })}
                      placeholder="e.g. Redwine Wash"
                      className="w-full px-3 py-2 rounded-lg border border-outline-variant text-[13px] font-body"
                    />
                  </div>
                  <div>
                    <label className="block font-body text-[11px] text-on-surface-variant mb-1">
                      Second Product URL
                    </label>
                    <input
                      type="text"
                      value={form.product_href2 || ""}
                      onChange={(e) => setForm({ ...form, product_href2: e.target.value })}
                      placeholder="/products/redwine-facewash"
                      className="w-full px-3 py-2 rounded-lg border border-outline-variant text-[12px] font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Concerns Tags */}
              <div className="border-t border-outline-variant/30 pt-4">
                <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5">
                  Skin Concerns (comma-separated)
                </label>
                <input
                  type="text"
                  value={concernsText}
                  onChange={(e) => setConcernsText(e.target.value)}
                  placeholder="e.g. Skin Whitening, Dullness, Uneven Skin Tone"
                  className="w-full px-4 py-2 rounded-xl border border-outline-variant font-body text-[13px]"
                />
              </div>

              {/* Transformation Result Story */}
              <div>
                <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5">
                  Result Story & Review *
                </label>
                <textarea
                  rows={3}
                  required
                  value={form.result}
                  onChange={(e) => setForm({ ...form, result: e.target.value })}
                  placeholder="Describe the visible changes and results observed..."
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary font-body text-[13px]"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="trans_is_active"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant cursor-pointer"
                />
                <label htmlFor="trans_is_active" className="font-body text-[13px] font-semibold text-on-surface cursor-pointer">
                  Display this transformation story on the homepage
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
                  {isSubmitting ? "Saving..." : editingItem ? "Update Story" : "Create Story"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
