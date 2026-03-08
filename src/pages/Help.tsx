import { useState } from "react";
import { Send, Trash2, MessageCircle, Package, Shield, CreditCard, HelpCircle, Truck } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useOgaWahala } from "@/hooks/useOgaWahala";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const faqs = [
  { icon: Package, q: "How do I track my order?", a: "Go to the Track Order page and enter your order number (starts with NO-). You'll see real-time status updates." },
  { icon: Truck, q: "How long does shipping take?", a: "Standard delivery takes 3-7 business days within Nigeria. Express shipping is available for select locations." },
  { icon: CreditCard, q: "What payment methods do you accept?", a: "We accept bank transfers, card payments, and mobile money. All payments are in Nigerian Naira (₦)." },
  { icon: Shield, q: "How do I verify my product is authentic?", a: "Each product comes with a QR code. Visit our Verify page to scan it and confirm authenticity." },
  { icon: HelpCircle, q: "Are all sales final?", a: "Yes, all sales dey final. We no dey accept returns or refunds at this time. But if you receive defective or wrong item, reach out to us and we go sort am out." },
  { icon: MessageCircle, q: "How do I contact support?", a: "Chat with Oga Wahala right here! For urgent issues, he'll escalate to our human support team." },
];

const Help = () => {
  const [input, setInput] = useState("");
  const { messages, isLoading, send, clearChat } = useOgaWahala();
  const { user } = useAuth();

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    send(input.trim());
    setInput("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-5xl mb-4 block">🔥</span>
            <h1 className="font-accent text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight">
              Help Center
            </h1>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Oga Wahala dey here to solve all your wahala. Ask am anything!
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Chat Section */}
            <div className="order-1 lg:order-2">
              <div className="bg-card border border-border rounded-2xl overflow-hidden h-[600px] flex flex-col sticky top-24">
                {/* Chat Header */}
                <div className="bg-primary text-primary-foreground px-5 py-4 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🔥</span>
                    <div>
                      <h3 className="font-accent font-bold">Oga Wahala</h3>
                      <p className="text-xs opacity-80">Your Naija Support Boss • Online</p>
                    </div>
                  </div>
                  {messages.length > 0 && (
                    <button onClick={clearChat} className="p-2 rounded-full hover:bg-primary-foreground/20 transition-colors" title="Clear chat">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <p className="font-accent font-bold text-foreground">How I fit help you today?</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {user ? "I sabi your account and orders o!" : "Sign in make I check your orders for you."}
                      </p>
                      {!user && (
                        <Link to="/auth" className="inline-flex mt-3 px-4 py-2 rounded-full bg-secondary text-secondary-foreground font-accent text-xs font-bold uppercase tracking-wide hover:bg-secondary/80 transition-colors">
                          Sign In First
                        </Link>
                      )}
                      <div className="mt-4 space-y-2">
                        {["Where is my order?", "Help me with returns", "I no fit find my size", "Wetin be your delivery time?"].map((q) => (
                          <button key={q} onClick={() => send(q)} className="block w-full text-left text-sm px-4 py-2.5 rounded-xl bg-muted hover:bg-accent hover:text-accent-foreground transition-colors">
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}>
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm max-w-none [&_p]:m-0 [&_p]:mb-1.5 [&_ul]:m-0 [&_ol]:m-0 [&_li]:m-0">
                            <ReactMarkdown>{msg.content.replace("[ESCALATE]", "").trim()}</ReactMarkdown>
                          </div>
                        ) : msg.content}
                      </div>
                    </motion.div>
                  ))}

                  {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="border-t border-border p-4 shrink-0">
                  <div className="flex gap-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                      placeholder="Ask Oga Wahala anything..."
                      className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 hover:bg-primary/90 transition-colors shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="order-2 lg:order-1 space-y-4">
              <h2 className="font-accent text-xl font-bold text-foreground uppercase tracking-tight mb-6">
                Frequently Asked Questions
              </h2>
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="naija-card p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <faq.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-accent font-bold text-sm text-foreground">{faq.q}</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Help;
