export interface OutfitData {
  id: string;
  name: string;
  cost: number;
  unlocked: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const OUTFITS: OutfitData[] = [
  {
    id: 'default',
    name: 'Street Runner',
    cost: 0,
    unlocked: true,
    colors: { primary: '#FF6B6B', secondary: '#4ECDC4', accent: '#FFE66D' }
  },
  {
    id: 'ninja',
    name: 'Shadow Ninja',
    cost: 250,
    unlocked: false,
    colors: { primary: '#2C2C2C', secondary: '#FF0000', accent: '#FFFFFF' }
  },
  {
    id: 'cyber',
    name: 'Cyber Runner',
    cost: 500,
    unlocked: false,
    colors: { primary: '#00FFFF', secondary: '#FF00FF', accent: '#FFFF00' }
  },
  {
    id: 'gold',
    name: 'Golden Champion',
    cost: 1000,
    unlocked: false,
    colors: { primary: '#FFD700', secondary: '#FFA500', accent: '#FFFFE0' }
  },
  {
    id: 'forest',
    name: 'Forest Ranger',
    cost: 750,
    unlocked: false,
    colors: { primary: '#228B22', secondary: '#8B4513', accent: '#90EE90' }
  },
  {
    id: 'ocean',
    name: 'Ocean Wave',
    cost: 600,
    unlocked: false,
    colors: { primary: '#0077BE', secondary: '#00CED1', accent: '#B0E0E6' }
  },
  {
    id: 'fire',
    name: 'Flame Runner',
    cost: 800,
    unlocked: false,
    colors: { primary: '#FF4500', secondary: '#FFD700', accent: '#FFFF00' }
  },
  {
    id: 'ice',
    name: 'Ice Sprinter',
    cost: 700,
    unlocked: false,
    colors: { primary: '#E0FFFF', secondary: '#4682B4', accent: '#FFFFFF' }
  },
  {
    id: 'purple',
    name: 'Purple Haze',
    cost: 550,
    unlocked: false,
    colors: { primary: '#9370DB', secondary: '#8B008B', accent: '#DDA0DD' }
  },
  {
    id: 'neon',
    name: 'Neon Dreams',
    cost: 900,
    unlocked: false,
    colors: { primary: '#FF1493', secondary: '#00FF00', accent: '#FF00FF' }
  },
  {
    id: 'stealth',
    name: 'Stealth Ops',
    cost: 850,
    unlocked: false,
    colors: { primary: '#36454F', secondary: '#708090', accent: '#C0C0C0' }
  },
  {
    id: 'sunset',
    name: 'Sunset Runner',
    cost: 650,
    unlocked: false,
    colors: { primary: '#FF6347', secondary: '#FFA500', accent: '#FFD700' }
  },
  {
    id: 'mint',
    name: 'Mint Fresh',
    cost: 500,
    unlocked: false,
    colors: { primary: '#98FF98', secondary: '#00FA9A', accent: '#7FFFD4' }
  },
  {
    id: 'ruby',
    name: 'Ruby Racer',
    cost: 1200,
    unlocked: false,
    colors: { primary: '#E0115F', secondary: '#DC143C', accent: '#FFB6C1' }
  },
  {
    id: 'sapphire',
    name: 'Sapphire Speed',
    cost: 1100,
    unlocked: false,
    colors: { primary: '#0F52BA', secondary: '#4169E1', accent: '#87CEEB' }
  },
  {
    id: 'emerald',
    name: 'Emerald Flash',
    cost: 1150,
    unlocked: false,
    colors: { primary: '#50C878', secondary: '#2E8B57', accent: '#90EE90' }
  },
  {
    id: 'galaxy',
    name: 'Galaxy Runner',
    cost: 1500,
    unlocked: false,
    colors: { primary: '#4B0082', secondary: '#9400D3', accent: '#FF1493' }
  },
  {
    id: 'toxic',
    name: 'Toxic Waste',
    cost: 950,
    unlocked: false,
    colors: { primary: '#ADFF2F', secondary: '#7FFF00', accent: '#32CD32' }
  },
  {
    id: 'volcanic',
    name: 'Volcanic Ash',
    cost: 1050,
    unlocked: false,
    colors: { primary: '#8B0000', secondary: '#DC143C', accent: '#FFA500' }
  },
  {
    id: 'arctic',
    name: 'Arctic Fox',
    cost: 980,
    unlocked: false,
    colors: { primary: '#F0F8FF', secondary: '#B0C4DE', accent: '#87CEEB' }
  },
  {
    id: 'champion',
    name: 'Ultimate Champion',
    cost: 2000,
    unlocked: false,
    colors: { primary: '#FFD700', secondary: '#FF6347', accent: '#00FFFF' }
  }
];
