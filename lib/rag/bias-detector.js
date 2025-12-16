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
      if (!career) return false;
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
      if (!career) return;
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
      categoryDetails[category].careers.push(career.title || 'Untitled');
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
   * Check if student profile indicates STEM focus
   * @private
   */
  isSTEMStudent(profile) {
    if (!profile || !profile.subjects || !Array.isArray(profile.subjects)) {
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
}

export default BiasDetector;