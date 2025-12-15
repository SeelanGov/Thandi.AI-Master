'use client';

import { useState, useEffect } from 'react';
import FallbackMarkInput from './FallbackMarkInput';
import APSDisplay from './APSDisplay';
import ProgressionValidator from './ProgressionValidator';
import ConsistencyValidator from './ConsistencyValidator';

const SUBJECTS = [
  // Core subjects
  { id: 'mathematics', name: 'Mathematics', category: 'core', emoji: '🔢' },
  { id: 'math_literacy', name: 'Mathematical Literacy', category: 'core', emoji: '📊' },
  
  // Sciences
  { id: 'physical_science', name: 'Physical Sciences', category: 'science', emoji: '⚗️' },
  { id: 'life_sciences', name: 'Life Sciences', category: 'science', emoji: '🧬' },
  
  // Commerce
  { id: 'accounting', name: 'Accounting', category: 'commerce', emoji: '💰' },
  { id: 'business_studies', name: 'Business Studies', category: 'commerce', emoji: '💼' },
  { id: 'economics', name: 'Economics', category: 'commerce', emoji: '📈' },
  
  // Humanities
  { id: 'geography', name: 'Geography', category: 'humanities', emoji: '🌍' },
  { id: 'history', name: 'History', category: 'humanities', emoji: '📜' },
  
  // Languages
  { id: 'english', name: 'English', category: 'language', emoji: '📚' },
  { id: 'afrikaans', name: 'Afrikaans', category: 'language', emoji: '🗣️' },
  { id: 'french', name: 'French', category: 'language', emoji: '🇫🇷' },
  { id: 'isizulu', name: 'isiZulu', category: 'language', emoji: '🗣️' },
  
  // Technical
  { id: 'it', name: 'Information Technology', category: 'technical', emoji: '💻' },
  { id: 'cat', name: 'Computer Applications Technology', category: 'technical', emoji: '🖥️' },
  { id: 'egd', name: 'EGD (Engineering Graphics & Design)', category: 'technical', emoji: '📐' },
  
  // Creative Arts
  { id: 'visual_arts', name: 'Visual Arts', category: 'creative', emoji: '🎨' },
  { id: 'dramatic_arts', name: 'Dramatic Arts', category: 'creative', emoji: '🎭' },
  { id: 'music', name: 'Music', category: 'creative', emoji: '🎵' },
  { id: 'dance', name: 'Dance', category: 'creative', emoji: '💃' },
  
  // Practical subjects
  { id: 'tourism', name: 'Tourism', category: 'practical', emoji: '✈️' },
  { id: 'hospitality', name: 'Hospitality Studies', category: 'practical', emoji: '🍽️' },
  { id: 'consumer_studies', name: 'Consumer Studies', category: 'practical', emoji: '🛍️' },
  { id: 'life_orientation', name: 'Life Orientation', category: 'core', emoji: '🌟' },
];

/**
 * EnhancedSubjectSelection - Subject selection with integrated mark collection
 * 
 * This component combines the existing subject selection functionality with
 * mark collection, validation, and APS calculation for a comprehensive
 * academic profile building experience.
 * 
 * Requirements: 1.1, 1.2, 1.3, 8.1, 8.2
 */

