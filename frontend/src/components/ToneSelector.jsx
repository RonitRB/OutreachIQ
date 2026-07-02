import React from 'react';

const TONES = [
  { value: 'formal', label: 'Formal' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'assertive', label: 'Assertive' },
];

export default function ToneSelector({ selectedTone, onSelect }) {
  return (
    <div className="tone-selector">
      {TONES.map((tone) => (
        <button
          key={tone.value}
          className={`tone-btn ${selectedTone === tone.value ? 'active' : ''}`}
          onClick={() => onSelect(tone.value)}
        >
          {tone.label}
        </button>
      ))}
    </div>
  );
}
