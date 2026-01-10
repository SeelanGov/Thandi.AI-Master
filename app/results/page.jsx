'use client';

import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import ThandiChat from './components/ThandiChat';
import { trackEnhancedRecommendations, trackPDFDownload, trackEnhancementFeature } from '@/lib/analytics/track-events';
import { ThandiResultsFormatter } from '@/lib/thandi-results-formatter';
import './styles/thandi-results.css';

export default function ResultsPage() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);

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
    if (!results) return;

    try {
      // Show loading state
      console.log('🔄 Generating professional PDF...');
      
      // Create professional PDF with Thandi branding
      const { ThandiPDFGenerator } = await import('@/lib/thandi-pdf-generator');
      const generator = new ThandiPDFGenerator(results, {
        name: 'Student', // Can be enhanced with actual student data
        grade: results.metadata?.grade || '12'
      });
      
      const pdf = await generator.generateProfessionalReport();
      
      // Professional filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Thandi-Career-Report-${timestamp}.pdf`;
      
      pdf.save(filename);
      
      // Track enhanced PDF download
      trackPDFDownload(results.metadata?.grade || '12', true, 'professional');
      
      console.log('✅ Professional PDF generated successfully');
      
    } catch (error) {
      console.error('❌ Professional PDF generation failed:', error);
      
      // Fallback to basic PDF generation
      console.log('🔄 Falling back to basic PDF...');
      generateBasicPDF();
    }
  };

  // Keep existing basic PDF as fallback
  const generateBasicPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = 30;

    // Thandi brand colors (RGB values for PDF)
    const thandiColors = {
      primary: [17, 78, 78],        // Thandi teal
      gold: [223, 163, 58],         // Thandi gold
      cream: [243, 230, 201],       // Background
      brown: [92, 59, 32],          // Text accent
      white: [255, 255, 255],
      black: [0, 0, 0],
      gray: [107, 114, 128]
    };

    // Add basic Thandi header
    pdf.setFillColor(...thandiColors.primary);
    pdf.rect(0, 0, pageWidth, 30, 'F');
    
    pdf.setTextColor(...thandiColors.white);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text('THANDI.AI', margin, 20);
    
    pdf.setFontSize(10);
    pdf.text('Career Guidance Report', margin, 25);
    
    yPosition = 50;
    
    // Basic content
    pdf.setTextColor(...thandiColors.black);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text('Your Career Guidance Report', margin, yPosition);
    yPosition += 20;
    
    // Add basic content
    const content = results.fullResponse || results.response || '';
    const lines = content.split('\n');
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    
    lines.forEach((line) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 30;
      }
      
      const cleanLine = line.replace(/\*\*/g, '').replace(/<[^>]*>/g, '');
      if (cleanLine.trim()) {
        const textLines = pdf.splitTextToSize(cleanLine, maxWidth);
        pdf.text(textLines, margin, yPosition);
        yPosition += textLines.length * 6 + 3;
      }
    });
    
    // Save basic PDF
    const timestamp = new Date().toISOString().split('T')[0];
    pdf.save(`thandi-career-guidance-${timestamp}.pdf`);
    
    // Track basic PDF download
    const hasEnhancedContent = results.response?.includes('University') && results.response?.includes('APS');
    trackPDFDownload(results.grade, hasEnhancedContent, 'basic');
  };

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
        🔍 TESTING: Enhanced formatting code is present - Loading your results...
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
            <button onClick={downloadPDF} className="btn-primary">
              📄 Download PDF
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
          {/* Render response with markdown-style formatting */}
          <div 
            className="response-text"
            dangerouslySetInnerHTML={{ 
              __html: formatResponse(results.fullResponse || results.response) 
            }}
          />
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

        .btn-primary:hover {
          background: #059669;
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

        .response-text {
          font-size: 16px;
        }

        /* Enhanced Content Formatting - Student-Friendly Design */
        .formatted-content.student-friendly {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .content-section.enhanced {
          margin-bottom: 32px;
          padding: 24px;
          background: #fafafa;
          border-radius: 12px;
          border-left: 4px solid #10b981;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
        }

        .content-section.enhanced:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
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
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-icon {
          font-size: 28px;
          color: #10b981;
        }

        .sub-header {
          font-size: 20px;
          font-weight: 600;
          color: #374151;
          margin: 0 0 12px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-icon {
          font-size: 18px;
          color: #10b981;
        }

        .subsection.enhanced {
          margin: 20px 0;
          padding: 16px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .program-card.enhanced {
          margin: 20px 0;
          padding: 0;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 12px;
          border: 2px solid #0ea5e9;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.15);
          overflow: hidden;
        }

        .program-header {
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          color: white;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .program-number {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 16px;
        }

        .program-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          flex: 1;
        }

        .program-content {
          padding: 20px;
        }

        .key-value.enhanced {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          margin: 8px 0;
          background: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
        }

        .key-value.enhanced:hover {
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }

        .key-section {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .key-icon {
          font-size: 18px;
          color: #10b981;
        }

        .key {
          font-weight: 500;
          color: #6b7280;
        }

        .value-section {
          text-align: right;
        }

        .value {
          font-weight: 600;
          color: #1f2937;
          font-size: 16px;
        }

        .score-item {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-color: #10b981;
        }

        .score-item .key-icon {
          color: #059669;
        }

        .score-item .value {
          color: #059669;
          font-weight: 700;
          font-size: 18px;
        }

        .deadline-item {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-color: #f59e0b;
        }

        .deadline-item .key-icon {
          color: #d97706;
        }

        .deadline-item .value {
          color: #d97706;
          font-weight: 700;
        }

        .chance-item {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border-color: #10b981;
        }

        .chance-item .key-icon {
          color: #059669;
        }

        .chance-item .value {
          color: #059669;
          font-weight: 700;
        }

        .university-item {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border-color: #3b82f6;
        }

        .university-item .key-icon {
          color: #2563eb;
        }

        .university-item .value {
          color: #2563eb;
          font-weight: 600;
        }

        .subject-item {
          background: linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%);
          border-color: #a855f7;
        }

        .subject-item .key-icon {
          color: #9333ea;
        }

        .subject-item .value {
          color: #9333ea;
          font-weight: 600;
        }

        .bullet-item {
          display: flex;
          align-items: flex-start;
          margin: 12px 0;
          padding: 12px 16px;
          background: white;
          border-radius: 8px;
          border-left: 4px solid #10b981;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
        }

        .bullet-item:hover {
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          transform: translateX(2px);
        }

        .bullet {
          color: #10b981;
          font-weight: bold;
          margin-right: 12px;
          font-size: 18px;
          line-height: 1.2;
          min-width: 20px;
        }

        .deadline-bullet {
          border-left-color: #f59e0b;
        }

        .deadline-bullet .bullet {
          color: #f59e0b;
        }

        .requirement-bullet {
          border-left-color: #3b82f6;
        }

        .requirement-bullet .bullet {
          color: #3b82f6;
        }

        .funding-bullet {
          border-left-color: #10b981;
        }

        .funding-bullet .bullet {
          color: #10b981;
        }

        .bullet-item .content {
          flex: 1;
          line-height: 1.6;
          font-size: 15px;
        }

        .paragraph.enhanced {
          margin: 12px 0;
          line-height: 1.7;
          font-size: 16px;
          padding: 12px 0;
        }

        .highlight {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
          color: #92400e;
        }

        .grade-highlight {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
          color: #1e40af;
        }

        .aps-highlight {
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
          color: #166534;
        }

        .percentage-highlight {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
          color: #166534;
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

        .metric.range {
          background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
          color: #0c4a6e;
          font-weight: 700;
        }

        .university-highlight {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
          color: #1e40af;
        }

        .deadline-highlight {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
          color: #d97706;
        }

        .subject-highlight {
          background: linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
          color: #9333ea;
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

function formatResponse(text) {
  if (!text) return '';
  
  try {
    // PERMANENT SOLUTION: Use ResultsData class for structured parsing
    console.log('🔄 Results Page: Using ResultsData for content formatting');
    
    // Extract grade from results metadata or localStorage
    const savedResults = localStorage.getItem('thandi_results');
    let grade = '12'; // default
    
    if (savedResults) {
      try {
        const parsed = JSON.parse(savedResults);
        grade = parsed.metadata?.grade || parsed.grade || '12';
      } catch (e) {
        console.warn('Could not parse saved results for grade');
      }
    }
    
    // Use ThandiResultsFormatter with enhanced structured data
    const formatter = new ThandiResultsFormatter();
    const formattedContent = formatter.formatResponse(text);
    
    console.log('✅ Results Page: Content formatted successfully with Thandi branding');
    
    return formattedContent;
    
  } catch (error) {
    console.error('❌ Results Page: Thandi formatter error:', error);
    
    // Enhanced fallback with better error handling
    console.log('🔄 Results Page: Using fallback formatting');
    
    return text
      .replace(/\n/g, '<br/>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/###\s+(.+)/g, '<h3 style="color: #114E4E; margin: 1.5rem 0 0.5rem 0;">$1</h3>')
      .replace(/##\s+(.+)/g, '<h2 style="color: #114E4E; margin: 2rem 0 1rem 0;">$1</h2>')
      .replace(/[-•]\s+(.+)/g, '<div style="margin: 0.5rem 0; padding-left: 1rem;">• $1</div>');
  }
}


