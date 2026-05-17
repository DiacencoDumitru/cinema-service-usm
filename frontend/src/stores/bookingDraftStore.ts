import { create } from 'zustand';
import type { SelectedSeat, TicketPriceCategory } from '../types';
import type { MovieTitleFields } from '../utils/movieTitle';

interface Draft {
  screeningId: number | null;
  movieTitles: MovieTitleFields | null;
  startsAt: string | null;
  hallName: string | null;
  format: string | null;
  basePrice: number;
  lockExpiresAt: string | null;
  selectedSeats: SelectedSeat[];
  setLockExpiresAt: (expiresAt: string | null) => void;
  setScreening: (
    id: number,
    movieTitles: MovieTitleFields,
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
  movieTitles: null,
  startsAt: null,
  hallName: null,
  format: null,
  basePrice: 0,
  lockExpiresAt: null,
  selectedSeats: [],
  setLockExpiresAt: (lockExpiresAt) => set({ lockExpiresAt }),
  setScreening: (screeningId, movieTitles, startsAt, hallName, format, basePrice) =>
    set({
      screeningId,
      movieTitles,
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
      movieTitles: null,
      startsAt: null,
      hallName: null,
      format: null,
      basePrice: 0,
      lockExpiresAt: null,
      selectedSeats: [],
    }),
}));

export function totalSelectedPrice(seats: SelectedSeat[]): number {
  return seats.reduce((sum, s) => sum + s.price, 0);
}
