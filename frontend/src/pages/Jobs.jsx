import React, { useState } from 'react';
import api from '../api/axios';
import { useToast } from '../components/Toast';
import JobCard from '../components/JobCard';

export default function Jobs() {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { addToast } = useToast();

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!keyword.trim()) {
      addToast('Please enter a job keyword.', 'error');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const params = { keyword: keyword.trim() };
      if (location.trim()) params.location = location.trim();

      const res = await api.get('/jobs', { params });
      setJobs(res.data.jobs || []);
    } catch (err) {
      addToast(
        err.response?.data?.message || 'Failed to fetch jobs.',
        'error'
      );
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Find Jobs</h1>
        <p>Search thousands of job listings to find your next opportunity.</p>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          className="input"
          placeholder="Job title or keyword…"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <input
          type="text"
          className="input"
          placeholder="Location (optional)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {loading && (
        <div className="jobs-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card skeleton-card">
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-text" />
              <div className="skeleton skeleton-text short" />
            </div>
          ))}
        </div>
      )}

      {!loading && searched && jobs.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No jobs found</h3>
          <p>Try different keywords or broaden your location.</p>
        </div>
      )}

      {!loading && !searched && (
        <div className="empty-state">
          <div className="empty-icon">💼</div>
          <h3>Start your search</h3>
          <p>Enter a keyword above to discover matching jobs.</p>
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <>
          <p className="results-count">
            Found <strong>{jobs.length}</strong> job{jobs.length !== 1 && 's'}
          </p>
          <div className="jobs-grid">
            {jobs.map((job) => (
              <JobCard key={job.externalId || job._id} job={job} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
