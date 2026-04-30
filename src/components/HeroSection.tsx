import { ArrowRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, type Easing } from "framer-motion";

const easeOut: Easing = [0, 0, 0.2, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.7, ease: easeOut },
  }),
};

/**
 * Editorial hero inspired by Velour — massive split display type
 * framing a central subject mark, micro // labels, single accent color.
 */
const HeroSection = () => {
  return (
    <section className="relative pt-24 md:pt-28 pb-10 md:pb-16 overflow-hidden bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="relative bg-card rounded-2xl md:rounded-[2rem] overflow-hidden border border-border min-h-[78vh] md:min-h-[88vh]">
          {/* Top meta bar */}
          <div className="absolute top-5 md:top-8 left-5 md:left-10 right-5 md:right-10 flex items-start justify-between z-20 pointer-events-none">
            <span className="font-accent text-[10px] md:text-xs font-medium tracking-[0.2em] text-foreground/70">
              //CULTURE
            </span>
            <span className="font-accent text-[10px] md:text-xs font-medium tracking-[0.2em] text-foreground/70 text-right leading-relaxed">
              //AUTHENTICATED
              <br />
              FOR LIFE.
            </span>
          </div>

          {/* Hero typography grid */}
          <div className="relative h-full grid grid-cols-12 items-center pt-24 pb-32 md:pt-32 md:pb-40 px-5 md:px-10">
            {/* Left word */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="col-span-12 md:col-span-4 z-10"
            >
              <h1 className="font-accent font-black tracking-[-0.04em] leading-[0.85] text-foreground text-[18vw] md:text-[9vw] lg:text-[8.5vw]">
                where
                <br />
                <span className="text-foreground">— style</span>
              </h1>
            </motion.div>

            {/* Center subject — VEXO-minimal NG mark */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: easeOut, delay: 0.1 }}
              className="col-span-12 md:col-span-4 flex justify-center items-center order-first md:order-none my-6 md:my-0 z-0"
            >
              <div className="relative">
                {/* Soft radial backdrop */}
                <div
                  aria-hidden
                  className="absolute inset-0 -m-12 rounded-full opacity-70"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 50%, hsl(var(--muted)) 0%, transparent 70%)",
                  }}
                />
                <div className="relative w-[55vw] h-[55vw] max-w-[420px] max-h-[420px] md:w-[28vw] md:h-[28vw] flex items-center justify-center">
                  {/* Concentric rings */}
                  <div className="absolute inset-0 rounded-full border border-foreground/10" />
                  <div className="absolute inset-6 rounded-full border border-foreground/15" />
                  <div className="absolute inset-12 rounded-full bg-secondary" />
                  <span className="relative font-accent font-black text-secondary-foreground text-[18vw] md:text-[9vw] tracking-[-0.06em] leading-none">
                    NG
                  </span>
                  {/* Accent dot */}
                  <span className="absolute -top-2 -right-2 w-10 h-10 md:w-14 md:h-14 rounded-full bg-primary flex items-center justify-center shadow-lg">
                    <Plus className="w-5 h-5 md:w-7 md:h-7 text-primary-foreground" strokeWidth={3} />
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Right word */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="col-span-12 md:col-span-4 z-10 md:text-right"
            >
              <h2 className="font-accent font-black tracking-[-0.04em] leading-[0.85] text-foreground text-[18vw] md:text-[9vw] lg:text-[8.5vw]">
                lives
                <br />
                <span className="text-primary">— now.</span>
              </h2>
            </motion.div>
          </div>

          {/* Bottom meta row */}
          <div className="absolute bottom-5 md:bottom-10 left-5 md:left-10 right-5 md:right-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 z-20">
            {/* Description */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="max-w-xs"
            >
              <span className="font-accent text-[10px] md:text-xs font-medium tracking-[0.2em] text-foreground/60 block mb-2">
                //FASHION
              </span>
              <p className="font-body text-sm md:text-[15px] text-foreground/80 leading-snug">
                Wearable Naija culture wey you fit prove. Curated drops, QR-verified, every piece numbered.
              </p>
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/shop"
                  className="px-6 py-3 rounded-full font-accent font-semibold text-xs bg-secondary text-secondary-foreground hover:bg-foreground transition-colors uppercase tracking-[0.15em] inline-flex items-center justify-center gap-2"
                >
                  Shop now <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/verify"
                  className="px-6 py-3 rounded-full font-accent font-semibold text-xs border border-foreground/30 text-foreground hover:bg-foreground hover:text-background transition-colors uppercase tracking-[0.15em] inline-flex items-center justify-center"
                >
                  Verify product
                </Link>
              </div>
            </motion.div>

            {/* Series */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={4}
              className="md:text-center"
            >
              <span className="font-accent text-[10px] md:text-xs font-medium tracking-[0.2em] text-foreground/60 block mb-1">
                / Genesis
              </span>
              <span className="font-body text-sm md:text-base text-foreground/90">
                Collection 2026
              </span>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={5}
              className="md:text-right"
            >
              <p className="font-accent text-3xl md:text-5xl font-black text-foreground tracking-tight leading-none">
                15M<span className="text-primary">+</span>
              </p>
              <span className="font-accent text-[10px] md:text-xs font-medium tracking-[0.2em] text-foreground/60 uppercase">
                Diaspora we inspire
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
