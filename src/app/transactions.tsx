import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MonthSwitcher } from '@/components/month-switcher';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TransactionForm } from '@/components/transaction-form';
import { Spacing } from '@/constants/theme';
import { useBudget } from '@/domain/budget-context';
import { sortTransactions, transactionsInMonth } from '@/domain/calc';
import { formatDay } from '@/domain/dates';
import { formatMoney } from '@/domain/money';
import { Transaction } from '@/domain/types';
import { useTheme } from '@/hooks/use-theme';

export default function TransactionsScreen() {
  const theme = useTheme();
  const { month, categories, transactions, deleteTransaction } = useBudget();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const visible = sortTransactions(transactionsInMonth(transactions, month));

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(transaction: Transaction) {
    setEditing(transaction);
    setFormOpen(true);
  }

  function closeForm() {
    setEditing(null);
    setFormOpen(false);
  }

  return (
    <Screen title="Unosi" subtitle="Dodaj prihod ili rashod, pa ga izmeni ili obriši.">
      <MonthSwitcher />
      {formOpen ? (
        <TransactionForm editing={editing} onDone={closeForm} />
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={openNew}
          style={[styles.add, { backgroundColor: theme.accent }]}>
          <ThemedText type="smallBold" style={styles.addLabel}>
            Novi unos
          </ThemedText>
        </Pressable>
      )}
      {visible.length === 0 ? (
        <ThemedView type="backgroundElement" style={styles.empty}>
          <ThemedText type="default">Nema unosa u ovom mesecu.</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Prvi unos može da bude plata ili račun za namirnice.
          </ThemedText>
        </ThemedView>
      ) : (
        visible.map((transaction) => {
          const category = categories.find((item) => item.id === transaction.categoryId);
          const positive = transaction.kind === 'income';
          return (
            <ThemedView key={transaction.id} type="backgroundElement" style={styles.row}>
              <View style={styles.header}>
                <View style={styles.copy}>
                  <ThemedText type="smallBold">{category?.name ?? 'Nepoznata kategorija'}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {formatDay(transaction.date)}
                    {transaction.note ? ` · ${transaction.note}` : ''}
                  </ThemedText>
                </View>
                <ThemedText type="smallBold" style={{ color: positive ? theme.income : theme.expense }}>
                  {positive ? '+' : '−'}
                  {formatMoney(transaction.amount)}
                </ThemedText>
              </View>
              <View style={styles.rowActions}>
                <Pressable accessibilityRole="button" onPress={() => openEdit(transaction)}>
                  <ThemedText type="small" themeColor="accent">
                    Izmeni
                  </ThemedText>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => deleteTransaction(transaction.id)}>
                  <ThemedText type="small" themeColor="expense">
                    Obriši
                  </ThemedText>
                </Pressable>
              </View>
            </ThemedView>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  add: {
    minHeight: 48,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addLabel: {
    color: '#FFFFFF',
  },
  empty: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  row: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  copy: {
    flex: 1,
    gap: Spacing.half,
  },
  rowActions: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
});
