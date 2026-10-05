import { StyleSheet, View } from 'react-native';

import { MonthSwitcher } from '@/components/month-switcher';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useBudget } from '@/domain/budget-context';
import { expenseProgress, plannedRemaining, sumByKind, transactionsInMonth } from '@/domain/calc';
import { formatMoney } from '@/domain/money';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const theme = useTheme();
  const { ready, month, categories, transactions } = useBudget();
  const monthTransactions = transactionsInMonth(transactions, month);
  const income = sumByKind(monthTransactions, 'income');
  const expense = sumByKind(monthTransactions, 'expense');
  const balance = income - expense;
  const progress = expenseProgress(categories, monthTransactions);
  const plan = plannedRemaining(progress);

  return (
    <Screen
      title="Kućni budžet"
      subtitle="Prihodi, rashodi i plan za izabrani mesec. Podaci ostaju na ovom uređaju.">
      <MonthSwitcher />
      {!ready ? <ThemedText type="small">Učitavam sačuvane unose…</ThemedText> : null}
      <ThemedView type="backgroundElement" style={styles.balanceCard}>
        <ThemedText type="small" themeColor="textSecondary">
          Saldo meseca
        </ThemedText>
        <ThemedText type="title" style={{ color: balance >= 0 ? theme.income : theme.expense }}>
          {formatMoney(balance)}
        </ThemedText>
      </ThemedView>
      <View style={styles.split}>
        <Metric label="Prihodi" value={formatMoney(income)} color={theme.income} />
        <Metric label="Rashodi" value={formatMoney(expense)} color={theme.expense} />
      </View>
      {plan ? (
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">Ostalo u planu</ThemedText>
          <ThemedText type="default" themeColor={plan.remaining >= 0 ? 'income' : 'expense'}>
            {formatMoney(plan.remaining)}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Potrošeno {formatMoney(plan.spent)} od {formatMoney(plan.limit)}. Kategorije bez limita nisu
            u ovom zbiru.
          </ThemedText>
        </ThemedView>
      ) : null}
      <View style={styles.list}>
        {progress.map((item) => {
          const width = item.ratio == null ? 0 : Math.min(item.ratio, 1) * 100;
          const over = item.remaining != null && item.remaining < 0;
          return (
            <ThemedView key={item.category.id} type="backgroundElement" style={styles.card}>
              <View style={styles.row}>
                <ThemedText type="smallBold">{item.category.name}</ThemedText>
                <ThemedText type="small" themeColor={over ? 'expense' : 'textSecondary'}>
                  {item.limit == null
                    ? formatMoney(item.spent)
                    : `${formatMoney(item.spent)} / ${formatMoney(item.limit)}`}
                </ThemedText>
              </View>
              {item.limit != null ? (
                <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
                  <View
                    style={[
                      styles.fill,
                      { width: `${width}%`, backgroundColor: over ? theme.expense : theme.accent },
                    ]}
                  />
                </View>
              ) : (
                <ThemedText type="small" themeColor="textSecondary">
                  Bez limita
                </ThemedText>
              )}
            </ThemedView>
          );
        })}
      </View>
    </Screen>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <ThemedView type="backgroundElement" style={styles.metric}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="default" style={{ color }}>
        {value}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  split: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  metric: {
    flex: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  list: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
    alignItems: 'center',
  },
  track: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    borderRadius: 999,
  },
});
