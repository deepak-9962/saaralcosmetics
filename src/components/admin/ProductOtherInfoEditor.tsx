"use client";

import { useState } from "react";
import type { ProductSpecification } from "@/lib/types";

interface ProductOtherInfoEditorProps {
  value: ProductSpecification[];
  onChange: (items: ProductSpecification[]) => void;
}

const COMMON_PRESETS = [
  "Quantity",
  "pH",
  "Targets",
  "Suitable for",
  "Foam/Lather",
  "Fragrance",
  "Storage",
  "Shelf life",
];

export default function ProductOtherInfoEditor({
  value = [],
  onChange,
}: ProductOtherInfoEditorProps) {
  const items = Array.isArray(value) ? value : [];

  const handleAdd = (label = "") => {
    onChange([...items, { label, value: "" }]);
  };

  const handleUpdate = (index: number, field: "label" | "value", text: string) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: text } : item
    );
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const copy = [...items];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    onChange(copy);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="font-body text-[11px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant uppercase">
            Other Information (Specifications)
          </label>
          <p className="font-body text-[12px] text-on-surface-variant/70 mt-1">
            Displayed as an expandable accordion on the product page (e.g. Quantity, pH, Suitable for, Storage).
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleAdd()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-[12px] font-medium transition-colors cursor-pointer w-fit"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Add Item
        </button>
      </div>

      {/* Preset quick chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="font-body text-[11px] text-on-surface-variant/60 mr-1">
          Quick add:
        </span>
        {COMMON_PRESETS.map((preset) => {
          const alreadyAdded = items.some(
            (it) => it.label.trim().toLowerCase() === preset.toLowerCase()
          );
          return (
            <button
              key={preset}
              type="button"
              disabled={alreadyAdded}
              onClick={() => handleAdd(preset)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                alreadyAdded
                  ? "bg-surface-container-low text-on-surface-variant/40 border border-outline-variant/30 cursor-not-allowed"
                  : "bg-tertiary-container/20 text-tertiary-container border border-tertiary-container/30 hover:bg-tertiary-container/30"
              }`}
            >
              + {preset}
            </button>
          );
        })}
      </div>

      {/* Rows */}
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-outline-variant/60 p-5 text-center bg-surface-container-lowest">
          <span className="material-symbols-outlined text-[28px] text-on-surface-variant/40 mb-1">
            table_rows
          </span>
          <p className="font-body text-[13px] text-on-surface-variant">
            No specifications added yet. Click &quot;Add Item&quot; or select a quick-add chip above.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest"
            >
              {/* Reorder Buttons */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleMove(index, "up")}
                  className="p-0.5 text-on-surface-variant/50 hover:text-on-surface disabled:opacity-20 cursor-pointer"
                  title="Move up"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_drop_up</span>
                </button>
                <button
                  type="button"
                  disabled={index === items.length - 1}
                  onClick={() => handleMove(index, "down")}
                  className="p-0.5 text-on-surface-variant/50 hover:text-on-surface disabled:opacity-20 cursor-pointer"
                  title="Move down"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
                </button>
              </div>

              {/* Label */}
              <div className="w-1/3 min-w-[110px]">
                <input
                  type="text"
                  placeholder="Label (e.g. pH)"
                  value={item.label}
                  onChange={(e) => handleUpdate(index, "label", e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 font-body text-[13px] text-on-surface focus:outline-none focus:border-tertiary-container font-medium"
                />
              </div>

              {/* Value */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Value (e.g. 6.0-7.0 or Normal to Oily skin)"
                  value={item.value}
                  onChange={(e) => handleUpdate(index, "value", e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 font-body text-[13px] text-on-surface focus:outline-none focus:border-tertiary-container"
                />
              </div>

              {/* Delete button */}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Remove specification"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

