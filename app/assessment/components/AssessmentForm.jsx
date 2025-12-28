'use client';

import { useState, useEffect } from 'react';
import SubjectSelection from './SubjectSelection';
import MarksCollection from './MarksCollection';
import InterestAreas from './InterestAreas';
import Constraints from './Constraints';
import OpenQuestions from './OpenQuestions';
import ProgressBar from './ProgressBar';
import GradeSelector from './GradeSelector';
import PreliminaryReport from './PreliminaryReport';
import DeepDiveQuestions from './DeepDiveQuestions';
import CurriculumProfile from './CurriculumProfile';
import BulletproofStudentRegistration from '../../../components/BulletproofStudentRegistration';

import { getAcademicContext } from '../../../lib/academic/emergency-calendar.js';
import { trackAssessmentComplete, trackJourneyComplete } from '../../../lib/analytics/track-events';

const STORAGE_KEY = 'thandi_assessment_data';

// ✅ CRITICAL FIX: Extract actual marks from marksData structure for APS calculation
function extractActualMarks(marksData) {
  let actualMarks = {};
  
  if (!marksData) return actualMarks;
  
  // Handle exact marks (user provided specific percentages)
  if (marksData.marksOption === 'provide' && marksData.exactMarks) {
    Object.entries(marksData.exactMarks).forEach(([subject, mark]) => {
      if (mark && mark !== '') {
        // Convert subject name to match backend expectations
        const subjectKey = subject.toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
        const markValue = parseFloat(mark);
        if (!isNaN(markValue) && markValue > 0) {
          actualMarks[subjectKey] = markValue;
        }
      }
    });
  }
  
  // Handle range marks (user selected performance levels)
  else if (marksData.marksOption === 'ranges' && marksData.rangeMarks) {
    Object.entries(marksData.rangeMarks).forEach(([subject, range]) => {
      if (range && range !== '') {
        const subjectKey = subject.toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
        
        // Convert performance level to midpoint percentage for APS calculation
        const rangeToMark = {
          'struggling': 40,    // 30-49% range
          'average': 60,       // 50-69% range  
          'good': 75,          // 70-79% range
          'excellent': 90      // 80-100% range
        };
        
        const markValue = rangeToMark[range];
        if (markValue) {
          actualMarks[subjectKey] = markValue;
        }
      }
    });
  }
  
  console.log(`[MARKS EXTRACTION] Input:`, marksData);
  console.log(`[MARKS EXTRACTION] Output:`, actualMarks);
  
  return actualMarks;
}

// Mock data for preliminary report
const mockCareers = [
  {
    title: "Software Engineer",
    match: 85,
    reason: "You love problem-solving and tech. Math 55% → need 70% by Grade 12.",
    bursaries: ["Sasol: R120k/year (deadline: May)", "NSFAS: R80k/year"]
  },
  {
    title: "Data Scientist", 
    match: 80,
    reason: "Strong in Math even at 55% - shows potential. Needs improvement.",
    bursaries: ["Eskom: R100k/year"]
  },
  {
    title: "UX Designer",
    match: 75,
    reason: "Creative + analytical mix. Good fallback if Math doesn't improve.",
    bursaries: ["Private college loans (backup option)"]
  }
];

