/**
 * Program Matcher - Specific University Program Recommendations
 * 
 * Transforms generic career suggestions into specific, actionable program recommendations
 * with APS requirements, admission probabilities, and application deadlines.
 * 
 * @author Kiro AI Assistant (Lead Dev)
 * @version 1.0.0
 * @created December 18, 2025
 */

/**
 * University program database with APS requirements and deadlines
 * Based on 2025/2026 South African university data
 */
const UNIVERSITY_PROGRAMS = {
  // University of Cape Town (UCT)
  uct: {
    name: "University of Cape Town",
    programs: {
      mechanical_engineering: {
        name: "Mechanical Engineering",
        apsRequired: 35,
        subjectRequirements: ["Mathematics: 70%", "Physical Sciences: 70%"],
        applicationDeadline: "July 31, 2026",
        duration: "4 years",
        category: "engineering"
      },
      medicine: {
        name: "Medicine (MBChB)",
        apsRequired: 42,
        subjectRequirements: ["Mathematics: 80%", "Physical Sciences: 80%", "Life Sciences: 80%"],
        applicationDeadline: "July 31, 2026",
        duration: "6 years",
        category: "healthcare"
      },
      computer_science: {
        name: "Computer Science",
        apsRequired: 38,
        subjectRequirements: ["Mathematics: 75%", "Physical Sciences: 70%"],
        applicationDeadline: "July 31, 2026",
        duration: "3 years",
        category: "technology"
      }
    }
  },
  
  // University of the Witwatersrand (Wits)
  wits: {
    name: "University of the Witwatersrand",
    programs: {
      civil_engineering: {
        name: "Civil Engineering",
        apsRequired: 36,
        subjectRequirements: ["Mathematics: 70%", "Physical Sciences: 70%"],
        applicationDeadline: "September 30, 2026",
        duration: "4 years",
        category: "engineering"
      },
      business_science: {
        name: "Business Science",
        apsRequired: 35,
        subjectRequirements: ["Mathematics: 70%", "English: 70%"],
        applicationDeadline: "September 30, 2026",
        duration: "3 years",
        category: "business"
      },
      law: {
        name: "Bachelor of Laws (LLB)",
        apsRequired: 38,
        subjectRequirements: ["English: 75%", "Mathematics/Math Lit: 65%"],
        applicationDeadline: "September 30, 2026",
        duration: "4 years",
        category: "law"
      }
    }
  },
  
  // University of Johannesburg (UJ)
  uj: {
    name: "University of Johannesburg",
    programs: {
      mechanical_engineering: {
        name: "Mechanical Engineering",
        apsRequired: 30,
        subjectRequirements: ["Mathematics: 65%", "Physical Sciences: 65%"],
        applicationDeadline: "September 30, 2026",
        duration: "4 years",
        category: "engineering"
      },
      accounting: {
        name: "Accounting",
        apsRequired: 28,
        subjectRequirements: ["Mathematics: 60%", "English: 60%"],
        applicationDeadline: "September 30, 2026",
        duration: "3 years",
        category: "business"
      },
      information_technology: {
        name: "Information Technology",
        apsRequired: 26,
        subjectRequirements: ["Mathematics: 60%", "Physical Sciences: 60%"],
        applicationDeadline: "September 30, 2026",
        duration: "3 years",
        category: "technology"
      }
    }
  },
  
  // Tshwane University of Technology (TUT)
  tut: {
    name: "Tshwane University of Technology",
    programs: {
      engineering_technology: {
        name: "Engineering Technology",
        apsRequired: 25,
        subjectRequirements: ["Mathematics: 55%", "Physical Sciences: 55%"],
        applicationDeadline: "October 31, 2026",
        duration: "3 years",
        category: "engineering"
      },
      business_management: {
        name: "Business Management",
        apsRequired: 22,
        subjectRequirements: ["Mathematics/Math Lit: 50%", "English: 55%"],
        applicationDeadline: "October 31, 2026",
        duration: "3 years",
        category: "business"
      }
    }
  },
  
  // University of South Africa (UNISA) - Distance Learning
  unisa: {
    name: "University of South Africa (UNISA)",
    programs: {
      business_administration: {
        name: "Business Administration",
        apsRequired: 20,
        subjectRequirements: ["Mathematics/Math Lit: 50%", "English: 50%"],
        applicationDeadline: "November 30, 2026",
        duration: "3 years",
        category: "business"
      },
      information_systems: {
        name: "Information Systems",
        apsRequired: 22,
        subjectRequirements: ["Mathematics: 55%", "English: 55%"],
        applicationDeadline: "November 30, 2026",
        duration: "3 years",
        category: "technology"
      }
    }
  }
};

/**
 * Bursary database with eligibility criteria and deadlines
 */
