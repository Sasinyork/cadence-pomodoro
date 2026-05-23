import type { Mode, Theme, Palette, SurfaceTokens, ModeTokens } from '../types';

export const MODES: Record<Mode, ModeTokens> = {
  focus: { light: '#FEE2E2', main: '#EF4444', dark: '#DC2626', label: 'Focus', short: 'POMODORO' },
  short: { light: '#D1FAE5', main: '#10B981', dark: '#059669', label: 'Short break', short: 'SHORT BREAK' },
  long:  { light: '#DBEAFE', main: '#3B82F6', dark: '#2563EB', label: 'Long break', short: 'LONG BREAK' },
};

export const PALETTES: Record<Palette, Record<Mode, string>> = {
  classic: { focus: '#EF4444', short: '#10B981', long: '#3B82F6' },
  sunset:  { focus: '#F97316', short: '#14B8A6', long: '#8B5CF6' },
  forest:  { focus: '#DC2626', short: '#65A30D', long: '#0891B2' },
  candy:   { focus: '#EC4899', short: '#22D3EE', long: '#6366F1' },
};

export const PRIORITY_COLORS: Record<string, string> = {
  high: '#F59E0B',
  medium: '#8B5CF6',
  low: '#6B7280',
};

export const SURFACE: Record<Theme, SurfaceTokens> = {
  light: {
    bg: '#FAFAFA', surface: '#FFFFFF', surfaceAlt: '#F5F5F5', border: '#E5E5E5', borderSoft: '#EFEFEF',
    text: '#171717', textMuted: '#737373', textFaint: '#A3A3A3',
    shadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
    shadowLift: '0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
  },
  dark: {
    bg: '#0A0A0A', surface: '#171717', surfaceAlt: '#1F1F1F', border: '#262626', borderSoft: '#1F1F1F',
    text: '#FAFAFA', textMuted: '#A3A3A3', textFaint: '#737373',
    shadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(0,0,0,0.5)',
    shadowLift: '0 1px 0 rgba(255,255,255,0.06) inset, 0 12px 32px rgba(0,0,0,0.6)',
  },
};

export function getAccent(mode: Mode, palette: Palette): string {
  return PALETTES[palette][mode];
}

export function alpha(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}
