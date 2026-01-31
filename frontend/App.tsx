
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BookingProvider, useBooking } from './context/BookingContext';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { TheaterSelectionPage } from './pages/TheaterSelectionPage';
import { ShowtimeSelectionPage } from './pages/ShowtimeSelectionPage';
import { SeatSelectionPage } from './pages/SeatSelectionPage';
import { HistoryPage } from './pages/HistoryPage';
import { ConfirmPage } from './pages/ConfirmPage';

// A simple PrivateRoute component to protect dashboard and history
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useBooking();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/auth" element={<Navigate to="/login" replace />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <TheaterSelectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/theater/:theaterId/times"
            element={
              <ProtectedRoute>
                <ShowtimeSelectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/theater/:theaterId/time/:showtime/seats"
            element={
              <ProtectedRoute>
                <SeatSelectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/confirm"
            element={
              <ProtectedRoute>
                <ConfirmPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <BookingProvider>
      <AppContent />
    </BookingProvider>
  );
};

export default App;
