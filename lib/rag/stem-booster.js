// lib/rag/stem-booster.js
// Advanced STEM Prioritization Enhancement System
// Implements sophisticated STEM student identification and career boosting

/**
 * STEMBooster - Advanced STEM prioritization with configurable algorithms
 * 
 * Features:
 * - Advanced STEM student identification with multi-factor assessment
 * - Sophisticated STEM career recognition and relevance scoring
 * - Configurable boost value management with adaptive parameters
 * - STEM readiness scoring and confidence assessment
 * - Subject performance weighting and career alignment analysis
 */
export class STEMBooster {
  constructor(options = {}) {
    this.config = {
      // STEM identification parameters
      stemSubjectThreshold: options.stemSubjectThreshold || 2, // Minimum STEM subjects
      stemSubjectWeight: options.stemSubjectWeight || 0.6,
      performanceWeight: options.performanceWeight || 0.3,
      interestWeight: options.interestWeight || 0.1,
      
      // Boost parameters
      baseSTEMBoost: options.baseSTEMBoost || 0.15,
      maxSTEMBoost: options.maxSTEMBoost || 0.25,
      minSTEMBoost: options.minSTEMBoost || 0.05,
      
      // Career relevance scoring
      enableRelevanceScoring: options.enableRelevanceScoring !== false,
      relevanceThreshold: options.relevanceThreshold || 0.3,
      
      // Advanced features
      enableAdaptiveBoost: options.enableAdaptiveBoost || true,
      enableConfidenceScoring: options.enableConfidenceScoring !== false,
      enablePerformanceWeighting: options.enablePerformanceWeighting !== false,
      enableLogging: options.enableLogging !== false,
      
      // Grade-specific adjustments
      gradeAdjustments: options.gradeAdjustments || {
        10: 0.8,  // Grade 10: Exploratory phase
        11: 1.0,  // Grade 11: Decision phase
        12: 1.2   // Grade 12: Commitment phase
      },
      
      ...options
    };
    
    // STEM subject patterns and keywords
    this.stemSubjects = {
      mathematics: [
        'mathematics', 'math', 'maths', 'mathematical literacy', 'pure mathematics',
        'applied mathematics', 'further mathematics', 'advanced mathematics'
      ],
      sciences: [
        'physical sciences', 'physics', 'chemistry', 'life sciences', 'biology',
        'natural sciences', 'earth sciences', 'environmental sciences'
      ],
      technology: [
        'information technology', 'computer science', 'it', 'computing',
        'computer applications technology', 'cat', 'programming'
      ],
      engineering: [
        'engineering graphics and design', 'egd', 'technical drawing',
        'mechanical technology', 'electrical technology', 'civil technology'
      ]
    };
    
    // STEM career patterns and categories
    this.stemCareers = {
      engineering: [
        'engineer', 'engineering', 'mechanical', 'electrical', 'civil', 'chemical',
        'software engineer', 'systems engineer', 'design engineer'
      ],
      technology: [
        'developer', 'programmer', 'software', 'data scientist', 'analyst',
        'it specialist', 'systems administrator', 'web developer', 'app developer'
      ],
      sciences: [
        'scientist', 'researcher', 'laboratory', 'research', 'biotechnology',
        'pharmaceutical', 'environmental scientist', 'marine biologist'
      ],
      mathematics: [
        'mathematician', 'statistician', 'actuary', 'quantitative analyst',
        'data analyst', 'financial modelling'
      ],
      medical: [
        'doctor', 'physician', 'surgeon', 'medical', 'healthcare professional',
        'biomedical', 'clinical research', 'medical researcher'
      ]
    };
    
    // Statistics tracking
    this.stats = {
      totalAnalyses: 0,
      stemStudentsIdentified: 0,
      careersBoostApplied: 0,
      averageBoostValue: 0,
      confidenceScores: [],
      gradeDistribution: {}
    };
    
    // Validation
    this.validateConfiguration();
  }

