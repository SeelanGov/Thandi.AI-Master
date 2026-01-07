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
    // Enhanced professional cover with modern design
    
    // Primary header band with gradient effect
    this.pdf.setFillColor(...this.colors.primary);
    this.pdf.rect(0, 0, 210, 120, 'F');
    
    // Accent stripe for visual interest
    this.pdf.setFillColor(...this.colors.accent);
    this.pdf.rect(0, 110, 210, 10, 'F');
    
    // Thandi branding - enhanced with better typography
    this.pdf.setTextColor(...this.colors.white);
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(42);
    this.pdf.text('THANDI.AI', 25, 45);
    
    // Subtitle with improved spacing
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.text('Intelligent Career Guidance Platform', 25, 65);
    
    // Professional tagline
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(255, 255, 255, 0.8);
    this.pdf.text('Personalized • Data-Driven • Future-Ready', 25, 80);
    
    // Decorative elements
    this.pdf.setDrawColor(...this.colors.accent);
    this.pdf.setLineWidth(4);
    this.pdf.line(25, 90, 140, 90);
    
    // Add geometric accent
    this.pdf.setFillColor(...this.colors.accent);
    this.pdf.circle(170, 60, 15, 'F');
    this.pdf.setFillColor(...this.colors.white);
    this.pdf.circle(170, 60, 10, 'F');
    
    // Main title with enhanced typography and spacing
    this.pdf.setTextColor(...this.colors.black);
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(28);
    this.pdf.text('Your Personalized', 25, 150);
    this.pdf.setFontSize(32);
    this.pdf.setTextColor(...this.colors.primary);
    this.pdf.text('Career Path Report', 25, 170);
    
    // Enhanced student information card with modern design
    this.pdf.setFillColor(...this.colors.white);
    this.pdf.rect(25, 190, 160, 80, 'F');
    
    // Card shadow effect
    this.pdf.setFillColor(0, 0, 0, 0.05);
    this.pdf.rect(27, 192, 160, 80, 'F');
    this.pdf.setFillColor(...this.colors.white);
    this.pdf.rect(25, 190, 160, 80, 'F');
    
    // Card border with accent color
    this.pdf.setDrawColor(...this.colors.accent);
    this.pdf.setLineWidth(2);
    this.pdf.rect(25, 190, 160, 80);
    
    // Card header
    this.pdf.setFillColor(...this.colors.primary);
    this.pdf.rect(25, 190, 160, 25, 'F');
    
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(...this.colors.white);
    this.pdf.text('STUDENT PROFILE', 35, 206);
    
    // Student details with improved layout
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(...this.colors.black);
    
    const studentName = this.studentData?.name || 'Student';
    const gradeLevel = this.parsedResults?.headerData?.gradeLevel || 'Unknown';
    const date = new Date().toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Left column
    this.pdf.setFont(this.fonts.body, 'bold');
    this.pdf.setTextColor(...this.colors.primary);
    this.pdf.text('Student Name:', 35, 230);
    this.pdf.text('Grade Level:', 35, 245);
    this.pdf.text('Report Date:', 35, 260);
    
    // Right column - values
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setTextColor(...this.colors.black);
    this.pdf.text(studentName, 85, 230);
    this.pdf.text(`Grade ${gradeLevel}`, 85, 245);
    this.pdf.text(date, 85, 260);
    
    // Academic year in right section
    this.pdf.setFont(this.fonts.body, 'bold');
    this.pdf.setTextColor(...this.colors.primary);
    this.pdf.text('Academic Year:', 125, 230);
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setTextColor(...this.colors.black);
    this.pdf.text(new Date().getFullYear().toString(), 125, 245);
    
    // Add enhanced disclaimer box
    this.addEnhancedDisclaimerBox();
  }

  addExecutiveSummary() {
    this.pdf.addPage();
    this.addPageHeader('Executive Summary');
    
    const gradeContext = this.getGradeSpecificContext();
    
    // Enhanced grade-specific summary header with modern design
    this.pdf.setFillColor(...this.colors.primary);
    this.pdf.rect(20, 50, 170, 35, 'F');
    
    // Accent stripe
    this.pdf.setFillColor(...this.colors.accent);
    this.pdf.rect(20, 80, 170, 5, 'F');
    
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(18);
    this.pdf.setTextColor(...this.colors.white);
    this.pdf.text(`Grade ${this.parsedResults.headerData?.gradeLevel} Student Profile`, 30, 65);
    
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(255, 255, 255, 0.9);
    this.pdf.text(gradeContext.phase || 'Academic Planning Phase', 30, 75);
    
    // Enhanced key metrics with professional card design
    let yPos = 100;
    const cardWidth = 50;
    const cardHeight = 40;
    const cardSpacing = 60;
    
    // Metric cards with enhanced styling
    this.addEnhancedMetricCard('Grade Level', this.parsedResults.headerData?.gradeLevel || 'Unknown', 20, yPos, cardWidth, cardHeight);
    
    if (this.parsedResults.headerData?.hasMarks) {
      this.addEnhancedMetricCard('APS Score', this.parsedResults.headerData?.apsScore || 'TBD', 20 + cardSpacing, yPos, cardWidth, cardHeight);
    } else {
      this.addEnhancedMetricCard('Status', 'Foundation', 20 + cardSpacing, yPos, cardWidth, cardHeight);
    }
    
    this.addEnhancedMetricCard('University Ready', 
      this.parsedResults.headerData?.universityEligible ? 'Yes' : 'Planning', 20 + (cardSpacing * 2), yPos, cardWidth, cardHeight);
    
    // Grade-specific summary with improved typography
    yPos += 60;
    this.pdf.setFillColor(248, 250, 252);
    this.pdf.rect(20, yPos, 170, 5, 'F');
    
    yPos += 15;
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(...this.colors.black);
    this.pdf.setLineHeightFactor(1.6);
    
    const summaryText = this.generateGradeSpecificSummary();
    const lines = this.pdf.splitTextToSize(summaryText, 170);
    this.pdf.text(lines, 20, yPos);
    
    // Enhanced key highlights section
    yPos += lines.length * 7 + 25;
    this.addEnhancedSectionDivider('Key Highlights', yPos);
    yPos += 20;
    
    const highlights = this.generateKeyHighlights();
    highlights.forEach((highlight, index) => {
      // Enhanced highlight design
      this.pdf.setFillColor(...this.colors.accent);
      this.pdf.circle(28, yPos + 5, 6, 'F');
      
      this.pdf.setFillColor(...this.colors.primary);
      this.pdf.circle(28, yPos + 5, 4, 'F');
      
      this.pdf.setTextColor(...this.colors.white);
      this.pdf.setFont(this.fonts.body, 'bold');
      this.pdf.setFontSize(10);
      this.pdf.text((index + 1).toString(), 26, yPos + 7);
      
      this.pdf.setTextColor(...this.colors.black);
      this.pdf.setFont(this.fonts.body, 'normal');
      this.pdf.setFontSize(11);
      this.pdf.setLineHeightFactor(1.5);
      const highlightLines = this.pdf.splitTextToSize(highlight, 150);
      this.pdf.text(highlightLines, 40, yPos + 7);
      
      yPos += highlightLines.length * 6 + 12;
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
    const cardHeight = 65; // Increased height for better spacing
    
    // Enhanced card with shadow and modern design
    this.pdf.setFillColor(0, 0, 0, 0.05);
    this.pdf.rect(22, yPos + 2, 170, cardHeight, 'F');
    
    // Card background with feasibility color accent
    const bgColor = this.getFeasibilityColor(program.feasibility);
    this.pdf.setFillColor(...this.colors.white);
    this.pdf.rect(20, yPos, 170, cardHeight, 'F');
    
    // Left accent border
    this.pdf.setFillColor(...bgColor);
    this.pdf.rect(20, yPos, 5, cardHeight, 'F');
    
    // Header section
    this.pdf.setFillColor(248, 250, 252);
    this.pdf.rect(25, yPos, 165, 20, 'F');
    
    // Feasibility badge with enhanced styling
    this.pdf.setFillColor(...bgColor);
    this.pdf.rect(160, yPos + 5, 25, 10, 'F');
    this.pdf.setTextColor(...this.colors.white);
    this.pdf.setFont(this.fonts.body, 'bold');
    this.pdf.setFontSize(8);
    this.pdf.text((program.feasibility || 'TBD').toUpperCase(), 162, yPos + 11);
    
    // Program title with enhanced typography
    this.pdf.setTextColor(...this.colors.primary);
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(14);
    this.pdf.text(program.program || 'Program Name', 30, yPos + 15);
    
    // University with improved styling
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(...this.colors.secondary);
    this.pdf.text(program.university || 'University', 30, yPos + 30);
    
    // Enhanced metrics section with better layout
    const metricsY = yPos + 45;
    
    // APS Required box
    this.addMetricPill('APS Required', (program.apsRequired || 'TBD').toString(), 30, metricsY, this.colors.primary);
    
    // Admission Chance box
    this.addMetricPill('Admission', `${program.admissionChance || 'TBD'}%`, 90, metricsY, this.colors.accent);
    
    // Deadline box
    const deadline = program.applicationDeadline || 'TBD';
    this.addMetricPill('Deadline', deadline.length > 8 ? deadline.substring(0, 8) : deadline, 150, metricsY, this.colors.secondary);
    
    // Enhanced progress bar for admission chance
    if (program.admissionChance) {
      this.addEnhancedProgressBar(program.admissionChance, 100, 30, yPos + 55, 130);
    }
    
    return yPos + cardHeight + 15;
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
    const cardHeight = 55; // Increased height for better spacing
    
    // Enhanced card with modern design
    this.pdf.setFillColor(0, 0, 0, 0.03);
    this.pdf.rect(22, yPos + 2, 170, cardHeight, 'F');
    
    // Urgency color coding
    const urgencyColor = this.getUrgencyColor(bursary.urgency);
    
    // Main card background
    this.pdf.setFillColor(...this.colors.white);
    this.pdf.rect(20, yPos, 170, cardHeight, 'F');
    
    // Left accent border with urgency color
    this.pdf.setFillColor(...urgencyColor);
    this.pdf.rect(20, yPos, 6, cardHeight, 'F');
    
    // Header section with gradient
    this.pdf.setFillColor(250, 250, 250);
    this.pdf.rect(26, yPos, 164, 18, 'F');
    
    // Enhanced urgency badge
    this.pdf.setFillColor(...urgencyColor);
    this.pdf.roundedRect(160, yPos + 4, 25, 10, 5, 5, 'F');
    this.pdf.setTextColor(...this.colors.white);
    this.pdf.setFont(this.fonts.body, 'bold');
    this.pdf.setFontSize(7);
    this.pdf.text(bursary.urgency || 'INFO', 162, yPos + 10);
    
    // Bursary name with enhanced typography
    this.pdf.setTextColor(...this.colors.primary);
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(13);
    this.pdf.text(bursary.name || 'Financial Aid Opportunity', 30, yPos + 14);
    
    // Enhanced details section
    const detailsY = yPos + 30;
    
    // Amount pill
    this.addMetricPill('Amount', bursary.amount || 'Varies', 30, detailsY, this.colors.accent);
    
    // Match percentage pill
    this.addMetricPill('Match', `${bursary.eligibilityMatch || 'TBD'}%`, 85, detailsY, this.colors.success);
    
    // Deadline pill
    this.addMetricPill('Deadline', bursary.deadline || 'TBD', 140, detailsY, urgencyColor);
    
    // Enhanced match progress bar
    if (bursary.eligibilityMatch) {
      this.addEnhancedProgressBar(bursary.eligibilityMatch, 100, 30, yPos + 45, 120);
    }
    
    return yPos + cardHeight + 12;
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
    // Enhanced header with modern gradient design
    this.pdf.setFillColor(...this.colors.primary);
    this.pdf.rect(0, 0, 210, 40, 'F');
    
    // Accent gradient stripe
    this.pdf.setFillColor(...this.colors.accent);
    this.pdf.rect(0, 35, 210, 5, 'F');
    
    // Decorative elements
    this.pdf.setFillColor(...this.colors.accent, 0.3);
    this.pdf.circle(25, 20, 8, 'F');
    this.pdf.setFillColor(...this.colors.white, 0.2);
    this.pdf.circle(25, 20, 5, 'F');
    
    // Title with enhanced typography
    this.pdf.setTextColor(...this.colors.white);
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(20);
    this.pdf.text(title, 45, 25);
    
    // Page number with modern styling
    const pageNum = this.pdf.internal.getCurrentPageInfo().pageNumber;
    this.pdf.setFillColor(...this.colors.white, 0.2);
    this.pdf.roundedRect(160, 15, 25, 10, 5, 5, 'F');
    
    this.pdf.setFont(this.fonts.body, 'bold');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(...this.colors.white);
    this.pdf.text(`Page ${pageNum}`, 172, 22, { align: 'center' });
  }

  addEnhancedDisclaimerBox() {
    // Enhanced professional disclaimer with modern design
    this.pdf.setFillColor(255, 248, 220); // Warm background
    this.pdf.rect(25, 275, 160, 15, 'F');
    
    // Accent border
    this.pdf.setDrawColor(...this.colors.warning);
    this.pdf.setLineWidth(2);
    this.pdf.rect(25, 275, 160, 15);
    
    // Warning icon area
    this.pdf.setFillColor(...this.colors.warning);
    this.pdf.rect(25, 275, 20, 15, 'F');
    
    // Warning icon
    this.pdf.setTextColor(...this.colors.white);
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(12);
    this.pdf.text('⚠', 32, 285);
    
    // Disclaimer text
    this.pdf.setTextColor(...this.colors.black);
    this.pdf.setFont(this.fonts.body, 'bold');
    this.pdf.setFontSize(9);
    this.pdf.text('IMPORTANT: AI-Generated Guidance - Verify with Qualified Counselors', 50, 280);
    
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(8);
    this.pdf.text('Always confirm recommendations with official sources before making decisions', 50, 287);
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

  addEnhancedMetricCard(title, value, x, y, width = 50, height = 40) {
    // Modern metric card with gradient effect and shadow
    
    // Shadow effect
    this.pdf.setFillColor(0, 0, 0, 0.1);
    this.pdf.rect(x + 2, y + 2, width, height, 'F');
    
    // Main card background
    this.pdf.setFillColor(...this.colors.white);
    this.pdf.rect(x, y, width, height, 'F');
    
    // Header section with gradient effect
    this.pdf.setFillColor(...this.colors.primary);
    this.pdf.rect(x, y, width, height / 3, 'F');
    
    // Accent line
    this.pdf.setFillColor(...this.colors.accent);
    this.pdf.rect(x, y + (height / 3) - 2, width, 2, 'F');
    
    // Border
    this.pdf.setDrawColor(...this.colors.primary);
    this.pdf.setLineWidth(1);
    this.pdf.rect(x, y, width, height);
    
    // Title
    this.pdf.setFont(this.fonts.body, 'bold');
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(...this.colors.white);
    this.pdf.text(title, x + 4, y + 10);
    
    // Value with enhanced typography
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(...this.colors.primary);
    const valueText = value?.toString() || 'TBD';
    this.pdf.text(valueText, x + 4, y + 28);
  }

  addEnhancedSectionDivider(title, y) {
    // Modern section divider with enhanced styling
    
    // Background accent
    this.pdf.setFillColor(...this.colors.accent, 0.1);
    this.pdf.rect(20, y - 5, 170, 15, 'F');
    
    // Main divider line
    this.pdf.setDrawColor(...this.colors.primary);
    this.pdf.setLineWidth(2);
    this.pdf.line(20, y + 2, 190, y + 2);
    
    // Accent line
    this.pdf.setDrawColor(...this.colors.accent);
    this.pdf.setLineWidth(1);
    this.pdf.line(20, y + 4, 190, y + 4);
    
    // Title with enhanced styling
    this.pdf.setFillColor(...this.colors.white);
    this.pdf.rect(85, y - 3, 40, 12, 'F');
    
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(...this.colors.primary);
    this.pdf.text(title, 105, y + 4, { align: 'center' });
    
    return y + 15;
  }

  addMetricPill(label, value, x, y, color) {
    // Modern pill-shaped metric display
    const pillWidth = 45;
    const pillHeight = 12;
    
    // Pill background
    this.pdf.setFillColor(...color, 0.1);
    this.pdf.roundedRect(x, y, pillWidth, pillHeight, 6, 6, 'F');
    
    // Pill border
    this.pdf.setDrawColor(...color);
    this.pdf.setLineWidth(1);
    this.pdf.roundedRect(x, y, pillWidth, pillHeight, 6, 6);
    
    // Label
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(7);
    this.pdf.setTextColor(...color);
    this.pdf.text(label, x + 2, y + 5);
    
    // Value
    this.pdf.setFont(this.fonts.body, 'bold');
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(...this.colors.black);
    this.pdf.text(value, x + 2, y + 10);
  }

  addEnhancedProgressBar(value, max, x, y, width) {
    const percentage = Math.min((value / max) * 100, 100);
    const fillWidth = (width * percentage) / 100;
    const barHeight = 6;
    
    // Background with rounded corners
    this.pdf.setFillColor(240, 240, 240);
    this.pdf.roundedRect(x, y, width, barHeight, 3, 3, 'F');
    
    // Fill color based on percentage with gradient effect
    const color = percentage >= 70 ? this.colors.success : 
                  percentage >= 40 ? this.colors.accent : this.colors.warning;
    
    this.pdf.setFillColor(...color);
    this.pdf.roundedRect(x, y, fillWidth, barHeight, 3, 3, 'F');
    
    // Subtle border
    this.pdf.setDrawColor(220, 220, 220);
    this.pdf.setLineWidth(0.5);
    this.pdf.roundedRect(x, y, width, barHeight, 3, 3);
    
    // Percentage label
    this.pdf.setFont(this.fonts.body, 'bold');
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(...this.colors.black);
    this.pdf.text(`${Math.round(percentage)}%`, x + width + 5, y + 4);
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
      
      // Enhanced footer design
      this.pdf.setDrawColor(...this.colors.primary);
      this.pdf.setLineWidth(1);
      this.pdf.line(20, 275, 190, 275);
      
      // Accent line
      this.pdf.setDrawColor(...this.colors.accent);
      this.pdf.setLineWidth(0.5);
      this.pdf.line(20, 277, 190, 277);
      
      // Footer content with enhanced styling
      this.pdf.setFont(this.fonts.body, 'bold');
      this.pdf.setFontSize(9);
      this.pdf.setTextColor(...this.colors.primary);
      
      // Left footer - Enhanced Thandi branding
      this.pdf.text('Generated by THANDI.AI', 20, 285);
      this.pdf.setFont(this.fonts.body, 'normal');
      this.pdf.setFontSize(8);
      this.pdf.setTextColor(...this.colors.secondary);
      this.pdf.text('Intelligent Career Guidance', 20, 290);
      
      // Center footer - Date with better formatting
      const date = new Date().toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      this.pdf.setFont(this.fonts.body, 'normal');
      this.pdf.setFontSize(9);
      this.pdf.setTextColor(...this.colors.black);
      this.pdf.text(date, 105, 285, { align: 'center' });
      
      // Right footer - Enhanced page number
      this.pdf.setFillColor(...this.colors.primary, 0.1);
      this.pdf.roundedRect(175, 280, 15, 8, 4, 4, 'F');
      
      this.pdf.setFont(this.fonts.body, 'bold');
      this.pdf.setFontSize(9);
      this.pdf.setTextColor(...this.colors.primary);
      this.pdf.text(`${i}/${pageCount}`, 182, 285, { align: 'center' });
    }
  }

  addMetricCard(title, value, x, y, width = 50, height = 35) {
    // Simple metric card for compatibility
    this.pdf.setFillColor(248, 250, 252);
    this.pdf.rect(x, y, width, height, 'F');
    
    this.pdf.setDrawColor(...this.colors.primary);
    this.pdf.setLineWidth(1);
    this.pdf.rect(x, y, width, height);
    
    this.pdf.setFont(this.fonts.body, 'normal');
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(...this.colors.secondary);
    this.pdf.text(title, x + 3, y + 12);
    
    this.pdf.setFont(this.fonts.heading, 'bold');
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(...this.colors.primary);
    const valueText = value?.toString() || 'TBD';
    this.pdf.text(valueText, x + 3, y + 25);
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