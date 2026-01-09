/**
 * Professional PDF Generator using jsPDF
 * Mirrors the exact layout structure from ResultsCardLayout.jsx
 * 
 * This implementation systematically recreates each card component:
 * - HeaderCard: Academic status overview
 * - ProgramCard: University program information  
 * - BursaryCard: Financial aid opportunities
 * - ActionCard: Prioritized next steps
 * - AlternativeOptionsCard: Backup options
 */

import { jsPDF } from 'jspdf';

export class ProfessionalPDFGenerator {
  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = 210; // A4 width in mm
    this.pageHeight = 297; // A4 height in mm
    this.margin = 20;
    this.contentWidth = this.pageWidth - (2 * this.margin);
    this.currentY = this.margin;
    this.lineHeight = 6;
    this.cardSpacing = 15;
    
    // Color scheme (no branding as requested)
    this.colors = {
      primary: '#2563eb',     // Blue
      secondary: '#64748b',   // Gray
      success: '#059669',     // Green
      warning: '#d97706',     // Orange
      error: '#dc2626',       // Red
      text: '#1f2937',        // Dark gray
      lightGray: '#f3f4f6',   // Light gray
      border: '#e5e7eb'       // Border gray
    };
    
    // Typography
    this.fonts = {
      title: { size: 16, weight: 'bold' },
      subtitle: { size: 12, weight: 'normal' },
      body: { size: 10, weight: 'normal' },
      small: { size: 8, weight: 'normal' },
      caption: { size: 7, weight: 'normal' }
    };
  }

  /**
   * Main generation method - mirrors ResultsCardLayout structure
   */
  generatePDF(parsedResults) {
    try {
      console.log('🔄 Starting PDF generation with parsed results...');
      
      const {
        headerData,
        programs,
        bursaries,
        actionPlan,
        alternativeOptions,
        gradeContext
      } = parsedResults;

      // Add title page
      this.addTitle(gradeContext);
      
      // Add warning banner (mirrors results page)
      this.addWarningBanner();
      
      // Add header card (academic status overview)
      this.addHeaderCard(headerData);
      
      // Add programs section
      if (programs && programs.length > 0) {
        this.addProgramsSection(programs, gradeContext);
      }
      
      // Add bursaries section  
      if (bursaries && bursaries.length > 0) {
        this.addBursariesSection(bursaries, gradeContext);
      }
      
      // Add action plan section
      if (actionPlan) {
        this.addActionPlanSection(actionPlan, gradeContext);
      }
      
      // Add alternatives section
      if (alternativeOptions && alternativeOptions.length > 0) {
        this.addAlternativesSection(alternativeOptions, gradeContext);
      }
      
      // Add footer warning (mirrors results page)
      this.addFooterWarning();
      
      console.log('✅ PDF generation completed successfully');
      return this.doc;
      
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }

  /**
   * Add title page with grade context
   */
  addTitle(gradeContext) {
    this.setFont(this.fonts.title);
    this.doc.setTextColor(this.colors.primary);
    
    const title = `Grade ${gradeContext.grade} Career Guidance Report`;
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 10;
    
    this.setFont(this.fonts.subtitle);
    this.doc.setTextColor(this.colors.secondary);
    
    const subtitle = `${gradeContext.phase} • Generated ${new Date().toLocaleDateString()}`;
    this.doc.text(subtitle, this.margin, this.currentY);
    this.currentY += this.cardSpacing;
  }

  /**
   * Add warning banner (mirrors results page warning)
   */
  addWarningBanner() {
    const bannerHeight = 20;
    
    // Warning background
    this.doc.setFillColor(255, 243, 199); // Light yellow
    this.doc.rect(this.margin, this.currentY, this.contentWidth, bannerHeight, 'F');
    
    // Warning border
    this.doc.setDrawColor(231, 76, 60); // Red border
    this.doc.setLineWidth(1);
    this.doc.rect(this.margin, this.currentY, this.contentWidth, bannerHeight);
    
    // Warning text
    this.setFont(this.fonts.body);
    this.doc.setTextColor(192, 57, 43); // Red text
    
    const warningY = this.currentY + 8;
    this.doc.text('⚠️ READ THIS FIRST', this.margin + 5, warningY);
    
    this.doc.setTextColor(44, 62, 80); // Dark text
    const warningText = 'The advice below is AI-generated. You MUST verify it with real people before making any decision.';
    this.doc.text(warningText, this.margin + 5, warningY + 6);
    
    this.currentY += bannerHeight + this.cardSpacing;
  }

  /**
   * Add header card (mirrors HeaderCard.jsx)
   */
  addHeaderCard(headerData) {
    this.addSectionTitle('Academic Status Overview');
    
    const cardHeight = 40;
    this.addCardBackground(cardHeight);
    
    const cardY = this.currentY + 5;
    
    // Student status
    this.setFont(this.fonts.subtitle);
    this.doc.setTextColor(this.colors.text);
    this.doc.text(`${headerData.studentStatus}`, this.margin + 5, cardY);
    
    // Academic year and term
    this.setFont(this.fonts.body);
    this.doc.setTextColor(this.colors.secondary);
    this.doc.text(`Academic Year ${headerData.academicYear} • ${headerData.currentTerm}`, this.margin + 5, cardY + 6);
    
    // Stats grid (APS, Eligibility, etc.)
    const statsY = cardY + 15;
    const statWidth = this.contentWidth / 4;
    
    // APS Score
    this.addStatItem('APS Score', headerData.apsScore || 'Building', this.margin + 5, statsY, statWidth);
    
    // University Eligibility  
    const eligibilityText = headerData.gradeLevel === 10 ? 'Exploring' : 
                           headerData.universityEligible ? 'Eligible' : 'Building';
    this.addStatItem('University', eligibilityText, this.margin + 5 + statWidth, statsY, statWidth);
    
    // Current Term
    this.addStatItem('Term', headerData.currentTerm, this.margin + 5 + (2 * statWidth), statsY, statWidth);
    
    // Marks Status
    const marksText = headerData.hasMarks ? 'Available' : 'Building';
    this.addStatItem('Marks', marksText, this.margin + 5 + (3 * statWidth), statsY, statWidth);
    
    this.currentY += cardHeight + this.cardSpacing;
  }

  /**
   * Add programs section (mirrors ProgramCard.jsx)
   */
  addProgramsSection(programs, gradeContext) {
    const sectionTitle = gradeContext.grade === 10 ? 'Career Exploration Options' : 'Recommended Programs';
    this.addSectionTitle(sectionTitle);
    
    const subtitle = gradeContext.grade === 10 
      ? 'Explore these fields to understand your options'
      : `Based on your Grade ${gradeContext.grade - 1} performance and interests`;
    
    this.setFont(this.fonts.body);
    this.doc.setTextColor(this.colors.secondary);
    this.doc.text(subtitle, this.margin, this.currentY);
    this.currentY += 10;
    
    programs.slice(0, 6).forEach((program, index) => {
      this.addProgramCard(program, gradeContext.grade);
    });
  }

  /**
   * Add individual program card
   */
  addProgramCard(program, gradeLevel) {
    const cardHeight = 35;
    
    // Check if we need a new page
    if (this.currentY + cardHeight > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
    
    this.addCardBackground(cardHeight);
    
    const cardY = this.currentY + 5;
    
    // Program name and university
    this.setFont(this.fonts.subtitle);
    this.doc.setTextColor(this.colors.text);
    this.doc.text(program.name || 'Program Name', this.margin + 5, cardY);
    
    this.setFont(this.fonts.body);
    this.doc.setTextColor(this.colors.secondary);
    this.doc.text(program.university || 'University', this.margin + 5, cardY + 6);
    
    // Feasibility badge
    if (program.feasibility) {
      const badgeX = this.margin + this.contentWidth - 25;
      this.addBadge(program.feasibility, badgeX, cardY - 2, this.getFeasibilityColor(program.feasibility));
    }
    
    // Metrics row
    const metricsY = cardY + 15;
    const metricWidth = this.contentWidth / 3;
    
    // APS Required
    this.addMetricItem('APS Required', program.apsRequired || 'TBD', this.margin + 5, metricsY);
    
    // Admission Chance
    this.addMetricItem('Admission Chance', program.admissionChance || 'TBD', this.margin + 5 + metricWidth, metricsY);
    
    // Deadline
    this.addMetricItem('Deadline', program.applicationDeadline || 'Check website', this.margin + 5 + (2 * metricWidth), metricsY);
    
    // Grade-specific guidance
    const guidanceY = metricsY + 10;
    this.setFont(this.fonts.small);
    this.doc.setTextColor(this.colors.secondary);
    const guidance = this.getGradeSpecificGuidance(gradeLevel, 'program');
    this.doc.text(guidance, this.margin + 5, guidanceY);
    
    this.currentY += cardHeight + 8;
  }

  /**
   * Add bursaries section (mirrors BursaryCard.jsx)
   */
  addBursariesSection(bursaries, gradeContext) {
    this.addSectionTitle('Financial Aid Opportunities');
    
    const subtitle = gradeContext.grade === 10 
      ? 'Learn about funding options for your future studies'
      : gradeContext.grade === 11
      ? 'Start preparing these applications for next year'
      : 'Critical deadlines approaching - apply now';
    
    this.setFont(this.fonts.body);
    this.doc.setTextColor(this.colors.secondary);
    this.doc.text(subtitle, this.margin, this.currentY);
    this.currentY += 10;
    
    bursaries.slice(0, 5).forEach((bursary, index) => {
      this.addBursaryCard(bursary, gradeContext.grade);
    });
  }

  /**
   * Add individual bursary card
   */
  addBursaryCard(bursary, gradeLevel) {
    const cardHeight = 30;
    
    // Check if we need a new page
    if (this.currentY + cardHeight > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
    
    this.addCardBackground(cardHeight);
    
    const cardY = this.currentY + 5;
    
    // Bursary name and amount
    this.setFont(this.fonts.subtitle);
    this.doc.setTextColor(this.colors.text);
    this.doc.text(bursary.name || 'Financial Aid', this.margin + 5, cardY);
    
    this.setFont(this.fonts.body);
    this.doc.setTextColor(this.colors.secondary);
    this.doc.text(bursary.amount || 'Amount varies', this.margin + 5, cardY + 6);
    
    // Urgency badge
    if (bursary.urgency) {
      const badgeX = this.margin + this.contentWidth - 25;
      this.addBadge(bursary.urgency, badgeX, cardY - 2, this.getUrgencyColor(bursary.urgency));
    }
    
    // Eligibility match
    const matchY = cardY + 15;
    this.setFont(this.fonts.small);
    this.doc.setTextColor(this.colors.text);
    this.doc.text(`Eligibility Match: ${bursary.eligibilityMatch || 0}%`, this.margin + 5, matchY);
    
    // Deadline
    this.doc.text(`Deadline: ${bursary.applicationDeadline || 'Check website'}`, this.margin + 5, matchY + 5);
    
    this.currentY += cardHeight + 8;
  }

  /**
   * Add action plan section (mirrors ActionCard.jsx)
   */
  addActionPlanSection(actionPlan, gradeContext) {
    this.addSectionTitle('Your Action Plan');
    
    this.setFont(this.fonts.body);
    this.doc.setTextColor(this.colors.secondary);
    this.doc.text(`Grade ${gradeContext.grade} Focus Areas • ${actionPlan.timeline || 'Timeline varies'}`, this.margin, this.currentY);
    this.currentY += 10;
    
    const cardHeight = Math.max(40, (actionPlan.actionItems?.length || 0) * 8 + 20);
    
    // Check if we need a new page
    if (this.currentY + cardHeight > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
    
    this.addCardBackground(cardHeight);
    
    const cardY = this.currentY + 5;
    
    // Priority actions
    this.setFont(this.fonts.subtitle);
    this.doc.setTextColor(this.colors.text);
    this.doc.text('Priority Actions', this.margin + 5, cardY);
    
    // Action items
    if (actionPlan.actionItems && actionPlan.actionItems.length > 0) {
      let itemY = cardY + 10;
      
      actionPlan.actionItems.slice(0, 6).forEach((action, index) => {
        this.setFont(this.fonts.body);
        this.doc.setTextColor(this.colors.text);
        
        // Priority number
        this.doc.setFillColor(this.colors.primary);
        this.doc.circle(this.margin + 8, itemY - 1, 2, 'F');
        this.doc.setTextColor(255, 255, 255);
        this.doc.text((index + 1).toString(), this.margin + 7, itemY + 1);
        
        // Action text
        this.doc.setTextColor(this.colors.text);
        const actionText = this.wrapText(action, this.contentWidth - 20);
        this.doc.text(actionText, this.margin + 15, itemY);
        
        itemY += 6;
      });
    }
    
    this.currentY += cardHeight + this.cardSpacing;
  }

  /**
   * Add alternatives section (mirrors AlternativeOptionsCard.jsx)
   */
  addAlternativesSection(alternativeOptions, gradeContext) {
    const title = gradeContext.grade === 10 ? 'Additional Career Paths to Explore' :
                  gradeContext.grade === 11 ? 'Strategic Backup Options' :
                  'Essential Backup Plans';
    
    this.addSectionTitle(title);
    
    const subtitle = gradeContext.grade === 10 
      ? 'You have time to explore these options alongside your main interests'
      : gradeContext.grade === 11
      ? 'Smart alternatives to consider in your planning'
      : 'Critical alternatives if your first choices don\'t work out';
    
    this.setFont(this.fonts.body);
    this.doc.setTextColor(this.colors.secondary);
    this.doc.text(subtitle, this.margin, this.currentY);
    this.currentY += 10;
    
    alternativeOptions.slice(0, 4).forEach((option, index) => {
      this.addAlternativeCard(option, gradeContext.grade);
    });
  }

  /**
   * Add individual alternative card
   */
  addAlternativeCard(option, gradeLevel) {
    const cardHeight = 25;
    
    // Check if we need a new page
    if (this.currentY + cardHeight > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
    
    this.addCardBackground(cardHeight);
    
    const cardY = this.currentY + 5;
    
    // Option title and description
    this.setFont(this.fonts.subtitle);
    this.doc.setTextColor(this.colors.text);
    this.doc.text(option.title || 'Alternative Option', this.margin + 5, cardY);
    
    this.setFont(this.fonts.body);
    this.doc.setTextColor(this.colors.secondary);
    const description = this.wrapText(option.description || 'Alternative pathway option', this.contentWidth - 10);
    this.doc.text(description, this.margin + 5, cardY + 6);
    
    // Type badge
    if (option.type) {
      const badgeX = this.margin + this.contentWidth - 30;
      this.addBadge(option.type, badgeX, cardY - 2, this.colors.secondary);
    }
    
    this.currentY += cardHeight + 8;
  }

  /**
   * Add footer warning (mirrors results page footer)
   */
  addFooterWarning() {
    // Check if we need a new page
    if (this.currentY + 30 > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
    
    const footerHeight = 25;
    
    // Footer background
    this.doc.setFillColor(255, 243, 205); // Light yellow
    this.doc.rect(this.margin, this.currentY, this.contentWidth, footerHeight, 'F');
    
    // Footer border
    this.doc.setDrawColor(231, 76, 60); // Red border
    this.doc.setLineWidth(0.5);
    this.doc.rect(this.margin, this.currentY, this.contentWidth, footerHeight);
    
    // Footer text
    const footerY = this.currentY + 8;
    
    this.setFont(this.fonts.body);
    this.doc.setTextColor(192, 57, 43); // Red text
    this.doc.text('⚠️ VERIFY THIS INFORMATION BEFORE DECIDING', this.margin + 5, footerY);
    
    this.setFont(this.fonts.small);
    this.doc.setTextColor(133, 100, 4); // Dark yellow text
    this.doc.text('1. Speak with your school counselor', this.margin + 5, footerY + 5);
    this.doc.text('2. Call the institution directly', this.margin + 5, footerY + 8);
    this.doc.text('3. Check official websites', this.margin + 5, footerY + 11);
    
    this.doc.text('Thandi\'s data may be outdated. Always confirm with real people.', this.margin + 5, footerY + 16);
    
    this.currentY += footerHeight + 10;
  }

  // Helper methods

  /**
   * Add section title
   */
  addSectionTitle(title) {
    // Check if we need a new page
    if (this.currentY + 15 > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
    
    this.setFont(this.fonts.title);
    this.doc.setTextColor(this.colors.primary);
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 12;
  }

  /**
   * Add card background
   */
  addCardBackground(height) {
    // Card background
    this.doc.setFillColor(249, 250, 251); // Light gray
    this.doc.rect(this.margin, this.currentY, this.contentWidth, height, 'F');
    
    // Card border
    this.doc.setDrawColor(229, 231, 235); // Border gray
    this.doc.setLineWidth(0.5);
    this.doc.rect(this.margin, this.currentY, this.contentWidth, height);
  }

  /**
   * Add stat item (for header card)
   */
  addStatItem(label, value, x, y, width) {
    this.setFont(this.fonts.small);
    this.doc.setTextColor(this.colors.secondary);
    this.doc.text(label, x, y);
    
    this.setFont(this.fonts.body);
    this.doc.setTextColor(this.colors.text);
    this.doc.text(String(value), x, y + 4);
  }

  /**
   * Add metric item (for program cards)
   */
  addMetricItem(label, value, x, y) {
    this.setFont(this.fonts.small);
    this.doc.setTextColor(this.colors.secondary);
    this.doc.text(label, x, y);
    
    this.setFont(this.fonts.body);
    this.doc.setTextColor(this.colors.text);
    this.doc.text(String(value), x, y + 4);
  }

  /**
   * Add badge
   */
  addBadge(text, x, y, color) {
    const badgeWidth = 20;
    const badgeHeight = 6;
    
    // Badge background
    this.doc.setFillColor(color);
    this.doc.roundedRect(x, y, badgeWidth, badgeHeight, 2, 2, 'F');
    
    // Badge text
    this.setFont(this.fonts.caption);
    this.doc.setTextColor(255, 255, 255);
    this.doc.text(text, x + 2, y + 4);
  }

  /**
   * Set font helper
   */
  setFont(fontConfig) {
    this.doc.setFontSize(fontConfig.size);
    if (fontConfig.weight === 'bold') {
      this.doc.setFont('helvetica', 'bold');
    } else {
      this.doc.setFont('helvetica', 'normal');
    }
  }

  /**
   * Wrap text to fit width
   */
  wrapText(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const textWidth = this.doc.getTextWidth(testLine);
      
      if (textWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.join('\n');
  }

  /**
   * Get grade-specific guidance text
   */
  getGradeSpecificGuidance(gradeLevel, type) {
    const guidance = {
      10: {
        program: 'Explore this field to understand if it interests you.',
        bursary: 'Start researching requirements now.',
        action: 'Focus on building foundation and exploring interests.'
      },
      11: {
        program: 'Research thoroughly and prepare applications.',
        bursary: 'Begin application preparations and gather documents.',
        action: 'Strategic planning and skill development phase.'
      },
      12: {
        program: 'Check deadlines immediately and apply.',
        bursary: 'Submit applications before deadlines.',
        action: 'Final year execution: applications and exams.'
      }
    };
    
    return guidance[gradeLevel]?.[type] || guidance[12][type];
  }

  /**
   * Get feasibility color
   */
  getFeasibilityColor(feasibility) {
    const colorMap = {
      'High': this.colors.success,
      'Medium': this.colors.warning,
      'Low': this.colors.error,
      'Exploratory': this.colors.primary
    };
    return colorMap[feasibility] || this.colors.secondary;
  }

  /**
   * Get urgency color
   */
  getUrgencyColor(urgency) {
    const colorMap = {
      'CRITICAL': this.colors.error,
      'HIGH': this.colors.warning,
      'MEDIUM': this.colors.primary,
      'LOW': this.colors.secondary,
      'INFO': this.colors.secondary
    };
    return colorMap[urgency] || this.colors.secondary;
  }

  /**
   * Generate and return PDF blob
   */
  generateBlob() {
    return this.doc.output('blob');
  }

  /**
   * Generate and return PDF data URL
   */
  generateDataURL() {
    return this.doc.output('dataurlstring');
  }

  /**
   * Save PDF to file
   */
  save(filename = 'career-guidance-report.pdf') {
    this.doc.save(filename);
  }
}

// Export for use in API routes and components
export default ProfessionalPDFGenerator;