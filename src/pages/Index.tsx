import { useState } from 'react';
import LoadingScreen from '@/components/game/LoadingScreen';
import GameScene from '@/components/game/GameScene';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Skull, RotateCcw, BookOpen, Download, Terminal, Package } from 'lucide-react';

type GameState = 'loading' | 'playing' | 'gameover';

const Index = () => {
  const [gameState, setGameState] = useState<GameState>('loading');
  const [finalKills, setFinalKills] = useState(0);
  const [showExeTutorial, setShowExeTutorial] = useState(false);

  const handlePlay = () => {
    setGameState('playing');
  };

  const handleGameOver = (kills: number) => {
    setFinalKills(kills);
    setGameState('gameover');
  };

  const handleRestart = () => {
    setGameState('loading');
    setFinalKills(0);
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-background">
      {gameState === 'loading' && (
        <LoadingScreen onPlay={handlePlay} onShowExeTutorial={() => setShowExeTutorial(true)} />
      )}
      
      {gameState === 'playing' && (
        <GameScene onGameOver={handleGameOver} />
      )}

      {gameState === 'gameover' && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Background with blur */}
          <div className="absolute inset-0 bg-background/95 backdrop-blur-sm" />
          
          {/* Blood vignette effect */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 30%, hsl(0 80% 20% / 0.6) 100%)',
            }}
          />
          
          {/* Content */}
          <div className="relative z-10 text-center space-y-8 px-6">
            {/* Death icon */}
            <div className="flex justify-center">
              <div className="p-6 rounded-full bg-destructive/20 border-2 border-destructive/50 animate-pulse">
                <Skull className="w-16 h-16 text-destructive" />
              </div>
            </div>
            
            {/* Title */}
            <div>
              <h1 className="font-display text-5xl md:text-7xl text-destructive tracking-wider animate-pulse">
                MISSION FAILED
              </h1>
              <p className="text-muted-foreground font-tactical text-sm uppercase tracking-widest mt-2">
                You have been eliminated
              </p>
            </div>
            
            {/* Stats */}
            <div className="flex justify-center gap-8">
              <div className="hud-element px-8 py-4 rounded-lg text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Eliminations</p>
                <p className="font-display text-5xl text-primary">{finalKills}</p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRestart}
                className="fps-button px-10 py-4 text-lg text-primary-foreground rounded flex items-center justify-center gap-3 animate-pulse-glow"
              >
                <RotateCcw className="w-5 h-5" />
                TRY AGAIN
              </button>
            </div>
            
            {/* Tips */}
            <div className="text-muted-foreground/60 text-xs font-tactical uppercase tracking-wider">
              Tip: Use cover and aim for headshots
            </div>
          </div>
          
          {/* Decorative corners */}
          <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-destructive/50" />
          <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-destructive/50" />
          <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-destructive/50" />
          <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-destructive/50" />
        </div>
      )}

      {/* EXE Tutorial Dialog */}
      <Dialog open={showExeTutorial} onOpenChange={setShowExeTutorial}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-background border-primary/30">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-primary flex items-center gap-3">
              <Download className="w-6 h-6" />
              Convert to .EXE (Desktop App)
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Follow these steps to turn this game into a standalone Windows executable
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Step 1 */}
            <div className="hud-element p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-primary font-tactical uppercase text-sm">
                <Package className="w-4 h-4" />
                Step 1: Install Electron
              </div>
              <p className="text-sm text-muted-foreground">
                Electron allows you to package web apps as desktop applications.
              </p>
              <code className="block bg-secondary/50 p-3 rounded text-xs font-mono text-foreground overflow-x-auto">
                npm install electron electron-builder --save-dev
              </code>
            </div>

            {/* Step 2 */}
            <div className="hud-element p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-primary font-tactical uppercase text-sm">
                <Terminal className="w-4 h-4" />
                Step 2: Create main.js
              </div>
              <p className="text-sm text-muted-foreground">
                Create a file called <code className="text-primary">electron/main.js</code>:
              </p>
              <pre className="bg-secondary/50 p-3 rounded text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap">
{`const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true
    }
  });
  
  // Load your built game
  win.loadFile('dist/index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});`}
              </pre>
            </div>

            {/* Step 3 */}
            <div className="hud-element p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-primary font-tactical uppercase text-sm">
                <BookOpen className="w-4 h-4" />
                Step 3: Update package.json
              </div>
              <p className="text-sm text-muted-foreground">
                Add these to your package.json:
              </p>
              <pre className="bg-secondary/50 p-3 rounded text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap">
{`{
  "main": "electron/main.js",
  "scripts": {
    "electron:dev": "electron .",
    "electron:build": "npm run build && electron-builder"
  },
  "build": {
    "appId": "com.tactical.assault",
    "productName": "Tactical Assault",
    "win": {
      "target": "nsis",
      "icon": "public/favicon.ico"
    }
  }
}`}
              </pre>
            </div>

            {/* Step 4 */}
            <div className="hud-element p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-primary font-tactical uppercase text-sm">
                <Download className="w-4 h-4" />
                Step 4: Build the EXE
              </div>
              <p className="text-sm text-muted-foreground">
                Run these commands to create your executable:
              </p>
              <code className="block bg-secondary/50 p-3 rounded text-xs font-mono text-foreground">
                npm run build && npm run electron:build
              </code>
              <p className="text-sm text-muted-foreground mt-2">
                Your .exe will be in the <code className="text-primary">dist/</code> folder!
              </p>
            </div>

            {/* Note */}
            <div className="bg-primary/10 border border-primary/30 p-4 rounded-lg">
              <p className="text-sm text-foreground">
                <strong className="text-primary">Note:</strong> You'll need to export this project first. 
                In Lovable, go to Settings → Export to download your project files, then follow these steps locally.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;