import { useState } from 'react';
import LoadingScreen from '@/components/game/LoadingScreen';
import GameScene from '@/components/game/GameScene';

type GameState = 'loading' | 'playing' | 'gameover';

const Index = () => {
  const [gameState, setGameState] = useState<GameState>('loading');
  const [finalKills, setFinalKills] = useState(0);

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
        <LoadingScreen onPlay={handlePlay} />
      )}
      
      {gameState === 'playing' && (
        <GameScene onGameOver={handleGameOver} />
      )}

      {gameState === 'gameover' && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/90 z-50">
          <div className="text-center space-y-8">
            <h1 className="font-display text-6xl text-destructive">MISSION FAILED</h1>
            <p className="font-display text-4xl text-foreground">
              Eliminations: <span className="text-primary">{finalKills}</span>
            </p>
            <button
              onClick={handleRestart}
              className="fps-button px-12 py-4 text-xl text-primary-foreground rounded"
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
