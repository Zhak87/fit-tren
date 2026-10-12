import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, Switch, Text, TextInput, View } from 'react-native';
import { Stepper } from './Stepper';
import { Card, Chip, Notice, s, tap, type IconName } from './ui';
import { EQUIPMENT_LABEL, LEVEL_LABEL } from '../data/exercises';
import { colors, font, radius, space } from '../theme';
import type { Allergen, DietType, Equipment, Goal, Level, Place, Profile } from '../types';

export const GOAL_LABEL: Record<Goal, string> = {
  fitness: 'Общая форма',
  muscle: 'Набор мышц',
  strength: 'Сила',
  endurance: 'Выносливость',
  fatloss: 'Снижение жира',
  maintain: 'Поддержание',
};
const GOAL_ICON: Record<Goal, IconName> = {
  fitness: 'pulse', muscle: 'barbell', strength: 'flash', endurance: 'bicycle', fatloss: 'flame', maintain: 'shield-checkmark',
};
const GOAL_DESC: Record<Goal, string> = {
  fitness: 'Сбалансированные тренировки для здоровья и тонуса',
  muscle: 'Гипертрофия: средние повторения, умеренный профицит',
  strength: 'Тяжёлые базовые упражнения, малые повторения',
  endurance: 'Высокий темп, много повторений, короткий отдых',
  fatloss: 'Силовые + кардио-финишеры, мягкий дефицит калорий',
  maintain: 'Удержать текущую форму без лишней нагрузки',
};
const LEVEL_DESC: Record<Level, string> = {
  beginner: 'Тренируюсь меньше 6 месяцев или после долгого перерыва',
  intermediate: 'Регулярно 6 месяцев – 2 года, знаю базовую технику',
  advanced: 'Больше 2 лет, работаю с весами и периодизацией',
};
export const PLACE_LABEL: Record<Place, string> = { home: 'Дома', gym: 'В зале', mixed: 'Дом + зал' };
export const DIET_LABEL: Record<DietType, string> = { any: 'Без ограничений', vegetarian: 'Вегетарианство', pescatarian: 'Пескетарианство', no_pork: 'Без свинины' };
export const ALLERGEN_LABEL: Record<Allergen, string> = { lactose: 'Лактоза', gluten: 'Глютен', nuts: 'Орехи', eggs: 'Яйца', fish: 'Рыба', soy: 'Соя' };
const HOME_EQ: Equipment[] = ['dumbbells', 'bands', 'pullupbar', 'bench', 'kettlebell', 'barbell'];

export const DEFAULT_PROFILE: Profile = {
  name: '',
  sex: 'male',
  level: 'beginner',
  goal: 'fitness',
  place: 'home',
  equipment: [],
  daysPerWeek: 3,
  sessionMinutes: 45,
  weeks: 8,
  heightCm: 175,
  weightKg: 75,
  age: 28,
  avoidExercises: [],
  diet: 'any',
  allergens: [],
  mealsPerDay: 4,
  specialCondition: false,
};

