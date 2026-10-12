import type { Food, Meal } from '../types';

// Ориентировочная пищевая ценность на 100 г (по открытым таблицам состава продуктов)
const F: Food[] = [
  // белок
  { id: 'chicken', name: 'Куриная грудка', kcal: 113, p: 23.6, f: 1.9, c: 0.4, group: 'protein', allergens: [], meat: 'poultry' },
  { id: 'turkey', name: 'Филе индейки', kcal: 114, p: 24, f: 1.5, c: 0, group: 'protein', allergens: [], meat: 'poultry' },
  { id: 'beef', name: 'Говядина постная', kcal: 158, p: 22, f: 7.5, c: 0, group: 'protein', allergens: [], meat: 'meat' },
  { id: 'pork', name: 'Свинина вырезка', kcal: 142, p: 21, f: 6, c: 0, group: 'protein', allergens: [], meat: 'pork' },
  { id: 'salmon', name: 'Лосось', kcal: 208, p: 20, f: 13, c: 0, group: 'protein', allergens: ['fish'], meat: 'fish' },
  { id: 'cod', name: 'Треска', kcal: 82, p: 18, f: 0.7, c: 0, group: 'protein', allergens: ['fish'], meat: 'fish' },
  { id: 'tuna', name: 'Тунец в собственном соку', kcal: 116, p: 26, f: 1, c: 0, group: 'protein', allergens: ['fish'], meat: 'fish' },
  { id: 'eggs', name: 'Яйца', kcal: 155, p: 12.7, f: 11, c: 0.7, group: 'protein', allergens: ['eggs'], unit: '1 шт ≈ 55 г' },
  { id: 'tofu', name: 'Тофу', kcal: 76, p: 8, f: 4.8, c: 1.9, group: 'protein', allergens: ['soy'] },
  { id: 'lentils', name: 'Чечевица (варёная)', kcal: 116, p: 9, f: 0.4, c: 20, group: 'protein', allergens: [] },
  { id: 'chickpeas', name: 'Нут (варёный)', kcal: 164, p: 8.9, f: 2.6, c: 27, group: 'protein', allergens: [] },
  // молочные
  { id: 'cottage', name: 'Творог 5%', kcal: 121, p: 17, f: 5, c: 1.8, group: 'dairy', allergens: ['lactose'] },
  { id: 'greek_yogurt', name: 'Греческий йогурт 2%', kcal: 73, p: 10, f: 2, c: 3.6, group: 'dairy', allergens: ['lactose'] },
  { id: 'kefir', name: 'Кефир 1%', kcal: 40, p: 3, f: 1, c: 4, group: 'dairy', allergens: ['lactose'] },
  { id: 'cheese', name: 'Сыр твёрдый', kcal: 350, p: 25, f: 27, c: 0, group: 'dairy', allergens: ['lactose'] },
  { id: 'soy_yogurt', name: 'Соевый йогурт', kcal: 60, p: 4, f: 2.2, c: 5.5, group: 'dairy', allergens: ['soy'] },
  // углеводы
  { id: 'oats', name: 'Овсяные хлопья', kcal: 366, p: 12, f: 6, c: 61, group: 'carb', allergens: ['gluten'] },
  { id: 'buckwheat', name: 'Гречка (сухая)', kcal: 343, p: 12.6, f: 3.3, c: 62, group: 'carb', allergens: [] },
  { id: 'rice', name: 'Рис (сухой)', kcal: 344, p: 6.7, f: 0.7, c: 78, group: 'carb', allergens: [] },
  { id: 'pasta', name: 'Паста твёрдых сортов (сухая)', kcal: 350, p: 12, f: 1.5, c: 71, group: 'carb', allergens: ['gluten'] },
  { id: 'potato', name: 'Картофель', kcal: 77, p: 2, f: 0.1, c: 17, group: 'carb', allergens: [] },
  { id: 'sweet_potato', name: 'Батат', kcal: 86, p: 1.6, f: 0.1, c: 20, group: 'carb', allergens: [] },
  { id: 'bread', name: 'Цельнозерновой хлеб', kcal: 247, p: 13, f: 3.4, c: 41, group: 'carb', allergens: ['gluten'] },
  { id: 'quinoa', name: 'Киноа (сухая)', kcal: 368, p: 14, f: 6, c: 64, group: 'carb', allergens: [] },
  // жиры
  { id: 'olive_oil', name: 'Оливковое масло', kcal: 884, p: 0, f: 100, c: 0, group: 'fat', allergens: [] },
  { id: 'avocado', name: 'Авокадо', kcal: 160, p: 2, f: 15, c: 9, group: 'fat', allergens: [] },
  { id: 'almonds', name: 'Миндаль', kcal: 579, p: 21, f: 50, c: 22, group: 'fat', allergens: ['nuts'] },
  { id: 'peanut_butter', name: 'Арахисовая паста', kcal: 588, p: 25, f: 50, c: 20, group: 'fat', allergens: ['nuts'] },
  { id: 'seeds', name: 'Семена тыквы', kcal: 559, p: 30, f: 49, c: 11, group: 'fat', allergens: [] },
  // овощи
  { id: 'broccoli', name: 'Брокколи', kcal: 34, p: 2.8, f: 0.4, c: 7, group: 'veg', allergens: [] },
  { id: 'salad_mix', name: 'Овощной салат (огурец, томат, зелень)', kcal: 18, p: 0.9, f: 0.2, c: 3.5, group: 'veg', allergens: [] },
  { id: 'veg_mix', name: 'Овощи тушёные', kcal: 45, p: 1.8, f: 0.5, c: 8, group: 'veg', allergens: [] },
  { id: 'spinach', name: 'Шпинат', kcal: 23, p: 2.9, f: 0.4, c: 3.6, group: 'veg', allergens: [] },
  // фрукты
  { id: 'banana', name: 'Банан', kcal: 89, p: 1.1, f: 0.3, c: 23, group: 'fruit', allergens: [] },
  { id: 'apple', name: 'Яблоко', kcal: 52, p: 0.3, f: 0.2, c: 14, group: 'fruit', allergens: [] },
  { id: 'berries', name: 'Ягоды', kcal: 50, p: 0.8, f: 0.4, c: 12, group: 'fruit', allergens: [] },
  { id: 'honey', name: 'Мёд', kcal: 304, p: 0.3, f: 0, c: 82, group: 'other', allergens: [] },
];

