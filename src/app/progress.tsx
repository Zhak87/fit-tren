import { router } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { Card, EmptyState, Screen, SectionTitle } from '../components/ui';
import { EXERCISES } from '../data/exercises';
import { mondayOf } from '../lib/plan';
import { useStore } from '../store/useStore';
import { colors, font, space } from '../theme';

const FEEL = ['😫', '😕', '🙂', '😀', '🔥'];

export default function Progress() {
  const logs = useStore((s) => s.logs);
  const program = useStore((s) => s.program);

  const stats = useMemo(() => {
    const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
    let sets = 0, volume = 0;
    const prs: Record<string, { weight: number; reps: number; date: string }> = {};
    for (const l of logs)
      for (const e of l.exercises)
        for (const s of e.sets) {
          if (!s.done) continue;
          sets++;
          volume += s.weight * s.reps;
          if (s.weight > 0 && (!prs[e.exerciseId] || s.weight > prs[e.exerciseId].weight)) prs[e.exerciseId] = { weight: s.weight, reps: s.reps, date: l.date };
        }
    // активность по 8 последним неделям
    const thisMon = mondayOf(new Date()).getTime();
    const weeks = Array.from({ length: 8 }, (_, i) => {
      const start = thisMon - (7 - i) * 7 * 86400000;
      const end = start + 7 * 86400000;
      return { start, count: logs.filter((l) => { const t = new Date(l.date).getTime(); return t >= start && t < end; }).length };
    });
    // серия недель подряд с тренировками
    let streak = 0;
    for (let i = weeks.length - 1; i >= 0; i--) {
      if (weeks[i].count > 0) streak++;
      else if (i !== weeks.length - 1) break;
    }
    const avgFeel = logs.length ? logs.reduce((a, l) => a + l.feeling, 0) / logs.length : 0;
    const minutes = logs.reduce((a, l) => a + l.durationMin, 0);
    return { sorted, sets, volume, prs, weeks, streak, avgFeel, minutes };
  }, [logs]);

  if (!logs.length)
    return (
      <Screen edges={[]}>
        <EmptyState icon="stats-chart" title="Пока нет данных" text="Прогресс строится по реально выполненным тренировкам. Завершите первую, и здесь появятся графики и рекорды." action="К тренировке" onAction={() => router.replace('/')} />
      </Screen>
    );

  const maxW = Math.max(1, ...stats.weeks.map((w) => w.count));
  const planned = program?.trainingDays.length ?? 3;

  return (
    <Screen edges={[]}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        <Tile value={`${logs.length}`} label="тренировок" />
        <Tile value={`${stats.streak}`} label="недель подряд" />
        <Tile value={`${Math.round(stats.volume / 1000 * 10) / 10} т`} label="общий тоннаж" />
        <Tile value={`${stats.sets}`} label="подходов" />
        <Tile value={`${Math.round(stats.minutes / 60 * 10) / 10} ч`} label="в тренировках" />
        <Tile value={FEEL[Math.round(stats.avgFeel) - 1] ?? '—'} label="самочувствие" />
      </View>

      <SectionTitle title="Регулярность (8 недель)" />
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 140, gap: 8 }}>
          {stats.weeks.map((w, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
              <Text style={font.small}>{w.count || ''}</Text>
              <View style={{ width: '100%', height: Math.max(4, (w.count / Math.max(maxW, planned)) * 100), backgroundColor: w.count >= planned ? colors.accent : w.count ? colors.info : colors.surface2, borderRadius: 6 }} />
              <Text style={[font.small, { fontSize: 10 }]}>{new Date(w.start).toLocaleDateString('ru-RU', { day: 'numeric', month: 'numeric' })}</Text>
            </View>
          ))}
        </View>
        <Text style={[font.small, { marginTop: 10 }]}>Зелёный — выполнен план недели ({planned} трен.)</Text>
      </Card>

      {Object.keys(stats.prs).length > 0 && (
        <>
          <SectionTitle title="Личные рекорды" />
          <Card style={{ gap: 10 }}>
            {Object.entries(stats.prs).sort((a, b) => b[1].weight - a[1].weight).slice(0, 10).map(([id, pr]) => (
              <View key={id} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                <Text style={[font.body, { flex: 1 }]} numberOfLines={1}>{EXERCISES[id]?.name ?? id}</Text>
                <Text style={[font.body, { color: colors.accent, fontWeight: '800' }]}>{pr.weight} кг × {pr.reps}</Text>
              </View>
            ))}
          </Card>
        </>
      )}

      <SectionTitle title="История" />
      <View style={{ gap: 10 }}>
        {stats.sorted.map((l) => {
          const w = program?.workouts.find((x) => x.id === l.workoutId);
          const done = l.exercises.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
          return (
            <Card key={l.workoutId + l.date} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }} onPress={w ? () => router.push(`/workout/${w.id}`) : undefined}>
              <Text style={{ fontSize: 26 }}>{FEEL[l.feeling - 1]}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[font.body, { fontWeight: '700' }]}>{w?.title ?? 'Тренировка'}</Text>
                <Text style={font.small}>{new Date(l.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} · {l.durationMin} мин · {done} подходов</Text>
              </View>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <Card style={{ width: '31.5%', alignItems: 'center', gap: 4, paddingHorizontal: 6 }}>
      <Text style={[font.h2, { color: colors.accent }]}>{value}</Text>
      <Text style={[font.small, { textAlign: 'center', fontSize: 12 }]}>{label}</Text>
    </Card>
  );
}
