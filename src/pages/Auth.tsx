import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ShieldCheck, Sparkles, Truck, QrCode } from "lucide-react";
import Navbar from "@/components/Navbar";

const getPasswordStrength = (pw: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score: 1, label: "Weak", color: "bg-destructive" };
  if (score <= 2) return { score: 2, label: "Fair", color: "bg-naija-gold" };
  if (score <= 3) return { score: 3, label: "Good", color: "bg-primary/70" };
  return { score: 4, label: "Strong 💪", color: "bg-primary" };
};

const SIGNUP_BENEFITS = [
  { icon: QrCode, text: "QR-verified authentic products" },
  { icon: Sparkles, text: "Early access to limited drops" },
  { icon: Truck, text: "Track your orders anytime" },
];

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && !agreedTerms) {
      toast({ title: "Agree to terms", description: "You need to accept our terms to create an account.", variant: "destructive" });
      return;
    }
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Welcome back! 🇳🇬" });
        navigate("/");
      }
    } else {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Check your email!", description: "We sent you a verification link. Click am to continue! 📧" });
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16 flex items-center justify-center px-4 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          {/* Brand header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-5">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "login" : "signup"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <h1 className="font-accent text-3xl md:text-4xl font-black text-foreground mb-2">
                  {isLogin ? "Welcome Back" : "Join the Family"}{" "}
                  <span className="inline-block">🇳🇬</span>
                </h1>
                <p className="font-body text-muted-foreground text-sm md:text-base">
                  {isLogin
                    ? "Enter your details make we carry go!"
                    : "Create account, join the Naija Original movement!"}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Signup benefits */}
          <AnimatePresence>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mb-6"
              >
                <div className="flex items-center justify-center gap-4 md:gap-6">
                  {SIGNUP_BENEFITS.map((b, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.1 }}
                      className="flex flex-col items-center gap-1.5 text-center"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <b.icon className="w-4.5 h-4.5 text-primary" />
                      </div>
                      <span className="font-body text-[11px] text-muted-foreground leading-tight max-w-[100px]">
                        {b.text}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <form
              onSubmit={handleSubmit}
              className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-5 shadow-lg shadow-primary/5"
            >
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="name-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <label className="font-body text-sm font-medium text-foreground block mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                        required={!isLogin}
                        className="pl-10 bg-background border-border h-11"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="font-body text-sm font-medium text-foreground block mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="pl-10 bg-background border-border h-11"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-body text-sm font-medium text-foreground">
                    Password
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      className="font-body text-xs text-primary hover:underline"
                      onClick={() =>
                        toast({
                          title: "Password reset",
                          description: "Contact howfar@naijaoriginal.com for help.",
                        })
                      }
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="pl-10 pr-10 bg-background border-border h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Password strength indicator (signup only) */}
                <AnimatePresence>
                  {!isLogin && password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 space-y-1.5"
                    >
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                              level <= strength.score ? strength.color : "bg-border"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="font-body text-[11px] text-muted-foreground">
                        Password strength: <span className="font-medium text-foreground">{strength.label}</span>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isLogin && password.length === 0 && (
                  <p className="font-body text-[11px] text-muted-foreground mt-1.5">
                    Minimum 6 characters
                  </p>
                )}
              </div>

              {/* Terms agreement (signup only) */}
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-start gap-2.5">
                      <Checkbox
                        id="terms"
                        checked={agreedTerms}
                        onCheckedChange={(checked) => setAgreedTerms(checked === true)}
                        className="mt-0.5"
                      />
                      <label htmlFor="terms" className="font-body text-xs text-muted-foreground leading-relaxed cursor-pointer">
                        I agree to the{" "}
                        <Link to="/terms" className="text-primary hover:underline" target="_blank">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link to="/privacy" className="text-primary hover:underline" target="_blank">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                className="w-full font-body font-semibold h-11 text-sm group"
                disabled={loading || (!isLogin && !agreedTerms)}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>{isLogin ? "Signing in..." : "Creating account..."}</span>
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                )}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-3 font-body text-xs text-muted-foreground">
                    {isLogin ? "New to Naija Original?" : "Already got account?"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="w-full py-2.5 rounded-xl border border-border font-body text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
              >
                {isLogin ? "Create an Account" : "Sign In Instead"}
              </button>
            </form>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-4 mt-6 text-muted-foreground"
          >
            <div className="flex items-center gap-1.5 font-body text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Secure login</span>
            </div>
            <span className="text-border">•</span>
            <div className="flex items-center gap-1.5 font-body text-[11px]">
              <Lock className="w-3.5 h-3.5" />
              <span>Data encrypted</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
