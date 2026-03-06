import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NewsletterSignup = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Enter valid email abeg!", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({
      email: email.trim().toLowerCase(),
      full_name: name.trim() || null,
    } as any);

    if (error) {
      if (error.code === "23505") {
        toast({ title: "You don subscribe before! 🙌", description: "This email is already on the list." });
        setSubscribed(true);
      } else {
        toast({ title: "Something go wrong", description: error.message, variant: "destructive" });
      }
    } else {
      setSubscribed(true);
      toast({ title: "You don join the family! 🎉", description: "Watch your inbox for exclusive drops and offers." });
      // Send welcome email
      supabase.functions.invoke("send-email", {
        body: {
          to: email.trim().toLowerCase(),
          subject: "Welcome to Naija Original! 🇳🇬🔥",
          html: (await import("@/lib/email-templates")).newsletterWelcomeEmail({ name: name.trim() || undefined }),
        },
      });
    }
    setSubmitting(false);
  };

  return (
    <section className="py-16 md:py-24 bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/20 text-primary font-accent text-xs font-semibold tracking-widest uppercase mb-6">
            <Mail className="w-3.5 h-3.5" />
            Newsletter
          </span>
          <h2 className="font-accent text-3xl md:text-4xl font-black mb-3">
            Stay In The Loop 🔥
          </h2>
          <p className="font-body text-secondary-foreground/70 text-sm md:text-base mb-8">
            Get first dibs on new drops, exclusive discounts, and culture updates. No spam — just the real gist.
          </p>

          <AnimatePresence mode="wait">
            {subscribed ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <p className="font-accent text-lg font-bold">You're in! 🎉</p>
                <p className="font-body text-sm text-secondary-foreground/70">Watch your inbox for exclusive drops.</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
              >
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="flex-shrink-0 sm:w-36 px-4 py-3 rounded-xl bg-secondary-foreground/10 border border-secondary-foreground/20 font-body text-sm text-secondary-foreground placeholder:text-secondary-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 px-4 py-3 rounded-xl bg-secondary-foreground/10 border border-secondary-foreground/20 font-body text-sm text-secondary-foreground placeholder:text-secondary-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-accent text-sm font-bold uppercase tracking-wide hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? "Joining..." : <>Join <ArrowRight className="w-4 h-4" /></>}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSignup;
