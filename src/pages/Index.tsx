import React, { useState } from 'react';
import { SimulationCanvas } from '@/components/simulation/SimulationCanvas';
import { Header } from '@/components/ui/Header';
import { TimeControls } from '@/components/ui/TimeControls';
import { SpawnControls } from '@/components/ui/SpawnControls';
import { PlanetPanel } from '@/components/ui/PlanetPanel';
import { HelpTooltip } from '@/components/ui/HelpTooltip';
import { GravityToggle } from '@/components/ui/GravityToggle';
import { HabitableZoneToggle } from '@/components/ui/HabitableZoneToggle';
import { PlanetInfoCard } from '@/components/ui/PlanetInfoCard';
import { ScienceControlPanel } from '@/components/ui/ScienceControlPanel';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-nebula">
      {/* Loading Screen */}
      {isLoading && (
        <LoadingScreen onLoadComplete={() => setIsLoading(false)} />
      )}

      {/* 3D Simulation Canvas */}
      <SimulationCanvas />

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 pointer-events-auto">
          <Header />
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
          {/* Left side - time controls */}
          <div className="flex items-end gap-3 pointer-events-auto">
            <TimeControls />
            <SpawnControls />
            <GravityToggle />
            <HabitableZoneToggle />
            <ScienceControlPanel />
          </div>

          {/* Right side - help */}
          <div className="pointer-events-auto">
            <HelpTooltip />
          </div>
        </div>

        {/* Left panel - Planet Info Card (when selected) */}
        <div className="absolute top-20 left-4 pointer-events-auto">
          <PlanetInfoCard />
        </div>

        {/* Right panel - planet properties */}
        <div className="absolute top-20 right-4 pointer-events-auto">
          <PlanetPanel />
        </div>
      </div>
    </div>
  );
};

export default Index;
