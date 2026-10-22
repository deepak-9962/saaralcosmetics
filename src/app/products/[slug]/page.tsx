import type { Metadata } from "next";
import Link from "next/link";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import GradientBackground from "@/components/layout/GradientBackground";
import ProductCard from "@/components/product/ProductCard";
import ProductInteractivePanel from "@/components/product/ProductInteractivePanel";
import ProductReviewsSection from "@/components/product/ProductReviewsSection";
import {
  getProductBySlug,
  getProductVariants,
  listRelatedProducts,
  getProductReviewSummary,
  listProductReviews,
} from "@/lib/supabase/data";
import { Product, ProductReview, ProductReviewSummary } from "@/lib/types";

interface Props {
  params: Promise<{ slug: string }>;
}

// ─────────────────────────────────────────────
// SEO BEST PRACTICES — Dynamic Metadata Tags
// ─────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    if (!product) {
      return {
        title: "Product Not Found | Saaral Cosmetics",
        description: "Explore our collection of natural, premium skincare formulations.",
      };
    }

    const categoryLabel = product.category
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    return {
      title: `${product.name} | ${categoryLabel} | Saaral Cosmetics`,
      description: product.description || `Discover ${product.name} at Saaral Cosmetics. Ancient Indian apothecary heritage blended with modern dermatology.`,
      openGraph: {
        title: `${product.name} | Saaral Cosmetics`,
        description: product.description || `Rediscover radiant skin with ${product.name}.`,
        images: product.images[0] ? [{ url: product.images[0] }] : [],
      },
    };
  } catch {
    return {
      title: "Saaral Cosmetics | Premium Skincare",
    };
  }
}

// ─────────────────────────────────────────────
// MAIN PAGE (Server Component)
// ─────────────────────────────────────────────
export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  let product: Product | null = null;
  let variants: Product[] = [];
  let relatedProducts: Product[] = [];
  let initialReviewSummary: ProductReviewSummary | null = null;
  let initialReviews: ProductReview[] = [];
  let error = null;

  try {
    product = await getProductBySlug(slug);

    if (product) {
      // Fetch variants, related products, and reviews in parallel
      const [vars, related, reviewSum, reviewList] = await Promise.all([
        getProductVariants(product.name),
        listRelatedProducts(slug, product.category),
        getProductReviewSummary(product.id).catch(() => null),
        listProductReviews(product.id, { limit: 6, sort: "recent" }).catch(() => ({ reviews: [], total: 0 })),
      ]);
      variants = vars;
      relatedProducts = related;
      initialReviewSummary = reviewSum;
      initialReviews = reviewList.reviews;
    } else {
      error = "Product not found.";
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load product data.";
  }

  if (error || !product) {
    return (
      <div className="min-h-[100dvh] flex flex-col grain-overlay">
        <GradientBackground />
        <TopNavBar />
        <main className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-[var(--spacing-stack-lg)] flex-grow">
          <h1 className="font-display text-[32px] leading-[1.3] text-on-surface">
            {error || "Product not found"}
          </h1>
          <Link
            href="/products"
            className="mt-6 inline-flex border border-on-surface text-on-surface px-6 py-2.5 rounded-full font-body text-[14px]"
          >
            Back to Products
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://saaralcosmetics.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "name": product.name,
        "image": product.images,
        "description": product.description || `${product.name} handcrafted natural herbal skincare product.`,
        "brand": {
          "@type": "Brand",
          "name": "Saaral Cosmetics"
        },
        ...(initialReviewSummary && initialReviewSummary.total_reviews > 0
          ? {
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": initialReviewSummary.average_rating,
                "reviewCount": initialReviewSummary.total_reviews,
                "bestRating": "5",
                "worstRating": "1"
              }
            }
          : {}),
        "offers": {
          "@type": "Offer",
          "url": `${baseUrl}/products/${product.slug}`,
          "priceCurrency": "INR",
          "price": product.price,
          "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "Organization",
            "name": "Saaral Cosmetics"
          }
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Products",
            "item": `${baseUrl}/products`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": product.name,
            "item": `${baseUrl}/products/${product.slug}`
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-[100dvh] flex flex-col grain-overlay">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GradientBackground />
      <TopNavBar />

      <main className="max-w-[var(--spacing-container-max)] mx-auto px-3.5 sm:px-5 md:px-[var(--spacing-margin-desktop)] py-4 sm:py-6 md:py-8 pb-24 md:pb-16 flex-grow">
        {/* Breadcrumbs — sitting elegantly above the unified white card */}
        <nav
          aria-label="Breadcrumb"
          className="mb-3.5 sm:mb-5 flex flex-wrap items-center gap-1.5 sm:gap-2 font-body text-[11px] sm:text-[12px] leading-[1.0] tracking-[0.06em] font-medium text-on-surface-variant/80"
        >
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span className="material-symbols-outlined text-[13px] opacity-50 select-none">chevron_right</span>
          <Link href="/products" className="hover:text-primary transition-colors">
            Shop
          </Link>
          <span className="material-symbols-outlined text-[13px] opacity-50 select-none">chevron_right</span>
          <Link
            href={`/products?category=${product.category}`}
            className="hover:text-primary capitalize transition-colors"
          >
            {product.category.replace(/-/g, " ")}
          </Link>
          <span className="material-symbols-outlined text-[13px] opacity-50 select-none">chevron_right</span>
          <span className="text-on-surface font-semibold truncate max-w-[150px] sm:max-w-xs md:max-w-none">
            {product.name}
          </span>
        </nav>

        {/* Interactive Gallery & Details Section (Hydrated Client Leaf component) */}
        <ProductInteractivePanel initialProduct={product} variants={variants} />

        {/* Customer Reviews & Ratings Section */}
        <ProductReviewsSection
          product={product}
          initialSummary={initialReviewSummary}
          initialReviews={initialReviews}
        />

        {/* Related Products Grid (Server-side rendered) */}
        {relatedProducts.length > 0 && (
          <section className="mt-[var(--spacing-stack-lg)] pt-[var(--spacing-stack-lg)] border-t border-outline-variant/50">
            <h2 className="font-display text-[22px] md:text-[24px] leading-[1.4] text-on-surface mb-[var(--spacing-stack-md)] text-center">
              Complete Your Ritual
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((relatedProduct, i) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} index={i} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
      <WhatsAppFAB />
    </div>
  );
}
