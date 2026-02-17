import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, AlertTriangle, CheckCircle, XCircle, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface LabResult {
  name: string;
  value: string;
  unit: string;
  reference_range: string;
  status: "normal" | "borderline" | "high";
  what_this_means: string;
  when_to_see_doctor: string;
  lifestyle_suggestion: string;
}

interface AnalysisResponse {
  results: LabResult[];
  summary: string;
  critical_alerts: string[];
  trends: string[];
}

interface ManualEntry {
  name: string;
  value: string;
  unit: string;
}

const statusConfig = {
  normal: { icon: CheckCircle, color: "text-neon-green", bg: "bg-neon-green/10", border: "border-neon-green/30", glow: "", label: "Normal" },
  borderline: { icon: AlertTriangle, color: "text-neon-yellow", bg: "bg-neon-yellow/10", border: "border-neon-yellow/30", glow: "glow-orange", label: "Borderline" },
  high: { icon: XCircle, color: "text-neon-red", bg: "bg-neon-red/10", border: "border-neon-red/30", glow: "animate-red-pulse", label: "High Risk" },
};

const LabAnalyzer = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<"upload" | "manual" | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [manualEntries, setManualEntries] = useState<ManualEntry[]>([{ name: "", value: "", unit: "" }]);
  const [labText, setLabText] = useState("");

  const addEntry = () => setManualEntries([...manualEntries, { name: "", value: "", unit: "" }]);
  const removeEntry = (i: number) => setManualEntries(manualEntries.filter((_, idx) => idx !== i));
  const updateEntry = (i: number, field: keyof ManualEntry, val: string) => {
    const updated = [...manualEntries];
    updated[i][field] = val;
    setManualEntries(updated);
  };

  const analyze = async (data: { lab_text?: string; manual_entries?: ManualEntry[] }) => {
    setAnalyzing(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("analyze-lab-report", { body: data });
      if (error) throw error;
      if (result.error) throw new Error(result.error);
      setAnalysis(result);

      // Save to database
      if (user) {
        await supabase.from("lab_reports").insert({
          user_id: user.id,
          report_name: "Lab Report " + new Date().toLocaleDateString(),
          raw_text: data.lab_text || JSON.stringify(data.manual_entries),
          results: result as any,
        });
        await supabase.from("audit_logs").insert({
          user_id: user.id,
          action: "lab_report_analyzed",
          details: { report_date: new Date().toISOString() } as any,
        });
      }
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    }
    setAnalyzing(false);
  };

  const handleManualSubmit = () => {
    const valid = manualEntries.filter((e) => e.name && e.value);
    if (!valid.length) { toast.error("Enter at least one test result"); return; }
    analyze({ manual_entries: valid });
  };

  const handleTextSubmit = () => {
    if (!labText.trim()) { toast.error("Please paste your lab report text"); return; }
    analyze({ lab_text: labText });
  };

  if (analysis) {
    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm text-neon-cyan">AI Analysis Results</h3>
            <Button variant="ghost" size="sm" className="text-muted-foreground text-xs" onClick={() => { setAnalysis(null); setMode(null); }}>
              New Report
            </Button>
          </div>

          {analysis.critical_alerts?.length > 0 && (
            <motion.div className="glass rounded-lg p-3 border border-neon-red/40 animate-red-pulse">
              <p className="text-xs font-display text-neon-red mb-1">⚠️ Critical Alerts</p>
              {analysis.critical_alerts.map((a, i) => <p key={i} className="text-xs text-muted-foreground">{a}</p>)}
            </motion.div>
          )}

          {analysis.summary && (
            <div className="glass rounded-lg p-3 border border-neon-cyan/20">
              <p className="text-xs text-muted-foreground">{analysis.summary}</p>
            </div>
          )}

          {analysis.results?.map((result, i) => {
            const config = statusConfig[result.status] || statusConfig.normal;
            const Icon = config.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`glass rounded-lg p-4 border ${config.border} ${config.glow}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${config.color}`} />
                    <span className="font-medium text-foreground text-sm">{result.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>{config.label}</span>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className={`font-mono text-xl font-bold ${config.color}`}>{result.value}</span>
                  <span className="text-muted-foreground text-xs">{result.unit}</span>
                  <span className="text-muted-foreground text-xs ml-auto">Ref: {result.reference_range}</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <p className="text-muted-foreground"><span className="text-foreground font-medium">Kya matlab hai:</span> {result.what_this_means}</p>
                  <p className="text-muted-foreground"><span className="text-foreground font-medium">Doctor kab jaayein:</span> {result.when_to_see_doctor}</p>
                  <p className="text-muted-foreground"><span className="text-foreground font-medium">Salaah:</span> {result.lifestyle_suggestion}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
      {analyzing ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <Loader2 className="w-10 h-10 text-neon-cyan animate-spin" />
          <p className="text-neon-cyan font-display text-sm">AI analyzing your report...</p>
          <p className="text-muted-foreground text-xs">Mapping biomarkers against Indian reference ranges</p>
        </div>
      ) : !mode ? (
        <div className="space-y-3">
          <div
            onClick={() => setMode("manual")}
            className="glass rounded-xl p-6 border border-dashed border-neon-cyan/30 hover:border-neon-cyan/60 transition-all cursor-pointer flex items-center gap-4"
          >
            <FileText className="w-8 h-8 text-neon-cyan" />
            <div>
              <p className="text-foreground font-medium text-sm">Manual Entry</p>
              <p className="text-muted-foreground text-xs">Enter test names and values manually</p>
            </div>
          </div>
          <div
            onClick={() => setMode("upload")}
            className="glass rounded-xl p-6 border border-dashed border-neon-purple/30 hover:border-neon-purple/60 transition-all cursor-pointer flex items-center gap-4"
          >
            <Upload className="w-8 h-8 text-neon-purple" />
            <div>
              <p className="text-foreground font-medium text-sm">Paste Report Text</p>
              <p className="text-muted-foreground text-xs">Paste your lab report content for AI analysis</p>
            </div>
          </div>
        </div>
      ) : mode === "manual" ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-display text-muted-foreground uppercase tracking-wider">Enter Test Results</h4>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setMode(null)}>Back</Button>
          </div>
          {manualEntries.map((entry, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input placeholder="Test name" value={entry.name} onChange={(e) => updateEntry(i, "name", e.target.value)} className="bg-muted/50 border-border text-foreground text-xs" />
              <Input placeholder="Value" value={entry.value} onChange={(e) => updateEntry(i, "value", e.target.value)} className="bg-muted/50 border-border text-foreground text-xs w-24" />
              <Input placeholder="Unit" value={entry.unit} onChange={(e) => updateEntry(i, "unit", e.target.value)} className="bg-muted/50 border-border text-foreground text-xs w-20" />
              {manualEntries.length > 1 && (
                <button onClick={() => removeEntry(i)} className="text-neon-red/60 hover:text-neon-red"><Trash2 className="w-3.5 h-3.5" /></button>
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={addEntry} className="text-neon-cyan text-xs"><Plus className="w-3 h-3 mr-1" /> Add Test</Button>
          </div>
          <Button onClick={handleManualSubmit} className="w-full bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 text-sm">
            Analyze with AI
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-display text-muted-foreground uppercase tracking-wider">Paste Report Text</h4>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setMode(null)}>Back</Button>
          </div>
          <textarea
            value={labText}
            onChange={(e) => setLabText(e.target.value)}
            placeholder="Paste your full lab report text here... Include test names, values, units, and reference ranges."
            className="w-full h-40 bg-muted/50 border border-border rounded-lg p-3 text-foreground text-xs resize-none focus:border-neon-cyan/50 focus:outline-none"
          />
          <Button onClick={handleTextSubmit} className="w-full bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 text-sm">
            Analyze with AI
          </Button>
        </div>
      )}
    </div>
  );
};

export default LabAnalyzer;
