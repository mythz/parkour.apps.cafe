import { InputState } from '../entities/Player';

export class InputManager {
  private keys: Set<string> = new Set();
  private touchStartY: number = 0;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupKeyboardListeners();
    this.setupTouchListeners();
  }

  private setupKeyboardListeners(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);

      // Prevent default for game keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyS'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
  }

  private setupTouchListeners(): void {
    // Divide screen into zones
    // Left third: climb
    // Middle third: jump
    // Right third: slide
    // Swipe down: slide

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.touchStartY = touch.clientY;

      const zone = this.getTouchZone(touch.clientX);

      if (zone === 'jump') {
        this.keys.add('Space');
      } else if (zone === 'climb') {
        this.keys.add('KeyW');
      }
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const deltaY = touch.clientY - this.touchStartY;

      if (deltaY > 50) {
        // Swipe down = slide
        this.keys.delete('Space');
        this.keys.delete('KeyW');
        this.keys.add('KeyS');
      }
    });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.keys.clear();
    });
  }

  private getTouchZone(clientX: number): 'climb' | 'jump' | 'slide' {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const zoneWidth = rect.width / 3;

    if (x < zoneWidth) {
      return 'climb';
    } else if (x < zoneWidth * 2) {
      return 'jump';
    } else {
      return 'slide';
    }
  }

  getInputState(): InputState {
    return {
      jump: this.keys.has('Space') || this.keys.has('ArrowUp'),
      slide: this.keys.has('KeyS') || this.keys.has('ArrowDown'),
      climb: this.keys.has('KeyW')
    };
  }

  clear(): void {
    this.keys.clear();
  }

  destroy(): void {
    // Remove event listeners would go here
    // For simplicity, we'll rely on garbage collection
  }
}
