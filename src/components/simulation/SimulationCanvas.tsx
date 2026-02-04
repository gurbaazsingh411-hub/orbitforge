import React, { Suspense, useCallback } from 'react';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Planet, OrbitTrail } from './Planet';
import { Sun } from './Sun';
import { Comet } from './Comet';
import { GalaxyBackground, EnhancedStarField } from './GalaxyBackground';
import { GravityField } from './GravityField';
import { HabitableZone } from './HabitableZone';
import { LightSpeedAnimation, DistanceLabels, InverseSquareLaw } from './PhysicsVisuals';
import { DayNightTerminator, EclipseSimulator, PlanetaryAlignment, Barycenter, LagrangePoints } from './CelestialEvents';
import { ExplosionEffect, ShockwaveRing } from './ExplosionEffect';
import { useSimulationStore, getTemperatureColor } from '@/stores/simulationStore';

// Physics update component
const PhysicsUpdater: React.FC = () => {
  const updatePhysics = useSimulationStore((state) => state.updatePhysics);

  useFrame((state, delta) => {
    updatePhysics(delta);
  });

  return null;
};

// Click handler for spawning planets
const SpawnHandler: React.FC = () => {
  const { isSpawnMode, addBody, setSpawnMode } = useSimulationStore();
  const { camera, raycaster, pointer } = useThree();

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    if (!isSpawnMode) return;

    // Calculate world position from click
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const raycasterLocal = new THREE.Raycaster();
    raycasterLocal.setFromCamera(pointer, camera);

    const intersection = new THREE.Vector3();
    raycasterLocal.ray.intersectPlane(plane, intersection);

    if (intersection) {
      // Add a new planet at the clicked position
      const distance = intersection.length();
      const direction = intersection.clone().normalize();

      // Calculate orbital velocity for circular orbit around origin
      // v = sqrt(G * M / r) - simplified
      const centralMass = 1000; // Assuming sun mass
      const orbitalSpeed = Math.sqrt(0.5 * centralMass / Math.max(distance, 1));

      // Perpendicular velocity for orbit
      const velocityDir = new THREE.Vector3(-direction.z, 0, direction.x);
      const velocity: [number, number, number] = [
        velocityDir.x * orbitalSpeed,
        0,
        velocityDir.z * orbitalSpeed,
      ];

      addBody({
        name: `Planet ${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        position: [intersection.x, 0, intersection.z],
        velocity,
        mass: 2 + Math.random() * 3,
        radius: 0.3 + Math.random() * 0.3,
        temperature: 0.3 + Math.random() * 0.4,
        waterLevel: Math.random() * 0.5,
        color: getTemperatureColor(0.5),
        bodyType: 'planet',
        textureType: 'rocky',
      });

      setSpawnMode(false);
    }
  }, [isSpawnMode, addBody, setSpawnMode, camera, pointer]);

  return (
    <mesh
      visible={false}
      position={[0, 0, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={handleClick}
    >
      <planeGeometry args={[500, 500]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
};

// Main simulation scene
const SimulationScene: React.FC = () => {
  const bodies = useSimulationStore((state) => state.bodies);
  const explosions = useSimulationStore((state) => state.explosions);
  const removeExplosion = useSimulationStore((state) => state.removeExplosion);
  const setSelectedBody = useSimulationStore((state) => state.setSelectedBody);

  const handleBackgroundClick = () => {
    setSelectedBody(null);
  };

  // Separate bodies by type
  const stars = bodies.filter(b => b.bodyType === 'star');
  const comets = bodies.filter(b => b.bodyType === 'comet');
  const otherBodies = bodies.filter(b => b.bodyType !== 'star' && b.bodyType !== 'comet');

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.15} />

      {/* Galaxy background with nebula */}
      <GalaxyBackground />

      {/* Enhanced star field */}
      <EnhancedStarField count={5000} radius={180} />

      {/* Render stars (Sun) with special component */}
      {stars.map((body) => (
        <React.Fragment key={body.id}>
          <Sun body={body} />
          {body.trailPositions && body.trailPositions.length > 1 && (
            <OrbitTrail
              positions={body.trailPositions}
              color={getTemperatureColor(body.temperature)}
            />
          )}
        </React.Fragment>
      ))}

      {/* Render comets with special component */}
      {comets.map((body) => (
        <React.Fragment key={body.id}>
          <Comet body={body} />
        </React.Fragment>
      ))}

      {/* Render planets, moons, and asteroids */}
      {otherBodies.map((body) => (
        <React.Fragment key={body.id}>
          <Planet body={body} />
          {body.trailPositions && body.trailPositions.length > 1 && body.bodyType !== 'asteroid' && (
            <OrbitTrail
              positions={body.trailPositions}
              color={getTemperatureColor(body.temperature)}
            />
          )}
        </React.Fragment>
      ))}

      {/* Gravity field visualization */}
      <GravityField gridSize={100} resolution={12} />

      {/* Habitable zone visualization */}
      <HabitableZone />

      {/* Science visualizations */}
      <LightSpeedAnimation />
      <DistanceLabels />
      <InverseSquareLaw />
      <DayNightTerminator />
      <EclipseSimulator />
      <PlanetaryAlignment />
      <Barycenter />
      <LagrangePoints />

      {/* Explosions */}
      {explosions.map((explosion) => (
        <React.Fragment key={explosion.id}>
          <ExplosionEffect
            position={explosion.position}
            color={explosion.color}
            size={explosion.size}
            onComplete={() => removeExplosion(explosion.id)}
          />
          <ShockwaveRing
            position={explosion.position}
            color={explosion.color}
            size={explosion.size}
            onComplete={() => { }}
          />
        </React.Fragment>
      ))}

      {/* Physics engine */}
      <PhysicsUpdater />

      {/* Spawn plane */}
      <SpawnHandler />

      {/* Background click handler */}
      <mesh
        visible={false}
        position={[0, 0, 0]}
        onClick={handleBackgroundClick}
      >
        <sphereGeometry args={[250, 32, 32]} />
        <meshBasicMaterial side={THREE.BackSide} />
      </mesh>
    </>
  );
};

// Main canvas component
export const SimulationCanvas: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-background">
      <Canvas
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <PerspectiveCamera
          makeDefault
          position={[0, 50, 80]}
          fov={60}
          near={0.1}
          far={1000}
        />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={200}
          dampingFactor={0.05}
          enableDamping={true}
        />
        <color attach="background" args={['#050510']} />
        <fog attach="fog" args={['#050510', 150, 350]} />
        <Suspense fallback={null}>
          <SimulationScene />
        </Suspense>
      </Canvas>
    </div>
  );
};
