// lib/rag/feature-flags.js
// Task 10.1: Feature Flags System for Enhanced RAG Filtering
// Enables gradual rollout and safe deployment of enhanced features

/**
 * Feature Flags Configuration for Enhanced RAG Filtering System
 * 
 * This system allows for gradual rollout and quick rollback of enhanced features
 * without requiring code deployments. Flags can be controlled via environment
 * variables or configuration files.
 */

// Default feature flag configuration
const DEFAULT_FLAGS = {
  // Core enhanced RAG filtering features
  enhanced_rag_filtering: {
    enabled: true, // Enable for student testing
    description: 'Enable enhanced metadata filtering with multiple identification methods',
    rolloutPercentage: 100,
    dependencies: [],
    safeguards: {
      maxResponseTime: 5000,
      minCareerCount: 3,
      maxCareerCount: 5
    }
  },
  
  // Intelligent fallback system
  fallback_careers: {
    enabled: false,
    description: 'Enable intelligent fallback career selection when insufficient matches found',
    rolloutPercentage: 0,
    dependencies: ['enhanced_rag_filtering'],
    safeguards: {
      maxFallbackPercentage: 40,
      minConfidenceLevel: 0.4
    }
  },
  
  // Performance monitoring and optimization
  performance_monitoring: {
    enabled: false,
    description: 'Enable detailed performance monitoring and analytics collection',
    rolloutPercentage: 0,
    dependencies: [],
    safeguards: {
      maxMonitoringOverhead: 100, // milliseconds
      maxMemoryUsage: 50 // MB
    }
  },
  
  // Subject-category prioritization
  subject_category_prioritization: {
    enabled: false,
    description: 'Enable subject-based career category prioritization',
    rolloutPercentage: 0,
    dependencies: ['enhanced_rag_filtering'],
    safeguards: {
      minCategoryDiversity: 2,
      maxPrioritizationTime: 500 // milliseconds
    }
  },
  
  // Profile complexity analysis
  profile_complexity_analysis: {
    enabled: false,
    description: 'Enable dynamic career count based on profile complexity',
    rolloutPercentage: 0,
    dependencies: ['enhanced_rag_filtering'],
    safeguards: {
      minComplexityScore: 0,
      maxComplexityScore: 10
    }
  },
  
  // Enhanced error handling
  enhanced_error_handling: {
    enabled: false,
    description: 'Enable comprehensive error handling and graceful degradation',
    rolloutPercentage: 0,
    dependencies: [],
    safeguards: {
      maxRetryAttempts: 3,
      maxErrorRecoveryTime: 2000 // milliseconds
    }
  },
  
  // Safety validation enhancements
  enhanced_safety_validation: {
    enabled: false,
    description: 'Enable enhanced safety validation and content filtering',
    rolloutPercentage: 0,
    dependencies: [],
    safeguards: {
      maxValidationTime: 200, // milliseconds
      minValidationScore: 0.8
    }
  },
  
  // Bias mitigation system
  bias_mitigation: {
    enabled: true, // Enable for student testing
    description: 'Enable comprehensive bias detection and correction for career recommendations',
    rolloutPercentage: 100, // Full rollout for testing
    dependencies: ['enhanced_rag_filtering'],
    safeguards: {
      maxBiasCorrectTime: 1000, // milliseconds
      minDiversityScore: 30,
      maxQualityLoss: 0.15 // 15% max quality loss
    }
  }
};

// Environment-based configuration override
const ENV_FLAG_PREFIX = 'RAG_FEATURE_';

/**
 * Feature Flag Manager Class
 */
export class FeatureFlagManager {
  constructor(customFlags = {}) {
    this.flags = { ...DEFAULT_FLAGS, ...customFlags };
    this.loadEnvironmentFlags();
    this.rolloutCache = new Map();
    this.metricsCollector = null;
  }

