import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Mail, Lock, User, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DiscoBackground from "@/components/DiscoBackground";
import { toast } from "sonner";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().trim().email("Please enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  email: z.string().trim().email("Please enter a valid email").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password too long")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[a-z]/, "Include at least one lowercase letter")
    .regex(/[0-9]/, "Include at least one number"),
});

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const parsed = signUpSchema.safeParse({ fullName, email, password });
        if (!parsed.success) {
          toast.error(parsed.error.errors[0].message);
          setLoading(false);
          return;
        }
        const { error } = await signUp(parsed.data.email, parsed.data.password, parsed.data.fullName);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Account created! Please check your email to verify your account.");
        }
      } else {
        const parsed = signInSchema.safeParse({ email, password });
        if (!parsed.success) {
          toast.error(parsed.error.errors[0].message);
          setLoading(false);
          return;
        }
        const { error } = await signIn(parsed.data.email, parsed.data.password);
        if (error) {
          toast.error(error.message);
        } else {
          navigate("/dashboard");
        }
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      <DiscoBackground />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-md">
        <div className="glass-strong rounded-2xl p-8 border border-border">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-neon-cyan/20 flex items-center justify-center glow-cyan">
              <Activity className="w-5 h-5 text-neon-cyan" />
            </div>
            <h1 className="font-display text-xl text-foreground">HealthIQ</h1>
          </div>

          <h2 className="font-display text-lg text-center text-foreground mb-1">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-center text-muted-foreground text-sm mb-6">
            {isSignUp ? "Start your health intelligence journey" : "Sign in to your health dashboard"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 bg-muted/50 border-border focus:border-neon-cyan/50 text-foreground"
                  required
                  maxLength={100}
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-muted/50 border-border focus:border-neon-cyan/50 text-foreground"
                required
                maxLength={255}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-muted/50 border-border focus:border-neon-cyan/50 text-foreground"
                required
                minLength={isSignUp ? 8 : 6}
                maxLength={72}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {isSignUp && (
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p className={password.length >= 8 ? "text-neon-green" : ""}>• At least 8 characters</p>
                <p className={/[A-Z]/.test(password) ? "text-neon-green" : ""}>• One uppercase letter</p>
                <p className={/[a-z]/.test(password) ? "text-neon-green" : ""}>• One lowercase letter</p>
                <p className={/[0-9]/.test(password) ? "text-neon-green" : ""}>• One number</p>
              </div>
            )}

            {!isSignUp && (
              <div className="text-right">
                <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-neon-cyan transition-colors">
                  Forgot password?
                </Link>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full bg-neon-cyan text-primary-foreground hover:bg-neon-cyan/90 font-display text-sm glow-cyan">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isSignUp ? "Create Account" : "Sign In"} <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setPassword(""); }}
              className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors"
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
