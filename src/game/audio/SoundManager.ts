export type SoundType = 'jump' | 'land' | 'slide' | 'climb' | 'coin' | 'powerup' | 'hit' | 'finish' | 'countdown';

export class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<SoundType, AudioBuffer> = new Map();
  private sfxVolume: number = 0.8;
  private enabled: boolean = true;

  constructor() {
    // Lazy initialization - create on first use
  }

  private initAudioContext(): void {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.generateSounds();
    }
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  private generateSounds(): void {
    if (!this.audioContext) return;

    this.sounds.set('jump', this.createJumpSound());
    this.sounds.set('land', this.createLandSound());
    this.sounds.set('slide', this.createSlideSound());
    this.sounds.set('climb', this.createClimbSound());
    this.sounds.set('coin', this.createCoinSound());
    this.sounds.set('powerup', this.createPowerupSound());
    this.sounds.set('hit', this.createHitSound());
    this.sounds.set('finish', this.createFinishSound());
    this.sounds.set('countdown', this.createCountdownSound());
  }

  private createJumpSound(): AudioBuffer {
    const duration = 0.15;
    const sampleRate = this.audioContext!.sampleRate;
    const buffer = this.audioContext!.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 400 + (600 * (1 - t / duration));
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 8);
    }

    return buffer;
  }

  private createLandSound(): AudioBuffer {
    const duration = 0.1;
    const sampleRate = this.audioContext!.sampleRate;
    const buffer = this.audioContext!.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 150 - (100 * (t / duration));
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 15) * 0.5;
    }

    return buffer;
  }

  private createSlideSound(): AudioBuffer {
    const duration = 0.2;
    const sampleRate = this.audioContext!.sampleRate;
    const buffer = this.audioContext!.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      // Create a whoosh sound
      const noise = (Math.random() - 0.5) * 2;
      data[i] = noise * Math.exp(-t * 5) * 0.3;
    }

    return buffer;
  }

  private createClimbSound(): AudioBuffer {
    const duration = 0.12;
    const sampleRate = this.audioContext!.sampleRate;
    const buffer = this.audioContext!.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 300 + (200 * (t / duration));
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 10) * 0.4;
    }

    return buffer;
  }

  private createCoinSound(): AudioBuffer {
    const duration = 0.2;
    const sampleRate = this.audioContext!.sampleRate;
    const buffer = this.audioContext!.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 800 + (400 * Math.sin(t * 100));
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 5) * 0.3;
    }

    return buffer;
  }

  private createPowerupSound(): AudioBuffer {
    const duration = 0.3;
    const sampleRate = this.audioContext!.sampleRate;
    const buffer = this.audioContext!.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 400 + (800 * (t / duration));
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 4) * 0.4;
    }

    return buffer;
  }

  private createHitSound(): AudioBuffer {
    const duration = 0.15;
    const sampleRate = this.audioContext!.sampleRate;
    const buffer = this.audioContext!.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 100 - (50 * (t / duration));
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 10) * 0.6;
    }

    return buffer;
  }

  private createFinishSound(): AudioBuffer {
    const duration = 0.5;
    const sampleRate = this.audioContext!.sampleRate;
    const buffer = this.audioContext!.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 523 + (200 * Math.sin(t * 20)); // C note
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 3) * 0.4;
    }

    return buffer;
  }

  private createCountdownSound(): AudioBuffer {
    const duration = 0.1;
    const sampleRate = this.audioContext!.sampleRate;
    const buffer = this.audioContext!.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 600;
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 15) * 0.5;
    }

    return buffer;
  }

  play(sound: SoundType, volume: number = 1.0): void {
    if (!this.enabled) return;

    // Initialize on first play (user interaction required)
    if (!this.audioContext) {
      this.initAudioContext();
    }

    const buffer = this.sounds.get(sound);
    if (!buffer || !this.audioContext) return;

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = buffer;
      gainNode.gain.value = this.sfxVolume * volume;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      source.start();
    } catch (e) {
      console.warn('Failed to play sound:', e);
    }
  }

  // Play sound with pitch variation
  playVaried(sound: SoundType, pitchVariation: number = 0.1): void {
    if (!this.enabled || !this.audioContext) return;

    const buffer = this.sounds.get(sound);
    if (!buffer) return;

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = buffer;
      source.playbackRate.value = 1 + (Math.random() - 0.5) * pitchVariation;
      gainNode.gain.value = this.sfxVolume;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      source.start();
    } catch (e) {
      console.warn('Failed to play sound:', e);
    }
  }
}

// Singleton instance
let soundManagerInstance: SoundManager | null = null;

export function getSoundManager(): SoundManager {
  if (!soundManagerInstance) {
    soundManagerInstance = new SoundManager();
  }
  return soundManagerInstance;
}
