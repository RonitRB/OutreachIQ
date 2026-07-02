import React from 'react';

export default function TemplateSelector({ templates, selectedId, onSelect }) {
  return (
    <div className="template-selector">
      {templates.map((template) => (
        <div
          key={template.templateId}
          className={`template-option card ${selectedId === template.templateId ? 'active' : ''}`}
          onClick={() => onSelect(template.templateId)}
        >
          <strong className="template-name">{template.name}</strong>
          <p className="template-description">{template.description}</p>
        </div>
      ))}
    </div>
  );
}
