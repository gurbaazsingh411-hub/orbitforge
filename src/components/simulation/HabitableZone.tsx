import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '@/stores/simulationStore';
import { habitableZone } from '@/data/planetData';

// Scale factor to match simulation (Earth is at ~16 units in simulation)
const AU_TO_SIMULATION = 16; // 1 AU = 16 simulation units

interface HabitableZoneProps {
    opacity?: number;
}

export const HabitableZone: React.FC<HabitableZoneProps> = ({
    opacity = 0.15,
}) => {
    const { showHabitableZone } = useSimulationStore();
    const groupRef = useRef<THREE.Group>(null);

    // Convert AU boundaries to simulation scale
    const innerRadius = habitableZone.innerBoundaryAU * AU_TO_SIMULATION;
    const outerRadius = habitableZone.outerBoundaryAU * AU_TO_SIMULATION;
    const optimalRadius = habitableZone.optimalAU * AU_TO_SIMULATION;

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Slow rotation for visual effect
            groupRef.current.rotation.z += delta * 0.05;

            // Gentle pulsing effect
            const pulse = Math.sin(state.clock.elapsedTime * 0.5) * 0.05 + 1;
            groupRef.current.scale.set(pulse, pulse, 1);

            // Follow the Sun
            const bodies = useSimulationStore.getState().bodies;
            const sun = bodies.find(b => b.bodyType === 'star');
            if (sun) {
                groupRef.current.position.set(sun.position[0], sun.position[1], sun.position[2]);
            }
        }
    });

    if (!showHabitableZone) return null;

    return (
        <group ref={groupRef} rotation={[-Math.PI / 2, 0, 0]}>
            {/* Main habitable zone ring (green) */}
            <mesh>
                <ringGeometry args={[innerRadius, outerRadius, 128]} />
                <meshBasicMaterial
                    color="#22c55e"
                    transparent
                    opacity={opacity}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Inner boundary (orange - too hot) */}
            <mesh>
                <ringGeometry args={[innerRadius - 0.3, innerRadius, 128]} />
                <meshBasicMaterial
                    color="#f97316"
                    transparent
                    opacity={opacity * 1.5}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Outer boundary (blue - too cold) */}
            <mesh>
                <ringGeometry args={[outerRadius, outerRadius + 0.3, 128]} />
                <meshBasicMaterial
                    color="#3b82f6"
                    transparent
                    opacity={opacity * 1.5}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Optimal zone marker (Earth's orbit) */}
            <mesh>
                <ringGeometry args={[optimalRadius - 0.1, optimalRadius + 0.1, 128]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.4}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Labels - these will be HTML overlays, for now just markers */}
            {/* Inner boundary marker */}
            <mesh position={[innerRadius, 0, 0]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshBasicMaterial color="#f97316" />
            </mesh>

            {/* Outer boundary marker */}
            <mesh position={[outerRadius, 0, 0]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshBasicMaterial color="#3b82f6" />
            </mesh>
        </group>
    );
};
