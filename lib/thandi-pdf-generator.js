/**
 * Professional Thandi PDF Generator
 * Creates branded, professional career guidance reports
 * Phase 3 Implementation - Enhanced PDF Generation System
 * PERMANENT SOLUTION: Uses ResultsData class for structured content extraction
 */

import jsPDF from 'jspdf';
import { ResultsData } from './results-data.js';

export class ThandiPDFGenerator {
  constructor(results, studentData = {}) {
    // Handle both default and named exports of jsPDF
    const PDFConstructor = jsPDF.default || jsPDF;
    this.pdf = new PDFConstructor('p', 'mm', 'a4');
    this.results = results;
    this.studentData = studentData;
    
    // Thandi brand colors (RGB values for PDF)
    this.colors = {
      primary: [17, 78, 78],        // Thandi teal
      gold: [223, 163, 58],         // Thandi gold
      tealMid: [44, 122, 123],      // Secondary
      tealLight: [58, 183, 149],    // Light accent
      cream: [243, 230, 201],       // Background
      brown: [92, 59, 32],          // Text accent
      white: [255, 255, 255],
      black: [0, 0, 0],
      gray: [107, 114, 128]
    };
    
    this.fonts = {
      heading: 'helvetica',
      body: 'helvetica',
      mono: 'courier'
    };
    
    this.pageWidth = this.pdf.internal.pageSize.width;
    this.pageHeight = this.pdf.internal.pageSize.height;
    this.margin = 20;
    this.maxWidth = this.pageWidth - (this.margin * 2);
  }

  async generateProfessionalReport() {
    this.addCoverPage();
    this.addExecutiveSummary();
    await this.addResultsContent();
    this.addVerificationFooter();
    this.addPageNumbers();
    
    return this.pdf;
  }

  addCoverPage() {
    // Professional header band
    this.pdf.setFillColor(...this.colors.primary);
    this.pdf.rect(0, 0, this.pageWidth, 80, 'F');
    
    // Thandi branding
    this.pdf.setTextColor(...this.colors.white);
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(32);
    this.pdf.text('THANDI.AI', this.margin, 35);
    
    this.pdf.setFontSize(14);
    this.pdf.text('Career Guidance Report', this.margin, 50);
    
    // Gold accent line
    this.pdf.setFillColor(...this.colors.gold);
    this.pdf.rect(this.margin, 55, 60, 2, 'F');
    
    // Student information section
    this.pdf.setTextColor(...this.colors.black);
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(24);
    this.pdf.text('Your Career Guidance Report', this.margin, 110);
    
    // Student details
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(...this.colors.gray);
    
    const studentName = this.studentData.name || 'Student';
    const grade = this.getGradeFromResults();
    const date = new Date().toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
    
    this.pdf.text(`Prepared for: ${studentName}`, this.margin, 130);
    this.pdf.text(`Grade: ${grade}`, this.margin, 140);
    this.pdf.text(`Date: ${date}`, this.margin, 150);
    
    // Professional disclaimer box
    this.addDisclaimerBox(170);
  }

  addExecutiveSummary() {
    this.pdf.addPage();
    this.addPageHeader('Executive Summary');
    
    let yPos = 60;
    
    // Key metrics cards
    const grade = this.getGradeFromResults();
    const apsScore = this.extractAPSScore();
    const eligibility = this.extractEligibility();
    
    // Grade card
    yPos = this.addMetricCard('Grade Level', grade, this.margin, yPos);
    
    // APS card (if applicable)
    if (apsScore && grade !== '10') {
      yPos = this.addMetricCard('APS Score', apsScore, this.margin + 60, yPos - 40);
    } else {
      yPos = this.addMetricCard('Status', 'Foundation Year', this.margin + 60, yPos - 40);
    }
    
    // Eligibility card
    yPos = this.addMetricCard('University Eligible', eligibility ? 'Yes' : 'Building', this.margin + 120, yPos);
    
    yPos += 20;
    
    // Summary text
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(...this.colors.black);
    
    const summaryText = this.generateSummaryText(grade);
    const lines = this.pdf.splitTextToSize(summaryText, this.maxWidth);
    this.pdf.text(lines, this.margin, yPos);
  }

