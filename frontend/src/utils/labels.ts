import type { TFunction } from 'i18next';

export function categoryLabel(t: TFunction, category: string): string {
  return t(`common:priceCategory.${category}`, { defaultValue: category });
}

export function formatLabel(t: TFunction, format: string): string {
  return t(`common:screeningFormat.${format}`, { defaultValue: format });
}