  /**
   * Identify if a student profile indicates STEM aptitude and interest
   * @param {Object} profile - Student profile with subjects, grades, interests
   * @returns {Object} - STEM identification result with confidence and details
   */
  identifySTEMStudent(profile) {
    if (!profile || typeof profile !== 'object') {
      return {
        isSTEMStudent: false,
        confidence: 0,
        reason: 'invalid_profile',
        details: {}
      };
    }

    this.stats.totalAnalyses++;
    
    try {
      // Multi-factor STEM assessment
      const subjectScore = this.calculateSubjectScore(profile);
      const performanceScore = this.calculatePerformanceScore(profile);
      const interestScore = this.calculateInterestScore(profile);
      const gradeAdjustment = this.getGradeAdjustment(profile.grade);
      
      // Weighted composite score
      const compositeScore = (
        (subjectScore * this.config.stemSubjectWeight) +
        (performanceScore * this.config.performanceWeight) +
        (interestScore * this.config.interestWeight)
      ) * gradeAdjustment;
      
      // STEM readiness assessment
      const readinessScore = this.calculateSTEMReadiness(profile, compositeScore);
      
      // Confidence assessment
      const confidence = this.config.enableConfidenceScoring ? 
        this.calculateConfidence(subjectScore, performanceScore, interestScore) : 
        compositeScore;
      
      const isSTEMStudent = compositeScore >= 0.6 && readinessScore >= 0.5;
      
      if (isSTEMStudent) {
        this.stats.stemStudentsIdentified++;
        this.updateGradeDistribution(profile.grade);
      }
      
      if (this.config.enableConfidenceScoring) {
        this.stats.confidenceScores.push(confidence);
      }
      
      const result = {
        isSTEMStudent,
        confidence: Math.round(confidence * 100) / 100,
        compositeScore: Math.round(compositeScore * 100) / 100,
        readinessScore: Math.round(readinessScore * 100) / 100,
        details: {
          subjectScore: Math.round(subjectScore * 100) / 100,
          performanceScore: Math.round(performanceScore * 100) / 100,
          interestScore: Math.round(interestScore * 100) / 100,
          gradeAdjustment,
          stemSubjects: this.identifySTEMSubjects(profile.subjects || []),
          grade: profile.grade
        }
      };
      
      if (this.config.enableLogging) {
        console.log(`🔬 STEM IDENTIFICATION: ${isSTEMStudent ? 'STEM' : 'Non-STEM'} student`);
        console.log(`   📊 Composite Score: ${result.compositeScore}`);
        console.log(`   🎯 Confidence: ${result.confidence}`);
        console.log(`   📚 STEM Subjects: ${result.details.stemSubjects.join(', ')}`);
      }
      
      return result;
      
    } catch (error) {
      if (this.config.enableLogging) {
        console.error(`❌ STEM identification failed: ${error.message}`);
      }
      
      return {
        isSTEMStudent: false,
        confidence: 0,
        reason: 'analysis_error',
        details: { error: error.message }
      };
    }
  }

