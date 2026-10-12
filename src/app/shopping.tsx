import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { Card, EmptyState, Screen, SectionTitle } from '../components/ui';
import { GROUP_LABEL, shoppingList } from '../lib/nutrition';
import { useStore } from '../store/useStore';
import { colors, font } from '../theme';

export default function Shopping() {
  const plan = useStore((s) => s.mealPlan);
  const checked = useStore((s) => s.shoppingChecked);
  const toggle = useStore((s) => s.toggleShopping);
  if (!plan) return <Screen edges={[]}><EmptyState icon="cart" title="Нет плана питания" text="Сначала создайте план питания." /></Screen>;
  const items = shoppingList(plan);
  const groups = [...new Set(items.map((i) => i.food.group))];
  const fmt = (g: number) => (g >= 1000 ? `${Math.round(g / 100) / 10} кг` : `${Math.round(g / 10) * 10} г`);
  return (
    <Screen edges={[]}>
      <Text style={font.small}>На неделю по текущему плану питания. Отмечайте купленное.</Text>
      {groups.map((g) => (
        <View key={g}>
          <SectionTitle title={GROUP_LABEL[g]} />
          <Card style={{ gap: 2, paddingVertical: 6 }}>
            {items.filter((i) => i.food.group === g).map(({ food, grams }) => {
              const on = checked.includes(food.id);
              return (
                <Pressable key={food.id} onPress={() => toggle(food.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
                  <Ionicons name={on ? 'checkbox' : 'square-outline'} size={24} color={on ? colors.accent : colors.textMuted} />
                  <Text style={[font.body, { flex: 1 }, on && { textDecorationLine: 'line-through', color: colors.textMuted }]}>{food.name}</Text>
                  <Text style={[font.body, { fontWeight: '700' }, on && { color: colors.textMuted }]}>{fmt(grams)}</Text>
                </Pressable>
              );
            })}
          </Card>
        </View>
      ))}
    </Screen>
  );
}
