import React from 'react';

export default function TemplateSelector({ templates, selectedId, onSelect }) {
  const handleKeyDown = (e, templateId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(templateId);
    }
  };

  return (
    <div className="template-selector" role="radiogroup" aria-label="Email template">
      {templates.map((template) => (
        <div
          key={template.templateId}
          className={`template-option card ${selectedId === template.templateId ? 'active' : ''}`}
          onClick={() => onSelect(template.templateId)}
          onKeyDown={(e) => handleKeyDown(e, template.templateId)}
          role="radio"
          aria-checked={selectedId === template.templateId}
          tabIndex={0}
        >
          <strong className="template-name">{template.name}</strong>
          <p className="template-description">{template.description}</p>
        </div>
      ))}
    </div>
  );
}
