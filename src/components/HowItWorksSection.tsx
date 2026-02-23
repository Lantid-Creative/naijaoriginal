import { QrCode, Shield, UserCheck, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: QrCode,
    num: "01",
    title: "Scan the Code",
    description: "Every product carries a unique QR code. Just point your phone camera — it's that simple.",
  },
  {
    icon: Shield,
    num: "02",
    title: "Verify Authenticity",
    description: "Instantly see the certificate of authenticity — product name, edition number, and the story behind it.",
  },
  {
    icon: UserCheck,
    num: "03",
    title: "Claim Ownership",
    description: "Register the product in your name. Create a digital ownership record that nobody can deny.",
  },
  {
    icon: BarChart3,
    num: "04",
    title: "Join the Community",
    description: "Post your drip on the community wall. Track limited editions. Resell with verified proof.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="verify" className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-accent text-xs font-semibold tracking-widest uppercase mb-4">
            How It Works
          </span>
          <h2 className="font-accent text-4xl md:text-5xl font-black text-foreground mb-4">
            QR Verified <span className="text-primary">Authenticity</span>
          </h2>
          <p className="font-body text-muted-foreground max-w-lg mx-auto">
            One scan confirms your piece is the real deal. No stories, no wahala.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div key={step.title} className="naija-card p-8 text-center">
              <span className="font-accent text-5xl font-black text-primary/15 block mb-4">{step.num}</span>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <step.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-accent text-lg font-bold text-foreground mb-2">{step.title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
