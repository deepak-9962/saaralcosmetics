"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import type { Product, ProductReview, ProductReviewSummary } from "@/lib/types";
import {
  listProductReviews,
  getProductReviewSummary,
  createCustomerReview,
  subscribeToProductReviews,
} from "@/lib/supabase/data";
import { useProductRatings } from "@/lib/useProductRatings";

interface ProductReviewsSectionProps {
  product: Product;
  initialSummary?: ProductReviewSummary | null;
  initialReviews?: ProductReview[];
}

type SortOption = "recent" | "highest" | "lowest";

function StarDisplay({
  rating,
  size = 18,
  activeColor = "#D48B28",
  inactiveColor = "rgba(212,184,168,0.5)",
}: {
  rating: number;
  size?: number;
  activeColor?: string;
  inactiveColor?: string;
}) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-[3px]" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="material-symbols-outlined select-none"
          style={{
            fontSize: `${size}px`,
            fontVariationSettings: `'FILL' ${i < rounded ? 1 : 0}`,
            color: i < rounded ? activeColor : inactiveColor,
          }}
        >
          star
        </span>
      ))}
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function ProductReviewsSection({
  product,
  initialSummary,
  initialReviews = [],
}: ProductReviewsSectionProps) {
  const { refresh: refreshGlobalRatings } = useProductRatings();

  const [summary, setSummary] = useState<ProductReviewSummary>(
    initialSummary || {
      product_id: product.id,
      total_reviews: 0,
      average_rating: 0,
      five_star: 0,
      four_star: 0,
      three_star: 0,
      two_star: 0,
      one_star: 0,
    }
  );

  const [reviews, setReviews] = useState<ProductReview[]>(initialReviews);
  const [totalCount, setTotalCount] = useState<number>(initialSummary?.total_reviews || initialReviews.length);
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // Review Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formRating, setFormRating] = useState<number>(5);
  const [formHoverRating, setFormHoverRating] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formComment, setFormComment] = useState("");
  const [formName, setFormName] = useState("");
  const [formContact, setFormContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Load reviews and summary
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sumData, revData] = await Promise.all([
        getProductReviewSummary(product.id),
        listProductReviews(product.id, {
          sort: sortBy,
          limit: page * pageSize,
          offset: 0,
        }),
      ]);
      setSummary(sumData);
      setReviews(revData.reviews);
      setTotalCount(revData.total);
    } catch (err) {
      console.error("Failed to load reviews for product:", err);
    } finally {
      setIsLoading(false);
    }
  }, [product.id, sortBy, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Realtime subscription: auto-refresh when admin modifies/approves reviews
  useEffect(() => {
    const unsubscribe = subscribeToProductReviews(product.id, () => {
      loadData();
      refreshGlobalRatings();
    });
    return unsubscribe;
  }, [product.id, loadData, refreshGlobalRatings]);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!formTitle.trim()) {
      toast.error("Please enter a review headline");
      return;
    }
    if (!formComment.trim()) {
      toast.error("Please enter your review feedback");
      return;
    }

    setIsSubmitting(true);
    try {
      const isEmail = formContact.includes("@");
      await createCustomerReview({
        product_id: product.id,
        customer_name: formName.trim(),
        customer_email: isEmail ? formContact.trim() : null,
        customer_phone: !isEmail && formContact.trim() ? formContact.trim() : null,
        rating: formRating,
        title: formTitle.trim(),
        comment: formComment.trim(),
      });

      setSubmittedSuccess(true);
      toast.success("Review submitted! Thank you for your feedback.");
      refreshGlobalRatings();
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmittedSuccess(false);
        setFormTitle("");
        setFormComment("");
        setFormName("");
        setFormContact("");
        setFormRating(5);
      }, 2400);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingLevels = [
    { star: 5, count: summary.five_star },
    { star: 4, count: summary.four_star },
    { star: 3, count: summary.three_star },
    { star: 2, count: summary.two_star },
    { star: 1, count: summary.one_star },
  ];

  const ratingLabels: Record<number, string> = {
    5: "Excellent — Loved it!",
    4: "Very Good — Highly recommended",
    3: "Average — Good product",
    2: "Fair — Below expectations",
    1: "Poor — Disappointed",
  };

  return (
    <section
      id="customer-reviews"
      aria-labelledby="customer-reviews-heading"
      className="mt-[var(--spacing-stack-lg)] pt-2 scroll-mt-24"
    >
      <div className="w-full bg-[#FAF5F0] rounded-[24px] sm:rounded-[32px] border border-[#ECDCD5] p-5 sm:p-7 md:p-10 shadow-[0_4px_24px_rgba(42,26,20,0.03)]">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E8DEC8]/60">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <p className="font-body text-[11px] font-semibold text-primary uppercase tracking-[0.14em]">
                Verified Customer Feedback
              </p>
            </div>
            <h2
              id="customer-reviews-heading"
              className="font-display text-[26px] sm:text-[32px] md:text-[36px] text-on-surface leading-tight font-bold"
            >
              Customer Reviews & Ratings
            </h2>
            <p className="font-body text-[13px] sm:text-[14px] text-on-surface-variant/80 mt-1">
              Honest thoughts and experiences from real Saaral customers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-body text-[12px] sm:text-[13px] font-semibold tracking-[0.06em] text-white transition-all duration-200 active:scale-95 shadow-md cursor-pointer hover:shadow-lg"
            style={{
              background: "linear-gradient(135deg, #B06080, #8A4060)",
            }}
          >
            <span className="material-symbols-outlined text-[17px]">rate_review</span>
            Write a Review
          </button>
        </div>

        {/* ── Summary & Breakdown Panel ── */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left card: Big score + star breakdown */}
          <div className="lg:col-span-5 xl:col-span-4 bg-white/95 rounded-2xl border border-[#ECDCD5] p-6 shadow-sm flex flex-col">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="font-display text-[48px] sm:text-[54px] font-bold text-on-surface leading-none">
                {summary.total_reviews > 0 ? summary.average_rating.toFixed(1) : "0.0"}
              </span>
              <div className="flex flex-col">
                <span className="font-body text-[14px] text-on-surface-variant/70 font-medium">
                  out of 5
                </span>
                <span className="font-body text-[11px] font-semibold text-emerald-700">
                  {summary.total_reviews > 0 ? "100% Genuine Ratings" : "No ratings yet"}
                </span>
              </div>
            </div>

            <div className="mb-2">
              <StarDisplay rating={summary.average_rating} size={22} />
            </div>

            <p className="font-body text-[13px] text-on-surface-variant/80 mb-6">
              Based on{" "}
              <strong className="text-on-surface font-semibold">
                {summary.total_reviews} review{summary.total_reviews !== 1 ? "s" : ""}
              </strong>
            </p>

            {/* Distribution bars */}
            <div className="flex flex-col gap-2.5 pt-4 border-t border-[#F0E6DE]">
              {ratingLevels.map(({ star, count }) => {
                const percent =
                  summary.total_reviews > 0 ? Math.round((count / summary.total_reviews) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-3 text-[12px] font-body">
                    <span className="w-12 text-on-surface-variant font-medium flex items-center gap-1">
                      {star} <span className="material-symbols-outlined text-[13px] text-[#D48B28]">star</span>
                    </span>
                    <div className="flex-1 h-2.5 rounded-full bg-[#F4EBE3] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          background:
                            star >= 4
                              ? "linear-gradient(90deg, #D48B28, #E5A93C)"
                              : star === 3
                              ? "#C9A74D"
                              : "#B06080",
                        }}
                      />
                    </div>
                    <span className="w-16 text-right font-medium text-on-surface-variant/80">
                      {count} {count === 1 ? "rev" : "revs"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right column: Reviews Feed */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
            {/* Sort & Controls Bar */}
            <div className="flex items-center justify-between gap-4 mb-5 pb-3 border-b border-[#E8DEC8]/50">
              <p className="font-body text-[13px] font-medium text-on-surface-variant">
                Showing {reviews.length} of {totalCount} review{totalCount !== 1 ? "s" : ""}
              </p>

              <div className="flex items-center gap-2">
                <label htmlFor="review-sort" className="font-body text-[12px] text-on-surface-variant/70 hidden sm:inline">
                  Sort by:
                </label>
                <select
                  id="review-sort"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as SortOption);
                    setPage(1);
                  }}
                  className="bg-white border border-[#ECDCD5] text-on-surface rounded-xl px-3 py-1.5 font-body text-[12px] focus:outline-primary cursor-pointer shadow-2xs"
                >
                  <option value="recent">Most Recent</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
              </div>
            </div>

            {/* Empty State */}
            {reviews.length === 0 && !isLoading && (
              <div className="bg-white/80 rounded-2xl border border-dashed border-[#D8C7BC] p-8 sm:p-12 text-center flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-primary-container/40 flex items-center justify-center mb-4 text-primary">
                  <span className="material-symbols-outlined text-[28px]">reviews</span>
                </div>
                <h3 className="font-display text-[20px] text-on-surface font-semibold mb-1">
                  No reviews yet
                </h3>
                <p className="font-body text-[13px] sm:text-[14px] text-on-surface-variant/80 max-w-md mb-5">
                  Be the first to review <span className="font-semibold">{product.name}</span> and share your experience with the community!
                </p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-5 py-2.5 rounded-full font-body text-[13px] font-semibold text-white cursor-pointer shadow-sm hover:shadow"
                  style={{ background: "linear-gradient(135deg, #B06080, #8A4060)" }}
                >
                  Write the First Review
                </button>
              </div>
            )}

            {/* Review Cards Grid */}
            <div className="flex flex-col gap-4">
              {reviews.map((rev) => (
                <article
                  key={rev.id}
                  className="bg-white rounded-2xl border border-[#ECDCD5] p-5 sm:p-6 shadow-[0_2px_8px_rgba(42,26,20,0.02)] transition-shadow hover:shadow-md flex flex-col gap-2.5"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex flex-col gap-1">
                      <StarDisplay rating={rev.rating} size={16} />
                      <h4 className="font-display text-[17px] sm:text-[18px] font-semibold text-on-surface leading-snug">
                        {rev.title}
                      </h4>
                    </div>

                    <time
                      dateTime={rev.created_at}
                      className="font-body text-[11px] text-on-surface-variant/60 font-medium whitespace-nowrap"
                    >
                      {formatDate(rev.created_at)}
                    </time>
                  </div>

                  <p className="font-body text-[13.5px] sm:text-[14px] text-on-surface/90 leading-[1.6] whitespace-pre-line">
                    {rev.comment}
                  </p>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#F4EBE3] flex-wrap mt-1">
                    <span className="font-body text-[12px] font-semibold text-on-surface">
                      {rev.customer_name}
                    </span>

                    {rev.verified_purchase && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10.5px] font-medium font-body">
                        <span className="material-symbols-outlined text-[13px] text-emerald-600">verified</span>
                        Verified Purchase
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {/* Load More Button */}
            {totalCount > reviews.length && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-full border border-primary text-primary font-body text-[13px] font-semibold hover:bg-primary hover:text-white transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? "Loading reviews..." : `Load More Reviews (${totalCount - reviews.length} remaining)`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Write a Review Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsModalOpen(false)}
              className="fixed inset-0 bg-[#2A1A14]/50 backdrop-blur-xs"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-lg bg-surface rounded-2xl sm:rounded-3xl border border-[#ECDCD5] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-surface-container-high/60 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>

              {submittedSuccess ? (
                <div className="py-10 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-[32px]">check</span>
                  </div>
                  <h3 className="font-display text-[24px] text-on-surface font-bold mb-2">
                    Review Submitted!
                  </h3>
                  <p className="font-body text-[14px] text-on-surface-variant max-w-sm">
                    Thank you for sharing your experience with Saaral Cosmetics. Your review has been submitted for moderation and will appear publicly once approved.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
                  <div>
                    <span className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                      Share Your Thoughts
                    </span>
                    <h3 className="font-display text-[22px] sm:text-[24px] text-on-surface font-bold leading-tight">
                      Review {product.name}
                    </h3>
                  </div>

                  {/* Rating Selector */}
                  <div className="flex flex-col gap-1.5 py-1">
                    <label className="font-body text-[12px] font-semibold text-on-surface">
                      Overall Rating <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const current = formHoverRating ?? formRating;
                        return (
                          <button
                            type="button"
                            key={star}
                            onMouseEnter={() => setFormHoverRating(star)}
                            onMouseLeave={() => setFormHoverRating(null)}
                            onClick={() => setFormRating(star)}
                            className="p-1 focus:outline-none cursor-pointer transition-transform hover:scale-110"
                            aria-label={`Rate ${star} star`}
                          >
                            <span
                              className="material-symbols-outlined text-[30px]"
                              style={{
                                fontVariationSettings: `'FILL' ${star <= current ? 1 : 0}`,
                                color: star <= current ? "#D48B28" : "rgba(212,184,168,0.5)",
                              }}
                            >
                              star
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <span className="font-body text-[11px] font-medium text-amber-800">
                      {ratingLabels[formHoverRating ?? formRating]}
                    </span>
                  </div>

                  {/* Review Title */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="rev-title" className="font-body text-[12px] font-semibold text-on-surface">
                      Review Title / Headline <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="rev-title"
                      type="text"
                      required
                      placeholder="e.g., Truly transformative for my skin!"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#ECDCD5] font-body text-[13px] text-on-surface focus:outline-primary"
                    />
                  </div>

                  {/* Review Comment */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="rev-comment" className="font-body text-[12px] font-semibold text-on-surface">
                      Your Feedback <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="rev-comment"
                      required
                      rows={4}
                      placeholder="Share details about the texture, fragrance, skin results, and packaging..."
                      value={formComment}
                      onChange={(e) => setFormComment(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#ECDCD5] font-body text-[13px] text-on-surface focus:outline-primary resize-y"
                    />
                  </div>

                  {/* Reviewer Name */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="rev-name" className="font-body text-[12px] font-semibold text-on-surface">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="rev-name"
                      type="text"
                      required
                      placeholder="e.g., Deepika R."
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#ECDCD5] font-body text-[13px] text-on-surface focus:outline-primary"
                    />
                  </div>

                  {/* Optional Email / Phone for Verification */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="rev-contact" className="font-body text-[12px] font-semibold text-on-surface">
                      Order Email or Phone <span className="font-normal text-on-surface-variant/70">(Optional)</span>
                    </label>
                    <input
                      id="rev-contact"
                      type="text"
                      placeholder="e.g., name@example.com or 9876543210"
                      value={formContact}
                      onChange={(e) => setFormContact(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#ECDCD5] font-body text-[13px] text-on-surface focus:outline-primary"
                    />
                    <p className="font-body text-[10.5px] text-on-surface-variant/70">
                      Matches against prior order records to grant an authentic &ldquo;Verified Purchase&rdquo; badge. Kept strictly private.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-2 flex items-center justify-end gap-3 pt-3 border-t border-[#ECDCD5]/70">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-on-surface-variant font-body text-[12px] font-medium hover:bg-surface-container-high cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl font-body text-[13px] font-semibold text-white shadow-md cursor-pointer disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #B06080, #8A4060)" }}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
