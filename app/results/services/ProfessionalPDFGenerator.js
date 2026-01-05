import jsPDF from 'jspdf';

export class ProfessionalPDFGenerator {
  constructor(parsedResults, studentData) {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.parsedResults = parsedResults;
    this.studentData = studentData;
    this.colors = {
      primary: [17, 78, 78],      // Thandi teal #114E4E
      secondary: [107, 114, 128], // Gray
      accent: [223, 163, 58],     // Thandi gold #DFA33A
      warning: [239, 68, 68],     // Red
      success: [16, 185, 129],    // Green
      background: [249, 250, 251],
      white: [255, 255, 255],
      black: [0, 0, 0]
    };
    this.fonts = {
      heading: 'helvetica',
      body: 'helvetica',
      mono: 'courier'
    };
    this.pageNumber = 1;
  }

  generateProfessionalReport() {
    this.addCoverPage();
    this.addExecutiveSummary();
    this.addAcademicOverview();
    this.addProgramRecommendations();
    this.addFinancialAidSection();
    this.addActionPlan();
    this.addVerificationSection();
    this.addFootersAndHeaders();
    return this.pdf;
  }

  addCoverPage() {
    // Professional header band
    this.pdf.setFillColor(...this.colors.primary);
    this.pdf.rect(0, 0, 210, 80, 'F');
    
    // Thandi branding
    this.pdf.setTextColor(...this.colors.white);
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(32);
    this.pdf.text('THANDI.AI', 20, 35);
    
    this.pdf.setFontSize(16);
    this.pdf.text('Career Guidance Report', 20, 50);
    
    // Main title
    this.pdf.setTextColor(...this.colors.black);
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(36);
    this.pdf.text('Your Career Path', 20, 120);
    this.pdf.text('Guidance Report', 20, 140);
    
    // Student information box
    this.pdf.setFillColor(248, 250, 252);
    this.pdf.rect(20, 160, 170, 60, 'F');
    this.pdf.setDrawColor(...this.colors.primary);
    this.pdf.setLineWidth(2);
    this.pdf.rect(20, 160, 170, 60);
    
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(...this.colors.black);
    
    const studentName = this.studentData?.name || 'Student';
    const grade = this.parsedResults?.headerData?.gradeLevel || 'Unknown';
    const date = new Date().toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    this.pdf.text(`Prepared for: ${studentName}`, 30, 180);
    this.pdf.text(`Grade: ${grade}`, 30, 195);
    this.pdf.text(`Report Date: ${date}`, 30, 210);
    
    // Add disclaimer box
    this.addDisclaimerBox();
  }

  addExecutiveSummary() {
    this.pdf.addPage();
    this.addPageHeader('Executive Summary');
    
    const gradeContext = this.getGradeSpecificContext();
    
    // Grade-specific summary header
    this.pdf.setFillColor(...this.colors.accent, 0.1);
    this.pdf.rect(20, 60, 170, 25, 'F');
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(...this.colors.primary);
    this.pdf.text(`Grade ${this.parsedResults.headerData?.gradeLevel} Student Profile`, 25, 75);
    
    // Key metrics in professional boxes
    let yPos = 95;
    this.addMetricBox('Grade Level', this.parsedResults.headerData?.gradeLevel || 'Unknown', 20, yPos);
    
    if (this.parsedResults.headerData?.hasMarks) {
      this.addMetricBox('APS Score', this.parsedResults.headerData?.apsScore || 'TBD', 80, yPos);
    } else {
      this.addMetricBox('Status', 'Foundation Year', 80, yPos);
    }
    
    this.addMetricBox('University Ready', 
      this.parsedResults.headerData?.universityEligible ? 'Yes' : 'Planning', 140, yPos);
    
    // Grade-specific summary text
    yPos += 50;
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(...this.colors.black);
    
    const summaryText = this.generateGradeSpecificSummary();
    const lines = this.pdf.splitTextToSize(summaryText, 170);
    this.pdf.text(lines, 20, yPos);
    
    // Key highlights
    yPos += lines.length * 5 + 20;
    this.addSectionDivider('Key Highlights', yPos);
    yPos += 15;
    
    const highlights = this.generateKeyHighlights();
    highlights.forEach((highlight, index) => {
      this.pdf.setFillColor(...this.colors.primary);
      this.pdf.circle(25, yPos + 3, 3, 'F');
      this.pdf.setTextColor(...this.colors.white);
      this.pdf.setFont(this.fonts.body, 'bold');
      this.pdf.setFontSize(8);
      this.pdf.text((index + 1).toString(), 23.5, yPos + 4.5);
      
      this.pdf.setTextColor(...this.colors.black);
      this.pdf.setFont(this.fonts.body, 'normal');
      this.pdf.setFontSize(11);
      const highlightLines = this.pdf.splitTextToSize(highlight, 160);
      this.pdf.text(highlightLines, 35, yPos + 5);
      
      yPos += highlightLines.length * 5 + 8;
    });
  }

