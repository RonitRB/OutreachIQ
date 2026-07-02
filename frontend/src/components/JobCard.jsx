import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function JobCard({ job }) {
  const navigate = useNavigate();
  const { title, company, location, description, externalId, applyUrl } = job;

  const truncated =
    description && description.length > 120
      ? description.substring(0, 120) + '…'
      : description;

  const handleWriteEmail = () => {
    navigate(`/compose?jobId=${externalId}`);
  };

  const handleApply = () => {
    window.open(applyUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="job-card card">
      <h3 className="job-card-title">{title}</h3>
      <p className="job-card-company">{company}</p>
      {location && <span className="job-card-location badge">{location}</span>}
      {truncated && <p className="job-card-description">{truncated}</p>}

      <div className="job-card-actions">
        <button className="btn btn-primary btn-sm" onClick={handleWriteEmail}>
          Write Email
        </button>
        {applyUrl && (
          <button className="btn btn-secondary btn-sm" onClick={handleApply}>
            Apply ↗
          </button>
        )}
      </div>
    </div>
  );
}
