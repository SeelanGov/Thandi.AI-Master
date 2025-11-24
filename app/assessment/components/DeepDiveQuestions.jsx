'use client';
import { useState } from 'react';

export default function DeepDiveQuestions({ onComplete, grade }) {
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
    <div className="deep-dive-questions max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">Question 5 of 6</span>
          <span className="text-sm text-gray-500">83% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full" style={{width: '83%'}}></div>
        </div>
      </div>
      
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        What are your current marks for each subject?
      </h2>
      
      <div className="space-y-4 mb-8">
        {subjects.map(subject => (
          <div key={subject} className="flex items-center justify-between">
            <label className="text-gray-700 font-medium w-1/2">
              {subject}:
            </label>
            <select 
              value={currentMarks[subject] || ''}
              onChange={(e) => setCurrentMarks(prev => ({...prev, [subject]: e.target.value}))}
              className="w-1/2 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select range</option>
              {markRanges.map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        What support do you have for improving your marks?
      </h3>
      
      <div className="space-y-3 mb-8">
        {supportOptions.map(option => (
          <label key={option} className="flex items-center">
            <input 
              type="checkbox"
              checked={supportSystem.includes(option)}
              onChange={() => handleSupportChange(option)}
              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-gray-700">{option}</span>
          </label>
        ))}
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <p className="text-sm text-blue-700">
          💡 We'll use this to show you how to improve your marks and find the right bursaries
        </p>
      </div>
      
      <button 
        onClick={handleComplete}
        className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors duration-200 text-lg"
      >
        Get My 3-Year Plan →
      </button>
    </div>
  );
}
