
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

export const DashboardPage: React.FC = () => {
  const { seats, toggleSeatSelection } = useBooking();
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

  return (
    <div className="fade-in space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">좌석 배치도</h1>
          <p className="text-slate-500 mt-1">원하시는 좌석을 선택해 주세요.</p>
        </div>
        
        {pendingCount > 0 && (
          <button 
            onClick={() => navigate('/confirm')}
            className="flex items-center justify-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-100"
          >
            <i className="fas fa-shopping-cart mr-2"></i>
            {pendingCount}개의 좌석 확인하기
          </button>
        )}
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

      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start space-x-3">
        <i className="fas fa-info-circle text-indigo-500 mt-0.5"></i>
        <div className="text-sm text-indigo-700">
          <p className="font-semibold">도움말:</p>
          <p>여러 개의 좌석을 동시에 선택할 수 있습니다. 선택 후 상단의 버튼을 눌러 예약을 확정하세요.</p>
        </div>
      </div>
    </div>
  );
};
