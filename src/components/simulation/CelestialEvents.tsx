import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useSimulationStore } from '@/stores/simulationStore';

// Day/Night terminator - shows lit/dark sides
export const DayNightTerminator: React.FC = () => {
    const { showDayNight, bodies } = useSimulationStore();
    const sun = bodies.find(b => b.bodyType === 'star');
    const planets = bodies.filter(b => b.bodyType === 'planet' || b.bodyType === 'moon');

    if (!showDayNight || !sun) return null;

    return (
        <group>
            {planets.map(planet => {
                const sunPos = new THREE.Vector3(...sun.position);
                const planetPos = new THREE.Vector3(...planet.position);
                const toSun = sunPos.clone().sub(planetPos).normalize();

                // Create a half-sphere shadow on the dark side
                return (
                    <group key={planet.id} position={planet.position}>
                        {/* Dark side hemisphere */}
                        <mesh rotation={[0, Math.atan2(toSun.x, toSun.z) + Math.PI, 0]}>
                            <sphereGeometry args={[planet.radius * 1.01, 32, 32, 0, Math.PI]} />
                            <meshBasicMaterial
                                color="#000011"
                                transparent
                                opacity={0.7}
                                side={THREE.FrontSide}
                            />
                        </mesh>
                    </group>
                );
            })}
        </group>
    );
};

// Eclipse detection and visualization
export const EclipseSimulator: React.FC = () => {
    const { showEclipses, bodies } = useSimulationStore();
    const sun = bodies.find(b => b.bodyType === 'star');
    const earth = bodies.find(b => b.id === 'earth');
    const moon = bodies.find(b => b.id === 'moon');

    const eclipseData = useMemo(() => {
        if (!sun || !earth || !moon) return null;

        const sunPos = new THREE.Vector3(...sun.position);
        const earthPos = new THREE.Vector3(...earth.position);
        const moonPos = new THREE.Vector3(...moon.position);

        // Check for lunar eclipse (Earth between Sun and Moon)
        const sunToEarth = earthPos.clone().sub(sunPos).normalize();
        const earthToMoon = moonPos.clone().sub(earthPos).normalize();
        const lunarAlignment = sunToEarth.dot(earthToMoon);

        // Check for solar eclipse (Moon between Sun and Earth)
        const sunToMoon = moonPos.clone().sub(sunPos).normalize();
        const moonToEarth = earthPos.clone().sub(moonPos).normalize();
        const solarAlignment = sunToMoon.dot(moonToEarth);

        const lunarEclipse = lunarAlignment > 0.98;
        const solarEclipse = solarAlignment > 0.995;

        return { lunarEclipse, solarEclipse, moonPos, earthPos, sunPos };
    }, [sun, earth, moon, bodies]);

    if (!showEclipses || !eclipseData) return null;

    return (
        <group>
            {/* Shadow cone from Earth during lunar eclipse */}
            {eclipseData.lunarEclipse && (
                <Html position={eclipseData.moonPos.toArray()} center>
                    <div className="bg-red-900/80 px-3 py-1 rounded-full text-white text-sm font-bold animate-pulse">
                        🌑 LUNAR ECLIPSE
                    </div>
                </Html>
            )}

            {eclipseData.solarEclipse && (
                <Html position={eclipseData.earthPos.toArray()} center>
                    <div className="bg-gray-900/90 px-3 py-1 rounded-full text-white text-sm font-bold animate-pulse">
                        🌘 SOLAR ECLIPSE
                    </div>
                </Html>
            )}
        </group>
    );
};

