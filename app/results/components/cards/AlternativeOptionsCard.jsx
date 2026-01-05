'use client';

import React, { useState } from 'react';

/**
 * AlternativeOptionsCard Component - Backup and alternative pathway options
 * Displays alternative programs and pathways with grade-appropriate messaging
 */
export default function AlternativeOptionsCard({ options = [], gradeLevel }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!options || options.length === 0) {
    return null;
  }

  // Grade-specific messaging for alternatives
  const getGradeSpecificMessage = () => {
    switch (gradeLevel) {
      case 10:
        return {
          title: "Additional Career Paths to Explore",
          subtitle: "You have time to explore these options alongside your main interests",
          description: "As a Grade 10 student, these alternatives can help you understand the full range of career possibilities. Use this year to explore broadly."
        };
      case 11:
        return {
          title: "Strategic Backup Options", 
          subtitle: "Smart alternatives to consider in your planning",
          description: "These options provide excellent backup plans while you work toward your primary goals. Research these thoroughly as part of your strategic planning."
        };
      case 12:
        return {
          title: "Essential Backup Plans",
          subtitle: "Critical alternatives if your first choices don't work out", 
          description: "These are important safety nets for your university applications. Ensure you apply to some of these options to guarantee your future."
        };
      default:
        return {
          title: "Alternative Options",
          subtitle: "Additional pathways to consider",
          description: "These alternatives provide different routes to achieve your career goals."
        };
    }
  };

  const messaging = getGradeSpecificMessage();

  // Simplified program card for alternatives
  const AlternativeProgramCard = ({ program, index }) => {
    return (
      <div className="alternative-program-card">
        <div className="program-header">
          <div className="program-info">
            <h4 className="program-title">{program.program}</h4>
            <p className="program-university">{program.university}</p>
            
            <div className="program-metrics">
              <span>APS: {program.apsRequired}</span>
              <span>•</span>
              <span>{program.admissionProbability}% chance</span>
              <span>•</span>
              <span>{program.duration}</span>
            </div>
          </div>
          
          <div className="program-feasibility">
            <div className={`feasibility-badge feasibility-${program.feasibility?.toLowerCase() || 'medium'}`}>
              {program.feasibility || 'Medium'}
            </div>
          </div>
        </div>

        {/* Subject requirements */}
        {program.subjectRequirements && program.subjectRequirements.length > 0 && (
          <div className="program-requirements">
            <div className="requirements-chips">
              {program.subjectRequirements.slice(0, 3).map((req, reqIndex) => (
                <span key={reqIndex} className="requirement-chip">
                  {req}
                </span>
              ))}
              {program.subjectRequirements.length > 3 && (
                <span className="requirement-chip requirement-chip-more">
                  +{program.subjectRequirements.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Grade-specific note */}
        <div className="program-note">
          <p className="note-text">
            {gradeLevel === 10 && "Good option to research and understand"}
            {gradeLevel === 11 && "Consider as backup while pursuing primary goals"}
            {gradeLevel === 12 && "Apply to this as a safety option"}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className={`card-base alternative-options-card grade-${gradeLevel}-theme`}>
      
      {/* Header */}
      <div className="card-header-section">
        <div className="header-content">
          <div className="card-icon-badge">
            <span className="card-icon">🔄</span>
            <div className="card-badge badge-secondary">
              ALTERNATIVES
            </div>
          </div>
          <h2 className="card-title">{messaging.title}</h2>
          <p className="card-subtitle">{messaging.subtitle}</p>
        </div>
        
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="expand-toggle-button"
          aria-label={isExpanded ? 'Collapse alternatives' : 'Expand alternatives'}
        >
          <span className="expand-icon">{isExpanded ? '−' : '+'}</span>
        </button>
      </div>

      {/* Description */}
      <div className="info-banner">
        <div className="info-content">
          <span className="info-icon">💡</span>
          <div className="info-text">
            <h3 className="info-title">Why Consider Alternatives?</h3>
            <p className="info-description">{messaging.description}</p>
          </div>
        </div>
      </div>

      {/* Options Preview (always show first 2) */}
      <div className="alternatives-preview">
        {options.slice(0, 2).map((option, index) => (
          <AlternativeProgramCard key={index} program={option} index={index} />
        ))}
      </div>

      {/* Expandable Additional Options */}
      {isExpanded && options.length > 2 && (
        <div className="alternatives-expanded">
          <h3 className="section-title">Additional Alternatives</h3>
          <div className="alternatives-list">
            {options.slice(2).map((option, index) => (
              <AlternativeProgramCard key={index + 2} program={option} index={index + 2} />
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <p className="stat-value">{options.length}</p>
            <p className="stat-label">Alternative Options</p>
          </div>
          <div className="stat-item">
            <p className="stat-value">
              {Math.round(options.reduce((sum, opt) => sum + opt.admissionProbability, 0) / options.length)}%
            </p>
            <p className="stat-label">Avg. Admission Chance</p>
          </div>
          <div className="stat-item">
            <p className="stat-value">
              {Math.min(...options.map(opt => opt.apsRequired))}
            </p>
            <p className="stat-label">Lowest APS Required</p>
          </div>
        </div>
      </div>

      {/* Grade-Specific Action Guidance */}
      <div className="guidance-banner">
        <div className="guidance-content">
          <span className="guidance-icon">📋</span>
          <div className="guidance-text">
            <h3 className="guidance-title">Grade {gradeLevel} Action Plan</h3>
            <div className="guidance-list">
              {gradeLevel === 10 && (
                <>
                  <p>• Research these alternatives to understand different career paths</p>
                  <p>• Talk to professionals in these fields</p>
                  <p>• Keep your subject choices flexible to maintain these options</p>
                </>
              )}
              {gradeLevel === 11 && (
                <>
                  <p>• Research admission requirements for these backup options</p>
                  <p>• Ensure your current subjects support these alternatives</p>
                  <p>• Visit universities offering these programs</p>
                </>
              )}
              {gradeLevel === 12 && (
                <>
                  <p>• Apply to at least 2-3 of these alternatives as safety options</p>
                  <p>• Ensure you meet all application deadlines</p>
                  <p>• Prepare backup plans if your first choices don't work out</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="quick-actions-section">
        <div className="quick-actions-grid">
          <button className="action-button action-button-primary">
            Research All Options
          </button>
          <button className="action-button action-button-success">
            Compare Programs
          </button>
          {gradeLevel >= 11 && (
            <button className="action-button action-button-warning">
              Add to Application List
            </button>
          )}
          <button className="action-button action-button-secondary">
            Save Alternatives
          </button>
        </div>
      </div>

      {/* Collapse indicator */}
      {!isExpanded && options.length > 2 && (
        <div className="collapse-indicator">
          <p className="collapse-text">
            +{options.length - 2} more alternatives available
          </p>
        </div>
      )}
    </div>
  );
}