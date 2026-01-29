import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface WeaponProps {
  isScoped: boolean;
  isShooting: boolean;
  isMoving: boolean;
}

const Weapon = ({ isScoped, isShooting, isMoving }: WeaponProps) => {
  const weaponRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  // Animation state refs
  const recoilRef = useRef(0);
  const bobTimeRef = useRef(0);
  const swayRef = useRef({ x: 0, y: 0 });
  const breathRef = useRef(0);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Weapon materials with better detail
  const materials = useMemo(() => ({
    metal: new THREE.MeshStandardMaterial({ 
      color: 0x2a2a2a, 
      metalness: 0.85, 
      roughness: 0.25,
    }),
    metalDark: new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a, 
      metalness: 0.9, 
      roughness: 0.2,
    }),
    grip: new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a, 
      metalness: 0.1, 
      roughness: 0.9,
    }),
    gripTexture: new THREE.MeshStandardMaterial({ 
      color: 0x252525, 
      metalness: 0.05, 
      roughness: 0.95,
    }),
    scope: new THREE.MeshStandardMaterial({ 
      color: 0x0a0a0a, 
      metalness: 0.95, 
      roughness: 0.05,
    }),
    lens: new THREE.MeshStandardMaterial({ 
      color: 0x4499ff, 
      metalness: 0.1, 
      roughness: 0.05,
      transparent: true,
      opacity: 0.4,
      emissive: 0x2266aa,
      emissiveIntensity: 0.1,
    }),
    brass: new THREE.MeshStandardMaterial({ 
      color: 0xb5a642, 
      metalness: 0.9, 
      roughness: 0.3,
    }),
  }), []);

  useFrame((state, delta) => {
    if (!weaponRef.current) return;

    const time = state.clock.elapsedTime;
    
    // Smooth recoil with recovery
    if (isShooting) {
      recoilRef.current = Math.min(recoilRef.current + delta * 8, 0.08);
    } else {
      recoilRef.current *= 0.92; // Smooth decay
    }

    // Walking bob animation
    if (isMoving && !isScoped) {
      bobTimeRef.current += delta * 8;
    } else {
      bobTimeRef.current += delta * 0.5; // Subtle idle bob
    }

    const bobAmount = isMoving ? (isScoped ? 0.002 : 0.008) : 0.002;
    const bobX = Math.sin(bobTimeRef.current) * bobAmount;
    const bobY = Math.abs(Math.cos(bobTimeRef.current * 2)) * bobAmount * 0.5;

    // Breathing sway (subtle)
    breathRef.current += delta * 1.5;
    const breathX = Math.sin(breathRef.current) * 0.001;
    const breathY = Math.cos(breathRef.current * 0.7) * 0.0005;

    // Mouse sway - weapon lags behind camera movement
    const currentRot = camera.rotation.clone();
    const mouseVelX = (currentRot.y - lastMousePos.current.x) * 0.5;
    const mouseVelY = (currentRot.x - lastMousePos.current.y) * 0.3;
    lastMousePos.current = { x: currentRot.y, y: currentRot.x };

    // Smooth sway interpolation
    swayRef.current.x += (mouseVelX - swayRef.current.x) * delta * 5;
    swayRef.current.y += (mouseVelY - swayRef.current.y) * delta * 5;

    // Clamp sway
    swayRef.current.x = Math.max(-0.03, Math.min(0.03, swayRef.current.x));
    swayRef.current.y = Math.max(-0.02, Math.min(0.02, swayRef.current.y));

    // Target positions for ADS vs hip fire
    const hipPos = { x: 0.32, y: -0.32, z: -0.45 };
    const adsPos = { x: 0, y: -0.12, z: -0.25 };
    
    const targetPos = isScoped ? adsPos : hipPos;
    const lerpSpeed = delta * 6; // Slower, smoother transition

    // Apply all animations
    weaponRef.current.position.x += (targetPos.x + bobX + breathX + swayRef.current.x - weaponRef.current.position.x) * lerpSpeed;
    weaponRef.current.position.y += (targetPos.y + bobY + breathY + swayRef.current.y - weaponRef.current.position.y) * lerpSpeed;
    weaponRef.current.position.z += (targetPos.z - recoilRef.current - weaponRef.current.position.z) * lerpSpeed;

    // Weapon tilt based on movement sway
    const targetRotX = swayRef.current.y * 0.5;
    const targetRotY = -swayRef.current.x * 0.8;
    const targetRotZ = swayRef.current.x * 0.3;

    weaponRef.current.rotation.x += (targetRotX - weaponRef.current.rotation.x) * lerpSpeed;
    weaponRef.current.rotation.y += (targetRotY - weaponRef.current.rotation.y) * lerpSpeed;
    weaponRef.current.rotation.z += (targetRotZ - weaponRef.current.rotation.z) * lerpSpeed;

    // Scale for ADS zoom effect
    const targetScale = isScoped ? 0.6 : 1;
    const currentScale = weaponRef.current.scale.x;
    weaponRef.current.scale.setScalar(currentScale + (targetScale - currentScale) * lerpSpeed);
  });

  return (
    <group ref={weaponRef} position={[0.32, -0.32, -0.45]}>
      {/* Main receiver */}
      <mesh material={materials.metal} position={[0, 0, 0]}>
        <boxGeometry args={[0.055, 0.075, 0.38]} />
      </mesh>
      
      {/* Upper receiver detail */}
      <mesh material={materials.metalDark} position={[0, 0.04, -0.05]}>
        <boxGeometry args={[0.05, 0.015, 0.25]} />
      </mesh>

      {/* Barrel */}
      <mesh material={materials.metal} position={[0, 0.01, -0.38]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.015, 0.4, 12]} />
      </mesh>

      {/* Barrel shroud / handguard */}
      <mesh material={materials.metalDark} position={[0, 0.01, -0.22]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.022, 0.025, 0.18, 8]} />
      </mesh>

      {/* Handguard vents */}
      {[...Array(4)].map((_, i) => (
        <mesh key={`vent-${i}`} material={materials.metal} position={[0.018, 0.01, -0.15 - i * 0.035]}>
          <boxGeometry args={[0.008, 0.015, 0.02]} />
        </mesh>
      ))}

      {/* Muzzle brake */}
      <mesh material={materials.metalDark} position={[0, 0.01, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.015, 0.06, 8]} />
      </mesh>
      
      {/* Muzzle brake cuts */}
      {[...Array(3)].map((_, i) => (
        <mesh key={`muzzle-${i}`} material={materials.metal} position={[0, 0.01 + 0.012, -0.58 - i * 0.015]}>
          <boxGeometry args={[0.04, 0.004, 0.008]} />
        </mesh>
      ))}

      {/* Stock - collapsible style */}
      <mesh material={materials.grip} position={[0, -0.01, 0.22]}>
        <boxGeometry args={[0.035, 0.055, 0.15]} />
      </mesh>
      <mesh material={materials.gripTexture} position={[0, -0.015, 0.32]}>
        <boxGeometry args={[0.03, 0.065, 0.08]} />
      </mesh>
      {/* Stock buffer tube */}
      <mesh material={materials.metal} position={[0, 0.01, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.1, 8]} />
      </mesh>

      {/* Pistol grip - ergonomic */}
      <mesh material={materials.gripTexture} position={[0, -0.085, 0.06]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.028, 0.1, 0.038]} />
      </mesh>
      {/* Grip texture lines */}
      {[...Array(5)].map((_, i) => (
        <mesh key={`grip-line-${i}`} material={materials.grip} position={[0.016, -0.06 - i * 0.015, 0.06]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.003, 0.008, 0.04]} />
        </mesh>
      ))}

      {/* Magazine - curved */}
      <mesh material={materials.metalDark} position={[0, -0.12, -0.04]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.022, 0.14, 0.055]} />
      </mesh>
      {/* Magazine base plate */}
      <mesh material={materials.brass} position={[0, -0.19, -0.035]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.024, 0.01, 0.058]} />
      </mesh>

      {/* Scope rail / picatinny */}
      <mesh material={materials.metal} position={[0, 0.055, -0.08]}>
        <boxGeometry args={[0.025, 0.012, 0.2]} />
      </mesh>
      {/* Rail notches */}
      {[...Array(8)].map((_, i) => (
        <mesh key={`rail-${i}`} material={materials.metalDark} position={[0, 0.063, -0.16 + i * 0.025]}>
          <boxGeometry args={[0.027, 0.005, 0.008]} />
        </mesh>
      ))}

      {/* Scope mount rings */}
      <mesh material={materials.metal} position={[0, 0.075, -0.12]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.022, 0.006, 8, 16]} />
      </mesh>
      <mesh material={materials.metal} position={[0, 0.075, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.022, 0.006, 8, 16]} />
      </mesh>

      {/* Scope body */}
      <mesh material={materials.scope} position={[0, 0.095, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.22, 16]} />
      </mesh>
      
      {/* Scope objective (front) bell */}
      <mesh material={materials.scope} position={[0, 0.095, -0.18]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.028, 0.02, 0.04, 16]} />
      </mesh>
      
      {/* Scope front lens */}
      <mesh material={materials.lens} position={[0, 0.095, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.026, 0.026, 0.005, 16]} />
      </mesh>

      {/* Scope eyepiece */}
      <mesh material={materials.scope} position={[0, 0.095, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.022, 0.04, 16]} />
      </mesh>
      
      {/* Scope rear lens */}
      <mesh material={materials.lens} position={[0, 0.095, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 0.005, 16]} />
      </mesh>

      {/* Scope turrets */}
      <mesh material={materials.metalDark} position={[0, 0.12, -0.05]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.02, 8]} />
      </mesh>
      <mesh material={materials.metalDark} position={[0.025, 0.095, -0.05]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.008, 0.008, 0.015, 8]} />
      </mesh>

      {/* Foregrip - angled */}
      <mesh material={materials.gripTexture} position={[0, -0.055, -0.2]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.022, 0.055, 0.035]} />
      </mesh>

      {/* Trigger guard */}
      <mesh material={materials.metal} position={[0, -0.05, -0.01]}>
        <torusGeometry args={[0.018, 0.003, 4, 12, Math.PI]} />
      </mesh>

      {/* Charging handle */}
      <mesh material={materials.metal} position={[0, 0.035, 0.12]}>
        <boxGeometry args={[0.04, 0.008, 0.02]} />
      </mesh>

      {/* Ejection port */}
      <mesh material={materials.metalDark} position={[0.028, 0.02, -0.02]}>
        <boxGeometry args={[0.005, 0.025, 0.04]} />
      </mesh>

      {/* Forward assist */}
      <mesh material={materials.metal} position={[0.028, 0.01, 0.04]}>
        <cylinderGeometry args={[0.006, 0.006, 0.01, 6]} />
      </mesh>

      {/* Bolt release */}
      <mesh material={materials.metal} position={[-0.028, -0.01, 0.02]}>
        <boxGeometry args={[0.005, 0.02, 0.015]} />
      </mesh>
    </group>
  );
};

export default Weapon;
