export const BIRTHDAY_DISCOUNT_PERCENT = 30;
export const BIRTHDAY_DISCOUNT_WINDOW_DAYS = 3;
export const BIRTHDAY_TIMEZONE = 'Europe/Chisinau';

const MS_PER_DAY = 86_400_000;

type DateParts = { year: number; month: number; day: number };

function toDatePartsInZone(date: Date, tz: string): DateParts {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
  };
}

function parseIsoDate(value: string): DateParts {
  const [y, m, d] = value.split('-').map(Number);
  return { year: y, month: m, day: d };
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function birthdayInYear(birth: DateParts, year: number): DateParts {
  if (birth.month === 2 && birth.day === 29 && !isLeapYear(year)) {
    return { year, month: 3, day: 1 };
  }
  return { year, month: birth.month, day: birth.day };
}

function diffDays(a: DateParts, b: DateParts): number {
  const ms = Math.abs(Date.UTC(a.year, a.month - 1, a.day) - Date.UTC(b.year, b.month - 1, b.day));
  return Math.round(ms / MS_PER_DAY);
}

export function isBirthdayWindow(
  birthDate: string | null | undefined,
  screeningISO: string | null | undefined,
): boolean {
  if (!birthDate || !screeningISO) return false;
  const parsed = new Date(screeningISO);
  if (Number.isNaN(parsed.getTime())) return false;
  const birth = parseIsoDate(birthDate);
  const screening = toDatePartsInZone(parsed, BIRTHDAY_TIMEZONE);
  let min = Number.MAX_SAFE_INTEGER;
  for (let delta = -1; delta <= 1; delta++) {
    const anniversary = birthdayInYear(birth, screening.year + delta);
    const diff = diffDays(anniversary, screening);
    if (diff < min) min = diff;
  }
  return min <= BIRTHDAY_DISCOUNT_WINDOW_DAYS;
}

export function applyBirthdayDiscount(price: number): number {
  return Math.round(price * (100 - BIRTHDAY_DISCOUNT_PERCENT)) / 100;
}
