import type { PriceRow, TicketPriceCategory } from '../types';

export function resolveSeatPrice(
  seatType: string,
  screeningFormat: string,
  prices: PriceRow[],
  basePrice: number,
  ticketCategory: TicketPriceCategory,
): number {
  let category: string;
  if (ticketCategory === 'CHILD' || ticketCategory === 'STUDENT') {
    category = ticketCategory;
  } else {
    category = seatType === 'VIP' ? 'VIP' : 'STANDARD';
  }
  const row = prices.find((p) => p.category === category && p.format === screeningFormat);
  if (row) return Number(row.amount);
  return basePrice;
}

export function bookingSeatsPayload(
  screeningId: number,
  seats: { seatId: number; priceCategory: TicketPriceCategory }[],
) {
  return {
    screeningId,
    seats: seats.map((s) => ({ seatId: s.seatId, priceCategory: s.priceCategory })),
  };
}
