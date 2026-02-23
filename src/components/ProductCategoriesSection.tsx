import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shirt, Watch, Backpack, Footprints, Home, Sparkles, ArrowRight, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import productsShowcase from "@/assets/products-showcase.jpg";

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
    <section id="shop" className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 md:mb-12 gap-4"
        >
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-accent text-xs font-semibold tracking-widest uppercase mb-4">
              Our Top Picks
            </span>
            <h2 className="font-accent text-3xl md:text-5xl font-black text-foreground">
              Top Culture Gear For
              <br />
              <span className="text-primary">Peak</span> Performance!
            </h2>
          </div>
          <p className="font-body text-muted-foreground max-w-sm text-sm md:text-base">
            Discover the best of our collection, designed to power your cultural expression all year round.
          </p>
        </motion.div>

        {/* Featured cards */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
          {categories.slice(0, 2).map((cat, i) => {
            const Icon = iconMap[cat.icon] || Sparkles;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <Link
                  to={`/shop?category=${cat.id}`}
                  className="group relative rounded-2xl md:rounded-3xl overflow-hidden min-h-[280px] md:min-h-[400px] bg-secondary flex flex-col justify-end p-6 md:p-8 border border-border block"
                >
                  <img
                    src={productsShowcase}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity"
                    loading="lazy"
                  />
                  <div className="relative z-10">
                    <span className="font-accent text-xs text-secondary-foreground/60 uppercase tracking-wider mb-2 block">
                      {cat.pidgin || "Explore"}
                    </span>
                    <h3 className="font-accent text-2xl md:text-4xl font-black text-secondary-foreground leading-tight">
                      {cat.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Smaller category cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {categories.slice(2).map((cat, i) => {
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
