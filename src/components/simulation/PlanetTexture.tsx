import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TextureType } from '@/stores/simulationStore';

interface ProceduralTextureProps {
    textureType: TextureType;
    radius: number;
    color: string;
    waterLevel?: number;
    temperature?: number;
}

// Vertex shader for all planet types
const planetVertexShader = `
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

// Rocky planet shader (Mercury, Mars-like)
const rockyFragmentShader = `
  uniform float time;
  uniform vec3 baseColor;
  uniform float temperature;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  // Noise functions
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
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
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
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  void main() {
    // Create terrain with craters
    float noise1 = snoise(vPosition * 3.0);
    float noise2 = snoise(vPosition * 8.0);
    float noise3 = snoise(vPosition * 15.0);
    
    float terrain = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
    
    // Crater-like depressions
    float craters = smoothstep(0.3, 0.5, noise2);
    
    vec3 color = baseColor;
    color = mix(color, color * 0.7, terrain * 0.5 + 0.5);
    color = mix(color, color * 0.5, craters * 0.3);
    
    // Simple lighting
    float light = dot(vNormal, normalize(vec3(1.0, 0.5, 0.5))) * 0.5 + 0.5;
    color *= light;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Gas giant shader (Jupiter, Saturn-like)
const gasFragmentShader = `
  uniform float time;
  uniform vec3 baseColor;
  uniform vec3 bandColor;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }
  
  void main() {
    // Latitude-based bands
    float lat = vPosition.y;
    
    // Create banding pattern
    float bands = sin(lat * 20.0) * 0.5;
    bands += sin(lat * 35.0 + time * 0.1) * 0.3;
    bands += sin(lat * 60.0 - time * 0.05) * 0.2;
    
    // Add some turbulence
    float turbulence = sin(vPosition.x * 10.0 + lat * 5.0 + time * 0.2) * 0.1;
    bands += turbulence;
    
    // Mix colors based on bands
    vec3 color = mix(baseColor, bandColor, bands * 0.5 + 0.5);
    
    // Add the Great Red Spot style feature for large gas giants
    float spotX = 0.3;
    float spotY = 0.2;
    float dist = length(vec2(vPosition.x - spotX, vPosition.y - spotY));
    if (dist < 0.3) {
      float spotIntensity = 1.0 - smoothstep(0.0, 0.3, dist);
      color = mix(color, vec3(0.8, 0.4, 0.2), spotIntensity * 0.6);
    }
    
    // Simple lighting
    float light = dot(vNormal, normalize(vec3(1.0, 0.3, 0.5))) * 0.4 + 0.6;
    color *= light;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Ice planet shader (Uranus, Neptune-like)
const iceFragmentShader = `
  uniform float time;
  uniform vec3 baseColor;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    // Subtle banding
    float lat = vPosition.y;
    float bands = sin(lat * 15.0 + time * 0.05) * 0.1;
    
    vec3 color = baseColor;
    color = mix(color, color * 1.2, bands);
    
    // Add slight variation
    float variation = sin(vPosition.x * 8.0 + vPosition.z * 8.0) * 0.05;
    color += variation;
    
    // Lighting
    float light = dot(vNormal, normalize(vec3(1.0, 0.3, 0.5))) * 0.3 + 0.7;
    color *= light;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Ocean planet shader (Earth-like)
const oceanFragmentShader = `
  uniform float time;
  uniform vec3 oceanColor;
  uniform vec3 landColor;
  uniform float waterLevel;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  // Simplified noise
  float hash(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
  }
  
  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  
  void main() {
    // Generate continents
    float n = noise(vPosition * 3.0) * 0.5 + noise(vPosition * 6.0) * 0.3 + noise(vPosition * 12.0) * 0.2;
    
    // Determine land vs ocean
    float landMask = smoothstep(waterLevel - 0.1, waterLevel + 0.1, n);
    
    vec3 color = mix(oceanColor, landColor, landMask);
    
    // Add ice caps at poles
    float polar = abs(vPosition.y);
    if (polar > 0.7) {
      float iceMask = smoothstep(0.7, 0.9, polar);
      color = mix(color, vec3(0.95, 0.98, 1.0), iceMask);
    }
    
    // Clouds
    float clouds = noise(vPosition * 4.0 + time * 0.02);
    if (clouds > 0.5) {
      color = mix(color, vec3(1.0), (clouds - 0.5) * 0.5);
    }
    
    // Lighting
    float light = dot(vNormal, normalize(vec3(1.0, 0.3, 0.5))) * 0.4 + 0.6;
    color *= light;
    
    // Atmosphere edge glow
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
    color = mix(color, vec3(0.5, 0.7, 1.0), fresnel * 0.3);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Get shader based on texture type
export const getProceduralMaterial = (
    textureType: TextureType,
    color: string,
    waterLevel: number = 0,
    temperature: number = 0.5
): THREE.ShaderMaterial => {
    const baseColor = new THREE.Color(color);

    switch (textureType) {
        case 'gas':
            return new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    baseColor: { value: baseColor },
                    bandColor: { value: new THREE.Color(color).multiplyScalar(0.7) },
                },
                vertexShader: planetVertexShader,
                fragmentShader: gasFragmentShader,
            });

        case 'ice':
            return new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    baseColor: { value: baseColor },
                },
                vertexShader: planetVertexShader,
                fragmentShader: iceFragmentShader,
            });

        case 'ocean':
            return new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    oceanColor: { value: new THREE.Color('#1e40af') },
                    landColor: { value: new THREE.Color('#22c55e') },
                    waterLevel: { value: waterLevel },
                },
                vertexShader: planetVertexShader,
                fragmentShader: oceanFragmentShader,
            });

        case 'volcanic':
            return new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    baseColor: { value: new THREE.Color('#7c2d12') },
                    temperature: { value: temperature },
                },
                vertexShader: planetVertexShader,
                fragmentShader: rockyFragmentShader,
            });

        case 'barren':
        case 'rocky':
        default:
            return new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    baseColor: { value: baseColor },
                    temperature: { value: temperature },
                },
                vertexShader: planetVertexShader,
                fragmentShader: rockyFragmentShader,
            });
    }
};

// Hook to use and animate procedural material
export const useProceduralMaterial = (
    textureType: TextureType,
    color: string,
    waterLevel: number = 0,
    temperature: number = 0.5
) => {
    const material = useMemo(
        () => getProceduralMaterial(textureType, color, waterLevel, temperature),
        [textureType, color, waterLevel, temperature]
    );

    useFrame((state) => {
        if (material.uniforms?.time) {
            material.uniforms.time.value = state.clock.elapsedTime;
        }
    });

    return material;
};
