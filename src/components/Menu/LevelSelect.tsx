import React, { useEffect, useState } from 'react';
import { Button } from '../UI/Button';
import { IndexedDBManager } from '../../store/db/IndexedDBManager';
import { PlayerData, LevelProgress } from '../../store/db/schemas';

interface LevelSelectProps {
  onSelectLevel: (level: number) => void;
  onBack: () => void;
}

export function LevelSelect({ onSelectLevel, onBack }: LevelSelectProps) {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [levelProgress, setLevelProgress] = useState<Map<number, LevelProgress>>(new Map());
  const [selectedLevel, setSelectedLevel] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const db = IndexedDBManager.getInstance();
    const data = await db.getPlayerData();
    const progress = await db.getAllLevelProgress();

    setPlayerData(data);

    const progressMap = new Map<number, LevelProgress>();
    progress.forEach(p => progressMap.set(p.levelNumber, p));
    setLevelProgress(progressMap);

    setSelectedLevel(data.highestLevelUnlocked);
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  };

  const menuStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '40px',
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
    minWidth: '400px',
    maxHeight: '80vh',
    overflow: 'auto'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '20px'
  };

  const levelGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '10px',
    marginBottom: '20px'
  };

  const renderLevelButton = (levelNum: number) => {
    const isUnlocked = playerData && levelNum <= playerData.highestLevelUnlocked;
    const progress = levelProgress.get(levelNum);
    const isCompleted = progress?.completed || false;
    const stars = progress?.stars || 0;

    const buttonStyle: React.CSSProperties = {
      padding: '15px',
      border: selectedLevel === levelNum ? '3px solid #667eea' : '2px solid #ddd',
      borderRadius: '8px',
      background: isCompleted ? '#4CAF50' : isUnlocked ? '#fff' : '#ccc',
      cursor: isUnlocked ? 'pointer' : 'not-allowed',
      opacity: isUnlocked ? 1 : 0.5,
      transition: 'all 0.2s'
    };

    return (
      <div
        key={levelNum}
        style={buttonStyle}
        onClick={() => isUnlocked && setSelectedLevel(levelNum)}
        onMouseEnter={(e) => {
          if (isUnlocked) {
            e.currentTarget.style.transform = 'scale(1.05)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <div style={{ fontWeight: 'bold', fontSize: '18px', textAlign: 'center' }}>
          {levelNum}
        </div>
        {isCompleted && (
          <div style={{ fontSize: '14px', color: '#FFD700', textAlign: 'center' }}>
            {'★'.repeat(stars)}
          </div>
        )}
      </div>
    );
  };

  const levels = playerData
    ? Array.from({ length: Math.min(playerData.highestLevelUnlocked + 5, 50) }, (_, i) => i + 1)
    : [1];

  return (
    <div style={containerStyle}>
      <div style={menuStyle}>
        <h2 style={titleStyle}>Select Level</h2>

        <div style={levelGridStyle}>
          {levels.map(renderLevelButton)}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <Button onClick={() => onSelectLevel(selectedLevel)}>
            Play Level {selectedLevel}
          </Button>
          <Button onClick={onBack} variant="secondary">
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
