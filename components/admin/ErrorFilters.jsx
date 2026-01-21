'use client';

import { useState } from 'react';

export default function ErrorFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    type: '',
    school_id: '',
    feature: '',
    date_from: '',
    date_to: '',
    search: ''
  });

  const handleChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      type: '',
      school_id: '',
      feature: '',
      date_from: '',
      date_to: '',
      search: ''
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Search error message..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Error Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Error Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Types</option>
            <option value="api_error">API Error</option>
            <option value="database_error">Database Error</option>
            <option value="validation_error">Validation Error</option>
            <option value="authentication_error">Authentication Error</option>
            <option value="external_service_error">External Service Error</option>
            <option value="unknown_error">Unknown Error</option>
          </select>
        </div>

        {/* Feature */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Feature
          </label>
          <select
            value={filters.feature}
            onChange={(e) => handleChange('feature', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Features</option>
            <option value="registration">Registration</option>
            <option value="assessment">Assessment</option>
            <option value="school_login">School Login</option>
            <option value="rag_query">RAG Query</option>
            <option value="pdf_generation">PDF Generation</option>
            <option value="admin_dashboard">Admin Dashboard</option>
          </select>
        </div>

        {/* School ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            School ID
          </label>
          <input
            type="text"
            value={filters.school_id}
            onChange={(e) => handleChange('school_id', e.target.value)}
            placeholder="Enter school ID..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Date From */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => handleChange('date_from', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => handleChange('date_to', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Reset Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
