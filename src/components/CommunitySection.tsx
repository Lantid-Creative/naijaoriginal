import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import communityImage from "@/assets/community.jpg";

const features = [
  "Post your drip on the community wall",
  "Track limited editions worldwide",
  "Connect with Naija fam globally",
  "Verify and resell with confidence",
];

const CommunitySection = () => {
  return (
    <section id="story" className="py-24">
      <div className="container mx-auto px-6">
        <div className="bg-card rounded-3xl border border-border overflow-hidden">
          <div className="grid lg:grid-cols-2">
            {/* Text */}
            <div className="p-10 md:p-16 flex flex-col justify-center">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-accent text-xs font-semibold tracking-widest uppercase mb-6 w-fit">
                The Movement
              </span>
              <h2 className="font-accent text-4xl md:text-5xl font-black text-foreground mb-6">
                Join the <span className="text-primary">Culture</span>
              </h2>
              <p className="font-body text-muted-foreground text-lg mb-8 max-w-md">
                Nigeria isn't just a country — it's a feeling, a spirit, a vibe. And it's just one QR scan to prove it.
              </p>

              <div className="space-y-4 mb-10">
                {features.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="font-body text-foreground text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/auth"
                className="inline-flex px-8 py-4 rounded-full font-accent font-semibold text-sm bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all duration-300 uppercase tracking-wide items-center gap-2 w-fit"
              >
                Join the Community <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Image */}
            <div className="relative min-h-[400px]">
              <img
                src={communityImage}
                alt="Naija Originals community wearing cultural fashion"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
