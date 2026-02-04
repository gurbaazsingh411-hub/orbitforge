// Real scientific data for solar system bodies (NASA data)
// Sources: NASA Planetary Fact Sheets

export interface PlanetScientificData {
    id: string;
    name: string;

    // Physical properties
    massKg: string; // in kg (scientific notation)
    massEarths: number; // relative to Earth
    diameterKm: number;
    diameterEarths: number; // relative to Earth
    densityGcm3: number; // g/cm³
    surfaceGravityMs2: number; // m/s²
    escapeVelocityKms: number; // km/s

    // Orbital properties
    distanceFromSunKm: string; // average, in km
    distanceFromSunAU: number; // astronomical units
    orbitalPeriodDays: number;
    orbitalPeriodYears: number;
    orbitalVelocityKms: number; // average km/s
    eccentricity: number; // orbital eccentricity

    // Other properties
    rotationPeriodHours: number; // sidereal rotation
    axialTiltDegrees: number;
    surfaceTempC: { min: number; max: number; avg: number };
    numberOfMoons: number;
    hasRings: boolean;

    // Atmosphere
    atmosphereComposition: string[];

    // Fun facts for presentation
    funFacts: string[];
}

export const planetData: Record<string, PlanetScientificData> = {
    sun: {
        id: 'sun',
        name: 'Sun',
        massKg: '1.989 × 10³⁰',
        massEarths: 333000,
        diameterKm: 1392700,
        diameterEarths: 109.2,
        densityGcm3: 1.41,
        surfaceGravityMs2: 274,
        escapeVelocityKms: 617.7,
        distanceFromSunKm: '0',
        distanceFromSunAU: 0,
        orbitalPeriodDays: 0,
        orbitalPeriodYears: 0,
        orbitalVelocityKms: 0,
        eccentricity: 0,
        rotationPeriodHours: 609.12, // at equator
        axialTiltDegrees: 7.25,
        surfaceTempC: { min: 5500, max: 5500, avg: 5500 },
        numberOfMoons: 0,
        hasRings: false,
        atmosphereComposition: ['Hydrogen (73%)', 'Helium (25%)', 'Oxygen, Carbon, Iron'],
        funFacts: [
            'The Sun contains 99.86% of the mass in our solar system',
            'Light takes 8 minutes 20 seconds to reach Earth from the Sun',
            'The Sun is about 4.6 billion years old'
        ]
    },

    mercury: {
        id: 'mercury',
        name: 'Mercury',
        massKg: '3.301 × 10²³',
        massEarths: 0.055,
        diameterKm: 4879,
        diameterEarths: 0.383,
        densityGcm3: 5.43,
        surfaceGravityMs2: 3.7,
        escapeVelocityKms: 4.3,
        distanceFromSunKm: '57.9 million',
        distanceFromSunAU: 0.387,
        orbitalPeriodDays: 88,
        orbitalPeriodYears: 0.241,
        orbitalVelocityKms: 47.4,
        eccentricity: 0.206,
        rotationPeriodHours: 1407.6,
        axialTiltDegrees: 0.034,
        surfaceTempC: { min: -180, max: 430, avg: 167 },
        numberOfMoons: 0,
        hasRings: false,
        atmosphereComposition: ['Oxygen (42%)', 'Sodium (29%)', 'Hydrogen (22%)'],
        funFacts: [
            'Mercury has the most extreme temperature swings in the solar system',
            'A day on Mercury lasts 59 Earth days',
            'Mercury is shrinking as its iron core cools'
        ]
    },

    venus: {
        id: 'venus',
        name: 'Venus',
        massKg: '4.867 × 10²⁴',
        massEarths: 0.815,
        diameterKm: 12104,
        diameterEarths: 0.949,
        densityGcm3: 5.24,
        surfaceGravityMs2: 8.87,
        escapeVelocityKms: 10.36,
        distanceFromSunKm: '108.2 million',
        distanceFromSunAU: 0.723,
        orbitalPeriodDays: 225,
        orbitalPeriodYears: 0.615,
        orbitalVelocityKms: 35.0,
        eccentricity: 0.007,
        rotationPeriodHours: -5832.5, // negative = retrograde
        axialTiltDegrees: 177.4,
        surfaceTempC: { min: 462, max: 462, avg: 462 },
        numberOfMoons: 0,
        hasRings: false,
        atmosphereComposition: ['Carbon Dioxide (96%)', 'Nitrogen (3.5%)', 'Sulfur Dioxide'],
        funFacts: [
            'Venus rotates backwards compared to most planets',
            'A day on Venus is longer than its year',
            'Venus is the hottest planet due to greenhouse effect'
        ]
    },

    earth: {
        id: 'earth',
        name: 'Earth',
        massKg: '5.972 × 10²⁴',
        massEarths: 1.0,
        diameterKm: 12742,
        diameterEarths: 1.0,
        densityGcm3: 5.51,
        surfaceGravityMs2: 9.81,
        escapeVelocityKms: 11.19,
        distanceFromSunKm: '149.6 million',
        distanceFromSunAU: 1.0,
        orbitalPeriodDays: 365.25,
        orbitalPeriodYears: 1.0,
        orbitalVelocityKms: 29.78,
        eccentricity: 0.017,
        rotationPeriodHours: 23.93,
        axialTiltDegrees: 23.44,
        surfaceTempC: { min: -89, max: 57, avg: 15 },
        numberOfMoons: 1,
        hasRings: false,
        atmosphereComposition: ['Nitrogen (78%)', 'Oxygen (21%)', 'Argon (0.9%)', 'CO₂ (0.04%)'],
        funFacts: [
            'Earth is the only known planet with liquid water on surface',
            'Earth\'s core is as hot as the Sun\'s surface',
            '71% of Earth\'s surface is covered by water'
        ]
    },

    moon: {
        id: 'moon',
        name: 'Moon',
        massKg: '7.342 × 10²²',
        massEarths: 0.0123,
        diameterKm: 3475,
        diameterEarths: 0.273,
        densityGcm3: 3.34,
        surfaceGravityMs2: 1.62,
        escapeVelocityKms: 2.38,
        distanceFromSunKm: '384,400 (from Earth)',
        distanceFromSunAU: 0.00257,
        orbitalPeriodDays: 27.3,
        orbitalPeriodYears: 0.075,
        orbitalVelocityKms: 1.02,
        eccentricity: 0.055,
        rotationPeriodHours: 655.7,
        axialTiltDegrees: 6.68,
        surfaceTempC: { min: -173, max: 127, avg: -23 },
        numberOfMoons: 0,
        hasRings: false,
        atmosphereComposition: ['Virtually none'],
        funFacts: [
            'The Moon is slowly drifting away from Earth at 3.8 cm/year',
            'The same side of the Moon always faces Earth',
            'Footprints on the Moon will last millions of years'
        ]
    },

    mars: {
        id: 'mars',
        name: 'Mars',
        massKg: '6.417 × 10²³',
        massEarths: 0.107,
        diameterKm: 6779,
        diameterEarths: 0.532,
        densityGcm3: 3.93,
        surfaceGravityMs2: 3.71,
        escapeVelocityKms: 5.03,
        distanceFromSunKm: '227.9 million',
        distanceFromSunAU: 1.524,
        orbitalPeriodDays: 687,
        orbitalPeriodYears: 1.881,
        orbitalVelocityKms: 24.1,
        eccentricity: 0.094,
        rotationPeriodHours: 24.62,
        axialTiltDegrees: 25.19,
        surfaceTempC: { min: -125, max: 20, avg: -65 },
        numberOfMoons: 2,
        hasRings: false,
        atmosphereComposition: ['Carbon Dioxide (95%)', 'Nitrogen (2.7%)', 'Argon (1.6%)'],
        funFacts: [
            'Mars has the largest volcano in the solar system (Olympus Mons)',
            'A day on Mars is almost the same length as Earth\'s',
            'Mars has seasons like Earth due to similar axial tilt'
        ]
    },

    jupiter: {
        id: 'jupiter',
        name: 'Jupiter',
        massKg: '1.898 × 10²⁷',
        massEarths: 317.8,
        diameterKm: 139820,
        diameterEarths: 10.97,
        densityGcm3: 1.33,
        surfaceGravityMs2: 24.79,
        escapeVelocityKms: 59.5,
        distanceFromSunKm: '778.5 million',
        distanceFromSunAU: 5.203,
        orbitalPeriodDays: 4333,
        orbitalPeriodYears: 11.86,
        orbitalVelocityKms: 13.1,
        eccentricity: 0.049,
        rotationPeriodHours: 9.93,
        axialTiltDegrees: 3.13,
        surfaceTempC: { min: -145, max: -145, avg: -145 },
        numberOfMoons: 95,
        hasRings: true,
        atmosphereComposition: ['Hydrogen (90%)', 'Helium (10%)', 'Methane, Ammonia'],
        funFacts: [
            'Jupiter\'s Great Red Spot is a storm larger than Earth',
            'Jupiter has the shortest day of all planets (10 hours)',
            'Jupiter\'s magnetic field is 20,000x stronger than Earth\'s'
        ]
    },

    saturn: {
        id: 'saturn',
        name: 'Saturn',
        massKg: '5.683 × 10²⁶',
        massEarths: 95.2,
        diameterKm: 116460,
        diameterEarths: 9.14,
        densityGcm3: 0.69,
        surfaceGravityMs2: 10.44,
        escapeVelocityKms: 35.5,
        distanceFromSunKm: '1.434 billion',
        distanceFromSunAU: 9.537,
        orbitalPeriodDays: 10759,
        orbitalPeriodYears: 29.46,
        orbitalVelocityKms: 9.7,
        eccentricity: 0.057,
        rotationPeriodHours: 10.7,
        axialTiltDegrees: 26.73,
        surfaceTempC: { min: -178, max: -178, avg: -178 },
        numberOfMoons: 146,
        hasRings: true,
        atmosphereComposition: ['Hydrogen (96%)', 'Helium (3%)', 'Methane'],
        funFacts: [
            'Saturn would float in water (density less than water)',
            'Saturn\'s rings are mostly ice and rock debris',
            'Saturn\'s moon Titan has a thicker atmosphere than Earth'
        ]
    },

    uranus: {
        id: 'uranus',
        name: 'Uranus',
        massKg: '8.681 × 10²⁵',
        massEarths: 14.5,
        diameterKm: 50724,
        diameterEarths: 3.98,
        densityGcm3: 1.27,
        surfaceGravityMs2: 8.87,
        escapeVelocityKms: 21.3,
        distanceFromSunKm: '2.871 billion',
        distanceFromSunAU: 19.19,
        orbitalPeriodDays: 30687,
        orbitalPeriodYears: 84.01,
        orbitalVelocityKms: 6.8,
        eccentricity: 0.046,
        rotationPeriodHours: -17.24, // retrograde
        axialTiltDegrees: 97.77,
        surfaceTempC: { min: -224, max: -224, avg: -224 },
        numberOfMoons: 28,
        hasRings: true,
        atmosphereComposition: ['Hydrogen (83%)', 'Helium (15%)', 'Methane (2%)'],
        funFacts: [
            'Uranus rotates on its side (98° tilt)',
            'Uranus was the first planet discovered with a telescope',
            'Uranus appears blue-green due to methane in atmosphere'
        ]
    },

    neptune: {
        id: 'neptune',
        name: 'Neptune',
        massKg: '1.024 × 10²⁶',
        massEarths: 17.1,
        diameterKm: 49244,
        diameterEarths: 3.86,
        densityGcm3: 1.64,
        surfaceGravityMs2: 11.15,
        escapeVelocityKms: 23.5,
        distanceFromSunKm: '4.495 billion',
        distanceFromSunAU: 30.07,
        orbitalPeriodDays: 60190,
        orbitalPeriodYears: 164.8,
        orbitalVelocityKms: 5.4,
        eccentricity: 0.011,
        rotationPeriodHours: 16.11,
        axialTiltDegrees: 28.32,
        surfaceTempC: { min: -218, max: -218, avg: -218 },
        numberOfMoons: 16,
        hasRings: true,
        atmosphereComposition: ['Hydrogen (80%)', 'Helium (19%)', 'Methane (1%)'],
        funFacts: [
            'Neptune has the strongest winds in the solar system (2100 km/h)',
            'Neptune was discovered through mathematical predictions',
            'Neptune\'s moon Triton orbits backwards'
        ]
    }
};

// Habitable zone boundaries (in AU from sun)
// Based on conservative estimates for liquid water
export const habitableZone = {
    innerBoundaryAU: 0.95,  // Too close = too hot
    outerBoundaryAU: 1.37,  // Too far = too cold
    optimalAU: 1.0,         // Earth's position
};

// Kepler's Third Law: T² = a³ (when T in years, a in AU)
export const calculateOrbitalPeriod = (semiMajorAxisAU: number): number => {
    return Math.sqrt(Math.pow(semiMajorAxisAU, 3));
};

// Verify Kepler's Law for a planet
export const verifyKeplerLaw = (distanceAU: number, periodYears: number): number => {
    const predicted = calculateOrbitalPeriod(distanceAU);
    return Math.abs(predicted - periodYears) / periodYears * 100; // % error
};
