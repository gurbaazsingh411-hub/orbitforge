import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlanetRingsProps {
    innerRadius: number;
    outerRadius: number;
    color: string;
    tilt?: number;
    opacity?: number;
}

// Ring texture shader for banded appearance
const ringVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ringFragmentShader = `
  uniform vec3 ringColor;
  uniform float opacity;
  varying vec2 vUv;
  
  // Simple noise for ring bands
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }
  
  void main() {
    // Create ring bands based on radial distance
    float dist = length(vUv - 0.5) * 2.0;
    
    // Multiple ring bands
    float bands = 0.0;
    bands += sin(dist * 50.0) * 0.3;
    bands += sin(dist * 120.0) * 0.2;
    bands += sin(dist * 200.0) * 0.1;
    
    // Add some noise for particle-like appearance
    float noise = random(vUv * 100.0) * 0.3;
    
    float alpha = (0.6 + bands + noise) * opacity;
    
    // Fade at edges
    float edgeFade = smoothstep(0.0, 0.1, dist) * smoothstep(1.0, 0.8, dist);
    alpha *= edgeFade;
    
    gl_FragColor = vec4(ringColor, alpha);
  }
`;

export const PlanetRings: React.FC<PlanetRingsProps> = ({
    innerRadius,
    outerRadius,
    color,
    tilt = 0,
    opacity = 0.7,
}) => {
    const ringRef = useRef<THREE.Mesh>(null);

    // Create ring material with banding effect
    const ringMaterial = useMemo(() => {
        const colorObj = new THREE.Color(color);
        return new THREE.ShaderMaterial({
            uniforms: {
                ringColor: { value: colorObj },
                opacity: { value: opacity },
            },
            vertexShader: ringVertexShader,
            fragmentShader: ringFragmentShader,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
        });
    }, [color, opacity]);

    // Slow rotation animation
    useFrame((state, delta) => {
        if (ringRef.current) {
            ringRef.current.rotation.z += delta * 0.02;
        }
    });

    return (
        <mesh
            ref={ringRef}
            rotation={[Math.PI / 2 + tilt, 0, 0]}
        >
            <ringGeometry args={[innerRadius, outerRadius, 128]} />
            <primitive object={ringMaterial} attach="material" />
        </mesh>
    );
};

// Simple ring component for less demanding rendering
export const SimpleRings: React.FC<PlanetRingsProps> = ({
    innerRadius,
    outerRadius,
    color,
    tilt = 0,
    opacity = 0.6,
}) => {
    return (
        <group>
            {/* Main ring */}
            <mesh rotation={[Math.PI / 2 + tilt, 0, 0]}>
                <ringGeometry args={[innerRadius, outerRadius * 0.7, 64]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={opacity}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Outer ring (more transparent) */}
            <mesh rotation={[Math.PI / 2 + tilt, 0, 0]}>
                <ringGeometry args={[outerRadius * 0.7, outerRadius, 64]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={opacity * 0.5}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Gap ring */}
            <mesh rotation={[Math.PI / 2 + tilt, 0, 0]}>
                <ringGeometry args={[innerRadius * 1.3, innerRadius * 1.4, 64]} />
                <meshBasicMaterial
                    color="#000000"
                    transparent
                    opacity={0.3}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
};
