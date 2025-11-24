'use client';

import { useState, useEffect } from 'react';
import SubjectSelection from './SubjectSelection';
import InterestAreas from './InterestAreas';
import Constraints from './Constraints';
import OpenQuestions from './OpenQuestions';
import ProgressBar from './ProgressBar';
import GradeSelector from './GradeSelector';
import PreliminaryReport from './PreliminaryReport';
import DeepDiveQuestions from './DeepDiveQuestions';

const STORAGE_KEY = 'thandi_assessment_data';

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
  const [showPreliminaryReport, setShowPreliminaryReport] = useState(false);
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [formData, setFormData] = useState({
    enjoyedSubjects: [],  // CHANGED: Now tracks subjects student ENJOYS
    interests: [],
    constraints: {
      time: '',
      money: '',
      location: ''
    },
    openQuestions: {
      motivation: '',
      concerns: ''
    },
    grade: null,
    assessmentDepth: 'quick'
  });

  // Load saved data on mount - but don't override grade selection
  useEffect(() => {
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

  const handleGradeSelect = (selectedGrade) => {
    setGrade(selectedGrade);
    setFormData(prev => ({ ...prev, grade: selectedGrade }));
    setCurrentStep(1);
  };

  const handleCoreQuestionsComplete = () => {
    if (grade === 10) {
      // Grade 10: Show preliminary report with opt-in
      setShowPreliminaryReport(true);
    } else {
      // Grade 11-12: Auto-advance to deep dive (for now, just submit)
      handleSubmit();
    }
  };

  const handleDeepDiveOptIn = () => {
    setShowPreliminaryReport(false);
    setShowDeepDive(true);
  };

  const handleSkipDeepDive = () => {
    // Submit with quick assessment
    handleSubmit();
  };

  const handleDeepDiveComplete = (deepDiveData) => {
    // Submit with comprehensive assessment
    setFormData(prev => ({ ...prev, ...deepDiveData }));
    // Trigger submit after state update
    setTimeout(() => handleSubmit(), 100);
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Core questions complete
      handleCoreQuestionsComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    console.log('📤 Submitting assessment:', formData);
    
    const API_URL = '/api/rag/query';
    
    // Build base query
    let query = `I am a Grade ${formData.grade || 10} student in South Africa seeking career guidance.

SUBJECTS I ENJOY: ${formData.enjoyedSubjects.join(', ')}
INTERESTS: ${formData.interests.join(', ')}
CONSTRAINTS: Time available: ${formData.constraints.time}, Budget: ${formData.constraints.money}, Location: ${formData.constraints.location}
MOTIVATION: ${formData.openQuestions.motivation}
CONCERNS: ${formData.openQuestions.concerns}`;

    // Add deep dive data if available
    if (formData.assessmentDepth === 'comprehensive' && formData.subjectMarks) {
      query += `\n\n📊 CURRENT ACADEMIC PERFORMANCE:`;
      formData.subjectMarks.forEach(({subject, markRange}) => {
        query += `\n- ${subject}: ${markRange}`;
      });
      
      if (formData.supportSystem && formData.supportSystem.length > 0) {
        query += `\n\n💪 AVAILABLE SUPPORT FOR IMPROVEMENT:`;
        formData.supportSystem.forEach(support => {
          query += `\n- ${support}`;
        });
      }
      
      query += `\n\n🎯 PERSONALIZED REQUEST:
Based on my current marks, please provide:
1. Specific mark improvement targets for each subject (what I need to achieve by Grade 12)
2. Realistic bursary opportunities I can qualify for with my current/improved marks
3. A year-by-year action plan (Grade ${formData.grade} → Grade 12) showing:
   - Which subjects to prioritize each year
   - Specific mark targets per term
   - Bursary application deadlines
   - Backup career options if marks don't improve as planned
4. How to use my available support systems effectively

IMPORTANT: Make this plan specific to MY marks, not generic advice. Show me the exact path from where I am NOW to where I need to be.`;
    } else {
      query += `\n\nPlease recommend suitable career paths with specific education pathways. Focus on careers that match the subjects I ENJOY, not just subjects I'm forced to take.`;
    }
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          options: {
            includeDebug: false
          }
        })
      });
      
      const data = await response.json();
      console.log('📥 RAG Response:', data);
      console.log('✅ Footer intact:', data.response?.includes('⚠️ **Verify before you decide:'));
      
      if (data.success) {
        // Save results to localStorage
        localStorage.setItem('thandi_results', JSON.stringify(data));
        // Navigate to results
        window.location.href = '/results';
      } else {
        alert('Error: ' + (data.error || 'Failed to get recommendations'));
      }
    } catch (error) {
      console.error('❌ Submission error:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  const startOver = () => {
    if (confirm('Are you sure you want to start over? All your answers will be lost.')) {
      localStorage.removeItem(STORAGE_KEY);
      setFormData({
        enjoyedSubjects: [],  // CHANGED
        interests: [],
        constraints: { time: '', money: '', location: '' },
        openQuestions: { motivation: '', concerns: '' }
      });
      setCurrentStep(1);
    }
  };

  // Grade selection screen
  if (currentStep === 0) {
    return <GradeSelector onSelect={handleGradeSelect} />;
  }

  // Preliminary report screen (Grade 10 only)
  if (showPreliminaryReport) {
    return (
      <PreliminaryReport 
        careers={mockCareers}
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
      />
    );
  }

  return (
    <div className="assessment-container">
      <div className="assessment-header">
        <h1>Career Assessment</h1>
        <div className="header-info">
          {grade && <span className="grade-badge">Grade {grade}</span>}
          <button onClick={startOver} className="btn-secondary">
            Start Over
          </button>
        </div>
      </div>

      <ProgressBar currentStep={currentStep} totalSteps={4} />

      <div className="assessment-content">
        {currentStep === 1 && (
          <SubjectSelection
            selected={formData.enjoyedSubjects}
            onChange={(enjoyedSubjects) => updateFormData('enjoyedSubjects', enjoyedSubjects)}
          />
        )}

        {currentStep === 2 && (
          <InterestAreas
            selected={formData.interests}
            onChange={(interests) => updateFormData('interests', interests)}
          />
        )}

        {currentStep === 3 && (
          <Constraints
            values={formData.constraints}
            onChange={(constraints) => updateFormData('constraints', constraints)}
          />
        )}

        {currentStep === 4 && (
          <OpenQuestions
            values={formData.openQuestions}
            onChange={(openQuestions) => updateFormData('openQuestions', openQuestions)}
          />
        )}
      </div>

      <div className="assessment-navigation">
        {currentStep > 1 && (
          <button onClick={prevStep} className="btn-secondary">
            ← Previous
          </button>
        )}

        <button onClick={nextStep} className="btn-primary">
          {currentStep === 4 ? 'Continue →' : 'Next →'}
        </button>
      </div>

      <style jsx>{`
        .assessment-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .assessment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .assessment-header h1 {
          font-size: 28px;
          color: #1a1a1a;
          margin: 0;
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .grade-badge {
          background: #dbeafe;
          color: #1e40af;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
        }

        .assessment-content {
          min-height: 400px;
          margin: 30px 0;
        }

        .assessment-navigation {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin-top: 30px;
        }

        .btn-primary, .btn-secondary {
          padding: 12px 24px;
          font-size: 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          min-width: 120px;
        }

        .btn-primary {
          background: #2563eb;
          color: white;
        }

        .btn-primary:hover {
          background: #1d4ed8;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        @media (max-width: 768px) {
          .assessment-container {
            padding: 15px;
          }

          .assessment-header h1 {
            font-size: 24px;
          }

          .btn-primary, .btn-secondary {
            padding: 10px 20px;
            font-size: 14px;
            min-width: 100px;
          }
        }
      `}</style>
    </div>
  );
}
