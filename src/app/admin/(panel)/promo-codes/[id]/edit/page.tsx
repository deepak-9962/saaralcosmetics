"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PromoCodeForm from "@/components/admin/promo/PromoCodeForm";
import type { PromoCode } from "@/lib/types";

export default function EditPromoCodePage() {
  const params = useParams<{ id: string }>();
  const [promo, setPromo] = useState<PromoCode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/admin/promo-codes/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.code) {
          setPromo(data.code);
        } else {
          setError(data.error ?? "Promo code not found.");
        }
      })
      .catch(() => setError("Failed to load promo code."))
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

  if (error || !promo) {
    return (
      <div className="max-w-[720px] mx-auto px-6 py-8">
        <div className="p-6 rounded-xl bg-error-container/20 border border-error/20 text-center">
          <span className="material-symbols-outlined text-[32px] text-error mb-3 block">error</span>
          <p className="font-body text-[14px] text-error">{error ?? "Promo code not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display text-[30px] text-on-surface">Edit Promo Code</h1>
        <p className="font-body text-[14px] text-on-surface-variant mt-1">
          Editing{" "}
          <code className="font-body text-[13px] bg-surface-container px-2 py-0.5 rounded-md">
            {promo.code}
          </code>
          {promo.times_used > 0 && (
            <span className="ml-2 font-body text-[12px] text-on-surface-variant/70">
              · Used {promo.times_used} time{promo.times_used !== 1 ? "s" : ""}
            </span>
          )}
        </p>
      </div>
      <PromoCodeForm initialData={promo} />
    </div>
  );
}
