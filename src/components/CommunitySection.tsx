import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { n: "01", t: "Post your drip", d: "Drop your fit on the community wall." },
  { n: "02", t: "Track editions", d: "See where your numbered piece travels worldwide." },
  { n: "03", t: "Connect global", d: "Naija fam dey everywhere — find them." },
  { n: "04", t: "Resell verified", d: "QR proof keeps the resale market clean." },
];

const CommunitySection = () => {
  return (
    <section id="story" className="py-16 md:py-28 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="bg-card rounded-2xl md:rounded-[2rem] border border-border overflow-hidden p-6 md:p-12 lg:p-16"
        >
          {/* Top meta */}
          <div className="flex items-start justify-between mb-10 md:mb-16">
            <span className="font-accent text-[10px] md:text-xs font-medium tracking-[0.2em] text-foreground/60">
              //THE MOVEMENT
            </span>
            <span className="font-accent text-[10px] md:text-xs font-medium tracking-[0.2em] text-foreground/60 text-right">
              /02
            </span>
          </div>

          <div className="grid lg:grid-cols-12 gap-10 md:gap-16">
            {/* Headline */}
            <div className="lg:col-span-7">
              <h2 className="font-accent font-black tracking-[-0.04em] leading-[0.9] text-foreground text-5xl md:text-7xl lg:text-[6.5rem]">
                join the
                <br />
                <span className="text-primary">— culture.</span>
              </h2>
              <p className="font-body text-foreground/70 text-base md:text-lg mt-8 max-w-md leading-relaxed">
                Nigeria no be just country — na feeling, na spirit, na vibe. And e just dey one QR scan to prove am.
              </p>
              <Link
                to="/auth"
                className="mt-8 inline-flex px-7 py-3.5 rounded-full font-accent font-semibold text-xs bg-secondary text-secondary-foreground hover:bg-foreground transition-colors uppercase tracking-[0.15em] items-center gap-2"
              >
                Join the community <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Numbered list */}
            <div className="lg:col-span-5 lg:border-l lg:border-border lg:pl-10">
              <div className="divide-y divide-border">
                {features.map((f, i) => (
                  <motion.div
                    key={f.n}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    className="py-5 first:pt-0 flex gap-5 group"
                  >
                    <span className="font-accent text-xs font-medium text-foreground/40 tracking-wider mt-1">
                      {f.n}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-accent text-lg md:text-xl font-bold text-foreground tracking-tight mb-1 group-hover:text-primary transition-colors">
                        {f.t}
                      </h3>
                      <p className="font-body text-sm text-foreground/60 leading-snug">
                        {f.d}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CommunitySection;
