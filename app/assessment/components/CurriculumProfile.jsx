'use client';

import { useState } from 'react';
import { IEB_SUBJECTS, IEB_SUBJECT_WARNINGS } from '../../../lib/curriculum/ieb-subjects.js';

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

const CAPS_SUBJECT_WARNINGS = {
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
    // Clear subjects when switching frameworks to avoid confusion
    setCurrentSubjects([]);
    onChange({ framework: newFramework, currentSubjects: [] });
  };

  const handleSubjectToggle = (subjectName) => {
    const updated = currentSubjects.includes(subjectName)
      ? currentSubjects.filter(s => s !== subjectName)
      : [...currentSubjects, subjectName];
    
    setCurrentSubjects(updated);
    onChange({ framework, currentSubjects: updated });
  };

  // Get curriculum-specific subjects and warnings
  const subjectList = framework === 'IEB' ? IEB_SUBJECTS : CAPS_SUBJECTS;
  const subjectWarnings = framework === 'IEB' ? IEB_SUBJECT_WARNINGS : CAPS_SUBJECT_WARNINGS;

  const getActiveWarnings = () => {
    return currentSubjects
      .map(subj => subjectWarnings[subj])
      .filter(Boolean);
  };

  return (
    <div className="curriculum-profile">
      <h2>Your Current Subjects</h2>
      <p className="subtitle">Select the subjects you are TAKING this year (not what you enjoy)</p>

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

      {/* Subject Selection */}
      <div className="subject-grid">
        {subjectList.map(subject => (
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
                {warning.type === 'critical' ? '⚠️' : warning.type === 'positive' ? '✅' : 'ℹ️'}
              </span>
              <span className="warning-text">{warning.message}</span>
            </div>
          ))}
        </div>
      )}

      {currentSubjects.length > 0 && (
        <div className="selected-count">
          {currentSubjects.length} subjects selected
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

        .warning-box.info {
          background: #eff6ff;
          border: 2px solid #3b82f6;
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

        .warning-box.info .warning-text {
          color: #1e40af;
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
          color: #6b7280;
          font-size: 14px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 6px;
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