  /**
   * Apply STEM career boosting to career recommendations
   * @param {Array} careers - Career recommendations
   * @param {Object} profile - Student profile
   * @param {Object} options - Boosting options
   * @returns {Array} - Careers with STEM boosting applied
   */
  applySTEMBoosting(careers, profile, options = {}) {
    if (!Array.isArray(careers) || careers.length === 0) {
      return careers;
    }

    const config = { ...this.config, ...options };
    
    // First identify if student is STEM-oriented
    const stemIdentification = this.identifySTEMStudent(profile);
    
    if (!stemIdentification.isSTEMStudent) {
      if (config.enableLogging) {
        console.log(`🔬 STEM BOOSTING: Skipped (non-STEM student)`);
      }
      return careers;
    }

    if (config.enableLogging) {
      console.log(`🚀 STEM BOOSTING: Applying to ${careers.length} careers`);
      console.log(`   🎯 STEM Confidence: ${stemIdentification.confidence}`);
    }

    const boostedCareers = careers.map(career => {
      const stemRelevance = this.calculateSTEMRelevance(career);
      
      if (stemRelevance.isSTEMCareer) {
        const boostValue = this.calculateBoostValue(
          stemRelevance, 
          stemIdentification, 
          profile, 
          config
        );
        
        const boostedCareer = {
          ...career,
          similarity: Math.min(1.0, (career.similarity || 0) + boostValue),
          stemBoost: boostValue,
          stemRelevance: stemRelevance.relevanceScore,
          stemCategory: stemRelevance.category
        };
        
        this.stats.careersBoostApplied++;
        this.updateAverageBoost(boostValue);
        
        if (config.enableLogging) {
          console.log(`   ⬆️ Boosted: ${career.title} (+${Math.round(boostValue * 100)}%)`);
        }
        
        return boostedCareer;
      }
      
      return career;
    });

    // Re-sort by similarity after boosting
    const sortedCareers = boostedCareers.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
    
    if (config.enableLogging) {
      const boostedCount = boostedCareers.filter(c => c.stemBoost).length;
      console.log(`   ✅ STEM boosting complete: ${boostedCount} careers boosted`);
    }
    
    return sortedCareers;
  }

  /**
   * Calculate subject-based STEM score
   * @param {Object} profile - Student profile
   * @returns {number} - Subject score (0-1)
   */
  calculateSubjectScore(profile) {
    const subjects = profile.subjects || [];
    if (!Array.isArray(subjects) || subjects.length === 0) {
      return 0;
    }

    const stemSubjects = this.identifySTEMSubjects(subjects);
    const stemRatio = stemSubjects.length / subjects.length;
    const stemCount = stemSubjects.length;
    
    // Bonus for having multiple STEM subjects
    const diversityBonus = stemCount >= this.config.stemSubjectThreshold ? 0.2 : 0;
    
    // Core STEM subjects get higher weight
    const coreSTEMBonus = this.calculateCoreSTEMBonus(stemSubjects);
    
    return Math.min(1.0, stemRatio + diversityBonus + coreSTEMBonus);
  }

  /**
   * Calculate performance-based STEM score
   * @param {Object} profile - Student profile
   * @returns {number} - Performance score (0-1)
   */
  calculatePerformanceScore(profile) {
    if (!this.config.enablePerformanceWeighting) {
      return 0.5; // Neutral score when performance weighting is disabled
    }

    const marks = profile.marks || profile.grades || {};
    if (typeof marks !== 'object' || Object.keys(marks).length === 0) {
      return 0.5; // Neutral score when no performance data
    }

    const stemSubjects = this.identifySTEMSubjects(Object.keys(marks));
    if (stemSubjects.length === 0) {
      return 0.3; // Lower score when no STEM subject performance
    }

    // Calculate average performance in STEM subjects
    let totalMarks = 0;
    let subjectCount = 0;
    
    stemSubjects.forEach(subject => {
      const mark = marks[subject];
      if (typeof mark === 'number' && mark >= 0 && mark <= 100) {
        totalMarks += mark;
        subjectCount++;
      }
    });

    if (subjectCount === 0) {
      return 0.5;
    }

    const averageMark = totalMarks / subjectCount;
    
    // Convert percentage to 0-1 score with emphasis on higher performance
    // 70%+ gets significant boost, 50-70% is neutral, <50% is lower
    if (averageMark >= 70) {
      return 0.8 + ((averageMark - 70) / 30) * 0.2; // 0.8-1.0
    } else if (averageMark >= 50) {
      return 0.4 + ((averageMark - 50) / 20) * 0.4; // 0.4-0.8
    } else {
      return Math.max(0.1, averageMark / 50 * 0.4); // 0.1-0.4
    }
  }