  generateGradeSpecificSummary() {
    const grade = this.parsedResults.headerData?.gradeLevel;
    const hasMarks = this.parsedResults.headerData?.hasMarks;
    
    switch (grade) {
      case 10:
        return `As a Grade 10 student, you are in your foundation year of the Senior Phase. This report focuses on career exploration and subject confirmation rather than specific university applications. You have time to explore different career paths and ensure your current subjects align with your interests and abilities. The recommendations below are exploratory in nature, designed to help you understand various career options available to you.`;
        
      case 11:
        return `As a Grade 11 student, you are in the strategic planning phase of your education. ${hasMarks ? 'Using your Grade 10 performance data, this report provides targeted guidance for university research and mark improvement strategies.' : ''} You have two years to prepare for your final NSC examinations and university applications. The recommendations focus on university program research, targeted academic improvement, and bursary preparation.`;
        
      case 12:
        return `As a Grade 12 student, you are in your final and most critical year. ${hasMarks ? 'Based on your Grade 11 performance, this report provides specific guidance for university applications and NSC preparation.' : ''} The recommendations are focused on immediate actions: university application deadlines, intensive NSC preparation, and backup planning. Time is critical, and the guidance below is designed to help you achieve your best possible outcomes.`;
        
      default:
        return `This career guidance report provides personalized recommendations based on your academic performance and interests.`;
    }
  }

  generateKeyHighlights() {
    const highlights = [];
    const programs = this.parsedResults.programs || [];
    const bursaries = this.parsedResults.bursaries || [];
    
    if (programs.length > 0) {
      highlights.push(`${programs.length} university programs identified that match your profile and interests`);
    }
    
    if (bursaries.length > 0) {
      highlights.push(`${bursaries.length} financial aid opportunities available for your consideration`);
    }
    
    const grade = this.parsedResults.headerData?.gradeLevel;
    const gradeContext = this.getGradeSpecificContext();
    
    if (gradeContext.timeHorizon) {
      highlights.push(`${gradeContext.timeHorizon} - ${gradeContext.focus}`);
    }
    
    if (this.parsedResults.actionPlan?.actionItems?.length > 0) {
      highlights.push(`${this.parsedResults.actionPlan.actionItems.length} specific action items to guide your next steps`);
    }
    
    return highlights;
  }

  getGradeSpecificContext() {
    const grade = this.parsedResults.headerData?.gradeLevel;
    
    const contexts = {
      10: {
        phase: 'Foundation Year',
        focus: 'Career Exploration & Subject Confirmation',
        timeHorizon: '3 years to matric',
        marksContext: 'Building academic foundation'
      },
      11: {
        phase: 'Strategic Planning Year', 
        focus: 'University Research & Mark Improvement',
        timeHorizon: '2 years to matric',
        marksContext: 'Grade 10 marks available for planning'
      },
      12: {
        phase: 'Critical Decision Year',
        focus: 'Applications & NSC Preparation', 
        timeHorizon: '1 year to matric',
        marksContext: 'Grade 11 marks guide final decisions'
      }
    };
    
    return contexts[grade] || {};
  }

