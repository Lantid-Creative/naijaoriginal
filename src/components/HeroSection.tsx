import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  return (
    <section className="relative pt-24 pb-12 overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Main hero card */}
        <div className="relative bg-card rounded-3xl overflow-hidden shadow-sm border border-border">
          <div className="grid lg:grid-cols-2 min-h-[75vh]">
            {/* Left text content */}
            <div className="flex flex-col justify-center p-10 md:p-16 lg:p-20 order-2 lg:order-1">
              <div className="animate-slide-up">
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-accent text-xs font-semibold tracking-widest uppercase mb-6">
                  Authenticated Culture
                </span>
              </div>

              <h1 className="animate-slide-up-delay-1 font-accent text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight text-foreground mb-6">
                GET YOUR
                <br />
                <span className="text-primary">NAIJA</span>
                <br />
                ORIGINALS
              </h1>

              <p className="animate-slide-up-delay-2 font-body text-lg text-muted-foreground max-w-md mb-10">
                Wearable culture. QR-verified authenticity. Every piece tells a Nigerian story you can prove.
              </p>

              <div className="animate-slide-up-delay-3 flex flex-wrap gap-4">
                <Link
                  to="/shop"
                  className="px-8 py-4 rounded-full font-accent font-semibold text-sm bg-primary text-primary-foreground hover:bg-naija-green-glow transition-all duration-300 uppercase tracking-wide flex items-center gap-2"
                >
                  Shop Now <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/verify"
                  className="px-8 py-4 rounded-full font-accent font-semibold text-sm border-2 border-foreground text-foreground hover:bg-foreground hover:text-background transition-all duration-300 uppercase tracking-wide"
                >
                  Explore All
                </Link>
              </div>

              {/* Small info bottom-left */}
              <div className="animate-slide-up-delay-3 mt-12 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1,2,3].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-muted border-2 border-card flex items-center justify-center">
                      <span className="text-xs font-accent font-bold text-muted-foreground">🇳🇬</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-accent text-sm font-semibold text-foreground">15M+ Diaspora</p>
                  <p className="font-body text-xs text-muted-foreground">Rocking verified culture worldwide</p>
                </div>
              </div>
            </div>

            {/* Right image */}
            <div className="relative order-1 lg:order-2 min-h-[400px]">
              <img
                src={heroImage}
                alt="Nigerian fashion model in Ankara streetwear"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Small video preview card */}
              <div className="absolute bottom-6 right-6 w-36 h-24 rounded-xl bg-secondary/80 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-secondary/90 transition-colors border border-border/20 overflow-hidden">
                <Play className="w-8 h-8 text-secondary-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