  /**
   * Calculate interest-based STEM score
   * @param {Object} profile - Student profile
   * @returns {number} - Interest score (0-1)
   */
  calculateInterestScore(profile) {
    const interests = profile.interests || profile.careerInterests || [];
    const interestText = profile.interestText || profile.careerInterestText || '';
    
    let score = 0;
    
    // Check interest keywords
    if (Array.isArray(interests)) {
      const stemInterests = interests.filter(interest => 
        this.isSTEMInterest(interest)
      );
      score += (stemInterests.length / Math.max(interests.length, 1)) * 0.6;
    }
    
    // Check interest text for STEM keywords
    if (typeof interestText === 'string' && interestText.length > 0) {
      const stemKeywordCount = this.countSTEMKeywords(interestText);
      const totalWords = interestText.split(/\s+/).length;
      score += Math.min(0.4, (stemKeywordCount / Math.max(totalWords, 1)) * 2);
    }
    
    return Math.min(1.0, score);
  }

  /**
   * Calculate STEM readiness score
   * @param {Object} profile - Student profile
   * @param {number} compositeScore - Composite STEM score
   * @returns {number} - Readiness score (0-1)
   */
  calculateSTEMReadiness(profile, compositeScore) {
    let readinessScore = compositeScore;
    
    // Grade-based readiness adjustment
    const grade = profile.grade;
    if (grade === 12) {
      readinessScore *= 1.1; // Grade 12 students are more ready for career decisions
    } else if (grade === 10) {
      readinessScore *= 0.9; // Grade 10 students are still exploring
    }
    
    // Subject combination readiness
    const subjects = profile.subjects || [];
    const hasMathematics = subjects.some(s => this.isSubjectType(s, 'mathematics'));
    const hasSciences = subjects.some(s => this.isSubjectType(s, 'sciences'));
    
    if (hasMathematics && hasSciences) {
      readinessScore *= 1.1; // Strong foundation
    } else if (!hasMathematics && !hasSciences) {
      readinessScore *= 0.7; // Weak foundation
    }
    
    return Math.min(1.0, readinessScore);
  }

  /**
   * Calculate confidence in STEM identification
   * @param {number} subjectScore - Subject-based score
   * @param {number} performanceScore - Performance-based score
   * @param {number} interestScore - Interest-based score
   * @returns {number} - Confidence score (0-1)
   */
  calculateConfidence(subjectScore, performanceScore, interestScore) {
    // Confidence is higher when multiple factors align
    const scores = [subjectScore, performanceScore, interestScore];
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    // Calculate variance to assess consistency
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length;
    const consistency = 1 - Math.min(1, variance * 2); // Lower variance = higher consistency
    
    // Combine average score with consistency
    return (avgScore * 0.7) + (consistency * 0.3);
  }

  /**
   * Calculate STEM relevance of a career
   * @param {Object} career - Career object
   * @returns {Object} - STEM relevance assessment
   */
  calculateSTEMRelevance(career) {
    if (!career || typeof career !== 'object') {
      return {
        isSTEMCareer: false,
        relevanceScore: 0,
        category: null,
        confidence: 0
      };
    }

    const title = (career.title || '').toLowerCase();
    const description = (career.description || '').toLowerCase();
    const category = (career.category || '').toLowerCase();
    
    let relevanceScore = 0;
    let stemCategory = null;
    let matchedKeywords = [];
    
    // Check against STEM career patterns
    for (const [categoryName, keywords] of Object.entries(this.stemCareers)) {
      const categoryScore = this.calculateCategoryRelevance(
        title, description, category, keywords
      );
      
      if (categoryScore > relevanceScore) {
        relevanceScore = categoryScore;
        stemCategory = categoryName;
      }
      
      // Collect matched keywords for confidence assessment
      keywords.forEach(keyword => {
        if (title.includes(keyword) || description.includes(keyword)) {
          matchedKeywords.push(keyword);
        }
      });
    }
    
    const isSTEMCareer = relevanceScore >= this.config.relevanceThreshold;
    const confidence = this.calculateRelevanceConfidence(matchedKeywords, title, description);
    
    return {
      isSTEMCareer,
      relevanceScore: Math.round(relevanceScore * 100) / 100,
      category: stemCategory,
      confidence: Math.round(confidence * 100) / 100,
      matchedKeywords
    };
  }

