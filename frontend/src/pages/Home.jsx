import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home({ user }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/jobs', { replace: true });
    }
  }, [user, navigate]);

  const handleGoogleLogin = () => {
    window.location.href =
      (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') +
      '/auth/google';
  };

  return (
    <div className="page hero">
      <div className="hero-content">
        <h1 className="hero-title">OutreachIQ</h1>
        <p className="hero-tagline">
          AI-powered job outreach — find roles, craft emails, and track
          applications in one place.
        </p>

        <div className="hero-features">
          <div className="feature-item">
            <span className="feature-emoji">🔍</span>
            <span className="feature-text">Smart Job Search</span>
          </div>
          <div className="feature-item">
            <span className="feature-emoji">✨</span>
            <span className="feature-text">AI Email Generation</span>
          </div>
          <div className="feature-item">
            <span className="feature-emoji">📧</span>
            <span className="feature-text">Gmail Integration</span>
          </div>
        </div>

        <button className="google-btn" onClick={handleGoogleLogin}>
          <svg
            className="google-logo"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <p className="privacy-note">
          We only access your Gmail to create drafts. Your data stays yours.
        </p>
      </div>
    </div>
  );
}
