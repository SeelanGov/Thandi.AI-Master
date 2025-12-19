/**
 * Custom Analytics Event Tracking
 * 
 * Tracks user interactions with enhanced features
 */

import { track } from '@vercel/analytics';

// Track assessment completion by grade
export function trackAssessmentComplete(grade, curriculum) {
  track('assessment_completed', {
    grade: grade,
    curriculum: curriculum,
    timestamp: new Date().toISOString()
  });
}

// Track when users receive enhanced recommendations
export function trackEnhancedRecommendations(grade, programsCount, bursariesCount) {
  track('enhanced_recommendations_shown', {
    grade: grade,
    programs_count: programsCount,
    bursaries_count: bursariesCount,
    enhancement_active: true,
    timestamp: new Date().toISOString()
  });
}

// Track specific program interactions
export function trackProgramInteraction(university, program, apsRequired, admissionChance) {
  track('program_viewed', {
    university: university,
    program: program,
    aps_required: apsRequired,
    admission_chance: admissionChance,
    timestamp: new Date().toISOString()
  });
}

// Track bursary interactions
export function trackBursaryInteraction(bursaryName, amount, eligibilityMatch) {
  track('bursary_viewed', {
    bursary_name: bursaryName,
    amount: amount,
    eligibility_match: eligibilityMatch,
    timestamp: new Date().toISOString()
  });
}

// Track chat interactions with enhanced responses
export function trackChatInteraction(grade, hasEnhancement, responseLength) {
  track('chat_interaction', {
    grade: grade,
    has_enhancement: hasEnhancement,
    response_length: responseLength,
    timestamp: new Date().toISOString()
  });
}

// Track PDF downloads with enhanced content
export function trackPDFDownload(grade, hasEnhancedContent) {
  track('pdf_downloaded', {
    grade: grade,
    has_enhanced_content: hasEnhancedContent,
    timestamp: new Date().toISOString()
  });
}

// Track user journey completion
export function trackJourneyComplete(grade, startTime, endTime, stepsCompleted) {
  const duration = endTime - startTime;
  
  track('journey_completed', {
    grade: grade,
    duration_seconds: Math.round(duration / 1000),
    steps_completed: stepsCompleted,
    completion_rate: (stepsCompleted / 5) * 100, // 5 total steps in assessment
    timestamp: new Date().toISOString()
  });
}

// Track enhancement feature usage
export function trackEnhancementFeature(featureName, grade, success) {
  track('enhancement_feature_used', {
    feature_name: featureName,
    grade: grade,
    success: success,
    timestamp: new Date().toISOString()
  });
}

export default {
  trackAssessmentComplete,
  trackEnhancedRecommendations,
  trackProgramInteraction,
  trackBursaryInteraction,
  trackChatInteraction,
  trackPDFDownload,
  trackJourneyComplete,
  trackEnhancementFeature
};