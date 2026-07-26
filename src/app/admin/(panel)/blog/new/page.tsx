import Link from "next/link";
import BlogPostForm from "@/components/admin/blog/BlogPostForm";

export const metadata = {
  title: "Create New Blog Post | Saaral Admin",
};

export default function CreateBlogPostPage() {
  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* Header & Breadcrumb */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 font-body text-[13px] text-on-surface-variant">
          <Link href="/admin/blog" className="hover:text-primary transition-colors">
            Blog
          </Link>
          <span>/</span>
          <span className="text-on-surface font-medium">New Post</span>
        </div>
        <h1 className="font-display text-[28px] md:text-[32px] font-bold text-primary">
          Create New Article
        </h1>
      </div>

      <BlogPostForm isEdit={false} />
    </div>
  );
}
