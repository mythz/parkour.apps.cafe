import React, { useEffect, useState } from 'react';
import { Button } from '../UI/Button';
import { CoinDisplay } from '../UI/CoinDisplay';
import { IndexedDBManager } from '../../store/db/IndexedDBManager';
import { PlayerData } from '../../store/db/schemas';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenShop: () => void;
  onOpenSettings: () => void;
}

export function MainMenu({ onStartGame, onOpenShop, onOpenSettings }: MainMenuProps) {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);

  useEffect(() => {
    loadPlayerData();
  }, []);

  async function loadPlayerData() {
    const db = IndexedDBManager.getInstance();
    const data = await db.getPlayerData();
    setPlayerData(data);
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
    minWidth: '300px',
    alignItems: 'center'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '48px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '10px',
    textAlign: 'center'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '16px',
    color: '#666',
    marginBottom: '20px',
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      <div style={menuStyle}>
        <h1 style={titleStyle}>Parkour Race</h1>
        <p style={subtitleStyle}>Race through 1000 challenging levels!</p>

        {playerData && (
          <div style={{ marginBottom: '10px' }}>
            <CoinDisplay coins={playerData.coins} />
          </div>
        )}

        {playerData && (
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
            Level {playerData.highestLevelUnlocked} Unlocked
          </p>
        )}

        <Button onClick={onStartGame}>
          Start Game
        </Button>

        <Button onClick={onOpenShop} variant="secondary">
          Shop
        </Button>

        <Button onClick={onOpenSettings} variant="secondary">
          Settings
        </Button>

        <div style={{ marginTop: '20px', fontSize: '12px', color: '#999', textAlign: 'center' }}>
          <p>Controls: SPACE/↑ to jump, S/↓ to slide, W to climb</p>
          <p>Touch: Tap middle to jump, swipe down to slide</p>
        </div>
      </div>
    </div>
  );
}
