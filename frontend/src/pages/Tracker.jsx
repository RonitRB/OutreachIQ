import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../components/Toast';

const STATUS_LABELS = {
  draft_created: 'Draft Created',
  sent: 'Sent',
  interview: 'Interview',
  rejected: 'Rejected',
  no_response: 'No Response',
};

const STATUS_OPTIONS = Object.keys(STATUS_LABELS);

export default function Tracker() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    api
      .get('/tracker')
      .then((res) => setApplications(res.data || []))
      .catch(() => addToast('Failed to load applications.', 'error'))
      .finally(() => setLoading(false));
  }, [addToast]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/tracker/${id}`, { status: newStatus });
      setApplications((prev) =>
        prev.map((app) =>
          app._id === id ? { ...app, status: newStatus } : app
        )
      );
      addToast('Status updated.', 'success');
    } catch {
      addToast('Failed to update status.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application record?')) return;
    try {
      await api.delete(`/tracker/${id}`);
      setApplications((prev) => prev.filter((app) => app._id !== id));
      addToast('Application removed.', 'success');
    } catch {
      addToast('Failed to delete application.', 'error');
    }
  };

  const stats = {
    total: applications.length,
    draft_created: applications.filter((a) => a.status === 'draft_created').length,
    sent: applications.filter((a) => a.status === 'sent').length,
    interview: applications.filter((a) => a.status === 'interview').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
    no_response: applications.filter((a) => a.status === 'no_response').length,
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Application Tracker</h1>
        <p>Monitor your outreach progress across all applications.</p>
      </div>

      {loading ? (
        <div className="skeleton-container">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-text" />
          <div className="skeleton skeleton-text" />
        </div>
      ) : (
        <>
          <div className="tracker-stats">
            <div className="stat-card card">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-card card">
              <span className="stat-value">{stats.draft_created}</span>
              <span className="stat-label">Drafted</span>
            </div>
            <div className="stat-card card">
              <span className="stat-value">{stats.sent}</span>
              <span className="stat-label">Sent</span>
            </div>
            <div className="stat-card card">
              <span className="stat-value">{stats.interview}</span>
              <span className="stat-label">Interview</span>
            </div>
            <div className="stat-card card">
              <span className="stat-value">{stats.rejected}</span>
              <span className="stat-label">Rejected</span>
            </div>
            <div className="stat-card card">
              <span className="stat-value">{stats.no_response}</span>
              <span className="stat-label">No Response</span>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No applications tracked yet</h3>
              <p>Start from Jobs to find opportunities and compose emails.</p>
              <Link to="/jobs" className="btn btn-primary">
                Find Jobs →
              </Link>
            </div>
          ) : (
            <div className="tracker-table-wrapper card">
              <table className="tracker-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Template</th>
                    <th>Tone</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id}>
                      <td className="tracker-title">{app.title}</td>
                      <td>{app.company}</td>
                      <td>{app.templateUsed || '—'}</td>
                      <td style={{ textTransform: 'capitalize' }}>
                        {app.toneUsed || '—'}
                      </td>
                      <td>
                        <select
                          className="input input-sm"
                          value={app.status}
                          onChange={(e) =>
                            handleStatusChange(app._id, e.target.value)
                          }
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="tracker-date">
                        {formatDate(app.appliedAt)}
                      </td>
                      <td className="tracker-actions">
                        {app.draftUrl && (
                          <a
                            href={app.draftUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-secondary"
                          >
                            View Draft
                          </a>
                        )}
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(app._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
