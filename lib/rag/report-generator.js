// lib/rag/report-generator.js
// Phase 3: Dynamic Report Generation
// Generates personalized career reports from matched careers

import { matchCareersToProfile, getFallbackCareers } from './career-matcher.js';

/**
 * Generate personalized career report using RAG
 * @param {Object} profile - User profile from assessment
 * @returns {Promise<Object>} - Structured career report
 */
export async function generatePersonalizedReport(profile) {
  console.log('🎯 Generating personalized report for profile:', {
    grade: profile.grade,
    subjects: profile.subjects?.slice(0, 3),
    interests: profile.interests?.slice(0, 3)
  });

  try {
    // Step 1: Match careers using RAG
    let matchedCareers = await matchCareersToProfile(profile, { 
      limit: 5,
      minSimilarity: 0.7 
    });

    // Step 2: Fallback if no good matches
    if (matchedCareers.length === 0) {
      console.log('⚠️ No RAG matches found, using fallback careers');
      matchedCareers = await getFallbackCareers(profile);
    }

    // Step 3: Format careers for response
    const careerSuggestions = matchedCareers.map((career, index) => ({
      title: career.title,
      match: `${Math.round((career.similarity || 0.5) * 100)}%`,
      description: extractDescription(career.description),
      requirements: career.education || career.qualifications || "Requirements vary by institution",
      pathways: generatePathways(career),
      salaryRange: formatSalaryRange(career.salaryRange),
      category: career.category,
      demand: career.demand,
      outlook: career.outlook
    }));

    // Step 4: Generate personalized guidance text
    const personalizedGuidance = generateGuidanceText(profile, careerSuggestions);

    // Step 5: Generate next steps based on profile
    const nextSteps = generateNextSteps(profile, careerSuggestions);

    // Step 6: Generate additional resources
    const additionalResources = generateResources(profile, careerSuggestions);

    console.log(`✅ Generated report with ${careerSuggestions.length} personalized careers`);

    return {
      personalizedGuidance,
      careers: careerSuggestions,
      nextSteps,
      additionalResources,
      matchingMethod: matchedCareers.length > 0 ? 'rag_semantic_search' : 'fallback_popular',
      dataSource: 'supabase_knowledge_base'
    };

  } catch (error) {
    console.error('❌ Error generating personalized report:', error);
    // Emergency fallback - return basic structure
    return generateEmergencyFallback(profile);
  }
}

/**
 * Extract clean description from career chunk text
 * @param {string} description - Raw description from knowledge base
 * @returns {string} - Clean, user-friendly description
 */
function extractDescription(description) {
  if (!description) return "Career description not available";
  
  // Extract the description part after "Description:"
  const match = description.match(/Description:\s*([^.]+\.)/);
  if (match) {
    return match[1].trim();
  }
  
  // Fallback: take first sentence
  const firstSentence = description.split('.')[0];
  return firstSentence.length > 20 ? firstSentence + '.' : description.substring(0, 100) + '...';
}

/**
 * Generate pathways based on career data
 * @param {Object} career - Career object with metadata
 * @returns {Array<string>} - Array of pathway options
 */
function generatePathways(career) {
  const pathways = [];
  
  // Check education requirements
  if (career.education) {
    if (career.education.includes('Bachelor') || career.education.includes('Degree')) {
      pathways.push('University');
    }
    if (career.education.includes('Diploma')) {
      pathways.push('TVET College');
    }
    if (career.education.includes('Certificate')) {
      pathways.push('Skills Training');
    }
  }
  
  // Add category-specific pathways
  if (career.category) {
    switch (career.category.toLowerCase()) {
      case 'engineering':
        pathways.push('University', 'TVET College');
        break;
      case 'healthcare':
        pathways.push('University', 'Nursing College', 'Medical School');
        break;
      case 'technology':
        pathways.push('University', 'Coding Bootcamp', 'Online Courses');
        break;
      case 'business':
        pathways.push('University', 'Business School');
        break;
      default:
        pathways.push('University', 'TVET College');
    }
  }
  
  // Remove duplicates and return
  return [...new Set(pathways)].slice(0, 3);
}

/**
 * Format salary range for display
 * @param {Object} salaryRange - Salary range object
 * @returns {string} - Formatted salary string
 */
function formatSalaryRange(salaryRange) {
  if (!salaryRange || !salaryRange.entry) {
    return "Salary varies by experience and location";
  }
  
  const { min, max } = salaryRange.entry;
  if (min && max) {
    return `R${min.toLocaleString()} - R${max.toLocaleString()} per month (entry level)`;
  }
  
  return "Competitive salary based on experience";
}