  /**
   * Load feature flags from environment variables
   * Format: RAG_FEATURE_<FLAG_NAME>=true|false|percentage
   */
  loadEnvironmentFlags() {
    Object.keys(this.flags).forEach(flagName => {
      const envKey = `${ENV_FLAG_PREFIX}${flagName.toUpperCase()}`;
      const envValue = process.env[envKey];
      
      if (envValue !== undefined) {
        if (envValue === 'true' || envValue === 'false') {
          this.flags[flagName].enabled = envValue === 'true';
          this.flags[flagName].rolloutPercentage = envValue === 'true' ? 100 : 0;
        } else {
          // Assume it's a percentage
          const percentage = parseInt(envValue, 10);
          if (!isNaN(percentage) && percentage >= 0 && percentage <= 100) {
            this.flags[flagName].enabled = percentage > 0;
            this.flags[flagName].rolloutPercentage = percentage;
          }
        }
        
        console.log(`🚩 Feature flag ${flagName} set from environment: ${envValue}`);
      }
    });
  }

  /**
   * Check if a feature flag is enabled for a given context
   * @param {string} flagName - Name of the feature flag
   * @param {Object} context - Context for rollout decision (user ID, session, etc.)
   * @returns {boolean} - Whether the feature is enabled
   */
  isEnabled(flagName, context = {}) {
    const flag = this.flags[flagName];
    
    if (!flag) {
      console.warn(`⚠️ Unknown feature flag: ${flagName}`);
      return false;
    }

    // Check if flag is globally disabled
    if (!flag.enabled) {
      return false;
    }

    // Check dependencies
    if (flag.dependencies && flag.dependencies.length > 0) {
      for (const dependency of flag.dependencies) {
        if (!this.isEnabled(dependency, context)) {
          console.log(`🔗 Feature ${flagName} disabled due to dependency ${dependency}`);
          return false;
        }
      }
    }

    // Check rollout percentage
    if (flag.rolloutPercentage < 100) {
      const rolloutKey = this.getRolloutKey(flagName, context);
      
      if (this.rolloutCache.has(rolloutKey)) {
        return this.rolloutCache.get(rolloutKey);
      }
      
      const hash = this.hashString(rolloutKey);
      const rolloutValue = hash % 100;
      const isInRollout = rolloutValue < flag.rolloutPercentage;
      
      // Cache the decision for consistency
      this.rolloutCache.set(rolloutKey, isInRollout);
      
      return isInRollout;
    }

    return true;
  }

  /**
   * Get feature flag configuration
   * @param {string} flagName - Name of the feature flag
   * @returns {Object|null} - Flag configuration or null if not found
   */
  getFlag(flagName) {
    return this.flags[flagName] || null;
  }

  /**
   * Get all feature flags status
   * @param {Object} context - Context for rollout decisions
   * @returns {Object} - All flags with their enabled status
   */
  getAllFlags(context = {}) {
    const result = {};
    
    Object.keys(this.flags).forEach(flagName => {
      result[flagName] = {
        ...this.flags[flagName],
        isEnabled: this.isEnabled(flagName, context)
      };
    });
    
    return result;
  }

  /**
   * Update feature flag configuration
   * @param {string} flagName - Name of the feature flag
   * @param {Object} updates - Updates to apply
   */
  updateFlag(flagName, updates) {
    if (!this.flags[flagName]) {
      console.warn(`⚠️ Cannot update unknown feature flag: ${flagName}`);
      return false;
    }

    this.flags[flagName] = { ...this.flags[flagName], ...updates };
    
    // Clear rollout cache for this flag
    this.clearRolloutCache(flagName);
    
    console.log(`🚩 Feature flag ${flagName} updated:`, updates);
    return true;
  }

  /**
   * Enable a feature flag
   * @param {string} flagName - Name of the feature flag
   * @param {number} rolloutPercentage - Rollout percentage (0-100)
   */
  enableFlag(flagName, rolloutPercentage = 100) {
    return this.updateFlag(flagName, {
      enabled: true,
      rolloutPercentage: Math.max(0, Math.min(100, rolloutPercentage))
    });
  }

