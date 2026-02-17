import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pill, Search, AlertTriangle, ShieldAlert, ShieldCheck, Baby, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DrugResult {
  name: string;
  interactions: { drug: string; severity: "mild" | "moderate" | "severe"; description: string }[];
  flags: string[];
  isEssential: boolean;
}

const mockDrugCheck: DrugResult = {
  name: "Metformin 500mg",
  interactions: [
    { drug: "Aspirin", severity: "mild", description: "May slightly increase risk of lactic acidosis. Monitor if used long term." },
    { drug: "Enalapril", severity: "moderate", description: "Can increase risk of hypoglycemia. Blood sugar monitoring recommended." },
    { drug: "Ibuprofen", severity: "severe", description: "Increases risk of kidney damage and lactic acidosis. Avoid combination." },
  ],
  flags: ["Elderly caution: Reduce dose if eGFR < 45", "Pregnancy: Category B - Use only if needed"],
  isEssential: true,
};

const severityConfig = {
  mild: { color: "text-neon-blue", bg: "bg-neon-blue/10", border: "border-neon-blue/30", label: "Mild" },
  moderate: { color: "text-neon-orange", bg: "bg-neon-orange/10", border: "border-neon-orange/30", label: "Moderate" },
  severe: { color: "text-neon-red", bg: "bg-neon-red/10", border: "border-neon-red/40 animate-red-pulse", label: "Severe" },
};

const PrescriptionChecker = () => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<DrugResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = () => {
    if (!query.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setResult(mockDrugCheck);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <Input
          placeholder="Enter medicine name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCheck()}
          className="bg-muted/50 border-border focus:border-neon-cyan/50 text-foreground placeholder:text-muted-foreground"
        />
        <Button onClick={handleCheck} disabled={loading} className="bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30">
          {loading ? <div className="w-4 h-4 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-neon-cyan" />
                <span className="font-display text-sm text-foreground">{result.name}</span>
              </div>
              {result.isEssential && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-neon-green/10 text-neon-green border border-neon-green/30">
                  WHO Essential
                </span>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-display text-muted-foreground uppercase tracking-wider">Drug Interactions</h4>
              {result.interactions.map((inter, i) => {
                const config = severityConfig[inter.severity];
                return (
                  <motion.div
                    key={inter.drug}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`glass rounded-lg p-3 border ${config.border}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-foreground font-medium">{inter.drug}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{inter.description}</p>
                  </motion.div>
                );
              })}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-display text-muted-foreground uppercase tracking-wider">Special Flags</h4>
              {result.flags.map((flag, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="glass rounded-lg p-3 border border-neon-yellow/30 flex items-start gap-2"
                >
                  {flag.includes("Elderly") ? <User className="w-4 h-4 text-neon-yellow mt-0.5" /> : <Baby className="w-4 h-4 text-neon-pink mt-0.5" />}
                  <p className="text-xs text-muted-foreground">{flag}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PrescriptionChecker;
