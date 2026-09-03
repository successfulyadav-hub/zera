export function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function deriveThemeFromColors(
  bgHex: string,
  accentHex: string,
  isDark: boolean,
) {
  const bg = hexToHSL(bgHex);
  const accent = hexToHSL(accentHex);

  if (isDark) {
    const darkBg = hslToHex(bg.h, Math.min(bg.s, 10), 10);
    const darkSurface = hslToHex(bg.h, Math.min(bg.s, 10), 14);
    const darkAccent = hslToHex(accent.h, Math.min(accent.s, 45), 60);
    const darkAccentSoft = hslToHex(accent.h, Math.min(accent.s, 20), 16);
    return {
      bg: darkBg,
      surface: darkSurface,
      ink: '#E8E5DE',
      stone: '#9C9890',
      sage: darkAccent,
      sageSoft: darkAccentSoft,
      divider: 'rgba(200, 195, 188, 0.10)',
      shadow: 'rgba(0, 0, 0, 0.25)',
      shadowDeep: 'rgba(0, 0, 0, 0.45)',
      error: '#D4877A',
    };
  }

  const lightBg = hslToHex(bg.h, Math.min(bg.s, 30), Math.max(bg.l, 94));
  const lightSurface = hslToHex(bg.h, Math.min(bg.s, 25), Math.max(bg.l - 4, 90));
  const lightAccent = hslToHex(accent.h, Math.min(accent.s, 40), Math.min(Math.max(accent.l, 40), 55));
  const lightAccentSoft = hslToHex(accent.h, Math.min(accent.s, 30), 90);
  return {
    bg: lightBg,
    surface: lightSurface,
    ink: '#1A1A1A',
    stone: '#8C8780',
    sage: lightAccent,
    sageSoft: lightAccentSoft,
    divider: 'rgba(140, 135, 128, 0.15)',
    shadow: 'rgba(30, 28, 24, 0.08)',
    shadowDeep: 'rgba(30, 28, 24, 0.16)',
    error: '#BF6B5A',
  };
}

export function clampToPastel(hex: string): string {
  const { h, s, l } = hexToHSL(hex);
  return hslToHex(h, Math.min(s, 50), Math.max(l, 75));
}

export function clampAccent(hex: string): string {
  const { h, s, l } = hexToHSL(hex);
  return hslToHex(h, Math.min(Math.max(s, 15), 50), Math.min(Math.max(l, 35), 60));
}
