import { EXERCISE_LIST, isAvailable, levelRank } from '../data/exercises';
import type { Equipment, Exercise, Goal, MuscleId, PlannedExercise, Profile, Program, Workout } from '../types';

const GYM_EQUIPMENT: Equipment[] = ['none', 'dumbbells', 'bands', 'pullupbar', 'bench', 'kettlebell', 'barbell', 'machines', 'cable'];

export function availableEquipment(p: Profile): Equipment[] {
  if (p.place === 'home') return ['none', ...p.equipment];
  return GYM_EQUIPMENT; // зал или смешанный вариант: доступно всё оборудование зала
}

export function exercisePool(p: Profile): Exercise[] {
  const eq = availableEquipment(p);
  return EXERCISE_LIST.filter(
    (e) =>
      isAvailable(e, eq) &&
      levelRank(e.level) <= levelRank(p.level) &&
      !(p.place === 'home' && e.place === 'gym') &&
      !p.avoidExercises.includes(e.id),
  );
}

// ───────── схемы подходов по целям ─────────
interface Scheme {
  sets: number;
  reps: string;
  isoReps: string;
  rest: number;
  isoRest: number;
  rpe: string;
}
const SCHEMES: Record<Goal, Scheme> = {
  strength: { sets: 4, reps: '4–6', isoReps: '8–10', rest: 180, isoRest: 90, rpe: 'RPE 8: 2 повтора в запасе' },
  muscle: { sets: 3, reps: '8–12', isoReps: '10–15', rest: 120, isoRest: 75, rpe: 'RPE 8: 1–2 повтора в запасе' },
  fatloss: { sets: 3, reps: '10–15', isoReps: '12–15', rest: 60, isoRest: 45, rpe: 'RPE 7–8, короткий отдых' },
  endurance: { sets: 3, reps: '15–20', isoReps: '15–20', rest: 45, isoRest: 30, rpe: 'RPE 7, высокий темп' },
  fitness: { sets: 3, reps: '10–12', isoReps: '12–15', rest: 75, isoRest: 60, rpe: 'RPE 7: 3 повтора в запасе' },
  maintain: { sets: 3, reps: '8–12', isoReps: '12–15', rest: 90, isoRest: 60, rpe: 'RPE 7' },
};

// ───────── шаблоны сессий: список слотов-мышц ─────────
type Slot = MuscleId | { muscle: MuscleId; prefer: string[] };
const REAR_DELT: Slot = { muscle: 'shoulders', prefer: ['face_pull', 'reverse_fly', 'band_pull_apart'] };
const SIDE_DELT: Slot = { muscle: 'shoulders', prefer: ['lateral_raise', 'band_lateral_raise'] };
interface SessionTpl {
  title: string;
  focus: string;
  slots: Slot[];
}
const FULL_A: SessionTpl = { title: 'Всё тело A', focus: 'Ноги, грудь, спина', slots: ['quads', 'chest', 'lats', 'hamstrings', 'shoulders', 'abs', 'glutes', 'biceps'] };
const FULL_B: SessionTpl = { title: 'Всё тело B', focus: 'Ягодицы, спина, плечи', slots: ['glutes', 'lats', 'shoulders', 'quads', 'chest', 'obliques', 'triceps', 'calves'] };
const FULL_C: SessionTpl = { title: 'Всё тело C', focus: 'Задняя цепь и корпус', slots: ['hamstrings', 'chest', 'lats', 'quads', 'shoulders', 'abs', 'biceps', 'triceps'] };
const UPPER: SessionTpl = { title: 'Верх тела', focus: 'Грудь, спина, плечи, руки', slots: ['chest', 'lats', 'shoulders', 'lats', 'chest', 'biceps', 'triceps', SIDE_DELT] };
const LOWER: SessionTpl = { title: 'Низ тела', focus: 'Ноги, ягодицы, корпус', slots: ['quads', 'hamstrings', 'glutes', 'quads', 'adductors', 'calves', 'abs', 'obliques'] };
const PUSH: SessionTpl = { title: 'Жим', focus: 'Грудь, плечи, трицепс', slots: ['chest', 'shoulders', 'chest', 'triceps', SIDE_DELT, 'triceps', 'abs'] };
const PULL: SessionTpl = { title: 'Тяга', focus: 'Спина, бицепс, задняя дельта', slots: ['lats', 'lats', REAR_DELT, 'biceps', 'traps', 'biceps', 'forearms'] };
const LEGS: SessionTpl = { title: 'Ноги', focus: 'Квадрицепсы, бицепс бедра, ягодицы', slots: ['quads', 'hamstrings', 'glutes', 'quads', 'calves', 'adductors', 'abs'] };

