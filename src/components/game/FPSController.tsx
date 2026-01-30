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
  const direction = useRef(new THREE.Vector3());
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const moveLeft = useRef(false);
  const moveRight = useRef(false);
  const lastShootTime = useRef(0);
  const [isMoving, setIsMoving] = useState(false);

  const shootRate = 120; // ms between shots (slightly slower for feel)

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
    let interval: NodeJS.Timeout | null = null;
    
    if (isShooting) {
      interval = setInterval(handleShoot, shootRate);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isShooting, handleShoot]);

  useFrame((_, delta) => {
    if (!controlsRef.current?.isLocked) return;

    // Movement speed - slower and more tactical
    const baseSpeed = isScoped ? 2.5 : 5;
    const friction = 6; // Lower friction = more momentum/slide

    // Smooth velocity decay
    velocity.current.x *= (1 - friction * delta);
    velocity.current.z *= (1 - friction * delta);

    direction.current.z = Number(moveForward.current) - Number(moveBackward.current);
    direction.current.x = Number(moveRight.current) - Number(moveLeft.current);
    direction.current.normalize();

    const isCurrentlyMoving = moveForward.current || moveBackward.current || moveLeft.current || moveRight.current;
    setIsMoving(isCurrentlyMoving);

    // Acceleration-based movement for smoother feel
    const acceleration = 25;
    if (moveForward.current || moveBackward.current) {
      velocity.current.z -= direction.current.z * acceleration * delta;
    }
    if (moveLeft.current || moveRight.current) {
      velocity.current.x -= direction.current.x * acceleration * delta;
    }

    // Clamp max velocity
    const maxVel = baseSpeed * 0.15;
    velocity.current.x = Math.max(-maxVel, Math.min(maxVel, velocity.current.x));
    velocity.current.z = Math.max(-maxVel, Math.min(maxVel, velocity.current.z));

    controlsRef.current.moveRight(-velocity.current.x);
    controlsRef.current.moveForward(-velocity.current.z);

    // Keep camera at player height
    camera.position.y = 1.7;

    // Clamp position to map bounds
    camera.position.x = Math.max(-35, Math.min(35, camera.position.x));
    camera.position.z = Math.max(-35, Math.min(35, camera.position.z));

    // Smooth FOV transition for scope
    const targetFov = isScoped ? 25 : 75;
    const currentFov = (camera as THREE.PerspectiveCamera).fov;
    (camera as THREE.PerspectiveCamera).fov = currentFov + (targetFov - currentFov) * delta * 8;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  });

  return (
    <>
      <PointerLockControls ref={controlsRef} />
      
      {/* Weapon attached to camera - rendered in camera space */}
      <primitive object={camera}>
        <Weapon isScoped={isScoped} isShooting={isShooting} isMoving={isMoving} />
      </primitive>
    </>
  );
};

export default FPSController;
