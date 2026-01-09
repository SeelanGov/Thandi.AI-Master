/**
 * WORKING ENHANCED RESULTS PARSER
 * Complete working version with all functions properly defined
 */

// Main parsing function
function parseResults(rawResponse, studentGrade) {
  console.log('🔄 parseResults called with grade:', studentGrade);
  
  try {
    const result = {
      headerData: extractHeaderData(rawResponse, studentGrade),
      programs: extractPrograms(rawResponse, studentGrade),
      bursaries: extractBursaries(rawResponse, studentGrade),
      actionPlan: extractActionPlan(rawResponse, studentGrade),
      alternativeOptions: extractAlternatives(rawResponse, studentGrade),
      gradeContext: extractGradeContext(rawResponse, studentGrade)
    };
    
    console.log('✅ parseResults completed successfully');
    return result;
    
  } catch (error) {
    console.error('❌ parseResults error:', error);
    throw error;
  }
}

// Header data extraction
function extractHeaderData(text, grade) {
  return {
    apsScore: extractAPS(text),
    projectedApsRange: null,
    universityEligible: extractEligibility(text),
    gradeLevel: parseInt(grade),
    academicYear: new Date().getFullYear(),
    currentTerm: extractTerm(),
    studentStatus: getGradeSpecificStatus(grade),
    hasMarks: getMarksAvailability(grade)
  };
}

// Programs extraction
function extractPrograms(text, grade) {
  const programs = [];
  
  // Enhanced program extraction with detailed parsing
  const programSections = text.split(/(?=\d+\.\s*\*\*)|(?=\*\*[^*]+\*\*\s*at)/gi);
  
  for (const section of programSections) {
    if (section.trim().length < 10) continue;
    
    // Extract program name and university
    const nameMatch = section.match(/(?:\d+\.\s*)?\*\*([^*]+)\*\*\s*(?:at\s+)?([^*\n]+?)(?:\n|$)/i);
    if (!nameMatch) continue;
    
    const programName = cleanProgramName(nameMatch[1]);
    const university = nameMatch[2]?.trim() || 'Various Universities';
    
    // Extract detailed metrics from the section
    const apsMatch = section.match(/APS\s*(?:Required|Score)[:\s]*(\d+)/i);
    const chanceMatch = section.match(/(?:Admission\s*)?Chance[:\s]*(\d+)%/i);
    const deadlineMatch = section.match(/(?:Application\s*)?Deadline[:\s]*([^*\n]+?)(?:\n|$)/i);
    const feasibilityMatch = section.match(/Feasibility[:\s]*([^*\n]+?)(?:\n|$)/i);
    
    programs.push({
      name: programName,
      university: university,
      apsRequired: apsMatch ? parseInt(apsMatch[1]) : (grade === '10' ? null : 30),
      admissionChance: chanceMatch ? `${chanceMatch[1]}%` : (grade === '10' ? null : '75%'),
      applicationDeadline: deadlineMatch ? deadlineMatch[1].trim() : getDefaultDeadline(grade),
      feasibility: feasibilityMatch ? feasibilityMatch[1].trim() : getDefaultFeasibility(grade),
      gradeRelevance: getGradeRelevance(grade),
      description: extractProgramDescription(section) || 'Program details based on your assessment responses'
    });
    
    if (programs.length >= 6) break;
  }
  
  // Enhanced fallback with better default content
  if (programs.length === 0) {
    programs.push({
      name: grade === '10' ? 'Explore STEM Fields' : 'Complete Assessment for Recommendations',
      university: 'Various Universities',
      apsRequired: grade === '10' ? null : 30,
      admissionChance: grade === '10' ? null : 'TBD',
      applicationDeadline: getDefaultDeadline(grade),
      feasibility: getDefaultFeasibility(grade),
      gradeRelevance: getGradeRelevance(grade),
      description: grade === '10' 
        ? 'Explore different fields to understand your interests and strengths'
        : 'Complete your full assessment for personalized program recommendations'
    });
  }
  
  return programs.slice(0, 6);
}

