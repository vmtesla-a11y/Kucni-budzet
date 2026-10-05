import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useBudget } from '@/domain/budget-context';
import { defaultDateForMonth, isValidDate } from '@/domain/dates';
import { parseMoney } from '@/domain/money';
import { Kind, Transaction } from '@/domain/types';
import { useTheme } from '@/hooks/use-theme';

export function TransactionForm({
  editing,
  onDone,
}: {
  editing: Transaction | null;
  onDone: () => void;
}) {
  const theme = useTheme();
  const { month, categories, addTransaction, updateTransaction } = useBudget();
  const [kind, setKind] = useState<Kind>(editing?.kind ?? 'expense');
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '');
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? '');
  const [date, setDate] = useState(editing?.date ?? defaultDateForMonth(month));
  const [note, setNote] = useState(editing?.note ?? '');
  const [error, setError] = useState('');

  useEffect(() => {
    setKind(editing?.kind ?? 'expense');
    setAmount(editing ? String(editing.amount) : '');
    setCategoryId(editing?.categoryId ?? '');
    setDate(editing?.date ?? defaultDateForMonth(month));
    setNote(editing?.note ?? '');
    setError('');
  }, [editing, month]);

  const choices = useMemo(
    () => categories.filter((category) => category.kind === kind),
    [categories, kind],
  );

  function switchKind(next: Kind) {
    setKind(next);
    setCategoryId('');
  }

  function save() {
    const parsedAmount = parseMoney(amount);
    if (parsedAmount == null) {
      setError('Unesi iznos veći od nule. Primer: 1500 ili 1.500,50.');
      return;
    }
    if (!choices.some((category) => category.id === categoryId)) {
      setError('Izaberi kategoriju.');
      return;
    }
    if (!isValidDate(date)) {
      setError('Datum treba da bude u obliku GGGG-MM-DD.');
      return;
    }

    const draft = {
      kind,
      amount: parsedAmount,
      categoryId,
      note: note.trim(),
      date,
    };
    if (editing) {
      updateTransaction(editing.id, draft);
    } else {
      addTransaction(draft);
    }
    onDone();
  }

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="smallBold">{editing ? 'Izmena unosa' : 'Novi unos'}</ThemedText>
      <View style={styles.kinds}>
        <KindButton label="Rashod" selected={kind === 'expense'} onPress={() => switchKind('expense')} />
        <KindButton label="Prihod" selected={kind === 'income'} onPress={() => switchKind('income')} />
      </View>
      <Field label="Iznos (RSD)">
        <TextInput
          accessibilityLabel="Iznos"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          inputMode="decimal"
          placeholder="1500"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
        />
      </Field>
      <Field label="Kategorija">
        <View style={styles.chips}>
          {choices.map((category) => {
            const selected = category.id === categoryId;
            return (
              <Pressable
                key={category.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setCategoryId(category.id)}
                style={[
                  styles.chip,
                  { backgroundColor: selected ? theme.accent : theme.background },
                ]}>
                <ThemedText type="small" style={{ color: selected ? '#FFFFFF' : theme.text }}>
                  {category.name}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </Field>
      <Field label="Datum">
        <TextInput
          accessibilityLabel="Datum"
          value={date}
          onChangeText={setDate}
          autoCapitalize="none"
          placeholder="2026-10-05"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
        />
      </Field>
      <Field label="Beleška">
        <TextInput
          accessibilityLabel="Beleška"
          value={note}
          onChangeText={setNote}
          placeholder="Opciono"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
        />
      </Field>
      {error ? (
        <ThemedText type="small" themeColor="expense">
          {error}
        </ThemedText>
      ) : null}
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" onPress={save} style={[styles.save, { backgroundColor: theme.accent }]}>
          <ThemedText type="smallBold" style={styles.saveLabel}>
            {editing ? 'Sačuvaj izmene' : 'Sačuvaj unos'}
          </ThemedText>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onDone} style={styles.cancel}>
          <ThemedText type="small" themeColor="textSecondary">
            Otkaži
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      {children}
    </View>
  );
}

function KindButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.kindButton,
        { backgroundColor: selected ? theme.backgroundSelected : theme.background },
      ]}>
      <ThemedText type="smallBold">{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  kinds: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  kindButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: {
    gap: Spacing.one,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    minHeight: 40,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  save: {
    minHeight: 48,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveLabel: {
    color: '#FFFFFF',
  },
  cancel: {
    minHeight: 48,
    justifyContent: 'center',
  },
});
