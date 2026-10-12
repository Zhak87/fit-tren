import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { GOAL_LABEL } from '../../components/ProfileForm';
import { Button, Card, IconButton, Pill, Ring, Screen, SectionTitle } from '../../components/ui';
import { EXERCISES } from '../../data/exercises';
import { calcTargets, sumDay } from '../../lib/nutrition';
import { estimateMinutes, todayPosition, WEEKDAYS } from '../../lib/plan';
import { useStore } from '../../store/useStore';
import { colors, font, space } from '../../theme';

const QUICK = ['Чем заменить приседания, если болят колени?', 'Я пропустил тренировку, что делать?', 'Что съесть после тренировки?'];

export default function Home() {
  const profile = useStore((s) => s.profile)!;
  const program = useStore((s) => s.program);
  const logs = useStore((s) => s.logs);
  const mealPlan = useStore((s) => s.mealPlan);
  const kcalOverride = useStore((s) => s.kcalOverride);
  const done = new Set(logs.map((l) => l.workoutId));

  const pos = program ? todayPosition(program) : null;
  const weekWorkouts = program && pos ? program.workouts.filter((w) => w.week === pos.week) : [];
  const today = weekWorkouts.find((w) => w.day === pos?.weekday);
  const next = weekWorkouts.filter((w) => w.day > (pos?.weekday ?? 0) && !done.has(w.id)).sort((a, b) => a.day - b.day)[0];
  const weekDone = weekWorkouts.filter((w) => done.has(w.id)).length;
  const targetKcal = kcalOverride ?? calcTargets(profile).kcal;
  const dayIdx = pos?.weekday ?? 0;
  const plannedKcal = mealPlan ? Math.round(sumDay(mealPlan[dayIdx]).kcal) : 0;
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер';

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={font.small}>{new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
          <Text style={font.h1}>{greet}{profile.name ? `, ${profile.name}` : ''}</Text>
        </View>
        <IconButton icon="stats-chart" label="Прогресс" onPress={() => router.push('/progress')} />
        <IconButton icon="person" label="Профиль" onPress={() => router.push('/profile')} />
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: space(3) }}>
        <Pill text={GOAL_LABEL[profile.goal]} color={colors.accent} bg={colors.accentDim} icon="flag" />
        {program && pos && <Pill text={pos.finished ? 'Программа завершена' : `Неделя ${pos.week} из ${program.weeks}`} icon="calendar" />}
      </View>

      {/* сегодня */}
      <Card style={{ marginTop: space(5), padding: space(5), gap: 12, backgroundColor: colors.surface2 }}>
        {today ? (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={font.label}>Тренировка сегодня</Text>
              {done.has(today.id) ? <Pill text="Выполнено" color={colors.onAccent} bg={colors.accent} icon="checkmark" /> : today.isDeload ? <Pill text="Разгрузка" color={colors.info} /> : null}
            </View>
            <Text style={font.h2}>{today.title}</Text>
            <Text style={font.small}>{today.focus}</Text>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <Stat icon="barbell" text={`${today.exercises.length} упражнений`} />
              <Stat icon="time" text={`~${estimateMinutes(today)} мин`} />
            </View>
            <View style={{ gap: 6 }}>
              {today.exercises.slice(0, 4).map((e) => (
                <Text key={e.exerciseId} style={font.small} numberOfLines={1}>
                  • {EXERCISES[e.exerciseId]?.name} — {e.sets}×{e.reps}
                </Text>
              ))}
              {today.exercises.length > 4 && <Text style={font.small}>и ещё {today.exercises.length - 4}</Text>}
            </View>
            <Button big title={done.has(today.id) ? 'Повторить' : 'Начать тренировку'} icon="play" onPress={() => router.push(`/session/${today.id}`)} />
            <Button variant="ghost" title="Подробнее" onPress={() => router.push(`/workout/${today.id}`)} />
          </>
        ) : (
          <>
            <Text style={font.label}>Сегодня</Text>
            <Text style={font.h2}>{pos?.finished ? 'Программа завершена 🎉' : 'День восстановления'}</Text>
            <Text style={font.small}>
              {pos?.finished
                ? 'Создайте новую программу в профиле, чтобы продолжить прогресс.'
                : 'Мышцы растут во время отдыха. Прогулка, растяжка и сон — отличный выбор на сегодня.'}
            </Text>
            {next && (
              <Card onPress={() => router.push(`/workout/${next.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="arrow-forward-circle" size={28} color={colors.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={font.small}>Следующая: {WEEKDAYS[next.day]}</Text>
                  <Text style={[font.body, { fontWeight: '700' }]}>{next.title}</Text>
                </View>
              </Card>
            )}
          </>
        )}
      </Card>

      {/* неделя */}
      <SectionTitle title="Эта неделя" action="Весь план" onAction={() => router.push('/plan')} />
      <Card style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {WEEKDAYS.map((d, i) => {
          const w = weekWorkouts.find((x) => x.day === i);
          const isDone = w && done.has(w.id);
          const isToday = i === pos?.weekday;
          return (
            <View key={d} style={{ alignItems: 'center', gap: 8 }}>
              <Text style={[font.small, isToday && { color: colors.accent, fontWeight: '800' }]}>{d}</Text>
              <View
                style={{
                  width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: isDone ? colors.accent : w ? colors.surface2 : 'transparent',
                  borderWidth: isToday ? 2 : 1, borderColor: isToday ? colors.accent : colors.border,
                }}
              >
                {isDone ? <Ionicons name="checkmark" size={18} color={colors.onAccent} /> : w ? <Ionicons name="barbell" size={14} color={colors.textDim} /> : null}
              </View>
            </View>
          );
        })}
      </Card>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: space(3) }}>
        <Card style={{ flex: 1, alignItems: 'center', gap: 8 }} onPress={() => router.push('/progress')}>
          <Ring size={84} stroke={9} progress={weekWorkouts.length ? weekDone / weekWorkouts.length : 0}>
            <Text style={font.h3}>{weekDone}/{weekWorkouts.length}</Text>
          </Ring>
          <Text style={font.small}>тренировок</Text>
        </Card>
        <Card style={{ flex: 1, alignItems: 'center', gap: 8 }} onPress={() => router.push('/nutrition')}>
          <Ring size={84} stroke={9} progress={plannedKcal / targetKcal} color={colors.info}>
            <Text style={[font.h3, { fontSize: 15 }]}>{targetKcal}</Text>
          </Ring>
          <Text style={font.small}>ккал цель</Text>
        </Card>
        <Card style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 }} onPress={() => router.push('/progress')}>
          <Text style={[font.num, { color: colors.accent }]}>{logs.length}</Text>
          <Text style={[font.small, { textAlign: 'center' }]}>всего тренировок</Text>
        </Card>
      </View>

      {/* ИИ */}
      <SectionTitle title="ИИ-тренер" />
      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.accentDim, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="sparkles" size={20} color={colors.accent} />
          </View>
          <Text style={[font.body, { flex: 1 }]}>Спросите про технику, замену упражнений или питание</Text>
        </View>
        {QUICK.map((q) => (
          <Card key={q} onPress={() => router.push({ pathname: '/coach', params: { q } })} style={{ padding: 12, backgroundColor: colors.surface2 }}>
            <Text style={font.small}>{q}</Text>
          </Card>
        ))}
      </Card>

      <SectionTitle title="Библиотека" />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Card style={{ flex: 1, gap: 8 }} onPress={() => router.push('/library')}>
          <Ionicons name="list" size={24} color={colors.accent} />
          <Text style={[font.body, { fontWeight: '700' }]}>Все упражнения</Text>
        </Card>
        <Card style={{ flex: 1, gap: 8 }} onPress={() => router.push('/muscles')}>
          <Ionicons name="body" size={24} color={colors.accent} />
          <Text style={[font.body, { fontWeight: '700' }]}>Карта мышц</Text>
        </Card>
      </View>
    </Screen>
  );
}

function Stat({ icon, text }: { icon: 'barbell' | 'time'; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Ionicons name={icon} size={16} color={colors.accent} />
      <Text style={[font.small, { color: colors.text }]}>{text}</Text>
    </View>
  );
}
