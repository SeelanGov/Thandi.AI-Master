'use client';
import { useState } from 'react';

export default function DeepDiveQuestions({ onComplete, grade, isLoading = false }) {
  const [currentMarks, setCurrentMarks] = useState({});
  const [marksUnknown, setMarksUnknown] = useState(false);
  const [supportSystem, setSupportSystem] = useState([]);
  const [strugglingSubjects, setStrugglingSubjects] = useState([]);
  
  const subjects = ['Mathematics', 'Physical Science', 'Life Sciences', 'English', 'Afrikaans'];
  // Grade-appropriate support options
  const getSupportOptions = () => {
    if (grade === 12) {
      // Post-graduation support options
      return [
        'Online courses (Coursera, Khan Academy, etc.)',
        'Private tutoring (if affordable)',
        'Self-study resources',
        'Career counseling services',
        'Family guidance and support',
        'None of the above'
      ];
    } else {
      // Current student support options (Grade 10-11)
      return [
        'School tutoring available',
        'Private tutor (family can afford)',
        'Study groups with friends',
        'Online resources (Khan Academy, etc.)',
        'Family help with homework',
        'None of the above'
      ];
    }
  };
  
  const supportOptions = getSupportOptions();
  const strugglingOptions = [
    'Mathematics',
    'Physical Sciences',
    'Life Sciences',
    'Accounting',
    'English',
    'None - doing well in all'
  ];
  
  const handleMarkChange = (subject, value) => {
    const numValue = parseInt(value);
    if (value === '' || (numValue >= 0 && numValue <= 100)) {
      setCurrentMarks(prev => ({...prev, [subject]: value}));
    }
  };

  const handleMarksUnknown = () => {
    setMarksUnknown(true);
    setCurrentMarks({});
  };

  const handleSupportChange = (option) => {
    setSupportSystem(prev => 
      prev.includes(option) 
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  const handleStrugglingChange = (option) => {
    setStrugglingSubjects(prev => 
      prev.includes(option) 
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };
  
  const handleComplete = () => {
    const deepDiveData = {
      subjectMarks: marksUnknown 
        ? [] 
        : Object.entries(currentMarks)
            .filter(([_, mark]) => mark !== '')
            .map(([subject, mark]) => ({
              subject,
              exactMark: parseInt(mark)
            })),
      marksUnknown,
      supportSystem,
      strugglingSubjects,
      assessmentDepth: 'comprehensive'
    };
    onComplete(deepDiveData);
  };
  
  // Grade-specific messaging
  const isGrade12 = grade === 12;
  const isGrade11 = grade === 11;
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  
  const getGradeSpecificTitle = () => {
    if (isGrade12) {
      return `Your CURRENT marks (${currentMonth} ${currentYear} - before finals)`;
    } else if (isGrade11) {
      return `Your current marks (${currentMonth} ${currentYear})`;
    }
    return `Your current marks (${currentMonth} ${currentYear})`;
  };
  
  const getGradeSpecificInfo = () => {
    if (isGrade12) {
      return `⏰ You're writing finals SOON! We'll show you: 1) What marks you need in finals, 2) Bursaries closing NOW, 3) Application deadlines`;
    } else if (isGrade11) {
      return `📅 You have 1 year left! We'll show you: 1) What to improve by Grade 12, 2) Bursaries to apply for, 3) Subject choices to reconsider`;
    }
    return `💡 We'll use this to show you how to improve your marks and find the right bursaries`;
  };
  
  return (
    <div className="deep-dive-container">
      <div className="deep-dive-card">
        {isGrade12 && (
          <div className="urgency-banner">
            <span className="urgency-icon">⏰</span>
            <div className="urgency-content">
              <strong>Grade 12 - Finals in ~1 month!</strong>
              <p>We'll focus on what you can do RIGHT NOW before finals</p>
            </div>
          </div>
        )}
        
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
          {getGradeSpecificTitle()}
        </h2>
        
        <div className="why-box">
          <span className="why-icon">📊</span>
          <div className="why-content">
            <strong>Why we need this:</strong>
            <p>Your marks help us check university requirements and find bursaries you qualify for. Teachers can verify this data later.</p>
          </div>
        </div>

        {!marksUnknown ? (
          <>
            <div className="subjects-section">
              {subjects.map(subject => (
                <div key={subject} className="subject-row">
                  <label className="subject-label">
                    {subject}:
                  </label>
                  <div className="mark-input-wrapper">
                    <input 
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g. 65"
                      value={currentMarks[subject] || ''}
                      onChange={(e) => handleMarkChange(subject, e.target.value)}
                      className="mark-input"
                      disabled={marksUnknown}
                    />
                    <span className="percent-sign">%</span>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={handleMarksUnknown}
              className="unknown-button"
            >
              I don't know my marks yet
            </button>
          </>
        ) : (
          <div className="unknown-state">
            <p className="unknown-message">
              ✓ No problem! We'll give you general guidance. You can update your marks later.
            </p>
            <button 
              onClick={() => setMarksUnknown(false)}
              className="reset-button"
            >
              Actually, I do know my marks
            </button>
          </div>
        )}
        
        <h3 className="support-title">
          Which subjects are you finding most difficult? (Optional)
        </h3>
        
        <div className="support-section">
          {strugglingOptions.map(option => (
            <label key={option} className="support-option">
              <input 
                type="checkbox"
                checked={strugglingSubjects.includes(option)}
                onChange={() => handleStrugglingChange(option)}
                className="support-checkbox"
              />
              <span className="support-label">{option}</span>
            </label>
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
        
        <div className={`info-box ${isGrade12 ? 'urgent' : ''}`}>
          <p className="info-text">
            {getGradeSpecificInfo()}
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

        .why-box {
          background: #eff6ff;
          border: 2px solid #3b82f6;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .why-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .why-content strong {
          display: block;
          color: #1e40af;
          font-size: 15px;
          margin-bottom: 4px;
        }

        .why-content p {
          margin: 0;
          color: #1e40af;
          font-size: 14px;
        }

        .mark-input-wrapper {
          width: 55%;
          position: relative;
          display: flex;
          align-items: center;
        }

        .mark-input {
          width: 100%;
          padding: 12px 40px 12px 16px;
          border: 2px solid #d1d5db;
          border-radius: 8px;
          font-size: 18px;
          background: white;
          transition: all 0.2s;
        }

        .mark-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .mark-input:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }

        .percent-sign {
          position: absolute;
          right: 16px;
          color: #6b7280;
          font-size: 16px;
          font-weight: 500;
          pointer-events: none;
        }

        .unknown-button {
          width: 100%;
          padding: 12px;
          background: #f3f4f6;
          color: #6b7280;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          margin-top: 16px;
          transition: all 0.2s;
        }

        .unknown-button:hover {
          background: #e5e7eb;
          border-color: #9ca3af;
          color: #374151;
        }

        .unknown-state {
          background: #f0fdf4;
          border: 2px solid #86efac;
          border-radius: 8px;
          padding: 24px;
          text-align: center;
        }

        .unknown-message {
          font-size: 16px;
          color: #166534;
          margin-bottom: 16px;
        }

        .reset-button {
          padding: 10px 20px;
          background: white;
          color: #166534;
          border: 2px solid #86efac;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .reset-button:hover {
          background: #dcfce7;
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

        .urgency-banner {
          background: #fef3c7;
          border: 2px solid #f59e0b;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .urgency-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .urgency-content strong {
          display: block;
          color: #92400e;
          font-size: 16px;
          margin-bottom: 4px;
        }

        .urgency-content p {
          margin: 0;
          color: #78350f;
          font-size: 14px;
        }

        .info-box {
          background: #eff6ff;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .info-box.urgent {
          background: #fef3c7;
          border: 2px solid #f59e0b;
        }

        .info-text {
          font-size: 14px;
          color: #1e40af;
          margin: 0;
        }

        .info-box.urgent .info-text {
          color: #78350f;
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
