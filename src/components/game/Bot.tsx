import { useRef, useState, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface BotProps {
  position: [number, number, number];
  onHit: () => void;
  onShootPlayer: (damage: number) => void;
  isActive: boolean;
  playerPosition: THREE.Vector3;
}

const Bot = ({ position, onHit, onShootPlayer, isActive, playerPosition }: BotProps) => {
  const botRef = useRef<THREE.Group>(null);
  const [health, setHealth] = useState(100);
  const [isDead, setIsDead] = useState(false);
  const [isAiming, setIsAiming] = useState(false);
  const targetPosition = useRef(new THREE.Vector3(...position));
  const moveTimer = useRef(0);
  const shootTimer = useRef(0);
  const lastShootTime = useRef(0);
  const muzzleFlashRef = useRef<THREE.PointLight>(null);

  useEffect(() => {
    if (health <= 0 && !isDead) {
      setIsDead(true);
      onHit();
    }
  }, [health, isDead, onHit]);

  // Expose hit function for raycasting
  useEffect(() => {
    if (botRef.current) {
      (botRef.current as any).takeDamage = (damage: number) => {
        if (!isDead) {
          setHealth((prev) => Math.max(0, prev - damage));
        }
      };
    }
  }, [isDead]);

  const shootAtPlayer = useCallback(() => {
    if (!botRef.current || isDead) return;
    
    const botPos = botRef.current.position;
    const distance = botPos.distanceTo(playerPosition);
    
    // Accuracy decreases with distance
    const baseAccuracy = 0.4;
    const distancePenalty = Math.min(distance * 0.02, 0.5);
    const hitChance = baseAccuracy - distancePenalty;
    
    if (Math.random() < hitChance) {
      const damage = Math.floor(5 + Math.random() * 10); // 5-15 damage
      onShootPlayer(damage);
    }

    // Muzzle flash
    if (muzzleFlashRef.current) {
      muzzleFlashRef.current.intensity = 20;
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

    // Bot AI states
    const inCombatRange = distanceToPlayer < 30;
    const tooClose = distanceToPlayer < 8;
    const optimalRange = distanceToPlayer > 12 && distanceToPlayer < 20;

    // Look at player when in range
    if (inCombatRange) {
      const lookTarget = playerPosition.clone();
      lookTarget.y = botPos.y;
      
      const direction = lookTarget.sub(botPos).normalize();
      const targetRotation = Math.atan2(direction.x, direction.z);
      
      // Smooth rotation
      let rotDiff = targetRotation - botRef.current.rotation.y;
      while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
      while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
      
      botRef.current.rotation.y += rotDiff * delta * 3;
      setIsAiming(true);
    } else {
      setIsAiming(false);
    }

    // Movement behavior
    moveTimer.current += delta;
    
    if (tooClose) {
      // Back away from player
      const awayDir = botPos.clone().sub(playerPosition).normalize();
      targetPosition.current.copy(botPos).add(awayDir.multiplyScalar(5));
    } else if (!optimalRange && inCombatRange) {
      // Move towards optimal range
      if (moveTimer.current > 2) {
        moveTimer.current = 0;
        const toPlayer = playerPosition.clone().sub(botPos).normalize();
        const strafeDir = new THREE.Vector3(-toPlayer.z, 0, toPlayer.x);
        const strafe = (Math.random() - 0.5) * 8;
        targetPosition.current.copy(playerPosition).add(toPlayer.multiplyScalar(-15)).add(strafeDir.multiplyScalar(strafe));
      }
    } else if (!inCombatRange) {
      // Patrol when player not in range
      if (moveTimer.current > 4) {
        moveTimer.current = 0;
        targetPosition.current.set(
          position[0] + (Math.random() - 0.5) * 15,
          position[1],
          position[2] + (Math.random() - 0.5) * 15
        );
      }
    }

    // Smooth movement
    const moveDir = targetPosition.current.clone().sub(botPos);
    const moveSpeed = inCombatRange ? 2 : 1.5;
    
    if (moveDir.length() > 0.5) {
      moveDir.normalize();
      botRef.current.position.add(moveDir.multiplyScalar(delta * moveSpeed));
    }

    // Clamp to map bounds
    botRef.current.position.x = Math.max(-30, Math.min(30, botRef.current.position.x));
    botRef.current.position.z = Math.max(-30, Math.min(30, botRef.current.position.z));
    botRef.current.position.y = position[1];

    // Subtle bob animation
    const bobAmount = 0.03;
    botRef.current.position.y = position[1] + Math.sin(time * 3) * bobAmount;

    // Shooting behavior
    if (inCombatRange && isAiming) {
      shootTimer.current += delta;
      
      // Shoot every 1-2 seconds
      const shootInterval = 1 + Math.random() * 1;
      if (shootTimer.current > shootInterval) {
        shootTimer.current = 0;
        shootAtPlayer();
      }
    }
  });

  if (isDead) return null;

  return (
    <group ref={botRef} position={position} userData={{ isBot: true, takeDamage: (d: number) => setHealth((prev) => Math.max(0, prev - d)) }}>
      {/* Muzzle flash light */}
      <pointLight 
        ref={muzzleFlashRef}
        position={[0, 1.2, 0.5]} 
        color={0xffaa00} 
        intensity={0} 
        distance={8}
      />

      {/* Body - tactical vest */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <capsuleGeometry args={[0.28, 0.7, 4, 12]} />
        <meshStandardMaterial color={0x2a2a2a} metalness={0.2} roughness={0.8} />
      </mesh>
      
      {/* Vest pouches */}
      <mesh position={[0, 0.85, 0.25]} castShadow>
        <boxGeometry args={[0.35, 0.2, 0.1]} />
        <meshStandardMaterial color={0x3a3a3a} metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[0.2, 0.75, 0.2]} castShadow>
        <boxGeometry args={[0.08, 0.15, 0.08]} />
        <meshStandardMaterial color={0x4a4a3a} metalness={0.2} roughness={0.8} />
      </mesh>
      <mesh position={[-0.2, 0.75, 0.2]} castShadow>
        <boxGeometry args={[0.08, 0.15, 0.08]} />
        <meshStandardMaterial color={0x4a4a3a} metalness={0.2} roughness={0.8} />
      </mesh>

      {/* Head with helmet */}
      <mesh position={[0, 1.55, 0]} castShadow>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color={0x5a4a3a} metalness={0.1} roughness={0.9} />
      </mesh>
      
      {/* Helmet */}
      <mesh position={[0, 1.62, 0]} castShadow>
        <sphereGeometry args={[0.22, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial color={0x3a4a3a} metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Goggles/visor */}
      <mesh position={[0, 1.58, 0.16]}>
        <boxGeometry args={[0.25, 0.06, 0.05]} />
        <meshStandardMaterial 
          color={0x111111} 
          metalness={0.9} 
          roughness={0.1}
          emissive={isAiming ? 0xff2200 : 0x000000}
          emissiveIntensity={isAiming ? 0.5 : 0}
        />
      </mesh>

      {/* Arms */}
      <mesh position={[0.35, 0.95, 0.1]} rotation={[0.3, 0, 0.4]} castShadow>
        <capsuleGeometry args={[0.07, 0.4, 4, 8]} />
        <meshStandardMaterial color={0x3a3a3a} metalness={0.2} roughness={0.8} />
      </mesh>
      <mesh position={[-0.35, 0.95, 0.1]} rotation={[0.3, 0, -0.4]} castShadow>
        <capsuleGeometry args={[0.07, 0.4, 4, 8]} />
        <meshStandardMaterial color={0x3a3a3a} metalness={0.2} roughness={0.8} />
      </mesh>

      {/* Forearms */}
      <mesh position={[0.4, 0.7, 0.25]} rotation={[1.2, 0, 0.2]} castShadow>
        <capsuleGeometry args={[0.05, 0.3, 4, 8]} />
        <meshStandardMaterial color={0x4a4a3a} metalness={0.2} roughness={0.8} />
      </mesh>
      <mesh position={[-0.35, 0.75, 0.2]} rotation={[0.8, 0, -0.2]} castShadow>
        <capsuleGeometry args={[0.05, 0.3, 4, 8]} />
        <meshStandardMaterial color={0x4a4a3a} metalness={0.2} roughness={0.8} />
      </mesh>

      {/* Weapon (simple rifle shape) */}
      <group position={[0.15, 0.85, 0.35]} rotation={[0.3, 0, 0.1]}>
        <mesh castShadow>
          <boxGeometry args={[0.04, 0.06, 0.4]} />
          <meshStandardMaterial color={0x1a1a1a} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.01, -0.25]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.15, 8]} />
          <meshStandardMaterial color={0x2a2a2a} metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* Legs */}
      <mesh position={[0.12, 0.25, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.45, 4, 8]} />
        <meshStandardMaterial color={0x2a2a2a} metalness={0.2} roughness={0.8} />
      </mesh>
      <mesh position={[-0.12, 0.25, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.45, 4, 8]} />
        <meshStandardMaterial color={0x2a2a2a} metalness={0.2} roughness={0.8} />
      </mesh>

      {/* Boots */}
      <mesh position={[0.12, 0, 0.05]} castShadow>
        <boxGeometry args={[0.12, 0.08, 0.2]} />
        <meshStandardMaterial color={0x1a1a1a} metalness={0.3} roughness={0.9} />
      </mesh>
      <mesh position={[-0.12, 0, 0.05]} castShadow>
        <boxGeometry args={[0.12, 0.08, 0.2]} />
        <meshStandardMaterial color={0x1a1a1a} metalness={0.3} roughness={0.9} />
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
        <mesh position={[0.15, 0.85, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.002, 0.002, 1, 4]} />
          <meshBasicMaterial color={0xff0000} transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
};

export default Bot;