  /**
   * Disable a feature flag
   * @param {string} flagName - Name of the feature flag
   */
  disableFlag(flagName) {
    return this.updateFlag(flagName, {
      enabled: false,
      rolloutPercentage: 0
    });
  }

  /**
   * Check safeguards for a feature flag
   * @param {string} flagName - Name of the feature flag
   * @param {Object} metrics - Current metrics to check against safeguards
   * @returns {Object} - Safeguard check results
   */
  checkSafeguards(flagName, metrics = {}) {
    const flag = this.flags[flagName];
    
    if (!flag || !flag.safeguards) {
      return { passed: true, violations: [] };
    }

    const violations = [];
    const safeguards = flag.safeguards;

    // Check response time safeguard
    if (safeguards.maxResponseTime && metrics.responseTime > safeguards.maxResponseTime) {
      violations.push({
        type: 'response_time',
        expected: safeguards.maxResponseTime,
        actual: metrics.responseTime,
        message: `Response time ${metrics.responseTime}ms exceeds limit ${safeguards.maxResponseTime}ms`
      });
    }

    // Check career count safeguards
    if (safeguards.minCareerCount && metrics.careerCount < safeguards.minCareerCount) {
      violations.push({
        type: 'min_career_count',
        expected: safeguards.minCareerCount,
        actual: metrics.careerCount,
        message: `Career count ${metrics.careerCount} below minimum ${safeguards.minCareerCount}`
      });
    }

    if (safeguards.maxCareerCount && metrics.careerCount > safeguards.maxCareerCount) {
      violations.push({
        type: 'max_career_count',
        expected: safeguards.maxCareerCount,
        actual: metrics.careerCount,
        message: `Career count ${metrics.careerCount} exceeds maximum ${safeguards.maxCareerCount}`
      });
    }

    // Check confidence level safeguard
    if (safeguards.minConfidenceLevel && metrics.averageConfidence < safeguards.minConfidenceLevel) {
      violations.push({
        type: 'confidence_level',
        expected: safeguards.minConfidenceLevel,
        actual: metrics.averageConfidence,
        message: `Average confidence ${metrics.averageConfidence} below minimum ${safeguards.minConfidenceLevel}`
      });
    }

    // Check memory usage safeguard
    if (safeguards.maxMemoryUsage && metrics.memoryUsageMB > safeguards.maxMemoryUsage) {
      violations.push({
        type: 'memory_usage',
        expected: safeguards.maxMemoryUsage,
        actual: metrics.memoryUsageMB,
        message: `Memory usage ${metrics.memoryUsageMB}MB exceeds limit ${safeguards.maxMemoryUsage}MB`
      });
    }

    return {
      passed: violations.length === 0,
      violations,
      flagName,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Auto-disable flag if safeguards are violated
   * @param {string} flagName - Name of the feature flag
   * @param {Object} metrics - Current metrics
   * @returns {boolean} - Whether flag was auto-disabled
   */
  autoDisableOnViolation(flagName, metrics) {
    const safeguardResult = this.checkSafeguards(flagName, metrics);
    
    if (!safeguardResult.passed) {
      console.error(`🚨 Safeguard violations detected for ${flagName}:`, safeguardResult.violations);
      
      // Auto-disable the flag
      this.disableFlag(flagName);
      
      // Record the incident
      this.recordSafeguardViolation(flagName, safeguardResult);
      
      return true;
    }
    
    return false;
  }

  /**
   * Generate rollout key for consistent rollout decisions
   * @private
   */
  getRolloutKey(flagName, context) {
    const keyParts = [flagName];
    
    // Use session ID, user ID, or IP address for consistent rollout
    if (context.sessionId) {
      keyParts.push(context.sessionId);
    } else if (context.userId) {
      keyParts.push(context.userId);
    } else if (context.ipAddress) {
      keyParts.push(context.ipAddress);
    } else {
      // Fallback to a default key for anonymous users
      keyParts.push('anonymous');
    }
    
    return keyParts.join(':');
  }

  /**
   * Simple hash function for rollout decisions
   * @private
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Clear rollout cache for a specific flag
   * @private
   */
  clearRolloutCache(flagName) {
    const keysToDelete = [];
    
    for (const key of this.rolloutCache.keys()) {
      if (key.startsWith(`${flagName}:`)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.rolloutCache.delete(key));
  }

  /**
   * Record safeguard violation for monitoring
   * @private
   */
  recordSafeguardViolation(flagName, safeguardResult) {
    if (this.metricsCollector) {
      this.metricsCollector.recordEvent('safeguard_violation', {
        flagName,
        violations: safeguardResult.violations,
        timestamp: safeguardResult.timestamp
      });
    }
    
    // Also log to console for immediate visibility
    console.error(`🚨 SAFEGUARD VIOLATION - Flag ${flagName} auto-disabled`, {
      violations: safeguardResult.violations.map(v => v.message),
      timestamp: safeguardResult.timestamp
    });
  }

  /**
   * Set metrics collector for monitoring
   * @param {Object} collector - Metrics collector instance
   */
  setMetricsCollector(collector) {
    this.metricsCollector = collector;
  }

  /**
   * Get feature flag usage statistics
   * @returns {Object} - Usage statistics
   */
  getUsageStats() {
    const stats = {
      totalFlags: Object.keys(this.flags).length,
      enabledFlags: 0,
      partialRolloutFlags: 0,
      disabledFlags: 0,
      flagsWithDependencies: 0,
      rolloutCacheSize: this.rolloutCache.size
    };

    Object.values(this.flags).forEach(flag => {
      if (flag.enabled) {
        if (flag.rolloutPercentage === 100) {
          stats.enabledFlags++;
        } else {
          stats.partialRolloutFlags++;
        }
      } else {
        stats.disabledFlags++;
      }

      if (flag.dependencies && flag.dependencies.length > 0) {
        stats.flagsWithDependencies++;
      }
    });

    return stats;
  }
}

// Global feature flag manager instance
let globalFeatureFlagManager = null;

/**
 * Get the global feature flag manager instance
 * @returns {FeatureFlagManager} - Global feature flag manager
 */
export function getFeatureFlagManager() {
  if (!globalFeatureFlagManager) {
    globalFeatureFlagManager = new FeatureFlagManager();
  }
  return globalFeatureFlagManager;
}

/**
 * Initialize feature flags with custom configuration
 * @param {Object} customFlags - Custom flag configuration
 * @returns {FeatureFlagManager} - Configured feature flag manager
 */
export function initializeFeatureFlags(customFlags = {}) {
  globalFeatureFlagManager = new FeatureFlagManager(customFlags);
  return globalFeatureFlagManager;
}

/**
 * Convenience function to check if a feature is enabled
 * @param {string} flagName - Name of the feature flag
 * @param {Object} context - Context for rollout decision
 * @returns {boolean} - Whether the feature is enabled
 */
export function isFeatureEnabled(flagName, context = {}) {
  const manager = getFeatureFlagManager();
  return manager.isEnabled(flagName, context);
}

/**
 * Convenience function to get feature flag configuration
 * @param {string} flagName - Name of the feature flag
 * @returns {Object|null} - Flag configuration or null
 */
export function getFeatureFlag(flagName) {
  const manager = getFeatureFlagManager();
  return manager.getFlag(flagName);
}

/**
 * Feature flag middleware for Express.js
 * Adds feature flag context to request object
 */
export function featureFlagMiddleware(req, res, next) {
  const manager = getFeatureFlagManager();
  
  // Create context from request
  const context = {
    sessionId: req.sessionID,
    userId: req.user?.id,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  };
  
  // Add feature flag helper to request
  req.featureFlags = {
    isEnabled: (flagName) => manager.isEnabled(flagName, context),
    getFlag: (flagName) => manager.getFlag(flagName),
    getAllFlags: () => manager.getAllFlags(context),
    context
  };
  
  next();
}

// Export default flags for reference
export { DEFAULT_FLAGS };