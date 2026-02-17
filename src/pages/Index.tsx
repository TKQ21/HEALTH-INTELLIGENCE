import { motion } from "framer-motion";
import { Activity, FlaskConical, Brain, Pill, Shield, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DiscoBackground from "@/components/DiscoBackground";

const features = [
  { icon: FlaskConical, title: "Lab Report Analyzer", desc: "AI-powered OCR & biomarker analysis with Hinglish explanations", color: "text-neon-cyan" },
  { icon: Activity, title: "Chronic Disease Monitor", desc: "Track sugar, BP, weight with trend alerts & predictions", color: "text-neon-purple" },
  { icon: Pill, title: "Prescription Safety", desc: "Drug interaction checker with severity classification", color: "text-neon-green" },
  { icon: Brain, title: "Mental Wellness", desc: "Mood, sleep & stress scoring with supportive advice", color: "text-neon-orange" },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <DiscoBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Nav */}
        <nav className="glass-strong border-b border-border">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-neon-cyan/20 flex items-center justify-center glow-cyan">
                <Activity className="w-4 h-4 text-neon-cyan" />
              </div>
              <span className="font-display text-sm text-foreground">HealthIQ</span>
            </div>
            <Button
              onClick={() => navigate("/dashboard")}
              className="bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 text-xs"
            >
              Launch App <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </nav>

        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 rounded-2xl bg-neon-cyan/10 flex items-center justify-center mx-auto mb-6 glow-cyan"
            >
              <Sparkles className="w-8 h-8 text-neon-cyan animate-neon-pulse" />
            </motion.div>
            <h1 className="font-display text-3xl md:text-5xl text-foreground mb-4 leading-tight">
              AI-Powered
              <br />
              <span className="text-neon-cyan text-glow-cyan">Health Intelligence</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto mb-8">
              Smart lab analysis, chronic disease monitoring, prescription safety checks, and mental wellness — all in one neon-powered dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => navigate("/auth")}
                size="lg"
                className="bg-neon-cyan text-primary-foreground hover:bg-neon-cyan/90 font-display text-sm glow-cyan"
              >
                Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-neon-purple/40 text-neon-purple hover:bg-neon-purple/10 font-display text-sm"
              >
                View Demo
              </Button>
            </div>
          </motion.div>

          {/* Feature cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl w-full">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="glass rounded-xl p-5 border border-border hover:border-neon-cyan/30 transition-all group cursor-pointer"
              >
                <f.icon className={`w-6 h-6 ${f.color} mb-3 group-hover:animate-neon-pulse`} />
                <h3 className="font-display text-xs text-foreground mb-1.5">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Compliance */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 flex items-center gap-2 text-xs text-muted-foreground"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Not a medical device. For informational purposes only.</span>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Index;
