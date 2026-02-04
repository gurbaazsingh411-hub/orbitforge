import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { useSimulationStore } from '@/stores/simulationStore';

// Gravitational constant (same as in store)
const G = 0.5;

interface GravityFieldProps {
    gridSize?: number;
    resolution?: number;
}

export const GravityField: React.FC<GravityFieldProps> = ({
    gridSize = 100,
    resolution = 15,
}) => {
    const { bodies, showGravityField } = useSimulationStore();

    // Generate gravity field vectors on a grid
    // Note: This hook must be called before any conditional returns
    const fieldVectors = useMemo(() => {
        if (!showGravityField) return [];

        const vectors: Array<{
            position: THREE.Vector3;
            direction: THREE.Vector3;
            strength: number;
        }> = [];

        const step = gridSize / resolution;
        const half = gridSize / 2;

        for (let x = -half; x <= half; x += step) {
            for (let z = -half; z <= half; z += step) {
                const pos = new THREE.Vector3(x, 0, z);
                const force = new THREE.Vector3(0, 0, 0);

                // Calculate gravitational force from all bodies
                for (const body of bodies) {
                    const bodyPos = new THREE.Vector3(...body.position);
                    const diff = bodyPos.clone().sub(pos);
                    const distSq = diff.lengthSq();
                    const dist = Math.sqrt(distSq);

                    // Skip if too close to the body
                    if (dist < body.radius * 2) continue;

                    // F = G * M / r^2
                    const forceMag = G * body.mass / (distSq + 1);
                    force.add(diff.normalize().multiplyScalar(forceMag));
                }

                const strength = force.length();

                // Only show vectors with significant force
                if (strength > 0.01) {
                    vectors.push({
                        position: pos,
                        direction: force.normalize(),
                        strength: Math.min(strength, 5),
                    });
                }
            }
        }

        return vectors;
    }, [bodies, gridSize, resolution, showGravityField]);

    // Early return AFTER hooks
    if (!showGravityField) return null;

    return (
        <group>
            {fieldVectors.map((vector, idx) => (
                <GravityArrow
                    key={idx}
                    position={vector.position}
                    direction={vector.direction}
                    strength={vector.strength}
                />
            ))}

            {/* Gravity well rings around massive bodies */}
            {bodies
                .filter(b => b.mass > 10)
                .map(body => (
                    <GravityWell key={body.id} body={body} />
                ))}
        </group>
    );
};

// Individual gravity arrow
interface GravityArrowProps {
    position: THREE.Vector3;
    direction: THREE.Vector3;
    strength: number;
}

const GravityArrow: React.FC<GravityArrowProps> = ({
    position,
    direction,
    strength,
}) => {
    // Create arrow geometry
    const arrowLength = 0.5 + strength * 0.5;
    const endPoint = position.clone().add(direction.clone().multiplyScalar(arrowLength));

    // Color based on strength (blue to red)
    const hue = Math.max(0, 0.6 - strength * 0.15);
    const color = new THREE.Color().setHSL(hue, 0.8, 0.5);

    const points = useMemo(() => {
        return [position, endPoint];
    }, [position, endPoint]);

    const geometry = useMemo(() => {
        return new THREE.BufferGeometry().setFromPoints(points);
    }, [points]);

    return (
        <group>
            {/* Line */}
            <Line
                points={[position.toArray() as [number, number, number], endPoint.toArray() as [number, number, number]]}
                color={color}
                lineWidth={1}
                transparent
                opacity={0.4}
            />

            {/* Arrow head (small sphere) */}
            <mesh position={endPoint}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.6}
                />
            </mesh>
        </group>
    );
};

// Gravity well visualization around massive bodies
interface GravityWellProps {
    body: {
        position: [number, number, number];
        mass: number;
        radius: number;
    };
}

const GravityWell: React.FC<GravityWellProps> = ({ body }) => {
    const rings = useMemo(() => {
        const count = Math.min(5, Math.floor(body.mass / 20) + 2);
        return Array.from({ length: count }, (_, i) => ({
            radius: body.radius * (2 + i * 1.5),
            opacity: 0.3 - i * 0.05,
        }));
    }, [body.mass, body.radius]);

    return (
        <group position={body.position}>
            {rings.map((ring, idx) => (
                <mesh key={idx} rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[ring.radius - 0.1, ring.radius, 64]} />
                    <meshBasicMaterial
                        color="#a855f7"
                        transparent
                        opacity={ring.opacity}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}
        </group>
    );
};
