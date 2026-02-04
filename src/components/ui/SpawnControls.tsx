import React from 'react';
import { motion } from 'framer-motion';
import { Plus, MousePointer2 } from 'lucide-react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const SpawnControls: React.FC = () => {
  const { isSpawnMode, setSpawnMode } = useSimulationStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-panel rounded-xl p-3"
    >
      <Button
        variant="ghost"
        onClick={() => setSpawnMode(!isSpawnMode)}
        className={cn(
          "h-10 px-4 rounded-lg transition-all duration-300 flex items-center gap-2",
          isSpawnMode
            ? "bg-primary text-primary-foreground shadow-glow"
            : "text-foreground hover:bg-muted"
        )}
      >
        {isSpawnMode ? (
          <>
            <MousePointer2 className="h-4 w-4" />
            <span className="text-sm font-medium">Click to Place</span>
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">New Planet</span>
          </>
        )}
      </Button>
    </motion.div>
  );
};
