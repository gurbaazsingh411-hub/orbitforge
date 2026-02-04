import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Enhanced galaxy background with nebula effects
export const GalaxyBackground: React.FC = () => {
    const nebulaRef = useRef<THREE.Group>(null);

    // Generate nebula cloud particles
    const nebulaParticles = useMemo(() => {
        const count = 2000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // Create a band-like distribution for Milky Way effect
            const theta = Math.random() * Math.PI * 2;
            const radius = 100 + Math.random() * 150;
            const thickness = (Math.random() - 0.5) * 40;

            positions[i * 3] = Math.cos(theta) * radius;
            positions[i * 3 + 1] = thickness * Math.exp(-Math.abs(thickness) * 0.1);
            positions[i * 3 + 2] = Math.sin(theta) * radius;

            // Nebula colors: purple, blue, red tints
            const colorChoice = Math.random();
            if (colorChoice < 0.3) {
                // Purple nebula
                colors[i * 3] = 0.5 + Math.random() * 0.3;
                colors[i * 3 + 1] = 0.2 + Math.random() * 0.2;
                colors[i * 3 + 2] = 0.7 + Math.random() * 0.3;
            } else if (colorChoice < 0.6) {
                // Blue nebula
                colors[i * 3] = 0.2 + Math.random() * 0.2;
                colors[i * 3 + 1] = 0.4 + Math.random() * 0.3;
                colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
            } else if (colorChoice < 0.8) {
                // Red nebula
                colors[i * 3] = 0.7 + Math.random() * 0.3;
                colors[i * 3 + 1] = 0.2 + Math.random() * 0.2;
                colors[i * 3 + 2] = 0.3 + Math.random() * 0.2;
            } else {
                // Cyan nebula
                colors[i * 3] = 0.2 + Math.random() * 0.2;
                colors[i * 3 + 1] = 0.7 + Math.random() * 0.3;
                colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
            }

            sizes[i] = 2 + Math.random() * 4;
        }

        return { positions, colors, sizes };
    }, []);

    // Generate distant star clusters
    const starClusters = useMemo(() => {
        const clusters: Array<{
            position: THREE.Vector3;
            count: number;
            spread: number;
            color: THREE.Color;
        }> = [];

        for (let i = 0; i < 8; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const radius = 180 + Math.random() * 50;

            clusters.push({
                position: new THREE.Vector3(
                    radius * Math.sin(phi) * Math.cos(theta),
                    radius * Math.cos(phi),
                    radius * Math.sin(phi) * Math.sin(theta)
                ),
                count: 50 + Math.floor(Math.random() * 100),
                spread: 5 + Math.random() * 10,
                color: new THREE.Color().setHSL(Math.random(), 0.3, 0.8),
            });
        }

        return clusters;
    }, []);

    // Slow rotation for parallax effect
    useFrame((state, delta) => {
        if (nebulaRef.current) {
            nebulaRef.current.rotation.y += delta * 0.002;
        }
    });

    return (
        <group ref={nebulaRef}>
            {/* Nebula clouds */}
            <points>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={nebulaParticles.positions.length / 3}
                        array={nebulaParticles.positions}
                        itemSize={3}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        count={nebulaParticles.colors.length / 3}
                        array={nebulaParticles.colors}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={3}
                    transparent
                    opacity={0.15}
                    vertexColors
                    sizeAttenuation
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>

            {/* Star clusters */}
            {starClusters.map((cluster, idx) => (
                <StarCluster key={idx} {...cluster} />
            ))}

            {/* Ambient background sphere */}
            <mesh>
                <sphereGeometry args={[300, 32, 32]} />
                <meshBasicMaterial
                    color="#0a0a1a"
                    side={THREE.BackSide}
                />
            </mesh>
        </group>
    );
};

// Individual star cluster component
interface StarClusterProps {
    position: THREE.Vector3;
    count: number;
    spread: number;
    color: THREE.Color;
}

const StarCluster: React.FC<StarClusterProps> = ({
    position,
    count,
    spread,
    color,
}) => {
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * spread;
            pos[i * 3 + 1] = (Math.random() - 0.5) * spread;
            pos[i * 3 + 2] = (Math.random() - 0.5) * spread;
        }
        return pos;
    }, [count, spread]);

    return (
        <points position={position}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.5}
                color={color}
                transparent
                opacity={0.8}
                sizeAttenuation
            />
        </points>
    );
};

// Enhanced star field with twinkling
interface EnhancedStarFieldProps {
    count?: number;
    radius?: number;
}

export const EnhancedStarField: React.FC<EnhancedStarFieldProps> = ({
    count = 5000,
    radius = 200,
}) => {
    const pointsRef = useRef<THREE.Points>(null);
    const materialRef = useRef<THREE.PointsMaterial>(null);

    // Generate star positions with size variation
    const { positions, colors, sizes } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = radius * (0.5 + Math.random() * 0.5);

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            // Star colors with more variation
            const colorChoice = Math.random();
            if (colorChoice > 0.95) {
                // Bright blue stars
                colors[i * 3] = 0.7;
                colors[i * 3 + 1] = 0.85;
                colors[i * 3 + 2] = 1;
                sizes[i] = 0.4 + Math.random() * 0.4;
            } else if (colorChoice > 0.9) {
                // Yellow/orange stars
                colors[i * 3] = 1;
                colors[i * 3 + 1] = 0.85;
                colors[i * 3 + 2] = 0.6;
                sizes[i] = 0.3 + Math.random() * 0.3;
            } else if (colorChoice > 0.85) {
                // Red stars
                colors[i * 3] = 1;
                colors[i * 3 + 1] = 0.6;
                colors[i * 3 + 2] = 0.5;
                sizes[i] = 0.25 + Math.random() * 0.2;
            } else {
                // White stars
                colors[i * 3] = 1;
                colors[i * 3 + 1] = 1;
                colors[i * 3 + 2] = 1;
                sizes[i] = 0.15 + Math.random() * 0.2;
            }
        }

        return { positions, colors, sizes };
    }, [count, radius]);

    // Twinkle animation
    useFrame((state) => {
        if (pointsRef.current) {
            // Slow rotation
            pointsRef.current.rotation.y += 0.0001;
            pointsRef.current.rotation.x += 0.00005;
        }
    });

    return (
        <points ref={pointsRef} frustumCulled={false}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={count}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                ref={materialRef}
                size={0.3}
                transparent
                opacity={0.9}
                vertexColors
                sizeAttenuation
                depthWrite={false}
            />
        </points>
    );
};
