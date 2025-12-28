import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  active?: boolean;
}

export function GlassCard({ children, className, active, ...props }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "glass-panel rounded-xl p-6 text-foreground transition-all duration-300",
        active ? "neon-border bg-primary/5" : "hover:bg-white/5 hover:border-primary/30",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