export const FOODS: Record<string, Food> = Object.fromEntries(F.map((f) => [f.id, f]));
export const FOOD_LIST = F;

/** Шаблоны приёмов пищи (базовые порции, масштабируются под калорийность) */
export const MEAL_TEMPLATES: Omit<Meal, 'id'>[] = [
  // завтраки
  { title: 'Овсянка с ягодами и йогуртом', slot: 'breakfast', items: [{ foodId: 'oats', grams: 60 }, { foodId: 'berries', grams: 100 }, { foodId: 'greek_yogurt', grams: 150 }, { foodId: 'honey', grams: 10 }] },
  { title: 'Омлет с овощами и хлебом', slot: 'breakfast', items: [{ foodId: 'eggs', grams: 165 }, { foodId: 'spinach', grams: 60 }, { foodId: 'bread', grams: 50 }, { foodId: 'salad_mix', grams: 100 }] },
  { title: 'Творог с бананом и миндалём', slot: 'breakfast', items: [{ foodId: 'cottage', grams: 200 }, { foodId: 'banana', grams: 100 }, { foodId: 'almonds', grams: 15 }] },
  { title: 'Гречка с яйцами', slot: 'breakfast', items: [{ foodId: 'buckwheat', grams: 60 }, { foodId: 'eggs', grams: 110 }, { foodId: 'salad_mix', grams: 100 }] },
  { title: 'Овсянка с арахисовой пастой и бананом', slot: 'breakfast', items: [{ foodId: 'oats', grams: 60 }, { foodId: 'peanut_butter', grams: 15 }, { foodId: 'banana', grams: 100 }, { foodId: 'soy_yogurt', grams: 150 }] },
  { title: 'Тофу-скрэмбл с авокадо', slot: 'breakfast', items: [{ foodId: 'tofu', grams: 200 }, { foodId: 'avocado', grams: 50 }, { foodId: 'spinach', grams: 60 }, { foodId: 'potato', grams: 150 }] },
  // обеды
  { title: 'Курица с рисом и брокколи', slot: 'lunch', items: [{ foodId: 'chicken', grams: 150 }, { foodId: 'rice', grams: 70 }, { foodId: 'broccoli', grams: 150 }, { foodId: 'olive_oil', grams: 7 }] },
  { title: 'Говядина с гречкой и салатом', slot: 'lunch', items: [{ foodId: 'beef', grams: 140 }, { foodId: 'buckwheat', grams: 70 }, { foodId: 'salad_mix', grams: 150 }, { foodId: 'olive_oil', grams: 7 }] },
  { title: 'Индейка с пастой и овощами', slot: 'lunch', items: [{ foodId: 'turkey', grams: 150 }, { foodId: 'pasta', grams: 70 }, { foodId: 'veg_mix', grams: 150 }, { foodId: 'olive_oil', grams: 5 }] },
  { title: 'Лосось с картофелем и салатом', slot: 'lunch', items: [{ foodId: 'salmon', grams: 130 }, { foodId: 'potato', grams: 250 }, { foodId: 'salad_mix', grams: 150 }] },
  { title: 'Чечевица с киноа и овощами', slot: 'lunch', items: [{ foodId: 'lentils', grams: 200 }, { foodId: 'quinoa', grams: 50 }, { foodId: 'veg_mix', grams: 150 }, { foodId: 'olive_oil', grams: 7 }] },
  { title: 'Свинина с бататом и брокколи', slot: 'lunch', items: [{ foodId: 'pork', grams: 140 }, { foodId: 'sweet_potato', grams: 220 }, { foodId: 'broccoli', grams: 150 }] },
  // ужины
  { title: 'Треска с овощами и рисом', slot: 'dinner', items: [{ foodId: 'cod', grams: 200 }, { foodId: 'veg_mix', grams: 200 }, { foodId: 'rice', grams: 50 }, { foodId: 'olive_oil', grams: 7 }] },
  { title: 'Курица с салатом и авокадо', slot: 'dinner', items: [{ foodId: 'chicken', grams: 150 }, { foodId: 'salad_mix', grams: 200 }, { foodId: 'avocado', grams: 60 }, { foodId: 'bread', grams: 40 }] },
  { title: 'Омлет с сыром и овощами', slot: 'dinner', items: [{ foodId: 'eggs', grams: 165 }, { foodId: 'cheese', grams: 25 }, { foodId: 'veg_mix', grams: 200 }] },
  { title: 'Нут с тофу и шпинатом', slot: 'dinner', items: [{ foodId: 'chickpeas', grams: 150 }, { foodId: 'tofu', grams: 150 }, { foodId: 'spinach', grams: 100 }, { foodId: 'olive_oil', grams: 5 }] },
  { title: 'Тунец с картофелем и салатом', slot: 'dinner', items: [{ foodId: 'tuna', grams: 150 }, { foodId: 'potato', grams: 200 }, { foodId: 'salad_mix', grams: 150 }, { foodId: 'olive_oil', grams: 7 }] },
  { title: 'Говядина с овощами', slot: 'dinner', items: [{ foodId: 'beef', grams: 140 }, { foodId: 'veg_mix', grams: 250 }, { foodId: 'buckwheat', grams: 40 }] },
  // перекусы
  { title: 'Греческий йогурт с ягодами', slot: 'snack', items: [{ foodId: 'greek_yogurt', grams: 170 }, { foodId: 'berries', grams: 80 }] },
  { title: 'Яблоко и миндаль', slot: 'snack', items: [{ foodId: 'apple', grams: 150 }, { foodId: 'almonds', grams: 20 }] },
  { title: 'Кефир и банан', slot: 'snack', items: [{ foodId: 'kefir', grams: 250 }, { foodId: 'banana', grams: 100 }] },
  { title: 'Творог с ягодами', slot: 'snack', items: [{ foodId: 'cottage', grams: 150 }, { foodId: 'berries', grams: 80 }] },
  { title: 'Хлебец с арахисовой пастой', slot: 'snack', items: [{ foodId: 'bread', grams: 40 }, { foodId: 'peanut_butter', grams: 15 }, { foodId: 'apple', grams: 120 }] },
  { title: 'Соевый йогурт с семенами', slot: 'snack', items: [{ foodId: 'soy_yogurt', grams: 200 }, { foodId: 'seeds', grams: 15 }, { foodId: 'berries', grams: 80 }] },
];
