import { create } from 'zustand';
import type { SelectedSeat, TicketPriceCategory } from '../types';

interface Draft {
  screeningId: number | null;
  movieTitle: string | null;
  startsAt: string | null;
  hallName: string | null;
  format: string | null;
  basePrice: number;
  selectedSeats: SelectedSeat[];
  setScreening: (
    id: number,
    movieTitle: string,
    startsAt: string,
    hallName: string,
    format: string,
    basePrice: number,
  ) => void;
  toggleSeat: (seat: SelectedSeat) => void;
  setSeatPriceCategory: (seatId: number, priceCategory: TicketPriceCategory) => void;
  clearSelection: () => void;
  reset: () => void;
}

export const useBookingDraftStore = create<Draft>((set, get) => ({
  screeningId: null,
  movieTitle: null,
  startsAt: null,
  hallName: null,
  format: null,
  basePrice: 0,
  selectedSeats: [],
  setScreening: (screeningId, movieTitle, startsAt, hallName, format, basePrice) =>
    set({
      screeningId,
      movieTitle,
      startsAt,
      hallName,
      format,
      basePrice,
      selectedSeats: [],
    }),
  toggleSeat: (seat) => {
    const cur = get().selectedSeats;
    if (cur.some((x) => x.seatId === seat.seatId)) {
      set({ selectedSeats: cur.filter((x) => x.seatId !== seat.seatId) });
    } else {
      set({ selectedSeats: [...cur, seat] });
    }
  },
  setSeatPriceCategory: (seatId, priceCategory) => {
    set({
      selectedSeats: get().selectedSeats.map((s) =>
        s.seatId === seatId ? { ...s, priceCategory } : s,
      ),
    });
  },
  clearSelection: () => set({ selectedSeats: [] }),
  reset: () =>
    set({
      screeningId: null,
      movieTitle: null,
      startsAt: null,
      hallName: null,
      format: null,
      basePrice: 0,
      selectedSeats: [],
    }),
}));

export function totalSelectedPrice(seats: SelectedSeat[]): number {
  return seats.reduce((sum, s) => sum + s.price, 0);
}
