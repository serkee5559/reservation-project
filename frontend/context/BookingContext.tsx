
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { supabase } from '../src/lib/supabaseClient';
import { User, Seat, Booking, SeatStatus } from '../types';

interface BookingContextType {
  user: User | null;
  seats: Seat[];
  bookings: Booking[];
  selectedTheater: number | null;
  selectedShowtime: string | null;
  selectTheater: (id: number | null) => void;
  selectShowtime: (time: string | null) => void;
  login: (username: string, name: string, id: string, email?: string) => void;
  logout: () => void;
  toggleSeatSelection: (seatId: string) => void;
  confirmBooking: () => void;
  cancelBooking: (bookingId: string) => void;
  isLoading: boolean;
  showtimeSummary: { showtime: string, availableSeats: number, totalSeats: number }[];
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const ROWS = 10;
const COLS = 10;

const initialSeats: Seat[] = Array.from({ length: ROWS * COLS }, (_, i) => {
  const row = Math.floor(i / COLS);
  const col = i % COLS;
  return {
    id: `seat-${row}-${col}`,
    row,
    col,
    status: 'available',
  };
});

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [seats, setSeats] = useState<Seat[]>(initialSeats);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedTheater, setSelectedTheater] = useState<number | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showtimeSummary, setShowtimeSummary] = useState<{ showtime: string, availableSeats: number, totalSeats: number }[]>([]);

  const socket = useSocket();

  // Restore session on load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error('Failed to parse stored user', e);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const selectTheater = (id: number | null) => {
    setSelectedTheater(id);
    setSelectedShowtime(null);
    setShowtimeSummary([]);
    if (id !== null) {
      setSeats(initialSeats);
      socket?.emit('get_showtime_summary', { theaterId: id });
    }
  };

  const selectShowtime = (time: string | null) => {
    setSelectedShowtime(time);
    if (time !== null) {
      setSeats(initialSeats);
    }
  };

  // Fetch all bookings for user when logged in or socket reconnects
  useEffect(() => {
    if (socket && user) {
      socket.emit('get_my_bookings', { userId: user.id });
    }
  }, [socket, user]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleInitialSeats = (data: { theaterId: number, showtime: string, seats: any[], bookings: any[] }) => {
      if (data.theaterId !== selectedTheater || data.showtime !== selectedShowtime) return;

      const mappedSeats: Seat[] = initialSeats.map(initialSeat => {
        const seatLabel = `${String.fromCharCode(65 + initialSeat.row)}${initialSeat.col + 1}`;
        const dbSeat = data.seats.find(s => s.seat_label === seatLabel);

        if (dbSeat) {
          let status: SeatStatus = 'available';
          const isHeldByMe = user && dbSeat.held_by === user.id;

          if (dbSeat.status === 'reserved') {
            status = 'reserved';
          } else if (dbSeat.status === 'pending') {
            status = isHeldByMe ? 'pending' : 'reserved';
          }

          return {
            ...initialSeat,
            id: dbSeat.id,
            status,
            userId: dbSeat.held_by,
          };
        }
        return initialSeat;
      });
      setSeats(mappedSeats);
    };

    const handleMyBookings = (data: { bookings: any[] }) => {
      const mapped = data.bookings.map((b: any) => ({
        id: b.id,
        theaterId: b.seats?.theater_id,
        showtime: b.seats?.showtime,
        seatId: b.seat_id,
        seatLabel: b.seats?.seat_label || '?',
        timestamp: new Date(b.booked_at).toLocaleString(),
        status: 'confirmed'
      } as Booking));
      setBookings(mapped);
    };

    const handleSeatHeld = (data: { theaterId: number, showtime: string, seatId: string, seatLabel: string, heldBy: string, heldUntil: string }) => {
      if (data.theaterId !== selectedTheater || data.showtime !== selectedShowtime) return;
      setSeats(prev => prev.map(seat => {
        if (seat.id === data.seatId) {
          const isMe = user && user.id === data.heldBy;
          return {
            ...seat,
            status: isMe ? 'pending' : 'reserved',
            userId: data.heldBy,
          };
        }
        return seat;
      }));
    };

    const handleSeatReleased = (data: { theaterId: number, showtime: string, seatId: string, seatLabel: string }) => {
      if (data.theaterId !== selectedTheater || data.showtime !== selectedShowtime) return;
      setSeats(prev => prev.map(seat => {
        if (seat.id === data.seatId) {
          return {
            ...seat,
            status: 'available',
            userId: undefined
          };
        }
        return seat;
      }));
    };

    const handleSeatBooked = (data: { theaterId: number, showtime: string, seatId: string, seatLabel: string, userId: string, bookingId?: string, bookedAt?: string }) => {
      if (data.theaterId === selectedTheater && data.showtime === selectedShowtime) {
        setSeats(prev => prev.map(seat => {
          if (seat.id === data.seatId) {
            return {
              ...seat,
              status: user?.id === data.userId ? 'my-booking' : 'reserved',
              userId: data.userId
            };
          }
          return seat;
        }));
      }

      if (user && data.userId === user.id) {
        // Instead of just adding one, we could re-fetch all, but manually adding is faster for UI
        const newBooking: Booking = {
          id: data.bookingId || `temp-${Date.now()}`,
          theaterId: data.theaterId,
          showtime: data.showtime,
          seatId: data.seatId,
          seatLabel: data.seatLabel,
          timestamp: data.bookedAt ? new Date(data.bookedAt).toLocaleString() : new Date().toLocaleString(),
          status: 'confirmed'
        };
        setBookings(prev => {
          if (prev.find(b => b.id === newBooking.id)) return prev;
          return [newBooking, ...prev];
        });
      }
    };

    const handleBookingCancelled = (data: { bookingId: string }) => {
      setBookings(prev => prev.filter(b => b.id !== data.bookingId));
      if (selectedTheater && selectedShowtime) {
        socket.emit('get_seats', { theaterId: selectedTheater, showtime: selectedShowtime });
      }
    };

    const handleShowtimeSummary = (data: { theaterId: number, summary: any[] }) => {
      if (data.theaterId === selectedTheater) {
        setShowtimeSummary(data.summary);
      }
    };

    socket.on('initial_seats', handleInitialSeats);
    socket.on('my_bookings', handleMyBookings);
    socket.on('seat_held', handleSeatHeld);
    socket.on('seat_released', handleSeatReleased);
    socket.on('seat_booked', handleSeatBooked);
    socket.on('booking_cancelled', handleBookingCancelled);
    socket.on('showtime_summary', handleShowtimeSummary);

    if (selectedTheater && selectedShowtime) {
      socket.emit('get_seats', { theaterId: selectedTheater, showtime: selectedShowtime });
    } else if (selectedTheater) {
      socket.emit('get_showtime_summary', { theaterId: selectedTheater });
    }

    return () => {
      socket.off('initial_seats', handleInitialSeats);
      socket.off('my_bookings', handleMyBookings);
      socket.off('seat_held', handleSeatHeld);
      socket.off('seat_released', handleSeatReleased);
      socket.off('seat_booked', handleSeatBooked);
      socket.off('booking_cancelled', handleBookingCancelled);
      socket.off('showtime_summary', handleShowtimeSummary);
    };
  }, [socket, selectedTheater, selectedShowtime, user]);

  useEffect(() => {
    if (!socket) return;
    const handleError = (msg: string) => {
      alert(msg);
      if (msg.includes('User not found')) {
        logout();
        window.location.href = '/login';
      }
    };
    socket.on('error', handleError);
    return () => { socket.off('error', handleError); };
  }, [socket]);

  const login = (username: string, name: string, id: string, email?: string) => {
    const userObj = { id, username, name, email };
    setUser(userObj);
    localStorage.setItem('user', JSON.stringify(userObj));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setSeats(prev => prev.map(s => s.status === 'pending' ? { ...s, status: 'available' } : s));
    setSelectedTheater(null);
    setSelectedShowtime(null);
    setBookings([]);
  };

  const toggleSeatSelection = (seatId: string) => {
    if (!user || !selectedTheater || !selectedShowtime) {
      alert('로그인, 상영관 및 시간대 선택이 필요합니다.');
      return;
    }
    const seat = seats.find(s => s.id === seatId);
    if (!seat) return;

    const seatLabel = `${String.fromCharCode(65 + seat.row)}${seat.col + 1}`;
    if (seat.status === 'available') {
      socket?.emit('hold_seat', { userId: user.id, theaterId: selectedTheater, showtime: selectedShowtime, seatLabel });
    } else if (seat.status === 'pending' && seat.userId === user.id) {
      socket?.emit('release_seat', { userId: user.id, theaterId: selectedTheater, showtime: selectedShowtime, seatLabel });
    }
  };

  const confirmBooking = () => {
    if (!socket || !user || !selectedTheater || !selectedShowtime) return;

    const pendingSeats = seats.filter(s => s.status === 'pending');
    if (pendingSeats.length === 0) return;

    const seatLabels = pendingSeats.map(seat =>
      `${String.fromCharCode(65 + seat.row)}${seat.col + 1}`
    );
    socket.emit('book_seats', { userId: user.id, theaterId: selectedTheater, showtime: selectedShowtime, seatLabels });
  };

  const cancelBooking = (bookingId: string) => {
    if (!socket || !user) return;
    if (confirm('정말로 예약을 취소하시겠습니까?')) {
      socket.emit('cancel_booking', { userId: user.id, bookingId });
    }
  };

  return (
    <BookingContext.Provider value={{
      user,
      seats,
      bookings,
      selectedTheater,
      selectedShowtime,
      isLoading,
      login,
      logout,
      selectTheater,
      selectShowtime,
      toggleSeatSelection,
      confirmBooking,
      cancelBooking,
      showtimeSummary
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
