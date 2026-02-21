import communityImage from "@/assets/community.jpg";

const CommunitySection = () => {
  return (
    <section className="py-24 ankara-pattern-bg">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full border border-naija-gold/30 text-naija-gold font-accent text-xs tracking-widest uppercase mb-4">
              The Movement
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-black text-foreground mb-6">
              Na We <span className="naija-gradient-text">Own Am</span>
            </h2>
            <p className="font-body text-muted-foreground text-lg mb-6">
              "Nigeria no be just country. Na feeling. Na spirit. Na vibe wey no need explanation for person wey sabi — and na just one QR scan to prove am for person wey no sabi."
            </p>

            <div className="space-y-4 mb-8">
              {[
                "Post your drip on the community wall 📸",
                "Track limited editions worldwide 🌍",
                "Connect with Naija fam from Lagos to London 🤝",
                "Verify and resell with confidence 💎",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 font-body text-foreground text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            <a
              href="#"
              className="inline-flex px-8 py-4 rounded-lg font-body font-semibold text-base bg-secondary text-secondary-foreground hover:brightness-110 transition-all duration-300"
            >
              Join the Community
            </a>
          </div>

          {/* Image */}
          <div className="rounded-2xl overflow-hidden border border-border">
            <img
              src={communityImage}
              alt="Naija Originals community wearing cultural fashion"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
