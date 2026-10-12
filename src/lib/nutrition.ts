import { FOODS, FOOD_LIST, MEAL_TEMPLATES } from '../data/foods';
import type { DayPlan, Food, Meal, MealItem, Profile } from '../types';

export interface Targets {
  bmr: number;
  tdee: number;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  activity: number;
  adjustmentPct: number;
  floorApplied: boolean;
}

export function calcTargets(p: Profile): Targets {
  // Формула Миффлина — Сан Жеора
  const bmr = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + (p.sex === 'male' ? 5 : -161);
  const activity = p.daysPerWeek <= 1 ? 1.2 : p.daysPerWeek <= 3 ? 1.375 : p.daysPerWeek <= 5 ? 1.55 : 1.725;
  const tdee = bmr * activity;
  let delta = 0;
  if (p.goal === 'fatloss') delta = -Math.min(tdee * 0.15, 500);
  if (p.goal === 'muscle') delta = Math.min(tdee * 0.1, 300);
  if (p.goal === 'endurance') delta = tdee * 0.05;
  const floor = Math.max(bmr, p.sex === 'female' ? 1300 : 1600);
  let kcal = tdee + delta;
  const floorApplied = kcal < floor;
  if (floorApplied) kcal = floor;
  kcal = Math.round(kcal / 10) * 10;

  const proteinPerKg = p.goal === 'fatloss' ? 2 : p.goal === 'muscle' || p.goal === 'strength' ? 1.8 : 1.5;
  const protein = Math.round(p.weightKg * proteinPerKg);
  const fat = Math.round(Math.max(p.weightKg * 0.9, (kcal * 0.25) / 9));
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    kcal,
    protein,
    fat,
    carbs,
    activity,
    adjustmentPct: Math.round((delta / tdee) * 100),
    floorApplied,
  };
}

export function itemMacros(it: MealItem) {
  const f = FOODS[it.foodId];
  const k = it.grams / 100;
  return { kcal: f.kcal * k, p: f.p * k, f: f.f * k, c: f.c * k };
}

export function sumItems(items: MealItem[]) {
  return items.reduce(
    (a, it) => {
      const m = itemMacros(it);
      return { kcal: a.kcal + m.kcal, p: a.p + m.p, f: a.f + m.f, c: a.c + m.c };
    },
    { kcal: 0, p: 0, f: 0, c: 0 },
  );
}

export function sumDay(day: DayPlan) {
  return sumItems(day.meals.flatMap((m) => m.items));
}

export function foodAllowed(f: Food, p: Pick<Profile, 'diet' | 'allergens'>): boolean {
  if (f.allergens.some((a) => p.allergens.includes(a))) return false;
  if (p.diet === 'vegetarian' && f.meat) return false;
  if (p.diet === 'pescatarian' && f.meat && f.meat !== 'fish') return false;
  if (p.diet === 'no_pork' && f.meat === 'pork') return false;
  return true;
}

/** Замены с похожей пищевой ценностью: та же группа, ближе по профилю БЖУ */
export function substitutes(foodId: string, p: Pick<Profile, 'diet' | 'allergens'>): Food[] {
  const src = FOODS[foodId];
  const dist = (f: Food) => Math.abs(f.p - src.p) * 3 + Math.abs(f.f - src.f) * 2 + Math.abs(f.c - src.c);
  return FOOD_LIST.filter((f) => f.id !== foodId && f.group === src.group && foodAllowed(f, p)).sort((a, b) => dist(a) - dist(b));
}

/** Переводит граммы при замене так, чтобы калорийность сохранилась */
export function swapItem(it: MealItem, newFoodId: string): MealItem {
  const oldK = FOODS[it.foodId].kcal * it.grams;
  const grams = Math.max(5, Math.round(oldK / FOODS[newFoodId].kcal / 5) * 5);
  return { foodId: newFoodId, grams };
}

const SLOTS_BY_MEALS: Record<number, Meal['slot'][]> = {
  3: ['breakfast', 'lunch', 'dinner'],
  4: ['breakfast', 'lunch', 'snack', 'dinner'],
  5: ['breakfast', 'snack', 'lunch', 'snack', 'dinner'],
};

const SLOT_SHARE: Record<Meal['slot'], number> = { breakfast: 0.27, lunch: 0.35, dinner: 0.28, snack: 0.12 };