function Option({ title, desc, icon, active, onPress }: { title: string; desc?: string; icon?: IconName; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => { tap(); onPress(); }}
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      style={[s.card, { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 }, active && { borderColor: colors.accent, backgroundColor: colors.accentDim }]}
    >
      {icon && (
        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: active ? colors.accent : colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon} size={22} color={active ? colors.onAccent : colors.text} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={[font.body, { fontWeight: '800' }]}>{title}</Text>
        {desc && <Text style={font.small}>{desc}</Text>}
      </View>
      <Ionicons name={active ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={active ? colors.accent : colors.textMuted} />
    </Pressable>
  );
}

export function ProfileForm({ p, set, section }: { p: Profile; set: (patch: Partial<Profile>) => void; section: number }) {
  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const blocks: ReactNode[] = [
    <View key="name" style={{ gap: 12 }}>
      <Text style={font.small}>Как к вам обращаться? (необязательно)</Text>
      <TextInput
        value={p.name}
        onChangeText={(name) => set({ name })}
        placeholder="Имя"
        placeholderTextColor={colors.textMuted}
        style={{ backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, color: colors.text, padding: 16, fontSize: 18 }}
      />
    </View>,
    <View key="sex">
      <Option title="Мужская модель" icon="man" active={p.sex === 'male'} onPress={() => set({ sex: 'male' })} />
      <Option title="Женская модель" icon="woman" active={p.sex === 'female'} onPress={() => set({ sex: 'female' })} />
      <Notice text="Это настройка 3D-модели и расчёта калорий. Программы подбираются по вашей цели и уровню, а не по стереотипам." />
    </View>,
    <View key="level">
      {(['beginner', 'intermediate', 'advanced'] as Level[]).map((l) => (
        <Option key={l} title={LEVEL_LABEL[l]} desc={LEVEL_DESC[l]} icon={l === 'beginner' ? 'leaf' : l === 'intermediate' ? 'trending-up' : 'trophy'} active={p.level === l} onPress={() => set({ level: l })} />
      ))}
    </View>,
    <View key="goal">
      {(Object.keys(GOAL_LABEL) as Goal[]).map((g) => (
        <Option key={g} title={GOAL_LABEL[g]} desc={GOAL_DESC[g]} icon={GOAL_ICON[g]} active={p.goal === g} onPress={() => set({ goal: g })} />
      ))}
    </View>,
    <View key="place">
      {(['home', 'gym', 'mixed'] as Place[]).map((pl) => (
        <Option key={pl} title={PLACE_LABEL[pl]} icon={pl === 'home' ? 'home' : pl === 'gym' ? 'barbell' : 'swap-horizontal'} active={p.place === pl} onPress={() => set({ place: pl })} />
      ))}
      {p.place === 'home' ? (
        <>
          <Text style={[font.label, { marginTop: space(3), marginBottom: space(2) }]}>Что есть дома</Text>
          <View style={s.wrap}>
            {HOME_EQ.map((e) => (
              <Chip key={e} label={EQUIPMENT_LABEL[e]} active={p.equipment.includes(e)} onPress={() => set({ equipment: toggle(p.equipment, e) })} />
            ))}
          </View>
          <Text style={[font.small, { marginTop: 8 }]}>Ничего нет? Не страшно: план соберётся из упражнений с собственным весом.</Text>
        </>
      ) : (
        <Text style={[font.small, { marginTop: 4 }]}>В зале подберём упражнения со свободными весами, тренажёрами и блоками, плюс альтернативы, если тренажёр занят.</Text>
      )}
    </View>,
    <View key="schedule" style={{ gap: space(3) }}>
      <Text style={font.label}>Тренировок в неделю</Text>
      <View style={s.wrap}>
        {[2, 3, 4, 5, 6].map((d) => <Chip key={d} label={`${d}`} active={p.daysPerWeek === d} onPress={() => set({ daysPerWeek: d })} />)}
      </View>
      <Text style={font.label}>Длительность занятия</Text>
      <View style={s.wrap}>
        {[30, 45, 60, 75, 90].map((m) => <Chip key={m} label={`${m} мин`} active={p.sessionMinutes === m} onPress={() => set({ sessionMinutes: m })} />)}
      </View>
      <Text style={font.label}>Срок программы</Text>
      <View style={s.wrap}>
        {([4, 8, 12] as const).map((w) => <Chip key={w} label={`${w} недель`} active={p.weeks === w} onPress={() => set({ weeks: w })} />)}
      </View>
    </View>,
    <View key="body" style={{ gap: space(3) }}>
      <Notice text="Рост, вес и возраст нужны только для расчёта ориентировочной калорийности. Данные хранятся на вашем устройстве." icon="lock-closed" />
      <Stepper label="Рост" unit="см" value={p.heightCm} min={130} max={220} onChange={(heightCm) => set({ heightCm })} />
      <Stepper label="Вес" unit="кг" value={p.weightKg} min={35} max={200} step={0.5} onChange={(weightKg) => set({ weightKg })} />
      <Stepper label="Возраст" unit="лет" value={p.age} min={14} max={90} onChange={(age) => set({ age })} />
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={[font.body, { fontWeight: '700' }]}>Особая ситуация</Text>
          <Text style={font.small}>Беременность, хронические заболевания, травмы или возраст до 18 лет</Text>
        </View>
        <Switch value={p.specialCondition} onValueChange={(v) => set({ specialCondition: v })} trackColor={{ true: colors.accent, false: colors.surface2 }} thumbColor="#fff" />
      </Card>
      {(p.specialCondition || p.age < 18) && <Notice tone="warning" text="Перед началом тренировок и изменением питания проконсультируйтесь с врачом. Приложение даст только общие ориентиры." />}
    </View>,
    <View key="food" style={{ gap: space(3) }}>
      <Text style={font.label}>Тип питания</Text>
      <View style={s.wrap}>
        {(Object.keys(DIET_LABEL) as DietType[]).map((d) => <Chip key={d} label={DIET_LABEL[d]} active={p.diet === d} onPress={() => set({ diet: d })} />)}
      </View>
      <Text style={font.label}>Аллергии и непереносимость</Text>
      <View style={s.wrap}>
        {(Object.keys(ALLERGEN_LABEL) as Allergen[]).map((a) => <Chip key={a} label={ALLERGEN_LABEL[a]} active={p.allergens.includes(a)} onPress={() => set({ allergens: toggle(p.allergens, a) })} />)}
      </View>
      <Text style={font.label}>Приёмов пищи в день</Text>
      <View style={s.wrap}>
        {([3, 4, 5] as const).map((m) => <Chip key={m} label={`${m}`} active={p.mealsPerDay === m} onPress={() => set({ mealsPerDay: m })} />)}
      </View>
    </View>,
  ];
  return <>{blocks[section]}</>;
}

