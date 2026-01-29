import { Crosshair, Heart, Box } from 'lucide-react';

interface GameHUDProps {
  health: number;
  ammo: number;
  maxAmmo: number;
  isScoped: boolean;
  kills: number;
}

const GameHUD = ({ health, ammo, maxAmmo, isScoped, kills }: GameHUDProps) => {
  const healthColor = health > 60 ? 'text-game-health' : health > 30 ? 'text-yellow-500' : 'text-game-damage';
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Crosshair */}
      {!isScoped && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Crosshair className="w-8 h-8 text-game-crosshair opacity-80" />
        </div>
      )}

      {/* Scope overlay */}
      {isScoped && (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Black vignette for scope */}
          <div 
            className="absolute inset-0 bg-black"
            style={{
              maskImage: 'radial-gradient(circle at center, transparent 20%, black 40%)',
              WebkitMaskImage: 'radial-gradient(circle at center, transparent 20%, black 40%)',
            }}
          />
          {/* Scope circle */}
          <div className="relative w-[40vmin] h-[40vmin]">
            <div className="absolute inset-0 border-2 border-game-crosshair/50 rounded-full" />
            {/* Crosshairs */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-game-crosshair/60" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-game-crosshair/60" />
            {/* Range markers */}
            <div className="absolute top-1/2 left-1/4 w-2 h-px bg-game-crosshair/40" />
            <div className="absolute top-1/2 right-1/4 w-2 h-px bg-game-crosshair/40" />
            <div className="absolute left-1/2 top-1/4 w-px h-2 bg-game-crosshair/40" />
            <div className="absolute left-1/2 bottom-1/4 w-px h-2 bg-game-crosshair/40" />
          </div>
        </div>
      )}

      {/* Bottom HUD */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex justify-between items-end max-w-screen-xl mx-auto">
          {/* Health */}
          <div className="hud-element px-4 py-3 rounded flex items-center gap-3">
            <Heart className={`w-6 h-6 ${healthColor}`} fill="currentColor" />
            <div className="font-display text-2xl">
              <span className={healthColor}>{health}</span>
              <span className="text-muted-foreground text-lg">/100</span>
            </div>
            {/* Health bar */}
            <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  health > 60 ? 'bg-game-health' : health > 30 ? 'bg-yellow-500' : 'bg-game-damage'
                }`}
                style={{ width: `${health}%` }}
              />
            </div>
          </div>

          {/* Center - Kills counter */}
          <div className="hud-element px-6 py-3 rounded text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Eliminations</p>
            <p className="font-display text-3xl text-primary">{kills}</p>
          </div>

          {/* Ammo */}
          <div className="hud-element px-4 py-3 rounded flex items-center gap-3">
            <Box className="w-6 h-6 text-game-ammo" />
            <div className="font-display text-2xl">
              <span className={ammo > 10 ? 'text-game-ammo' : 'text-game-damage'}>{ammo}</span>
              <span className="text-muted-foreground text-lg">/{maxAmmo}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hit marker (shows briefly when hitting enemy) */}
      {/* Can be triggered via state */}

      {/* Damage overlay */}
      {health < 30 && (
        <div 
          className="absolute inset-0 pointer-events-none animate-pulse"
          style={{
            background: `radial-gradient(ellipse at center, transparent 40%, hsl(0 80% 45% / ${(30 - health) / 60}) 100%)`,
          }}
        />
      )}

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 text-xs font-tactical text-muted-foreground/50 uppercase tracking-widest">
        TACTICAL ASSAULT
      </div>
    </div>
  );
};

export default GameHUD;
