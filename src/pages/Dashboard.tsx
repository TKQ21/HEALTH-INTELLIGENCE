import { useState } from "react";
import { motion } from "framer-motion";
import { FlaskConical, Activity, Pill, Brain, Shield, Crown, LogOut } from "lucide-react";
import DiscoBackground from "@/components/DiscoBackground";
import ModuleCard from "@/components/dashboard/ModuleCard";
import LabAnalyzer from "@/components/dashboard/LabAnalyzer";
import ChronicMonitor from "@/components/dashboard/ChronicMonitor";
import PrescriptionChecker from "@/components/dashboard/PrescriptionChecker";
import MentalWellness from "@/components/dashboard/MentalWellness";
import NeonGauge from "@/components/dashboard/NeonGauge";
import { useNavigate } from "react-router-dom";

type Module = "lab" | "chronic" | "prescription" | "mental" | null;

const Dashboard = () => {
  const [activeModule, setActiveModule] = useState<Module>(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative">
      <DiscoBackground />

      <div className="relative z-10">
        {/* Header */}
        <header className="glass-strong border-b border-border sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neon-cyan/20 flex items-center justify-center glow-cyan">
                <Activity className="w-4 h-4 text-neon-cyan" />
              </div>
              <h1 className="font-display text-sm md:text-base text-foreground">HealthIQ</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden md:flex items-center gap-1.5 text-xs text-neon-yellow bg-neon-yellow/10 px-2.5 py-1 rounded-full border border-neon-yellow/30">
                <Crown className="w-3 h-3" /> Free Plan
              </span>
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-lg p-3 mb-6 border border-neon-yellow/20 flex items-center gap-2"
          >
            <Shield className="w-4 h-4 text-neon-yellow flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="text-neon-yellow font-medium">Disclaimer:</span> This tool is for informational purposes only. It does NOT provide medical diagnosis. Always consult a qualified healthcare professional.
            </p>
          </motion.div>

          {/* Health Score Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6 mb-6 border border-border"
          >
            <h2 className="font-display text-sm text-muted-foreground mb-4">Health Overview</h2>
            <div className="flex flex-wrap justify-center gap-6">
              <NeonGauge value={72} label="Overall Score" color="hsl(183,100%,50%)" />
              <NeonGauge value={65} label="Sugar Control" color="hsl(50,100%,55%)" />
              <NeonGauge value={45} label="BP Status" color="hsl(0,100%,55%)" />
              <NeonGauge value={78} label="Mental Wellness" color="hsl(277,100%,50%)" />
            </div>
          </motion.div>

          {/* Module Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <ModuleCard
              icon={<FlaskConical className="w-5 h-5" />}
              title="Lab Report Analyzer"
              description="Upload reports for AI-powered biomarker analysis with Hinglish explanations"
              glowColor="cyan"
              active={activeModule === "lab"}
              onClick={() => setActiveModule(activeModule === "lab" ? null : "lab")}
            >
              {activeModule === "lab" && <LabAnalyzer />}
            </ModuleCard>

            <ModuleCard
              icon={<Activity className="w-5 h-5" />}
              title="Chronic Disease Monitor"
              description="Track blood sugar, BP, weight with trend detection and alerts"
              glowColor="purple"
              active={activeModule === "chronic"}
              onClick={() => setActiveModule(activeModule === "chronic" ? null : "chronic")}
            >
              {activeModule === "chronic" && <ChronicMonitor />}
            </ModuleCard>

            <ModuleCard
              icon={<Pill className="w-5 h-5" />}
              title="Prescription Safety"
              description="Check drug interactions, duplicates, and special risk flags"
              glowColor="green"
              active={activeModule === "prescription"}
              onClick={() => setActiveModule(activeModule === "prescription" ? null : "prescription")}
            >
              {activeModule === "prescription" && <PrescriptionChecker />}
            </ModuleCard>

            <ModuleCard
              icon={<Brain className="w-5 h-5" />}
              title="Mental Wellness"
              description="Weekly mood, sleep, and stress assessment with wellness scoring"
              glowColor="orange"
              active={activeModule === "mental"}
              onClick={() => setActiveModule(activeModule === "mental" ? null : "mental")}
            >
              {activeModule === "mental" && <MentalWellness />}
            </ModuleCard>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
