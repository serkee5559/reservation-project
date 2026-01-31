
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { supabase } from '../src/lib/supabaseClient';

export const SignupPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useBooking();
    const navigate = useNavigate();

    const validate = () => {
        if (!username || !password || !name) {
            setError('필수 항목을 모두 입력해 주세요.');
            return false;
        }

        // Basic username validation
        const usernameRegex = /^[a-zA-Z0-9]{4,20}$/;
        if (!usernameRegex.test(username)) {
            setError('아이디는 4~20자의 영문 대소문자와 숫자만 가능합니다.');
            return false;
        }

        // Optional email validation if provided
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setError('유효한 이메일 주소를 입력해 주세요.');
                return false;
            }
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
                // Call Backend API directly
                const response = await fetch('http://localhost:4000/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username,
                        email: email || undefined,
                        password,
                        name,
                    }),
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || '회원가입에 실패했습니다.');
                }

                // Success
                alert('회원가입이 완료되었습니다. 아이디로 로그인해 주세요.');
                navigate('/login');
            } catch (err: any) {
                setError(err.message || '회원가입 중 오류가 발생했습니다.');
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
                        계정 만들기
                    </h1>
                    <p className="text-slate-500 mt-2">
                        회원가입 후 원하는 좌석을 예약하세요
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">이름</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="홍길동"
                        />
                    </div>

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
                        <label className="block text-sm font-medium text-slate-700 mb-1">이메일 (선택)</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="example@email.com"
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

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                    >
                        {isLoading ? (
                            <>
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                가입 처리 중...
                            </>
                        ) : (
                            '회원가입'
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-sm text-slate-600">
                        이미 계정이 있으신가요?{' '}
                        <Link
                            to="/login"
                            className="text-indigo-600 font-semibold hover:underline"
                        >
                            로그인
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