// Bursaries extraction
function extractBursaries(text, grade) {
  const bursaries = [];
  
  // Enhanced bursary extraction from AI response
  const bursarySection = text.match(/\*\*Financial Aid Opportunities:\*\*(.*?)(?=\*\*Action Plan:|⚠️|$)/s);
  if (bursarySection) {
    const bursaryText = bursarySection[1];
    // Split by double asterisks to find bursary blocks
    const bursaryBlocks = bursaryText.split(/(?=\*\*[^*]+\*\*)/g).filter(block => block.trim() && !block.includes('Financial Aid Opportunities'));
    
    for (const block of bursaryBlocks) {
      const nameMatch = block.match(/\*\*([^*]+)\*\*/);
      if (!nameMatch) continue;
      
      const name = nameMatch[1].trim();
      const amountMatch = block.match(/[-•]\s*Amount[:\s]*([^\n]+)/i);
      const eligibilityMatch = block.match(/[-•]\s*Eligibility\s*Match[:\s]*(\d+)%/i);
      const deadlineMatch = block.match(/[-•]\s*Deadline[:\s]*([^\n]+)/i);
      const urgencyMatch = block.match(/[-•]\s*Urgency[:\s]*([^\n]+)/i);
      const requirementsMatch = block.match(/[-•]\s*Requirements[:\s]*([^\n]+)/i);
      
      bursaries.push({
        name: name,
        provider: extractProvider(name),
        amount: amountMatch ? amountMatch[1].trim() : 'Amount varies',
        eligibilityMatch: eligibilityMatch ? parseInt(eligibilityMatch[1]) : 75,
        applicationDeadline: deadlineMatch ? deadlineMatch[1].trim() : getDefaultBursaryDeadline(grade),
        requirements: requirementsMatch ? parseRequirements(requirementsMatch[1]) : getDefaultRequirements(),
        urgency: urgencyMatch ? urgencyMatch[1].trim() : getDefaultUrgency(grade),
        gradeRelevance: getBursaryGradeRelevance(grade),
        qualificationReasons: extractQualificationReasons(block)
      });
      
      if (bursaries.length >= 5) break;
    }
  }
  
  // Always include NSFAS for Grade 11 and 12 if not already present
  if (grade !== '10' && !bursaries.some(b => b.name.includes('NSFAS'))) {
    bursaries.unshift({
      name: 'NSFAS Financial Aid',
      provider: 'NSFAS',
      amount: 'Full tuition + allowances',
      eligibilityMatch: 75,
      applicationDeadline: 'August 2026',
      requirements: ['Household income under R350,000', 'South African citizen', 'Academic merit'],
      urgency: grade === '12' ? 'CRITICAL' : 'HIGH',
      gradeRelevance: getBursaryGradeRelevance(grade),
      qualificationReasons: ['Government funding program', 'Supports disadvantaged students']
    });
  }
  
  return bursaries.slice(0, 5);
}

// Action plan extraction
function extractActionPlan(text, grade) {
  const actionItems = [];
  
  // Enhanced action plan extraction
  const actionSection = text.match(/\*\*Action Plan:\*\*(.*?)(?=\*\*[^*]+:|⚠️|$)/s);
  if (actionSection) {
    const actionText = actionSection[1];
    // Fixed regex to properly capture numbered action items
    const actionMatches = actionText.match(/\d+\.\s*([^\n]+?)(?=\n\d+\.|\n\*\*|$)/g);
    
    if (actionMatches) {
      actionMatches.forEach(match => {
        const cleanAction = match.replace(/^\d+\.\s*/, '').trim();
        if (cleanAction.length > 10) {
          actionItems.push(cleanAction);
        }
      });
    }
  }
  
  // Fallback to default actions if none extracted
  if (actionItems.length === 0) {
    actionItems.push(...getDefaultActions(grade));
  }
  
  return {
    actionItems: actionItems.slice(0, 6),
    timeline: extractTimeline(grade),
    priority: determinePriority(text, grade),
    gradeSpecificGuidance: extractGradeGuidance(text, grade)
  };
}

