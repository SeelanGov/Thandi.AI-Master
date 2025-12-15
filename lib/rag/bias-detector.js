// lib/rag/bias-detector.js
// Advanced Bias Detection Engine for Career Recommendations
// Detects and analyzes various forms of algorithmic bias

/**
 * BiasDetector - Comprehensive bias detection and analysis for career recommendations
 * 
 * Detects multiple types of bias:
 * - Teaching bias (>60% teaching careers for math students)
 * - Category dominance (single category >60% of recommendations)
 * - Cultural stereotypes in recommendation patterns
 * - Severity assessment and confidence scoring
 */
export class BiasDetector {
  constructor(options = {}) {
    this.config = {
      teachingBiasThreshold: options.teachingBiasThreshold || 0.6,
      categoryDominanceThreshold: options.categoryDominanceThreshold || 0.6,
      minCareersForAnalysis: options.minCareersForAnalysis || 3,
      enableLogging: options.enableLogging !== false,
      enablePatternTracking: options.enablePatternTracking !== false,
      ...options
    };
    
    // Pattern tracking for trend analysis
    this.biasHistory = [];
    this.detectionStats = {
      totalAnalyses: 0,
      biasDetected: 0,
      teachingBiasCount: 0,
      categoryDominanceCount: 0,
      culturalBiasCount: 0
    };
  }

  /**
   * Detect teaching bias in career recommendations
   * @param {Array} careers - Array of career objects
   * @param {number} threshold - Bias threshold (default: 0.6)
   * @returns {Object} - Bias detection result
   */
  detectTeachingBias(careers, threshold = null) {
    const biasThreshold = threshold || this.config.teachingBiasThreshold;
    
    if (!Array.isArray(careers) || careers.length < this.config.minCareersForAnalysis) {
      return {
        hasBias: false,
        severity: 0,
        details: {
          reason: 'insufficient_data',
          careerCount: careers?.length || 0,
          minRequired: this.config.minCareersForAnalysis
        }
      };
    }

    // Identify teaching careers
    const teachingCategories = ['Education', 'Teaching', 'Academic'];
    const teachingKeywords = /teach|education|instructor|professor|tutor|lecturer|educator/gi;
    
    const teachingCareers = careers.filter(career => {
      const categoryMatch = teachingCategories.includes(career.category);
      const titleMatch = teachingKeywords.test(career.title || '');
      const descriptionMatch = teachingKeywords.test(career.description || '');
      
      return categoryMatch || titleMatch || descriptionMatch;
    });

    const teachingPercentage = teachingCareers.length / careers.length;
    const hasBias = teachingPercentage > biasThreshold;
    
    // Calculate severity (0-1 scale)
    const severity = hasBias ? Math.min((teachingPercentage - biasThreshold) / (1 - biasThreshold), 1) : 0;
    
    // Detailed analysis
    const details = {
      teachingCareers: teachingCareers.length,
      totalCareers: careers.length,
      teachingPercentage: Math.round(teachingPercentage * 100),
      threshold: Math.round(biasThreshold * 100),
      teachingCareerTitles: teachingCareers.map(c => c.title).slice(0, 5), // First 5 for logging
      severity: Math.round(severity * 100),
      biasType: 'teaching_dominance'
    };

    if (this.config.enableLogging && hasBias) {
      console.log(`   🚨 TEACHING BIAS DETECTED: ${details.teachingPercentage}% teaching careers (threshold: ${details.threshold}%)`);
      console.log(`   📊 Severity: ${details.severity}% | Teaching careers: ${details.teachingCareers}/${details.totalCareers}`);
    }

    // Update statistics
    this.detectionStats.totalAnalyses++;
    if (hasBias) {
      this.detectionStats.biasDetected++;
      this.detectionStats.teachingBiasCount++;
    }

    return {
      hasBias,
      severity,
      details
    };
  }

  /**
   * Analyze category distribution across career recommendations
   * @param {Array} careers - Array of career objects
   * @returns {Object} - Category distribution analysis
   */
  analyzeCategoryDistribution(careers) {
    if (!Array.isArray(careers) || careers.length === 0) {
      return {
        categories: [],
        dominantCategory: null,
        diversity: 0,
        distribution: {},
        hasDominance: false
      };
    }

    // Count careers by category
    const categoryCount = {};
    const categoryDetails = {};
    
    careers.forEach(career => {
      const category = career.category || 'Uncategorized';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
      
      if (!categoryDetails[category]) {
        categoryDetails[category] = {
          count: 0,
          careers: [],
          avgSimilarity: 0
        };
      }
      
      categoryDetails[category].count++;
      categoryDetails[category].careers.push(career.title);
      categoryDetails[category].avgSimilarity += (career.similarity || 0);
    });

    // Calculate average similarities
    Object.keys(categoryDetails).forEach(category => {
      categoryDetails[category].avgSimilarity /= categoryDetails[category].count;
      categoryDetails[category].avgSimilarity = Math.round(categoryDetails[category].avgSimilarity * 100) / 100;
    });

    // Find dominant category
    const sortedCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a);
    
    const dominantCategory = sortedCategories[0]?.[0] || null;
    const dominantCount = sortedCategories[0]?.[1] || 0;
    const dominancePercentage = dominantCount / careers.length;
    
    // Calculate diversity score (higher = more diverse)
    const uniqueCategories = Object.keys(categoryCount).length;
    const maxPossibleCategories = Math.min(careers.length, 10); // Reasonable max
    const diversity = uniqueCategories / maxPossibleCategories;
    
    // Check for category dominance
    const hasDominance = dominancePercentage > this.config.categoryDominanceThreshold;
    
    // Create distribution percentages
    const distribution = {};
    Object.entries(categoryCount).forEach(([category, count]) => {
      distribution[category] = {
        count,
        percentage: Math.round((count / careers.length) * 100),
        details: categoryDetails[category]
      };
    });

    if (this.config.enableLogging) {
      console.log(`   📊 Category Analysis: ${uniqueCategories} categories across ${careers.length} careers`);
      console.log(`   🎯 Dominant: ${dominantCategory} (${Math.round(dominancePercentage * 100)}%)`);
      console.log(`   🌈 Diversity Score: ${Math.round(diversity * 100)}%`);
    }

    // Update statistics
    if (hasDominance) {
      this.detectionStats.categoryDominanceCount++;
    }

