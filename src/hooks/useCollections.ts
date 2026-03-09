import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  pidgin_tagline: string | null;
  type: string;
  icon: string | null;
  banner_image_url: string | null;
  display_order: number;
}

export const useCollections = (type?: string) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      let query = supabase
        .from("product_collections")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (type) {
        query = query.eq("type", type);
      }

      const { data } = await query;
      setCollections(data || []);
      setLoading(false);
    };

    fetchCollections();
  }, [type]);

  return { collections, loading };
};
