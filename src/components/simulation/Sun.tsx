import React, { useRef, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { CelestialBody, useSimulationStore } from '@/stores/simulationStore';

interface SunProps {
    body: CelestialBody;
}

// Custom shader for animated sun surface
const sunVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const sunFragmentShader = `
  uniform float time;
  uniform vec3 baseColor;
  uniform vec3 hotColor;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  // Simplex noise function
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
            
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  void main() {
    // Animated noise for surface turbulence
    float noise1 = snoise(vPosition * 2.0 + time * 0.3);
    float noise2 = snoise(vPosition * 4.0 - time * 0.5);
    float noise3 = snoise(vPosition * 8.0 + time * 0.7);
    
    float combinedNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
    
    // Color mixing based on noise
    vec3 color = mix(baseColor, hotColor, combinedNoise * 0.5 + 0.5);
    
    // Add bright spots (solar flares on surface)
    float flareNoise = snoise(vPosition * 3.0 + time * 0.2);
    if (flareNoise > 0.6) {
      color = mix(color, vec3(1.0, 1.0, 0.9), (flareNoise - 0.6) * 2.0);
    }
    
    // Edge glow effect
    float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    color += vec3(1.0, 0.5, 0.2) * fresnel * 0.3;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Corona/atmosphere shader
const coronaFragmentShader = `
  uniform float time;
  varying vec3 vNormal;
  
  void main() {
    float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    vec3 color = vec3(1.0, 0.6, 0.2) * intensity;
    float alpha = intensity * 0.6;
    gl_FragColor = vec4(color, alpha);
  }
`;

const coronaVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const Sun: React.FC<SunProps> = ({ body }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const coronaRef = useRef<THREE.Mesh>(null);
    const outerCoronaRef = useRef<THREE.Mesh>(null);
    const flareRef = useRef<THREE.Group>(null);

    const { selectedBodyId, setSelectedBody } = useSimulationStore();
    const isSelected = selectedBodyId === body.id;

    // Sun surface shader material
    const sunMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                baseColor: { value: new THREE.Color('#ff6600') },
                hotColor: { value: new THREE.Color('#ffee00') },
            },
            vertexShader: sunVertexShader,
            fragmentShader: sunFragmentShader,
        });
    }, []);

    // Corona material
    const coronaMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
            },
            vertexShader: coronaVertexShader,
            fragmentShader: coronaFragmentShader,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
        });
    }, []);

    // Flare positions (randomized solar prominences)
    const flareData = useMemo(() => {
        const flares = [];
        for (let i = 0; i < 5; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            flares.push({
                position: [
                    Math.sin(phi) * Math.cos(theta),
                    Math.sin(phi) * Math.sin(theta),
                    Math.cos(phi),
                ] as [number, number, number],
                scale: 0.3 + Math.random() * 0.4,
                speed: 0.5 + Math.random() * 0.5,
            });
        }
        return flares;
    }, []);

    // Animation loop
    useFrame((state) => {
        const time = state.clock.elapsedTime;

        // Update sun surface
        if (sunMaterial.uniforms) {
            sunMaterial.uniforms.time.value = time;
        }

        // Update corona
        if (coronaMaterial.uniforms) {
            coronaMaterial.uniforms.time.value = time;
        }

        // Rotate sun slowly
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.001;
        }

        // Pulse corona
        if (coronaRef.current) {
            const pulse = 1 + Math.sin(time * 2) * 0.02;
            coronaRef.current.scale.setScalar(pulse);
        }

        if (outerCoronaRef.current) {
            const pulse = 1 + Math.sin(time * 1.5 + 0.5) * 0.03;
            outerCoronaRef.current.scale.setScalar(pulse);
        }
    });

    const handleClick = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        setSelectedBody(body.id);
    };

    return (
        <group position={body.position}>
            {/* Main sun sphere with animated shader */}
            <mesh ref={meshRef} onClick={handleClick}>
                <sphereGeometry args={[body.radius, 64, 64]} />
                <primitive object={sunMaterial} attach="material" />
            </mesh>

            {/* Inner corona glow */}
            <Sphere ref={coronaRef} args={[body.radius * 1.15, 32, 32]}>
                <primitive object={coronaMaterial} attach="material" />
            </Sphere>

            {/* Outer corona (larger, more diffuse) */}
            <Sphere ref={outerCoronaRef} args={[body.radius * 1.4, 32, 32]}>
                <meshBasicMaterial
                    color="#ff8800"
                    transparent
                    opacity={0.15}
                    side={THREE.BackSide}
                />
            </Sphere>

            {/* Outermost glow */}
            <Sphere args={[body.radius * 2, 32, 32]}>
                <meshBasicMaterial
                    color="#ff6600"
                    transparent
                    opacity={0.05}
                    side={THREE.BackSide}
                />
            </Sphere>

            {/* Solar flare sprites */}
            <group ref={flareRef}>
                {flareData.map((flare, i) => (
                    <sprite
                        key={i}
                        position={[
                            flare.position[0] * body.radius * 1.3,
                            flare.position[1] * body.radius * 1.3,
                            flare.position[2] * body.radius * 1.3,
                        ]}
                        scale={[flare.scale, flare.scale * 2, 1]}
                    >
                        <spriteMaterial
                            color="#ffaa00"
                            transparent
                            opacity={0.4}
                            blending={THREE.AdditiveBlending}
                        />
                    </sprite>
                ))}
            </group>

            {/* Point light for scene illumination */}
            <pointLight
                intensity={3}
                decay={0.3}
                distance={200}
                color="#ffd700"
            />

            {/* Selection ring */}
            {isSelected && (
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[body.radius * 2.2, body.radius * 2.3, 64]} />
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
