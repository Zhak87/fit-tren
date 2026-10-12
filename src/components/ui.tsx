import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ComponentProps, ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { colors, font, radius, space } from '../theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export function tap() {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
}

export function Screen({ children, scroll = true, edges = ['top'] as ('top' | 'bottom')[], padded = true }: { children: ReactNode; scroll?: boolean; edges?: ('top' | 'bottom')[]; padded?: boolean }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={edges}>
      {scroll ? (
        <ScrollView contentContainerStyle={[padded && { padding: space(4), paddingBottom: space(10) }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, padded && { padding: space(4) }]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function Card({ children, style, onPress, accent }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; accent?: boolean }) {
  const body = [s.card, accent && { borderColor: colors.accent, backgroundColor: colors.accentDim }, style];
  if (!onPress) return <View style={body}>{children}</View>;
  return (
    <Pressable onPress={() => { tap(); onPress(); }} style={({ pressed }) => [body, pressed && { opacity: 0.8, transform: [{ scale: 0.99 }] }]} accessibilityRole="button">
      {children}
    </Pressable>
  );
}

export function Button({ title, onPress, variant = 'primary', icon, disabled, style, big }: { title: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; icon?: IconName; disabled?: boolean; style?: StyleProp<ViewStyle>; big?: boolean }) {
  const bg = variant === 'primary' ? colors.accent : variant === 'secondary' ? colors.surface2 : variant === 'danger' ? 'rgba(255,92,92,0.14)' : 'transparent';
  const fg = variant === 'primary' ? colors.onAccent : variant === 'danger' ? colors.danger : colors.text;
  return (
    <Pressable
      disabled={disabled}
      accessibilityRole="button"
      onPress={() => { tap(); onPress(); }}
      style={({ pressed }) => [s.btn, big && { height: 64, borderRadius: radius.lg }, { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.85 : 1 }, variant === 'ghost' && { borderWidth: 1, borderColor: colors.border }, style]}
    >
      {icon && <Ionicons name={icon} size={big ? 24 : 18} color={fg} />}
      <Text style={{ color: fg, fontWeight: '800', fontSize: big ? 18 : 15 }}>{title}</Text>
    </Pressable>
  );
}

export function Chip({ label, active, onPress, icon }: { label: string; active?: boolean; onPress?: () => void; icon?: IconName }) {
  return (
    <Pressable
      onPress={() => { tap(); onPress?.(); }}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={[s.chip, active && { backgroundColor: colors.accent, borderColor: colors.accent }]}
    >
      {icon && <Ionicons name={icon} size={14} color={active ? colors.onAccent : colors.textDim} />}
      <Text style={{ color: active ? colors.onAccent : colors.text, fontWeight: '700', fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={s.seg}>
      {options.map((o) => (
        <Pressable key={o.value} onPress={() => { tap(); onChange(o.value); }} style={[s.segItem, value === o.value && { backgroundColor: colors.surface2 }]} accessibilityRole="button" accessibilityState={{ selected: value === o.value }}>
          <Text style={{ color: value === o.value ? colors.text : colors.textMuted, fontWeight: '700', fontSize: 13 }}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space(6), marginBottom: space(3) }}>
      <Text style={font.h3}>{title}</Text>
      {action && (
        <Pressable onPress={onAction} hitSlop={10}>
          <Text style={{ color: colors.accent, fontWeight: '700' }}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function Pill({ text, color = colors.textDim, bg = colors.surface2, icon }: { text: string; color?: string; bg?: string; icon?: IconName }) {
  return (
    <View style={[s.pill, { backgroundColor: bg }]}>
      {icon && <Ionicons name={icon} size={12} color={color} />}
      <Text style={{ color, fontSize: 12, fontWeight: '700' }}>{text}</Text>
    </View>
  );
}

export function Ring({ size = 120, stroke = 12, progress, color = colors.accent, children }: { size?: number; stroke?: number; progress: number; color?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, progress));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.surface2} strokeWidth={stroke} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeDasharray={`${c} ${c}`} strokeDashoffset={c * (1 - p)} strokeLinecap="round" />
      </Svg>
      {children}
    </View>
  );
}

export function Bar({ value, max, color = colors.accent, height = 8 }: { value: number; max: number; color?: string; height?: number }) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <View style={{ height, backgroundColor: colors.surface2, borderRadius: height, overflow: 'hidden' }}>
      <View style={{ width: `${pct * 100}%`, height, backgroundColor: color, borderRadius: height }} />
    </View>
  );
}

export function Notice({ text, tone = 'info', icon }: { text: string; tone?: 'info' | 'warning' | 'danger'; icon?: IconName }) {
  const c = tone === 'warning' ? colors.warning : tone === 'danger' ? colors.danger : colors.info;
  return (
    <View style={[s.notice, { borderColor: c + '55', backgroundColor: c + '14' }]}>
      <Ionicons name={icon ?? (tone === 'info' ? 'information-circle' : 'warning')} size={18} color={c} />
      <Text style={[font.small, { flex: 1, color: colors.text }]}>{text}</Text>
    </View>
  );
}

export function EmptyState({ icon, title, text, action, onAction }: { icon: IconName; title: string; text: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ alignItems: 'center', padding: space(8), gap: space(3) }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={32} color={colors.accent} />
      </View>
      <Text style={[font.h3, { textAlign: 'center' }]}>{title}</Text>
      <Text style={[font.small, { textAlign: 'center' }]}>{text}</Text>
      {action && onAction && <Button title={action} onPress={onAction} style={{ marginTop: space(2) }} />}
    </View>
  );
}

export function IconButton({ icon, onPress, label, color = colors.text, size = 22 }: { icon: IconName; onPress: () => void; label: string; color?: string; size?: number }) {
  return (
    <Pressable onPress={() => { tap(); onPress(); }} accessibilityLabel={label} accessibilityRole="button" hitSlop={8} style={({ pressed }) => [s.iconBtn, pressed && { opacity: 0.7 }]}>
      <Ionicons name={icon} size={size} color={color} />
    </Pressable>
  );
}

export const s = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space(4), borderWidth: 1, borderColor: colors.border },
  btn: { height: 52, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: space(5) },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  seg: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, padding: 4, borderWidth: 1, borderColor: colors.border },
  segItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.sm },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  notice: { flexDirection: 'row', gap: 10, padding: space(3), borderRadius: radius.md, borderWidth: 1, alignItems: 'flex-start' },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
