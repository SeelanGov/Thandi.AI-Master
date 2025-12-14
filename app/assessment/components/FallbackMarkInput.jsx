'use client';

import { useState } from 'react';
import MarkInput from './MarkInput';
import { FallbackManager } from '../../../lib/marks/FallbackManager.js';

/**
 * FallbackMarkInput - Enhanced mark input with fallback options
 * 
 * This component extends the basic MarkInput with graceful fallback options
 * for when students don't know their exact marks or encounter technical issues.
 * 
 * Requirements: 9.1, 9.2, 9.3
 */

export default function FallbackMarkInput({
  subjectId,
  subjectName,
  value,
  onChange,
  grade,
  showAPSContribution = false,
  onFocus,
  onBlur,
  autoFocus = false,
  disabled = false
}) {
  const [showFallbackOptions, setShowFallbackOptions] = useState(false);
  const [selectedFallback, setSelectedFallback] = useState(null);
  const [estimateLevel, setEstimateLevel] = useState(null);
  const fallbackManager = new FallbackManager();

  // Check if current value is a fallback
  const isFallback = value && value.isFallback;
  const hasExactMark = value && value.validationState === 'valid' && !value.isFallback;

  const handleFallbackSelect = (fallbackType) => {
    setSelectedFallback(fallbackType);
    
    if (fallbackType === fallbackManager.fallbackOptions.ESTIMATE) {
      // Show estimate level selection
      return;
    }
    
    // Create fallback mark immediately for other types
    const fallbackMark = fallbackManager.createFallbackMark(subjectId, fallbackType);
    onChange(subjectId, fallbackMark);
    setShowFallbackOptions(false);
  };

  const handleEstimateLevelSelect = (level) => {
    setEstimateLevel(level);
    
    const fallbackMark = fallbackManager.createFallbackMark(
      subjectId, 
      fallbackManager.fallbackOptions.ESTIMATE,
      { estimateLevel: level }
    );
    
    onChange(subjectId, fallbackMark);
    setShowFallbackOptions(false);
    setSelectedFallback(null);
    setEstimateLevel(null);
  };

  const handleClearFallback = () => {
    onChange(subjectId, null);
    setShowFallbackOptions(false);
    setSelectedFallback(null);
    setEstimateLevel(null);
  };

  const fallbackOptions = fallbackManager.getFallbackOptions(subjectName);
  const estimateLevelOptions = fallbackManager.getEstimateLevelOptions();

  return (
    <div className="fallback-mark-input">
      {!isFallback ? (
        // Show normal mark input
        <div className="mark-input-section">
          <MarkInput
            subjectId={subjectId}
            subjectName={subjectName}
            value={value}
            onChange={onChange}
            grade={grade}
            showAPSContribution={showAPSContribution}
            onFocus={onFocus}
            onBlur={onBlur}
            autoFocus={autoFocus}
            disabled={disabled}
          />
          
          {!hasExactMark && (
            <div className="fallback-trigger">
              <button
                type="button"
                onClick={() => setShowFallbackOptions(true)}
                className="fallback-button"
              >
                Don't know your mark? 🤔
              </button>
            </div>
          )}
        </div>
      ) : (
        // Show fallback display
        <div className="fallback-display">
          <div className="fallback-header">
            <label className="mark-label">{subjectName}</label>
            <span className="fallback-badge">
              {value.fallbackType === 'estimate' ? '📊 Estimate' : '❓ Unknown'}
            </span>
          </div>
          
          <div className="fallback-content">
            <div className="fallback-value">
              {value.displayValue}
            </div>
            
            <div className="fallback-message">
              {value.message}
            </div>
            
            {value.limitations && value.limitations.length > 0 && (
              <div className="fallback-limitations">
                <strong>Note:</strong>
                <ul>
                  {value.limitations.map((limitation, index) => (
                    <li key={index}>{limitation}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="fallback-actions">
              <button
                type="button"
                onClick={handleClearFallback}
                className="change-button"
              >
                Enter exact mark instead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fallback Options Modal */}
      {showFallbackOptions && (
        <div className="fallback-modal">
          <div className="modal-overlay" onClick={() => setShowFallbackOptions(false)} />
          <div className="modal-content">
            <div className="modal-header">
              <h3>What would you like to do for {subjectName}?</h3>
              <button
                onClick={() => setShowFallbackOptions(false)}
                className="close-button"
              >
                ×
              </button>
            </div>
            
            {selectedFallback === fallbackManager.fallbackOptions.ESTIMATE ? (
              // Show estimate level selection
              <div className="estimate-levels">
                <h4>How would you rate your performance in {subjectName}?</h4>
                <div className="estimate-options">
                  {estimateLevelOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleEstimateLevelSelect(option.id)}
                      className="estimate-option"
                    >
                      <div className="estimate-label">{option.label}</div>
                      <div className="estimate-description">{option.description}</div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setSelectedFallback(null)}
                  className="back-button"
                >
                  ← Back to options
                </button>
              </div>
            ) : (
              // Show main fallback options
              <div className="fallback-options">
                {fallbackOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleFallbackSelect(option.id)}
                    className={`fallback-option ${option.recommended ? 'recommended' : ''}`}
                  >
                    <div className="option-icon">{option.icon}</div>
                    <div className="option-content">
                      <div className="option-label">{option.label}</div>
                      <div className="option-description">{option.description}</div>
                    </div>
                    {option.recommended && (
                      <div className="recommended-badge">Recommended</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .fallback-mark-input {
          position: relative;
        }

        .mark-input-section {
          position: relative;
        }

        .fallback-trigger {
          margin-top: 8px;
          text-align: center;
        }

        .fallback-button {
          background: none;
          border: 1px dashed #d1d5db;
          color: #6b7280;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .fallback-button:hover {
          border-color: #3b82f6;
          color: #3b82f6;
          background: #eff6ff;
        }

        .fallback-display {
          border: 2px solid #fbbf24;
          border-radius: 8px;
          padding: 16px;
          background: #fffbeb;
        }

        .fallback-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .mark-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .fallback-badge {
          background: #fbbf24;
          color: #92400e;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .fallback-value {
          font-size: 18px;
          font-weight: 600;
          color: #92400e;
          margin-bottom: 8px;
        }

        .fallback-message {
          font-size: 14px;
          color: #78350f;
          margin-bottom: 12px;
        }

        .fallback-limitations {
          background: #fef3c7;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 12px;
        }

        .fallback-limitations strong {
          color: #92400e;
          font-size: 13px;
        }

        .fallback-limitations ul {
          margin: 8px 0 0 0;
          padding-left: 16px;
        }

        .fallback-limitations li {
          font-size: 12px;
          color: #78350f;
          margin-bottom: 4px;
        }

        .fallback-actions {
          text-align: center;
        }

        .change-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .change-button:hover {
          background: #2563eb;
        }

        .fallback-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 24px;
          max-width: 500px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          color: #1f2937;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          color: #6b7280;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-button:hover {
          color: #374151;
        }

        .fallback-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .fallback-option {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          position: relative;
        }

        .fallback-option:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .fallback-option.recommended {
          border-color: #10b981;
          background: #f0fdf4;
        }

        .option-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .option-content {
          flex: 1;
        }

        .option-label {
          font-weight: 500;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .option-description {
          font-size: 14px;
          color: #6b7280;
        }

        .recommended-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #10b981;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
        }

        .estimate-levels h4 {
          margin: 0 0 16px 0;
          font-size: 16px;
          color: #1f2937;
        }

        .estimate-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .estimate-option {
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .estimate-option:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .estimate-label {
          font-weight: 500;
          color: #1f2937;
          margin-bottom: 2px;
        }

        .estimate-description {
          font-size: 13px;
          color: #6b7280;
        }

        .back-button {
          background: #6b7280;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .back-button:hover {
          background: #4b5563;
        }

        @media (max-width: 768px) {
          .modal-content {
            margin: 16px;
            padding: 20px;
          }

          .fallback-option {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .option-icon {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
}