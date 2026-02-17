import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pill, Search, AlertTriangle, ShieldCheck, Baby, User, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface DrugInteraction {
  drug: string;
  severity: "mild" | "moderate" | "severe";
  description: string;
  recommendation: string;
}

interface SpecialFlag {
  type: string;
  warning: string;
  severity: string;
}

interface CheckResult {
  medicine: { name: string; class: string; common_brand: string; is_essential: boolean };
  interactions: DrugInteraction[];
  duplicates: string[];
  special_flags: SpecialFlag[];
  dosage_info: { standard_dose: string; max_dose: string; timing: string };
}

const severityConfig = {
  mild: { color: "text-neon-blue", bg: "bg-neon-blue/10", border: "border-neon-blue/30", label: "Mild" },
  moderate: { color: "text-neon-orange", bg: "bg-neon-orange/10", border: "border-neon-orange/30", label: "Moderate" },
  severe: { color: "text-neon-red", bg: "bg-neon-red/10", border: "border-neon-red/40 animate-red-pulse", label: "Severe" },
};

const PrescriptionChecker = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [existingMeds, setExistingMeds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("prescriptions").select("medicine_name").eq("user_id", user.id).eq("is_active", true)
      .then(({ data }) => { if (data) setExistingMeds(data.map(d => d.medicine_name)); });
  }, [user]);

  const handleCheck = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-prescription", {
        body: { medicine_name: query, existing_medicines: existingMeds },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setResult(data);

      // Save prescription
      if (user) {
        await supabase.from("prescriptions").insert({
          user_id: user.id,
          medicine_name: data.medicine?.name || query,
          check_result: data as any,
        });
        await supabase.from("audit_logs").insert({
          user_id: user.id,
          action: "prescription_checked",
          details: { medicine: query } as any,
        });
        setExistingMeds(prev => [...prev, data.medicine?.name || query]);
      }
    } catch (e: any) {
      toast.error(e.message || "Check failed");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-5" onClick={e => e.stopPropagation()}>
      {existingMeds.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Your active medicines:</p>
          <div className="flex flex-wrap gap-1.5">
            {existingMeds.map((med, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-full bg-muted/50 text-foreground border border-border">{med}</span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="Enter medicine name..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleCheck()}
          className="bg-muted/50 border-border focus:border-neon-cyan/50 text-foreground placeholder:text-muted-foreground"
        />
        <Button onClick={handleCheck} disabled={loading} className="bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-neon-cyan" />
                <div>
                  <span className="font-display text-sm text-foreground">{result.medicine?.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">({result.medicine?.class})</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {result.medicine?.is_essential && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-neon-green/10 text-neon-green border border-neon-green/30">WHO Essential</span>
                )}
                <button onClick={() => { setResult(null); setQuery(""); }} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {result.medicine?.common_brand && (
              <p className="text-xs text-muted-foreground">Common brand: <span className="text-foreground">{result.medicine.common_brand}</span></p>
            )}

            {result.dosage_info && (
              <div className="glass rounded-lg p-3 border border-border">
                <h4 className="text-xs font-display text-neon-cyan mb-2">Dosage Info</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Standard:</span><br /><span className="text-foreground">{result.dosage_info.standard_dose}</span></div>
                  <div><span className="text-muted-foreground">Max:</span><br /><span className="text-foreground">{result.dosage_info.max_dose}</span></div>
                  <div><span className="text-muted-foreground">Timing:</span><br /><span className="text-foreground">{result.dosage_info.timing}</span></div>
                </div>
              </div>
            )}

            {result.duplicates?.length > 0 && (
              <div className="glass rounded-lg p-3 border border-neon-orange/30">
                <p className="text-xs text-neon-orange font-medium">⚠️ Therapeutic duplicates: {result.duplicates.join(", ")}</p>
              </div>
            )}

            {result.interactions?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-display text-muted-foreground uppercase tracking-wider">Drug Interactions</h4>
                {result.interactions.map((inter, i) => {
                  const config = severityConfig[inter.severity] || severityConfig.mild;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className={`glass rounded-lg p-3 border ${config.border}`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-foreground font-medium">{inter.drug}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>{config.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{inter.description}</p>
                      {inter.recommendation && <p className="text-xs text-foreground">💡 {inter.recommendation}</p>}
                    </motion.div>
                  );
                })}
              </div>
            )}

            {result.special_flags?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-display text-muted-foreground uppercase tracking-wider">Special Flags</h4>
                {result.special_flags.map((flag, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }}
                    className={`glass rounded-lg p-3 border ${flag.severity === "contraindicated" ? "border-neon-red/40" : "border-neon-yellow/30"} flex items-start gap-2`}
                  >
                    {flag.type === "elderly" ? <User className="w-4 h-4 text-neon-yellow mt-0.5" /> :
                     flag.type === "pregnancy" ? <Baby className="w-4 h-4 text-neon-pink mt-0.5" /> :
                     <AlertTriangle className="w-4 h-4 text-neon-orange mt-0.5" />}
                    <div>
                      <p className="text-xs text-foreground font-medium capitalize">{flag.type} — {flag.severity}</p>
                      <p className="text-xs text-muted-foreground">{flag.warning}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PrescriptionChecker;