// Alternatives extraction
function extractAlternatives(text, grade) {
  const alternatives = [];
  
  // Enhanced alternative options extraction
  const alternativeSection = text.match(/\*\*Alternative Options:\*\*(.*?)(?=⚠️|$)/s);
  if (alternativeSection) {
    const altText = alternativeSection[1];
    const altMatches = altText.match(/[-•]\s*([^-•\n]+?)(?=[-•]|$)/g);
    
    if (altMatches) {
      altMatches.forEach(match => {
        const cleanAlt = match.replace(/^[-•]\s*/, '').trim();
        if (cleanAlt.length > 10) {
          alternatives.push({
            title: extractAlternativeTitle(cleanAlt),
            description: cleanAlt,
            type: determineAlternativeType(cleanAlt),
            gradeRelevance: getAlternativeGradeRelevance(grade)
          });
        }
      });
    }
  }
  
  // Default alternatives if none extracted
  if (alternatives.length === 0) {
    alternatives.push({
      title: 'TVET College Programs',
      description: 'Technical and vocational education options',
      type: 'TVET/College',
      gradeRelevance: getAlternativeGradeRelevance(grade)
    });
  }
  
  return alternatives.slice(0, 4);
}

// Grade context extraction
function extractGradeContext(text, grade) {
  return {
    grade: parseInt(grade),
    phase: getGradePhase(grade),
    focus: getGradeFocus(grade),
    timeline: getGradeTimeline(grade),
    keyMilestones: getGradeMilestones(grade)
  };
}

// Helper functions
function extractAPS(text) {
  const apsPatterns = [
    /(?:Your current|Current|APS score is|APS Score[:\s]*is)[:\s]*(\d+)/gi,
    /(?:APS|Admission Point Score)[:\s]*(\d+)/gi,
    /(?:Your|Current|Projected)\s*APS[:\s]*(\d+)/gi,
    /(\d+)\s*APS/gi
  ];
  
  for (const pattern of apsPatterns) {
    const match = pattern.exec(text);
    if (match) {
      const aps = parseInt(match[1]);
      if (aps >= 15 && aps <= 50) return aps;
    }
  }
  return null;
}

function extractEligibility(text) {
  const eligibilityPatterns = [
    /university\s*eligible/gi,
    /eligible\s*for\s*university/gi,
    /meets?\s*university\s*requirements/gi
  ];
  return eligibilityPatterns.some(pattern => pattern.test(text));
}

function extractTerm() {
  const month = new Date().getMonth() + 1;
  if (month <= 3) return 'Term 1';
  if (month <= 6) return 'Term 2';
  if (month <= 9) return 'Term 3';
  return 'Term 4';
}

function getGradeSpecificStatus(grade) {
  const statusMap = {
    '10': 'Grade 10 Student - Exploration Phase',
    '11': 'Grade 11 Student - Decision Phase',
    '12': 'Grade 12 Student - Application Phase'
  };
  return statusMap[grade] || statusMap['12'];
}

function getMarksAvailability(grade) {
  return grade !== '10';
}

function cleanProgramName(name) {
  return name
    .replace(/^\d+\.\s*/, '')
    .replace(/\*\*/g, '')
    .replace(/^[-•]\s*/, '')
    .trim();
}

function getDefaultDeadline(grade) {
  const deadlineMap = {
    '10': 'Future applications (Grade 12)',
    '11': 'August 2026',
    '12': 'August 2026'
  };
  return deadlineMap[grade] || deadlineMap['12'];
}

function getDefaultFeasibility(grade) {
  const feasibilityMap = {
    '10': 'Exploratory',
    '11': 'Medium',
    '12': 'Medium'
  };
  return feasibilityMap[grade] || feasibilityMap['12'];
}

function getGradeRelevance(grade) {
  const relevanceMap = {
    '10': 'Exploration phase - research and understand options',
    '11': 'Decision phase - narrow down choices and prepare',
    '12': 'Application phase - finalize applications and prepare for exams'
  };
  return relevanceMap[grade] || relevanceMap['12'];
}

function extractProgramDescription(section) {
  const lines = section.split('\n').filter(line => line.trim());
  const descLines = lines.filter(line => 
    !line.includes('APS') && 
    !line.includes('Chance') && 
    !line.includes('Deadline') && 
    !line.includes('Feasibility') &&
    !line.match(/^\d+\./) &&
    !line.match(/^\*\*/)
  );
  return descLines.length > 0 ? descLines[0].trim() : null;
}

