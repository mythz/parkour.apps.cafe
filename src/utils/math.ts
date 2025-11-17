export interface Vector2 {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function distance(a: Vector2, b: Vector2): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function addVectors(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function subtractVectors(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scaleVector(v: Vector2, scalar: number): Vector2 {
  return { x: v.x * scalar, y: v.y * scalar };
}

export function normalize(v: Vector2): Vector2 {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}
