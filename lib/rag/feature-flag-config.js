// lib/rag/feature-flag-config.js
// Task 10.1: Feature Flag Configuration Management
// Provides configuration management and deployment-specific flag settings

import { getFeatureFlagManager } from './feature-flags.js';

/**
 * Deployment Environment Configurations
 */
export const DEPLOYMENT_CONFIGS = {
  // Development environment - all features enabled for testing
  development: {
    enhanced_rag_filtering: { enabled: true, rolloutPercentage: 100 },
    fallback_careers: { enabled: true, rolloutPercentage: 100 },
    performance_monitoring: { enabled: true, rolloutPercentage: 100 },
    subject_category_prioritization: { enabled: true, rolloutPercentage: 100 },
    profile_complexity_analysis: { enabled: true, rolloutPercentage: 100 },
    enhanced_error_handling: { enabled: true, rolloutPercentage: 100 },
    enhanced_safety_validation: { enabled: true, rolloutPercentage: 100 }
  },

  // Staging environment - gradual testing
  staging: {
    enhanced_rag_filtering: { enabled: true, rolloutPercentage: 100 },
    fallback_careers: { enabled: true, rolloutPercentage: 100 },
    performance_monitoring: { enabled: true, rolloutPercentage: 100 },
    subject_category_prioritization: { enabled: true, rolloutPercentage: 50 },
    profile_complexity_analysis: { enabled: true, rolloutPercentage: 50 },
    enhanced_error_handling: { enabled: true, rolloutPercentage: 100 },
    enhanced_safety_validation: { enabled: true, rolloutPercentage: 100 }
  },

  // Production canary - minimal rollout for initial testing
  production_canary: {
    enhanced_rag_filtering: { enabled: true, rolloutPercentage: 10 },
    fallback_careers: { enabled: true, rolloutPercentage: 10 },
    performance_monitoring: { enabled: true, rolloutPercentage: 100 },
    subject_category_prioritization: { enabled: false, rolloutPercentage: 0 },
    profile_complexity_analysis: { enabled: false, rolloutPercentage: 0 },
    enhanced_error_handling: { enabled: true, rolloutPercentage: 100 },
    enhanced_safety_validation: { enabled: true, rolloutPercentage: 100 }
  },

  // Production gradual - 50% rollout
  production_gradual: {
    enhanced_rag_filtering: { enabled: true, rolloutPercentage: 50 },
    fallback_careers: { enabled: true, rolloutPercentage: 50 },
    performance_monitoring: { enabled: true, rolloutPercentage: 100 },
    subject_category_prioritization: { enabled: true, rolloutPercentage: 25 },
    profile_complexity_analysis: { enabled: true, rolloutPercentage: 25 },
    enhanced_error_handling: { enabled: true, rolloutPercentage: 100 },
    enhanced_safety_validation: { enabled: true, rolloutPercentage: 100 }
  },

  // Production full - complete rollout
  production_full: {
    enhanced_rag_filtering: { enabled: true, rolloutPercentage: 100 },
    fallback_careers: { enabled: true, rolloutPercentage: 100 },
    performance_monitoring: { enabled: true, rolloutPercentage: 100 },
    subject_category_prioritization: { enabled: true, rolloutPercentage: 100 },
    profile_complexity_analysis: { enabled: true, rolloutPercentage: 100 },
    enhanced_error_handling: { enabled: true, rolloutPercentage: 100 },
    enhanced_safety_validation: { enabled: true, rolloutPercentage: 100 }
  },

  // Emergency rollback - disable all enhanced features
  emergency_rollback: {
    enhanced_rag_filtering: { enabled: false, rolloutPercentage: 0 },
    fallback_careers: { enabled: false, rolloutPercentage: 0 },
    performance_monitoring: { enabled: true, rolloutPercentage: 100 }, // Keep monitoring
    subject_category_prioritization: { enabled: false, rolloutPercentage: 0 },
    profile_complexity_analysis: { enabled: false, rolloutPercentage: 0 },
    enhanced_error_handling: { enabled: true, rolloutPercentage: 100 }, // Keep error handling
    enhanced_safety_validation: { enabled: true, rolloutPercentage: 100 } // Keep safety
  }
};

/**
 * Feature Flag Configuration Manager
 */
export class FeatureFlagConfigManager {
  constructor() {
    this.currentEnvironment = this.detectEnvironment();
    this.configHistory = [];
    this.rollbackStack = [];
  }

