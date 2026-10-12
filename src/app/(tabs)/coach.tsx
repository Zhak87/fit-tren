import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip, IconButton, Notice } from '../../components/ui';
import { EXERCISES } from '../../data/exercises';
import { aiConfigured, askCoach } from '../../lib/ai';
import { useStore } from '../../store/useStore';
import { colors, font, radius, space } from '../../theme';
import type { ChatMessage } from '../../types';

const SUGGESTIONS = [
  'Объясни мой план на эту неделю',
  'Чем заменить жим лёжа дома?',
  'Я пропустил 2 тренировки, как вернуться?',
  'Предложи ужин на 600 ккал',
  'Как восстановиться после тяжёлой тренировки?',
];
const RED_FLAGS = /(боль в груди|головокруж|одышк|обморок|онемени|острая боль|давит в груди|тошнот)/i;

export default function Coach() {
  const params = useLocalSearchParams<{ q?: string; ex?: string }>();
  const chat = useStore((s) => s.chat);
  const addChat = useStore((s) => s.addChat);
  const clearChat = useStore((s) => s.clearChat);
  const profile = useStore((s) => s.profile);
  const program = useStore((s) => s.program);
  const logs = useStore((s) => s.logs);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusEx, setFocusEx] = useState<string | undefined>(undefined);
  const scroll = useRef<ScrollView>(null);
  const handled = useRef<string | null>(null);

  const send = async (content: string) => {
    const msg = content.trim();
    if (!msg || loading) return;
    setText('');
    setError(null);
    const userMsg: ChatMessage = { role: 'user', content: msg, at: new Date().toISOString() };
    addChat(userMsg);
    if (!aiConfigured) {
      setError('ИИ-сервер не подключён. Укажите EXPO_PUBLIC_API_URL и запустите сервер из папки server (см. README).');
      return;
    }
    setLoading(true);
    try {
      const reply = await askCoach([...useStore.getState().chat], { profile, program, logs, focusExerciseId: focusEx });
      addChat({ role: 'assistant', content: reply, at: new Date().toISOString() });
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      setError(m.includes('Network') || m.includes('fetch') || m.includes('abort') ? 'Нет связи с ИИ-сервером. Проверьте интернет и что сервер запущен.' : `Ошибка ИИ-сервера: ${m}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const key = `${params.q ?? ''}|${params.ex ?? ''}`;
    if (handled.current === key) return;
    handled.current = key;
    if (params.ex && EXERCISES[params.ex]) setFocusEx(params.ex);
    if (params.q) send(params.q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.q, params.ex]);

  useEffect(() => {
    if (chat.length) setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
  }, [chat.length, loading]);

  const lastUser = [...chat].reverse().find((m) => m.role === 'user');
  const redFlag = lastUser && RED_FLAGS.test(lastUser.content);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: space(4), paddingVertical: space(2), gap: 10 }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="sparkles" size={22} color={colors.onAccent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={font.h3}>ИИ-тренер</Text>
            <Text style={font.small}>{aiConfigured ? 'Знает ваш профиль и план' : 'Сервер не подключён'}</Text>
          </View>
          {chat.length > 0 && <IconButton icon="trash-outline" label="Очистить историю" onPress={clearChat} />}
        </View>

        <ScrollView ref={scroll} contentContainerStyle={{ padding: space(4), gap: 12 }} keyboardShouldPersistTaps="handled">
          {!aiConfigured && <Notice tone="warning" text="Чтобы ИИ-тренер отвечал, запустите серверный адаптер (папка server) и задайте адрес в EXPO_PUBLIC_API_URL. Ключ Claude хранится только на сервере." />}
          {focusEx && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Chip label={`Контекст: ${EXERCISES[focusEx].name}`} icon="close" active onPress={() => setFocusEx(undefined)} />
            </View>
          )}
          {chat.length === 0 && (
            <View style={{ gap: 12 }}>
              <Text style={[font.h2, { marginTop: space(4) }]}>Чем помочь?</Text>
              <Text style={font.small}>Я объясню технику, подберу замену упражнению, помогу перестроить план после пропуска и предложу блюда в рамках ваших калорий.</Text>
              <View style={{ gap: 8, marginTop: space(2) }}>
                {SUGGESTIONS.map((s) => (
                  <Pressable key={s} onPress={() => send(s)} style={({ pressed }) => [{ padding: 14, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, pressed && { opacity: 0.7 }]}>
                    <Text style={font.body}>{s}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={[font.small, { marginTop: space(2) }]}>ИИ не ставит диагнозы и не заменяет врача. План и калории он меняет только с вашего согласия.</Text>
            </View>
          )}
          {chat.map((m, i) => (
            <View key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%', backgroundColor: m.role === 'user' ? colors.accent : colors.surface, borderRadius: radius.lg, borderBottomRightRadius: m.role === 'user' ? 6 : radius.lg, borderBottomLeftRadius: m.role === 'user' ? radius.lg : 6, padding: 14, borderWidth: m.role === 'user' ? 0 : 1, borderColor: colors.border }}>
              <Text style={[font.body, m.role === 'user' && { color: colors.onAccent }]}>{m.content}</Text>
            </View>
          ))}
          {redFlag && <Notice tone="danger" text="Если вы чувствуете боль в груди, головокружение, сильную одышку или онемение — прекратите тренировку и обратитесь за медицинской помощью." />}
          {loading && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8 }}>
              <ActivityIndicator color={colors.accent} />
              <Text style={font.small}>Тренер думает…</Text>
            </View>
          )}
          {error && <Notice tone="danger" text={error} />}
        </ScrollView>

        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: space(3), borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Спросите тренера…"
            placeholderTextColor={colors.textMuted}
            multiline
            style={{ flex: 1, maxHeight: 120, minHeight: 48, backgroundColor: colors.surface, color: colors.text, borderRadius: radius.md, paddingHorizontal: 14, paddingTop: 13, paddingBottom: 13, fontSize: 15, borderWidth: 1, borderColor: colors.border }}
          />
          <Pressable onPress={() => send(text)} disabled={!text.trim() || loading} accessibilityLabel="Отправить" style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: text.trim() ? colors.accent : colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="arrow-up" size={22} color={text.trim() ? colors.onAccent : colors.textMuted} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
