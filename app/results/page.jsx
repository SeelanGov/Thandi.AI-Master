'use client';

import { useEffect, useState } from 'react';

import ThandiChat from './components/ThandiChat';
import ResultsCardLayout from './components/ResultsCardLayout';
import { ResultsParser } from './services/resultsParser';
import { formatResponse, getFormattedContentStyles } from './utils/formatResponse';
import { trackEnhancedRecommendations, trackEnhancementFeature } from '@/lib/analytics/track-events';
import './styles/global.css';

export default function ResultsPage() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);
  const [parsedResults, setParsedResults] = useState(null);
  const [parsingError, setParsingError] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  useEffect(() => {
    // Check if user just registered
    const urlParams = new URLSearchParams(window.location.search);
    const registeredParam = urlParams.get('registered');
    
    if (registeredParam === 'true') {
      setJustRegistered(true);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    
    const saved = localStorage.getItem('thandi_results');
    
    if (!saved) {
      // No results, redirect to assessment
      window.location.href = '/assessment';
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      
      // CRITICAL: Validate footer is present
      const responseText = parsed.fullResponse || parsed.response;
      if (!responseText || !responseText.includes('⚠️')) {
        console.error('🚨 FOOTER MISSING - SAFETY BREACH');
        alert('System error: Verification warning missing. Please try again.');
        window.location.href = '/assessment';
        return;
      }
      
      setResults(parsed);
      
      // Check if user is anonymous
      const sessionToken = localStorage.getItem('thandi_session_token');
      const studentToken = localStorage.getItem('Thandi_student_token');
      
      if (sessionToken && !studentToken) {
        try {
          const sessionData = JSON.parse(atob(sessionToken));
          if (sessionData.anonymous) {
            setIsAnonymous(true);
          }
        } catch (e) {
          console.error('Error parsing session token:', e);
        }
      }
      
      console.log('📊 Results loaded:', parsed);
      console.log('👤 User type:', isAnonymous ? 'Anonymous' : 'Registered');
      console.log('✅ Footer verified:', responseText.includes('⚠️ **Verify before you decide'));
      console.log('🚪 Gate data:', parsed.gate);
      
      // Track enhanced recommendations
      const hasEnhancement = responseText.includes('University') && responseText.includes('APS');
      const programsCount = (responseText.match(/University of|UCT|UJ|Wits|TUT/g) || []).length;
      const bursariesCount = (responseText.match(/Bursary|NSFAS|Sasol/g) || []).length;
      
      if (hasEnhancement) {
        trackEnhancedRecommendations(parsed.grade, programsCount, bursariesCount);
        trackEnhancementFeature('specific_programs', parsed.grade, true);
      }
    } catch (error) {
      console.error('Error loading results:', error);
      window.location.href = '/test';
    } finally {
      setLoading(false);
    }
  }, []);

  // Parse results for card layout when results are loaded
  useEffect(() => {
    if (results) {
      try {
        const studentGrade = results.grade || results.metadata?.grade || '12';
        const rawResponse = results.fullResponse || results.response;
        
        console.log('🔄 Parsing results for card layout, Grade:', studentGrade);
        
        const parsed = ResultsParser.parseResults(rawResponse, studentGrade);
        setParsedResults(parsed);
        setParsingError(false);
        
        console.log('✅ Results parsed successfully:', parsed);
      } catch (error) {
        console.error('❌ Failed to parse results for card layout:', error);
        setParsingError(true);
        // Fall back to original text rendering
      }
    }
  }, [results]);

  const startNewAssessment = () => {
    localStorage.removeItem('thandi_assessment_data');
    localStorage.removeItem('thandi_results');
    window.location.href = '/assessment';
  };

  const handleRegisterNow = () => {
    // Store current results for after registration
    localStorage.setItem('thandi_results_backup', localStorage.getItem('thandi_results'));
    
    // Clear session token to force registration
    localStorage.removeItem('thandi_session_token');
    
    // Redirect to assessment with registration flag
    window.location.href = '/assessment?register=true';
  };

  const downloadPDF = async () => {
    if (!results) {
      alert('No results available for PDF generation');
      return;
    }

    setPdfGenerating(true);
    
    try {
      console.log('🔄 Starting PDF download...');
      
      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          results: results,
          sessionId: Date.now().toString()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'PDF generation failed');
      }

      // Get PDF blob
      const pdfBlob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `career-guidance-grade-${results.grade || '12'}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
      
      console.log('✅ PDF downloaded successfully');
      
    } catch (error) {
      console.error('❌ PDF download failed:', error);
      alert(`PDF download failed: ${error.message}`);
    } finally {
      setPdfGenerating(false);
    }
  };

  // PDF functionality removed for systematic approach - will be re-implemented as separate feature

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '18px',
        color: '#6b7280'
      }}>
        Loading your results...
      </div>
    );
  }

  if (!results) {
    return null;
  }

  return (
    <div className="results-page">
      <div className="results-container">
        <div className="results-header">
          <h1>Your Career Matches</h1>
          <div className="header-actions">
            <button 
              onClick={downloadPDF} 
              className="btn-primary"
              disabled={pdfGenerating}
            >
              {pdfGenerating ? 'Generating PDF...' : 'Download PDF'}
            </button>
            <button onClick={startNewAssessment} className="btn-secondary">
              Start New Assessment
            </button>
          </div>
        </div>

        {/* Registration Success Message */}
        {justRegistered && (
          <div className="registration-success">
            <div className="registration-success-content">
              <div className="registration-success-icon">🎉</div>
              <div className="registration-success-text">
                <h3>Welcome to Thandi! Registration Complete</h3>
                <p>Your career results are now saved to your account. You'll get access to your student dashboard soon!</p>
              </div>
            </div>
          </div>
        )}

        {/* CRITICAL: Top warning banner */}
        <div className="warning-banner">
          <p className="warning-title">⚠️ READ THIS FIRST</p>
          <p className="warning-text">
            The advice below is AI-generated. You MUST verify it with real people before making any decision.
          </p>
        </div>

        {/* Anonymous User Registration CTA */}
        {isAnonymous && (
          <div className="registration-cta">
            <div className="registration-cta-content">
              <div className="registration-cta-icon">
                🎯
              </div>
              <div className="registration-cta-text">
                <h3>Want to save your results and get a student dashboard?</h3>
                <p>Register now to access your personalized career plan, track your progress, and get updates on bursaries and applications.</p>
              </div>
              <button onClick={handleRegisterNow} className="registration-cta-button">
                Register Now - Get Your Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Gate Warning Section */}
        {results.gate && results.gate.metadata && (
          <div className={`gate-warning ${results.gate.metadata.urgency}`}>
            <div className="gate-icon">
              {results.gate.metadata.urgency === 'critical' && '⛔'}
              {results.gate.metadata.urgency === 'high' && '⚠️'}
              {results.gate.metadata.urgency === 'medium' && '📊'}
              {results.gate.metadata.urgency === 'low' && 'ℹ️'}
            </div>
            <div className="gate-content">
              <h2>
                {results.gate.metadata.urgency === 'critical' && 'CRITICAL DECISION'}
                {results.gate.metadata.urgency === 'high' && 'IMPORTANT NOTICE'}
                {results.gate.metadata.urgency === 'medium' && 'PERFORMANCE ALERT'}
                {results.gate.metadata.urgency === 'low' && 'INFORMATION'}
              </h2>
              <div className="gate-text" dangerouslySetInnerHTML={{ __html: results.gate.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </div>
          </div>
        )}

        <div className="results-content">
          {parsingError ? (
            // Fallback to original text rendering on parsing errors
            <div className="fallback-notice">
              <p className="fallback-title">📝 Text Format</p>
              <p className="fallback-subtitle">Displaying results in text format</p>
              <div 
                className="response-text formatted-content"
                dangerouslySetInnerHTML={{ 
                  __html: formatResponse(results.fullResponse || results.response) 
                }}
              />
              <style dangerouslySetInnerHTML={{ __html: getFormattedContentStyles() }} />
            </div>
          ) : parsedResults ? (
            // New card-based layout
            <div className="card-layout-container">
              <div className="layout-header">
                <h2 className="layout-title">Your Personalized Career Guidance</h2>
                <p className="layout-subtitle">
                  Grade {parsedResults.gradeContext?.grade} • {parsedResults.gradeContext?.phase}
                </p>
              </div>
              <ResultsCardLayout parsedResults={parsedResults} />
            </div>
          ) : (
            // Loading state for parsing
            <div className="parsing-loading">
              <p>Processing your results...</p>
            </div>
          )}
        </div>

        {/* CRITICAL: Bottom footer backup */}
        <div className="footer-backup">
          <p className="footer-title">⚠️ VERIFY THIS INFORMATION BEFORE DECIDING</p>
          <ol className="footer-list">
            <li>Speak with your school counselor</li>
            <li>Call the institution directly</li>
            <li>Check official websites</li>
          </ol>
          <p className="footer-note">
            Thandi's data may be outdated. Always confirm with real people.
          </p>
        </div>

        {results.metadata?.mockTest && (
          <div className="mock-notice">
            ℹ️ This is a mock response for testing. Real responses will include personalized career recommendations based on your actual profile.
          </div>
        )}

        {/* Chat Component */}
        <ThandiChat 
          assessmentData={{
            grade: results.metadata?.grade,
            enjoyedSubjects: results.metadata?.enjoyedSubjects,
            interests: results.metadata?.interests,
            curriculumProfile: results.metadata?.curriculumProfile,
            topCareer: results.metadata?.topCareer || 'See recommendations above'
          }}
        />
      </div>

      <style jsx>{`
        .results-page {
          min-height: 100vh;
          background: #f9fafb;
          padding: 40px 20px;
        }

        .results-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid #e5e7eb;
        }

        .results-header h1 {
          font-size: 28px;
          color: #1a1a1a;
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .btn-primary {
          padding: 10px 20px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          background: #059669;
        }

        .btn-primary:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .btn-secondary {
          padding: 10px 20px;
          background: #f3f4f6;
          color: #374151;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .results-content {
          line-height: 1.8;
          color: #374151;
        }

        /* New Card Layout Styles */
        .card-layout-container {
          margin-top: 0;
        }

        .layout-header {
          text-align: center;
          margin-bottom: 32px;
          padding: 24px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 12px;
          color: white;
        }

        .layout-title {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .layout-subtitle {
          font-size: 16px;
          margin: 0;
          opacity: 0.9;
        }

        .fallback-notice {
          background: #fef3c7;
          border: 2px solid #f59e0b;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .fallback-title {
          font-size: 18px;
          font-weight: 600;
          color: #92400e;
          margin: 0 0 8px 0;
        }

        .fallback-subtitle {
          font-size: 14px;
          color: #92400e;
          margin: 0 0 16px 0;
        }

        .parsing-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
          color: #6b7280;
          font-size: 16px;
        }

        .response-text {
          font-size: 16px;
        }

        /* Enhanced Content Formatting */
        .formatted-content {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .content-section {
          margin-bottom: 32px;
          padding: 24px;
          background: #fafafa;
          border-radius: 12px;
          border-left: 4px solid #10b981;
        }

        .section-header {
          margin-bottom: 20px;
        }

        .main-header {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 16px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid #e5e7eb;
        }

        .sub-header {
          font-size: 20px;
          font-weight: 600;
          color: #374151;
          margin: 0 0 12px 0;
        }

        .subsection {
          margin: 20px 0;
          padding: 16px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .program-card {
          margin: 20px 0;
          padding: 20px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 12px;
          border: 2px solid #0ea5e9;
          box-shadow: 0 2px 8px rgba(14, 165, 233, 0.1);
        }

        .program-title {
          font-size: 18px;
          font-weight: 600;
          color: #0c4a6e;
          margin: 0 0 12px 0;
        }

        .key-value {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .key-value:last-child {
          border-bottom: none;
        }

        .key {
          font-weight: 500;
          color: #6b7280;
          flex: 1;
        }

        .value {
          font-weight: 600;
          color: #1f2937;
          text-align: right;
          flex: 1;
        }

        .score-item {
          background: #f0fdf4;
          padding: 12px;
          border-radius: 8px;
          border-left: 4px solid #10b981;
          margin: 8px 0;
        }

        .score-item .key {
          color: #065f46;
        }

        .score-item .value {
          color: #059669;
          font-weight: 700;
        }

        .deadline-item {
          background: #fef3c7;
          padding: 12px;
          border-radius: 8px;
          border-left: 4px solid #f59e0b;
          margin: 8px 0;
        }

        .deadline-item .key {
          color: #92400e;
        }

        .deadline-item .value {
          color: #d97706;
          font-weight: 700;
        }

        .chance-item {
          background: #ecfdf5;
          padding: 12px;
          border-radius: 8px;
          border-left: 4px solid #10b981;
          margin: 8px 0;
        }

        .chance-item .key {
          color: #065f46;
        }

        .chance-item .value {
          color: #059669;
          font-weight: 700;
        }

        .bullet-item {
          display: flex;
          align-items: flex-start;
          margin: 8px 0;
          padding: 8px 0;
        }

        .bullet {
          color: #10b981;
          font-weight: bold;
          margin-right: 12px;
          font-size: 18px;
          line-height: 1.2;
        }

        .bullet-item .content {
          flex: 1;
          line-height: 1.6;
        }

        .paragraph {
          margin: 12px 0;
          line-height: 1.7;
          font-size: 16px;
        }

        .highlight {
          background: #fef3c7;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
          color: #92400e;
        }

        .status-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          font-size: 14px;
          margin: 0 4px;
        }

        .status-icon.success {
          background: #dcfce7;
          color: #166534;
        }

        .status-icon.warning {
          background: #fef3c7;
          color: #92400e;
        }

        .status-icon.critical {
          background: #fecaca;
          color: #991b1b;
        }

        .status-icon.info {
          background: #dbeafe;
          color: #1e40af;
        }

        .metric {
          background: #f3f4f6;
          padding: 2px 8px;
          border-radius: 6px;
          font-weight: 600;
          color: #374151;
          font-family: 'SF Mono', Monaco, monospace;
        }

        .warning-banner {
          margin-bottom: 24px;
          padding: 20px;
          background: #ffeaa7;
          border: 3px solid #e74c3c;
          border-radius: 8px;
        }

        .warning-title {
          font-size: 18px;
          font-weight: bold;
          color: #c0392b;
          margin: 0 0 10px 0;
        }

        .warning-text {
          margin: 0;
          color: #2c3e50;
          font-size: 15px;
        }

        .footer-backup {
          margin-top: 40px;
          padding: 20px;
          background: #fff3cd;
          border-top: 3px solid #e74c3c;
          border-radius: 8px;
        }

        .footer-title {
          color: #d63031;
          font-weight: bold;
          font-size: 18px;
          margin: 0 0 15px 0;
        }

        .footer-list {
          color: #856404;
          margin: 0 0 15px 0;
          padding-left: 20px;
        }

        .footer-note {
          margin: 0;
          color: #856404;
          font-style: italic;
          font-size: 14px;
        }

        .registration-cta {
          margin: 24px 0;
          padding: 24px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }

        .registration-cta-content {
          display: flex;
          align-items: center;
          gap: 20px;
          color: white;
        }

        .registration-cta-icon {
          font-size: 32px;
          flex-shrink: 0;
        }

        .registration-cta-text {
          flex: 1;
        }

        .registration-cta-text h3 {
          margin: 0 0 8px 0;
          font-size: 20px;
          font-weight: 600;
          color: white;
        }

        .registration-cta-text p {
          margin: 0;
          font-size: 16px;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.5;
        }

        .registration-cta-button {
          padding: 12px 24px;
          background: white;
          color: #059669;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .registration-cta-button:hover {
          background: #f9fafb;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .registration-success {
          margin: 24px 0;
          padding: 20px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
          animation: slideIn 0.5s ease-out;
        }

        .registration-success-content {
          display: flex;
          align-items: center;
          gap: 16px;
          color: white;
        }

        .registration-success-icon {
          font-size: 28px;
          flex-shrink: 0;
        }

        .registration-success-text h3 {
          margin: 0 0 6px 0;
          font-size: 18px;
          font-weight: 600;
          color: white;
        }

        .registration-success-text p {
          margin: 0;
          font-size: 15px;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.4;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .mock-notice {
          margin-top: 32px;
          padding: 16px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          color: #1e40af;
          font-size: 14px;
        }

        .gate-warning {
          margin: 24px 0;
          padding: 24px;
          border-radius: 12px;
          border: 3px solid;
          display: flex;
          gap: 16px;
          align-items: start;
        }

        .gate-warning.critical {
          background: #fef2f2;
          border-color: #dc2626;
        }

        .gate-warning.high {
          background: #fffbeb;
          border-color: #f59e0b;
        }

        .gate-warning.medium {
          background: #eff6ff;
          border-color: #3b82f6;
        }

        .gate-warning.low {
          background: #f0fdf4;
          border-color: #10b981;
        }

        .gate-icon {
          font-size: 32px;
          flex-shrink: 0;
        }

        .gate-content {
          flex: 1;
        }

        .gate-content h2 {
          margin: 0 0 12px 0;
          font-size: 20px;
          font-weight: bold;
        }

        .gate-warning.critical h2 {
          color: #dc2626;
        }

        .gate-warning.high h2 {
          color: #f59e0b;
        }

        .gate-warning.medium h2 {
          color: #3b82f6;
        }

        .gate-warning.low h2 {
          color: #10b981;
        }

        .gate-text {
          line-height: 1.6;
          color: #374151;
        }

        .gate-text strong {
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .results-page {
            padding: 20px 15px;
          }

          .results-container {
            padding: 24px 20px;
          }

          .results-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .results-header h1 {
            font-size: 24px;
          }

          .header-actions {
            flex-direction: column;
            width: 100%;
          }

          .btn-primary,
          .btn-secondary {
            width: 100%;
          }

          .response-text {
            font-size: 15px;
          }

          .registration-cta-content {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }

          .registration-cta-text h3 {
            font-size: 18px;
          }

          .registration-cta-text p {
            font-size: 15px;
          }

          .registration-cta-button {
            width: 100%;
            padding: 14px 20px;
          }

          .registration-success-content {
            flex-direction: column;
            text-align: center;
            gap: 12px;
          }

          .registration-success-text h3 {
            font-size: 16px;
          }

          .registration-success-text p {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
