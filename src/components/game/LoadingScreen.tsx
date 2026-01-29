import { useState, useEffect } from 'react';
import soldierImage from '@/assets/soldier-silhouette.png';

interface LoadingScreenProps {
  onPlay: () => void;
}

const LoadingScreen = ({ onPlay }: LoadingScreenProps) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoaded(true);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      {/* Background gradient overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'var(--gradient-military)',
        }}
      />
      
      {/* Animated scan line effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div 
          className="absolute w-full h-1 bg-primary scan-line"
          style={{ boxShadow: '0 0 20px hsl(28 95% 55%)' }}
        />
      </div>

      {/* Vignette overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'var(--gradient-dark-vignette)',
        }}
      />

      {/* Main content container */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full py-12 px-6">
        {/* Top section - Title */}
        <div className="text-center">
          <h1 className="font-display text-6xl md:text-8xl text-foreground tracking-wider">
            TACTICAL
          </h1>
          <h2 className="font-display text-4xl md:text-6xl text-primary tracking-widest -mt-2">
            ASSAULT
          </h2>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary" />
            <span className="text-muted-foreground font-tactical text-sm tracking-widest uppercase">
              First Person Shooter
            </span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary" />
          </div>
        </div>

        {/* Center section - Soldier */}
        <div className="relative flex-1 flex items-center justify-center w-full max-w-lg">
          <div className="relative soldier-glow animate-float">
            <img
              src={soldierImage}
              alt="Tactical Soldier"
              className="h-[50vh] md:h-[60vh] object-contain drop-shadow-2xl"
            />
            {/* Ground reflection */}
            <div 
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full opacity-30"
              style={{
                background: 'radial-gradient(ellipse, hsl(28 95% 55% / 0.5) 0%, transparent 70%)',
              }}
            />
          </div>
        </div>

        {/* Bottom section - Loading/Play */}
        <div className="w-full max-w-md space-y-6">
          {!isLoaded ? (
            <>
              {/* Loading bar */}
              <div className="tactical-border p-1 bg-secondary/50">
                <div 
                  className="h-2 bg-gradient-to-r from-primary to-primary/70 transition-all duration-300"
                  style={{ width: `${Math.min(loadingProgress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-sm font-tactical">
                <span className="text-muted-foreground uppercase tracking-wider loading-pulse">
                  Loading assets...
                </span>
                <span className="text-primary font-bold">
                  {Math.min(Math.floor(loadingProgress), 100)}%
                </span>
              </div>
            </>
          ) : (
            <>
              {/* Play button */}
              <button
                onClick={onPlay}
                className="fps-button w-full py-5 text-2xl md:text-3xl text-primary-foreground rounded animate-pulse-glow"
              >
                PLAY
              </button>
              
              {/* Controls hint */}
              <div className="grid grid-cols-2 gap-4 text-center text-xs font-tactical text-muted-foreground uppercase tracking-wider">
                <div className="hud-element p-3 rounded">
                  <span className="text-primary">WASD</span> - Move
                </div>
                <div className="hud-element p-3 rounded">
                  <span className="text-primary">Mouse</span> - Look
                </div>
                <div className="hud-element p-3 rounded">
                  <span className="text-primary">LMB</span> - Shoot
                </div>
                <div className="hud-element p-3 rounded">
                  <span className="text-primary">RMB</span> - Scope
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-muted-foreground/50 text-xs font-tactical tracking-widest mt-6">
          © 2024 TACTICAL ASSAULT - ALL RIGHTS RESERVED
        </p>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-primary/50" />
      <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-primary/50" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-primary/50" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-primary/50" />
    </div>
  );
};

export default LoadingScreen;
