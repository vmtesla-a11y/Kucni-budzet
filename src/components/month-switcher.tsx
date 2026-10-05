import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { formatMonth, shiftMonth } from '@/domain/dates';
import { useBudget } from '@/domain/budget-context';

export function MonthSwitcher() {
  const { month, setMonth } = useBudget();

  return (
    <ThemedView type="backgroundElement" style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Prethodni mesec"
        onPress={() => setMonth(shiftMonth(month, -1))}
        style={styles.button}>
        <ThemedText type="subtitle">‹</ThemedText>
      </Pressable>
      <View style={styles.label}>
        <ThemedText type="default">{formatMonth(month)}</ThemedText>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sledeći mesec"
        onPress={() => setMonth(shiftMonth(month, 1))}
        style={styles.button}>
        <ThemedText type="subtitle">›</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.two,
  },
  button: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    alignItems: 'center',
  },
});
