'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const StudentTable = ({ className = '' }) => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/school/students')
      .then(r => r.json())
      .then(data => {
        setStudents(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Failed to fetch students:', err);
        setStudents([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return students.filter(s => {
      const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
      const searchTerm = search.toLowerCase();
      return fullName.includes(searchTerm) ||
             s.email?.toLowerCase().includes(searchTerm) ||
             s.class_name?.toLowerCase().includes(searchTerm);
    });
  }, [students, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="loading-spinner"></div>
        <span className="ml-3 text-assessment-text-muted font-body">Loading students...</span>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Search Bar - THANDI styled */}
      <div className="p-4 border-b border-assessment-border">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-assessment-text-muted" />
          <input
            type="text"
            placeholder="Search students..."
            className="form-input-assessment pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table - Using THANDI design system */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-thandi-cream/30">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium font-body text-thandi-teal uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium font-body text-thandi-teal uppercase tracking-wider">
                Grade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium font-body text-thandi-teal uppercase tracking-wider">
                Class
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium font-body text-thandi-teal uppercase tracking-wider">
                Completion
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium font-body text-thandi-teal uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium font-body text-thandi-teal uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-assessment-border bg-white">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-assessment-text-muted font-body">
                  {search ? 'No students match your search.' : 'No students found.'}
                </td>
              </tr>
            ) : (
              filtered.map(student => (
                <tr key={student.id} className="hover:bg-thandi-cream/10 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-thandi-teal/10 flex items-center justify-center">
                        <span className="text-thandi-teal font-medium text-sm font-body">
                          {student.first_name?.charAt(0).toUpperCase() || 'S'}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium font-body text-assessment-text-primary">
                          {`${student.first_name} ${student.last_name}`}
                        </div>
                        <div className="text-xs text-assessment-text-muted font-body">
                          {student.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-assessment-text-secondary font-body">
                    {student.grade}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-assessment-text-secondary font-body">
                    {student.class_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-assessment-text-secondary font-body">
                    {student.assessments?.[0]?.completed_at ? 'Complete' : 'Pending'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* Status Indicator - THANDI colors */}
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        student.assessments?.[0]?.at_risk_status === 'red' ? 'bg-red-500' :
                        student.assessments?.[0]?.at_risk_status === 'yellow' ? 'bg-thandi-gold' :
                        'bg-thandi-teal-light'
                      }`}></div>
                      <span className="text-sm text-assessment-text-primary font-body">
                        {student.assessments?.[0]?.at_risk_status === 'red' ? 'High Risk' :
                         student.assessments?.[0]?.at_risk_status === 'yellow' ? 'Medium Risk' :
                         'Good'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => alert(`View ${student.first_name} ${student.last_name} - Coming soon!`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => alert(`Download PDF for ${student.first_name} ${student.last_name} - Coming soon!`)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};