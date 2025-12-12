// lib/rag/subject-category-map.js
// Comprehensive Subject-Category Mapping Configuration
// Maps South African school subjects to career categories with priority scoring

/**
 * Comprehensive subject to career category mapping
 * Based on South African curriculum and career pathways
 */
export const SUBJECT_CATEGORY_MAP = {
  // STEM Subjects
  'Mathematics': {
    primary: ['Engineering', 'Technology', 'Finance'],
    secondary: ['Science', 'Business', 'Healthcare'],
    priority: 0.9,
    description: 'Essential for analytical and technical careers'
  },
  
  'Physical Sciences': {
    primary: ['Engineering', 'Science', 'Technology'],
    secondary: ['Healthcare', 'Research'],
    priority: 0.85,
    description: 'Foundation for engineering and scientific careers'
  },
  
  'Life Sciences': {
    primary: ['Healthcare', 'Science', 'Research'],
    secondary: ['Agriculture', 'Environmental'],
    priority: 0.8,
    description: 'Pathway to medical and biological sciences'
  },
  
  'Information Technology': {
    primary: ['Technology', 'Engineering'],
    secondary: ['Business', 'Creative'],
    priority: 0.9,
    description: 'Direct pathway to tech careers'
  },
  
  'Computer Applications Technology': {
    primary: ['Technology', 'Business'],
    secondary: ['Creative', 'Education'],
    priority: 0.75,
    description: 'Applied technology and digital literacy'
  },
  
  // Business & Commerce Subjects
  'Business Studies': {
    primary: ['Business', 'Management'],
    secondary: ['Finance', 'Marketing'],
    priority: 0.8,
    description: 'Foundation for business and management careers'
  },
  
  'Accounting': {
    primary: ['Finance', 'Business'],
    secondary: ['Management', 'Legal'],
    priority: 0.85,
    description: 'Direct pathway to financial careers'
  },
  
  'Economics': {
    primary: ['Finance', 'Business', 'Government'],
    secondary: ['Research', 'Policy'],
    priority: 0.8,
    description: 'Economic analysis and policy careers'
  },
  
  'Consumer Studies': {
    primary: ['Business', 'Marketing'],
    secondary: ['Education', 'Social'],
    priority: 0.6,
    description: 'Consumer behavior and marketing'
  },
  
  // Languages & Communication
  'English': {
    primary: ['Education', 'Communication', 'Legal'],
    secondary: ['Creative', 'Business', 'Media'],
    priority: 0.7,
    description: 'Communication and language-based careers'
  },
  
  'Afrikaans': {
    primary: ['Education', 'Communication'],
    secondary: ['Legal', 'Media', 'Government'],
    priority: 0.65,
    description: 'Language and cultural careers'
  },
  
  'isiZulu': {
    primary: ['Education', 'Communication'],
    secondary: ['Cultural', 'Government', 'Media'],
    priority: 0.65,
    description: 'Indigenous language and cultural preservation'
  },
  
  // Creative & Arts Subjects
  'Visual Arts': {
    primary: ['Creative', 'Design'],
    secondary: ['Media', 'Education', 'Marketing'],
    priority: 0.7,
    description: 'Visual design and artistic careers'
  },
  
  'Music': {
    primary: ['Creative', 'Entertainment'],
    secondary: ['Education', 'Media', 'Therapy'],
    priority: 0.65,
    description: 'Musical and performance careers'
  },
  
  'Drama': {
    primary: ['Creative', 'Entertainment'],
    secondary: ['Education', 'Media', 'Therapy'],
    priority: 0.65,
    description: 'Performance and theatrical careers'
  },
  
  'Design': {
    primary: ['Creative', 'Design', 'Technology'],
    secondary: ['Business', 'Marketing', 'Engineering'],
    priority: 0.75,
    description: 'Design thinking and creative problem solving'
  },
  
  // Social Sciences & Humanities
  'History': {
    primary: ['Education', 'Research', 'Government'],
    secondary: ['Legal', 'Cultural', 'Media'],
    priority: 0.6,
    description: 'Historical research and cultural preservation'
  },
  
  'Geography': {
    primary: ['Environmental', 'Science', 'Government'],
    secondary: ['Research', 'Education', 'Planning'],
    priority: 0.65,
    description: 'Spatial analysis and environmental careers'
  },
  
  'Tourism': {
    primary: ['Hospitality', 'Business'],
    secondary: ['Marketing', 'Cultural', 'Management'],
    priority: 0.7,
    description: 'Tourism and hospitality industry'
  },
  
  // Specialized Subjects
  'Agricultural Sciences': {
    primary: ['Agriculture', 'Science'],
    secondary: ['Environmental', 'Business', 'Research'],
    priority: 0.75,
    description: 'Agricultural and food production careers'
  },
  
  'Engineering Graphics and Design': {
    primary: ['Engineering', 'Design'],
    secondary: ['Technology', 'Architecture', 'Manufacturing'],
    priority: 0.8,
    description: 'Technical design and engineering'
  },
  
  'Mechanical Technology': {
    primary: ['Engineering', 'Manufacturing'],
    secondary: ['Technology', 'Maintenance'],
    priority: 0.75,
    description: 'Mechanical and manufacturing careers'
  },
  
  'Electrical Technology': {
    primary: ['Engineering', 'Technology'],
    secondary: ['Maintenance', 'Installation'],
    priority: 0.75,
    description: 'Electrical and electronic careers'
  },
  
  'Civil Technology': {
    primary: ['Engineering', 'Construction'],
    secondary: ['Planning', 'Management'],
    priority: 0.75,
    description: 'Construction and infrastructure careers'
  }
};

