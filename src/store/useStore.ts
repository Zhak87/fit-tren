import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { calcTargets, generateWeekPlan } from '../lib/nutrition';
import { generateProgram } from '../lib/plan';
import type { ChatMessage, DayPlan, MealItem, Profile, Program, WorkoutLog } from '../types';

interface State {
  hydrated: boolean;
  profile: Profile | null;
  program: Program | null;
  logs: WorkoutLog[];
  mealPlan: DayPlan[] | null;
  kcalOverride: number | null;
  shoppingChecked: string[];
  chat: ChatMessage[];

  completeOnboarding: (p: Profile) => void;
  updateProfile: (p: Profile, regenerate: boolean) => void;
  regenerateProgram: () => void;
  moveWorkout: (workoutId: string, newDay: number) => void;
  replaceExercise: (workoutId: string, index: number, exerciseId: string) => void;
  addLog: (log: WorkoutLog) => void;
  setKcalOverride: (kcal: number | null) => void;
  regenerateMeals: () => void;
  updateMealItem: (day: number, mealId: string, index: number, item: MealItem | null) => void;
  addMealItem: (day: number, mealId: string, item: MealItem) => void;
  toggleShopping: (foodId: string) => void;
  addChat: (m: ChatMessage) => void;
  clearChat: () => void;
  resetAll: () => void;
}

const empty = {
  profile: null,
  program: null,
  logs: [],
  mealPlan: null,
  kcalOverride: null,
  shoppingChecked: [],
  chat: [],
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      hydrated: false,
      ...empty,

      completeOnboarding: (p) => {
        const t = calcTargets(p);
        set({ profile: p, program: generateProgram(p), mealPlan: generateWeekPlan(p, t.kcal), kcalOverride: null, shoppingChecked: [] });
      },

      updateProfile: (p, regenerate) => {
        set({ profile: p });
        if (regenerate) {
          const kcal = get().kcalOverride ?? calcTargets(p).kcal;
          set({ program: generateProgram(p), mealPlan: generateWeekPlan(p, kcal) });
        }
      },

      regenerateProgram: () => {
        const p = get().profile;
        if (p) set({ program: generateProgram(p) });
      },

      moveWorkout: (id, newDay) => {
        const prog = get().program;
        if (!prog) return;
        set({ program: { ...prog, workouts: prog.workouts.map((w) => (w.id === id ? { ...w, day: newDay } : w)) } });
      },

      replaceExercise: (id, index, exerciseId) => {
        const prog = get().program;
        if (!prog) return;
        set({
          program: {
            ...prog,
            workouts: prog.workouts.map((w) =>
              w.id === id ? { ...w, exercises: w.exercises.map((e, i) => (i === index ? { ...e, exerciseId } : e)) } : w,
            ),
          },
        });
      },

      addLog: (log) => set({ logs: [...get().logs.filter((l) => l.workoutId !== log.workoutId), log] }),

      setKcalOverride: (kcal) => {
        const p = get().profile;
        set({ kcalOverride: kcal });
        if (p) set({ mealPlan: generateWeekPlan(p, kcal ?? calcTargets(p).kcal) });
      },

      regenerateMeals: () => {
        const p = get().profile;
        if (p) set({ mealPlan: generateWeekPlan(p, get().kcalOverride ?? calcTargets(p).kcal), shoppingChecked: [] });
      },

      updateMealItem: (day, mealId, index, item) => {
        const plan = get().mealPlan;
        if (!plan) return;
        set({
          mealPlan: plan.map((d) =>
            d.day !== day
              ? d
              : {
                  ...d,
                  meals: d.meals.map((m) => {
                    if (m.id !== mealId) return m;
                    const items = [...m.items];
                    if (item) items[index] = item;
                    else items.splice(index, 1);
                    return { ...m, items };
                  }),
                },
          ),
        });
      },

      addMealItem: (day, mealId, item) => {
        const plan = get().mealPlan;
        if (!plan) return;
        set({
          mealPlan: plan.map((d) =>
            d.day !== day ? d : { ...d, meals: d.meals.map((m) => (m.id === mealId ? { ...m, items: [...m.items, item] } : m)) },
          ),
        });
      },

      toggleShopping: (id) => {
        const s = get().shoppingChecked;
        set({ shoppingChecked: s.includes(id) ? s.filter((x) => x !== id) : [...s, id] });
      },

      addChat: (m) => set({ chat: [...get().chat, m].slice(-60) }),
      clearChat: () => set({ chat: [] }),
      resetAll: () => set({ ...empty }),
    }),
    {
      name: 'fit-ai-store',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hydrated, ...rest }) => {
        const data: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(rest)) if (typeof v !== 'function') data[k] = v;
        return data as Partial<State>;
      },
      onRehydrateStorage: () => () => useStore.setState({ hydrated: true }),
    },
  ),
);
