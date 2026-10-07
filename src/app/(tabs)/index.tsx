import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { MonthSummaryView, MonthSwitcher } from '@/components/month-summary';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { MonthSummary } from '@/domain/budget-db';
import { getBudgetStore } from '@/domain/budget-store';
import { currentMonth, shiftMonth } from '@/domain/dates';

export default function HomeScreen() {
  const [month, setMonth] = useState(currentMonth);
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [error, setError] = useState('');
  const visible = summary?.month === month ? summary : null;

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getBudgetStore()
        .then((store) => store.monthSummary(month))
        .then((next) => {
          if (!active) {
            return;
          }
          setSummary(next);
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
    }, [month]),
  );

  return (
    <Screen title="Početna" subtitle="Saldo, prihod i rashod za izabrani mesec.">
      <MonthSwitcher
        month={month}
        onPrevious={() => setMonth((current) => shiftMonth(current, -1))}
        onNext={() => setMonth((current) => shiftMonth(current, 1))}
      />
      {error ? (
        <ThemedText type="small" themeColor="expense">
          {error}
        </ThemedText>
      ) : null}
      {visible ? (
        <MonthSummaryView summary={visible} />
      ) : error ? null : (
        <ThemedText type="small" themeColor="textSecondary">
          Učitavam pregled…
        </ThemedText>
      )}
    </Screen>
  );
}
