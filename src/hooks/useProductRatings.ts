import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RatingData {
  avg: number;
  count: number;
}

export const useProductRatings = (productIds: string[]) => {
  const [ratings, setRatings] = useState<Record<string, RatingData>>({});

  useEffect(() => {
    if (productIds.length === 0) return;

    const fetchRatings = async () => {
      const { data } = await supabase
        .from("product_reviews")
        .select("product_id, rating")
        .eq("is_approved", true)
        .in("product_id", productIds);

      if (data) {
        const map: Record<string, { sum: number; count: number }> = {};
        data.forEach((r) => {
          if (!map[r.product_id]) map[r.product_id] = { sum: 0, count: 0 };
          map[r.product_id].sum += r.rating;
          map[r.product_id].count += 1;
        });
        const result: Record<string, RatingData> = {};
        Object.entries(map).forEach(([id, { sum, count }]) => {
          result[id] = { avg: sum / count, count };
        });
        setRatings(result);
      }
    };
    fetchRatings();
  }, [productIds.join(",")]);

  return ratings;
};
