"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  listCombos,
  createCombo,
  updateCombo,
  deleteCombo,
  reorderCombos,
  listAllProductsForAdmin,
} from "@/lib/supabase/data";
import type { ComboWithProducts, ComboInput, Product } from "@/lib/types";
import { formatPrice, generateSlug } from "@/lib/utils";

type SelectedProductItem = {
  product_id: string;
  quantity: number;
};

export default function CombosManager() {
  const [combos, setCombos] = useState<ComboWithProducts[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<ComboWithProducts | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [badge, setBadge] = useState("Combo Pack");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [selectedItems, setSelectedItems] = useState<SelectedProductItem[]>([]);
  const [productSearch, setProductSearch] = useState("");

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadData = async () => {
    try {
      if (isMountedRef.current) setLoading(true);
      const [combosData, prodsData] = await Promise.all([
        listCombos(false), // get all combos (active and inactive)
        listAllProductsForAdmin(),
      ]);
      if (isMountedRef.current) {
        setCombos(combosData);
        setAllProducts(prodsData);
      }
    } catch (err: any) {
      if (isMountedRef.current) toast.error(err.message || "Failed to load combos.");
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingCombo(null);
    setName("");
    setSlug("");
    setDescription("");
    setImageUrl("");
    setPrice("");
    setComparePrice("");
    setBadge("Combo Pack");
    setDisplayOrder(combos.length);
    setIsActive(true);
    setSelectedItems([]);
    setProductSearch("");
    setIsModalOpen(true);
  };

  const openEditModal = (combo: ComboWithProducts) => {
    setEditingCombo(combo);
    setName(combo.name);
    setSlug(combo.slug);
    setDescription(combo.description || "");
    setImageUrl(combo.image_url);
    setPrice(String(combo.price));
    setComparePrice(combo.compare_price ? String(combo.compare_price) : "");
    setBadge(combo.badge || "Combo Pack");
    setDisplayOrder(combo.display_order);
    setIsActive(combo.is_active);
    setSelectedItems(
      combo.items.map((it) => ({
        product_id: it.product_id,
        quantity: it.quantity,
      }))
    );
    setProductSearch("");
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCombo) {
      setSlug(generateSlug(val));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "combos");

    try {
      setUploadingImage(true);
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setImageUrl(data.url);
      toast.success("Combo image uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const toggleProductSelection = (product: Product) => {
    const exists = selectedItems.find((i) => i.product_id === product.id);
    if (exists) {
      setSelectedItems(selectedItems.filter((i) => i.product_id !== product.id));
    } else {
      setSelectedItems([...selectedItems, { product_id: product.id, quantity: 1 }]);
    }
  };

  const updateItemQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      setSelectedItems(selectedItems.filter((i) => i.product_id !== productId));
      return;
    }
    setSelectedItems(
      selectedItems.map((i) => (i.product_id === productId ? { ...i, quantity: qty } : i))
    );
  };

  // Calculate sum of regular prices of all selected items
  const combinedRegularPrice = selectedItems.reduce((sum, item) => {
    const p = allProducts.find((prod) => prod.id === item.product_id);
    return sum + (p ? p.price * item.quantity : 0);
  }, 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a combo name.");
      return;
    }
    if (!imageUrl.trim()) {
      toast.error("Please upload or enter a combo image.");
      return;
    }
    const numPrice = Number(price);
    if (!Number.isFinite(numPrice) || numPrice < 0) {
      toast.error("Please enter a valid selling price.");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Please select at least one product to include in this combo.");
      return;
    }

    const payload: ComboInput = {
      name: name.trim(),
      slug: slug.trim() || generateSlug(name),
      description: description.trim() || null,
      image_url: imageUrl,
      price: numPrice,
      compare_price: comparePrice ? Number(comparePrice) : null,
      badge: badge.trim() || null,
      display_order: displayOrder,
      is_active: isActive,
      product_ids: selectedItems,
    };

    try {
      setIsSubmitting(true);
      if (editingCombo) {
        await updateCombo(editingCombo.id, payload);
        toast.success("Combo updated successfully!");
      } else {
        await createCombo(payload);
        toast.success("Combo created successfully!");
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save combo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (combo: ComboWithProducts) => {
    try {
      const updated = !combo.is_active;
      setCombos((prev) =>
        prev.map((c) => (c.id === combo.id ? { ...c, is_active: updated } : c))
      );
      await updateCombo(combo.id, { is_active: updated });
      toast.success(updated ? `Combo "${combo.name}" enabled` : `Combo "${combo.name}" disabled`);
    } catch (err: any) {
      toast.error("Failed to update status.");
      loadData();
    }
  };

  const handleDelete = async (combo: ComboWithProducts) => {
    if (!window.confirm(`Are you sure you want to delete combo "${combo.name}"?`)) {
      return;
    }
    try {
      await deleteCombo(combo.id);
      toast.success("Combo deleted.");
      setCombos((prev) => prev.filter((c) => c.id !== combo.id));
    } catch (err: any) {
      toast.error(err.message || "Failed to delete combo.");
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= combos.length) return;

    const newCombos = [...combos];
    const [moved] = newCombos.splice(index, 1);
    newCombos.splice(targetIndex, 0, moved);

    setCombos(newCombos);

    try {
      await reorderCombos(newCombos.map((c) => c.id));
      toast.success("Combo order updated!");
    } catch (err: any) {
      toast.error("Failed to save reorder.");
      loadData();
    }
  };

  const filteredProducts = allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface p-5 rounded-2xl border border-outline-variant/40 shadow-sm">
        <div>
          <h2 className="font-display text-[22px] font-semibold text-on-surface">Combos Management</h2>
          <p className="font-body text-[13px] text-on-surface-variant">
            Create and manage multi-product Combos displayed on the homepage. Connect real products, configure custom bundle pricing, and manage inventory availability.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-body text-[13px] font-semibold hover:bg-primary/90 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Create New Combo
        </button>
      </div>

      {/* Combos list */}
      {loading ? (
        <div className="p-12 text-center text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-[32px] text-primary mb-2">progress_activity</span>
          <p className="font-body text-[14px]">Loading combos...</p>
        </div>
      ) : combos.length === 0 ? (
        <div className="bg-surface p-12 text-center rounded-2xl border border-dashed border-outline-variant/60">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40 mb-2">auto_awesome_motion</span>
          <p className="font-body text-[15px] font-medium text-on-surface">No combos found</p>
          <p className="font-body text-[13px] text-on-surface-variant mt-1 mb-4">Click below to create your first combo offer.</p>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary font-body text-[12px] font-semibold"
          >
            Create Combo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {combos.map((combo, index) => {
            const hasOutOfStock = combo.items.some(
              (it) => !it.product || !it.product.is_active || it.product.stock < it.quantity
            );

            return (
              <div
                key={combo.id}
                className={`flex flex-col lg:flex-row items-start lg:items-center justify-between p-5 rounded-2xl border transition-all gap-5 ${
                  combo.is_active
                    ? "bg-surface border-outline-variant/50 shadow-sm"
                    : "bg-surface-container-low/50 border-outline-variant/30 opacity-75"
                }`}
              >
                {/* Left: Reorder & Image & Info */}
                <div className="flex items-start md:items-center gap-4 w-full lg:w-auto">
                  {/* Reorder controls */}
                  <div className="flex flex-col gap-1 shrink-0 pt-1 md:pt-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, "up")}
                      className="p-1 rounded-lg border border-outline-variant/50 hover:bg-surface-container-high disabled:opacity-20 text-on-surface-variant"
                      title="Move combo up"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                    </button>
                    <button
                      type="button"
                      disabled={index === combos.length - 1}
                      onClick={() => handleMove(index, "down")}
                      className="p-1 rounded-lg border border-outline-variant/50 hover:bg-surface-container-high disabled:opacity-20 text-on-surface-variant"
                      title="Move combo down"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                    </button>
                  </div>

                  {/* Thumbnail Image */}
                  <div className="relative w-24 h-28 aspect-[4/5] rounded-xl overflow-hidden bg-surface-container-high shrink-0 border border-outline-variant/30">
                    <Image
                      src={combo.image_url}
                      alt={combo.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                      unoptimized
                    />
                    {combo.badge && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-primary text-white shadow-xs">
                        {combo.badge}
                      </span>
                    )}
                  </div>

                  {/* Combo Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-body text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        #{index + 1}
                      </span>
                      <h3 className="font-display text-[17px] font-semibold text-on-surface">
                        {combo.name}
                      </h3>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          combo.is_active
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-neutral-200 text-neutral-600"
                        }`}
                      >
                        {combo.is_active ? "Active" : "Inactive"}
                      </span>
                      {hasOutOfStock ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Item Out of Stock
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                          All Items In Stock
                        </span>
                      )}
                    </div>

                    {/* Price row */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-body text-[16px] font-bold text-primary">
                        {formatPrice(combo.price)}
                      </span>
                      {combo.compare_price && (
                        <span className="font-body text-[13px] text-on-surface-variant/60 line-through">
                          {formatPrice(combo.compare_price)}
                        </span>
                      )}
                      {combo.compare_price && (
                        <span className="font-body text-[10px] px-1.5 py-0.2 rounded-full bg-primary/10 text-primary font-semibold">
                          {Math.round((1 - combo.price / combo.compare_price) * 100)}% off
                        </span>
                      )}
                    </div>

                    {/* Included products pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-body text-[11px] text-on-surface-variant font-medium">Includes:</span>
                      {combo.items.map((it) => (
                        <span
                          key={it.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high border border-outline-variant/40 font-body text-[11px] text-on-surface"
                        >
                          <span className="font-bold text-primary">{it.quantity}x</span>
                          <span className="truncate max-w-[150px]">{it.product ? it.product.name : "Product Unavailable"}</span>
                          {it.product && it.product.stock <= 0 && (
                            <span className="text-red-500 text-[10px] font-bold">(OOS)</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                  {/* Toggle Active Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(combo)}
                    className={`px-3 py-1.5 rounded-xl font-body text-[12px] font-semibold transition-colors flex items-center gap-1.5 ${
                      combo.is_active
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                        : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {combo.is_active ? "visibility" : "visibility_off"}
                    </span>
                    {combo.is_active ? "Enabled" : "Disabled"}
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => openEditModal(combo)}
                    className="p-2 rounded-xl border border-outline-variant/60 text-on-surface hover:bg-surface-container-high transition-colors"
                    title="Edit combo"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(combo)}
                    className="p-2 rounded-xl border border-outline-variant/60 text-error hover:bg-error-container hover:text-on-error-container transition-colors"
                    title="Delete combo"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CREATE / EDIT MODAL ────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-surface rounded-3xl border border-outline-variant/50 shadow-2xl p-6 md:p-8 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-outline-variant/30 pb-4">
              <h3 className="font-display text-[22px] font-bold text-on-surface">
                {editingCombo ? "Edit Combo" : "Create New Combo"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5">
                    Combo Title / Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Butterfly Pea Radiant Glow Combo"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface font-body text-[14px] focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. butterfly-pea-radiant-glow-combo"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface font-body text-[14px] focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5">
                  Combo Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the benefits of this combo and why they work together..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface font-body text-[14px] focus:outline-none focus:border-primary"
                />
              </div>

              {/* Combo Image Upload & URL */}
              <div>
                <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5">
                  Combo Image *
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <input
                    type="text"
                    required
                    placeholder="Enter image URL or upload"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
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
                {imageUrl && (
                  <div className="mt-3 relative w-32 h-40 rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-high">
                    <Image src={imageUrl} alt="Combo Preview" fill className="object-cover" unoptimized />
                  </div>
                )}
              </div>

              {/* Pricing & Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="429"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface font-body text-[14px] focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5">
                    Compare Price (₹ Optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="469"
                    value={comparePrice}
                    onChange={(e) => setComparePrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface font-body text-[14px] focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bestseller Combo"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface font-body text-[14px] focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* ── PRODUCT RELATIONSHIP SELECTOR ──────────────────────── */}
              <div className="p-4 rounded-2xl border border-outline-variant/50 bg-surface-container-low/40 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h4 className="font-display text-[16px] font-bold text-on-surface">
                      Included Products ({selectedItems.length} selected) *
                    </h4>
                    <p className="font-body text-[12px] text-on-surface-variant">
                      Choose real products from the catalog. Changes to their inventory will reflect directly in the combo availability.
                    </p>
                  </div>
                  {combinedRegularPrice > 0 && (
                    <div className="text-right">
                      <span className="font-body text-[11px] text-on-surface-variant block">Combined Regular Price:</span>
                      <span className="font-body text-[14px] font-bold text-on-surface">{formatPrice(combinedRegularPrice)}</span>
                      {Number(price) > 0 && combinedRegularPrice > Number(price) && (
                        <span className="font-body text-[11px] text-emerald-600 block font-medium">
                          Customer saves {formatPrice(combinedRegularPrice - Number(price))} ({Math.round((1 - Number(price) / combinedRegularPrice) * 100)}%)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected items list */}
                {selectedItems.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {selectedItems.map((item) => {
                      const prod = allProducts.find((p) => p.id === item.product_id);
                      if (!prod) return null;

                      return (
                        <div
                          key={item.product_id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-outline-variant/40"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-surface-container-high shrink-0">
                              {prod.images?.[0] && (
                                <Image src={prod.images[0]} alt={prod.name} fill className="object-cover" unoptimized />
                              )}
                            </div>
                            <div>
                              <p className="font-body text-[13px] font-semibold text-on-surface">{prod.name}</p>
                              <p className="font-body text-[11px] text-on-surface-variant">
                                {formatPrice(prod.price)} · Stock: {prod.stock}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 bg-surface-container-high rounded-lg p-0.5">
                              <span className="text-[11px] font-medium px-1 text-on-surface-variant">Qty:</span>
                              <input
                                type="number"
                                min={1}
                                max={99}
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(item.product_id, parseInt(e.target.value) || 1)}
                                className="w-12 text-center text-xs py-1 rounded bg-surface border border-outline-variant/40"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleProductSelection(prod)}
                              className="p-1 rounded-lg text-error hover:bg-error-container hover:text-on-error-container"
                              title="Remove product from combo"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Product search & picker */}
                <div>
                  <div className="relative mb-2">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Search catalogue to add product..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-outline-variant/60 bg-surface text-on-surface font-body text-[13px] focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1.5 p-1 border border-outline-variant/30 rounded-xl bg-surface">
                    {filteredProducts.length === 0 ? (
                      <p className="p-3 text-center text-xs text-on-surface-variant">No products found.</p>
                    ) : (
                      filteredProducts.map((p) => {
                        const isSelected = selectedItems.some((i) => i.product_id === p.id);
                        return (
                          <div
                            key={p.id}
                            onClick={() => toggleProductSelection(p)}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-primary/10 border border-primary/30"
                                : "hover:bg-surface-container-high"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px] text-primary">
                                {isSelected ? "check_box" : "check_box_outline_blank"}
                              </span>
                              <span className="font-body text-[12px] font-medium text-on-surface">{p.name}</span>
                              <span className="font-body text-[11px] text-on-surface-variant">({p.category})</span>
                            </div>
                            <span className="font-body text-[12px] font-bold text-primary">{formatPrice(p.price)}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Display Order & Active */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface font-body text-[14px] focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="combo-active"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                  />
                  <label htmlFor="combo-active" className="font-body text-[14px] text-on-surface font-medium cursor-pointer">
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
                  {isSubmitting ? "Saving..." : editingCombo ? "Update Combo" : "Create Combo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
