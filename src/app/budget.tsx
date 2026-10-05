import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useBudget } from '@/domain/budget-context';
import { parseMoney } from '@/domain/money';
import { Category } from '@/domain/types';
import { useTheme } from '@/hooks/use-theme';

export default function BudgetScreen() {
  const { categories } = useBudget();
  const expenses = categories.filter((category) => category.kind === 'expense');

  return (
    <Screen
      title="Plan"
      subtitle="Mesečni limit važi za svaki mesec. Prazno polje znači da kategorija nema limit.">
      {expenses.map((category) => (
        <LimitRow key={category.id} category={category} />
      ))}
    </Screen>
  );
}

function LimitRow({ category }: { category: Category }) {
  const theme = useTheme();
  const { setCategoryLimit } = useBudget();
  const [text, setText] = useState(category.monthlyLimit == null ? '' : String(category.monthlyLimit));
  const [message, setMessage] = useState('');

  function save() {
    if (text.trim() === '') {
      setCategoryLimit(category.id, null);
      setMessage('Limit je uklonjen.');
      return;
    }
    const parsed = parseMoney(text, true);
    if (parsed == null) {
      setMessage('Unesi iznos, ili ostavi prazno.');
      return;
    }
    setCategoryLimit(category.id, parsed);
    setMessage('Limit je sačuvan.');
  }

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="smallBold">{category.name}</ThemedText>
      <View style={styles.row}>
        <TextInput
          accessibilityLabel={`Limit za ${category.name}`}
          value={text}
          onChangeText={(value) => {
            setText(value);
            setMessage('');
          }}
          keyboardType="decimal-pad"
          inputMode="decimal"
          placeholder="Bez limita"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
        />
        <Pressable
          accessibilityRole="button"
          onPress={save}
          style={[styles.save, { backgroundColor: theme.accent }]}>
          <ThemedText type="smallBold" style={styles.saveLabel}>
            Sačuvaj
          </ThemedText>
        </Pressable>
      </View>
      {message ? (
        <ThemedText type="small" themeColor={message.startsWith('Unesi') ? 'expense' : 'textSecondary'}>
          {message}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
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
});
