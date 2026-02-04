import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html, Line } from '@react-three/drei';
import { useSimulationStore } from '@/stores/simulationStore';

// Speed of light: 299,792.458 km/s
const SPEED_OF_LIGHT_KM_S = 299792.458;
// 1 AU in km
const AU_IN_KM = 149597870.7;
// Simulation scale: 1 AU = 16 units
const AU_TO_SIM = 16;

interface LightSpeedAnimationProps {
    enabled?: boolean;
}

export const LightSpeedAnimation: React.FC<LightSpeedAnimationProps> = ({ enabled = true }) => {
    const { showLightSpeed, bodies } = useSimulationStore();
    const photonRef = useRef<THREE.Mesh>(null);
    const progressRef = useRef(0);
    const targetPlanetIdx = useRef(0);

    // Get sun and planets
    const sun = bodies.find(b => b.bodyType === 'star');
    const planets = bodies.filter(b => b.bodyType === 'planet').sort((a, b) => {
        const distA = Math.sqrt(a.position[0] ** 2 + a.position[2] ** 2);
        const distB = Math.sqrt(b.position[0] ** 2 + b.position[2] ** 2);
        return distA - distB;
    });

    // Animation: move photon from sun to each planet
    useFrame((state, delta) => {
        if (!showLightSpeed || !photonRef.current || !sun || planets.length === 0) return;

        const targetPlanet = planets[targetPlanetIdx.current];
        if (!targetPlanet) return;

        const sunPos = new THREE.Vector3(...sun.position);
        const planetPos = new THREE.Vector3(...targetPlanet.position);
        const direction = planetPos.clone().sub(sunPos);
        const totalDist = direction.length();

        // Speed in simulation units per second (scaled for visibility)
        // Real light: 1 AU in 499 seconds. We'll speed it up 100x for visibility
        const simSpeedPerSec = (SPEED_OF_LIGHT_KM_S / AU_IN_KM) * AU_TO_SIM * 100;

        progressRef.current += delta * simSpeedPerSec;

        if (progressRef.current >= totalDist) {
            progressRef.current = 0;
            targetPlanetIdx.current = (targetPlanetIdx.current + 1) % planets.length;
        }

        const t = progressRef.current / totalDist;
        const photonPos = sunPos.clone().lerp(planetPos, t);
        photonRef.current.position.copy(photonPos);
    });

    if (!showLightSpeed || !sun) return null;

    return (
        <group>
            {/* Photon particle */}
            <mesh ref={photonRef}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshBasicMaterial color="#ffff00" />
            </mesh>

            {/* Photon glow */}
            <mesh ref={photonRef}>
                <sphereGeometry args={[0.6, 16, 16]} />
                <meshBasicMaterial color="#ffff00" transparent opacity={0.3} />
            </mesh>
        </group>
    );
};

// Distance labels for each planet
export const DistanceLabels: React.FC = () => {
    const { showDistanceLabels, bodies } = useSimulationStore();

    const sun = bodies.find(b => b.bodyType === 'star');
    const celestialBodies = bodies.filter(b => b.bodyType === 'planet' || b.bodyType === 'moon');

    if (!showDistanceLabels || !sun) return null;

    return (
        <group>
            {celestialBodies.map(body => {
                const sunPos = new THREE.Vector3(...sun.position);
                const bodyPos = new THREE.Vector3(...body.position);
                const distSim = bodyPos.distanceTo(sunPos);
                const distAU = distSim / AU_TO_SIM;
                const distKm = distAU * AU_IN_KM;
                const lightTimeSeconds = (distAU * AU_IN_KM) / SPEED_OF_LIGHT_KM_S;

                // Format light time
                let lightTimeStr = '';
                if (lightTimeSeconds < 60) {
                    lightTimeStr = `${lightTimeSeconds.toFixed(1)}s`;
                } else if (lightTimeSeconds < 3600) {
                    lightTimeStr = `${(lightTimeSeconds / 60).toFixed(1)}m`;
                } else {
                    lightTimeStr = `${(lightTimeSeconds / 3600).toFixed(1)}h`;
                }

                return (
                    <Html
                        key={body.id}
                        position={[body.position[0], body.position[1] + body.radius + 1.5, body.position[2]]}
                        center
                        distanceFactor={15}
                    >
                        <div className="bg-black/70 px-2 py-1 rounded text-xs text-white whitespace-nowrap pointer-events-none">
                            <div className="font-semibold">{body.name}</div>
                            <div className="text-gray-300">{distAU.toFixed(2)} AU</div>
                            <div className="text-yellow-300">☀→ {lightTimeStr}</div>
                        </div>
                    </Html>
                );
            })}
        </group>
    );
};

// Inverse square law visualization - light intensity rings
export const InverseSquareLaw: React.FC = () => {
    const { showInverseSquare, bodies } = useSimulationStore();
    const sun = bodies.find(b => b.bodyType === 'star');

    if (!showInverseSquare || !sun) return null;

    // Create rings at different distances showing intensity
    const rings = [
        { au: 0.5, intensity: 4.0 },   // Very bright
        { au: 1.0, intensity: 1.0 },   // Earth = 1.0
        { au: 1.5, intensity: 0.44 },  // Mars
        { au: 2.0, intensity: 0.25 },
        { au: 3.0, intensity: 0.11 },
        { au: 5.0, intensity: 0.04 },  // Jupiter
    ];

    return (
        <group position={sun.position} rotation={[-Math.PI / 2, 0, 0]}>
            {rings.map((ring, idx) => {
                const radius = ring.au * AU_TO_SIM;
                const opacity = Math.min(ring.intensity * 0.3, 0.8);
                const color = new THREE.Color().setHSL(0.15, 1, 0.3 + ring.intensity * 0.2);

                return (
                    <group key={idx}>
                        <mesh>
                            <ringGeometry args={[radius - 0.15, radius + 0.15, 64]} />
                            <meshBasicMaterial
                                color={color}
                                transparent
                                opacity={opacity}
                                side={THREE.DoubleSide}
                            />
                        </mesh>
                        {/* Label */}
                        <Html position={[radius, 0, 0]} center>
                            <div className="bg-black/60 px-1 text-xs text-yellow-200 whitespace-nowrap">
                                {ring.au} AU: {(ring.intensity * 100).toFixed(0)}%
                            </div>
                        </Html>
                    </group>
                );
            })}
        </group>
    );
};
