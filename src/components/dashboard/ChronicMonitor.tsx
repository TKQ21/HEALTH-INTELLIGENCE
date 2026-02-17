import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, TrendingUp, AlertTriangle, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format, subDays } from "date-fns";

type TimeRange = "7" | "30" | "90";
type VitalType = "blood_sugar_fasting" | "blood_sugar_pp" | "bp_systolic" | "bp_diastolic" | "weight" | "hba1c";

interface VitalEntry {
  id: string;
  vital_type: string;
  value: number;
  unit: string;
  recorded_at: string;
}

const ChronicMonitor = () => {
  const { user } = useAuth();
  const [range, setRange] = useState<TimeRange>("7");
  const [vitals, setVitals] = useState<VitalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState<VitalType>("blood_sugar_fasting");
  const [addValue, setAddValue] = useState("");

  const unitMap: Record<VitalType, string> = {
    blood_sugar_fasting: "mg/dL", blood_sugar_pp: "mg/dL",
    bp_systolic: "mmHg", bp_diastolic: "mmHg",
    weight: "kg", hba1c: "%",
  };

  const loadVitals = async () => {
    if (!user) return;
    setLoading(true);
    const since = subDays(new Date(), parseInt(range)).toISOString();
    const { data, error } = await supabase
      .from("vitals")
      .select("*")
      .eq("user_id", user.id)
      .gte("recorded_at", since)
      .order("recorded_at", { ascending: true });
    if (error) toast.error("Failed to load vitals");
    else setVitals(data || []);
    setLoading(false);
  };

  useEffect(() => { loadVitals(); }, [range, user]);

  const handleAddVital = async () => {
    if (!user || !addValue) return;
    const { error } = await supabase.from("vitals").insert({
      user_id: user.id,
      vital_type: addType,
      value: parseFloat(addValue),
      unit: unitMap[addType],
    });
    if (error) toast.error("Failed to save");
    else {
      toast.success("Vital recorded!");
      setAddValue("");
      setShowAdd(false);
      loadVitals();
    }
  };

  const sugarData = useMemo(() => {
    const days = new Map<string, { fasting?: number; pp?: number }>();
    vitals.filter(v => v.vital_type.startsWith("blood_sugar")).forEach(v => {
      const day = format(new Date(v.recorded_at), "MMM dd");
      const existing = days.get(day) || {};
      if (v.vital_type === "blood_sugar_fasting") existing.fasting = v.value;
      else existing.pp = v.value;
      days.set(day, existing);
    });
    return Array.from(days.entries()).map(([day, vals]) => ({ day, ...vals }));
  }, [vitals]);

  const bpData = useMemo(() => {
    const days = new Map<string, { systolic?: number; diastolic?: number }>();
    vitals.filter(v => v.vital_type.startsWith("bp_")).forEach(v => {
      const day = format(new Date(v.recorded_at), "MMM dd");
      const existing = days.get(day) || {};
      if (v.vital_type === "bp_systolic") existing.systolic = v.value;
      else existing.diastolic = v.value;
      days.set(day, existing);
    });
    return Array.from(days.entries()).map(([day, vals]) => ({ day, ...vals }));
  }, [vitals]);

  // Alert logic
  const sugarAlerts = useMemo(() => {
    const fasting = vitals.filter(v => v.vital_type === "blood_sugar_fasting").slice(-3);
    const rising = fasting.length >= 3 && fasting.every((v, i) => i === 0 || v.value >= fasting[i - 1].value);
    const bpHigh = vitals.filter(v => v.vital_type === "bp_systolic" && v.value >= 140);
    return { sugarRising: rising && fasting.length >= 3, bpHigh: bpHigh.length >= 2 };
  }, [vitals]);

  return (
    <div className="space-y-5" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(["7", "30", "90"] as TimeRange[]).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                range === r ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40" : "bg-muted/50 text-muted-foreground border border-border hover:border-neon-cyan/20"
              }`}
            >{r} Days</button>
          ))}
        </div>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 text-xs">
          <Plus className="w-3 h-3 mr-1" /> Log
        </Button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-lg p-4 border border-neon-cyan/20 space-y-3">
          <select
            value={addType}
            onChange={e => setAddType(e.target.value as VitalType)}
            className="w-full bg-muted/50 border border-border rounded-lg p-2 text-foreground text-xs"
          >
            <option value="blood_sugar_fasting">Blood Sugar (Fasting)</option>
            <option value="blood_sugar_pp">Blood Sugar (PP)</option>
            <option value="bp_systolic">BP Systolic</option>
            <option value="bp_diastolic">BP Diastolic</option>
            <option value="weight">Weight</option>
            <option value="hba1c">HbA1c</option>
          </select>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder={`Value (${unitMap[addType]})`}
              value={addValue}
              onChange={e => setAddValue(e.target.value)}
              className="bg-muted/50 border-border text-foreground text-xs"
            />
            <Button onClick={handleAddVital} className="bg-neon-cyan text-primary-foreground text-xs">Save</Button>
          </div>
        </motion.div>
      )}

      {/* Alerts */}
      {sugarAlerts.sugarRising && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-lg p-3 border border-neon-orange/40 animate-orange-pulse flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-neon-orange flex-shrink-0" />
          <div>
            <p className="text-sm text-foreground font-medium">Sugar trend rising ⚠️</p>
            <p className="text-xs text-muted-foreground">Fasting sugar increasing for 3 consecutive readings</p>
          </div>
        </motion.div>
      )}
      {sugarAlerts.bpHigh && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-lg p-3 border border-neon-red/40 animate-red-pulse flex items-center gap-3">
          <Activity className="w-5 h-5 text-neon-red flex-shrink-0" />
          <div>
            <p className="text-sm text-foreground font-medium">BP Alert: Hypertension</p>
            <p className="text-xs text-muted-foreground">Systolic BP above 140 repeatedly detected</p>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-neon-cyan animate-spin" /></div>
      ) : vitals.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">No vitals recorded yet. Start logging your daily readings!</p>
        </div>
      ) : (
        <>
          {sugarData.length > 0 && (
            <div className="glass rounded-lg p-4 border border-neon-cyan/20">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-neon-cyan" />
                <span className="font-display text-xs text-neon-cyan">Blood Sugar Trend</span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={sugarData}>
                  <defs>
                    <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(183,100%,50%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(183,100%,50%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(277,100%,50%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(277,100%,50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fill: "hsl(220,15%,55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(220,15%,55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "hsla(240,20%,8%,0.9)", border: "1px solid hsla(183,100%,50%,0.3)", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                  <Area type="monotone" dataKey="fasting" stroke="hsl(183,100%,50%)" fill="url(#sg)" strokeWidth={2} />
                  <Area type="monotone" dataKey="pp" stroke="hsl(277,100%,50%)" fill="url(#pg)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 justify-center">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-2.5 h-2.5 rounded-full bg-neon-cyan" /> Fasting</span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-2.5 h-2.5 rounded-full bg-secondary" /> Post Prandial</span>
              </div>
            </div>
          )}

          {bpData.length > 0 && (
            <div className="glass rounded-lg p-4 border border-neon-purple/20">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-neon-purple" />
                <span className="font-display text-xs text-neon-purple">Blood Pressure Trend</span>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={bpData}>
                  <XAxis dataKey="day" tick={{ fill: "hsl(220,15%,55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(220,15%,55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "hsla(240,20%,8%,0.9)", border: "1px solid hsla(277,100%,50%,0.3)", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                  <Line type="monotone" dataKey="systolic" stroke="hsl(0,100%,55%)" strokeWidth={2} dot={{ fill: "hsl(0,100%,55%)", r: 3 }} />
                  <Line type="monotone" dataKey="diastolic" stroke="hsl(277,100%,50%)" strokeWidth={2} dot={{ fill: "hsl(277,100%,50%)", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChronicMonitor;