/**
 * Career category definitions with descriptions and typical careers
 */
export const CAREER_CATEGORIES = {
  'Engineering': {
    description: 'Design, build, and maintain systems and structures',
    examples: ['Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Software Engineer'],
    demandLevel: 'very_high',
    averageSalary: 'high',
    educationLevel: 'degree'
  },
  
  'Technology': {
    description: 'Develop and implement technological solutions',
    examples: ['Software Developer', 'Data Scientist', 'IT Specialist', 'Cybersecurity Analyst'],
    demandLevel: 'very_high',
    averageSalary: 'high',
    educationLevel: 'diploma_degree'
  },
  
  'Healthcare': {
    description: 'Provide medical care and health services',
    examples: ['Doctor', 'Nurse', 'Pharmacist', 'Physiotherapist'],
    demandLevel: 'very_high',
    averageSalary: 'medium_high',
    educationLevel: 'degree'
  },
  
  'Business': {
    description: 'Manage and operate business enterprises',
    examples: ['Business Analyst', 'Project Manager', 'Entrepreneur', 'Consultant'],
    demandLevel: 'high',
    averageSalary: 'medium_high',
    educationLevel: 'diploma_degree'
  },
  
  'Finance': {
    description: 'Manage financial resources and investments',
    examples: ['Accountant', 'Financial Advisor', 'Investment Analyst', 'Auditor'],
    demandLevel: 'high',
    averageSalary: 'high',
    educationLevel: 'degree'
  },
  
  'Education': {
    description: 'Teach and develop educational programs',
    examples: ['Teacher', 'Lecturer', 'Education Specialist', 'Curriculum Developer'],
    demandLevel: 'high',
    averageSalary: 'medium',
    educationLevel: 'degree'
  },
  
  'Creative': {
    description: 'Create artistic and creative content',
    examples: ['Graphic Designer', 'Artist', 'Musician', 'Writer'],
    demandLevel: 'medium',
    averageSalary: 'medium',
    educationLevel: 'diploma_degree'
  },
  
  'Science': {
    description: 'Conduct research and scientific analysis',
    examples: ['Research Scientist', 'Laboratory Technician', 'Environmental Scientist'],
    demandLevel: 'medium_high',
    averageSalary: 'medium_high',
    educationLevel: 'degree'
  },
  
  'Legal': {
    description: 'Provide legal services and advice',
    examples: ['Lawyer', 'Legal Advisor', 'Paralegal', 'Judge'],
    demandLevel: 'medium_high',
    averageSalary: 'high',
    educationLevel: 'degree'
  },
  
  'Government': {
    description: 'Work in public service and policy',
    examples: ['Civil Servant', 'Policy Analyst', 'Municipal Manager'],
    demandLevel: 'medium',
    averageSalary: 'medium',
    educationLevel: 'degree'
  }
};

