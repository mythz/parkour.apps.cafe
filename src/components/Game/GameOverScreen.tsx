import React from 'react';
import { Button } from '../UI/Button';
import { RaceResult } from '../../game/core/GameEngine';

interface GameOverScreenProps {
  result: RaceResult;
  onReplay: () => void;
  onNextLevel: () => void;
  onMenu: () => void;
}

export function GameOverScreen({ result, onReplay, onNextLevel, onMenu }: GameOverScreenProps) {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
    textAlign: 'center',
    minWidth: '400px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: result.position === 1 ? '#4CAF50' : result.position <= 3 ? '#FF9800' : '#f44336'
  };

  const statStyle: React.CSSProperties = {
    fontSize: '18px',
    margin: '10px 0',
    color: '#666'
  };

  const coinsStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#FFD700',
    margin: '20px 0'
  };

  const buttonContainer: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '30px'
  };

  const getPositionText = () => {
    if (result.position === 1) return '1st Place! 🏆';
    if (result.position === 2) return '2nd Place! 🥈';
    if (result.position === 3) return '3rd Place! 🥉';
    return `${result.position}th Place`;
  };

  const getStars = () => {
    if (result.position === 1) return '★★★';
    if (result.position === 2) return '★★☆';
    if (result.position <= 4) return '★☆☆';
    return '☆☆☆';
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>{getPositionText()}</h1>

        <div style={{ fontSize: '40px', margin: '20px 0' }}>
          {getStars()}
        </div>

        <div style={statStyle}>
          Level {result.levelNumber} Complete
        </div>

        <div style={statStyle}>
          Time: {result.completionTime.toFixed(2)}s
        </div>

        <div style={coinsStyle}>
          +{result.coinsEarned} coins
        </div>

        <div style={buttonContainer}>
          {result.position === 1 && (
            <Button onClick={onNextLevel}>
              Next Level
            </Button>
          )}

          <Button onClick={onReplay} variant="secondary">
            Replay Level
          </Button>

          <Button onClick={onMenu} variant="secondary">
            Main Menu
          </Button>
        </div>
      </div>
    </div>
  );
}
