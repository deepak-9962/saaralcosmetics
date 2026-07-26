import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import GradientBackground from "@/components/layout/GradientBackground";
import BlogContentRenderer from "@/components/blog/BlogContentRenderer";
import { getBlogPostBySlug, listRelatedBlogPosts } from "@/lib/supabase/blog";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getBlogPostBySlug(resolvedParams.slug);

  if (!post) {
    return {
      title: "Article Not Found | Saaral Cosmetics",
    };
  }

  return {
    title: `${post.title} | Saaral Cosmetics Journal`,
    description: post.excerpt || `Read ${post.title} on Saaral Cosmetics. Discover natural skincare formulation secrets.`,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : [],
    },
  };
}

export default async function BlogPostDetailPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const post = await getBlogPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await listRelatedBlogPosts(post.id, 3);

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-on-background font-body relative overflow-x-hidden">
      <GradientBackground />
      <TopNavBar />

      <main className="flex-1 relative z-10 py-10 md:py-16">
        <article className="max-w-[1280px] mx-auto px-4 md:px-[72px] space-y-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 font-body text-[13px] text-on-surface-variant/80 border-b border-gold/10 pb-4">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-primary transition-colors">
              Blog
            </Link>
            <span>/</span>
            <span className="text-on-surface font-medium truncate max-w-xs md:max-w-md">
              {post.title}
            </span>
          </nav>

          {/* Article Header */}
          <header className="space-y-4 max-w-4xl">
            {post.blog_categories && (
              <span className="inline-flex px-3.5 py-1 rounded-full bg-gold/15 border border-gold/30 text-primary font-body text-[12px] font-semibold uppercase tracking-wider">
                {post.blog_categories.name}
              </span>
            )}

            <h1 className="font-display text-[32px] sm:text-[42px] md:text-[48px] leading-[1.15] font-bold text-primary">
              {post.title}
            </h1>

            <div className="flex items-center gap-3 text-[14px] text-on-surface-variant font-mono border-l-2 border-gold pl-3 py-0.5">
              <span>By {post.author_name}</span>
              {formattedDate && (
                <>
                  <span>•</span>
                  <span>{formattedDate}</span>
                </>
              )}
            </div>
          </header>

          {/* Cover Image */}
          {post.cover_image_url && (
            <div className="relative aspect-[21/9] w-full rounded-3xl overflow-hidden border border-gold/20 shadow-xl bg-surface-container">
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            </div>
          )}

          {/* Main Layout Grid: Content + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-4">
            {/* Main Article Body */}
            <div className="lg:col-span-8 space-y-6">
              {post.excerpt && (
                <div className="p-6 rounded-2xl bg-surface-container/60 border border-gold/20 italic text-[17px] leading-[1.6] text-primary/90">
                  &ldquo;{post.excerpt}&rdquo;
                </div>
              )}

              <BlogContentRenderer content={post.content} />
            </div>

            {/* Sidebar: Related Articles */}
            <aside className="lg:col-span-4 space-y-6 lg:border-l lg:border-gold/15 lg:pl-8">
              <div className="sticky top-28 space-y-6">
                <h3 className="font-display text-[20px] font-bold text-primary pb-3 border-b border-gold/15 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">auto_stories</span>
                  Related Articles
                </h3>

                {relatedPosts.length === 0 ? (
                  <p className="text-[13px] text-on-surface-variant">No other articles yet.</p>
                ) : (
                  <div className="space-y-4">
                    {relatedPosts.map((rel) => (
                      <Link
                        key={rel.id}
                        href={`/blog/${rel.slug}`}
                        className="group flex gap-3.5 p-3 rounded-2xl bg-surface border border-gold/10 hover:border-gold/40 hover:shadow-md transition-all"
                      >
                        {rel.cover_image_url ? (
                          <div className="w-20 h-20 rounded-xl overflow-hidden relative flex-shrink-0 bg-surface-container">
                            <Image
                              src={rel.cover_image_url}
                              alt={rel.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="80px"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-gold/10 flex items-center justify-center text-gold/40 flex-shrink-0">
                            <span className="material-symbols-outlined text-[24px]">article</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0 space-y-1">
                          {rel.blog_categories && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gold block">
                              {rel.blog_categories.name}
                            </span>
                          )}
                          <h4 className="font-display text-[14px] leading-[1.3] font-bold text-primary group-hover:text-secondary transition-colors line-clamp-2">
                            {rel.title}
                          </h4>
                          <span className="text-[11px] font-mono text-on-surface-variant block">
                            {rel.published_at
                              ? new Date(rel.published_at).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                })
                              : ""}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                <div className="pt-4">
                  <Link
                    href="/blog"
                    className="w-full py-3 rounded-xl border border-gold/30 bg-surface-container/50 text-primary text-[13px] font-semibold hover:bg-gold/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">grid_view</span>
                    Browse All Articles
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </article>
      </main>

      <Footer />
      <WhatsAppFAB />
      <MobileBottomNav />
    </div>
  );
}
