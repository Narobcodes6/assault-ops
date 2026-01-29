import { useState, useCallback, useRef, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import * as THREE from 'three';
import Map from './Map';
import FPSController from './FPSController';
import Bot from './Bot';
import GameHUD from './GameHUD';

// Player position tracker component
const PlayerPositionTracker = ({ onPositionUpdate }: { onPositionUpdate: (pos: THREE.Vector3) => void }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    const interval = setInterval(() => {
      onPositionUpdate(camera.position.clone());
    }, 100);
    return () => clearInterval(interval);
  }, [camera, onPositionUpdate]);

  return null;
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
  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(0, 1.7, 0));
  const [damageFlash, setDamageFlash] = useState(false);
  const [bots, setBots] = useState([
    { id: 1, position: [-12, 0, -12] as [number, number, number], alive: true },
    { id: 2, position: [12, 0, -12] as [number, number, number], alive: true },
    { id: 3, position: [-12, 0, 12] as [number, number, number], alive: true },
    { id: 4, position: [12, 0, 12] as [number, number, number], alive: true },
    { id: 5, position: [0, 0, -22] as [number, number, number], alive: true },
    { id: 6, position: [0, 0, 22] as [number, number, number], alive: true },
    { id: 7, position: [-22, 0, 0] as [number, number, number], alive: true },
    { id: 8, position: [22, 0, 0] as [number, number, number], alive: true },
    { id: 9, position: [-18, 0, -18] as [number, number, number], alive: true },
    { id: 10, position: [18, 0, 18] as [number, number, number], alive: true },
  ]);

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const sceneRef = useRef<THREE.Scene | null>(null);

  // Check for game over
  useEffect(() => {
    if (health <= 0) {
      onGameOver(kills);
    }
  }, [health, kills, onGameOver]);

  const handlePlayerDamage = useCallback((damage: number) => {
    setHealth((prev) => Math.max(0, prev - damage));
    setDamageFlash(true);
    setTimeout(() => setDamageFlash(false), 150);
  }, []);

  const handleShoot = useCallback((origin: THREE.Vector3, direction: THREE.Vector3) => {
    if (ammo <= 0) return;
    
    setAmmo((prev) => prev - 1);

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

  // Handle R key for reload
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyR') {
        setAmmo(30);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <Canvas
        shadows
        camera={{ position: [0, 1.7, 0], fov: 75 }}
        onCreated={({ scene }) => { sceneRef.current = scene; }}
        style={{ position: 'fixed', inset: 0 }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.25} />
        <directionalLight
          position={[30, 40, 20]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={100}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />
        <hemisphereLight args={[0x8888aa, 0x444422, 0.4]} />
        
        {/* Sky */}
        <Sky 
          distance={450000} 
          sunPosition={[100, 20, 100]} 
          inclination={0.49}
          azimuth={0.25}
          rayleigh={0.4}
        />

        {/* Fog for atmosphere */}
        <fog attach="fog" args={['#1a1a20', 25, 70]} />

        <Suspense fallback={null}>
          {/* Track player position for bots */}
          <PlayerPositionTracker onPositionUpdate={setPlayerPosition} />

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
              onShootPlayer={handlePlayerDamage}
              isActive={true}
              playerPosition={playerPosition}
            />
          ))}
        </Suspense>
      </Canvas>

      {/* Damage flash overlay */}
      {damageFlash && (
        <div 
          className="fixed inset-0 pointer-events-none z-40"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(255, 0, 0, 0.4) 100%)',
            animation: 'pulse 0.15s ease-out',
          }}
        />
      )}

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
