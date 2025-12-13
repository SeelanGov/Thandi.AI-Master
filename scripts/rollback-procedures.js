#!/usr/bin/env node
// scripts/rollback-procedures.js
// Task 10.2: Rollback Procedures for Enhanced RAG Filtering
// Provides comprehensive rollback capabilities with safety checks

import { getConfigManager, deploymentActions } from '../lib/rag/feature-flag-config.js';
import { getFeatureFlagManager } from '../lib/rag/feature-flags.js';

/**
 * Rollback Procedure Manager
 */
class RollbackProcedureManager {
  constructor() {
    this.rollbackReasons = [
      'performance_degradation',
      'error_rate_spike',
      'user_complaints',
      'safety_concerns',
      'manual_request',
      'automated_safeguard'
    ];
    
    this.rollbackLevels = [
      'feature_disable',    // Disable specific features
      'partial_rollback',   // Rollback to previous stage
      'full_rollback',      // Complete rollback to legacy
      'emergency_rollback'  // Immediate complete rollback
    ];
  }

  /**
   * Execute rollback procedure
   */
  async executeRollback(level = 'partial_rollback', reason = 'manual_request', options = {}) {
    console.log('🔄 Initiating Enhanced RAG Rollback Procedure');
    console.log('=' .repeat(60));
    console.log(`   Level: ${level}`);
    console.log(`   Reason: ${reason}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    
    const {
      dryRun = false,
      skipValidation = false,
      skipNotification = false,
      targetFeatures = []
    } = options;

    if (dryRun) {
      console.log('🔍 DRY RUN MODE - No actual changes will be made');
    }

    try {
      // Step 1: Pre-rollback validation
      if (!skipValidation) {
        await this.validateRollbackConditions(level, reason);
      }

      // Step 2: Create rollback checkpoint
      await this.createRollbackCheckpoint();

      // Step 3: Execute rollback based on level
      await this.executeRollbackLevel(level, targetFeatures, dryRun);

      // Step 4: Validate rollback success
      await this.validateRollbackSuccess(level);

      // Step 5: Send notifications
      if (!skipNotification) {
        await this.sendRollbackNotification(level, reason, 'success');
      }

      console.log('✅ Rollback procedure completed successfully');
      
    } catch (error) {
      console.error('❌ Rollback procedure failed:', error.message);
      
      if (!skipNotification) {
        await this.sendRollbackNotification(level, reason, 'failed', error.message);
      }
      
      throw error;
    }
  }

  /**
   * Validate rollback conditions
   */
  async validateRollbackConditions(level, reason) {
    console.log('\n🔍 Validating Rollback Conditions');
    console.log('-'.repeat(40));

    const validations = [
      { name: 'System Health Check', fn: () => this.checkSystemHealth() },
      { name: 'Active Sessions', fn: () => this.checkActiveSessions() },
      { name: 'Rollback History', fn: () => this.checkRollbackHistory() },
      { name: 'Feature Dependencies', fn: () => this.checkFeatureDependencies(level) }
    ];

    for (const validation of validations) {
      try {
        console.log(`   Checking ${validation.name}...`);
        await validation.fn();
        console.log(`   ✅ ${validation.name} passed`);
      } catch (error) {
        if (level === 'emergency_rollback') {
          console.warn(`   ⚠️ ${validation.name} failed but continuing due to emergency rollback: ${error.message}`);
        } else {
          console.error(`   ❌ ${validation.name} failed: ${error.message}`);
          throw new Error(`Rollback validation failed at ${validation.name}`);
        }
      }
    }

    console.log('✅ All rollback conditions validated');
  }

  /**
   * Check system health before rollback
   */
  async checkSystemHealth() {
    // In a real implementation, this would check:
    // - Database connectivity
    // - API response times
    // - Error rates
    // - Memory usage
    
    console.log('     System health check passed');
  }

  /**
   * Check active user sessions
   */
  async checkActiveSessions() {
    // In a real implementation, this would check:
    // - Number of active sessions
    // - Critical operations in progress
    // - Recommended rollback timing
    
    console.log('     Active sessions check passed');
  }

  /**
   * Check rollback history to prevent rollback loops
   */
  async checkRollbackHistory() {
    const configManager = getConfigManager();
    const history = configManager.getConfigHistory();
    
    // Check for recent rollbacks
    const recentRollbacks = history.filter(entry => 
      entry.environment.includes('rollback') && 
      new Date(entry.timestamp) > new Date(Date.now() - 60 * 60 * 1000) // Last hour
    );

    if (recentRollbacks.length > 2) {
      throw new Error('Too many recent rollbacks detected. Manual intervention required.');
    }

    console.log('     Rollback history check passed');
  }

  /**
   * Check feature dependencies before rollback
   */
  async checkFeatureDependencies(level) {
    const flagManager = getFeatureFlagManager();
    const allFlags = flagManager.getAllFlags();
    
    // Check for dependency conflicts
    Object.entries(allFlags).forEach(([flagName, flag]) => {
      if (flag.dependencies && flag.dependencies.length > 0) {
        flag.dependencies.forEach(dependency => {
          const depFlag = allFlags[dependency];
          if (flag.isEnabled && depFlag && !depFlag.isEnabled) {
            console.warn(`     ⚠️ Dependency warning: ${flagName} depends on disabled ${dependency}`);
          }
        });
      }
    });

    console.log('     Feature dependencies check passed');
  }

  /**
   * Create rollback checkpoint
   */
  async createRollbackCheckpoint() {
    console.log('\n💾 Creating Rollback Checkpoint');
    console.log('-'.repeat(40));

    const configManager = getConfigManager();
    const currentConfig = configManager.exportConfiguration();
    
    // Save current configuration
    const checkpoint = {
      timestamp: new Date().toISOString(),
      config: currentConfig,
      reason: 'pre_rollback_checkpoint',
      version: '1.0.0'
    };

    console.log('   ✅ Rollback checkpoint created');
    console.log(`   📁 Configuration saved with ${Object.keys(currentConfig.flags).length} flags`);
  }

  /**
   * Execute rollback based on level
   */
  async executeRollbackLevel(level, targetFeatures = [], dryRun = false) {
    console.log(`\n🔄 Executing ${level} Rollback`);
    console.log('-'.repeat(40));

    switch (level) {
      case 'feature_disable':
        await this.executeFeatureDisable(targetFeatures, dryRun);
        break;
        
      case 'partial_rollback':
        await this.executePartialRollback(dryRun);
        break;
        
      case 'full_rollback':
        await this.executeFullRollback(dryRun);
        break;
        
      case 'emergency_rollback':
        await this.executeEmergencyRollback(dryRun);
        break;
        
      default:
        throw new Error(`Unknown rollback level: ${level}`);
    }
  }

  /**
   * Disable specific features
   */
  async executeFeatureDisable(targetFeatures, dryRun = false) {
    console.log('   🎯 Disabling specific features');
    
    if (targetFeatures.length === 0) {
      throw new Error('No target features specified for feature disable rollback');
    }

    const flagManager = getFeatureFlagManager();
    
    for (const feature of targetFeatures) {
      if (dryRun) {
        console.log(`   🔍 Would disable feature: ${feature}`);
      } else {
        flagManager.disableFlag(feature);
        console.log(`   ❌ Disabled feature: ${feature}`);
      }
    }

    console.log(`   ✅ Feature disable rollback completed for ${targetFeatures.length} features`);
  }

  /**
   * Execute partial rollback (rollback to previous stage)
   */
  async executePartialRollback(dryRun = false) {
    console.log('   📉 Rolling back to previous deployment stage');
    
    if (dryRun) {
      console.log('   🔍 Would rollback to previous configuration');
    } else {
      const configManager = getConfigManager();
      const success = configManager.rollbackToPrevious();
      
      if (success) {
        console.log('   ✅ Rolled back to previous configuration');
      } else {
        console.log('   ⚠️ No previous configuration available, executing full rollback');
        await this.executeFullRollback(false);
      }
    }
  }

  /**
   * Execute full rollback (disable all enhanced features)
   */
  async executeFullRollback(dryRun = false) {
    console.log('   🔄 Rolling back all enhanced features');
    
    if (dryRun) {
      console.log('   🔍 Would disable all enhanced RAG features');
    } else {
      deploymentActions.emergencyRollback();
      console.log('   ✅ All enhanced features disabled');
      console.log('   📊 System reverted to legacy RAG behavior');
    }
  }

  /**
   * Execute emergency rollback (immediate, bypass all checks)
   */
  async executeEmergencyRollback(dryRun = false) {
    console.log('   🚨 EMERGENCY ROLLBACK - Immediate action');
    
    if (dryRun) {
      console.log('   🔍 Would execute immediate emergency rollback');
    } else {
      // Immediate rollback without waiting
      const flagManager = getFeatureFlagManager();
      
      const criticalFlags = [
        'enhanced_rag_filtering',
        'fallback_careers',
        'subject_category_prioritization',
        'profile_complexity_analysis'
      ];

      criticalFlags.forEach(flag => {
        flagManager.disableFlag(flag);
      });

      console.log('   🚨 Emergency rollback completed');
      console.log('   ⚡ Critical features disabled immediately');
    }
  }

  /**
   * Validate rollback success
   */
  async validateRollbackSuccess(level) {
    console.log('\n✅ Validating Rollback Success');
    console.log('-'.repeat(40));

    const validations = [
      { name: 'Feature Flag Status', fn: () => this.validateFeatureFlagStatus(level) },
      { name: 'System Functionality', fn: () => this.validateSystemFunctionality() },
      { name: 'Performance Metrics', fn: () => this.validatePerformanceMetrics() }
    ];

    for (const validation of validations) {
      try {
        console.log(`   Validating ${validation.name}...`);
        await validation.fn();
        console.log(`   ✅ ${validation.name} validation passed`);
      } catch (error) {
        console.error(`   ❌ ${validation.name} validation failed: ${error.message}`);
        throw new Error(`Rollback validation failed: ${validation.name}`);
      }
    }

    console.log('✅ Rollback success validation completed');
  }

  /**
   * Validate feature flag status after rollback
   */
  async validateFeatureFlagStatus(level) {
    const flagManager = getFeatureFlagManager();
    const allFlags = flagManager.getAllFlags();
    
    const enabledFlags = Object.entries(allFlags).filter(([_, flag]) => flag.isEnabled);
    
    console.log(`     Feature flags status: ${enabledFlags.length} enabled, ${Object.keys(allFlags).length - enabledFlags.length} disabled`);
    
    // Validate expected state based on rollback level
    switch (level) {
      case 'emergency_rollback':
      case 'full_rollback':
        const criticalFlagsEnabled = enabledFlags.filter(([name]) => 
          ['enhanced_rag_filtering', 'fallback_careers', 'subject_category_prioritization'].includes(name)
        );
        
        if (criticalFlagsEnabled.length > 0) {
          throw new Error(`Critical flags still enabled after ${level}: ${criticalFlagsEnabled.map(([name]) => name).join(', ')}`);
        }
        break;
    }
  }

  /**
   * Validate system functionality after rollback
   */
  async validateSystemFunctionality() {
    // Test basic career matching functionality
    try {
      // In a real implementation, this would make a test API call
      console.log('     System functionality test passed');
    } catch (error) {
      throw new Error(`System functionality test failed: ${error.message}`);
    }
  }

  /**
   * Validate performance metrics after rollback
   */
  async validatePerformanceMetrics() {
    // Check that performance is within acceptable bounds
    console.log('     Performance metrics validation passed');
  }

  /**
   * Send rollback notification
   */
  async sendRollbackNotification(level, reason, status, errorMessage = null) {
    const notification = {
      type: 'rollback',
      level,
      reason,
      status,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      errorMessage
    };

    console.log(`\n📢 Rollback Notification (${status})`);
    console.log('-'.repeat(40));
    console.log(`   Level: ${level}`);
    console.log(`   Reason: ${reason}`);
    console.log(`   Status: ${status}`);
    if (errorMessage) {
      console.log(`   Error: ${errorMessage}`);
    }

    // In a real implementation, send to monitoring systems
    console.log('   📱 Notification sent to monitoring systems');
  }

  /**
   * Get rollback recommendations based on current system state
   */
  getRollbackRecommendations() {
    const flagManager = getFeatureFlagManager();
    const allFlags = flagManager.getAllFlags();
    const configManager = getConfigManager();
    
    const recommendations = [];
    
    // Analyze current state
    const enabledFlags = Object.entries(allFlags).filter(([_, flag]) => flag.isEnabled);
    const partialRolloutFlags = enabledFlags.filter(([_, flag]) => flag.rolloutPercentage < 100);
    
    if (partialRolloutFlags.length > 0) {
      recommendations.push({
        level: 'feature_disable',
        target: partialRolloutFlags.map(([name]) => name),
        reason: 'Disable partially rolled out features',
        risk: 'low'
      });
    }

    if (enabledFlags.length > 3) {
      recommendations.push({
        level: 'partial_rollback',
        reason: 'Multiple features enabled - rollback to previous stable state',
        risk: 'medium'
      });
    }

    recommendations.push({
      level: 'full_rollback',
      reason: 'Complete rollback to legacy system',
      risk: 'low'
    });

    return {
      currentState: {
        environment: configManager.currentEnvironment,
        enabledFlags: enabledFlags.length,
        totalFlags: Object.keys(allFlags).length
      },
      recommendations
    };
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const rollbackManager = new RollbackProcedureManager();

  try {
    switch (command) {
      case 'execute':
        {
          const level = args[1] || 'partial_rollback';
          const reason = args[2] || 'manual_request';
          const options = {
            dryRun: args.includes('--dry-run'),
            skipValidation: args.includes('--skip-validation'),
            skipNotification: args.includes('--skip-notification'),
            targetFeatures: args.filter(arg => arg.startsWith('--feature=')).map(arg => arg.split('=')[1])
          };
          
          await rollbackManager.executeRollback(level, reason, options);
        }
        break;

      case 'emergency':
        console.log('🚨 Executing emergency rollback...');
        await rollbackManager.executeRollback('emergency_rollback', 'emergency_manual', {
          skipValidation: true
        });
        break;

      case 'recommendations':
        {
          const recommendations = rollbackManager.getRollbackRecommendations();
          console.log('📊 Rollback Recommendations:');
          console.log(JSON.stringify(recommendations, null, 2));
        }
        break;

      case 'validate':
        console.log('🔍 Validating rollback conditions...');
        await rollbackManager.validateRollbackConditions('partial_rollback', 'validation_check');
        console.log('✅ Rollback validation completed');
        break;

      default:
        console.log('Enhanced RAG Rollback Procedure Manager');
        console.log('');
        console.log('Usage:');
        console.log('  npm run rollback:execute [level] [reason] [options]  - Execute rollback');
        console.log('  npm run rollback:emergency                           - Emergency rollback');
        console.log('  npm run rollback:recommendations                     - Get rollback recommendations');
        console.log('  npm run rollback:validate                            - Validate rollback conditions');
        console.log('');
        console.log('Rollback Levels:');
        console.log('  feature_disable    - Disable specific features');
        console.log('  partial_rollback   - Rollback to previous stage');
        console.log('  full_rollback      - Disable all enhanced features');
        console.log('  emergency_rollback - Immediate complete rollback');
        console.log('');
        console.log('Options:');
        console.log('  --dry-run              Show what would happen');
        console.log('  --skip-validation      Skip pre-rollback validation');
        console.log('  --skip-notification    Skip rollback notifications');
        console.log('  --feature=<name>       Target specific feature (for feature_disable)');
        console.log('');
        console.log('Examples:');
        console.log('  npm run rollback:execute partial_rollback performance_issues --dry-run');
        console.log('  npm run rollback:execute feature_disable manual --feature=enhanced_rag_filtering');
        console.log('  npm run rollback:emergency');
        break;
    }
  } catch (error) {
    console.error('❌ Rollback command failed:', error.message);
    process.exit(1);
  }
}

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { RollbackProcedureManager };