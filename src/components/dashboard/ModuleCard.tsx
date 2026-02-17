import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ModuleCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  glowColor: "cyan" | "purple" | "green" | "orange";
  onClick?: () => void;
  children?: ReactNode;
  active?: boolean;
}

const glowMap = {
  cyan: "glow-cyan",
  purple: "glow-purple",
  green: "glow-green",
  orange: "glow-orange",
};

const borderMap = {
  cyan: "border-neon-cyan/30 hover:border-neon-cyan/60",
  purple: "border-neon-purple/30 hover:border-neon-purple/60",
  green: "border-neon-green/30 hover:border-neon-green/60",
  orange: "border-neon-orange/30 hover:border-neon-orange/60",
};

const ModuleCard = ({ icon, title, description, glowColor, onClick, children, active }: ModuleCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={onClick}
      className={`glass rounded-xl p-6 cursor-pointer transition-all duration-300 border ${borderMap[glowColor]} ${active ? glowMap[glowColor] + " " + "animate-glow-border" : ""}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`text-neon-${glowColor}`}>{icon}</div>
        <h3 className="font-display text-lg text-foreground">{title}</h3>
      </div>
      <p className="text-muted-foreground text-sm mb-4">{description}</p>
      {children}
    </motion.div>
  );
};

export default ModuleCard;
