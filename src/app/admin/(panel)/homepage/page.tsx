"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import HeroSlidesManager from "@/components/admin/homepage/HeroSlidesManager";
import PromoCardsManager from "@/components/admin/homepage/PromoCardsManager";
import CategoryCardsManager from "@/components/admin/homepage/CategoryCardsManager";
import CombosManager from "@/components/admin/homepage/CombosManager";
import TransformationsManager from "@/components/admin/homepage/TransformationsManager";
import TestimonialsManager from "@/components/admin/homepage/TestimonialsManager";

function HomepageAdminTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("tab") || "hero";

  const handleTabChange = (tab: string) => {
    router.push(`/admin/homepage?tab=${tab}`);
  };

  const tabs = [
    { id: "hero", label: "Hero Slides", icon: "view_carousel" },
    { id: "promo_cards", label: "Promo Cards (4-Grid)", icon: "grid_view" },
    { id: "categories", label: "Shop by Category", icon: "category" },
    { id: "combos", label: "Combos", icon: "auto_awesome_motion" },
    { id: "transformations", label: "Transformations", icon: "compare" },
    { id: "testimonials", label: "Testimonials", icon: "format_quote" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-display text-[28px] md:text-[34px] font-bold text-on-surface leading-tight">
          Homepage Management
        </h1>
        <p className="font-body text-[14px] text-on-surface-variant mt-1">
          Customize the hero banners, 4 quick promo cards, categories, combos, transformations, and testimonials displayed on the homepage.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/40 pb-px overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-body text-[13px] font-semibold transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {currentTab === "hero" && <HeroSlidesManager />}
        {currentTab === "promo_cards" && <PromoCardsManager />}
        {currentTab === "categories" && <CategoryCardsManager />}
        {currentTab === "combos" && <CombosManager />}
        {currentTab === "transformations" && <TransformationsManager />}
        {currentTab === "testimonials" && <TestimonialsManager />}
      </div>
    </div>
  );
}

export default function HomepageAdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading Homepage Management...</div>}>
      <HomepageAdminTabs />
    </Suspense>
  );
}
