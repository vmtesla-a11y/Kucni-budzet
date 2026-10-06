const MONTHS = [
  'januar',
  'februar',
  'mart',
  'april',
  'maj',
  'jun',
  'jul',
  'avgust',
  'septembar',
  'oktobar',
  'novembar',
  'decembar',
] as const;

export function currentMonth(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function todayISO(now = new Date()): string {
  const day = String(now.getDate()).padStart(2, '0');
  return `${currentMonth(now)}-${day}`;
}

export function monthRange(month: string): { start: string; end: string } {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return invalidMonth(month);
  }
  const [year, monthIndex] = month.split('-').map(Number);
  if (monthIndex < 1 || monthIndex > 12) {
    return invalidMonth(month);
  }
  const end =
    monthIndex === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;
  return { start: `${month}-01`, end };
}

function invalidMonth(month: string): never {
  throw new Error(`Mesec treba da bude u obliku GGGG-MM, dobijeno: ${month}`);
}

export function shiftMonth(month: string, delta: number): string {
  const [year, monthIndex] = month.split('-').map(Number);
  return currentMonth(new Date(year, monthIndex - 1 + delta, 1));
}

export function formatMonth(month: string): string {
  const [year, monthIndex] = month.split('-').map(Number);
  const name = MONTHS[monthIndex - 1] ?? month;
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`;
}

export function formatDay(date: string): string {
  const [year, monthIndex, day] = date.split('-').map(Number);
  const name = MONTHS[monthIndex - 1] ?? '';
  return `${day}. ${name} ${year}.`;
}

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [year, monthIndex, day] = value.split('-').map(Number);
  const date = new Date(year, monthIndex - 1, day);
  return (
    date.getFullYear() === year && date.getMonth() === monthIndex - 1 && date.getDate() === day
  );
}

export function defaultDateForMonth(month: string, now = new Date()): string {
  const today = todayISO(now);
  if (today.startsWith(`${month}-`)) {
    return today;
  }
  return `${month}-01`;
}
