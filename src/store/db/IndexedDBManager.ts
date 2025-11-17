import { PlayerData, LevelProgress, GameSettings } from './schemas';
import { OUTFITS, OutfitData } from '../../data/outfits';

export class IndexedDBManager {
  private static instance: IndexedDBManager;
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'parkour-race-db';
  private readonly DB_VERSION = 1;

  private constructor() {}

  static getInstance(): IndexedDBManager {
    if (!IndexedDBManager.instance) {
      IndexedDBManager.instance = new IndexedDBManager();
    }
    return IndexedDBManager.instance;
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('playerData')) {
          db.createObjectStore('playerData', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('levelProgress')) {
          db.createObjectStore('levelProgress', { keyPath: 'levelNumber' });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('outfits')) {
          db.createObjectStore('outfits', { keyPath: 'id' });
        }

        // Initialize default data in the upgrade transaction
        const transaction = (event.target as IDBOpenDBRequest).transaction!;
        this.initializeDefaultData(transaction);
      };
    });
  }

  private initializeDefaultData(transaction: IDBTransaction): void {
    // Default player data
    const playerData: PlayerData = {
      id: 'current-player',
      coins: 0,
      highestLevelUnlocked: 1,
      currentOutfit: 'default',
      unlockedOutfits: ['default'],
      createdAt: Date.now(),
      lastPlayed: Date.now()
    };

    try {
      transaction.objectStore('playerData').add(playerData);
    } catch (e) {
      console.warn('Player data already exists');
    }

    // Default settings
    const settings: GameSettings = {
      id: 'settings',
      musicVolume: 0.7,
      sfxVolume: 0.8,
      showTutorial: true,
      controlScheme: 'keyboard',
      difficulty: 'normal'
    };

    try {
      transaction.objectStore('settings').add(settings);
    } catch (e) {
      console.warn('Settings already exist');
    }

    // Initialize all outfits
    const outfitStore = transaction.objectStore('outfits');
    OUTFITS.forEach(outfit => {
      try {
        outfitStore.add(outfit);
      } catch (e) {
        console.warn(`Outfit ${outfit.id} already exists`);
      }
    });
  }

  async getPlayerData(): Promise<PlayerData> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction('playerData', 'readonly');
    const store = transaction.objectStore('playerData');

    return new Promise((resolve, reject) => {
      const request = store.get('current-player');
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result);
        } else {
          // If no data exists, create default
          const defaultData: PlayerData = {
            id: 'current-player',
            coins: 0,
            highestLevelUnlocked: 1,
            currentOutfit: 'default',
            unlockedOutfits: ['default'],
            createdAt: Date.now(),
            lastPlayed: Date.now()
          };
          resolve(defaultData);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async savePlayerData(data: PlayerData): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    data.lastPlayed = Date.now();

    const transaction = this.db.transaction('playerData', 'readwrite');
    const store = transaction.objectStore('playerData');

    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => {
        // Backup to localStorage
        this.backupToLocalStorage(data);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getLevelProgress(levelNumber: number): Promise<LevelProgress> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction('levelProgress', 'readonly');
    const store = transaction.objectStore('levelProgress');

    return new Promise((resolve, reject) => {
      const request = store.get(levelNumber);
      request.onsuccess = () => {
        const result = request.result || {
          levelNumber,
          bestTime: null,
          bestPosition: null,
          attempts: 0,
          completed: false,
          stars: 0
        };
        resolve(result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveLevelProgress(progress: LevelProgress): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction('levelProgress', 'readwrite');
    const store = transaction.objectStore('levelProgress');

    return new Promise((resolve, reject) => {
      const request = store.put(progress);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllLevelProgress(): Promise<LevelProgress[]> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction('levelProgress', 'readonly');
    const store = transaction.objectStore('levelProgress');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getSettings(): Promise<GameSettings> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction('settings', 'readonly');
    const store = transaction.objectStore('settings');

    return new Promise((resolve, reject) => {
      const request = store.get('settings');
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result);
        } else {
          const defaultSettings: GameSettings = {
            id: 'settings',
            musicVolume: 0.7,
            sfxVolume: 0.8,
            showTutorial: true,
            controlScheme: 'keyboard',
            difficulty: 'normal'
          };
          resolve(defaultSettings);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveSettings(settings: GameSettings): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction('settings', 'readwrite');
    const store = transaction.objectStore('settings');

    return new Promise((resolve, reject) => {
      const request = store.put(settings);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getOutfits(): Promise<OutfitData[]> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction('outfits', 'readonly');
    const store = transaction.objectStore('outfits');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async purchaseOutfit(outfitId: string): Promise<boolean> {
    const playerData = await this.getPlayerData();
    const outfit = OUTFITS.find(o => o.id === outfitId);

    if (!outfit || playerData.coins < outfit.cost) {
      return false;
    }

    if (playerData.unlockedOutfits.includes(outfitId)) {
      return false; // Already owned
    }

    playerData.coins -= outfit.cost;
    playerData.unlockedOutfits.push(outfitId);

    await this.savePlayerData(playerData);

    // Update outfit unlock status
    if (this.db) {
      const transaction = this.db.transaction('outfits', 'readwrite');
      const store = transaction.objectStore('outfits');
      outfit.unlocked = true;
      await new Promise<void>((resolve, reject) => {
        const request = store.put(outfit);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    return true;
  }

  private backupToLocalStorage(data: PlayerData): void {
    try {
      localStorage.setItem('parkour-backup', JSON.stringify({
        coins: data.coins,
        highestLevel: data.highestLevelUnlocked,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('LocalStorage backup failed:', e);
    }
  }
}
