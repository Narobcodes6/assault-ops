import { useState, useCallback, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import * as THREE from 'three';
import Map from './Map';
import FPSController from './FPSController';
import Bot from './Bot';
import GameHUD from './GameHUD';

// Muzzle flash component
const MuzzleFlash = ({ position, active }: { position: THREE.Vector3; active: boolean }) => {
  if (!active) return null;
  
  return (
    <pointLight
      position={position}
      color={0xffaa00}
      intensity={50}
      distance={10}
      decay={2}
    />
  );
};

// Camera-attached weapon renderer
const WeaponRenderer = ({ isScoped, isShooting }: { isScoped: boolean; isShooting: boolean }) => {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(camera.position);
      groupRef.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Weapon is rendered in FPSController */}
    </group>
  );
};

interface GameSceneProps {
  onGameOver: (kills: number) => void;
}

const GameScene = ({ onGameOver }: GameSceneProps) => {
  const [health, setHealth] = useState(100);
  const [ammo, setAmmo] = useState(30);
  const [kills, setKills] = useState(0);
  const [isScoped, setIsScoped] = useState(false);
  const [isShooting, setIsShooting] = useState(false);
  const [muzzleFlash, setMuzzleFlash] = useState(false);
  const [bots, setBots] = useState([
    { id: 1, position: [-10, 0, -10] as [number, number, number], alive: true },
    { id: 2, position: [10, 0, -10] as [number, number, number], alive: true },
    { id: 3, position: [-10, 0, 10] as [number, number, number], alive: true },
    { id: 4, position: [10, 0, 10] as [number, number, number], alive: true },
    { id: 5, position: [0, 0, -20] as [number, number, number], alive: true },
    { id: 6, position: [0, 0, 20] as [number, number, number], alive: true },
    { id: 7, position: [-20, 0, 0] as [number, number, number], alive: true },
    { id: 8, position: [20, 0, 0] as [number, number, number], alive: true },
  ]);

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const sceneRef = useRef<THREE.Scene | null>(null);

  const handleShoot = useCallback((origin: THREE.Vector3, direction: THREE.Vector3) => {
    if (ammo <= 0) return;
    
    setAmmo((prev) => prev - 1);
    setMuzzleFlash(true);
    setTimeout(() => setMuzzleFlash(false), 50);

    // Raycast for hit detection
    raycaster.set(origin, direction);
    raycaster.far = 100;

    if (sceneRef.current) {
      const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
      
      for (const intersect of intersects) {
        // Find if we hit a bot
        let current = intersect.object;
        while (current.parent) {
          if (current.userData?.isBot) {
            current.userData.takeDamage?.(35);
            break;
          }
          current = current.parent;
        }
        break; // Only process first hit
      }
    }
  }, [ammo, raycaster]);

  const handleBotKill = useCallback((botId: number) => {
    setBots((prev) => prev.map((bot) => 
      bot.id === botId ? { ...bot, alive: false } : bot
    ));
    setKills((prev) => prev + 1);
  }, []);

  // Reload ammo
  const handleReload = useCallback(() => {
    setAmmo(30);
  }, []);

  // Handle R key for reload
  useState(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyR') {
        handleReload();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <>
      <Canvas
        shadows
        camera={{ position: [0, 1.7, 0], fov: 75 }}
        onCreated={({ scene }) => { sceneRef.current = scene; }}
        style={{ position: 'fixed', inset: 0 }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[20, 30, 10]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={100}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />
        
        {/* Sky */}
        <Sky 
          distance={450000} 
          sunPosition={[100, 10, 100]} 
          inclination={0.5}
          azimuth={0.25}
          rayleigh={0.5}
        />

        {/* Fog for atmosphere */}
        <fog attach="fog" args={['#1a1a1f', 30, 80]} />

        <Suspense fallback={null}>
          {/* Map / Environment */}
          <Map />

          {/* Player Controller */}
          <FPSController
            onShoot={handleShoot}
            isScoped={isScoped}
            setIsScoped={setIsScoped}
            isShooting={isShooting}
            setIsShooting={setIsShooting}
          />

          {/* Bots */}
          {bots.filter((bot) => bot.alive).map((bot) => (
            <Bot
              key={bot.id}
              position={bot.position}
              onHit={() => handleBotKill(bot.id)}
              isActive={true}
            />
          ))}
        </Suspense>
      </Canvas>

      {/* HUD Overlay */}
      <GameHUD
        health={health}
        ammo={ammo}
        maxAmmo={30}
        isScoped={isScoped}
        kills={kills}
      />

      {/* Reload prompt */}
      {ammo === 0 && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <p className="font-display text-2xl text-primary animate-pulse">
            PRESS R TO RELOAD
          </p>
        </div>
      )}

      {/* Instructions overlay */}
      <div className="fixed top-4 right-4 z-50 hud-element px-4 py-3 rounded text-sm font-tactical">
        <p className="text-muted-foreground">Click to lock mouse</p>
        <p className="text-muted-foreground mt-1">
          <span className="text-primary">ESC</span> to unlock
        </p>
      </div>
    </>
  );
};

export default GameScene;
