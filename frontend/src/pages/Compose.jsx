import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../components/Toast';
import TemplateSelector from '../components/TemplateSelector';
import ToneSelector from '../components/ToneSelector';
import EmailComposer from '../components/EmailComposer';

export default function Compose() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const jobId = searchParams.get('jobId');

  const [job, setJob] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedTone, setSelectedTone] = useState('formal');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const [loadingJob, setLoadingJob] = useState(true);
  const [jobError, setJobError] = useState(false);

  useEffect(() => {
    if (!jobId) {
      navigate('/jobs', { replace: true });
      return;
    }

    api
      .get(`/jobs/${jobId}`)
      .then((res) => setJob(res.data))
      .catch(() => {
        addToast('Failed to load job details.', 'error');
        setJobError(true);
      })
      .finally(() => setLoadingJob(false));

    api
      .get('/email/templates')
      .then((res) => {
        const list = res.data || [];
        setTemplates(list);
        if (list.length > 0) setSelectedTemplate(list[0].templateId);
      })
      .catch(() => addToast('Failed to load templates.', 'error'));
  }, [jobId, navigate, addToast]);

  const handleGenerate = async () => {
    if (!selectedTemplate) {
      addToast('Please select a template.', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await api.post('/email/generate', {
        jobId,
        templateId: selectedTemplate,
        tone: selectedTone,
      });
      setSubject(res.data.subject || '');
      setBody(res.data.body || '');
      addToast('Email generated!', 'success');
    } catch (err) {
      addToast(
        err.response?.data?.message || 'Failed to generate email.',
        'error'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateDraft = async () => {
    if (!subject.trim() || !body.trim()) {
      addToast('Subject and body are required.', 'error');
      return;
    }

    setIsCreatingDraft(true);
    try {
      const draftRes = await api.post('/gmail/draft', { subject, body });
      const draftUrl = draftRes.data.draftUrl;

      // Save to tracker
      const selectedTemplateName = templates.find(
        (t) => t.templateId === selectedTemplate
      )?.name || selectedTemplate;

      await api.post('/tracker/save', {
        jobId,
        title: job?.title,
        company: job?.company,
        location: job?.location,
        applyUrl: job?.applyUrl,
        draftUrl,
        emailSubject: subject,
        templateUsed: selectedTemplateName,
        toneUsed: selectedTone,
      });

      addToast('Draft created — Open in Gmail ↗', 'success');

      // Open draft in new tab
      if (draftUrl) {
        window.open(draftUrl, '_blank', 'noopener,noreferrer');
      }

      navigate('/tracker');
    } catch (err) {
      addToast(
        err.response?.data?.message || 'Failed to create draft.',
        'error'
      );
    } finally {
      setIsCreatingDraft(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Compose Email</h1>
        <p>Generate a personalized outreach email powered by AI.</p>
      </div>

      {loadingJob ? (
        <div className="skeleton-container">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-text" />
        </div>
      ) : jobError ? (
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <h3>Job not found</h3>
          <p>This job may have expired or been removed. Try searching for a new one.</p>
          <button className="btn btn-primary" onClick={() => navigate('/jobs')}>
            Back to Jobs
          </button>
        </div>
      ) : (
        job && (
          <div className="composer-header card">
            <h3>{job.title}</h3>
            <p className="job-meta">
              {job.company}
              {job.location && <span> · {job.location}</span>}
            </p>
          </div>
        )
      )}

      <div className="compose-steps card">
        <div className="compose-step">
          <label className="compose-label">Choose Template</label>
          <TemplateSelector
            templates={templates}
            selectedId={selectedTemplate}
            onSelect={setSelectedTemplate}
          />
        </div>

        <div className="compose-step">
          <label className="compose-label">Select Tone</label>
          <ToneSelector
            selectedTone={selectedTone}
            onSelect={setSelectedTone}
          />
        </div>

        <button
          className="btn btn-primary btn-lg"
          onClick={handleGenerate}
          disabled={isGenerating || !job}
        >
          {isGenerating ? (
            <>
              <span className="spinner-sm" /> Generating…
            </>
          ) : (
            '✨ Generate Email'
          )}
        </button>
      </div>

      {(subject || body) && (
        <EmailComposer
          subject={subject}
          body={body}
          onSubjectChange={setSubject}
          onBodyChange={setBody}
          onRegenerate={handleGenerate}
          onCreateDraft={handleCreateDraft}
          isGenerating={isGenerating}
          isCreatingDraft={isCreatingDraft}
        />
      )}
    </div>
  );
}
