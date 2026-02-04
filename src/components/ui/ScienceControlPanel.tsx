import React, { useState, useRef, useEffect } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Button } from '@/components/ui/button';
import {
    Settings,
    Sun,
    Moon,
    Compass,
    Target,
    Zap,
    Ruler,
    Orbit,
    Wind,
    Maximize2
} from 'lucide-react';

export const ScienceControlPanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const {
        showDistanceLabels, toggleDistanceLabels,
        showLightSpeed, toggleLightSpeed,
        showInverseSquare, toggleInverseSquare,
        showDayNight, toggleDayNight,
        showEclipses, toggleEclipses,
        showAlignments, toggleAlignments,
        showBarycenter, toggleBarycenter,
        showLagrange, toggleLagrange,
        showTidalForces, toggleTidalForces,
        showAtmospheres, toggleAtmospheres,
        useRealScale, toggleRealScale,
    } = useSimulationStore();

    // Close panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const toggles = [
        { enabled: showDistanceLabels, toggle: toggleDistanceLabels, label: 'Distance Labels', icon: Ruler, desc: 'AU and light-time' },
        { enabled: showLightSpeed, toggle: toggleLightSpeed, label: 'Light Speed', icon: Zap, desc: 'Photon animation' },
        { enabled: showInverseSquare, toggle: toggleInverseSquare, label: 'Inverse Square', icon: Sun, desc: '1/r² intensity' },
        { enabled: showDayNight, toggle: toggleDayNight, label: 'Day/Night', icon: Moon, desc: 'Lit/dark sides' },
        { enabled: showEclipses, toggle: toggleEclipses, label: 'Eclipses', icon: Target, desc: 'Eclipse alerts' },
        { enabled: showAlignments, toggle: toggleAlignments, label: 'Alignments', icon: Compass, desc: 'Planet alignments' },
        { enabled: showBarycenter, toggle: toggleBarycenter, label: 'Barycenter', icon: Target, desc: 'Center of mass' },
        { enabled: showLagrange, toggle: toggleLagrange, label: 'Lagrange', icon: Orbit, desc: 'L1-L5 points' },
        { enabled: showTidalForces, toggle: toggleTidalForces, label: 'Tidal Forces', icon: Compass, desc: 'Gravitational stretch' },
        { enabled: showAtmospheres, toggle: toggleAtmospheres, label: 'Atmosphere', icon: Wind, desc: 'Composition chart' },
        { enabled: useRealScale, toggle: toggleRealScale, label: 'True Scale', icon: Maximize2, desc: 'Real size ratios (Tiny!)' },
    ];

    const activeCount = toggles.filter(t => t.enabled).length;

    return (
        <div className="relative" ref={panelRef}>
            <Button
                variant={activeCount > 0 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className={`gap-2 transition-all ${activeCount > 0
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-background/80 hover:bg-background border-muted'
                    }`}
                title="Science Visualizations"
            >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Science</span>
                {activeCount > 0 && (
                    <span className="bg-white/20 px-1.5 rounded text-xs">{activeCount}</span>
                )}
            </Button>

            {isOpen && (
                <div className="absolute bottom-full mb-2 left-0 bg-black/95 backdrop-blur-md rounded-lg border border-white/20 p-3 w-64 z-50 shadow-xl">
                    <h3 className="text-white font-semibold mb-3 text-sm flex items-center justify-between">
                        Science Visualizations
                        <span className="text-xs text-gray-400">{activeCount}/8 active</span>
                    </h3>
                    <div className="space-y-1.5">
                        {toggles.map((toggle, idx) => (
                            <button
                                key={idx}
                                onClick={toggle.toggle}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${toggle.enabled
                                    ? 'bg-blue-600/30 border border-blue-500/50'
                                    : 'bg-white/5 hover:bg-white/10 border border-transparent'
                                    }`}
                            >
                                <toggle.icon className={`w-4 h-4 ${toggle.enabled ? 'text-blue-400' : 'text-gray-400'}`} />
                                <div className="text-left flex-1">
                                    <div className={`text-sm ${toggle.enabled ? 'text-white' : 'text-gray-300'}`}>
                                        {toggle.label}
                                    </div>
                                    <div className="text-xs text-gray-500">{toggle.desc}</div>
                                </div>
                                <div className={`w-2 h-2 rounded-full transition-colors ${toggle.enabled ? 'bg-blue-400' : 'bg-gray-600'}`} />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