// Planetary alignment detector
export const PlanetaryAlignment: React.FC = () => {
    const { showAlignments, bodies } = useSimulationStore();
    const sun = bodies.find(b => b.bodyType === 'star');
    const planets = bodies.filter(b => b.bodyType === 'planet');

    const alignments = useMemo(() => {
        if (!sun || planets.length < 3) return [];

        const alignedGroups: { planets: string[]; angle: number }[] = [];
        const sunPos = new THREE.Vector3(...sun.position);

        // Check all combinations of 3+ planets
        for (let i = 0; i < planets.length; i++) {
            for (let j = i + 1; j < planets.length; j++) {
                const p1 = new THREE.Vector3(...planets[i].position).sub(sunPos).normalize();
                const p2 = new THREE.Vector3(...planets[j].position).sub(sunPos).normalize();
                const angle = Math.acos(p1.dot(p2)) * (180 / Math.PI);

                if (angle < 15) { // Within 15 degrees
                    alignedGroups.push({
                        planets: [planets[i].name, planets[j].name],
                        angle
                    });
                }
            }
        }

        return alignedGroups;
    }, [sun, planets, bodies]);

    if (!showAlignments || alignments.length === 0) return null;

    return (
        <Html position={[0, 10, 0]} center>
            <div className="bg-purple-900/80 px-3 py-2 rounded text-white text-sm">
                <div className="font-bold">🔮 Planetary Alignment!</div>
                {alignments.map((a, i) => (
                    <div key={i} className="text-purple-200 text-xs">
                        {a.planets.join(' ↔ ')} ({a.angle.toFixed(1)}°)
                    </div>
                ))}
            </div>
        </Html>
    );
};

// Barycenter (center of mass) marker
export const Barycenter: React.FC = () => {
    const { showBarycenter, bodies } = useSimulationStore();
    const markerRef = useRef<THREE.Mesh>(null);

    const barycenterPos = useMemo(() => {
        let totalMass = 0;
        let weightedPos = new THREE.Vector3(0, 0, 0);

        for (const body of bodies) {
            totalMass += body.mass;
            weightedPos.add(new THREE.Vector3(...body.position).multiplyScalar(body.mass));
        }

        return weightedPos.divideScalar(totalMass);
    }, [bodies]);

    useFrame(() => {
        if (markerRef.current) {
            markerRef.current.rotation.y += 0.02;
        }
    });

    if (!showBarycenter) return null;

    return (
        <group position={barycenterPos}>
            {/* Cross marker */}
            <mesh ref={markerRef}>
                <octahedronGeometry args={[0.5]} />
                <meshBasicMaterial color="#ff00ff" wireframe />
            </mesh>

            <Html center>
                <div className="bg-purple-600/80 px-2 py-1 rounded text-white text-xs whitespace-nowrap">
                    ⚖️ Barycenter
                </div>
            </Html>
        </group>
    );
};

// Lagrange points for Earth-Sun system
export const LagrangePoints: React.FC = () => {
    const { showLagrange, bodies } = useSimulationStore();
    const sun = bodies.find(b => b.bodyType === 'star');
    const earth = bodies.find(b => b.id === 'earth');

    const points = useMemo(() => {
        if (!sun || !earth) return [];

        const sunPos = new THREE.Vector3(...sun.position);
        const earthPos = new THREE.Vector3(...earth.position);
        const toEarth = earthPos.clone().sub(sunPos);
        const dist = toEarth.length();
        const dir = toEarth.normalize();
        const perpDir = new THREE.Vector3(-dir.z, 0, dir.x);

        return [
            { name: 'L1', pos: sunPos.clone().add(dir.clone().multiplyScalar(dist * 0.99)), desc: 'Between Sun & Earth' },
            { name: 'L2', pos: earthPos.clone().add(dir.clone().multiplyScalar(dist * 0.01)), desc: 'Beyond Earth' },
            { name: 'L3', pos: sunPos.clone().sub(dir.clone().multiplyScalar(dist)), desc: 'Opposite Earth' },
            { name: 'L4', pos: sunPos.clone().add(dir.clone().multiplyScalar(dist * 0.5)).add(perpDir.multiplyScalar(dist * 0.866)), desc: 'Leading triangle' },
            { name: 'L5', pos: sunPos.clone().add(dir.clone().multiplyScalar(dist * 0.5)).sub(perpDir.clone().multiplyScalar(dist * 0.866)), desc: 'Trailing triangle' },
        ];
    }, [sun, earth, bodies]);

    if (!showLagrange || points.length === 0) return null;

    return (
        <group>
            {points.map(point => (
                <group key={point.name} position={point.pos}>
                    <mesh>
                        <sphereGeometry args={[0.3, 16, 16]} />
                        <meshBasicMaterial color="#00ffff" />
                    </mesh>
                    <Html center>
                        <div className="bg-cyan-900/80 px-2 py-1 rounded text-cyan-100 text-xs whitespace-nowrap">
                            {point.name}
                        </div>
                    </Html>
                </group>
            ))}
        </group>
    );
};