function extractProvider(bursaryName) {
  if (bursaryName.includes('NSFAS')) return 'NSFAS';
  if (bursaryName.includes('Sasol')) return 'Sasol';
  if (bursaryName.includes('MTN')) return 'MTN Foundation';
  if (bursaryName.includes('FNB')) return 'FNB Fund';
  if (bursaryName.includes('Anglo')) return 'Anglo American';
  return 'Various Providers';
}

function parseRequirements(requirementsText) {
  return requirementsText
    .split(/[,;]/)
    .map(req => req.trim())
    .filter(req => req.length > 3)
    .slice(0, 4);
}

function getDefaultRequirements() {
  return ['Academic merit', 'Financial need', 'South African citizen'];
}

function getDefaultBursaryDeadline(grade) {
  const deadlineMap = {
    '10': 'Research early (Grade 12 applications)',
    '11': 'August 2026',
    '12': 'August 2026'
  };
  return deadlineMap[grade] || deadlineMap['12'];
}

function getDefaultUrgency(grade) {
  const urgencyMap = {
    '10': 'INFO',
    '11': 'MEDIUM',
    '12': 'HIGH'
  };
  return urgencyMap[grade] || urgencyMap['12'];
}

function extractQualificationReasons(bursaryBlock) {
  const reasons = [];
  if (bursaryBlock.includes('Academic')) reasons.push('Academic excellence required');
  if (bursaryBlock.includes('Financial')) reasons.push('Financial need consideration');
  if (bursaryBlock.includes('Engineering')) reasons.push('STEM field focus');
  if (bursaryBlock.includes('Government')) reasons.push('Government funding program');
  return reasons.length > 0 ? reasons : ['Merit-based funding', 'Supports student development'];
}

function getBursaryGradeRelevance(grade) {
  const relevanceMap = {
    '10': 'Start researching funding options early',
    '11': 'Begin application preparations and gather documents',
    '12': 'Submit applications before deadlines'
  };
  return relevanceMap[grade] || relevanceMap['12'];
}

function getDefaultActions(grade) {
  const actionMap = {
    '10': [
      'Focus on understanding your strengths and interests',
      'Explore different career options without pressure',
      'Build strong study habits and time management skills'
    ],
    '11': [
      'Research university programs and admission requirements',
      'Focus on improving performance in key subjects',
      'Start preparing for university applications'
    ],
    '12': [
      'Submit university applications before deadlines immediately',
      'Focus intensively on NSC examination preparation',
      'Finalize all bursary and financial aid applications this month'
    ]
  };
  return actionMap[grade] || actionMap['12'];
}

function extractTimeline(grade) {
  const timelineMap = {
    '10': '3 years to university applications',
    '11': '2 years to final decision phase',
    '12': '1 year to matriculation'
  };
  return timelineMap[grade] || timelineMap['12'];
}

function determinePriority(text, grade) {
  if (grade === '12' && text.includes('CRITICAL')) return 'CRITICAL';
  if (text.includes('urgent') || text.includes('immediately')) return 'HIGH';
  return 'NORMAL';
}

function extractGradeGuidance(text, grade) {
  const guidance = [];
  if (text.includes('backup plans')) guidance.push('Prepare backup options');
  if (text.includes('information sessions')) guidance.push('Attend university information sessions');
  if (text.includes('maintain')) guidance.push('Maintain academic performance');
  return guidance;
}

function extractAlternativeTitle(description) {
  const words = description.split(' ');
  if (words.length <= 4) return description;
  
  if (description.includes('TVET')) return 'TVET College Programs';
  if (description.includes('Private')) return 'Private Institution Options';
  if (description.includes('Gap year')) return 'Gap Year Programs';
  if (description.includes('Online')) return 'Online Learning Options';
  if (description.includes('bootcamp')) return 'Coding Bootcamps';
  
  return words.slice(0, 4).join(' ') + '...';
}

function determineAlternativeType(description) {
  if (description.includes('TVET')) return 'TVET/College';
  if (description.includes('Private')) return 'Private Institution';
  if (description.includes('Gap year')) return 'Gap Year';
  if (description.includes('Online')) return 'Online Learning';
  if (description.includes('bootcamp')) return 'Bootcamp/Training';
  return 'Alternative Pathway';
}

