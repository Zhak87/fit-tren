export type Sex = 'male' | 'female';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Goal = 'fitness' | 'muscle' | 'strength' | 'endurance' | 'fatloss' | 'maintain';
export type Place = 'home' | 'gym' | 'mixed';
export type Equipment =
  | 'none'
  | 'dumbbells'
  | 'bands'
  | 'pullupbar'
  | 'bench'
  | 'kettlebell'
  | 'barbell'
  | 'machines'
  | 'cable';
export type DietType = 'any' | 'vegetarian' | 'pescatarian' | 'no_pork';
export type Allergen = 'lactose' | 'gluten' | 'nuts' | 'eggs' | 'fish' | 'soy';

export type MuscleId =
  | 'chest'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'traps'
  | 'lats'
  | 'lowerback'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'adductors'
  | 'calves';

export interface Profile {
  name: string;
  sex: Sex;
  level: Level;
  goal: Goal;
  place: Place;
  equipment: Equipment[];
  daysPerWeek: number;
  sessionMinutes: number;
  weeks: 4 | 8 | 12;
  heightCm: number;
  weightKg: number;
  age: number;
  avoidExercises: string[];
  diet: DietType;
  allergens: Allergen[];
  mealsPerDay: 3 | 4 | 5;
  specialCondition: boolean; // беременность, заболевания, <18 и т.п.
}

export interface MediaAsset {
  url: string;
  source: string;
  license: string;
  checkedAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  primary: MuscleId;
  secondary: MuscleId[];
  equipment: Equipment[]; // all required
  place: 'home' | 'gym' | 'both';
  level: Level;
  kind: 'compound' | 'isolation';
  /** редакционная оценка 1–10, см. EFFICIENCY_CRITERIA */
  score: number;
  timeBased?: boolean;
  steps: string[];
  breathing: string;
  mistakes: string[];
  tips: string[];
  easier?: string;
  harder?: string;
  alternatives: string[];
  video?: MediaAsset;
}

export interface PlannedExercise {
  exerciseId: string;
  sets: number;
  reps: string; // "8–12" or "30 с"
  restSec: number;
  intensity: string; // RPE / % описание
}

export interface Workout {
  id: string;
  week: number;
  day: number; // 0..6 (Пн..Вс)
  title: string;
  focus: string;
  minutes: number;
  warmup: string[];
  exercises: PlannedExercise[];
  cooldown: string[];
  isDeload: boolean;
}

export interface Program {
  createdAt: string;
  startDate: string; // ISO date of week 1 Monday
  weeks: number;
  split: string;
  goal: Goal;
  level: Level;
  trainingDays: number[]; // weekday indexes
  workouts: Workout[];
  progressionNote: string;
}

export interface SetLog {
  weight: number;
  reps: number;
  done: boolean;
}

export interface WorkoutLog {
  workoutId: string;
  date: string;
  durationMin: number;
  feeling: 1 | 2 | 3 | 4 | 5;
  exercises: { exerciseId: string; sets: SetLog[] }[];
}

export interface Food {
  id: string;
  name: string;
  kcal: number; // на 100 г
  p: number;
  f: number;
  c: number;
  group: 'protein' | 'carb' | 'fat' | 'veg' | 'fruit' | 'dairy' | 'other';
  allergens: Allergen[];
  meat?: 'pork' | 'meat' | 'fish' | 'poultry';
  unit?: string;
}

export interface MealItem {
  foodId: string;
  grams: number;
}

export interface Meal {
  id: string;
  title: string;
  slot: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: MealItem[];
}

export interface DayPlan {
  day: number;
  meals: Meal[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  at: string;
}