  /**
   * Calculate boost value for a STEM career
   * @param {Object} stemRelevance - STEM relevance assessment
   * @param {Object} stemIdentification - STEM student identification
   * @param {Object} profile - Student profile
   * @param {Object} config - Configuration
   * @returns {number} - Boost value to apply
   */
  calculateBoostValue(stemRelevance, stemIdentification, profile, config) {
    let boostValue = config.baseSTEMBoost;
    
    // Adjust based on STEM relevance
    boostValue *= stemRelevance.relevanceScore;
    
    // Adjust based on student STEM confidence
    boostValue *= stemIdentification.confidence;
    
    // Adaptive boost based on career-student alignment
    if (config.enableAdaptiveBoost) {
      const alignmentBonus = this.calculateAlignmentBonus(
        stemRelevance, 
        stemIdentification, 
        profile
      );
      boostValue += alignmentBonus;
    }
    
    // Grade-based adjustment
    const gradeAdjustment = this.getGradeAdjustment(profile.grade);
    boostValue *= gradeAdjustment;
    
    // Ensure boost is within configured limits
    return Math.max(
      config.minSTEMBoost,
      Math.min(config.maxSTEMBoost, boostValue)
    );
  }

  /**
   * Calculate alignment bonus between career and student
   * @param {Object} stemRelevance - Career STEM relevance
   * @param {Object} stemIdentification - Student STEM identification
   * @param {Object} profile - Student profile
   * @returns {number} - Alignment bonus (0-0.1)
   */
  calculateAlignmentBonus(stemRelevance, stemIdentification, profile) {
    let bonus = 0;
    
    // Subject-career alignment
    const studentSTEMSubjects = this.identifySTEMSubjects(profile.subjects || []);
    const careerCategory = stemRelevance.category;
    
    if (careerCategory === 'mathematics' && studentSTEMSubjects.includes('mathematics')) {
      bonus += 0.05;
    }
    if (careerCategory === 'sciences' && studentSTEMSubjects.some(s => s.includes('science'))) {
      bonus += 0.05;
    }
    if (careerCategory === 'technology' && studentSTEMSubjects.some(s => s.includes('technology'))) {
      bonus += 0.05;
    }
    if (careerCategory === 'engineering' && studentSTEMSubjects.some(s => s.includes('engineering'))) {
      bonus += 0.05;
    }
    
    // Performance alignment
    if (stemIdentification.details.performanceScore > 0.8) {
      bonus += 0.03; // High performers get extra boost
    }
    
    return Math.min(0.1, bonus);
  }

  /**
   * Identify STEM subjects from a list of subjects
   * @param {Array} subjects - List of subject names
   * @returns {Array} - List of identified STEM subjects
   */
  identifySTEMSubjects(subjects) {
    if (!Array.isArray(subjects)) {
      return [];
    }

    const stemSubjects = [];
    
    subjects.forEach(subject => {
      const subjectLower = subject.toLowerCase();
      
      for (const [category, keywords] of Object.entries(this.stemSubjects)) {
        if (keywords.some(keyword => subjectLower.includes(keyword))) {
          stemSubjects.push(subject);
          break; // Don't double-count subjects
        }
      }
    });
    
    return stemSubjects;
  }

  /**
   * Check if a subject belongs to a specific STEM category
   * @param {string} subject - Subject name
   * @param {string} category - STEM category
   * @returns {boolean} - Whether subject belongs to category
   */
  isSubjectType(subject, category) {
    if (!subject || !category || !this.stemSubjects[category]) {
      return false;
    }

    const subjectLower = subject.toLowerCase();
    return this.stemSubjects[category].some(keyword => 
      subjectLower.includes(keyword)
    );
  }

