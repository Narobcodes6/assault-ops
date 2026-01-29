import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BotProps {
  position: [number, number, number];
  onHit: () => void;
  isActive: boolean;
}

const Bot = ({ position, onHit, isActive }: BotProps) => {
  const botRef = useRef<THREE.Group>(null);
  const [health, setHealth] = useState(100);
  const [isDead, setIsDead] = useState(false);
  const targetPosition = useRef(new THREE.Vector3(...position));
  const moveTimer = useRef(0);

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

  useFrame((_, delta) => {
    if (!botRef.current || !isActive || isDead) return;

    // Move towards target
    moveTimer.current += delta;
    
    if (moveTimer.current > 3) {
      moveTimer.current = 0;
      // Pick new random target within patrol area
      targetPosition.current.set(
        position[0] + (Math.random() - 0.5) * 10,
        position[1],
        position[2] + (Math.random() - 0.5) * 10
      );
    }

    // Move towards target
    const direction = targetPosition.current.clone().sub(botRef.current.position);
    if (direction.length() > 0.5) {
      direction.normalize();
      botRef.current.position.add(direction.multiplyScalar(delta * 2));
      
      // Face movement direction
      botRef.current.rotation.y = Math.atan2(direction.x, direction.z);
    }

    // Bob animation
    botRef.current.position.y = position[1] + Math.sin(Date.now() * 0.003) * 0.05;
  });

  if (isDead) return null;

  return (
    <group ref={botRef} position={position} userData={{ isBot: true, takeDamage: (d: number) => setHealth((prev) => Math.max(0, prev - d)) }}>
      {/* Body */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
        <meshStandardMaterial color={0x8B0000} metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color={0x654321} metalness={0.2} roughness={0.8} />
      </mesh>

      {/* Eyes (glowing) */}
      <mesh position={[0.08, 1.65, 0.15]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={0xff0000} emissive={0xff0000} emissiveIntensity={2} />
      </mesh>
      <mesh position={[-0.08, 1.65, 0.15]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={0xff0000} emissive={0xff0000} emissiveIntensity={2} />
      </mesh>

      {/* Arms */}
      <mesh position={[0.4, 0.9, 0]} rotation={[0, 0, 0.3]} castShadow>
        <capsuleGeometry args={[0.08, 0.5, 4, 8]} />
        <meshStandardMaterial color={0x8B0000} metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[-0.4, 0.9, 0]} rotation={[0, 0, -0.3]} castShadow>
        <capsuleGeometry args={[0.08, 0.5, 4, 8]} />
        <meshStandardMaterial color={0x8B0000} metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Legs */}
      <mesh position={[0.15, 0.2, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.4, 4, 8]} />
        <meshStandardMaterial color={0x2a2a2a} metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[-0.15, 0.2, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.4, 4, 8]} />
        <meshStandardMaterial color={0x2a2a2a} metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Health bar */}
      <group position={[0, 2.1, 0]}>
        <mesh>
          <planeGeometry args={[0.6, 0.08]} />
          <meshBasicMaterial color={0x333333} />
        </mesh>
        <mesh position={[(health / 100 - 1) * 0.28, 0, 0.01]}>
          <planeGeometry args={[(health / 100) * 0.56, 0.06]} />
          <meshBasicMaterial color={health > 50 ? 0x00ff00 : health > 25 ? 0xffff00 : 0xff0000} />
        </mesh>
      </group>
    </group>
  );
};

export default Bot;
