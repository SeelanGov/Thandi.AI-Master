'use client';

import { useState } from 'react';

const CAPS_SUBJECTS = [
  { name: 'Mathematics', warning: null, emoji: '🔢' },
  { name: 'Mathematical Literacy', warning: '⚠️ Limits engineering, medicine, and most science degrees', emoji: '📊' },
  { name: 'Physical Sciences', warning: null, emoji: '⚗️' },
  { name: 'Life Sciences', warning: null, emoji: '🧬' },
  { name: 'Accounting', warning: null, emoji: '💰' },
  { name: 'Business Studies', warning: null, emoji: '💼' },
  { name: 'Economics', warning: null, emoji: '📈' },
  { name: 'Geography', warning: null, emoji: '🌍' },
  { name: 'History', warning: null, emoji: '📜' },
  { name: 'English Home Language', warning: null, emoji: '📚' },
  { name: 'English First Additional Language', warning: null, emoji: '📖' },
  { name: 'Afrikaans Home Language', warning: null, emoji: '🗣️' },
  { name: 'Afrikaans First Additional Language', warning: null, emoji: '💬' },
  { name: 'IsiZulu Home Language', warning: null, emoji: '🗣️' },
  { name: 'IsiXhosa Home Language', warning: null, emoji: '🗣️' },
  { name: 'Sesotho Home Language', warning: null, emoji: '🗣️' },
  { name: 'Setswana Home Language', warning: null, emoji: '🗣️' },
  { name: 'Life Orientation', warning: null, emoji: '🏃' },
  { name: 'Computer Applications Technology (CAT)', warning: null, emoji: '💻' },
  { name: 'Information Technology', warning: null, emoji: '🖥️' },
  { name: 'Engineering Graphics and Design (EGD)', warning: null, emoji: '📐' },
  { name: 'Visual Arts', warning: null, emoji: '🎨' },
  { name: 'Dramatic Arts', warning: null, emoji: '🎭' },
  { name: 'Music', warning: null, emoji: '🎵' },
  { name: 'Agricultural Sciences', warning: null, emoji: '🌾' },
  { name: 'Consumer Studies', warning: null, emoji: '🛍️' },
  { name: 'Hospitality Studies', warning: null, emoji: '🍽️' },
  { name: 'Tourism', warning: null, emoji: '✈️' },
  { name: 'Civil Technology', warning: null, emoji: '🏗️' },
  { name: 'Electrical Technology', warning: null, emoji: '⚡' },
  { name: 'Mechanical Technology', warning: null, emoji: '⚙️' }
];

const SUBJECT_WARNINGS = {
  'Mathematical Literacy': {
    type: 'critical',
    message: 'Blocks most engineering, medicine, and science degrees'
  },
  'Physical Sciences': {
    type: 'positive',
    message: 'Required for engineering, medicine, and most science degrees'
  },
  'Mathematics': {
    type: 'positive',
    message: 'Opens doors to engineering, medicine, commerce, and science'
  },
  'Life Sciences': {
    type: 'positive',
    message: 'Required for medicine, nursing, and health sciences'
  }
};

