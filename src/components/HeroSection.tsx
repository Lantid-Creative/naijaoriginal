import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, type Easing } from "framer-motion";
import heroImage from "@/assets/hero-image.jpg";

const easeOut: Easing = [0, 0, 0.2, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: easeOut },
  }),
};

const HeroSection = () => {
  return (
    <section className="relative pt-20 md:pt-24 pb-8 md:pb-12 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="relative bg-card rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-border">
          <div className="grid lg:grid-cols-2 min-h-[60vh] md:min-h-[75vh]">
            {/* Left text content */}
            <div className="flex flex-col justify-center p-6 md:p-16 lg:p-20 order-2 lg:order-1">
              <motion.span
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0}
                className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-accent text-xs font-semibold tracking-widest uppercase mb-4 md:mb-6 w-fit"
              >
                Authenticated Culture 🇳🇬
              </motion.span>

              <motion.h1
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={1}
                className="font-accent text-4xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight text-foreground mb-4 md:mb-6"
              >
                GET YOUR
                <br />
                <span className="text-primary">NAIJA</span>
                <br />
                ORIGINAL
              </motion.h1>

              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={2}
                className="font-body text-base md:text-lg text-muted-foreground max-w-md mb-6 md:mb-10"
              >
                Wearable culture wey you fit prove. QR-verified authenticity. Every piece tell Nigerian story wey nobody fit deny. 🔥
              </motion.p>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={3}
                className="flex flex-col sm:flex-row gap-3 md:gap-4"
              >
                <Link
                  to="/shop"
                  className="px-8 py-3.5 md:py-4 rounded-full font-accent font-semibold text-sm bg-primary text-primary-foreground hover:bg-naija-green-glow transition-all duration-300 uppercase tracking-wide flex items-center justify-center gap-2"
                >
                  Shop Now <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/verify"
                  className="px-8 py-3.5 md:py-4 rounded-full font-accent font-semibold text-sm border-2 border-foreground text-foreground hover:bg-foreground hover:text-background transition-all duration-300 uppercase tracking-wide text-center"
                >
                  Verify Product
                </Link>
              </motion.div>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={4}
                className="mt-8 md:mt-12 flex items-center gap-4"
              >
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-muted border-2 border-card flex items-center justify-center">
                      <span className="text-xs font-accent font-bold text-muted-foreground">🇳🇬</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-accent text-sm font-semibold text-foreground">15M+ Diaspora</p>
                  <p className="font-body text-xs text-muted-foreground">Dey rock verified culture worldwide</p>
                </div>
              </motion.div>
            </div>

            {/* Right image */}
            <motion.div
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative order-1 lg:order-2 min-h-[280px] md:min-h-[400px]"
            >
              <img
                src={heroImage}
                alt="Nigerian fashion model in Ankara streetwear"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 w-28 h-20 md:w-36 md:h-24 rounded-xl bg-secondary/80 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-secondary/90 transition-colors border border-border/20 overflow-hidden">
                <Play className="w-6 h-6 md:w-8 md:h-8 text-secondary-foreground" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