function adaptTemplate(items: MealItem[], p: Profile): MealItem[] | null {
  const out: MealItem[] = [];
  for (const it of items) {
    if (foodAllowed(FOODS[it.foodId], p)) {
      out.push({ ...it });
      continue;
    }
    const sub = substitutes(it.foodId, p)[0];
    if (!sub) return null;
    out.push(swapItem(it, sub.id));
  }
  return out;
}

function scale(items: MealItem[], target: number): MealItem[] {
  const total = sumItems(items).kcal || 1;
  const k = Math.max(0.5, Math.min(2.2, target / total));
  return items.map((it) => ({ ...it, grams: Math.max(5, Math.round((it.grams * k) / 5) * 5) }));
}

export function generateWeekPlan(p: Profile, kcal: number): DayPlan[] {
  const slots = SLOTS_BY_MEALS[p.mealsPerDay] ?? SLOTS_BY_MEALS[4];
  const shareSum = slots.reduce((a, s) => a + SLOT_SHARE[s], 0);
  const protein = calcTargets(p).protein;
  const days: DayPlan[] = [];
  for (let d = 0; d < 7; d++) {
    const meals: Meal[] = [];
    slots.forEach((slot, i) => {
      const tpls = MEAL_TEMPLATES.filter((t) => t.slot === slot)
        .map((t) => ({ ...t, items: adaptTemplate(t.items, p) }))
        .filter((t): t is typeof t & { items: MealItem[] } => t.items !== null);
      if (!tpls.length) return;
      // предпочитаем шаблоны без замен, ротация по дням
      const t = tpls[(d * 2 + i) % tpls.length];
      const target = (kcal * SLOT_SHARE[slot]) / shareSum;
      meals.push({ id: `d${d}-m${i}`, title: t.title, slot, items: scale(t.items, target) });
    });
    days.push({ day: d, meals: balanceDay(meals, kcal, protein) });
  }
  return days;
}

const PROTEIN_GROUPS: Food['group'][] = ['protein', 'dairy'];
const ENERGY_GROUPS: Food['group'][] = ['carb', 'fruit', 'other', 'fat'];

/** Подгоняет день под цель по белку, затем добирает калории крупами, фруктами и жирами */
function balanceDay(meals: Meal[], kcal: number, protein: number): Meal[] {
  const all = () => meals.flatMap((m) => m.items);
  const dayP = sumItems(all()).p || 1;
  const kp = Math.max(0.5, Math.min(1.4, protein / dayP));
  const round5 = (g: number) => Math.max(5, Math.round(g / 5) * 5);
  meals = meals.map((m) => ({ ...m, items: m.items.map((it) => (PROTEIN_GROUPS.includes(FOODS[it.foodId].group) ? { ...it, grams: round5(it.grams * kp) } : it)) }));
  const energy = all().filter((it) => ENERGY_GROUPS.includes(FOODS[it.foodId].group));
  const energyKcal = sumItems(energy).kcal;
  const restKcal = sumItems(all()).kcal - energyKcal;
  if (energyKcal > 0) {
    const ke = Math.max(0.4, Math.min(2.5, (kcal - restKcal) / energyKcal));
    meals = meals.map((m) => ({ ...m, items: m.items.map((it) => (ENERGY_GROUPS.includes(FOODS[it.foodId].group) ? { ...it, grams: round5(it.grams * ke) } : it)) }));
  }
  return meals;
}

export function shoppingList(plan: DayPlan[]) {
  const map = new Map<string, number>();
  for (const d of plan) for (const m of d.meals) for (const it of m.items) map.set(it.foodId, (map.get(it.foodId) ?? 0) + it.grams);
  return [...map.entries()]
    .map(([foodId, grams]) => ({ food: FOODS[foodId], grams }))
    .sort((a, b) => a.food.group.localeCompare(b.food.group) || a.food.name.localeCompare(b.food.name));
}

export const SLOT_LABEL: Record<Meal['slot'], string> = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snack: 'Перекус',
};

export const GROUP_LABEL: Record<Food['group'], string> = {
  protein: 'Белковые продукты',
  dairy: 'Молочные',
  carb: 'Крупы и гарниры',
  fat: 'Жиры и орехи',
  veg: 'Овощи',
  fruit: 'Фрукты и ягоды',
  other: 'Другое',
};
