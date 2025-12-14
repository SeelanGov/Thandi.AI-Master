'use client';

import { useState, useEffect, useRef } from 'react';
import { MarkValidator } from '../../../lib/marks/MarkValidator.js';

/**
 * MarkInput - Individual mark input field with real-time validation
 * 
 * Features:
 * - Real-time validation for percentages (0-100) and grade symbols (A+ to F)
 * - Visual feedback (green/amber/red) based on mark quality
 * - Auto-focus progression between fields
 * - Support for both percentage and symbol input formats
 * 
 * Requirements: 6.1, 6.2, 2.1, 2.2
 */

export default function MarkInput({ 
  subjectId, 
  subjectName, 
  value, 
  onChange, 
  grade, 
  validationState = 'valid',
  showAPSContribution = false,
  onFocus,
  onBlur,
  autoFocus = false,
  disabled = false
}) {
  const [inputValue, setInputValue] = useState(value?.rawInput || '');
  const [validationResult, setValidationResult] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const validator = useRef(new MarkValidator()).current;

  // Auto-focus when requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Validate input in real-time
  useEffect(() => {
    if (inputValue.trim() === '') {
      setValidationResult(null);
      onChange(subjectId, null);
      return;
    }

    const result = validator.validateMark(inputValue, 'auto');
    setValidationResult(result);
    
    if (result.isValid) {
      onChange(subjectId, {
        rawInput: inputValue,
        normalizedValue: result.normalizedValue,
        format: result.format,
        validationState: 'valid',
        performanceLevel: validator.getPerformanceLevel(result.normalizedValue),
        visualFeedback: validator.getVisualFeedback(result.normalizedValue)
      });
    } else {
      onChange(subjectId, {
        rawInput: inputValue,
        normalizedValue: null,
        format: null,
        validationState: 'invalid',
        errors: result.errors
      });
    }
  }, [inputValue, subjectId, onChange, validator]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const handleKeyDown = (e) => {
    // Auto-focus progression: Tab or Enter moves to next field
    if (e.key === 'Enter' && validationResult?.isValid) {
      e.preventDefault();
      // Find next mark input field and focus it
      const form = e.target.closest('form') || e.target.closest('.subject-selection');
      if (form) {
        const inputs = form.querySelectorAll('input[data-mark-input]');
        const currentIndex = Array.from(inputs).indexOf(e.target);
        const nextInput = inputs[currentIndex + 1];
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  // Determine visual feedback
  const getInputClassName = () => {
    let className = 'mark-input';
    
    if (disabled) {
      className += ' disabled';
    } else if (isFocused) {
      className += ' focused';
    }
    
    if (validationResult) {
      if (validationResult.isValid) {
        const feedback = validator.getVisualFeedback(validationResult.normalizedValue);
        className += ` valid ${feedback}`;
      } else {
        className += ' invalid';
      }
    }
    
    return className;
  };

  // Get performance indicator
  const getPerformanceIndicator = () => {
    if (!validationResult?.isValid) return null;
    
    const level = validator.getPerformanceLevel(validationResult.normalizedValue);
    const indicators = {
      'good': { emoji: '🟢', text: 'Good' },
      'average': { emoji: '🟡', text: 'Average' },
      'concerning': { emoji: '🟠', text: 'Needs work' },
      'poor': { emoji: '🔴', text: 'Requires attention' }
    };
    
    return indicators[level];
  };

  // Get APS contribution (for Grade 11-12 students)
  const getAPSContribution = () => {
    if (!showAPSContribution || !validationResult?.isValid || grade < 11) {
      return null;
    }
    
    // Simple APS calculation: 7 for 80%+, 6 for 70-79%, 5 for 60-69%, etc.
    const mark = validationResult.normalizedValue;
    let apsPoints = 0;
    if (mark >= 80) apsPoints = 7;
    else if (mark >= 70) apsPoints = 6;
    else if (mark >= 60) apsPoints = 5;
    else if (mark >= 50) apsPoints = 4;
    else if (mark >= 40) apsPoints = 3;
    else if (mark >= 30) apsPoints = 2;
    else apsPoints = 1;
    
    return apsPoints;
  };

  const performanceIndicator = getPerformanceIndicator();
  const apsContribution = getAPSContribution();

  return (
    <div className="mark-input-container">
      <div className="mark-input-header">
        <label htmlFor={`mark-${subjectId}`} className="mark-label">
          {subjectName}
        </label>
        {performanceIndicator && (
          <span className="performance-indicator">
            {performanceIndicator.emoji} {performanceIndicator.text}
          </span>
        )}
      </div>
      
      <div className="mark-input-wrapper">
        <input
          ref={inputRef}
          id={`mark-${subjectId}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={getInputClassName()}
          placeholder="75% or B+"
          disabled={disabled}
          data-mark-input="true"
          aria-describedby={`mark-${subjectId}-help`}
        />
        
        {apsContribution && (
          <div className="aps-contribution">
            APS: {apsContribution}
          </div>
        )}
      </div>
      
      <div id={`mark-${subjectId}-help`} className="mark-input-help">
        {validationResult?.errors?.length > 0 ? (
          <div className="error-message">
            {validationResult.errors[0]}
          </div>
        ) : (
          <div className="help-text">
            Enter percentage (0-100%) or grade symbol (A+ to F)
          </div>
        )}
      </div>

      <style jsx>{`
        .mark-input-container {
          margin-bottom: 16px;
        }

        .mark-input-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .mark-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .performance-indicator {
          font-size: 12px;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .mark-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mark-input {
          width: 100%;
          padding: 8px 12px;
          border: 2px solid #e5e7eb;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.2s;
          background: white;
        }

        .mark-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .mark-input.focused {
          border-color: #3b82f6;
        }

        .mark-input.valid.green {
          border-color: #10b981;
          background: #f0fdf4;
        }

        .mark-input.valid.amber {
          border-color: #f59e0b;
          background: #fffbeb;
        }

        .mark-input.valid.orange {
          border-color: #f97316;
          background: #fff7ed;
        }

        .mark-input.valid.red {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .mark-input.invalid {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .mark-input.disabled {
          background: #f9fafb;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .aps-contribution {
          background: #eff6ff;
          color: #1e40af;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
        }

        .mark-input-help {
          margin-top: 4px;
          min-height: 20px;
        }

        .help-text {
          font-size: 12px;
          color: #6b7280;
        }

        .error-message {
          font-size: 12px;
          color: #dc2626;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .error-message::before {
          content: '⚠️';
        }

        @media (max-width: 768px) {
          .mark-input-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 2px;
          }

          .performance-indicator {
            font-size: 11px;
          }

          .mark-input {
            font-size: 16px; /* Prevent zoom on iOS */
          }
        }
      `}</style>
    </div>
  );
}