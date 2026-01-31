import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },
})
export class AppGatewayGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly prisma: PrismaService) { }

  @SubscribeMessage('get_seats')
  async handleGetSeats(
    @MessageBody() payload: { theaterId: number; showtime: string },
    @ConnectedSocket() client: Socket
  ) {
    const theaterId = payload?.theaterId || 1;
    const showtime = payload?.showtime || '10:00';

    const seats = await this.prisma.seats.findMany({
      where: {
        theater_id: theaterId,
        showtime: showtime
      },
      orderBy: { seat_label: 'asc' },
    });
    // Filter bookings only for seats in this theater and showtime
    const seatIds = seats.map(s => s.id);
    const bookings = await this.prisma.bookings.findMany({
      where: {
        status: 'confirmed',
        seat_id: { in: seatIds }
      },
      include: {
        seats: true
      }
    });

    client.emit('initial_seats', { theaterId, showtime, seats, bookings });
  }

  @SubscribeMessage('book_seats')
  async handleBookSeats(
    @MessageBody() payload: { userId: string; theaterId: number; showtime: string; seatLabels: string[] },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId, theaterId, showtime, seatLabels } = payload;

    // Verify User Exists
    const user = await this.prisma.appUser.findUnique({
      where: { id: userId },
    });
    if (!user) {
      client.emit('error', 'User not found. Please login again.');
      return;
    }

    try {
      const results = await this.prisma.$transaction(async (prisma) => {
        const bookedSeats: { seatId: string; seatLabel: string; bookingId: string; bookedAt: Date | null }[] = [];
        const now = new Date();

        for (const seatLabel of seatLabels) {
          const seat = await prisma.seats.findUnique({
            where: {
              theater_id_seat_label_showtime: {
                theater_id: theaterId,
                seat_label: seatLabel,
                showtime: showtime
              }
            }
          });

          if (!seat) {
            throw new Error(`Seat ${seatLabel} not found in theater ${theaterId} at ${showtime}`);
          }
          if (seat.status === 'reserved') {
            throw new Error(`Seat ${seatLabel} already reserved`);
          }

          const booking = await prisma.bookings.create({
            data: {
              user_id: userId,
              seat_id: seat.id,
              status: 'confirmed',
              booked_at: now,
            },
          });

          await prisma.seats.update({
            where: { id: seat.id },
            data: { status: 'reserved', held_by: userId },
          });

          bookedSeats.push({
            seatId: seat.id,
            seatLabel: seat.seat_label,
            bookingId: booking.id,
            bookedAt: booking.booked_at,
          });
        }
        return bookedSeats;
      });

      results.forEach(result => {
        this.server.emit('seat_booked', {
          theaterId,
          showtime,
          seatId: result.seatId,
          seatLabel: result.seatLabel,
          userId: userId,
          bookingId: result.bookingId,
          bookedAt: result.bookedAt,
        });
      });

    } catch (e) {
      console.error(e);
      client.emit('error', e.message || 'Booking failed');
    }
  }

  @SubscribeMessage('hold_seat')
  async handleHoldSeat(
    @MessageBody() payload: { userId: string; theaterId: number; showtime: string; seatLabel: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId, theaterId, showtime, seatLabel } = payload;

    const seat = await this.prisma.seats.findUnique({
      where: {
        theater_id_seat_label_showtime: {
          theater_id: theaterId,
          seat_label: seatLabel,
          showtime: showtime
        }
      }
    });
    if (!seat) return;

    const now = new Date();
    if (seat.status === 'reserved') {
      client.emit('error', 'Seat already reserved');
      return;
    }

    if (seat.status === 'pending' && seat.held_until && seat.held_until > now && seat.held_by !== userId) {
      client.emit('error', 'Seat is currently being held by someone else');
      return;
    }

    const heldUntil = new Date(now.getTime() + 5 * 60000);

    await this.prisma.seats.update({
      where: { id: seat.id },
      data: {
        status: 'pending',
        held_by: userId,
        held_until: heldUntil,
      },
    });

    this.server.emit('seat_held', {
      theaterId,
      showtime,
      seatId: seat.id,
      seatLabel: seat.seat_label,
      heldBy: userId,
      heldUntil: heldUntil.toISOString(),
    });
  }

  @SubscribeMessage('release_seat')
  async handleReleaseSeat(
    @MessageBody() payload: { userId: string; theaterId: number; showtime: string; seatLabel: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId, theaterId, showtime, seatLabel } = payload;
    const seat = await this.prisma.seats.findUnique({
      where: {
        theater_id_seat_label_showtime: {
          theater_id: theaterId,
          seat_label: seatLabel,
          showtime: showtime
        }
      }
    });

    if (!seat) return;

    if (seat.status === 'pending' && seat.held_by === userId) {
      await this.prisma.seats.update({
        where: { id: seat.id },
        data: {
          status: 'available',
          held_by: null,
          held_until: null,
        },
      });

      this.server.emit('seat_released', {
        theaterId,
        showtime,
        seatId: seat.id,
        seatLabel: seat.seat_label,
      });
    }
  }

  @SubscribeMessage('get_my_bookings')
  async handleGetMyBookings(
    @MessageBody() payload: { userId: string },
    @ConnectedSocket() client: Socket
  ) {
    const { userId } = payload;
    const bookings = await this.prisma.bookings.findMany({
      where: {
        user_id: userId,
        status: 'confirmed'
      },
      include: {
        seats: true
      },
      orderBy: { booked_at: 'desc' }
    });

    client.emit('my_bookings', { bookings });
  }

  @SubscribeMessage('cancel_booking')
  async handleCancelBooking(
    @MessageBody() payload: { userId: string; bookingId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId, bookingId } = payload;

    // Verify booking
    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
      include: { seats: true },
    });

    if (!booking) {
      client.emit('error', 'Booking not found');
      return;
    }

    if (booking.user_id !== userId) {
      client.emit('error', 'Unauthorized to cancel this booking');
      return;
    }

    try {
      await this.prisma.$transaction(async (prisma) => {
        // Delete booking
        await prisma.bookings.delete({ where: { id: bookingId } });

        // Update seat to available
        await prisma.seats.update({
          where: { id: booking.seat_id },
          data: {
            status: 'available',
            held_by: null,
            held_until: null,
          },
        });
      });

      // Broadcast update
      this.server.emit('seat_released', {
        theaterId: booking.seats.theater_id,
        showtime: booking.seats.showtime,
        seatId: booking.seat_id,
        seatLabel: booking.seats.seat_label,
      });

      // Also tell the specific user to remove the booking from their list
      client.emit('booking_cancelled', { bookingId });

    } catch (e) {
      console.error(e);
      client.emit('error', 'Cancellation failed');
    }
  }
}
