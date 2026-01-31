import { useMemo } from 'react';
import * as THREE from 'three';

// Procedural texture generators
const createNoiseTexture = (size: number, color1: number, color2: number): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  const c1 = new THREE.Color(color1);
  const c2 = new THREE.Color(color2);
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const noise = Math.random() * 0.3 + 0.7;
      const r = Math.floor((c1.r * noise + c2.r * (1 - noise)) * 255);
      const g = Math.floor((c1.g * noise + c2.g * (1 - noise)) * 255);
      const b = Math.floor((c1.b * noise + c2.b * (1 - noise)) * 255);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

const createBrickTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#4a3a2a';
  ctx.fillRect(0, 0, 128, 128);
  
  const brickHeight = 16;
  const brickWidth = 32;
  const mortarWidth = 2;
  
  for (let row = 0; row < 8; row++) {
    const offset = row % 2 === 0 ? 0 : brickWidth / 2;
    for (let col = 0; col < 5; col++) {
      const x = col * brickWidth - offset;
      const y = row * brickHeight;
      
      const shade = 0.8 + Math.random() * 0.4;
      const r = Math.floor(139 * shade);
      const g = Math.floor(90 * shade);
      const b = Math.floor(60 * shade);
      
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x + mortarWidth, y + mortarWidth, brickWidth - mortarWidth * 2, brickHeight - mortarWidth * 2);
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
};

const createConcreteTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#555555';
  ctx.fillRect(0, 0, 64, 64);
  
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * 64;
    const y = Math.random() * 64;
    const shade = 70 + Math.random() * 40;
    ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
    ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
  
  // Add some cracks
  ctx.strokeStyle = '#444444';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 64, Math.random() * 64);
    ctx.lineTo(Math.random() * 64, Math.random() * 64);
    ctx.stroke();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
};

const createAsphaltTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(0, 0, 128, 128);
  
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * 128;
    const y = Math.random() * 128;
    const shade = 30 + Math.random() * 30;
    ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
    ctx.fillRect(x, y, 1 + Math.random(), 1 + Math.random());
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(20, 20);
  return texture;
};

const createMetalTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  
  // Brushed metal effect
  ctx.fillStyle = '#555555';
  ctx.fillRect(0, 0, 64, 64);
  
  for (let y = 0; y < 64; y++) {
    const shade = 75 + Math.random() * 20;
    ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
    ctx.fillRect(0, y, 64, 1);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

// Dirt/gravel texture
const createDirtTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#4a4038';
  ctx.fillRect(0, 0, 64, 64);
  
  for (let i = 0; i < 800; i++) {
    const x = Math.random() * 64;
    const y = Math.random() * 64;
    const shade = 50 + Math.random() * 40;
    const size = 1 + Math.random() * 2;
    ctx.fillStyle = `rgb(${shade + 10},${shade},${shade - 10})`;
    ctx.fillRect(x, y, size, size);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  return texture;
};

// Grass texture
const createGrassTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#2a3a2a';
  ctx.fillRect(0, 0, 64, 64);
  
  for (let i = 0; i < 600; i++) {
    const x = Math.random() * 64;
    const y = Math.random() * 64;
    const g = 40 + Math.random() * 30;
    ctx.fillStyle = `rgb(${g * 0.6},${g},${g * 0.5})`;
    ctx.fillRect(x, y, 1, 2 + Math.random() * 3);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(15, 15);
  return texture;
};

// Wood texture
const createWoodTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#5a4030';
  ctx.fillRect(0, 0, 64, 64);
  
  for (let y = 0; y < 64; y++) {
    const shade = 70 + Math.sin(y * 0.3) * 15 + Math.random() * 10;
    ctx.fillStyle = `rgb(${shade},${shade * 0.7},${shade * 0.5})`;
    ctx.fillRect(0, y, 64, 1);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
};

// Tile floor texture
const createTileTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#404040';
  ctx.fillRect(0, 0, 64, 64);
  
  // Grid lines
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(32, 0); ctx.lineTo(32, 64);
  ctx.moveTo(0, 32); ctx.lineTo(64, 32);
  ctx.stroke();
  
  // Add noise
  for (let i = 0; i < 200; i++) {
    const shade = 55 + Math.random() * 20;
    ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
    ctx.fillRect(Math.random() * 64, Math.random() * 64, 1, 1);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
};

const Map = () => {
  // Create procedural textures
  const textures = useMemo(() => ({
    asphalt: createAsphaltTexture(),
    concrete: createConcreteTexture(),
    brick: createBrickTexture(),
    metal: createMetalTexture(),
    dirt: createDirtTexture(),
    grass: createGrassTexture(),
    wood: createWoodTexture(),
    tile: createTileTexture(),
    noise: createNoiseTexture(64, 0x3a3a3a, 0x2a2a2a),
  }), []);

  // Materials with textures
  const materials = useMemo(() => ({
    ground: new THREE.MeshStandardMaterial({ 
      map: textures.asphalt,
      roughness: 0.95,
      metalness: 0.05,
    }),
    concrete: new THREE.MeshStandardMaterial({ 
      map: textures.concrete,
      roughness: 0.9,
      metalness: 0.1,
    }),
    brick: new THREE.MeshStandardMaterial({ 
      map: textures.brick,
      roughness: 0.85,
      metalness: 0.05,
    }),
    metal: new THREE.MeshStandardMaterial({ 
      map: textures.metal,
      roughness: 0.3,
      metalness: 0.85,
    }),
    metalDark: new THREE.MeshStandardMaterial({ 
      color: 0x2a2a2a,
      roughness: 0.4,
      metalness: 0.8,
    }),
    rust: new THREE.MeshStandardMaterial({ 
      color: 0x6a4a3a,
      roughness: 0.9,
      metalness: 0.3,
    }),
    window: new THREE.MeshStandardMaterial({ 
      color: 0x334455,
      roughness: 0.05,
      metalness: 0.4,
      transparent: true,
      opacity: 0.6,
      envMapIntensity: 1,
    }),
    windowDark: new THREE.MeshStandardMaterial({ 
      color: 0x1a1a22,
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.8,
    }),
    roofTar: new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a,
      roughness: 0.95,
      metalness: 0.05,
    }),
    paint: new THREE.MeshStandardMaterial({ 
      color: 0x3a4a3a,
      roughness: 0.7,
      metalness: 0.1,
    }),
    yellow: new THREE.MeshStandardMaterial({ 
      color: 0xccaa00,
      roughness: 0.6,
      metalness: 0.1,
    }),
    interior: new THREE.MeshStandardMaterial({ 
      map: textures.tile,
      roughness: 0.9,
      metalness: 0.05,
    }),
    dirt: new THREE.MeshStandardMaterial({ 
      map: textures.dirt,
      roughness: 0.95,
      metalness: 0.02,
    }),
    grass: new THREE.MeshStandardMaterial({ 
      map: textures.grass,
      roughness: 0.95,
      metalness: 0.02,
    }),
    wood: new THREE.MeshStandardMaterial({ 
      map: textures.wood,
      roughness: 0.85,
      metalness: 0.1,
    }),
  }), [textures]);

  // Building configurations - MUCH larger map with more buildings
  const buildings = useMemo(() => [
    // Inner ring buildings
    { pos: [-30, 0, -30], size: [10, 16, 10], type: 'brick', windows: true },
    { pos: [30, 0, -30], size: [12, 12, 8], type: 'concrete', windows: true },
    { pos: [-30, 0, 30], size: [8, 20, 12], type: 'brick', windows: true },
    { pos: [30, 0, 30], size: [10, 14, 10], type: 'concrete', windows: true },
    // Mid ring buildings
    { pos: [0, 0, -55], size: [28, 8, 6], type: 'concrete', windows: true },
    { pos: [-55, 0, 0], size: [6, 12, 22], type: 'brick', windows: true },
    { pos: [55, 0, 0], size: [6, 14, 18], type: 'concrete', windows: true },
    { pos: [0, 0, 55], size: [24, 7, 6], type: 'brick', windows: true },
    { pos: [-20, 0, -15], size: [8, 10, 8], type: 'brick', windows: true },
    { pos: [20, 0, -15], size: [10, 8, 6], type: 'concrete', windows: true },
    { pos: [-20, 0, 18], size: [6, 14, 10], type: 'concrete', windows: true },
    { pos: [20, 0, 18], size: [8, 10, 8], type: 'brick', windows: true },
    // Outer ring buildings - NEW
    { pos: [-70, 0, -40], size: [12, 18, 10], type: 'brick', windows: true },
    { pos: [70, 0, -40], size: [10, 14, 12], type: 'concrete', windows: true },
    { pos: [-70, 0, 40], size: [14, 12, 8], type: 'concrete', windows: true },
    { pos: [70, 0, 40], size: [8, 20, 10], type: 'brick', windows: true },
    { pos: [-40, 0, -70], size: [10, 10, 14], type: 'brick', windows: true },
    { pos: [40, 0, -70], size: [12, 12, 10], type: 'concrete', windows: true },
    { pos: [-40, 0, 70], size: [8, 14, 12], type: 'concrete', windows: true },
    { pos: [40, 0, 70], size: [10, 10, 8], type: 'brick', windows: true },
    // Far corners
    { pos: [-80, 0, -80], size: [14, 22, 14], type: 'brick', windows: true },
    { pos: [80, 0, -80], size: [12, 16, 12], type: 'concrete', windows: true },
    { pos: [-80, 0, 80], size: [10, 18, 10], type: 'concrete', windows: true },
    { pos: [80, 0, 80], size: [14, 14, 14], type: 'brick', windows: true },
    // Additional scattered buildings
    { pos: [-52, 0, -25], size: [6, 10, 12], type: 'brick', windows: true },
    { pos: [52, 0, 25], size: [6, 12, 10], type: 'concrete', windows: true },
    { pos: [-25, 0, -52], size: [10, 8, 6], type: 'concrete', windows: true },
    { pos: [25, 0, 52], size: [12, 9, 6], type: 'brick', windows: true },
    { pos: [-60, 0, 60], size: [8, 10, 8], type: 'brick', windows: true },
    { pos: [60, 0, -60], size: [10, 12, 10], type: 'concrete', windows: true },
  ], []);

  // Cover objects - spread across much larger map
  const covers = useMemo(() => [
    // Inner area cover
    { pos: [-10, 0.6, -10], size: [2.5, 1.2, 0.6], type: 'concrete' },
    { pos: [10, 0.6, -10], size: [2.5, 1.2, 0.6], type: 'concrete' },
    { pos: [-10, 0.6, 10], size: [0.6, 1.2, 2.5], type: 'metal' },
    { pos: [10, 0.6, 10], size: [0.6, 1.2, 2.5], type: 'metal' },
    { pos: [-18, 0.6, 0], size: [1.2, 1.2, 4], type: 'metal' },
    { pos: [18, 0.6, 0], size: [1.2, 1.2, 4], type: 'metal' },
    { pos: [0, 0.6, -18], size: [4, 1.2, 1.2], type: 'concrete' },
    { pos: [0, 0.6, 18], size: [4, 1.2, 1.2], type: 'concrete' },
    // Mid area cover
    { pos: [-30, 0.6, 10], size: [3, 1.4, 0.6], type: 'concrete' },
    { pos: [30, 0.6, -10], size: [3, 1.4, 0.6], type: 'concrete' },
    { pos: [-15, 0.6, 30], size: [0.6, 1.2, 3], type: 'metal' },
    { pos: [15, 0.6, -30], size: [0.6, 1.2, 3], type: 'metal' },
    // Outer area cover - NEW
    { pos: [-50, 0.6, -20], size: [3, 1.5, 0.8], type: 'concrete' },
    { pos: [50, 0.6, 20], size: [3, 1.5, 0.8], type: 'concrete' },
    { pos: [-20, 0.6, -50], size: [0.8, 1.5, 3], type: 'metal' },
    { pos: [20, 0.6, 50], size: [0.8, 1.5, 3], type: 'metal' },
    { pos: [-60, 0.6, 30], size: [4, 1.3, 0.6], type: 'concrete' },
    { pos: [60, 0.6, -30], size: [4, 1.3, 0.6], type: 'concrete' },
    { pos: [-35, 0.6, 55], size: [0.6, 1.2, 4], type: 'metal' },
    { pos: [35, 0.6, -55], size: [0.6, 1.2, 4], type: 'metal' },
    // Far corners cover
    { pos: [-70, 0.6, -60], size: [3, 1.4, 0.7], type: 'concrete' },
    { pos: [70, 0.6, 60], size: [3, 1.4, 0.7], type: 'concrete' },
    { pos: [-65, 0.6, 70], size: [0.7, 1.4, 3], type: 'metal' },
    { pos: [65, 0.6, -70], size: [0.7, 1.4, 3], type: 'metal' },
  ], []);

  // Debris and props - spread across map
  const debris = useMemo(() => [
    { pos: [-12, 0.15, -5], size: [0.5, 0.3, 0.4] },
    { pos: [12, 0.1, 6], size: [0.3, 0.2, 0.3] },
    { pos: [-5, 0.2, 12], size: [0.6, 0.4, 0.5] },
    { pos: [6, 0.15, -12], size: [0.4, 0.3, 0.4] },
    { pos: [-8, 0.1, -12], size: [0.3, 0.2, 0.25] },
    { pos: [20, 0.15, 8], size: [0.5, 0.3, 0.4] },
    { pos: [-20, 0.1, -8], size: [0.4, 0.25, 0.35] },
    // More debris for larger map
    { pos: [-45, 0.15, 30], size: [0.5, 0.3, 0.4] },
    { pos: [45, 0.1, -30], size: [0.4, 0.25, 0.35] },
    { pos: [-30, 0.2, -45], size: [0.6, 0.4, 0.5] },
    { pos: [30, 0.15, 45], size: [0.5, 0.3, 0.4] },
  ], []);

  return (
    <group>
      {/* Ground plane with texture - MUCH larger */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[200, 200]} />
        <primitive object={materials.ground} attach="material" />
      </mesh>

      {/* Grass patches around map - more of them for larger map */}
      {[
        [-45, 0.01, -35], [45, 0.01, 35], [-35, 0.01, 45], [35, 0.01, -45],
        [-50, 0.01, 20], [50, 0.01, -20], [-20, 0.01, 50], [20, 0.01, -50],
        // Outer grass patches
        [-75, 0.01, -50], [75, 0.01, 50], [-50, 0.01, 75], [50, 0.01, -75],
        [-80, 0.01, 20], [80, 0.01, -20], [-20, 0.01, 80], [20, 0.01, -80],
        [-90, 0.01, -70], [90, 0.01, 70], [-70, 0.01, 90], [70, 0.01, -90],
      ].map((pos, i) => (
        <mesh key={`grass-${i}`} rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]} position={pos as [number, number, number]} receiveShadow>
          <planeGeometry args={[12 + Math.random() * 8, 10 + Math.random() * 6]} />
          <primitive object={materials.grass} attach="material" />
        </mesh>
      ))}

      {/* Dirt patches - more for larger map */}
      {[
        [-25, 0.01, 25], [25, 0.01, -25], [-38, 0.01, -8], [38, 0.01, 8],
        // Outer dirt patches
        [-60, 0.01, 45], [60, 0.01, -45], [-45, 0.01, 60], [45, 0.01, -60],
        [-85, 0.01, 30], [85, 0.01, -30], [-30, 0.01, 85], [30, 0.01, -85],
      ].map((pos, i) => (
        <mesh key={`dirt-${i}`} rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]} position={pos as [number, number, number]} receiveShadow>
          <planeGeometry args={[10 + Math.random() * 5, 8 + Math.random() * 4]} />
          <primitive object={materials.dirt} attach="material" />
        </mesh>
      ))}

      {/* Wooden crates scattered around - more for larger map */}
      {[
        [-22, 0.5, 12], [22, 0.5, -12], [-8, 0.35, -22], [15, 0.4, 28],
        // Outer crates
        [-55, 0.5, 35], [55, 0.5, -35], [-35, 0.4, 55], [35, 0.45, -55],
        [-75, 0.5, 15], [75, 0.5, -15], [-15, 0.4, 75], [15, 0.45, -75],
        [-65, 0.5, -50], [65, 0.5, 50], [-50, 0.4, 65], [50, 0.45, -65],
      ].map((pos, i) => (
        <mesh key={`crate-${i}`} position={pos as [number, number, number]} rotation={[0, Math.random() * 0.5, 0]} castShadow>
          <boxGeometry args={[0.8 + Math.random() * 0.4, 0.7 + Math.random() * 0.3, 0.8 + Math.random() * 0.4]} />
          <primitive object={materials.wood} attach="material" />
        </mesh>
      ))}

      {/* SPAWN BUILDING - Player spawns inside this */}
      <group position={[0, 0, 5]}>
        {/* Floor */}
        <mesh position={[0, 0.05, 0]} receiveShadow>
          <boxGeometry args={[10, 0.1, 12]} />
          <primitive object={materials.interior} attach="material" />
        </mesh>
        {/* Back wall */}
        <mesh position={[0, 2, 6]} castShadow>
          <boxGeometry args={[10, 4, 0.3]} />
          <primitive object={materials.concrete} attach="material" />
        </mesh>
        {/* Left wall */}
        <mesh position={[-5, 2, 0]} castShadow>
          <boxGeometry args={[0.3, 4, 12]} />
          <primitive object={materials.concrete} attach="material" />
        </mesh>
        {/* Right wall */}
        <mesh position={[5, 2, 0]} castShadow>
          <boxGeometry args={[0.3, 4, 12]} />
          <primitive object={materials.concrete} attach="material" />
        </mesh>
        {/* Front wall left section */}
        <mesh position={[-3.5, 2, -6]} castShadow>
          <boxGeometry args={[3, 4, 0.3]} />
          <primitive object={materials.concrete} attach="material" />
        </mesh>
        {/* Front wall right section */}
        <mesh position={[3.5, 2, -6]} castShadow>
          <boxGeometry args={[3, 4, 0.3]} />
          <primitive object={materials.concrete} attach="material" />
        </mesh>
        {/* Front wall top (above door) */}
        <mesh position={[0, 3.5, -6]} castShadow>
          <boxGeometry args={[4, 1, 0.3]} />
          <primitive object={materials.concrete} attach="material" />
        </mesh>
        {/* Roof */}
        <mesh position={[0, 4.15, 0]} receiveShadow castShadow>
          <boxGeometry args={[10.5, 0.3, 12.5]} />
          <primitive object={materials.roofTar} attach="material" />
        </mesh>
        {/* Window on left */}
        <mesh position={[-5.16, 2, 2]}>
          <planeGeometry args={[0.01, 1.5]} />
          <primitive object={materials.window} attach="material" />
        </mesh>
        {/* Ammo crates inside */}
        <mesh position={[-3, 0.4, 4]} castShadow>
          <boxGeometry args={[1, 0.8, 0.6]} />
          <meshStandardMaterial color={0x3a4a3a} roughness={0.9} />
        </mesh>
        <mesh position={[-3.5, 0.25, 3]} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.4]} />
          <meshStandardMaterial color={0x4a4a3a} roughness={0.9} />
        </mesh>
        {/* Spawn point light */}
        <pointLight position={[0, 3, 0]} color={0xffffdd} intensity={8} distance={12} />
      </group>

      {/* Road markings - larger */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[7, 120]} />
        <meshStandardMaterial color={0x222222} roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, 0.01, 0]}>
        <planeGeometry args={[7, 120]} />
        <meshStandardMaterial color={0x222222} roughness={0.95} />
      </mesh>
      
      {/* Road center lines */}
      {[-50, -40, -30, -20, 20, 30, 40, 50].map((z, i) => (
        <mesh key={`line-z-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, z]}>
          <planeGeometry args={[0.15, 5]} />
          <primitive object={materials.yellow} attach="material" />
        </mesh>
      ))}
      {[-50, -40, -30, -20, 20, 30, 40, 50].map((x, i) => (
        <mesh key={`line-x-${i}`} rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[x, 0.02, 0]}>
          <planeGeometry args={[0.15, 5]} />
          <primitive object={materials.yellow} attach="material" />
        </mesh>
      ))}

      {/* Sidewalks - larger area */}
      {[
        [-6, 0.08, -35], [6, 0.08, -35], [-6, 0.08, 35], [6, 0.08, 35], 
        [-35, 0.08, -6], [-35, 0.08, 6], [35, 0.08, -6], [35, 0.08, 6]
      ].map((pos, i) => (
        <mesh key={`sidewalk-${i}`} position={pos as [number, number, number]} receiveShadow>
          <boxGeometry args={[5, 0.16, 50]} />
          <primitive object={materials.concrete} attach="material" />
        </mesh>
      ))}

      {/* Buildings */}
      {buildings.map((building, index) => (
        <group key={index} position={building.pos as [number, number, number]}>
          {/* Main structure */}
          <mesh 
            position={[0, building.size[1] / 2, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={building.size as [number, number, number]} />
            <primitive object={building.type === 'brick' ? materials.brick : materials.concrete} attach="material" />
          </mesh>
          
          {/* Windows */}
          {building.windows && [...Array(Math.floor(building.size[1] / 3.5))].map((_, floor) => (
            [...Array(Math.floor(building.size[0] / 2.8))].map((_, win) => (
              <group key={`${floor}-${win}`}>
                {/* Front window */}
                <mesh
                  position={[
                    -building.size[0] / 2 + 1.5 + win * 2.8,
                    2.5 + floor * 3.5,
                    building.size[2] / 2 + 0.01
                  ]}
                >
                  <planeGeometry args={[1.4, 2]} />
                  <primitive object={Math.random() > 0.3 ? materials.windowDark : materials.window} attach="material" />
                </mesh>
                {/* Window frame */}
                <mesh
                  position={[
                    -building.size[0] / 2 + 1.5 + win * 2.8,
                    2.5 + floor * 3.5,
                    building.size[2] / 2 + 0.02
                  ]}
                >
                  <boxGeometry args={[1.6, 2.2, 0.05]} />
                  <primitive object={materials.metalDark} attach="material" />
                </mesh>
              </group>
            ))
          ))}

          {/* Window sills */}
          {building.windows && [...Array(Math.floor(building.size[1] / 3.5))].map((_, floor) => (
            [...Array(Math.floor(building.size[0] / 2.8))].map((_, win) => (
              <mesh
                key={`sill-${floor}-${win}`}
                position={[
                  -building.size[0] / 2 + 1.5 + win * 2.8,
                  1.4 + floor * 3.5,
                  building.size[2] / 2 + 0.08
                ]}
                castShadow
              >
                <boxGeometry args={[1.6, 0.1, 0.15]} />
                <primitive object={materials.concrete} attach="material" />
              </mesh>
            ))
          ))}

          {/* Roof */}
          <mesh position={[0, building.size[1] + 0.15, 0]} receiveShadow>
            <boxGeometry args={[building.size[0] + 0.3, 0.3, building.size[2] + 0.3]} />
            <primitive object={materials.roofTar} attach="material" />
          </mesh>

          {/* Roof edge/parapet */}
          <mesh position={[0, building.size[1] + 0.5, building.size[2] / 2 + 0.15]} castShadow>
            <boxGeometry args={[building.size[0] + 0.4, 0.6, 0.2]} />
            <primitive object={materials.concrete} attach="material" />
          </mesh>

          {/* AC units on roof */}
          {index % 2 === 0 && (
            <mesh position={[building.size[0] / 4, building.size[1] + 0.6, 0]} castShadow>
              <boxGeometry args={[1.5, 0.8, 1.2]} />
              <primitive object={materials.metal} attach="material" />
            </mesh>
          )}

          {/* Fire escape (some buildings) */}
          {index % 3 === 0 && (
            <group position={[-building.size[0] / 2 - 0.3, 0, 0]}>
              {[...Array(Math.floor(building.size[1] / 3))].map((_, i) => (
                <group key={`escape-${i}`} position={[0, 2 + i * 3, 0]}>
                  <mesh castShadow>
                    <boxGeometry args={[1.2, 0.1, 2]} />
                    <primitive object={materials.rust} attach="material" />
                  </mesh>
                  <mesh position={[0, 0.4, 1]}>
                    <boxGeometry args={[0.05, 0.8, 0.05]} />
                    <primitive object={materials.rust} attach="material" />
                  </mesh>
                  <mesh position={[0, 0.4, -1]}>
                    <boxGeometry args={[0.05, 0.8, 0.05]} />
                    <primitive object={materials.rust} attach="material" />
                  </mesh>
                </group>
              ))}
            </group>
          )}
        </group>
      ))}

      {/* Cover objects */}
      {covers.map((cover, index) => (
        <group key={`cover-${index}`}>
          <mesh
            position={cover.pos as [number, number, number]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={cover.size as [number, number, number]} />
            <primitive object={cover.type === 'metal' ? materials.metal : materials.concrete} attach="material" />
          </mesh>
          {/* Sandbags around some covers */}
          {index % 3 === 0 && (
            <group position={[cover.pos[0], 0.15, cover.pos[2] + cover.size[2] / 2 + 0.25]}>
              {[...Array(3)].map((_, i) => (
                <mesh key={i} position={[(i - 1) * 0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                  <capsuleGeometry args={[0.12, 0.3, 4, 8]} />
                  <meshStandardMaterial color={0x5a5a4a} roughness={0.95} />
                </mesh>
              ))}
            </group>
          )}
        </group>
      ))}

      {/* Debris */}
      {debris.map((item, index) => (
        <mesh
          key={`debris-${index}`}
          position={item.pos as [number, number, number]}
          rotation={[Math.random() * 0.3, Math.random() * Math.PI, Math.random() * 0.3]}
          castShadow
        >
          <boxGeometry args={item.size as [number, number, number]} />
          <primitive object={materials.concrete} attach="material" />
        </mesh>
      ))}

      {/* Barriers / Jersey walls */}
      {[[-8, 0.5, -13], [8, 0.5, 13]].map((pos, i) => (
        <mesh key={`barrier-${i}`} position={pos as [number, number, number]} rotation={[0, i * Math.PI / 3, 0]} castShadow>
          <boxGeometry args={[0.5, 1, 3]} />
          <primitive object={materials.concrete} attach="material" />
        </mesh>
      ))}

      {/* Dumpsters */}
      {[[-18, 0.75, 8], [18, 0.75, -8]].map((pos, i) => (
        <group key={`dumpster-${i}`} position={pos as [number, number, number]}>
          <mesh castShadow>
            <boxGeometry args={[2, 1.5, 1.2]} />
            <meshStandardMaterial color={0x2a4a2a} roughness={0.8} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0.85, 0]}>
            <boxGeometry args={[2.1, 0.1, 1.3]} />
            <primitive object={materials.metalDark} attach="material" />
          </mesh>
        </group>
      ))}

      {/* Street lamps - more across larger map */}
      {[
        [-20, 0, 0], [20, 0, 0], [0, 0, -20], [0, 0, 20], 
        [-20, 0, 20], [20, 0, -20], [-20, 0, -20], [20, 0, 20],
        [-35, 0, 0], [35, 0, 0], [0, 0, -35], [0, 0, 35]
      ].map((pos, i) => (
        <group key={`lamp-${i}`} position={pos as [number, number, number]}>
          {/* Pole */}
          <mesh position={[0, 3.5, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 7, 8]} />
            <primitive object={materials.metalDark} attach="material" />
          </mesh>
          {/* Arm */}
          <mesh position={[0.6, 6.8, 0]}>
            <boxGeometry args={[1.2, 0.08, 0.08]} />
            <primitive object={materials.metalDark} attach="material" />
          </mesh>
          {/* Light housing */}
          <mesh position={[1.1, 6.6, 0]}>
            <boxGeometry args={[0.4, 0.3, 0.25]} />
            <primitive object={materials.metalDark} attach="material" />
          </mesh>
          {/* Light */}
          <pointLight 
            position={[1.1, 6.3, 0]} 
            color={0xffcc88} 
            intensity={15} 
            distance={20}
            castShadow
            shadow-mapSize-width={256}
            shadow-mapSize-height={256}
          />
          {/* Light glow */}
          <mesh position={[1.1, 6.45, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color={0xffffcc} />
          </mesh>
        </group>
      ))}

      {/* Utility poles with wires */}
      {[[-40, 0, -40], [40, 0, 40], [-40, 0, 40], [40, 0, -40]].map((pos, i) => (
        <group key={`utility-${i}`} position={pos as [number, number, number]}>
          <mesh position={[0, 5, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.15, 10, 6]} />
            <meshStandardMaterial color={0x4a3a2a} roughness={0.9} />
          </mesh>
          <mesh position={[0, 9.5, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 3, 4]} />
            <meshStandardMaterial color={0x3a3a3a} roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Manhole covers */}
      {[[8, 0.02, 8], [-8, 0.02, -8], [12, 0.02, -12], [-15, 0.02, 15]].map((pos, i) => (
        <mesh key={`manhole-${i}`} position={pos as [number, number, number]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.4, 12]} />
          <primitive object={materials.rust} attach="material" />
        </mesh>
      ))}

      {/* Fog/atmosphere - extended for larger map */}
      <fog attach="fog" args={[0x1a1a1f, 30, 90]} />
    </group>
  );
};

export default Map;
