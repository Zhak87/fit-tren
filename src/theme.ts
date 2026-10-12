export const colors = {
  bg: '#0B0C0F',
  surface: '#15171C',
  surface2: '#1E2128',
  border: '#2A2E37',
  text: '#F4F5F7',
  textDim: '#A3A8B4',
  textMuted: '#6B7180',
  accent: '#C8FF3D',
  accentDim: 'rgba(200,255,61,0.14)',
  onAccent: '#0B0C0F',
  danger: '#FF5C5C',
  warning: '#FFB547',
  info: '#5CC8FF',
  protein: '#5CC8FF',
  fat: '#FFB547',
  carbs: '#B18CFF',
  muscleIdle: '#2A2E37',
  muscleIdleStroke: '#3A3F4A',
  bodyBase: '#1A1D23',
};

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 };
export const space = (n: number) => n * 4;

export const font = {
  h1: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.8, color: colors.text },
  h2: { fontSize: 24, fontWeight: '800' as const, letterSpacing: -0.5, color: colors.text },
  h3: { fontSize: 18, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 15, lineHeight: 22, color: colors.text },
  small: { fontSize: 13, lineHeight: 18, color: colors.textDim },
  label: { fontSize: 12, fontWeight: '700' as const, letterSpacing: 1, textTransform: 'uppercase' as const, color: colors.textMuted },
  num: { fontSize: 28, fontWeight: '800' as const, color: colors.text, fontVariant: ['tabular-nums' as const] },
};
