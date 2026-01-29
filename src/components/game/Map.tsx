import { useMemo } from 'react';
import * as THREE from 'three';

const Map = () => {
  // Materials for different surfaces
  const materials = useMemo(() => ({
    ground: new THREE.MeshStandardMaterial({ 
      color: 0x3a3a3a, 
      roughness: 0.9,
      metalness: 0.1
    }),
    concrete: new THREE.MeshStandardMaterial({ 
      color: 0x555555, 
      roughness: 0.8,
      metalness: 0.2
    }),
    brick: new THREE.MeshStandardMaterial({ 
      color: 0x8B4513, 
      roughness: 0.9,
      metalness: 0.1
    }),
    metal: new THREE.MeshStandardMaterial({ 
      color: 0x4a4a4a, 
      roughness: 0.4,
      metalness: 0.8
    }),
    window: new THREE.MeshStandardMaterial({ 
      color: 0x87CEEB, 
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.5
    }),
  }), []);

  // Building configurations
  const buildings = useMemo(() => [
    { pos: [-15, 0, -15], size: [8, 12, 8] },
    { pos: [15, 0, -15], size: [10, 8, 6] },
    { pos: [-15, 0, 15], size: [6, 15, 10] },
    { pos: [15, 0, 15], size: [8, 10, 8] },
    { pos: [0, 0, -25], size: [20, 6, 4] },
    { pos: [-25, 0, 0], size: [4, 8, 15] },
    { pos: [25, 0, 0], size: [4, 10, 12] },
    { pos: [0, 0, 25], size: [15, 5, 4] },
  ], []);

  // Cover objects
  const covers = useMemo(() => [
    { pos: [-5, 0.5, -5], size: [2, 1, 0.5] },
    { pos: [5, 0.5, -5], size: [2, 1, 0.5] },
    { pos: [-5, 0.5, 5], size: [0.5, 1, 2] },
    { pos: [5, 0.5, 5], size: [0.5, 1, 2] },
    { pos: [0, 0.75, 0], size: [3, 1.5, 3] },
    { pos: [-10, 0.5, 0], size: [1, 1, 3] },
    { pos: [10, 0.5, 0], size: [1, 1, 3] },
    { pos: [0, 0.5, -10], size: [3, 1, 1] },
    { pos: [0, 0.5, 10], size: [3, 1, 1] },
  ], []);

  return (
    <group>
      {/* Ground plane */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[80, 80]} />
        <primitive object={materials.ground} attach="material" />
      </mesh>

      {/* Grid lines on ground */}
      <gridHelper args={[80, 40, 0x222222, 0x222222]} position={[0, 0.01, 0]} />

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
            <primitive object={index % 2 === 0 ? materials.concrete : materials.brick} attach="material" />
          </mesh>
          
          {/* Windows */}
          {[...Array(Math.floor(building.size[1] / 3))].map((_, floor) => (
            [...Array(Math.floor(building.size[0] / 2.5))].map((_, win) => (
              <mesh
                key={`${floor}-${win}`}
                position={[
                  -building.size[0] / 2 + 1.5 + win * 2.5,
                  2 + floor * 3,
                  building.size[2] / 2 + 0.01
                ]}
              >
                <planeGeometry args={[1.2, 1.8]} />
                <primitive object={materials.window} attach="material" />
              </mesh>
            ))
          ))}

          {/* Roof edge */}
          <mesh position={[0, building.size[1] + 0.1, 0]}>
            <boxGeometry args={[building.size[0] + 0.2, 0.2, building.size[2] + 0.2]} />
            <primitive object={materials.metal} attach="material" />
          </mesh>
        </group>
      ))}

      {/* Cover objects */}
      {covers.map((cover, index) => (
        <mesh
          key={`cover-${index}`}
          position={cover.pos as [number, number, number]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={cover.size as [number, number, number]} />
          <primitive object={materials.metal} attach="material" />
        </mesh>
      ))}

      {/* Barriers / walls */}
      <mesh position={[-8, 1, -12]} castShadow>
        <boxGeometry args={[0.3, 2, 6]} />
        <primitive object={materials.concrete} attach="material" />
      </mesh>
      <mesh position={[8, 1, 12]} castShadow>
        <boxGeometry args={[0.3, 2, 6]} />
        <primitive object={materials.concrete} attach="material" />
      </mesh>

      {/* Street lamps */}
      {[[-12, 0, 0], [12, 0, 0], [0, 0, -12], [0, 0, 12]].map((pos, i) => (
        <group key={`lamp-${i}`} position={pos as [number, number, number]}>
          <mesh position={[0, 3, 0]}>
            <cylinderGeometry args={[0.1, 0.15, 6, 8]} />
            <primitive object={materials.metal} attach="material" />
          </mesh>
          <mesh position={[0.5, 5.8, 0]}>
            <boxGeometry args={[1, 0.1, 0.5]} />
            <primitive object={materials.metal} attach="material" />
          </mesh>
          <pointLight 
            position={[0.5, 5.5, 0]} 
            color={0xffaa55} 
            intensity={15} 
            distance={15}
            castShadow
          />
        </group>
      ))}

      {/* Ambient atmosphere */}
      <fog attach="fog" args={[0x1a1a1f, 20, 60]} />
    </group>
  );
};

export default Map;
