import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Text, View } from 'react-native';
import { DEFAULT_PROFILE, ProfileForm } from '../components/ProfileForm';
import { Button, Card, Notice, Screen, SectionTitle } from '../components/ui';
import { EXERCISES } from '../data/exercises';
import { useStore } from '../store/useStore';
import { colors, font, space } from '../theme';
import type { Profile } from '../types';

const SECTIONS = ['Имя', 'Модель тела', 'Уровень', 'Цель', 'Место и инвентарь', 'Расписание', 'Параметры тела', 'Питание'];

export default function ProfileScreen() {
  const saved = useStore((s) => s.profile);
  const updateProfile = useStore((s) => s.updateProfile);
  const resetAll = useStore((s) => s.resetAll);
  const clearChat = useStore((s) => s.clearChat);
  const [p, setP] = useState<Profile>(saved ?? DEFAULT_PROFILE);
  const set = (patch: Partial<Profile>) => setP((x) => ({ ...x, ...patch }));
  const dirty = JSON.stringify(p) !== JSON.stringify(saved);

  const confirm = (title: string, msg: string, onOk: () => void) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n\n${msg}`)) onOk();
    } else Alert.alert(title, msg, [{ text: 'Отмена', style: 'cancel' }, { text: 'Да', style: 'destructive', onPress: onOk }]);
  };

  return (
    <Screen edges={[]}>
      {dirty && (
        <Card accent style={{ gap: 10, marginBottom: space(3) }}>
          <Text style={[font.body, { fontWeight: '700' }]}>Есть несохранённые изменения</Text>
          <Button title="Сохранить и пересоздать план" icon="refresh" onPress={() => { updateProfile(p, true); router.back(); }} />
          <Button variant="secondary" title="Сохранить без изменения плана" onPress={() => { updateProfile(p, false); router.back(); }} />
          <Text style={font.small}>При пересоздании история тренировок сохранится, но расписание и план питания соберутся заново.</Text>
        </Card>
      )}
      {SECTIONS.map((title, i) => (
        <View key={title}>
          <SectionTitle title={title} />
          <ProfileForm p={p} set={set} section={i} />
        </View>
      ))}

      {p.avoidExercises.length > 0 && (
        <>
          <SectionTitle title="Исключённые упражнения" />
          <Card style={{ gap: 8 }}>
            {p.avoidExercises.map((id) => (
              <View key={id} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={font.body}>{EXERCISES[id]?.name ?? id}</Text>
                <Text style={{ color: colors.accent, fontWeight: '700' }} onPress={() => set({ avoidExercises: p.avoidExercises.filter((x) => x !== id) })}>Вернуть</Text>
              </View>
            ))}
          </Card>
        </>
      )}

      <SectionTitle title="Приватность и данные" />
      <Notice icon="lock-closed" text="Профиль, план и история хранятся только на этом устройстве. В ИИ-тренер отправляется лишь минимальный контекст (цель, уровень, план недели) в момент вопроса." />
      <View style={{ gap: 10, marginTop: space(3) }}>
        <Button variant="secondary" title="Удалить историю чата с ИИ" icon="chatbubbles-outline" onPress={() => confirm('Удалить историю чата?', 'Сообщения будут удалены с устройства.', clearChat)} />
        <Button variant="danger" title="Удалить все мои данные" icon="trash-outline" onPress={() => confirm('Удалить все данные?', 'Профиль, план, история тренировок и питание будут удалены без возможности восстановления.', () => { resetAll(); router.replace('/onboarding'); })} />
      </View>
      <Text style={[font.small, { textAlign: 'center', marginTop: space(6) }]}>FIT / AI · версия 1.0 (MVP)</Text>
    </Screen>
  );
}
