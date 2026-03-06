import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "recently_viewed_products";
const MAX_ITEMS = 12;

interface RecentProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  image_url: string;
  viewedAt: number;
}

export const useRecentlyViewed = () => {
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setRecentProducts(JSON.parse(stored));
    } catch {}
  }, []);

  const addToRecentlyViewed = useCallback((product: Omit<RecentProduct, "viewedAt">) => {
    setRecentProducts((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      const updated = [{ ...product, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { recentProducts, addToRecentlyViewed };
};
