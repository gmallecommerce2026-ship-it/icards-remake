// src/components/invitation/envelope/envelope.data.ts
export type Tone = 'yellow' | 'purple' | 'red' | 'blue' | 'pink' | 'green' | 'neutral' | 'dark';

export const TONES: { id: Tone; color: string }[] = [
  { id: 'yellow', color: '#f2c200' }, { id: 'red', color: '#d9261c' }, { id: 'pink', color: '#f08cae' },
  { id: 'purple', color: '#8f7bd6' }, { id: 'blue', color: '#3f64e0' }, { id: 'green', color: '#1f7a3d' },
  { id: 'neutral', color: '#e8e0d0' }, { id: 'dark', color: '#2b2b2e' },
];

export type EnvelopeOption = { id: string; name: string; color: string; tone: Tone };
export const ENVELOPES: EnvelopeOption[] = [
  { id: 'lemon', name: 'Lemon', color: '#f3e500', tone: 'yellow' },
  { id: 'lilac', name: 'Lilac', color: '#c4b2e6', tone: 'purple' },
  { id: 'coral', name: 'Coral', color: '#fb5b4d', tone: 'red' },
  { id: 'periwinkle', name: 'Periwinkle', color: '#c5c9f5', tone: 'blue' },
  { id: 'butter', name: 'Butter', color: '#f6e9a0', tone: 'yellow' },
  { id: 'graphite', name: 'Graphite', color: '#34363a', tone: 'dark' },
  { id: 'blush', name: 'Blush', color: '#f6dfd4', tone: 'neutral' },
  { id: 'smoke', name: 'Smoke', color: '#cfc6d0', tone: 'neutral' },
  { id: 'iris', name: 'Iris', color: '#8586e0', tone: 'purple' },
  { id: 'mist', name: 'Mist', color: '#9ad3d6', tone: 'blue' },
  { id: 'forest', name: 'Forest', color: '#1b6b34', tone: 'green' },
  { id: 'rose', name: 'Rose', color: '#ee9fb9', tone: 'pink' },
  { id: 'clay', name: 'Clay', color: '#d6a79c', tone: 'red' },
  { id: 'sand', name: 'Sand', color: '#ebe6c4', tone: 'neutral' },
  { id: 'cobalt', name: 'Cobalt', color: '#4a6de0', tone: 'blue' },
  { id: 'orchid', name: 'Orchid', color: '#d9aed3', tone: 'purple' },
  { id: 'sky', name: 'Sky', color: '#8ad1e8', tone: 'blue' },
];

export type LinerOption = { id: string; name: string; background: string; tone: Tone };
export const LINERS: LinerOption[] = [
  { id: 'lagoon', name: 'Lagoon', tone: 'green', background: 'radial-gradient(120% 90% at 15% 95%, #a6e85c 0%, transparent 55%), radial-gradient(90% 90% at 85% 30%, #1aa5f7 0%, transparent 60%), #3fbf6a' },
  { id: 'sunset', name: 'Sunset', tone: 'red', background: 'linear-gradient(160deg, #ffb347, #ff5e62 55%, #7a3cff)' },
  { id: 'confetti', name: 'Confetti', tone: 'pink', background: 'radial-gradient(circle at 20% 30%, #ff5e8a 3px, transparent 4px) 0 0/34px 34px, radial-gradient(circle at 70% 70%, #ffd23f 3px, transparent 4px) 0 0/34px 34px, radial-gradient(circle at 50% 10%, #3fa7ff 2.5px, transparent 3.5px) 0 0/34px 34px, #fff7ec' },
  { id: 'stripes', name: 'Stripes', tone: 'blue', background: 'repeating-linear-gradient(90deg, #1f3a8a 0 14px, #f4f1ea 14px 28px)' },
  { id: 'midnight', name: 'Midnight', tone: 'dark', background: 'radial-gradient(circle at 30% 40%, #fff 1px, transparent 1.6px) 0 0/40px 40px, radial-gradient(circle at 75% 75%, #ffe 1.2px, transparent 2px) 0 0/55px 55px, linear-gradient(180deg, #1b1f4b, #0b0d24)' },
  { id: 'blush', name: 'Blush', tone: 'pink', background: 'linear-gradient(135deg, #ffe3ea, #f7b7c8)' },
  { id: 'cream', name: 'Cream', tone: 'neutral', background: '#fbf6ea' },
  { id: 'plaid', name: 'Plaid', tone: 'red', background: 'repeating-linear-gradient(0deg, rgb(200 40 40 / .45) 0 10px, transparent 10px 30px), repeating-linear-gradient(90deg, rgb(200 40 40 / .45) 0 10px, transparent 10px 30px), #f7efe1' },
];

export const PAGE = { w: 500, h: 700 };