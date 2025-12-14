'use client';

import { useState, useEffect } from 'react';
import { APSCalculator } from '../../../lib/marks/APSCalculator.js';

/**
 * APSDisplay - Real-time APS score display with university context
 * 
 * Features:
 * - Real-time APS calculation as marks are entered
 * - University requirement context and comparison
 * - Improvement target suggestions
 * - Grade-specific messaging (trajectory vs current prospects)
 * - APS breakdown showing contribution per subject
 * 
 * Requirements: 3.2, 3.4, 7.5
 */

export default function APSDisplay({ 
  marks, 
  grade, 
  curriculumFramework = 'CAPS',
  onAPSUpdate,
  showBreakdown = true,
  showImprovements = true 
}) {
  const [apsResult, setAPSResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const calculator = new APSCalculator();

  // Calculate APS whenever marks change
  useEffect(() => {
    if (!marks || Object.keys(marks).length === 0) {
      setAPSResult(null);
      if (onAPSUpdate) onAPSUpdate(null);
      return;
    }

    setIsCalculating(true);
    
    // Small delay to avoid excessive calculations during typing
    const timeoutId = setTimeout(() => {
      try {
        const result = calculator.calculateAPS(marks, grade, curriculumFramework);
        setAPSResult(result);
        if (onAPSUpdate) onAPSUpdate(result);
      } catch (error) {
        console.error('APS calculation error:', error);
        setAPSResult({ error: error.message, isValid: false });
      } finally {
        setIsCalculating(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [marks, grade, curriculumFramework, onAPSUpdate]);

  if (!apsResult) {
    return (
      <div className="aps-display placeholder">
        <div className="aps-header">
          <h3>APS Score</h3>
          <p className="aps-subtitle">Enter marks to calculate your Admission Point Score</p>
        </div>
        
        <style jsx>{`
          .aps-display.placeholder {
            background: #f9fafb;
            border: 2px dashed #d1d5db;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            margin: 16px 0;
          }
          
          .aps-header h3 {
            margin: 0 0 8px 0;
            color: #6b7280;
            font-size: 18px;
          }
          
          .aps-subtitle {
            margin: 0;
            color: #9ca3af;
            font-size: 14px;
          }
        `}</style>
      </div>
    );
  }

  if (apsResult.error || !apsResult.isValid) {
    return (
      <div className="aps-display error">
        <div className="aps-header">
          <h3>APS Calculation</h3>
          <p className="error-message">
            {apsResult.error || 'Need at least 6 valid subject marks for APS calculation'}
          </p>
        </div>
        
        <style jsx>{`
          .aps-display.error {
            background: #fef2f2;
            border: 2px solid #fecaca;
            border-radius: 12px;
            padding: 24px;
            margin: 16px 0;
          }
          
          .aps-header h3 {
            margin: 0 0 8px 0;
            color: #dc2626;
            font-size: 18px;
          }
          
          .error-message {
            margin: 0;
            color: #dc2626;
            font-size: 14px;
          }
        `}</style>
      </div>
    );
  }

  const getAPSScoreColor = (score, maxPossible) => {
    const percentage = (score / maxPossible) * 100;
    if (percentage >= 80) return 'excellent';
    if (percentage >= 70) return 'good';
    if (percentage >= 60) return 'average';
    return 'needs-improvement';
  };

  const scoreColor = getAPSScoreColor(apsResult.totalScore, apsResult.maxPossible);

  return (
    <div className="aps-display">
      {isCalculating && (
        <div className="calculating-overlay">
          <div className="spinner"></div>
        </div>
      )}
      
      <div className="aps-header">
        <div className="aps-score-section">
          <div className={`aps-score ${scoreColor}`}>
            <span className="score-number">{apsResult.totalScore}</span>
            <span className="score-max">/ {apsResult.maxPossible}</span>
          </div>
          <div className="aps-label">
            <h3>Your APS Score</h3>
            <p className="grade-context">{apsResult.gradeContext?.message}</p>
          </div>
        </div>
        
        <div className="aps-prospects">
          <span className={`prospects-badge ${scoreColor}`}>
            {apsResult.gradeContext?.prospects}
          </span>
        </div>
      </div>

      {showBreakdown && (
        <div className="aps-breakdown">
          <h4>Subject Breakdown</h4>
          <div className="breakdown-grid">
            {Object.entries(apsResult.breakdown).map(([subject, data]) => (
              <div key={subject} className="breakdown-item">
                <div className="subject-name">
                  {subject.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div className="subject-score">
                  <span className="mark">{data.mark}%</span>
                  <span className="aps-points">→ {data.apsPoints} pts</span>
                </div>
                {data.excludedFromAPS && (
                  <div className="excluded-note">Not counted in APS</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="university-requirements">
        <h4>University Access</h4>
        <div className="requirements-grid">
          {Object.entries(apsResult.universityRequirements)
            .filter(([_, req]) => req.accessible || req.gap <= 10)
            .slice(0, 4)
            .map(([field, req]) => (
            <div key={field} className={`requirement-item ${req.accessible ? 'accessible' : 'needs-improvement'}`}>
              <div className="field-name">
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </div>
              <div className="requirement-status">
                {req.accessible ? (
                  <span className="accessible">✓ Accessible</span>
                ) : (
                  <span className="gap">Need +{req.gap} points</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showImprovements && apsResult.improvementScenarios.length > 0 && (
        <div className="improvement-scenarios">
          <h4>Quick Wins</h4>
          <div className="scenarios-list">
            {apsResult.improvementScenarios.slice(0, 3).map((scenario, index) => (
              <div key={index} className="scenario-item">
                <div className="scenario-description">
                  <strong>{scenario.subject.replace(/_/g, ' ')}</strong>: 
                  {scenario.currentMark}% → {scenario.targetMark}%
                </div>
                <div className="scenario-benefit">
                  <span className="aps-gain">+{scenario.apsGain} APS</span>
                  <span className="timeframe">{scenario.timeframe}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="aps-context">
        <div className="context-item">
          <strong>Timeline:</strong> {apsResult.gradeContext?.timeline}
        </div>
        <div className="context-item">
          <strong>Focus:</strong> {apsResult.gradeContext?.focus}
        </div>
      </div>

      <style jsx>{`
        .aps-display {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          margin: 16px 0;
          position: relative;
        }

        .calculating-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          z-index: 1;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 2px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .aps-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .aps-score-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .aps-score {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .score-number {
          font-size: 48px;
          font-weight: bold;
          line-height: 1;
        }

        .score-max {
          font-size: 24px;
          color: #6b7280;
        }

        .aps-score.excellent .score-number { color: #059669; }
        .aps-score.good .score-number { color: #0891b2; }
        .aps-score.average .score-number { color: #d97706; }
        .aps-score.needs-improvement .score-number { color: #dc2626; }

        .aps-label h3 {
          margin: 0 0 4px 0;
          font-size: 18px;
          color: #1f2937;
        }

        .grade-context {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
          max-width: 300px;
        }

        .prospects-badge {
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          text-align: center;
        }

        .prospects-badge.excellent {
          background: #d1fae5;
          color: #065f46;
        }

        .prospects-badge.good {
          background: #cffafe;
          color: #0c4a6e;
        }

        .prospects-badge.average {
          background: #fef3c7;
          color: #92400e;
        }

        .prospects-badge.needs-improvement {
          background: #fee2e2;
          color: #991b1b;
        }

        .aps-breakdown {
          margin-bottom: 24px;
        }

        .aps-breakdown h4 {
          margin: 0 0 12px 0;
          font-size: 16px;
          color: #1f2937;
        }

        .breakdown-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 8px;
        }

        .breakdown-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #f9fafb;
          border-radius: 6px;
          font-size: 14px;
        }

        .subject-name {
          font-weight: 500;
          color: #374151;
        }

        .subject-score {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mark {
          color: #6b7280;
        }

        .aps-points {
          color: #3b82f6;
          font-weight: 500;
        }

        .excluded-note {
          font-size: 11px;
          color: #9ca3af;
          font-style: italic;
        }

        .university-requirements {
          margin-bottom: 24px;
        }

        .university-requirements h4 {
          margin: 0 0 12px 0;
          font-size: 16px;
          color: #1f2937;
        }

        .requirements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 8px;
        }

        .requirement-item {
          padding: 12px;
          border-radius: 6px;
          text-align: center;
        }

        .requirement-item.accessible {
          background: #d1fae5;
          border: 1px solid #a7f3d0;
        }

        .requirement-item.needs-improvement {
          background: #fef3c7;
          border: 1px solid #fde68a;
        }

        .field-name {
          font-weight: 500;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .requirement-status {
          font-size: 12px;
        }

        .accessible {
          color: #065f46;
        }

        .gap {
          color: #92400e;
        }

        .improvement-scenarios {
          margin-bottom: 24px;
        }

        .improvement-scenarios h4 {
          margin: 0 0 12px 0;
          font-size: 16px;
          color: #1f2937;
        }

        .scenarios-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .scenario-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #eff6ff;
          border-radius: 6px;
          font-size: 14px;
        }

        .scenario-description {
          color: #1e40af;
        }

        .scenario-benefit {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .aps-gain {
          background: #3b82f6;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .timeframe {
          color: #6b7280;
          font-size: 12px;
        }

        .aps-context {
          border-top: 1px solid #e5e7eb;
          padding-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .context-item {
          font-size: 14px;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .aps-header {
            flex-direction: column;
            gap: 16px;
          }

          .aps-score-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .breakdown-grid,
          .requirements-grid {
            grid-template-columns: 1fr;
          }

          .scenario-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}