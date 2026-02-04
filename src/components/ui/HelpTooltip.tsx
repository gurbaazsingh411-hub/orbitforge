import React from 'react';
import { motion } from 'framer-motion';
import { Keyboard, MousePointer, Move, ZoomIn } from 'lucide-react';

export const HelpTooltip: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-panel rounded-xl p-4 max-w-xs"
    >
      <h4 className="text-sm font-semibold text-foreground mb-3">Controls</h4>
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-3 text-muted-foreground">
          <MousePointer className="h-4 w-4 text-primary" />
          <span>Click planet to select</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Move className="h-4 w-4 text-primary" />
          <span>Right-click + drag to pan</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <ZoomIn className="h-4 w-4 text-primary" />
          <span>Scroll to zoom</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Keyboard className="h-4 w-4 text-primary" />
          <span>Left-click + drag to rotate</span>
        </div>
      </div>
    </motion.div>
  );
};
