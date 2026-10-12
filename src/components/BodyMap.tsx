import { useMemo } from 'react';
import Svg, { Defs, Ellipse, G, LinearGradient, Path, Stop } from 'react-native-svg';
import { colors } from '../theme';
import type { MuscleId, Sex } from '../types';

/**
 * Схематичная анатомическая карта (вид спереди / сзади).
 * Фигуры задаются для левой половины тела и зеркалируются.
 * Женская модель получается плавной деформацией по высоте: уже плечи, шире таз.
 */

type Shape = { id: MuscleId; d: string };

const BASE = 'M100 46 L91 48 L91 60 C84 62 76 62 68 64 C54 66 46 78 46 92 L46 120 C46 134 46 144 47 150 C42 168 41 186 44 206 C42 216 44 228 50 230 C56 230 58 220 56 206 C60 190 63 170 64 154 C66 140 66 126 66 112 C68 132 70 152 70 170 C66 182 64 190 64 200 C62 236 64 268 68 300 C66 320 66 350 70 384 C66 390 66 398 72 402 L88 402 C92 398 90 390 87 384 C90 352 92 330 90 304 C94 270 97 236 98 206 L100 204 Z';

const FRONT: Shape[] = [
  { id: 'traps', d: 'M91 58 C86 62 80 64 74 66 C82 68 90 68 96 66 L96 60 Z' },
  { id: 'shoulders', d: 'M68 66 C56 68 48 78 48 92 C48 100 50 106 52 110 C56 100 62 90 72 82 C76 76 74 68 68 66 Z' },
  { id: 'chest', d: 'M98 70 L98 108 C88 112 76 112 68 106 C66 96 68 86 76 80 C84 74 92 70 98 70 Z' },
  { id: 'biceps', d: 'M52 114 C50 124 50 136 52 146 C56 150 62 148 64 142 C66 130 66 118 64 110 C60 108 56 110 52 114 Z' },
  { id: 'forearms', d: 'M48 154 C44 170 44 186 46 204 L55 204 C58 188 62 172 63 156 C60 150 52 150 48 154 Z' },
  { id: 'abs', d: 'M89 112 L98.5 112 L98.5 182 L91 183 C89 160 88 136 89 112 Z' },
  { id: 'obliques', d: 'M86.5 114 C80 114 74 112 68 110 C70 130 70 150 70 166 C76 176 82 182 88.5 185 C86.5 160 85.5 136 86.5 114 Z' },
  { id: 'quads', d: 'M68 198 C64 228 64 262 70 296 C76 304 84 302 88 294 C90 270 91 240 89 214 C86 204 78 198 68 198 Z' },
  { id: 'adductors', d: 'M91.5 208 C96 212 98 218 98 226 C96 246 94 262 91.5 276 C90.5 254 92 232 91.5 208 Z' },
  { id: 'calves', d: 'M70 316 C67 334 67 356 71 380 L80 380 C84 356 87 336 86 316 C80 310 74 310 70 316 Z' },
];

const BACK: Shape[] = [
  { id: 'shoulders', d: 'M68 66 C56 68 48 78 48 92 C48 100 50 106 52 110 C56 100 62 90 70 84 C72 76 72 68 68 66 Z' },
  { id: 'lats', d: 'M98.5 126 C92 104 84 90 73 86 C68 94 67 104 68 116 C70 136 76 154 86 166 L98.5 152 Z' },
  { id: 'traps', d: 'M100 50 L92 56 C84 62 77 64 71 66 C76 72 82 78 88 86 C93 96 97 108 100 122 Z' },
  { id: 'triceps', d: 'M52 112 C50 124 50 136 53 148 C58 150 63 146 64 140 C66 128 65 116 62 108 C58 106 54 108 52 112 Z' },
  { id: 'forearms', d: 'M48 154 C44 170 44 186 46 204 L55 204 C58 188 62 172 63 156 C60 150 52 150 48 154 Z' },
  { id: 'lowerback', d: 'M98.5 156 L89 167 C87 174 87 182 89 190 L98.5 190 Z' },
  { id: 'glutes', d: 'M98.5 193 C90 191 78 191 69 197 C64 207 64 222 70 232 C80 240 92 238 98.5 232 Z' },
  { id: 'hamstrings', d: 'M68 236 C64 256 66 280 70 298 C78 304 86 302 90 296 C92 276 94 256 94.5 240 C86 241 76 240 68 236 Z' },
  { id: 'calves', d: 'M70 314 C64 330 64 350 70 366 C76 372 84 370 88 362 C90 346 88 328 86 314 C80 308 74 308 70 314 Z' },
];

const FEMALE_K: [number, number][] = [
  [0, 0.92], [110, 0.88], [165, 0.9], [205, 1.09], [250, 1.06], [320, 0.97], [410, 0.95],
];

