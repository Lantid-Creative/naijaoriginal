import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, type Easing } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const easeOut: Easing = [0, 0, 0.2, 1];

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative pt-24 md:pt-28 pb-12 md:pb-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Eyebrow */}
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="inline-block font-accent text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-primary uppercase mb-5"
          >
            // Genesis · Collection 2026
          </motion.span>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut, delay: 0.05 }}
            className="font-accent font-black tracking-[-0.03em] leading-[0.95] text-foreground text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
          >
            {t("hero.left.l1")} {t("hero.left.l2")}
            <br />
            <span className="text-primary">{t("hero.right.l1")} {t("hero.right.l2")}</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut, delay: 0.15 }}
            className="mt-6 md:mt-8 font-body text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            {t("hero.desc")}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut, delay: 0.25 }}
            className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link
              to="/shop"
              className="px-7 py-3.5 rounded-full font-accent font-semibold text-sm bg-secondary text-secondary-foreground hover:bg-foreground transition-colors uppercase tracking-[0.15em] inline-flex items-center justify-center gap-2"
            >
              {t("hero.shop")} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/verify"
              className="px-7 py-3.5 rounded-full font-accent font-semibold text-sm border border-foreground/20 text-foreground hover:bg-foreground hover:text-background transition-colors uppercase tracking-[0.15em] inline-flex items-center justify-center"
            >
              {t("hero.verify")}
            </Link>
          </motion.div>

          {/* Stat */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 md:mt-16 pt-8 border-t border-border flex items-center justify-center gap-3"
          >
            <span className="font-accent text-2xl md:text-3xl font-black text-foreground">
              15M<span className="text-primary">+</span>
            </span>
            <span className="font-accent text-[11px] md:text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
              {t("hero.diaspora")}
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
