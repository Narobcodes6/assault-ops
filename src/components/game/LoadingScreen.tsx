import { useState, useEffect } from 'react';
import soldierImage from '@/assets/soldier-silhouette.png';
import { Play, Crosshair, MousePointer, Target, Eye, Download } from 'lucide-react';

interface LoadingScreenProps {
  onPlay: () => void;
  onShowExeTutorial: () => void;
}

const LoadingScreen = ({ onPlay, onShowExeTutorial }: LoadingScreenProps) => {
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
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
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
      <div className="relative z-10 flex flex-col items-center justify-between h-full py-8 md:py-12 px-6">
        {/* Top section - Title */}
        <div className="text-center">
          <div className="relative inline-block">
            <h1 className="font-display text-5xl md:text-8xl text-foreground tracking-wider">
              TACTICAL
            </h1>
            {/* Glitch effect line */}
            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary/50" />
          </div>
          <h2 className="font-display text-3xl md:text-6xl text-primary tracking-widest mt-1">
            ASSAULT
          </h2>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary" />
            <Crosshair className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground font-tactical text-sm tracking-widest uppercase">
              First Person Shooter
            </span>
            <Crosshair className="w-4 h-4 text-primary" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary" />
          </div>
        </div>

        {/* Center section - Soldier */}
        <div className="relative flex-1 flex items-center justify-center w-full max-w-lg">
          <div className="relative soldier-glow animate-float">
            <img
              src={soldierImage}
              alt="Tactical Soldier"
              className="h-[40vh] md:h-[55vh] object-contain drop-shadow-2xl"
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
        <div className="w-full max-w-lg space-y-6">
          {!isLoaded ? (
            <>
              {/* Loading bar with enhanced styling */}
              <div className="tactical-border p-1 bg-secondary/50 relative overflow-hidden">
                <div 
                  className="h-3 bg-gradient-to-r from-primary via-primary to-primary/70 transition-all duration-300 relative"
                  style={{ width: `${Math.min(loadingProgress, 100)}%` }}
                >
                  {/* Animated shine effect */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    style={{ animation: 'shimmer 2s infinite' }}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center text-sm font-tactical">
                <span className="text-muted-foreground uppercase tracking-wider loading-pulse flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  Loading assets...
                </span>
                <span className="text-primary font-bold text-lg">
                  {Math.min(Math.floor(loadingProgress), 100)}%
                </span>
              </div>
            </>
          ) : (
            <>
              {/* Play button with enhanced styling */}
              <button
                onClick={onPlay}
                className="fps-button w-full py-5 text-2xl md:text-3xl text-primary-foreground rounded animate-pulse-glow flex items-center justify-center gap-4 group"
              >
                <Play className="w-8 h-8 group-hover:scale-110 transition-transform" fill="currentColor" />
                DEPLOY
              </button>
              
              {/* Controls hint - better layout */}
              <div className="grid grid-cols-2 gap-3 text-center text-xs font-tactical text-muted-foreground uppercase tracking-wider">
                <div className="hud-element p-4 rounded flex items-center justify-center gap-3">
                  <div className="flex gap-1">
                    <kbd className="px-2 py-1 bg-primary/20 rounded text-primary border border-primary/30">W</kbd>
                    <kbd className="px-2 py-1 bg-primary/20 rounded text-primary border border-primary/30">A</kbd>
                    <kbd className="px-2 py-1 bg-primary/20 rounded text-primary border border-primary/30">S</kbd>
                    <kbd className="px-2 py-1 bg-primary/20 rounded text-primary border border-primary/30">D</kbd>
                  </div>
                  <span>Move</span>
                </div>
                <div className="hud-element p-4 rounded flex items-center justify-center gap-3">
                  <MousePointer className="w-4 h-4 text-primary" />
                  <span>Look Around</span>
                </div>
                <div className="hud-element p-4 rounded flex items-center justify-center gap-3">
                  <Target className="w-4 h-4 text-primary" />
                  <span>LMB - Shoot</span>
                </div>
                <div className="hud-element p-4 rounded flex items-center justify-center gap-3">
                  <Eye className="w-4 h-4 text-primary" />
                  <span>RMB - Scope</span>
                </div>
              </div>

              {/* EXE Tutorial button */}
              <button
                onClick={onShowExeTutorial}
                className="w-full py-3 text-sm text-muted-foreground hover:text-primary border border-muted/30 hover:border-primary/50 rounded transition-all flex items-center justify-center gap-2 font-tactical uppercase tracking-wider"
              >
                <Download className="w-4 h-4" />
                How to convert to .EXE
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-muted-foreground/50 text-xs font-tactical tracking-widest mt-4">
          © 2024 TACTICAL ASSAULT - ALL RIGHTS RESERVED
        </p>
      </div>

      {/* Decorative corner elements - enhanced */}
      <div className="absolute top-4 left-4 w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary/80 to-transparent" />
        <div className="absolute top-0 left-0 h-full w-0.5 bg-gradient-to-b from-primary/80 to-transparent" />
      </div>
      <div className="absolute top-4 right-4 w-16 h-16">
        <div className="absolute top-0 right-0 w-full h-0.5 bg-gradient-to-l from-primary/80 to-transparent" />
        <div className="absolute top-0 right-0 h-full w-0.5 bg-gradient-to-b from-primary/80 to-transparent" />
      </div>
      <div className="absolute bottom-4 left-4 w-16 h-16">
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary/80 to-transparent" />
        <div className="absolute bottom-0 left-0 h-full w-0.5 bg-gradient-to-t from-primary/80 to-transparent" />
      </div>
      <div className="absolute bottom-4 right-4 w-16 h-16">
        <div className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-l from-primary/80 to-transparent" />
        <div className="absolute bottom-0 right-0 h-full w-0.5 bg-gradient-to-t from-primary/80 to-transparent" />
      </div>

      {/* Status indicators */}
      <div className="absolute top-4 right-20 text-xs font-tactical text-primary/50 uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          Systems Online
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;