    return {
      categories: Object.keys(categoryCount),
      dominantCategory,
      dominancePercentage: Math.round(dominancePercentage * 100),
      diversity: Math.round(diversity * 100),
      distribution,
      hasDominance,
      uniqueCategories,
      details: categoryDetails
    };
  }

  /**
   * Identify bias patterns in career recommendations based on student profile
   * @param {Array} careers - Array of career objects
   * @param {Object} profile - Student profile
   * @returns {Object} - Bias pattern analysis
   */
  identifyBiasPatterns(careers, profile) {
    const patterns = [];
    const corrections = [];
    let confidence = 0;

    // 1. Teaching bias pattern for STEM students
    if (this.isSTEMStudent(profile)) {
      const teachingBias = this.detectTeachingBias(careers);
      if (teachingBias.hasBias) {
        patterns.push({
          type: 'stem_teaching_bias',
          description: 'STEM student receiving predominantly teaching career recommendations',
          severity: teachingBias.severity,
          evidence: teachingBias.details
        });
        
        corrections.push({
          type: 'limit_teaching_careers',
          action: 'Limit teaching careers to maximum 1 in top 3 recommendations',
          priority: 'high'
        });
        
        corrections.push({
          type: 'boost_stem_careers',
          action: 'Apply +0.15 similarity boost to STEM careers',
          priority: 'high'
        });
        
        confidence += 0.4;
      }
    }

    // 2. Category dominance pattern
    const categoryAnalysis = this.analyzeCategoryDistribution(careers);
    if (categoryAnalysis.hasDominance) {
      patterns.push({
        type: 'category_dominance',
        description: `Single category (${categoryAnalysis.dominantCategory}) dominates recommendations`,
        severity: (categoryAnalysis.dominancePercentage - 60) / 40, // Scale 0-1
        evidence: {
          dominantCategory: categoryAnalysis.dominantCategory,
          percentage: categoryAnalysis.dominancePercentage,
          diversity: categoryAnalysis.diversity
        }
      });
      
      corrections.push({
        type: 'enforce_category_diversity',
        action: 'Ensure multiple categories represented in top recommendations',
        priority: 'medium'
      });
      
      confidence += 0.3;
    }

    // 3. Cultural stereotype patterns
    const culturalBias = this.detectCulturalStereotypes(careers, profile);
    if (culturalBias.detected) {
      patterns.push({
        type: 'cultural_stereotype',
        description: culturalBias.description,
        severity: culturalBias.severity,
        evidence: culturalBias.evidence
      });
      
      corrections.push(...culturalBias.corrections);
      confidence += 0.3;
    }

    // 4. Quality vs diversity trade-off pattern
    const qualityAnalysis = this.analyzeQualityDistribution(careers);
    if (qualityAnalysis.hasQualityBias) {
      patterns.push({
        type: 'quality_concentration',
        description: 'High-quality recommendations concentrated in single category',
        severity: qualityAnalysis.severity,
        evidence: qualityAnalysis.evidence
      });
      
      corrections.push({
        type: 'balance_quality_diversity',
        action: 'Redistribute quality scores across categories while maintaining standards',
        priority: 'low'
      });
      
      confidence += 0.2;
    }

    // Record pattern for trend analysis
    if (this.config.enablePatternTracking) {
      this.recordBiasPattern({
        timestamp: new Date().toISOString(),
        profile: {
          grade: profile.grade,
          subjects: profile.subjects?.slice(0, 3), // First 3 subjects for privacy
          isSTEM: this.isSTEMStudent(profile)
        },
        patterns: patterns.map(p => ({ type: p.type, severity: p.severity })),
        corrections: corrections.map(c => ({ type: c.type, priority: c.priority }))
      });
    }

    // Update statistics
    if (patterns.length > 0) {
      this.detectionStats.biasDetected++;
      if (patterns.some(p => p.type === 'cultural_stereotype')) {
        this.detectionStats.culturalBiasCount++;
      }
    }

    return {
      patterns,
      corrections,
      confidence: Math.min(confidence, 1), // Cap at 1.0
      summary: {
        totalPatterns: patterns.length,
        highSeverityPatterns: patterns.filter(p => p.severity > 0.7).length,
        recommendedCorrections: corrections.length
      }
    };
  }

  /**
   * Detect cultural stereotypes in career recommendations
   * @private
   */
  detectCulturalStereotypes(careers, profile) {
    const stereotypes = [];
    let severity = 0;
    const evidence = {};

    // Mathematics -> Teaching stereotype (South African context)
    if (profile.subjects?.some(s => /mathematics|math/gi.test(s))) {
      const teachingCareers = careers.filter(c => 
        /teach|education|instructor/gi.test(c.title || '') ||
        ['Education', 'Teaching'].includes(c.category)
      );
      
      if (teachingCareers.length > 0) {
        const mathTeachingPercentage = teachingCareers.length / careers.length;
        if (mathTeachingPercentage > 0.4) { // Lower threshold for cultural bias
          stereotypes.push('math_teaching_association');
          severity = Math.max(severity, mathTeachingPercentage);
          evidence.mathTeachingPercentage = Math.round(mathTeachingPercentage * 100);
        }
      }
    }

    // Science -> Healthcare stereotype
    if (profile.subjects?.some(s => /life sciences|biology|chemistry/gi.test(s))) {
      const healthcareCareers = careers.filter(c => 
        /doctor|nurse|medical|health|physician/gi.test(c.title || '') ||
        ['Healthcare', 'Medical', 'Health'].includes(c.category)
      );
      
      if (healthcareCareers.length / careers.length > 0.5) {
        stereotypes.push('science_healthcare_association');
        severity = Math.max(severity, healthcareCareers.length / careers.length);
        evidence.healthcarePercentage = Math.round((healthcareCareers.length / careers.length) * 100);
      }
    }

    const corrections = [];
    if (stereotypes.includes('math_teaching_association')) {
      corrections.push({
        type: 'diversify_math_careers',
        action: 'Include engineering, technology, and finance careers for math students',
        priority: 'high'
      });
    }

    return {
      detected: stereotypes.length > 0,
      stereotypes,
      severity,
      evidence,
      corrections,
      description: stereotypes.length > 0 ? 
        `Cultural stereotypes detected: ${stereotypes.join(', ')}` : 
        'No cultural stereotypes detected'
    };
  }

  /**
   * Analyze quality distribution across career categories
   * @private
   */
  analyzeQualityDistribution(careers) {
    if (careers.length < 3) {
      return { hasQualityBias: false, severity: 0, evidence: {} };
    }

    // Group by category and calculate average quality (similarity scores)
    const categoryQuality = {};
    careers.forEach(career => {
      const category = career.category || 'Uncategorized';
      if (!categoryQuality[category]) {
        categoryQuality[category] = { scores: [], count: 0 };
      }
      categoryQuality[category].scores.push(career.similarity || 0);
      categoryQuality[category].count++;
    });

    // Calculate averages
    const categoryAverages = {};
    Object.entries(categoryQuality).forEach(([category, data]) => {
      categoryAverages[category] = {
        avgQuality: data.scores.reduce((sum, score) => sum + score, 0) / data.count,
        count: data.count
      };
    });

    // Find if high-quality careers are concentrated in one category
    const sortedByQuality = Object.entries(categoryAverages)
      .sort(([,a], [,b]) => b.avgQuality - a.avgQuality);
    
    if (sortedByQuality.length < 2) {
      return { hasQualityBias: false, severity: 0, evidence: {} };
    }

    const topCategory = sortedByQuality[0];
    const secondCategory = sortedByQuality[1];
    const qualityGap = topCategory[1].avgQuality - secondCategory[1].avgQuality;
    
    // Check if top category has significantly higher quality AND represents majority
    const topCategoryPercentage = topCategory[1].count / careers.length;
    const hasQualityBias = qualityGap > 0.2 && topCategoryPercentage > 0.6;
    
    return {
      hasQualityBias,
      severity: hasQualityBias ? Math.min(qualityGap * topCategoryPercentage, 1) : 0,
      evidence: {
        topCategory: topCategory[0],
        topCategoryQuality: Math.round(topCategory[1].avgQuality * 100),
        topCategoryPercentage: Math.round(topCategoryPercentage * 100),
        qualityGap: Math.round(qualityGap * 100),
        categoryQuality: Object.fromEntries(
          Object.entries(categoryAverages).map(([cat, data]) => [
            cat, 
            { 
              avgQuality: Math.round(data.avgQuality * 100), 
              count: data.count 
            }
          ])
        )
      }
    };
  }

  /**
   * Check if student profile indicates STEM focus
   * @private
   */
  isSTEMStudent(profile) {
    if (!profile.subjects || !Array.isArray(profile.subjects)) {
      return false;
    }

    const stemSubjects = [
      'mathematics', 'math', 'physical sciences', 'physics', 'chemistry',
      'information technology', 'computer science', 'engineering',
      'mathematical literacy', 'technical mathematics'
    ];

    return profile.subjects.some(subject => 
      stemSubjects.some(stem => 
        subject.toLowerCase().includes(stem.toLowerCase())
      )
    );
  }

  /**
   * Record bias pattern for trend analysis
   * @private
   */
  recordBiasPattern(pattern) {
    this.biasHistory.push(pattern);
    
    // Keep only last 100 patterns to prevent memory issues
    if (this.biasHistory.length > 100) {
      this.biasHistory = this.biasHistory.slice(-100);
    }
  }

  /**
   * Get bias detection statistics
   * @returns {Object} - Detection statistics
   */
  getDetectionStats() {
    const stats = { ...this.detectionStats };
    
    // Calculate rates
    if (stats.totalAnalyses > 0) {
      stats.biasDetectionRate = Math.round((stats.biasDetected / stats.totalAnalyses) * 100);
      stats.teachingBiasRate = Math.round((stats.teachingBiasCount / stats.totalAnalyses) * 100);
      stats.categoryDominanceRate = Math.round((stats.categoryDominanceCount / stats.totalAnalyses) * 100);
      stats.culturalBiasRate = Math.round((stats.culturalBiasCount / stats.totalAnalyses) * 100);
    }
    
    return stats;
  }

  /**
   * Get recent bias patterns for trend analysis
   * @param {number} limit - Number of recent patterns to return
   * @returns {Array} - Recent bias patterns
   */
  getRecentPatterns(limit = 10) {
    return this.biasHistory.slice(-limit);
  }

  /**
   * Reset detection statistics
   */
  resetStats() {
    this.detectionStats = {
      totalAnalyses: 0,
      biasDetected: 0,
      teachingBiasCount: 0,
      categoryDominanceCount: 0,
      culturalBiasCount: 0
    };
    this.biasHistory = [];
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration options
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  // ========================================
  // COMPREHENSIVE BIAS PATTERN ANALYSIS
  // ========================================

  /**
   * Perform comprehensive bias pattern analysis across multiple dimensions
   * @param {Array} careers - Array of career objects
   * @param {Object} profile - Student profile
   * @param {Object} options - Analysis options
   * @returns {Object} - Comprehensive bias analysis
   */
  performComprehensiveBiasAnalysis(careers, profile, options = {}) {
    // Input validation
    if (!Array.isArray(careers)) {
      careers = [];
    }
    if (!profile || typeof profile !== 'object') {
      profile = { subjects: [] };
    }

    const analysis = {
      timestamp: new Date().toISOString(),
      profile: this.sanitizeProfile(profile),
      biasPatterns: [],
      crossCategoryAnalysis: {},
      temporalPatterns: {},
      severityAssessment: {},
      recommendations: [],
      confidence: 0,
      riskLevel: 'low'
    };

    try {
      // 1. Multi-dimensional bias detection
      const biasPatterns = this.detectMultipleBiasPatterns(careers, profile);
      analysis.biasPatterns = biasPatterns || [];

      // 2. Cross-category bias analysis
      analysis.crossCategoryAnalysis = this.performCrossCategoryAnalysis(careers, profile);

      // 3. Temporal bias pattern detection
      analysis.temporalPatterns = this.detectTemporalBiasPatterns(profile);

      // 4. Bias severity assessment
      analysis.severityAssessment = this.assessBiasSeverity(analysis.biasPatterns, careers);

      // 5. Bias trend analysis
      analysis.trendAnalysis = this.analyzeBiasTrends();

      // 6. Generate comprehensive recommendations
      analysis.recommendations = this.generateComprehensiveRecommendations(analysis);

      // 7. Calculate overall confidence and risk level
      analysis.confidence = this.calculateOverallConfidence(analysis);
      analysis.riskLevel = this.assessRiskLevel(analysis);

      // 8. Record for trend analysis
      this.recordComprehensiveAnalysis(analysis);

      if (this.config.enableLogging) {
        this.logComprehensiveAnalysis(analysis);
      }
    } catch (error) {
      if (this.config.enableLogging) {
        console.error('Error in comprehensive bias analysis:', error.message);
      }
      // Return safe default analysis
      analysis.biasPatterns = [];
      analysis.confidence = 0.1;
      analysis.riskLevel = 'unknown';
    }

    return analysis;
  }

  /**
   * Detect multiple bias patterns across different dimensions
   * @private
   */
  detectMultipleBiasPatterns(careers, profile) {
    const patterns = [];

    try {
      // 1. Teaching bias patterns
      const teachingPatterns = this.detectAdvancedTeachingBias(careers, profile);
      if (Array.isArray(teachingPatterns)) {
        patterns.push(...teachingPatterns);
      }

      // 2. Gender stereotype patterns
      const genderPatterns = this.detectGenderStereotypes(careers, profile);
      if (Array.isArray(genderPatterns)) {
        patterns.push(...genderPatterns);
      }

      // 3. Socioeconomic bias patterns
      const socioeconomicPatterns = this.detectSocioeconomicBias(careers, profile);
      if (Array.isArray(socioeconomicPatterns)) {
        patterns.push(...socioeconomicPatterns);
      }

      // 4. Geographic bias patterns
      const geographicPatterns = this.detectGeographicBias(careers, profile);
      if (Array.isArray(geographicPatterns)) {
        patterns.push(...geographicPatterns);
      }

      // 5. Academic performance bias
      const performancePatterns = this.detectPerformanceBias(careers, profile);
      if (Array.isArray(performancePatterns)) {
        patterns.push(...performancePatterns);
      }

      // 6. Subject combination bias
      const subjectPatterns = this.detectSubjectCombinationBias(careers, profile);
      if (Array.isArray(subjectPatterns)) {
        patterns.push(...subjectPatterns);
      }
    } catch (error) {
      if (this.config.enableLogging) {
        console.error('Error in detectMultipleBiasPatterns:', error.message);
      }
    }

    return patterns;
  }

  /**
   * Detect advanced teaching bias patterns
   * @private
   */
  detectAdvancedTeachingBias(careers, profile) {
    const patterns = [];
    
    // Enhanced teaching bias detection with context
    const teachingBias = this.detectTeachingBias(careers);
    
    if (teachingBias.hasBias) {
      // Analyze teaching bias context
      const context = this.analyzeTeachingBiasContext(careers, profile);
      
      patterns.push({
        type: 'advanced_teaching_bias',
        subtype: context.subtype,
        description: `Advanced teaching bias detected: ${context.description}`,
        severity: teachingBias.severity,
        confidence: context.confidence,
        evidence: {
          ...teachingBias.details,
          context: context.details,
          alternativeCareers: context.alternativeCareers
        },
        impact: context.impact,
        corrections: context.corrections
      });
    }

    // Subject-specific teaching bias
    if (this.isSTEMStudent(profile)) {
      const stemTeachingBias = this.detectSTEMTeachingBias(careers, profile);
      if (stemTeachingBias.detected) {
        patterns.push(stemTeachingBias);
      }
    }

    return patterns;
  }

  /**
   * Analyze teaching bias context for more nuanced detection
   * @private
   */
  analyzeTeachingBiasContext(careers, profile) {
    const mathSubjects = profile.subjects?.filter(s => 
      /mathematics|math|calculus|algebra|geometry/gi.test(s)
    ) || [];
    
    const scienceSubjects = profile.subjects?.filter(s => 
      /physics|chemistry|biology|life sciences|physical sciences/gi.test(s)
    ) || [];

    let subtype = 'general_teaching_bias';
    let description = 'General over-representation of teaching careers';
    let confidence = 0.6;
    let impact = 'medium';

    // Math-specific teaching bias
    if (mathSubjects.length > 0) {
      subtype = 'math_teaching_bias';
      description = 'Mathematics students disproportionately recommended teaching careers';
      confidence = 0.8;
      impact = 'high';
    }

    // Science-specific teaching bias
    if (scienceSubjects.length > 0 && mathSubjects.length === 0) {
      subtype = 'science_teaching_bias';
      description = 'Science students channeled primarily toward teaching roles';
      confidence = 0.7;
      impact = 'high';
    }

    // Combined STEM teaching bias
    if (mathSubjects.length > 0 && scienceSubjects.length > 0) {
      subtype = 'stem_teaching_bias';
      description = 'STEM students overwhelmingly directed to teaching careers';
      confidence = 0.9;
      impact = 'critical';
    }

    // Find alternative career suggestions
    const alternativeCareers = this.suggestAlternativeCareers(careers, profile, subtype);

    const corrections = [
      {
        type: 'diversify_career_recommendations',
        priority: impact === 'critical' ? 'critical' : 'high',
        action: `Reduce teaching career dominance for ${subtype.replace('_', ' ')} students`,
        alternatives: alternativeCareers.slice(0, 3)
      }
    ];

    return {
      subtype,
      description,
      confidence,
      impact,
      details: {
        mathSubjects: mathSubjects.length,
        scienceSubjects: scienceSubjects.length,
        totalSTEMSubjects: mathSubjects.length + scienceSubjects.length
      },
      alternativeCareers,
      corrections
    };
  }

  /**
   * Detect STEM-specific teaching bias
   * @private
   */
  detectSTEMTeachingBias(careers, profile) {
    // Safely handle profile and subjects
    if (!profile || !profile.subjects || !Array.isArray(profile.subjects)) {
      return { detected: false };
    }

    const stemSubjects = profile.subjects.filter(s => 
      s && /mathematics|math|physics|chemistry|information technology|computer|engineering/gi.test(s)
    );

    if (stemSubjects.length < 2) {
      return { detected: false };
    }

    // Safely handle careers array
    if (!Array.isArray(careers) || careers.length === 0) {
      return { detected: false };
    }

    const teachingCareers = careers.filter(c => 
      c && (
        /teach|education|instructor|professor|lecturer/gi.test(c.title || '') ||
        ['Education', 'Teaching', 'Academic'].includes(c.category)
      )
    );

    const stemCareers = careers.filter(c => 
      c && (
        /engineer|developer|scientist|analyst|technician|programmer|researcher/gi.test(c.title || '') ||
        ['Technology', 'Engineering', 'Science', 'Research'].includes(c.category)
      )
    );

    const teachingRatio = teachingCareers.length / careers.length;
    const stemRatio = stemCareers.length / careers.length;

    // STEM teaching bias: high teaching ratio, low STEM ratio for STEM students
    const detected = teachingRatio > 0.5 && stemRatio < 0.3;

    if (!detected) {
      return { detected: false };
    }

    return {
      type: 'stem_teaching_bias',
      detected: true,
      description: 'STEM students receiving disproportionate teaching career recommendations',
      severity: Math.min((teachingRatio - stemRatio) * 2, 1),
      confidence: 0.85,
      evidence: {
        stemSubjects: stemSubjects.length,
        teachingRatio: Math.round(teachingRatio * 100),
        stemRatio: Math.round(stemRatio * 100),
        teachingCareers: teachingCareers.length,
        stemCareers: stemCareers.length,
        expectedSTEMRatio: 60 // Expected minimum for STEM students
      },
      impact: 'critical',
      corrections: [
        {
          type: 'boost_stem_careers',
          priority: 'critical',
          action: 'Significantly increase STEM career representation',
          targetRatio: 0.6
        },
        {
          type: 'limit_teaching_careers',
          priority: 'high',
          action: 'Limit teaching careers to maximum 20% for STEM students',
          targetRatio: 0.2
        }
      ]
    };
  }

  /**
   * Detect gender stereotype patterns in career recommendations
   * @private
   */
  detectGenderStereotypes(careers, profile) {
    const patterns = [];
    
    // Note: We don't have explicit gender data, so we detect patterns that might indicate gender bias
    // This is based on subject choices and career recommendations that historically show gender bias

    // 1. Care-oriented bias (historically affecting women)
    const careOrientedCareers = careers.filter(c => 
      /nurse|teacher|social worker|counselor|therapist|caregiver|childcare/gi.test(c.title || '') ||
      ['Healthcare', 'Education', 'Social Services', 'Childcare'].includes(c.category)
    );

    if (careOrientedCareers.length / careers.length > 0.6) {
      patterns.push({
        type: 'care_oriented_bias',
        description: 'Over-representation of care-oriented careers',
        severity: (careOrientedCareers.length / careers.length - 0.4) / 0.6,
        confidence: 0.6,
        evidence: {
          careOrientedPercentage: Math.round((careOrientedCareers.length / careers.length) * 100),
          careOrientedCareers: careOrientedCareers.map(c => c.title).slice(0, 5)
        },
        impact: 'medium',
        corrections: [
          {
            type: 'diversify_beyond_care_roles',
            priority: 'medium',
            action: 'Include leadership, technology, and business careers'
          }
        ]
      });
    }

    // 2. Technical bias (historically affecting men)
    const technicalCareers = careers.filter(c => 
      /engineer|developer|programmer|technician|mechanic|architect|analyst/gi.test(c.title || '') ||
      ['Technology', 'Engineering', 'Construction', 'Manufacturing'].includes(c.category)
    );

    if (technicalCareers.length / careers.length > 0.7) {
      patterns.push({
        type: 'technical_dominance_bias',
        description: 'Over-representation of technical/engineering careers',
        severity: (technicalCareers.length / careers.length - 0.5) / 0.5,
        confidence: 0.6,
        evidence: {
          technicalPercentage: Math.round((technicalCareers.length / careers.length) * 100),
          technicalCareers: technicalCareers.map(c => c.title).slice(0, 5)
        },
        impact: 'medium',
        corrections: [
          {
            type: 'include_diverse_career_paths',
            priority: 'medium',
            action: 'Include creative, business, and service-oriented careers'
          }
        ]
      });
    }

    return patterns;
  }

  /**
   * Detect socioeconomic bias patterns
   * @private
   */
  detectSocioeconomicBias(careers, profile) {
    const patterns = [];

    // Analyze career salary/prestige distribution
    const highPrestigeCareers = careers.filter(c => 
      /doctor|lawyer|engineer|architect|executive|director|manager|consultant/gi.test(c.title || '') ||
      ['Medicine', 'Law', 'Engineering', 'Management', 'Consulting'].includes(c.category)
    );

    const serviceOrientedCareers = careers.filter(c => 
      /clerk|assistant|operator|worker|helper|aide|support/gi.test(c.title || '') ||
      ['Service', 'Support', 'Administrative', 'Retail'].includes(c.category)
    );

    // Check for socioeconomic channeling
    const prestigeRatio = highPrestigeCareers.length / careers.length;
    const serviceRatio = serviceOrientedCareers.length / careers.length;

    // Detect low-opportunity bias
    if (serviceRatio > 0.6 && prestigeRatio < 0.2) {
      patterns.push({
        type: 'low_opportunity_bias',
        description: 'Over-representation of lower-opportunity service careers',
        severity: (serviceRatio - prestigeRatio) / 2,
        confidence: 0.7,
        evidence: {
          serviceRatio: Math.round(serviceRatio * 100),
          prestigeRatio: Math.round(prestigeRatio * 100),
          serviceCareers: serviceOrientedCareers.map(c => c.title).slice(0, 3)
        },
        impact: 'high',
        corrections: [
          {
            type: 'include_advancement_opportunities',
            priority: 'high',
            action: 'Include careers with advancement potential and higher earning capacity'
          }
        ]
      });
    }

    // Detect elite bias (only high-prestige careers)
    if (prestigeRatio > 0.8) {
      patterns.push({
        type: 'elite_career_bias',
        description: 'Over-representation of elite/high-prestige careers only',
        severity: (prestigeRatio - 0.6) / 0.4,
        confidence: 0.6,
        evidence: {
          prestigeRatio: Math.round(prestigeRatio * 100),
          prestigeCareers: highPrestigeCareers.map(c => c.title).slice(0, 3)
        },
        impact: 'medium',
        corrections: [
          {
            type: 'include_accessible_careers',
            priority: 'medium',
            action: 'Include careers with various entry requirements and pathways'
          }
        ]
      });
    }

    return patterns;
  }

  /**
   * Detect geographic bias patterns
   * @private
   */
  detectGeographicBias(careers, profile) {
    const patterns = [];

    // Analyze location requirements in career recommendations
    const urbanCareers = careers.filter(c => 
      /city|urban|metropolitan|corporate|headquarters/gi.test(c.description || c.title || '')
    );

    const ruralCareers = careers.filter(c => 
      /rural|farm|agriculture|mining|forestry|remote/gi.test(c.description || c.title || '') ||
      ['Agriculture', 'Mining', 'Forestry'].includes(c.category)
    );

    const urbanRatio = urbanCareers.length / careers.length;
    const ruralRatio = ruralCareers.length / careers.length;

    // Detect urban bias
    if (urbanRatio > 0.8 && ruralRatio < 0.1) {
      patterns.push({
        type: 'urban_bias',
        description: 'Over-representation of urban-only career opportunities',
        severity: (urbanRatio - 0.6) / 0.4,
        confidence: 0.5,
        evidence: {
          urbanRatio: Math.round(urbanRatio * 100),
          ruralRatio: Math.round(ruralRatio * 100)
        },
        impact: 'medium',
        corrections: [
          {
            type: 'include_location_diverse_careers',
            priority: 'medium',
            action: 'Include careers available in various geographic locations'
          }
        ]
      });
    }

    return patterns;
  }

  /**
   * Detect academic performance bias
   * @private
   */
  detectPerformanceBias(careers, profile) {
    const patterns = [];

    // Analyze if recommendations match academic performance expectations
    const highAchievementCareers = careers.filter(c => 
      /research|scientist|doctor|engineer|analyst|consultant|professor/gi.test(c.title || '') ||
      ['Research', 'Medicine', 'Engineering', 'Academia'].includes(c.category)
    );

    const practicalCareers = careers.filter(c => 
      /technician|operator|assistant|clerk|worker|helper/gi.test(c.title || '') ||
      ['Technical', 'Support', 'Operations'].includes(c.category)
    );

    // Note: Without explicit performance data, we look for patterns that might indicate bias
    const achievementRatio = highAchievementCareers.length / careers.length;
    const practicalRatio = practicalCareers.length / careers.length;

    // Check for academic underestimation (only practical careers for STEM students)
    if (this.isSTEMStudent(profile) && practicalRatio > 0.7 && achievementRatio < 0.2) {
      patterns.push({
        type: 'academic_underestimation_bias',
        description: 'STEM students directed primarily to practical/technical roles',
        severity: (practicalRatio - achievementRatio) / 2,
        confidence: 0.7,
        evidence: {
          practicalRatio: Math.round(practicalRatio * 100),
          achievementRatio: Math.round(achievementRatio * 100),
          isSTEMStudent: true
        },
        impact: 'high',
        corrections: [
          {
            type: 'include_advanced_opportunities',
            priority: 'high',
            action: 'Include research, development, and leadership opportunities'
          }
        ]
      });
    }

    return patterns;
  }

  /**
   * Detect subject combination bias
   * @private
   */
  detectSubjectCombinationBias(careers, profile) {
    const patterns = [];

    if (!profile.subjects || profile.subjects.length < 2) {
      return patterns;
    }

    // Analyze if career recommendations properly leverage subject combinations
    const subjectCombinations = this.analyzeSubjectCombinations(profile.subjects);
    
    for (const combination of subjectCombinations) {
      const bias = this.detectCombinationBias(careers, combination);
      if (bias.detected) {
        patterns.push(bias);
      }
    }

    return patterns;
  }

  /**
   * Analyze subject combinations for bias detection
   * @private
   */
  analyzeSubjectCombinations(subjects) {
    const combinations = [];

    // Math + Science combinations
    const mathSubjects = subjects.filter(s => /mathematics|math/gi.test(s));
    const scienceSubjects = subjects.filter(s => /physics|chemistry|biology|life sciences|physical sciences/gi.test(s));
    
    if (mathSubjects.length > 0 && scienceSubjects.length > 0) {
      combinations.push({
        type: 'math_science',
        subjects: [...mathSubjects, ...scienceSubjects],
        expectedCareers: ['Engineering', 'Research', 'Technology', 'Medicine'],
        avoidBias: ['Teaching-only recommendations']
      });
    }

    // Business + Math combinations
    const businessSubjects = subjects.filter(s => /business|accounting|economics/gi.test(s));
    
    if (mathSubjects.length > 0 && businessSubjects.length > 0) {
      combinations.push({
        type: 'math_business',
        subjects: [...mathSubjects, ...businessSubjects],
        expectedCareers: ['Finance', 'Analytics', 'Consulting', 'Management'],
        avoidBias: ['Accounting-only recommendations']
      });
    }

    // Language + Other combinations
    const languageSubjects = subjects.filter(s => /english|afrikaans|language/gi.test(s));
    
    if (languageSubjects.length > 0 && subjects.length > languageSubjects.length) {
      combinations.push({
        type: 'language_plus',
        subjects: languageSubjects,
        expectedCareers: ['Communications', 'Media', 'Law', 'Business'],
        avoidBias: ['Teaching-only recommendations']
      });
    }

    return combinations;
  }

  /**
   * Detect bias in subject combination career recommendations
   * @private
   */
  detectCombinationBias(careers, combination) {
    // Check if careers properly leverage the subject combination
    const relevantCareers = careers.filter(c => 
      combination.expectedCareers.some(expected => 
        c.category === expected || 
        new RegExp(expected, 'gi').test(c.title || '')
      )
    );

    const relevantRatio = relevantCareers.length / careers.length;

    // Detect under-utilization of subject combination
    if (relevantRatio < 0.3) {
      return {
        detected: true,
        type: 'subject_combination_underutilization',
        description: `Under-utilization of ${combination.type} subject combination`,
        severity: (0.5 - relevantRatio) / 0.5,
        confidence: 0.7,
        evidence: {
          combinationType: combination.type,
          subjects: combination.subjects,
          relevantRatio: Math.round(relevantRatio * 100),
          expectedCareers: combination.expectedCareers,
          actualRelevantCareers: relevantCareers.length
        },
        impact: 'medium',
        corrections: [
          {
            type: 'leverage_subject_combinations',
            priority: 'medium',
            action: `Include more careers that leverage ${combination.type} combination`,
            targetCareers: combination.expectedCareers
          }
        ]
      };
    }

    return { detected: false };
  }

  /**
   * Perform cross-category bias analysis
   * @private
   */
  performCrossCategoryAnalysis(careers, profile) {
    const analysis = {
      categoryInteractions: {},
      crossBiasPatterns: [],
      diversityMetrics: {},
      recommendations: []
    };

    // Analyze interactions between categories
    const categories = [...new Set(careers.map(c => c.category))];
    
    for (let i = 0; i < categories.length; i++) {
      for (let j = i + 1; j < categories.length; j++) {
        const interaction = this.analyzeCategoryInteraction(
          careers, categories[i], categories[j], profile
        );
        analysis.categoryInteractions[`${categories[i]}_${categories[j]}`] = interaction;
      }
    }

    // Detect cross-category bias patterns
    analysis.crossBiasPatterns = this.detectCrossCategoryBias(careers, profile);

    // Calculate diversity metrics
    analysis.diversityMetrics = this.calculateAdvancedDiversityMetrics(careers);

    return analysis;
  }

  /**
   * Detect temporal bias patterns
   * @private
   */
  detectTemporalBiasPatterns(profile) {
    if (this.biasHistory.length < 5) {
      return { insufficient_data: true };
    }

    const recentPatterns = this.biasHistory.slice(-10);
    const patterns = {
      trendingBiases: [],
      emergingPatterns: [],
      persistentBiases: [],
      improvingAreas: []
    };

    // Analyze trending biases
    const biasTypeCounts = {};
    recentPatterns.forEach(pattern => {
      pattern.patterns.forEach(p => {
        biasTypeCounts[p.type] = (biasTypeCounts[p.type] || 0) + 1;
      });
    });

    // Identify trending biases (appearing in >50% of recent patterns)
    Object.entries(biasTypeCounts).forEach(([type, count]) => {
      if (count / recentPatterns.length > 0.5) {
        patterns.trendingBiases.push({
          type,
          frequency: count,
          percentage: Math.round((count / recentPatterns.length) * 100)
        });
      }
    });

    return patterns;
  }

  /**
   * Assess overall bias severity
   * @private
   */
  assessBiasSeverity(biasPatterns, careers) {
    const assessment = {
      overallSeverity: 0,
      criticalPatterns: 0,
      highSeverityPatterns: 0,
      mediumSeverityPatterns: 0,
      lowSeverityPatterns: 0,
      severityDistribution: {},
      riskFactors: []
    };

    biasPatterns.forEach(pattern => {
      const severity = pattern.severity || 0;
      assessment.overallSeverity += severity;

      if (severity > 0.8) {
        assessment.criticalPatterns++;
      } else if (severity > 0.6) {
        assessment.highSeverityPatterns++;
      } else if (severity > 0.4) {
        assessment.mediumSeverityPatterns++;
      } else {
        assessment.lowSeverityPatterns++;
      }

      // Track severity by pattern type
      assessment.severityDistribution[pattern.type] = severity;

      // Identify risk factors
      if (severity > 0.7) {
        assessment.riskFactors.push({
          type: pattern.type,
          severity,
          impact: pattern.impact || 'unknown'
        });
      }
    });

    // Calculate average severity
    if (biasPatterns.length > 0) {
      assessment.overallSeverity /= biasPatterns.length;
    }

    return assessment;
  }

  /**
   * Analyze bias trends over time
   * @private
   */
  analyzeBiasTrends() {
    if (this.biasHistory.length < 3) {
      return { insufficient_data: true };
    }

    const trends = {
      biasFrequencyTrend: 'stable',
      severityTrend: 'stable',
      patternEvolution: {},
      recommendations: []
    };

    // Analyze frequency trends
    const recentFrequency = this.biasHistory.slice(-5).reduce((sum, h) => sum + h.patterns.length, 0) / 5;
    const olderFrequency = this.biasHistory.slice(-10, -5).reduce((sum, h) => sum + h.patterns.length, 0) / 5;

    if (recentFrequency > olderFrequency * 1.2) {
      trends.biasFrequencyTrend = 'increasing';
      trends.recommendations.push('Investigate causes of increasing bias detection');
    } else if (recentFrequency < olderFrequency * 0.8) {
      trends.biasFrequencyTrend = 'decreasing';
      trends.recommendations.push('Continue current bias mitigation strategies');
    }

    return trends;
  }

  /**
   * Generate comprehensive recommendations based on analysis
   * @private
   */
  generateComprehensiveRecommendations(analysis) {
    const recommendations = [];

    // High-priority recommendations based on critical patterns
    analysis.biasPatterns.forEach(pattern => {
      if (pattern.severity > 0.7) {
        recommendations.push({
          priority: 'critical',
          type: 'bias_mitigation',
          pattern: pattern.type,
          action: `Immediate intervention required for ${pattern.type}`,
          details: pattern.corrections || []
        });
      }
    });

    // System-level recommendations
    if (analysis.severityAssessment.criticalPatterns > 0) {
      recommendations.push({
        priority: 'high',
        type: 'system_review',
        action: 'Conduct comprehensive system bias audit',
        details: ['Review training data', 'Validate algorithms', 'Update bias detection thresholds']
      });
    }

    // Monitoring recommendations
    if (analysis.temporalPatterns.trendingBiases?.length > 0) {
      recommendations.push({
        priority: 'medium',
        type: 'enhanced_monitoring',
        action: 'Implement enhanced monitoring for trending bias patterns',
        details: analysis.temporalPatterns.trendingBiases.map(b => b.type)
      });
    }

    return recommendations;
  }

  /**
   * Calculate overall confidence in bias analysis
   * @private
   */
  calculateOverallConfidence(analysis) {
    let confidence = 0;
    let factors = 0;

    // Factor in pattern confidence
    if (analysis.biasPatterns.length > 0) {
      const avgPatternConfidence = analysis.biasPatterns.reduce((sum, p) => sum + (p.confidence || 0.5), 0) / analysis.biasPatterns.length;
      confidence += avgPatternConfidence * 0.4;
      factors += 0.4;
    }

    // Factor in data sufficiency
    if (this.biasHistory.length > 10) {
      confidence += 0.3;
      factors += 0.3;
    } else if (this.biasHistory.length > 5) {
      confidence += 0.2;
      factors += 0.3;
    } else {
      factors += 0.3;
    }

    // Factor in analysis completeness
    const analysisCompleteness = Object.keys(analysis).length / 8; // Expected 8 main components
    confidence += analysisCompleteness * 0.3;
    factors += 0.3;

    return factors > 0 ? Math.min(confidence / factors, 1) : 0.5;
  }

  /**
   * Assess overall risk level
   * @private
   */
  assessRiskLevel(analysis) {
    try {
      const { severityAssessment } = analysis;

      if (!severityAssessment || typeof severityAssessment !== 'object') {
        return 'low';
      }

      if (severityAssessment.criticalPatterns > 0) {
        return 'critical';
      } else if (severityAssessment.highSeverityPatterns > 2) {
        return 'high';
      } else if (severityAssessment.mediumSeverityPatterns > 3) {
        return 'medium';
      } else {
        return 'low';
      }
    } catch (error) {
      if (this.config.enableLogging) {
        console.error('Error in assessRiskLevel:', error.message);
      }
      return 'low';
    }
  }

  /**
   * Record comprehensive analysis for trend tracking
   * @private
   */
  recordComprehensiveAnalysis(analysis) {
    // Store simplified version for trend analysis
    const record = {
      timestamp: analysis.timestamp,
      patternCount: analysis.biasPatterns.length,
      overallSeverity: analysis.severityAssessment.overallSeverity,
      riskLevel: analysis.riskLevel,
      confidence: analysis.confidence,
      patternTypes: analysis.biasPatterns.map(p => p.type)
    };

    this.biasHistory.push(record);

    // Maintain history limit
    if (this.biasHistory.length > 100) {
      this.biasHistory = this.biasHistory.slice(-100);
    }
  }

  /**
   * Log comprehensive analysis results
   * @private
   */
  logComprehensiveAnalysis(analysis) {
    console.log('\n🔍 COMPREHENSIVE BIAS ANALYSIS RESULTS');
    console.log('=' .repeat(50));
    console.log(`📊 Risk Level: ${analysis.riskLevel.toUpperCase()}`);
    console.log(`🎯 Confidence: ${Math.round(analysis.confidence * 100)}%`);
    console.log(`🚨 Patterns Detected: ${analysis.biasPatterns.length}`);
    
    if (analysis.biasPatterns.length > 0) {
      console.log('\n📋 Detected Patterns:');
      analysis.biasPatterns.forEach((pattern, index) => {
        console.log(`   ${index + 1}. ${pattern.type}: ${Math.round(pattern.severity * 100)}% severity`);
      });
    }

    if (analysis.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      analysis.recommendations.slice(0, 3).forEach((rec, index) => {
        console.log(`   ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.action}`);
      });
    }
  }

  /**
   * Suggest alternative careers based on bias type
   * @private
   */
  suggestAlternativeCareers(careers, profile, biasType) {
    const alternatives = [];

    if (biasType.includes('teaching')) {
      alternatives.push(
        'Data Scientist', 'Software Engineer', 'Financial Analyst',
        'Research Scientist', 'Business Analyst', 'Actuary'
      );
    }

    if (biasType.includes('stem')) {
      alternatives.push(
        'Product Manager', 'Consultant', 'Entrepreneur',
        'Investment Analyst', 'Operations Research Analyst'
      );
    }

    return alternatives;
  }

  /**
   * Sanitize profile for logging (remove sensitive data)
   * @private
   */
  sanitizeProfile(profile) {
    if (!profile || typeof profile !== 'object') {
      return {
        grade: null,
        subjectCount: 0,
        hasSTEMSubjects: false
      };
    }

    return {
      grade: profile.grade || null,
      subjectCount: profile.subjects?.length || 0,
      hasSTEMSubjects: this.isSTEMStudent(profile),
      // Don't log actual subjects for privacy
    };
  }

  /**
   * Analyze interaction between two categories
   * @private
   */
  analyzeCategoryInteraction(careers, category1, category2, profile) {
    const cat1Careers = careers.filter(c => c.category === category1);
    const cat2Careers = careers.filter(c => c.category === category2);
    
    const interaction = {
      categories: [category1, category2],
      counts: [cat1Careers.length, cat2Careers.length],
      avgSimilarities: [
        cat1Careers.reduce((sum, c) => sum + (c.similarity || 0), 0) / (cat1Careers.length || 1),
        cat2Careers.reduce((sum, c) => sum + (c.similarity || 0), 0) / (cat2Careers.length || 1)
      ],
      balance: Math.abs(cat1Careers.length - cat2Careers.length) / careers.length,
      qualityGap: 0
    };

    interaction.qualityGap = Math.abs(interaction.avgSimilarities[0] - interaction.avgSimilarities[1]);
    
    return interaction;
  }

  /**
   * Detect cross-category bias patterns
   * @private
   */
  detectCrossCategoryBias(careers, profile) {
    const patterns = [];
    
    // Simple cross-category analysis
    const categories = [...new Set(careers.map(c => c.category))];
    
    if (categories.length < 2) {
      return patterns;
    }

    // Check for extreme imbalances between categories
    const categoryDistribution = this.analyzeCategoryDistribution(careers);
    
    if (categoryDistribution.hasDominance) {
      patterns.push({
        type: 'cross_category_imbalance',
        description: `Extreme imbalance between categories`,
        severity: (categoryDistribution.dominancePercentage - 60) / 40,
        evidence: categoryDistribution
      });
    }

    return patterns;
  }

  /**
   * Calculate advanced diversity metrics
   * @private
   */
  calculateAdvancedDiversityMetrics(careers) {
    const metrics = {
      shannonDiversity: 0,
      simpsonDiversity: 0,
      evenness: 0,
      richness: 0
    };

    if (careers.length === 0) {
      return metrics;
    }

    // Count categories
    const categoryCount = {};
    careers.forEach(career => {
      const category = career.category || 'Uncategorized';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const categories = Object.keys(categoryCount);
    metrics.richness = categories.length;

    // Calculate Shannon diversity index
    let shannonSum = 0;
    let simpsonSum = 0;
    
    categories.forEach(category => {
      const proportion = categoryCount[category] / careers.length;
      if (proportion > 0) {
        shannonSum += proportion * Math.log(proportion);
        simpsonSum += proportion * proportion;
      }
    });

    metrics.shannonDiversity = -shannonSum;
    metrics.simpsonDiversity = 1 - simpsonSum;
    
    // Calculate evenness (Shannon diversity / max possible diversity)
    const maxDiversity = Math.log(categories.length);
    metrics.evenness = maxDiversity > 0 ? metrics.shannonDiversity / maxDiversity : 0;

    return metrics;
  }
}

export default BiasDetector;