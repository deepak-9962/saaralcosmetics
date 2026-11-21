"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PurchaseLimitForm from "@/components/admin/limits/PurchaseLimitForm";
import type { PurchaseLimitRule } from "@/lib/types";

export default function EditPurchaseLimitPage() {
  const params = useParams<{ id: string }>();
  const [rule, setRule] = useState<PurchaseLimitRule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/admin/purchase-limits/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.rule) {
          setRule(data.rule);
        } else {
          setError(data.error ?? "Rule not found.");
        }
      })
      .catch(() => setError("Failed to load purchase limit rule."))
      .finally(() => setIsLoading(false));
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="material-symbols-outlined animate-spin text-[32px] text-primary">
          progress_activity
        </span>
      </div>
    );
  }

  if (error || !rule) {
    return (
      <div className="max-w-[760px] mx-auto px-6 py-8">
        <div className="p-6 rounded-xl bg-error-container/20 border border-error/20 text-center">
          <span className="material-symbols-outlined text-[32px] text-error mb-3 block">error</span>
          <p className="font-body text-[14px] text-error">{error ?? "Rule not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[760px] mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display text-[30px] text-on-surface">Edit Purchase Limit</h1>
        <p className="font-body text-[14px] text-on-surface-variant mt-1">
          Update restriction rules, quantity limits, or tracking periods.
        </p>
      </div>
      <PurchaseLimitForm initialData={rule} />
    </div>
  );
}
