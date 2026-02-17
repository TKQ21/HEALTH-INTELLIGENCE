import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FlaskConical, Activity, Pill, Brain, Shield, Crown, LogOut, User } from "lucide-react";
import DiscoBackground from "@/components/DiscoBackground";
import ModuleCard from "@/components/dashboard/ModuleCard";
import LabAnalyzer from "@/components/dashboard/LabAnalyzer";
import ChronicMonitor from "@/components/dashboard/ChronicMonitor";
import PrescriptionChecker from "@/components/dashboard/PrescriptionChecker";
import MentalWellness from "@/components/dashboard/MentalWellness";
import NeonGauge from "@/components/dashboard/NeonGauge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Module = "lab" | "chronic" | "prescription" | "mental" | null;

const Dashboard = () => {
  const [activeModule, setActiveModule] = useState<Module>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null);
  const [scores, setScores] = useState({ overall: 0, sugar: 0, bp: 0, mental: 0 });

  useEffect(() => {
    if (!user) return;
    // Load profile
    supabase.from("profiles").select("full_name").eq("user_id", user.id).single()
      .then(({ data }) => { if (data) setProfile(data); });

    // Load latest wellness score
    supabase.from("wellness_logs").select("risk_score").eq("user_id", user.id).order("logged_at", { ascending: false }).limit(1)
      .then(({ data }) => {
        const mentalScore = data?.[0]?.risk_score ? 100 - (data[0].risk_score as number) : 75;
        setScores(prev => ({ ...prev, mental: mentalScore }));
      });

    // Load latest vitals for scores
    supabase.from("vitals").select("vital_type, value").eq("user_id", user.id).order("recorded_at", { ascending: false }).limit(20)
      .then(({ data }) => {
        if (!data?.length) {
          setScores(prev => ({ ...prev, overall: 72, sugar: 65, bp: 60 }));
          return;
        }
        const lastFasting = data.find(v => v.vital_type === "blood_sugar_fasting");
        const lastSystolic = data.find(v => v.vital_type === "bp_systolic");
        const sugarScore = lastFasting ? Math.max(0, 100 - Math.abs(lastFasting.value - 90) * 2) : 65;
        const bpScore = lastSystolic ? Math.max(0, 100 - Math.abs(lastSystolic.value - 120) * 2) : 60;
        const overall = Math.round((sugarScore + bpScore) / 2);
        setScores(prev => ({ ...prev, overall, sugar: Math.round(sugarScore), bp: Math.round(bpScore) }));
      });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const toggleModule = (mod: Module) => {
    setActiveModule(prev => prev === mod ? null : mod);
  };

  return (
    <div className="min-h-screen relative">
      <DiscoBackground />
      <div className="relative z-10">
        <header className="glass-strong border-b border-border sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neon-cyan/20 flex items-center justify-center glow-cyan">
                <Activity className="w-4 h-4 text-neon-cyan" />
              </div>
              <h1 className="font-display text-sm md:text-base text-foreground">HealthIQ</h1>
            </div>
            <div className="flex items-center gap-3">
              {profile?.full_name && (
                <span className="hidden md:flex items-center gap-1.5 text-xs text-foreground">
                  <User className="w-3 h-3" /> {profile.full_name}
                </span>
              )}
              <span className="hidden md:flex items-center gap-1.5 text-xs text-neon-yellow bg-neon-yellow/10 px-2.5 py-1 rounded-full border border-neon-yellow/30">
                <Crown className="w-3 h-3" /> Free Plan
              </span>
              <button onClick={handleSignOut} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <LogOut className="w-3.5 h-3.5" /><span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-lg p-3 mb-6 border border-neon-yellow/20 flex items-center gap-2"
          >
            <Shield className="w-4 h-4 text-neon-yellow flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="text-neon-yellow font-medium">Disclaimer:</span> This tool is for informational purposes only. It does NOT provide medical diagnosis. Always consult a qualified healthcare professional.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-6 mb-6 border border-border">
            <h2 className="font-display text-sm text-muted-foreground mb-4">Health Overview</h2>
            <div className="flex flex-wrap justify-center gap-6">
              <NeonGauge value={scores.overall} label="Overall Score" color="hsl(183,100%,50%)" />
              <NeonGauge value={scores.sugar} label="Sugar Control" color="hsl(50,100%,55%)" />
              <NeonGauge value={scores.bp} label="BP Status" color="hsl(0,100%,55%)" />
              <NeonGauge value={scores.mental} label="Mental Wellness" color="hsl(277,100%,50%)" />
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            <ModuleCard icon={<FlaskConical className="w-5 h-5" />} title="Lab Report Analyzer" description="Upload reports for AI-powered biomarker analysis with Hinglish explanations" glowColor="cyan" active={activeModule === "lab"} onClick={() => toggleModule("lab")}>
              {activeModule === "lab" && <LabAnalyzer />}
            </ModuleCard>
            <ModuleCard icon={<Activity className="w-5 h-5" />} title="Chronic Disease Monitor" description="Track blood sugar, BP, weight with trend detection and alerts" glowColor="purple" active={activeModule === "chronic"} onClick={() => toggleModule("chronic")}>
              {activeModule === "chronic" && <ChronicMonitor />}
            </ModuleCard>
            <ModuleCard icon={<Pill className="w-5 h-5" />} title="Prescription Safety" description="Check drug interactions, duplicates, and special risk flags" glowColor="green" active={activeModule === "prescription"} onClick={() => toggleModule("prescription")}>
              {activeModule === "prescription" && <PrescriptionChecker />}
            </ModuleCard>
            <ModuleCard icon={<Brain className="w-5 h-5" />} title="Mental Wellness" description="Weekly mood, sleep, and stress assessment with AI wellness scoring" glowColor="orange" active={activeModule === "mental"} onClick={() => toggleModule("mental")}>
              {activeModule === "mental" && <MentalWellness />}
            </ModuleCard>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
