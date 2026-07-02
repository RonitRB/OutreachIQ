import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ user }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: '/jobs', label: 'Jobs' },
    { to: '/resume', label: 'Resume' },
    { to: '/tracker', label: 'Tracker' },
  ];

  const handleLogout = () => {
    window.location.href =
      (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') +
      '/auth/logout';
  };

  return (
    <nav className="navbar">
      <Link to="/jobs" className="navbar-brand">
        OutreachIQ
      </Link>

      <button
        className={`navbar-hamburger ${menuOpen ? 'active' : ''}`}
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle navigation"
      >
        <span className="hamburger-line" />
        <span className="hamburger-line" />
        <span className="hamburger-line" />
      </button>

      <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`navbar-link ${location.pathname === link.to ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="navbar-user">
        {user && (
          <>
            <img
              src={user.avatar}
              alt={user.name}
              className="navbar-avatar"
            />
            <span className="navbar-username">{user.name}</span>
          </>
        )}
        <button className="btn btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
