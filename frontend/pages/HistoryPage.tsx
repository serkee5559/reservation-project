import React, { useMemo } from 'react';
import { useBooking } from '../context/BookingContext';
import { Booking } from '../types';

export const HistoryPage: React.FC = () => {
  const { bookings, cancelBooking } = useBooking();

  const groupedBookings = useMemo(() => {
    const groups: Record<string, Booking[]> = {};
    bookings.forEach(booking => {
      if (!groups[booking.timestamp]) {
        groups[booking.timestamp] = [];
      }
      groups[booking.timestamp].push(booking);
    });
    // Sort keys desc
    return Object.entries(groups).sort((a, b) =>
      new Date(b[0]).getTime() - new Date(a[0]).getTime()
    );
  }, [bookings]);

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">예약 내역</h1>
        <p className="text-slate-500 mt-1">나의 좌석 예약 현황을 관리하세요.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-calendar-times text-2xl"></i>
          </div>
          <h2 className="text-xl font-semibold text-slate-900">예약된 좌석이 없습니다</h2>
          <p className="text-slate-500 mt-2 max-w-xs">아직 예약하신 좌석이 없습니다. 지금 바로 좌석을 선택해 보세요!</p>
          <a href="#/" className="mt-6 text-indigo-600 font-bold hover:underline">
            좌석 선택하러 가기
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedBookings.map(([timestamp, group]) => (
            <div key={timestamp} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center space-x-2 text-slate-600">
                  <i className="far fa-clock"></i>
                  <span className="font-medium">{timestamp}</span>
                  <span className="text-slate-400 text-sm">({group.length}석)</span>
                </div>
                <div className="flex space-x-2">
                  {/* Aggregate status? If all confirmed, show Confirmed. If mixed, show nothing or mixed. */}
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {group.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${booking.status === 'confirmed' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'
                        }`}>
                        {booking.seatLabel}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{booking.theaterId ? `${booking.theaterId}관` : ''} {booking.showtime} {booking.seatLabel} 좌석</div>
                        <div className={`text-xs font-semibold ${booking.status === 'confirmed' ? 'text-emerald-600' : 'text-slate-500'
                          }`}>
                          {booking.status === 'confirmed' ? '예약 확정' : '취소됨'}
                        </div>
                      </div>
                    </div>

                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => cancelBooking(booking.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-2"
                        title="예약 취소"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
