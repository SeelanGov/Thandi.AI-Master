'use client';

import { useState, useEffect } from 'react';

export default function GradeSelector({ onSelect }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load saved grade on component mount
  useEffect(() => {
    const savedGrade = localStorage.getItem('Thandi_selected_grade');
    if (savedGrade) {
      console.log('Loaded saved grade:', savedGrade);
    }
  }, []);

  const handleSelect = async (grade) => {
    if (!grade || grade < 10 || grade > 12) {
      setError('Please select a valid grade (10, 11, or 12)');
      return;
    }
    
    setLoading(true);
    localStorage.setItem('Thandi_selected_grade', grade.toString());
    
    try {
      console.log('Grade selected:', grade);
      setError(null);
      onSelect(grade);
    } catch (err) {
      setError('Failed to select grade. Please try again.');
      console.error('Grade selection error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Progressive enhancement: forms work with or without JavaScript
  const handleFormSubmit = (e, grade) => {
    e.preventDefault();
    
    // Real-time validation
    if (!grade || grade < 10 || grade > 12) {
      setError('Please select a valid grade (10, 11, or 12)');
      return;
    }
    
    handleSelect(grade);
  };

  return (
    <div className="assessment-container px-4 sm:px-6 animate-fade-in">
      <div className="assessment-card text-center">
        <h2 className="assessment-title mb-8">
          What grade are you in?
        </h2>
        
        <div className="space-y-4 mb-6">
          <form onSubmit={(e) => handleFormSubmit(e, 10)} method="post" action="/assessment/grade/10">
            <button 
              type="submit"
              className="btn-assessment-primary w-full text-lg py-4"
              disabled={loading}
            >
              {loading ? "Loading..." : "Grade 10"}
            </button>
          </form>
          
          <form onSubmit={(e) => handleFormSubmit(e, 11)} method="post" action="/assessment/grade/11">
            <button 
              type="submit"
              className="btn-assessment-primary w-full text-lg py-4"
              disabled={loading}
            >
              {loading ? "Loading..." : "Grade 11"}
            </button>
          </form>
          
          <form onSubmit={(e) => handleFormSubmit(e, 12)} method="post" action="/assessment/grade/12">
            <button 
              type="submit"
              className="btn-assessment-primary w-full text-lg py-4"
              disabled={loading}
            >
              {loading ? "Loading..." : "Grade 12"}
            </button>
          </form>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4" role="alert">
            <p className="text-red-800 text-sm">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}
        <p className="assessment-hint">
          This helps us customize your career guidance
        </p>
      </div>
    </div>
  );
}
