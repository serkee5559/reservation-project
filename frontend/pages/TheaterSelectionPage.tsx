
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

export const TheaterSelectionPage: React.FC = () => {
    const { selectTheater } = useBooking();
    const navigate = useNavigate();

    const handleSelectTheater = (id: number) => {
        selectTheater(id);
        navigate(`/theater/${id}/times`);
    };

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
                        onClick={() => handleSelectTheater(id)}
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
};
