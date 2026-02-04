import React from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Button } from '@/components/ui/button';
import { CircleDot } from 'lucide-react';

export const HabitableZoneToggle: React.FC = () => {
    const { showHabitableZone, toggleHabitableZone } = useSimulationStore();

    return (
        <Button
            variant={showHabitableZone ? 'default' : 'outline'}
            size="sm"
            onClick={toggleHabitableZone}
            className={`
        gap-2 transition-all duration-300
        ${showHabitableZone
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-background/80 hover:bg-background border-muted'
                }
      `}
            title="Show Habitable Zone (Goldilocks Zone)"
        >
            <CircleDot className="w-4 h-4" />
            <span className="hidden sm:inline">Habitable</span>
        </Button>
    );
};
