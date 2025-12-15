// lib/rag/diversity-config-manager.js
// Advanced Configuration Management for Diversity Parameters
// Handles runtime parameter updates, validation, and safety checks

/**
 * DiversityConfigManager - Advanced configuration management system
 * 
 * Features:
 * - Runtime parameter updates with validation
 * - Configuration presets for different scenarios
 * - Parameter history and rollback capabilities
 * - Safety checks and constraint validation
 * - Configuration export/import functionality
 */
export class DiversityConfigManager {
  constructor(initialConfig = {}) {
    // Default configuration presets
    this.presets = {
      conservative: {
        maxCategoryDominance: 0.7,
        minCategoryRepresentation: 0.1,
        targetCategoryCount: 2,
        qualityPreservationWeight: 0.8,
        diversityWeight: 0.2,
        enableStrictEnforcement: false
      },
      balanced: {
        maxCategoryDominance: 0.6,
        minCategoryRepresentation: 0.15,
        targetCategoryCount: 3,
        qualityPreservationWeight: 0.7,
        diversityWeight: 0.3,
        enableStrictEnforcement: true
      },
      aggressive: {
        maxCategoryDominance: 0.5,
        minCategoryRepresentation: 0.2,
        targetCategoryCount: 4,
        qualityPreservationWeight: 0.6,
        diversityWeight: 0.4,
        enableStrictEnforcement: true
      },
      experimental: {
        maxCategoryDominance: 0.4,
        minCategoryRepresentation: 0.25,
        targetCategoryCount: 5,
        qualityPreservationWeight: 0.5,
        diversityWeight: 0.5,
        enableStrictEnforcement: true,
        enableAdaptiveThresholds: true
      }
    };

    // Current configuration
    this.currentConfig = this.mergeWithDefaults(initialConfig);
    
    // Configuration history for rollback
    this.configHistory = [{ ...this.currentConfig }];
    this.maxHistorySize = 10;
    
    // Validation rules
    this.validationRules = {
      maxCategoryDominance: { min: 0.3, max: 0.9, type: 'number' },
      minCategoryRepresentation: { min: 0.05, max: 0.4, type: 'number' },
      targetCategoryCount: { min: 2, max: 8, type: 'integer' },
      maxCategoriesPerRecommendation: { min: 3, max: 10, type: 'integer' },
      minQualityThreshold: { min: 0.1, max: 0.8, type: 'number' },
      qualityPreservationWeight: { min: 0.1, max: 0.9, type: 'number' },
      diversityWeight: { min: 0.1, max: 0.9, type: 'number' },
      enableStrictEnforcement: { type: 'boolean' },
      enableQualityPreservation: { type: 'boolean' },
      enableLogging: { type: 'boolean' },
      enableAdaptiveThresholds: { type: 'boolean' },
      enableCategoryPrioritization: { type: 'boolean' }
    };
    
    // Statistics
    this.stats = {
      configUpdates: 0,
      presetApplications: 0,
      validationFailures: 0,
      rollbacks: 0
    };
  }

  /**
   * Get current configuration
   * @returns {Object} - Current configuration object
   */
  getCurrentConfig() {
    return { ...this.currentConfig };
  }

  /**
   * Update configuration parameters with validation
   * @param {Object} updates - Configuration updates
   * @param {Object} options - Update options
   * @returns {Object} - Update result with success status and details
   */
  updateConfig(updates, options = {}) {
    const { validateOnly = false, skipHistory = false } = options;
    
    try {
      // Validate updates
      const validationResult = this.validateUpdates(updates);
      if (!validationResult.isValid) {
        this.stats.validationFailures++;
        return {
          success: false,
          error: 'Validation failed',
          details: validationResult.errors,
          currentConfig: this.getCurrentConfig()
        };
      }

      // If validation only, return success without applying
      if (validateOnly) {
        return {
          success: true,
          message: 'Validation passed',
          wouldUpdate: updates,
          currentConfig: this.getCurrentConfig()
        };
      }

      // Save current config to history
      if (!skipHistory) {
        this.saveToHistory();
      }

      // Apply updates
      const newConfig = { ...this.currentConfig, ...updates };
      
      // Final validation of complete config
      const finalValidation = this.validateCompleteConfig(newConfig);
      if (!finalValidation.isValid) {
        return {
          success: false,
          error: 'Final configuration validation failed',
          details: finalValidation.errors,
          currentConfig: this.getCurrentConfig()
        };
      }

      // Apply the new configuration
      this.currentConfig = newConfig;
      this.stats.configUpdates++;

      return {
        success: true,
        message: 'Configuration updated successfully',
        updatedParameters: Object.keys(updates),
        currentConfig: this.getCurrentConfig()
      };

    } catch (error) {
      this.stats.validationFailures++;
      return {
        success: false,
        error: error.message,
        currentConfig: this.getCurrentConfig()
      };
    }
  }

