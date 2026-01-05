'use client';

import React from 'react';

/**
 * Circular Progress Component
 * 
 * Professional circular progress indicator for APS scores and key metrics
 */
export default function CircularProgress({ 
  value, 
  max = 100, 
  size = 80,
  strokeWidth = 8,
  color = 'primary',
  showValue = true,
  showLabel = true,
  label,
  className = '',
  animated = true
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  // Thandi Brand Color mapping
  const colorMap = {
    primary: 'var(--thandi-teal)',
    success: 'var(--thandi-teal-light)',
    warning: 'var(--thandi-gold)',
    error: 'var(--thandi-brown)',
    info: 'var(--thandi-teal-mid)',
    grade10: 'var(--thandi-teal-light)',
    grade11: 'var(--thandi-teal-mid)',
    grade12: 'var(--thandi-brown)'
  };
  
  const strokeColor = colorMap[color] || colorMap.primary;
  
  return (
    <div className={`circular-progress ${className}`}>
      <div className="circular-progress-container" style={{ width: size, height: size }}>
        <svg 
          width={size} 
          height={size} 
          className="circular-progress-svg"
          role="img"
          aria-label={label ? `${label}: ${value} out of ${max}` : `Progress: ${Math.round(percentage)}%`}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--gray-200)"
            strokeWidth={strokeWidth}
            fill="none"
            className="circular-progress-bg"
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={animated ? strokeDashoffset : circumference}
            strokeLinecap="round"
            className="circular-progress-fill"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        
        {/* Center content */}
        <div className="circular-progress-content">
          {showValue && (
            <div className="circular-progress-value">
              <span className="value">{value}</span>
              <span className="max">/{max}</span>
            </div>
          )}
          {showLabel && label && (
            <div className="circular-progress-label">{label}</div>
          )}
        </div>
      </div>

      <style jsx>{`
        .circular-progress {
          display: inline-block;
          position: relative;
        }

        .circular-progress-container {
          position: relative;
          display: inline-block;
        }

        .circular-progress-svg {
          transform: rotate(0deg);
        }

        .circular-progress-fill {
          transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .circular-progress-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          pointer-events: none;
        }

        .circular-progress-value {
          font-family: var(--font-mono);
          font-weight: var(--font-bold);
          line-height: var(--leading-tight);
        }

        .value {
          font-size: ${size > 100 ? 'var(--text-xl)' : size > 60 ? 'var(--text-lg)' : 'var(--text-base)'};
          color: var(--gray-900);
        }

        .max {
          font-size: ${size > 100 ? 'var(--text-sm)' : size > 60 ? 'var(--text-xs)' : '10px'};
          color: var(--gray-500);
        }

        .circular-progress-label {
          font-size: var(--text-xs);
          color: var(--gray-600);
          margin-top: var(--space-1);
          font-weight: var(--font-medium);
        }

        /* Animation variants */
        .circular-progress.animated .circular-progress-fill {
          animation: drawCircle 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes drawCircle {
          from {
            stroke-dashoffset: ${circumference};
          }
          to {
            stroke-dashoffset: ${strokeDashoffset};
          }
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          .circular-progress-fill {
            transition: none;
          }
          
          .circular-progress.animated .circular-progress-fill {
            animation: none;
            stroke-dashoffset: ${strokeDashoffset};
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .circular-progress-bg {
            stroke: var(--gray-400);
            stroke-width: ${strokeWidth + 1}px;
          }
          
          .circular-progress-fill {
            stroke: var(--gray-900) !important;
            stroke-width: ${strokeWidth + 1}px;
          }
        }
      `}</style>
    </div>
  );
}