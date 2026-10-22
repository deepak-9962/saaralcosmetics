"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import DestinationSelector from "./DestinationSelector";
import {
  listHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  reorderHeroSlides,
} from "@/lib/supabase/data";
import type { HeroSlide, HeroSlideInput } from "@/lib/types";

export default function HeroSlidesManager() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);

  const desktopFileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<HeroSlideInput>({
    title: "",
    subtitle: "",
    description: "",
    image_url: "",
    mobile_image_url: "",
    button_text: "Explore Collection",
    button_link: "/products",
    destination_type: "category",
    destination_id: "all",
    product_id: null,
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

  const loadSlides = async () => {
    try {
      if (isMountedRef.current) setLoading(true);
      const data = await listHeroSlides(false); // list both active and inactive
      if (isMountedRef.current) setSlides(data);
    } catch (err: any) {
      if (isMountedRef.current) toast.error(err.message || "Failed to load hero slides.");
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const openCreateModal = () => {
    setEditingSlide(null);
    setForm({
      title: "",
      subtitle: "",
      description: "",
      image_url: "",
      mobile_image_url: "",
      button_text: "Explore Collection",
      button_link: "/products",
      destination_type: "category",
      destination_id: "all",
      product_id: null,
      display_order: slides.length,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setForm({
      title: slide.title,
      subtitle: slide.subtitle || "",
      description: slide.description || "",
      image_url: slide.image_url,
      mobile_image_url: slide.mobile_image_url || "",
      button_text: slide.button_text || "",
      button_link: slide.button_link,
      destination_type: slide.destination_type || "category",
      destination_id: slide.destination_id || null,
      product_id: slide.product_id || null,
      display_order: slide.display_order,
      is_active: slide.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDestinationChange = useCallback((val: any) => {
    setForm((prev) => {
      if (
        prev.destination_type === val.type &&
        prev.destination_id === val.id &&
        prev.product_id === (val.productId || null) &&
        prev.button_link === val.url
      ) {
        return prev;
      }
      return {
        ...prev,
        destination_type: val.type,
        destination_id: val.id,
        destination_category_id: val.categoryId || (val.type === "category" ? val.id : null),
        product_id: val.productId || null,
        button_link: val.url,
      };
    });
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMobile = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "hero");

    try {
      if (isMobile) setUploadingMobile(true);
      else setUploadingDesktop(true);

      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      if (isMobile) {
        setForm((prev) => ({ ...prev, mobile_image_url: data.url }));
        toast.success("Mobile image uploaded!");
      } else {
        setForm((prev) => ({ ...prev, image_url: data.url }));
        toast.success("Desktop image uploaded!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image.");
    } finally {
      if (isMobile) setUploadingMobile(false);
      else setUploadingDesktop(false);
      e.target.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Please enter a slide title.");
      return;
    }
    if (!form.image_url.trim()) {
      toast.error("Please provide or upload a desktop slide image.");
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
    if (form.destination_type === "custom" && !form.button_link?.trim()) {
      toast.error("Please enter a valid destination URL.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingSlide) {
        await updateHeroSlide(editingSlide.id, form);
        toast.success("Hero slide updated successfully!");
      } else {
        await createHeroSlide(form);
        toast.success("Hero slide created successfully!");
      }
      setIsModalOpen(false);
      await loadSlides();
    } catch (err: any) {
      toast.error(err.message || "Failed to save slide.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      const updated = !slide.is_active;
      // Optimistic update
      setSlides((prev) =>
        prev.map((s) => (s.id === slide.id ? { ...s, is_active: updated } : s))
      );
      await updateHeroSlide(slide.id, { is_active: updated });
      toast.success(updated ? `Slide "${slide.title}" enabled` : `Slide "${slide.title}" disabled`);
    } catch (err: any) {
      toast.error("Failed to update status.");
      loadSlides();
    }
  };

  const handleDelete = async (slide: HeroSlide) => {
    if (!window.confirm(`Are you sure you want to delete slide "${slide.title}"?`)) {
      return;
    }
    try {
      await deleteHeroSlide(slide.id);
      toast.success("Slide deleted successfully.");
      setSlides((prev) => prev.filter((s) => s.id !== slide.id));
    } catch (err: any) {
      toast.error(err.message || "Failed to delete slide.");
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const newSlides = [...slides];
    const [moved] = newSlides.splice(index, 1);
    newSlides.splice(targetIndex, 0, moved);

    setSlides(newSlides);

    try {
      await reorderHeroSlides(newSlides.map((s) => s.id));
      toast.success("Slide order updated!");
    } catch (err: any) {
      toast.error("Failed to save reorder.");
      loadSlides();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface p-5 rounded-2xl border border-outline-variant/40 shadow-sm">
        <div>
          <h2 className="font-display text-[22px] font-semibold text-on-surface">Hero / Banner Slides</h2>
          <p className="font-body text-[13px] text-on-surface-variant">
            Manage the hero banners rotating on the top of the Saaral homepage. Reorder, toggle visibility, and update images or links.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-body text-[13px] font-semibold hover:bg-primary/90 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add New Slide
        </button>
      </div>

      {/* Slide list */}
      {loading ? (
        <div className="p-12 text-center text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-[32px] text-primary mb-2">progress_activity</span>
          <p className="font-body text-[14px]">Loading hero slides...</p>
        </div>
      ) : slides.length === 0 ? (
        <div className="bg-surface p-12 text-center rounded-2xl border border-dashed border-outline-variant/60">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40 mb-2">view_carousel</span>
          <p className="font-body text-[15px] font-medium text-on-surface">No hero slides found</p>
          <p className="font-body text-[13px] text-on-surface-variant mt-1 mb-4">Click below to create your first homepage banner slide.</p>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary font-body text-[12px] font-semibold"
          >
            Create Slide
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-5 rounded-2xl border transition-all ${
                slide.is_active
                  ? "bg-surface border-outline-variant/50 shadow-sm"
                  : "bg-surface-container-low/50 border-outline-variant/30 opacity-75"
              }`}
            >
              {/* Left: Reorder buttons & preview */}
              <div className="flex items-center gap-4 w-full md:w-auto">
                {/* Reorder controls */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMove(index, "up")}
                    className="p-1 rounded-lg border border-outline-variant/50 hover:bg-surface-container-high disabled:opacity-20 text-on-surface-variant"
                    title="Move slide up"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                  </button>
                  <button
                    type="button"
                    disabled={index === slides.length - 1}
                    onClick={() => handleMove(index, "down")}
                    className="p-1 rounded-lg border border-outline-variant/50 hover:bg-surface-container-high disabled:opacity-20 text-on-surface-variant"
                    title="Move slide down"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                  </button>
                </div>

                {/* Banner Thumbnail */}
                <div className="relative w-28 md:w-36 aspect-[21/9] rounded-xl overflow-hidden bg-surface-container-high shrink-0 border border-outline-variant/30">
                  <Image
                    src={slide.image_url}
                    alt={slide.title}
                    fill
                    className="object-cover"
                    sizes="144px"
                    unoptimized
                  />
                  {slide.mobile_image_url && (
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-black/60 text-white backdrop-blur-sm">
                      +Mobile
                    </span>
                  )}
                </div>

                {/* Slide Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-body text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      #{index + 1}
                    </span>
                    <h3 className="font-display text-[16px] font-semibold text-on-surface truncate">
                      {slide.title}
                    </h3>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        slide.is_active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-neutral-200 text-neutral-600"
                      }`}
                    >
                      {slide.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {slide.subtitle && (
                    <p className="font-body text-[12px] text-on-surface-variant truncate mt-0.5">
                      {slide.subtitle}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 font-body text-[11px] flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-container-high text-on-surface-variant capitalize border border-outline-variant/30 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">
                        {slide.destination_type === "product"
                          ? "shopping_bag"
                          : slide.destination_type === "custom"
                          ? "link"
                          : "category"}
                      </span>
                      {slide.destination_type || "category"}
                    </span>
                    <span className="text-primary truncate font-mono text-[11px]">
                      {slide.button_link}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 mt-4 md:mt-0 self-end md:self-center">
                {/* Active Toggle Switch */}
                <button
                  type="button"
                  onClick={() => handleToggleActive(slide)}
                  className={`px-3 py-1.5 rounded-xl font-body text-[12px] font-semibold transition-colors flex items-center gap-1.5 ${
                    slide.is_active
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                      : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                  }`}
                  title={slide.is_active ? "Click to disable" : "Click to enable"}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {slide.is_active ? "visibility" : "visibility_off"}
                  </span>
                  {slide.is_active ? "Enabled" : "Disabled"}
                </button>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => openEditModal(slide)}
                  className="p-2 rounded-xl border border-outline-variant/60 text-on-surface hover:bg-surface-container-high transition-colors"
                  title="Edit slide"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDelete(slide)}
                  className="p-2 rounded-xl border border-outline-variant/60 text-error hover:bg-error-container hover:text-on-error-container transition-colors"
                  title="Delete slide"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
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
                {editingSlide ? "Edit Hero Slide" : "Add New Hero Slide"}
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
                  Heading / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Saaral Butterfly Pea Collection"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface font-body text-[14px] focus:outline-none focus:border-primary"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5">
                  Subtitle (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Luxury Botanical Skincare"
                  value={form.subtitle || ""}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface font-body text-[14px] focus:outline-none focus:border-primary"
                />
              </div>

              {/* Desktop Image Upload & URL */}
              <div>
                <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5">
                  Desktop Banner Image (Aspect ~21:9 or ~1400x500) *
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
                    ref={desktopFileInputRef}
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, false)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => desktopFileInputRef.current?.click()}
                    disabled={uploadingDesktop}
                    className="px-4 py-2.5 rounded-xl border border-primary/40 text-primary font-body text-[13px] font-semibold hover:bg-primary/5 transition-colors shrink-0 disabled:opacity-50"
                  >
                    {uploadingDesktop ? "Uploading..." : "Upload Image"}
                  </button>
                </div>
                {form.image_url && (
                  <div className="mt-2 relative w-full h-32 rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-high">
                    <Image
                      src={form.image_url}
                      alt="Desktop Banner Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
              </div>

              {/* Mobile Image Upload & URL */}
              <div>
                <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5">
                  Mobile Banner Image (Aspect ~16:9, Optional - falls back to desktop)
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <input
                    type="text"
                    placeholder="Enter mobile image URL or upload"
                    value={form.mobile_image_url || ""}
                    onChange={(e) => setForm({ ...form, mobile_image_url: e.target.value })}
                    className="flex-1 w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface font-body text-[14px] focus:outline-none focus:border-primary"
                  />
                  <input
                    type="file"
                    ref={mobileFileInputRef}
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, true)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => mobileFileInputRef.current?.click()}
                    disabled={uploadingMobile}
                    className="px-4 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant font-body text-[13px] font-semibold hover:bg-surface-container-high transition-colors shrink-0 disabled:opacity-50"
                  >
                    {uploadingMobile ? "Uploading..." : "Upload Mobile"}
                  </button>
                </div>
                {form.mobile_image_url && (
                  <div className="mt-2 relative w-48 h-28 rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-high">
                    <Image
                      src={form.mobile_image_url}
                      alt="Mobile Banner Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
              </div>

              {/* Button text (CTA) */}
              <div>
                <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant mb-1.5">
                  Button Text (Call to Action)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Explore Collection or Shop Now"
                  value={form.button_text || ""}
                  onChange={(e) => setForm({ ...form, button_text: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface font-body text-[14px] focus:outline-none focus:border-primary"
                />
              </div>

              {/* Destination Selector (Category / Product / Custom) */}
              <DestinationSelector
                key={editingSlide ? editingSlide.id : "new-slide"}
                initialType={form.destination_type}
                initialId={form.destination_id}
                initialProductId={form.product_id}
                initialUrl={form.button_link}
                onChange={handleDestinationChange}
                label="Slide Destination"
                required
              />

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
                    id="hero-active"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                  />
                  <label htmlFor="hero-active" className="font-body text-[14px] text-on-surface font-medium cursor-pointer">
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
                  {isSubmitting ? "Saving..." : editingSlide ? "Update Slide" : "Create Slide"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
