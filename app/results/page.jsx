'use client';

import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import ThandiChat from './components/ThandiChat';
import { trackEnhancedRecommendations, trackPDFDownload, trackEnhancementFeature } from '@/lib/analytics/track-events';

export default function ResultsPage() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      console.log('📊 Results loaded:', parsed);
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

  const downloadPDF = () => {
    if (!results) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = 30;

    // Helper function to check if we need a new page
    const checkPageBreak = (requiredSpace) => {
      if (yPosition + requiredSpace > pageHeight - 30) {
        pdf.addPage();
        yPosition = 30;
        return true;
      }
      return false;
    };

    // Helper function to add text with proper line spacing
    const addText = (text, fontSize = 11, isBold = false, indent = 0) => {
      pdf.setFontSize(fontSize);
      pdf.setTextColor(0, 0, 0);
      
      const lines = pdf.splitTextToSize(text, maxWidth - indent);
      lines.forEach((line) => {
        checkPageBreak(8);
        pdf.text(line, margin + indent, yPosition);
        yPosition += fontSize * 0.5;
      });
      yPosition += 3; // Extra spacing after paragraph
    };

    // 1. Add header/logo
    pdf.setFontSize(20);
    pdf.setTextColor(0, 0, 0);
    pdf.text('THANDI.AI Career Guidance', margin, yPosition);
    yPosition += 15;

    // 2. Add top warning (RED, PROMINENT)
    checkPageBreak(40);
    pdf.setFillColor(255, 234, 167); // Yellow background
    pdf.rect(margin - 5, yPosition - 5, maxWidth + 10, 35, 'F');
    
    pdf.setFontSize(14);
    pdf.setTextColor(231, 76, 60); // Red
    pdf.text('⚠️ READ THIS FIRST:', margin, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    const warning = "This is AI-generated advice. You MUST verify it with real people before making any decision.";
    const warningLines = pdf.splitTextToSize(warning, maxWidth);
    pdf.text(warningLines, margin, yPosition);
    yPosition += (warningLines.length * 6) + 15;

    // 3. Add full response content with proper formatting
    checkPageBreak(20);
    
    const content = results.fullResponse || results.response || '';
    
    // Clean and parse content
    const cleanContent = content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/⚠️[^:]*:/g, '') // Remove warning headers (we have them separately)
      .replace(/---+/g, ''); // Remove separator lines
    
    // Split into lines and process each one
    const lines = cleanContent.split('\n');
    
    lines.forEach((line) => {
      line = line.trim();
      if (!line) {
        yPosition += 3; // Empty line = small space
        return;
      }

      // Check if it's a heading (starts with ###, ##, or #)
      if (line.startsWith('###')) {
        checkPageBreak(15);
        yPosition += 5;
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        const headingText = line.replace(/^###\s*/, '');
        const headingLines = pdf.splitTextToSize(headingText, maxWidth);
        pdf.text(headingLines, margin, yPosition);
        yPosition += headingLines.length * 7 + 5;
        pdf.setFont(undefined, 'normal');
        return;
      }

      // Check if it's a numbered list item (starts with "1.", "2.", etc.)
      const numberedMatch = line.match(/^(\d+)\.\s*(.+)/);
      if (numberedMatch) {
        checkPageBreak(10);
        pdf.setFontSize(11);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont(undefined, 'bold');
        pdf.text(`${numberedMatch[1]}.`, margin, yPosition);
        pdf.setFont(undefined, 'normal');
        
        const itemText = numberedMatch[2].replace(/\*\*/g, ''); // Remove markdown bold
        const itemLines = pdf.splitTextToSize(itemText, maxWidth - 15);
        itemLines.forEach((itemLine, idx) => {
          if (idx > 0) checkPageBreak(7);
          pdf.text(itemLine, margin + 15, yPosition);
          yPosition += 6;
        });
        yPosition += 2;
        return;
      }

      // Check if it's a bullet point (starts with "- " or "* ")
      if (line.startsWith('- ') || line.startsWith('* ')) {
        checkPageBreak(10);
        pdf.setFontSize(11);
        pdf.setTextColor(0, 0, 0);
        pdf.text('•', margin + 5, yPosition);
        
        const bulletText = line.substring(2).replace(/\*\*/g, ''); // Remove markdown bold
        const bulletLines = pdf.splitTextToSize(bulletText, maxWidth - 15);
        bulletLines.forEach((bulletLine, idx) => {
          if (idx > 0) checkPageBreak(7);
          pdf.text(bulletLine, margin + 15, yPosition);
          yPosition += 6;
        });
        yPosition += 2;
        return;
      }

      // Check if it's bold text (wrapped in **)
      const boldMatch = line.match(/^\*\*(.+)\*\*$/);
      if (boldMatch) {
        checkPageBreak(10);
        pdf.setFontSize(11);
        pdf.setFont(undefined, 'bold');
        const boldLines = pdf.splitTextToSize(boldMatch[1], maxWidth);
        pdf.text(boldLines, margin, yPosition);
        yPosition += boldLines.length * 6 + 3;
        pdf.setFont(undefined, 'normal');
        return;
      }

      // Regular paragraph text
      checkPageBreak(10);
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont(undefined, 'normal');
      const cleanLine = line.replace(/\*\*/g, ''); // Remove any remaining markdown
      const paraLines = pdf.splitTextToSize(cleanLine, maxWidth);
      pdf.text(paraLines, margin, yPosition);
      yPosition += paraLines.length * 6 + 3;
    });

    // 4. Add bottom verification footer
    yPosition += 10;
    checkPageBreak(50);
    
    pdf.setFillColor(255, 243, 205); // Light yellow
    pdf.rect(margin - 5, yPosition - 5, maxWidth + 10, 45, 'F');
    
    pdf.setFontSize(14);
    pdf.setTextColor(231, 76, 60); // Red
    pdf.setFont(undefined, 'bold');
    pdf.text('⚠️ VERIFY THIS INFORMATION BEFORE DECIDING', margin, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont(undefined, 'normal');
    pdf.text('1. Speak with your school counselor', margin, yPosition);
    yPosition += 7;
    pdf.text('2. Call the institution directly', margin, yPosition);
    yPosition += 7;
    pdf.text('3. Check official websites', margin, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    const footerNote = "Thandi's data may be outdated. Always confirm with real people.";
    const footerLines = pdf.splitTextToSize(footerNote, maxWidth);
    pdf.text(footerLines, margin, yPosition);

    // 5. Add page numbers
    const pageCount = pdf.internal.getNumberOfPages();
    pdf.setFont(undefined, 'normal');
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // 6. Save PDF
    const timestamp = new Date().toISOString().split('T')[0];
    pdf.save(`thandi-career-guidance-${timestamp}.pdf`);
    
    // Track PDF download with enhancement status
    const hasEnhancedContent = results.response?.includes('University') && results.response?.includes('APS');
    trackPDFDownload(results.grade, hasEnhancedContent);
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
            <button onClick={downloadPDF} className="btn-primary">
              📄 Download PDF
            </button>
            <button onClick={startNewAssessment} className="btn-secondary">
              Start New Assessment
            </button>
          </div>
        </div>

        {/* CRITICAL: Top warning banner */}
        <div className="warning-banner">
          <p className="warning-title">⚠️ READ THIS FIRST</p>
          <p className="warning-text">
            The advice below is AI-generated. You MUST verify it with real people before making any decision.
          </p>
        </div>

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
          white-space: pre-wrap;
          font-size: 16px;
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
        }
      `}</style>
    </div>
  );
}

function formatResponse(text) {
  if (!text) return '';
  
  // Format markdown-style text to HTML
  let formatted = text
    // Bold: **text** -> <strong>text</strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Numbered lists: "1. " -> keep as-is (CSS handles spacing)
    // Line breaks: \n -> <br>
    .replace(/\n/g, '<br>')
    // Paragraphs: double line breaks -> paragraph breaks
    .replace(/(<br>){2,}/g, '</p><p>');
  
  // Wrap in paragraph tags
  return `<p>${formatted}</p>`;
}
