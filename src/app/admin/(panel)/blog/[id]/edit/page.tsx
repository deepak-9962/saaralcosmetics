"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlogPostForm from "@/components/admin/blog/BlogPostForm";
import { getBlogPostById } from "@/lib/supabase/blog";
import type { BlogPostWithCategory } from "@/lib/types";

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [post, setPost] = useState<BlogPostWithCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadPost() {
      setLoading(true);
      const data = await getBlogPostById(resolvedParams.id);
      if (!data) {
        setError(true);
      } else {
        setPost(data);
      }
      setLoading(false);
    }
    loadPost();
  }, [resolvedParams.id]);

  if (error) {
    return notFound();
  }

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-3">
        <span className="material-symbols-outlined animate-spin text-[32px] text-primary">
          progress_activity
        </span>
        <p className="font-body text-[14px] text-on-surface-variant">Loading article data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* Header & Breadcrumb */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 font-body text-[13px] text-on-surface-variant">
          <Link href="/admin/blog" className="hover:text-primary transition-colors">
            Blog
          </Link>
          <span>/</span>
          <span className="text-on-surface font-medium truncate max-w-xs">{post?.title}</span>
          <span>/</span>
          <span>Edit</span>
        </div>
        <h1 className="font-display text-[28px] md:text-[32px] font-bold text-primary">
          Edit Article
        </h1>
      </div>

      {post && <BlogPostForm initialPost={post} isEdit={true} />}
    </div>
  );
}
