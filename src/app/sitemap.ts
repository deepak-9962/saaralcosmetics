import { MetadataRoute } from "next";
import { listProducts } from "@/lib/supabase/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://saaralcosmetics.com";

  // 1. Static Pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/wishlist`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  // 2. Dynamic Product Pages from Database
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await listProducts("all");
    productEntries = products.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: new Date(product.updated_at || new Date()),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Failed to generate dynamic product entries for sitemap:", error);
  }

  // 3. Dynamic Published Blog Post Pages
  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const { listPublishedBlogPosts } = await import("@/lib/supabase/blog");
    const blogPosts = await listPublishedBlogPosts();
    blogEntries = blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at || post.published_at || new Date()),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Failed to generate dynamic blog entries for sitemap:", error);
  }

  return [...staticPages, ...productEntries, ...blogEntries];
}

