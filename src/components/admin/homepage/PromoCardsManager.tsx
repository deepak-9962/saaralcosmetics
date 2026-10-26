"use client";

import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import DestinationSelector, { type DestinationValue } from "./DestinationSelector";
import {
  listHomepagePromoCards,
  createHomepagePromoCard,
  updateHomepagePromoCard,
  deleteHomepagePromoCard,
  reorderHomepagePromoCards,
  resetHomepagePromoCardsToDefault,
  DEFAULT_HOMEPAGE_PROMO_CARDS,
} from "@/lib/supabase/data";
import type { HomepagePromoCard, HomepagePromoCardInput, BotanicalAccentType } from "@/lib/types";

const PRESET_COLOR_PALETTES = [
  { label: "Chamomile Gold", bg: "#F0E8CC", accent: "#8B6A3A" },
  { label: "Blush Rose", bg: "#F5E0E8", accent: "#8B3A5E" },
  { label: "Herbal Mint", bg: "#D8EDE0", accent: "#2E6640" },
  { label: "Lavender Dream", bg: "#E4DAEF", accent: "#5A3A8A" },
  { label: "Warm Peach", bg: "#F9E9E0", accent: "#9C5B42" },
  { label: "Sky Aqua", bg: "#DDF0F7", accent: "#326B88" },
  { label: "Almond Cream", bg: "#F6EFE6", accent: "#7D5D3B" },
  { label: "Golden Honey", bg: "#FBE9CE", accent: "#8A5E28" },
];

const PRESET_DESTINATIONS = [
  {
    label: "New Launches (Newest First)",
    url: "/products?collection=new-launches&sort=newest#catalog",
    type: "custom" as const,
  },
  {
    label: "BestSellers Under ₹499",
    url: "/products?collection=bestsellers&max_price=499#catalog",
    type: "custom" as const,
  },
  {
    label: "Combos Under ₹999",
    url: "/products?category=combos&max_price=999#catalog",
    type: "custom" as const,
  },
  {
    label: "Gen Z Favourites",
    url: "/products?collection=gen-z-favourites#catalog",
    type: "custom" as const,
  },
  {
    label: "All Products Catalog",
    url: "/products",
    type: "custom" as const,
  },
];

/* ── Botanical SVG icons for manager ── */
function LeafSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden="true">
      <path d="M20 70 C 30 55, 40 30, 45 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M38 45 C 55 38, 68 42, 72 52 C 58 60, 40 55, 38 45 Z" fill={color} />
      <path d="M34 28 C 20 22, 8 28, 5 38 C 18 44, 30 36, 34 28 Z" fill={color} />
    </svg>
  );
}

function FlowerSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden="true">
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <ellipse
          key={i}
          cx={40 + 16 * Math.cos((deg * Math.PI) / 180)}
          cy={40 + 16 * Math.sin((deg * Math.PI) / 180)}
          rx="10"
          ry="6"
          transform={`rotate(${deg} ${40 + 16 * Math.cos((deg * Math.PI) / 180)} ${
            40 + 16 * Math.sin((deg * Math.PI) / 180)
          })`}
          fill={color}
        />
      ))}
      <circle cx="40" cy="40" r="6" fill={color} />
    </svg>
  );
}

function HerbSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden="true">
      <path d="M40 72 L 40 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M38 50 C 25 44, 14 48, 10 55 C 22 60, 34 55, 38 50 Z" fill={color} />
      <path d="M42 35 C 55 28, 66 32, 70 40 C 58 44, 46 40, 42 35 Z" fill={color} />
      <path d="M38 22 C 30 15, 20 18, 16 24 C 26 28, 34 24, 38 22 Z" fill={color} />
    </svg>
  );
}

function LavenderSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden="true">
      <path d="M40 72 L 40 25" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={i} cx={38 - i * 2} cy={25 + i * 10} rx="5" ry="3.5" fill={color} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={i} cx={42 + i * 2} cy={28 + i * 10} rx="5" ry="3.5" fill={color} />
      ))}
    </svg>
  );
}

function RenderBotanicalIcon({
  accent,
  color,
  opacity = 0.25,
}: {
  accent: BotanicalAccentType | string;
  color: string;
  opacity?: number;
}) {
  return (
    <div
      className="absolute bottom-[-6px] right-[-6px] w-[70px] h-[70px] pointer-events-none"
      style={{ opacity }}
    >
      {accent === "flower" && <FlowerSVG color={color} />}
      {accent === "herb" && <HerbSVG color={color} />}
      {accent === "lavender" && <LavenderSVG color={color} />}
      {accent === "leaf" && <LeafSVG color={color} />}
    </div>
  );
}

