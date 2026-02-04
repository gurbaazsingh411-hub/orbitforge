import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const timeScales = [
  { value: 1, label: '1×' },
  { value: 10, label: '10×' },
  { value: 100, label: '100×' },
  { value: 1000, label: '1000×' },
];

export const TimeControls: React.FC = () => {
  const { isPaused, timeScale, togglePause, setTimeScale } = useSimulationStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-panel rounded-xl p-3 flex items-center gap-3"
    >
      {/* Play/Pause button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePause}
        className={cn(
          "h-10 w-10 rounded-lg transition-all duration-300",
          isPaused 
            ? "bg-primary/20 text-primary hover:bg-primary/30" 
            : "bg-muted text-foreground hover:bg-muted/80"
        )}
      >
        {isPaused ? (
          <Play className="h-5 w-5 fill-current" />
        ) : (
          <Pause className="h-5 w-5" />
        )}
      </Button>

      {/* Divider */}
      <div className="w-px h-6 bg-border" />

      {/* Time scale buttons */}
      <div className="flex items-center gap-1">
        <Zap className="h-4 w-4 text-muted-foreground mr-1" />
        {timeScales.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTimeScale(value)}
            className={cn(
              "px-2.5 py-1.5 text-xs font-mono rounded-md transition-all duration-200",
              timeScale === value
                ? "bg-primary text-primary-foreground shadow-glow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </motion.div>
  );
};
