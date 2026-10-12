import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { colors, font } from '../theme';
import { s, tap } from './ui';

export function Stepper({ label, value, onChange, min, max, step = 1, unit }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; unit?: string }) {
  const change = (d: number) => {
    tap();
    onChange(Math.max(min, Math.min(max, Math.round((value + d) * 10) / 10)));
  };
  const Btn = ({ d, icon }: { d: number; icon: 'remove' | 'add' }) => (
    <Pressable onPress={() => change(d)} onLongPress={() => change(d * 10)} accessibilityLabel={icon === 'add' ? `Увеличить ${label}` : `Уменьшить ${label}`} style={({ pressed }) => [{ width: 48, height: 48, borderRadius: 14, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.7 }]}>
      <Ionicons name={icon} size={22} color={colors.text} />
    </Pressable>
  );
  return (
    <View style={[s.card, { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }]}>
      <Text style={[font.body, { flex: 1, fontWeight: '700' }]}>{label}</Text>
      <Btn d={-step} icon="remove" />
      <Text style={[font.h3, { minWidth: 76, textAlign: 'center', fontVariant: ['tabular-nums'] }]}>
        {value} <Text style={font.small}>{unit}</Text>
      </Text>
      <Btn d={step} icon="add" />
    </View>
  );
}
