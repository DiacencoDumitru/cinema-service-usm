export const PRICE_CATEGORY_RO: Record<string, string> = {
  STANDARD: 'Standard',
  VIP: 'VIP',
  CHILD: 'Copil',
  STUDENT: 'Student',
};

export const SCREENING_FORMAT_RO: Record<string, string> = {
  TWO_D: '2D',
  THREE_D: '3D',
};

export const categoryLabel = (v: string): string => PRICE_CATEGORY_RO[v] ?? v;

export const formatLabel = (v: string): string => SCREENING_FORMAT_RO[v] ?? v;
