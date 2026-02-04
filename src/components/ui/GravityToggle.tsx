import React from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Button } from '@/components/ui/button';
import { Magnet } from 'lucide-react';

export const GravityToggle: React.FC = () => {
    const { showGravityField, toggleGravityField } = useSimulationStore();

    return (
        <Button
            variant={showGravityField ? 'default' : 'outline'}
            size="sm"
            onClick={toggleGravityField}
            className={`
        gap-2 transition-all duration-300
        ${showGravityField
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-background/80 hover:bg-background border-muted'
                }
      `}
            title="Toggle Gravity Field Visualization"
        >
            <Magnet className="w-4 h-4" />
            <span className="hidden sm:inline">Gravity</span>
        </Button>
    );
};
