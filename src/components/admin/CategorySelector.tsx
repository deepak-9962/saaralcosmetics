"use client";

import { useEffect, useState } from "react";
import { listCategories } from "@/lib/supabase/data";
import type { Category } from "@/lib/types";

export interface CategorySelectorProps {
  value?: string | null;
  valueMode?: "slug" | "id";
  onChange: (category: Category | null, value: string) => void;
  includeAllOption?: boolean;
  allLabel?: string;
  onlyActive?: boolean;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  id?: string;
  name?: string;
}

export default function CategorySelector({
  value,
  valueMode = "slug",
  onChange,
  includeAllOption = false,
  allLabel = "All Categories",
  onlyActive = false, // In admin, allow viewing all categories
  className = "",
  disabled = false,
  required = false,
  placeholder = "Select Category...",
  id,
  name = "category",
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listCategories(onlyActive)
      .then((data) => {
        if (!active) return;
        setCategories(data);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Failed to load categories in CategorySelector:", err);
        setError("Could not load categories");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [onlyActive]);

  // Determine current matching value for select input
  let selectVal = "";
  if (value) {
    if (includeAllOption && value === "all") {
      selectVal = "all";
    } else {
      const match = categories.find((c) => c.id === value || c.slug === value);
      if (match) {
        selectVal = valueMode === "id" ? match.id : match.slug;
      } else {
        // If not found in loaded list, keep raw value so it doesn't vanish
        selectVal = value;
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rawVal = e.target.value;
    if (includeAllOption && rawVal === "all") {
      onChange(null, "all");
      return;
    }
    const cat = categories.find((c) => (valueMode === "id" ? c.id === rawVal : c.slug === rawVal)) || null;
    onChange(cat, rawVal);
  };

  const defaultClasses =
    "w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body text-[15px] text-on-surface focus:outline-none focus:border-tertiary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface-variant font-body text-[14px]">
        <span className="material-symbols-outlined animate-spin text-[16px] text-primary">
          progress_activity
        </span>
        <span>Loading categories...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <select
        id={id}
        name={name}
        value={selectVal}
        onChange={handleChange}
        disabled={disabled || loading}
        required={required}
        className={`${defaultClasses} ${className}`}
      >
        {placeholder && !includeAllOption && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {includeAllOption && <option value="all">{allLabel}</option>}
        {categories.map((c) => {
          const optVal = valueMode === "id" ? c.id : c.slug;
          return (
            <option key={c.id} value={optVal}>
              {c.name} {!c.is_active ? "(Inactive)" : ""}
            </option>
          );
        })}
      </select>
      {error && (
        <p className="mt-1 font-body text-[11px] text-error">{error}</p>
      )}
    </div>
  );
}
