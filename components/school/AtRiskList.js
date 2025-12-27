'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export const AtRiskList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/school/students/at-risk')
      .then(r => r.json())
      .then(data => {
        setStudents(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Failed to fetch at-risk students:', err);
        setStudents([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="loading-spinner"></div>
        <span className="ml-3 text-assessment-text-muted font-body">Loading students...</span>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 text-thandi-teal-light mx-auto mb-3" />
        <p className="text-assessment-text-secondary font-body">Great! No students are currently at-risk.</p>
        <p className="text-xs text-assessment-text-muted font-body mt-1">All students are on track with their assessments.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {students.map(student => (
        <div key={student.id} className="flex items-center justify-between p-3 hover:bg-thandi-cream/20 rounded-lg transition-colors">
          <div className="flex items-center space-x-3">
            {/* Status Indicator - Using THANDI colors */}
            <div className={`w-3 h-3 rounded-full ${
              student.at_risk_status === 'red' ? 'bg-red-500' : 
              student.at_risk_status === 'yellow' ? 'bg-thandi-gold' : 
              'bg-thandi-teal-light'
            }`}></div>
            
            {/* Student Info - Using THANDI typography */}
            <div>
              <div className="font-medium text-assessment-text-primary text-sm font-body">{student.name}</div>
              <div className="text-xs text-assessment-text-muted font-body">Grade {student.grade}</div>
            </div>
          </div>
          
          {/* Status Badge - THANDI styled */}
          <div className={`px-2 py-1 text-xs rounded-full font-medium font-body ${
            student.at_risk_status === 'red' 
              ? 'bg-red-100 text-red-800' 
              : 'bg-thandi-cream text-thandi-brown'
          }`}>
            {student.at_risk_status === 'red' ? 'High Risk' : 'Medium Risk'}
          </div>
        </div>
      ))}
    </div>
  );
};