const BURSARY_DATABASE = {
  nsfas: {
    name: "NSFAS (National Student Financial Aid Scheme)",
    amount: "R80,000/year",
    eligibility: {
      familyIncome: "< R350,000/year",
      citizenship: "South African citizen",
      academicRequirement: "APS 20+"
    },
    deadline: "December 31, 2025",
    urgency: "CRITICAL",
    applicationUrl: "https://www.nsfas.org.za"
  },
  
  sasol_engineering: {
    name: "Sasol Engineering Bursary",
    amount: "R120,000/year",
    eligibility: {
      subjects: "Mathematics 70%+, Physical Sciences 70%+",
      careerField: "Engineering",
      academicRequirement: "APS 30+"
    },
    deadline: "May 15, 2026",
    urgency: "HIGH",
    applicationUrl: "https://www.sasol.com/careers/bursaries"
  },
  
  funza_lushaka: {
    name: "Funza Lushaka Teaching Bursary",
    amount: "R60,000/year",
    eligibility: {
      careerField: "Teaching/Education",
      academicRequirement: "APS 25+"
    },
    deadline: "February 28, 2026",
    urgency: "MEDIUM",
    applicationUrl: "https://www.education.gov.za/Programmes/FunzaLushaka.aspx"
  },
  
  firstrand_foundation: {
    name: "FirstRand Foundation Bursary",
    amount: "R60,000/year",
    eligibility: {
      familyBackground: "First-generation university student",
      academicRequirement: "APS 25+"
    },
    deadline: "March 30, 2026",
    urgency: "MEDIUM",
    applicationUrl: "https://www.firstrand.co.za/csi/education/"
  }
};

/**
 * Calculate APS score from marks
 * @param {Object} marks - Subject marks object
 * @returns {number} APS score
 */
function calculateAPS(marks) {
  console.log(`[APS DEBUG] calculateAPS called with marks:`, marks);
  
  if (!marks || typeof marks !== 'object') {
    console.log(`[APS DEBUG] No marks or invalid marks object, returning 0`);
    return 0;
  }
  
  let totalPoints = 0;
  let subjectCount = 0;
  
  Object.entries(marks).forEach(([subject, mark]) => {
    const percentage = parseFloat(mark);
    console.log(`[APS DEBUG] Processing ${subject}: ${mark} -> ${percentage}`);
    
    if (!isNaN(percentage) && percentage >= 0 && percentage <= 100) {
      let points = 0;
      // Convert percentage to APS points
      if (percentage >= 80) points = 7;
      else if (percentage >= 70) points = 6;
      else if (percentage >= 60) points = 5;
      else if (percentage >= 50) points = 4;
      else if (percentage >= 40) points = 3;
      else if (percentage >= 30) points = 2;
      else points = 1;
      
      totalPoints += points;
      subjectCount++;
      console.log(`[APS DEBUG] ${subject}: ${percentage}% = ${points} points (total: ${totalPoints})`);
    } else {
      console.log(`[APS DEBUG] Invalid mark for ${subject}: ${mark}`);
    }
  });
  
  console.log(`[APS DEBUG] Final APS: ${totalPoints} points from ${subjectCount} subjects`);
  
  // APS is calculated from best 6 subjects, but if fewer subjects provided, use actual total
  return totalPoints;
}

/**
 * Project final APS based on current performance and grade
 * @param {number} currentAPS - Current APS score
 * @param {number} grade - Student grade (10, 11, 12)
 * @returns {Object} Projected APS range
 */
function projectFinalAPS(currentAPS, grade) {
  let improvementFactor = 1.0;
  
  // Grade-based improvement potential
  if (grade === 10) improvementFactor = 1.15; // 15% improvement potential
  else if (grade === 11) improvementFactor = 1.08; // 8% improvement potential
  else improvementFactor = 1.02; // 2% improvement potential (Grade 12)
  
  const projectedMin = Math.max(currentAPS, Math.round(currentAPS * 0.95));
  const projectedMax = Math.min(42, Math.round(currentAPS * improvementFactor));
  
  return {
    min: projectedMin,
    max: projectedMax,
    current: currentAPS
  };
}

/**
 * Calculate admission probability based on APS scores
 * @param {Object} projectedAPS - Projected APS range
 * @param {number} requiredAPS - Program's required APS
 * @returns {number} Admission probability (0-100)
 */
function calculateAdmissionProbability(projectedAPS, requiredAPS) {
  const { min, max } = projectedAPS;
  
  if (min >= requiredAPS + 5) return 95; // Well above requirement
  if (min >= requiredAPS) return 85; // Meets requirement
  if (max >= requiredAPS + 2) return 70; // Likely with improvement
  if (max >= requiredAPS) return 50; // Possible with improvement
  if (max >= requiredAPS - 3) return 25; // Challenging but possible
  
  return 10; // Very challenging
}

