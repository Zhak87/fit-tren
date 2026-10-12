import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View, type ColorValue } from 'react-native';
import type { IconName } from '../../components/ui';
import { useStore } from '../../store/useStore';
import { colors } from '../../theme';

const icon = (name: IconName, active: IconName) =>
  function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Ionicons name={focused ? active : name} size={24} color={color as string} />;
  };

export default function TabsLayout() {
  const hydrated = useStore((s) => s.hydrated);
  const profile = useStore((s) => s.profile);
  if (!hydrated)
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  if (!profile) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 88, paddingTop: 8 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Главная', tabBarIcon: icon('home-outline', 'home') }} />
      <Tabs.Screen name="plan" options={{ title: 'План', tabBarIcon: icon('calendar-outline', 'calendar') }} />
      <Tabs.Screen name="muscles" options={{ title: 'Мышцы', tabBarIcon: icon('body-outline', 'body') }} />
      <Tabs.Screen name="nutrition" options={{ title: 'Питание', tabBarIcon: icon('nutrition-outline', 'nutrition') }} />
      <Tabs.Screen name="coach" options={{ title: 'ИИ-тренер', tabBarIcon: icon('sparkles-outline', 'sparkles') }} />
    </Tabs>
  );
}
