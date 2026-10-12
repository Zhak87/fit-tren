import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bar, Button, EmptyState, Pill, Ring, Screen, tap } from '../../components/ui';
import { VideoBlock } from '../../components/VideoBlock';
import { EXERCISES } from '../../data/exercises';
import { MUSCLES } from '../../data/muscles';
import { useStore } from '../../store/useStore';
import { colors, font, radius, space } from '../../theme';
import type { SetLog } from '../../types';

const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

export default function Session() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const program = useStore((s) => s.program);
  const logs = useStore((s) => s.logs);
  const addLog = useStore((s) => s.addLog);
  const w = program?.workouts.find((x) => x.id === id);

  // последние веса по каждому упражнению
  const lastWeights = useMemo(() => {
    const map: Record<string, SetLog[]> = {};
    [...logs].sort((a, b) => a.date.localeCompare(b.date)).forEach((l) => l.exercises.forEach((e) => (map[e.exerciseId] = e.sets)));
    return map;
  }, [logs]);

  const [sets, setSets] = useState<SetLog[][]>(() =>
    (w?.exercises ?? []).map((pe) => {
      const prev = lastWeights[pe.exerciseId];
      const reps = parseInt(pe.reps, 10) || 10;
      return Array.from({ length: pe.sets }, (_, i) => ({ weight: prev?.[i]?.weight ?? prev?.[0]?.weight ?? 0, reps: prev?.[i]?.reps ?? reps, done: false }));
    }),
  );
  const [idx, setIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [rest, setRest] = useState<{ left: number; total: number } | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [showTech, setShowTech] = useState(false);
  const profile = useStore((st) => st.profile);
  const started = useRef(Date.now());

  useEffect(() => {
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - started.current) / 1000));
      setRest((r) => {
        if (!r) return r;
        if (r.left <= 1) {
          if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          return null;
        }
        return { ...r, left: r.left - 1 };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  if (!w)
    return (
      <Screen edges={[]}>
        <EmptyState icon="barbell" title="Тренировка не найдена" text="Вернитесь к плану." action="К плану" onAction={() => router.replace('/plan')} />
      </Screen>
    );

  const pe = w.exercises[idx];
  const e = EXERCISES[pe.exerciseId];
  const doneSets = sets.flat().filter((s) => s.done).length;
  const totalSets = sets.flat().length;
  const isTime = e.timeBased || /с$/.test(pe.reps);

  const update = (si: number, patch: Partial<SetLog>) =>
    setSets((all) => all.map((arr, i) => (i !== idx ? arr : arr.map((s, j) => (j === si ? { ...s, ...patch } : s)))));

  const toggleDone = (si: number) => {
    const wasDone = sets[idx][si].done;
    update(si, { done: !wasDone });
    if (!wasDone) {
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      setRest({ left: pe.restSec, total: pe.restSec });
    }
  };

  const finish = (feeling: 1 | 2 | 3 | 4 | 5) => {
    addLog({
      workoutId: w.id,
      date: new Date().toISOString(),
      durationMin: Math.max(1, Math.round(elapsed / 60)),
      feeling,
      exercises: w.exercises.map((x, i) => ({ exerciseId: x.exerciseId, sets: sets[i] })),
    });
    setFinishing(false);
    router.replace('/progress');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['bottom']}>
      <Stack.Screen options={{ title: fmt(elapsed), headerRight: () => <Pill text={`${doneSets}/${totalSets} подходов`} /> }} />
      <View style={{ paddingHorizontal: space(4), gap: 8 }}>
        <Bar value={doneSets} max={totalSets} height={6} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingVertical: 8 }}>
          {w.exercises.map((x, i) => {
            const complete = sets[i].every((s) => s.done);
            return (
              <Pressable key={i} onPress={() => { tap(); setIdx(i); }} style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: complete ? colors.accent : i === idx ? colors.surface2 : colors.surface, borderWidth: i === idx ? 2 : 1, borderColor: i === idx ? colors.accent : colors.border }}>
                {complete ? <Ionicons name="checkmark" size={16} color={colors.onAccent} /> : <Text style={{ color: colors.text, fontWeight: '800' }}>{i + 1}</Text>}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ padding: space(4), gap: 12 }}>
        <Text style={font.label}>Упражнение {idx + 1} из {w.exercises.length} · {MUSCLES[e.primary].name}</Text>
        <Pressable onPress={() => router.push(`/exercise/${e.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={[font.h1, { flex: 1 }]}>{e.name}</Text>
          <Ionicons name="information-circle-outline" size={26} color={colors.textDim} />
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          <Pill text={`Цель: ${pe.sets} × ${pe.reps}`} color={colors.text} />
          <Pill text={`Отдых ${pe.restSec} с`} icon="hourglass" />
          <Pill text={pe.intensity} />
        </View>
        <Text style={font.small}>Ключевая подсказка: {e.tips[0]}</Text>
        <Pressable onPress={() => { tap(); setShowTech(!showTech); }} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="body-outline" size={16} color={colors.accent} />
          <Text style={{ color: colors.accent, fontWeight: '700' }}>{showTech ? 'Скрыть технику' : 'Показать технику: 3D и видео'}</Text>
        </Pressable>
        {showTech && <VideoBlock key={e.id} e={e} sex={profile?.sex ?? 'male'} height={240} />}

        <View style={{ flexDirection: 'row', paddingHorizontal: 4, marginTop: space(2) }}>
          <Text style={[font.label, { width: 44 }]}>#</Text>
          <Text style={[font.label, { flex: 1, textAlign: 'center' }]}>{isTime ? '' : 'Вес, кг'}</Text>
          <Text style={[font.label, { flex: 1, textAlign: 'center' }]}>{isTime ? 'Секунд' : 'Повторы'}</Text>
          <View style={{ width: 56 }} />
        </View>
        {sets[idx].map((st, si) => (
          <View key={si} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: st.done ? colors.accentDim : colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: st.done ? colors.accent : colors.border, padding: 8 }}>
            <Text style={[font.h3, { width: 36, textAlign: 'center' }]}>{si + 1}</Text>
            <View style={{ flex: 1 }}>{!isTime && <Num value={st.weight} step={2.5} onChange={(v) => update(si, { weight: v })} />}</View>
            <View style={{ flex: 1 }}>
              <Num value={st.reps} step={isTime ? 5 : 1} onChange={(v) => update(si, { reps: v })} />
            </View>
            <Pressable onPress={() => toggleDone(si)} accessibilityLabel={`Подход ${si + 1} выполнен`} style={{ width: 48, height: 48, borderRadius: 14, marginLeft: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: st.done ? colors.accent : colors.surface2 }}>
              <Ionicons name="checkmark" size={26} color={st.done ? colors.onAccent : colors.textMuted} />
            </Pressable>
          </View>
        ))}
        {lastWeights[e.id] && <Text style={font.small}>Прошлый раз: {lastWeights[e.id].filter((s) => s.done).map((s) => (isTime ? `${s.reps} с` : `${s.weight}×${s.reps}`)).join(', ') || '—'}</Text>}
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 10, padding: space(4) }}>
        <Button variant="secondary" title="Назад" icon="chevron-back" disabled={idx === 0} onPress={() => setIdx(idx - 1)} style={{ flex: 1 }} />
        {idx < w.exercises.length - 1 ? (
          <Button title="Дальше" icon="chevron-forward" onPress={() => setIdx(idx + 1)} style={{ flex: 1.4 }} />
        ) : (
          <Button title="Завершить" icon="flag" onPress={() => setFinishing(true)} style={{ flex: 1.4 }} />
        )}
      </View>

      {/* таймер отдыха */}
      <Modal visible={!!rest} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(5,6,8,0.92)', alignItems: 'center', justifyContent: 'center', gap: space(6) }}>
          <Text style={font.label}>Отдых</Text>
          <Ring size={220} stroke={14} progress={rest ? rest.left / rest.total : 0}>
            <Text style={{ color: colors.text, fontSize: 56, fontWeight: '900', fontVariant: ['tabular-nums'] }}>{rest ? fmt(rest.left) : ''}</Text>
          </Ring>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button variant="secondary" title="+15 с" onPress={() => setRest((r) => (r ? { left: r.left + 15, total: r.total + 15 } : r))} />
            <Button title="Пропустить" icon="play-skip-forward" onPress={() => setRest(null)} />
          </View>
        </View>
      </Modal>

      {/* завершение */}
      <Modal visible={finishing} transparent animationType="slide" onRequestClose={() => setFinishing(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: space(6), gap: space(4) }}>
            <Text style={font.h2}>Отличная работа! 💪</Text>
            <Text style={font.body}>{doneSets} из {totalSets} подходов за {fmt(elapsed)}. Как самочувствие?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {(['😫', '😕', '🙂', '😀', '🔥'] as const).map((emoji, i) => (
                <Pressable key={emoji} onPress={() => finish((i + 1) as 1 | 2 | 3 | 4 | 5)} style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 28 }}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={font.small}>Если во время тренировки была боль, головокружение или необычная одышка — сделайте паузу и обратитесь к врачу.</Text>
            <Button variant="ghost" title="Вернуться к тренировке" onPress={() => setFinishing(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Num({ value, step, onChange }: { value: number; step: number; onChange: (v: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
      <Pressable onPress={() => { tap(); onChange(Math.max(0, Math.round((value - step) * 10) / 10)); }} hitSlop={6} style={{ padding: 6 }}>
        <Ionicons name="remove-circle-outline" size={24} color={colors.textDim} />
      </Pressable>
      <Text style={[font.h3, { minWidth: 40, textAlign: 'center', fontVariant: ['tabular-nums'] }]}>{value}</Text>
      <Pressable onPress={() => { tap(); onChange(Math.round((value + step) * 10) / 10); }} hitSlop={6} style={{ padding: 6 }}>
        <Ionicons name="add-circle-outline" size={24} color={colors.textDim} />
      </Pressable>
    </View>
  );
}
