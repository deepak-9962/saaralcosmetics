import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/layout/Providers";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Saaral Cosmetics | Apothecary Heritage",
  description:
    "Rediscover the essence of ancient Indian rituals blended with modern dermatology. Crafted for a radiant, balanced complexion using ethically sourced botanicals.",
  keywords: [
    "saaral cosmetics",
    "natural skincare",
    "apothecary",
    "botanical",
    "face cream",
    "face wash",
    "soap",
    "nalangu maavu",
    "indian skincare",
  ],
  openGraph: {
    title: "Saaral Cosmetics | Pure. Natural. You.",
    description:
      "Premium natural skincare rooted in ancient Indian apothecary heritage.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="only light" />
        {/* Material Symbols Outlined */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${playfairDisplay.variable} ${dmSans.variable} font-body text-on-surface antialiased min-h-[100dvh]`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}


