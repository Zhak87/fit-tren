// Ключевые позы для анимации техники. Углы в радианах (Euler XYZ относительно родителя).
// Тело смотрит в +Z. Сгибание бедра/плеча вперёд = отрицательный X; сгибание колена = положительный X;
// сгибание локтя = отрицательный X; наклон корпуса вперёд = положительный X; отведение левой руки = +Z.

export type Vec3 = [number, number, number];
type J =
  | 'root' | 'spine' | 'chest' | 'neck' | 'head'
  | 'shoulderL' | 'shoulderR' | 'elbowL' | 'elbowR' | 'handL' | 'handR'
  | 'hipL' | 'hipR' | 'kneeL' | 'kneeR' | 'ankleL' | 'ankleR';
export type Pose = Partial<Record<J, Vec3>> & { lift?: Partial<Record<string, Vec3>> };
export interface Pattern {
  a: Pose;
  b: Pose;
  ground?: { points: string[]; y: number; mode: 'min' | 'max' };
  center?: string[];
  scene?: ('bench' | 'pullbar' | 'seat' | 'dipbars' | 'thrustBench')[];
  view?: number; // азимут камеры, градусы (0 — спереди, 90 — сбоку)
  dur?: number;
  hold?: number;
  dbYaw?: number;
  forceProp?: 'none' | 'dumbbells' | 'barbell' | 'kettlebell';
  bar?: 'back' | 'front' | 'hips'; // где лежит штанга, если не в руках
}

const arms = (x: number, y: number, z: number): Pose => ({ shoulderL: [x, y, z], shoulderR: [x, -y, -z] });
const elbows = (x: number, y = 0, z = 0): Pose => ({ elbowL: [x, y, z], elbowR: [x, -y, -z] });
const hips = (x: number, y = 0, z = 0): Pose => ({ hipL: [x, y, z], hipR: [x, -y, -z] });
const knees = (x: number): Pose => ({ kneeL: [x, 0, 0], kneeR: [x, 0, 0] });
const ankles = (x: number): Pose => ({ ankleL: [x, 0, 0], ankleR: [x, 0, 0] });
const P = (...ps: Pose[]): Pose => Object.assign({}, ...ps);

const FEET = { points: ['heelL', 'heelR', 'toeL', 'toeR'], y: 0, mode: 'min' as const };
const BACK_BENCH = { points: ['chestBack', 'pelvisBack'], y: 0.45, mode: 'min' as const };
const BACK_FLOOR = { points: ['chestBack', 'pelvisBack', 'heelL', 'heelR', 'headTop'], y: 0, mode: 'min' as const };
const HANG = { points: ['handL', 'handR'], y: 2.25, mode: 'max' as const };
const PRONE = { points: ['handL', 'handR', 'toeL', 'toeR'], y: 0, mode: 'min' as const };
const SEAT = { points: ['seat'], y: 0.45, mode: 'min' as const };

const STAND_ARMS = P(arms(0.02, 0, 0.12), elbows(-0.15));
const HOLD_DOWN = P(arms(0, 0, 0.06), elbows(-0.05));

// наклон корпуса с прямой спиной: корпус rx, бедро так, чтобы бедро было почти вертикальным
const hinge = (lean: number, kneeBend: number, armsAbs = 0): Pose =>
  P({ root: [lean, 0, 0] }, hips(-lean - kneeBend * 0.5), knees(kneeBend), ankles(-(kneeBend * 0.5)), arms(armsAbs - lean, 0, 0.08), elbows(-0.05));