function splitFor(p: Profile): { name: string; sessions: SessionTpl[] } {
  const d = p.daysPerWeek;
  if (p.level === 'beginner' || d <= 3) {
    const all = [FULL_A, FULL_B, FULL_C];
    return { name: 'Фулбоди', sessions: Array.from({ length: d }, (_, i) => all[i % 3]) };
  }
  if (d === 4) return { name: 'Верх / Низ', sessions: [UPPER, LOWER, UPPER, LOWER] };
  if (d === 5) return { name: 'Верх / Низ + Жим / Тяга / Ноги', sessions: [UPPER, LOWER, PUSH, PULL, LEGS] };
  return { name: 'Жим / Тяга / Ноги ×2', sessions: [PUSH, PULL, LEGS, PUSH, PULL, LEGS] };
}

export const TRAINING_DAYS: Record<number, number[]> = {
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 4, 5],
  6: [0, 1, 2, 3, 4, 5],
};

const WARMUP = ['3–5 минут лёгкого кардио (ходьба на месте, скакалка, велотренажёр)', 'Вращения в плечах, тазе и голеностопе', '1–2 разминочных подхода первого упражнения с лёгким весом'];
const COOLDOWN = ['Спокойная ходьба 2–3 минуты, восстановите дыхание', 'Растяжка проработанных мышц по 20–30 секунд', 'Выпейте воды'];

function pickExercise(pool: Exercise[], slot: Slot, used: Set<string>, variant: number, preferCompound: boolean, level: Profile['level']): Exercise | undefined {
  const muscle = typeof slot === 'string' ? slot : slot.muscle;
  if (typeof slot !== 'string') {
    const pref = slot.prefer.map((id) => pool.find((e) => e.id === id && !used.has(id))).find(Boolean);
    if (pref) return pref;
  }
  // опытным чуть выше ставим упражнения своего уровня, чтобы не застревать на самых простых
  const eff = (e: Exercise) => e.score + (level === 'beginner' ? 0 : 0.6 * levelRank(e.level));
  const candidates = pool
    .filter((e) => e.primary === muscle && !used.has(e.id) && e.id !== 'burpee' && e.id !== 'mountain_climber')
    .sort((a, b) => {
      if (preferCompound && a.kind !== b.kind) return a.kind === 'compound' ? -1 : 1;
      return eff(b) - eff(a);
    });
  if (!candidates.length) return undefined;
  return candidates[Math.min(variant, candidates.length - 1)];
}

function prescribe(e: Exercise, s: Scheme, level: Profile['level'], deload: boolean, weekInBlock: number): PlannedExercise {
  let sets = e.kind === 'compound' ? s.sets : Math.max(2, s.sets - 1);
  if (level === 'beginner') sets = Math.max(2, sets - 1);
  if (level === 'advanced' && weekInBlock >= 2 && !deload) sets += 1;
  if (deload) sets = Math.max(2, Math.round(sets * 0.6));
  const reps = e.timeBased ? (level === 'beginner' ? '20–30 с' : '30–45 с') : e.kind === 'compound' ? s.reps : s.isoReps;
  const rest = e.kind === 'compound' ? s.rest : s.isoRest;
  const intensity = deload ? 'Разгрузка: −40% объёма, вес лёгкий' : weekInBlock === 3 ? s.rpe.replace('RPE 8', 'RPE 8–9') : s.rpe;
  return { exerciseId: e.id, sets, reps, restSec: rest, intensity };
}

