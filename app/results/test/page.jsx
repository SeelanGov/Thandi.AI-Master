'use client';

import React, { useState, useEffect } from 'react';
import ResultsCardLayout from '../components/ResultsCardLayout';
import { ResultsParser } from '../services/resultsParser';
import { sampleResponses } from './sampleResponses';
import '../styles/global.css';

/**
 * Test page for Results Page Redesign
 * Allows testing different grade levels and parsing scenarios
 */
export default function ResultsTestPage() {
  const [selectedGrade, setSelectedGrade] = useState('grade12');
  const [parsedResults, setParsedResults] = useState(null);
  const [parsingError, setParsingError] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Parse results when grade selection changes
  useEffect(() => {
    if (selectedGrade && sampleResponses[selectedGrade]) {
      try {
        setIsLoading(true);
        const response = sampleResponses[selectedGrade];
        const parsed = ResultsParser.parseResults(response.fullResponse, response.grade);
        setParsedResults(parsed);
        setParsingError(false);
        console.log('✅ Parsed results for', selectedGrade, parsed);
      } catch (error) {
        console.error('❌ Parsing failed:', error);
        setParsingError(true);
        setParsedResults(null);
      } finally {
        setIsLoading(false);
      }
    }
  }, [selectedGrade]);

  // Run comprehensive tests
  const runTests = async () => {
    setIsLoading(true);
    try {
      // Import test runner dynamically
      const { ResultsTestRunner } = await import('./testRunner.js');
      const testRunner = new ResultsTestRunner();
      const results = await testRunner.runAllTests();
      setTestResults(results);
    } catch (error) {
      console.error('Test runner failed:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate localStorage data for testing
  const simulateResultsPage = () => {
    const response = sampleResponses[selectedGrade];
    localStorage.setItem('thandi_results', JSON.stringify({
      ...response,
      gate: null // No gate warnings for test
    }));
    
    // Open results page in new tab
    window.open('/results', '_blank');
  };

  return (
    <div className="test-page">
      <div className="test-container">
        
        {/* Test Header */}
        <div className="test-header">
          <h1>🧪 Results Page Redesign - Test Suite</h1>
          <p>Test the new card-based results layout with different grade levels and scenarios</p>
        </div>

        {/* Test Controls */}
        <div className="test-controls">
          <div className="control-group">
            <label htmlFor="grade-select">Select Grade Level:</label>
            <select 
              id="grade-select"
              value={selectedGrade} 
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="grade-select"
            >
              <option value="grade10">Grade 10 - Foundation Year</option>
              <option value="grade11">Grade 11 - Strategic Planning</option>
              <option value="grade12">Grade 12 - Critical Decision Year</option>
            </select>
          </div>

          <div className="control-actions">
            <button 
              onClick={runTests}
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? '🔄 Running Tests...' : '🧪 Run All Tests'}
            </button>
            
            <button 
              onClick={simulateResultsPage}
              disabled={!parsedResults}
              className="btn-secondary"
            >
              📄 Open Results Page
            </button>
          </div>
        </div>

        {/* Test Results Summary */}
        {testResults && (
          <div className="test-results-summary">
            <h2>📊 Test Results</h2>
            {testResults.error ? (
              <div className="error-message">
                ❌ Test Error: {testResults.error}
              </div>
            ) : (
              <div className="results-grid">
                <div className="result-card success">
                  <h3>✅ Passed</h3>
                  <div className="result-number">{testResults.passed}</div>
                </div>
                <div className="result-card error">
                  <h3>❌ Failed</h3>
                  <div className="result-number">{testResults.failed}</div>
                </div>
                <div className="result-card info">
                  <h3>📊 Success Rate</h3>
                  <div className="result-number">{testResults.summary?.successRate}%</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Parsing Status */}
        <div className="parsing-status">
          <h2>🔄 Parsing Status</h2>
          {isLoading ? (
            <div className="status-loading">
              <span className="spinner">⏳</span> Processing...
            </div>
          ) : parsingError ? (
            <div className="status-error">
              ❌ Parsing failed - check console for details
            </div>
          ) : parsedResults ? (
            <div className="status-success">
              ✅ Successfully parsed Grade {parsedResults.gradeContext?.grade} results
              <div className="parsing-details">
                <span>📚 {parsedResults.programs?.length || 0} programs</span>
                <span>💰 {parsedResults.bursaries?.length || 0} bursaries</span>
                <span>📋 {parsedResults.actionPlan?.actionItems?.length || 0} action items</span>
              </div>
            </div>
          ) : (
            <div className="status-idle">
              ⏸️ Select a grade level to test parsing
            </div>
          )}
        </div>

        {/* Card Layout Preview */}
        {parsedResults && (
          <div className="card-preview">
            <h2>🎨 Card Layout Preview</h2>
            <div className="preview-container">
              <ResultsCardLayout parsedResults={parsedResults} />
            </div>
          </div>
        )}

        {/* Raw Data Inspector */}
        {parsedResults && (
          <details className="data-inspector">
            <summary>🔍 Inspect Parsed Data</summary>
            <pre className="data-json">
              {JSON.stringify(parsedResults, null, 2)}
            </pre>
          </details>
        )}

      </div>

      <style jsx>{`
        .test-page {
          min-height: 100vh;
          background: #f8fafc;
          padding: 20px;
        }

        .test-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .test-header {
          text-align: center;
          margin-bottom: 40px;
          padding: 30px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .test-header h1 {
          font-size: 32px;
          color: #1f2937;
          margin: 0 0 12px 0;
        }

        .test-header p {
          font-size: 16px;
          color: #6b7280;
          margin: 0;
        }

        .test-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .control-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .control-group label {
          font-weight: 600;
          color: #374151;
        }

        .grade-select {
          padding: 8px 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          min-width: 200px;
        }

        .grade-select:focus {
          outline: none;
          border-color: #10b981;
        }

        .control-actions {
          display: flex;
          gap: 12px;
        }

        .btn-primary, .btn-secondary {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #10b981;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #059669;
        }

        .btn-primary:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .btn-secondary:disabled {
          background: #f9fafb;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .test-results-summary {
          margin-bottom: 30px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .test-results-summary h2 {
          margin: 0 0 20px 0;
          color: #1f2937;
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .result-card {
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }

        .result-card.success {
          background: #f0fdf4;
          border: 2px solid #10b981;
        }

        .result-card.error {
          background: #fef2f2;
          border: 2px solid #ef4444;
        }

        .result-card.info {
          background: #eff6ff;
          border: 2px solid #3b82f6;
        }

        .result-card h3 {
          margin: 0 0 8px 0;
          font-size: 14px;
        }

        .result-number {
          font-size: 32px;
          font-weight: 700;
        }

        .error-message {
          padding: 16px;
          background: #fef2f2;
          border: 2px solid #ef4444;
          border-radius: 8px;
          color: #991b1b;
        }

        .parsing-status {
          margin-bottom: 30px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .parsing-status h2 {
          margin: 0 0 16px 0;
          color: #1f2937;
        }

        .status-loading, .status-error, .status-success, .status-idle {
          padding: 16px;
          border-radius: 8px;
          font-weight: 500;
        }

        .status-loading {
          background: #fffbeb;
          border: 2px solid #f59e0b;
          color: #92400e;
        }

        .status-error {
          background: #fef2f2;
          border: 2px solid #ef4444;
          color: #991b1b;
        }

        .status-success {
          background: #f0fdf4;
          border: 2px solid #10b981;
          color: #065f46;
        }

        .status-idle {
          background: #f8fafc;
          border: 2px solid #e5e7eb;
          color: #6b7280;
        }

        .parsing-details {
          display: flex;
          gap: 16px;
          margin-top: 8px;
          font-size: 14px;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .card-preview {
          margin-bottom: 30px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .card-preview h2 {
          margin: 0 0 20px 0;
          color: #1f2937;
        }

        .preview-container {
          border: 2px dashed #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          background: #f9fafb;
        }

        .data-inspector {
          margin-bottom: 30px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .data-inspector summary {
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          margin-bottom: 16px;
        }

        .data-json {
          background: #1f2937;
          color: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
          font-size: 12px;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .test-controls {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .control-actions {
            justify-content: center;
          }

          .results-grid {
            grid-template-columns: 1fr;
          }

          .parsing-details {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}