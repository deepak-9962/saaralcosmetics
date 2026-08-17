import type { Metadata } from "next";
import AboutUsPage from "@/app/about/page";

export const metadata: Metadata = {
  title: "About Us & Concierge Support | Saaral Cosmetics",
  description:
    "Discover the heritage and story of Saaral Cosmetics, and connect directly with our herbal skincare concierge.",
};

export default function ContactPage() {
  return <AboutUsPage />;
}

