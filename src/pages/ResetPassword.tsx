import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Lock, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DiscoBackground from "@/components/DiscoBackground";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be less than 72 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
    } else {
      setSuccess(true);
      toast.success("Password updated successfully!");
      setTimeout(() => navigate("/dashboard"), 2000);
    }
    setLoading(false);
  };

  if (!isRecovery && !success) {
    return (
      <div className="min-h-screen relative flex items-center justify-center px-4">
        <DiscoBackground />
        <div className="relative z-10 text-center space-y-4">
          <p className="text-muted-foreground">Invalid or expired reset link.</p>
          <Button onClick={() => navigate("/auth")} variant="outline" className="border-neon-cyan/30 text-neon-cyan">
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

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

          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-neon-green" />
              </div>
              <h2 className="font-display text-lg text-foreground">Password Updated!</h2>
              <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
            </div>
          ) : (
            <>
              <h2 className="font-display text-lg text-center text-foreground mb-1">Set New Password</h2>
              <p className="text-center text-muted-foreground text-sm mb-6">Choose a strong password for your account.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-muted/50 border-border focus:border-neon-cyan/50 text-foreground"
                    required
                    minLength={8}
                    maxLength={72}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-muted/50 border-border focus:border-neon-cyan/50 text-foreground"
                    required
                  />
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p className={password.length >= 8 ? "text-neon-green" : ""}>• At least 8 characters</p>
                  <p className={/[A-Z]/.test(password) ? "text-neon-green" : ""}>• One uppercase letter</p>
                  <p className={/[a-z]/.test(password) ? "text-neon-green" : ""}>• One lowercase letter</p>
                  <p className={/[0-9]/.test(password) ? "text-neon-green" : ""}>• One number</p>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-neon-cyan text-primary-foreground hover:bg-neon-cyan/90 font-display text-sm glow-cyan">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                </Button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