/**
 * Match student to eligible bursaries
 * @param {Object} studentProfile - Student profile data
 * @param {Object} projectedAPS - Projected APS data
 * @returns {Array} Eligible bursaries
 */
function matchEligibleBursaries(studentProfile, projectedAPS) {
  const eligibleBursaries = [];
  
  Object.entries(BURSARY_DATABASE).forEach(([key, bursary]) => {
    let eligibilityScore = 0;
    let eligibilityReasons = [];
    
    // Check APS requirement
    const minAPS = parseInt(bursary.eligibility.academicRequirement?.match(/\\d+/)?.[0] || '0');
    if (projectedAPS.max >= minAPS) {
      eligibilityScore += 30;
      eligibilityReasons.push(`APS requirement met (${minAPS}+ required)`);
    }
    
    // Check family income (NSFAS)
    if (key === 'nsfas' && studentProfile.constraints?.familyBackground === 'no') {
      eligibilityScore += 40;
      eligibilityReasons.push('First-generation student (likely qualifies for NSFAS)');
    }
    
    // Check career field alignment
    if (bursary.eligibility.careerField) {
      const careerField = bursary.eligibility.careerField.toLowerCase();
      const studentInterests = (studentProfile.careerInterests || '').toLowerCase();
      
      if (studentInterests.includes(careerField.split('/')[0])) {
        eligibilityScore += 30;
        eligibilityReasons.push(`Career interest alignment (${careerField})`);
      }
    }
    
    // Check subject requirements (Sasol Engineering)
    if (key === 'sasol_engineering' && studentProfile.marks) {
      const mathMark = studentProfile.marks.mathematics || studentProfile.marks.math || 0;
      const scienceMark = studentProfile.marks.physical_sciences || studentProfile.marks.physics || 0;
      
      if (parseFloat(mathMark) >= 70 && parseFloat(scienceMark) >= 70) {
        eligibilityScore += 40;
        eligibilityReasons.push('Subject requirements met (Math & Science 70%+)');
      }
    }
    
    // Add if eligible (score >= 30)
    if (eligibilityScore >= 30) {
      eligibleBursaries.push({
        ...bursary,
        eligibilityScore,
        eligibilityReasons,
        matchPercentage: Math.min(100, eligibilityScore)
      });
    }
  });
  
  // Sort by eligibility score
  return eligibleBursaries.sort((a, b) => b.eligibilityScore - a.eligibilityScore);
}

/**
 * Match student to university programs
 * @param {Object} studentProfile - Student profile data
 * @param {Object} projectedAPS - Projected APS data
 * @returns {Array} Matched programs with admission data
 */
function matchUniversityPrograms(studentProfile, projectedAPS) {
  const matchedPrograms = [];
  const careerInterests = (studentProfile.careerInterests || '').toLowerCase();
  
  // Determine relevant program categories
  const relevantCategories = [];
  if (careerInterests.includes('engineering') || careerInterests.includes('egd')) {
    relevantCategories.push('engineering');
  }
  if (careerInterests.includes('business') || careerInterests.includes('accounting')) {
    relevantCategories.push('business');
  }
  if (careerInterests.includes('medicine') || careerInterests.includes('doctor')) {
    relevantCategories.push('healthcare');
  }
  if (careerInterests.includes('computer') || careerInterests.includes('technology') || careerInterests.includes('it')) {
    relevantCategories.push('technology');
  }
  if (careerInterests.includes('law') || careerInterests.includes('lawyer')) {
    relevantCategories.push('law');
  }
  
  // If no specific interests, include all categories
  if (relevantCategories.length === 0) {
    relevantCategories.push('engineering', 'business', 'technology');
  }
  
  // Match programs from all universities
  Object.entries(UNIVERSITY_PROGRAMS).forEach(([uniKey, university]) => {
    Object.entries(university.programs).forEach(([progKey, program]) => {
      // Check if program matches career interests
      if (relevantCategories.includes(program.category)) {
        const admissionProbability = calculateAdmissionProbability(projectedAPS, program.apsRequired);
        
        // Include programs with reasonable admission chance or as backup options
        if (admissionProbability >= 10) {
          matchedPrograms.push({
            university: university.name,
            program: program.name,
            apsRequired: program.apsRequired,
            projectedAPS: projectedAPS,
            admissionProbability,
            subjectRequirements: program.subjectRequirements,
            applicationDeadline: program.applicationDeadline,
            duration: program.duration,
            category: program.category,
            feasibility: admissionProbability >= 70 ? 'High' : admissionProbability >= 40 ? 'Medium' : 'Challenging'
          });
        }
      }
    });
  });
  
  // Sort by admission probability (highest first)
  return matchedPrograms.sort((a, b) => b.admissionProbability - a.admissionProbability);
}