export const PATTERNS: Record<string, Pattern> = {
  rest: { a: P(STAND_ARMS, hips(0, 0, 0.03)), b: {} },

  squat: {
    a: P(arms(-1.5, 0, 0.1), elbows(0), hips(0, 0, 0.06)),
    b: P({ root: [0.45, 0, 0] }, arms(-1.95, 0, 0.1), elbows(0), hips(-1.85, 0, 0.18), knees(1.8), ankles(-0.4)),
    view: 70,
  },
  squat_bar: {
    a: P(arms(-1.57, 0, 1.75), elbows(-2.1), hips(0, 0, 0.06)),
    b: P({ root: [0.5, 0, 0] }, arms(-1.57, 0, 1.75), elbows(-2.1), hips(-1.9, 0, 0.18), knees(1.8), ankles(-0.4)),
    view: 60,
    forceProp: 'barbell',
    bar: 'back',
  },
  squat_front: {
    a: P(arms(-1.45, 0, 0.35), elbows(-2.45), hips(0, 0, 0.06)),
    b: P({ root: [0.3, 0, 0] }, arms(-1.45, 0, 0.35), elbows(-2.45), hips(-1.85, 0, 0.18), knees(1.85), ankles(-0.3)),
    view: 60,
    forceProp: 'barbell',
    bar: 'front',
  },
  goblet: {
    a: P(arms(-0.55, 0, 0.25), elbows(-2.0), hips(0, 0, 0.08)),
    b: P({ root: [0.35, 0, 0] }, arms(-0.9, 0, 0.25), elbows(-2.0), hips(-1.8, 0, 0.25), knees(1.85), ankles(-0.4)),
    view: 60,
    forceProp: 'kettlebell',
  },
  sumo: {
    a: P(HOLD_DOWN, hips(0, -0.5, 0.45), { ankleL: [0, 0.5, 0], ankleR: [0, -0.5, 0] }),
    b: P({ root: [0.2, 0, 0] }, arms(-0.2, 0, 0.05), elbows(0), hips(-1.25, -0.6, 0.55), knees(1.5), ankles(-0.3)),
    view: 25,
  },
  lunge: {
    a: P(HOLD_DOWN),
    b: P(HOLD_DOWN, { hipL: [-1.35, 0, 0.03], kneeL: [1.45, 0, 0], ankleL: [-0.1, 0, 0], hipR: [0.45, 0, -0.03], kneeR: [1.55, 0, 0], ankleR: [0.7, 0, 0] }),
    ground: { points: ['heelL', 'toeR'], y: 0, mode: 'min' },
    view: 75,
  },
  bulgarian: {
    a: P(HOLD_DOWN, { hipL: [-0.35, 0, 0], kneeL: [0.4, 0, 0], hipR: [0.55, 0, 0], kneeR: [1.2, 0, 0], ankleR: [0.9, 0, 0] }),
    b: P(HOLD_DOWN, { root: [0.25, 0, 0] }, { hipL: [-1.6, 0, 0], kneeL: [1.55, 0, 0], ankleL: [-0.2, 0, 0], hipR: [0.35, 0, 0], kneeR: [1.6, 0, 0], ankleR: [0.9, 0, 0] }),
    ground: { points: ['heelL', 'toeL'], y: 0, mode: 'min' },
    view: 75,
  },
  hinge: {
    a: P(HOLD_DOWN, hips(0, 0, 0.03), knees(0.15)),
    b: hinge(1.2, 0.3),
    view: 75,
  },
  deadlift: {
    a: P(HOLD_DOWN, hips(0, 0, 0.03), knees(0.05)),
    b: P({ root: [0.95, 0, 0] }, hips(-1.55, 0, 0.08), knees(0.95), ankles(-0.35), arms(-0.95, 0, 0.1), elbows(0)),
    view: 70,
    forceProp: 'barbell',
  },
  swing: {
    a: hinge(1.05, 0.45, 0.4),
    b: P(arms(-1.4, 0, 0.05), elbows(0), knees(0.05)),
    view: 75,
    forceProp: 'kettlebell',
    dur: 0.7,
    hold: 0.1,
  },
  pushup: {
    a: P({ root: [1.25, 0, 0] }, arms(-1.25, 0, 0.18), elbows(0), ankles(0.3)),
    b: P({ root: [1.5, 0, 0] }, arms(-0.4, 0, 0.45), elbows(-1.25, 0, 0), ankles(0.05)),
    ground: PRONE,
    view: 80,
  },
  pike: {
    a: P({ root: [2.1, 0, 0] }, arms(-2.6, 0, 0.15), elbows(0), hips(-1.6), ankles(-0.4)),
    b: P({ root: [2.35, 0, 0] }, arms(-1.9, 0, 0.35), elbows(-1.3), hips(-1.6), ankles(-0.6)),
    ground: PRONE,
    view: 85,
  },
  bench: {
    a: P({ root: [-1.57, 0, 0] }, arms(-1.57, 0, 0.12), elbows(0), knees(1.4), hips(-0.25, 0, 0.2)),
    b: P({ root: [-1.57, 0, 0] }, arms(-0.2, 0, 1.25), elbows(-1.6), knees(1.4), hips(-0.25, 0, 0.2)),
    ground: BACK_BENCH,
    scene: ['bench'],
    view: 35,
  },
  fly: {
    a: P({ root: [-1.57, 0, 0] }, arms(-1.57, 0, 0.05), elbows(-0.25), knees(1.4), hips(-0.25, 0, 0.2)),
    b: P({ root: [-1.57, 0, 0] }, arms(-1.4, 0, 1.4), elbows(-0.35), knees(1.4), hips(-0.25, 0, 0.2)),
    ground: BACK_BENCH,
    scene: ['bench'],
    view: 30,
  },
  skull: {
    a: P({ root: [-1.57, 0, 0] }, arms(-1.75, 0, 0.12), elbows(0), knees(1.4), hips(-0.25, 0, 0.2)),
    b: P({ root: [-1.57, 0, 0] }, arms(-1.95, 0, 0.12), elbows(-2.0), knees(1.4), hips(-0.25, 0, 0.2)),
    ground: BACK_BENCH,
    scene: ['bench'],
    view: 75,
  },
  ohp: {
    a: P(arms(-1.57, 0, 1.45), elbows(-1.75), hips(0, 0, 0.05)),
    b: P(arms(0, 0, 2.95), elbows(-0.08), hips(0, 0, 0.05)),
    view: 25,
  },
  lateral: {
    a: P(arms(0, 0, 0.12), elbows(-0.2), hips(0, 0, 0.05)),
    b: P(arms(-0.15, 0, 1.5), elbows(-0.2), hips(0, 0, 0.05)),
    view: 10,
  },
  reverse_fly: {
    a: P(hinge(1.15, 0.35, 0), arms(-1.15, 0, 0.1), elbows(-0.2)),
    b: P(hinge(1.15, 0.35, 0), arms(-1.15, 0, 1.4), elbows(-0.2)),
    view: 30,
  },
  face_pull: {
    a: P(arms(-1.6, 0, 0.15), elbows(0)),
    b: P(arms(-0.9, -1.2, 1.3), elbows(-1.9)),
    view: 40,
  },
  curl: {
    a: P(arms(0.05, 0, 0.1), elbows(-0.05), hips(0, 0, 0.05)),
    b: P(arms(-0.15, 0, 0.1), elbows(-2.3), hips(0, 0, 0.05)),
    view: 60,
  },
  overhead_ext: {
    a: P(arms(-2.85, 0, 0.15), elbows(-2.2), hips(0, 0, 0.05)),
    b: P(arms(-2.95, 0, 0.12), elbows(-0.1), hips(0, 0, 0.05)),
    view: 70,
  },
  pushdown: {
    a: P(arms(-0.15, 0, 0.12), elbows(-1.7), hips(0, 0, 0.05)),
    b: P(arms(0.05, 0, 0.12), elbows(-0.05), hips(0, 0, 0.05)),
    view: 70,
  },
  dips: {
    a: P(arms(0, 0, 0.18), elbows(0), knees(1.2), hips(-0.3)),
    b: P({ root: [0.25, 0, 0] }, arms(1.2, 0, 0.22), elbows(-1.45), knees(1.2), hips(-0.45)),
    ground: { points: ['handL', 'handR'], y: 1.15, mode: 'min' },
    scene: ['dipbars'],
    view: 70,
  },
  row: {
    a: P(hinge(1.1, 0.35, 0), arms(-1.1, 0, 0.08), elbows(-0.05)),
    b: P(hinge(1.1, 0.35, 0), arms(0.1, 0, 0.18), elbows(-1.6)),
    view: 75,
  },
  seated_row: {
    a: P(arms(-1.57, 0, 0.1), elbows(0), hips(-1.57), knees(0.35), { root: [0.15, 0, 0] }),
    b: P(arms(0.25, 0, 0.15), elbows(-1.7), hips(-1.57), knees(0.35), { root: [-0.1, 0, 0] }),
    ground: SEAT,
    scene: ['seat'],
    view: 75,
  },
  pullup: {
    a: P(arms(-2.9, 0, 0.35), elbows(0), knees(0.35), hips(-0.15)),
    b: P(arms(-0.5, 0, 1.0), elbows(-2.0), knees(0.35), hips(-0.25)),
    ground: HANG,
    scene: ['pullbar'],
    view: 35,
  },
  pulldown: {
    a: P(arms(-2.9, 0, 0.35), elbows(0), hips(-1.57), knees(1.57)),
    b: P(arms(-0.5, 0, 1.0), elbows(-2.0), hips(-1.57), knees(1.57), { root: [-0.15, 0, 0] }),
    ground: SEAT,
    scene: ['seat'],
    view: 35,
  },
  hang: {
    a: P(arms(-2.95, 0, 0.3), elbows(0), knees(0.1)),
    b: P(arms(-2.95, 0, 0.3), elbows(0), knees(0.15), hips(-0.08)),
    ground: HANG,
    scene: ['pullbar'],
    view: 35,
    dur: 2,
  },
  leg_raise: {
    a: P(arms(-2.95, 0, 0.3), elbows(0), knees(0.1)),
    b: P(arms(-2.95, 0, 0.3), elbows(0), hips(-1.6), knees(0.15), { root: [-0.25, 0, 0] }),
    ground: HANG,
    scene: ['pullbar'],
    view: 80,
  },
  plank: {
    a: P({ root: [1.5, 0, 0] }, arms(-1.57, 0, 0.12), elbows(-1.57), ankles(0.15)),
    b: P({ root: [1.47, 0, 0] }, arms(-1.57, 0, 0.12), elbows(-1.57), ankles(0.15)),
    ground: { points: ['elbowL', 'elbowR', 'toeL', 'toeR'], y: 0, mode: 'min' },
    view: 80,
    dur: 2,
  },
  side_plank: {
    a: P({ root: [0, 0, -1.25] }, { shoulderL: [0, 0, 1.4], elbowL: [-1.57, 0, 0], shoulderR: [0, 0, -0.1] }),
    b: P({ root: [0, 0, -1.3] }, { shoulderL: [0, 0, 1.45], elbowL: [-1.57, 0, 0], shoulderR: [0, 0, -2.6] }),
    ground: { points: ['elbowL', 'heelL', 'toeL'], y: 0, mode: 'min' },
    view: 0,
    dur: 1.6,
  },
  mountain: {
    a: P({ root: [1.25, 0, 0] }, arms(-1.25, 0, 0.12), elbows(0), ankles(0.3), { hipL: [-1.4, 0, 0], kneeL: [1.6, 0, 0] }),
    b: P({ root: [1.25, 0, 0] }, arms(-1.25, 0, 0.12), elbows(0), ankles(0.3), { hipR: [-1.4, 0, 0], kneeR: [1.6, 0, 0] }),
    ground: PRONE,
    view: 80,
    dur: 0.45,
    hold: 0.05,
  },
  crunch: {
    a: P({ root: [-1.57, 0, 0] }, arms(-0.9, 0, 0.2), elbows(-2.1), hips(-0.9), knees(1.8), ankles(-0.6)),
    b: P({ root: [-1.57, 0, 0] }, { spine: [0.45, 0, 0], chest: [0.3, 0, 0], neck: [0.2, 0, 0] }, arms(-0.9, 0, 0.2), elbows(-2.1), hips(-0.9), knees(1.8), ankles(-0.6)),
    ground: BACK_FLOOR,
    view: 80,
  },
  reverse_crunch: {
    a: P({ root: [-1.57, 0, 0] }, arms(0.1, 0, 0.3), hips(-1.57), knees(1.57)),
    b: P({ root: [-1.95, 0, 0] }, arms(0.4, 0, 0.3), hips(-2.2), knees(1.8)),
    ground: { points: ['chestBack', 'pelvisBack', 'headTop'], y: 0, mode: 'min' },
    view: 80,
  },
  dead_bug: {
    a: P({ root: [-1.57, 0, 0] }, arms(-1.57, 0, 0.1), elbows(0), hips(-1.57), knees(1.57)),
    b: P({ root: [-1.57, 0, 0] }, { shoulderL: [-2.9, 0, 0.1], shoulderR: [-1.57, 0, -0.1], hipR: [-0.35, 0, 0], kneeR: [0.2, 0, 0], hipL: [-1.57, 0, 0], kneeL: [1.57, 0, 0] }),
    ground: { points: ['chestBack', 'pelvisBack', 'headTop'], y: 0, mode: 'min' },
    view: 80,
  },
  twist: {
    a: P({ root: [-0.55, 0, 0] }, { chest: [0, 0.55, 0] }, arms(-0.8, 0, 0.2), elbows(-1.3), hips(-1.65), knees(1.6)),
    b: P({ root: [-0.55, 0, 0] }, { chest: [0, -0.55, 0] }, arms(-0.8, 0, 0.2), elbows(-1.3), hips(-1.65), knees(1.6)),
    ground: { points: ['pelvisBack', 'heelL', 'heelR', 'seat'], y: 0, mode: 'min' },
    view: 20,
  },
  woodchop: {
    a: P({ chest: [0, 0.6, 0] }, arms(-2.3, 0.4, 0.4), elbows(-0.2), hips(0, 0, 0.2)),
    b: P({ chest: [0.3, -0.6, 0] }, arms(-0.5, -0.3, -0.2), elbows(-0.2), knees(0.25), hips(-0.2, 0, 0.2)),
    view: 15,
  },
  pallof: {
    a: P({ chest: [0, 0.15, 0] }, arms(-0.4, 0, 0.1), elbows(-1.9), knees(0.2), hips(-0.1, 0, 0.15)),
    b: P(arms(-1.5, 0, 0.05), elbows(0), knees(0.2), hips(-0.1, 0, 0.15)),
    view: 15,
  },
  bridge: {
    a: P({ root: [-1.57, 0, 0] }, arms(0.15, 0, 0.3), hips(-1.0), knees(1.9), ankles(0.65)),
    b: P({ root: [-2.08, 0, 0] }, arms(0.6, 0, 0.3), hips(-0.05), knees(2.0), ankles(0.13)),
    ground: { points: ['chestBack', 'heelL', 'heelR', 'headTop'], y: 0, mode: 'min' },
    view: 85,
  },
  hip_thrust: {
    a: P({ root: [-0.95, 0, 0] }, { spine: [0.25, 0, 0] }, arms(-0.8, 0, 0.2), elbows(-0.6), hips(-1.55), knees(1.95), ankles(0.55)),
    b: P({ root: [-1.57, 0, 0] }, arms(-0.8, 0, 0.2), elbows(-0.6), hips(-0.08), knees(1.62), ankles(0.03)),
    ground: { points: ['heelL', 'heelR', 'toeL', 'toeR'], y: 0, mode: 'min' },
    scene: ['thrustBench'],
    bar: 'hips',
    view: 85,
    forceProp: 'barbell',
  },
  calf: {
    a: P(HOLD_DOWN, ankles(-0.1)),
    b: P(HOLD_DOWN, ankles(0.65)),
    view: 70,
    dur: 0.9,
  },
  shrug: {
    a: P(HOLD_DOWN),
    b: P(HOLD_DOWN, { lift: { shoulderL: [0, 0.055, -0.01], shoulderR: [0, 0.055, -0.01] } }),
    view: 20,
    dur: 0.8,
  },
  walk: {
    a: P(HOLD_DOWN, { hipL: [-0.35, 0, 0.03], hipR: [0.3, 0, -0.03], kneeR: [0.45, 0, 0] }),
    b: P(HOLD_DOWN, { hipR: [-0.35, 0, -0.03], hipL: [0.3, 0, 0.03], kneeL: [0.45, 0, 0] }),
    view: 75,
    dur: 0.55,
    hold: 0.02,
  },
  leg_ext: {
    a: P(arms(0.1, 0, 0.35), hips(-1.57), knees(1.57)),
    b: P(arms(0.1, 0, 0.35), hips(-1.57), knees(0.05)),
    ground: SEAT,
    scene: ['seat'],
    view: 80,
  },
  leg_curl: {
    a: P(arms(0.1, 0, 0.35), hips(-1.57), knees(0.1)),
    b: P(arms(0.1, 0, 0.35), hips(-1.57), knees(1.8)),
    ground: SEAT,
    scene: ['seat'],
    view: 80,
  },
  adductor: {
    a: P(arms(0.1, 0, 0.35), hips(-1.57, 0, 0.65), knees(1.57)),
    b: P(arms(0.1, 0, 0.35), hips(-1.57, 0, 0.04), knees(1.57)),
    ground: SEAT,
    scene: ['seat'],
    view: 15,
  },
  leg_press: {
    a: P({ root: [-1.1, 0, 0] }, arms(0.2, 0, 0.3), hips(-2.3, 0, 0.15), knees(2.0)),
    b: P({ root: [-1.1, 0, 0] }, arms(0.2, 0, 0.3), hips(-1.25, 0, 0.1), knees(0.15)),
    ground: { points: ['pelvisBack', 'chestBack'], y: 0.35, mode: 'min' },
    scene: ['bench'],
    view: 85,
  },
  nordic: {
    a: P(hips(0), knees(1.57), arms(-0.3, 0, 0.2), elbows(-1.2), ankles(0.6)),
    b: P({ root: [0.95, 0, 0] }, hips(0), knees(0.62), arms(-1.6, 0, 0.3), elbows(-1.2), ankles(0.6)),
    ground: { points: ['kneeL', 'kneeR', 'toeL', 'toeR'], y: 0, mode: 'min' },
    view: 85,
  },
  superman: {
    a: P({ root: [1.57, 0, 0] }, arms(-3.0, 0, 0.25), elbows(0), ankles(0.6)),
    b: P({ root: [1.57, 0, 0] }, { spine: [-0.18, 0, 0], chest: [-0.15, 0, 0] }, arms(-3.0, 0, 0.25), hips(0.3), ankles(0.6)),
    ground: { points: ['pelvisFront', 'chestFront', 'toeL', 'toeR', 'handL', 'handR'], y: 0, mode: 'min' },
    view: 85,
  },
  bird_dog: {
    a: P({ root: [1.57, 0, 0] }, arms(-1.57, 0, 0.1), elbows(0), hips(-1.57), knees(1.57), ankles(0.5)),
    b: P({ root: [1.57, 0, 0] }, { shoulderL: [-3.0, 0, 0.1], shoulderR: [-1.57, 0, -0.1], hipL: [-1.57, 0, 0], kneeL: [1.57, 0, 0], hipR: [0, 0, 0], kneeR: [0, 0, 0] }, ankles(0.5)),
    ground: { points: ['handR', 'kneeL', 'toeL'], y: 0, mode: 'min' },
    view: 80,
  },
  kickback: {
    a: P({ root: [0.25, 0, 0] }, arms(-0.25, 0, 0.1)),
    b: P({ root: [0.25, 0, 0] }, arms(-0.25, 0, 0.1), { hipR: [0.75, 0, 0], kneeR: [0.2, 0, 0] }),
    ground: { points: ['heelL', 'toeL'], y: 0, mode: 'min' },
    view: 80,
  },
  abduction: {
    a: P(HOLD_DOWN, hips(-0.6, 0, 0.05), knees(0.9), { root: [0.3, 0, 0] }, ankles(-0.3)),
    b: P(HOLD_DOWN, hips(-0.6, 0, 0.4), knees(0.9), { root: [0.3, 0, 0] }, ankles(-0.3)),
    view: 15,
    dur: 0.8,
  },
};