  addAcademicOverview() {
    this.pdf.addPage();
    this.addPageHeader('Academic Overview');
    
    let yPos = 60;
    
    // Academic status section
    this.pdf.setFillColor(...this.colors.primary, 0.1);
    this.pdf.rect(20, yPos, 170, 30, 'F');
    
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(...this.colors.primary);
    this.pdf.text('Current Academic Status', 25, yPos + 15);
    
    yPos += 40;
    
    // Grade-specific academic information
    const headerData = this.parsedResults.headerData || {};
    
    if (headerData.hasMarks && headerData.apsScore) {
      // APS Score visualization
      this.addMetricCard('APS Score', headerData.apsScore, 20, yPos, 50, 35);
      this.addMetricCard('Projected Range', `${headerData.projectedApsRange?.min || 'TBD'}-${headerData.projectedApsRange?.max || 'TBD'}`, 80, yPos, 50, 35);
      this.addMetricCard('University Eligible', headerData.universityEligible ? 'Yes' : 'Planning', 140, yPos, 50, 35);
    } else {
      // Foundation year status
      this.addMetricCard('Grade Level', headerData.gradeLevel, 20, yPos, 50, 35);
      this.addMetricCard('Phase', 'Foundation', 80, yPos, 50, 35);
      this.addMetricCard('Focus', 'Exploration', 140, yPos, 50, 35);
    }
    
    yPos += 50;
    
    // Academic timeline
    this.addSectionDivider('Academic Timeline', yPos);
    yPos += 15;
    
    const timeline = this.parsedResults.actionPlan?.timeline || 'Academic planning in progress';
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(...this.colors.black);
    this.pdf.text(timeline, 20, yPos);
  }

  addProgramRecommendations() {
    this.pdf.addPage();
    this.addPageHeader('University Program Recommendations');
    
    let yPos = 60;
    const programs = this.parsedResults.programs || [];
    
    if (programs.length === 0) {
      this.pdf.setFont(this.fonts.body, 'normal');
      this.pdf.setFontSize(12);
      this.pdf.text('Program recommendations will be available based on your academic performance.', 20, yPos);
      return;
    }
    
    programs.forEach((program, index) => {
      if (yPos > 240) {
        this.pdf.addPage();
        this.addPageHeader('University Program Recommendations (continued)');
        yPos = 60;
      }
      
      yPos = this.addProgramCard(program, yPos);
    });
  }

  addProgramCard(program, yPos) {
    const cardHeight = 50;
    
    // Card background with feasibility color
    const bgColor = this.getFeasibilityColor(program.feasibility);
    this.pdf.setFillColor(...bgColor, 0.1);
    this.pdf.rect(20, yPos, 170, cardHeight, 'F');
    
    // Feasibility badge
    this.pdf.setFillColor(...bgColor);
    this.pdf.rect(20, yPos, 35, 10, 'F');
    this.pdf.setTextColor(...this.colors.white);
    this.pdf.setFont(this.fonts.body, 'bold');
    this.pdf.setFontSize(9);
    this.pdf.text((program.feasibility || 'TBD').toUpperCase(), 22, yPos + 7);
    
    // Program title
    this.pdf.setTextColor(...this.colors.black);
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(13);
    this.pdf.text(program.program || 'Program Name', 20, yPos + 20);
    
    // University
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(...this.colors.secondary);
    this.pdf.text(program.university || 'University', 20, yPos + 30);
    
    // Key metrics
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(...this.colors.black);
    
    // APS Required
    this.pdf.text('APS Required:', 20, yPos + 40);
    this.pdf.setFont(this.fonts.mono, 'bold');
    this.pdf.text((program.apsRequired || 'TBD').toString(), 55, yPos + 40);
    
    // Admission Chance
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.text('Admission Chance:', 90, yPos + 40);
    this.pdf.setFont(this.fonts.mono, 'bold');
    this.pdf.text(`${program.admissionChance || 'TBD'}%`, 135, yPos + 40);
    
    // Deadline
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.text('Deadline:', 155, yPos + 40);
    this.pdf.setFont(this.fonts.mono, 'bold');
    const deadline = program.applicationDeadline || 'TBD';
    this.pdf.text(deadline.length > 10 ? deadline.substring(0, 10) : deadline, 155, yPos + 47);
    
    // Progress bar for admission chance
    if (program.admissionChance) {
      this.addProgressBar(program.admissionChance, 100, 20, yPos + 45, 60);
    }
    
    return yPos + cardHeight + 10;
  }

