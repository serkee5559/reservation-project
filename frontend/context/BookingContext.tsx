
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Seat, Booking, SeatStatus } from '../types';

interface BookingContextType {
  user: User | null;
  seats: Seat[];
  bookings: Booking[];
  login: (email: string, name: string) => void;
  logout: () => void;
  toggleSeatSelection: (seatId: string) => void;
  confirmBooking: () => void;
  cancelBooking: (bookingId: string) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const ROWS = 10;
const COLS = 10;

const initialSeats: Seat[] = Array.from({ length: ROWS * COLS }, (_, i) => {
  const row = Math.floor(i / COLS);
  const col = i % COLS;
  // Simulate some random reserved seats
  const isRandomlyReserved = Math.random() < 0.15;
  return {
    id: `seat-${row}-${col}`,
    row,
    col,
    status: isRandomlyReserved ? 'reserved' : 'available',
  };
});

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [seats, setSeats] = useState<Seat[]>(initialSeats);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const login = (email: string, name: string) => {
    setUser({ id: 'u1', email, name });
  };

  const logout = () => {
    setUser(null);
    // Reset pending seats when logging out
    setSeats(prev => prev.map(s => s.status === 'pending' ? { ...s, status: 'available' } : s));
  };

  const toggleSeatSelection = (seatId: string) => {
    setSeats(prev => prev.map(seat => {
      if (seat.id !== seatId) return seat;
      if (seat.status === 'available') return { ...seat, status: 'pending' };
      if (seat.status === 'pending') return { ...seat, status: 'available' };
      return seat;
    }));
  };

  const confirmBooking = () => {
    const pendingSeats = seats.filter(s => s.status === 'pending');
    if (pendingSeats.length === 0) return;

    const newBookings: Booking[] = pendingSeats.map(s => ({
      id: `book-${Math.random().toString(36).substr(2, 9)}`,
      seatId: s.id,
      seatLabel: `${String.fromCharCode(65 + s.row)}${s.col + 1}`,
      timestamp: new Date().toLocaleString(),
      status: 'confirmed'
    }));

    setBookings(prev => [...newBookings, ...prev]);
    setSeats(prev => prev.map(s => 
      s.status === 'pending' 
        ? { ...s, status: 'my-booking', userId: user?.id } 
        : s
    ));
  };

  const cancelBooking = (bookingId: string) => {
    const targetBooking = bookings.find(b => b.id === bookingId);
    if (!targetBooking) return;

    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
    setSeats(prev => prev.map(s => s.id === targetBooking.seatId ? { ...s, status: 'available', userId: undefined } : s));
  };

  return (
    <BookingContext.Provider value={{ 
      user, seats, bookings, login, logout, 
      toggleSeatSelection, confirmBooking, cancelBooking 
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used within a BookingProvider');
  return context;
};
