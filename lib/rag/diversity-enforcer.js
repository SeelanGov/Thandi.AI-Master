// lib/rag/diversity-enforcer.js
// Advanced Diversity Enforcement System for Career Recommendations
// Implements sophisticated algorithms for maintaining career diversity while preserving quality

/**
 * DiversityEnforcer - Advanced diversity enforcement with configurable parameters
 * 
 * Features:
 * - Configurable diversity thresholds and requirements
 * - Quality-preserving diversity correction algorithms
 * - Category balance optimization
 * - Minimum category representation guarantees
 * - Runtime parameter updates with validation
 */
export class DiversityEnforcer {
  constructor(options = {}) {
    this.config = {
      // Diversity thresholds
      maxCategoryDominance: options.maxCategoryDominance || 0.6,
      minCategoryRepresentation: options.minCategoryRepresentation || 0.15,
      targetCategoryCount: options.targetCategoryCount || 3,
      maxCategoriesPerRecommendation: options.maxCategoriesPerRecommendation || 5,
      
      // Quality preservation
      minQualityThreshold: options.minQualityThreshold || 0.5,
      qualityPreservationWeight: options.qualityPreservationWeight || 0.7,
      diversityWeight: options.diversityWeight || 0.3,
      
      // Enforcement parameters
      enableStrictEnforcement: options.enableStrictEnforcement !== false,
      enableQualityPreservation: options.enableQualityPreservation !== false,
      enableLogging: options.enableLogging !== false,
      
      // Advanced features
      enableAdaptiveThresholds: options.enableAdaptiveThresholds || false,
      enableCategoryPrioritization: options.enableCategoryPrioritization || true,
      
      ...options
    };
    
    // Validation and safety checks
    this.validateConfiguration();
    
    // Statistics tracking
    this.stats = {
      totalEnforcements: 0,
      diversityCorrections: 0,
      qualityPreservations: 0,
      categoryBalanceAdjustments: 0,
      averageDiversityImprovement: 0
    };
  }

  /**
   * Enforce diversity across career recommendations with quality preservation
   * @param {Array} careers - Array of career objects with similarity scores
   * @param {Object} options - Enforcement options
   * @returns {Array} - Diversity-enforced career recommendations
   */
  enforceDiversity(careers, options = {}) {
    if (!Array.isArray(careers) || careers.length === 0) {
      return careers;
    }

    const config = { ...this.config, ...options };
    const originalCareers = [...careers];
    
    try {
      // Step 1: Analyze current diversity state
      const diversityAnalysis = this.analyzeDiversityState(careers);
      
      if (config.enableLogging) {
        console.log(`🌈 DIVERSITY ENFORCEMENT: Analyzing ${careers.length} careers`);
        console.log(`   📊 Current diversity: ${diversityAnalysis.diversityScore}%`);
        console.log(`   🎯 Categories: ${diversityAnalysis.categoryCount} (target: ${config.targetCategoryCount})`);
      }
      
      // Step 2: Check if enforcement is needed
      if (!this.needsDiversityEnforcement(diversityAnalysis, config)) {
        if (config.enableLogging) {
          console.log(`   ✅ Diversity requirements already met`);
        }
        return careers;
      }
      
      // Step 3: Apply diversity enforcement algorithms
      let enforcedCareers = careers;
      
      // Algorithm 1: Category dominance reduction
      if (diversityAnalysis.hasDominance) {
        enforcedCareers = this.reduceCategoryDominance(enforcedCareers, diversityAnalysis, config);
      }
      
      // Algorithm 2: Category representation balancing
      enforcedCareers = this.balanceCategoryRepresentation(enforcedCareers, config);
      
      // Algorithm 3: Quality-aware diversity optimization
      if (config.enableQualityPreservation) {
        enforcedCareers = this.optimizeQualityDiversityBalance(enforcedCareers, originalCareers, config);
      }
      
      // Step 4: Validate and finalize results
      const finalAnalysis = this.analyzeDiversityState(enforcedCareers);
      this.updateStatistics(diversityAnalysis, finalAnalysis);
      
      if (config.enableLogging) {
        console.log(`   🎉 Enforcement complete: ${finalAnalysis.diversityScore}% diversity`);
        console.log(`   📈 Improvement: +${Math.round(finalAnalysis.diversityScore - diversityAnalysis.diversityScore)}%`);
      }
      
      return enforcedCareers;
      
    } catch (error) {
      if (config.enableLogging) {
        console.error(`❌ Diversity enforcement failed: ${error.message}`);
      }
      return originalCareers; // Return original careers on error
    }
  }
  /**
   * Analyze the current diversity state of career recommendations
   * @param {Array} careers - Array of career objects
   * @returns {Object} - Diversity analysis results
   */
  analyzeDiversityState(careers) {
    if (!Array.isArray(careers) || careers.length === 0) {
      return {
        diversityScore: 0,
        categoryCount: 0,
        categoryDistribution: {},
        hasDominance: false,
        dominantCategory: null,
        dominancePercentage: 0,
        underrepresentedCategories: [],
        qualityDistribution: {}
      };
    }

    // Count careers by category
    const categoryCount = {};
    const categoryQuality = {};
    
    careers.forEach(career => {
      const category = career.category || 'Uncategorized';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
      
      if (!categoryQuality[category]) {
        categoryQuality[category] = [];
      }
      categoryQuality[category].push(career.similarity || 0);
    });

    // Calculate category statistics
    const categories = Object.keys(categoryCount);
    const totalCareers = careers.length;
    
    // Find dominant category
    const sortedCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a);
    