  addFinancialAidSection() {
    this.pdf.addPage();
    this.addPageHeader('Financial Aid Opportunities');
    
    let yPos = 60;
    const bursaries = this.parsedResults.bursaries || [];
    
    if (bursaries.length === 0) {
      this.pdf.setFont(this.fonts.body, 'normal');
      this.pdf.setFontSize(12);
      this.pdf.text('Financial aid opportunities will be identified based on your profile and needs.', 20, yPos);
      return;
    }
    
    bursaries.forEach((bursary, index) => {
      if (yPos > 230) {
        this.pdf.addPage();
        this.addPageHeader('Financial Aid Opportunities (continued)');
        yPos = 60;
      }
      
      yPos = this.addBursaryCard(bursary, yPos);
    });
  }

  addBursaryCard(bursary, yPos) {
    const cardHeight = 45;
    
    // Urgency color coding
    const urgencyColor = this.getUrgencyColor(bursary.urgency);
    
    // Card with left border
    this.pdf.setFillColor(250, 250, 250);
    this.pdf.rect(20, yPos, 170, cardHeight, 'F');
    this.pdf.setFillColor(...urgencyColor);
    this.pdf.rect(20, yPos, 4, cardHeight, 'F');
    
    // Urgency badge
    this.pdf.setFillColor(...urgencyColor);
    this.pdf.rect(165, yPos + 5, 20, 10, 'F');
    this.pdf.setTextColor(...this.colors.white);
    this.pdf.setFont(this.fonts.body, 'bold');
    this.pdf.setFontSize(8);
    this.pdf.text(bursary.urgency || 'INFO', 167, yPos + 11);
    
    // Bursary name
    this.pdf.setTextColor(...this.colors.black);
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(12);
    this.pdf.text(bursary.name || 'Financial Aid Opportunity', 27, yPos + 15);
    
    // Amount and details
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(10);
    this.pdf.text(`Amount: ${bursary.amount || 'Varies'}`, 27, yPos + 25);
    this.pdf.text(`Match: ${bursary.eligibilityMatch || 'TBD'}%`, 27, yPos + 33);
    this.pdf.text(`Deadline: ${bursary.deadline || 'TBD'}`, 100, yPos + 25);
    
    // Match progress bar
    if (bursary.eligibilityMatch) {
      this.addProgressBar(bursary.eligibilityMatch, 100, 100, yPos + 30, 50);
    }
    
    return yPos + cardHeight + 8;
  }

  addActionPlan() {
    this.pdf.addPage();
    this.addPageHeader('Your Action Plan');
    
    let yPos = 60;
    
    // Timeline header
    this.pdf.setFillColor(...this.colors.accent, 0.2);
    this.pdf.rect(20, yPos, 170, 25, 'F');
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(...this.colors.primary);
    const timeline = this.parsedResults.actionPlan?.timeline || 'Academic planning timeline';
    this.pdf.text(timeline, 25, yPos + 16);
    
    yPos += 35;
    
    // Action items
    const actionItems = this.parsedResults.actionPlan?.actionItems || [];
    
    if (actionItems.length === 0) {
      this.pdf.setFont(this.fonts.body, 'normal');
      this.pdf.setFontSize(12);
      this.pdf.text('Action items will be provided based on your grade level and academic goals.', 20, yPos);
      return;
    }
    
    actionItems.forEach((action, index) => {
      if (yPos > 250) {
        this.pdf.addPage();
        this.addPageHeader('Your Action Plan (continued)');
        yPos = 60;
      }
      
      // Number circle
      this.pdf.setFillColor(...this.colors.primary);
      this.pdf.circle(27, yPos + 5, 5, 'F');
      this.pdf.setTextColor(...this.colors.white);
      this.pdf.setFont(this.fonts.body, 'bold');
      this.pdf.setFontSize(11);
      this.pdf.text((index + 1).toString(), 25, yPos + 7);
      
      // Action text
      this.pdf.setTextColor(...this.colors.black);
      this.pdf.setFont(this.fonts.body, 'normal');
      this.pdf.setFontSize(11);
      const actionLines = this.pdf.splitTextToSize(action, 150);
      this.pdf.text(actionLines, 37, yPos + 7);
      
      yPos += actionLines.length * 6 + 12;
    });
    
    // Grade-specific guidance
    yPos += 10;
    const gradeGuidance = this.parsedResults.actionPlan?.gradeSpecificGuidance || [];
    
    if (gradeGuidance.length > 0) {
      this.addSectionDivider('Grade-Specific Guidance', yPos);
      yPos += 15;
      
      gradeGuidance.forEach((guidance) => {
        if (yPos > 250) {
          this.pdf.addPage();
          this.addPageHeader('Your Action Plan (continued)');
          yPos = 60;
        }
        
        this.pdf.setFillColor(...this.colors.accent);
        this.pdf.rect(20, yPos, 8, 8, 'F');
        this.pdf.setTextColor(...this.colors.white);
        this.pdf.setFont(this.fonts.body, 'bold');
        this.pdf.setFontSize(8);
        this.pdf.text('G', 22, yPos + 5);
        
        this.pdf.setTextColor(...this.colors.black);
        this.pdf.setFont(this.fonts.body, 'normal');
        this.pdf.setFontSize(10);
        const guidanceLines = this.pdf.splitTextToSize(guidance, 155);
        this.pdf.text(guidanceLines, 32, yPos + 6);
        
        yPos += guidanceLines.length * 5 + 10;
      });
    }
  }

