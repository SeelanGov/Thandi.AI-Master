'use client';

import { useState } from 'react';

export default function MarksCollection({ curriculumProfile, values = {}, onChange }) {
  // Get subjects from Step 1 (CurriculumProfile)
  const selectedSubjects = curriculumProfile?.currentSubjects || [];
  
  const updateMarks = (field, value) => {
    onChange({
      ...values,
      [field]: value
    });
  };

  const updateExactMark = (subject, mark) => {
    const exactMarks = values.exactMarks || {};
    updateMarks('exactMarks', {
      ...exactMarks,
      [subject]: mark
    });
  };

  const updateRangeMark = (subject, range) => {
    const rangeMarks = values.rangeMarks || {};
    updateMarks('rangeMarks', {
      ...rangeMarks,
      [subject]: range
    });
  };

  return (
    <div className="animate-slide-up">
      <h2 className="assessment-subtitle">Your Current Academic Performance</h2>
      <p className="assessment-description">
        Help us find careers that match your academic strengths (optional but recommended)
      </p>
      
      {/* CRITICAL: Verification Warning */}
      <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4 mb-6 flex items-start gap-3">
        <span className="text-xl flex-shrink-0">⚠️</span>
        <div className="text-amber-800 text-sm">
          <strong className="block mb-1">Important:</strong> 
          Your marks will be verified by your LO teacher and/or principal before any applications or decisions are made. Please provide your best estimate of your current performance.
        </div>
      </div>
      
      {selectedSubjects.length === 0 && (
        <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4 flex items-start gap-3">
          <span className="text-xl flex-shrink-0">⚠️</span>
          <p className="text-red-700 text-sm font-medium">Please go back to Step 1 and select your current subjects first.</p>
        </div>
      )}
      
      {selectedSubjects.length > 0 && (
        <>
          <div className="mb-6">
            <h3 className="font-heading font-semibold text-base text-assessment-text-primary mb-3">
              Subjects from your curriculum:
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedSubjects.map(subject => (
                <span key={subject} className="bg-thandi-cream text-thandi-teal px-3 py-1 rounded-lg text-sm border border-thandi-teal/20">
                  {subject}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <label className="selection-item cursor-pointer">
              <input
                type="radio"
                name="marksOption"
                value="provide"
                checked={values.marksOption === 'provide'}
                onChange={(e) => updateMarks('marksOption', e.target.value)}
                className="mr-3 w-4 h-4"
              />
              <span className="selection-item-title">I know my current marks</span>
            </label>
            <label className="selection-item cursor-pointer">
              <input
                type="radio"
                name="marksOption"
                value="ranges"
                checked={values.marksOption === 'ranges'}
                onChange={(e) => updateMarks('marksOption', e.target.value)}
                className="mr-3 w-4 h-4"
              />
              <span className="selection-item-title">I know my approximate performance</span>
            </label>
            <label className="selection-item cursor-pointer">
              <input
                type="radio"
                name="marksOption"
                value="unknown"
                checked={values.marksOption === 'unknown'}
                onChange={(e) => updateMarks('marksOption', e.target.value)}
                className="mr-3 w-4 h-4"
              />
              <span className="selection-item-title">I don't know my marks yet</span>
            </label>
          </div>

          {values.marksOption === 'provide' && (
            <div className="assessment-card">
              <p className="assessment-hint mb-4">Enter your current marks for your subjects:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedSubjects.map(subject => (
                  <div key={subject} className="space-y-2">
                    <label className="assessment-label">{subject}:</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="e.g. 75"
                        value={values.exactMarks?.[subject] || ''}
                        onChange={(e) => updateExactMark(subject, e.target.value)}
                        className="form-input-assessment pr-8"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-assessment-text-muted text-sm pointer-events-none">
                        %
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {values.marksOption === 'ranges' && (
            <div className="assessment-card">
              <p className="assessment-hint mb-4">Select your performance level for your subjects:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedSubjects.map(subject => (
                  <div key={subject} className="space-y-2">
                    <label className="assessment-label">{subject}:</label>
                    <select
                      value={values.rangeMarks?.[subject] || ''}
                      onChange={(e) => updateRangeMark(subject, e.target.value)}
                      className="form-input-assessment form-select-assessment"
                    >
                      <option value="">Select...</option>
                      <option value="struggling">Struggling (30-49%)</option>
                      <option value="average">Average (50-69%)</option>
                      <option value="good">Good (70-79%)</option>
                      <option value="excellent">Excellent (80-100%)</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {values.marksOption === 'unknown' && (
            <div className="bg-thandi-teal-50 border-2 border-thandi-teal-400 rounded-lg p-4 flex items-start gap-3">
              <span className="text-xl flex-shrink-0">💡</span>
              <p className="text-thandi-teal-800 text-sm">
                No problem! We'll give you general career guidance. You can always update your marks later for more personalized advice.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}