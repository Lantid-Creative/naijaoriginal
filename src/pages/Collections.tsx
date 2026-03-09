import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useCollections } from "@/hooks/useCollections";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Collections = () => {
  const { collections, loading } = useCollections();

  const seasonalCollections = collections.filter((c) => c.type === "seasonal");
  const giftCollections = collections.filter((c) => c.type === "gift");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="py-8 md:py-12"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-accent text-xs font-semibold tracking-widest uppercase mb-3">
              Collections
            </span>
            <h1 className="font-accent text-3xl md:text-5xl font-black text-foreground mb-2">
              Curated For You
            </h1>
            <p className="font-body text-muted-foreground max-w-2xl text-sm md:text-base">
              From seasonal vibes to perfect gift selections, we don arrange am well-well for you. 🇳🇬
            </p>
          </motion.div>

          {loading ? (
            <div className="space-y-12">
              {[1, 2].map((section) => (
                <div key={section} className="space-y-6">
                  <div className="h-8 w-48 bg-muted rounded animate-pulse" />
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border animate-pulse">
                        <div className="aspect-[4/3] bg-muted" />
                        <div className="p-5 space-y-2">
                          <div className="h-6 bg-muted rounded w-3/4" />
                          <div className="h-4 bg-muted rounded w-full" />
                          <div className="h-4 bg-muted rounded w-5/6" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-16">
              {/* Seasonal Collections */}
              {seasonalCollections.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-accent text-2xl md:text-3xl font-black text-foreground">
                      Seasonal Collections
                    </h2>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {seasonalCollections.map((collection, i) => (
                      <motion.div
                        key={collection.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                      >
                        <Link
                          to={`/collections/${collection.slug}`}
                          className="bg-card rounded-2xl overflow-hidden border border-border group block hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                        >
                          <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center relative overflow-hidden">
                            <div className="text-6xl md:text-7xl group-hover:scale-110 transition-transform duration-500">
                              {collection.icon || "🎁"}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                          <div className="p-5">
                            <h3 className="font-accent text-lg md:text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                              {collection.name}
                            </h3>
                            {collection.pidgin_tagline && (
                              <p className="font-body text-xs text-muted-foreground italic mb-2">
                                "{collection.pidgin_tagline}"
                              </p>
                            )}
                            <p className="font-body text-sm text-muted-foreground line-clamp-2 mb-3">
                              {collection.description}
                            </p>
                            <div className="flex items-center gap-1 text-primary font-accent text-sm font-semibold">
                              Explore <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Gift Collections */}
              {giftCollections.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-accent text-2xl md:text-3xl font-black text-foreground">
                      Gift Collections
                    </h2>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {giftCollections.map((collection, i) => (
                      <motion.div
                        key={collection.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                      >
                        <Link
                          to={`/collections/${collection.slug}`}
                          className="bg-card rounded-2xl overflow-hidden border border-border group block hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                        >
                          <div className="aspect-[4/3] bg-gradient-to-br from-accent/10 via-primary/10 to-secondary/10 flex items-center justify-center relative overflow-hidden">
                            <div className="text-6xl md:text-7xl group-hover:scale-110 transition-transform duration-500">
                              {collection.icon || "🎁"}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                          <div className="p-5">
                            <h3 className="font-accent text-lg md:text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                              {collection.name}
                            </h3>
                            {collection.pidgin_tagline && (
                              <p className="font-body text-xs text-muted-foreground italic mb-2">
                                "{collection.pidgin_tagline}"
                              </p>
                            )}
                            <p className="font-body text-sm text-muted-foreground line-clamp-2 mb-3">
                              {collection.description}
                            </p>
                            <div className="flex items-center gap-1 text-primary font-accent text-sm font-semibold">
                              Explore <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Collections;