/**
 * Generate personalized guidance text
 * @param {Object} profile - User profile
 * @param {Array} careers - Matched careers
 * @returns {string} - Personalized guidance text
 */
function generateGuidanceText(profile, careers) {
  const { grade, subjects, mathType, mathMark, interests } = profile;
  
  let guidance = `Based on your Grade ${grade} profile`;
  
  // Add subjects context
  if (subjects && subjects.length > 0) {
    guidance += ` with ${subjects.slice(0, 3).join(', ')} subjects`;
  }
  
  // Add math context
  if (mathType && mathMark) {
    guidance += ` and ${mathType} (${mathMark}%)`;
  }
  
  // Add interests context
  if (interests && interests.length > 0) {
    guidance += `, plus your interests in ${interests.slice(0, 2).join(' and ')}`;
  }
  
  guidance += `, here are your top personalized career matches:`;
  
  return guidance;
}

/**
 * Generate next steps based on profile and careers
 * @param {Object} profile - User profile
 * @param {Array} careers - Matched careers
 * @returns {Array<string>} - Next steps recommendations
 */
function generateNextSteps(profile, careers) {
  const steps = [];
  
  // Always include research step
  steps.push("Research these careers in more detail using the provided information");
  
  // Add grade-specific steps
  if (profile.grade <= 10) {
    steps.push("Consider subject choices for Grade 11-12 based on career requirements");
    steps.push("Speak to professionals in these fields through career days or networking");
  } else {
    steps.push("Research university/college entry requirements for your chosen careers");
    steps.push("Apply for relevant bursaries and financial aid");
  }
  
  // Add career-specific steps
  const categories = [...new Set(careers.map(c => c.category).filter(Boolean))];
  
  if (categories.includes('Engineering')) {
    steps.push("Ensure strong performance in Mathematics and Physical Sciences");
  }
  if (categories.includes('Healthcare')) {
    steps.push("Consider volunteer work at hospitals or clinics for experience");
  }
  if (categories.includes('Technology')) {
    steps.push("Start building a portfolio with coding projects or technical skills");
  }
  
  return steps.slice(0, 4); // Limit to 4 steps
}

/**
 * Generate additional resources based on profile
 * @param {Object} profile - User profile
 * @param {Array} careers - Matched careers
 * @returns {Array<string>} - Resource recommendations
 */
function generateResources(profile, careers) {
  const resources = [
    "Career guidance counselor at your school",
    "University open days and information sessions"
  ];
  
  // Add career-specific resources
  const categories = [...new Set(careers.map(c => c.category).filter(Boolean))];
  
  if (categories.includes('Engineering')) {
    resources.push("Engineering Council of South Africa (ECSA) career information");
  }
  if (categories.includes('Healthcare')) {
    resources.push("Health Professions Council of South Africa (HPCSA) resources");
  }
  if (categories.includes('Technology')) {
    resources.push("Online coding platforms and tech career websites");
  }
  
  // Add general resources
  resources.push("NSFAS information for funding opportunities");
  resources.push("Industry professionals on LinkedIn for career insights");
  
  return resources.slice(0, 5); // Limit to 5 resources
}

/**
 * Emergency fallback when RAG fails completely
 * @param {Object} profile - User profile
 * @returns {Object} - Basic career report
 */
function generateEmergencyFallback(profile) {
  console.log('🚨 Using emergency fallback report');
  
  return {
    personalizedGuidance: `Based on your Grade ${profile.grade} profile, here are some popular career options to explore:`,
    careers: [
      {
        title: "Software Engineer",
        match: "75%",
        description: "Design and develop software applications and systems.",
        requirements: "Bachelor's degree in Computer Science or related field",
        pathways: ["University", "Coding Bootcamp"],
        salaryRange: "R25,000 - R80,000 per month"
      },
      {
        title: "Business Analyst",
        match: "70%",
        description: "Analyze business processes and recommend improvements.",
        requirements: "Bachelor's degree in Business or related field",
        pathways: ["University"],
        salaryRange: "R20,000 - R60,000 per month"
      },
      {
        title: "Teacher",
        match: "65%",
        description: "Educate and inspire students in various subjects.",
        requirements: "Bachelor's degree in Education or subject specialization",
        pathways: ["University"],
        salaryRange: "R15,000 - R40,000 per month"
      }
    ],
    nextSteps: [
      "Research these careers in more detail",
      "Speak to career guidance counselor",
      "Consider your subject choices carefully",
      "Look into university requirements"
    ],
    additionalResources: [
      "Career guidance counselor",
      "University open days",
      "Online career assessments",
      "NSFAS funding information"
    ],
    matchingMethod: 'emergency_fallback',
    dataSource: 'hardcoded_backup'
  };
}
