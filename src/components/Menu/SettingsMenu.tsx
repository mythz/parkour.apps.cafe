import React, { useEffect, useState } from 'react';
import { Button } from '../UI/Button';
import { IndexedDBManager } from '../../store/db/IndexedDBManager';
import { GameSettings } from '../../store/db/schemas';

interface SettingsMenuProps {
  onBack: () => void;
}

export function SettingsMenu({ onBack }: SettingsMenuProps) {
  const [settings, setSettings] = useState<GameSettings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const db = IndexedDBManager.getInstance();
    const data = await db.getSettings();
    setSettings(data);
  }

  async function saveSettings() {
    if (!settings) return;

    const db = IndexedDBManager.getInstance();
    await db.saveSettings(settings);
    onBack();
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
    padding: '40px',
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
    minWidth: '400px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '30px',
    textAlign: 'center'
  };

  const settingRowStyle: React.CSSProperties = {
    marginBottom: '20px'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#333'
  };

  if (!settings) {
    return <div>Loading...</div>;
  }

  return (
    <div style={containerStyle}>
      <div style={menuStyle}>
        <h2 style={titleStyle}>Settings</h2>

        <div style={settingRowStyle}>
          <label style={labelStyle}>
            Music Volume: {Math.round(settings.musicVolume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.musicVolume * 100}
            onChange={(e) => setSettings({
              ...settings,
              musicVolume: parseInt(e.target.value) / 100
            })}
            style={{ width: '100%' }}
          />
        </div>

        <div style={settingRowStyle}>
          <label style={labelStyle}>
            SFX Volume: {Math.round(settings.sfxVolume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.sfxVolume * 100}
            onChange={(e) => setSettings({
              ...settings,
              sfxVolume: parseInt(e.target.value) / 100
            })}
            style={{ width: '100%' }}
          />
        </div>

        <div style={settingRowStyle}>
          <label style={labelStyle}>Difficulty</label>
          <select
            value={settings.difficulty}
            onChange={(e) => setSettings({
              ...settings,
              difficulty: e.target.value as 'easy' | 'normal' | 'hard'
            })}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '2px solid #ddd',
              fontSize: '16px'
            }}
          >
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div style={settingRowStyle}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={settings.showTutorial}
              onChange={(e) => setSettings({
                ...settings,
                showTutorial: e.target.checked
              })}
            />
            <span style={{ fontWeight: 'bold' }}>Show Tutorial</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
          <Button onClick={saveSettings}>Save</Button>
          <Button onClick={onBack} variant="secondary">Cancel</Button>
        </div>
      </div>
    </div>
  );
}
