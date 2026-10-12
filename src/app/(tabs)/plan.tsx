import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, Card, Chip, EmptyState, Notice, Pill, Screen } from '../../components/ui';
import { dateFor, estimateMinutes, todayPosition, WEEKDAYS } from '../../lib/plan';
import { useStore } from '../../store/useStore';
import { colors, font, space } from '../../theme';

export default function Plan() {
  const program = useStore((s) => s.program);
  const logs = useStore((s) => s.logs);
  const moveWorkout = useStore((s) => s.moveWorkout);
  const regenerate = useStore((s) => s.regenerateProgram);
  const pos = program ? todayPosition(program) : null;
  const [week, setWeek] = useState(pos?.week ?? 1);
  const [moving, setMoving] = useState<string | null>(null);

  if (!program)
    return (
      <Screen>
        <EmptyState icon="calendar" title="Плана пока нет" text="Сгенерируйте программу по своему профилю." action="Создать план" onAction={regenerate} />
      </Screen>
    );

  const done = new Set(logs.map((l) => l.workoutId));
  const workouts = program.workouts.filter((w) => w.week === week);
  const isDeload = workouts.some((w) => w.isDeload);
  const weekDone = workouts.filter((w) => done.has(w.id)).length;

  return (
    <Screen>
      <Text style={font.h1}>План</Text>
      <Text style={[font.small, { marginTop: 4 }]}>
        {program.split} · {program.weeks} недель · {program.trainingDays.length}× в неделю
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: space(4), marginHorizontal: -space(4) }} contentContainerStyle={{ gap: 8, paddingHorizontal: space(4) }}>
        {Array.from({ length: program.weeks }, (_, i) => i + 1).map((w) => {
          const all = program.workouts.filter((x) => x.week === w);
          const complete = all.length > 0 && all.every((x) => done.has(x.id));
          return <Chip key={w} label={`Нед. ${w}`} active={w === week} icon={complete ? 'checkmark-circle' : w === pos?.week ? 'radio-button-on' : undefined} onPress={() => setWeek(w)} />;
        })}
      </ScrollView>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space(4), marginBottom: space(3) }}>
        <Text style={font.h3}>Неделя {week}</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {isDeload && <Pill text="Разгрузочная" color={colors.info} icon="leaf" />}
          <Pill text={`${weekDone}/${workouts.length} выполнено`} />
        </View>
      </View>

      <View style={{ gap: 10 }}>
        {WEEKDAYS.map((label, day) => {
          const w = workouts.find((x) => x.day === day);
          const date = dateFor(program, week, day);
          const isToday = week === pos?.week && day === pos?.weekday;
          const past = week < (pos?.week ?? 0) || (week === pos?.week && day < (pos?.weekday ?? 0));
          if (!w)
            return (
              <View key={day} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6, paddingHorizontal: 4 }}>
                <DayBadge label={label} date={date} today={isToday} />
                <Text style={[font.small, { color: colors.textMuted }]}>Отдых</Text>
              </View>
            );
          const isDone = done.has(w.id);
          const freeDays = WEEKDAYS.map((_, i) => i).filter((i) => !workouts.some((x) => x.day === i));
          return (
            <View key={day} style={{ flexDirection: 'row', gap: 12 }}>
              <DayBadge label={label} date={date} today={isToday} />
              <Card style={{ flex: 1, gap: 8 }} accent={isToday && !isDone} onPress={() => router.push(`/workout/${w.id}`)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={[font.body, { fontWeight: '800', flex: 1 }]}>{w.title}</Text>
                  {isDone ? (
                    <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
                  ) : past ? (
                    <Pill text="Пропущено" color={colors.warning} />
                  ) : null}
                </View>
                <Text style={font.small}>{w.focus} · {w.exercises.length} упр. · ~{estimateMinutes(w)} мин</Text>
                {!isDone && (
                  <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                    <Chip label={moving === w.id ? 'Отмена' : 'Перенести'} icon="swap-horizontal" onPress={() => setMoving(moving === w.id ? null : w.id)} />
                    {past && <Chip label="Выполнить сейчас" icon="play" onPress={() => router.push(`/session/${w.id}`)} />}
                  </View>
                )}
                {moving === w.id && (
                  <View style={{ gap: 8 }}>
                    <Text style={font.small}>На какой день перенести?</Text>
                    <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                      {freeDays.map((d) => (
                        <Chip key={d} label={WEEKDAYS[d]} onPress={() => { moveWorkout(w.id, d); setMoving(null); }} />
                      ))}
                    </View>
                  </View>
                )}
              </Card>
            </View>
          );
        })}
      </View>

      <Card style={{ marginTop: space(6), gap: 8 }}>
        <Text style={font.label}>Как растёт нагрузка</Text>
        <Text style={font.body}>{program.progressionNote}</Text>
      </Card>
      <View style={{ marginTop: space(3) }}>
        <Notice text="Пропустили тренировку? План не ломается: перенесите её на свободный день или просто продолжайте со следующей." />
      </View>
      <Button variant="ghost" title="Пересоздать программу" icon="refresh" style={{ marginTop: space(4) }} onPress={regenerate} />
    </Screen>
  );
}

function DayBadge({ label, date, today }: { label: string; date: Date; today: boolean }) {
  return (
    <View style={{ width: 44, alignItems: 'center', paddingTop: 6 }}>
      <Text style={[font.small, { fontWeight: '700' }, today && { color: colors.accent }]}>{label}</Text>
      <Text style={[font.h3, today && { color: colors.accent }]}>{date.getDate()}</Text>
    </View>
  );
}
