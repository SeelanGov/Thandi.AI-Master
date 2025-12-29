'use client';

export default function GradeSelector({ onSelect }) {
  const handleSelect = (grade) => {
    console.log('Grade selected:', grade);
    onSelect(grade);
  };

  // Progressive enhancement: forms work with or without JavaScript
  const handleFormSubmit = (e, grade) => {
    e.preventDefault();
    handleSelect(grade);
  };

  return (
    <div className="assessment-container animate-fade-in">
      <div className="assessment-card text-center">
        <h2 className="assessment-title mb-8">
          What grade are you in?
        </h2>
        
        <div className="space-y-4 mb-6">
          <form onSubmit={(e) => handleFormSubmit(e, 10)} method="post" action="/assessment/grade/10">
            <button 
              type="submit"
              className="btn-assessment-primary w-full text-lg py-4"
            >
              Grade 10
            </button>
          </form>
          
          <form onSubmit={(e) => handleFormSubmit(e, 11)} method="post" action="/assessment/grade/11">
            <button 
              type="submit"
              className="btn-assessment-primary w-full text-lg py-4"
            >
              Grade 11
            </button>
          </form>
          
          <form onSubmit={(e) => handleFormSubmit(e, 12)} method="post" action="/assessment/grade/12">
            <button 
              type="submit"
              className="btn-assessment-primary w-full text-lg py-4"
            >
              Grade 12
            </button>
          </form>
        </div>
        
        <p className="assessment-hint">
          This helps us customize your career guidance
        </p>
      </div>
    </div>
  );
}
