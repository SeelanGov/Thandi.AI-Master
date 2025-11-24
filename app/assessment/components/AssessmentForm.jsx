'use client';

import { useState, useEffect } from 'react';
import SubjectSelection from './SubjectSelection';
import InterestAreas from './InterestAreas';
import Constraints from './Constraints';
import OpenQuestions from './OpenQuestions';
import ProgressBar from './ProgressBar';

const STORAGE_KEY = 'thandi_assessment_data';

export default function AssessmentForm() {
  const [currentStep, setCurrentStep] = useState(1);
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
    }
  });

  // Load saved data on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed.formData || formData);
        setCurrentStep(parsed.currentStep || 1);
      } catch (e) {
        console.error('Failed to load saved assessment:', e);
      }
    }
  }, []);

  // Save data on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      formData,
      currentStep,
      savedAt: new Date().toISOString()
    }));
  }, [formData, currentStep]);

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    console.log('📤 Submitting assessment:', formData);
    
    // Use mock API in development (localhost or local network), real API in production
    const isDevelopment = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1' ||
       window.location.hostname.startsWith('192.168.') ||
       window.location.hostname.startsWith('10.') ||
       window.location.hostname.startsWith('172.'));
    
    const API_URL = '/api/rag/query';  // Use real RAG API
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `I need career guidance. The subjects I ENJOY (not just take) are: ${formData.enjoyedSubjects.join(', ')}. My interests include: ${formData.interests.join(', ')}. My constraints: time available is ${formData.constraints.time}, budget is ${formData.constraints.money}, location preference is ${formData.constraints.location}. My motivation: ${formData.openQuestions.motivation}. My concerns: ${formData.openQuestions.concerns}. IMPORTANT: Focus recommendations on subjects I enjoy, not subjects I'm forced to take. Please recommend suitable career paths with specific education pathways.`,
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

  return (
    <div className="assessment-container">
      <div className="assessment-header">
        <h1>Career Assessment</h1>
        <button onClick={startOver} className="btn-secondary">
          Start Over
        </button>
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

        {currentStep < 4 ? (
          <button onClick={nextStep} className="btn-primary">
            Next →
          </button>
        ) : (
          <button onClick={handleSubmit} className="btn-primary">
            Get My Results
          </button>
        )}
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
