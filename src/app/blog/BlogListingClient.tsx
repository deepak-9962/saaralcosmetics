"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import BlogCardSkeleton from "@/components/blog/BlogCardSkeleton";
import { listPublishedBlogPosts } from "@/lib/supabase/blog";
import type { BlogCategory, BlogPostWithCategory } from "@/lib/types";

interface BlogListingClientProps {
  categories: BlogCategory[];
  initialPosts: BlogPostWithCategory[];
}

export default function BlogListingClient({
  categories,
  initialPosts,
}: BlogListingClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [posts, setPosts] = useState<BlogPostWithCategory[]>(initialPosts);
  const [isPending, startTransition] = useTransition();

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    startTransition(async () => {
      const filtered = await listPublishedBlogPosts(slug);
      setPosts(filtered);
    });
  };

  return (
    <section className="max-w-[1280px] mx-auto px-4 md:px-[72px] py-10 md:py-16 space-y-10">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-gold/15">
        <button
          type="button"
          onClick={() => handleCategoryChange("all")}
          className={`px-5 py-2 rounded-full text-[13px] sm:text-[14px] font-medium transition-all whitespace-nowrap ${
            selectedCategory === "all"
              ? "bg-primary text-on-primary shadow-md font-semibold"
              : "bg-surface-container/60 text-on-surface-variant hover:bg-surface-container hover:text-on-surface border border-gold/10"
          }`}
        >
          All Articles ({initialPosts.length})
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleCategoryChange(cat.slug)}
            className={`px-5 py-2 rounded-full text-[13px] sm:text-[14px] font-medium transition-all whitespace-nowrap ${
              selectedCategory === cat.slug
                ? "bg-primary text-on-primary shadow-md font-semibold"
                : "bg-surface-container/60 text-on-surface-variant hover:bg-surface-container hover:text-on-surface border border-gold/10"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid of Post Cards */}
      {isPending ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[...Array(6)].map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-surface/40 border border-gold/15 rounded-3xl p-8 max-w-lg mx-auto">
          <span className="material-symbols-outlined text-[48px] text-gold/40">auto_stories</span>
          <h3 className="font-display text-[20px] font-bold text-primary">No Articles Found</h3>
          <p className="font-body text-[14px] text-on-surface-variant">
            There are no articles published in this category yet. Please check back soon!
          </p>
          <button
            type="button"
            onClick={() => handleCategoryChange("all")}
            className="mt-2 inline-flex px-4 py-2 rounded-xl bg-primary text-on-primary text-[13px] font-medium"
          >
            View All Articles
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {posts.map((post) => {
            const formattedDate = post.published_at
              ? new Date(post.published_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "";

            return (
              <article
                key={post.id}
                className="group flex flex-col bg-surface border border-gold/15 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-gold/40 transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Cover Image */}
                <Link href={`/blog/${post.slug}`} className="relative aspect-[16/10] overflow-hidden bg-surface-container">
                  {post.cover_image_url ? (
                    <Image
                      src={post.cover_image_url}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 text-primary/30">
                      <span className="material-symbols-outlined text-[48px]">menu_book</span>
                    </div>
                  )}

                  {post.blog_categories && (
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-surface/90 backdrop-blur-md text-primary font-body text-[11px] font-semibold uppercase tracking-wider border border-gold/20 shadow-sm">
                      {post.blog_categories.name}
                    </span>
                  )}
                </Link>

                {/* Post Info */}
                <div className="p-6 flex flex-col flex-1 space-y-3">
                  <div className="flex items-center gap-2 text-[12px] text-on-surface-variant font-mono">
                    <span>{formattedDate}</span>
                    <span>•</span>
                    <span>By {post.author_name}</span>
                  </div>

                  <h2 className="font-display text-[19px] leading-[1.3] font-bold text-primary group-hover:text-secondary transition-colors line-clamp-2">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>

                  {post.excerpt && (
                    <p className="font-body text-[14px] leading-[1.6] text-on-surface-variant line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="pt-4 mt-auto border-t border-gold/10 flex items-center justify-between">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 font-body text-[13px] font-semibold text-primary group-hover:text-secondary transition-colors"
                    >
                      Read Article
                      <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