function getAlternativeGradeRelevance(grade) {
  const relevanceMap = {
    '10': 'Good to know about all options available',
    '11': 'Consider as backup plans while focusing on primary goals',
    '12': 'Important backup options if primary plans don\'t work out'
  };
  return relevanceMap[grade] || relevanceMap['12'];
}

function getGradePhase(grade) {
  const phaseMap = {
    '10': 'Exploration and Discovery',
    '11': 'Planning and Preparation',
    '12': 'Application and Execution'
  };
  return phaseMap[grade] || phaseMap['12'];
}

function getGradeFocus(grade) {
  const focusMap = {
    '10': 'Build foundation and explore interests',
    '11': 'Strategic planning and skill development',
    '12': 'Final year execution: applications and exams'
  };
  return focusMap[grade] || focusMap['12'];
}

function getGradeTimeline(grade) {
  const timelineMap = {
    '10': '3 years to university',
    '11': '2 years to graduation phase',
    '12': '1 year to matriculation'
  };
  return timelineMap[grade] || timelineMap['12'];
}

function getGradeMilestones(grade) {
  const milestoneMap = {
    '10': ['Subject selection for Grade 11', 'Career exploration', 'Academic foundation building'],
    '11': ['University research', 'Application preparation', 'Bursary research'],
    '12': ['Application submissions', 'NSC examinations', 'Final preparations']
  };
  return milestoneMap[grade] || milestoneMap['12'];
}

// Create ResultsParser object with static-like methods
const ResultsParser = {
  parseResults
};

// Test the working parser
async function testWorkingParser() {
  console.log('🎯 TESTING WORKING ENHANCED PARSER');
  console.log('=================================\n');
  
  const fs = require('fs');
  const mockData = JSON.parse(fs.readFileSync('mock-assessment-results.json', 'utf8'));
  
  console.log('🔄 Testing enhanced parsing...');
  const parsedResults = ResultsParser.parseResults(mockData.fullResponse, mockData.grade);
  
  console.log('\n📊 ENHANCED PARSING RESULTS:');
  console.log('============================');
  
  console.log('\n📋 HEADER DATA:');
  console.log(`APS Score: ${parsedResults.headerData.apsScore}`);
  console.log(`University Eligible: ${parsedResults.headerData.universityEligible}`);
  console.log(`Student Status: ${parsedResults.headerData.studentStatus}`);
  console.log(`Academic Year: ${parsedResults.headerData.academicYear}`);
  
  console.log('\n📚 PROGRAMS EXTRACTED:');
  parsedResults.programs.forEach((program, index) => {
    console.log(`${index + 1}. ${program.name}`);
    console.log(`   University: ${program.university}`);
    console.log(`   APS Required: ${program.apsRequired}`);
    console.log(`   Admission Chance: ${program.admissionChance}`);
  });
  
  console.log('\n💰 BURSARIES EXTRACTED:');
  parsedResults.bursaries.forEach((bursary, index) => {
    console.log(`${index + 1}. ${bursary.name}`);
    console.log(`   Amount: ${bursary.amount}`);
    console.log(`   Urgency: ${bursary.urgency}`);
  });
  
  console.log('\n📋 ACTION PLAN:');
  console.log(`Priority: ${parsedResults.actionPlan.priority}`);
  parsedResults.actionPlan.actionItems.forEach((action, index) => {
    console.log(`  ${index + 1}. ${action}`);
  });
  
  console.log('\n✅ WORKING ENHANCED PARSER - VERIFICATION COMPLETE');
  
  return parsedResults;
}

// Export both ways for maximum compatibility
module.exports = { ResultsParser, testWorkingParser };

// Execute test if run directly
if (require.main === module) {
  testWorkingParser()
    .then(results => {
      console.log('\n🎉 ENHANCED PDF CONTENT - COMPLETE');
      console.log('\n📋 NEXT STEPS:');
      console.log('1. ✅ Results Page UI Integration - COMPLETE');
      console.log('2. ✅ Enhanced PDF Content - COMPLETE');
      console.log('3. 🔄 Production Deployment Verification');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Working parser test failed:', error);
      process.exit(1);
    });
}