  async addResultsContent() {
    this.pdf.addPage();
    this.addPageHeader('Career Recommendations');
    
    let yPos = 60;
    
    // PERMANENT SOLUTION: Use ResultsData class for structured content extraction
    try {
      const grade = this.getGradeFromResults();
      const rawContent = this.results.fullResponse || this.results.response || '';
      
      console.log('🔄 PDF: Using ResultsData class for grade:', grade);
      
      // Create ResultsData instance and parse
      const resultsData = new ResultsData(rawContent, grade, this.results.metadata || {});
      const parsedData = await resultsData.parse();
      
      console.log('✅ PDF: Structured data extracted successfully');
      console.log('📊 PDF: Validation status:', resultsData.getValidationStatus());
      
      // Add structured content sections using parsed data
      yPos = this.addParsedPrograms(parsedData.programs, yPos);
      yPos = this.addParsedBursaries(parsedData.bursaries, yPos);
      yPos = this.addParsedActionPlan(parsedData.actionPlan, yPos);
      yPos = this.addParsedAlternatives(parsedData.alternativeOptions, yPos);
      
      // Add validation warnings if any
      if (resultsData.warnings.length > 0) {
        yPos = this.addValidationWarnings(resultsData.warnings, yPos);
      }
      
    } catch (error) {
      console.error('❌ PDF: ResultsData extraction failed:', error);
      
      // Enhanced fallback with error reporting
      yPos = this.addExtractionErrorSection(error.message, yPos);
      
      // Still try to add basic content
      const content = this.results.fullResponse || this.results.response || '';
      const sections = this.parseContentSections(content);
      
      sections.forEach(section => {
        if (yPos > this.pageHeight - 60) {
          this.pdf.addPage();
          this.addPageHeader('Career Recommendations (continued)');
          yPos = 60;
        }
        
        yPos = this.addContentSection(section, yPos);
      });
    }
  }

