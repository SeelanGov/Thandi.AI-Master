'use client';

import React from 'react';
import CircularProgress from '../ui/CircularProgress';

/**
 * Header Card Component - Academic Status Overview
 * 
 * Displays student's academic status with grade-specific context and visual indicators
 */
export default function HeaderCard({
  apsScore,
  projectedApsRange,
  universityEligible,
  gradeLevel,
  academicYear,
  currentTerm,
  studentStatus,
  hasMarks,
  statusMessage
}) {
  const gradeClass = `grade-${gradeLevel}`;
  const progressColor = `grade${gradeLevel}`;
  
  return (
    <div className={`card-base header-card ${gradeClass}`}>
      <div className="header-card-content">
          <h1 className="header-card-title">
            Grade {gradeLevel} Career Guidance
          </h1>
          <p className="header-card-subtitle">
            {studentStatus} • {statusMessage || `Academic Year ${academicYear}`}
          </p>
          
          <div className="header-card-stats">
            {/* APS Score Display */}
            <div className="header-stat">
              {apsScore !== null ? (
                <CircularProgress
                  value={apsScore}
                  max={50}
                  size={60}
                  color={progressColor}
                  label="APS"
                  showValue={true}
                  animated={true}
                />
              ) : (
                <div className="header-stat-placeholder">
                  <span className="header-stat-value">Building</span>
                  <span className="header-stat-label">Foundation</span>
                </div>
              )}
            </div>
            
            {/* University Eligibility */}
            <div className="header-stat">
              <span className="header-stat-value">
                {universityEligible ? '✅' : gradeLevel === 10 ? '🎯' : '⚠️'}
              </span>
              <span className="header-stat-label">
                {gradeLevel === 10 ? 'Exploring' : universityEligible ? 'Eligible' : 'Building'}
              </span>
            </div>
            
            {/* Academic Term */}
            <div className="header-stat">
              <span className="header-stat-value">{currentTerm}</span>
              <span className="header-stat-label">Current Term</span>
            </div>
            
            {/* Marks Status */}
            <div className="header-stat">
              <span className="header-stat-value">
                {hasMarks ? '📊' : '🌱'}
              </span>
              <span className="header-stat-label">
                {hasMarks ? 'Marks Available' : 'Building Record'}
              </span>
            </div>
          </div>
          
          {/* Projected APS Range for Grade 10/11 */}
          {projectedApsRange && gradeLevel < 12 && (
            <div className="projected-range">
              <h3>Projected APS Range</h3>
              <div className="range-display">
                <span className="range-min">{projectedApsRange.min}</span>
                <div className="range-bar">
                  <div className="range-fill" style={{
                    width: `${((projectedApsRange.max - projectedApsRange.min) / 50) * 100}%`,
                    marginLeft: `${(projectedApsRange.min / 50) * 100}%`
                  }}></div>
                </div>
                <span className="range-max">{projectedApsRange.max}</span>
              </div>
            </div>
          )}
        </div>
    </div>
  );
}