import { useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Activity, TrendingUp, AlertTriangle } from "lucide-react";

const sugarData = [
  { day: "Mon", fasting: 102, pp: 145 },
  { day: "Tue", fasting: 108, pp: 152 },
  { day: "Wed", fasting: 112, pp: 160 },
  { day: "Thu", fasting: 115, pp: 168 },
  { day: "Fri", fasting: 110, pp: 155 },
  { day: "Sat", fasting: 118, pp: 172 },
  { day: "Sun", fasting: 122, pp: 178 },
];

const bpData = [
  { day: "Mon", systolic: 128, diastolic: 82 },
  { day: "Tue", systolic: 132, diastolic: 85 },
  { day: "Wed", systolic: 135, diastolic: 88 },
  { day: "Thu", systolic: 140, diastolic: 90 },
  { day: "Fri", systolic: 138, diastolic: 87 },
  { day: "Sat", systolic: 142, diastolic: 92 },
  { day: "Sun", systolic: 145, diastolic: 94 },
];

const timeRanges = ["7 Days", "30 Days", "90 Days"] as const;

const ChronicMonitor = () => {
  const [range, setRange] = useState<typeof timeRanges[number]>("7 Days");

  return (
    <div className="space-y-5">
      {/* Time range selector */}
      <div className="flex gap-2">
        {timeRanges.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              range === r
                ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40"
                : "bg-muted/50 text-muted-foreground border border-border hover:border-neon-cyan/20"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Alerts */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-lg p-3 border border-neon-orange/40 animate-orange-pulse flex items-center gap-3"
      >
        <AlertTriangle className="w-5 h-5 text-neon-orange flex-shrink-0" />
        <div>
          <p className="text-sm text-foreground font-medium">Sugar trend rising</p>
          <p className="text-xs text-muted-foreground">Fasting sugar increasing for 3 consecutive days</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-lg p-3 border border-neon-red/40 animate-red-pulse flex items-center gap-3"
      >
        <Activity className="w-5 h-5 text-neon-red flex-shrink-0" />
        <div>
          <p className="text-sm text-foreground font-medium">BP Alert: Hypertension Stage 1</p>
          <p className="text-xs text-muted-foreground">Systolic BP above 140 for multiple readings</p>
        </div>
      </motion.div>

      {/* Blood Sugar Chart */}
      <div className="glass rounded-lg p-4 border border-neon-cyan/20">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-neon-cyan" />
          <span className="font-display text-xs text-neon-cyan">Blood Sugar Trend</span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={sugarData}>
            <defs>
              <linearGradient id="sugarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(183,100%,50%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(183,100%,50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ppGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(277,100%,50%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(277,100%,50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fill: "hsl(220,15%,55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(220,15%,55%)", fontSize: 11 }} axisLine={false} tickLine={false} domain={[80, 200]} />
            <Tooltip
              contentStyle={{ background: "hsla(240,20%,8%,0.9)", border: "1px solid hsla(183,100%,50%,0.3)", borderRadius: 8, color: "#fff", fontSize: 12 }}
            />
            <Area type="monotone" dataKey="fasting" stroke="hsl(183,100%,50%)" fill="url(#sugarGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="pp" stroke="hsl(277,100%,50%)" fill="url(#ppGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 justify-center">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full bg-neon-cyan" /> Fasting
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary" /> Post Prandial
          </span>
        </div>
      </div>

      {/* BP Chart */}
      <div className="glass rounded-lg p-4 border border-neon-purple/20">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-neon-purple" />
          <span className="font-display text-xs text-neon-purple">Blood Pressure Trend</span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={bpData}>
            <XAxis dataKey="day" tick={{ fill: "hsl(220,15%,55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(220,15%,55%)", fontSize: 11 }} axisLine={false} tickLine={false} domain={[70, 160]} />
            <Tooltip
              contentStyle={{ background: "hsla(240,20%,8%,0.9)", border: "1px solid hsla(277,100%,50%,0.3)", borderRadius: 8, color: "#fff", fontSize: 12 }}
            />
            <Line type="monotone" dataKey="systolic" stroke="hsl(0,100%,55%)" strokeWidth={2} dot={{ fill: "hsl(0,100%,55%)", r: 3 }} />
            <Line type="monotone" dataKey="diastolic" stroke="hsl(277,100%,50%)" strokeWidth={2} dot={{ fill: "hsl(277,100%,50%)", r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChronicMonitor;
