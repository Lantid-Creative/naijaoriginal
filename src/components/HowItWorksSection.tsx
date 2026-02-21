import { QrCode, Shield, UserCheck, BarChart3 } from "lucide-react";
import qrAuthImage from "@/assets/qr-auth.jpg";

const steps = [
  {
    icon: QrCode,
    title: "Scan the Code",
    pidgin: "Just point your phone — e easy like that!",
    description: "Every Naija Originals product carry unique QR code wey you fit scan with any phone camera.",
  },
  {
    icon: Shield,
    title: "Verify Authenticity",
    pidgin: "Na real thing, no be counterfeit!",
    description: "The scan go show you certificate of authenticity — product name, edition number, and the story behind am.",
  },
  {
    icon: UserCheck,
    title: "Claim Ownership",
    pidgin: "Register am for your name, e don be your own!",
    description: "Register the product for your name. Create digital ownership record wey nobody fit deny.",
  },
  {
    icon: BarChart3,
    title: "Join the Community",
    pidgin: "Na we dey run am — one Naija family!",
    description: "Post your drip on the community wall. Track limited editions. Resell with verified proof.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="verify" className="py-24 ankara-pattern-bg">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full border border-naija-gold/30 text-naija-gold font-accent text-xs tracking-widest uppercase mb-4">
            QR Authentication
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-black text-foreground mb-4">
            How E <span className="naija-gradient-text">Dey Work</span>
          </h2>
          <p className="font-body text-muted-foreground max-w-lg mx-auto">
            One scan dey confirm say your piece na the real deal. No stories, no wahala.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative order-2 lg:order-1">
            <div className="rounded-2xl overflow-hidden animate-pulse-glow">
              <img
                src={qrAuthImage}
                alt="QR code on premium Ankara fabric"
                className="w-full h-auto rounded-2xl"
              />
            </div>
          </div>

          {/* Steps */}
          <div className="order-1 lg:order-2 space-y-6">
            {steps.map((step, index) => (
              <div key={step.title} className="naija-card p-6 flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-accent text-xs text-secondary font-semibold">STEP {index + 1}</span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-1">{step.title}</h3>
                  <p className="font-body text-sm text-muted-foreground italic mb-2">"{step.pidgin}"</p>
                  <p className="font-body text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
