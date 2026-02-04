import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ExplosionEffectProps {
  position: [number, number, number];
  color: string;
  size: number;
  onComplete: () => void;
}

export const ExplosionEffect: React.FC<ExplosionEffectProps> = ({
  position,
  color,
  size,
  onComplete,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const [elapsed, setElapsed] = useState(0);
  const duration = 1.5; // seconds

  const { positions, velocities, colors } = useMemo(() => {
    const particleCount = 80;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const baseColor = new THREE.Color(color);
    const brightColor = new THREE.Color('#ffffff');

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Start at explosion center
      positions[i3] = position[0];
      positions[i3 + 1] = position[1];
      positions[i3 + 2] = position[2];

      // Random outward velocity
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = (1 + Math.random() * 2) * size;

      velocities[i3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      velocities[i3 + 2] = Math.cos(phi) * speed;

      // Color gradient from white core to planet color
      const colorMix = Math.random();
      const particleColor = brightColor.clone().lerp(baseColor, colorMix);
      colors[i3] = particleColor.r;
      colors[i3 + 1] = particleColor.g;
      colors[i3 + 2] = particleColor.b;
    }

    return { positions, velocities, colors };
  }, [position, color, size]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const newElapsed = elapsed + delta;
    setElapsed(newElapsed);

    if (newElapsed >= duration) {
      onComplete();
      return;
    }

    const geometry = pointsRef.current.geometry;
    const positionAttr = geometry.getAttribute('position');
    const posArray = positionAttr.array as Float32Array;

    const progress = newElapsed / duration;
    const decay = 1 - progress;

    for (let i = 0; i < posArray.length / 3; i++) {
      const i3 = i * 3;
      posArray[i3] += velocities[i3] * delta * decay;
      posArray[i3 + 1] += velocities[i3 + 1] * delta * decay;
      posArray[i3 + 2] += velocities[i3 + 2] * delta * decay;
    }

    positionAttr.needsUpdate = true;

    // Fade out
    const material = pointsRef.current.material as THREE.PointsMaterial;
    material.opacity = decay;
    material.size = size * 0.3 * (1 + progress * 0.5);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size * 0.3}
        vertexColors
        transparent
        opacity={1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// Ring shockwave effect
export const ShockwaveRing: React.FC<ExplosionEffectProps> = ({
  position,
  color,
  size,
  onComplete,
}) => {
  const ringRef = useRef<THREE.Mesh>(null);
  const [elapsed, setElapsed] = useState(0);
  const duration = 0.8;

  useFrame((state, delta) => {
    if (!ringRef.current) return;

    const newElapsed = elapsed + delta;
    setElapsed(newElapsed);

    if (newElapsed >= duration) {
      onComplete();
      return;
    }

    const progress = newElapsed / duration;
    const scale = 1 + progress * 4;
    ringRef.current.scale.set(scale, scale, scale);

    const material = ringRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = (1 - progress) * 0.6;
  });

  return (
    <mesh ref={ringRef} position={position} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[size * 0.8, size * 1.2, 64]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.6}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};
