import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WeaponProps {
  isScoped: boolean;
  isShooting: boolean;
}

const Weapon = ({ isScoped, isShooting }: WeaponProps) => {
  const weaponRef = useRef<THREE.Group>(null);
  const recoilRef = useRef(0);

  // Weapon materials
  const materials = useMemo(() => ({
    metal: new THREE.MeshStandardMaterial({ 
      color: 0x2a2a2a, 
      metalness: 0.8, 
      roughness: 0.3 
    }),
    grip: new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a, 
      metalness: 0.2, 
      roughness: 0.8 
    }),
    scope: new THREE.MeshStandardMaterial({ 
      color: 0x111111, 
      metalness: 0.9, 
      roughness: 0.1 
    }),
    lens: new THREE.MeshStandardMaterial({ 
      color: 0x3399ff, 
      metalness: 0.1, 
      roughness: 0.1,
      transparent: true,
      opacity: 0.3
    }),
  }), []);

  useFrame((_, delta) => {
    if (!weaponRef.current) return;

    // Handle recoil
    if (isShooting) {
      recoilRef.current = Math.min(recoilRef.current + delta * 20, 0.15);
    } else {
      recoilRef.current = Math.max(recoilRef.current - delta * 10, 0);
    }

    // Weapon sway and position
    const targetX = isScoped ? 0 : 0.35;
    const targetY = isScoped ? -0.15 : -0.35;
    const targetZ = isScoped ? -0.3 : -0.5;

    weaponRef.current.position.x += (targetX - weaponRef.current.position.x) * delta * 10;
    weaponRef.current.position.y += (targetY - weaponRef.current.position.y) * delta * 10;
    weaponRef.current.position.z += (targetZ - weaponRef.current.position.z + recoilRef.current) * delta * 10;

    // Scale down when scoped
    const targetScale = isScoped ? 0.5 : 1;
    weaponRef.current.scale.setScalar(
      weaponRef.current.scale.x + (targetScale - weaponRef.current.scale.x) * delta * 10
    );
  });

  return (
    <group ref={weaponRef} position={[0.35, -0.35, -0.5]}>
      {/* Main body / receiver */}
      <mesh material={materials.metal} position={[0, 0, 0]}>
        <boxGeometry args={[0.06, 0.08, 0.4]} />
      </mesh>

      {/* Barrel */}
      <mesh material={materials.metal} position={[0, 0.01, -0.35]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.018, 0.35, 8]} />
      </mesh>

      {/* Muzzle brake */}
      <mesh material={materials.metal} position={[0, 0.01, -0.55]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.022, 0.02, 0.06, 8]} />
      </mesh>

      {/* Stock */}
      <mesh material={materials.grip} position={[0, -0.02, 0.25]}>
        <boxGeometry args={[0.04, 0.06, 0.2]} />
      </mesh>

      {/* Pistol grip */}
      <mesh material={materials.grip} position={[0, -0.08, 0.08]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.03, 0.1, 0.04]} />
      </mesh>

      {/* Magazine */}
      <mesh material={materials.metal} position={[0, -0.1, -0.05]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.025, 0.12, 0.06]} />
      </mesh>

      {/* Scope mount */}
      <mesh material={materials.metal} position={[0, 0.06, -0.05]}>
        <boxGeometry args={[0.03, 0.02, 0.15]} />
      </mesh>

      {/* Scope body */}
      <mesh material={materials.scope} position={[0, 0.1, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.2, 12]} />
      </mesh>

      {/* Scope front lens */}
      <mesh material={materials.lens} position={[0, 0.1, -0.16]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.023, 0.023, 0.01, 12]} />
      </mesh>

      {/* Scope rear lens */}
      <mesh material={materials.lens} position={[0, 0.1, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.01, 12]} />
      </mesh>

      {/* Foregrip */}
      <mesh material={materials.grip} position={[0, -0.06, -0.18]}>
        <boxGeometry args={[0.025, 0.06, 0.04]} />
      </mesh>

      {/* Rail system on top */}
      {[...Array(6)].map((_, i) => (
        <mesh 
          key={i} 
          material={materials.metal} 
          position={[0, 0.045, -0.15 + i * 0.025]}
        >
          <boxGeometry args={[0.055, 0.005, 0.01]} />
        </mesh>
      ))}
    </group>
  );
};

export default Weapon;
