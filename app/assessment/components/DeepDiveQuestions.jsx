'use client';
import { useState } from 'react';

export default function DeepDiveQuestions({ onComplete, grade, isLoading = false }) {
  const [currentMarks, setCurrentMarks] = useState({});
  const [supportSystem, setSupportSystem] = useState([]);
  
  const subjects = ['Mathematics', 'Physical Science', 'Life Sciences', 'English', 'Afrikaans'];
  const markRanges = ['0-39%', '40-49%', '50-59%', '60-69%', '70-79%', '80-100%'];
  const supportOptions = [
    'School tutoring available',
    'Private tutor (family can afford)',
    'Study groups with friends',
    'Online resources (Khan Academy, etc.)',
    'Family help with homework',
    'None of the above'
  ];
  
  const handleSupportChange = (option) => {
    setSupportSystem(prev => 
      prev.includes(option) 
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };
  
  const handleComplete = () => {
    const deepDiveData = {
      subjectMarks: Object.entries(currentMarks).map(([subject, range]) => ({
        subject,
        markRange: range
      })),
      supportSystem,
      assessmentDepth: 'comprehensive'
    };
    onComplete(deepDiveData);
  };
  
  return (
    <div className="deep-dive-container">
      <div className="deep-dive-card">
        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-label">Question 5 of 6</span>
            <span className="progress-percent">83% complete</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{width: '83%'}}></div>
          </div>
        </div>
        
        <h2 className="question-title">
          What are your current marks for each subject?
        </h2>
        
        <div className="subjects-section">
          {subjects.map(subject => (
            <div key={subject} className="subject-row">
              <label className="subject-label">
                {subject}:
              </label>
              <select 
                value={currentMarks[subject] || ''}
                onChange={(e) => setCurrentMarks(prev => ({...prev, [subject]: e.target.value}))}
                className="subject-select"
              >
                <option value="">Select range</option>
                {markRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
        
        <h3 className="support-title">
          What support do you have for improving your marks?
        </h3>
        
        <div className="support-section">
          {supportOptions.map(option => (
            <label key={option} className="support-option">
              <input 
                type="checkbox"
                checked={supportSystem.includes(option)}
                onChange={() => handleSupportChange(option)}
                className="support-checkbox"
              />
              <span className="support-label">{option}</span>
            </label>
          ))}
        </div>
        
        <div className="info-box">
          <p className="info-text">
            💡 We'll use this to show you how to improve your marks and find the right bursaries
          </p>
        </div>
        
        <button 
          onClick={(e) => {
            e.preventDefault();
            if (!isLoading) handleComplete();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            if (!isLoading) handleComplete();
          }}
          disabled={isLoading}
          className={`submit-button ${isLoading ? 'loading' : ''}`}
        >
          {isLoading ? 'Analyzing YOUR data...' : 'Get My 3-Year Plan →'}
        </button>
      </div>

      <style jsx>{`
        .deep-dive-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .deep-dive-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 32px 24px;
        }

        .progress-section {
          margin-bottom: 24px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .progress-label {
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
        }

        .progress-percent {
          font-size: 14px;
          color: #9ca3af;
        }

        .progress-bar-bg {
          width: 100%;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: #3b82f6;
          border-radius: 4px;
          transition: width 0.3s;
        }

        .question-title {
          font-size: 20px;
          font-weight: bold;
          color: #1a1a1a;
          margin-bottom: 24px;
        }

        .subjects-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 32px;
        }

        .subject-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .subject-label {
          font-size: 16px;
          font-weight: 500;
          color: #374151;
          width: 45%;
        }

        .subject-select {
          width: 55%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 15px;
          background: white;
          cursor: pointer;
        }

        .subject-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .support-title {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 16px;
        }

        .support-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .support-option {
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        .support-checkbox {
          width: 18px;
          height: 18px;
          margin-right: 12px;
          cursor: pointer;
        }

        .support-label {
          font-size: 15px;
          color: #374151;
        }

        .info-box {
          background: #eff6ff;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .info-text {
          font-size: 14px;
          color: #1e40af;
          margin: 0;
        }

        .submit-button {
          width: 100%;
          padding: 14px 24px;
          background: #10b981;
          color: white;
          font-size: 18px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        .submit-button:hover {
          background: #059669;
        }

        .submit-button:active {
          transform: scale(0.98);
          background: #047857;
        }
        
        .submit-button:disabled,
        .submit-button.loading {
          background: #9ca3af;
          cursor: not-allowed;
          opacity: 0.7;
        }
        
        .submit-button.loading {
          animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        @media (max-width: 768px) {
          .deep-dive-container {
            padding: 15px;
          }

          .deep-dive-card {
            padding: 24px 20px;
          }

          .question-title {
            font-size: 18px;
          }

          .subject-row {
            flex-direction: column;
            align-items: flex-start;
          }

          .subject-label {
            width: 100%;
            margin-bottom: 8px;
          }

          .subject-select {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
