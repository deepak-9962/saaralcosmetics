"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import GradientBackground from "@/components/layout/GradientBackground";
import type { Product, ProductReviewWithProduct, ReviewStatus } from "@/lib/types";
import { listAllProductsForAdmin } from "@/lib/supabase/data";
import { useProductRatings } from "@/lib/useProductRatings";

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-[2px] text-[#D48B28]">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="material-symbols-outlined text-[15px]"
          style={{
            fontVariationSettings: `'FILL' ${i < count ? 1 : 0}`,
            color: i < count ? "#D48B28" : "rgba(212,184,168,0.5)",
          }}
        >
          star
        </span>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  switch (status) {
    case "approved":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold font-body bg-emerald-100 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          Approved
        </span>
      );
    case "pending":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold font-body bg-amber-100 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Pending
        </span>
      );
    case "hidden":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold font-body bg-slate-100 text-slate-700 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          Hidden
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold font-body bg-rose-100 text-rose-800 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Rejected
        </span>
      );
  }
}

export default function AdminReviewsPage() {
  const { refresh: refreshGlobalRatings } = useProductRatings();

  const [reviews, setReviews] = useState<ProductReviewWithProduct[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [selectedProductId, setSelectedProductId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<ReviewStatus | "all">("all");
  const [selectedRating, setSelectedRating] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Modals state
  const [viewingReview, setViewingReview] = useState<ProductReviewWithProduct | null>(null);
  const [editingReview, setEditingReview] = useState<ProductReviewWithProduct | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmReview, setDeleteConfirmReview] = useState<ProductReviewWithProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states (used for both Add & Edit)
  const [formData, setFormData] = useState({
    product_id: "",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    rating: 5,
    title: "",
    comment: "",
    status: "approved" as ReviewStatus,
    verified_purchase: true,
    admin_notes: "",
  });

  // Load products list for dropdown filter and creation selector
  useEffect(() => {
    listAllProductsForAdmin()
      .then((data) => {
        setProducts(data);
        if (data.length > 0 && !formData.product_id) {
          setFormData((prev) => ({ ...prev, product_id: data[0].id }));
        }
      })
      .catch((err) => console.error("Failed to load products list:", err));
  }, []);

  // Fetch reviews from API
  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedProductId !== "all") params.set("productId", selectedProductId);
      if (selectedStatus !== "all") params.set("status", selectedStatus);
      if (selectedRating !== "all") params.set("rating", String(selectedRating));
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));

      const res = await fetch(`/api/admin/reviews?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setReviews(data.reviews || []);
        setTotalCount(data.total || 0);
      } else {
        toast.error(data.error || "Failed to load reviews");
      }
    } catch {
      toast.error("Network error loading reviews");
    } finally {
      setIsLoading(false);
    }
  }, [selectedProductId, selectedStatus, selectedRating, searchQuery, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Overall store metric calculations
  const metrics = useMemo(() => {
    const total = totalCount;
    const pending = reviews.filter((r) => r.status === "pending").length;
    const approved = reviews.filter((r) => r.status === "approved").length;
    const approvedRatings = reviews
      .filter((r) => r.status === "approved")
      .map((r) => r.rating);
    const avg =
      approvedRatings.length > 0
        ? (approvedRatings.reduce((a, b) => a + b, 0) / approvedRatings.length).toFixed(1)
        : "5.0";

    return { total, pending, approved, avg };
  }, [reviews, totalCount]);

  // Handle Quick Status Change (Approve, Hide, Reject)
  const handleQuickStatusChange = async (
    review: ProductReviewWithProduct,
    newStatus: ReviewStatus
  ) => {
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update review status");
        return;
      }
      toast.success(`Review ${newStatus}`);
      fetchReviews();
      refreshGlobalRatings();
    } catch {
      toast.error("Network error updating status");
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (review: ProductReviewWithProduct) => {
    setEditingReview(review);
    setFormData({
      product_id: review.product_id,
      customer_name: review.customer_name,
      customer_email: review.customer_email || "",
      customer_phone: review.customer_phone || "",
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      status: review.status,
      verified_purchase: review.verified_purchase,
      admin_notes: review.admin_notes || "",
    });
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({
      product_id: selectedProductId !== "all" ? selectedProductId : products[0]?.id || "",
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      rating: 5,
      title: "",
      comment: "",
      status: "approved",
      verified_purchase: true,
      admin_notes: "",
    });
    setIsAddModalOpen(true);
  };

  // Save Add Review
  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_id) {
      toast.error("Please select a product");
      return;
    }
    if (!formData.customer_name.trim()) {
      toast.error("Reviewer name is required");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("Review title is required");
      return;
    }
    if (!formData.comment.trim()) {
      toast.error("Review feedback is required");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create review");
        return;
      }
      toast.success("Review created successfully!");
      setIsAddModalOpen(false);
      fetchReviews();
      refreshGlobalRatings();
    } catch {
      toast.error("Network error creating review");
    } finally {
      setIsSaving(false);
    }
  };

  // Save Edit Review
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/reviews/${editingReview.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update review");
        return;
      }
      toast.success("Review updated successfully!");
      setEditingReview(null);
      fetchReviews();
      refreshGlobalRatings();
    } catch {
      toast.error("Network error updating review");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Review
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmReview) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/reviews/${deleteConfirmReview.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to delete review");
        return;
      }
      toast.success("Review deleted permanently");
      setDeleteConfirmReview(null);
      fetchReviews();
      refreshGlobalRatings();
    } catch {
      toast.error("Network error deleting review");
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[var(--spacing-container-max)] mx-auto w-full flex-grow flex flex-col gap-6">
      <GradientBackground />

      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <p className="font-body text-[11px] font-semibold text-primary uppercase tracking-[0.12em]">
              Administration
            </p>
          </div>
          <h1 className="font-display text-[28px] sm:text-[34px] text-on-surface font-bold leading-tight">
            Review Management
          </h1>
          <p className="font-body text-[13px] sm:text-[14px] text-on-surface-variant/80 mt-0.5">
            Manage, moderate, edit, and approve customer reviews across all Saaral products.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-body text-[13px] font-semibold text-white shadow-md transition-all active:scale-95 cursor-pointer hover:shadow-lg"
          style={{ background: "linear-gradient(135deg, #B06080, #8A4060)" }}
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Review
        </button>
      </div>

      {/* ── Metrics Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white/90 border border-[#ECDCD5] rounded-2xl p-4 sm:p-5 shadow-xs">
          <p className="font-body text-[11px] font-medium text-on-surface-variant uppercase tracking-[0.08em]">
            Total Reviews
          </p>
          <p className="font-display text-[26px] sm:text-[32px] font-bold text-on-surface mt-1">
            {totalCount}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedStatus(selectedStatus === "pending" ? "all" : "pending");
            setPage(1);
          }}
          className={`text-left border rounded-2xl p-4 sm:p-5 shadow-xs transition-all cursor-pointer ${
            selectedStatus === "pending"
              ? "bg-amber-50 border-amber-300 ring-2 ring-amber-300"
              : "bg-white/90 border-[#ECDCD5] hover:bg-amber-50/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="font-body text-[11px] font-medium text-amber-800 uppercase tracking-[0.08em]">
              Pending Approval
            </p>
            {metrics.pending > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <p className="font-display text-[26px] sm:text-[32px] font-bold text-amber-900 mt-1">
            {metrics.pending}
          </p>
        </button>

        <div className="bg-white/90 border border-[#ECDCD5] rounded-2xl p-4 sm:p-5 shadow-xs">
          <p className="font-body text-[11px] font-medium text-emerald-800 uppercase tracking-[0.08em]">
            Approved Public
          </p>
          <p className="font-display text-[26px] sm:text-[32px] font-bold text-emerald-900 mt-1">
            {metrics.approved}
          </p>
        </div>

        <div className="bg-white/90 border border-[#ECDCD5] rounded-2xl p-4 sm:p-5 shadow-xs">
          <p className="font-body text-[11px] font-medium text-[#8A6A00] uppercase tracking-[0.08em]">
            Avg Store Rating
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="font-display text-[26px] sm:text-[32px] font-bold text-on-surface">
              {metrics.avg}
            </p>
            <span className="material-symbols-outlined text-[#D48B28] text-[24px]">star</span>
          </div>
        </div>
      </div>

      {/* ── Filter Toolbar ── */}
      <div className="bg-white/95 border border-[#ECDCD5] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Product Selector Filter */}
          <div className="flex flex-col gap-1">
            <label htmlFor="filter-product" className="font-body text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
              Filter by Product
            </label>
            <select
              id="filter-product"
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setPage(1);
              }}
              className="bg-surface-container-low border border-[#ECDCD5] rounded-xl px-3 py-2 font-body text-[13px] text-on-surface focus:outline-primary cursor-pointer"
            >
              <option value="all">All Products ({products.length})</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col gap-1">
            <label htmlFor="filter-status" className="font-body text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
              Status
            </label>
            <select
              id="filter-status"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as ReviewStatus | "all");
                setPage(1);
              }}
              className="bg-surface-container-low border border-[#ECDCD5] rounded-xl px-3 py-2 font-body text-[13px] text-on-surface focus:outline-primary cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Only</option>
              <option value="approved">Approved Only</option>
              <option value="hidden">Hidden Only</option>
              <option value="rejected">Rejected Only</option>
            </select>
          </div>

          {/* Rating Filter */}
          <div className="flex flex-col gap-1">
            <label htmlFor="filter-rating" className="font-body text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
              Star Rating
            </label>
            <select
              id="filter-rating"
              value={selectedRating}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedRating(val === "all" ? "all" : parseInt(val, 10));
                setPage(1);
              }}
              className="bg-surface-container-low border border-[#ECDCD5] rounded-xl px-3 py-2 font-body text-[13px] text-on-surface focus:outline-primary cursor-pointer"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars ★★★★★</option>
              <option value="4">4 Stars ★★★★</option>
              <option value="3">3 Stars ★★★</option>
              <option value="2">2 Stars ★★</option>
              <option value="1">1 Star ★</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="flex flex-col gap-1">
            <label htmlFor="filter-search" className="font-body text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
              Search Text
            </label>
            <div className="relative">
              <input
                id="filter-search"
                type="text"
                placeholder="Reviewer, title, content..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-surface-container-low border border-[#ECDCD5] rounded-xl pl-8 pr-3 py-2 font-body text-[13px] text-on-surface focus:outline-primary"
              />
              <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-[16px] text-on-surface-variant/60">
                search
              </span>
            </div>
          </div>
        </div>

        {/* Reset filter pill if any active */}
        {(selectedProductId !== "all" ||
          selectedStatus !== "all" ||
          selectedRating !== "all" ||
          searchQuery.trim().length > 0) && (
          <div className="flex items-center justify-between pt-2 border-t border-[#ECDCD5]/50 text-[12px] font-body">
            <span className="text-on-surface-variant">
              Active filters applied. Showing {reviews.length} matching reviews.
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedProductId("all");
                setSelectedStatus("all");
                setSelectedRating("all");
                setSearchQuery("");
                setPage(1);
              }}
              className="text-primary font-semibold hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* ── Reviews Table Container ── */}
      <div className="bg-white rounded-2xl border border-[#ECDCD5] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
            <p className="font-body text-[13px] text-on-surface-variant">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-[36px] text-on-surface-variant/40 mb-2">
              rate_review
            </span>
            <h3 className="font-display text-[18px] font-semibold text-on-surface">No reviews found</h3>
            <p className="font-body text-[13px] text-on-surface-variant/70 mt-1 max-w-sm">
              No review records match your selected product or filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF5F0] border-b border-[#ECDCD5] font-body text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Reviewer</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4 min-w-[220px]">Review Content</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECDCD5]/50 font-body text-[13px]">
                {reviews.map((rev) => {
                  const prod = rev.product;
                  const thumb = prod?.images?.[0] || "/images/cat-face-cream.webp";

                  return (
                    <tr key={rev.id} className="hover:bg-[#FCF9F7] transition-colors">
                      {/* Product */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[#ECDCD5] bg-surface-container">
                            <Image
                              src={thumb}
                              alt={prod?.name || "Product"}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="flex flex-col max-w-[180px]">
                            {prod ? (
                              <Link
                                href={`/products/${prod.slug}`}
                                target="_blank"
                                className="font-semibold text-on-surface hover:text-primary transition-colors truncate"
                                title={prod.name}
                              >
                                {prod.name}
                              </Link>
                            ) : (
                              <span className="font-semibold text-on-surface">Unknown Product</span>
                            )}
                            <span className="text-[11px] text-on-surface-variant/70 capitalize truncate">
                              {prod?.category?.replace(/-/g, " ") || "General"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Reviewer */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-on-surface">
                            {rev.customer_name}
                          </span>
                          {rev.verified_purchase && (
                            <span className="inline-flex items-center gap-1 text-[10.5px] text-emerald-700 font-medium">
                              <span className="material-symbols-outlined text-[12px]">verified</span>
                              Verified
                            </span>
                          )}
                          {(rev.customer_email || rev.customer_phone) && (
                            <span className="text-[11px] text-on-surface-variant/70 truncate max-w-[140px]">
                              {rev.customer_email || rev.customer_phone}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <StarRating count={rev.rating} />
                          <span className="font-bold text-on-surface text-[12px]">
                            {rev.rating}.0
                          </span>
                        </div>
                      </td>

                      {/* Content */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col max-w-sm">
                          <p className="font-semibold text-on-surface line-clamp-1">
                            {rev.title}
                          </p>
                          <p className="text-[12px] text-on-surface-variant/80 line-clamp-2 mt-0.5">
                            {rev.comment}
                          </p>
                        </div>
                      </td>

                      {/* Submission Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[12px] text-on-surface-variant/75">
                        {new Date(rev.created_at).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={rev.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Moderation Button */}
                          {rev.status === "pending" ? (
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(rev, "approved")}
                              title="Approve review"
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-body text-[11px] font-semibold border border-emerald-200 cursor-pointer"
                            >
                              Approve
                            </button>
                          ) : rev.status === "approved" ? (
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(rev, "hidden")}
                              title="Hide from public"
                              className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 font-body text-[11px] font-medium border border-slate-200 cursor-pointer"
                            >
                              Hide
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(rev, "approved")}
                              title="Re-approve"
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-body text-[11px] font-semibold border border-emerald-200 cursor-pointer"
                            >
                              Approve
                            </button>
                          )}

                          {/* View details */}
                          <button
                            type="button"
                            onClick={() => setViewingReview(rev)}
                            title="View details"
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high cursor-pointer transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>

                          {/* Edit review */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(rev)}
                            title="Edit review"
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high cursor-pointer transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>

                          {/* Delete review */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmReview(rev)}
                            title="Delete review"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination Footer ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 bg-[#FAF5F0] border-t border-[#ECDCD5] font-body text-[12px]">
            <span className="text-on-surface-variant">
              Page {page} of {totalPages} ({totalCount} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-[#ECDCD5] bg-white text-on-surface hover:bg-surface-container disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-[#ECDCD5] bg-white text-on-surface hover:bg-surface-container disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── View Review Modal ── */}
      <AnimatePresence>
        {viewingReview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingReview(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-surface rounded-2xl border border-[#ECDCD5] shadow-2xl p-6 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <StatusBadge status={viewingReview.status} />
                  <h3 className="font-display text-[20px] font-bold text-on-surface mt-2">
                    {viewingReview.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingReview(null)}
                  className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Product Info */}
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-[#ECDCD5] mb-4 flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-[#ECDCD5]">
                  <Image
                    src={viewingReview.product?.images?.[0] || "/images/cat-face-cream.webp"}
                    alt={viewingReview.product?.name || "Product"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                    Associated Product
                  </span>
                  <span className="font-bold text-on-surface text-[14px]">
                    {viewingReview.product?.name || "Product"}
                  </span>
                  <span className="text-[11px] text-on-surface-variant/70 capitalize">
                    {viewingReview.product?.category}
                  </span>
                </div>
              </div>

              {/* Rating & Reviewer */}
              <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-white rounded-xl border border-[#ECDCD5]/70 text-[12px] font-body">
                <div>
                  <span className="text-on-surface-variant/70 text-[11px]">Rating:</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <StarRating count={viewingReview.rating} />
                    <span className="font-bold text-on-surface">{viewingReview.rating}/5</span>
                  </div>
                </div>
                <div>
                  <span className="text-on-surface-variant/70 text-[11px]">Reviewer:</span>
                  <p className="font-semibold text-on-surface">{viewingReview.customer_name}</p>
                  {viewingReview.verified_purchase && (
                    <span className="text-emerald-700 text-[11px] font-medium flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px]">verified</span> Verified Purchase
                    </span>
                  )}
                </div>
              </div>

              {/* Full Comment */}
              <div className="mb-4">
                <span className="font-body text-[11px] font-semibold uppercase text-on-surface-variant">
                  Review Text:
                </span>
                <p className="mt-1 p-3.5 bg-white rounded-xl border border-[#ECDCD5]/70 text-[13.5px] font-body text-on-surface whitespace-pre-line leading-relaxed">
                  {viewingReview.comment}
                </p>
              </div>

              {/* Admin Notes */}
              {viewingReview.admin_notes && (
                <div className="mb-4">
                  <span className="font-body text-[11px] font-semibold uppercase text-on-surface-variant">
                    Internal Admin Notes:
                  </span>
                  <p className="mt-1 p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-[12px] font-body text-amber-900">
                    {viewingReview.admin_notes}
                  </p>
                </div>
              )}

              {/* Metadata */}
              <div className="text-[11px] text-on-surface-variant/70 pt-3 border-t border-[#ECDCD5] flex justify-between">
                <span>Submitted: {new Date(viewingReview.created_at).toLocaleString()}</span>
                <span>Updated: {new Date(viewingReview.updated_at).toLocaleString()}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Add / Edit Review Modal ── */}
      <AnimatePresence>
        {(isAddModalOpen || editingReview) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isSaving) {
                  setIsAddModalOpen(false);
                  setEditingReview(null);
                }
              }}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-surface rounded-2xl border border-[#ECDCD5] shadow-2xl p-6 overflow-y-auto max-h-[92vh]"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                    {editingReview ? "Modify Content & Status" : "Create New Record"}
                  </span>
                  <h3 className="font-display text-[22px] font-bold text-on-surface">
                    {editingReview ? "Edit Review" : "Add Review"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingReview(null);
                  }}
                  className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <form onSubmit={editingReview ? handleSaveEdit : handleSaveAdd} className="flex flex-col gap-4 font-body text-[13px]">
                {/* Product Association */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="modal-product" className="font-semibold text-on-surface text-[12px]">
                    Product Association <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="modal-product"
                    required
                    value={formData.product_id}
                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                    className="w-full bg-white border border-[#ECDCD5] rounded-xl px-3 py-2 text-on-surface focus:outline-primary cursor-pointer"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating & Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="modal-rating" className="font-semibold text-on-surface text-[12px]">
                      Rating (1 to 5) <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="modal-rating"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value, 10) })}
                      className="w-full bg-white border border-[#ECDCD5] rounded-xl px-3 py-2 text-on-surface focus:outline-primary cursor-pointer"
                    >
                      <option value="5">5 Stars ★★★★★</option>
                      <option value="4">4 Stars ★★★★</option>
                      <option value="3">3 Stars ★★★</option>
                      <option value="2">2 Stars ★★</option>
                      <option value="1">1 Star ★</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="modal-status" className="font-semibold text-on-surface text-[12px]">
                      Moderation Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="modal-status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as ReviewStatus })}
                      className="w-full bg-white border border-[#ECDCD5] rounded-xl px-3 py-2 text-on-surface focus:outline-primary cursor-pointer"
                    >
                      <option value="approved">Approved (Public)</option>
                      <option value="pending">Pending</option>
                      <option value="hidden">Hidden</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Reviewer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="modal-name" className="font-semibold text-on-surface text-[12px]">
                      Reviewer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="modal-name"
                      type="text"
                      required
                      placeholder="Customer name"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#ECDCD5] text-on-surface focus:outline-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="modal-email" className="font-semibold text-on-surface text-[12px]">
                      Email (optional)
                    </label>
                    <input
                      id="modal-email"
                      type="email"
                      placeholder="customer@example.com"
                      value={formData.customer_email}
                      onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#ECDCD5] text-on-surface focus:outline-primary"
                    />
                  </div>
                </div>

                {/* Verified Purchase Toggle */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="modal-verified"
                    type="checkbox"
                    checked={formData.verified_purchase}
                    onChange={(e) => setFormData({ ...formData, verified_purchase: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="modal-verified" className="text-on-surface font-medium cursor-pointer">
                    Mark as Verified Purchase
                  </label>
                </div>

                {/* Review Headline */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="modal-title" className="font-semibold text-on-surface text-[12px]">
                    Review Title / Headline <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="modal-title"
                    type="text"
                    required
                    placeholder="Short summary of customer feedback"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#ECDCD5] text-on-surface focus:outline-primary"
                  />
                </div>

                {/* Review Comment */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="modal-comment" className="font-semibold text-on-surface text-[12px]">
                    Review Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="modal-comment"
                    required
                    rows={4}
                    placeholder="Full review text"
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#ECDCD5] text-on-surface focus:outline-primary resize-y"
                  />
                </div>

                {/* Admin Notes */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="modal-notes" className="font-semibold text-on-surface text-[12px]">
                    Internal Notes (Admin only)
                  </label>
                  <input
                    id="modal-notes"
                    type="text"
                    placeholder="Optional moderation notes"
                    value={formData.admin_notes}
                    onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#ECDCD5] text-on-surface focus:outline-primary"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ECDCD5]">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingReview(null);
                    }}
                    className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl font-semibold text-white shadow-md cursor-pointer disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #B06080, #8A4060)" }}
                  >
                    {isSaving ? "Saving..." : editingReview ? "Save Changes" : "Create Review"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {deleteConfirmReview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setDeleteConfirmReview(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-surface rounded-2xl border border-rose-200 shadow-2xl p-6"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[26px]">warning</span>
              </div>
              <h3 className="font-display text-[20px] font-bold text-on-surface mb-2">
                Delete Review?
              </h3>
              <p className="font-body text-[13.5px] text-on-surface-variant leading-relaxed mb-6">
                Are you sure you want to delete the review &ldquo;<strong>{deleteConfirmReview.title}</strong>&rdquo; by {deleteConfirmReview.customer_name}? This action cannot be undone and will update the product&apos;s calculated rating.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeleteConfirmReview(null)}
                  className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high cursor-pointer font-body text-[13px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteConfirm}
                  className="px-5 py-2.5 rounded-xl font-body text-[13px] font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
