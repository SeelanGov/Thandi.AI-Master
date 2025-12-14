'use client';

import { useState, useEffect } from 'react';
import { FallbackManager } from '../../../lib/marks/FallbackManager.js';

/**
 * ProgressionValidator - Validates progression with fallback data and shows limitations
 * 
 * This component checks if the student can progress with their current mark data
 * (including fallbacks) and provides clear messaging about data limitations.
 * 
 * Requirements: 9.1, 9.2, 9.3
 */

export default function ProgressionValidator({
  marks,
  selectedSubjects,
  onProgressionChange,
  showDetails = true
}) {
  const [progressionResult, setProgressionResult] = useState(null);
  const [limitationsMessage, setLimitationsMessage] = useState(null);
  const fallbackManager = new FallbackManager();

  useEffect(() => {
    if (!selectedSubjects || selectedSubjects.length === 0) {
      setProgressionResult(null);
      setLimitationsMessage(null);
      return;
    }

    const result = fallbackManager.validateProgression(marks || {}, selectedSubjects);
    const message = fallbackManager.generateLimitationsMessage(result);
    
    setProgressionResult(result);
    setLimitationsMessage(message);
    
    if (onProgressionChange) {
      onProgressionChange(result);
    }
  }, [marks, selectedSubjects, onProgressionChange]);

  if (!progressionResult) {
    return null;
  }

  const { canProgress, totalSubjects, validMarks, exactMarks, fallbackMarks, completionPercentage } = progressionResult;

  return (
    <div className="progression-validator">
      {/* Main Status */}
      <div className={`status-card ${limitationsMessage.color}`}>
        <div className="status-header">
          <div className="status-icon">
            {canProgress ? '✅' : '⏳'}
          </div>
          <div className="status-content">
            <h3 className="status-title">{limitationsMessage.title}</h3>
            <p className="status-message">{limitationsMessage.message}</p>
          </div>
        </div>
        
        {canProgress && (
          <div className="progress-indicator">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="progress-text">
              {validMarks} of {totalSubjects} subjects completed ({completionPercentage}%)
            </div>
          </div>
        )}
      </div>

      {/* Detailed Breakdown */}
      {showDetails && (
        <div className="details-section">
          <div className="marks-breakdown">
            <div className="breakdown-item">
              <div className="breakdown-icon">🎯</div>
              <div className="breakdown-content">
                <div className="breakdown-number">{exactMarks}</div>
                <div className="breakdown-label">Exact marks</div>
              </div>
            </div>
            
            {fallbackMarks > 0 && (
              <div className="breakdown-item">
                <div className="breakdown-icon">📊</div>
                <div className="breakdown-content">
                  <div className="breakdown-number">{fallbackMarks}</div>
                  <div className="breakdown-label">Estimates/Unknown</div>
                </div>
              </div>
            )}
            
            <div className="breakdown-item">
              <div className="breakdown-icon">📝</div>
              <div className="breakdown-content">
                <div className="breakdown-number">{totalSubjects - validMarks}</div>
                <div className="breakdown-label">Still needed</div>
              </div>
            </div>
          </div>

          {/* Limitations */}
          {progressionResult.limitations.length > 0 && (
            <div className="limitations-section">
              <h4>Data Limitations</h4>
              <ul className="limitations-list">
                {progressionResult.limitations.map((limitation, index) => (
                  <li key={index}>{limitation}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {progressionResult.recommendations.length > 0 && (
            <div className="recommendations-section">
              <h4>Recommendations</h4>
              <ul className="recommendations-list">
                {progressionResult.recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Data Quality Indicator */}
          <div className="data-quality">
            <div className="quality-label">Data Quality:</div>
            <div className={`quality-badge ${progressionResult.dataQuality}`}>
              {progressionResult.dataQuality.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {canProgress && (
        <div className="action-section">
          <div className="action-message">
            {exactMarks === totalSubjects 
              ? "Perfect! You can proceed with full accuracy." 
              : "You can continue now or add more exact marks for better guidance."
            }
          </div>
        </div>
      )}

      <style jsx>{`
        .progression-validator {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin: 16px 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .status-card {
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .status-card.green {
          background: #d1fae5;
          border: 2px solid #10b981;
        }

        .status-card.blue {
          background: #eff6ff;
          border: 2px solid #3b82f6;
        }

        .status-card.amber {
          background: #fef3c7;
          border: 2px solid #f59e0b;
        }

        .status-card.orange {
          background: #fff7ed;
          border: 2px solid #f97316;
        }

        .status-card.red {
          background: #fef2f2;
          border: 2px solid #ef4444;
        }

        .status-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }

        .status-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .status-content {
          flex: 1;
        }

        .status-title {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .status-card.green .status-title { color: #065f46; }
        .status-card.blue .status-title { color: #1e40af; }
        .status-card.amber .status-title { color: #92400e; }
        .status-card.orange .status-title { color: #9a3412; }
        .status-card.red .status-title { color: #991b1b; }

        .status-message {
          margin: 0;
          font-size: 14px;
        }

        .status-card.green .status-message { color: #047857; }
        .status-card.blue .status-message { color: #1d4ed8; }
        .status-card.amber .status-message { color: #b45309; }
        .status-card.orange .status-message { color: #c2410c; }
        .status-card.red .status-message { color: #dc2626; }

        .progress-indicator {
          margin-top: 12px;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-fill {
          height: 100%;
          background: currentColor;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 12px;
          opacity: 0.8;
        }

        .details-section {
          border-top: 1px solid #e5e7eb;
          padding-top: 16px;
        }

        .marks-breakdown {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .breakdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 6px;
        }

        .breakdown-icon {
          font-size: 20px;
        }

        .breakdown-content {
          text-align: center;
        }

        .breakdown-number {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .breakdown-label {
          font-size: 12px;
          color: #6b7280;
        }

        .limitations-section,
        .recommendations-section {
          margin-bottom: 16px;
        }

        .limitations-section h4,
        .recommendations-section h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .limitations-list,
        .recommendations-list {
          margin: 0;
          padding-left: 16px;
        }

        .limitations-list li,
        .recommendations-list li {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .data-quality {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .quality-label {
          font-size: 14px;
          color: #374151;
          font-weight: 500;
        }

        .quality-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }

        .quality-badge.high {
          background: #d1fae5;
          color: #065f46;
        }

        .quality-badge.good {
          background: #eff6ff;
          color: #1e40af;
        }

        .quality-badge.moderate {
          background: #fef3c7;
          color: #92400e;
        }

        .quality-badge.limited {
          background: #fff7ed;
          color: #9a3412;
        }

        .quality-badge.very_limited {
          background: #fef2f2;
          color: #991b1b;
        }

        .action-section {
          border-top: 1px solid #e5e7eb;
          padding-top: 16px;
        }

        .action-message {
          font-size: 14px;
          color: #374151;
          text-align: center;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .marks-breakdown {
            grid-template-columns: 1fr;
          }

          .breakdown-item {
            justify-content: center;
          }

          .status-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}