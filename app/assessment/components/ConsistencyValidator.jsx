'use client';

import { useState, useEffect } from 'react';
import { MarkValidator } from '../../../lib/marks/MarkValidator.js';

/**
 * ConsistencyValidator - Data consistency validation with educational context
 * 
 * This component checks for unrealistic mark patterns and provides educational
 * context about consistency while allowing users to override warnings.
 * 
 * Requirements: 6.3, 9.4
 */

export default function ConsistencyValidator({
  marks,
  selectedSubjects,
  onConsistencyUpdate,
  showDetails = true
}) {
  const [consistencyResult, setConsistencyResult] = useState(null);
  const [dismissedWarnings, setDismissedWarnings] = useState(new Set());
  const [showEducationalContent, setShowEducationalContent] = useState(false);
  const validator = new MarkValidator();

  useEffect(() => {
    if (!marks || Object.keys(marks).length < 2) {
      setConsistencyResult(null);
      return;
    }

    // Only validate marks that have valid normalized values
    const validMarks = {};
    Object.entries(marks).forEach(([subject, markData]) => {
      if (markData && markData.validationState === 'valid' && markData.normalizedValue !== null) {
        validMarks[subject] = markData;
      }
    });

    if (Object.keys(validMarks).length < 2) {
      setConsistencyResult(null);
      return;
    }

    const result = validator.validateConsistency(validMarks, selectedSubjects);
    setConsistencyResult(result);

    if (onConsistencyUpdate) {
      onConsistencyUpdate(result);
    }
  }, [marks, selectedSubjects, onConsistencyUpdate]);

  const handleDismissWarning = (warningIndex) => {
    const newDismissed = new Set(dismissedWarnings);
    newDismissed.add(warningIndex);
    setDismissedWarnings(newDismissed);
  };

  const handleShowAllWarnings = () => {
    setDismissedWarnings(new Set());
  };

  if (!consistencyResult || (consistencyResult.issues.length === 0 && consistencyResult.warnings.length === 0)) {
    return null;
  }

  const activeWarnings = consistencyResult.warnings.filter((_, index) => !dismissedWarnings.has(index));
  const hasActiveIssues = consistencyResult.issues.length > 0 || activeWarnings.length > 0;

  if (!hasActiveIssues && dismissedWarnings.size === 0) {
    return null;
  }

  return (
    <div className="consistency-validator">
      {/* Critical Issues */}
      {consistencyResult.issues.length > 0 && (
        <div className="issues-section critical">
          <div className="section-header">
            <div className="section-icon">⚠️</div>
            <div className="section-content">
              <h3>Mark Consistency Issues</h3>
              <p>These issues need your attention before proceeding.</p>
            </div>
          </div>
          
          <div className="issues-list">
            {consistencyResult.issues.map((issue, index) => (
              <div key={index} className="issue-item critical">
                <div className="issue-message">{issue.message}</div>
                <div className="issue-type">Type: {issue.type.replace('_', ' ')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {activeWarnings.length > 0 && (
        <div className="issues-section warning">
          <div className="section-header">
            <div className="section-icon">💡</div>
            <div className="section-content">
              <h3>Mark Pattern Observations</h3>
              <p>We noticed some patterns in your marks. These are just observations - you can continue if they're correct.</p>
            </div>
          </div>
          
          <div className="issues-list">
            {activeWarnings.map((warning, originalIndex) => {
              const actualIndex = consistencyResult.warnings.indexOf(warning);
              return (
                <div key={actualIndex} className="issue-item warning">
                  <div className="issue-content">
                    <div className="issue-message">{warning.message}</div>
                    <div className="issue-type">Pattern: {warning.type.replace('_', ' ')}</div>
                  </div>
                  
                  <div className="issue-actions">
                    <button
                      onClick={() => handleDismissWarning(actualIndex)}
                      className="dismiss-button"
                    >
                      These marks are correct
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Educational Content */}
      <div className="educational-section">
        <button
          onClick={() => setShowEducationalContent(!showEducationalContent)}
          className="educational-toggle"
        >
          {showEducationalContent ? '📚 Hide' : '📚 Why do we check consistency?'}
        </button>
        
        {showEducationalContent && (
          <div className="educational-content">
            <h4>Understanding Mark Consistency</h4>
            <div className="educational-points">
              <div className="point">
                <strong>Large variations (40+ points difference):</strong> While possible, large differences between subjects might indicate data entry errors or unusual circumstances.
              </div>
              <div className="point">
                <strong>Mixed high/low performance:</strong> Having both very high (80%+) and very low (40%-) marks is uncommon but can happen due to different interests, teaching quality, or study time allocation.
              </div>
              <div className="point">
                <strong>Related subject differences:</strong> Related subjects (like Math and Physical Science) often have similar performance levels, but differences can occur based on teaching methods or personal aptitude.
              </div>
            </div>
            
            <div className="educational-note">
              <strong>Remember:</strong> These are just observations to help catch potential errors. Your actual marks are what matter most for accurate career guidance. If your marks are correct, feel free to continue!
            </div>
          </div>
        )}
      </div>

      {/* Dismissed Warnings Summary */}
      {dismissedWarnings.size > 0 && (
        <div className="dismissed-section">
          <div className="dismissed-summary">
            ✅ You've confirmed {dismissedWarnings.size} mark pattern{dismissedWarnings.size > 1 ? 's' : ''} as correct.
          </div>
          <button
            onClick={handleShowAllWarnings}
            className="show-all-button"
          >
            Review dismissed patterns
          </button>
        </div>
      )}

      <style jsx>{`
        .consistency-validator {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin: 16px 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .issues-section {
          margin-bottom: 20px;
          border-radius: 8px;
          padding: 16px;
        }

        .issues-section.critical {
          background: #fef2f2;
          border: 2px solid #ef4444;
        }

        .issues-section.warning {
          background: #fffbeb;
          border: 2px solid #f59e0b;
        }

        .section-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
        }

        .section-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .section-content h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .issues-section.critical .section-content h3 {
          color: #991b1b;
        }

        .issues-section.warning .section-content h3 {
          color: #92400e;
        }

        .section-content p {
          margin: 0;
          font-size: 14px;
        }

        .issues-section.critical .section-content p {
          color: #dc2626;
        }

        .issues-section.warning .section-content p {
          color: #b45309;
        }

        .issues-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .issue-item {
          border-radius: 6px;
          padding: 12px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .issue-item.critical {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #fecaca;
        }

        .issue-item.warning {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid #fde68a;
        }

        .issue-content {
          flex: 1;
        }

        .issue-message {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .issue-item.critical .issue-message {
          color: #991b1b;
        }

        .issue-item.warning .issue-message {
          color: #92400e;
        }

        .issue-type {
          font-size: 12px;
          opacity: 0.8;
          text-transform: capitalize;
        }

        .issue-actions {
          flex-shrink: 0;
        }

        .dismiss-button {
          background: #10b981;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .dismiss-button:hover {
          background: #059669;
        }

        .educational-section {
          border-top: 1px solid #e5e7eb;
          padding-top: 16px;
          margin-bottom: 16px;
        }

        .educational-toggle {
          background: #eff6ff;
          color: #1e40af;
          border: 1px solid #bfdbfe;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .educational-toggle:hover {
          background: #dbeafe;
          border-color: #93c5fd;
        }

        .educational-content {
          margin-top: 12px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .educational-content h4 {
          margin: 0 0 12px 0;
          font-size: 16px;
          color: #1e293b;
        }

        .educational-points {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .point {
          font-size: 14px;
          line-height: 1.5;
          color: #475569;
        }

        .point strong {
          color: #1e293b;
        }

        .educational-note {
          background: #e0f2fe;
          border: 1px solid #0891b2;
          border-radius: 6px;
          padding: 12px;
          font-size: 14px;
          color: #0c4a6e;
        }

        .educational-note strong {
          color: #0369a1;
        }

        .dismissed-section {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .dismissed-summary {
          font-size: 14px;
          color: #166534;
          font-weight: 500;
        }

        .show-all-button {
          background: none;
          color: #059669;
          border: 1px solid #059669;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .show-all-button:hover {
          background: #059669;
          color: white;
        }

        @media (max-width: 768px) {
          .consistency-validator {
            padding: 16px;
          }

          .issue-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .dismissed-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .educational-points {
            gap: 8px;
          }

          .point {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}