"use client";

import { useState } from "react";
import { createBlogCategory, slugify } from "@/lib/supabase/blog";
import type { BlogCategory } from "@/lib/types";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded: (category: BlogCategory) => void;
}

export default function AddCategoryModal({
  isOpen,
  onClose,
  onCategoryAdded,
}: AddCategoryModalProps) {
  const [name, setName] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const newCategory = await createBlogCategory(name.trim(), customSlug.trim() || undefined);
      if (newCategory) {
        onCategoryAdded(newCategory);
        setName("");
        setCustomSlug("");
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || "Failed to create category. Ensure it is unique.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface border border-outline-variant/40 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <h3 className="font-display text-[18px] font-semibold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            Add New Blog Category
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-[13px]">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">
              Category Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!customSlug) {
                  setCustomSlug(slugify(e.target.value));
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="e.g. Skincare Science, Ingredients Spotlight"
              className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/60 bg-surface text-on-surface text-[14px] focus:outline-none focus:border-primary transition-colors"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">
              URL Slug *
            </label>
            <input
              type="text"
              value={customSlug}
              onChange={(e) => setCustomSlug(slugify(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="e.g. skincare-science"
              className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/60 bg-surface text-on-surface text-[14px] font-mono focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-outline-variant/60 text-on-surface-variant text-[13px] font-medium hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !name.trim()}
              className="px-4 py-2 rounded-lg bg-primary text-on-primary text-[13px] font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              {loading && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
              Save Category
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
