import { InfoCard } from '@/components/info-card';
import { Screen } from '@/components/screen';

export default function BudgetScreen() {
  return (
    <Screen title="Plan" subtitle="Mesečni limit po kategoriji.">
      <InfoCard
        title="Limiti"
        body="Ovde će stajati kategorije i limiti. Ruta je /budget."
      />
    </Screen>
  );
}
