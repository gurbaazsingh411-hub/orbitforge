import React from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2 } from 'lucide-react';

export const ScaleToggle: React.FC = () => {
    const { useRealScale, toggleRealScale } = useSimulationStore();

    return (
        <Button
            variant={useRealScale ? 'default' : 'outline'}
            size="sm"
            onClick={toggleRealScale}
            className={`
        gap-2 transition-all duration-300
        ${useRealScale
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-background/80 hover:bg-background border-muted'
                }
      `}
            title={useRealScale ? "Switch to visible scale" : "Switch to true astronomical scale (warning: planets become tiny!)"}
        >
            {useRealScale ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{useRealScale ? 'Real Scale' : 'Visible'}</span>
        </Button>
    );
};
