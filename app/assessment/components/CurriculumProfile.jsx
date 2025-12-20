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

const IEB_SUBJECTS = [
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
  { name: 'Life Orientation', warning: null, emoji: '🏃' },
  { name: 'French', warning: null, emoji: '🇫🇷' },
  { name: 'German', warning: null, emoji: '🇩🇪' },
  { name: 'Portuguese', warning: null, emoji: '🇵🇹' },
  { name: 'Computer Applications Technology (CAT)', warning: null, emoji: '💻' },
  { name: 'Information Technology', warning: null, emoji: '🖥️' },
  { name: 'Engineering Graphics and Design (EGD)', warning: null, emoji: '📐' },
  { name: 'Visual Arts', warning: null, emoji: '🎨' },
  { name: 'Dramatic Arts', warning: null, emoji: '🎭' },
  { name: 'Music', warning: null, emoji: '🎵' },
  { name: 'Dance Studies', warning: null, emoji: '💃' },
  { name: 'Design', warning: null, emoji: '🎨' },
  { name: 'Consumer Studies', warning: null, emoji: '🛍️' },
  { name: 'Hospitality Studies', warning: null, emoji: '🍽️' },
  { name: 'Tourism', warning: null, emoji: '✈️' },
  { name: 'Sports Science', warning: null, emoji: '🏃‍♂️' }
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
    // Clear subjects when switching frameworks
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

  const getActiveWarnings = () => {
    return currentSubjects
      .map(subj => SUBJECT_WARNINGS[subj])
      .filter(Boolean);
  };

  // Get subjects based on selected framework
  const availableSubjects = framework === 'IEB' ? IEB_SUBJECTS : CAPS_SUBJECTS;

  return (
    <div className="animate-slide-up">
      <h2 className="assessment-subtitle">Your Current Subjects</h2>
      <p className="assessment-description">
        Select ALL the subjects you are taking this year - Thandi needs your complete subject list for accurate career recommendations
      </p>
      
      {currentSubjects.length === 0 && (
        <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4 mb-6 flex items-center gap-3">
          <span className="text-xl flex-shrink-0">⚠️</span>
          <span className="text-red-700 text-sm font-medium">
            Please select all your subjects (typically 7 subjects) - this is essential for accurate career guidance
          </span>
        </div>
      )}
      
      {currentSubjects.length > 0 && currentSubjects.length < 6 && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4 mb-6 flex items-center gap-3">
          <span className="text-xl flex-shrink-0">📝</span>
          <span className="text-amber-800 text-sm font-medium">
            You've selected {currentSubjects.length} subjects. Most students take 6-7 subjects. Please add any missing subjects.
          </span>
        </div>
      )}
      
      {currentSubjects.length >= 6 && (
        <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4 mb-6 flex items-center gap-3">
          <span className="text-xl flex-shrink-0">✅</span>
          <span className="text-green-800 text-sm font-medium">
            Great! You've selected {currentSubjects.length} subjects. This gives Thandi enough information for accurate recommendations.
          </span>
        </div>
      )}

      {/* Framework Selection */}
      <div className="mb-8">
        <label className="assessment-label">Which curriculum are you following?</label>
        <div className="flex gap-3">
          <button
            type="button"
            className={`flex-1 btn-assessment-secondary ${framework === 'CAPS' ? 'bg-thandi-teal text-white border-thandi-teal' : ''}`}
            onClick={() => handleFrameworkChange('CAPS')}
          >
            CAPS (Government schools)
          </button>
          <button
            type="button"
            className={`flex-1 btn-assessment-secondary ${framework === 'IEB' ? 'bg-thandi-teal text-white border-thandi-teal' : ''}`}
            onClick={() => handleFrameworkChange('IEB')}
          >
            IEB (Independent schools)
          </button>
        </div>
      </div>

      {/* Helpful guide */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
        <h3 className="font-heading font-semibold text-base text-assessment-text-primary mb-3">
          📚 {framework} Curriculum - {availableSubjects.length} subjects available:
        </h3>
        <div className="space-y-2">
          {framework === 'CAPS' ? (
            <>
              <div className="text-sm text-assessment-text-secondary">
                <strong className="text-assessment-text-primary">Science Stream:</strong> English, Afrikaans, Mathematics, Physical Sciences, Life Sciences, Geography, Life Orientation
              </div>
              <div className="text-sm text-assessment-text-secondary">
                <strong className="text-assessment-text-primary">Commerce Stream:</strong> English, Afrikaans, Mathematics, Accounting, Business Studies, Economics, Life Orientation
              </div>
              <div className="text-sm text-assessment-text-secondary">
                <strong className="text-assessment-text-primary">Humanities Stream:</strong> English, Afrikaans, Mathematical Literacy, History, Geography, Life Sciences, Life Orientation
              </div>
            </>
          ) : (
            <>
              <div className="text-sm text-assessment-text-secondary">
                <strong className="text-assessment-text-primary">IEB Science Stream:</strong> English, Afrikaans, Mathematics, Physical Sciences, Life Sciences, Geography, Life Orientation
              </div>
              <div className="text-sm text-assessment-text-secondary">
                <strong className="text-assessment-text-primary">IEB Commerce Stream:</strong> English, Afrikaans, Mathematics, Accounting, Business Studies, Economics, Life Orientation
              </div>
              <div className="text-sm text-assessment-text-secondary">
                <strong className="text-assessment-text-primary">IEB Languages:</strong> French, German, Portuguese available (not in CAPS)
              </div>
              <div className="text-sm text-assessment-text-secondary">
                <strong className="text-assessment-text-primary">IEB Specialties:</strong> Dance Studies, Design, Sports Science
              </div>
            </>
          )}
        </div>
      </div>

      {/* Subject Selection */}
      <div className="selection-grid">
        {availableSubjects.map(subject => (
          <button
            key={subject.name}
            type="button"
            className={`selection-item ${currentSubjects.includes(subject.name) ? 'selected' : ''}`}
            onClick={() => handleSubjectToggle(subject.name)}
          >
            <span className="text-2xl flex-shrink-0">{subject.emoji}</span>
            <span className="selection-item-title">{subject.name}</span>
          </button>
        ))}
      </div>

      {/* Active Warnings */}
      {getActiveWarnings().length > 0 && (
        <div className="space-y-3 mt-6">
          {getActiveWarnings().map((warning, idx) => (
            <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg ${
              warning.type === 'critical' 
                ? 'bg-amber-50 border-2 border-amber-400' 
                : 'bg-green-50 border-2 border-green-400'
            }`}>
              <span className="text-xl flex-shrink-0">
                {warning.type === 'critical' ? '⚠️' : '✅'}
              </span>
              <span className={`text-sm font-medium ${
                warning.type === 'critical' ? 'text-amber-800' : 'text-green-800'
              }`}>
                {warning.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {currentSubjects.length > 0 && (
        <div className={`text-center text-sm font-medium p-3 rounded-lg mt-6 ${
          currentSubjects.length >= 6 
            ? 'text-green-700 bg-green-50 border border-green-200' 
            : 'text-amber-700 bg-amber-50 border border-amber-200'
        }`}>
          {currentSubjects.length} of 6-7 subjects selected
          {currentSubjects.length >= 6 ? ' ✅' : ` (${6 - currentSubjects.length} more needed)`}
        </div>
      )}
    </div>
  );
}
