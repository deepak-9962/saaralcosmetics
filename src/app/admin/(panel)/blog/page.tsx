"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { listAdminBlogPosts, deleteBlogPost } from "@/lib/supabase/blog";
import type { BlogPostWithCategory, BlogPostStatus } from "@/lib/types";

export default function AdminBlogListPage() {
  const [posts, setPosts] = useState<BlogPostWithCategory[]>([]);
  const [filter, setFilter] = useState<"all" | BlogPostStatus>("all");
  const [loading, setLoading] = useState(true);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    const data = await listAdminBlogPosts(filter);
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const handleDeleteConfirm = async () => {
    if (!deletePostId) return;
    setDeleting(true);
    try {
      await deleteBlogPost(deletePostId);
      setDeletePostId(null);
      await fetchPosts();
    } catch (err) {
      console.error("Failed to delete post:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] md:text-[32px] font-bold text-primary">
            Blog Management
          </h1>
          <p className="font-body text-[14px] text-on-surface-variant">
            Create, edit, and publish blog articles & product stories.
          </p>
        </div>

        <Link
          href="/admin/blog/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-body text-[14px] font-semibold hover:bg-primary-hover shadow-md transition-all self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Post
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 border-b border-outline-variant/40 pb-3 font-body text-[14px]">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-xl transition-all font-medium ${
            filter === "all"
              ? "bg-primary-container text-on-primary-container shadow-sm font-semibold"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          All Posts ({posts.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("draft")}
          className={`px-4 py-2 rounded-xl transition-all font-medium flex items-center gap-1.5 ${
            filter === "draft"
              ? "bg-amber-100 text-amber-900 shadow-sm font-semibold"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Drafts
        </button>
        <button
          type="button"
          onClick={() => setFilter("published")}
          className={`px-4 py-2 rounded-xl transition-all font-medium flex items-center gap-1.5 ${
            filter === "published"
              ? "bg-emerald-100 text-emerald-900 shadow-sm font-semibold"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Published
        </button>
      </div>

      {/* Posts Table */}
      <div className="bg-surface border border-outline-variant/40 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined animate-spin text-[32px] text-primary">
              progress_activity
            </span>
            <p className="font-body text-[14px] text-on-surface-variant">Loading blog posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40">
              article
            </span>
            <h3 className="font-display text-[18px] font-semibold text-primary">No Blog Posts Found</h3>
            <p className="font-body text-[14px] text-on-surface-variant max-w-md mx-auto">
              {filter === "all"
                ? "You haven't created any blog posts yet. Click 'New Post' above to create your first article!"
                : `No posts found with status '${filter}'.`}
            </p>
            {filter === "all" && (
              <Link
                href="/admin/blog/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary text-[13px] font-medium hover:bg-primary-hover transition-colors"
              >
                Create First Post
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-[14px]">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant/30 text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">
                  <th className="px-6 py-3.5">Post</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-surface-container-high/50 transition-colors">
                    {/* Title & Cover */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {post.cover_image_url ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden relative flex-shrink-0 border border-outline-variant/30 bg-surface-container">
                            <Image
                              src={post.cover_image_url}
                              alt={post.title}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-surface-container text-on-surface-variant/50 flex-shrink-0">
                            <span className="material-symbols-outlined text-[20px]">image</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            href={`/admin/blog/${post.id}/edit`}
                            className="font-display text-[15px] font-semibold text-on-surface hover:text-primary transition-colors line-clamp-1"
                          >
                            {post.title}
                          </Link>
                          <span className="font-mono text-[11px] text-on-surface-variant/80 block truncate">
                            /blog/{post.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      {post.blog_categories ? (
                        <span className="inline-flex px-2.5 py-1 rounded-full bg-primary-container/60 text-on-primary-container text-[12px] font-medium">
                          {post.blog_categories.name}
                        </span>
                      ) : (
                        <span className="text-[12px] text-on-surface-variant italic">
                          Uncategorized
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      {post.status === "published" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[12px] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[12px] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Draft
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-[13px] text-on-surface-variant whitespace-nowrap">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : new Date(post.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {post.status === "published" && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
                            title="View Public Post"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </Link>
                        )}
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          className="p-2 rounded-lg text-primary hover:bg-primary-container/40 transition-colors"
                          title="Edit Post"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeletePostId(post.id)}
                          className="p-2 rounded-lg text-error hover:bg-error/10 transition-colors"
                          title="Delete Post"
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
        )}
      </div>

      {/* Quick Delete Modal */}
      {deletePostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface border border-outline-variant/40 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-error">
              <span className="material-symbols-outlined text-[28px]">warning</span>
              <h3 className="font-display text-[18px] font-semibold">Delete Post?</h3>
            </div>
            <p className="text-[14px] text-on-surface-variant leading-[1.5]">
              Are you sure you want to delete this blog post? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletePostId(null)}
                className="px-4 py-2 rounded-lg border border-outline-variant/60 text-on-surface-variant text-[13px] font-medium hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
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
    </div>
  );
}
