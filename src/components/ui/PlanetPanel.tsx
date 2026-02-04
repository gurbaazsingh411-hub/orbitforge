import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Flame, Droplets, Weight, CircleDot, Thermometer, Leaf, Bug, TreePine } from 'lucide-react';
import { useSimulationStore, getTemperatureColor, calculateHabitability } from '@/stores/simulationStore';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export const PlanetPanel: React.FC = () => {
  const { bodies, selectedBodyId, setSelectedBody, updateBody, removeBody, destroyBody, isPaused } = useSimulationStore();
  
  const selectedBody = bodies.find(b => b.id === selectedBodyId);

  if (!selectedBody) return null;

  const handleMassChange = (value: number[]) => {
    updateBody(selectedBody.id, { mass: value[0] });
  };

  const handleRadiusChange = (value: number[]) => {
    updateBody(selectedBody.id, { radius: value[0] });
  };

  const handleTemperatureChange = (value: number[]) => {
    updateBody(selectedBody.id, { 
      temperature: value[0],
      color: getTemperatureColor(value[0]),
    });
  };

  const handleWaterChange = (value: number[]) => {
    updateBody(selectedBody.id, { waterLevel: value[0] });
  };

  const handleDelete = () => {
    removeBody(selectedBody.id);
  };

  const handleDestroy = () => {
    destroyBody(selectedBody.id);
  };

  const isSun = selectedBody.mass > 100;
  const habitability = calculateHabitability(selectedBody.temperature, selectedBody.waterLevel);

  // Life status text
  const getLifeStatus = (lifeLevel: number): { text: string; color: string } => {
    if (lifeLevel < 0.05) return { text: 'Barren', color: 'text-muted-foreground' };
    if (lifeLevel < 0.2) return { text: 'Microbial', color: 'text-lime-500' };
    if (lifeLevel < 0.4) return { text: 'Simple Life', color: 'text-green-500' };
    if (lifeLevel < 0.6) return { text: 'Complex Life', color: 'text-emerald-500' };
    if (lifeLevel < 0.8) return { text: 'Thriving', color: 'text-teal-500' };
    return { text: 'Advanced', color: 'text-cyan-400' };
  };

  const lifeStatus = getLifeStatus(selectedBody.lifeLevel);

  return (
    <AnimatePresence>
      <motion.div
        key={selectedBody.id}
        initial={{ opacity: 0, x: 20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="glass-panel rounded-2xl p-5 w-72"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full shadow-glow-sm"
              style={{ 
                background: `radial-gradient(circle at 30% 30%, ${getTemperatureColor(selectedBody.temperature)}, ${getTemperatureColor(selectedBody.temperature)}88)`,
              }}
            />
            <div>
              <h3 className="font-semibold text-foreground">{selectedBody.name}</h3>
              <p className="text-xs text-muted-foreground">
                {isSun ? 'Star' : 'Planet'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedBody(null)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Drag hint when paused */}
        {isPaused && !isSun && (
          <div className="mb-4 p-2 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs text-primary text-center">
              🖱️ Drag to reposition while paused
            </p>
          </div>
        )}

        {/* Properties */}
        <div className="space-y-4">
          {/* Mass */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Weight className="h-4 w-4" />
                <span>Mass</span>
              </div>
              <span className="font-mono text-primary">{selectedBody.mass.toFixed(1)}</span>
            </div>
            <Slider
              value={[selectedBody.mass]}
              onValueChange={handleMassChange}
              min={0.5}
              max={isSun ? 2000 : 50}
              step={0.5}
              className="slider-cosmic"
            />
          </div>

          {/* Radius */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CircleDot className="h-4 w-4" />
                <span>Radius</span>
              </div>
              <span className="font-mono text-primary">{selectedBody.radius.toFixed(2)}</span>
            </div>
            <Slider
              value={[selectedBody.radius]}
              onValueChange={handleRadiusChange}
              min={0.1}
              max={isSun ? 5 : 2}
              step={0.05}
            />
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Thermometer className="h-4 w-4" />
                <span>Temperature</span>
              </div>
              <span 
                className="font-mono"
                style={{ color: getTemperatureColor(selectedBody.temperature) }}
              >
                {(selectedBody.temperature * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              value={[selectedBody.temperature]}
              onValueChange={handleTemperatureChange}
              min={0}
              max={1}
              step={0.01}
            />
          </div>

          {/* Water Level */}
          {!isSun && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Droplets className="h-4 w-4" />
                  <span>Water Level</span>
                </div>
                <span className="font-mono text-primary">
                  {(selectedBody.waterLevel * 100).toFixed(0)}%
                </span>
              </div>
              <Slider
                value={[selectedBody.waterLevel]}
                onValueChange={handleWaterChange}
                min={0}
                max={1}
                step={0.01}
              />
            </div>
          )}
        </div>

        {/* Life System Section */}
        {!isSun && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">Ecosystem</span>
              <span className={cn("text-xs font-medium", lifeStatus.color)}>
                {lifeStatus.text}
              </span>
            </div>
            
            <div className="space-y-3">
              {/* Life Level */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Bug className="h-3 w-3" />
                    <span>Life Level</span>
                  </div>
                  <span className="font-mono text-green-400">
                    {(selectedBody.lifeLevel * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={selectedBody.lifeLevel * 100} 
                  className="h-1.5 bg-muted"
                />
              </div>

              {/* Biodiversity */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Leaf className="h-3 w-3" />
                    <span>Biodiversity</span>
                  </div>
                  <span className="font-mono text-emerald-400">
                    {(selectedBody.biodiversity * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={selectedBody.biodiversity * 100} 
                  className="h-1.5 bg-muted"
                />
              </div>

              {/* Vegetation */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <TreePine className="h-3 w-3" />
                    <span>Vegetation</span>
                  </div>
                  <span className="font-mono text-lime-400">
                    {(selectedBody.vegetationCover * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={selectedBody.vegetationCover * 100} 
                  className="h-1.5 bg-muted"
                />
              </div>

              {/* Habitability indicator */}
              <div className="mt-2 p-2 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Habitability</span>
                  <span className={cn(
                    "font-mono",
                    habitability > 0.6 ? "text-green-400" : 
                    habitability > 0.3 ? "text-yellow-400" : "text-red-400"
                  )}>
                    {(habitability * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Velocity info */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Velocity</span>
            <span className="font-mono">
              {Math.sqrt(
                selectedBody.velocity[0] ** 2 +
                selectedBody.velocity[1] ** 2 +
                selectedBody.velocity[2] ** 2
              ).toFixed(2)} u/s
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="flex-1 border-muted hover:border-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDestroy}
            className="flex-1 border-muted hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Flame className="h-4 w-4 mr-2" />
            Destroy
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
