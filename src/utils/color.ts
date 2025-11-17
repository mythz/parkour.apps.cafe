export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export function hexToRgb(hex: string): Color {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 1
      }
    : { r: 0, g: 0, b: 0, a: 1 };
}

export function rgbToString(color: Color): string {
  const a = color.a !== undefined ? color.a : 1;
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${a})`;
}
