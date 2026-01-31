
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

export const DashboardPage: React.FC = () => {
  const { seats, toggleSeatSelection, selectedTheater, selectTheater, selectedShowtime, selectShowtime, showtimeSummary } = useBooking();
  const navigate = useNavigate();

  const pendingCount = seats.filter(s => s.status === 'pending').length;

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-emerald-100 border-emerald-300 text-emerald-700 hover:bg-emerald-200';
      case 'pending': return 'bg-orange-400 border-orange-500 text-white shadow-lg shadow-orange-100 animate-pulse';
      case 'reserved': return 'bg-red-100 border-red-200 text-red-300 cursor-not-allowed';
      case 'my-booking': return 'bg-indigo-600 border-indigo-700 text-white ring-2 ring-indigo-200';
      default: return 'bg-slate-100';
    }
  };

  const Legend = () => (
    <div className="flex flex-wrap gap-4 mt-8 p-4 bg-white rounded-xl border border-slate-200">
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-emerald-100 border border-emerald-300 rounded"></div>
        <span className="text-sm text-slate-600">예약 가능</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-orange-400 border border-orange-500 rounded"></div>
        <span className="text-sm text-slate-600">선택 중</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
        <span className="text-sm text-slate-600">예약됨</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-indigo-600 border border-indigo-700 rounded"></div>
        <span className="text-sm text-slate-600">나의 예약</span>
      </div>
    </div>
  );

  if (!selectedTheater) {
    return (
      <div className="fade-in py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">상영관 선택</h1>
          <p className="text-slate-500 text-lg">관람하실 상영관을 선택해 주세요.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto px-4">
          {[1, 2, 3, 4, 5].map((id) => (
            <button
              key={id}
              onClick={() => selectTheater(id)}
              className="group relative bg-white p-8 rounded-3xl border-2 border-slate-100 hover:border-indigo-500 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-100 flex flex-col items-center justify-center space-y-4 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <i className="fas fa-film text-6xl"></i>
              </div>
              <div className="w-16 h-16 bg-slate-50 group-hover:bg-indigo-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                <i className="fas fa-video text-2xl"></i>
              </div>
              <div className="text-center">
                <span className="block text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{id}관</span>
                <span className="text-sm text-slate-400 font-medium">100석 규모</span>
              </div>
              <div className="pt-4 w-full">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-0 group-hover:w-full transition-all duration-700 ease-out"></div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedShowtime) {
    return (
      <div className="fade-in py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center space-x-4 mb-12">
            <button
              onClick={() => selectTheater(null)}
              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <i className="fas fa-chevron-left text-xl"></i>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{selectedTheater}관 상영 시간 선택</h1>
              <p className="text-slate-500">관람하실 시간대를 선택해 주세요.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['10:00', '15:00', '20:00'].map((time) => {
              const summary = showtimeSummary.find(s => s.showtime === time);
              return (
                <button
                  key={time}
                  onClick={() => selectShowtime(time)}
                  className="group p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-indigo-500 transition-all text-center space-y-4 hover:shadow-xl"
                >
                  <div className="text-slate-400 group-hover:text-indigo-600 transition-colors">
                    <i className="far fa-clock text-4xl"></i>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-slate-900">{time}</div>
                    <div className="text-sm text-slate-400">오프닝</div>
                  </div>

                  {summary ? (
                    <div className="text-lg font-bold text-indigo-600 bg-indigo-50 py-1 rounded-lg">
                      {summary.availableSeats} / {summary.totalSeats}
                      <span className="block text-[10px] text-indigo-400 uppercase tracking-tighter">예약 가능 좌석</span>
                    </div>
                  ) : (
                    <div className="bg-slate-50 group-hover:bg-indigo-50 text-slate-500 group-hover:text-indigo-600 py-2 rounded-xl text-sm font-bold transition-colors">
                      선택하기
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => selectShowtime(null)}
            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
            title="시간대 다시 선택"
          >
            <i className="fas fa-chevron-left text-xl"></i>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{selectedTheater}관 - {selectedShowtime} 좌석 배치도</h1>
            <p className="text-slate-500 mt-1">원하시는 좌석을 선택해 주세요.</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-200">
        <div className="mb-12 text-center">
          <div className="w-full max-w-2xl mx-auto h-2 bg-slate-200 rounded-full mb-2"></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">무대 / 스크린</span>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[600px] grid grid-cols-10 gap-3">
            {seats.map((seat) => (
              <button
                key={seat.id}
                disabled={seat.status === 'reserved' || seat.status === 'my-booking'}
                onClick={() => toggleSeatSelection(seat.id)}
                className={`
                  aspect-square rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all duration-200
                  ${getSeatColor(seat.status)}
                `}
                title={`${String.fromCharCode(65 + seat.row)}${seat.col + 1} - ${seat.status}`}
              >
                {String.fromCharCode(65 + seat.row)}{seat.col + 1}
              </button>
            ))}
          </div>
        </div>

        <Legend />
      </div>

      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start space-x-3 mb-20">
        <i className="fas fa-info-circle text-indigo-500 mt-0.5"></i>
        <div className="text-sm text-indigo-700">
          <p className="font-semibold">도움말:</p>
          <p>여러 개의 좌석을 동시에 선택할 수 있습니다. 선택 후 하단의 버튼을 눌러 예약을 확정하세요.</p>
        </div>
      </div>

      {pendingCount > 0 && (
        <div className="fixed bottom-8 left-0 right-0 z-50 px-4 flex justify-center fade-in">
          <button
            onClick={() => navigate('/confirm')}
            className="flex items-center justify-center px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white text-lg font-bold rounded-full transition-all shadow-2xl shadow-orange-500/40 transform hover:-translate-y-1"
          >
            <i className="fas fa-check-circle mr-2"></i>
            {pendingCount}개의 좌석 예매하기
          </button>
        </div>
      )}
    </div>
  );
};
