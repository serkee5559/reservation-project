
import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

export const ConfirmPage: React.FC = () => {
  const { seats, confirmBooking } = useBooking();
  const navigate = useNavigate();

  const pendingSeats = seats.filter(s => s.status === 'pending');

  if (pendingSeats.length === 0) {
    return <Navigate to="/" replace />;
  }

  const handleFinalConfirm = () => {
    confirmBooking();
    navigate('/history');
  };

  return (
    <div className="fade-in max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">선택 좌석 확인</h1>
        <p className="text-slate-500 mt-1">선택하신 내역이 맞는지 확인해 주세요.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="font-bold text-lg text-slate-800 flex items-center">
            <i className="fas fa-list-check mr-2 text-indigo-500"></i>
            선택된 좌석 목록 ({pendingSeats.length})
          </h2>
        </div>
        
        <div className="p-6 space-y-4">
          {pendingSeats.map(seat => (
            <div key={seat.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-400 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-sm">
                  {String.fromCharCode(65 + seat.row)}{seat.col + 1}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{String.fromCharCode(65 + seat.row)}열 {seat.col + 1}번 좌석</p>
                  <p className="text-xs text-slate-500">메인 홀 좌석</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-slate-700">무료 예약</span>
            </div>
          ))}
        </div>

        <div className="p-6 bg-slate-50/50 border-t border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <span className="text-slate-600 font-medium">총 선택 좌석</span>
            <span className="text-xl font-bold text-indigo-600">{pendingSeats.length}개</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => navigate('/')}
              className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors"
            >
              좌석 다시 선택
            </button>
            <button 
              onClick={handleFinalConfirm}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center"
            >
              <i className="fas fa-check mr-2"></i>
              최종 확정하기
            </button>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-400">
          "최종 확정하기" 버튼을 누르면 예약이 완료되며 내역에서 확인하실 수 있습니다.
        </p>
      </div>
    </div>
  );
};
