import { type ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export function Screen({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.fill}>
      <ScrollView
        style={styles.fill}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Platform.OS === 'web' ? 120 : insets.top + Spacing.three,
            paddingBottom:
              Platform.OS === 'web'
                ? Spacing.five
                : insets.bottom + BottomTabInset + Spacing.four,
          },
        ]}>
        <ThemedText type="subtitle">{title}</ThemedText>
        {subtitle ? (
          <ThemedText type="small" themeColor="textSecondary">
            {subtitle}
          </ThemedText>
        ) : null}
        {children}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },
});
