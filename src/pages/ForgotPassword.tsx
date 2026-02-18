import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DiscoBackground from "@/components/DiscoBackground";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.string().trim().email("Please enter a valid email address").max(255);

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("Password reset email sent!");
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

          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-neon-green" />
              </div>
              <h2 className="font-display text-lg text-foreground">Check Your Email</h2>
              <p className="text-sm text-muted-foreground">We've sent a password reset link to <span className="text-foreground">{email}</span>. Click the link to set a new password.</p>
              <Link to="/auth" className="inline-flex items-center gap-1.5 text-sm text-neon-cyan hover:underline">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-display text-lg text-center text-foreground mb-1">Forgot Password?</h2>
              <p className="text-center text-muted-foreground text-sm mb-6">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                <Button type="submit" disabled={loading} className="w-full bg-neon-cyan text-primary-foreground hover:bg-neon-cyan/90 font-display text-sm glow-cyan">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <Link to="/auth" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-neon-cyan transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
