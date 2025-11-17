import React from 'react';

interface CoinDisplayProps {
  coins: number;
}

export function CoinDisplay({ coins }: CoinDisplayProps) {
  const style: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '20px',
    color: '#000',
    boxShadow: '0 4px 10px rgba(255, 215, 0, 0.3)'
  };

  const coinStyle: React.CSSProperties = {
    width: '24px',
    height: '24px',
    background: '#FFD700',
    borderRadius: '50%',
    border: '2px solid #FFA500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px'
  };

  return (
    <div style={style}>
      <div style={coinStyle}>¢</div>
      <span>{coins.toLocaleString()}</span>
    </div>
  );
}