  addVerificationSection() {
    this.pdf.addPage();
    this.addPageHeader('Verification & Next Steps');
    
    let yPos = 60;
    
    // Critical verification notice
    this.pdf.setFillColor(255, 243, 205);
    this.pdf.rect(20, yPos, 170, 80, 'F');
    this.pdf.setDrawColor(...this.colors.warning);
    this.pdf.setLineWidth(3);
    this.pdf.rect(20, yPos, 170, 80);
    
    this.pdf.setTextColor(...this.colors.warning);
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(16);
    this.pdf.text('⚠️ CRITICAL: VERIFY BEFORE DECIDING', 25, yPos + 15);
    
    this.pdf.setTextColor(...this.colors.black);
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(11);
    
    const verificationSteps = [
      'Speak with your school counselor about these recommendations',
      'Contact universities directly to confirm program requirements',
      'Verify bursary eligibility and application deadlines',
      'Check official institution websites for current information',
      'Consult with parents/guardians about financial planning'
    ];
    
    let stepYPos = yPos + 30;
    verificationSteps.forEach((step, index) => {
      this.pdf.setFillColor(...this.colors.warning);
      this.pdf.circle(27, stepYPos, 3, 'F');
      this.pdf.setTextColor(...this.colors.white);
      this.pdf.setFont(this.fonts.body, 'bold');
      this.pdf.setFontSize(9);
      this.pdf.text((index + 1).toString(), 25.5, stepYPos + 1);
      
      this.pdf.setTextColor(...this.colors.black);
      this.pdf.setFont(this.fonts.body, 'normal');
      this.pdf.setFontSize(10);
      const stepLines = this.pdf.splitTextToSize(step, 150);
      this.pdf.text(stepLines, 35, stepYPos + 1);
      
      stepYPos += stepLines.length * 5 + 3;
    });
    
    yPos += 90;
    
    // Important disclaimer
    this.pdf.setFont(this.fonts.body, 'italic');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(...this.colors.secondary);
    const disclaimer = 'This report contains AI-generated guidance. Information may be outdated or incomplete. Always verify with official sources and qualified counselors before making educational or career decisions.';
    const disclaimerLines = this.pdf.splitTextToSize(disclaimer, 170);
    this.pdf.text(disclaimerLines, 20, yPos);
  }

  addPageHeader(title) {
    // Header background
    this.pdf.setFillColor(...this.colors.primary);
    this.pdf.rect(0, 0, 210, 35, 'F');
    
    // Title
    this.pdf.setTextColor(...this.colors.white);
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(18);
    this.pdf.text(title, 20, 22);
    
    // Page number
    this.pdf.setFontSize(12);
    this.pdf.text(`Page ${this.pdf.internal.getCurrentPageInfo().pageNumber}`, 170, 22);
  }

  addDisclaimerBox() {
    // Professional disclaimer at bottom of cover
    this.pdf.setFillColor(255, 243, 205);
    this.pdf.rect(20, 240, 170, 40, 'F');
    this.pdf.setDrawColor(...this.colors.warning);
    this.pdf.setLineWidth(2);
    this.pdf.rect(20, 240, 170, 40);
    
    this.pdf.setTextColor(...this.colors.warning);
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(12);
    this.pdf.text('⚠️ IMPORTANT DISCLAIMER', 25, 252);
    
    this.pdf.setTextColor(...this.colors.black);
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(10);
    const disclaimerText = 'This report contains AI-generated career guidance. All recommendations must be verified with qualified counselors, institutions, and official sources before making educational or career decisions.';
    const lines = this.pdf.splitTextToSize(disclaimerText, 160);
    this.pdf.text(lines, 25, 265);
  }

