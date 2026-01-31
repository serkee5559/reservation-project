
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useBooking();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAuthPage = ['/auth', '/login', '/signup'].includes(location.pathname);

  if (!user && !isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-indigo-600 flex items-center">
              <i className="fas fa-couch mr-2"></i>
              실시간자리 예약시스템
            </Link>
            <nav className="hidden md:flex space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600'
                  }`}
              >
                좌석 선택
              </Link>
              <Link
                to="/history"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/history' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600'
                  }`}
              >
                예약 내역
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <>
                <Link
                  to="/history"
                  className="hidden sm:flex md:hidden items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors"
                >
                  <i className="fas fa-history mr-2"></i>
                  예약 내역
                </Link>
                <Link
                  to="/history"
                  className="sm:hidden p-2 text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  <i className="fas fa-history text-xl"></i>
                </Link>

                <div className="flex flex-col items-end mr-2 hidden sm:flex">
                  <span className="text-sm font-semibold text-slate-900">{user.name}님</span>
                  <span className="text-xs text-slate-500">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                  title="로그아웃"
                >
                  <i className="fas fa-sign-out-alt text-xl"></i>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className={`flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 ${isAuthPage ? 'flex items-center' : ''}`}>
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} 실시간자리 예약시스템. All rights reserved.
      </footer>
    </div>
  );
};
