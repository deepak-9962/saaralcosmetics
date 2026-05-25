import type { Metadata } from "next";
import Link from "next/link";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import GradientBackground from "@/components/layout/GradientBackground";
import ProductCard from "@/components/product/ProductCard";
import ProductInteractivePanel from "@/components/product/ProductInteractivePanel";
import { getProductBySlug, getProductVariants, listRelatedProducts } from "@/lib/supabase/data";
import { Product } from "@/lib/types";

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
  let error = null;

  try {
    product = await getProductBySlug(slug);

    if (product) {
      // Fetch siblings under the same core product name for variant sizes
      variants = await getProductVariants(product.name);
      relatedProducts = await listRelatedProducts(slug, product.category);
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

  return (
    <div className="min-h-[100dvh] flex flex-col grain-overlay">
      <GradientBackground />
      <TopNavBar />

      <main className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-10 md:py-[var(--spacing-stack-lg)] pb-24 md:pb-[var(--spacing-stack-lg)] flex-grow">
        {/* Breadcrumbs */}
        <div className="mb-[var(--spacing-stack-md)] flex flex-wrap items-center gap-2 font-body text-[11px] md:text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link href="/products" className="hover:text-primary transition-colors">
            Shop
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface truncate max-w-[180px] md:max-w-none">{product.name}</span>
        </div>

        {/* Interactive Gallery & Details Section (Hydrated Client Leaf component) */}
        <ProductInteractivePanel initialProduct={product} variants={variants} />

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
