import React from 'react';
import { motion } from 'framer-motion';
import { Globe2, Info } from 'lucide-react';
import { useSimulationStore } from '@/stores/simulationStore';

export const Header: React.FC = () => {
  const bodies = useSimulationStore((state) => state.bodies);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between"
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Globe2 className="h-8 w-8 text-primary animate-spin-slow" />
          <div className="absolute inset-0 blur-lg bg-primary/30" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gradient-cosmic tracking-tight">
            OrbitForge
          </h1>
          <p className="text-xs text-muted-foreground">
            Planetary Physics Simulator
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="glass-panel rounded-lg px-4 py-2 flex items-center gap-4">
        <div className="text-center">
          <p className="text-lg font-bold text-primary">{bodies.length}</p>
          <p className="text-xs text-muted-foreground">Bodies</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
          <Info className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </motion.header>
  );
};