// Tidal Forces - elliptical distortion visualization
export const TidalForces: React.FC = () => {
    const { showTidalForces, bodies } = useSimulationStore();
    const sun = bodies.find(b => b.bodyType === 'star');
    const planets = bodies.filter(b => b.bodyType === 'planet');
    const moons = bodies.filter(b => b.bodyType === 'moon');

    if (!showTidalForces || !sun) return null;

    return (
        <group>
            {/* Show tidal bulge on moons facing their planet */}
            {moons.map(moon => {
                // Find parent planet (closest planet)
                const moonPos = new THREE.Vector3(...moon.position);
                const parent = planets.reduce((closest, p) => {
                    const pPos = new THREE.Vector3(...p.position);
                    const dist = moonPos.distanceTo(pPos);
                    const closestDist = new THREE.Vector3(...closest.position).distanceTo(moonPos);
                    return dist < closestDist ? p : closest;
                }, planets[0]);

                if (!parent) return null;

                const parentPos = new THREE.Vector3(...parent.position);
                const toParent = parentPos.clone().sub(moonPos).normalize();
                const rotation = new THREE.Euler(0, Math.atan2(toParent.x, toParent.z), 0);

                return (
                    <group key={moon.id} position={moon.position} rotation={rotation}>
                        {/* Ellipse representing tidal bulge */}
                        <mesh scale={[1, 1, 1.5]}>
                            <sphereGeometry args={[moon.radius * 1.5, 32, 32]} />
                            <meshBasicMaterial color="#44aaff" wireframe transparent opacity={0.3} />
                        </mesh>
                        <Html center distanceFactor={10}>
                            <div className="bg-blue-900/80 px-2 py-1 rounded text-xs text-blue-200 whitespace-nowrap">
                                Tidal Force
                            </div>
                        </Html>
                    </group>
                );
            })}
        </group>
    );
};

// Atmosphere Composition Overlay
import { planetData } from '@/data/planetData';

export const AtmosphereOverlay: React.FC = () => {
    const { showAtmospheres, bodies } = useSimulationStore();
    const planets = bodies.filter(b => b.bodyType === 'planet');

    if (!showAtmospheres) return null;

    return (
        <group>
            {planets.map(planet => {
                const data = planetData[planet.id];
                if (!data || data.atmosphereComposition.length === 0) return null;

                // Simple colors for common gases
                const gasColors: Record<string, string> = {
                    'Hydrogen': '#3b82f6',
                    'Helium': '#fcd34d',
                    'Nitrogen': '#9ca3af',
                    'Oxygen': '#ef4444',
                    'CO2': '#6b7280',
                    'Methane': '#10b981'
                };

                return (
                    <Html key={planet.id} position={[planet.position[0], planet.position[1] + planet.radius + 2, planet.position[2]]} center>
                        <div className="bg-black/80 p-2 rounded-lg border border-white/10 w-32">
                            <div className="text-xs text-center text-gray-300 mb-1 font-bold">Atmosphere</div>
                            <div className="flex h-4 w-full rounded overflow-hidden bg-gray-800">
                                {data.atmosphereComposition.map((gas, i) => {
                                    // Hacky visualization: distribute evenly as we don't have % in this array
                                    // In a real app we'd want percentages. fixing width to 100/length
                                    const width = 100 / data.atmosphereComposition.length;
                                    const color = gasColors[gas.split(' ')[0]] || '#888';

                                    return (
                                        <div
                                            key={i}
                                            className="h-full"
                                            style={{ width: `${width}%`, backgroundColor: color }}
                                            title={gas}
                                        />
                                    );
                                })}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1 justify-center">
                                {data.atmosphereComposition.slice(0, 3).map((gas, i) => (
                                    <span key={i} className="text-[9px] text-gray-400 leading-tight">
                                        {gas.split(' ')[0]}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </Html>
                );
            })}
        </group>
    );
};
