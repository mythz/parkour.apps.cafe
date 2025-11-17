import { useEffect, useState } from 'react';
import { MainMenu } from './components/Menu/MainMenu';
import { LevelSelect } from './components/Menu/LevelSelect';
import { Shop } from './components/Menu/Shop';
import { SettingsMenu } from './components/Menu/SettingsMenu';
import { GameCanvas } from './components/Game/GameCanvas';
import { GameOverScreen } from './components/Game/GameOverScreen';
import { IndexedDBManager } from './store/db/IndexedDBManager';
import { RaceResult } from './game/core/GameEngine';

type Screen = 'loading' | 'mainMenu' | 'levelSelect' | 'shop' | 'settings' | 'game' | 'gameOver';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('loading');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [gameResult, setGameResult] = useState<RaceResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  async function initializeApp() {
    try {
      // Initialize IndexedDB
      const db = IndexedDBManager.getInstance();
      await db.initialize();

      // Get player data to set initial level
      const playerData = await db.getPlayerData();
      setSelectedLevel(playerData.highestLevelUnlocked);

      setIsLoading(false);
      setCurrentScreen('mainMenu');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setIsLoading(false);
    }
  }

  function handleGameComplete(result: RaceResult) {
    setGameResult(result);
    setCurrentScreen('gameOver');
  }

  function handleNextLevel() {
    setSelectedLevel(selectedLevel + 1);
    setCurrentScreen('game');
  }

  function handleReplay() {
    setCurrentScreen('game');
  }

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold'
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
      {currentScreen === 'mainMenu' && (
        <MainMenu
          onStartGame={() => setCurrentScreen('levelSelect')}
          onOpenShop={() => setCurrentScreen('shop')}
          onOpenSettings={() => setCurrentScreen('settings')}
        />
      )}

      {currentScreen === 'levelSelect' && (
        <LevelSelect
          onSelectLevel={(level) => {
            setSelectedLevel(level);
            setCurrentScreen('game');
          }}
          onBack={() => setCurrentScreen('mainMenu')}
        />
      )}

      {currentScreen === 'shop' && (
        <Shop onBack={() => setCurrentScreen('mainMenu')} />
      )}

      {currentScreen === 'settings' && (
        <SettingsMenu onBack={() => setCurrentScreen('mainMenu')} />
      )}

      {currentScreen === 'game' && (
        <GameCanvas
          key={selectedLevel} // Force remount when level changes
          levelNumber={selectedLevel}
          onComplete={handleGameComplete}
          onQuit={() => setCurrentScreen('mainMenu')}
        />
      )}

      {currentScreen === 'gameOver' && gameResult && (
        <GameOverScreen
          result={gameResult}
          onReplay={handleReplay}
          onNextLevel={handleNextLevel}
          onMenu={() => setCurrentScreen('mainMenu')}
        />
      )}
    </div>
  );
}

export default App;
