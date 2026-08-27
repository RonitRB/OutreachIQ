import React from 'react';

export default function EmailPreviewModal({
  subject,
  body,
  jobTitle,
  company,
  onConfirm,
  onCancel,
  isLoading,
}) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="preview-title"
        aria-modal="true"
      >
        <div className="modal-header">
          <h2 id="preview-title">Review Your Email</h2>
          <p className="modal-subtitle">
            This draft will be created in your Gmail for{' '}
            <strong>{jobTitle}</strong> at <strong>{company}</strong>.
          </p>
        </div>

        <div className="modal-body">
          <div className="preview-field">
            <span className="preview-label">Subject</span>
            <p className="preview-value">{subject}</p>
          </div>
          <div className="preview-field">
            <span className="preview-label">Body</span>
            <pre className="preview-body">{body}</pre>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            ← Go Back & Edit
          </button>
          <button
            className="btn btn-primary"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner spinner-sm" /> Creating…
              </>
            ) : (
              '✉️ Create Gmail Draft'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
