import React, { useRef, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';
import { CelestialBody, useSimulationStore } from '@/stores/simulationStore';

interface CometProps {
    body: CelestialBody;
}

export const Comet: React.FC<CometProps> = ({ body }) => {
    const nucleusRef = useRef<THREE.Mesh>(null);

    const { selectedBodyId, setSelectedBody, bodies } = useSimulationStore();
    const isSelected = selectedBodyId === body.id;

    // Find sun position for tail direction
    const sun = bodies.find(b => b.bodyType === 'star');
    const sunPos = sun ? new THREE.Vector3(...sun.position) : new THREE.Vector3(0, 0, 0);

    // Calculate tail direction (always points away from sun)
    const cometPos = new THREE.Vector3(...body.position);
    const tailDirection = cometPos.clone().sub(sunPos).normalize();

    // Calculate comet velocity direction for dust tail curve
    const velocity = new THREE.Vector3(...body.velocity);
    const speed = velocity.length();

    // Dust tail (curved, follows orbital path slightly)
    const dustTailGeometry = useMemo(() => {
        const points: THREE.Vector3[] = [];
        const segments = 30;
        const tailLength = Math.min(15, 5 + speed * 3);

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            // Create curved tail that bends with velocity
            const curve = Math.pow(t, 0.7);
            const bendAmount = t * 0.3;

            const point = new THREE.Vector3(
                tailDirection.x * tailLength * curve - velocity.x * bendAmount,
                tailDirection.y * tailLength * curve - velocity.y * bendAmount * 0.5,
                tailDirection.z * tailLength * curve - velocity.z * bendAmount
            );
            points.push(point);
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return geometry;
    }, [tailDirection.x, tailDirection.y, tailDirection.z, velocity.x, velocity.y, velocity.z, speed]);

    // Ion tail (straight, points directly away from sun)
    const ionTailGeometry = useMemo(() => {
        const points: THREE.Vector3[] = [];
        const segments = 20;
        const tailLength = Math.min(20, 8 + speed * 4);

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const point = tailDirection.clone().multiplyScalar(tailLength * t);
            points.push(point);
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return geometry;
    }, [tailDirection, speed]);

    // Coma particles (fuzzy atmosphere around nucleus)
    const comaParticles = useMemo(() => {
        const count = 50;
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = body.radius * (1.5 + Math.random() * 1.5);

            // Stretch toward tail direction
            const stretch = 1 + (tailDirection.x > 0 ? 0.3 : -0.3);

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta) * stretch;
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi) * stretch;
        }

        return positions;
    }, [body.radius, tailDirection]);

    // Animation
    useFrame((state, delta) => {
        if (nucleusRef.current) {
            nucleusRef.current.rotation.y += delta * 0.5;
        }
    });

    const handleClick = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        setSelectedBody(body.id);
    };

    return (
        <group position={body.position}>
            {/* Icy nucleus */}
            <Sphere ref={nucleusRef} args={[body.radius, 16, 16]} onClick={handleClick}>
                <meshStandardMaterial
                    color="#e0f2fe"
                    emissive="#bfdbfe"
                    emissiveIntensity={0.3}
                    roughness={0.4}
                />
            </Sphere>

            {/* Coma (fuzzy atmosphere) */}
            <points>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={comaParticles.length / 3}
                        array={comaParticles}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.1}
                    color="#bfdbfe"
                    transparent
                    opacity={0.5}
                    sizeAttenuation
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>

            {/* Dust tail (yellowish, curved) */}
            <Line
                points={dustTailGeometry.attributes.position ?
                    Array.from({ length: dustTailGeometry.attributes.position.count }, (_, i) => [
                        dustTailGeometry.attributes.position.getX(i),
                        dustTailGeometry.attributes.position.getY(i),
                        dustTailGeometry.attributes.position.getZ(i)
                    ] as [number, number, number]) : []}
                color="#fef9c3"
                lineWidth={2}
                transparent
                opacity={0.4}
            />

            {/* Secondary dust particles along tail */}
            <DustTailParticles tailDirection={tailDirection} speed={speed} />

            {/* Ion tail (blue, straight) */}
            <Line
                points={ionTailGeometry.attributes.position ?
                    Array.from({ length: ionTailGeometry.attributes.position.count }, (_, i) => [
                        ionTailGeometry.attributes.position.getX(i),
                        ionTailGeometry.attributes.position.getY(i),
                        ionTailGeometry.attributes.position.getZ(i)
                    ] as [number, number, number]) : []}
                color="#60a5fa"
                lineWidth={1}
                transparent
                opacity={0.6}
            />

            {/* Glow around coma */}
            <Sphere args={[body.radius * 2, 16, 16]}>
                <meshBasicMaterial
                    color="#bfdbfe"
                    transparent
                    opacity={0.1}
                    side={THREE.BackSide}
                />
            </Sphere>

            {/* Selection ring */}
            {isSelected && (
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[body.radius * 2.5, body.radius * 2.7, 32]} />
                    <meshBasicMaterial
                        color="#22d3ee"
                        transparent
                        opacity={0.8}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}
        </group>
    );
};

// Dust particles scattered along the tail
interface DustTailParticlesProps {
    tailDirection: THREE.Vector3;
    speed: number;
}

const DustTailParticles: React.FC<DustTailParticlesProps> = ({ tailDirection, speed }) => {
    const particlesRef = useRef<THREE.Points>(null);

    const positions = useMemo(() => {
        const count = 100;
        const tailLength = Math.min(15, 5 + speed * 3);
        const pos = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const t = Math.random();
            const spread = (1 - Math.pow(t, 2)) * 2;

            pos[i * 3] = tailDirection.x * tailLength * t + (Math.random() - 0.5) * spread;
            pos[i * 3 + 1] = tailDirection.y * tailLength * t + (Math.random() - 0.5) * spread * 0.5;
            pos[i * 3 + 2] = tailDirection.z * tailLength * t + (Math.random() - 0.5) * spread;
        }

        return pos;
    }, [tailDirection, speed]);

    useFrame((state, delta) => {
        if (particlesRef.current) {
            // Slight shimmer effect
            particlesRef.current.rotation.y += delta * 0.05;
        }
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.08}
                color="#fef3c7"
                transparent
                opacity={0.4}
                sizeAttenuation
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
};
