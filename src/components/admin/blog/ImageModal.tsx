"use client";

import { useState } from "react";
import Image from "next/image";
import { uploadBlogImage } from "@/lib/supabase/blog";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImage: (url: string, alt?: string) => void;
}

export default function ImageModal({ isOpen, onClose, onInsertImage }: ImageModalProps) {
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [url, setUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const publicUrl = await uploadBlogImage(file);
      onInsertImage(publicUrl, altText.trim() || file.name);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onInsertImage(url.trim(), altText.trim() || "Blog image");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface border border-outline-variant/40 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <h3 className="font-display text-[18px] font-semibold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">image</span>
            Insert Image
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
            onClick={() => setTab("upload")}
            className={`flex-1 py-2 rounded-lg transition-all ${
              tab === "upload"
                ? "bg-surface text-primary shadow-sm font-semibold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setTab("url")}
            className={`flex-1 py-2 rounded-lg transition-all ${
              tab === "url"
                ? "bg-surface text-primary shadow-sm font-semibold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Image URL
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-[13px]">
            {error}
          </div>
        )}

        {tab === "upload" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">
                Alt Text / Caption (Optional)
              </label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe image for accessibility..."
                className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-on-surface text-[14px] focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-outline-variant/60 rounded-xl cursor-pointer hover:bg-surface-container-high hover:border-primary transition-all">
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined animate-spin text-[32px] text-primary">
                    progress_activity
                  </span>
                  <span className="text-[13px] font-medium text-on-surface-variant">
                    Uploading image...
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="material-symbols-outlined text-[36px] text-primary">
                    cloud_upload
                  </span>
                  <span className="text-[14px] font-medium text-on-surface">
                    Click to select or drag & drop image file
                  </span>
                  <span className="text-[12px] text-on-surface-variant">
                    Supports PNG, JPG, WEBP, AVIF
                  </span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

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
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">
                Image Web Address (URL) *
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmitUrl(e);
                  }
                }}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/60 bg-surface text-on-surface text-[14px] focus:outline-none focus:border-primary transition-colors"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">
                Alt Text (Optional)
              </label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmitUrl(e);
                  }
                }}
                placeholder="Describe image..."
                className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-on-surface text-[14px] focus:outline-none focus:border-primary transition-colors"
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
                onClick={handleSubmitUrl}
                disabled={!url.trim()}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary text-[13px] font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors"
              >
                Insert Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