  /**
   * Apply a configuration preset
   * @param {string} presetName - Name of the preset to apply
   * @param {Object} overrides - Optional parameter overrides
   * @returns {Object} - Application result
   */
  applyPreset(presetName, overrides = {}) {
    if (!this.presets[presetName]) {
      return {
        success: false,
        error: `Unknown preset: ${presetName}`,
        availablePresets: Object.keys(this.presets)
      };
    }

    const presetConfig = { ...this.presets[presetName], ...overrides };
    const result = this.updateConfig(presetConfig);
    
    if (result.success) {
      this.stats.presetApplications++;
      result.appliedPreset = presetName;
      result.overrides = overrides;
    }

    return result;
  }

  /**
   * Rollback to previous configuration
   * @param {number} steps - Number of steps to rollback (default: 1)
   * @returns {Object} - Rollback result
   */
  rollback(steps = 1) {
    if (this.configHistory.length <= 1) {
      return {
        success: false,
        error: 'No previous configuration to rollback to',
        currentConfig: this.getCurrentConfig()
      };
    }

    const targetIndex = Math.max(0, this.configHistory.length - 1 - steps);
    const targetConfig = this.configHistory[targetIndex];
    
    // Apply the target configuration without saving to history
    const result = this.updateConfig(targetConfig, { skipHistory: true });
    
    if (result.success) {
      // Remove rolled-back configurations from history
      this.configHistory = this.configHistory.slice(0, targetIndex + 1);
      this.stats.rollbacks++;
      result.rolledBackSteps = steps;
    }

    return result;
  }