  addMetricBox(title, value, x, y, width = 50, height = 30) {
    // Card background
    this.pdf.setFillColor(248, 250, 252);
    this.pdf.rect(x, y, width, height, 'F');
    
    // Border
    this.pdf.setDrawColor(...this.colors.primary);
    this.pdf.setLineWidth(1);
    this.pdf.rect(x, y, width, height);
    
    // Title
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(...this.colors.secondary);
    this.pdf.text(title, x + 3, y + 10);
    
    // Value
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(...this.colors.primary);
    const valueText = value?.toString() || 'TBD';
    this.pdf.text(valueText, x + 3, y + 22);
  }

  addMetricCard(title, value, x, y, width = 50, height = 35) {
    // Enhanced metric card with better styling
    this.pdf.setFillColor(...this.colors.white);
    this.pdf.rect(x, y, width, height, 'F');
    
    // Gradient effect simulation
    this.pdf.setFillColor(248, 250, 252);
    this.pdf.rect(x, y, width, height / 3, 'F');
    
    // Border
    this.pdf.setDrawColor(...this.colors.primary);
    this.pdf.setLineWidth(1.5);
    this.pdf.rect(x, y, width, height);
    
    // Title
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(...this.colors.secondary);
    this.pdf.text(title, x + 4, y + 12);
    
    // Value
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(...this.colors.primary);
    const valueText = value?.toString() || 'TBD';
    this.pdf.text(valueText, x + 4, y + 26);
  }

  addProgressBar(value, max, x, y, width) {
    const percentage = Math.min((value / max) * 100, 100);
    const fillWidth = (width * percentage) / 100;
    
    // Background
    this.pdf.setFillColor(240, 240, 240);
    this.pdf.rect(x, y, width, 4, 'F');
    
    // Fill color based on percentage
    const color = percentage >= 70 ? this.colors.success : 
                  percentage >= 40 ? this.colors.accent : this.colors.warning;
    this.pdf.setFillColor(...color);
    this.pdf.rect(x, y, fillWidth, 4, 'F');
    
    // Border
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.setLineWidth(0.5);
    this.pdf.rect(x, y, width, 4);
  }

  addSectionDivider(title, y) {
    // Professional section divider
    this.pdf.setDrawColor(...this.colors.primary);
    this.pdf.setLineWidth(1);
    this.pdf.line(20, y, 190, y);
    
    // Title background
    this.pdf.setFillColor(...this.colors.white);
    this.pdf.rect(85, y - 5, 40, 10, 'F');
    
    // Title text
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(...this.colors.primary);
    this.pdf.text(title, 105, y + 2, { align: 'center' });
    
    return y + 15;
  }

  addFootersAndHeaders() {
    const pageCount = this.pdf.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      
      // Skip footer on cover page
      if (i === 1) continue;
      
      // Footer
      this.pdf.setFont(this.fonts.body, 'normal');
      this.pdf.setFontSize(9);
      this.pdf.setTextColor(...this.colors.secondary);
      
      // Left footer - Thandi branding
      this.pdf.text('Generated by Thandi.AI', 20, 285);
      
      // Center footer - Date
      const date = new Date().toLocaleDateString();
      this.pdf.text(date, 105, 285, { align: 'center' });
      
      // Right footer - Page number
      this.pdf.text(`${i} of ${pageCount}`, 190, 285, { align: 'right' });
      
      // Footer line
      this.pdf.setDrawColor(...this.colors.primary);
      this.pdf.setLineWidth(0.5);
      this.pdf.line(20, 280, 190, 280);
    }
  }

  getFeasibilityColor(feasibility) {
    switch (feasibility?.toLowerCase()) {
      case 'high': return this.colors.success;
      case 'medium': return this.colors.accent;
      case 'low': return this.colors.warning;
      default: return this.colors.secondary;
    }
  }

  getUrgencyColor(urgency) {
    switch (urgency?.toUpperCase()) {
      case 'CRITICAL': return this.colors.warning;
      case 'HIGH': return this.colors.accent;
      case 'INFO': return this.colors.primary;
      default: return this.colors.secondary;
    }
  }
}