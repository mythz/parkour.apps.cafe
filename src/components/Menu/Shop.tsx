import React, { useEffect, useState } from 'react';
import { Button } from '../UI/Button';
import { CoinDisplay } from '../UI/CoinDisplay';
import { IndexedDBManager } from '../../store/db/IndexedDBManager';
import { PlayerData } from '../../store/db/schemas';
import { OUTFITS, OutfitData } from '../../data/outfits';

interface ShopProps {
  onBack: () => void;
}

export function Shop({ onBack }: ShopProps) {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [selectedOutfit, setSelectedOutfit] = useState<string>('default');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    loadShopData();
  }, []);

  async function loadShopData() {
    const db = IndexedDBManager.getInstance();
    const data = await db.getPlayerData();
    setPlayerData(data);
    setSelectedOutfit(data.currentOutfit);
  }

  async function handlePurchase(outfitId: string) {
    const db = IndexedDBManager.getInstance();
    const success = await db.purchaseOutfit(outfitId);

    if (success) {
      await loadShopData();
      setMessage('Outfit purchased successfully!');
      setTimeout(() => setMessage(''), 2000);
    } else {
      setMessage('Not enough coins!');
      setTimeout(() => setMessage(''), 2000);
    }
  }

  async function handleEquip(outfitId: string) {
    if (!playerData) return;

    const db = IndexedDBManager.getInstance();
    playerData.currentOutfit = outfitId;
    await db.savePlayerData(playerData);
    setSelectedOutfit(outfitId);
    setMessage('Outfit equipped!');
    setTimeout(() => setMessage(''), 2000);
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  };

  const shopStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '900px',
    padding: '30px',
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '20px'
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
  };

  const renderOutfitCard = (outfit: OutfitData) => {
    const isOwned = playerData?.unlockedOutfits.includes(outfit.id);
    const isEquipped = selectedOutfit === outfit.id;

    const cardStyle: React.CSSProperties = {
      padding: '20px',
      border: isEquipped ? '3px solid #FFD700' : '2px solid #ddd',
      borderRadius: '12px',
      background: '#fff',
      transition: 'transform 0.2s'
    };

    const previewStyle: React.CSSProperties = {
      width: '100%',
      height: '100px',
      background: outfit.colors.primary,
      borderRadius: '8px',
      marginBottom: '15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    };

    const characterStyle: React.CSSProperties = {
      width: '30px',
      height: '50px',
      background: outfit.colors.primary,
      border: `3px solid ${outfit.colors.secondary}`,
      borderRadius: '4px',
      position: 'relative'
    };

    return (
      <div
        key={outfit.id}
        style={cardStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <div style={previewStyle}>
          <div style={characterStyle}>
            <div
              style={{
                width: '10px',
                height: '10px',
                background: outfit.colors.accent,
                borderRadius: '50%',
                position: 'absolute',
                top: '5px',
                left: '50%',
                transform: 'translateX(-50%)'
              }}
            />
          </div>
        </div>

        <h3 style={{ fontSize: '16px', marginBottom: '10px', textAlign: 'center' }}>
          {outfit.name}
        </h3>

        {isOwned ? (
          <Button
            onClick={() => handleEquip(outfit.id)}
            variant={isEquipped ? 'primary' : 'secondary'}
          >
            {isEquipped ? 'Equipped' : 'Equip'}
          </Button>
        ) : (
          <div>
            <p style={{ textAlign: 'center', marginBottom: '10px', fontWeight: 'bold' }}>
              {outfit.cost} coins
            </p>
            <Button onClick={() => handlePurchase(outfit.id)}>
              Purchase
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <div style={shopStyle}>
        <div style={headerStyle}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Outfit Shop</h1>
          {playerData && <CoinDisplay coins={playerData.coins} />}
        </div>

        {message && (
          <div
            style={{
              padding: '15px',
              background: '#4CAF50',
              color: 'white',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          >
            {message}
          </div>
        )}

        <div style={gridStyle}>
          {OUTFITS.map(renderOutfitCard)}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Button onClick={onBack} variant="secondary">
            Back to Menu
          </Button>
        </div>
      </div>
    </div>
  );
}
