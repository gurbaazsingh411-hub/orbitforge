import React, { useEffect, useState } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import {
    ChevronRight,
    ChevronLeft,
    BookOpen,
    X,
    Maximize,
    Sun,
    Globe,
    Wind,
    Orbit
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Chapter {
    title: string;
    content: string;
    action?: () => void;
    icon?: any;
    targetBodyId?: string;
}

export const EducationalGuide: React.FC = () => {
    const {
        isGuideActive,
        currentGuideStep,
        toggleGuide,
        setGuideStep,
        setSelectedBody,
        toggleHabitableZone,
        toggleDistanceLabels,
        toggleAtmospheres,
        toggleTidalForces,
        toggleRealScale,
        showHabitableZone,
        showAtmospheres,
        showTidalForces,
        bodies
    } = useSimulationStore();

    const [isExpanded, setIsExpanded] = useState(true);

    // Define chapters
    const chapters: Chapter[] = [
        {
            title: "Welcome to Stellar Sandbox",
            content: "Welcome, explorer! This interactive tour will guide you through the wonders of our solar system and the physics that govern it. Use 'Next' to proceed.",
            icon: BookOpen,
            action: () => {
                setSelectedBody(null);
                // Reset toggles
                if (showHabitableZone) toggleHabitableZone();
                if (showAtmospheres) toggleAtmospheres();
                if (showTidalForces) toggleTidalForces();
            }
        },
        {
            title: "The Sun: Our Star",
            content: "At the center lies the Sun, a G-type main-sequence star. It contains 99.86% of the solar system's mass! Its gravity holds everything together.",
            targetBodyId: "sun",
            icon: Sun,
            action: () => setSelectedBody("sun")
        },
        {
            title: "The Goldilocks Zone",
            content: "Life as we know it requires liquid water. The 'Habitable Zone' (green) is the region where temperatures are just right. Notice how Earth sits perfectly inside it.",
            icon: Globe,
            action: () => {
                setSelectedBody(null);
                if (!showHabitableZone) toggleHabitableZone();
            }
        },
        {
            title: "Inner Planets",
            content: "Mercury, Venus, Earth, and Mars are rocky planets. Venus is hotter than Mercury due to a runaway greenhouse effect from its thick CO2 atmosphere.",
            targetBodyId: "venus",
            icon: Wind,
            action: () => {
                if (!showAtmospheres) toggleAtmospheres();
                setSelectedBody("venus");
            }
        },
        {
            title: "Gas Giants",
            content: "Beyond the asteroid belt lie the Gas Giants: Jupiter and Saturn. They are massive, composed mostly of Hydrogen and Helium, and have many moons.",
            targetBodyId: "jupiter",
            icon: Maximize,
            action: () => {
                setSelectedBody("jupiter");
                if (showAtmospheres) toggleAtmospheres(); // Turn off atmosphere to focus on looks
            }
        },
        {
            title: "Tidal Forces",
            content: "Gravity isn't just a force—it stretches things! Look at Jupiter's moons. The blue ellipses show how gravity pulls on them, creating internal heat.",
            targetBodyId: "jupiter", // ideally zoom to moon
            icon: Orbit,
            action: () => {
                if (!showTidalForces) toggleTidalForces();
            }
        },
        {
            title: "The Scale of Space",
            content: "The distances in space are vast. In this simulation, planets are enlarged to be visible. Use the 'True Scale' toggle in the Science panel to see reality!",
            icon: Maximize,
            action: () => {
                // We don't auto-toggle true scale because it makes things invisible, 
                // just prompt the user or maybe toggle distance labels
                if (!useSimulationStore.getState().showDistanceLabels)
                    useSimulationStore.getState().toggleDistanceLabels();
            }
        },
        {
            title: "Your Journey Begins",
            content: "You're now ready to explore! Use the Science Panel to toggle visualizations, click planets for data, or even spawn new bodies. Have fun!",
            action: () => {
                // Cleanup
                if (showTidalForces) toggleTidalForces();
            }
        }
    ];

    useEffect(() => {
        if (isGuideActive && chapters[currentGuideStep].action) {
            chapters[currentGuideStep].action();
        }
    }, [isGuideActive, currentGuideStep]);

    if (!isGuideActive) return (
        <Button
            variant="outline"
            className="fixed bottom-20 right-4 rounded-full w-12 h-12 p-0 bg-blue-600/80 hover:bg-blue-500 border-blue-400/50 shadow-[0_0_15px_rgba(37,99,235,0.5)] animate-bounce"
            onClick={() => toggleGuide(true)}
        >
            <BookOpen className="w-6 h-6 text-white" />
        </Button>
    );

    const chapter = chapters[currentGuideStep];

    return (
        <div className="fixed bottom-20 right-4 w-80 bg-black/90 backdrop-blur-xl border border-blue-500/30 rounded-xl shadow-2xl overflow-hidden pointer-events-auto transition-all duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {chapter.icon && <chapter.icon className="w-5 h-5 text-blue-400" />}
                    <h3 className="text-white font-bold text-sm tracking-wide">
                        Chapter {currentGuideStep + 1}/{chapters.length}
                    </h3>
                </div>
                <button
                    onClick={() => toggleGuide(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="p-5">
                <h2 className="text-xl font-bold text-white mb-3 leading-tight">{chapter.title}</h2>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    {chapter.content}
                </p>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setGuideStep(Math.max(0, currentGuideStep - 1))}
                        disabled={currentGuideStep === 0}
                        className="text-gray-400 hover:text-white"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Prev
                    </Button>

                    <div className="flex gap-1">
                        {chapters.map((_, i) => (
                            <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentGuideStep ? 'bg-blue-400' : 'bg-gray-700'
                                    }`}
                            />
                        ))}
                    </div>

                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                            if (currentGuideStep < chapters.length - 1) {
                                setGuideStep(currentGuideStep + 1);
                            } else {
                                toggleGuide(false);
                                setGuideStep(0);
                            }
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white"
                    >
                        {currentGuideStep < chapters.length - 1 ? 'Next' : 'Finish'}
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
