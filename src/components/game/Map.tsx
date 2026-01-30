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

const Map = () => {
  // Create procedural textures
  const textures = useMemo(() => ({
    asphalt: createAsphaltTexture(),
    concrete: createConcreteTexture(),
    brick: createBrickTexture(),
    metal: createMetalTexture(),
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
      color: 0x3a3a38,
      roughness: 0.95,
      metalness: 0.05,
    }),
  }), [textures]);

  // Building configurations - larger map with more buildings
  const buildings = useMemo(() => [
    // Corner buildings
    { pos: [-30, 0, -30], size: [10, 16, 10], type: 'brick', windows: true },
    { pos: [30, 0, -30], size: [12, 12, 8], type: 'concrete', windows: true },
    { pos: [-30, 0, 30], size: [8, 20, 12], type: 'brick', windows: true },
    { pos: [30, 0, 30], size: [10, 14, 10], type: 'concrete', windows: true },
    // Edge buildings
    { pos: [0, 0, -45], size: [28, 8, 6], type: 'concrete', windows: true },
    { pos: [-45, 0, 0], size: [6, 12, 22], type: 'brick', windows: true },
    { pos: [45, 0, 0], size: [6, 14, 18], type: 'concrete', windows: true },
    { pos: [0, 0, 45], size: [24, 7, 6], type: 'brick', windows: true },
    // Mid buildings
    { pos: [-20, 0, -15], size: [8, 10, 8], type: 'brick', windows: true },
    { pos: [20, 0, -15], size: [10, 8, 6], type: 'concrete', windows: true },
    { pos: [-20, 0, 18], size: [6, 14, 10], type: 'concrete', windows: true },
    { pos: [20, 0, 18], size: [8, 10, 8], type: 'brick', windows: true },
    // Additional buildings for variety
    { pos: [-42, 0, -25], size: [6, 10, 12], type: 'brick', windows: true },
    { pos: [42, 0, 25], size: [6, 12, 10], type: 'concrete', windows: true },
    { pos: [-25, 0, -42], size: [10, 8, 6], type: 'concrete', windows: true },
    { pos: [25, 0, 42], size: [12, 9, 6], type: 'brick', windows: true },
  ], []);

  // Cover objects - spread across larger map
  const covers = useMemo(() => [
    { pos: [-10, 0.6, -10], size: [2.5, 1.2, 0.6], type: 'concrete' },
    { pos: [10, 0.6, -10], size: [2.5, 1.2, 0.6], type: 'concrete' },
    { pos: [-10, 0.6, 10], size: [0.6, 1.2, 2.5], type: 'metal' },
    { pos: [10, 0.6, 10], size: [0.6, 1.2, 2.5], type: 'metal' },
    { pos: [-18, 0.6, 0], size: [1.2, 1.2, 4], type: 'metal' },
    { pos: [18, 0.6, 0], size: [1.2, 1.2, 4], type: 'metal' },
    { pos: [0, 0.6, -18], size: [4, 1.2, 1.2], type: 'concrete' },
    { pos: [0, 0.6, 18], size: [4, 1.2, 1.2], type: 'concrete' },
    // More cover spread out
    { pos: [-30, 0.6, 10], size: [3, 1.4, 0.6], type: 'concrete' },
    { pos: [30, 0.6, -10], size: [3, 1.4, 0.6], type: 'concrete' },
    { pos: [-15, 0.6, 30], size: [0.6, 1.2, 3], type: 'metal' },
    { pos: [15, 0.6, -30], size: [0.6, 1.2, 3], type: 'metal' },
  ], []);

  // Debris and props
  const debris = useMemo(() => [
    { pos: [-12, 0.15, -5], size: [0.5, 0.3, 0.4] },
    { pos: [12, 0.1, 6], size: [0.3, 0.2, 0.3] },
    { pos: [-5, 0.2, 12], size: [0.6, 0.4, 0.5] },
    { pos: [6, 0.15, -12], size: [0.4, 0.3, 0.4] },
    { pos: [-8, 0.1, -12], size: [0.3, 0.2, 0.25] },
    { pos: [20, 0.15, 8], size: [0.5, 0.3, 0.4] },
    { pos: [-20, 0.1, -8], size: [0.4, 0.25, 0.35] },
  ], []);

  return (
    <group>
      {/* Ground plane with texture - larger */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[120, 120]} />
        <primitive object={materials.ground} attach="material" />
      </mesh>

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
