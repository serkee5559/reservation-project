
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

export const ShowtimeSelectionPage: React.FC = () => {
    const { selectedTheater, selectTheater, selectShowtime, showtimeSummary } = useBooking();
    const navigate = useNavigate();
    const { theaterId } = useParams();

    useEffect(() => {
        if (!selectedTheater && theaterId) {
            selectTheater(parseInt(theaterId));
        }
    }, [selectedTheater, theaterId, selectTheater]);

    const handleSelectShowtime = (time: string) => {
        selectShowtime(time);
        navigate(`/theater/${theaterId}/time/${time}/seats`);
    };

    if (!theaterId) return null;

    return (
        <div className="fade-in py-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-center space-x-4 mb-12">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        <i className="fas fa-chevron-left text-xl"></i>
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{theaterId}관 상영 시간 선택</h1>
                        <p className="text-slate-500">관람하실 시간대를 선택해 주세요.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['10:00', '15:00', '20:00'].map((time) => {
                        const summary = showtimeSummary.find(s => s.showtime === time);
                        return (
                            <button
                                key={time}
                                onClick={() => handleSelectShowtime(time)}
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
};