export default function PromoCardsManager() {
  const [cards, setCards] = useState<HomepagePromoCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<HomepagePromoCard | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  const [form, setForm] = useState<HomepagePromoCardInput>({
    title: "",
    subtitle: "",
    link_url: "/products",
    destination_type: "custom",
    destination_id: "/products",
    product_id: null,
    category_id: null,
    bg_color: "#F0E8CC",
    accent_color: "#8B6A3A",
    botanical_accent: "leaf",
    badge_text: "",
    has_arrow: false,
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadCards = async () => {
    try {
      if (isMountedRef.current) setLoading(true);
      const data = await listHomepagePromoCards(false);
      if (isMountedRef.current) setCards(data);
    } catch (err: any) {
      if (isMountedRef.current) toast.error(err.message || "Failed to load promo cards.");
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const openCreateModal = () => {
    setEditingCard(null);
    setForm({
      title: "New\nLaunches",
      subtitle: "Fresh Rituals",
      link_url: "/products?collection=new-launches&sort=newest#catalog",
      destination_type: "custom",
      destination_id: "/products?collection=new-launches&sort=newest#catalog",
      product_id: null,
      category_id: null,
      bg_color: "#F0E8CC",
      accent_color: "#8B6A3A",
      botanical_accent: "leaf",
      badge_text: "",
      has_arrow: false,
      display_order: cards.length,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (card: HomepagePromoCard) => {
    setEditingCard(card);
    setForm({
      title: card.title,
      subtitle: card.subtitle || "",
      link_url: card.link_url,
      destination_type: card.destination_type,
      destination_id: card.destination_id,
      product_id: card.product_id,
      category_id: card.category_id,
      bg_color: card.bg_color,
      accent_color: card.accent_color,
      botanical_accent: card.botanical_accent,
      badge_text: card.badge_text || "",
      has_arrow: card.has_arrow,
      display_order: card.display_order,
      is_active: card.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDestinationChange = (val: DestinationValue) => {
    setForm((prev) => ({
      ...prev,
      destination_type: val.type,
      destination_id: val.id,
      product_id: val.productId || null,
      category_id: val.categoryId || null,
      link_url: val.url,
    }));
  };

  const handleSelectPresetDestination = (preset: (typeof PRESET_DESTINATIONS)[number]) => {
    setForm((prev) => ({
      ...prev,
      destination_type: preset.type,
      destination_id: preset.url,
      link_url: preset.url,
    }));
    toast.success(`Redirect link set to: ${preset.label}`);
  };

  const handleSelectPalette = (palette: (typeof PRESET_COLOR_PALETTES)[number]) => {
    setForm((prev) => ({
      ...prev,
      bg_color: palette.bg,
      accent_color: palette.accent,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Please enter a card title.");
      return;
    }
    if (!form.link_url?.trim()) {
      toast.error("Please specify a redirect link URL.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingCard) {
        await updateHomepagePromoCard(editingCard.id, form);
        toast.success("Promo card updated successfully!");
      } else {
        await createHomepagePromoCard(form);
        toast.success("New promo card created successfully!");
      }
      setIsModalOpen(false);
      await loadCards();
    } catch (err: any) {
      toast.error(err.message || "Failed to save promo card.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (card: HomepagePromoCard) => {
    try {
      const nextActive = !card.is_active;
      await updateHomepagePromoCard(card.id, { is_active: nextActive });
      setCards((prev) => prev.map((c) => (c.id === card.id ? { ...c, is_active: nextActive } : c)));
      toast.success(nextActive ? "Card enabled on homepage" : "Card disabled from homepage");
    } catch (err: any) {
      toast.error(err.message || "Failed to update card status.");
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promo card?")) return;
    try {
      await deleteHomepagePromoCard(id);
      setCards((prev) => prev.filter((c) => c.id !== id));
      toast.success("Promo card deleted.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete promo card.");
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= cards.length) return;
    const nextCards = [...cards];
    const [moved] = nextCards.splice(index, 1);
    nextCards.splice(targetIndex, 0, moved);
    setCards(nextCards);
    try {
      await reorderHomepagePromoCards(nextCards.map((c) => c.id));
      toast.success("Order updated.");
    } catch (err: any) {
      toast.error("Failed to reorder cards.");
      loadCards();
    }
  };

  const handleResetToDefaults = async () => {
    if (
      !confirm(
        "Are you sure you want to reset the 4 promo cards to default settings (New Launches, BestSellers Under 499, Combos Under 999, Gen Z Favourites)?"
      )
    )
      return;
    try {
      setLoading(true);
      await resetHomepagePromoCardsToDefault();
      await loadCards();
      toast.success("Promo cards reset to default presets.");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset promo cards.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface border border-outline-variant/60 shadow-xs">
        <div>
          <h2 className="font-display text-[20px] font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">grid_view</span>
            Homepage Quick Promo Cards (4-Grid)
          </h2>
          <p className="font-body text-[13px] text-on-surface-variant mt-0.5 max-w-[700px]">
            Manage the 4 rounded cards displayed on mobile. Customize title words, target redirect routes
            (collections, categories, price thresholds, or products), pastel tones, and botanical accents.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-3.5 py-2 rounded-xl border border-outline-variant/70 text-on-surface font-body text-[12px] font-semibold hover:bg-surface-container-high transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-primary text-white font-body text-[12px] font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Add Promo Card
          </button>
        </div>
      </div>

      {/* ── Live Mobile Preview Banner ── */}
      <div className="p-5 rounded-2xl bg-surface border border-outline-variant/60">
        <div className="flex items-center justify-between mb-3">
          <span className="font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-primary">smartphone</span>
            Live Mobile Customer Preview
          </span>
          <span className="font-body text-[11px] text-on-surface-variant/70">
            Exactly how these cards appear on mobile phones
          </span>
        </div>

        <div className="max-w-[420px] mx-auto p-4 rounded-3xl bg-[#FDF6F0] border border-outline-variant/50 shadow-inner">
          <div className="grid grid-cols-2 gap-3">
            {cards.filter((c) => c.is_active).slice(0, 4).map((card) => (
              <div
                key={card.id}
                className="relative overflow-hidden rounded-[20px] p-3 transition-transform min-h-[82px] border border-white/60 flex flex-col justify-center"
                style={{
                  background: card.bg_color,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                }}
              >
                <RenderBotanicalIcon accent={card.botanical_accent} color={card.accent_color} />
                <h4
                  className="font-display text-[13.5px] font-bold text-[#2A1A14] leading-[1.22] relative z-10 whitespace-pre-line"
                >
                  {card.title}
                </h4>
                <span
                  className="font-mono text-[9px] mt-1 relative z-10 px-1.5 py-0.5 rounded-full inline-block truncate max-w-full font-medium"
                  style={{
                    background: "rgba(255,255,255,0.75)",
                    color: card.accent_color,
                  }}
                  title={card.link_url}
                >
                  → {card.link_url.replace("#catalog", "")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Cards List / Table ── */}
      <div className="rounded-2xl bg-surface border border-outline-variant/60 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-outline-variant/40 flex items-center justify-between">
          <h3 className="font-display text-[15px] font-bold text-on-surface">
            Configured Promo Cards ({cards.length})
          </h3>
          <span className="font-body text-[12px] text-on-surface-variant">
            Recommended: 4 cards for a balanced 2x2 grid
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[32px] animate-spin text-primary">
              progress_activity
            </span>
            <p className="mt-2 font-body text-[13px]">Loading promo cards...</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[42px] text-on-surface-variant/40">
              grid_off
            </span>
            <p className="mt-2 font-body text-[14px]">No promo cards found.</p>
            <button
              onClick={handleResetToDefaults}
              className="mt-4 px-4 py-2 rounded-xl bg-primary text-white text-[12px] font-semibold"
            >
              Load Default 4 Cards
            </button>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/30">
            {cards.map((card, idx) => (
              <div
                key={card.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-container-lowest transition-colors"
              >
                {/* Left: Reorder + Card Visual + Title */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Order buttons */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, "up")}
                      className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high disabled:opacity-20"
                      title="Move up"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                    </button>
                    <button
                      type="button"
                      disabled={idx === cards.length - 1}
                      onClick={() => handleMove(idx, "down")}
                      className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high disabled:opacity-20"
                      title="Move down"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                    </button>
                  </div>

                  {/* Card Swatch */}
                  <div
                    className="relative w-20 h-14 rounded-xl shrink-0 overflow-hidden border border-black/5 flex items-center justify-center p-2"
                    style={{ background: card.bg_color }}
                  >
                    <RenderBotanicalIcon accent={card.botanical_accent} color={card.accent_color} opacity={0.35} />
                    <span className="font-display text-[10px] font-bold text-[#2A1A14] text-center leading-tight whitespace-pre-line z-10">
                      {card.title}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-[14px] font-bold text-on-surface truncate">
                        {card.title.replace(/\n/g, " ")}
                      </h4>
                      {card.badge_text && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                          {card.badge_text}
                        </span>
                      )}
                      {!card.is_active && (
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-semibold">
                          Disabled
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 font-body text-[11.5px] text-on-surface-variant">
                      <span className="flex items-center gap-1 font-mono text-[11px] text-primary bg-primary/5 px-2 py-0.5 rounded-md">
                        <span className="material-symbols-outlined text-[13px]">link</span>
                        {card.link_url}
                      </span>
                      <span>•</span>
                      <span className="capitalize">
                        Accent: {card.botanical_accent}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(card)}
                    className={`px-3 py-1.5 rounded-lg font-body text-[11.5px] font-semibold transition-colors ${
                      card.is_active
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-surface-container-high text-on-surface-variant"
                    }`}
                  >
                    {card.is_active ? "Active" : "Hidden"}
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(card)}
                    className="px-3 py-1.5 rounded-lg border border-outline-variant/70 text-on-surface font-body text-[11.5px] font-semibold hover:bg-surface-container-high transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">edit</span>
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCard(card.id)}
                    className="p-1.5 rounded-lg text-on-surface-variant/70 hover:text-error hover:bg-error/10 transition-colors"
                    title="Delete card"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Edit / Create Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-[680px] bg-white rounded-3xl border border-outline-variant/60 shadow-2xl p-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/40 mb-5">
              <div>
                <h3 className="font-display text-[18px] font-bold text-on-surface">
                  {editingCard ? "Edit Promo Card" : "Create New Promo Card"}
                </h3>
                <p className="font-body text-[12px] text-on-surface-variant">
                  Configure card text, destination redirect link, colors, and botanical icon.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Card Live Preview inside Modal */}
              <div className="p-4 rounded-2xl bg-[#FDF6F0] border border-outline-variant/50">
                <p className="font-body text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant mb-2">
                  Card Live Preview
                </p>
                <div className="max-w-[220px] mx-auto">
                  <div
                    className="relative overflow-hidden rounded-[20px] p-3.5 min-h-[88px] border border-white/60 flex flex-col justify-center"
                    style={{
                      background: form.bg_color,
                      boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
                    }}
                  >
                    <RenderBotanicalIcon
                      accent={form.botanical_accent || "leaf"}
                      color={form.accent_color || "#8B6A3A"}
                    />
                    <h4 className="font-display text-[14px] font-bold text-[#2A1A14] leading-[1.2] relative z-10 whitespace-pre-line">
                      {form.title || "Card Title"}
                    </h4>
                    {form.badge_text && (
                      <span
                        className="inline-block mt-1 font-body text-[9.5px] px-1.5 py-0.5 rounded-full font-semibold relative z-10 w-fit"
                        style={{
                          background: "rgba(255,255,255,0.75)",
                          color: form.accent_color || "#2A1A14",
                        }}
                      >
                        {form.badge_text}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 1. Title & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-body text-[12px] font-semibold text-on-surface mb-1">
                    Card Title *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. New&#10;Launches"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/60 bg-surface text-on-surface font-body text-[13.5px] focus:outline-none focus:border-primary transition-colors"
                  />
                  <span className="font-body text-[11px] text-on-surface-variant/70">
                    Tip: Press Enter for a clean 2-line title on mobile.
                  </span>
                </div>

                <div>
                  <label className="block font-body text-[12px] font-semibold text-on-surface mb-1">
                    Optional Badge / Subtitle
                  </label>
                  <input
                    type="text"
                    value={form.badge_text || ""}
                    onChange={(e) => setForm({ ...form, badge_text: e.target.value })}
                    placeholder="e.g. Under ₹499, Trending, Fresh"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/60 bg-surface text-on-surface font-body text-[13.5px] focus:outline-none focus:border-primary transition-colors mb-1"
                  />
                  <span className="font-body text-[11px] text-on-surface-variant/70">
                    Shown as a delicate pill tag inside the card.
                  </span>
                </div>
              </div>

              {/* 2. Destination Redirect */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-body text-[12px] font-semibold text-on-surface">
                    Where should clicking this card redirect? *
                  </label>
                  <span className="font-body text-[11px] text-primary font-semibold">
                    Live Shop Redirection
                  </span>
                </div>

                {/* Preset shortcuts */}
                <div className="p-3 rounded-xl bg-surface-container-high/50 border border-outline-variant/40 space-y-2">
                  <span className="block font-body text-[11px] font-medium text-on-surface-variant">
                    Quick Redirection Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_DESTINATIONS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleSelectPresetDestination(preset)}
                        className={`px-2.5 py-1 rounded-lg font-body text-[11px] transition-colors ${
                          form.link_url === preset.url
                            ? "bg-primary text-white font-semibold"
                            : "bg-surface text-on-surface border border-outline-variant/50 hover:bg-surface-container-high"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Full Destination Selector (Category / Product / Custom) */}
                <DestinationSelector
                  initialType={form.destination_type || "custom"}
                  initialId={form.destination_id || form.link_url}
                  initialProductId={form.product_id}
                  initialUrl={form.link_url}
                  onChange={handleDestinationChange}
                  label="Custom Destination Selector"
                  required
                />
              </div>

              {/* 3. Color Theme & Botanical Accent */}
              <div className="space-y-3 pt-2 border-t border-outline-variant/30">
                <label className="block font-body text-[12px] font-semibold text-on-surface">
                  Color Palette & Theme
                </label>

                {/* Color swatches */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {PRESET_COLOR_PALETTES.map((pal) => {
                    const isSelected = form.bg_color === pal.bg;
                    return (
                      <button
                        key={pal.label}
                        type="button"
                        onClick={() => handleSelectPalette(pal)}
                        className={`h-11 rounded-xl border flex flex-col items-center justify-center relative transition-all ${
                          isSelected
                            ? "ring-2 ring-primary ring-offset-2 border-transparent scale-105"
                            : "border-outline-variant/40 hover:opacity-90"
                        }`}
                        style={{ background: pal.bg }}
                        title={pal.label}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: pal.accent }}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-body text-[11px] font-medium text-on-surface-variant mb-1">
                      Background Color (Hex)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={form.bg_color}
                        onChange={(e) => setForm({ ...form, bg_color: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-outline-variant/60 p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={form.bg_color}
                        onChange={(e) => setForm({ ...form, bg_color: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl border border-outline-variant/60 bg-surface text-on-surface font-mono text-[12px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-body text-[11px] font-medium text-on-surface-variant mb-1">
                      Accent & Icon Color (Hex)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={form.accent_color}
                        onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-outline-variant/60 p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={form.accent_color}
                        onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl border border-outline-variant/60 bg-surface text-on-surface font-mono text-[12px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Botanical Accent SVG Selector */}
              <div className="space-y-1.5">
                <label className="block font-body text-[12px] font-semibold text-on-surface">
                  Botanical SVG Accent
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: "leaf", label: "Leaf" },
                    { id: "flower", label: "Flower" },
                    { id: "herb", label: "Herb" },
                    { id: "lavender", label: "Lavender" },
                    { id: "none", label: "None" },
                  ].map((bot) => {
                    const isSelected = (form.botanical_accent || "leaf") === bot.id;
                    return (
                      <button
                        key={bot.id}
                        type="button"
                        onClick={() =>
                          setForm({ ...form, botanical_accent: bot.id as BotanicalAccentType })
                        }
                        className={`py-2 px-2 rounded-xl border font-body text-[11.5px] font-semibold transition-all flex flex-col items-center justify-center gap-1 ${
                          isSelected
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-surface border-outline-variant/50 text-on-surface-variant hover:bg-surface-container-high"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {bot.id === "flower"
                            ? "local_florist"
                            : bot.id === "leaf"
                            ? "spa"
                            : bot.id === "herb"
                            ? "potted_plant"
                            : bot.id === "lavender"
                            ? "psychiatry"
                            : "block"}
                        </span>
                        <span>{bot.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-high/40 border border-outline-variant/40">
                <div>
                  <span className="block font-body text-[13px] font-semibold text-on-surface">
                    Display Card on Homepage
                  </span>
                  <span className="block font-body text-[11px] text-on-surface-variant">
                    When active, this card appears in the 4-card grid on mobile.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/40">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant/70 text-on-surface font-body text-[13px] font-semibold hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-primary text-white font-body text-[13px] font-semibold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && (
                    <span className="material-symbols-outlined text-[16px] animate-spin">
                      progress_activity
                    </span>
                  )}
                  <span>{editingCard ? "Save Changes" : "Create Card"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