  /**
   * Detect current deployment environment
   * @returns {string} - Environment name
   */
  detectEnvironment() {
    // Check environment variables
    if (process.env.RAG_DEPLOYMENT_ENV) {
      return process.env.RAG_DEPLOYMENT_ENV;
    }

    if (process.env.NODE_ENV === 'development') {
      return 'development';
    }

    if (process.env.VERCEL_ENV === 'preview' || process.env.NODE_ENV === 'staging') {
      return 'staging';
    }

    if (process.env.NODE_ENV === 'production') {
      // Default to canary for production
      return 'production_canary';
    }

    // Default fallback
    return 'development';
  }

  /**
   * Apply configuration for a specific environment
   * @param {string} environment - Environment name
   * @returns {boolean} - Success status
   */
  applyEnvironmentConfig(environment) {
    const config = DEPLOYMENT_CONFIGS[environment];
    
    if (!config) {
      console.error(`❌ Unknown environment configuration: ${environment}`);
      return false;
    }

    const manager = getFeatureFlagManager();
    
    // Save current configuration for rollback
    this.saveCurrentConfigForRollback();
    
    // Apply new configuration
    Object.entries(config).forEach(([flagName, flagConfig]) => {
      manager.updateFlag(flagName, flagConfig);
    });

    this.currentEnvironment = environment;
    this.recordConfigChange(environment, config);

    console.log(`🚩 Applied ${environment} configuration:`, config);
    return true;
  }

  /**
   * Get current environment configuration
   * @returns {Object} - Current configuration
   */
  getCurrentConfig() {
    const manager = getFeatureFlagManager();
    return manager.getAllFlags();
  }

  /**
   * Rollback to previous configuration
   * @returns {boolean} - Success status
   */
  rollbackToPrevious() {
    if (this.rollbackStack.length === 0) {
      console.warn('⚠️ No previous configuration to rollback to');
      return false;
    }

    const previousConfig = this.rollbackStack.pop();
    const manager = getFeatureFlagManager();

    // Apply previous configuration
    Object.entries(previousConfig.flags).forEach(([flagName, flagConfig]) => {
      manager.updateFlag(flagName, {
        enabled: flagConfig.enabled,
        rolloutPercentage: flagConfig.rolloutPercentage
      });
    });

    this.currentEnvironment = previousConfig.environment;
    console.log(`🔄 Rolled back to ${previousConfig.environment} configuration`);
    
    return true;
  }

  /**
   * Emergency rollback - disable all enhanced features
   * @returns {boolean} - Success status
   */
  emergencyRollback() {
    console.log('🚨 Executing emergency rollback - disabling all enhanced features');
    return this.applyEnvironmentConfig('emergency_rollback');
  }

  /**
   * Gradual rollout progression
   * @param {string} flagName - Feature flag to progress
   * @param {number} incrementPercentage - Percentage to increase rollout
   * @returns {boolean} - Success status
   */
  progressiveRollout(flagName, incrementPercentage = 10) {
    const manager = getFeatureFlagManager();
    const flag = manager.getFlag(flagName);
    
    if (!flag) {
      console.error(`❌ Unknown feature flag: ${flagName}`);
      return false;
    }

    const newPercentage = Math.min(100, flag.rolloutPercentage + incrementPercentage);
    
    manager.updateFlag(flagName, {
      rolloutPercentage: newPercentage
    });

    console.log(`📈 Progressive rollout: ${flagName} increased to ${newPercentage}%`);
    
    // Record the change
    this.recordConfigChange(`progressive_${flagName}`, {
      [flagName]: { rolloutPercentage: newPercentage }
    });

    return true;
  }

