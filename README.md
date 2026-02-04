# DevX Orbitary

![DevX Orbitary Logo](/logo.png)

**DevX Orbitary** is a premium, interactive 3D solar system simulation built to demonstrate advanced orbital physics and celestial mechanics directly in the browser.

## 🚀 Features

### 🔭 Interactive Simulation
- **N-Body Physics Engine**: Uses Leapfrog integration for stable, realistic orbital mechanics.
- **Dynamic Initialization**: Every session starts with randomized planet positions while maintaining stable orbits.
- **Interactive Controls**: Spawn new bodies (stars, planets, black holes) and manipulate gravity.

### 🎓 Educational Tools
- **Interactive Guide**: A built-in guided tour that navigates the solar system and explains key concepts automatically.
- **Habitable Zone**: Animated visualization of the "Goldilocks Zone" where liquid water can exist.
- **True Scale Mode**: Toggle to view the solar system at 1:1 scale (warning: space is huge!).
- **Atmosphere Comparison**: Real-time bar charts showing atmospheric composition of planets.
- **Tidal Forces**: Visualizes gravitational stress on moons like Io and Europa.

### 🔬 Scientific Visualizations
- **Lagrange Points**: Displays L1-L5 equilibrium points for the Earth-Sun system.
- **Barycenter**: Shows the center of mass of the solar system.
- **Light Speed**: Visualizes a photon traveling at true light speed relative to the simulation.
- **Inverse Square Law**: Intensity rings showing how solar energy diminishes with distance.
- **Eclipse Detector**: Real-time alerts for Lunar and Solar eclipses.
- **Planetary Alignments**: Detects and highlights when 3+ planets align.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript
- **3D Engine**: Three.js, @react-three/fiber, @react-three/drei
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **State Management**: Zustand
- **Animation**: Framer Motion, GSAP logic

## 📦 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/devx-orbitary.git
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   Navigate to `http://localhost:8080` to start exploring!

## 🎮 Controls

- **Left Click + Drag**: Rotate Camera
- **Right Click + Drag**: Pan Camera
- **Scroll**: Zoom In/Out
- **Click Planet**: Select and view detailed data
- **Science Panel**: Toggle visualizations (bottom-right)
- **Guide Book**: Start interactive tour (bottom-right)

## 📄 License

This project is open source and available under the MIT License.
