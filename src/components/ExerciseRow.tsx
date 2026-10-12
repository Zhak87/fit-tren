import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { EQUIPMENT_LABEL, LEVEL_LABEL } from '../data/exercises';
import { MUSCLES } from '../data/muscles';
import { colors, font } from '../theme';
import type { Exercise } from '../types';
import { Card, Pill } from './ui';

export function ScoreBadge({ score }: { score: number }) {
  const c = score >= 9 ? colors.accent : score >= 7 ? colors.info : colors.textDim;
  return (
    <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: c + '22', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: c, fontWeight: '900', fontSize: 18 }}>{score}</Text>
      <Text style={{ color: c, fontSize: 9, fontWeight: '700' }}>из 10</Text>
    </View>
  );
}

export function ExerciseRow({ e, rank, subtitle }: { e: Exercise; rank?: number; subtitle?: string }) {
  const eq = e.equipment.filter((x) => x !== 'none').map((x) => EQUIPMENT_LABEL[x]).join(', ') || EQUIPMENT_LABEL.none;
  return (
    <Card onPress={() => router.push(`/exercise/${e.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }}>
      {rank !== undefined && <Text style={{ color: colors.textMuted, fontWeight: '800', width: 18 }}>{rank}</Text>}
      <ScoreBadge score={e.score} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={[font.body, { fontWeight: '700' }]} numberOfLines={2}>{e.name}</Text>
        <Text style={font.small} numberOfLines={1}>{subtitle ?? `${MUSCLES[e.primary].name} · ${eq}`}</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Pill text={LEVEL_LABEL[e.level]} />
          <Pill text={e.place === 'home' ? 'Дом' : e.place === 'gym' ? 'Зал' : 'Дом и зал'} icon={e.place === 'gym' ? 'barbell' : 'home'} />
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Card>
  );
}
