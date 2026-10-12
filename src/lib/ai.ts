import { EXERCISES } from '../data/exercises';
import type { ChatMessage, Profile, Program, WorkoutLog } from '../types';
import { calcTargets } from './nutrition';
import { todayPosition } from './plan';

/** Адрес серверного ИИ-адаптера (папка server/). Ключ Claude хранится только на сервере. */
export const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';
export const aiConfigured = API_URL.length > 0;

export interface CoachContext {
  profile: Profile | null;
  program: Program | null;
  logs: WorkoutLog[];
  focusExerciseId?: string;
}

function buildContext({ profile, program, logs, focusExerciseId }: CoachContext) {
  const ctx: Record<string, unknown> = {};
  if (profile) {
    const t = calcTargets(profile);
    ctx.profile = {
      sex: profile.sex, level: profile.level, goal: profile.goal, place: profile.place,
      equipment: profile.equipment, daysPerWeek: profile.daysPerWeek, sessionMinutes: profile.sessionMinutes,
      age: profile.age, heightCm: profile.heightCm, weightKg: profile.weightKg,
      diet: profile.diet, allergens: profile.allergens, specialCondition: profile.specialCondition,
    };
    ctx.nutritionTargets = { kcal: t.kcal, protein: t.protein, fat: t.fat, carbs: t.carbs };
  }
  if (program) {
    const pos = todayPosition(program);
    const week = program.workouts.filter((w) => w.week === pos.week);
    ctx.program = {
      split: program.split, weeks: program.weeks, currentWeek: pos.week,
      thisWeek: week.map((w) => ({ day: w.day, title: w.title, deload: w.isDeload, exercises: w.exercises.map((e) => `${EXERCISES[e.exerciseId]?.name} ${e.sets}×${e.reps}`) })),
    };
  }
  ctx.recentWorkouts = logs.slice(-5).map((l) => ({ date: l.date, feeling: l.feeling, durationMin: l.durationMin, sets: l.exercises.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0) }));
  if (focusExerciseId && EXERCISES[focusExerciseId]) {
    const e = EXERCISES[focusExerciseId];
    ctx.focusExercise = { name: e.name, steps: e.steps, mistakes: e.mistakes, tips: e.tips, alternatives: e.alternatives.map((a) => EXERCISES[a]?.name) };
  }
  ctx.exerciseLibrary = Object.values(EXERCISES).map((e) => e.name);
  return ctx;
}

export async function askCoach(history: ChatMessage[], c: CoachContext): Promise<string> {
  if (!aiConfigured) throw new Error('not_configured');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  try {
    const res = await fetch(`${API_URL}/api/coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history.slice(-20).map(({ role, content }) => ({ role, content })), context: buildContext(c) }),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
    return data.reply as string;
  } finally {
    clearTimeout(timer);
  }
}