export default function EnhancedSubjectSelection({ 
  selected, 
  marks = {}, 
  onChange, 
  curriculumProfile, 
  grade,
  onAPSUpdate 
}) {
  const [subjectMarks, setSubjectMarks] = useState(marks);
  const [showMarksCollection, setShowMarksCollection] = useState(false);
  const [currentFocusIndex, setCurrentFocusIndex] = useState(0);

  // Filter subjects to only show those from curriculum profile
  const availableSubjects = curriculumProfile?.currentSubjects?.length > 0 
    ? SUBJECTS.filter(subject => 
        curriculumProfile.currentSubjects.some(currentSubj => 
          currentSubj.toLowerCase().includes(subject.name.toLowerCase()) ||
          subject.name.toLowerCase().includes(currentSubj.toLowerCase())
        )
      )
    : SUBJECTS;

  // Show marks collection when subjects are selected
  useEffect(() => {
    setShowMarksCollection(selected.length >= 2);
  }, [selected.length]);

  const toggleSubject = (subjectId) => {
    let newSelected;
    let newMarks = { ...subjectMarks };

    if (selected.includes(subjectId)) {
      // Remove subject and its mark
      newSelected = selected.filter(id => id !== subjectId);
      delete newMarks[subjectId];
    } else {
      // Add subject if under limit
      if (selected.length < 7) { // Increased limit to accommodate more subjects for APS
        newSelected = [...selected, subjectId];
      } else {
        return; // Don't add if at max
      }
    }

    setSubjectMarks(newMarks);
    onChange(newSelected, newMarks);
  };

  const handleMarkChange = (subjectId, markData) => {
    const newMarks = {
      ...subjectMarks,
      [subjectId]: markData
    };
    
    setSubjectMarks(newMarks);
    onChange(selected, newMarks);
  };

  const getSubjectName = (subjectId) => {
    const subject = SUBJECTS.find(s => s.id === subjectId);
    return subject ? subject.name : subjectId;
  };

  const hasError = selected.length < 2;
  const atMax = selected.length >= 7;
  const hasAllMarks = selected.every(subjectId => 
    subjectMarks[subjectId] && subjectMarks[subjectId].validationState === 'valid'
  );

  return (
    <div className="enhanced-subject-selection">
      <div className="selection-header">
        <h2>Which of your CURRENT subjects do you most enjoy? 💚</h2>
        <p className="subtitle">
          From the subjects you selected in Step 1, pick your favorites and tell us your current marks.
        </p>
      </div>

      {/* Show curriculum context */}
      {curriculumProfile?.currentSubjects?.length > 0 && (
        <div className="context-box">
          <span className="context-icon">📚</span>
          <span className="context-text">
            Showing subjects from your {curriculumProfile.framework} curriculum profile
          </span>
        </div>
      )}

      {/* Enhanced tip for marks collection */}
      <div className="tip-box">
        <span className="tip-icon">💡</span>
        <span className="tip-text">
          Select subjects you enjoy, then add your current marks for personalized career guidance!
        </span>
      </div>

      {/* Subject Selection Grid */}
      <div className="subjects-grid">
        {availableSubjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => toggleSubject(subject.id)}
            className={`subject-card ${selected.includes(subject.id) ? 'selected' : ''} ${atMax && !selected.includes(subject.id) ? 'disabled' : ''}`}
            disabled={atMax && !selected.includes(subject.id)}
          >
            <div className="subject-emoji">{subject.emoji}</div>
            <div className="subject-name">{subject.name}</div>
            {selected.includes(subject.id) && (
              <div className="checkmark">✓</div>
            )}
          </button>
        ))}
      </div>

      {/* Selection Status */}
      <div className="selection-status">
        <div className="selection-count">
          {selected.length} subject{selected.length !== 1 ? 's' : ''} selected
          {selected.length >= 2 && selected.length <= 4 && ' ✨ Perfect!'}
          {selected.length > 4 && ' (great selection!)'}
        </div>
        
        {hasError && selected.length > 0 && (
          <div className="error-message">
            Please select at least 2 subjects you enjoy
          </div>
        )}

        {atMax && (
          <div className="info-message">
            Maximum {7} subjects selected. Deselect one to choose another.
          </div>
        )}
      </div>

      {/* Marks Collection Section */}
      {showMarksCollection && (
        <div className="marks-collection">
          <div className="marks-header">
            <h3>📊 Your Current Marks</h3>
            <p>Add your latest marks to get realistic career guidance and APS calculation</p>
            
            {/* CRITICAL: Marks Verification Warning */}
            <div className="verification-warning">
              <div className="warning-icon">⚠️</div>
              <div className="warning-content">
                <h4>Important: Mark Accuracy Verification</h4>
                <p>
                  <strong>Your marks will be verified by educational authorities.</strong> 
                  Please ensure all marks are accurate and from your most recent reports. 
                  Incorrect marks may affect your university applications and bursary eligibility.
                </p>
                <ul>
                  <li>Use marks from your latest school report</li>
                  <li>Double-check all percentages before submitting</li>
                  <li>Contact your school if you're unsure about any marks</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="marks-grid">
            {selected.map((subjectId, index) => (
              <FallbackMarkInput
                key={subjectId}
                subjectId={subjectId}
                subjectName={getSubjectName(subjectId)}
                value={subjectMarks[subjectId]}
                onChange={handleMarkChange}
                grade={grade}
                showAPSContribution={grade >= 11}
                autoFocus={index === currentFocusIndex}
                onFocus={() => setCurrentFocusIndex(index)}
              />
            ))}
          </div>

          {/* CRITICAL: Marks Verification Confirmation */}
          {hasAllMarks && (
            <div className="verification-confirmation">
              <h4>📋 Confirm Mark Accuracy</h4>
              <p>Please confirm that all marks entered are accurate and current:</p>
              
              <div className="confirmation-checkboxes">
                <label className="confirmation-checkbox">
                  <input
                    type="checkbox"
                    checked={marksVerificationConfirmed}
                    onChange={(e) => setMarksVerificationConfirmed(e.target.checked)}
                    required
                  />
                  <span className="checkmark-custom"></span>
                  <span className="checkbox-text">
                    ✅ I confirm that all marks entered are accurate and from my most recent school reports
                  </span>
                </label>
                
                <label className="confirmation-checkbox">
                  <input
                    type="checkbox"
                    checked={showVerificationWarning}
                    onChange={(e) => setShowVerificationWarning(e.target.checked)}
                    required
                  />
                  <span className="checkmark-custom"></span>
                  <span className="checkbox-text">
                    ⚖️ I understand that these marks may be verified by educational authorities
                  </span>
                </label>
              </div>
              
              {(!marksVerificationConfirmed || !showVerificationWarning) && (
                <div className="confirmation-warning">
                  <span className="warning-icon">⚠️</span>
                  <span>You must confirm mark accuracy to proceed with your assessment</span>
                </div>
              )}
            </div>
          )}

          {/* Consistency Validation */}
          <ConsistencyValidator
            marks={subjectMarks}
            selectedSubjects={selected}
            showDetails={true}
          />

          {/* Progression Validation */}
          <ProgressionValidator
            marks={subjectMarks}
            selectedSubjects={selected}
            showDetails={true}
          />

          {/* APS Display for Grade 11-12 students */}
          {grade >= 11 && Object.keys(subjectMarks).length > 0 && (
            <APSDisplay
              marks={subjectMarks}
              grade={grade}
              curriculumFramework={curriculumProfile?.framework}
              onAPSUpdate={onAPSUpdate}
              showBreakdown={hasAllMarks}
              showImprovements={hasAllMarks}
            />
          )}

          {/* Grade 10 Trajectory Display */}
          {grade === 10 && hasAllMarks && (
            <div className="trajectory-display">
              <h4>📈 Your Academic Trajectory</h4>
              <p>These marks show your current foundation. You have time to strengthen areas for improvement!</p>
              <div className="trajectory-tips">
                <div className="tip">💪 Focus on subjects you enjoy - passion drives performance</div>
                <div className="tip">📚 Build strong study habits now for Grade 11-12 success</div>
                <div className="tip">🎯 Identify career interests early to guide subject choices</div>
              </div>
            </div>
          )}

          {/* Academic Profile Summary */}
          {hasAllMarks && (
            <div className="academic-summary">
              <h4>📋 Your Academic Profile Summary</h4>
              <div className="summary-grid">
                <div className="summary-card">
                  <div className="summary-label">Selected Subjects</div>
                  <div className="summary-value">{selected.length} subjects</div>
                  <div className="summary-detail">
                    {selected.map(subjectId => {
                      const subject = availableSubjects.find(s => s.id === subjectId);
                      return subject?.name;
                    }).join(', ')}
                  </div>
                </div>
                
                {grade >= 11 && apsResult?.isValid && (
                  <div className="summary-card">
                    <div className="summary-label">Current APS Score</div>
                    <div className="summary-value">{apsResult.score}</div>
                    <div className="summary-detail">
                      {apsResult.universityAccess} university access
                    </div>
                  </div>
                )}
                
                <div className="summary-card">
                  <div className="summary-label">Average Performance</div>
                  <div className="summary-value">
                    {Math.round(Object.values(subjectMarks).reduce((sum, mark) => sum + (mark.normalizedValue || 0), 0) / Object.keys(subjectMarks).length)}%
                  </div>
                  <div className="summary-detail">
                    Across {Object.keys(subjectMarks).length} subjects
                  </div>
                </div>
              </div>
              
              <div className="summary-actions">
                <button 
                  type="button" 
                  className="edit-marks-btn"
                  onClick={() => {
                    // Scroll to marks section
                    const marksSection = document.querySelector('.marks-collection');
                    marksSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  ✏️ Edit Marks
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .enhanced-subject-selection {
          max-width: 800px;
          margin: 0 auto;
        }

        .selection-header h2 {
          font-size: 24px;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .subtitle {
          color: #6b7280;
          margin-bottom: 16px;
          font-size: 16px;
          line-height: 1.5;
        }

        .context-box {
          background: #eff6ff;
          border: 2px solid #3b82f6;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .context-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .context-text {
          color: #1e40af;
          font-size: 14px;
          line-height: 1.5;
          font-weight: 500;
        }

        .tip-box {
          background: #fef3c7;
          border: 2px solid #fbbf24;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 24px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .tip-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .tip-text {
          color: #78350f;
          font-size: 14px;
          line-height: 1.5;
        }

        .subjects-grid {
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
          transition: all 0.2s;
          position: relative;
          text-align: left;
          min-height: 70px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .subject-card:hover:not(.disabled) {
          border-color: #10b981;
          background: #d1fae5;
          transform: translateY(-2px);
        }

        .subject-card.selected {
          border-color: #10b981;
          background: #d1fae5;
        }

        .subject-card.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .subject-emoji {
          font-size: 24px;
          flex-shrink: 0;
        }

        .subject-name {
          font-size: 15px;
          font-weight: 500;
          color: #374151;
          flex: 1;
        }

        .checkmark {
          font-size: 20px;
          color: #10b981;
          font-weight: bold;
          flex-shrink: 0;
        }

        .selection-status {
          margin-bottom: 32px;
        }

        .selection-count {
          text-align: center;
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px;
          border-radius: 6px;
          font-size: 14px;
          text-align: center;
        }

        .info-message {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1e40af;
          padding: 12px;
          border-radius: 6px;
          font-size: 14px;
          text-align: center;
        }

        .marks-collection {
          border-top: 2px solid #e5e7eb;
          padding-top: 32px;
          margin-top: 32px;
        }

        .marks-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .marks-header h3 {
          font-size: 20px;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .marks-header p {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        .marks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .marks-status {
          text-align: center;
          margin-bottom: 24px;
        }

        .success-message {
          background: #d1fae5;
          color: #065f46;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
        }

        .progress-message {
          background: #eff6ff;
          color: #1e40af;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
        }

        .trajectory-display {
          background: #f0f9ff;
          border: 2px solid #0ea5e9;
          border-radius: 12px;
          padding: 24px;
          margin-top: 24px;
        }

        .trajectory-display h4 {
          margin: 0 0 12px 0;
          color: #0c4a6e;
          font-size: 18px;
        }

        .trajectory-display p {
          margin: 0 0 16px 0;
          color: #0369a1;
          font-size: 14px;
        }

        .trajectory-tips {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tip {
          background: white;
          padding: 12px;
          border-radius: 6px;
          font-size: 14px;
          color: #0c4a6e;
        }

        @media (max-width: 768px) {
          .subjects-grid {
            grid-template-columns: 1fr;
          }

          .marks-grid {
            grid-template-columns: 1fr;
          }

          .selection-header h2 {
            font-size: 20px;
          }

          .subtitle {
            font-size: 14px;
          }
        }

        .academic-summary {
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          margin-top: 24px;
        }

        .academic-summary h4 {
          color: #1e293b;
          margin-bottom: 16px;
          font-size: 18px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        }

        .summary-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
        }

        .summary-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .summary-value {
          font-size: 24px;
          font-weight: bold;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .summary-detail {
          font-size: 12px;
          color: #64748b;
          line-height: 1.4;
        }

        .summary-actions {
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        .edit-marks-btn {
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .edit-marks-btn:hover {
          background: #2563eb;
        }

        /* Verification Warning Styles */
        .verification-warning {
          background: #fef2f2;
          border: 2px solid #ef4444;
          border-radius: 12px;
          padding: 20px;
          margin: 16px 0;
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .warning-icon {
          font-size: 24px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .warning-content h4 {
          color: #dc2626;
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .warning-content p {
          color: #7f1d1d;
          margin: 0 0 12px 0;
          font-size: 14px;
          line-height: 1.5;
        }

        .warning-content ul {
          color: #7f1d1d;
          margin: 0;
          padding-left: 20px;
          font-size: 14px;
        }

        .warning-content li {
          margin-bottom: 4px;
        }

        /* Verification Confirmation Styles */
        .verification-confirmation {
          background: #f0f9ff;
          border: 2px solid #3b82f6;
          border-radius: 12px;
          padding: 20px;
          margin: 24px 0;
        }

        .verification-confirmation h4 {
          color: #1e40af;
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .verification-confirmation p {
          color: #1e3a8a;
          margin: 0 0 16px 0;
          font-size: 14px;
        }

        .confirmation-checkboxes {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .confirmation-checkbox {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
          padding: 12px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .confirmation-checkbox:hover {
          background: #f8fafc;
          border-color: #3b82f6;
        }

        .confirmation-checkbox input[type="checkbox"] {
          display: none;
        }

        .checkmark-custom {
          width: 20px;
          height: 20px;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
          margin-top: 2px;
        }

        .confirmation-checkbox input[type="checkbox"]:checked + .checkmark-custom {
          background: #3b82f6;
          border-color: #3b82f6;
        }

        .confirmation-checkbox input[type="checkbox"]:checked + .checkmark-custom::after {
          content: "✓";
          color: white;
          font-size: 14px;
          font-weight: bold;
        }

        .checkbox-text {
          color: #374151;
          font-size: 14px;
          line-height: 1.5;
          flex: 1;
        }

        .confirmation-warning {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 6px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #92400e;
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .subjects-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .marks-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}