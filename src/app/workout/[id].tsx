import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button, Card, Chip, EmptyState, Pill, Screen, SectionTitle } from '../../components/ui';
import { EXERCISES, isAvailable } from '../../data/exercises';
import { MUSCLES } from '../../data/muscles';
import { availableEquipment, dateFor, estimateMinutes, WEEKDAYS } from '../../lib/plan';
import { useStore } from '../../store/useStore';
import { colors, font, space } from '../../theme';

export default function WorkoutDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const program = useStore((s) => s.program);
  const profile = useStore((s) => s.profile);
  const logs = useStore((s) => s.logs);
  const replace = useStore((s) => s.replaceExercise);
  const [swapIdx, setSwapIdx] = useState<number | null>(null);
  const w = program?.workouts.find((x) => x.id === id);
  if (!w || !program || !profile)
    return (
      <Screen edges={[]}>
        <EmptyState icon="calendar" title="Тренировка не найдена" text="Возможно, программа была пересоздана." action="К плану" onAction={() => router.replace('/plan')} />
      </Screen>
    );
  const log = logs.find((l) => l.workoutId === w.id);
  const eq = availableEquipment(profile);
  const date = dateFor(program, w.week, w.day);

  return (
    <Screen edges={[]}>
      <Text style={font.small}>Неделя {w.week} · {WEEKDAYS[w.day]}, {date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</Text>
      <Text style={[font.h1, { marginTop: 4 }]}>{w.title}</Text>
      <Text style={[font.body, { color: colors.textDim }]}>{w.focus}</Text>
      <View style={{ flexDirection: 'row', gap: 6, marginTop: space(3), flexWrap: 'wrap' }}>
        <Pill text={`~${estimateMinutes(w)} мин`} icon="time" />
        <Pill text={`${w.exercises.length} упражнений`} icon="barbell" />
        {w.isDeload && <Pill text="Разгрузочная неделя" color={colors.info} icon="leaf" />}
        {log && <Pill text={`Выполнено ${new Date(log.date).toLocaleDateString('ru-RU')}`} color={colors.onAccent} bg={colors.accent} icon="checkmark" />}
      </View>

      <SectionTitle title="Разминка" />
      <Card style={{ gap: 8 }}>
        {w.warmup.map((x) => <Text key={x} style={font.body}>• {x}</Text>)}
      </Card>

      <SectionTitle title="Основная часть" />
      <View style={{ gap: 10 }}>
        {w.exercises.map((pe, i) => {
          const e = EXERCISES[pe.exerciseId];
          if (!e) return null;
          const alts = e.alternatives.map((a) => EXERCISES[a]).filter((a) => a && isAvailable(a, eq) && !(profile.place === 'home' && a.place === 'gym'));
          return (
            <Card key={i} style={{ gap: 8 }}>
              <Pressable onPress={() => router.push(`/exercise/${e.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ color: colors.accent, fontWeight: '900', fontSize: 18, width: 22 }}>{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[font.body, { fontWeight: '800' }]}>{e.name}</Text>
                  <Text style={font.small}>{MUSCLES[e.primary].name}</Text>
                </View>
                <Ionicons name="information-circle-outline" size={22} color={colors.textDim} />
              </Pressable>
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                <Pill text={`${pe.sets} × ${pe.reps}`} color={colors.text} />
                <Pill text={`отдых ${pe.restSec} с`} icon="hourglass" />
                <Pill text={pe.intensity} />
              </View>
              {alts.length > 0 && (
                <Pressable onPress={() => setSwapIdx(swapIdx === i ? null : i)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="swap-horizontal" size={16} color={colors.accent} />
                  <Text style={{ color: colors.accent, fontWeight: '700' }}>{swapIdx === i ? 'Скрыть замены' : 'Тренажёр занят или неудобно? Заменить'}</Text>
                </Pressable>
              )}
              {swapIdx === i && (
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                  {alts.map((a) => <Chip key={a.id} label={a.name} onPress={() => { replace(w.id, i, a.id); setSwapIdx(null); }} />)}
                </View>
              )}
            </Card>
          );
        })}
      </View>

      <SectionTitle title="Заминка" />
      <Card style={{ gap: 8 }}>
        {w.cooldown.map((x) => <Text key={x} style={font.body}>• {x}</Text>)}
      </Card>

      <Button big title={log ? 'Выполнить ещё раз' : 'Начать тренировку'} icon="play" style={{ marginTop: space(6) }} onPress={() => router.push(`/session/${w.id}`)} />
    </Screen>
  );
}
