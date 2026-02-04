import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface StarFieldProps {
  count?: number;
  radius?: number;
}

export const StarField: React.FC<StarFieldProps> = ({ 
  count = 5000, 
  radius = 200 
}) => {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate random star positions in a sphere
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Random point in sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * (0.5 + Math.random() * 0.5);
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      
      // Random star colors (white to light blue)
      const colorChoice = Math.random();
      if (colorChoice > 0.9) {
        // Blue stars
        colors[i * 3] = 0.7;
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 1;
      } else if (colorChoice > 0.8) {
        // Yellow stars
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.9;
        colors[i * 3 + 2] = 0.7;
      } else {
        // White stars
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 1;
      }
    }
    
    return [positions, colors];
  }, [count, radius]);

  // Slow rotation for subtle movement
  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.005;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.3}
        sizeAttenuation={true}
        depthWrite={false}
        vertexColors
      />
    </Points>
  );
};

// Nebula background effect
export const Nebula: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -100]} scale={[200, 200, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        color="#1e1b4b"
        transparent
        opacity={0.3}
      />
    </mesh>
  );
};
