"use client";

import { useEffect, useState } from "react";
import ProductPicker from "./ProductPicker";

interface LinkModalProps {
  isOpen: boolean;
  initialUrl?: string;
  onClose: () => void;
  onApplyLink: (url: string, linkText?: string) => void;
  onUnlink?: () => void;
  hasSelection: boolean;
}

export default function LinkModal({
  isOpen,
  initialUrl = "",
  onClose,
  onApplyLink,
  onUnlink,
  hasSelection,
}: LinkModalProps) {
  const [tab, setTab] = useState<"custom" | "product">("custom");
  const [url, setUrl] = useState(initialUrl);
  const [customText, setCustomText] = useState("");

  useEffect(() => {
    setUrl(initialUrl);
    setCustomText("");
  }, [initialUrl, isOpen]);

  if (!isOpen) return null;

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onApplyLink(url.trim(), hasSelection ? undefined : customText.trim() || url.trim());
    onClose();
  };

  const handleSelectProduct = (product: { name: string; slug: string; url: string }) => {
    onApplyLink(product.url, hasSelection ? undefined : product.name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface border border-outline-variant/40 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <h3 className="font-display text-[18px] font-semibold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">link</span>
            Insert Hyperlink
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-surface-container p-1 border border-outline-variant/30 text-[13px] font-medium">
          <button
            type="button"
            onClick={() => setTab("custom")}
            className={`flex-1 py-2 rounded-lg transition-all ${
              tab === "custom"
                ? "bg-surface text-primary shadow-sm font-semibold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Custom URL
          </button>
          <button
            type="button"
            onClick={() => setTab("product")}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === "product"
                ? "bg-surface text-primary shadow-sm font-semibold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">inventory_2</span>
            Link to Product
          </button>
        </div>

        {tab === "custom" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">
                Destination URL *
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmitCustom(e);
                  }
                }}
                placeholder="https://example.com or /products/redwine-facewash"
                className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/60 bg-surface text-on-surface text-[14px] focus:outline-none focus:border-primary transition-colors"
                autoFocus
              />
            </div>

            {!hasSelection && (
              <div>
                <label className="block text-[12px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">
                  Link Display Text (Optional)
                </label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSubmitCustom(e);
                    }
                  }}
                  placeholder="Text to display for link..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/60 bg-surface text-on-surface text-[14px] focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              {initialUrl && onUnlink ? (
                <button
                  type="button"
                  onClick={() => {
                    onUnlink();
                    onClose();
                  }}
                  className="px-3 py-2 rounded-lg text-error hover:bg-error/10 text-[13px] font-medium transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[18px]">link_off</span>
                  Remove Link
                </button>
              ) : (
                <div />
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-outline-variant/60 text-on-surface-variant text-[13px] font-medium hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitCustom}
                  disabled={!url.trim()}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary text-[13px] font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors"
                >
                  Apply Link
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[12px] text-on-surface-variant">
              Search your catalog below. Clicking a product will link straight to its page.
            </p>

            <ProductPicker onSelect={handleSelectProduct} />

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-outline-variant/60 text-on-surface-variant text-[13px] font-medium hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
