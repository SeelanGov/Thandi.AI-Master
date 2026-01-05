'use client';

import React from 'react';

/**
 * Professional Progress Bar Component
 * 
 * Displays progress with smooth animations, color coding, and accessibility features
 */
export default function ProgressBar({ 
  value, 
  max = 100, 
  color = 'primary', 
  size = 'md',
  showPercentage = true,
  showLabel = true,
  label,
  className = '',
  animated = true
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  // Color mapping
  const colorClasses = {
    primary: 'progress-primary',
    success: 'progress-success',
    warning: 'progress-warning',
    error: 'progress-error',
    info: 'progress-info',
    grade10: 'progress-grade10',
    grade11: 'progress-grade11',
    grade12: 'progress-grade12'
  };
  
  // Size mapping
  const sizeClasses = {
    sm: 'progress-sm',
    md: 'progress-md',
    lg: 'progress-lg'
  };
  
  const progressClass = `progress-bar ${colorClasses[color] || colorClasses.primary} ${sizeClasses[size]} ${animated ? 'progress-animated' : ''} ${className}`;
  
  return (
    <div className="progress-container">
      {showLabel && label && (
        <div className="progress-header">
          <span className="progress-label">{label}</span>
          {showPercentage && (
            <span className="progress-percentage">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      
      <div className={progressClass} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <div 
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {!showLabel && showPercentage && (
        <div className="progress-percentage-only">
          {Math.round(percentage)}%
        </div>
      )}

      <style jsx>{`
        .progress-container {
          width: 100%;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-2);
        }

        .progress-label {
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          color: var(--gray-700);
        }

        .progress-percentage {
          font-size: var(--text-sm);
          font-weight: var(--font-semibold);
          color: var(--gray-600);
          font-family: var(--font-mono);
        }

        .progress-percentage-only {
          text-align: center;
          margin-top: var(--space-1);
          font-size: var(--text-xs);
          font-weight: var(--font-semibold);
          color: var(--gray-600);
          font-family: var(--font-mono);
        }

        .progress-bar {
          width: 100%;
          background-color: var(--gray-200);
          border-radius: var(--border-radius-full);
          overflow: hidden;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          border-radius: var(--border-radius-full);
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .progress-animated .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* Size variants */
        .progress-sm {
          height: 4px;
        }

        .progress-md {
          height: 8px;
        }

        .progress-lg {
          height: 12px;
        }

        /* Color variants */
        .progress-primary .progress-fill {
          background: linear-gradient(90deg, var(--thandi-primary) 0%, var(--thandi-primary-light) 100%);
        }

        .progress-success .progress-fill {
          background: linear-gradient(90deg, var(--success) 0%, #34d399 100%);
        }

        .progress-warning .progress-fill {
          background: linear-gradient(90deg, var(--warning) 0%, #fbbf24 100%);
        }

        .progress-error .progress-fill {
          background: linear-gradient(90deg, var(--error) 0%, #f87171 100%);
        }

        .progress-info .progress-fill {
          background: linear-gradient(90deg, var(--info) 0%, #60a5fa 100%);
        }

        .progress-grade10 .progress-fill {
          background: linear-gradient(90deg, var(--grade-10-primary) 0%, #34d399 100%);
        }

        .progress-grade11 .progress-fill {
          background: linear-gradient(90deg, var(--grade-11-primary) 0%, #38bdf8 100%);
        }

        .progress-grade12 .progress-fill {
          background: linear-gradient(90deg, var(--grade-12-primary) 0%, #f87171 100%);
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          .progress-fill {
            transition: none;
          }
          
          .progress-animated .progress-fill::after {
            animation: none;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .progress-bar {
            border: 1px solid var(--gray-400);
          }
          
          .progress-fill {
            background: var(--gray-900) !important;
          }
        }
      `}</style>
    </div>
  );
}