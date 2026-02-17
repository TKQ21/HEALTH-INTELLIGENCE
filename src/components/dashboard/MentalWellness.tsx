import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Moon, Flame, SmilePlus, Loader2, History } from "lucide-react";
import NeonGauge from "./NeonGauge";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";

const moods = [
  { emoji: "😊", label: "Happy", value: 1 },
  { emoji: "😐", label: "Neutral", value: 2 },
  { emoji: "😔", label: "Low", value: 3 },
  { emoji: "😰", label: "Anxious", value: 4 },
  { emoji: "😡", label: "Angry", value: 5 },
];

interface WellnessResult {
  risk_score: number;
  risk_level: string;
  insights: string[];
  recommendations: string[];
  professional_help_suggested: boolean;
  affirmation: string;
  trend_analysis?: string;
}

const MentalWellness = () => {
  const { user } = useAuth();
  const [mood, setMood] = useState<number | null>(null);
  const [sleep, setSleep] = useState([7]);
  const [stress, setStress] = useState([5]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WellnessResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("wellness_logs").select("*").eq("user_id", user.id).order("logged_at", { ascending: false }).limit(10)
      .then(({ data }) => { if (data) setHistory(data); });
  }, [user]);

  const handleAnalyze = async () => {
    if (!mood || !user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-wellness", {
        body: {
          mood_score: mood,
          sleep_hours: sleep[0],
          stress_level: stress[0],
          history: history.slice(0, 5).map(h => ({ mood_score: h.mood_score, sleep_hours: h.sleep_hours, stress_level: h.stress_level })),
        },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setResult(data);

      // Save to database
      await supabase.from("wellness_logs").insert({
        user_id: user.id,
        mood_score: mood,
        sleep_hours: sleep[0],
        stress_level: stress[0],
        risk_score: data.risk_score,
        ai_advice: JSON.stringify(data),
      });
      await supabase.from("audit_logs").insert({
        user_id: user.id,
        action: "wellness_assessed",
        details: { risk_score: data.risk_score } as any,
      });
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    }
    setLoading(false);
  };

  const riskColor = result
    ? result.risk_score < 40 ? "hsl(145,100%,50%)" : result.risk_score < 70 ? "hsl(50,100%,55%)" : "hsl(0,100%,55%)"
    : "hsl(183,100%,50%)";

  return (
    <div className="space-y-5" onClick={e => e.stopPropagation()}>
      {!result ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="w-10 h-10 text-neon-purple animate-spin" />
              <p className="text-neon-purple font-display text-sm">AI analyzing your wellness...</p>
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs font-display text-muted-foreground uppercase tracking-wider mb-3 block">
                  <SmilePlus className="w-3.5 h-3.5 inline mr-1.5" /> How are you feeling?
                </label>
                <div className="flex gap-2 justify-center">
                  {moods.map(m => (
                    <button key={m.value} onClick={() => setMood(m.value)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                        mood === m.value ? "glass border border-neon-cyan/50 glow-cyan" : "hover:bg-muted/50"
                      }`}
                    >
                      <span className="text-2xl">{m.emoji}</span>
                      <span className="text-xs text-muted-foreground">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-display text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5" /> Sleep: <span className="text-neon-cyan">{sleep[0]}h</span>
                </label>
                <Slider value={sleep} onValueChange={setSleep} min={1} max={12} step={0.5} className="py-2" />
              </div>

              <div>
                <label className="text-xs font-display text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" /> Stress: <span className="text-neon-orange">{stress[0]}/10</span>
                </label>
                <Slider value={stress} onValueChange={setStress} min={1} max={10} step={1} className="py-2" />
              </div>

              <Button onClick={handleAnalyze} disabled={!mood} className="w-full bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30">
                <Brain className="w-4 h-4 mr-2" /> Analyze with AI
              </Button>

              {history.length > 0 && (
                <div>
                  <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <History className="w-3.5 h-3.5" /> Past Assessments ({history.length})
                  </button>
                  {showHistory && (
                    <div className="mt-2 space-y-1.5">
                      {history.slice(0, 5).map(h => (
                        <div key={h.id} className="glass rounded-lg p-2 border border-border flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{format(new Date(h.logged_at), "MMM dd, yyyy")}</span>
                          <span className="text-foreground">Score: {h.risk_score ?? "N/A"}</span>
                          <span>{moods.find(m => m.value === h.mood_score)?.emoji}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
          <div className="flex justify-center">
            <NeonGauge value={result.risk_score} label={result.risk_level || "Score"} color={riskColor} size={160} />
          </div>

          {result.affirmation && (
            <div className="glass rounded-lg p-3 border border-neon-cyan/20 text-center">
              <p className="text-sm text-foreground">{result.affirmation}</p>
            </div>
          )}

          {result.professional_help_suggested && (
            <div className="glass rounded-lg p-3 border border-neon-red/30 animate-red-pulse">
              <p className="text-xs text-neon-red font-medium">🆘 Professional support recommended. Kisi trained counselor ya doctor se baat karein.</p>
            </div>
          )}

          {result.insights?.length > 0 && (
            <div className="glass rounded-lg p-4 border border-border">
              <h4 className="font-display text-xs text-neon-cyan mb-2">Insights</h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {result.insights.map((insight, i) => <li key={i}>💡 {insight}</li>)}
              </ul>
            </div>
          )}

          {result.recommendations?.length > 0 && (
            <div className="glass rounded-lg p-4 border border-border">
              <h4 className="font-display text-xs text-neon-green mb-2">Recommendations</h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {result.recommendations.map((rec, i) => <li key={i}>✅ {rec}</li>)}
              </ul>
            </div>
          )}

          {result.trend_analysis && (
            <div className="glass rounded-lg p-3 border border-neon-purple/20">
              <p className="text-xs text-muted-foreground"><span className="text-neon-purple font-medium">Trend:</span> {result.trend_analysis}</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">📌 Yeh koi medical diagnosis nahi hai. Sirf self-awareness ke liye.</p>

          <Button variant="ghost" onClick={() => { setResult(null); setMood(null); }} className="w-full text-muted-foreground text-xs">
            Take Again
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default MentalWellness;
