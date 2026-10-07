import { BudgetError } from './errors';

export function toPara(amount: number, allowZero = false): number {
  if (!Number.isFinite(amount)) {
    throw new BudgetError('Iznos nije broj.');
  }
  const para = Math.round(amount * 100);
  if (Math.abs(amount * 100 - para) > 0.000001) {
    throw new BudgetError('Iznos može imati najviše dve decimale.');
  }
  if (para < 0 || (!allowZero && para === 0)) {
    throw new BudgetError('Iznos mora biti veći od nule.');
  }
  return para;
}

export function fromPara(para: number): number {
  return para / 100;
}
