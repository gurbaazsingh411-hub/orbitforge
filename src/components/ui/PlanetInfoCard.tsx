import React from 'react';
import { planetData, PlanetScientificData, calculateOrbitalPeriod } from '@/data/planetData';
import { useSimulationStore } from '@/stores/simulationStore';
import {
    Globe,
    Thermometer,
    Orbit,
    Scale,
    Clock,
    Wind,
    Sparkles,
    Info
} from 'lucide-react';

export const PlanetInfoCard: React.FC = () => {
    const { selectedBodyId, bodies } = useSimulationStore();

    if (!selectedBodyId) return null;

    const selectedBody = bodies.find(b => b.id === selectedBodyId);
    if (!selectedBody) return null;

    // Get scientific data
    const data = planetData[selectedBodyId];
    if (!data) {
        // For bodies without detailed data (asteroids, comets)
        return (
            <div className="bg-black/80 backdrop-blur-md rounded-xl p-4 border border-white/10 w-80">
                <h3 className="text-lg font-bold text-white mb-2">{selectedBody.name}</h3>
                <p className="text-gray-400 text-sm">
                    {selectedBody.bodyType === 'asteroid' && 'A small rocky body in the asteroid belt between Mars and Jupiter.'}
                    {selectedBody.bodyType === 'comet' && 'An icy body that develops a tail when approaching the Sun.'}
                    {selectedBody.bodyType === 'moon' && 'A natural satellite orbiting a planet.'}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-black/85 backdrop-blur-md rounded-xl border border-white/10 w-96 max-h-[70vh] overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white">{data.name}</h2>
                <p className="text-gray-400 text-sm mt-1">
                    {selectedBody.bodyType === 'star' ? 'Star' :
                        selectedBody.bodyType === 'moon' ? 'Natural Satellite' : 'Planet'}
                </p>
            </div>

            {/* Physical Properties */}
            <div className="p-4 border-b border-white/10">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Physical Properties
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <DataItem label="Mass" value={data.massKg + ' kg'} subValue={`${data.massEarths}× Earth`} />
                    <DataItem label="Diameter" value={`${data.diameterKm.toLocaleString()} km`} subValue={`${data.diameterEarths}× Earth`} />
                    <DataItem label="Density" value={`${data.densityGcm3} g/cm³`} />
                    <DataItem label="Surface Gravity" value={`${data.surfaceGravityMs2} m/s²`} />
                    <DataItem label="Escape Velocity" value={`${data.escapeVelocityKms} km/s`} />
                </div>
            </div>

            {/* Orbital Properties */}
            <div className="p-4 border-b border-white/10">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Orbit className="w-4 h-4" />
                    Orbital Properties
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <DataItem label="Distance from Sun" value={data.distanceFromSunKm + ' km'} subValue={`${data.distanceFromSunAU} AU`} />
                    <DataItem label="Orbital Period" value={`${data.orbitalPeriodDays.toLocaleString()} days`} subValue={`${data.orbitalPeriodYears} years`} />
                    <DataItem label="Orbital Velocity" value={`${data.orbitalVelocityKms} km/s`} />
                    <DataItem label="Eccentricity" value={data.eccentricity.toString()} />
                </div>

                {/* Kepler's Law Verification */}
                {data.distanceFromSunAU > 0 && (
                    <div className="mt-3 p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
                        <h4 className="text-xs font-semibold text-purple-300 uppercase mb-2">
                            ✨ Kepler's Third Law: T² = a³
                        </h4>
                        <div className="text-sm text-gray-300">
                            <p>Distance (a): <span className="text-white font-mono">{data.distanceFromSunAU} AU</span></p>
                            <p>Period (T): <span className="text-white font-mono">{data.orbitalPeriodYears} years</span></p>
                            <p className="mt-1">
                                Predicted T: <span className="text-green-400 font-mono">
                                    {calculateOrbitalPeriod(data.distanceFromSunAU).toFixed(3)} years
                                </span>
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Temperature & Atmosphere */}
            <div className="p-4 border-b border-white/10">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Thermometer className="w-4 h-4" />
                    Temperature & Atmosphere
                </h3>
                <div className="grid grid-cols-3 gap-2 mb-3">
                    <DataItem label="Min" value={`${data.surfaceTempC.min}°C`} small />
                    <DataItem label="Avg" value={`${data.surfaceTempC.avg}°C`} small />
                    <DataItem label="Max" value={`${data.surfaceTempC.max}°C`} small />
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                    {data.atmosphereComposition.map((comp, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-900/40 rounded text-xs text-blue-200">
                            {comp}
                        </span>
                    ))}
                </div>
            </div>

            {/* Other Info */}
            <div className="p-4 border-b border-white/10">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Other Properties
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <DataItem label="Rotation Period" value={`${Math.abs(data.rotationPeriodHours).toFixed(1)} hrs`} subValue={data.rotationPeriodHours < 0 ? 'Retrograde' : undefined} />
                    <DataItem label="Axial Tilt" value={`${data.axialTiltDegrees}°`} />
                    <DataItem label="Moons" value={data.numberOfMoons.toString()} />
                    <DataItem label="Rings" value={data.hasRings ? 'Yes' : 'No'} />
                </div>
            </div>

            {/* Fun Facts */}
            <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Did You Know?
                </h3>
                <ul className="space-y-2">
                    {data.funFacts.map((fact, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-yellow-400 mt-0.5">★</span>
                            {fact}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

// Helper component for data items
interface DataItemProps {
    label: string;
    value: string;
    subValue?: string;
    small?: boolean;
}

const DataItem: React.FC<DataItemProps> = ({ label, value, subValue, small }) => (
    <div className={small ? 'text-center' : ''}>
        <p className="text-xs text-gray-500 uppercase">{label}</p>
        <p className={`text-white font-medium ${small ? 'text-sm' : ''}`}>{value}</p>
        {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
    </div>
);
