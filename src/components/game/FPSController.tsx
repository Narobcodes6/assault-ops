import { useRef, useEffect, useCallback, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import Weapon from './Weapon';

interface FPSControllerProps {
  onShoot: (origin: THREE.Vector3, direction: THREE.Vector3) => void;
  isScoped: boolean;
  setIsScoped: (scoped: boolean) => void;
  isShooting: boolean;
  setIsShooting: (shooting: boolean) => void;
}

const FPSController = ({ 
  onShoot, 
  isScoped, 
  setIsScoped, 
  isShooting, 
  setIsShooting 
}: FPSControllerProps) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const velocity = useRef(new THREE.Vector3());
  const targetVelocity = useRef(new THREE.Vector3());
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const moveLeft = useRef(false);
  const moveRight = useRef(false);
  const lastShootTime = useRef(0);
  const [isMoving, setIsMoving] = useState(false);

  const shootRate = 150; // ms between shots

  const handleShoot = useCallback(() => {
    const now = Date.now();
    if (now - lastShootTime.current < shootRate) return;
    
    lastShootTime.current = now;
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    onShoot(camera.position.clone(), dir);
  }, [camera, onShoot]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': moveForward.current = true; break;
        case 'KeyS': moveBackward.current = true; break;
        case 'KeyA': moveLeft.current = true; break;
        case 'KeyD': moveRight.current = true; break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': moveForward.current = false; break;
        case 'KeyS': moveBackward.current = false; break;
        case 'KeyA': moveLeft.current = false; break;
        case 'KeyD': moveRight.current = false; break;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        setIsShooting(true);
        handleShoot();
      } else if (e.button === 2) {
        setIsScoped(true);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        setIsShooting(false);
      } else if (e.button === 2) {
        setIsScoped(false);
      }
    };

    const handleContextMenu = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [handleShoot, setIsScoped, setIsShooting]);

  // Continuous shooting while holding mouse button
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (isShooting) {
      interval = setInterval(handleShoot, shootRate);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isShooting, handleShoot]);

  useFrame((_, delta) => {
    if (!controlsRef.current?.isLocked) return;

    // Much slower, human-like movement
    const walkSpeed = isScoped ? 1.2 : 2.8; // Slower base speeds
    const friction = 12; // High friction = less sliding
    const acceleration = 8; // Lower acceleration = slower ramp up

    // Calculate target velocity based on input
    const inputZ = Number(moveForward.current) - Number(moveBackward.current);
    const inputX = Number(moveRight.current) - Number(moveLeft.current);
    
    // Normalize diagonal movement
    const inputLength = Math.sqrt(inputX * inputX + inputZ * inputZ);
    const normalizedX = inputLength > 0 ? inputX / inputLength : 0;
    const normalizedZ = inputLength > 0 ? inputZ / inputLength : 0;

    // Set target velocity
    targetVelocity.current.x = normalizedX * walkSpeed * delta;
    targetVelocity.current.z = normalizedZ * walkSpeed * delta;

    const isCurrentlyMoving = moveForward.current || moveBackward.current || moveLeft.current || moveRight.current;
    setIsMoving(isCurrentlyMoving);

    // Smoothly interpolate current velocity towards target (or zero if not moving)
    if (isCurrentlyMoving) {
      velocity.current.x += (targetVelocity.current.x - velocity.current.x) * acceleration * delta;
      velocity.current.z += (targetVelocity.current.z - velocity.current.z) * acceleration * delta;
    } else {
      // Quick stop when not pressing keys - no sliding
      velocity.current.x *= Math.max(0, 1 - friction * delta);
      velocity.current.z *= Math.max(0, 1 - friction * delta);
      
      // Snap to zero when very slow
      if (Math.abs(velocity.current.x) < 0.0001) velocity.current.x = 0;
      if (Math.abs(velocity.current.z) < 0.0001) velocity.current.z = 0;
    }

    // Apply movement - positive Z = forward (W key)
    controlsRef.current.moveRight(velocity.current.x);
    controlsRef.current.moveForward(velocity.current.z);

    // Keep camera at player height with subtle head bob
    const bobAmount = isCurrentlyMoving ? Math.sin(Date.now() * 0.008) * 0.015 : 0;
    camera.position.y = 1.7 + bobAmount;

    // Clamp position to much larger map bounds
    camera.position.x = Math.max(-95, Math.min(95, camera.position.x));
    camera.position.z = Math.max(-95, Math.min(95, camera.position.z));

    // Smooth FOV transition for scope
    const targetFov = isScoped ? 30 : 75;
    const currentFov = (camera as THREE.PerspectiveCamera).fov;
    (camera as THREE.PerspectiveCamera).fov = currentFov + (targetFov - currentFov) * delta * 6;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  });

  return (
    <>
      <PointerLockControls ref={controlsRef} />
      {/* Weapon is rendered separately in the scene, following camera in its own useFrame */}
      <Weapon isScoped={isScoped} isShooting={isShooting} isMoving={isMoving} />
    </>
  );
};

export default FPSController;
