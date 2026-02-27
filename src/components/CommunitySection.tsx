import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import communityImage from "@/assets/community.jpg";

const features = [
  "Post your drip on the community wall",
  "Track limited editions worldwide",
  "Connect with Naija fam globally",
  "Verify and resell with confidence",
];

const CommunitySection = () => {
  return (
    <section id="story" className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="bg-card rounded-2xl md:rounded-3xl border border-border overflow-hidden"
        >
          <div className="grid lg:grid-cols-2">
            {/* Text */}
            <div className="p-6 md:p-16 flex flex-col justify-center">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-accent text-xs font-semibold tracking-widest uppercase mb-4 md:mb-6 w-fit">
                The Movement
              </span>
              <h2 className="font-accent text-3xl md:text-5xl font-black text-foreground mb-4 md:mb-6">
                Join the <span className="text-primary">Culture</span>
              </h2>
              <p className="font-body text-muted-foreground text-base md:text-lg mb-6 md:mb-8 max-w-md">
                Nigeria isn't just a country — it's a feeling, a spirit, a vibe. And it's just one QR scan to prove it.
              </p>

              <div className="space-y-3 md:space-y-4 mb-8 md:mb-10">
                {features.map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="font-body text-foreground text-sm">{item}</span>
                  </motion.div>
                ))}
              </div>

              <Link
                to="/auth"
                className="inline-flex px-8 py-3.5 md:py-4 rounded-full font-accent font-semibold text-sm bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all duration-300 uppercase tracking-wide items-center gap-2 w-fit"
              >
                Join the Community <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Image */}
            <div className="relative min-h-[280px] md:min-h-[400px]">
              <img
                src={communityImage}
                alt="Naija Original community wearing cultural fashion"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CommunitySection;
