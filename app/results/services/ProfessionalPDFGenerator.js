import { jsPDF } from 'jspdf';

export class ProfessionalPDFGenerator {
  constructor(parsedResults, studentData, fullResultsData = null) {
    this.pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 16
    });
    
    this.parsedResults = parsedResults;
    this.studentData = studentData;
    this.fullResultsData = fullResultsData; // Complete results data from results page
    
    // Simplified, reliable colors (RGB 0-255)
    this.colors = {
      primary: [17, 78, 78],      // Thandi teal #114E4E
      secondary: [107, 114, 128], // Gray  
      accent: [223, 163, 58],     // Thandi gold #DFA33A
      warning: [239, 68, 68],     // Red
      success: [16, 185, 129],    // Green
      lightGray: [248, 250, 252],
      white: [255, 255, 255],
      black: [0, 0, 0]
    };
    
    // Use only reliable fonts
    this.fonts = {
      heading: 'helvetica',
      body: 'helvetica'
    };
    
    this.pageMargin = 20;
    this.pageWidth = 210;
    this.pageHeight = 297;
    this.contentWidth = this.pageWidth - (this.pageMargin * 2);
  }

  generateProfessionalReport() {
    try {
      this.addProfessionalCoverPage();
      this.addAcademicStatusOverview(); // Mirror HeaderCard
      this.addRecommendedPrograms();    // Mirror ProgramCard section
      this.addFinancialAidSection();    // Mirror BursaryCard section
      this.addActionPlanSection();      // Mirror ActionCard
      this.addAlternativeOptions();     // Mirror AlternativeOptionsCard
      this.addFooter();
      return this.pdf;
    } catch (error) {
      console.error('PDF generation error:', error);
      return this.generateFallbackPDF();
    }
  }

  addProfessionalCoverPage() {
    // Clean, professional header
    this.pdf.setFillColor(17, 78, 78); // Thandi teal
    this.pdf.rect(0, 0, this.pageWidth, 80, 'F');
    
    // Add Thandi logo (circular gradient with "T")
    this.addThandiLogo(this.pageMargin, 25);
    
    // Company branding next to logo
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(32);
    this.pdf.text('Thandi.ai', this.pageMargin + 25, 35);
    
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('From School to Success', this.pageMargin + 25, 45);
    
    // Accent line
    this.pdf.setFillColor(223, 163, 58); // Gold accent
    this.pdf.rect(0, 75, this.pageWidth, 5, 'F');
    
    // Main title section
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(28);
    this.pdf.text('Career Assessment Report', this.pageMargin, 110);
    
    // Student information box
    const boxY = 130;
    const boxHeight = 60;
    
    // Box background
    this.pdf.setFillColor(248, 250, 252);
    this.pdf.rect(this.pageMargin, boxY, this.contentWidth, boxHeight, 'F');
    
    // Box border
    this.pdf.setDrawColor(17, 78, 78);
    this.pdf.setLineWidth(1);
    this.pdf.rect(this.pageMargin, boxY, this.contentWidth, boxHeight);
    
    // Student details
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(12);
    this.pdf.text('Student Information', this.pageMargin + 10, boxY + 15);
    
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(11);
    
    const studentName = this.studentData?.name || 'Student Assessment';
    const gradeLevel = this.parsedResults?.headerData?.gradeLevel || 'Grade 12';
    const reportDate = new Date().toLocaleDateString('en-ZA');
    
    this.pdf.text(`Name: ${studentName}`, this.pageMargin + 10, boxY + 30);
    this.pdf.text(`Grade: ${gradeLevel}`, this.pageMargin + 10, boxY + 42);
    this.pdf.text(`Report Date: ${reportDate}`, this.pageMargin + 10, boxY + 54);
    
    // Professional disclaimer
    const disclaimerY = 220;
    this.pdf.setFillColor(255, 243, 205); // Light yellow
    this.pdf.rect(this.pageMargin, disclaimerY, this.contentWidth, 40, 'F');
    
    this.pdf.setDrawColor(239, 68, 68); // Warning red
    this.pdf.setLineWidth(2);
    this.pdf.rect(this.pageMargin, disclaimerY, this.contentWidth, 40);
    
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(10);
    this.pdf.text('IMPORTANT DISCLAIMER', this.pageMargin + 5, disclaimerY + 12);
    
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(9);
    const disclaimerText = 'This report contains AI-generated career guidance. All recommendations must be verified with qualified counselors and official sources before making educational decisions.';
    
    // Split text to fit in box
    const lines = this.pdf.splitTextToSize(disclaimerText, this.contentWidth - 10);
    this.pdf.text(lines, this.pageMargin + 5, disclaimerY + 25);
  }

  addAcademicStatusOverview() {
    // Mirror HeaderCard component exactly
    this.pdf.addPage();
    this.addPageHeader('Your Academic Status');
    
    let yPos = 60;
    
    const headerData = this.parsedResults?.headerData || {};
    const gradeLevel = headerData.gradeLevel || 12;
    const hasMarks = headerData.hasMarks || false;
    const apsScore = headerData.apsScore;
    const projectedRange = headerData.projectedApsRange;
    const universityEligible = headerData.universityEligible;
    const studentStatus = headerData.studentStatus || `Grade ${gradeLevel} Student`;
    
    // Student status banner - exactly like HeaderCard
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(17, 78, 78);
    this.pdf.text(studentStatus, this.pageMargin, yPos);
    
    yPos += 25;
    
    // Academic metrics grid - mirror HeaderCard layout
    const metricsY = yPos;
    
    // Grade Level
    this.addMetricBox('Current Grade', `Grade ${gradeLevel}`, this.pageMargin, metricsY, 45, 35);
    
    // APS Score
    const apsDisplay = hasMarks && apsScore ? apsScore.toString() : 'Pending';
    this.addMetricBox('APS Score', apsDisplay, this.pageMargin + 50, metricsY, 45, 35);
    
    // Projected Range
    if (projectedRange && hasMarks) {
      this.addMetricBox('Projected Range', `${projectedRange.min}-${projectedRange.max}`, this.pageMargin + 100, metricsY, 45, 35);
    } else {
      this.addMetricBox('Status', gradeLevel === 10 ? 'Foundation' : 'Planning', this.pageMargin + 100, metricsY, 45, 35);
    }
    
    // University Eligibility
    const eligibilityText = universityEligible ? 'Eligible' : 'Building';
    this.addMetricBox('University Ready', eligibilityText, this.pageMargin + 150, metricsY, 40, 35);
    
    yPos += 50;
    
    // Grade-specific guidance - mirror HeaderCard content
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(17, 78, 78);
    this.pdf.text('Your Current Focus', this.pageMargin, yPos);
    
    yPos += 15;
    
    const currentFocus = this.getGradeSpecificFocus(gradeLevel);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(0, 0, 0);
    
    const focusLines = this.pdf.splitTextToSize(currentFocus, this.contentWidth);
    this.pdf.text(focusLines, this.pageMargin, yPos);
    
    yPos += focusLines.length * 6 + 15;
    
    // Timeline - mirror HeaderCard timeline
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(17, 78, 78);
    this.pdf.text('Your Timeline', this.pageMargin, yPos);
    
    yPos += 15;
    
    const timeline = this.getGradeSpecificTimeline(gradeLevel);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(0, 0, 0);
    
    const timelineLines = this.pdf.splitTextToSize(timeline, this.contentWidth);
    this.pdf.text(timelineLines, this.pageMargin, yPos);
  }

  addRecommendedPrograms() {
    // Mirror ProgramCard section exactly
    this.pdf.addPage();
    
    const gradeLevel = this.parsedResults?.headerData?.gradeLevel || 12;
    const sectionTitle = gradeLevel === 10 ? 'Career Exploration Options' : 'Recommended Programs';
    const sectionSubtitle = gradeLevel === 10 
      ? 'Explore these fields to understand your options'
      : `Based on your Grade ${gradeLevel - 1} performance and interests`;
    
    this.addPageHeader(sectionTitle);
    
    let yPos = 60;
    
    // Section subtitle
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(107, 114, 128);
    const subtitleLines = this.pdf.splitTextToSize(sectionSubtitle, this.contentWidth);
    this.pdf.text(subtitleLines, this.pageMargin, yPos);
    
    yPos += subtitleLines.length * 6 + 20;
    
    const programs = this.parsedResults?.programs || [];
    
    if (programs.length === 0) {
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(11);
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.text('Program recommendations will be available based on your academic performance and interests.', this.pageMargin, yPos);
      return;
    }
    
    // Program cards - mirror ProgramCard component layout
    programs.slice(0, 6).forEach((program, index) => {
      if (yPos > 220) {
        this.pdf.addPage();
        this.addPageHeader(`${sectionTitle} (continued)`);
        yPos = 60;
      }
      
      yPos = this.addProgramCardMirrored(program, yPos, gradeLevel);
    });
  }

  addProgramCardMirrored(program, yPos, gradeLevel) {
    // Mirror ProgramCard component exactly
    const cardHeight = 55;
    
    // Card background
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.rect(this.pageMargin, yPos, this.contentWidth, cardHeight, 'F');
    
    // Card border
    this.pdf.setDrawColor(17, 78, 78);
    this.pdf.setLineWidth(1);
    this.pdf.rect(this.pageMargin, yPos, this.contentWidth, cardHeight);
    
    // Left accent bar - color based on feasibility
    const feasibility = program.feasibility || 'Medium';
    let accentColor = [223, 163, 58]; // Default gold
    if (feasibility === 'High') accentColor = [16, 185, 129]; // Green
    if (feasibility === 'Low') accentColor = [239, 68, 68]; // Red
    if (feasibility === 'Exploratory') accentColor = [59, 130, 246]; // Blue
    
    this.pdf.setFillColor(...accentColor);
    this.pdf.rect(this.pageMargin, yPos, 4, cardHeight, 'F');
    
    // Program title
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(17, 78, 78);
    const programTitle = program.program || 'Program Name';
    this.pdf.text(programTitle, this.pageMargin + 10, yPos + 15);
    
    // University
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(107, 114, 128);
    this.pdf.text(program.university || 'University', this.pageMargin + 10, yPos + 27);
    
    // Program details - mirror ProgramCard layout
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFontSize(9);
    
    // Row 1: APS and Feasibility
    this.pdf.text(`APS Required: ${program.apsRequired || 'TBD'}`, this.pageMargin + 10, yPos + 38);
    this.pdf.text(`Feasibility: ${feasibility}`, this.pageMargin + 80, yPos + 38);
    
    // Row 2: Admission chance and deadline
    if (program.admissionChance) {
      this.pdf.text(`Admission Chance: ${program.admissionChance}%`, this.pageMargin + 10, yPos + 48);
    }
    this.pdf.text(`Deadline: ${program.applicationDeadline || 'TBD'}`, this.pageMargin + 100, yPos + 48);
    
    return yPos + cardHeight + 12;
  }

  addFinancialAidSection() {
    // Mirror BursaryCard section exactly
    this.pdf.addPage();
    
    const gradeLevel = this.parsedResults?.headerData?.gradeLevel || 12;
    let sectionSubtitle;
    
    if (gradeLevel === 10) {
      sectionSubtitle = 'Learn about funding options for your future studies';
    } else if (gradeLevel === 11) {
      sectionSubtitle = 'Start preparing these applications for next year';
    } else {
      sectionSubtitle = 'Critical deadlines approaching - apply now';
    }
    
    this.addPageHeader('Financial Aid Opportunities');
    
    let yPos = 60;
    
    // Section subtitle
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(107, 114, 128);
    const subtitleLines = this.pdf.splitTextToSize(sectionSubtitle, this.contentWidth);
    this.pdf.text(subtitleLines, this.pageMargin, yPos);
    
    yPos += subtitleLines.length * 6 + 20;
    
    const bursaries = this.parsedResults?.bursaries || [];
    
    if (bursaries.length === 0) {
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(11);
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.text('Bursary recommendations will be provided based on your academic performance and program choices.', this.pageMargin, yPos);
      return;
    }
    
    // Bursary cards - mirror BursaryCard component layout
    bursaries.slice(0, 5).forEach((bursary, index) => {
      if (yPos > 200) {
        this.pdf.addPage();
        this.addPageHeader('Financial Aid Opportunities (continued)');
        yPos = 60;
      }
      
      yPos = this.addBursaryCardMirrored(bursary, yPos, gradeLevel);
    });
  }

  addBursaryCardMirrored(bursary, yPos, gradeLevel) {
    // Mirror BursaryCard component exactly
    const cardHeight = 60;
    
    // Card background with urgency color
    let bgColor = [255, 255, 255];
    let borderColor = [17, 78, 78];
    
    const urgency = bursary.urgency || 'INFO';
    if (urgency === 'CRITICAL') {
      bgColor = [254, 242, 242];
      borderColor = [239, 68, 68];
    } else if (urgency === 'HIGH') {
      bgColor = [255, 251, 235];
      borderColor = [245, 158, 11];
    } else if (urgency === 'INFO') {
      bgColor = [239, 246, 255];
      borderColor = [59, 130, 246];
    }
    
    this.pdf.setFillColor(...bgColor);
    this.pdf.rect(this.pageMargin, yPos, this.contentWidth, cardHeight, 'F');
    
    // Card border
    this.pdf.setDrawColor(...borderColor);
    this.pdf.setLineWidth(2);
    this.pdf.rect(this.pageMargin, yPos, this.contentWidth, cardHeight);
    
    // Urgency indicator bar
    this.pdf.setFillColor(...borderColor);
    this.pdf.rect(this.pageMargin, yPos, 6, cardHeight, 'F');
    
    // Bursary name
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(...borderColor);
    this.pdf.text(bursary.name || 'Financial Aid Opportunity', this.pageMargin + 12, yPos + 15);
    
    // Amount and eligibility match
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text(`Amount: ${bursary.amount || 'Variable'}`, this.pageMargin + 12, yPos + 28);
    this.pdf.text(`Eligibility Match: ${bursary.eligibilityMatch || 'TBD'}%`, this.pageMargin + 100, yPos + 28);
    
    // Deadline and urgency
    this.pdf.text(`Deadline: ${bursary.deadline || 'TBD'}`, this.pageMargin + 12, yPos + 40);
    this.pdf.text(`Priority: ${urgency}`, this.pageMargin + 100, yPos + 40);
    
    // Qualification reasons (if available)
    if (bursary.qualificationReasons && bursary.qualificationReasons.length > 0) {
      this.pdf.setFontSize(9);
      this.pdf.setTextColor(107, 114, 128);
      const reasons = bursary.qualificationReasons.slice(0, 2).join(', ');
      const reasonsLines = this.pdf.splitTextToSize(`Qualifications: ${reasons}`, this.contentWidth - 20);
      this.pdf.text(reasonsLines, this.pageMargin + 12, yPos + 52);
    }
    
    return yPos + cardHeight + 12;
  }

  addActionPlanSection() {
    // Mirror ActionCard component exactly
    this.pdf.addPage();
    this.addPageHeader('Your Action Plan');
    
    let yPos = 60;
    
    const actionPlan = this.parsedResults?.actionPlan || {};
    const gradeLevel = this.parsedResults?.headerData?.gradeLevel || 12;
    
    // Timeline - mirror ActionCard timeline
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(17, 78, 78);
    this.pdf.text('Your Timeline', this.pageMargin, yPos);
    
    yPos += 15;
    
    const timeline = actionPlan.timeline || this.getGradeSpecificTimeline(gradeLevel);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(0, 0, 0);
    
    const timelineLines = this.pdf.splitTextToSize(timeline, this.contentWidth);
    this.pdf.text(timelineLines, this.pageMargin, yPos);
    
    yPos += timelineLines.length * 6 + 20;
    
    // Action items - mirror ActionCard layout
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(17, 78, 78);
    this.pdf.text('Next Steps', this.pageMargin, yPos);
    
    yPos += 20;
    
    const actionItems = actionPlan.actionItems || this.getDefaultActionItems(gradeLevel);
    
    actionItems.slice(0, 8).forEach((action, index) => {
      if (yPos > 250) {
        this.pdf.addPage();
        this.addPageHeader('Your Action Plan (continued)');
        yPos = 60;
      }
      
      // Number circle - mirror ActionCard styling
      this.pdf.setFillColor(17, 78, 78);
      this.pdf.circle(this.pageMargin + 5, yPos + 3, 3, 'F');
      
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(8);
      this.pdf.text((index + 1).toString(), this.pageMargin + 3.5, yPos + 4.5);
      
      // Action text
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(10);
      
      const actionLines = this.pdf.splitTextToSize(action, this.contentWidth - 20);
      this.pdf.text(actionLines, this.pageMargin + 15, yPos + 5);
      
      yPos += actionLines.length * 5 + 10;
    });
    
    // Grade-specific guidance - mirror ActionCard guidance
    if (actionPlan.gradeSpecificGuidance && actionPlan.gradeSpecificGuidance.length > 0) {
      yPos += 10;
      
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(12);
      this.pdf.setTextColor(17, 78, 78);
      this.pdf.text(`Grade ${gradeLevel} Focus Areas`, this.pageMargin, yPos);
      
      yPos += 15;
      
      actionPlan.gradeSpecificGuidance.slice(0, 3).forEach((guidance, index) => {
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setFontSize(10);
        this.pdf.setTextColor(0, 0, 0);
        
        const guidanceLines = this.pdf.splitTextToSize(`• ${guidance}`, this.contentWidth);
        this.pdf.text(guidanceLines, this.pageMargin, yPos);
        yPos += guidanceLines.length * 5 + 5;
      });
    }
  }

  addAlternativeOptions() {
    // Mirror AlternativeOptionsCard component exactly
    const alternatives = this.parsedResults?.alternativeOptions || [];
    
    if (alternatives.length === 0) {
      return; // Skip if no alternatives
    }
    
    this.pdf.addPage();
    this.addPageHeader('Alternative Options');
    
    let yPos = 60;
    
    // Section description
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(107, 114, 128);
    this.pdf.text('Consider these alternative paths if your primary options don\'t work out', this.pageMargin, yPos);
    
    yPos += 25;
    
    // Alternative option cards
    alternatives.slice(0, 4).forEach((option, index) => {
      if (yPos > 230) {
        this.pdf.addPage();
        this.addPageHeader('Alternative Options (continued)');
        yPos = 60;
      }
      
      yPos = this.addAlternativeOptionCard(option, yPos);
    });
  }

  addAlternativeOptionCard(option, yPos) {
    const cardHeight = 40;
    
    // Card background
    this.pdf.setFillColor(248, 250, 252);
    this.pdf.rect(this.pageMargin, yPos, this.contentWidth, cardHeight, 'F');
    
    // Card border
    this.pdf.setDrawColor(107, 114, 128);
    this.pdf.setLineWidth(1);
    this.pdf.rect(this.pageMargin, yPos, this.contentWidth, cardHeight);
    
    // Left accent bar
    this.pdf.setFillColor(59, 130, 246); // Blue for alternatives
    this.pdf.rect(this.pageMargin, yPos, 4, cardHeight, 'F');
    
    // Option title
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(17, 78, 78);
    this.pdf.text(option.title || 'Alternative Option', this.pageMargin + 10, yPos + 12);
    
    // Option type
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(107, 114, 128);
    this.pdf.text(option.type || 'Alternative Path', this.pageMargin + 10, yPos + 22);
    
    // Option description
    this.pdf.setTextColor(0, 0, 0);
    const description = option.description || 'Consider this as a backup option';
    const descLines = this.pdf.splitTextToSize(description, this.contentWidth - 20);
    this.pdf.text(descLines.slice(0, 2), this.pageMargin + 10, yPos + 32); // Limit to 2 lines
    
    return yPos + cardHeight + 10;
  }

  addProgramCard(program, yPos) {
    const cardHeight = 45;
    
    // Card background
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.rect(this.pageMargin, yPos, this.contentWidth, cardHeight, 'F');
    
    // Card border
    this.pdf.setDrawColor(17, 78, 78);
    this.pdf.setLineWidth(1);
    this.pdf.rect(this.pageMargin, yPos, this.contentWidth, cardHeight);
    
    // Left accent bar
    this.pdf.setFillColor(223, 163, 58); // Gold
    this.pdf.rect(this.pageMargin, yPos, 4, cardHeight, 'F');
    
    // Program title
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(17, 78, 78);
    this.pdf.text(program.program || 'Program Name', this.pageMargin + 10, yPos + 12);
    
    // University
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(107, 114, 128);
    this.pdf.text(program.university || 'University', this.pageMargin + 10, yPos + 22);
    
    // Requirements and feasibility
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text(`APS Required: ${program.apsRequired || 'TBD'}`, this.pageMargin + 10, yPos + 32);
    this.pdf.text(`Feasibility: ${program.feasibility || 'Medium'}`, this.pageMargin + 80, yPos + 32);
    this.pdf.text(`Deadline: ${program.applicationDeadline || 'TBD'}`, this.pageMargin + 130, yPos + 32);
    
    return yPos + cardHeight + 10;
  }

  addThandiLogo(x, y) {
    // Create circular gradient logo similar to landing page
    const radius = 8;
    
    // Outer ring (gold)
    this.pdf.setFillColor(223, 163, 58); // Thandi gold
    this.pdf.circle(x + radius, y, radius + 1, 'F');
    
    // Inner circle (teal gradient effect)
    this.pdf.setFillColor(17, 78, 78); // Thandi teal
    this.pdf.circle(x + radius, y, radius, 'F');
    
    // Letter "T" in white
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(14);
    this.pdf.text('T', x + radius - 2.5, y + 3);
  }

  addAssessmentDetails() {
    this.pdf.addPage();
    this.addPageHeader('Assessment Details');
    
    let yPos = 60;
    
    // Assessment overview section
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(17, 78, 78);
    this.pdf.text('Complete Assessment Overview', this.pageMargin, yPos);
    
    yPos += 20;
    
    // Student profile box
    const profileHeight = 80;
    this.pdf.setFillColor(248, 250, 252);
    this.pdf.rect(this.pageMargin, yPos, this.contentWidth, profileHeight, 'F');
    this.pdf.setDrawColor(17, 78, 78);
    this.pdf.setLineWidth(1);
    this.pdf.rect(this.pageMargin, yPos, this.contentWidth, profileHeight);
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(17, 78, 78);
    this.pdf.text('Student Profile', this.pageMargin + 10, yPos + 15);
    
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(0, 0, 0);
    
    const studentName = this.studentData?.name || 'Student Assessment';
    const gradeLevel = this.parsedResults?.headerData?.gradeLevel || 'Grade 12';
    const school = this.studentData?.school || 'School not specified';
    const assessmentDate = new Date().toLocaleDateString('en-ZA');
    
    this.pdf.text(`Full Name: ${studentName}`, this.pageMargin + 10, yPos + 30);
    this.pdf.text(`Current Grade: ${gradeLevel}`, this.pageMargin + 10, yPos + 42);
    this.pdf.text(`School: ${school}`, this.pageMargin + 10, yPos + 54);
    this.pdf.text(`Assessment Date: ${assessmentDate}`, this.pageMargin + 10, yPos + 66);
    
    yPos += profileHeight + 20;
    
    // Academic performance section
    if (this.parsedResults?.headerData?.hasMarks) {
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(12);
      this.pdf.setTextColor(17, 78, 78);
      this.pdf.text('Academic Performance', this.pageMargin, yPos);
      
      yPos += 15;
      
      const apsScore = this.parsedResults.headerData.apsScore || 'TBD';
      const projectedRange = this.parsedResults.headerData.projectedApsRange;
      
      this.addCleanMetricBox('Current APS', apsScore.toString(), this.pageMargin, yPos, 60, 25);
      if (projectedRange) {
        this.addCleanMetricBox('Projected Range', `${projectedRange.min}-${projectedRange.max}`, this.pageMargin + 70, yPos, 60, 25);
      }
      this.addCleanMetricBox('University Ready', this.parsedResults.headerData.universityEligible ? 'Yes' : 'Not Yet', this.pageMargin + 140, yPos, 50, 25);
      
      yPos += 40;
    }
    
    // Assessment methodology
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(17, 78, 78);
    this.pdf.text('Assessment Methodology', this.pageMargin, yPos);
    
    yPos += 15;
    
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(0, 0, 0);
    
    const methodologyText = `This comprehensive career assessment analyzed your academic performance, subject preferences, and career interests using AI-powered matching algorithms. The recommendations are based on current university requirements, industry trends, and your individual profile.`;
    
    const methodologyLines = this.pdf.splitTextToSize(methodologyText, this.contentWidth);
    this.pdf.text(methodologyLines, this.pageMargin, yPos);
  }

  addBursaryInformation() {
    this.pdf.addPage();
    this.addPageHeader('Financial Aid & Bursaries');
    
    let yPos = 60;
    
    const bursaries = this.parsedResults?.bursaries || [];
    
    if (bursaries.length === 0) {
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(11);
      this.pdf.text('Bursary recommendations will be provided based on your academic performance and program choices.', this.pageMargin, yPos);
      
      // Add general bursary information
      yPos += 30;
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(14);
      this.pdf.setTextColor(17, 78, 78);
      this.pdf.text('Important Financial Aid Information', this.pageMargin, yPos);
      
      yPos += 20;
      this.addGeneralBursaryInfo(yPos);
      return;
    }
    
    // Bursary cards
    bursaries.slice(0, 4).forEach((bursary, index) => {
      if (yPos > 220) {
        this.pdf.addPage();
        this.addPageHeader('Financial Aid & Bursaries (continued)');
        yPos = 60;
      }
      
      yPos = this.addBursaryCard(bursary, yPos);
    });
    
    // Add general financial aid guidance
    if (yPos < 200) {
      yPos += 20;
      this.addGeneralBursaryInfo(yPos);
    }
  }

  addBursaryCard(bursary, yPos) {
    const cardHeight = 55;
    
    // Card background with urgency color
    let bgColor = [255, 255, 255];
    let borderColor = [17, 78, 78];
    
    if (bursary.urgency === 'CRITICAL') {
      bgColor = [254, 242, 242];
      borderColor = [239, 68, 68];
    } else if (bursary.urgency === 'HIGH') {
      bgColor = [255, 251, 235];
      borderColor = [245, 158, 11];
    }
    
    this.pdf.setFillColor(...bgColor);
    this.pdf.rect(this.pageMargin, yPos, this.contentWidth, cardHeight, 'F');
    
    // Card border
    this.pdf.setDrawColor(...borderColor);
    this.pdf.setLineWidth(2);
    this.pdf.rect(this.pageMargin, yPos, this.contentWidth, cardHeight);
    
    // Urgency indicator
    this.pdf.setFillColor(...borderColor);
    this.pdf.rect(this.pageMargin, yPos, 6, cardHeight, 'F');
    
    // Bursary name
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(...borderColor);
    this.pdf.text(bursary.name || 'Bursary Opportunity', this.pageMargin + 12, yPos + 15);
    
    // Amount and match
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text(`Amount: ${bursary.amount || 'Variable'}`, this.pageMargin + 12, yPos + 28);
    this.pdf.text(`Match: ${bursary.eligibilityMatch || 'TBD'}%`, this.pageMargin + 90, yPos + 28);
    this.pdf.text(`Deadline: ${bursary.deadline || 'TBD'}`, this.pageMargin + 12, yPos + 40);
    this.pdf.text(`Priority: ${bursary.urgency || 'MEDIUM'}`, this.pageMargin + 90, yPos + 40);
    
    return yPos + cardHeight + 12;
  }

  addGeneralBursaryInfo(yPos) {
    const bursaryTips = [
      'Apply for NSFAS (National Student Financial Aid Scheme) as early as possible',
      'Research university-specific bursaries and merit awards',
      'Consider corporate bursaries in your field of interest',
      'Maintain good academic performance to qualify for merit-based funding',
      'Prepare all required documentation well before deadlines'
    ];
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(17, 78, 78);
    this.pdf.text('Financial Aid Tips:', this.pageMargin, yPos);
    
    yPos += 15;
    
    bursaryTips.forEach((tip, index) => {
      // Number circle
      this.pdf.setFillColor(223, 163, 58); // Gold
      this.pdf.circle(this.pageMargin + 5, yPos + 3, 3, 'F');
      
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(8);
      this.pdf.text((index + 1).toString(), this.pageMargin + 3.5, yPos + 4.5);
      
      // Tip text
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(10);
      
      const tipLines = this.pdf.splitTextToSize(tip, this.contentWidth - 20);
      this.pdf.text(tipLines, this.pageMargin + 15, yPos + 5);
      
      yPos += tipLines.length * 5 + 8;
    });
  }

  addParentSchoolSummary() {
    this.pdf.addPage();
    this.addPageHeader('Summary for Parents & Schools');
    
    let yPos = 60;
    
    // Executive summary for parents
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(17, 78, 78);
    this.pdf.text('Executive Summary', this.pageMargin, yPos);
    
    yPos += 20;
    
    // Key findings box
    const summaryHeight = 70;
    this.pdf.setFillColor(240, 253, 244); // Light green
    this.pdf.rect(this.pageMargin, yPos, this.contentWidth, summaryHeight, 'F');
    this.pdf.setDrawColor(16, 185, 129);
    this.pdf.setLineWidth(2);
    this.pdf.rect(this.pageMargin, yPos, this.contentWidth, summaryHeight);
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(16, 185, 129);
    this.pdf.text('Key Findings for Parents', this.pageMargin + 10, yPos + 15);
    
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(0, 0, 0);
    
    const gradeLevel = this.parsedResults?.headerData?.gradeLevel || 12;
    const hasMarks = this.parsedResults?.headerData?.hasMarks || false;
    const programCount = this.parsedResults?.programs?.length || 0;
    
    const parentSummary = this.generateParentSummary(gradeLevel, hasMarks, programCount);
    const summaryLines = this.pdf.splitTextToSize(parentSummary, this.contentWidth - 20);
    this.pdf.text(summaryLines, this.pageMargin + 10, yPos + 30);
    
    yPos += summaryHeight + 20;
    
    // Recommended actions for parents
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(17, 78, 78);
    this.pdf.text('Recommended Actions for Parents', this.pageMargin, yPos);
    
    yPos += 15;
    
    const parentActions = [
      'Schedule a meeting with your child\'s school counselor to discuss these recommendations',
      'Research the suggested universities and programs together with your child',
      'Begin financial planning for tertiary education costs and application fees',
      'Support your child in maintaining or improving their academic performance',
      'Attend university open days and career guidance sessions as a family'
    ];
    
    parentActions.forEach((action, index) => {
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(10);
      this.pdf.setTextColor(0, 0, 0);
      
      const actionLines = this.pdf.splitTextToSize(`${index + 1}. ${action}`, this.contentWidth);
      this.pdf.text(actionLines, this.pageMargin, yPos);
      yPos += actionLines.length * 5 + 5;
    });
    
    yPos += 10;
    
    // School information section
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(17, 78, 78);
    this.pdf.text('Information for Schools', this.pageMargin, yPos);
    
    yPos += 15;
    
    const schoolInfo = `This AI-generated assessment provides preliminary career guidance based on the student's current academic profile and interests. Schools should use this as a starting point for more detailed career counseling sessions. The recommendations should be verified with current university requirements and discussed with qualified career guidance counselors.`;
    
    const schoolLines = this.pdf.splitTextToSize(schoolInfo, this.contentWidth);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text(schoolLines, this.pageMargin, yPos);
  }

  generateParentSummary(grade, hasMarks, programCount) {
    if (grade === 10) {
      return `Your child is in Grade 10, the foundation year for career planning. This assessment has identified ${programCount} potential career paths based on their interests and current academic trajectory. Focus on subject selection and academic improvement to keep all options open.`;
    } else if (grade === 11) {
      return `Your child is in Grade 11, the strategic planning year. This assessment shows ${programCount} suitable programs based on their academic performance and interests. ${hasMarks ? 'Their current APS score indicates good progress toward university admission.' : 'Continue monitoring academic performance as university applications approach.'}`;
    } else {
      return `Your child is in Grade 12, the critical decision year. This assessment identifies ${programCount} viable programs for university application. ${hasMarks ? 'Their APS score has been calculated to guide application choices.' : 'Final marks will determine university eligibility.'} Immediate action is required for applications and financial aid.`;
    }
  }

  addActionPlan() {
    this.pdf.addPage();
    this.addPageHeader('Your Action Plan');
    
    let yPos = 60;
    
    // Timeline
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(17, 78, 78);
    this.pdf.text('Next Steps Timeline', this.pageMargin, yPos);
    
    yPos += 20;
    
    const actionItems = this.parsedResults?.actionPlan?.actionItems || this.getDefaultActionItems();
    
    actionItems.slice(0, 6).forEach((action, index) => {
      // Number circle
      this.pdf.setFillColor(17, 78, 78);
      this.pdf.circle(this.pageMargin + 5, yPos + 3, 3, 'F');
      
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(8);
      this.pdf.text((index + 1).toString(), this.pageMargin + 3.5, yPos + 4.5);
      
      // Action text
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(10);
      
      const actionLines = this.pdf.splitTextToSize(action, this.contentWidth - 20);
      this.pdf.text(actionLines, this.pageMargin + 15, yPos + 5);
      
      yPos += actionLines.length * 5 + 8;
    });
  }

  addCleanMetricBox(title, value, x, y, width, height) {
    // Box background
    this.pdf.setFillColor(248, 250, 252);
    this.pdf.rect(x, y, width, height, 'F');
    
    // Box border
    this.pdf.setDrawColor(17, 78, 78);
    this.pdf.setLineWidth(0.5);
    this.pdf.rect(x, y, width, height);
    
    // Title
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(107, 114, 128);
    this.pdf.text(title, x + 3, y + 10);
    
    // Value
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(17, 78, 78);
    this.pdf.text(value.toString(), x + 3, y + 20);
  }

  addPageHeader(title) {
    // Header background
    this.pdf.setFillColor(17, 78, 78);
    this.pdf.rect(0, 0, this.pageWidth, 30, 'F');
    
    // Title
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(16);
    this.pdf.text(title, this.pageMargin, 20);
    
    // Page number
    const pageNum = this.pdf.internal.getCurrentPageInfo().pageNumber;
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(10);
    this.pdf.text(`Page ${pageNum}`, this.pageWidth - 30, 20);
  }

  addFooter() {
    const pageCount = this.pdf.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      
      // Footer line
      this.pdf.setDrawColor(17, 78, 78);
      this.pdf.setLineWidth(0.5);
      this.pdf.line(this.pageMargin, this.pageHeight - 20, this.pageWidth - this.pageMargin, this.pageHeight - 20);
      
      // Footer text
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(8);
      this.pdf.setTextColor(107, 114, 128);
      this.pdf.text('Generated by THANDI.AI - Intelligent Career Guidance', this.pageMargin, this.pageHeight - 12);
      
      const date = new Date().toLocaleDateString('en-ZA');
      this.pdf.text(date, this.pageWidth - 40, this.pageHeight - 12);
    }
  }

  addThandiLogo(x, y) {
    // Create circular gradient logo similar to landing page
    const radius = 8;
    
    // Outer ring (gold)
    this.pdf.setFillColor(223, 163, 58); // Thandi gold
    this.pdf.circle(x + radius, y, radius + 1, 'F');
    
    // Inner circle (teal gradient effect)
    this.pdf.setFillColor(17, 78, 78); // Thandi teal
    this.pdf.circle(x + radius, y, radius, 'F');
    
    // Letter "T" in white
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(14);
    this.pdf.text('T', x + radius - 2.5, y + 3);
  }

  // Helper methods for grade-specific content (mirror ResultsParser logic)
  
  getGradeSpecificFocus(grade) {
    const focusMap = {
      10: 'Building strong academic foundations and exploring career options without pressure to decide',
      11: 'Strategic planning and targeted improvement for university preparation',
      12: 'Final year execution: applications, NSC prep, and critical decision making'
    };
    return focusMap[grade] || 'Academic and career development';
  }

  getGradeSpecificTimeline(grade) {
    const timelineMap = {
      10: '3 years to matric - Foundation building phase',
      11: '2 years to matric - Strategic planning phase', 
      12: '1 year to matric - Critical execution phase'
    };
    return timelineMap[grade] || 'Academic timeline';
  }

  getDefaultActionItems(grade) {
    const actionMap = {
      10: [
        'Focus on understanding your chosen subjects thoroughly',
        'Explore different career options without pressure to decide',
        'Build strong study habits and time management skills',
        'Consider subject adjustments if needed (limited window available)',
        'Start learning about university requirements for fields of interest',
        'Maintain good academic performance across all subjects'
      ],
      11: [
        'Research university programs and admission requirements',
        'Focus on improving weak subjects from Grade 10',
        'Start preparing bursary and scholarship applications',
        'Plan your Grade 12 strategy and subject choices',
        'Attend university open days and career guidance sessions',
        'Build a strong academic record for university applications'
      ],
      12: [
        'Submit university applications before deadlines',
        'Focus intensively on NSC examination preparation',
        'Finalize all bursary and financial aid applications',
        'Prepare backup plans for different outcome scenarios',
        'Complete all required documentation for applications',
        'Maintain academic performance through final exams'
      ]
    };
    return actionMap[grade] || [
      'Research university programs that match your interests and academic performance',
      'Apply for financial aid and bursary opportunities early',
      'Focus on improving performance in key subjects',
      'Attend university open days and career guidance sessions',
      'Prepare all required documentation for applications',
      'Create backup plans including alternative career paths'
    ];
  }

  // Update the metric box method to match HeaderCard styling
  addMetricBox(title, value, x, y, width, height) {
    // Box background
    this.pdf.setFillColor(248, 250, 252);
    this.pdf.rect(x, y, width, height, 'F');
    
    // Box border
    this.pdf.setDrawColor(17, 78, 78);
    this.pdf.setLineWidth(0.5);
    this.pdf.rect(x, y, width, height);
    
    // Title
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(107, 114, 128);
    this.pdf.text(title, x + 3, y + 10);
    
    // Value
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(17, 78, 78);
    this.pdf.text(value.toString(), x + 3, y + 22);
  }

  generateFallbackPDF() {
    const fallbackPdf = new jsPDF();
    fallbackPdf.setFont('helvetica', 'normal');
    fallbackPdf.setFontSize(12);
    fallbackPdf.text('THANDI.AI Career Assessment Report', 20, 30);
    fallbackPdf.text('Report generation encountered technical difficulties.', 20, 50);
    fallbackPdf.text('Please contact support for assistance.', 20, 70);
    return fallbackPdf;
  }

  // Compatibility method for existing code
  addMetricCard(title, value, x, y, width = 50, height = 35) {
    this.addCleanMetricBox(title, value, x, y, width, height);
  }
}