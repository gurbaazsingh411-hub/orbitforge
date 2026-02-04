import { create } from 'zustand';
import { Vector3 } from 'three';

// Gravitational constant (scaled for simulation)
const G = 0.5;

export type BodyType = 'star' | 'planet' | 'moon' | 'asteroid' | 'comet';
export type TextureType = 'rocky' | 'gas' | 'ice' | 'ocean' | 'volcanic' | 'barren';

export interface CelestialBody {
  id: string;
  name: string;
  position: [number, number, number];
  velocity: [number, number, number];
  mass: number;
  radius: number;
  temperature: number; // 0-1 scale (frozen to hot)
  waterLevel: number; // 0-1 scale
  color: string;
  isBeingDragged?: boolean;
  trailPositions?: [number, number, number][];
  // Life system
  lifeLevel: number; // 0-1 scale (no life to thriving)
  biodiversity: number; // 0-1 scale (species variety)
  vegetationCover: number; // 0-1 scale
  // New fields for enhanced features
  bodyType: BodyType;
  textureType: TextureType;
  hasRings?: boolean;
  ringColor?: string;
  ringTilt?: number; // tilt angle in radians
  parentId?: string; // for moons - references parent planet
}

export interface Explosion {
  id: string;
  position: [number, number, number];
  color: string;
  size: number;
}

interface SimulationState {
  bodies: CelestialBody[];
  explosions: Explosion[];
  timeScale: number;
  isPaused: boolean;
  selectedBodyId: string | null;
  isSpawnMode: boolean;
  showGravityField: boolean;
  showHabitableZone: boolean;
  // Science visualizations
  showDistanceLabels: boolean;
  showLightSpeed: boolean;
  showInverseSquare: boolean;
  showDayNight: boolean;
  showEclipses: boolean;
  showAlignments: boolean;
  showBarycenter: boolean;
  showLagrange: boolean;
  showTidalForces: boolean;
  showAtmospheres: boolean;
  useRealScale: boolean;


  // Actions
  addBody: (body: Omit<CelestialBody, 'id' | 'lifeLevel' | 'biodiversity' | 'vegetationCover'>) => string;
  removeBody: (id: string) => void;
  updateBody: (id: string, updates: Partial<CelestialBody>) => void;
  setSelectedBody: (id: string | null) => void;
  setTimeScale: (scale: number) => void;
  togglePause: () => void;
  setSpawnMode: (mode: boolean) => void;
  toggleGravityField: () => void;
  toggleHabitableZone: () => void;
  // Science toggles
  toggleDistanceLabels: () => void;
  toggleLightSpeed: () => void;
  toggleInverseSquare: () => void;
  toggleDayNight: () => void;
  toggleEclipses: () => void;
  toggleAlignments: () => void;
  toggleBarycenter: () => void;
  toggleLagrange: () => void;
  toggleTidalForces: () => void;
  toggleAtmospheres: () => void;
  toggleRealScale: () => void;
  updatePhysics: (deltaTime: number) => void;
  destroyBody: (id: string) => void;
  removeExplosion: (id: string) => void;
  setBodyDragging: (id: string, isDragging: boolean) => void;
}


// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Get color based on temperature
export const getTemperatureColor = (temperature: number): string => {
  if (temperature < 0.2) return '#7dd3fc'; // Frozen - light blue
  if (temperature < 0.4) return '#38bdf8'; // Cold - blue
  if (temperature < 0.6) return '#4ade80'; // Temperate - green
  if (temperature < 0.8) return '#fbbf24'; // Warm - yellow/orange
  return '#f97316'; // Hot - orange/red
};

