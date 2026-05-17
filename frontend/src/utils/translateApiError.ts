import type { TFunction } from 'i18next';

const MESSAGE_KEYS: Record<string, string> = {
  Unauthorized: 'errors.unauthorized',
  Forbidden: 'errors.forbidden',
  'One or more seats are not available': 'errors.seatsUnavailable',
  'Seat already booked': 'errors.seatAlreadyBooked',
  'Select at least one seat': 'errors.selectAtLeastOneSeat',
  'Invalid ticket category': 'errors.invalidTicketCategory',
  'Booking cannot be cancelled': 'errors.bookingCannotCancel',
  'Screening has already started': 'errors.screeningAlreadyStarted',
  'Not your booking': 'errors.notYourBooking',
  'Booking not found': 'errors.bookingNotFound',
};

export function translateApiError(t: TFunction, message: string | undefined): string {
  if (!message) return t('errors.generic');
  const key = MESSAGE_KEYS[message];
  return key ? t(key) : message;
}
