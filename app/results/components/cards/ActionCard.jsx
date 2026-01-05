'use client';

import React, { useState } from 'react';

/**
 * ActionCard Component - Prioritized next steps with timeline context
 * Displays grade-specific action items with urgency indicators and timelines
 */
export default function ActionCard({
  urgency = 'MEDIUM',
  timeline,
  actionItems = [],
  gradeSpecificGuidance = [],
  currentFocus,
  gradeLevel,
  focusAreas = []
}) {
  const [expandedItems, setExpandedItems] = useState(new Set());

  // Urgency configuration
  const getUrgencyConfig = () => {
    const configs = {
      'HIGH': {
        bgGradient: 'from-red-50 to-pink-100',
        borderColor: 'border-red-500',
        accentColor: 'bg-red-500',
        textColor: 'text-red-700',
        icon: '🚨'
      },
      'MEDIUM': {
        bgGradient: 'from-yellow-50 to-orange-100',
        borderColor: 'border-yellow-500', 
        accentColor: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        icon: '⚠️'
      },
      'LOW': {
        bgGradient: 'from-green-50 to-emerald-100',
        borderColor: 'border-green-500',
        accentColor: 'bg-green-500', 
        textColor: 'text-green-700',
        icon: '📋'
      }
    };
    return configs[urgency] || configs['MEDIUM'];
  };

  const config = getUrgencyConfig();

  // Grade-specific timeline styling
  const getTimelineConfig = () => {
    switch (gradeLevel) {
      case 10:
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          phase: 'Foundation Phase'
        };
      case 11:
        return {
          color: 'text-green-600', 
          bgColor: 'bg-green-100',
          phase: 'Strategic Phase'
        };
      case 12:
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-100', 
          phase: 'Critical Phase'
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          phase: 'Planning Phase'
        };
    }
  };

  const timelineConfig = getTimelineConfig();

  // Toggle expanded state for action items
  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  // Priority indicator component
  const PriorityIndicator = ({ level, index }) => {
    const priorityConfig = {
      1: { color: 'priority-critical', label: 'Critical' },
      2: { color: 'priority-high', label: 'High' },
      3: { color: 'priority-medium', label: 'Medium' },
      4: { color: 'priority-low', label: 'Low' }
    };
    
    const priority = priorityConfig[Math.min(index + 1, 4)] || priorityConfig[4];
    
    return (
      <div className="priority-indicator">
        <div className={`priority-number ${priority.color}`}>
          {index + 1}
        </div>
        <span className="priority-label">{priority.label} Priority</span>
      </div>
    );
  };

  return (
    <div className={`card-base action-card urgency-${urgency.toLowerCase()} grade-${gradeLevel}-theme`}>
      
      {/* Header with Timeline */}
      <div className="card-header-section">
        <div className="header-content">
          <div className="urgency-indicator">
            <span className="urgency-icon">{config.icon}</span>
            <div className={`urgency-badge urgency-${urgency.toLowerCase()}`}>
              {urgency} PRIORITY
            </div>
          </div>
          <h2 className="card-title">Your Action Plan</h2>
          <p className="card-subtitle">Grade {gradeLevel} Focus Areas</p>
        </div>
        
        <div className="timeline-info">
          <div className={`timeline-badge grade-${gradeLevel}-accent`}>
            {timelineConfig.phase}
          </div>
          <p className="timeline-text">{timeline}</p>
        </div>
      </div>

      {/* Current Focus Banner */}
      {currentFocus && (
        <div className="focus-banner">
          <div className="focus-header">
            <span className="focus-icon">🎯</span>
            <h3 className="focus-title">Current Focus</h3>
          </div>
          <p className="focus-description">{currentFocus}</p>
        </div>
      )}

      {/* Focus Areas Grid */}
      {focusAreas && focusAreas.length > 0 && (
        <div className="focus-areas-section">
          <h3 className="section-title">Your Grade {gradeLevel} Focus Areas</h3>
          <div className="focus-areas-grid">
            {focusAreas.map((area, index) => (
              <div key={index} className="focus-area-item">
                <div className="focus-number">{index + 1}</div>
                <span className="focus-text">{area}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priority Action Items */}
      <div className="action-items-section">
        <h3 className="section-title">Priority Actions</h3>
        <div className="action-items-list">
          {actionItems && actionItems.map((action, index) => (
            <div key={index} className="action-item">
              <div className="action-content">
                <div className="action-priority">
                  <PriorityIndicator level={index + 1} index={index} />
                </div>
                <div className="action-details">
                  <p className="action-text">{action}</p>
                  {expandedItems.has(index) && (
                    <div className="action-explanation">
                      <p className="explanation-text">
                        This action is particularly important for Grade {gradeLevel} students because it aligns with your current academic phase and timeline.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => toggleExpanded(index)}
                className="expand-button"
                aria-label={expandedItems.has(index) ? 'Collapse details' : 'Expand details'}
              >
                <span className="expand-icon">{expandedItems.has(index) ? '−' : '+'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Grade-Specific Guidance */}
      {gradeSpecificGuidance && gradeSpecificGuidance.length > 0 && (
        <div className="guidance-section">
          <h3 className="section-title">Grade {gradeLevel} Specific Guidance</h3>
          <div className="guidance-list">
            {gradeSpecificGuidance.map((guidance, index) => (
              <div key={index} className="guidance-item">
                <div className="guidance-content">
                  <div className={`grade-badge grade-${gradeLevel}-accent`}>
                    Grade {gradeLevel}
                  </div>
                  <p className="guidance-text">{guidance}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Tracking */}
      <div className="progress-section">
        <div className="progress-header">
          <h4 className="progress-title">Track Your Progress</h4>
          <span className="progress-counter">0 of {actionItems?.length || 0} completed</span>
        </div>
        
        <div className="progress-bar-container">
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: '0%' }}></div>
          </div>
        </div>
        
        <div className="progress-footer">
          <span className="progress-status">Just getting started</span>
          <span className="progress-encouragement">Keep going! 💪</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <div className="quick-actions-grid">
          <button className="action-button action-button-primary">
            Set Reminders
          </button>
          <button className="action-button action-button-success">
            Download Action Plan
          </button>
          <button className="action-button action-button-secondary">
            Share with Counselor
          </button>
        </div>
      </div>
    </div>
  );
}