export default function AssessmentForm() {
  const [currentStep, setCurrentStep] = useState(0); // Start with grade selection
  const [grade, setGrade] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null); // New: Store student registration info
  const [showPreliminaryReport, setShowPreliminaryReport] = useState(false);
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [consent, setConsent] = useState({
    given: true, // Default to true until we implement proper login/consent flow
    timestamp: new Date().toISOString()
  });
  const [formData, setFormData] = useState({
    enjoyedSubjects: [],  // CHANGED: Now tracks subjects student ENJOYS
    interests: [],
    constraints: {
      time: '',
      money: '',
      location: '',
      familyBackground: ''
    },
    marksData: {
      marksOption: '',
      exactMarks: {},
      rangeMarks: {}
    },

    openQuestions: {
      motivation: '',
      concerns: '',
      careerInterests: ''
    },
    grade: null,
    assessmentDepth: 'quick',
    curriculumProfile: {
      framework: 'CAPS',
      currentSubjects: []
    }
  });

  // Load saved data on mount - but don't override grade selection
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Set assessment start time for journey tracking
    if (!localStorage.getItem('assessment_start_time')) {
      localStorage.setItem('assessment_start_time', Date.now().toString());
    }
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only restore if we're past grade selection
        if (parsed.currentStep > 0 && parsed.formData?.grade) {
          setFormData(parsed.formData);
          setGrade(parsed.formData.grade);
          setCurrentStep(parsed.currentStep);
        }
      } catch (e) {
        console.error('Failed to load saved assessment:', e);
      }
    }
  }, []);

  // Save data on every change (but not on initial mount)
  useEffect(() => {
    if (currentStep > 0 || grade) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        formData,
        currentStep,
        grade,
        savedAt: new Date().toISOString()
      }));
    }
  }, [formData, currentStep, grade]);

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConsentChange = (given) => {
    setConsent({
      given,
      timestamp: given ? new Date().toISOString() : null
    });
    console.log('[CONSENT] User consent:', given ? 'GIVEN' : 'NOT GIVEN');
  };

  const handleGradeSelect = (selectedGrade) => {
    setGrade(selectedGrade);
    setFormData(prev => ({ ...prev, grade: selectedGrade }));
    setCurrentStep(0.5); // Go to student registration
    // Scroll to top when starting the assessment
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStudentRegistration = (registrationData) => {
    setStudentInfo(registrationData);
    setCurrentStep(1); // Go to first assessment step
    // Scroll to top when starting the assessment
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generatePreliminaryReport = async () => {
    // Generate preliminary report with REAL assessment data
    setIsLoading(true);
    
    try {
      // Build query using actual assessment data
      let preliminaryQuery = `I am a Grade 10 student in South Africa following the ${formData.curriculumProfile?.framework || 'CAPS'} curriculum. 
      
      Subjects I enjoy: ${(formData.enjoyedSubjects || []).join(', ')}. 
      Interests: ${(formData.interests || []).join(', ')}.`;

      // Add marks data if available
      if (formData.marksData?.marksOption === 'provide' && formData.marksData.exactMarks) {
        const marksEntries = Object.entries(formData.marksData.exactMarks)
          .filter(([_, mark]) => mark && mark !== '')
          .map(([subject, mark]) => `${subject}: ${mark}%`);
        
        if (marksEntries.length > 0) {
          preliminaryQuery += `\n\nMy current marks: ${marksEntries.join(', ')}.`;
        }
      } else if (formData.marksData?.marksOption === 'ranges' && formData.marksData.rangeMarks) {
        const rangeEntries = Object.entries(formData.marksData.rangeMarks)
          .filter(([_, range]) => range && range !== '')
          .map(([subject, range]) => `${subject}: ${range}`);
        
        if (rangeEntries.length > 0) {
          preliminaryQuery += `\n\nMy performance levels: ${rangeEntries.join(', ')}.`;
        }
      } else {
        preliminaryQuery += `\n\nI haven't provided my marks yet - please give general guidance.`;
      }

      // Add constraints if available
      if (formData.constraints) {
        const constraints = [];
        if (formData.constraints.time) constraints.push(`Time: ${formData.constraints.time}`);
        if (formData.constraints.money) constraints.push(`Budget: ${formData.constraints.money}`);
        if (formData.constraints.location) constraints.push(`Location: ${formData.constraints.location}`);
        
        if (constraints.length > 0) {
          preliminaryQuery += `\n\nConstraints: ${constraints.join(', ')}.`;
        }
      }
      
      preliminaryQuery += `\n\nPlease provide 3 career recommendations with:
      1. Career title and match percentage (based on my interests and subjects)
      2. What marks I need to achieve by Grade 12
      3. Specific subjects to focus on improving
      4. One relevant bursary opportunity with amount
      
      Keep it concise - this is a preliminary report before detailed 2-year planning.`;

      const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: preliminaryQuery,
          grade: `grade${formData.grade}`,
          curriculum: formData.curriculumProfile?.framework?.toLowerCase() || 'caps',
          // Add structured subjects data for APS calculation
          subjects: formData.marksData?.exactMarks ? 
            Object.entries(formData.marksData.exactMarks)
              .filter(([_, mark]) => mark && mark !== '')
              .map(([subject, mark]) => ({
                name: subject,
                mark: parseFloat(mark) || 0,
                level: 'Higher Grade' // Default for Grade 10
              })) : [],
          curriculumProfile: {
            ...formData.curriculumProfile,
            grade: formData.grade
          },
          profile: {
            grade: formData.grade,
            marks: extractActualMarks(formData.marksData),  // ✅ FIXED: Extract flat marks structure
            marksData: formData.marksData,  // Keep original for reference
            constraints: formData.constraints || {}
          },
          session: {
            externalProcessingConsent: consent.given,
            consentTimestamp: consent.timestamp
          },
          options: {
            includeDebug: false,
            preliminaryReport: true
          }
        })
      });

      const data = await response.json();
      
      if (data.success && data.response) {
        // Parse the response to extract career recommendations
        const parsedCareers = parsePreliminaryResponse(data.response);
        
        // Store both raw and parsed results
        localStorage.setItem('thandi_preliminary_results', JSON.stringify({
          ...data,
          parsedCareers
        }));
        
        setIsLoading(false);
        setShowPreliminaryReport(true);
      } else {
        // Fallback to mock data if API fails
        console.warn('Preliminary report API failed, using fallback data');
        setIsLoading(false);
        setShowPreliminaryReport(true);
      }
    } catch (error) {
      console.error('Preliminary report error:', error);
      setIsLoading(false);
      setShowPreliminaryReport(true);
    }
  };

  const parsePreliminaryResponse = (response) => {
    // Try to extract career information from the response
    const careers = [];
    
    // Look for numbered career recommendations
    const careerMatches = response.match(/\d+\.\s*\*\*([^*]+)\*\*[^]*?(?=\d+\.|$)/g);
    
    if (careerMatches && careerMatches.length > 0) {
      careerMatches.slice(0, 3).forEach((match, index) => {
        const titleMatch = match.match(/\d+\.\s*\*\*([^*]+)\*\*/);
        const title = titleMatch ? titleMatch[1].trim() : `Career Option ${index + 1}`;
        
        // Extract match percentage if mentioned
        const percentMatch = match.match(/(\d+)%\s*match/i);
        const matchPercent = percentMatch ? parseInt(percentMatch[1]) : 75 + (index * 5);
        
        // Extract key information
        const reason = match.substring(0, 200).replace(/\*\*/g, '').replace(/\d+\.\s*/, '').trim() + '...';
        
        // Look for bursary information
        const bursaryMatch = match.match(/bursary|NSFAS|funding/i);
        const bursaries = bursaryMatch ? ['NSFAS funding available'] : ['Check university websites'];
        
        careers.push({
          title,
          match: matchPercent,
          reason,
          bursaries
        });
      });
    }
    
    // Fallback if parsing fails
    if (careers.length === 0) {
      return [
        {
          title: "Based on your interests",
          match: 80,
          reason: "We found careers matching your subject preferences. Complete the detailed assessment for specific recommendations.",
          bursaries: ["NSFAS funding available"]
        },
        {
          title: "Alternative career path",
          match: 75,
          reason: "Additional options based on your profile. Get your personalized plan for detailed guidance.",
          bursaries: ["Private bursaries available"]
        },
        {
          title: "Backup option",
          match: 70,
          reason: "Solid fallback choice. Your 2-year plan will show how to improve for better options.",
          bursaries: ["Various funding options"]
        }
      ];
    }
    
    return careers;
  };

  const handleDeepDiveOptIn = () => {
    setShowPreliminaryReport(false);
    setShowDeepDive(true);
    // Scroll to top for DeepDive questions
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSkipDeepDive = () => {
    // Submit with quick assessment
    handleSubmit();
  };

  const handleDeepDiveComplete = (deepDiveData) => {
    // Combine main assessment data with DeepDive enhancement data
    // NO duplicate marks - DeepDive focuses on 2-year planning
    const enhancedFormData = { 
      ...formData, 
      ...deepDiveData,
      assessmentDepth: 'comprehensive'
    };
    
    // Update form data with enhancement
    setFormData(enhancedFormData);
    
    // Submit with comprehensive assessment - includes 2-year planning context
    setTimeout(() => {
      handleSubmitWithEnhancement(enhancedFormData);
    }, 100);
  };

  const handleSubmitWithEnhancement = async (enhancedData) => {
    console.log('📤 Submitting enhanced assessment:', enhancedData);
    
    setIsLoading(true);
    
    const API_URL = '/api/rag/query';
    
    // Get current date context
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    
    // Build enhanced query with 2-year planning focus
    let query = `I am a Grade ${enhancedData.grade || 10} student in South Africa following the ${enhancedData.curriculumProfile?.framework || 'CAPS'} curriculum. Today is ${currentMonth} ${currentYear}. I have 2 years left before Grade 12 finals.

    ASSESSMENT DATA:
    Subjects I enjoy: ${(enhancedData.enjoyedSubjects || []).join(', ')}.
    Interests: ${(enhancedData.interests || []).join(', ')}.`;

    // Add marks data from main assessment (Step 2)
    if (enhancedData.marksData?.marksOption === 'provide' && enhancedData.marksData.exactMarks) {
      const marksEntries = Object.entries(enhancedData.marksData.exactMarks)
        .filter(([_, mark]) => mark && mark !== '')
        .map(([subject, mark]) => `${subject}: ${mark}%`);
      
      if (marksEntries.length > 0) {
        query += `\n    Current marks: ${marksEntries.join(', ')}.`;
      }
    } else if (enhancedData.marksData?.marksOption === 'ranges' && enhancedData.marksData.rangeMarks) {
      const rangeEntries = Object.entries(enhancedData.marksData.rangeMarks)
        .filter(([_, range]) => range && range !== '')
        .map(([subject, range]) => `${subject}: ${range}`);
      
      if (rangeEntries.length > 0) {
        query += `\n    Performance levels: ${rangeEntries.join(', ')}.`;
      }
    }

    // Add career interests for prioritization
    if (enhancedData.openQuestions?.careerInterests && enhancedData.openQuestions.careerInterests.trim()) {
      query += `\n\n    CAREER GOAL: "${enhancedData.openQuestions.careerInterests}"
      Please prioritize this career if my subjects and marks make it feasible. If not, explain why and suggest closest alternatives.`;
    }

    // Add 2-year planning context from DeepDive
    query += `\n\n    2-YEAR PLANNING CONTEXT:`;
    
    if (enhancedData.studyHabits && enhancedData.studyHabits.length > 0) {
      query += `\n    Study habits: ${enhancedData.studyHabits.join(', ')}.`;
    }
    
    if (enhancedData.strugglingSubjects && enhancedData.strugglingSubjects.length > 0) {
      query += `\n    Subjects needing improvement: ${enhancedData.strugglingSubjects.join(', ')}.`;
    }
    
    if (enhancedData.improvementAreas && enhancedData.improvementAreas.length > 0) {
      query += `\n    Skills to develop: ${enhancedData.improvementAreas.join(', ')}.`;
    }
    
    if (enhancedData.timeCommitment) {
      query += `\n    Time available for improvement: ${enhancedData.timeCommitment}.`;
    }
    
    if (enhancedData.supportSystem && enhancedData.supportSystem.length > 0) {
      query += `\n    Support available: ${enhancedData.supportSystem.join(', ')}.`;
    }

    // Add constraints
    const constraints = enhancedData.constraints || {};
    query += `\n\n    CONSTRAINTS: ${constraints.time || 'flexible'}, ${constraints.money || 'not specified'}, ${constraints.location || 'anywhere'}.`;

    // Request comprehensive 2-year plan
    query += `\n\n    Please provide a COMPREHENSIVE 2-YEAR SUCCESS PLAN including:
    1. Specific career recommendations with match percentages
    2. Year-by-year mark improvement targets (Grade 10 → 11 → 12)
    3. Month-by-month study schedule for struggling subjects
    4. Bursary opportunities with deadlines and amounts
    5. University application timeline and requirements
    6. Backup career options if marks don't improve as planned
    7. Study techniques tailored to my learning style and available time
    
    Focus on actionable steps I can take starting NOW to reach my career goals by Grade 12.`;
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          grade: `grade${enhancedData.grade}`,
          curriculum: enhancedData.curriculumProfile?.framework?.toLowerCase() || 'caps',
          curriculumProfile: {
            ...enhancedData.curriculumProfile,
            grade: enhancedData.grade
          },
          profile: {
            grade: enhancedData.grade,
            marks: extractActualMarks(enhancedData.marksData),  // ✅ FIXED: Extract flat marks structure
            marksData: enhancedData.marksData,  // Keep original for reference
            constraints: enhancedData.constraints || {},
            enhancement: {
              studyHabits: enhancedData.studyHabits,
              strugglingSubjects: enhancedData.strugglingSubjects,
              improvementAreas: enhancedData.improvementAreas,
              timeCommitment: enhancedData.timeCommitment,
              supportSystem: enhancedData.supportSystem
            }
          },
          session: {
            externalProcessingConsent: consent.given,
            consentTimestamp: consent.timestamp
          },
          options: {
            includeDebug: false,
            comprehensivePlan: true
          }
        })
      });
      
      const data = await response.json();
      console.log('📥 Enhanced RAG Response:', data);
      
      if (data.success) {
        // Save enhanced results with metadata
        const resultsWithMetadata = {
          ...data,
          metadata: {
            ...data.metadata,
            grade: enhancedData.grade,
            enjoyedSubjects: enhancedData.enjoyedSubjects,
            interests: enhancedData.interests,
            curriculumProfile: enhancedData.curriculumProfile,
            consentGiven: consent.given,
            enhanced: true,
            assessmentDepth: 'comprehensive',
            planType: '2-year-success-plan'
          }
        };
        localStorage.setItem('thandi_results', JSON.stringify(resultsWithMetadata));
        
        // Track assessment completion
        trackAssessmentComplete(enhancedData.grade, enhancedData.curriculum || 'caps');
        
        // Track journey completion
        const startTime = localStorage.getItem('assessment_start_time');
        if (startTime) {
          trackJourneyComplete(
            enhancedData.grade,
            parseInt(startTime),
            Date.now(),
            currentStep
          );
        }
        
        // Navigate to results
        window.location.href = '/results';
      } else {
        setIsLoading(false);
        alert('Error: ' + (data.error || 'Failed to get recommendations'));
      }
    } catch (error) {
      console.error('❌ Enhanced submission error:', error);
      setIsLoading(false);
      alert('Network error. Please check your connection and try again.');
    }
  };

  const nextStep = () => {
    // Validation for Step 1: Require complete subject selection for accurate LLM analysis
    if (currentStep === 1) {
      const selectedSubjects = formData.curriculumProfile?.currentSubjects?.length || 0;
      
      if (selectedSubjects === 0) {
        alert('Please select your subjects from your curriculum before continuing.');
        return;
      }
      
      // Require minimum subjects for accurate analysis (South African students typically take 7 subjects)
      if (selectedSubjects < 6) {
        alert(`Please select all your subjects (you've selected ${selectedSubjects}). Thandi needs your complete subject list to give accurate career recommendations.`);
        return;
      }
      
      // Check for required core subjects
      const currentSubjects = formData.curriculumProfile.currentSubjects;
      const hasLanguage = currentSubjects.some(subject => 
        subject.includes('English') || subject.includes('Afrikaans') || subject.includes('Zulu') || subject.includes('Xhosa')
      );
      const hasMathOrLit = currentSubjects.some(subject => 
        subject.includes('Mathematics') || subject.includes('Mathematical Literacy')
      );
      
      if (!hasLanguage) {
        alert('Please select at least one language subject (English, Afrikaans, etc.) - this is required for all South African students.');
        return;
      }
      
      if (!hasMathOrLit) {
        alert('Please select either Mathematics or Mathematical Literacy - this is required for all South African students.');
        return;
      }
    }
    
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
      // Scroll to top of the page smoothly when advancing to next step
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // All 6 steps complete - handle submission
      const gradeNumber = parseInt(grade) || parseInt(formData.grade) || 10;
      
      if (gradeNumber === 10) {
        // Grade 10: Generate preliminary report with real data
        generatePreliminaryReport();
      } else {
        // Grade 11-12: Go directly to results (no DeepDive)
        handleSubmit();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      // Scroll to top of the page smoothly when going back to previous step
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    console.log('📤 Submitting assessment:', formData);
    
    setIsLoading(true);
    
    const API_URL = '/api/rag/query';
    
    // Get current date context
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    
    // Build context-rich query
    let query = `I am a Grade ${formData.grade || 10} student in South Africa following the ${formData.curriculumProfile?.framework || 'CAPS'} curriculum. Today is ${currentMonth} ${currentYear}. `;
    
    // Add grade-specific context
    if (formData.grade === 12) {
      query += `I am writing my final exams in about 1 month (late November/early December ${currentYear}). `;
    } else if (formData.grade === 11) {
      query += `I have 1 full year left before Grade 12 finals. `;
    } else if (formData.grade === 10) {
      query += `I have 2 years left before Grade 12 finals. `;
    }
    
    query += `Subjects I enjoy: ${(formData.enjoyedSubjects || []).join(', ')}. Interests: ${(formData.interests || []).join(', ')}.`;

    // Add career interests for cross-referencing - EMPHASIZE IT
    if (formData.openQuestions?.careerInterests && formData.openQuestions.careerInterests.trim()) {
      query += `\n\nIMPORTANT: Student explicitly stated career interest: "${formData.openQuestions.careerInterests}". `;
      query += `Prioritize this career if their subjects and marks make it feasible. `;
      query += `If not feasible, explain why clearly and suggest closest alternatives.`;
    }

    // Add family background context
    if (formData.constraints?.familyBackground) {
      if (formData.constraints.familyBackground === 'no') {
        query += ` I would be the first in my family to go to university (first-generation student).`;
      } else if (formData.constraints.familyBackground.startsWith('yes')) {
        query += ` I have family members who went to university.`;
      }
    }

    // Add marks data from Step 2 (MarksCollection - for all grades)
    if (formData.marksData?.marksOption) {
      if (formData.marksData.marksOption === 'unknown') {
        query += ` I don't know my exact marks yet. `;
        query += `Give me general guidance on career paths and what marks I should aim for.`;
      } else if (formData.marksData.marksOption === 'provide' && formData.marksData.exactMarks) {
        query += ` My current marks (as of ${currentMonth} ${currentYear}): `;
        Object.entries(formData.marksData.exactMarks).forEach(([subject, mark]) => {
          if (mark && mark !== '') {
            query += `${subject}: ${mark}%, `;
          }
        });
        
        if (formData.grade === 12) {
          query += `I need: 1) What marks I need in my FINAL EXAMS (writing in ~1 month), 2) Bursaries with deadlines in the next 3-6 months, 3) Application deadlines I must meet NOW, 4) Realistic backup options if my marks don't improve. Be specific about MY current marks and what's achievable in the next month.`;
        } else if (formData.grade === 11) {
          query += `I need: 1) What marks to target by end of Grade 12, 2) Bursaries to apply for in ${currentYear + 1}, 3) Year-by-year improvement plan (Grade 11→12), 4) Subject choices to reconsider. Be specific about MY current marks.`;
        } else {
          query += `I need: 1) Mark targets for Grade 12, 2) Bursaries I can qualify for, 3) Year-by-year plan (Grade ${formData.grade}→12), 4) Backup options. Be specific about MY marks.`;
        }
      } else if (formData.marksData.marksOption === 'ranges' && formData.marksData.rangeMarks) {
        query += ` My current performance levels (as of ${currentMonth} ${currentYear}): `;
        Object.entries(formData.marksData.rangeMarks).forEach(([subject, range]) => {
          if (range && range !== '') {
            const rangeText = {
              'struggling': '30-49%',
              'average': '50-69%', 
              'good': '70-79%',
              'excellent': '80-100%'
            }[range] || range;
            query += `${subject}: ${rangeText}, `;
          }
        });
        
        if (formData.grade === 12) {
          query += `I need: 1) What marks I need in my FINAL EXAMS (writing in ~1 month), 2) Bursaries with deadlines in the next 3-6 months, 3) Application deadlines I must meet NOW, 4) Realistic backup options. Focus on my current performance levels.`;
        } else if (formData.grade === 11) {
          query += `I need: 1) What marks to target by end of Grade 12, 2) Bursaries to apply for in ${currentYear + 1}, 3) Year-by-year improvement plan (Grade 11→12), 4) Subject choices to reconsider. Focus on my current performance levels.`;
        } else {
          query += `I need: 1) Mark targets for Grade 12, 2) Bursaries I can qualify for, 3) Year-by-year plan (Grade ${formData.grade}→12), 4) Backup options. Focus on my current performance levels.`;
        }
      }
    }

    // Add deep dive data if available (for Grade 10 comprehensive assessment)
    if (formData.assessmentDepth === 'comprehensive') {
      if (formData.marksUnknown) {
        query += ` Additional context: I don't know my exact marks yet. `;
        query += `Support available: ${formData.supportSystem?.slice(0, 2).join(', ') || 'None'}. `;
        if (formData.strugglingSubjects && formData.strugglingSubjects.length > 0) {
          query += `Subjects I'm struggling with: ${formData.strugglingSubjects.join(', ')}. `;
        }
      } else if (formData.subjectMarks && formData.subjectMarks.length > 0) {
        // Only add DeepDive marks if no main assessment marks were provided
        if (!formData.constraints?.marksOption || formData.constraints.marksOption === 'unknown') {
          query += ` My current marks (as of ${currentMonth} ${currentYear}): `;
          formData.subjectMarks.forEach(({subject, exactMark}) => {
            query += `${subject}: ${exactMark}%, `;
          });
        }
        
        query += `Support available: ${formData.supportSystem?.slice(0, 2).join(', ') || 'None'}. `;
        if (formData.strugglingSubjects && formData.strugglingSubjects.length > 0) {
          query += `Subjects I'm struggling with: ${formData.strugglingSubjects.join(', ')}. `;
        }
      }
    }

    // Add constraints context
    const constraints = formData.constraints || {};
    query += ` Constraints: ${constraints.time || 'flexible'}, ${constraints.money || 'not specified'}, ${constraints.location || 'anywhere'}. Recommend careers matching subjects I ENJOY with education pathways.`;
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          grade: `grade${formData.grade}`, // Fix: Send grade as top-level parameter
          curriculum: formData.curriculumProfile?.framework?.toLowerCase() || 'caps',
          curriculumProfile: {
            ...formData.curriculumProfile,
            grade: formData.grade
          },
          profile: {
            grade: formData.grade,
            marks: extractActualMarks(formData.marksData),  // ✅ FIXED: Extract flat marks structure
            marksData: formData.marksData,  // Keep original for reference
            constraints: formData.constraints || {}
          },
          session: {
            externalProcessingConsent: consent.given,
            consentTimestamp: consent.timestamp
          },
          options: {
            includeDebug: false
          }
        })
      });
      
      const data = await response.json();
      console.log('📥 RAG Response:', data);
      console.log('✅ Footer intact:', data.response?.includes('⚠️ **Verify before you decide:'));
      
      if (data.success) {
        // Save results with metadata to localStorage
        const resultsWithMetadata = {
          ...data,
          metadata: {
            ...data.metadata,
            grade: formData.grade,
            enjoyedSubjects: formData.enjoyedSubjects,
            interests: formData.interests,
            curriculumProfile: formData.curriculumProfile,
            consentGiven: consent.given,
            enhanced: data.source === 'enhanced'
          }
        };
        localStorage.setItem('thandi_results', JSON.stringify(resultsWithMetadata));
        
        // Track assessment completion
        trackAssessmentComplete(formData.grade, formData.curriculum || 'caps');
        
        // Track journey completion
        const startTime = localStorage.getItem('assessment_start_time');
        if (startTime) {
          trackJourneyComplete(
            formData.grade,
            parseInt(startTime),
            Date.now(),
            currentStep
          );
        }
        
        // Navigate to results
        window.location.href = '/results';
      } else {
        setIsLoading(false);
        alert('Error: ' + (data.error || 'Failed to get recommendations'));
      }
    } catch (error) {
      console.error('❌ Submission error:', error);
      setIsLoading(false);
      alert('Network error. Please check your connection and try again.');
    }
  };

  const startOver = () => {
    if (confirm('Are you sure you want to start over? All your answers will be lost.')) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('thandi_student_token');
      localStorage.removeItem('thandi_session_token');
      setFormData({
        enjoyedSubjects: [],  // CHANGED
        interests: [],
        constraints: { time: '', money: '', location: '' },
        openQuestions: { motivation: '', concerns: '' }
      });
      setCurrentStep(0);
      setGrade(null);
      setStudentInfo(null);
      // Scroll to top when starting over
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Grade selection screen
  if (currentStep === 0) {
    return <GradeSelector onSelect={handleGradeSelect} />;
  }

  // Student registration screen (POPIA compliance)
  if (currentStep === 0.5) {
    return (
      <div className="assessment-container animate-fade-in">
        <BulletproofStudentRegistration onComplete={handleStudentRegistration} />
      </div>
    );
  }

  // Preliminary report screen (Grade 10 only)
  if (showPreliminaryReport) {
    // Try to load real preliminary results
    const preliminaryData = localStorage.getItem('thandi_preliminary_results');
    let careersToShow = mockCareers; // Fallback
    
    if (preliminaryData) {
      try {
        const parsed = JSON.parse(preliminaryData);
        if (parsed.parsedCareers && parsed.parsedCareers.length > 0) {
          careersToShow = parsed.parsedCareers;
        }
      } catch (e) {
        console.error('Failed to parse preliminary results:', e);
      }
    }
    
    return (
      <PreliminaryReport 
        careers={careersToShow}
        onDeepDive={handleDeepDiveOptIn}
        onSkip={handleSkipDeepDive}
      />
    );
  }

  // Deep dive questions screen
  if (showDeepDive) {
    return (
      <DeepDiveQuestions 
        onComplete={handleDeepDiveComplete}
        grade={grade}
        isLoading={isLoading}
      />
    );
  }
  
  // Loading overlay (shown during submission)
  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="loading-card">
          <div className="loading-spinner"></div>
          <h2 className="loading-title">Thandi is thinking...</h2>
          <p className="loading-text">
            Analyzing YOUR marks and finding the best careers for YOU
          </p>
          <p className="loading-subtext">This takes 10-15 seconds</p>
        </div>
        
      <style jsx>{`
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(17, 78, 78, 0.8);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease-out;
        }
        
        .loading-card {
          background: white;
          border-radius: var(--radius-xl);
          padding: var(--space-3xl) var(--space-xl);
          max-width: 400px;
          text-align: center;
          box-shadow: var(--shadow-thandi-xl);
          animation: slideUp 0.5s ease-out;
        }
        
        .loading-spinner {
          width: 64px;
          height: 64px;
          border: 4px solid var(--assessment-border);
          border-top-color: var(--thandi-teal);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto var(--space-lg);
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .loading-title {
          font-family: var(--font-poppins), sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: var(--thandi-teal);
          margin-bottom: var(--space-md);
        }
        
        .loading-text {
          font-family: var(--font-nunito), sans-serif;
          font-size: 16px;
          color: var(--assessment-text-secondary);
          margin-bottom: var(--space-sm);
        }
        
        .loading-subtext {
          font-family: var(--font-nunito), sans-serif;
          font-size: 14px;
          color: var(--assessment-text-muted);
        }
      `}</style>
      </div>
    );
  }

  return (
    <div className="assessment-container animate-fade-in">
      <div className="assessment-card">
        <div className="flex justify-between items-center mb-8">
          <h1 className="assessment-title">Career Assessment</h1>
          <div className="flex items-center gap-4">
            {grade && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-thandi-teal text-white">
                Grade {grade}
              </span>
            )}
            {studentInfo && studentInfo.type === 'registered' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Hi {studentInfo.name}!
              </span>
            )}
            {studentInfo && studentInfo.type === 'anonymous' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                Anonymous
              </span>
            )}
            <button onClick={startOver} className="btn-assessment-secondary text-sm px-4 py-2">
              Start Over
            </button>
          </div>
        </div>

        <ProgressBar currentStep={currentStep >= 1 ? currentStep : 1} totalSteps={6} />

        <div className="animate-slide-up">
          {currentStep === 1 && (
            <CurriculumProfile
              grade={grade}
              onChange={(curriculumProfile) => updateFormData('curriculumProfile', curriculumProfile)}
            />
          )}

          {currentStep === 2 && (
            <MarksCollection
              curriculumProfile={formData.curriculumProfile}
              values={formData.marksData}
              onChange={(marksData) => updateFormData('marksData', marksData)}
            />
          )}

          {currentStep === 3 && (
            <SubjectSelection
              selected={formData.enjoyedSubjects}
              onChange={(enjoyedSubjects) => updateFormData('enjoyedSubjects', enjoyedSubjects)}
              curriculumProfile={formData.curriculumProfile}
            />
          )}

          {currentStep === 4 && (
            <InterestAreas
              selected={formData.interests}
              onChange={(interests) => updateFormData('interests', interests)}
            />
          )}

          {currentStep === 5 && (
            <Constraints
              values={formData.constraints}
              onChange={(constraints) => updateFormData('constraints', constraints)}
            />
          )}

          {currentStep === 6 && (
            <OpenQuestions
              values={formData.openQuestions}
              onChange={(openQuestions) => updateFormData('openQuestions', openQuestions)}
            />
          )}
        </div>

        <div className="assessment-navigation">
          {currentStep > 1 && (
            <button onClick={prevStep} className="btn-assessment-secondary">
              ← Previous
            </button>
          )}
          <div className="flex-1"></div>
          <button onClick={nextStep} className="btn-assessment-primary">
            {currentStep === 6 ? 'Continue →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>

  );
}