/**
 * Generate grade-appropriate timeline and urgency
 * @param {number} grade - Student grade
 * @returns {Object} Timeline context
 */
function getGradeTimeline(grade) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  if (grade === 12) {
    if (currentMonth >= 11) {
      return {
        phase: 'post-finals',
        urgency: 'CRITICAL',
        timeline: 'Finals complete - Focus on applications',
        actionItems: ['Submit university applications NOW', 'Apply for NSFAS immediately', 'Prepare backup options']
      };
    } else {
      return {
        phase: 'finals-preparation',
        urgency: 'CRITICAL',
        timeline: 'Finals approaching - Optimize performance',
        actionItems: ['Focus on final exam preparation', 'Submit applications early', 'Secure bursary applications']
      };
    }
  } else if (grade === 11) {
    return {
      phase: 'decision-year',
      urgency: 'HIGH',
      timeline: '1 year to finals - Critical decisions needed',
      actionItems: ['Optimize subject performance', 'Research university programs', 'Start bursary applications']
    };
  } else {
    return {
      phase: 'exploration',
      urgency: 'MEDIUM',
      timeline: '2+ years to finals - Build strong foundation',
      actionItems: ['Focus on academic improvement', 'Explore career options', 'Build extracurricular profile']
    };
  }
}

/**
 * Main function: Generate specific program recommendations
 * @param {Object} studentProfile - Complete student profile
 * @returns {Object} Specific program recommendations with APS data
 */
export function generateSpecificRecommendations(studentProfile) {
  try {
    // Calculate current and projected APS
    const currentAPS = calculateAPS(studentProfile.marks || {});
    const projectedAPS = projectFinalAPS(currentAPS, studentProfile.grade || 12);
    
    // Get grade-specific timeline
    const timeline = getGradeTimeline(studentProfile.grade || 12);
    
    // Match university programs
    const matchedPrograms = matchUniversityPrograms(studentProfile, projectedAPS);
    
    // Match eligible bursaries
    const eligibleBursaries = matchEligibleBursaries(studentProfile, projectedAPS);
    
    return {
      success: true,
      apsData: {
        current: currentAPS,
        projected: projectedAPS,
        universityEligible: projectedAPS.max >= 20
      },
      timeline,
      programs: matchedPrograms.slice(0, 5), // Top 5 programs
      bursaries: eligibleBursaries.slice(0, 3), // Top 3 bursaries
      metadata: {
        totalProgramsFound: matchedPrograms.length,
        totalBursariesFound: eligibleBursaries.length,
        generatedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error generating specific recommendations:', error);
    return {
      success: false,
      error: error.message,
      fallback: true
    };
  }
}

/**
 * Format recommendations for LLM context
 * @param {Object} recommendations - Generated recommendations
 * @returns {string} Formatted context for LLM
 */
export function formatRecommendationsForLLM(recommendations) {
  if (!recommendations.success) {
    return 'Unable to generate specific program recommendations. Provide general guidance.';
  }
  
  const { apsData, timeline, programs, bursaries } = recommendations;
  
  let context = `
STUDENT APS DATA:
- Current APS: ${apsData.current}
- Projected APS: ${apsData.projected.min}-${apsData.projected.max}
- University Eligible: ${apsData.universityEligible ? 'Yes' : 'No'}

TIMELINE CONTEXT:
- Phase: ${timeline.phase}
- Urgency: ${timeline.urgency}
- Timeline: ${timeline.timeline}

SPECIFIC PROGRAM MATCHES:`;

  programs.forEach((program, index) => {
    context += `
${index + 1}. ${program.program} at ${program.university}
   - APS Required: ${program.apsRequired} (Student projected: ${apsData.projected.min}-${apsData.projected.max})
   - Admission Chance: ${program.admissionProbability}%
   - Application Deadline: ${program.applicationDeadline}
   - Feasibility: ${program.feasibility}`;
  });

  context += `

ELIGIBLE BURSARIES:`;

  bursaries.forEach((bursary, index) => {
    context += `
${index + 1}. ${bursary.name}: ${bursary.amount}
   - Eligibility: ${bursary.matchPercentage}% match
   - Deadline: ${bursary.deadline} (${bursary.urgency})
   - Reasons: ${bursary.eligibilityReasons.join(', ')}`;
  });

  context += `

PRIORITY ACTIONS:
${timeline.actionItems.map(item => `- ${item}`).join('\n')}`;

  return context;
}

export default {
  generateSpecificRecommendations,
  formatRecommendationsForLLM,
  calculateAPS,
  projectFinalAPS
};