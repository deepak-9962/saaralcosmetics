"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import GradientBackground from "@/components/layout/GradientBackground";
import ProductCard from "@/components/product/ProductCard";
import { listFeaturedProducts } from "@/lib/supabase/data";
import type { Product } from "@/lib/types";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

const heroWords = ["Pure.", "Natural.", "You."];

const categories = [
  { name: "Face Cream", image: "/images/cat-face-cream.webp", href: "/products?category=face-cream" },
  { name: "Face Wash", image: "/images/cat-face-wash.webp", href: "/products?category=face-wash" },
  { name: "Soap", image: "/images/cat-soap.webp", href: "/products?category=soap" },
  { name: "Nalangu Maavu", image: "/images/cat-nalangu-maavu.webp", href: "/products?category=nalangu-maavu" },
];

const trustSignals = [
  "100% Natural Ingredients",
  "Cruelty Free",
  "Ethically Sourced",
  "Handcrafted in India",
  "No Harmful Chemicals",
];

const ingredients = [
  { name: "Turmeric", note: "Ancient Healer", icon: "spa" },
  { name: "Rose", note: "Skin Brightener", icon: "local_florist" },
  { name: "Neem", note: "Anti-bacterial", icon: "eco" },
  { name: "Aloe Vera", note: "Deep Hydrator", icon: "water_drop" },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [productsError, setProductsError] = useState<string | null>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);

  useEffect(() => {
    async function loadFeaturedProducts() {
      try {
        const products = await listFeaturedProducts(3);
        setFeaturedProducts(products);
      } catch (error) {
        setProductsError(
          error instanceof Error ? error.message : "Failed to load featured products."
        );
      }
    }

    loadFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <GradientBackground />
      <TopNavBar />

      <main className="w-full flex-grow">
        {/* ================================
            HERO SECTION
            ================================ */}
        <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-surface-container-lowest">
          {/* Background Image */}
          <motion.div className="absolute inset-0 z-0 scale-110" style={{ y: heroY }}>
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8-bjDTc3Unc9zLxtNxCaE-V4cqQ_GJugaVdFZ7k4KFoHrMZfddDoI9SbnMmFVkUq5GcU29rU0VzWiHa0Zc6oSJCd4GOZ8lF6r1HYEmhwn_5HhPDr0MZacIUBhW-TCLT3JU5SLCvhhiSoamVRGF_gN2MJitxL5Zij1_MYVG0nStfey3fSV6TtXDNFAocfdkKtl_ZpwTp3aRHvH1uSmF9qVXDgU7LZhBZlOL7sqVPPZ0DlfI8dP-8jFoOETvCwKNYFT3WBtNGUCFsxo"
              alt="Saaral Cosmetics — Premium skincare setting"
              fill
              className="object-cover object-center"
              priority
              sizes="100vw"
            />
          </motion.div>

          {/* Frosted Glass Text Container */}
          <motion.div
            className="relative z-[2] text-center flex flex-col items-center mx-5 md:mx-0"
            style={{
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              background: "rgba(253, 250, 246, 0.45)",
              borderRadius: "16px",
              padding: "40px 48px",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            {/* Eyebrow: ——— APOTHECARY HERITAGE ——— */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div style={{ width: "32px", height: "1px", backgroundColor: "#C9A96E" }} />
              <span
                className="font-body uppercase"
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "0.25em",
                  color: "#C9A96E",
                }}
              >
                Apothecary Heritage
              </span>
              <div style={{ width: "32px", height: "1px", backgroundColor: "#C9A96E" }} />
            </div>

            {/* Headline — each word on its own line */}
            <h1
              className="font-display text-center"
              style={{
                fontSize: "clamp(42px, 6vw, 72px)",
                fontWeight: 400,
                color: "#1A1A1A",
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
              }}
            >
              {heroWords.map((word, i) => (
                <motion.span
                  key={word}
                  className="block font-display"
                  initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    duration: 0.7,
                    delay: 0.3 + i * 0.15,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            {/* Subtext */}
            <p
              className="font-body text-center mx-auto mt-6"
              style={{
                fontSize: "15px",
                lineHeight: 1.7,
                color: "#4A4A4A",
                maxWidth: "420px",
              }}
            >
              Rediscover the essence of ancient Indian rituals blended with
              modern dermatology. Crafted for a radiant, balanced complexion
              using ethically sourced botanicals.
            </p>

            {/* CTA Button */}
            <Link
              href="/products"
              className="mt-6 inline-flex items-center justify-center font-body uppercase transition-all"
              style={{
                background: "#C9A96E",
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.18em",
                padding: "16px 48px",
                borderRadius: "100px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#B8924F";
                e.currentTarget.style.transform = "scale(1.03)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(201,169,110,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#C9A96E";
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Shop Now
            </Link>
          </motion.div>

          {/* Scroll Indicator */}
          <div
            className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center z-[2]"
            style={{ opacity: 0.7, animation: "scroll-bounce 1.8s ease-in-out infinite" }}
          >
            <div style={{ width: "1px", height: "32px", backgroundColor: "#C9A96E" }} />
            <span
              className="material-symbols-outlined mt-1"
              style={{ fontSize: "16px", color: "#C9A96E" }}
            >
              keyboard_arrow_down
            </span>
          </div>
        </section>

        <section className="w-full bg-[#C9A96E]/10 border-y border-[#C9A96E]/20 py-3 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap gap-12">
            {[...trustSignals, ...trustSignals].map((signal, i) => (
              <span
                key={`${signal}-${i}`}
                className="font-body text-sm tracking-[0.18em] text-[#765b00] uppercase"
              >
                ✦ {signal}
              </span>
            ))}
          </div>
        </section>

        {/* ================================
            CATEGORY STRIP
            ================================ */}
        <section className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-[var(--spacing-stack-lg)] my-[var(--spacing-stack-lg)]">
          <motion.div
            className="flex flex-col items-center text-center mb-[var(--spacing-stack-lg)]"
            {...fadeInUp}
          >
            <h2 className="font-display text-[32px] leading-[1.3] text-on-surface">
              Curated Essentials
            </h2>
            <div className="w-12 h-px bg-outline-variant mt-[var(--spacing-stack-sm)]" />
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[var(--spacing-gutter)]">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
              >
                <Link
                  href={cat.href}
                  className="group block relative aspect-square rounded-2xl overflow-hidden bg-surface-container-low ambient-shadow-hover transition-all duration-300"
                >
                  <Image
                    src={cat.image}
                    alt={`${cat.name} category`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                  <div className="absolute inset-0 rounded-2xl border border-white/15 group-hover:border-[#C9A96E]/70 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="font-display text-white text-[24px] md:text-[28px] leading-[1.2]">
                      {cat.name}
                    </h3>
                    <div className="h-px bg-[#C9A96E] w-0 group-hover:w-full transition-all duration-500 mt-2" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ================================
            FEATURED PRODUCTS
            ================================ */}
        <section className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-[var(--spacing-stack-lg)] mb-[var(--spacing-stack-lg)]">
          <motion.div
            className="flex flex-col items-center text-center mb-[var(--spacing-stack-lg)]"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-tertiary-container mb-2 uppercase">
              The Ritual
            </span>
            <h2 className="font-display text-[32px] leading-[1.3] text-on-surface">
              Bestselling Formulations
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-gutter)]">
            {featuredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                showBadge={index === 0 ? "Bestseller" : index === 1 ? "Organic" : undefined}
              />
            ))}
          </div>
          {productsError && (
            <p className="mt-6 font-body text-[16px] leading-[1.6] text-error text-center">
              {productsError}
            </p>
          )}
        </section>

        <section className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-[var(--spacing-stack-lg)] mb-[var(--spacing-stack-lg)]">
          <motion.div
            className="flex flex-col items-center text-center mb-[var(--spacing-stack-md)]"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5 }}
          >
            <span className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-tertiary-container mb-2 uppercase">
              Botanical Actives
            </span>
            <h2 className="font-display text-[32px] leading-[1.3] text-on-surface">
              Ingredients With Ritual Memory
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[var(--spacing-gutter)]">
            {ingredients.map((ingredient, i) => (
              <motion.div
                key={ingredient.name}
                className="border border-outline-variant/40 bg-surface/70 backdrop-blur rounded-xl p-5 text-center ambient-shadow-sm"
                initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                <span className="material-symbols-outlined text-[#C9A96E] text-3xl mb-3">
                  {ingredient.icon}
                </span>
                <h3 className="font-display text-[24px] leading-[1.3] text-on-surface">
                  {ingredient.name}
                </h3>
                <p className="font-body text-[14px] leading-[1.6] text-on-surface-variant mt-1">
                  {ingredient.note}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ================================
            BRAND STORY
            ================================ */}
        <section className="w-full bg-surface-container-low py-[var(--spacing-stack-lg)] md:py-24 my-[var(--spacing-stack-lg)]">
          <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-gutter)] items-center">
            <motion.div
              className="relative w-full aspect-[4/3] md:aspect-square rounded-xl overflow-hidden ambient-shadow md:order-2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiIogpeqf76_gbzRe9Hinh27WCwhfgCqPT8rDerBzACK6CzamuNf1iSPL9GMgWDBr9yeBKhUyX7PgHtpNxD3IknPRubtP80xhUwaau-YNbHOCZeWi-n7rFKkrPtvMTHgC6OSlpw-EVMXcd5rKRLxNVHf19B9wN4nqSNtKNxRup49z0rgRj-Uq5u4Uwh0LuKOkkOrvJJopFzlwEsKLMqJrYR4VQdJ9yJBVuYoIlsy-RxPT3Jq_n3j9IEgTR4Jeo9pokvam8ynhaFdGw"
                alt="Raw botanical ingredients — rose petals, turmeric, fresh herbs"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Glassmorphism Badge */}
              <div className="absolute bottom-6 left-6 glass-panel p-6 rounded-xl border border-surface/50 max-w-[200px]">
                <span
                  className="material-symbols-outlined text-tertiary-container text-3xl mb-2"
                  style={{ fontVariationSettings: "'wght' 300" }}
                >
                  eco
                </span>
                <p className="font-body text-[16px] leading-[1.6] text-on-surface font-medium leading-tight">
                  100% Ethically Sourced Ingredients
                </p>
              </div>
            </motion.div>
            <motion.div
              className="flex flex-col justify-center pr-0 md:pr-12 md:order-1 mt-[var(--spacing-stack-md)] md:mt-0"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-tertiary-container mb-[var(--spacing-stack-sm)] uppercase">
                Our Heritage
              </span>
              <h2 className="font-display text-[32px] leading-[1.3] text-on-surface mb-[var(--spacing-stack-md)]">
                Rooted in Tradition. Refined for Today.
              </h2>
              <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant mb-6">
                At Saaral Cosmetics, we believe true luxury lies in simplicity
                and authenticity. Our formulations are deeply rooted in ancient
                Indian apothecary rituals, utilizing potent, unrefined
                botanicals that have nourished skin for generations.
              </p>
              <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant mb-[var(--spacing-stack-md)]">
                Every jar and bottle is a testament to our commitment to natural
                purity, blending heritage wisdom with contemporary
                dermatological science to bring you a skincare ritual that is as
                effective as it is meditative.
              </p>
              <div>
                <Link
                  href="/contact"
                  className="inline-block bg-transparent border border-on-surface text-on-surface font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium uppercase px-8 py-3 rounded-full hover:bg-on-surface hover:text-surface transition-all duration-300"
                >
                  Discover Our Story
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
