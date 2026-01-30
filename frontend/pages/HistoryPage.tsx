
import React from 'react';
import { useBooking } from '../context/BookingContext';

export const HistoryPage: React.FC = () => {
  const { bookings, cancelBooking } = useBooking();

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg">
                      {booking.seatLabel}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{booking.seatLabel} 좌석</h3>
                      <p className="text-xs text-slate-500">ID: {booking.id}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {booking.status === 'confirmed' ? '확정됨' : '취소됨'}
                  </span>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-50">
                  <div className="flex items-center text-sm text-slate-600">
                    <i className="far fa-clock w-5 text-slate-400"></i>
                    <span>예약 일시: {booking.timestamp}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <i className="fas fa-map-marker-alt w-5 text-slate-400"></i>
                    <span>위치: 메인 홀 {booking.seatLabel.charAt(0)}열</span>
                  </div>
                </div>
              </div>

              {booking.status === 'confirmed' && (
                <button 
                  onClick={() => cancelBooking(booking.id)}
                  className="w-full py-3 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 text-sm font-semibold transition-colors border-t border-slate-100"
                >
                  <i className="fas fa-times-circle mr-2"></i>
                  예약 취소하기
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
