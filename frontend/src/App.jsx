import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import api from './api/axios';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Resume from './pages/Resume';
import Jobs from './pages/Jobs';
import Compose from './pages/Compose';
import Tracker from './pages/Tracker';

function ProtectedRoute({ children, user }) {
  return user ? children : <Navigate to="/" replace />;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ToastProvider>
      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
        </div>
      )}

      {user && <Navbar user={user} />}

      <main>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route
            path="/resume"
            element={
              <ProtectedRoute user={user}>
                <Resume />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute user={user}>
                <Jobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/compose"
            element={
              <ProtectedRoute user={user}>
                <Compose />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tracker"
            element={
              <ProtectedRoute user={user}>
                <Tracker />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </ToastProvider>
  );
}