  addContentSection(section, yPos) {
    const lines = section.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      line = line.trim();
      if (!line) return;
      
      // Check for page break
      if (yPos > this.pageHeight - 40) {
        this.pdf.addPage();
        this.addPageHeader('Career Recommendations (continued)');
        yPos = 60;
      }
      
      // Headers
      if (line.match(/^##?\s+(.+)/)) {
        const headerText = line.replace(/^##?\s+/, '');
        yPos = this.addSectionHeader(headerText, yPos);
        return;
      }
      
      // Sub headers (programs)
      if (line.match(/^###\s+(.+)/)) {
        const headerText = line.replace(/^###\s+/, '');
        yPos = this.addProgramHeader(headerText, yPos);
        return;
      }
      
      // Key-value pairs
      const kvMatch = line.match(/^(.+?):\s*(.+)$/);
      if (kvMatch && !line.includes('http')) {
        const key = kvMatch[1].replace(/\*\*/g, '');
        const value = kvMatch[2].replace(/\*\*/g, '');
        yPos = this.addKeyValuePair(key, value, yPos);
        return;
      }
      
      // Bullet points
      if (line.match(/^[-*]\s+(.+)/)) {
        const content = line.replace(/^[-*]\s+/, '').replace(/\*\*/g, '');
        yPos = this.addBulletPoint(content, yPos);
        return;
      }
      
      // Regular paragraphs
      if (line.length > 0) {
        yPos = this.addParagraph(line, yPos);
      }
    });
    
    return yPos + 10;
  }

  addSectionHeader(text, yPos) {
    // Section header with Thandi styling
    this.pdf.setFillColor(...this.colors.primary, 0.1);
    this.pdf.rect(this.margin, yPos - 5, this.maxWidth, 15, 'F');
    
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(...this.colors.primary);
    this.pdf.text(text, this.margin + 5, yPos + 5);
    
    return yPos + 20;
  }

  addProgramHeader(text, yPos) {
    // Program header with gold accent
    this.pdf.setFillColor(...this.colors.gold, 0.2);
    this.pdf.rect(this.margin, yPos - 3, this.maxWidth, 12, 'F');
    
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(...this.colors.brown);
    this.pdf.text(text, this.margin + 3, yPos + 5);
    
    return yPos + 15;
  }

  addKeyValuePair(key, value, yPos) {
    // Key in regular font
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(...this.colors.gray);
    this.pdf.text(`${key}:`, this.margin + 5, yPos);
    
    // Value in bold
    this.pdf.setFont(this.fonts.body, 'bold');
    this.pdf.setTextColor(...this.colors.black);
    this.pdf.text(value, this.margin + 80, yPos);
    
    return yPos + 8;
  }

  addBulletPoint(content, yPos) {
    // Bullet
    this.pdf.setFont(this.fonts.body, 'bold');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(...this.colors.primary);
    this.pdf.text('•', this.margin + 5, yPos);
    
    // Content
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setTextColor(...this.colors.black);
    const lines = this.pdf.splitTextToSize(content, this.maxWidth - 20);
    this.pdf.text(lines, this.margin + 15, yPos);
    
    return yPos + (lines.length * 6) + 3;
  }

  addParagraph(text, yPos) {
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(...this.colors.black);
    
    const cleanText = text.replace(/\*\*/g, '').replace(/<[^>]*>/g, '');
    const lines = this.pdf.splitTextToSize(cleanText, this.maxWidth);
    this.pdf.text(lines, this.margin, yPos);
    
    return yPos + (lines.length * 6) + 5;
  }

  addMetricCard(title, value, x, y, width = 50, height = 35) {
    // Card background
    this.pdf.setFillColor(...this.colors.cream);
    this.pdf.rect(x, y, width, height, 'F');
    
    // Border
    this.pdf.setDrawColor(...this.colors.primary);
    this.pdf.setLineWidth(0.5);
    this.pdf.rect(x, y, width, height);
    
    // Title
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(...this.colors.gray);
    this.pdf.text(title, x + 3, y + 12);
    
    // Value
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(...this.colors.primary);
    this.pdf.text(value.toString(), x + 3, y + 25);
    
    return y + height + 10;
  }

  addPageHeader(title) {
    // Header background
    this.pdf.setFillColor(...this.colors.primary);
    this.pdf.rect(0, 0, this.pageWidth, 30, 'F');
    
    // Title
    this.pdf.setTextColor(...this.colors.white);
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(16);
    this.pdf.text(title, this.margin, 20);
    
    // Thandi logo text
    this.pdf.setFontSize(10);
    this.pdf.text('THANDI.AI', this.pageWidth - 40, 20);
  }

  addDisclaimerBox(yPos) {
    // Warning box
    this.pdf.setFillColor(255, 243, 205);
    this.pdf.rect(this.margin, yPos, this.maxWidth, 50, 'F');
    this.pdf.setDrawColor(239, 68, 68);
    this.pdf.setLineWidth(2);
    this.pdf.rect(this.margin, yPos, this.maxWidth, 50);
    
    // Warning title
    this.pdf.setTextColor(239, 68, 68);
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(12);
    this.pdf.text('⚠️ IMPORTANT DISCLAIMER', this.margin + 5, yPos + 15);
    
    // Warning text
    this.pdf.setTextColor(...this.colors.black);
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(9);
    const warningText = 'This report contains AI-generated career guidance. All recommendations must be verified with qualified counselors, institutions, and official sources before making educational or career decisions.';
    const lines = this.pdf.splitTextToSize(warningText, this.maxWidth - 10);
    this.pdf.text(lines, this.margin + 5, yPos + 25);
  }

  addVerificationFooter() {
    this.pdf.addPage();
    this.addPageHeader('Verification Requirements');
    
    let yPos = 60;
    
    // Verification steps
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(...this.colors.primary);
    this.pdf.text('Before Making Any Decisions, Please:', this.margin, yPos);
    
    yPos += 20;
    
    const verificationSteps = [
      'Speak with your school counselor or career guidance teacher',
      'Contact universities directly to confirm admission requirements',
      'Verify bursary information on official websites',
      'Check application deadlines with institutions',
      'Consult with parents/guardians about your career choices'
    ];
    
    verificationSteps.forEach((step, index) => {
      // Number circle
      this.pdf.setFillColor(...this.colors.gold);
      this.pdf.circle(this.margin + 5, yPos + 3, 4, 'F');
      this.pdf.setTextColor(...this.colors.white);
      this.pdf.setFont(this.fonts.body, 'bold');
      this.pdf.setFontSize(10);
      this.pdf.text((index + 1).toString(), this.margin + 3, yPos + 5);
      
      // Step text
      this.pdf.setTextColor(...this.colors.black);
      this.pdf.setFont(this.fonts.body, 'normal');
      this.pdf.setFontSize(11);
      const lines = this.pdf.splitTextToSize(step, this.maxWidth - 20);
      this.pdf.text(lines, this.margin + 15, yPos + 5);
      
      yPos += lines.length * 6 + 8;
    });
    
    // Contact information
    yPos += 20;
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(...this.colors.primary);
    this.pdf.text('Need Help?', this.margin, yPos);
    
    yPos += 15;
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(...this.colors.black);
    this.pdf.text('Visit: www.thandi.online', this.margin, yPos);
    this.pdf.text('For additional career guidance resources', this.margin, yPos + 10);
  }

  addPageNumbers() {
    const pageCount = this.pdf.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      this.pdf.setFont(this.fonts.body, 'normal');
      this.pdf.setFontSize(8);
      this.pdf.setTextColor(...this.colors.gray);
      this.pdf.text(
        `Page ${i} of ${pageCount}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      );
    }
  }

  // Helper methods
  getGradeFromResults() {
    // Extract grade from results metadata or content
    if (this.results.metadata?.grade) {
      return this.results.metadata.grade;
    }
    
    const content = this.results.fullResponse || this.results.response || '';
    const gradeMatch = content.match(/Grade (\d+)/i);
    return gradeMatch ? gradeMatch[1] : '12';
  }

  extractAPSScore() {
    const content = this.results.fullResponse || this.results.response || '';
    const apsMatch = content.match(/APS[:\s]*(\d+)/i);
    return apsMatch ? parseInt(apsMatch[1]) : null;
  }

  extractEligibility() {
    const content = this.results.fullResponse || this.results.response || '';
    return content.toLowerCase().includes('university eligible') || 
           content.toLowerCase().includes('eligible for university');
  }

  generateSummaryText(grade) {
    const gradeTexts = {
      '10': 'As a Grade 10 student, this report focuses on career exploration and foundation building. You have time to explore different paths and ensure your subjects align with your interests.',
      '11': 'As a Grade 11 student, this report provides strategic guidance for university research and academic improvement. You have two years to prepare for applications.',
      '12': 'As a Grade 12 student, this report focuses on immediate actions: university applications, NSC preparation, and final decisions. Time is critical for achieving your goals.'
    };
    
    return gradeTexts[grade] || gradeTexts['12'];
  }

  parseContentSections(content) {
    // Clean content and split into manageable sections
    const cleaned = content
      .replace(/---+\s*⚠️[^-]*---+/g, '')
      .replace(/⚠️ \*\*Verify before you decide[^⚠️]*⚠️[^⚠️]*$/g, '')
      .replace(/---+/g, '')
      .trim();
    
    return cleaned.split(/(?=^##?\s)/gm).filter(section => section.trim());
  }

  // NEW: Methods to handle structured data from ResultsParser
  addParsedPrograms(programs, yPos) {
    if (!programs || programs.length === 0) return yPos;
    
    yPos = this.addSectionHeader('University Programs', yPos);
    
    programs.forEach((program, index) => {
      if (yPos > this.pageHeight - 80) {
        this.pdf.addPage();
        this.addPageHeader('Career Recommendations (continued)');
        yPos = 60;
      }
      
      // Program header
      yPos = this.addProgramHeader(`${index + 1}. ${program.name}`, yPos);
      
      // Program details
      if (program.university) {
        yPos = this.addKeyValuePair('University', program.university, yPos);
      }
      if (program.apsRequired) {
        yPos = this.addKeyValuePair('APS Required', program.apsRequired.toString(), yPos);
      }
      if (program.admissionChance) {
        yPos = this.addKeyValuePair('Admission Chance', program.admissionChance, yPos);
      }
      if (program.applicationDeadline) {
        yPos = this.addKeyValuePair('Application Deadline', program.applicationDeadline, yPos);
      }
      if (program.description) {
        yPos = this.addParagraph(program.description, yPos);
      }
      
      yPos += 10; // Space between programs
    });
    
    return yPos;
  }

  addParsedBursaries(bursaries, yPos) {
    if (!bursaries || bursaries.length === 0) return yPos;
    
    yPos = this.addSectionHeader('Financial Aid Opportunities', yPos);
    
    bursaries.forEach((bursary, index) => {
      if (yPos > this.pageHeight - 80) {
        this.pdf.addPage();
        this.addPageHeader('Career Recommendations (continued)');
        yPos = 60;
      }
      
      // Bursary header
      yPos = this.addProgramHeader(`${index + 1}. ${bursary.name}`, yPos);
      
      // Bursary details
      if (bursary.provider) {
        yPos = this.addKeyValuePair('Provider', bursary.provider, yPos);
      }
      if (bursary.amount) {
        yPos = this.addKeyValuePair('Amount', bursary.amount, yPos);
      }
      if (bursary.eligibilityMatch) {
        yPos = this.addKeyValuePair('Eligibility Match', `${bursary.eligibilityMatch}%`, yPos);
      }
      if (bursary.applicationDeadline) {
        yPos = this.addKeyValuePair('Application Deadline', bursary.applicationDeadline, yPos);
      }
      if (bursary.requirements && bursary.requirements.length > 0) {
        yPos = this.addBulletPoint('Requirements:', yPos);
        bursary.requirements.forEach(req => {
          yPos = this.addBulletPoint(`  • ${req}`, yPos);
        });
      }
      
      yPos += 10; // Space between bursaries
    });
    
    return yPos;
  }

  addParsedActionPlan(actionPlan, yPos) {
    if (!actionPlan || !actionPlan.actionItems || actionPlan.actionItems.length === 0) return yPos;
    
    yPos = this.addSectionHeader('Action Plan', yPos);
    
    if (actionPlan.timeline) {
      yPos = this.addKeyValuePair('Timeline', actionPlan.timeline, yPos);
    }
    if (actionPlan.priority) {
      yPos = this.addKeyValuePair('Priority', actionPlan.priority, yPos);
    }
    
    yPos += 5;
    
    actionPlan.actionItems.forEach((action, index) => {
      if (yPos > this.pageHeight - 40) {
        this.pdf.addPage();
        this.addPageHeader('Career Recommendations (continued)');
        yPos = 60;
      }
      
      yPos = this.addBulletPoint(`${index + 1}. ${action}`, yPos);
    });
    
    return yPos + 10;
  }

  addParsedAlternatives(alternatives, yPos) {
    if (!alternatives || alternatives.length === 0) return yPos;
    
    yPos = this.addSectionHeader('Alternative Options', yPos);
    
    alternatives.forEach((alternative, index) => {
      if (yPos > this.pageHeight - 60) {
        this.pdf.addPage();
        this.addPageHeader('Career Recommendations (continued)');
        yPos = 60;
      }
      
      yPos = this.addProgramHeader(`${index + 1}. ${alternative.title}`, yPos);
      
      if (alternative.type) {
        yPos = this.addKeyValuePair('Type', alternative.type, yPos);
      }
      if (alternative.description) {
        yPos = this.addParagraph(alternative.description, yPos);
      }
      
      yPos += 8;
    });
    
    return yPos;
  }

  // NEW: Add validation warnings section
  addValidationWarnings(warnings, yPos) {
    if (!warnings || warnings.length === 0) return yPos;
    
    // Check for page space
    if (yPos > this.pageHeight - 100) {
      this.pdf.addPage();
      this.addPageHeader('Career Recommendations (continued)');
      yPos = 60;
    }
    
    yPos = this.addSectionHeader('⚠️ Content Extraction Warnings', yPos);
    
    // Warning box
    this.pdf.setFillColor(255, 243, 205);
    this.pdf.rect(this.margin, yPos - 5, this.maxWidth, 15 + (warnings.length * 8), 'F');
    this.pdf.setDrawColor(239, 68, 68);
    this.pdf.setLineWidth(1);
    this.pdf.rect(this.margin, yPos - 5, this.maxWidth, 15 + (warnings.length * 8));
    
    // Warning text
    this.pdf.setTextColor(239, 68, 68);
    this.pdf.setFont(this.fonts.body, 'bold');
    this.pdf.setFontSize(10);
    this.pdf.text('Content extraction encountered issues:', this.margin + 5, yPos + 5);
    
    yPos += 15;
    
    warnings.forEach(warning => {
      this.pdf.setTextColor(...this.colors.black);
      this.pdf.setFont(this.fonts.body, 'normal');
      this.pdf.setFontSize(9);
      this.pdf.text(`• ${warning}`, this.margin + 10, yPos);
      yPos += 8;
    });
    
    yPos += 10;
    
    return yPos;
  }

  // NEW: Add extraction error section
  addExtractionErrorSection(errorMessage, yPos) {
    // Check for page space
    if (yPos > this.pageHeight - 80) {
      this.pdf.addPage();
      this.addPageHeader('Career Recommendations (continued)');
      yPos = 60;
    }
    
    yPos = this.addSectionHeader('🚨 Content Extraction Error', yPos);
    
    // Error box
    this.pdf.setFillColor(254, 202, 202);
    this.pdf.rect(this.margin, yPos - 5, this.maxWidth, 50, 'F');
    this.pdf.setDrawColor(239, 68, 68);
    this.pdf.setLineWidth(2);
    this.pdf.rect(this.margin, yPos - 5, this.maxWidth, 50);
    
    // Error title
    this.pdf.setTextColor(239, 68, 68);
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(12);
    this.pdf.text('CRITICAL: Content Extraction Failed', this.margin + 5, yPos + 10);
    
    // Error message
    this.pdf.setTextColor(...this.colors.black);
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(9);
    const errorLines = this.pdf.splitTextToSize(`Error: ${errorMessage}`, this.maxWidth - 10);
    this.pdf.text(errorLines, this.margin + 5, yPos + 20);
    
    // Instructions
    this.pdf.setFont(this.fonts.body, 'bold');
    this.pdf.setFontSize(10);
    this.pdf.text('REQUIRED ACTION: Consult your school counselor immediately', this.margin + 5, yPos + 35);
    
    return yPos + 60;
  }
}