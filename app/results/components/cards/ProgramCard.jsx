'use client';

import React, { useState } from 'react';
import ProgressBar from '../ui/ProgressBar';

/**
 * Program Card Component - University program information with visual indicators
 * 
 * Displays program details with feasibility indicators and grade-appropriate messaging
 */
export default function ProgramCard({
  program,
  university,
  apsRequired,
  studentApsRange,
  admissionChance,
  applicationDeadline,
  duration,
  requirements,
  feasibility,
  gradeLevel
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get feasibility class for styling
  const getFeasibilityClass = () => {
    switch (feasibility) {
      case 'High': return 'high-feasibility';
      case 'Medium': return 'medium-feasibility';
      case 'Low': return 'low-feasibility';
      case 'Exploratory': return 'exploratory-feasibility';
      default: return 'medium-feasibility';
    }
  };

  // Get progress color based on admission chance
  const getProgressColor = () => {
    if (admissionChance >= 70) return 'success';
    if (admissionChance >= 40) return 'warning';
    return 'error';
  };

  // Grade-specific messaging
  const getGradeSpecificMessage = () => {
    switch (gradeLevel) {
      case 10:
        return "Explore this field to understand if it interests you. You have time to confirm your subject choices.";
      case 11:
        return "Research this program thoroughly. Use this year to improve your marks and prepare applications.";
      case 12:
        return "Check application deadlines immediately. Focus on meeting requirements for this program.";
      default:
        return "Consider this program based on your interests and academic performance.";
    }
  };

  // APS comparison indicator
  const getAPSStatus = () => {
    if (!studentApsRange || !apsRequired) return null;
    
    const studentMax = studentApsRange.max;
    if (studentMax >= apsRequired) {
      return { status: 'meets', icon: '✅', message: 'You meet the requirement' };
    } else if (studentMax >= apsRequired - 3) {
      return { status: 'close', icon: '⚠️', message: 'Close to requirement' };
    } else {
      return { status: 'below', icon: '❌', message: 'Need improvement' };
    }
  };

  const apsStatus = getAPSStatus();

  return (
    <div className={`card-base program-card ${getFeasibilityClass()}`}>
        
      {/* Header with Feasibility Badge */}
      <div className="program-card-header">
        <div>
          <h3 className="program-card-title">{program}</h3>
          <p className="program-card-university">{university}</p>
        </div>
        
        <div className="feasibility-badge-container">
          <div className={`feasibility-badge ${feasibility.toLowerCase()}`}>
            {feasibility}
          </div>
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="expand-button"
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="program-card-metrics">
        
        {/* APS Requirement */}
        <div className="program-metric">
          <span className="program-metric-value">
            {apsRequired}
            {apsStatus && <span className="aps-status-icon">{apsStatus.icon}</span>}
          </span>
          <span className="program-metric-label">APS Required</span>
          {apsStatus && (
            <div className="aps-status-message">{apsStatus.message}</div>
          )}
        </div>

        {/* Admission Chance with Progress Bar */}
        <div className="program-metric">
          <span className="program-metric-value">{admissionChance}%</span>
          <span className="program-metric-label">Admission Chance</span>
          <div className="progress-container">
            <ProgressBar 
              value={admissionChance} 
              max={100} 
              color={getProgressColor()}
              size="sm"
              showPercentage={false}
              animated={true}
            />
          </div>
        </div>

        {/* Application Deadline */}
        <div className="program-metric">
          <span className="program-metric-value">{applicationDeadline}</span>
          <span className="program-metric-label">Deadline</span>
          <div className="duration-info">{duration}</div>
        </div>
      </div>

      {/* Grade-Specific Guidance */}
      <div className="grade-specific-guidance">
        <h4>Grade {gradeLevel} Guidance</h4>
        <p>{getGradeSpecificMessage()}</p>
      </div>

      {/* Subject Requirements */}
      {requirements && requirements.length > 0 && (
        <div className="program-card-requirements">
          <h4>Subject Requirements</h4>
          <div className="requirements-list">
            {requirements.map((req, index) => (
              <span key={index} className="requirement-chip">
                {req}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Expandable Details */}
      {isExpanded && (
        <div className="program-card-expanded">
          
          {/* Additional Information */}
          <div className="expanded-info">
            <div className="info-item">
              <h4>Program Duration</h4>
              <p>{duration}</p>
            </div>
            <div className="info-item">
              <h4>Institution</h4>
              <p>{university}</p>
            </div>
            {studentApsRange && (
              <div className="info-item">
                <h4>Your APS Range</h4>
                <p>{studentApsRange.min} - {studentApsRange.max}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="action-button action-button-primary">
              Research Program
            </button>
            <button className="action-button action-button-secondary">
              Visit University
            </button>
            {gradeLevel >= 11 && (
              <button className="action-button action-button-success">
                Add to Shortlist
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}