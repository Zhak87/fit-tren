import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DEFAULT_PROFILE, DIET_LABEL, GOAL_LABEL, PLACE_LABEL, ProfileForm } from '../components/ProfileForm';
import { Bar, Button, Card } from '../components/ui';
import { LEVEL_LABEL } from '../data/exercises';
import { calcTargets } from '../lib/nutrition';
import { useStore } from '../store/useStore';
import { colors, font, space } from '../theme';
import type { Profile } from '../types';

const TITLES = [
  ['Добро пожаловать в FIT / AI', 'Ответьте на несколько вопросов, и мы соберём персональный план тренировок и питания.'],
  ['Выберите модель', 'Модель тела для карты мышц.'],
  ['Ваш уровень', 'От этого зависят упражнения, объём и прогрессия.'],
  ['Главная цель', 'Можно изменить в любой момент в профиле.'],
  ['Где тренируетесь?', 'Подберём упражнения под ваш инвентарь.'],
  ['Расписание', 'Сколько времени готовы уделять.'],
  ['Параметры тела', 'Для расчёта калорий.'],
  ['Питание', 'Учтём ограничения в плане питания.'],
];

export default function Onboarding() {
  const complete = useStore((st) => st.completeOnboarding);
  const [step, setStep] = useState(0);
  const [p, setP] = useState<Profile>(DEFAULT_PROFILE);
  const set = (patch: Partial<Profile>) => setP((x) => ({ ...x, ...patch }));
  const total = TITLES.length + 1;
  const summary = step === TITLES.length;
  const t = calcTargets(p);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <View style={{ paddingHorizontal: space(4), paddingTop: space(2), gap: space(3) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {step > 0 ? (
            <Pressable onPress={() => setStep(step - 1)} hitSlop={12} accessibilityLabel="Назад">
              <Ionicons name="chevron-back" size={26} color={colors.text} />
            </Pressable>
          ) : (
            <Text style={{ color: colors.accent, fontWeight: '900', fontSize: 18, letterSpacing: 1 }}>FIT / AI</Text>
          )}
          <View style={{ flex: 1 }}>
            <Bar value={step + 1} max={total} height={6} />
          </View>
          <Text style={font.small}>{step + 1}/{total}</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: space(4), paddingBottom: space(8) }} keyboardShouldPersistTaps="handled">
        {!summary ? (
          <>
            <Text style={[font.h1, { marginBottom: space(2) }]}>{TITLES[step][0]}</Text>
            <Text style={[font.body, { color: colors.textDim, marginBottom: space(6) }]}>{TITLES[step][1]}</Text>
            <ProfileForm p={p} set={set} section={step} />
          </>
        ) : (
          <View style={{ gap: space(3) }}>
            <Text style={font.h1}>Всё готово{p.name ? `, ${p.name}` : ''}!</Text>
            <Text style={[font.body, { color: colors.textDim }]}>Проверьте ответы. Изменить их можно позже в профиле.</Text>
            <Card style={{ gap: 10 }}>
              {[
                ['Модель', p.sex === 'male' ? 'Мужская' : 'Женская'],
                ['Уровень', LEVEL_LABEL[p.level]],
                ['Цель', GOAL_LABEL[p.goal]],
                ['Место', PLACE_LABEL[p.place]],
                ['Расписание', `${p.daysPerWeek}× в неделю по ${p.sessionMinutes} мин`],
                ['Программа', `${p.weeks} недель`],
                ['Питание', `${DIET_LABEL[p.diet]}, ${p.mealsPerDay} приёма пищи`],
              ].map(([k, v]) => (
                <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={font.small}>{k}</Text>
                  <Text style={[font.body, { fontWeight: '700' }]}>{v}</Text>
                </View>
              ))}
            </Card>
            <Card accent style={{ gap: 6 }}>
              <Text style={font.label}>Ориентир калорий</Text>
              <Text style={[font.num, { color: colors.accent }]}>{t.kcal} ккал</Text>
              <Text style={font.small}>Б {t.protein} г · Ж {t.fat} г · У {t.carbs} г в день</Text>
            </Card>
          </View>
        )}
      </ScrollView>
      <View style={{ padding: space(4), paddingTop: 0 }}>
        <Button
          big
          title={summary ? 'Создать мой план' : 'Далее'}
          icon={summary ? 'sparkles' : 'arrow-forward'}
          onPress={() => {
            if (!summary) return setStep(step + 1);
            complete(p);
            router.replace('/');
          }}
        />
      </View>
    </SafeAreaView>
  );
}
