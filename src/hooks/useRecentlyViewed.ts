import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "recently_viewed_ids_v2";
const LEGACY_KEY = "recently_viewed_products";
const MAX_ITEMS = 12;

interface RecentEntry {
  id: string;
  viewedAt: number;
}

export const useRecentlyViewed = () => {
  const [recentIds, setRecentIds] = useState<RecentEntry[]>([]);

  useEffect(() => {
    try {
      // Migrate / clear legacy snapshot cache (had stale name/price/image)
      if (localStorage.getItem(LEGACY_KEY)) {
        try {
          const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || "[]");
          if (Array.isArray(legacy)) {
            const migrated: RecentEntry[] = legacy
              .filter((p: any) => p && p.id)
              .map((p: any) => ({ id: p.id, viewedAt: p.viewedAt || Date.now() }));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          }
        } catch {}
        localStorage.removeItem(LEGACY_KEY);
      }
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setRecentIds(JSON.parse(stored));
    } catch {}
  }, []);

  const addToRecentlyViewed = useCallback((product: { id: string }) => {
    setRecentIds((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      const updated = [{ id: product.id, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { recentIds, addToRecentlyViewed };
};
