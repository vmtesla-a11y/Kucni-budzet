export function parseMoney(raw: string, allowZero = false): number | null {
  const cleaned = raw.trim().replace(/\s/g, '');
  if (!cleaned || !/^[0-9.,]+$/.test(cleaned)) {
    return null;
  }

  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  let normalized = cleaned;

  if (lastComma !== -1 && lastDot !== -1) {
    normalized =
      lastComma > lastDot
        ? cleaned.replace(/\./g, '').replace(',', '.')
        : cleaned.replace(/,/g, '');
  } else if (lastComma !== -1) {
    const fraction = cleaned.slice(lastComma + 1);
    const commas = cleaned.split(',').length - 1;
    normalized =
      commas > 1 || fraction.length === 3
        ? cleaned.replace(/,/g, '')
        : cleaned.replace(',', '.');
  } else if (lastDot !== -1) {
    const fraction = cleaned.slice(lastDot + 1);
    const dots = cleaned.split('.').length - 1;
    if (dots > 1 || fraction.length === 3) {
      normalized = cleaned.replace(/\./g, '');
    }
  }

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const value = Number(normalized);
  if (!Number.isFinite(value)) {
    return null;
  }
  if (value < 0 || (!allowZero && value === 0)) {
    return null;
  }

  return Math.round(value * 100) / 100;
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency: 'RSD',
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}
