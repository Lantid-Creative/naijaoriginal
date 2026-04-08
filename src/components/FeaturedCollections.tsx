import { Link } from "react-router-dom";
import { useCollections } from "@/hooks/useCollections";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

const SEASON_SLUGS: Record<string, string> = {
  "harmattan-season": "harmattan",
  "dry-season": "dry",
  "rainy-season": "rainy",
  "festive-season": "festive",
};

function getCurrentSeasonSlug(): string {
  const month = new Date().getMonth(); // 0-indexed
  if (month >= 10 || month <= 1) return "harmattan-season"; // Nov-Feb
  if (month >= 2 && month <= 4) return "dry-season";        // Mar-May
  if (month >= 5 && month <= 8) return "rainy-season";      // Jun-Sep
  return "festive-season";                                    // Oct
}

const FeaturedCollections = () => {
  const { collections, loading } = useCollections();
  const plugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));

  const withBanners = useMemo(() => {
    const all = collections.filter((c) => c.banner_image_url);
    const currentSlug = getCurrentSeasonSlug();
    const idx = all.findIndex((c) => c.slug === currentSlug);
    if (idx > 0) {
      const [current] = all.splice(idx, 1);
      all.unshift(current);
    }
    return all;
  }, [collections]);

  if (loading) {
    return (
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="w-full aspect-[21/9] rounded-2xl" />
        </div>
      </section>
    );
  }

  if (withBanners.length === 0) return null;

  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-accent text-xs font-semibold tracking-widest uppercase mb-4">
              🎯 Collections
            </span>
            <h2 className="font-accent text-3xl md:text-4xl font-black text-foreground">
              Shop By Vibe 🔥
            </h2>
          </div>
          <Link
            to="/collections"
            className="inline-flex items-center gap-2 font-accent text-sm font-semibold text-primary hover:underline"
          >
            View All Collections <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <Carousel
          opts={{ loop: true, align: "start" }}
          plugins={[plugin.current]}
          className="w-full"
        >
          <CarouselContent className="-ml-3 md:-ml-4">
            {withBanners.map((collection) => (
              <CarouselItem
                key={collection.id}
                className="pl-3 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
              >
                <Link
                  to={`/collections/${collection.slug}`}
                  className="group block relative overflow-hidden rounded-2xl aspect-[4/3]"
                >
                  {collection.slug === getCurrentSeasonSlug() && (
                    <span className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-naija-gold text-secondary font-accent text-[10px] font-bold uppercase tracking-wider animate-pulse">
                      🔥 This Season
                    </span>
                  )}
                  <img
                    src={collection.banner_image_url!}
                    alt={collection.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/90 text-primary-foreground font-accent text-[10px] font-semibold uppercase tracking-wider mb-2">
                      {collection.type}
                    </span>
                    <h3 className="font-accent text-lg md:text-xl font-black text-white leading-tight">
                      {collection.name}
                    </h3>
                    {collection.pidgin_tagline && (
                      <p className="font-body text-white/80 text-xs md:text-sm mt-1 line-clamp-1">
                        {collection.pidgin_tagline}
                      </p>
                    )}
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4 bg-background/80 backdrop-blur border-border" />
          <CarouselNext className="hidden md:flex -right-4 bg-background/80 backdrop-blur border-border" />
        </Carousel>
      </div>
    </section>
  );
};

export default FeaturedCollections;
