
export type SeatStatus = 'available' | 'pending' | 'reserved' | 'my-booking';

export interface User {
  id: string;
  email?: string;
  username?: string;
  name: string;
}

export interface Seat {
  id: string;
  row: number;
  col: number;
  status: SeatStatus;
  userId?: string;
}

export interface Booking {
  id: string;
  theaterId?: number;
  showtime?: string;
  seatId: string;
  seatLabel: string;
  timestamp: string;
  status: 'confirmed' | 'cancelled';
}

export interface AppState {
  user: User | null;
  seats: Seat[];
  bookings: Booking[];
}
