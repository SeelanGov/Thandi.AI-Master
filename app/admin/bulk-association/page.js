'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Bulk Student-School Association Tool
 * Administrative interface for bulk linking students to schools
 */
export default function BulkAssociationTool() {
  const [students, setStudents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState([]);
  const [filter, setFilter] = useState('unassociated'); // all, unassociated, associated
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load schools
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name, code, district, province')
        .order('name');

      if (schoolsError) throw schoolsError;
      setSchools(schoolsData || []);

      // Load students based on filter
      let query = supabase
        .from('student_profiles')
        .select('id, email, phone, grade, school_id, consent_given, consent_date, created_at');

      if (filter === 'unassociated') {
        query = query.is('school_id', null);
      } else if (filter === 'associated') {
        query = query.not('school_id', 'is', null);
      }

      const { data: studentsData, error: studentsError } = await query
        .order('created_at', { ascending: false })
        .limit(100);

      if (studentsError) throw studentsError;
      setStudents(studentsData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelection = (studentId, selected) => {
    if (selected) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    }
  };

  const handleSelectAll = () => {
    const unassociatedStudents = students.filter(s => !s.school_id);
    if (selectedStudents.length === unassociatedStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(unassociatedStudents.map(s => s.id));
    }
  };

  const handleBulkAssociation = async () => {
    if (!selectedSchool || selectedStudents.length === 0) {
      setError('Please select a school and at least one student');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setResults([]);
    setProgress({ current: 0, total: selectedStudents.length });

    const associationResults = [];

    for (let i = 0; i < selectedStudents.length; i++) {
      const studentId = selectedStudents[i];
      setProgress({ current: i + 1, total: selectedStudents.length });

      try {
        const response = await fetch('/api/admin/bulk-association', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentId,
            schoolId: selectedSchool,
            consentGiven: true, // Default for bulk operations
            consentMethod: 'admin_bulk_association',
            consentContext: 'administrative_bulk_linking'
          }),
        });

        const result = await response.json();
        
        associationResults.push({
          studentId,
          success: result.success,
          message: result.success ? 'Associated successfully' : result.error,
          data: result.data
        });

      } catch (error) {
        associationResults.push({
          studentId,
          success: false,
          message: error.message || 'Network error',
          data: null
        });
      }

      // Small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setResults(associationResults);
    setLoading(false);

    const successCount = associationResults.filter(r => r.success).length;
    const failureCount = associationResults.length - successCount;

    if (failureCount === 0) {
      setSuccess(`Successfully associated ${successCount} students with the selected school.`);
    } else {
      setError(`${successCount} successful, ${failureCount} failed. See results below for details.`);
    }

    // Reload data to reflect changes
    loadData();
    setSelectedStudents([]);
  };

  const exportResults = () => {
    const csvContent = [
      ['Student ID', 'Status', 'Message', 'School ID', 'Assessment Count'],
      ...results.map(r => [
        r.studentId,
        r.success ? 'Success' : 'Failed',
        r.message,
        r.data?.school_id || '',
        r.data?.assessments_updated || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-association-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Bulk Student-School Association Tool
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Link multiple students to schools with POPIA-compliant consent tracking
            </p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            {/* Controls */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter Students
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="unassociated">Unassociated Only</option>
                  <option value="associated">Associated Only</option>
                  <option value="all">All Students</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target School
                </label>
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a school...</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name} ({school.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleBulkAssociation}
                  disabled={loading || !selectedSchool || selectedStudents.length === 0}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : `Associate ${selectedStudents.length} Students`}
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            {loading && progress.total > 0 && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Processing students...</span>
                  <span>{progress.current} of {progress.total}</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Student List */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Students ({students.length})
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {selectedStudents.length === students.filter(s => !s.school_id).length ? 'Deselect All' : 'Select All Unassociated'}
                  </button>
                  <button
                    onClick={loadData}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Select
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current School
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Consent Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id} className={student.school_id ? 'bg-gray-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={(e) => handleStudentSelection(student.id, e.target.checked)}
                            disabled={!!student.school_id}
                            className="text-blue-600 disabled:opacity-50"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {student.email || student.id}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.phone || 'No phone'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.grade || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.school_id ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Associated
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Unassociated
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.consent_given ? (
                            <span className="text-green-600">✓ Consented</span>
                          ) : (
                            <span className="text-gray-400">No consent</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(student.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Association Results
                  </h3>
                  <button
                    onClick={exportResults}
                    className="text-sm bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300"
                  >
                    Export CSV
                  </button>
                </div>

                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Message
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assessments Updated
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.map((result, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {result.studentId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {result.success ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Success
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Failed
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.message}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.data?.assessments_updated || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}