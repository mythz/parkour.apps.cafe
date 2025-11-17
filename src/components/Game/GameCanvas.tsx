import React, { useEffect, useRef, useState } from 'react';
import { GameEngine, RaceResult } from '../../game/core/GameEngine';
import { IndexedDBManager } from '../../store/db/IndexedDBManager';
import { OutfitData, OUTFITS } from '../../data/outfits';
import { Button } from '../UI/Button';
import { GAME_WIDTH, GAME_HEIGHT } from '../../data/constants';

interface GameCanvasProps {
  levelNumber: number;
  onComplete: (result: RaceResult) => void;
  onQuit: () => void;
}

export function GameCanvas({ levelNumber, onComplete, onQuit }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [playerOutfit, setPlayerOutfit] = useState<OutfitData>(OUTFITS[0]);

  useEffect(() => {
    loadPlayerOutfit();
  }, []);

  async function loadPlayerOutfit() {
    const db = IndexedDBManager.getInstance();
    const playerData = await db.getPlayerData();
    const outfit = OUTFITS.find(o => o.id === playerData.currentOutfit) || OUTFITS[0];
    setPlayerOutfit(outfit);
  }

  useEffect(() => {
    if (!canvasRef.current || !playerOutfit) return;

    // Initialize game engine
    engineRef.current = new GameEngine(canvasRef.current, levelNumber, playerOutfit);

    // Register callbacks
    engineRef.current.onCountdown = (count) => {
      setCountdown(count);
    };

    engineRef.current.onRaceComplete = async (result) => {
      // Save result to database
      const db = IndexedDBManager.getInstance();
      const playerData = await db.getPlayerData();
      playerData.coins += result.coinsEarned;

      if (result.position === 1 && result.levelNumber === playerData.highestLevelUnlocked) {
        playerData.highestLevelUnlocked++;
      }

      await db.savePlayerData(playerData);

      // Save level progress
      const progress = await db.getLevelProgress(result.levelNumber);
      const stars = result.position === 1 ? 3 : result.position === 2 ? 2 : result.position <= 4 ? 1 : 0;

      await db.saveLevelProgress({
        ...progress,
        bestTime: Math.min(progress.bestTime || Infinity, result.completionTime),
        bestPosition: Math.min(progress.bestPosition || 6, result.position),
        stars: Math.max(progress.stars, stars),
        attempts: progress.attempts + 1,
        completed: true
      });

      // Notify parent
      onComplete(result);
    };

    // Start game
    engineRef.current.start();

    return () => {
      engineRef.current?.destroy();
    };
  }, [levelNumber, playerOutfit]);

  useEffect(() => {
    if (engineRef.current) {
      if (isPaused) {
        engineRef.current.pause();
      } else {
        engineRef.current.resume();
      }
    }
  }, [isPaused]);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    position: 'relative'
  };

  const canvasContainerStyle: React.CSSProperties = {
    position: 'relative',
    border: '4px solid #2d3748',
    borderRadius: '8px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    background: '#000'
  };

  const pauseButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    padding: '10px 20px',
    background: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    border: '2px solid white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    zIndex: 10
  };

  const pauseMenuStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(0, 0, 0, 0.9)',
    padding: '40px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    alignItems: 'center',
    zIndex: 20
  };

  return (
    <div style={containerStyle}>
      <div style={canvasContainerStyle}>
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          style={{
            maxWidth: '100%',
            maxHeight: '90vh',
            display: 'block'
          }}
        />

        {!isPaused && countdown === null && (
          <button
            style={pauseButtonStyle}
            onClick={() => setIsPaused(true)}
          >
            PAUSE
          </button>
        )}

        {isPaused && (
          <div style={pauseMenuStyle}>
            <h2 style={{ color: 'white', fontSize: '32px', marginBottom: '20px' }}>PAUSED</h2>
            <Button onClick={() => setIsPaused(false)}>Resume</Button>
            <Button onClick={onQuit} variant="secondary">Quit to Menu</Button>
          </div>
        )}
      </div>
    </div>
  );
}
