import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../theme';

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.bg, primary: colors.accent, text: colors.text, border: colors.border },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider value={theme}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '800' },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.bg },
            headerBackButtonDisplayMode: 'minimal',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="exercise/[id]" options={{ title: '' }} />
          <Stack.Screen name="workout/[id]" options={{ title: 'Тренировка' }} />
          <Stack.Screen name="session/[id]" options={{ title: 'Тренировка', gestureEnabled: false }} />
          <Stack.Screen name="library" options={{ title: 'Упражнения' }} />
          <Stack.Screen name="progress" options={{ title: 'Прогресс' }} />
          <Stack.Screen name="profile" options={{ title: 'Профиль' }} />
          <Stack.Screen name="shopping" options={{ title: 'Список покупок' }} />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