function kAt(y: number, sex: Sex) {
  if (sex === 'male') return 1;
  for (let i = 1; i < FEMALE_K.length; i++) {
    const [y0, k0] = FEMALE_K[i - 1];
    const [y1, k1] = FEMALE_K[i];
    if (y <= y1) return k0 + ((k1 - k0) * (Math.max(y, y0) - y0)) / (y1 - y0);
  }
  return FEMALE_K[FEMALE_K.length - 1][1];
}

/** Преобразует абсолютный путь (M/L/C/Z): деформация по полу и зеркалирование */
function transformPath(d: string, sex: Sex, mirror: boolean): string {
  const tokens = d.match(/[MLCZ]|-?\d*\.?\d+/g) ?? [];
  const out: string[] = [];
  let pending: number[] = [];
  for (const t of tokens) {
    if (/[MLCZ]/.test(t)) {
      out.push(t);
      continue;
    }
    pending.push(parseFloat(t));
    if (pending.length === 2) {
      const [x, y] = pending;
      let nx = 100 + (x - 100) * kAt(y, sex);
      if (mirror) nx = 200 - nx;
      out.push(`${nx.toFixed(1)} ${y}`);
      pending = [];
    }
  }
  return out.join(' ');
}

interface Props {
  sex: Sex;
  view: 'front' | 'back';
  selected: MuscleId | null;
  secondary?: MuscleId[];
  onSelect: (m: MuscleId) => void;
  height?: number;
}

export function BodyMap({ sex, view, selected, secondary = [], onSelect, height = 440 }: Props) {
  const shapes = view === 'front' ? FRONT : BACK;
  const paths = useMemo(() => {
    const base = [transformPath(BASE, sex, false), transformPath(BASE, sex, true)];
    const muscles = shapes.flatMap((s) => [
      { id: s.id, d: transformPath(s.d, sex, false), key: s.id + 'L' },
      { id: s.id, d: transformPath(s.d, sex, true), key: s.id + 'R' },
    ]);
    const absLines = [128, 146, 164].map((y) => transformPath(`M89 ${y} L98.5 ${y}`, sex, false) + ' ' + transformPath(`M89 ${y} L98.5 ${y}`, sex, true));
    return { base, muscles, absLines };
  }, [sex, shapes]);

  const fillFor = (id: MuscleId) => (id === selected ? 'url(#sel)' : secondary.includes(id) ? 'rgba(200,255,61,0.35)' : colors.muscleIdle);
  const width = (height * 200) / 420;

  return (
    <Svg width={width} height={height} viewBox="0 -2 200 420" accessibilityLabel="Карта мышц">
      <Defs>
        <LinearGradient id="sel" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#E4FF8A" />
          <Stop offset="1" stopColor={colors.accent} />
        </LinearGradient>
        <LinearGradient id="body" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#15181D" />
          <Stop offset="0.5" stopColor="#23272F" />
          <Stop offset="1" stopColor="#15181D" />
        </LinearGradient>
      </Defs>

      {/* голова и волосы */}
      <Ellipse cx={100} cy={30} rx={sex === 'female' ? 15 : 16} ry={20} fill="url(#body)" />
      {sex === 'female' ? (
        view === 'front' ? (
          <Path d="M84 30 C84 12 116 12 116 30 C116 22 108 16 100 16 C92 16 84 22 84 30 Z M84 30 C82 44 84 58 88 62 L90 40 Z M116 30 C118 44 116 58 112 62 L110 40 Z" fill="#2E323B" />
        ) : (
          <Path d="M84 32 C82 10 118 10 116 32 C118 46 114 62 100 66 C86 62 82 46 84 32 Z" fill="#2E323B" />
        )
      ) : (
        <Path d={view === 'front' ? 'M84 26 C84 10 116 10 116 26 C110 18 90 18 84 26 Z' : 'M84 30 C82 10 118 10 116 30 C112 36 88 36 84 30 Z'} fill="#2E323B" />
      )}

      <G>
        {paths.base.map((d, i) => (
          <Path key={i} d={d} fill="url(#body)" />
        ))}
      </G>

      {paths.muscles.map((m) => (
        <Path
          key={m.key}
          d={m.d}
          fill={fillFor(m.id)}
          stroke={m.id === selected ? colors.accent : colors.muscleIdleStroke}
          strokeWidth={0.8}
          onPress={() => onSelect(m.id)}
        />
      ))}

      {view === 'front' &&
        paths.absLines.map((d, i) => <Path key={i} d={d} stroke={colors.bg} strokeWidth={1.2} opacity={0.6} pointerEvents="none" />)}
    </Svg>
  );
}
