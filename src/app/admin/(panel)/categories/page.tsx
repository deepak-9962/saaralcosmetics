"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/supabase/data";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { generateSlug } from "@/lib/utils";
import type { Category, CategoryInput } from "@/lib/types";

interface CategoryWithCount extends Category {
  product_count: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmCat, setDeleteConfirmCat] = useState<CategoryWithCount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formOrder, setFormOrder] = useState<number>(0);
  const [formActive, setFormActive] = useState(true);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const cats = await listCategories(false);
      
      // Fetch product counts per category
      const supabase = getSupabaseBrowserClient();
      const { data: prods } = await supabase
        .from("products")
        .select("id, category, category_id");

      const countMap: Record<string, number> = {};
      (prods || []).forEach((p: any) => {
        if (p.category_id) {
          countMap[p.category_id] = (countMap[p.category_id] || 0) + 1;
        }
        if (p.category) {
          countMap[p.category] = (countMap[p.category] || 0) + 1;
        }
      });

      const enriched: CategoryWithCount[] = cats.map((c) => ({
        ...c,
        product_count: countMap[c.id] || countMap[c.slug] || 0,
      }));

      setCategories(enriched);
    } catch (err: any) {
      console.error("Failed to load categories:", err);
      toast.error(err.message || "Failed to load categories.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setFormOrder(categories.length + 1);
    setFormActive(true);
    setIsSlugManuallyEdited(false);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDescription(cat.description || "");
    setFormOrder(cat.display_order ?? 0);
    setFormActive(cat.is_active);
    setIsSlugManuallyEdited(true);
    setIsModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormName(val);
    if (!isSlugManuallyEdited) {
      setFormSlug(generateSlug(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    setFormSlug(generateSlug(e.target.value));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Category name is required.");
      return;
    }

    const payload: CategoryInput = {
      name: formName.trim(),
      slug: formSlug.trim() ? formSlug.trim() : generateSlug(formName),
      description: formDescription.trim() || null,
      display_order: Number(formOrder) || 0,
      is_active: formActive,
    };

    try {
      setIsSubmitting(true);
      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
        toast.success(`Category "${payload.name}" updated!`);
      } else {
        await createCategory(payload);
        toast.success(`Category "${payload.name}" created successfully!`);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      const nextActive = !cat.is_active;
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, is_active: nextActive } : c))
      );
      await updateCategory(cat.id, { is_active: nextActive });
      toast.success(
        nextActive ? `"${cat.name}" is now active` : `"${cat.name}" disabled`
      );
    } catch (err: any) {
      toast.error("Failed to toggle category status.");
      loadData();
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmCat) return;
    try {
      setIsDeleting(true);
      const res = await deleteCategory(deleteConfirmCat.id);
      toast.success(
        res.affectedProducts > 0
          ? `Deleted "${deleteConfirmCat.name}" (unlinked from ${res.affectedProducts} product${res.affectedProducts > 1 ? "s" : ""})`
          : `Category "${deleteConfirmCat.name}" deleted.`
      );
      setDeleteConfirmCat(null);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  return (
    <div className="p-[var(--spacing-margin-mobile)] md:p-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto w-full flex-grow flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[32px] leading-[1.3] text-on-surface tracking-tight">
            Categories
          </h1>
          <p className="font-body text-[15px] leading-[1.6] text-on-surface-variant">
            Central source of truth for all product categories across the catalog, filters, hero slides, and homepage strips.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl bg-tertiary-container text-on-tertiary-container hover:bg-tertiary-fixed-dim transition-colors font-body text-[13px] font-semibold tracking-wide shadow-sm flex items-center gap-2 w-fit cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Category
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
          search
        </span>
        <input
          type="text"
          placeholder="Search by category name, slug..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-11 pl-11 pr-4 bg-surface-container-lowest border border-outline-variant rounded-xl font-body text-[14px] text-on-surface focus:outline-none focus:border-tertiary-container transition-all"
        />
      </div>

      {/* Categories Table / List */}
      {isLoading ? (
        <div className="flex items-center gap-3 py-16 justify-center">
          <span className="material-symbols-outlined animate-spin text-primary text-[28px]">
            progress_activity
          </span>
          <p className="font-body text-[15px] text-on-surface-variant">
            Loading categories...
          </p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-12 text-center bg-surface-container-lowest border border-outline-variant/60 rounded-2xl">
          <span className="material-symbols-outlined text-4xl text-outline mb-2">
            category
          </span>
          <p className="font-body text-[15px] font-medium text-on-surface">
            No categories found
          </p>
          <p className="font-body text-[13px] text-on-surface-variant mt-1">
            {searchQuery ? "Try a different search query." : "Click 'Add Category' to create your first category."}
          </p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/70 bg-surface-container-high/40 font-body text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-16 text-center">Order</th>
                  <th className="py-3.5 px-4">Category Name</th>
                  <th className="py-3.5 px-4">Slug / Route</th>
                  <th className="py-3.5 px-4">Products</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50 font-body text-[14px]">
                {filteredCategories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-surface-container-high/30 transition-colors"
                  >
                    {/* Display Order */}
                    <td className="py-4 px-4 text-center font-semibold text-on-surface-variant">
                      #{cat.display_order}
                    </td>

                    {/* Name & Description */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-on-surface text-[15px]">
                        {cat.name}
                      </div>
                      {cat.description && (
                        <div className="text-[12px] text-on-surface-variant line-clamp-1 mt-0.5">
                          {cat.description}
                        </div>
                      )}
                      <div className="text-[11px] text-outline font-mono mt-0.5">
                        ID: {cat.id}
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="py-4 px-4">
                      <code className="text-[12px] px-2 py-0.5 rounded bg-surface-container-high text-primary font-mono">
                        {cat.slug}
                      </code>
                    </td>

                    {/* Product count */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium bg-surface-container-high text-on-surface">
                        <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                        {cat.product_count} product{cat.product_count !== 1 ? "s" : ""}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(cat)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                          cat.is_active
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            cat.is_active ? "bg-emerald-500" : "bg-outline"
                          }`}
                        />
                        {cat.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(cat)}
                          className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmCat(cat)}
                          className="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modal: Create / Edit Category ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-outline-variant/60">
                <h3 className="font-display text-[20px] font-semibold text-on-surface">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4">
                {/* Category Name */}
                <div className="space-y-1.5">
                  <label className="block font-body text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                    Category Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hair Care or Body Care"
                    value={formName}
                    onChange={handleNameChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/70 bg-surface text-on-surface font-body text-[14px] focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1.5">
                  <label className="block font-body text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                    URL Slug
                  </label>
                  <div className="flex items-center rounded-xl border border-outline-variant/70 bg-surface px-3">
                    <span className="text-outline text-[13px] font-mono select-none">
                      /products?category=
                    </span>
                    <input
                      type="text"
                      placeholder="hair-care"
                      value={formSlug}
                      onChange={handleSlugChange}
                      className="flex-1 py-2.5 px-1 bg-transparent text-on-surface font-mono text-[13px] focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-outline">
                    Auto-generated from name. Used in URLs and routing.
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block font-body text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Short description of this category..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/70 bg-surface text-on-surface font-body text-[14px] focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Order & Active */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="block font-body text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formOrder}
                      onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/70 bg-surface text-on-surface font-body text-[14px] focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <input
                      type="checkbox"
                      id="category-active-toggle"
                      checked={formActive}
                      onChange={(e) => setFormActive(e.target.checked)}
                      className="w-5 h-5 rounded accent-primary cursor-pointer"
                    />
                    <label
                      htmlFor="category-active-toggle"
                      className="font-body text-[14px] font-medium text-on-surface cursor-pointer select-none"
                    >
                      Active / Visible
                    </label>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/60">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors font-body text-[13px] font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary/90 transition-colors font-body text-[13px] font-semibold shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting && (
                      <span className="material-symbols-outlined animate-spin text-[16px]">
                        progress_activity
                      </span>
                    )}
                    {editingCategory ? "Save Changes" : "Create Category"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal: Delete Confirmation ── */}
      <AnimatePresence>
        {deleteConfirmCat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md shadow-xl p-6 space-y-4"
            >
              <div className="flex items-center gap-3 text-error">
                <span className="material-symbols-outlined text-3xl">warning</span>
                <h3 className="font-display text-[20px] font-semibold text-on-surface">
                  Delete Category?
                </h3>
              </div>

              <p className="font-body text-[14px] text-on-surface-variant leading-relaxed">
                Are you sure you want to delete{" "}
                <strong className="text-on-surface">"{deleteConfirmCat.name}"</strong>?
              </p>

              {deleteConfirmCat.product_count > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[13px]">
                  <strong>Warning:</strong> {deleteConfirmCat.product_count} product
                  {deleteConfirmCat.product_count > 1 ? "s are" : " is"} currently assigned to this category.
                  Deleting it will unassign them without deleting the products themselves.
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmCat(null)}
                  className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors font-body text-[13px] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="px-5 py-2 rounded-xl bg-error text-white hover:bg-error/90 transition-colors font-body text-[13px] font-semibold shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isDeleting && (
                    <span className="material-symbols-outlined animate-spin text-[16px]">
                      progress_activity
                    </span>
                  )}
                  Delete Category
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
