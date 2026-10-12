import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { Body3D } from '../../components/Body3D';
import { BodyMap } from '../../components/BodyMap';
import { ExerciseRow } from '../../components/ExerciseRow';
import { Card, Chip, Screen, Segmented, tap } from '../../components/ui';
import { EFFICIENCY_CRITERIA, EFFICIENCY_DISCLAIMER, EQUIPMENT_LABEL, exercisesForMuscle, levelRank } from '../../data/exercises';
import { MUSCLES } from '../../data/muscles';
import { useStore } from '../../store/useStore';
import { colors, font, space } from '../../theme';
import type { Equipment, Level, MuscleId, Sex } from '../../types';

type PlaceFilter = 'all' | 'home' | 'gym';

export default function Muscles() {
  const profile = useStore((s) => s.profile)!;
  const [sex, setSex] = useState<Sex>(profile.sex);
  const [view, setView] = useState<'front' | 'back'>('front');
  const [model, setModel] = useState<'3d' | '2d'>('3d');
  const [selected, setSelected] = useState<MuscleId | null>('chest');
  const [place, setPlace] = useState<PlaceFilter>(profile.place === 'home' ? 'home' : 'all');
  const [level, setLevel] = useState<Level | 'all'>('all');
  const [eq, setEq] = useState<Equipment | 'all'>('all');
  const [showCriteria, setShowCriteria] = useState(false);
  const flip = useRef(new Animated.Value(1)).current;

  const rotate = () => {
    tap();
    Animated.timing(flip, { toValue: 0, duration: 160, useNativeDriver: true }).start(() => {
      setView((v) => (v === 'front' ? 'back' : 'front'));
      Animated.timing(flip, { toValue: 1, duration: 160, useNativeDriver: true }).start();
    });
  };

  const select = (m: MuscleId) => {
    tap();
    setSelected(m);
  };

  const list = useMemo(() => {
    if (!selected) return [];
    return exercisesForMuscle(selected).filter(
      (e) =>
        (place === 'all' || e.place === place || e.place === 'both') &&
        (level === 'all' || levelRank(e.level) <= levelRank(level)) &&
        (eq === 'all' || (eq === 'none' ? e.equipment.every((x) => x === 'none') : e.equipment.includes(eq))),
    );
  }, [selected, place, level, eq]);

  const info = selected ? MUSCLES[selected] : null;
  const usedEq = useMemo(() => {
    if (!selected) return [];
    const set = new Set<Equipment>();
    exercisesForMuscle(selected).forEach((e) => e.equipment.forEach((x) => set.add(x)));
    return [...set];
  }, [selected]);

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={font.h1}>Мышцы</Text>
        <View style={{ width: 170 }}>
          <Segmented options={[{ value: 'male', label: 'Муж' }, { value: 'female', label: 'Жен' }]} value={sex} onChange={setSex} />
        </View>
      </View>
      <Text style={[font.small, { marginTop: 4 }]}>Нажмите на мышцу, чтобы увидеть лучшие упражнения</Text>

      <View style={{ marginTop: space(3) }}>
        <Segmented
          options={[
            { value: '3d', label: '3D-модель' },
            { value: '2d', label: 'Схема' },
          ]}
          value={model}
          onChange={setModel}
        />
      </View>

      {model === '3d' ? (
        <Card style={{ marginTop: space(3), padding: 0, overflow: 'hidden', backgroundColor: colors.surface }}>
          <Body3D sex={sex} mode="map" selected={selected} height={440} onSelect={select} onError={() => setModel('2d')} />
          <View pointerEvents="none" style={{ position: 'absolute', top: 14, left: 16 }}>
            <Text style={font.label}>3D · вращайте пальцем</Text>
            {info && <Text style={[font.h3, { color: colors.accent, marginTop: 4 }]}>{info.name}</Text>}
          </View>
        </Card>
      ) : (
        <Card style={{ marginTop: space(3), alignItems: 'center', paddingVertical: space(5), backgroundColor: colors.surface }}>
          <View style={{ position: 'absolute', top: 14, left: 16, zIndex: 2 }}>
            <Text style={font.label}>{view === 'front' ? 'Вид спереди' : 'Вид сзади'}</Text>
            {info && <Text style={[font.h3, { color: colors.accent, marginTop: 4 }]}>{info.name}</Text>}
          </View>
          <Animated.View style={{ transform: [{ scaleX: flip }], opacity: flip.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }}>
            <BodyMap sex={sex} view={view} selected={selected} onSelect={select} height={400} />
          </Animated.View>
          <Pressable onPress={rotate} accessibilityRole="button" accessibilityLabel="Повернуть схему" style={({ pressed }) => [{ position: 'absolute', right: 14, bottom: 14, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.accent, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999 }, pressed && { opacity: 0.8 }]}>
            <Ionicons name="sync" size={16} color={colors.onAccent} />
            <Text style={{ color: colors.onAccent, fontWeight: '800' }}>Повернуть</Text>
          </Pressable>
        </Card>
      )}

      {info && (
        <>
          <Card style={{ marginTop: space(3), gap: 6 }}>
            <Text style={font.h2}>{info.name}</Text>
            <Text style={[font.small, { fontStyle: 'italic' }]}>{info.latin}</Text>
            <Text style={font.body}>{info.function}</Text>
            <Text style={font.small}>Участвует в: {info.movements}</Text>
          </Card>

          <View style={{ gap: 8, marginTop: space(4) }}>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <Chip label="Все" active={place === 'all'} onPress={() => setPlace('all')} />
              <Chip label="Дома" icon="home" active={place === 'home'} onPress={() => setPlace('home')} />
              <Chip label="Зал" icon="barbell" active={place === 'gym'} onPress={() => setPlace('gym')} />
            </View>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((l) => (
                <Chip key={l} label={l === 'all' ? 'Любой уровень' : l === 'beginner' ? 'Новичок' : l === 'intermediate' ? 'До среднего' : 'До профи'} active={level === l} onPress={() => setLevel(l)} />
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <Chip label="Любой инвентарь" active={eq === 'all'} onPress={() => setEq('all')} />
              {usedEq.map((x) => (
                <Chip key={x} label={EQUIPMENT_LABEL[x]} active={eq === x} onPress={() => setEq(x)} />
              ))}
            </View>
          </View>

          <Pressable onPress={() => setShowCriteria(!showCriteria)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space(5), marginBottom: space(3) }}>
            <Text style={[font.h3, { flex: 1 }]}>По эффективности · {list.length}</Text>
            <Ionicons name="information-circle-outline" size={20} color={colors.textDim} />
            <Text style={font.small}>Как считаем</Text>
          </Pressable>
          {showCriteria && (
            <Card style={{ gap: 6, marginBottom: space(3) }}>
              {EFFICIENCY_CRITERIA.map((c) => (
                <Text key={c} style={font.small}>• {c}</Text>
              ))}
              <Text style={[font.small, { marginTop: 6, color: colors.warning }]}>{EFFICIENCY_DISCLAIMER}</Text>
            </Card>
          )}
          <View style={{ gap: 10 }}>
            {list.map((e, i) => (
              <ExerciseRow key={e.id} e={e} rank={i + 1} />
            ))}
            {list.length === 0 && <Text style={[font.small, { textAlign: 'center', padding: space(6) }]}>Нет упражнений под эти фильтры. Попробуйте снять часть фильтров.</Text>}
          </View>
        </>
      )}
    </Screen>
  );
}
