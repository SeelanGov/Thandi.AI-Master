'use client';

import { useState } from 'react';

export default function MarksCollection({ curriculumProfile, values = {}, onChange }) {
  // Get subjects from Step 1 (CurriculumProfile)
  const selectedSubjects = curriculumProfile?.currentSubjects || [];
  
  const updateMarks = (field, value) => {
    onChange({
      ...values,
      [field]: value
    });
  };

  const updateExactMark = (subject, mark) => {
    const exactMarks = values.exactMarks || {};
    updateMarks('exactMarks', {
      ...exactMarks,
      [subject]: mark
    });
  };

  const updateRangeMark = (subject, range) => {
    const rangeMarks = values.rangeMarks || {};
    updateMarks('rangeMarks', {
      ...rangeMarks,
      [subject]: range
    });
  };

  return (
    <div className="marks-collection">
      <h2>Your Current Academic Performance</h2>
      <p className="subtitle">
        Help us find careers that match your academic strengths (optional but recommended)
      </p>
      
      {/* CRITICAL: Verification Warning */}
      <div className="verification-warning">
        <span className="warning-icon">⚠️</span>
        <div className="warning-content">
          <strong>Important:</strong> Your marks will be verified by your LO teacher and/or principal before any applications or decisions are made. Please provide your best estimate of your current performance.
        </div>
      </div>
      
      {selectedSubjects.length === 0 && (
        <div className="no-subjects-warning">
          <span className="warning-icon">⚠️</span>
          <p>Please go back to Step 1 and select your current subjects first.</p>
        </div>
      )}
      
      {selectedSubjects.length > 0 && (
        <>
          <div className="subjects-info">
            <h3>Subjects from your curriculum:</h3>
            <div className="subjects-list">
              {selectedSubjects.map(subject => (
                <span key={subject} className="subject-tag">{subject}</span>
              ))}
            </div>
          </div>

          <div className="marks-toggle">
            <label className="toggle-option">
              <input
                type="radio"
                name="marksOption"
                value="provide"
                checked={values.marksOption === 'provide'}
                onChange={(e) => updateMarks('marksOption', e.target.value)}
              />
              <span>I know my current marks</span>
            </label>
            <label className="toggle-option">
              <input
                type="radio"
                name="marksOption"
                value="ranges"
                checked={values.marksOption === 'ranges'}
                onChange={(e) => updateMarks('marksOption', e.target.value)}
              />
              <span>I know my approximate performance</span>
            </label>
            <label className="toggle-option">
              <input
                type="radio"
                name="marksOption"
                value="unknown"
                checked={values.marksOption === 'unknown'}
                onChange={(e) => updateMarks('marksOption', e.target.value)}
              />
              <span>I don't know my marks yet</span>
            </label>
          </div>

          {values.marksOption === 'provide' && (
            <div className="exact-marks">
              <p className="marks-help">Enter your current marks for your subjects:</p>
              <div className="marks-grid">
                {selectedSubjects.map(subject => (
                  <div key={subject} className="mark-input-group">
                    <label>{subject}:</label>
                    <div className="mark-input-wrapper">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="e.g. 75"
                        value={values.exactMarks?.[subject] || ''}
                        onChange={(e) => updateExactMark(subject, e.target.value)}
                        className="mark-input"
                      />
                      <span className="percent-sign">%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {values.marksOption === 'ranges' && (
            <div className="range-marks">
              <p className="marks-help">Select your performance level for your subjects:</p>
              <div className="ranges-grid">
                {selectedSubjects.map(subject => (
                  <div key={subject} className="range-input-group">
                    <label>{subject}:</label>
                    <select
                      value={values.rangeMarks?.[subject] || ''}
                      onChange={(e) => updateRangeMark(subject, e.target.value)}
                      className="range-select"
                    >
                      <option value="">Select...</option>
                      <option value="struggling">Struggling (30-49%)</option>
                      <option value="average">Average (50-69%)</option>
                      <option value="good">Good (70-79%)</option>
                      <option value="excellent">Excellent (80-100%)</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {values.marksOption === 'unknown' && (
            <div className="unknown-marks">
              <div className="info-box">
                <span className="info-icon">💡</span>
                <p>No problem! We'll give you general career guidance. You can always update your marks later for more personalized advice.</p>
              </div>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .marks-collection h2 {
          font-size: 24px;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .subtitle {
          color: #6b7280;
          margin-bottom: 32px;
          font-size: 16px;
        }

        .no-subjects-warning {
          background: #fef2f2;
          border: 2px solid #fecaca;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .warning-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .no-subjects-warning p {
          color: #dc2626;
          margin: 0;
        }

        .subjects-info {
          margin-bottom: 24px;
        }

        .subjects-info h3 {
          font-size: 16px;
          color: #374151;
          margin-bottom: 12px;
        }

        .subjects-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .subject-tag {
          background: #eff6ff;
          color: #1e40af;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 14px;
          border: 1px solid #bfdbfe;
        }

        .marks-toggle {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .toggle-option {
          display: flex;
          align-items: center;
          cursor: pointer;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .toggle-option:hover {
          border-color: #3b82f6;
          background: #f8fafc;
        }

        .toggle-option input[type="radio"] {
          margin-right: 12px;
          width: 18px;
          height: 18px;
        }

        .toggle-option input[type="radio"]:checked + span {
          color: #1e40af;
          font-weight: 500;
        }

        .exact-marks, .range-marks {
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          margin-top: 16px;
        }

        .marks-help {
          color: #475569;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .marks-grid, .ranges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .mark-input-group, .range-input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .mark-input-group label, .range-input-group label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .mark-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .mark-input {
          width: 100%;
          padding: 10px 35px 10px 12px;
          border: 2px solid #d1d5db;
          border-radius: 6px;
          font-size: 16px;
          background: white;
        }

        .mark-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .percent-sign {
          position: absolute;
          right: 12px;
          color: #6b7280;
          font-size: 14px;
          pointer-events: none;
        }

        .range-select {
          width: 100%;
          padding: 10px 12px;
          border: 2px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          background: white;
          cursor: pointer;
        }

        .range-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .unknown-marks {
          margin-top: 16px;
        }

        .info-box {
          background: #eff6ff;
          border: 2px solid #3b82f6;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .info-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .info-box p {
          color: #1e40af;
          font-size: 14px;
          margin: 0;
        }

        .verification-warning {
          background: #fef3c7;
          border: 2px solid #f59e0b;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .verification-warning .warning-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .verification-warning .warning-content {
          color: #92400e;
          font-size: 14px;
        }

        .verification-warning .warning-content strong {
          display: block;
          margin-bottom: 4px;
        }

        @media (max-width: 768px) {
          .marks-collection h2 {
            font-size: 20px;
          }

          .subtitle {
            font-size: 14px;
          }

          .marks-grid, .ranges-grid {
            grid-template-columns: 1fr;
          }

          .subjects-list {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}