export function generateProgram(p: Profile): Program {
  const pool = exercisePool(p);
  const split = splitFor(p);
  const scheme = SCHEMES[p.goal];
  const days = TRAINING_DAYS[p.daysPerWeek] ?? TRAINING_DAYS[3];
  const maxEx = Math.max(4, Math.min(8, Math.round(p.sessionMinutes / 9)));
  const useDeload = p.level !== 'beginner';
  const workouts: Workout[] = [];

  for (let week = 1; week <= p.weeks; week++) {
    const weekInBlock = ((week - 1) % 4) + 1;
    const deload = useDeload && weekInBlock === 4;
    split.sessions.forEach((tpl, i) => {
      const used = new Set<string>();
      const exercises: PlannedExercise[] = [];
      // вариант чередуется по неделям блока, чтобы упражнения немного менялись каждые 4 недели
      const variant = Math.floor((week - 1) / 4) % 2;
      for (let k = 0; k < tpl.slots.length && exercises.length < maxEx; k++) {
        const slot = tpl.slots[k];
        const ex = pickExercise(pool, slot, used, variant, k < 3, p.level);
        if (!ex) continue;
        used.add(ex.id);
        exercises.push(prescribe(ex, scheme, p.level, deload, weekInBlock));
      }
      if ((p.goal === 'fatloss' || p.goal === 'endurance') && !deload) {
        const fin = pool.find((e) => ['burpee', 'mountain_climber', 'jump_squat'].includes(e.id) && !used.has(e.id));
        if (fin) exercises.push({ exerciseId: fin.id, sets: 3, reps: '30 с', restSec: 30, intensity: 'Финишер: высокий темп' });
      }
      workouts.push({
        id: `w${week}-${i}`,
        week,
        day: days[i] ?? i,
        title: tpl.title,
        focus: tpl.focus,
        minutes: p.sessionMinutes,
        warmup: WARMUP,
        exercises,
        cooldown: COOLDOWN,
        isDeload: deload,
      });
    });
  }

  return {
    createdAt: new Date().toISOString(),
    startDate: mondayOf(new Date()).toISOString(),
    weeks: p.weeks,
    split: split.name,
    goal: p.goal,
    level: p.level,
    trainingDays: days,
    workouts,
    progressionNote: progressionNote(p),
  };
}

function progressionNote(p: Profile): string {
  if (p.level === 'beginner')
    return 'Двойная прогрессия: когда во всех подходах выполняете верхнюю границу повторений с хорошей техникой, добавьте 1–2,5 кг или усложните вариант упражнения.';
  if (p.level === 'intermediate')
    return 'Блоки по 4 недели: 3 недели постепенного роста нагрузки (вес или повторения), 4-я неделя разгрузочная. В новом блоке часть упражнений меняется.';
  return 'Волновая периодизация: недели 1–3 наращивают объём и интенсивность (до RPE 9), 4-я неделя разгрузка. Отслеживайте рабочие веса и личные рекорды.';
}

export function mondayOf(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const wd = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - wd);
  return x;
}

export function todayPosition(program: Program, now = new Date()) {
  const start = new Date(program.startDate);
  const diffDays = Math.floor((mondayOf(now).getTime() - start.getTime()) / 86400000);
  const week = Math.floor(diffDays / 7) + 1;
  const weekday = (now.getDay() + 6) % 7;
  return { week: Math.max(1, Math.min(program.weeks, week)), weekday, finished: week > program.weeks };
}

export function dateFor(program: Program, week: number, day: number): Date {
  const d = new Date(program.startDate);
  d.setDate(d.getDate() + (week - 1) * 7 + day);
  return d;
}

export const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function estimateMinutes(w: Workout): number {
  let sec = 8 * 60; // разминка + заминка
  for (const e of w.exercises) sec += e.sets * (45 + e.restSec);
  return Math.round(sec / 60);
}
