import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { getBudgetStore } from '@/domain/budget-store';
import { todayISO } from '@/domain/dates';
import { transactionDraft } from '@/domain/draft';
import { Category, Kind } from '@/domain/types';
import { useTheme } from '@/hooks/use-theme';

export function TransactionForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const theme = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [kind, setKind] = useState<Kind>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(todayISO);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getBudgetStore()
      .then((store) => store.listCategories())
      .then((rows) => {
        if (active) {
          setCategories(rows);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : 'Baza nije dostupna.');
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const choices = useMemo(
    () => categories.filter((category) => category.kind === kind),
    [categories, kind],
  );

  async function save() {
    setSaving(true);
    setError('');
    try {
      const draft = transactionDraft({
        kind,
        amountText: amount,
        categoryId,
        note,
        date,
      });
      const store = await getBudgetStore();
      await store.addTransaction(draft);
      onSaved();
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Unos nije sačuvan.');
      setSaving(false);
    }
  }

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
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
                style={[styles.chip, { backgroundColor: selected ? theme.accent : theme.background }]}>
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
          placeholder="2026-10-06"
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
        <Pressable
          accessibilityRole="button"
          disabled={saving}
          onPress={() => {
            void save();
          }}
          style={[styles.save, { backgroundColor: theme.accent, opacity: saving ? 0.6 : 1 }]}>
          <ThemedText type="smallBold" style={styles.saveLabel}>
            {saving ? 'Čuvam…' : 'Sačuvaj unos'}
          </ThemedText>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onCancel} style={styles.cancel}>
          <ThemedText type="small" themeColor="textSecondary">
            Otkaži
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );

  function switchKind(next: Kind) {
    setKind(next);
    setCategoryId('');
  }
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
      style={[styles.kindButton, { backgroundColor: selected ? theme.backgroundSelected : theme.background }]}>
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
