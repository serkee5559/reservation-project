import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { supabase } from '../src/lib/supabaseClient';

export const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useBooking();
    const navigate = useNavigate();

    const validate = () => {
        if (!username || !password) {
            setError('모든 필수 항목을 입력해 주세요.');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (validate()) {
            setIsLoading(true);
            try {
                // Automatically determine backend URL based on current origin
                const PRODUCTION_URL = 'https://reservation-project.fly.dev';
                const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                const backendUrl = isLocalhost ? 'http://localhost:4000' : PRODUCTION_URL;

                const response = await fetch(`${backendUrl}/users/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username,
                        password,
                    }),
                });

                if (response.ok) {
                    const userData = await response.json();
                    login(userData.username, userData.name, userData.id, userData.email);
                    navigate('/');
                } else {
                    const errorData = await response.json();
                    setError(errorData.message || errorData.error || '아이디 또는 비밀번호가 올바르지 않습니다.');
                }
            } catch (err) {
                setError('로그인 중 오류가 발생했습니다.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="w-full flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 fade-in">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 text-white rounded-2xl mb-4 shadow-lg shadow-indigo-200">
                        <i className="fas fa-couch text-2xl"></i>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        반갑습니다
                    </h1>
                    <p className="text-slate-500 mt-2">
                        정보를 입력하여 로그인하세요
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">아이디</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="user1234"
                            autoComplete="off"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="••••••••"
                            autoComplete="new-password"
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm font-medium flex items-center">
                            <i className="fas fa-exclamation-circle mr-2"></i>
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button type="button" className="text-xs text-indigo-600 hover:underline font-medium">
                            비밀번호를 잊으셨나요?
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                    >
                        {isLoading ? (
                            <>
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                로그인 중...
                            </>
                        ) : (
                            '로그인'
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-sm text-slate-600">
                        계정이 없으신가요?{' '}
                        <Link
                            to="/signup"
                            className="text-indigo-600 font-semibold hover:underline"
                        >
                            회원가입
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