export default function CurriculumProfile({ grade, onChange }) {
  const [framework, setFramework] = useState('CAPS');
  const [currentSubjects, setCurrentSubjects] = useState([]);

  const handleFrameworkChange = (newFramework) => {
    setFramework(newFramework);
    onChange({ framework: newFramework, currentSubjects });
  };

  const handleSubjectToggle = (subjectName) => {
    const updated = currentSubjects.includes(subjectName)
      ? currentSubjects.filter(s => s !== subjectName)
      : [...currentSubjects, subjectName];
    
    setCurrentSubjects(updated);
    onChange({ framework, currentSubjects: updated });
  };

  const getActiveWarnings = () => {
    return currentSubjects
      .map(subj => SUBJECT_WARNINGS[subj])
      .filter(Boolean);
  };

  return (
    <div className="curriculum-profile">
      <h2>Your Current Subjects</h2>
      <p className="subtitle">Select ALL the subjects you are taking this year - Thandi needs your complete subject list for accurate career recommendations</p>
      
      {currentSubjects.length === 0 && (
        <div className="requirement-notice critical">
          <span className="requirement-icon">⚠️</span>
          <span className="requirement-text">Please select all your subjects (typically 7 subjects) - this is essential for accurate career guidance</span>
        </div>
      )}
      
      {currentSubjects.length > 0 && currentSubjects.length < 6 && (
        <div className="requirement-notice warning">
          <span className="requirement-icon">📝</span>
          <span className="requirement-text">You've selected {currentSubjects.length} subjects. Most students take 6-7 subjects. Please add any missing subjects.</span>
        </div>
      )}
      
      {currentSubjects.length >= 6 && (
        <div className="requirement-notice success">
          <span className="requirement-icon">✅</span>
          <span className="requirement-text">Great! You've selected {currentSubjects.length} subjects. This gives Thandi enough information for accurate recommendations.</span>
        </div>
      )}

      {/* Framework Selection */}
      <div className="framework-selector">
        <label>Which curriculum are you following?</label>
        <div className="framework-options">
          <button
            type="button"
            className={`framework-btn ${framework === 'CAPS' ? 'active' : ''}`}
            onClick={() => handleFrameworkChange('CAPS')}
          >
            CAPS (Government schools)
          </button>
          <button
            type="button"
            className={`framework-btn ${framework === 'IEB' ? 'active' : ''}`}
            onClick={() => handleFrameworkChange('IEB')}
          >
            IEB (Independent schools)
          </button>
        </div>
      </div>

      {/* Helpful guide */}
      <div className="subject-guide">
        <h3>📚 Typical Subject Combinations (7 subjects):</h3>
        <div className="guide-examples">
          <div className="guide-example">
            <strong>Science Stream:</strong> English, Afrikaans, Mathematics, Physical Sciences, Life Sciences, Geography, Life Orientation
          </div>
          <div className="guide-example">
            <strong>Commerce Stream:</strong> English, Afrikaans, Mathematics, Accounting, Business Studies, Economics, Life Orientation
          </div>
          <div className="guide-example">
            <strong>Humanities Stream:</strong> English, Afrikaans, Mathematical Literacy, History, Geography, Life Sciences, Life Orientation
          </div>
        </div>
      </div>

      {/* Subject Selection */}
      <div className="subject-grid">
        {CAPS_SUBJECTS.map(subject => (
          <button
            key={subject.name}
            type="button"
            className={`subject-card ${currentSubjects.includes(subject.name) ? 'selected' : ''}`}
            onClick={() => handleSubjectToggle(subject.name)}
          >
            <span className="subject-emoji">{subject.emoji}</span>
            <span className="subject-name">{subject.name}</span>
            {currentSubjects.includes(subject.name) && (
              <span className="checkmark">✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Active Warnings */}
      {getActiveWarnings().length > 0 && (
        <div className="warnings-section">
          {getActiveWarnings().map((warning, idx) => (
            <div key={idx} className={`warning-box ${warning.type}`}>
              <span className="warning-icon">
                {warning.type === 'critical' ? '⚠️' : '✅'}
              </span>
              <span className="warning-text">{warning.message}</span>
            </div>
          ))}
        </div>
      )}

      {currentSubjects.length > 0 && (
        <div className={`selected-count ${currentSubjects.length >= 6 ? 'complete' : 'incomplete'}`}>
          {currentSubjects.length} of 6-7 subjects selected
          {currentSubjects.length >= 6 ? ' ✅' : ` (${6 - currentSubjects.length} more needed)`}
        </div>
      )}

      <style jsx>{`
        .curriculum-profile {
          padding: 20px 0;
        }

        h2 {
          font-size: 24px;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .subtitle {
          color: #6b7280;
          margin-bottom: 24px;
        }

        .framework-selector {
          margin-bottom: 32px;
        }

        .framework-selector label {
          display: block;
          font-weight: 500;
          margin-bottom: 12px;
          color: #374151;
        }

        .framework-options {
          display: flex;
          gap: 12px;
        }

        .framework-btn {
          flex: 1;
          padding: 12px 24px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .framework-btn:hover {
          border-color: #3b82f6;
        }

        .framework-btn.active {
          border-color: #3b82f6;
          background: #eff6ff;
          color: #1e40af;
          font-weight: 500;
        }

        .subject-guide {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
        }

        .subject-guide h3 {
          font-size: 16px;
          color: #374151;
          margin: 0 0 12px 0;
        }

        .guide-examples {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .guide-example {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.4;
        }

        .guide-example strong {
          color: #374151;
        }

        .subject-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }

        .subject-card {
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          text-align: left;
          position: relative;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .subject-card:hover {
          border-color: #3b82f6;
          transform: translateY(-2px);
        }

        .subject-card.selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .subject-emoji {
          font-size: 24px;
          flex-shrink: 0;
        }

        .subject-name {
          flex: 1;
          font-size: 14px;
          color: #374151;
          font-weight: 500;
        }

        .subject-card.selected .subject-name {
          color: #1e40af;
        }

        .warnings-section {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .warning-box {
          padding: 12px 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .warning-box.critical {
          background: #fef3c7;
          border: 2px solid #f59e0b;
        }

        .warning-box.positive {
          background: #d1fae5;
          border: 2px solid #10b981;
        }

        .warning-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .warning-text {
          font-size: 14px;
          font-weight: 500;
        }

        .warning-box.critical .warning-text {
          color: #92400e;
        }

        .warning-box.positive .warning-text {
          color: #065f46;
        }

        .checkmark {
          position: absolute;
          top: 8px;
          right: 8px;
          color: #3b82f6;
          font-size: 18px;
          font-weight: bold;
        }

        .selected-count {
          text-align: center;
          font-size: 14px;
          padding: 12px;
          border-radius: 6px;
          font-weight: 500;
        }

        .selected-count.incomplete {
          color: #f59e0b;
          background: #fef3c7;
          border: 1px solid #f59e0b;
        }

        .selected-count.complete {
          color: #10b981;
          background: #d1fae5;
          border: 1px solid #10b981;
        }

        .requirement-notice {
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .requirement-notice.critical {
          background: #fef2f2;
          border: 2px solid #ef4444;
        }

        .requirement-notice.critical .requirement-text {
          color: #dc2626;
        }

        .requirement-notice.warning {
          background: #fef3c7;
          border: 2px solid #f59e0b;
        }

        .requirement-notice.warning .requirement-text {
          color: #92400e;
        }

        .requirement-notice.success {
          background: #d1fae5;
          border: 2px solid #10b981;
        }

        .requirement-notice.success .requirement-text {
          color: #065f46;
        }

        .requirement-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .requirement-text {
          font-size: 14px;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .subject-grid {
            grid-template-columns: 1fr;
          }

          .framework-options {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
