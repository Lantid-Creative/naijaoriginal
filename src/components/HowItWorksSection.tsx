import { QrCode, Shield, UserCheck, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

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
    <section id="verify" className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-accent text-xs font-semibold tracking-widest uppercase mb-4">
            How It Works
          </span>
          <h2 className="font-accent text-3xl md:text-5xl font-black text-foreground mb-4">
            QR Verified <span className="text-primary">Authenticity</span>
          </h2>
          <p className="font-body text-muted-foreground max-w-lg mx-auto">
            One scan confirms your piece is the real deal. No stories, no wahala.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="naija-card p-5 md:p-8 text-center"
            >
              <span className="font-accent text-3xl md:text-5xl font-black text-primary/15 block mb-3 md:mb-4">{step.num}</span>
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 md:mb-5">
                <step.icon className="w-5 h-5 md:w-7 md:h-7 text-primary" />
              </div>
              <h3 className="font-accent text-sm md:text-lg font-bold text-foreground mb-1 md:mb-2">{step.title}</h3>
              <p className="font-body text-xs md:text-sm text-muted-foreground leading-relaxed hidden sm:block">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