// Calculate distance between two points
const distance = (p1: [number, number, number], p2: [number, number, number]): number => {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const dz = p2[2] - p1[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

// Calculate life habitability based on temperature and water
export const calculateHabitability = (temperature: number, waterLevel: number): number => {
  // Optimal temperature range: 0.4-0.6 (temperate)
  const tempFactor = 1 - Math.abs(temperature - 0.5) * 2;
  const waterFactor = Math.min(waterLevel * 1.5, 1);
  return Math.max(0, Math.min(1, tempFactor * 0.6 + waterFactor * 0.4));
};

// Generate asteroids for the asteroid belt
const generateAsteroids = (): CelestialBody[] => {
  const asteroids: CelestialBody[] = [];
  for (let i = 0; i < 25; i++) {
    const angle = (Math.PI * 2 * i) / 25 + Math.random() * 0.5;
    const distance = 28 + Math.random() * 6; // Between Mars and Jupiter
    const orbitalSpeed = Math.sqrt(0.5 * 1000 / distance) * (0.9 + Math.random() * 0.2);
    asteroids.push({
      id: `asteroid-${i}`,
      name: `Asteroid ${i + 1}`,
      position: [Math.cos(angle) * distance, (Math.random() - 0.5) * 2, Math.sin(angle) * distance],
      velocity: [-Math.sin(angle) * orbitalSpeed, 0, Math.cos(angle) * orbitalSpeed],
      mass: 0.01 + Math.random() * 0.05,
      radius: 0.08 + Math.random() * 0.12,
      temperature: 0.2,
      waterLevel: 0,
      color: '#6b7280',
      trailPositions: [],
      lifeLevel: 0,
      biodiversity: 0,
      vegetationCover: 0,
      bodyType: 'asteroid',
      textureType: 'rocky',
    });
  }
  return asteroids;
};

// Default solar system setup
const createDefaultBodies = (): CelestialBody[] => [
  // Sun
  {
    id: 'sun',
    name: 'Sun',
    position: [0, 0, 0],
    velocity: [0, 0, 0],
    mass: 1000,
    radius: 2,
    temperature: 1,
    waterLevel: 0,
    color: '#fbbf24',
    trailPositions: [],
    lifeLevel: 0,
    biodiversity: 0,
    vegetationCover: 0,
    bodyType: 'star',
    textureType: 'volcanic',
  },
  // Mercury
  {
    id: 'mercury',
    name: 'Mercury',
    position: [8, 0, 0],
    velocity: [0, 0, 7.5],
    mass: 1,
    radius: 0.3,
    temperature: 0.9,
    waterLevel: 0,
    color: '#a1a1aa',
    trailPositions: [],
    lifeLevel: 0,
    biodiversity: 0,
    vegetationCover: 0,
    bodyType: 'planet',
    textureType: 'barren',
  },
  // Venus
  {
    id: 'venus',
    name: 'Venus',
    position: [12, 0, 0],
    velocity: [0, 0, 6.2],
    mass: 2,
    radius: 0.5,
    temperature: 0.85,
    waterLevel: 0,
    color: '#fcd34d',
    trailPositions: [],
    lifeLevel: 0,
    biodiversity: 0,
    vegetationCover: 0,
    bodyType: 'planet',
    textureType: 'volcanic',
  },
  // Earth
  {
    id: 'earth',
    name: 'Earth',
    position: [16, 0, 0],
    velocity: [0, 0, 5.5],
    mass: 3,
    radius: 0.5,
    temperature: 0.5,
    waterLevel: 0.7,
    color: '#3b82f6',
    trailPositions: [],
    lifeLevel: 0.85,
    biodiversity: 0.9,
    vegetationCover: 0.6,
    bodyType: 'planet',
    textureType: 'ocean',
  },
  // Moon (Earth's satellite)
  {
    id: 'moon',
    name: 'Moon',
    position: [17.5, 0, 0],
    velocity: [0, 0, 6.5],
    mass: 0.1,
    radius: 0.15,
    temperature: 0.25,
    waterLevel: 0,
    color: '#d1d5db',
    trailPositions: [],
    lifeLevel: 0,
    biodiversity: 0,
    vegetationCover: 0,
    bodyType: 'moon',
    textureType: 'barren',
    parentId: 'earth',
  },
  // Mars
  {
    id: 'mars',
    name: 'Mars',
    position: [22, 0, 0],
    velocity: [0, 0, 4.7],
    mass: 1.5,
    radius: 0.4,
    temperature: 0.35,
    waterLevel: 0.05,
    color: '#ef4444',
    trailPositions: [],
    lifeLevel: 0.05,
    biodiversity: 0.02,
    vegetationCover: 0,
    bodyType: 'planet',
    textureType: 'rocky',
  },
  // Jupiter (Gas Giant with faint rings)
  {
    id: 'jupiter',
    name: 'Jupiter',
    position: [38, 0, 0],
    velocity: [0, 0, 3.6],
    mass: 50,
    radius: 1.2,
    temperature: 0.4,
    waterLevel: 0,
    color: '#d97706',
    trailPositions: [],
    lifeLevel: 0,
    biodiversity: 0,
    vegetationCover: 0,
    bodyType: 'planet',
    textureType: 'gas',
    hasRings: true,
    ringColor: '#a87850',
    ringTilt: 0.05,
  },
  // Saturn (Gas Giant with prominent rings)
  {
    id: 'saturn',
    name: 'Saturn',
    position: [52, 0, 0],
    velocity: [0, 0, 3.1],
    mass: 30,
    radius: 1.0,
    temperature: 0.3,
    waterLevel: 0,
    color: '#fbbf24',
    trailPositions: [],
    lifeLevel: 0,
    biodiversity: 0,
    vegetationCover: 0,
    bodyType: 'planet',
    textureType: 'gas',
    hasRings: true,
    ringColor: '#c9a86c',
    ringTilt: 0.47,
  },
  // Uranus (Ice Giant with rings)
  {
    id: 'uranus',
    name: 'Uranus',
    position: [68, 0, 0],
    velocity: [0, 0, 2.7],
    mass: 15,
    radius: 0.7,
    temperature: 0.15,
    waterLevel: 0,
    color: '#67e8f9',
    trailPositions: [],
    lifeLevel: 0,
    biodiversity: 0,
    vegetationCover: 0,
    bodyType: 'planet',
    textureType: 'ice',
    hasRings: true,
    ringColor: '#94a3b8',
    ringTilt: 1.71, // Uranus has extreme tilt
  },
  // Neptune (Ice Giant)
  {
    id: 'neptune',
    name: 'Neptune',
    position: [82, 0, 0],
    velocity: [0, 0, 2.4],
    mass: 17,
    radius: 0.65,
    temperature: 0.1,
    waterLevel: 0,
    color: '#3b82f6',
    trailPositions: [],
    lifeLevel: 0,
    biodiversity: 0,
    vegetationCover: 0,
    bodyType: 'planet',
    textureType: 'ice',
    hasRings: true,
    ringColor: '#60a5fa',
    ringTilt: 0.49,
  },
  // Comet Halley (elliptical orbit)
  {
    id: 'comet-halley',
    name: "Halley's Comet",
    position: [90, 5, 20],
    velocity: [-1.8, -0.3, -2.5],
    mass: 0.001,
    radius: 0.15,
    temperature: 0.05,
    waterLevel: 0.8,
    color: '#e0f2fe',
    trailPositions: [],
    lifeLevel: 0,
    biodiversity: 0,
    vegetationCover: 0,
    bodyType: 'comet',
    textureType: 'ice',
  },
  // Second comet
  {
    id: 'comet-swift',
    name: 'Swift-Tuttle',
    position: [-70, -8, 60],
    velocity: [2.0, 0.4, -1.5],
    mass: 0.002,
    radius: 0.12,
    temperature: 0.05,
    waterLevel: 0.9,
    color: '#bfdbfe',
    trailPositions: [],
    lifeLevel: 0,
    biodiversity: 0,
    vegetationCover: 0,
    bodyType: 'comet',
    textureType: 'ice',
  },
  // Spread asteroids
  ...generateAsteroids(),
];

export const useSimulationStore = create<SimulationState>((set, get) => ({
  bodies: createDefaultBodies(),
  explosions: [],
  timeScale: 1,
  isPaused: false,
  selectedBodyId: null,
  isSpawnMode: false,
  showGravityField: false,
  showHabitableZone: false,
  // Science visualizations
  showDistanceLabels: false,
  showLightSpeed: false,
  showInverseSquare: false,
  showDayNight: false,
  showEclipses: false,
  showAlignments: false,
  showBarycenter: false,
  showLagrange: false,
  showTidalForces: false,
  showAtmospheres: false,
  useRealScale: false,


  addBody: (bodyData) => {
    const id = generateId();
    const habitability = calculateHabitability(bodyData.temperature, bodyData.waterLevel);
    const body: CelestialBody = {
      ...bodyData,
      id,
      trailPositions: [],
      lifeLevel: habitability * 0.5,
      biodiversity: habitability * 0.3,
      vegetationCover: habitability * 0.4,
    };
    set((state) => ({
      bodies: [...state.bodies, body],
    }));
    return id;
  },

  removeBody: (id) => {
    set((state) => ({
      bodies: state.bodies.filter((b) => b.id !== id),
      selectedBodyId: state.selectedBodyId === id ? null : state.selectedBodyId,
    }));
  },

  updateBody: (id, updates) => {
    set((state) => ({
      bodies: state.bodies.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      ),
    }));
  },

  setSelectedBody: (id) => {
    set({ selectedBodyId: id });
  },

  setTimeScale: (scale) => {
    set({ timeScale: scale });
  },

  togglePause: () => {
    set((state) => ({ isPaused: !state.isPaused }));
  },

  setSpawnMode: (mode) => {
    set({ isSpawnMode: mode });
  },

  toggleGravityField: () => {
    set((state) => ({ showGravityField: !state.showGravityField }));
  },

  toggleHabitableZone: () => {
    set((state) => ({ showHabitableZone: !state.showHabitableZone }));
  },

  // Science visualization toggles
  toggleDistanceLabels: () => {
    set((state) => ({ showDistanceLabels: !state.showDistanceLabels }));
  },
  toggleLightSpeed: () => {
    set((state) => ({ showLightSpeed: !state.showLightSpeed }));
  },
  toggleInverseSquare: () => {
    set((state) => ({ showInverseSquare: !state.showInverseSquare }));
  },
  toggleDayNight: () => {
    set((state) => ({ showDayNight: !state.showDayNight }));
  },
  toggleEclipses: () => {
    set((state) => ({ showEclipses: !state.showEclipses }));
  },
  toggleAlignments: () => {
    set((state) => ({ showAlignments: !state.showAlignments }));
  },
  toggleBarycenter: () => {
    set((state) => ({ showBarycenter: !state.showBarycenter }));
  },
  toggleLagrange: () => {
    set((state) => ({ showLagrange: !state.showLagrange }));
  },
  toggleTidalForces: () => {
    set((state) => ({ showTidalForces: !state.showTidalForces }));
  },
  toggleAtmospheres: () => {
    set((state) => ({ showAtmospheres: !state.showAtmospheres }));
  },
  toggleRealScale: () => {
    set((state) => ({ useRealScale: !state.useRealScale }));
  },

  setBodyDragging: (id, isDragging) => {
    set((state) => ({
      bodies: state.bodies.map((b) =>
        b.id === id ? { ...b, isBeingDragged: isDragging } : b
      ),
    }));
  },

  destroyBody: (id) => {
    const state = get();
    const body = state.bodies.find((b) => b.id === id);
    if (body) {
      // Create explosion at body position
      const explosion: Explosion = {
        id: generateId(),
        position: [...body.position] as [number, number, number],
        color: body.color,
        size: body.radius,
      };
      set((s) => ({
        explosions: [...s.explosions, explosion],
      }));
      // Remove the body
      get().removeBody(id);
    }
  },

  removeExplosion: (id) => {
    set((state) => ({
      explosions: state.explosions.filter((e) => e.id !== id),
    }));
  },

  // Leapfrog integration for stable orbital mechanics
  updatePhysics: (deltaTime) => {
    const state = get();
    if (state.isPaused) return;

    const dt = deltaTime * state.timeScale * 0.01;
    const bodies = [...state.bodies];
    const n = bodies.length;

    // Skip physics for bodies being dragged
    const activeBodies = bodies.filter(b => !b.isBeingDragged);

    if (activeBodies.length < 2) return;

    // Calculate accelerations for all bodies
    const accelerations: [number, number, number][] = activeBodies.map(() => [0, 0, 0]);

    for (let i = 0; i < activeBodies.length; i++) {
      for (let j = i + 1; j < activeBodies.length; j++) {
        const bodyA = activeBodies[i];
        const bodyB = activeBodies[j];

        const dx = bodyB.position[0] - bodyA.position[0];
        const dy = bodyB.position[1] - bodyA.position[1];
        const dz = bodyB.position[2] - bodyA.position[2];

        const distSq = dx * dx + dy * dy + dz * dz;
        const dist = Math.sqrt(distSq);

        // Check for collision
        const minDist = bodyA.radius + bodyB.radius;
        if (dist < minDist) {
          // Merge bodies - larger absorbs smaller
          const largerBody = bodyA.mass >= bodyB.mass ? bodyA : bodyB;
          const smallerBody = bodyA.mass >= bodyB.mass ? bodyB : bodyA;

          // Conservation of momentum
          const totalMass = largerBody.mass + smallerBody.mass;
          const newVx = (largerBody.velocity[0] * largerBody.mass + smallerBody.velocity[0] * smallerBody.mass) / totalMass;
          const newVy = (largerBody.velocity[1] * largerBody.mass + smallerBody.velocity[1] * smallerBody.mass) / totalMass;
          const newVz = (largerBody.velocity[2] * largerBody.mass + smallerBody.velocity[2] * smallerBody.mass) / totalMass;

          // New radius based on volume conservation
          const newRadius = Math.cbrt(Math.pow(largerBody.radius, 3) + Math.pow(smallerBody.radius, 3));

          // Update the larger body
          const largerIndex = bodies.findIndex(b => b.id === largerBody.id);
          bodies[largerIndex] = {
            ...largerBody,
            mass: totalMass,
            radius: newRadius,
            velocity: [newVx, newVy, newVz],
            // Average temperature weighted by mass
            temperature: (largerBody.temperature * largerBody.mass + smallerBody.temperature * smallerBody.mass) / totalMass,
            waterLevel: (largerBody.waterLevel * largerBody.mass + smallerBody.waterLevel * smallerBody.mass) / totalMass,
          };

          // Remove the smaller body
          const smallerIndex = bodies.findIndex(b => b.id === smallerBody.id);
          bodies.splice(smallerIndex, 1);

          set({ bodies });
          return; // Restart physics calculation
        }

        // Gravitational force magnitude: F = G * m1 * m2 / r^2
        // Softening factor to prevent extreme forces at close range
        const softening = 0.5;
        const forceMag = G * bodyA.mass * bodyB.mass / (distSq + softening);

        // Acceleration = Force / Mass
        const accA = forceMag / bodyA.mass;
        const accB = forceMag / bodyB.mass;

        // Direction vectors
        const dirX = dx / dist;
        const dirY = dy / dist;
        const dirZ = dz / dist;

        // Apply accelerations
        accelerations[i][0] += accA * dirX;
        accelerations[i][1] += accA * dirY;
        accelerations[i][2] += accA * dirZ;

        accelerations[j][0] -= accB * dirX;
        accelerations[j][1] -= accB * dirY;
        accelerations[j][2] -= accB * dirZ;
      }
    }

    // Leapfrog integration: update velocities and positions
    const updatedBodies = bodies.map((body) => {
      if (body.isBeingDragged) return body;

      const activeIndex = activeBodies.findIndex(b => b.id === body.id);
      if (activeIndex === -1) return body;

      const acc = accelerations[activeIndex];

      // Update velocity (half step)
      const newVx = body.velocity[0] + acc[0] * dt;
      const newVy = body.velocity[1] + acc[1] * dt;
      const newVz = body.velocity[2] + acc[2] * dt;

      // Update position
      const newPx = body.position[0] + newVx * dt;
      const newPy = body.position[1] + newVy * dt;
      const newPz = body.position[2] + newVz * dt;

      // Update trail (keep last 50 positions)
      const trailPositions = [...(body.trailPositions || [])];
      trailPositions.push([...body.position] as [number, number, number]);
      if (trailPositions.length > 100) {
        trailPositions.shift();
      }

      // Evolve life based on conditions (skip for stars)
      let lifeLevel = body.lifeLevel;
      let biodiversity = body.biodiversity;
      let vegetationCover = body.vegetationCover;

      if (body.mass < 100) { // Not a star
        const habitability = calculateHabitability(body.temperature, body.waterLevel);
        const lifeChangeRate = dt * 0.5;

        // Life evolves toward habitability
        if (habitability > 0.3) {
          // Conditions support life - grow toward habitability
          lifeLevel = Math.min(1, lifeLevel + (habitability - lifeLevel) * lifeChangeRate);
          biodiversity = Math.min(1, biodiversity + (habitability * 0.8 - biodiversity) * lifeChangeRate * 0.5);
          vegetationCover = Math.min(body.waterLevel, vegetationCover + (habitability * body.waterLevel - vegetationCover) * lifeChangeRate * 0.3);
        } else {
          // Harsh conditions - life declines
          lifeLevel = Math.max(0, lifeLevel - (1 - habitability) * lifeChangeRate * 0.8);
          biodiversity = Math.max(0, biodiversity - lifeChangeRate * 0.3);
          vegetationCover = Math.max(0, vegetationCover - lifeChangeRate * 0.4);
        }

        // Extreme temperatures cause mass extinction
        if (body.temperature > 0.9 || body.temperature < 0.1) {
          lifeLevel *= 0.99;
          biodiversity *= 0.98;
          vegetationCover *= 0.97;
        }
      }

      return {
        ...body,
        position: [newPx, newPy, newPz] as [number, number, number],
        velocity: [newVx, newVy, newVz] as [number, number, number],
        trailPositions,
        lifeLevel,
        biodiversity,
        vegetationCover,
      };
    });

    set({ bodies: updatedBodies });
  },
}));
