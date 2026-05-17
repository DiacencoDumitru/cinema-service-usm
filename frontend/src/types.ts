export type MovieStatus = 'NOW_SHOWING' | 'COMING_SOON';

export interface Movie {
  id: number;
  title: string;
  originalTitle: string | null;
  durationMin: number;
  formats: string[];
  languages: string[];
  genres: string[];
  director: string | null;
  actors: string[];
  ageRating: string | null;
  synopsis: string | null;
  posterUrl: string | null;
  trailerUrl: string | null;
  status: MovieStatus;
  releaseDate: string | null;
}

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ScreeningRow {
  screeningId: number;
  movieId: number;
  title: string;
  genres: string[];
  durationMin: number;
  ageRating: string | null;
  posterUrl: string | null;
  startsAt: string;
  hallId: number;
  hallName: string;
  format: string;
  language: string;
  basePrice?: string | number;
}

export interface SeatCell {
  seatId: number;
  row: number;
  col: number;
  seatType: string;
  status: 'FREE' | 'LOCKED' | 'BOOKED' | 'HELD';
}

export type TicketPriceCategory = 'STANDARD' | 'CHILD' | 'STUDENT';

export interface SelectedSeat {
  seatId: number;
  row: number;
  col: number;
  seatType: string;
  priceCategory: TicketPriceCategory;
  price: number;
  basePrice: number;
}

export interface Profile {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  birthDate: string | null;
}

export interface BookingHistory {
  bookingId: number;
  movieTitle: string;
  screeningStartsAt: string;
  hallName: string;
  totalPrice: string;
  status: string;
  seats: { row: number; col: number; seatType: string; price: string }[];
}

export interface BookingPaid {
  bookingId: number;
  movieTitle: string;
  screeningStartsAt: string;
  hallName: string;
  subtotal: string;
  discountPercent: number;
  discountAmount: string;
  totalPrice: string;
  seats: { row: number; col: number; seatType: string; price: string }[];
}

export interface PriceRow {
  category: string;
  format: string;
  amount: string;
}

export interface Hall {
  id: number;
  name: string;
  rowsCount: number;
  seatsPerRow: number;
  vipRows: number[];
}

export interface AdminBookingRow {
  bookingId: number;
  userEmail: string;
  movieTitle: string;
  screeningStartsAt: string;
  hallName: string;
  totalPrice: string;
  status: string;
}
