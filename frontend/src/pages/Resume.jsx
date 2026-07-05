import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useToast } from '../components/Toast';

export default function Resume() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  useEffect(() => {
    api
      .get('/resume/profile')
      .then((res) => setProfile(res.data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const handleFile = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      addToast('Please upload a PDF file.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    try {
      const res = await api.post('/resume/parse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(res.data);
      addToast('Resume parsed successfully!', 'success');
    } catch (err) {
      addToast(
        err.response?.data?.message || 'Failed to parse resume.',
        'error'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Your Resume</h1>
        <p>Upload your resume to personalize outreach emails.</p>
      </div>

      {loading && (
        <div className="skeleton-container">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-text" />
          <div className="skeleton skeleton-text" />
          <div className="skeleton skeleton-text short" />
        </div>
      )}

      {uploading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Parsing your resume…</p>
        </div>
      )}

      {!loading && profile && (
        <div className="profile-card card">
          <h2 className="profile-name">{profile.name}</h2>

          {profile.skills && profile.skills.length > 0 && (
            <div className="skill-tags">
              {profile.skills.map((skill, i) => (
                <span key={i} className="badge">
                  {skill}
                </span>
              ))}
            </div>
          )}

          {profile.projects && profile.projects.length > 0 && (
            <div className="profile-projects">
              <h3>Projects</h3>
              <ul>
                {profile.projects.map((project, i) => (
                  <li key={i}>{typeof project === 'string' ? project : project.name}</li>
                ))}
              </ul>
            </div>
          )}

          {profile.summary && (
            <div className="profile-summary">
              <h3>Summary</h3>
              <p>{profile.summary}</p>
            </div>
          )}

          <button
            className="btn btn-secondary"
            onClick={() => {
              setProfile(null);
              fileInputRef.current?.click();
            }}
          >
            Re-upload Resume
          </button>
        </div>
      )}

      {!loading && !profile && (
        <div
          className={`upload-zone card ${dragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Upload resume PDF"
        >
          <div className="upload-icon">📄</div>
          <p className="upload-text">
            Drag & drop your resume here, or <strong>click to browse</strong>
          </p>
          <p className="upload-hint">Supports PDF files only</p>
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={handleInputChange}
            hidden
          />
        </div>
      )}
    </div>
  );
}