    const dominantCategory = sortedCategories[0]?.[0] || null;
    const dominantCount = sortedCategories[0]?.[1] || 0;
    const dominancePercentage = dominantCount / totalCareers;
    
    // Calculate diversity score using Shannon diversity index
    let shannonDiversity = 0;
    categories.forEach(category => {
      const proportion = categoryCount[category] / totalCareers;
      if (proportion > 0) {
        shannonDiversity += proportion * Math.log(proportion);
      }
    });
    shannonDiversity = -shannonDiversity;
    
    // Normalize to percentage (0-100)
    const maxDiversity = Math.log(Math.min(categories.length, 5)); // Cap at 5 categories
    const diversityScore = maxDiversity > 0 ? (shannonDiversity / maxDiversity) * 100 : 0;
    
    // Identify underrepresented categories
    const minRepresentation = this.config.minCategoryRepresentation;
    const underrepresentedCategories = categories.filter(category => 
      (categoryCount[category] / totalCareers) < minRepresentation
    );
    
    // Calculate quality distribution
    const qualityDistribution = {};
    Object.entries(categoryQuality).forEach(([category, qualities]) => {
      const avgQuality = qualities.reduce((sum, q) => sum + q, 0) / qualities.length;
      qualityDistribution[category] = {
        averageQuality: Math.round(avgQuality * 100) / 100,
        count: qualities.length,
        qualityRange: {
          min: Math.min(...qualities),
          max: Math.max(...qualities)
        }
      };
    });

