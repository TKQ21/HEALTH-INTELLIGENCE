import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LabResult {
  name: string;
  value: string;
  unit: string;
  reference: string;
  status: "normal" | "borderline" | "high";
  explanation: string;
  advice: string;
}

const mockResults: LabResult[] = [
  { name: "Hemoglobin", value: "14.2", unit: "g/dL", reference: "13.0-17.0", status: "normal", explanation: "Aapka hemoglobin bilkul normal hai. Iska matlab hai ki blood mein oxygen carry karne wale cells sahi kaam kar rahe hain.", advice: "Balanced diet maintain karein." },
  { name: "Fasting Blood Sugar", value: "118", unit: "mg/dL", reference: "70-100", status: "borderline", explanation: "Sugar thoda zyada hai normal se. Ye pre-diabetic range mein aa sakta hai. Abhi koi badi baat nahi, lekin dhyan dena zaroori hai.", advice: "Sugar aur refined carbs kam karein. Doctor se HbA1c test karwayein." },
  { name: "Creatinine", value: "2.1", unit: "mg/dL", reference: "0.7-1.3", status: "high", explanation: "Creatinine kaafi zyada hai, jo kidney function mein problem indicate karta hai. Ye serious ho sakta hai.", advice: "Turant nephrologist (kidney doctor) se milein. Paani zyada piyein." },
  { name: "Total Cholesterol", value: "195", unit: "mg/dL", reference: "< 200", status: "normal", explanation: "Cholesterol normal range mein hai. Lekin borderline ke paas hai, toh care zaruri.", advice: "Oily food avoid karein, regular walk karein." },
  { name: "TSH", value: "5.8", unit: "mIU/L", reference: "0.4-4.0", status: "borderline", explanation: "Thyroid hormone thoda high hai. Subclinical hypothyroidism ho sakta hai.", advice: "Endocrinologist se follow-up karein." },
];

const statusConfig = {
  normal: { icon: CheckCircle, color: "text-neon-green", bg: "bg-neon-green/10", border: "border-neon-green/30", glow: "glow-green", label: "Normal" },
  borderline: { icon: AlertTriangle, color: "text-neon-yellow", bg: "bg-neon-yellow/10", border: "border-neon-yellow/30", glow: "glow-orange", label: "Borderline" },
  high: { icon: XCircle, color: "text-neon-red", bg: "bg-neon-red/10", border: "border-neon-red/30", glow: "animate-red-pulse", label: "High Risk" },
};

const LabAnalyzer = () => {
  const [showResults, setShowResults] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleUpload = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setShowResults(true);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {!showResults ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div
            className="glass rounded-xl p-8 border border-dashed border-neon-cyan/30 hover:border-neon-cyan/60 transition-all cursor-pointer flex flex-col items-center gap-4"
            onClick={handleUpload}
          >
            {analyzing ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                <p className="text-neon-cyan font-display text-sm">Analyzing Report...</p>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-neon-cyan animate-neon-pulse" />
                <div className="text-center">
                  <p className="text-foreground font-medium">Upload Lab Report</p>
                  <p className="text-muted-foreground text-sm mt-1">PDF, Image, or enter manually</p>
                </div>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10" onClick={handleUpload}>
              <FileText className="w-4 h-4 mr-2" /> Manual Entry
            </Button>
          </div>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm text-neon-cyan">Analysis Results</h3>
              <Button variant="ghost" size="sm" className="text-muted-foreground text-xs" onClick={() => setShowResults(false)}>
                New Report
              </Button>
            </div>
            {mockResults.map((result, i) => {
              const config = statusConfig[result.status];
              const Icon = config.icon;
              return (
                <motion.div
                  key={result.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`glass rounded-lg p-4 border ${config.border} ${result.status === "high" ? config.glow : ""}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${config.color}`} />
                      <span className="font-medium text-foreground text-sm">{result.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className={`font-mono text-xl font-bold ${config.color}`}>{result.value}</span>
                    <span className="text-muted-foreground text-xs">{result.unit}</span>
                    <span className="text-muted-foreground text-xs ml-auto">Ref: {result.reference}</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <p className="text-muted-foreground"><span className="text-foreground font-medium">Kya matlab hai:</span> {result.explanation}</p>
                    <p className="text-muted-foreground"><span className="text-foreground font-medium">Salaah:</span> {result.advice}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default LabAnalyzer;
