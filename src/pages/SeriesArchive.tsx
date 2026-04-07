import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/format";
import { motion } from "framer-motion";
import { Clock, Sparkles, Filter } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SeriesBadge from "@/components/SeriesBadge";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  series_number: number;
  series_year: number;
  series_name: string;
  product_line: string;
  is_limited_edition: boolean;
  product_images: { image_url: string; display_order: number }[];
}

const SeriesArchive = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeries, setSelectedSeries] = useState<number | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, slug, price, series_number, series_year, series_name, product_line, is_limited_edition, product_images(image_url, display_order)")
        .eq("is_active", true)
        .order("series_number", { ascending: false })
        .order("name", { ascending: true });
      setProducts((data as any) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  // Group by series
  const seriesMap = new Map<number, { year: number; name: string; products: Product[] }>();
  products.forEach((p) => {
    if (selectedSeries !== null && p.series_number !== selectedSeries) return;
    if (!seriesMap.has(p.series_number)) {
      seriesMap.set(p.series_number, { year: p.series_year, name: p.series_name, products: [] });
    }
    seriesMap.get(p.series_number)!.products.push(p);
  });

  const allSeries = [...new Set(products.map((p) => p.series_number))].sort((a, b) => b - a);

  const getImage = (p: Product) => {
    const sorted = [...(p.product_images || [])].sort((a, b) => a.display_order - b.display_order);
    return sorted[0]?.image_url || "/placeholder.svg";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-8 md:py-12 text-center"
          >
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-accent text-xs font-semibold tracking-widest uppercase mb-3">
              <Clock className="w-3.5 h-3.5" /> Product Archive
            </span>
            <h1 className="font-accent text-3xl md:text-5xl font-black text-foreground mb-3">
              The Series Timeline
            </h1>
            <p className="font-body text-muted-foreground max-w-lg mx-auto text-sm md:text-base">
              Every year, the drip levels up. Explore every generation of Naija culture products — from Genesis to the latest drop. 🇳🇬
            </p>
          </motion.div>

          {/* Series filter */}
          <div className="flex items-center gap-2 mb-8 justify-center flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <button
              onClick={() => setSelectedSeries(null)}
              className={`px-4 py-2 rounded-xl font-accent text-sm transition-all ${
                selectedSeries === null
                  ? "bg-primary text-primary-foreground font-bold"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              All Series
            </button>
            {allSeries.map((s) => {
              const info = products.find((p) => p.series_number === s);
              return (
                <button
                  key={s}
                  onClick={() => setSelectedSeries(s)}
                  className={`px-4 py-2 rounded-xl font-accent text-sm transition-all ${
                    selectedSeries === s
                      ? "bg-primary text-primary-foreground font-bold"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  S{s} · {info?.series_year}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl border border-border">
                  <div className="aspect-square bg-muted rounded-t-2xl" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            [...seriesMap.entries()].map(([seriesNum, { year, name, products: seriesProducts }]) => (
              <motion.div
                key={seriesNum}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
              >
                {/* Series header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-accent text-xl md:text-2xl font-bold text-foreground">{name || `Series ${seriesNum}`}</h2>
                    <p className="font-body text-sm text-muted-foreground">{year} · {seriesProducts.length} products</p>
                  </div>
                  <div className="flex-1 h-px bg-border ml-4" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {seriesProducts.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Link
                        to={`/product/${product.slug}`}
                        className="bg-card rounded-2xl overflow-hidden border border-border group block hover:border-primary/30 hover:shadow-lg transition-all"
                      >
                        <div className="aspect-square overflow-hidden relative bg-muted">
                          <img
                            src={getImage(product)}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute top-2 left-2">
                            <SeriesBadge seriesNumber={product.series_number} seriesYear={product.series_year} />
                          </div>
                          {product.is_limited_edition && (
                            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-accent text-[10px] font-bold">
                              Limited
                            </span>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-accent text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                          <p className="font-accent text-sm font-bold text-foreground mt-1">{formatNaira(product.price)}</p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SeriesArchive;
