import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BotProps {
  position: [number, number, number];
  onHit: () => void;
  onShootPlayer: (damage: number) => void;
  isActive: boolean;
  playerPosition: THREE.Vector3;
}

// Camo pattern texture generator
const createCamoTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  
  // Base color
  ctx.fillStyle = '#3a4a3a';
  ctx.fillRect(0, 0, 64, 64);
  
  // Camo blobs
  const colors = ['#2a3a2a', '#4a5a4a', '#3a3a2a', '#2a2a2a'];
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.beginPath();
    ctx.ellipse(
      Math.random() * 64, 
      Math.random() * 64, 
      5 + Math.random() * 15, 
      3 + Math.random() * 10, 
      Math.random() * Math.PI, 
      0, 
      Math.PI * 2
    );
    ctx.fill();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

const createFabricTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(0, 0, 32, 32);
  
  // Fabric weave pattern
  for (let y = 0; y < 32; y += 2) {
    for (let x = 0; x < 32; x += 2) {
      const shade = 35 + Math.random() * 15;
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

const Bot = ({ position, onHit, onShootPlayer, isActive, playerPosition }: BotProps) => {
  const botRef = useRef<THREE.Group>(null);
  const [health, setHealth] = useState(100);
  const [isDead, setIsDead] = useState(false);
  const [isAiming, setIsAiming] = useState(false);
  const isAimingRef = useRef(false);
  const targetPosition = useRef(new THREE.Vector3(...position));
  const moveTimer = useRef(0);
  const shootTimer = useRef(0);
  const muzzleFlashRef = useRef<THREE.PointLight>(null);
  const canShoot = useRef(true);

  // Create textures and materials
  const materials = useMemo(() => {
    const camoTex = createCamoTexture();
    const fabricTex = createFabricTexture();
    
    return {
      camo: new THREE.MeshStandardMaterial({ 
        map: camoTex,
        roughness: 0.85,
        metalness: 0.1,
      }),
      vest: new THREE.MeshStandardMaterial({ 
        map: fabricTex,
        color: 0x2a2a2a,
        roughness: 0.9,
        metalness: 0.2,
      }),
      helmet: new THREE.MeshStandardMaterial({ 
        color: 0x3a4a3a,
        roughness: 0.7,
        metalness: 0.3,
      }),
      skin: new THREE.MeshStandardMaterial({ 
        color: 0x8a7a6a,
        roughness: 0.9,
        metalness: 0.05,
      }),
      metal: new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a,
        roughness: 0.3,
        metalness: 0.9,
      }),
      boots: new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a,
        roughness: 0.95,
        metalness: 0.1,
      }),
      pouch: new THREE.MeshStandardMaterial({ 
        color: 0x4a4a3a,
        roughness: 0.9,
        metalness: 0.1,
      }),
      goggles: new THREE.MeshStandardMaterial({ 
        color: 0x111111,
        roughness: 0.1,
        metalness: 0.95,
      }),
    };
  }, []);

  // Use refs for death handling to prevent freezing from rapid state updates
  const isDeadRef = useRef(false);
  const deathHandled = useRef(false);

  // Handle death with delayed callback to prevent render cascade
  useEffect(() => {
    if (health <= 0 && !deathHandled.current) {
      deathHandled.current = true;
      isDeadRef.current = true;
      
      // Use setTimeout instead of requestAnimationFrame for better decoupling
      setTimeout(() => {
        setIsDead(true);
        // Additional delay before triggering parent update
        setTimeout(() => {
          onHit();
        }, 50);
      }, 16);
    }
  }, [health, onHit]);

  // Create stable takeDamage function with throttling
  const lastDamageTime = useRef(0);
  const takeDamage = useCallback((damage: number) => {
    if (isDeadRef.current) return;
    
    // Throttle damage to max once per 50ms to prevent rapid re-renders
    const now = Date.now();
    if (now - lastDamageTime.current < 50) return;
    lastDamageTime.current = now;
    
    // Apply damage using functional update
    setHealth((prev) => Math.max(0, prev - damage));
  }, []);

  // Expose hit function for raycasting via userData - only attach to group
  useEffect(() => {
    if (botRef.current) {
      botRef.current.userData.isBot = true;
      botRef.current.userData.takeDamage = takeDamage;
      
      // Attach to all children for raycast hit detection
      botRef.current.traverse((child) => {
        child.userData.isBot = true;
        child.userData.takeDamage = takeDamage;
      });
    }
  }, [takeDamage]);

  const shootAtPlayer = useCallback(() => {
    if (!botRef.current || isDead || !canShoot.current) return;
    
    // Throttle shooting to prevent freezing
    canShoot.current = false;
    setTimeout(() => { canShoot.current = true; }, 800);
    
    const botPos = botRef.current.position;
    const distance = botPos.distanceTo(playerPosition);
    
    // Accuracy decreases with distance - reduced hit chance
    const baseAccuracy = 0.25;
    const distancePenalty = Math.min(distance * 0.015, 0.4);
    const hitChance = baseAccuracy - distancePenalty;
    
    if (Math.random() < hitChance) {
      const damage = Math.floor(3 + Math.random() * 7); // 3-10 damage (reduced)
      onShootPlayer(damage);
    }

    // Muzzle flash
    if (muzzleFlashRef.current) {
      muzzleFlashRef.current.intensity = 15;
      setTimeout(() => {
        if (muzzleFlashRef.current) {
          muzzleFlashRef.current.intensity = 0;
        }
      }, 50);
    }
  }, [isDead, playerPosition, onShootPlayer]);

  useFrame((state, delta) => {
    if (!botRef.current || !isActive || isDead) return;

    const botPos = botRef.current.position;
    const distanceToPlayer = botPos.distanceTo(playerPosition);
    const time = state.clock.elapsedTime;

    // Bot AI states - increased ranges for bigger map
    const inCombatRange = distanceToPlayer < 40;
    const tooClose = distanceToPlayer < 10;
    const optimalRange = distanceToPlayer > 15 && distanceToPlayer < 30;

    // Look at player when in range - use ref to avoid re-renders
    if (inCombatRange) {
      const lookTarget = playerPosition.clone();
      lookTarget.y = botPos.y;
      
      const direction = lookTarget.sub(botPos).normalize();
      const targetRotation = Math.atan2(direction.x, direction.z);
      
      // Smooth rotation
      let rotDiff = targetRotation - botRef.current.rotation.y;
      while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
      while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
      
      botRef.current.rotation.y += rotDiff * delta * 2;
      // Only update state if it changed - prevents excessive re-renders
      if (!isAimingRef.current) {
        isAimingRef.current = true;
        setIsAiming(true);
      }
    } else {
      if (isAimingRef.current) {
        isAimingRef.current = false;
        setIsAiming(false);
      }
    }

    // Movement behavior - slower
    moveTimer.current += delta;
    
    if (tooClose) {
      // Back away from player
      const awayDir = botPos.clone().sub(playerPosition).normalize();
      targetPosition.current.copy(botPos).add(awayDir.multiplyScalar(6));
    } else if (!optimalRange && inCombatRange) {
      // Move towards optimal range
      if (moveTimer.current > 3) {
        moveTimer.current = 0;
        const toPlayer = playerPosition.clone().sub(botPos).normalize();
        const strafeDir = new THREE.Vector3(-toPlayer.z, 0, toPlayer.x);
        const strafe = (Math.random() - 0.5) * 10;
        targetPosition.current.copy(playerPosition).add(toPlayer.multiplyScalar(-20)).add(strafeDir.multiplyScalar(strafe));
      }
    } else if (!inCombatRange) {
      // Patrol when player not in range
      if (moveTimer.current > 6) {
        moveTimer.current = 0;
        targetPosition.current.set(
          position[0] + (Math.random() - 0.5) * 20,
          position[1],
          position[2] + (Math.random() - 0.5) * 20
        );
      }
    }

    // Smooth movement - slower
    const moveDir = targetPosition.current.clone().sub(botPos);
    const moveSpeed = inCombatRange ? 1.2 : 0.8;
    
    if (moveDir.length() > 0.5) {
      moveDir.normalize();
      botRef.current.position.add(moveDir.multiplyScalar(delta * moveSpeed));
    }

    // Clamp to much larger map bounds
    botRef.current.position.x = Math.max(-95, Math.min(95, botRef.current.position.x));
    botRef.current.position.z = Math.max(-95, Math.min(95, botRef.current.position.z));
    botRef.current.position.y = position[1];

    // Subtle bob animation
    const bobAmount = 0.015;
    botRef.current.position.y = position[1] + Math.sin(time * 1.5) * bobAmount;

    // Shooting behavior - much slower rate
    if (inCombatRange && isAimingRef.current) {
      shootTimer.current += delta;
      
      // Shoot every 2-4 seconds (much slower)
      const shootInterval = 2 + Math.random() * 2;
      if (shootTimer.current > shootInterval) {
        shootTimer.current = 0;
        shootAtPlayer();
      }
    }
  });

  if (isDead) return null;

  return (
    <group ref={botRef} position={position} userData={{ isBot: true }}>
      {/* Muzzle flash light */}
      <pointLight 
        ref={muzzleFlashRef}
        position={[0, 1.2, 0.5]} 
        color={0xffaa00} 
        intensity={0} 
        distance={8}
      />

      {/* Body - tactical vest with camo */}
      <mesh position={[0, 0.9, 0]} castShadow material={materials.vest}>
        <capsuleGeometry args={[0.28, 0.7, 4, 12]} />
      </mesh>
      
      {/* Camo shirt under vest (visible at arms) */}
      <mesh position={[0, 0.9, 0]} scale={[0.95, 1.02, 0.95]} material={materials.camo}>
        <capsuleGeometry args={[0.29, 0.65, 4, 12]} />
      </mesh>

      {/* Vest front plate */}
      <mesh position={[0, 0.9, 0.22]} castShadow material={materials.vest}>
        <boxGeometry args={[0.4, 0.5, 0.08]} />
      </mesh>
      
      {/* Vest pouches */}
      <mesh position={[0, 0.78, 0.28]} castShadow material={materials.pouch}>
        <boxGeometry args={[0.35, 0.18, 0.1]} />
      </mesh>
      <mesh position={[0.18, 0.72, 0.24]} castShadow material={materials.pouch}>
        <boxGeometry args={[0.08, 0.14, 0.08]} />
      </mesh>
      <mesh position={[-0.18, 0.72, 0.24]} castShadow material={materials.pouch}>
        <boxGeometry args={[0.08, 0.14, 0.08]} />
      </mesh>
      {/* Side pouches */}
      <mesh position={[0.32, 0.85, 0]} castShadow material={materials.pouch}>
        <boxGeometry args={[0.06, 0.12, 0.1]} />
      </mesh>
      <mesh position={[-0.32, 0.85, 0]} castShadow material={materials.pouch}>
        <boxGeometry args={[0.06, 0.12, 0.1]} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.55, 0]} castShadow material={materials.skin}>
        <sphereGeometry args={[0.17, 12, 12]} />
      </mesh>
      
      {/* Helmet with texture */}
      <mesh position={[0, 1.62, 0]} castShadow material={materials.helmet}>
        <sphereGeometry args={[0.22, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
      </mesh>
      
      {/* Helmet rim */}
      <mesh position={[0, 1.52, 0.08]} rotation={[-0.3, 0, 0]} material={materials.helmet}>
        <boxGeometry args={[0.35, 0.04, 0.12]} />
      </mesh>
      
      {/* Helmet straps */}
      <mesh position={[0.18, 1.48, 0.08]} material={materials.vest}>
        <boxGeometry args={[0.02, 0.08, 0.02]} />
      </mesh>
      <mesh position={[-0.18, 1.48, 0.08]} material={materials.vest}>
        <boxGeometry args={[0.02, 0.08, 0.02]} />
      </mesh>

      {/* Goggles/visor */}
      <mesh position={[0, 1.58, 0.16]} material={materials.goggles}>
        <boxGeometry args={[0.25, 0.06, 0.05]} />
      </mesh>
      {/* Goggles glow when aiming */}
      {isAiming && (
        <mesh position={[0, 1.58, 0.18]}>
          <boxGeometry args={[0.24, 0.05, 0.01]} />
          <meshBasicMaterial color={0xff2200} transparent opacity={0.6} />
        </mesh>
      )}

      {/* Arms - camo sleeves */}
      <mesh position={[0.35, 0.95, 0.08]} rotation={[0.3, 0, 0.4]} castShadow material={materials.camo}>
        <capsuleGeometry args={[0.07, 0.4, 4, 8]} />
      </mesh>
      <mesh position={[-0.35, 0.95, 0.08]} rotation={[0.3, 0, -0.4]} castShadow material={materials.camo}>
        <capsuleGeometry args={[0.07, 0.4, 4, 8]} />
      </mesh>

      {/* Forearms */}
      <mesh position={[0.4, 0.7, 0.25]} rotation={[1.2, 0, 0.2]} castShadow material={materials.camo}>
        <capsuleGeometry args={[0.05, 0.3, 4, 8]} />
      </mesh>
      <mesh position={[-0.35, 0.75, 0.2]} rotation={[0.8, 0, -0.2]} castShadow material={materials.camo}>
        <capsuleGeometry args={[0.05, 0.3, 4, 8]} />
      </mesh>

      {/* Gloves */}
      <mesh position={[0.42, 0.55, 0.38]} castShadow material={materials.vest}>
        <sphereGeometry args={[0.05, 6, 6]} />
      </mesh>
      <mesh position={[-0.35, 0.6, 0.32]} castShadow material={materials.vest}>
        <sphereGeometry args={[0.05, 6, 6]} />
      </mesh>

      {/* Weapon (detailed rifle) */}
      <group position={[0.15, 0.85, 0.35]} rotation={[0.3, 0, 0.1]}>
        {/* Receiver */}
        <mesh castShadow material={materials.metal}>
          <boxGeometry args={[0.04, 0.06, 0.4]} />
        </mesh>
        {/* Barrel */}
        <mesh position={[0, 0.01, -0.28]} rotation={[Math.PI / 2, 0, 0]} material={materials.metal}>
          <cylinderGeometry args={[0.012, 0.012, 0.18, 8]} />
        </mesh>
        {/* Stock */}
        <mesh position={[0, -0.01, 0.22]} material={materials.metal}>
          <boxGeometry args={[0.03, 0.05, 0.12]} />
        </mesh>
        {/* Magazine */}
        <mesh position={[0, -0.08, 0]} rotation={[0.1, 0, 0]} material={materials.metal}>
          <boxGeometry args={[0.02, 0.1, 0.04]} />
        </mesh>
        {/* Scope */}
        <mesh position={[0, 0.06, -0.05]} rotation={[Math.PI / 2, 0, 0]} material={materials.metal}>
          <cylinderGeometry args={[0.015, 0.015, 0.1, 8]} />
        </mesh>
      </group>

      {/* Legs - camo pants */}
      <mesh position={[0.12, 0.25, 0]} castShadow material={materials.camo}>
        <capsuleGeometry args={[0.09, 0.45, 4, 8]} />
      </mesh>
      <mesh position={[-0.12, 0.25, 0]} castShadow material={materials.camo}>
        <capsuleGeometry args={[0.09, 0.45, 4, 8]} />
      </mesh>

      {/* Knee pads */}
      <mesh position={[0.12, 0.25, 0.08]} castShadow material={materials.vest}>
        <boxGeometry args={[0.08, 0.1, 0.04]} />
      </mesh>
      <mesh position={[-0.12, 0.25, 0.08]} castShadow material={materials.vest}>
        <boxGeometry args={[0.08, 0.1, 0.04]} />
      </mesh>

      {/* Boots */}
      <mesh position={[0.12, 0, 0.05]} castShadow material={materials.boots}>
        <boxGeometry args={[0.12, 0.1, 0.22]} />
      </mesh>
      <mesh position={[-0.12, 0, 0.05]} castShadow material={materials.boots}>
        <boxGeometry args={[0.12, 0.1, 0.22]} />
      </mesh>

      {/* Belt */}
      <mesh position={[0, 0.55, 0]} material={materials.vest}>
        <cylinderGeometry args={[0.28, 0.28, 0.06, 12, 1, true]} />
      </mesh>
      {/* Belt buckle */}
      <mesh position={[0, 0.55, 0.28]} material={materials.metal}>
        <boxGeometry args={[0.06, 0.04, 0.02]} />
      </mesh>

      {/* Health bar */}
      <group position={[0, 2.1, 0]}>
        <mesh>
          <planeGeometry args={[0.6, 0.08]} />
          <meshBasicMaterial color={0x222222} transparent opacity={0.8} />
        </mesh>
        <mesh position={[(health / 100 - 1) * 0.28, 0, 0.01]}>
          <planeGeometry args={[(health / 100) * 0.56, 0.06]} />
          <meshBasicMaterial color={health > 50 ? 0x00ff00 : health > 25 ? 0xffff00 : 0xff0000} />
        </mesh>
      </group>

      {/* Aiming indicator (laser sight effect when targeting player) */}
      {isAiming && (
        <mesh position={[0.15, 0.85, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.002, 0.002, 1.2, 4]} />
          <meshBasicMaterial color={0xff0000} transparent opacity={0.25} />
        </mesh>
      )}
    </group>
  );
};

export default Bot;