/**
 * Interdisciplinary subject combinations and their career implications
 */
export const INTERDISCIPLINARY_COMBINATIONS = {
  // STEM Combinations
  'math_physics_it': {
    subjects: ['Mathematics', 'Physical Sciences', 'Information Technology'],
    categories: ['Engineering', 'Technology'],
    boost: 1.2,
    description: 'Strong technical foundation for engineering and tech careers'
  },
  
  'math_life_sciences': {
    subjects: ['Mathematics', 'Life Sciences'],
    categories: ['Healthcare', 'Science', 'Research'],
    boost: 1.15,
    description: 'Quantitative approach to biological sciences'
  },
  
  // Business Combinations
  'math_accounting_business': {
    subjects: ['Mathematics', 'Accounting', 'Business Studies'],
    categories: ['Finance', 'Business'],
    boost: 1.2,
    description: 'Strong foundation for financial and business careers'
  },
  
  'business_economics': {
    subjects: ['Business Studies', 'Economics'],
    categories: ['Business', 'Finance', 'Government'],
    boost: 1.1,
    description: 'Economic and business analysis skills'
  },
  
  // Creative-Technical Combinations
  'design_it': {
    subjects: ['Design', 'Information Technology'],
    categories: ['Creative', 'Technology'],
    boost: 1.15,
    description: 'Digital design and user experience careers'
  },
  
  'visual_arts_design': {
    subjects: ['Visual Arts', 'Design'],
    categories: ['Creative', 'Design'],
    boost: 1.1,
    description: 'Comprehensive creative and design skills'
  },
  
  // Language-Business Combinations
  'english_business': {
    subjects: ['English', 'Business Studies'],
    categories: ['Business', 'Communication', 'Marketing'],
    boost: 1.1,
    description: 'Communication skills for business careers'
  }
};

/**
 * Calculate subject relevance score for a career category
 * @param {Array} studentSubjects - Student's subjects
 * @param {string} category - Career category to score
 * @returns {number} - Relevance score (0-1)
 */
export function calculateCategoryRelevance(studentSubjects, category) {
  if (!Array.isArray(studentSubjects) || !category) {
    return 0;
  }

  let totalScore = 0;
  let maxPossibleScore = 0;

  // Check each student subject
  studentSubjects.forEach(subject => {
    const subjectMapping = SUBJECT_CATEGORY_MAP[subject];
    if (!subjectMapping) return;

    maxPossibleScore += subjectMapping.priority;

    // Primary category match
    if (subjectMapping.primary.includes(category)) {
      totalScore += subjectMapping.priority * 1.0;
    }
    // Secondary category match
    else if (subjectMapping.secondary.includes(category)) {
      totalScore += subjectMapping.priority * 0.6;
    }
  });

  // Check for interdisciplinary combinations
  const combinationBoost = getInterdisciplinaryBoost(studentSubjects, category);
  totalScore *= combinationBoost;

  return maxPossibleScore > 0 ? Math.min(totalScore / maxPossibleScore, 1.0) : 0;
}

/**
 * Get interdisciplinary combination boost
 * @param {Array} subjects - Student subjects
 * @param {string} category - Career category
 * @returns {number} - Boost multiplier (1.0 = no boost)
 */
