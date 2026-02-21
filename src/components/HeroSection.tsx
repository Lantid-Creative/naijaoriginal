import { QrCode, ShieldCheck, Users, Globe } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Nigerian fashion models in Ankara streetwear"
          className="w-full h-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center py-20">
        <div className="animate-slide-up">
          <span className="inline-block px-4 py-1.5 rounded-full border border-naija-gold/30 text-naija-gold font-accent text-sm tracking-widest uppercase mb-6">
            🇳🇬 Authenticated Nigerian Culture
          </span>
        </div>

        <h1 className="animate-slide-up-delay-1 font-display text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight mb-6">
          <span className="naija-gradient-text">NAIJA</span>
          <br />
          <span className="text-foreground">ORIGINALS</span>
        </h1>

        <p className="animate-slide-up-delay-2 font-body text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
          Wearable. Verified. Proud.
        </p>

        <p className="animate-slide-up-delay-2 font-body text-base text-muted-foreground max-w-xl mx-auto mb-10 italic">
          "No be every cloth dey carry story. Ours dey carry culture, QR code, and pure vibes."
        </p>

        <div className="animate-slide-up-delay-3 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="#shop"
            className="px-8 py-4 rounded-lg font-body font-semibold text-base bg-primary text-primary-foreground hover:bg-naija-green-glow transition-all duration-300 hover:shadow-[var(--shadow-glow-green)]"
          >
            Shop the Culture
          </a>
          <a
            href="#verify"
            className="px-8 py-4 rounded-lg font-body font-semibold text-base border border-secondary/40 text-secondary hover:border-secondary transition-all duration-300 flex items-center gap-2"
          >
            <QrCode className="w-5 h-5" />
            Scan & Verify
          </a>
        </div>

        {/* Stats */}
        <div className="animate-slide-up-delay-3 mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { icon: ShieldCheck, label: "QR Verified", value: "Every Piece" },
            { icon: Globe, label: "Diaspora", value: "15M+ Strong" },
            { icon: Users, label: "Community", value: "Growing Daily" },
            { icon: QrCode, label: "Editions", value: "Limited Drops" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="w-5 h-5 text-secondary mx-auto mb-2" />
              <div className="font-display text-lg font-bold text-foreground">{stat.value}</div>
              <div className="font-accent text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
