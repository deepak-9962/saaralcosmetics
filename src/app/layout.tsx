import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/layout/Providers";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://saaralcosmetics.com"
  ),
  title: "Saaral Cosmetics | Natural Herbal Skincare & Beauty Products",
  description:
    "Handcrafted 100% natural herbal skincare products in India. Shop organic soaps, face wash, foot repair balm, skin creams & traditional beauty rituals.",
  keywords: [
    "saaral cosmetics",
    "natural skincare",
    "herbal face wash",
    "organic handmade soap",
    "foot repair balm",
    "nalangu maavu",
    "anti aging skin cream",
    "herbal beauty products",
    "ayurvedic skincare india",
  ],
  alternates: {
    canonical: "https://saaralcosmetics.com",
  },
  openGraph: {
    title: "Saaral Cosmetics | Natural Herbal Skincare & Beauty Products",
    description:
      "Handcrafted 100% natural herbal skincare products in India. Shop organic soaps, face wash, foot repair balm & skin creams.",
    url: "https://saaralcosmetics.com",
    siteName: "Saaral Cosmetics",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Saaral Cosmetics | Natural Herbal Skincare & Beauty Products",
    description:
      "Handcrafted 100% natural herbal skincare products in India. Shop organic soaps, face wash & foot repair balm.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <meta name="color-scheme" content="only light" />
        {/* Schema.org JSON-LD Structured Data for Google SERP Rich Results & Sitelinks */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://saaralcosmetics.com/#organization",
                  "name": "Saaral Cosmetics",
                  "url": "https://saaralcosmetics.com",
                  "logo": "https://saaralcosmetics.com/images/explore-best-sellers.avif",
                  "description": "Handcrafted 100% natural herbal skincare products rooted in traditional apothecary heritage.",
                  "sameAs": [
                    "https://www.instagram.com/saaralcosmetics",
                    "https://www.facebook.com/saaralcosmetics"
                  ]
                },
                {
                  "@type": "WebSite",
                  "@id": "https://saaralcosmetics.com/#website",
                  "url": "https://saaralcosmetics.com",
                  "name": "Saaral Cosmetics",
                  "publisher": {
                    "@id": "https://saaralcosmetics.com/#organization"
                  },
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://saaralcosmetics.com/products?search={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "SiteNavigationElement",
                  "name": ["Handcrafted Soaps", "Herbal Face Wash", "Foot Repair Balm", "Skin Creams", "About Us"],
                  "url": [
                    "https://saaralcosmetics.com/products?category=soap",
                    "https://saaralcosmetics.com/products?category=face-wash",
                    "https://saaralcosmetics.com/products?category=foot-care",
                    "https://saaralcosmetics.com/products?category=face-cream",
                    "https://saaralcosmetics.com/contact"
                  ]
                }
              ]
            }),
          }}
        />
        {/* Hero image preloads — browser fetches before JS executes, fixing NO_LCP */}
        {/* Mobile hero (below 768px) */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="preload"
          as="image"
          href="/images/hero-mobile.avif"
          type="image/avif"
          media="(max-width: 767px)"
        />
        <link
          rel="preload"
          as="image"
          href="/images/hero-mobile.webp"
          type="image/webp"
          media="(max-width: 767px)"
        />
        {/* Desktop hero carousel slide 1 (768px and above) */}
        <link
          rel="preload"
          as="image"
          href="/images/slide1.avif"
          type="image/avif"
          media="(min-width: 768px)"
        />
        {/* Mobile LCP element — category image (first in scroll) */}
        <link
          rel="preload"
          as="image"
          href="/images/cat-face-cream.avif"
          type="image/avif"
          media="(max-width: 767px)"
        />
        {/* Google Fonts preconnect — eliminates DNS/TCP latency */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          id="material-symbols"
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          media="print"
          suppressHydrationWarning
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var link = document.getElementById('material-symbols');
                if (link) {
                  link.onload = function() { this.media = 'all'; };
                  if (link.sheet) link.media = 'all';
                }
              } catch (e) {}
            `
          }}
        />
        {/* noscript fallback — icons visible even without JS */}
        <noscript>
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          />
        </noscript>
      </head>
      <body
        className={`${playfairDisplay.variable} ${inter.variable} font-body text-on-surface antialiased min-h-[100dvh]`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}


