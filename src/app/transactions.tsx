import { InfoCard } from '@/components/info-card';
import { Screen } from '@/components/screen';

export default function TransactionsScreen() {
  return (
    <Screen title="Unosi" subtitle="Lista prihoda i rashoda.">
      <InfoCard
        title="Novi unos"
        body="Ovde će stajati forma za prihod ili rashod. Ruta je /transactions."
      />
    </Screen>
  );
}
