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
    <section id="story" className="py-16 md:py-24 bg-background border-t border-border">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <span className="font-accent text-xs font-semibold tracking-[0.25em] text-primary uppercase mb-4 block">
            // The Movement
          </span>
          <h2 className="font-accent font-black tracking-[-0.03em] leading-[0.95] text-foreground text-4xl sm:text-5xl md:text-6xl">
            Join the <span className="text-primary">culture.</span>
          </h2>
          <p className="font-body text-muted-foreground text-base sm:text-lg mt-5 leading-relaxed">
            Nigeria no be just country — na feeling, na spirit, na vibe. And e just dey one QR scan to prove am.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          {features.map((f, i) => (
            <motion.div
              key={f.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="bg-card border border-border rounded-2xl p-6 hover:border-primary/40 transition-colors"
            >
              <span className="font-accent text-xs font-bold text-primary tracking-wider block mb-3">
                {f.n}
              </span>
              <h3 className="font-accent text-lg font-bold text-foreground mb-2">
                {f.t}
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-snug">
                {f.d}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/auth"
            className="inline-flex px-7 py-3.5 rounded-full font-accent font-semibold text-sm bg-secondary text-secondary-foreground hover:bg-foreground transition-colors uppercase tracking-[0.15em] items-center gap-2"
          >
            Join the community <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
