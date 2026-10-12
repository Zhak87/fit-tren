import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ExerciseRow, ScoreBadge } from '../../components/ExerciseRow';
import { Button, Card, Chip, EmptyState, Notice, Pill, Screen, SectionTitle } from '../../components/ui';
import { VideoBlock } from '../../components/VideoBlock';
import { EFFICIENCY_CRITERIA, EFFICIENCY_DISCLAIMER, EQUIPMENT_LABEL, EXERCISES, LEVEL_LABEL } from '../../data/exercises';
import { MUSCLES } from '../../data/muscles';
import { useStore } from '../../store/useStore';
import { colors, font, space } from '../../theme';

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const e = EXERCISES[id];
  const sex = useStore((s) => s.profile?.sex ?? 'male');
  const [why, setWhy] = useState(false);
  if (!e)
    return (
      <Screen edges={[]}>
        <EmptyState icon="help-circle" title="Упражнение не найдено" text="Возможно, оно было удалено из библиотеки." action="Назад" onAction={() => router.back()} />
      </Screen>
    );
  const eq = e.equipment.filter((x) => x !== 'none');

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: '' }} />
      <Text style={font.h1}>{e.name}</Text>
      <View style={{ flexDirection: 'row', gap: 6, marginTop: space(2), flexWrap: 'wrap' }}>
        <Pill text={MUSCLES[e.primary].name} color={colors.onAccent} bg={colors.accent} />
        <Pill text={LEVEL_LABEL[e.level]} />
        <Pill text={e.kind === 'compound' ? 'Базовое' : 'Изолирующее'} />
        <Pill text={e.place === 'home' ? 'Дом' : e.place === 'gym' ? 'Зал' : 'Дом и зал'} icon={e.place === 'gym' ? 'barbell' : 'home'} />
      </View>

      <View style={{ marginTop: space(4) }}>
        <VideoBlock e={e} sex={sex} />
      </View>

      <Card style={{ marginTop: space(3), gap: 10 }}>
        <Pressable onPress={() => setWhy(!why)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ScoreBadge score={e.score} />
          <View style={{ flex: 1 }}>
            <Text style={[font.body, { fontWeight: '700' }]}>Оценка эффективности</Text>
            <Text style={font.small}>Редакционная, нажмите чтобы узнать критерии</Text>
          </View>
          <Ionicons name={why ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textDim} />
        </Pressable>
        {why && (
          <View style={{ gap: 4 }}>
            {EFFICIENCY_CRITERIA.map((c) => <Text key={c} style={font.small}>• {c}</Text>)}
            <Text style={[font.small, { color: colors.warning, marginTop: 4 }]}>{EFFICIENCY_DISCLAIMER}</Text>
          </View>
        )}
      </Card>

      <SectionTitle title="Работающие мышцы" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Chip label={`${MUSCLES[e.primary].name} · основная`} active />
        {e.secondary.map((m) => <Chip key={m} label={MUSCLES[m].name} />)}
      </View>
      <Text style={[font.small, { marginTop: 8 }]}>Инвентарь: {eq.length ? eq.map((x) => EQUIPMENT_LABEL[x]).join(', ') : 'не нужен'}</Text>

      <SectionTitle title="Техника" />
      <Card style={{ gap: 14 }}>
        {e.steps.map((st, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.onAccent, fontWeight: '900' }}>{i + 1}</Text>
            </View>
            <Text style={[font.body, { flex: 1 }]}>{st}</Text>
          </View>
        ))}
        <View style={{ flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }}>
          <Ionicons name="cloud-outline" size={22} color={colors.info} />
          <Text style={[font.body, { flex: 1 }]}>{e.breathing}</Text>
        </View>
      </Card>

      <SectionTitle title="Частые ошибки" />
      <Card style={{ gap: 10 }}>
        {e.mistakes.map((m) => (
          <View key={m} style={{ flexDirection: 'row', gap: 10 }}>
            <Ionicons name="close-circle" size={20} color={colors.danger} />
            <Text style={[font.body, { flex: 1 }]}>{m}</Text>
          </View>
        ))}
      </Card>

      <SectionTitle title="Подсказки" />
      <Card style={{ gap: 10 }}>
        {e.tips.map((m) => (
          <View key={m} style={{ flexDirection: 'row', gap: 10 }}>
            <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
            <Text style={[font.body, { flex: 1 }]}>{m}</Text>
          </View>
        ))}
      </Card>

      {(e.easier || e.harder) && (
        <>
          <SectionTitle title="Варианты" />
          <View style={{ gap: 10 }}>
            {e.easier && (
              <Card style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <Ionicons name="trending-down" size={20} color={colors.info} />
                <Text style={[font.body, { flex: 1 }]}><Text style={{ fontWeight: '800' }}>Проще: </Text>{e.easier}</Text>
              </Card>
            )}
            {e.harder && (
              <Card style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <Ionicons name="trending-up" size={20} color={colors.warning} />
                <Text style={[font.body, { flex: 1 }]}><Text style={{ fontWeight: '800' }}>Сложнее: </Text>{e.harder}</Text>
              </Card>
            )}
          </View>
        </>
      )}

      <View style={{ marginTop: space(4) }}>
        <Notice tone="warning" text="Остановитесь, если чувствуете острую боль, головокружение или онемение. Дискомфорт в суставах — повод взять более лёгкий вариант." />
      </View>

      {e.alternatives.length > 0 && (
        <>
          <SectionTitle title="Замены" />
          <View style={{ gap: 10 }}>
            {e.alternatives.filter((a) => EXERCISES[a]).map((a) => <ExerciseRow key={a} e={EXERCISES[a]} />)}
          </View>
        </>
      )}

      <Button title="Спросить ИИ-тренера" icon="sparkles" style={{ marginTop: space(6) }} onPress={() => router.push({ pathname: '/coach', params: { ex: e.id, q: `Расскажи подробнее про упражнение «${e.name}»: на что обратить внимание в технике?` } })} />
    </Screen>
  );
}
