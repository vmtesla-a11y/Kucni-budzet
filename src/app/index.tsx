import { InfoCard } from '@/components/info-card';
import { Screen } from '@/components/screen';

export default function HomeScreen() {
  return (
    <Screen title="Početna" subtitle="Pregled izabranog meseca.">
      <InfoCard
        title="Saldo"
        body="Ovde će stajati prihodi, rashodi i saldo. Za sada je ovo prazan ekran iza taba Početna."
      />
    </Screen>
  );
}
