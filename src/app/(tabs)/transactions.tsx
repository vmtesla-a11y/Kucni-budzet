import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { getBudgetStore } from '@/domain/budget-store';
import { currentMonth, formatDay } from '@/domain/dates';
import { formatMoney } from '@/domain/money';
import { Category, Transaction } from '@/domain/types';
import { useTheme } from '@/hooks/use-theme';

export default function TransactionsScreen() {
  const theme = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getBudgetStore()
        .then(async (store) => {
          const [nextCategories, nextTransactions] = await Promise.all([
            store.listCategories(),
            store.listTransactions(currentMonth()),
          ]);
          if (!active) {
            return;
          }
          setCategories(nextCategories);
          setTransactions(nextTransactions);
          setError('');
        })
        .catch((reason: unknown) => {
          if (active) {
            setError(reason instanceof Error ? reason.message : 'Baza nije dostupna.');
          }
        });
      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <Screen title="Unosi" subtitle="Lista za tekući mesec.">
      <Link href="/add" asChild>
        <Pressable
          accessibilityRole="button"
          style={StyleSheet.flatten([styles.add, { backgroundColor: theme.accent }])}>
          <ThemedText type="smallBold" style={styles.addLabel}>
            Novi unos
          </ThemedText>
        </Pressable>
      </Link>
      {error ? (
        <ThemedText type="small" themeColor="expense">
          {error}
        </ThemedText>
      ) : null}
      {transactions.length === 0 ? (
        <ThemedView type="backgroundElement" style={styles.empty}>
          <ThemedText type="default">Nema unosa u ovom mesecu.</ThemedText>
        </ThemedView>
      ) : (
        transactions.map((transaction) => {
          const category = categories.find((item) => item.id === transaction.categoryId);
          const positive = transaction.kind === 'income';
          return (
            <ThemedView key={transaction.id} type="backgroundElement" style={styles.row}>
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
});
