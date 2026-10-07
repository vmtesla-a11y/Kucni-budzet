import { router } from 'expo-router';

import { Screen } from '@/components/screen';
import { TransactionForm } from '@/components/transaction-form';

export default function AddScreen() {
  function leave() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/transactions');
  }

  return (
    <Screen chrome="stack" subtitle="Prihod ili rashod ide u bazu na ovom uređaju.">
      <TransactionForm onSaved={leave} onCancel={leave} />
    </Screen>
  );
}
