import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { ExerciseRow } from '../components/ExerciseRow';
import { Chip, Screen } from '../components/ui';
import { EQUIPMENT_LABEL, EXERCISE_LIST, levelRank } from '../data/exercises';
import { MUSCLE_LIST } from '../data/muscles';
import { colors, font, radius, space } from '../theme';
import type { Equipment, Level, MuscleId } from '../types';

export default function Library() {
  const [q, setQ] = useState('');
  const [muscle, setMuscle] = useState<MuscleId | 'all'>('all');
  const [place, setPlace] = useState<'all' | 'home' | 'gym'>('all');
  const [level, setLevel] = useState<Level | 'all'>('all');
  const [eq, setEq] = useState<Equipment | 'all'>('all');

  const list = useMemo(
    () =>
      EXERCISE_LIST.filter(
        (e) =>
          (!q || e.name.toLowerCase().includes(q.toLowerCase())) &&
          (muscle === 'all' || e.primary === muscle || e.secondary.includes(muscle)) &&
          (place === 'all' || e.place === place || e.place === 'both') &&
          (level === 'all' || levelRank(e.level) <= levelRank(level)) &&
          (eq === 'all' || (eq === 'none' ? e.equipment.every((x) => x === 'none') : e.equipment.includes(eq))),
      ).sort((a, b) => (muscle !== 'all' ? Number(b.primary === muscle) - Number(a.primary === muscle) : 0) || b.score - a.score),
    [q, muscle, place, level, eq],
  );

  const Row = ({ children }: { children: React.ReactNode }) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -space(4) }} contentContainerStyle={{ gap: 8, paddingHorizontal: space(4) }}>
      {children}
    </ScrollView>
  );

  return (
    <Screen edges={[]}>
      <TextInput value={q} onChangeText={setQ} placeholder="Поиск упражнения" placeholderTextColor={colors.textMuted} style={{ backgroundColor: colors.surface, color: colors.text, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 14, fontSize: 16 }} />
      <View style={{ gap: 8, marginTop: space(3) }}>
        <Row>
          <Chip label="Все мышцы" active={muscle === 'all'} onPress={() => setMuscle('all')} />
          {MUSCLE_LIST.map((m) => <Chip key={m.id} label={m.name} active={muscle === m.id} onPress={() => setMuscle(m.id)} />)}
        </Row>
        <Row>
          <Chip label="Дом и зал" active={place === 'all'} onPress={() => setPlace('all')} />
          <Chip label="Дома" icon="home" active={place === 'home'} onPress={() => setPlace('home')} />
          <Chip label="Зал" icon="barbell" active={place === 'gym'} onPress={() => setPlace('gym')} />
          {(['beginner', 'intermediate', 'advanced'] as Level[]).map((l) => (
            <Chip key={l} label={l === 'beginner' ? 'Новичок' : l === 'intermediate' ? 'До среднего' : 'До профи'} active={level === l} onPress={() => setLevel(level === l ? 'all' : l)} />
          ))}
        </Row>
        <Row>
          <Chip label="Любой инвентарь" active={eq === 'all'} onPress={() => setEq('all')} />
          {(Object.keys(EQUIPMENT_LABEL) as Equipment[]).map((x) => <Chip key={x} label={EQUIPMENT_LABEL[x]} active={eq === x} onPress={() => setEq(x)} />)}
        </Row>
      </View>
      <Text style={[font.small, { marginVertical: space(3) }]}>Найдено: {list.length}</Text>
      <View style={{ gap: 10 }}>
        {list.map((e) => <ExerciseRow key={e.id} e={e} />)}
        {list.length === 0 && <Text style={[font.small, { textAlign: 'center', padding: space(8) }]}>Ничего не найдено. Измените запрос или фильтры.</Text>}
      </View>
    </Screen>
  );
}
