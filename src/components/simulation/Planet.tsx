import React, { useRef, useMemo, useState, useCallback } from 'react';
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { Sphere, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { CelestialBody, useSimulationStore, getTemperatureColor } from '@/stores/simulationStore';
import { useProceduralMaterial } from './PlanetTexture';
import { SimpleRings } from './PlanetRings';

interface PlanetProps {
  body: CelestialBody;
}

export const Planet: React.FC<PlanetProps> = ({ body }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const { selectedBodyId, setSelectedBody, updateBody, isPaused, setBodyDragging, useRealScale } = useSimulationStore();
  const { camera, raycaster } = useThree();

  const [isDragging, setIsDragging] = useState(false);
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));

  const isSelected = selectedBodyId === body.id;
  const isSun = body.bodyType === 'star';
  const isAsteroid = body.bodyType === 'asteroid';
  const isComet = body.bodyType === 'comet';
  const isMoon = body.bodyType === 'moon';

  // Get procedural material for the planet
  const proceduralMaterial = useProceduralMaterial(
    body.textureType,
    body.color,
    body.waterLevel,
    body.temperature
  );

  // Calculate color based on temperature, water level, and life
  const planetColor = useMemo(() => {
    if (isSun) return '#fbbf24';

    let baseColor = new THREE.Color(getTemperatureColor(body.temperature));

    // Water influence
    if (body.waterLevel > 0.3) {
      const waterInfluence = body.waterLevel * 0.5;
      baseColor.lerp(new THREE.Color('#3b82f6'), waterInfluence);
    }

    // Life/vegetation influence - adds green tint
    if (body.vegetationCover > 0.1 && body.lifeLevel > 0.2) {
      const lifeInfluence = body.vegetationCover * 0.6;
      baseColor.lerp(new THREE.Color('#22c55e'), lifeInfluence);
    }

    return '#' + baseColor.getHexString();
  }, [body.temperature, body.waterLevel, body.vegetationCover, body.lifeLevel, isSun]);

  // Life indicator ring color
  const lifeRingColor = useMemo(() => {
    if (body.lifeLevel < 0.1) return null;
    if (body.lifeLevel < 0.3) return '#84cc16'; // Lime - basic life
    if (body.lifeLevel < 0.6) return '#22c55e'; // Green - moderate life
    if (body.lifeLevel < 0.8) return '#10b981'; // Emerald - thriving
    return '#06b6d4'; // Cyan - advanced life
  }, [body.lifeLevel]);

  // Glow intensity based on temperature
  const glowIntensity = useMemo(() => {
    if (isSun) return 2;
    if (body.temperature > 0.7) return 0.8;
    if (body.temperature > 0.5) return 0.3;
    return 0.1;
  }, [body.temperature, isSun]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (isDragging) return;
    e.stopPropagation();
    setSelectedBody(body.id);
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!isPaused) return;
    e.stopPropagation();
    setIsDragging(true);
    setBodyDragging(body.id, true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    setIsDragging(false);
    setBodyDragging(body.id, false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!isDragging || !isPaused) return;

    // Create a ray from mouse position
    const rect = (e.nativeEvent.target as HTMLCanvasElement).getBoundingClientRect();
    const x = ((e.nativeEvent.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.nativeEvent.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(dragPlane.current, intersection);

    if (intersection) {
      updateBody(body.id, {
        position: [intersection.x, body.position[1], intersection.z],
        velocity: [0, 0, 0], // Reset velocity when dragging
      });
    }
  }, [isDragging, isPaused, body.id, body.position, camera, raycaster, updateBody]);

  // Gentle rotation animation
  useFrame((state, delta) => {
    if (meshRef.current && !body.isBeingDragged) {
      meshRef.current.rotation.y += delta * (isAsteroid ? 0.5 : 0.2);
    }
  });

  // Skip rendering for Sun, Comets (they have their own components)
  if (isSun || isComet) return null;

  return (
    <group position={body.position}>
      {/* Main planet sphere with procedural texture */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerUp}
        scale={useRealScale ? 0.05 : 1}
      >
        <sphereGeometry args={[body.radius, isAsteroid ? 12 : 32, isAsteroid ? 12 : 32]} />
        <primitive object={proceduralMaterial} attach="material" />
      </mesh>

      {/* Outer glow effect for hot planets */}
      {body.temperature > 0.5 && !isAsteroid && (
        <Sphere
          ref={glowRef}
          args={[body.radius * 1.2, 32, 32]}
          scale={useRealScale ? 0.05 : 1}
        >
          <meshBasicMaterial
            color={planetColor}
            transparent
            opacity={glowIntensity * 0.15}
            side={THREE.BackSide}
          />
        </Sphere>
      )}

      {/* Planet rings for gas giants */}
      {body.hasRings && body.ringColor && (
        <SimpleRings
          innerRadius={body.radius * 1.5}
          outerRadius={body.radius * 2.5}
          color={body.ringColor}
          tilt={body.ringTilt || 0}
          opacity={0.6}
        />
      )}

      {/* Atmosphere for Earth-like planets */}
      {body.textureType === 'ocean' && (
        <Sphere args={[body.radius * 1.05, 32, 32]}>
          <meshBasicMaterial
            color="#60a5fa"
            transparent
            opacity={0.1}
            side={THREE.BackSide}
          />
        </Sphere>
      )}

      {/* Life indicator ring */}
      {lifeRingColor && !isAsteroid && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[body.radius * 1.3, body.radius * 1.35, 64]} />
          <meshBasicMaterial
            color={lifeRingColor}
            transparent
            opacity={0.4 + body.lifeLevel * 0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Selection ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[body.radius * 1.5, body.radius * 1.6, 64]} />
          <meshBasicMaterial
            color="#22d3ee"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Drag indicator when paused and selected */}
      {isPaused && isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[body.radius * 1.7, body.radius * 1.75, 64]} />
          <meshBasicMaterial
            color={isDragging ? '#f97316' : '#fbbf24'}
            transparent
            opacity={isDragging ? 1 : 0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Planet name label */}
      {isSelected && !isAsteroid && (
        <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
          <Text
            position={[0, body.radius + 1, 0]}
            fontSize={0.8}
            color="#22d3ee"
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.05}
            outlineColor="#000000"
          >
            {body.name}
          </Text>
        </Billboard>
      )}
    </group>
  );
};

// Orbital trail component
interface OrbitTrailProps {
  positions: [number, number, number][];
  color: string;
}

export const OrbitTrail: React.FC<OrbitTrailProps> = ({ positions, color }) => {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    if (positions.length > 1) {
      const points = positions.map(p => new THREE.Vector3(p[0], p[1], p[2]));
      geo.setFromPoints(points);
    }
    return geo;
  }, [positions]);

  const material = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.3,
    });
  }, [color]);

  if (positions.length < 2) return null;

  return <primitive object={new THREE.Line(geometry, material)} />;
};