export function getInterdisciplinaryBoost(subjects, category) {
  let maxBoost = 1.0;

  Object.values(INTERDISCIPLINARY_COMBINATIONS).forEach(combination => {
    // Check if student has all subjects in this combination
    const hasAllSubjects = combination.subjects.every(subject => 
      subjects.includes(subject)
    );

    if (hasAllSubjects && combination.categories.includes(category)) {
      maxBoost = Math.max(maxBoost, combination.boost);
    }
  });

  return maxBoost;
}

/**
 * Get prioritized categories for student subjects
 * @param {Array} subjects - Student subjects
 * @returns {Array} - Sorted array of {category, score} objects
 */
export function getPrioritizedCategories(subjects) {
  if (!Array.isArray(subjects)) {
    return [];
  }

  const categoryScores = {};

  // Calculate scores for all categories
  Object.keys(CAREER_CATEGORIES).forEach(category => {
    categoryScores[category] = calculateCategoryRelevance(subjects, category);
  });

  // Sort by score (descending)
  return Object.entries(categoryScores)
    .map(([category, score]) => ({ category, score }))
    .sort((a, b) => b.score - a.score)
    .filter(item => item.score > 0);
}

/**
 * Get subject recommendations for a career category
 * @param {string} category - Career category
 * @returns {Array} - Recommended subjects for this category
 */
export function getRecommendedSubjects(category) {
  const recommendations = [];

  Object.entries(SUBJECT_CATEGORY_MAP).forEach(([subject, mapping]) => {
    if (mapping.primary.includes(category)) {
      recommendations.push({
        subject,
        importance: 'high',
        priority: mapping.priority
      });
    } else if (mapping.secondary.includes(category)) {
      recommendations.push({
        subject,
        importance: 'medium',
        priority: mapping.priority * 0.6
      });
    }
  });

  return recommendations.sort((a, b) => b.priority - a.priority);
}

/**
 * Analyze subject portfolio for career guidance
 * @param {Array} subjects - Student subjects
 * @returns {Object} - Analysis with strengths, gaps, and recommendations
 */
export function analyzeSubjectPortfolio(subjects) {
  if (!Array.isArray(subjects)) {
    return { strengths: [], gaps: [], recommendations: [] };
  }

  const prioritizedCategories = getPrioritizedCategories(subjects);
  const strengths = prioritizedCategories.slice(0, 3); // Top 3 categories
  
  // Identify potential gaps
  const gaps = [];
  const hasSTEM = subjects.some(s => ['Mathematics', 'Physical Sciences', 'Life Sciences'].includes(s));
  const hasBusiness = subjects.some(s => ['Business Studies', 'Accounting', 'Economics'].includes(s));
  const hasLanguages = subjects.some(s => ['English', 'Afrikaans'].includes(s));
  
  if (!hasSTEM && prioritizedCategories.some(c => ['Engineering', 'Technology', 'Science'].includes(c.category))) {
    gaps.push('Consider adding STEM subjects for technical careers');
  }
  
  if (!hasBusiness && prioritizedCategories.some(c => ['Business', 'Finance'].includes(c.category))) {
    gaps.push('Consider adding business subjects for commercial careers');
  }
  
  if (!hasLanguages) {
    gaps.push('Strong language skills are valuable across all careers');
  }

  return {
    strengths: strengths.map(s => ({
      category: s.category,
      score: s.score,
      description: CAREER_CATEGORIES[s.category]?.description
    })),
    gaps,
    recommendations: prioritizedCategories.slice(0, 5)
  };
}

// Export utility functions
export default {
  SUBJECT_CATEGORY_MAP,
  CAREER_CATEGORIES,
  INTERDISCIPLINARY_COMBINATIONS,
  calculateCategoryRelevance,
  getInterdisciplinaryBoost,
  getPrioritizedCategories,
  getRecommendedSubjects,
  analyzeSubjectPortfolio
};