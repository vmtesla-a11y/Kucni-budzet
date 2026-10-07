import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { MonthSummary } from '@/domain/budget-db';
import { formatMonth } from '@/domain/dates';
import { formatMoney } from '@/domain/money';
import { useTheme } from '@/hooks/use-theme';

export function MonthSwitcher({
  month,
  onPrevious,
  onNext,
}: {
  month: string;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <View style={styles.switcher}>
      <Pressable accessibilityRole="button" accessibilityLabel="Prethodni mesec" onPress={onPrevious} style={styles.step}>
        <ThemedText type="smallBold">Prethodni</ThemedText>
      </Pressable>
      <ThemedText type="smallBold">{formatMonth(month)}</ThemedText>
      <Pressable accessibilityRole="button" accessibilityLabel="Sledeći mesec" onPress={onNext} style={styles.step}>
        <ThemedText type="smallBold">Sledeći</ThemedText>
      </Pressable>
    </View>
  );
}

export function MonthSummaryView({ summary }: { summary: MonthSummary }) {
  const theme = useTheme();
  const spent = summary.categories
    .filter((item) => item.spent > 0)
    .sort((left, right) => right.spent - left.spent || left.category.name.localeCompare(right.category.name, 'sr'));

  return (
    <View style={styles.stack}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="small" themeColor="textSecondary">
          Saldo
        </ThemedText>
        <ThemedText type="subtitle" style={{ color: tone(theme, summary.balance) }} accessibilityLabel={`Saldo ${signed(summary.balance)}`}>
          {signed(summary.balance)}
        </ThemedText>
      </ThemedView>

      <View style={styles.pair}>
        <ThemedView type="backgroundElement" style={styles.stat}>
          <ThemedText type="small" themeColor="textSecondary">
            Prihod
          </ThemedText>
          <ThemedText type="default" style={{ color: theme.income }}>
            {signed(summary.income, 'plus')}
          </ThemedText>
        </ThemedView>
        <ThemedView type="backgroundElement" style={styles.stat}>
          <ThemedText type="small" themeColor="textSecondary">
            Rashod
          </ThemedText>
          <ThemedText type="default" style={{ color: theme.expense }}>
            {signed(summary.expense, 'minus')}
          </ThemedText>
        </ThemedView>
      </View>

      {summary.plan ? <PlanCard plan={summary.plan} /> : null}

      <View style={styles.stack}>
        <ThemedText type="smallBold">Rashodi po kategoriji</ThemedText>
        {spent.length === 0 ? (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="default">Nema rashoda u ovom mesecu.</ThemedText>
          </ThemedView>
        ) : (
          spent.map((item) => (
            <ThemedView key={item.category.id} type="backgroundElement" style={styles.row}>
              <View style={styles.copy}>
                <ThemedText type="smallBold">{item.category.name}</ThemedText>
                {item.limit != null ? (
                  <ThemedText type="small" themeColor={item.remaining != null && item.remaining < 0 ? 'expense' : 'textSecondary'}>
                    {item.remaining != null && item.remaining < 0
                      ? `Preko limita za ${formatMoney(Math.abs(item.remaining))}`
                      : `Limit ${formatMoney(item.limit)}`}
                  </ThemedText>
                ) : (
                  <ThemedText type="small" themeColor="textSecondary">
                    Bez limita
                  </ThemedText>
                )}
              </View>
              <ThemedText type="smallBold" style={{ color: theme.expense }}>
                −{formatMoney(item.spent)}
              </ThemedText>
            </ThemedView>
          ))
        )}
      </View>
    </View>
  );
}

function PlanCard({ plan }: { plan: NonNullable<MonthSummary['plan']> }) {
  const theme = useTheme();
  const over = plan.remaining < 0;
  const ratio = plan.limit > 0 ? plan.spent / plan.limit : 0;
  const shown = ratio > 0 && ratio < 0.02 ? 0.02 : Math.min(ratio, 1);

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="small" themeColor="textSecondary">
        {over ? 'Preko limita' : 'Ostalo od plana'}
      </ThemedText>
      <ThemedText type="default" style={{ color: over ? theme.expense : theme.income }}>
        {formatMoney(Math.abs(plan.remaining))}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Potrošeno {formatMoney(plan.spent)} od {formatMoney(plan.limit)}
      </ThemedText>
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: Math.round(plan.limit), now: Math.round(plan.spent) }}
        style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
        <View style={[styles.fill, { width: `${shown * 100}%`, backgroundColor: over ? theme.expense : theme.accent }]} />
      </View>
    </ThemedView>
  );
}

function signed(value: number, force?: 'plus' | 'minus'): string {
  const formatted = formatMoney(Math.abs(value));
  if (force === 'plus') {
    return value === 0 ? formatted : `+${formatted}`;
  }
  if (force === 'minus') {
    return value === 0 ? formatted : `−${formatted}`;
  }
  if (value < 0) {
    return `−${formatted}`;
  }
  if (value > 0) {
    return `+${formatted}`;
  }
  return formatted;
}

function tone(theme: { income: string; expense: string; text: string }, value: number): string {
  if (value > 0) {
    return theme.income;
  }
  if (value < 0) {
    return theme.expense;
  }
  return theme.text;
}

const styles = StyleSheet.create({
  stack: {
    gap: Spacing.three,
  },
  switcher: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  step: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  pair: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  stat: {
    flex: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  row: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  copy: {
    flex: 1,
    gap: Spacing.half,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
  },
});
