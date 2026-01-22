/**
 * Error Filters Component
 * Provides filtering and search functionality for errors
 */

'use client';

import { useState } from 'react';

export default function ErrorFilters({ filters, onFilterChange, onExport }) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
  };

  const handleApply = () => {
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      type: '',
      school_id: '',
      feature_area: '',
      start_date: '',
      end_date: '',
      search: ''
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold font-heading text-thandi-brown">
          Filters
        </h2>
        <button
          onClick={onExport}
          className="px-4 py-2 bg-thandi-teal text-white rounded-lg hover:bg-thandi-teal-dark transition-colors font-body text-sm"
        >
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Error Type */}
        <div>
          <label className="block text-sm font-medium text-thandi-brown/70 font-body mb-1">
            Error Type
          </label>
          <select
            value={localFilters.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-thandi-teal focus:border-transparent font-body"
          >
            <option value="">All Types</option>
            <option value="TypeError">TypeError</option>
            <option value="ReferenceError">ReferenceError</option>
            <option value="NetworkError">NetworkError</option>
            <option value="ValidationError">ValidationError</option>
            <option value="DatabaseError">DatabaseError</option>
          </select>
        </div>

        {/* Feature Area */}
        <div>
          <label className="block text-sm font-medium text-thandi-brown/70 font-body mb-1">
            Feature Area
          </label>
          <select
            value={localFilters.feature_area}
            onChange={(e) => handleChange('feature_area', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-thandi-teal focus:border-transparent font-body"
          >
            <option value="">All Features</option>
            <option value="registration">Registration</option>
            <option value="assessment">Assessment</option>
            <option value="results">Results</option>
            <option value="rag">RAG System</option>
            <option value="school">School Portal</option>
          </select>
        </div>

        {/* School ID */}
        <div>
          <label className="block text-sm font-medium text-thandi-brown/70 font-body mb-1">
            School ID
          </label>
          <input
            type="text"
            value={localFilters.school_id}
            onChange={(e) => handleChange('school_id', e.target.value)}
            placeholder="Enter school ID"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-thandi-teal focus:border-transparent font-body"
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-thandi-brown/70 font-body mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={localFilters.start_date}
            onChange={(e) => handleChange('start_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-thandi-teal focus:border-transparent font-body"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-thandi-brown/70 font-body mb-1">
            End Date
          </label>
          <input
            type="date"
            value={localFilters.end_date}
            onChange={(e) => handleChange('end_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-thandi-teal focus:border-transparent font-body"
          />
        </div>

        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-thandi-brown/70 font-body mb-1">
            Search
          </label>
          <input
            type="text"
            value={localFilters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Search error messages..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-thandi-teal focus:border-transparent font-body"
          />
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={handleApply}
          className="px-6 py-2 bg-thandi-teal text-white rounded-lg hover:bg-thandi-teal-dark transition-colors font-body"
        >
          Apply Filters
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-2 bg-gray-200 text-thandi-brown rounded-lg hover:bg-gray-300 transition-colors font-body"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
