import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shirt, Watch, Backpack, Footprints, Home, Sparkles, ArrowRight, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import NaijaArt from "@/components/NaijaArt";

const iconMap: Record<string, LucideIcon> = {
  Shirt, Watch, Backpack, Footprints, Home, Sparkles,
};

const ProductCategoriesSection = () => {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("product_categories")
      .select("*")
      .order("name")
      .then(({ data }) => setCategories(data || []));
  }, []);

  return (
    <section id="shop" className="py-16 md:py-24 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-12 md:mb-16"
        >
          <span className="font-accent text-xs font-semibold tracking-[0.25em] text-primary uppercase mb-4 block">
            // Categories
          </span>
          <h2 className="font-accent font-black tracking-[-0.03em] leading-[0.95] text-foreground text-4xl sm:text-5xl md:text-6xl">
            Shop the <span className="text-primary">culture.</span>
          </h2>
          <p className="font-body text-muted-foreground max-w-lg mx-auto text-base mt-5 leading-relaxed">
            Curated drops designed to power your cultural expression all year round.
          </p>
        </motion.div>

        {/* Unified category grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {categories.map((cat, i) => {
            const Icon = iconMap[cat.icon] || Sparkles;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <Link
                  to={`/shop?category=${cat.id}`}
                  className="naija-card p-4 md:p-6 group block"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <h3 className="font-accent text-sm md:text-base font-bold text-foreground mb-1">{cat.name}</h3>
                  <p className="font-body text-xs text-muted-foreground line-clamp-2">{cat.description}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mt-10 md:mt-12"
        >
          <Link
            to="/shop"
            className="inline-flex px-8 py-3.5 md:py-4 rounded-full font-accent font-semibold text-sm bg-primary text-primary-foreground hover:bg-naija-green-glow transition-all duration-300 uppercase tracking-wide items-center gap-2"
          >
            View All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductCategoriesSection;
