import React from 'react';

export default function EmailComposer({
  subject,
  body,
  onSubjectChange,
  onBodyChange,
  onRegenerate,
  onCreateDraft,
  isGenerating,
  isCreatingDraft,
}) {
  const isLoading = isGenerating || isCreatingDraft;

  return (
    <div className="composer-panel card">
      <div className="composer-field">
        <label htmlFor="email-subject">Subject</label>
        <input
          id="email-subject"
          type="text"
          className="email-field"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder="Email subject"
          disabled={isLoading}
        />
      </div>

      <div className="composer-field">
        <label htmlFor="email-body">Body</label>
        <textarea
          id="email-body"
          className="email-output"
          rows={16}
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          placeholder="Generated email will appear here…"
          disabled={isLoading}
        />
      </div>

      <div className="composer-actions">
        <button
          className="btn btn-secondary"
          onClick={onRegenerate}
          disabled={isLoading}
        >
          {isGenerating && <span className="spinner" />}
          Regenerate
        </button>
        <button
          className="btn btn-primary"
          onClick={onCreateDraft}
          disabled={isLoading}
        >
          {isCreatingDraft && <span className="spinner" />}
          Create Gmail Draft
        </button>
      </div>
    </div>
  );
}