  /**
   * Validate configuration before applying
   * @param {Object} config - Configuration to validate
   * @returns {Object} - Validation result
   */
  validateConfiguration(config) {
    const errors = [];
    const warnings = [];

    Object.entries(config).forEach(([flagName, flagConfig]) => {
      // Check if flag exists
      const manager = getFeatureFlagManager();
      if (!manager.getFlag(flagName)) {
        errors.push(`Unknown feature flag: ${flagName}`);
        return;
      }

      // Validate rollout percentage
      if (flagConfig.rolloutPercentage < 0 || flagConfig.rolloutPercentage > 100) {
        errors.push(`Invalid rollout percentage for ${flagName}: ${flagConfig.rolloutPercentage}`);
      }

      // Check dependencies
      const flag = manager.getFlag(flagName);
      if (flag.dependencies && flag.dependencies.length > 0) {
        flag.dependencies.forEach(dependency => {
          if (config[dependency] && !config[dependency].enabled && flagConfig.enabled) {
            warnings.push(`${flagName} depends on ${dependency} which is disabled`);
          }
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get deployment progression recommendations
   * @returns {Object} - Recommended next steps
   */
  getProgressionRecommendations() {
    const currentConfig = this.getCurrentConfig();
    const recommendations = [];

    // Analyze current state and suggest next steps
    Object.entries(currentConfig).forEach(([flagName, flag]) => {
      if (flag.enabled && flag.rolloutPercentage < 100) {
        if (flag.rolloutPercentage < 25) {
          recommendations.push({
            flag: flagName,
            action: 'increase_to_25',
            description: `Increase ${flagName} rollout to 25% for broader testing`,
            risk: 'low'
          });
        } else if (flag.rolloutPercentage < 50) {
          recommendations.push({
            flag: flagName,
            action: 'increase_to_50',
            description: `Increase ${flagName} rollout to 50% for gradual deployment`,
            risk: 'medium'
          });
        } else if (flag.rolloutPercentage < 100) {
          recommendations.push({
            flag: flagName,
            action: 'increase_to_100',
            description: `Complete ${flagName} rollout to 100%`,
            risk: 'medium'
          });
        }
      }
    });

    return {
      currentEnvironment: this.currentEnvironment,
      recommendations,
      totalFlags: Object.keys(currentConfig).length,
      enabledFlags: Object.values(currentConfig).filter(f => f.enabled).length
    };
  }

  /**
   * Save current configuration for rollback
   * @private
   */
  saveCurrentConfigForRollback() {
    const currentConfig = this.getCurrentConfig();
    
    this.rollbackStack.push({
      environment: this.currentEnvironment,
      flags: currentConfig,
      timestamp: new Date().toISOString()
    });

    // Keep only last 5 configurations for rollback
    if (this.rollbackStack.length > 5) {
      this.rollbackStack.shift();
    }
  }

  /**
   * Record configuration change for audit trail
   * @private
   */
  recordConfigChange(environment, config) {
    this.configHistory.push({
      environment,
      config,
      timestamp: new Date().toISOString(),
      user: process.env.USER || 'system'
    });

    // Keep only last 20 changes
    if (this.configHistory.length > 20) {
      this.configHistory.shift();
    }
  }

  /**
   * Get configuration history
   * @returns {Array} - Configuration change history
   */
  getConfigHistory() {
    return [...this.configHistory];
  }

  /**
   * Export current configuration
   * @returns {Object} - Exportable configuration
   */
  exportConfiguration() {
    return {
      environment: this.currentEnvironment,
      flags: this.getCurrentConfig(),
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  /**
   * Import configuration from export
   * @param {Object} exportedConfig - Previously exported configuration
   * @returns {boolean} - Success status
   */
  importConfiguration(exportedConfig) {
    if (!exportedConfig.flags) {
      console.error('❌ Invalid configuration format');
      return false;
    }

    const validation = this.validateConfiguration(exportedConfig.flags);
    
    if (!validation.isValid) {
      console.error('❌ Configuration validation failed:', validation.errors);
      return false;
    }

    if (validation.warnings.length > 0) {
      console.warn('⚠️ Configuration warnings:', validation.warnings);
    }

    // Apply the configuration
    const manager = getFeatureFlagManager();
    
    Object.entries(exportedConfig.flags).forEach(([flagName, flagConfig]) => {
      manager.updateFlag(flagName, {
        enabled: flagConfig.enabled,
        rolloutPercentage: flagConfig.rolloutPercentage
      });
    });

    this.currentEnvironment = exportedConfig.environment || 'imported';
    console.log(`📥 Imported configuration from ${exportedConfig.timestamp}`);
    
    return true;
  }
}

// Global configuration manager instance
let globalConfigManager = null;

/**
 * Get the global configuration manager instance
 * @returns {FeatureFlagConfigManager} - Global configuration manager
 */
export function getConfigManager() {
  if (!globalConfigManager) {
    globalConfigManager = new FeatureFlagConfigManager();
  }
  return globalConfigManager;
}

/**
 * Initialize feature flags for current environment
 * @returns {boolean} - Success status
 */
export function initializeForEnvironment() {
  const configManager = getConfigManager();
  const environment = configManager.detectEnvironment();
  
  console.log(`🚀 Initializing feature flags for environment: ${environment}`);
  
  return configManager.applyEnvironmentConfig(environment);
}

/**
 * Quick deployment functions for common scenarios
 */
export const deploymentActions = {
  // Start canary deployment
  startCanary: () => getConfigManager().applyEnvironmentConfig('production_canary'),
  
  // Progress to gradual rollout
  progressToGradual: () => getConfigManager().applyEnvironmentConfig('production_gradual'),
  
  // Complete full rollout
  completeRollout: () => getConfigManager().applyEnvironmentConfig('production_full'),
  
  // Emergency rollback
  emergencyRollback: () => getConfigManager().emergencyRollback(),
  
  // Rollback to previous
  rollback: () => getConfigManager().rollbackToPrevious()
};

export default FeatureFlagConfigManager;