import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Search, X, Package, Layers, Tag } from "lucide-react";
import { formatNaira } from "@/lib/format";

interface SearchResult {
  type: "product" | "collection" | "category";
  id: string;
  name: string;
  slug: string;
  image?: string;
  price?: number;
  tagline?: string;
}

const SearchAutocomplete = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    const term = `%${q}%`;

    const [productsRes, collectionsRes, categoriesRes] = await Promise.all([
      supabase
        .from("products")
        .select("id, name, slug, price, pidgin_tagline, product_images(image_url, display_order)")
        .eq("is_active", true)
        .ilike("name", term)
        .order("is_featured", { ascending: false })
        .limit(5),
      supabase
        .from("product_collections")
        .select("id, name, slug, banner_image_url")
        .eq("is_active", true)
        .ilike("name", term)
        .limit(3),
      supabase
        .from("product_categories")
        .select("id, name, slug")
        .ilike("name", term)
        .limit(3),
    ]);

    const items: SearchResult[] = [];

    (categoriesRes.data || []).forEach((c) => {
      items.push({ type: "category", id: c.id, name: c.name, slug: c.slug });
    });

    (collectionsRes.data || []).forEach((c) => {
      items.push({ type: "collection", id: c.id, name: c.name, slug: c.slug, image: c.banner_image_url || undefined });
    });

    (productsRes.data || []).forEach((p: any) => {
      const imgs = [...(p.product_images || [])].sort((a: any, b: any) => a.display_order - b.display_order);
      items.push({
        type: "product", id: p.id, name: p.name, slug: p.slug,
        price: p.price, tagline: p.pidgin_tagline,
        image: imgs[0]?.image_url,
      });
    });

    setResults(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    if (result.type === "product") navigate(`/product/${result.slug}`);
    else if (result.type === "collection") navigate(`/collections/${result.slug}`);
    else if (result.type === "category") navigate(`/shop?category=${result.id}`);
  };

  const getIcon = (type: string) => {
    if (type === "product") return <Package className="w-4 h-4 text-primary" />;
    if (type === "collection") return <Layers className="w-4 h-4 text-secondary" />;
    return <Tag className="w-4 h-4 text-accent-foreground" />;
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="w-36 lg:w-48 pl-8 pr-7 py-1.5 rounded-full bg-muted border border-border font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:w-64 transition-all duration-300"
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults([]); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && query.length >= 2 && (
        <div className="absolute top-full mt-2 right-0 w-80 max-h-96 overflow-y-auto bg-card border border-border rounded-xl shadow-xl z-50">
          {loading ? (
            <div className="p-4 text-center">
              <span className="font-body text-sm text-muted-foreground">Searching...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center">
              <span className="font-body text-sm text-muted-foreground">No results for "{query}"</span>
            </div>
          ) : (
            <div className="py-2">
              {results.map((r) => (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => handleSelect(r)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                >
                  {r.image ? (
                    <img src={r.image} alt={r.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      {getIcon(r.type)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-accent text-sm font-semibold text-foreground truncate">{r.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="font-accent text-[10px] text-muted-foreground uppercase">{r.type}</span>
                      {r.price && <span className="font-body text-xs text-primary font-semibold">{formatNaira(r.price)}</span>}
                    </div>
                  </div>
                </button>
              ))}
              <button
                onClick={() => { navigate(`/shop`); setOpen(false); setQuery(""); }}
                className="w-full px-4 py-2 font-accent text-xs text-primary hover:bg-muted transition-colors text-center"
              >
                View all products →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
