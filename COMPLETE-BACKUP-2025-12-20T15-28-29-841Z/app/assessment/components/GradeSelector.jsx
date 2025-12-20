'use client';

export default function GradeSelector({ onSelect }) {
  const handleSelect = (grade) => {
    console.log('Grade selected:', grade);
    onSelect(grade);
  };

  return (
    <div className="assessment-container animate-fade-in">
      <div className="assessment-card text-center">
        <h2 className="assessment-title mb-8">
          What grade are you in?
        </h2>
        
        <div className="space-y-4 mb-6">
          <button 
            onClick={() => handleSelect(10)}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleSelect(10);
            }}
            className="btn-assessment-primary w-full text-lg py-4"
          >
            Grade 10
          </button>
          
          <button 
            onClick={() => handleSelect(11)}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleSelect(11);
            }}
            className="btn-assessment-primary w-full text-lg py-4"
          >
            Grade 11
          </button>
          
          <button 
            onClick={() => handleSelect(12)}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleSelect(12);
            }}
            className="btn-assessment-primary w-full text-lg py-4"
          >
            Grade 12
          </button>
        </div>
        
        <p className="assessment-hint">
          This helps us customize your career guidance
        </p>
      </div>
    </div>
  );
}
