// Database schemas

export interface PlayerData {
  id: 'current-player';
  coins: number;
  highestLevelUnlocked: number;
  currentOutfit: string;
  unlockedOutfits: string[];
  createdAt: number;
  lastPlayed: number;
}

export interface LevelProgress {
  levelNumber: number; // Primary key
  bestTime: number | null;
  bestPosition: number | null; // 1-6
  attempts: number;
  completed: boolean;
  stars: number; // 0-3 based on performance
}

export interface GameSettings {
  id: 'settings';
  musicVolume: number; // 0-1
  sfxVolume: number; // 0-1
  showTutorial: boolean;
  controlScheme: 'keyboard' | 'touch';
  difficulty: 'easy' | 'normal' | 'hard';
}

export interface LocalStorageBackup {
  coins: number;
  highestLevel: number;
  timestamp: number;
}
