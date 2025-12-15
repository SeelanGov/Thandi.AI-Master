// lib/academic/emergency-calendar.js
// Emergency fix for December 2025 academic calendar issue
// Now uses Academic Calendar Engine for accurate timeline calculations

import AcademicCalendarEngine from './academic-calendar-engine.js';

// Initialize the academic calendar engine
const calendarEngine = new AcademicCalendarEngine();

/**
 * Get academic context for current date and grade
 * Now uses Academic Calendar Engine for accurate calculations
 */
export function getAcademicContext(currentDate = new Date(), grade = 10) {
  try {
    // Use the new Academic Calendar Engine for accurate timeline calculations
    const academicContext = calendarEngine.getAcademicContext(currentDate, grade);
    
    return {
      currentDate,
      academicYear: currentDate.getFullYear(),
      currentPhase: academicContext.timeline.phase,
      grade,
      timelineMessage: academicContext.contextMessage,
      urgencyLevel: academicContext.urgencyLevel,
      isPostFinals: academicContext.timeline.isFinalsComplete,
      isFinalsActive: academicContext.timeline.isFinalsActive,
      timeline: academicContext.timeline,
      deadlines: academicContext.deadlines,
      daysToFinals: academicContext.timeline.daysToFinalsStart
    };
  } catch (error) {
    console.error('Error using Academic Calendar Engine, falling back to emergency fix:', error);
    
    // FALLBACK: Original emergency implementation
    return getEmergencyAcademicContext(currentDate, grade);
  }
}

/**
 * Fallback emergency implementation (original code)
 */
function getEmergencyAcademicContext(currentDate = new Date(), grade = 10) {
  const month = currentDate.getMonth() + 1; // 1-12
  const year = currentDate.getFullYear();
  
  // South African Academic Calendar 2025
  const academicCalendar2025 = {
    matricFinals: {
      start: new Date(2025, 9, 21), // October 21, 2025
      end: new Date(2025, 10, 27)   // November 27, 2025
    },
    resultsRelease: new Date(2025, 11, 20), // December 20, 2025
    newYearStart: new Date(2026, 0, 15)     // January 15, 2026
  };
  
  // Determine current academic phase
  let phase = 'preparation';
  let timelineMessage = '';
  let urgencyLevel = 'low';
  
  if (year === 2025) {
    if (currentDate >= academicCalendar2025.matricFinals.start && 
        currentDate <= academicCalendar2025.matricFinals.end) {
      phase = 'finals-active';
    } else if (currentDate > academicCalendar2025.matricFinals.end) {
      phase = 'post-finals';
    } else if (month >= 9) { // September onwards
      phase = 'finals-approach';
    }
  }
  
  // Generate appropriate timeline message based on grade and phase
  if (grade === 12) {
    switch (phase) {
      case 'post-finals':
        timelineMessage = `Your Grade 12 finals are complete (finished November 2025). Focus on results (expected December 20) and 2026 university applications.`;
        urgencyLevel = 'medium';
        break;
      case 'finals-active':
        timelineMessage = `You are currently writing your Grade 12 final exams. Focus on exam performance and stress management.`;
        urgencyLevel = 'high';
        break;
      case 'finals-approach':
        const daysToFinals = Math.ceil((academicCalendar2025.matricFinals.start - currentDate) / (1000 * 60 * 60 * 24));
        timelineMessage = `Your Grade 12 finals start in ${daysToFinals} days (October 21, 2025). Focus on final preparation.`;
        urgencyLevel = 'critical';
        break;
      default:
        // Calculate months to finals for next year
        const monthsToFinals = 12 - month + 10; // Rough calculation
        timelineMessage = `You have approximately ${monthsToFinals} months until Grade 12 finals (October 2025).`;
        urgencyLevel = 'low';
    }
  } else if (grade === 11) {
    if (year === 2025 && phase === 'post-finals') {
      timelineMessage = `You have completed Grade 11. Your Grade 12 finals will be in October-November 2026 (11 months away).`;
    } else {
      timelineMessage = `You have 1 full year left before Grade 12 finals (October-November ${year + 1}).`;
    }
    urgencyLevel = 'medium';
  } else if (grade === 10) {
    if (year === 2025 && phase === 'post-finals') {
      timelineMessage = `You have completed Grade 10. Your Grade 12 finals will be in October-November 2027 (23 months away).`;
    } else {
      timelineMessage = `You have 2 years left before Grade 12 finals (October-November ${year + 2}).`;
    }
    urgencyLevel = 'low';
  }
  
  return {
    currentDate,
    academicYear: year,
    currentPhase: phase,
    grade,
    timelineMessage,
    urgencyLevel,
    isPostFinals: phase === 'post-finals',
    isFinalsActive: phase === 'finals-active',
    fallback: true
  };
}

/**
 * Get contextual advice based on academic phase
 */
export function getContextualAdvice(academicContext) {
  const { grade, currentPhase, academicYear } = academicContext;
  
  if (grade === 12 && currentPhase === 'post-finals') {
    return {
      focus: 'post-matric-planning',
      priorities: [
        'Wait for results (expected December 20, 2025)',
        'Complete university applications for 2026',
        'Research NSFAS funding options',
        'Consider gap year opportunities if needed',
        'Prepare backup plans (TVET, private colleges)'
      ],
      urgentDeadlines: [
        'University applications: Most close January 2026',
        'NSFAS applications: Check nsfas.org.za for 2026 deadlines',
        'Accommodation applications: Apply early for better options'
      ]
    };
  }
  
  if (grade === 12 && currentPhase === 'finals-active') {
    return {
      focus: 'exam-performance',
      priorities: [
        'Focus on remaining exams',
        'Manage exam stress and anxiety',
        'Get adequate rest between exams',
        'Review exam timetable and logistics'
      ],
      urgentDeadlines: [
        'Check exam venues and times daily',
        'Prepare required materials (calculator, stationery)',
        'Plan transport to exam venues'
      ]
    };
  }
  
  // Default advice for other phases
  return {
    focus: 'academic-preparation',
    priorities: [
      'Focus on improving current marks',
      'Research career options and requirements',
      'Plan subject choices for next year',
      'Build study habits and support systems'
    ],
    urgentDeadlines: []
  };
}

/**
 * Check if current date requires emergency messaging
 */
export function requiresEmergencyFix(currentDate = new Date()) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  
  // December 2025 - Grade 12 finals are complete but system says "in 1 month"
  if (year === 2025 && month === 12) {
    return {
      required: true,
      issue: 'Grade 12 finals completed but system shows "finals in 1 month"',
      correctMessage: 'Grade 12 finals are complete (November 2025). Focus on results and 2026 applications.'
    };
  }
  
  return { required: false };
}