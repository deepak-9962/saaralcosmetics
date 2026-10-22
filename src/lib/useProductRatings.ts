"use client";

import { useState, useEffect } from "react";
import type { ProductRatingSnapshot } from "@/lib/types";

let cachedRatings: Record<string, ProductRatingSnapshot> | null = null;
let fetchPromise: Promise<Record<string, ProductRatingSnapshot>> | null = null;
const listeners = new Set<(ratings: Record<string, ProductRatingSnapshot>) => void>();

export async function fetchRatingsMap(): Promise<Record<string, ProductRatingSnapshot>> {
  if (cachedRatings) return cachedRatings;
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch("/api/products/ratings")
    .then((res) => (res.ok ? res.json() : { ratings: {} }))
    .then((data) => {
      cachedRatings = data.ratings || {};
      listeners.forEach((listener) => listener(cachedRatings!));
      return cachedRatings!;
    })
    .catch((err) => {
      console.warn("Failed to fetch product ratings:", err);
      return {};
    })
    .finally(() => {
      fetchPromise = null;
    });

  return fetchPromise;
}

export function invalidateRatingsCache() {
  cachedRatings = null;
  fetchRatingsMap();
}

export function useProductRatings() {
  const [ratings, setRatings] = useState<Record<string, ProductRatingSnapshot>>(
    cachedRatings || {}
  );

  useEffect(() => {
    const handler = (newRatings: Record<string, ProductRatingSnapshot>) => {
      setRatings({ ...newRatings });
    };
    listeners.add(handler);

    if (!cachedRatings) {
      fetchRatingsMap().then((data) => setRatings(data));
    }

    return () => {
      listeners.delete(handler);
    };
  }, []);

  return {
    ratings,
    getRating: (productId: string) => ratings[productId] || null,
    refresh: invalidateRatingsCache,
  };
}
