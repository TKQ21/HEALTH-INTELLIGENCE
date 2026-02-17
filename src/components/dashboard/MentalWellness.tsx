import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Moon, Flame, SmilePlus } from "lucide-react";
import NeonGauge from "./NeonGauge";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

const moods = [
  { emoji: "😊", label: "Happy", value: 1 },
  { emoji: "😐", label: "Neutral", value: 2 },
  { emoji: "😔", label: "Low", value: 3 },
  { emoji: "😰", label: "Anxious", value: 4 },
  { emoji: "😡", label: "Angry", value: 5 },
];

const MentalWellness = () => {
  const [mood, setMood] = useState<number | null>(null);
  const [sleep, setSleep] = useState([7]);
  const [stress, setStress] = useState([5]);
  const [submitted, setSubmitted] = useState(false);

  const riskScore = submitted ? Math.min(100, Math.round(((mood || 3) * 12 + (10 - sleep[0]) * 5 + stress[0] * 4))) : 0;

  const riskColor = riskScore < 40
    ? "hsl(145,100%,50%)"
    : riskScore < 70
    ? "hsl(50,100%,55%)"
    : "hsl(0,100%,55%)";

  const riskLabel = riskScore < 40 ? "Low Risk" : riskScore < 70 ? "Moderate" : "Elevated";

  return (
    <div className="space-y-5">
      {!submitted ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* Mood */}
          <div>
            <label className="text-xs font-display text-muted-foreground uppercase tracking-wider mb-3 block">
              <SmilePlus className="w-3.5 h-3.5 inline mr-1.5" /> How are you feeling?
            </label>
            <div className="flex gap-2 justify-center">
              {moods.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                    mood === m.value
                      ? "glass border border-neon-cyan/50 glow-cyan"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sleep */}
          <div>
            <label className="text-xs font-display text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5" /> Sleep Hours: <span className="text-neon-cyan">{sleep[0]}h</span>
            </label>
            <Slider value={sleep} onValueChange={setSleep} min={1} max={12} step={0.5} className="py-2" />
          </div>

          {/* Stress */}
          <div>
            <label className="text-xs font-display text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" /> Stress Level: <span className="text-neon-orange">{stress[0]}/10</span>
            </label>
            <Slider value={stress} onValueChange={setStress} min={1} max={10} step={1} className="py-2" />
          </div>

          <Button
            onClick={() => mood && setSubmitted(true)}
            disabled={!mood}
            className="w-full bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30"
          >
            <Brain className="w-4 h-4 mr-2" /> Analyze Wellness
          </Button>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
          <div className="flex justify-center">
            <NeonGauge value={riskScore} label={riskLabel} color={riskColor} size={160} />
          </div>

          <div className="glass rounded-lg p-4 border border-border">
            <h4 className="font-display text-xs text-neon-cyan mb-2">Supportive Insights</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {sleep[0] < 6 && <li>💤 Aapki neend kam hai. 7-8 hours ki neend health ke liye zaroori hai.</li>}
              {stress[0] > 7 && <li>🧘 High stress detected. Deep breathing ya meditation try karein.</li>}
              {(mood || 0) >= 4 && <li>💚 Aap akele nahi hain. Kisi trusted person se baat karein. Professional help bhi available hai.</li>}
              {riskScore < 40 && <li>✨ Bahut accha! Aapki mental wellness abhi achi condition mein hai. Keep it up!</li>}
              <li>📌 Note: Yeh koi medical diagnosis nahi hai. Sirf self-awareness ke liye hai.</li>
            </ul>
          </div>

          <Button variant="ghost" onClick={() => { setSubmitted(false); setMood(null); }} className="w-full text-muted-foreground text-xs">
            Take Again
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default MentalWellness;
