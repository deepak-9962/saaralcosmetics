import { getSupabaseBrowserClient } from "./client";
import type {
  BlogCategory,
  BlogPost,
  BlogPostInput,
  BlogPostWithCategory,
  BlogPostStatus,
} from "@/lib/types";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Check slug uniqueness against blog_posts, appending -2, -3 if collision found */
export async function generateUniquePostSlug(title: string, currentPostId?: string): Promise<string> {
  const baseSlug = slugify(title) || "post";
  const supabase = getSupabaseBrowserClient();

  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    let query = supabase.from("blog_posts").select("id").eq("slug", candidate);
    if (currentPostId) {
      query = query.neq("id", currentPostId);
    }
    const { data } = await query.maybeSingle();
    if (!data) {
      return candidate;
    }
    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
}

/** List all blog categories */
export async function listBlogCategories(): Promise<BlogCategory[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("blog_categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error listing blog categories:", error.message || error);
    return [];
  }
  return data as BlogCategory[];
}

/** Create a new category */
export async function createBlogCategory(name: string, customSlug?: string): Promise<BlogCategory | null> {
  const supabase = getSupabaseBrowserClient();
  const slug = customSlug ? slugify(customSlug) : slugify(name);
  const { data, error } = await supabase
    .from("blog_categories")
    .insert({ name: name.trim(), slug })
    .select()
    .single();

  if (error) {
    console.error("Error creating blog category:", error.message || error);
    throw error;
  }
  return data as BlogCategory;
}

/** List posts for Admin table with optional status filter */
export async function listAdminBlogPosts(statusFilter: "all" | BlogPostStatus = "all"): Promise<BlogPostWithCategory[]> {
  const supabase = getSupabaseBrowserClient();
  let query = supabase
    .from("blog_posts")
    .select("*, blog_categories(*)")
    .order("created_at", { ascending: false });

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error listing admin blog posts:", error.message || error);
    return [];
  }
  return data as BlogPostWithCategory[];
}

/** Get post by ID (for edit form) */
export async function getBlogPostById(id: string): Promise<BlogPostWithCategory | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, blog_categories(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching blog post by id:", error);
    return null;
  }
  return data as BlogPostWithCategory | null;
}

/** Get published post by slug (for public post page) */
export async function getBlogPostBySlug(slug: string): Promise<BlogPostWithCategory | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, blog_categories(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("Error fetching blog post by slug:", error);
    return null;
  }
  return data as BlogPostWithCategory | null;
}

/** List published blog posts for public listing page with optional category slug filter */
export async function listPublishedBlogPosts(categorySlug?: string): Promise<BlogPostWithCategory[]> {
  const supabase = getSupabaseBrowserClient();
  let query = supabase
    .from("blog_posts")
    .select("*, blog_categories(*)")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (categorySlug && categorySlug !== "all") {
    // Need category ID from slug
    const { data: category } = await supabase
      .from("blog_categories")
      .select("id")
      .eq("slug", categorySlug)
      .maybeSingle();

    if (category) {
      query = query.eq("category_id", category.id);
    }
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error listing published blog posts:", error);
    return [];
  }
  return data as BlogPostWithCategory[];
}

/** Get related published articles excluding current post */
export async function listRelatedBlogPosts(currentPostId: string, limit = 3): Promise<BlogPostWithCategory[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, blog_categories(*)")
    .eq("status", "published")
    .neq("id", currentPostId)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching related posts:", error);
    return [];
  }
  return data as BlogPostWithCategory[];
}

/** Create a new blog post */
export async function createBlogPost(input: BlogPostInput): Promise<BlogPost> {
  const supabase = getSupabaseBrowserClient();
  const publishedAt = input.status === "published" ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      title: input.title.trim(),
      slug: input.slug.trim(),
      excerpt: input.excerpt || null,
      content: input.content || null,
      cover_image_url: input.cover_image_url || null,
      category_id: input.category_id || null,
      status: input.status,
      author_name: input.author_name || "Saaral Cosmetics",
      published_at: publishedAt,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating blog post:", error);
    throw error;
  }
  return data as BlogPost;
}

/** Update an existing blog post */
export async function updateBlogPost(id: string, input: Partial<BlogPostInput>, existingStatus?: BlogPostStatus): Promise<BlogPost> {
  const supabase = getSupabaseBrowserClient();
  
  const updatePayload: any = { ...input };

  if (input.status && input.status !== existingStatus) {
    if (input.status === "published") {
      updatePayload.published_at = new Date().toISOString();
    } else {
      updatePayload.published_at = null;
    }
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .update(updatePayload as any)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating blog post:", error);
    throw error;
  }
  return data as BlogPost;
}

/** Delete a blog post */
export async function deleteBlogPost(id: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) {
    console.error("Error deleting blog post:", error);
    throw error;
  }
  return true;
}

/** Upload image to Supabase blog-images bucket */
export async function uploadBlogImage(file: File): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `posts/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("blog-images")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (uploadError) {
    console.error("Error uploading blog image:", uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage.from("blog-images").getPublicUrl(filePath);
  return data.publicUrl;
}
