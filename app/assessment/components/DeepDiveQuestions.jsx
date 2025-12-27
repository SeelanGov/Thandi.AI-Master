'use client';
import { useState } from 'react';

export default function DeepDiveQuestions({ onComplete, grade, isLoading = false }) {
  const [studyHabits, setStudyHabits] = useState([]);
  const [careerGoals, setCareerGoals] = useState('');
  const [supportSystem, setSupportSystem] = useState([]);
  const [strugglingSubjects, setStrugglingSubjects] = useState([]);
  const [improvementAreas, setImprovementAreas] = useState([]);
  const [timeCommitment, setTimeCommitment] = useState('');
  
  // Grade 10 specific support options
  const supportOptions = [
    'School tutoring available',
    'Private tutor (family can afford)',
    'Study groups with friends',
    'Online resources (Khan Academy, etc.)',
    'Family help with homework',
    'None of the above'
  ];
  
  const strugglingOptions = [
    'Mathematics',
    'Physical Sciences',
    'Life Sciences',
    'Accounting',
    'English',
    'Languages (Afrikaans, etc.)',
    'None - doing well in all'
  ];

  const studyHabitsOptions = [
    'I study regularly (daily/weekly schedule)',
    'I only study before tests/exams',
    'I struggle to focus when studying',
    'I need help with time management',
    'I learn better with visual aids',
    'I prefer group study sessions'
  ];

  const improvementOptions = [
    'Better study techniques',
    'Time management skills',
    'Test-taking strategies',
    'Note-taking methods',
    'Memory techniques',
    'Stress management',
    'Goal setting and planning'
  ];

  const timeOptions = [
    '1-2 hours per day',
    '3-4 hours per day',
    '5+ hours per day',
    'Only on weekends',
    'Varies by week',
    'Not sure yet'
  ];

  const handleStudyHabitsChange = (option) => {
    setStudyHabits(prev => 
      prev.includes(option) 
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
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

  const handleImprovementChange = (option) => {
    setImprovementAreas(prev => 
      prev.includes(option) 
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };
  
  const handleComplete = () => {
    const deepDiveData = {
      studyHabits,
      careerGoals,
      supportSystem,
      strugglingSubjects,
      improvementAreas,
      timeCommitment,
      assessmentDepth: 'comprehensive'
    };
    onComplete(deepDiveData);
  };
  
  return (
    <div className="assessment-container animate-fade-in">
      <div className="assessment-card">
        <div className="bg-thandi-cream border-2 border-thandi-gold rounded-lg p-4 mb-6 flex items-start gap-3">
          <span className="text-xl flex-shrink-0">🎯</span>
          <div className="text-thandi-brown text-sm">
            <strong className="block mb-1">Get Your 2-Year Success Plan!</strong>
            We'll create a personalized roadmap showing exactly what to improve from Grade 10 → 12 to reach your dream career.
          </div>
        </div>
        
        <h2 className="assessment-subtitle">Help us create your personalized 2-year plan</h2>
        <p className="assessment-description">
          These questions help us give you specific, actionable steps to improve your marks and reach your career goals.
        </p>

        {/* Study Habits */}
        <div className="mb-8">
          <h3 className="font-heading font-semibold text-lg text-assessment-text-primary mb-4">
            📚 What are your current study habits?
          </h3>
          <div className="space-y-3">
            {studyHabitsOptions.map(option => (
              <label key={option} className="selection-item cursor-pointer">
                <input 
                  type="checkbox"
                  checked={studyHabits.includes(option)}
                  onChange={() => handleStudyHabitsChange(option)}
                  className="mr-3 w-4 h-4"
                />
                <span className="selection-item-title">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Career Goals */}
        <div className="mb-8">
          <h3 className="font-heading font-semibold text-lg text-assessment-text-primary mb-4">
            🎯 What career are you most interested in? (Optional)
          </h3>
          <textarea
            value={careerGoals}
            onChange={(e) => setCareerGoals(e.target.value)}
            placeholder="e.g., Doctor, Engineer, Teacher, Business owner, or 'Not sure yet'"
            className="form-input-assessment form-textarea-assessment"
            rows={3}
            maxLength={200}
          />
          <div className="text-right text-xs text-assessment-text-muted mt-1">
            {careerGoals.length} / 200 characters
          </div>
        </div>

        {/* Struggling Subjects */}
        <div className="mb-8">
          <h3 className="font-heading font-semibold text-lg text-assessment-text-primary mb-4">
            📉 Which subjects need the most improvement?
          </h3>
          <div className="space-y-3">
            {strugglingOptions.map(option => (
              <label key={option} className="selection-item cursor-pointer">
                <input 
                  type="checkbox"
                  checked={strugglingSubjects.includes(option)}
                  onChange={() => handleStrugglingChange(option)}
                  className="mr-3 w-4 h-4"
                />
                <span className="selection-item-title">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Improvement Areas */}
        <div className="mb-8">
          <h3 className="font-heading font-semibold text-lg text-assessment-text-primary mb-4">
            🚀 What skills would help you improve most?
          </h3>
          <div className="space-y-3">
            {improvementOptions.map(option => (
              <label key={option} className="selection-item cursor-pointer">
                <input 
                  type="checkbox"
                  checked={improvementAreas.includes(option)}
                  onChange={() => handleImprovementChange(option)}
                  className="mr-3 w-4 h-4"
                />
                <span className="selection-item-title">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Time Commitment */}
        <div className="mb-8">
          <h3 className="font-heading font-semibold text-lg text-assessment-text-primary mb-4">
            ⏰ How much time can you commit to improving your marks?
          </h3>
          <div className="space-y-3">
            {timeOptions.map(option => (
              <label key={option} className="selection-item cursor-pointer">
                <input 
                  type="radio"
                  name="timeCommitment"
                  value={option}
                  checked={timeCommitment === option}
                  onChange={(e) => setTimeCommitment(e.target.value)}
                  className="mr-3 w-4 h-4"
                />
                <span className="selection-item-title">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Support System */}
        <div className="mb-8">
          <h3 className="font-heading font-semibold text-lg text-assessment-text-primary mb-4">
            🤝 What support do you have for improving your marks?
          </h3>
          <div className="space-y-3">
            {supportOptions.map(option => (
              <label key={option} className="selection-item cursor-pointer">
                <input 
                  type="checkbox"
                  checked={supportSystem.includes(option)}
                  onChange={() => handleSupportChange(option)}
                  className="mr-3 w-4 h-4"
                />
                <span className="selection-item-title">{option}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="text-green-800 text-sm">
            <strong className="block mb-2">🎯 Your Personalized Plan Will Include:</strong>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Specific mark targets for each subject by Grade 12</li>
              <li>Month-by-month improvement schedule</li>
              <li>Study techniques tailored to your learning style</li>
              <li>Bursary deadlines and application requirements</li>
              <li>Backup career options if marks don't improve</li>
              <li>University application timeline and requirements</li>
            </ul>
          </div>
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
          className={`btn-assessment-primary w-full text-lg py-4 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="loading-spinner"></div>
              Creating Your 2-Year Plan...
            </div>
          ) : (
            'Get My Personalized 2-Year Success Plan →'
          )}
        </button>
      </div>
    </div>
  );
}
