
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

export const SeatSelectionPage: React.FC = () => {
    const {
        seats,
        toggleSeatSelection,
        selectedTheater,
        selectTheater,
        selectedShowtime,
        selectShowtime
    } = useBooking();
    const navigate = useNavigate();
    const { theaterId, showtime } = useParams();

    useEffect(() => {
        if (!selectedTheater && theaterId) {
            selectTheater(parseInt(theaterId));
        }
        if (!selectedShowtime && showtime) {
            selectShowtime(showtime);
        }
    }, [selectedTheater, theaterId, selectTheater, selectedShowtime, showtime, selectShowtime]);

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
        <div className="fade-in space-y-8 pb-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate(`/theater/${theaterId}/times`)}
                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="시간대 다시 선택"
                    >
                        <i className="fas fa-chevron-left text-xl"></i>
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{theaterId}관 - {showtime} 좌석 배치도</h1>
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