  /**
   * Validate configuration updates
   * @param {Object} updates - Updates to validate
   * @returns {Object} - Validation result
   */
  validateUpdates(updates) {
    const errors = [];
    
    for (const [key, value] of Object.entries(updates)) {
      const rule = this.validationRules[key];
      
      if (!rule) {
        errors.push(`Unknown parameter: ${key}`);
        continue;
      }

      // Type validation
      if (rule.type === 'number' && typeof value !== 'number') {
        errors.push(`${key} must be a number`);
        continue;
      }
      
      if (rule.type === 'integer' && (!Number.isInteger(value) || typeof value !== 'number')) {
        errors.push(`${key} must be an integer`);
        continue;
      }
      
      if (rule.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`${key} must be a boolean`);
        continue;
      }

      // Range validation
      if (rule.min !== undefined && value < rule.min) {
        errors.push(`${key} must be >= ${rule.min}`);
      }
      
      if (rule.max !== undefined && value > rule.max) {
        errors.push(`${key} must be <= ${rule.max}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate complete configuration for logical consistency
   * @param {Object} config - Complete configuration to validate
   * @returns {Object} - Validation result
   */
  validateCompleteConfig(config) {
    const errors = [];

    // Check weight sum
    const weightSum = config.qualityPreservationWeight + config.diversityWeight;
    if (Math.abs(weightSum - 1.0) > 0.001) {
      errors.push(`Quality and diversity weights must sum to 1.0 (current: ${weightSum})`);
    }

    // Check logical constraints
    if (config.maxCategoryDominance <= config.minCategoryRepresentation) {
      errors.push('maxCategoryDominance must be greater than minCategoryRepresentation');
    }

    // Check category count constraints
    if (config.targetCategoryCount > config.maxCategoriesPerRecommendation) {
      errors.push('targetCategoryCount cannot exceed maxCategoriesPerRecommendation');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Save current configuration to history
   */
  saveToHistory() {
    this.configHistory.push({ ...this.currentConfig });
    
    // Maintain history size limit
    if (this.configHistory.length > this.maxHistorySize) {
      this.configHistory = this.configHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Merge configuration with defaults
   * @param {Object} config - Configuration to merge
   * @returns {Object} - Merged configuration
   */
  mergeWithDefaults(config) {
    const defaults = this.presets.balanced;
    return { ...defaults, ...config };
  }

  /**
   * Export current configuration
   * @param {string} format - Export format ('json' or 'preset')
   * @returns {string|Object} - Exported configuration
   */
  exportConfig(format = 'json') {
    const config = this.getCurrentConfig();
    
    if (format === 'json') {
      return JSON.stringify(config, null, 2);
    } else if (format === 'preset') {
      return {
        name: 'custom',
        description: 'Exported configuration',
        config: config,
        exportedAt: new Date().toISOString()
      };
    }
    
    return config;
  }

  /**
   * Import configuration from various sources
   * @param {string|Object} source - Configuration source
   * @param {string} format - Source format
   * @returns {Object} - Import result
   */
  importConfig(source, format = 'json') {
    try {
      let config;
      
      if (format === 'json') {
        config = typeof source === 'string' ? JSON.parse(source) : source;
      } else if (format === 'preset') {
        config = source.config || source;
      } else {
        config = source;
      }

      return this.updateConfig(config);
    } catch (error) {
      return {
        success: false,
        error: `Import failed: ${error.message}`
      };
    }
  }

  /**
   * Get available presets
   * @returns {Object} - Available presets with descriptions
   */
  getAvailablePresets() {
    return {
      conservative: {
        ...this.presets.conservative,
        description: 'Conservative diversity enforcement with high quality preservation'
      },
      balanced: {
        ...this.presets.balanced,
        description: 'Balanced approach between quality and diversity'
      },
      aggressive: {
        ...this.presets.aggressive,
        description: 'Aggressive diversity enforcement with moderate quality preservation'
      },
      experimental: {
        ...this.presets.experimental,
        description: 'Experimental settings with adaptive features enabled'
      }
    };
  }

  /**
   * Get configuration history
   * @param {number} limit - Maximum number of history entries to return
   * @returns {Array} - Configuration history
   */
  getConfigHistory(limit = 5) {
    return this.configHistory.slice(-limit).map((config, index) => ({
      index: this.configHistory.length - limit + index,
      config,
      isCurrent: index === limit - 1
    }));
  }

  /**
   * Get configuration statistics
   * @returns {Object} - Configuration management statistics
   */
  getStatistics() {
    return {
      ...this.stats,
      historySize: this.configHistory.length,
      currentPreset: this.detectCurrentPreset(),
      lastUpdate: this.configHistory.length > 1 ? 'Available' : 'None'
    };
  }

  /**
   * Detect which preset the current configuration matches
   * @returns {string|null} - Matching preset name or null
   */
  detectCurrentPreset() {
    for (const [presetName, presetConfig] of Object.entries(this.presets)) {
      if (this.configsMatch(this.currentConfig, presetConfig)) {
        return presetName;
      }
    }
    return 'custom';
  }

  /**
   * Check if two configurations match
   * @param {Object} config1 - First configuration
   * @param {Object} config2 - Second configuration
   * @returns {boolean} - Whether configurations match
   */
  configsMatch(config1, config2) {
    const keys = Object.keys(config2);
    return keys.every(key => config1[key] === config2[key]);
  }

  /**
   * Reset configuration to default preset
   * @param {string} preset - Preset to reset to (default: 'balanced')
   * @returns {Object} - Reset result
   */
  reset(preset = 'balanced') {
    return this.applyPreset(preset);
  }

  /**
   * Get validation rules
   * @returns {Object} - Current validation rules
   */
  getValidationRules() {
    return { ...this.validationRules };
  }
}

export default DiversityConfigManager;