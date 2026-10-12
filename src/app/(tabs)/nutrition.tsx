import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Bar, Button, Card, Chip, IconButton, Notice, Ring, Screen, SectionTitle } from '../../components/ui';
import { FOODS, FOOD_LIST } from '../../data/foods';
import { calcTargets, foodAllowed, itemMacros, SLOT_LABEL, substitutes, sumDay, sumItems, swapItem } from '../../lib/nutrition';
import { todayPosition, WEEKDAYS } from '../../lib/plan';
import { useStore } from '../../store/useStore';
import { colors, font, radius, space } from '../../theme';

export default function Nutrition() {
  const profile = useStore((s) => s.profile)!;
  const program = useStore((s) => s.program);
  const plan = useStore((s) => s.mealPlan);
  const kcalOverride = useStore((s) => s.kcalOverride);
  const setKcal = useStore((s) => s.setKcalOverride);
  const regenerate = useStore((s) => s.regenerateMeals);
  const updateItem = useStore((s) => s.updateMealItem);
  const addItem = useStore((s) => s.addMealItem);
  const [day, setDay] = useState(program ? todayPosition(program).weekday : 0);
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [showWhy, setShowWhy] = useState(false);
  const [showAnyway, setShowAnyway] = useState(false);

  const t = calcTargets(profile);
  const target = kcalOverride ?? t.kcal;
  const scale = target / t.kcal;
  const tp = Math.round(t.protein), tf = Math.round(t.fat * (kcalOverride ? scale : 1)), tc = Math.max(0, Math.round((target - tp * 4 - tf * 9) / 4));
  const dayPlan = plan?.[day];
  const total = dayPlan ? sumDay(dayPlan) : { kcal: 0, p: 0, f: 0, c: 0 };
  const special = profile.specialCondition || profile.age < 18;
  const minSafe = profile.sex === 'female' ? 1300 : 1600;

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={font.h1}>Питание</Text>
        <IconButton icon="cart" label="Список покупок" onPress={() => router.push('/shopping')} />
      </View>

      {special && (
        <View style={{ marginTop: space(3) }}>
          <Notice tone="warning" text="Для вашей ситуации стандартный план не является медицинской рекомендацией. Пожалуйста, согласуйте питание с врачом или диетологом." />
        </View>
      )}

      {special && !showAnyway ? (
        <Button title="Показать ориентировочный план" variant="secondary" style={{ marginTop: space(4) }} onPress={() => setShowAnyway(true)} />
      ) : (
        <>
          <Card style={{ marginTop: space(4), flexDirection: 'row', alignItems: 'center', gap: space(4) }}>
            <Ring size={116} stroke={11} progress={total.kcal / target}>
              <Text style={font.h3}>{Math.round(total.kcal)}</Text>
              <Text style={font.small}>из {target}</Text>
            </Ring>
            <View style={{ flex: 1, gap: 10 }}>
              <Macro label="Белки" value={total.p} target={tp} color={colors.protein} />
              <Macro label="Жиры" value={total.f} target={tf} color={colors.fat} />
              <Macro label="Углеводы" value={total.c} target={tc} color={colors.carbs} />
            </View>
          </Card>

          <Card style={{ marginTop: space(3), gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={[font.body, { flex: 1, fontWeight: '700' }]}>Цель в день</Text>
              <IconButton icon="remove" label="Уменьшить калории" onPress={() => setKcal(Math.max(minSafe, target - 50))} />
              <Text style={[font.h3, { minWidth: 70, textAlign: 'center' }]}>{target}</Text>
              <IconButton icon="add" label="Увеличить калории" onPress={() => setKcal(Math.min(5000, target + 50))} />
            </View>
            {kcalOverride !== null && (
              <Pressable onPress={() => setKcal(null)}>
                <Text style={{ color: colors.accent, fontWeight: '700' }}>Вернуть расчётные {t.kcal} ккал</Text>
              </Pressable>
            )}
            <Pressable onPress={() => setShowWhy(!showWhy)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name={showWhy ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textDim} />
              <Text style={font.small}>Как рассчитано</Text>
            </Pressable>
            {showWhy && (
              <View style={{ gap: 4 }}>
                <Text style={font.small}>• Базовый обмен (формула Миффлина — Сан Жеора): {t.bmr} ккал</Text>
                <Text style={font.small}>• Активность ×{t.activity} ({profile.daysPerWeek} тренировки в неделю): {t.tdee} ккал</Text>
                <Text style={font.small}>• Поправка под цель: {t.adjustmentPct > 0 ? '+' : ''}{t.adjustmentPct}%{t.floorApplied ? ' (ограничено безопасным минимумом)' : ''}</Text>
                <Text style={font.small}>• Белок {Math.round((t.protein / profile.weightKg) * 10) / 10} г/кг, жиры не ниже 25% калорий</Text>
                <Text style={[font.small, { color: colors.warning }]}>Это ориентир, а не медицинское назначение. Приложение не предлагает экстремальных дефицитов: минимум {minSafe} ккал.</Text>
              </View>
            )}
          </Card>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: space(4), marginHorizontal: -space(4) }} contentContainerStyle={{ gap: 8, paddingHorizontal: space(4) }}>
            {WEEKDAYS.map((d, i) => (
              <Chip key={d} label={d} active={day === i} onPress={() => setDay(i)} />
            ))}
          </ScrollView>

          {dayPlan?.meals.map((meal) => {
            const m = sumItems(meal.items);
            return (
              <View key={meal.id}>
                <SectionTitle title={SLOT_LABEL[meal.slot]} />
                <Card style={{ gap: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <Text style={[font.body, { fontWeight: '800', flex: 1 }]}>{meal.title}</Text>
                    <Text style={[font.body, { color: colors.accent, fontWeight: '800' }]}>{Math.round(m.kcal)} ккал</Text>
                  </View>
                  <Text style={font.small}>Б {Math.round(m.p)} · Ж {Math.round(m.f)} · У {Math.round(m.c)}</Text>
                  {meal.items.map((it, idx) => {
                    const f = FOODS[it.foodId];
                    const key = `${meal.id}-${idx}`;
                    const mm = itemMacros(it);
                    const isOpen = open === key;
                    return (
                      <View key={key} style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, gap: 8 }}>
                        <Pressable onPress={() => setOpen(isOpen ? null : key)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={[font.body, { flex: 1 }]}>{f.name}</Text>
                          <Text style={font.small}>{it.grams} г · {Math.round(mm.kcal)} ккал</Text>
                          <Ionicons name="create-outline" size={16} color={colors.textMuted} />
                        </Pressable>
                        {isOpen && (
                          <View style={{ gap: 8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <IconButton icon="remove" label="Меньше" onPress={() => updateItem(day, meal.id, idx, { ...it, grams: Math.max(5, it.grams - 10) })} />
                              <Text style={[font.h3, { minWidth: 70, textAlign: 'center' }]}>{it.grams} г</Text>
                              <IconButton icon="add" label="Больше" onPress={() => updateItem(day, meal.id, idx, { ...it, grams: it.grams + 10 })} />
                              <View style={{ flex: 1 }} />
                              <IconButton icon="trash-outline" color={colors.danger} label="Удалить" onPress={() => { updateItem(day, meal.id, idx, null); setOpen(null); }} />
                            </View>
                            {f.unit && <Text style={font.small}>{f.unit}</Text>}
                            <Text style={font.label}>Заменить на (похожая ценность)</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                              {substitutes(it.foodId, profile).slice(0, 5).map((sub) => (
                                <Chip key={sub.id} label={sub.name} onPress={() => { updateItem(day, meal.id, idx, swapItem(it, sub.id)); setOpen(null); }} />
                              ))}
                            </View>
                          </View>
                        )}
                      </View>
                    );
                  })}
                  {adding === meal.id ? (
                    <View style={{ gap: 8 }}>
                      <TextInput value={query} onChangeText={setQuery} placeholder="Поиск продукта" placeholderTextColor={colors.textMuted} style={{ backgroundColor: colors.surface2, color: colors.text, borderRadius: radius.sm, padding: 12 }} />
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                        {FOOD_LIST.filter((f) => foodAllowed(f, profile) && f.name.toLowerCase().includes(query.toLowerCase()))
                          .slice(0, 12)
                          .map((f) => (
                            <Chip key={f.id} label={f.name} onPress={() => { addItem(day, meal.id, { foodId: f.id, grams: 100 }); setAdding(null); setQuery(''); }} />
                          ))}
                      </View>
                      <Button variant="ghost" title="Отмена" onPress={() => setAdding(null)} />
                    </View>
                  ) : (
                    <Pressable onPress={() => setAdding(meal.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 4 }}>
                      <Ionicons name="add-circle-outline" size={18} color={colors.accent} />
                      <Text style={{ color: colors.accent, fontWeight: '700' }}>Добавить продукт</Text>
                    </Pressable>
                  )}
                </Card>
              </View>
            );
          })}

          <Button variant="ghost" title="Собрать новый план питания" icon="refresh" style={{ marginTop: space(6) }} onPress={regenerate} />
          <Text style={[font.small, { textAlign: 'center', marginTop: space(3) }]}>Пищевая ценность ориентировочная, на 100 г продукта по открытым таблицам состава.</Text>
        </>
      )}
    </Screen>
  );
}

function Macro({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={font.small}>{label}</Text>
        <Text style={[font.small, { color: colors.text }]}>{Math.round(value)} / {target} г</Text>
      </View>
      <Bar value={value} max={target} color={color} height={6} />
    </View>
  );
}