  /**
   * Calculate core STEM bonus for having essential subjects
   * @param {Array} stemSubjects - Identified STEM subjects
   * @returns {number} - Core STEM bonus (0-0.2)
   */
  calculateCoreSTEMBonus(stemSubjects) {
    let bonus = 0;
    
    const hasMath = stemSubjects.some(s => this.isSubjectType(s, 'mathematics'));
    const hasScience = stemSubjects.some(s => this.isSubjectType(s, 'sciences'));
    const hasTech = stemSubjects.some(s => this.isSubjectType(s, 'technology'));
    
    if (hasMath) bonus += 0.1; // Mathematics is fundamental
    if (hasScience) bonus += 0.05;
    if (hasTech) bonus += 0.05;
    
    return bonus;
  }

  /**
   * Check if an interest is STEM-related
   * @param {string} interest - Interest string
   * @returns {boolean} - Whether interest is STEM-related
   */
  isSTEMInterest(interest) {
    if (!interest || typeof interest !== 'string') {
      return false;
    }

    const interestLower = interest.toLowerCase();
    const stemKeywords = [
      'technology', 'engineering', 'science', 'mathematics', 'programming',
      'coding', 'research', 'innovation', 'technical', 'analytical',
      'problem solving', 'data', 'computer', 'software', 'hardware'
    ];
    
    return stemKeywords.some(keyword => interestLower.includes(keyword));
  }

  /**
   * Count STEM keywords in text
   * @param {string} text - Text to analyze
   * @returns {number} - Number of STEM keywords found
   */
  countSTEMKeywords(text) {
    if (!text || typeof text !== 'string') {
      return 0;
    }

    const textLower = text.toLowerCase();
    const stemKeywords = [
      'engineer', 'scientist', 'programmer', 'developer', 'analyst',
      'researcher', 'technician', 'mathematician', 'statistician',
      'technology', 'science', 'mathematics', 'programming', 'coding',
      'software', 'hardware', 'data', 'algorithm', 'innovation'
    ];
    
    return stemKeywords.filter(keyword => textLower.includes(keyword)).length;
  }

  /**
   * Calculate category relevance for STEM career classification
   * @param {string} title - Career title
   * @param {string} description - Career description
   * @param {string} category - Career category
   * @param {Array} keywords - Category keywords
   * @returns {number} - Relevance score (0-1)
   */
  calculateCategoryRelevance(title, description, category, keywords) {
    let score = 0;
    
    keywords.forEach(keyword => {
      if (title.includes(keyword)) {
        score += 0.4; // Title matches are weighted heavily
      }
      if (description.includes(keyword)) {
        score += 0.2; // Description matches are weighted moderately
      }
      if (category.includes(keyword)) {
        score += 0.3; // Category matches are weighted moderately-high
      }
    });
    
    return Math.min(1.0, score);
  }

  /**
   * Calculate confidence in STEM relevance assessment
   * @param {Array} matchedKeywords - Keywords that matched
   * @param {string} title - Career title
   * @param {string} description - Career description
   * @returns {number} - Confidence score (0-1)
   */
  calculateRelevanceConfidence(matchedKeywords, title, description) {
    let confidence = 0;
    
    // More matched keywords = higher confidence
    confidence += Math.min(0.5, matchedKeywords.length * 0.1);
    
    // Title matches are more confident than description matches
    const titleMatches = matchedKeywords.filter(keyword => title.includes(keyword));
    confidence += titleMatches.length * 0.2;
    
    // Longer descriptions with matches are more confident
    if (description.length > 50 && matchedKeywords.length > 0) {
      confidence += 0.2;
    }
    
    return Math.min(1.0, confidence);
  }

  /**
   * Get grade-based adjustment factor
   * @param {number} grade - Student grade
   * @returns {number} - Adjustment factor
   */
  getGradeAdjustment(grade) {
    return this.config.gradeAdjustments[grade] || 1.0;
  }