    return {
      diversityScore: Math.round(diversityScore),
      categoryCount: categories.length,
      categoryDistribution: Object.fromEntries(
        Object.entries(categoryCount).map(([cat, count]) => [
          cat, 
          { 
            count, 
            percentage: Math.round((count / totalCareers) * 100) 
          }
        ])
      ),
      hasDominance: dominancePercentage > this.config.maxCategoryDominance,
      dominantCategory,
      dominancePercentage: Math.round(dominancePercentage * 100),
      underrepresentedCategories,
      qualityDistribution
    };
  }

  /**
   * Check if diversity enforcement is needed
   * @param {Object} analysis - Diversity analysis results
   * @param {Object} config - Configuration options
   * @returns {boolean} - Whether enforcement is needed
   */
  needsDiversityEnforcement(analysis, config) {
    // Check category dominance
    if (analysis.hasDominance) {
      return true;
    }
    
    // Check minimum category count
    if (analysis.categoryCount < config.targetCategoryCount) {
      return true;
    }
    
    // Check underrepresented categories
    if (analysis.underrepresentedCategories.length > 0) {
      return true;
    }
    
    // Check overall diversity score
    const minDiversityScore = 60; // Minimum acceptable diversity
    if (analysis.diversityScore < minDiversityScore) {
      return true;
    }
    
    return false;
  }

  /**
   * Reduce category dominance by limiting over-represented categories
   * @param {Array} careers - Career recommendations
   * @param {Object} analysis - Current diversity analysis
   * @param {Object} config - Configuration options
   * @returns {Array} - Careers with reduced dominance
   */
  reduceCategoryDominance(careers, analysis, config) {
    if (!analysis.hasDominance) {
      return careers;
    }

    const dominantCategory = analysis.dominantCategory;
    const maxAllowed = Math.floor(careers.length * config.maxCategoryDominance);
    
    // Separate dominant and non-dominant careers
    const dominantCareers = careers.filter(c => (c.category || 'Uncategorized') === dominantCategory);
    const otherCareers = careers.filter(c => (c.category || 'Uncategorized') !== dominantCategory);
    
    // Sort dominant careers by quality (similarity score)
    const sortedDominantCareers = dominantCareers.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
    
    // Keep only the top careers from dominant category
    const keptDominantCareers = sortedDominantCareers.slice(0, maxAllowed);
    
    if (config.enableLogging) {
      console.log(`   🎯 Reducing ${dominantCategory} dominance: ${dominantCareers.length} → ${keptDominantCareers.length}`);
    }
    
    // Combine with other careers and maintain original order preference
    const result = [...keptDominantCareers, ...otherCareers]
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
      .slice(0, careers.length);
    
    this.stats.categoryBalanceAdjustments++;
    return result;
  }

  /**
   * Balance category representation to meet minimum requirements
   * @param {Array} careers - Career recommendations
   * @param {Object} config - Configuration options
   * @returns {Array} - Careers with balanced representation
   */
  balanceCategoryRepresentation(careers, config) {
    const analysis = this.analyzeDiversityState(careers);
    
    if (analysis.underrepresentedCategories.length === 0) {
      return careers;
    }

    // Group careers by category
    const careersByCategory = {};
    careers.forEach(career => {
      const category = career.category || 'Uncategorized';
      if (!careersByCategory[category]) {
        careersByCategory[category] = [];
      }
      careersByCategory[category].push(career);
    });

    // Calculate target representation for each category
    const targetCount = Math.max(
      Math.ceil(careers.length * config.minCategoryRepresentation),
      1
    );

    const balancedCareers = [];
    const categories = Object.keys(careersByCategory);
    
    // First pass: ensure minimum representation
    categories.forEach(category => {
      const categoryCareers = careersByCategory[category];
      const currentCount = categoryCareers.length;
      
      if (currentCount < targetCount) {
        // Add all careers from underrepresented category
        balancedCareers.push(...categoryCareers);
      } else {
        // Add top careers up to reasonable limit
        const sortedCareers = categoryCareers.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
        const maxFromCategory = Math.min(
          Math.floor(careers.length * config.maxCategoryDominance),
          currentCount
        );
        balancedCareers.push(...sortedCareers.slice(0, maxFromCategory));
      }
    });

    // Sort by quality and limit to original length
    const result = balancedCareers
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
      .slice(0, careers.length);

    if (config.enableLogging && result.length !== careers.length) {
      console.log(`   ⚖️ Balanced representation: ${categories.length} categories`);
    }

    return result;
  }
  /**
   * Optimize the balance between quality and diversity
   * @param {Array} enforcedCareers - Careers after diversity enforcement
   * @param {Array} originalCareers - Original career recommendations
   * @param {Object} config - Configuration options
   * @returns {Array} - Quality-diversity optimized careers
   */
  optimizeQualityDiversityBalance(enforcedCareers, originalCareers, config) {
    // Calculate quality metrics
    const originalAvgQuality = this.calculateAverageQuality(originalCareers);
    const enforcedAvgQuality = this.calculateAverageQuality(enforcedCareers);
    
    // If quality degradation is too severe, adjust the balance
    const qualityLoss = originalAvgQuality - enforcedAvgQuality;
    const maxAcceptableQualityLoss = 0.1; // 10% quality loss threshold
    
    if (qualityLoss > maxAcceptableQualityLoss) {
      if (config.enableLogging) {
        console.log(`   ⚠️ Quality loss detected: ${Math.round(qualityLoss * 100)}%`);
      }
      
      // Hybrid approach: blend original and enforced recommendations
      const qualityWeight = config.qualityPreservationWeight;
      const diversityWeight = config.diversityWeight;
      
      const hybridCareers = this.createHybridRecommendations(
        originalCareers, 
        enforcedCareers, 
        qualityWeight, 
        diversityWeight
      );
      
      this.stats.qualityPreservations++;
      return hybridCareers;
    }
    
    return enforcedCareers;
  }

  /**
   * Create hybrid recommendations balancing quality and diversity
   * @param {Array} originalCareers - Original recommendations
   * @param {Array} enforcedCareers - Diversity-enforced recommendations
   * @param {number} qualityWeight - Weight for quality preservation (0-1)
   * @param {number} diversityWeight - Weight for diversity (0-1)
   * @returns {Array} - Hybrid recommendations
   */
  createHybridRecommendations(originalCareers, enforcedCareers, qualityWeight, diversityWeight) {
    const hybridScores = new Map();
    
    // Score original careers (quality-focused)
    originalCareers.forEach((career, index) => {
      const qualityScore = career.similarity || 0;
      const positionBonus = (originalCareers.length - index) / originalCareers.length * 0.1;
      const totalScore = (qualityScore + positionBonus) * qualityWeight;
      
      const key = this.getCareerKey(career);
      hybridScores.set(key, {
        career,
        score: totalScore,
        source: 'quality'
      });
    });

    // Score enforced careers (diversity-focused)
    enforcedCareers.forEach((career, index) => {
      const diversityScore = this.calculateDiversityContribution(career, enforcedCareers);
      const positionBonus = (enforcedCareers.length - index) / enforcedCareers.length * 0.1;
      const totalScore = (diversityScore + positionBonus) * diversityWeight;
      
      const key = this.getCareerKey(career);
      const existing = hybridScores.get(key);
      
      if (existing) {
        // Combine scores for careers in both lists
        existing.score += totalScore;
        existing.source = 'hybrid';
      } else {
        hybridScores.set(key, {
          career,
          score: totalScore,
          source: 'diversity'
        });
      }
    });

    // Sort by hybrid score and return top careers
    const sortedCareers = Array.from(hybridScores.values())
      .sort((a, b) => b.score - a.score)
      .map(item => item.career)
      .slice(0, Math.min(originalCareers.length, enforcedCareers.length));

    return sortedCareers;
  }

  /**
   * Calculate diversity contribution of a career within a set
   * @param {Object} career - Career object
   * @param {Array} careers - All careers in the set
   * @returns {number} - Diversity contribution score (0-1)
   */
  calculateDiversityContribution(career, careers) {
    const category = career.category || 'Uncategorized';
    const categoryCount = careers.filter(c => (c.category || 'Uncategorized') === category).length;
    const totalCareers = careers.length;
    
    // Higher score for careers from less represented categories
    const categoryRarity = 1 - (categoryCount / totalCareers);
    
    // Base quality score
    const qualityScore = career.similarity || 0;
    
    // Combine rarity and quality
    return (categoryRarity * 0.6) + (qualityScore * 0.4);
  }

  /**
   * Generate a unique key for a career object
   * @param {Object} career - Career object
   * @returns {string} - Unique career key
   */
  getCareerKey(career) {
    return `${career.title || 'untitled'}_${career.category || 'uncategorized'}`;
  }

  /**
   * Calculate average quality (similarity) of careers
   * @param {Array} careers - Career objects
   * @returns {number} - Average quality score
   */
  calculateAverageQuality(careers) {
    if (!Array.isArray(careers) || careers.length === 0) {
      return 0;
    }
    
    const totalQuality = careers.reduce((sum, career) => sum + (career.similarity || 0), 0);
    return totalQuality / careers.length;
  }

  /**
   * Update enforcement statistics
   * @param {Object} beforeAnalysis - Analysis before enforcement
   * @param {Object} afterAnalysis - Analysis after enforcement
   */
  updateStatistics(beforeAnalysis, afterAnalysis) {
    this.stats.totalEnforcements++;
    
    if (afterAnalysis.diversityScore > beforeAnalysis.diversityScore) {
      this.stats.diversityCorrections++;
      const improvement = afterAnalysis.diversityScore - beforeAnalysis.diversityScore;
      this.stats.averageDiversityImprovement = 
        ((this.stats.averageDiversityImprovement * (this.stats.diversityCorrections - 1)) + improvement) / 
        this.stats.diversityCorrections;
    }
  }

  /**
   * Update configuration with validation
   * @param {Object} newConfig - New configuration parameters
   * @returns {boolean} - Whether update was successful
   */
  updateConfiguration(newConfig) {
    try {
      const updatedConfig = { ...this.config, ...newConfig };
      
      // Validate new configuration
      if (!this.isValidConfiguration(updatedConfig)) {
        throw new Error('Invalid configuration parameters');
      }
      
      this.config = updatedConfig;
      
      if (this.config.enableLogging) {
        console.log('🔧 DiversityEnforcer configuration updated');
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
    // Check required numeric parameters
    const numericParams = [
      'maxCategoryDominance', 'minCategoryRepresentation', 'targetCategoryCount',
      'minQualityThreshold', 'qualityPreservationWeight', 'diversityWeight'
    ];
    
    for (const param of numericParams) {
      if (typeof config[param] !== 'number' || config[param] < 0 || config[param] > 1) {
        if (param === 'targetCategoryCount' && config[param] > 1) continue; // Exception for target count
        return false;
      }
    }
    
    // Check weight sum
    if (config.qualityPreservationWeight + config.diversityWeight !== 1) {
      return false;
    }
    
    // Check logical constraints
    if (config.maxCategoryDominance <= config.minCategoryRepresentation) {
      return false;
    }
    
    return true;
  }

  /**
   * Validate configuration on initialization
   */
  validateConfiguration() {
    if (!this.isValidConfiguration(this.config)) {
      throw new Error('Invalid DiversityEnforcer configuration');
    }
  }

  /**
   * Get enforcement statistics
   * @returns {Object} - Current statistics
   */
  getStatistics() {
    return {
      ...this.stats,
      averageDiversityImprovement: Math.round(this.stats.averageDiversityImprovement * 100) / 100,
      successRate: this.stats.totalEnforcements > 0 ? 
        Math.round((this.stats.diversityCorrections / this.stats.totalEnforcements) * 100) : 0
    };
  }

  /**
   * Reset statistics
   */
  resetStatistics() {
    this.stats = {
      totalEnforcements: 0,
      diversityCorrections: 0,
      qualityPreservations: 0,
      categoryBalanceAdjustments: 0,
      averageDiversityImprovement: 0
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

export default DiversityEnforcer;