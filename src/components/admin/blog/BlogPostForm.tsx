"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BlogEditor from "./BlogEditor";
import AddCategoryModal from "./AddCategoryModal";
import {
  listBlogCategories,
  generateUniquePostSlug,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  uploadBlogImage,
  slugify,
} from "@/lib/supabase/blog";
import type { BlogCategory, BlogPostWithCategory, BlogPostStatus } from "@/lib/types";

interface BlogPostFormProps {
  initialPost?: BlogPostWithCategory;
  isEdit?: boolean;
}

export default function BlogPostForm({ initialPost, isEdit = false }: BlogPostFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialPost?.title || "");
  const [slug, setSlug] = useState(initialPost?.slug || "");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(Boolean(initialPost));
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || "");
  const [content, setContent] = useState<any>(initialPost?.content || null);
  const [coverImageUrl, setCoverImageUrl] = useState(initialPost?.cover_image_url || "");
  const [categoryId, setCategoryId] = useState(initialPost?.category_id || "");
  const [status, setStatus] = useState<BlogPostStatus>(initialPost?.status || "draft");
  const [authorName, setAuthorName] = useState(initialPost?.author_name || "Saaral Cosmetics");

  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [addCatModalOpen, setAddCatModalOpen] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch categories on load
  useEffect(() => {
    async function loadCategories() {
      const catList = await listBlogCategories();
      setCategories(catList);
      if (!categoryId && catList.length > 0 && !isEdit) {
        setCategoryId(catList[0].id);
      }
    }
    loadCategories();
  }, []);

  // Auto-slugify title if not manually edited
  const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isSlugManuallyEdited) {
      const generated = slugify(val);
      setSlug(generated);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    setSlug(slugify(e.target.value));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    setErrorMessage(null);
    try {
      const url = await uploadBlogImage(file);
      setCoverImageUrl(url);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to upload cover image.");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleCategoryAdded = (newCat: BlogCategory) => {
    setCategories((prev) => [...prev, newCat]);
    setCategoryId(newCat.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage("Title is required.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      // Ensure unique slug
      const finalSlug = await generateUniquePostSlug(slug || title, initialPost?.id);

      const postData = {
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt.trim() || null,
        content: content || null,
        cover_image_url: coverImageUrl || null,
        category_id: categoryId || null,
        status,
        author_name: authorName.trim() || "Saaral Cosmetics",
      };

      if (isEdit && initialPost) {
        await updateBlogPost(initialPost.id, postData, initialPost.status);
      } else {
        await createBlogPost(postData);
      }

      router.push("/admin/blog");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to save blog post.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialPost) return;
    setDeleting(true);
    try {
      await deleteBlogPost(initialPost.id);
      router.push("/admin/blog");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to delete post.");
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-12">
      {errorMessage && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error font-body text-[14px] flex items-center justify-between">
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)}>
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Form & Editor) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title Card */}
          <div className="bg-surface border border-outline-variant/40 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">
                Post Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="e.g. 5 Secret Benefits of Butterfly Pea Flower for Radiant Skin"
                className="w-full px-4 py-3 rounded-xl border border-outline-variant/60 bg-surface text-on-surface text-[18px] font-display font-semibold focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">
                URL Slug *
              </label>
              <div className="flex items-center rounded-xl border border-outline-variant/60 bg-surface-container px-3 py-2 font-mono text-[13px] text-on-surface-variant">
                <span className="text-on-surface-variant/60 select-none">/blog/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="post-url-slug"
                  className="flex-1 bg-transparent text-on-surface focus:outline-none ml-1 font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Excerpt Card */}
          <div className="bg-surface border border-outline-variant/40 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">
                Post Excerpt (SEO Summary)
              </label>
              <span
                className={`text-[11px] font-mono font-medium ${
                  excerpt.length > 160 ? "text-error font-bold" : "text-on-surface-variant"
                }`}
              >
                {excerpt.length}/160 chars
              </span>
            </div>
            <textarea
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short summary displayed on post cards and SEO Google snippets..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/60 bg-surface text-on-surface text-[14px] leading-[1.5] focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Rich Text Content */}
          <div className="bg-surface border border-outline-variant/40 rounded-2xl p-5 shadow-sm space-y-3">
            <label className="block text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">
              Post Rich Content *
            </label>
            <BlogEditor content={content} onChange={setContent} />
          </div>
        </div>

        {/* Right Column (Publish Controls, Category, Cover Image) */}
        <div className="space-y-6">
          {/* Status & Save Actions */}
          <div className="bg-surface border border-outline-variant/40 rounded-2xl p-5 shadow-sm space-y-4 sticky top-6">
            <h3 className="font-display text-[16px] font-semibold text-primary pb-2 border-b border-outline-variant/30">
              Publishing Controls
            </h3>

            {/* Status Selector */}
            <div>
              <label className="block text-[12px] font-medium text-on-surface-variant uppercase tracking-wider mb-2">
                Post Status
              </label>
              <div className="flex rounded-xl bg-surface-container p-1 border border-outline-variant/30 text-[13px] font-medium">
                <button
                  type="button"
                  onClick={() => setStatus("draft")}
                  className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    status === "draft"
                      ? "bg-amber-100 text-amber-900 font-semibold shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Draft
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("published")}
                  className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    status === "published"
                      ? "bg-emerald-100 text-emerald-900 font-semibold shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Published
                </button>
              </div>
            </div>

            {/* Author */}
            <div>
              <label className="block text-[12px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">
                Author Name
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Saaral Cosmetics"
                className="w-full px-3.5 py-2 rounded-xl border border-outline-variant/60 bg-surface text-on-surface text-[14px] focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Category Dropdown with Inline Add */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">
                  Category
                </label>
                <button
                  type="button"
                  onClick={() => setAddCatModalOpen(true)}
                  className="text-[12px] text-primary hover:underline font-medium flex items-center gap-0.5"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  Add Category
                </button>
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/60 bg-surface text-on-surface text-[14px] focus:outline-none focus:border-primary transition-colors"
              >
                <option value="">-- Select Category --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Cover Image Upload */}
            <div>
              <label className="block text-[12px] font-medium text-on-surface-variant uppercase tracking-wider mb-2">
                Cover Image
              </label>
              {coverImageUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-outline-variant/40 aspect-video group">
                  <Image
                    src={coverImageUrl}
                    alt="Cover preview"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 300px"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="p-2 rounded-lg bg-white/90 text-on-surface hover:bg-white cursor-pointer transition-colors text-[13px] font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      Replace
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setCoverImageUrl("")}
                      className="p-2 rounded-lg bg-error/90 text-white hover:bg-error transition-colors text-[13px] font-medium flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-outline-variant/60 rounded-xl cursor-pointer hover:bg-surface-container-high hover:border-primary transition-all text-center">
                  {uploadingCover ? (
                    <div className="flex items-center gap-2 text-[13px] text-on-surface-variant font-medium">
                      <span className="material-symbols-outlined animate-spin text-[20px]">
                        progress_activity
                      </span>
                      Uploading cover...
                    </div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[32px] text-primary mb-1">
                        add_photo_alternate
                      </span>
                      <span className="text-[13px] font-medium text-on-surface">
                        Upload Cover Image
                      </span>
                      <span className="text-[11px] text-on-surface-variant">
                        High resolution landscape image recommended
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    disabled={uploadingCover}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-outline-variant/30 space-y-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-primary text-on-primary text-[14px] font-semibold hover:bg-primary-hover disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                {saving ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">
                      progress_activity
                    </span>
                    Saving Post...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">save</span>
                    {isEdit ? "Update Post" : "Save & Create Post"}
                  </>
                )}
              </button>

              {isEdit && (
                <button
                  type="button"
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="w-full py-2.5 rounded-xl border border-error/40 text-error hover:bg-error/10 text-[13px] font-medium transition-colors flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  Delete Post
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={addCatModalOpen}
        onClose={() => setAddCatModalOpen(false)}
        onCategoryAdded={handleCategoryAdded}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface border border-outline-variant/40 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-error">
              <span className="material-symbols-outlined text-[28px]">warning</span>
              <h3 className="font-display text-[18px] font-semibold">Delete Post?</h3>
            </div>
            <p className="text-[14px] text-on-surface-variant leading-[1.5]">
              Are you sure you want to permanently delete &quot;{title}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-lg border border-outline-variant/60 text-on-surface-variant text-[13px] font-medium hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-error text-white text-[13px] font-medium hover:bg-error/90 disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                {deleting && (
                  <span className="material-symbols-outlined animate-spin text-[16px]">
                    progress_activity
                  </span>
                )}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