  /**
   * Update grade distribution statistics
   * @param {number} grade - Student grade
   */
  updateGradeDistribution(grade) {
    if (typeof grade === 'number') {
      this.stats.gradeDistribution[grade] = (this.stats.gradeDistribution[grade] || 0) + 1;
    }
  }

  /**
   * Update average boost statistics
   * @param {number} boostValue - Applied boost value
   */
  updateAverageBoost(boostValue) {
    const currentTotal = this.stats.averageBoostValue * (this.stats.careersBoostApplied - 1);
    this.stats.averageBoostValue = (currentTotal + boostValue) / this.stats.careersBoostApplied;
  }

  /**
   * Update configuration with validation
   * @param {Object} newConfig - New configuration parameters
   * @returns {boolean} - Whether update was successful
   */
  updateConfiguration(newConfig) {
    try {
      const updatedConfig = { ...this.config, ...newConfig };
      
      if (!this.isValidConfiguration(updatedConfig)) {
        throw new Error('Invalid configuration parameters');
      }
      
      this.config = updatedConfig;
      
      if (this.config.enableLogging) {
        console.log('🔧 STEMBooster configuration updated');
      }
      
      return true;
    } catch (error) {
      if (this.config.enableLogging) {
        console.error(`❌ Configuration update failed: ${error.message}`);
      }
      return false;
    }
  }

  /**
   * Validate configuration parameters
   * @param {Object} config - Configuration to validate
   * @returns {boolean} - Whether configuration is valid
   */
  isValidConfiguration(config) {
    // Check numeric parameters
    const numericParams = [
      'stemSubjectThreshold', 'stemSubjectWeight', 'performanceWeight', 'interestWeight',
      'baseSTEMBoost', 'maxSTEMBoost', 'minSTEMBoost', 'relevanceThreshold'
    ];
    
    for (const param of numericParams) {
      if (typeof config[param] !== 'number' || config[param] < 0) {
        return false;
      }
    }
    
    // Check weight sum
    const weightSum = config.stemSubjectWeight + config.performanceWeight + config.interestWeight;
    if (Math.abs(weightSum - 1.0) > 0.001) {
      return false;
    }
    
    // Check boost value constraints
    if (config.minSTEMBoost >= config.maxSTEMBoost) {
      return false;
    }
    
    if (config.baseSTEMBoost < config.minSTEMBoost || config.baseSTEMBoost > config.maxSTEMBoost) {
      return false;
    }
    
    return true;
  }

  /**
   * Validate configuration on initialization
   */
  validateConfiguration() {
    if (!this.isValidConfiguration(this.config)) {
      throw new Error('Invalid STEMBooster configuration');
    }
  }

  /**
   * Get current statistics
   * @returns {Object} - Current statistics
   */
  getStatistics() {
    const avgConfidence = this.stats.confidenceScores.length > 0 ?
      this.stats.confidenceScores.reduce((sum, score) => sum + score, 0) / this.stats.confidenceScores.length :
      0;

    return {
      ...this.stats,
      averageBoostValue: Math.round(this.stats.averageBoostValue * 1000) / 1000,
      averageConfidence: Math.round(avgConfidence * 100) / 100,
      stemIdentificationRate: this.stats.totalAnalyses > 0 ?
        Math.round((this.stats.stemStudentsIdentified / this.stats.totalAnalyses) * 100) : 0
    };
  }

  /**
   * Reset statistics
   */
  resetStatistics() {
    this.stats = {
      totalAnalyses: 0,
      stemStudentsIdentified: 0,
      careersBoostApplied: 0,
      averageBoostValue: 0,
      confidenceScores: [],
      gradeDistribution: {}
    };
  }

  /**
   * Get current configuration
   * @returns {Object} - Current configuration
   */
  getConfiguration() {
    return { ...this.config };
  }
}

export default STEMBooster;