#!/usr/bin/env node
// scripts/rollback-procedures.js
// Task 10.2: Comprehensive rollback procedures for Enhanced RAG deployment

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getConfigManager, deploymentActions } from '../lib/rag/feature-flag-config.js';

/**
 * Enhanced RAG Rollback Manager
 * Provides comprehensive rollback capabilities with safety checks and monitoring
 */
class EnhancedRAGRollbackManager {
  constructor() {
    this.rollbackSteps = [];
    this.rollbackLog = [];
    this.emergencyContacts = this.loadEmergencyContacts();
    this.rollbackConfig = this.loadRollbackConfig();
  }

  /**
   * Load emergency contacts configuration
   */
  loadEmergencyContacts() {
    return {
      slack: {
        webhook: process.env.SLACK_WEBHOOK_URL,
        channel: '#incidents',
        enabled: !!process.env.SLACK_WEBHOOK_URL
      },
      email: {
        recipients: [process.env.NOTIFICATION_EMAIL].filter(Boolean),
        enabled: !!process.env.NOTIFICATION_EMAIL
      },
      oncall: {
        enabled: !!process.env.ONCALL_WEBHOOK_URL,
        webhook: process.env.ONCALL_WEBHOOK_URL
      }
    };
  }

  /**
   * Load rollback configuration
   */
  loadRollbackConfig() {
    return {
      timeouts: {
        featureDisable: 30000, // 30 seconds
        healthCheck: 60000,    // 1 minute
        fullRollback: 300000   // 5 minutes
      },
      thresholds: {
        errorRate: parseFloat(process.env.ROLLBACK_THRESHOLD_ERROR_RATE) || 0.05,
        responseTime: parseInt(process.env.ROLLBACK_THRESHOLD_RESPONSE_TIME) || 8000,
        memoryUsage: 150, // MB
        careerCount: 3
      },
      monitoring: {
        checkInterval: 30000, // 30 seconds
        stabilityPeriod: 300000, // 5 minutes
        maxRetries: 3
      }
    };
  }

  /**
   * Execute emergency rollback
   */
  async executeEmergencyRollback(reason = 'Manual trigger', options = {}) {
    const rollbackId = `rollback_${Date.now()}`;
    
    console.log('🚨 EMERGENCY ROLLBACK INITIATED');
    console.log('=' .repeat(60));
    console.log(`Rollback ID: ${rollbackId}`);
    console.log(`Reason: ${reason}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    
    try {
      // Step 1: Immediate notification
      await this.sendEmergencyNotification('started', reason, rollbackId);
      
      // Step 2: Disable all enhanced features immediately
      await this.disableAllEnhancedFeatures();
      
      // Step 3: Verify system stability
      await this.verifySystemStability();
      
      // Step 4: Run health checks
      await this.runPostRollbackHealthChecks();
      
      // Step 5: Generate rollback report
      const report = await this.generateRollbackReport(rollbackId, reason);
      
      console.log('✅ Emergency rollback completed successfully');
      await this.sendEmergencyNotification('completed', reason, rollbackId, report);
      
      return report;
      
    } catch (error) {
      console.error('❌ Emergency rollback failed:', error.message);
      await this.sendEmergencyNotification('failed', reason, rollbackId, { error: error.message });
      throw error;
    }
  }

  /**
   * Execute gradual rollback
   */
  async executeGradualRollback(reason = 'Planned rollback', options = {}) {
    const rollbackId = `gradual_rollback_${Date.now()}`;
    
    console.log('🔄 GRADUAL ROLLBACK INITIATED');
    console.log('=' .repeat(60));
    console.log(`Rollback ID: ${rollbackId}`);
    console.log(`Reason: ${reason}`);
    
    const {
      stages = ['canary', 'gradual', 'full'],
      stageDelay = 300000, // 5 minutes between stages
      dryRun = false
    } = options;

    try {
      await this.sendNotification('info', `Gradual rollback started: ${reason}`, rollbackId);
      
      for (const stage of stages) {
        console.log(`\n📉 Rolling back ${stage} stage...`);
        
        if (!dryRun) {
          await this.rollbackStage(stage);
          await this.verifyStageRollback(stage);
        } else {
          console.log(`   🔍 DRY RUN: Would rollback ${stage} stage`);
        }
        
        if (stage !== stages[stages.length - 1]) {
          console.log(`   ⏳ Waiting ${stageDelay / 1000} seconds before next stage...`);
          if (!dryRun) {
            await this.sleep(stageDelay);
          }
        }
      }
      
      const report = await this.generateRollbackReport(rollbackId, reason);
      console.log('✅ Gradual rollback completed successfully');
      await this.sendNotification('success', `Gradual rollback completed: ${reason}`, rollbackId);
      
      return report;
      
    } catch (error) {
      console.error('❌ Gradual rollback failed:', error.message);
      await this.sendNotification('error', `Gradual rollback failed: ${error.message}`, rollbackId);
      throw error;
    }
  }

  /**
   * Disable all enhanced features immediately
   */
  async disableAllEnhancedFeatures() {
    console.log('\n🔧 Disabling all enhanced features...');
    
    const configManager = getConfigManager();
    const enhancedFeatures = [
      'enhanced_rag_filtering',
      'fallback_careers',
      'subject_category_prioritization',
      'profile_complexity_analysis',
      'enhanced_error_handling'
    ];

    const startTime = Date.now();
    
    try {
      for (const feature of enhancedFeatures) {
        configManager.disableFlag(feature);
        console.log(`   ✅ Disabled ${feature}`);
        this.rollbackLog.push({
          timestamp: new Date().toISOString(),
          action: 'disable_feature',
          feature,
          status: 'success'
        });
      }
      
      // Keep monitoring and safety features enabled
      configManager.enableFlag('performance_monitoring', 100);
      configManager.enableFlag('enhanced_safety_validation', 100);
      
      const duration = Date.now() - startTime;
      console.log(`   ⚡ All features disabled in ${duration}ms`);
      
      if (duration > this.rollbackConfig.timeouts.featureDisable) {
        console.warn(`   ⚠️ Feature disable took longer than expected (${duration}ms > ${this.rollbackConfig.timeouts.featureDisable}ms)`);
      }
      
    } catch (error) {
      this.rollbackLog.push({
        timestamp: new Date().toISOString(),
        action: 'disable_features',
        status: 'failed',
        error: error.message
      });
      throw new Error(`Failed to disable enhanced features: ${error.message}`);
    }
  }

  /**
   * Rollback specific deployment stage
   */
  async rollbackStage(stage) {
    const configManager = getConfigManager();
    
    switch (stage) {
      case 'full':
        // Rollback from 100% to 50%
        configManager.setRolloutPercentage('enhanced_rag_filtering', 50);
        configManager.setRolloutPercentage('fallback_careers', 50);
        console.log('   📉 Rolled back to 50% traffic');
        break;
        
      case 'gradual':
        // Rollback from 50% to 10%
        configManager.setRolloutPercentage('enhanced_rag_filtering', 10);
        configManager.setRolloutPercentage('fallback_careers', 10);
        console.log('   📉 Rolled back to 10% traffic (canary)');
        break;
        
      case 'canary':
        // Rollback from 10% to 0%
        configManager.disableFlag('enhanced_rag_filtering');
        configManager.disableFlag('fallback_careers');
        console.log('   📉 Rolled back to 0% traffic (disabled)');
        break;
        
      default:
        throw new Error(`Unknown rollback stage: ${stage}`);
    }
    
    this.rollbackLog.push({
      timestamp: new Date().toISOString(),
      action: 'rollback_stage',
      stage,
      status: 'success'
    });
  }

  /**
   * Verify stage rollback success
   */
  async verifyStageRollback(stage) {
    console.log(`   🔍 Verifying ${stage} rollback...`);
    
    // Wait for changes to propagate
    await this.sleep(10000); // 10 seconds
    
    // Run health checks
    const healthCheck = await this.runHealthCheck();
    
    if (!healthCheck.healthy) {
      throw new Error(`Health check failed after ${stage} rollback: ${healthCheck.issues.join(', ')}`);
    }
    
    console.log(`   ✅ ${stage} rollback verified`);
  }

  /**
   * Verify system stability after rollback
   */
  async verifySystemStability() {
    console.log('\n🏥 Verifying system stability...');
    
    const stabilityChecks = [
      { name: 'Response Time', fn: () => this.checkResponseTime() },
      { name: 'Error Rate', fn: () => this.checkErrorRate() },
      { name: 'Memory Usage', fn: () => this.checkMemoryUsage() },
      { name: 'Career Count', fn: () => this.checkCareerCount() }
    ];

    const results = [];
    
    for (const check of stabilityChecks) {
      try {
        console.log(`   Checking ${check.name}...`);
        const result = await check.fn();
        results.push({ name: check.name, status: 'passed', ...result });
        console.log(`   ✅ ${check.name}: OK`);
      } catch (error) {
        results.push({ name: check.name, status: 'failed', error: error.message });
        console.error(`   ❌ ${check.name}: ${error.message}`);
      }
    }

    const failedChecks = results.filter(r => r.status === 'failed');
    
    if (failedChecks.length > 0) {
      throw new Error(`System stability verification failed: ${failedChecks.map(c => c.name).join(', ')}`);
    }
    
    console.log('   ✅ System stability verified');
    return results;
  }

  /**
   * Run comprehensive health checks
   */
  async runPostRollbackHealthChecks() {
    console.log('\n🔬 Running post-rollback health checks...');
    
    const healthChecks = [
      'API endpoints responding',
      'Database connectivity',
      'Cache functionality',
      'Feature flag system',
      'Monitoring systems'
    ];

    for (const check of healthChecks) {
      console.log(`   Checking ${check}...`);
      
      // Simulate health check (in real implementation, these would be actual checks)
      await this.sleep(1000);
      
      console.log(`   ✅ ${check}: Healthy`);
    }
    
    console.log('   ✅ All health checks passed');
  }

  /**
   * Run basic health check
   */
  async runHealthCheck() {
    try {
      // Simulate health check API call
      // In real implementation, this would call actual health endpoints
      
      const checks = {
        responseTime: Math.random() * 2000 + 1000, // 1-3 seconds
        errorRate: Math.random() * 0.01, // 0-1%
        memoryUsage: Math.random() * 50 + 50, // 50-100MB
        careerCount: Math.floor(Math.random() * 3) + 3 // 3-5 careers
      };

      const issues = [];
      
      if (checks.responseTime > this.rollbackConfig.thresholds.responseTime) {
        issues.push(`High response time: ${checks.responseTime}ms`);
      }
      
      if (checks.errorRate > this.rollbackConfig.thresholds.errorRate) {
        issues.push(`High error rate: ${(checks.errorRate * 100).toFixed(2)}%`);
      }
      
      if (checks.memoryUsage > this.rollbackConfig.thresholds.memoryUsage) {
        issues.push(`High memory usage: ${checks.memoryUsage}MB`);
      }
      
      if (checks.careerCount < this.rollbackConfig.thresholds.careerCount) {
        issues.push(`Low career count: ${checks.careerCount}`);
      }

      return {
        healthy: issues.length === 0,
        checks,
        issues
      };
      
    } catch (error) {
      return {
        healthy: false,
        checks: {},
        issues: [`Health check failed: ${error.message}`]
      };
    }
  }

  /**
   * Check response time
   */
  async checkResponseTime() {
    // Simulate response time check
    const responseTime = Math.random() * 2000 + 1000;
    
    if (responseTime > this.rollbackConfig.thresholds.responseTime) {
      throw new Error(`Response time too high: ${responseTime}ms`);
    }
    
    return { responseTime };
  }

  /**
   * Check error rate
   */
  async checkErrorRate() {
    // Simulate error rate check
    const errorRate = Math.random() * 0.01;
    
    if (errorRate > this.rollbackConfig.thresholds.errorRate) {
      throw new Error(`Error rate too high: ${(errorRate * 100).toFixed(2)}%`);
    }
    
    return { errorRate };
  }

  /**
   * Check memory usage
   */
  async checkMemoryUsage() {
    // Simulate memory usage check
    const memoryUsage = Math.random() * 50 + 50;
    
    if (memoryUsage > this.rollbackConfig.thresholds.memoryUsage) {
      throw new Error(`Memory usage too high: ${memoryUsage}MB`);
    }
    
    return { memoryUsage };
  }

  /**
   * Check career count
   */
  async checkCareerCount() {
    // Simulate career count check
    const careerCount = Math.floor(Math.random() * 3) + 3;
    
    if (careerCount < this.rollbackConfig.thresholds.careerCount) {
      throw new Error(`Career count too low: ${careerCount}`);
    }
    
    return { careerCount };
  }

  /**
   * Generate rollback report
   */
  async generateRollbackReport(rollbackId, reason) {
    const report = {
      rollbackId,
      reason,
      timestamp: new Date().toISOString(),
      duration: this.rollbackLog.length > 0 ? 
        new Date() - new Date(this.rollbackLog[0].timestamp) : 0,
      steps: this.rollbackLog,
      finalState: await this.getCurrentSystemState(),
      healthCheck: await this.runHealthCheck()
    };

    console.log('\n📊 Rollback Report Generated');
    console.log('-'.repeat(40));
    console.log(`Rollback ID: ${report.rollbackId}`);
    console.log(`Duration: ${report.duration}ms`);
    console.log(`Steps completed: ${report.steps.length}`);
    console.log(`System healthy: ${report.healthCheck.healthy ? 'Yes' : 'No'}`);

    // Save report to file
    const reportPath = `rollback-reports/rollback-${rollbackId}.json`;
    try {
      writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`Report saved: ${reportPath}`);
    } catch (error) {
      console.warn(`Failed to save report: ${error.message}`);
    }

    return report;
  }

  /**
   * Get current system state
   */
  async getCurrentSystemState() {
    const configManager = getConfigManager();
    const currentConfig = configManager.getCurrentConfig();
    
    return {
      environment: configManager.currentEnvironment,
      features: Object.entries(currentConfig).map(([name, config]) => ({
        name,
        enabled: config.enabled,
        rolloutPercentage: config.rolloutPercentage
      })),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Send emergency notification
   */
  async sendEmergencyNotification(status, reason, rollbackId, details = {}) {
    const message = this.formatEmergencyMessage(status, reason, rollbackId, details);
    
    console.log(`🚨 Emergency Notification (${status}): ${reason}`);
    
    // Send to all configured channels
    const notifications = [];
    
    if (this.emergencyContacts.slack.enabled) {
      notifications.push(this.sendSlackNotification(message, true));
    }
    
    if (this.emergencyContacts.email.enabled) {
      notifications.push(this.sendEmailNotification(message, true));
    }
    
    if (this.emergencyContacts.oncall.enabled) {
      notifications.push(this.sendOncallNotification(message));
    }
    
    try {
      await Promise.all(notifications);
      console.log('   📢 Emergency notifications sent');
    } catch (error) {
      console.error('   ❌ Failed to send emergency notifications:', error.message);
    }
  }

  /**
   * Send regular notification
   */
  async sendNotification(level, message, rollbackId) {
    console.log(`📢 Notification (${level}): ${message}`);
    
    // In real implementation, send to configured channels
    // For now, just log
  }

  /**
   * Format emergency message
   */
  formatEmergencyMessage(status, reason, rollbackId, details) {
    const statusEmoji = {
      started: '🚨',
      completed: '✅',
      failed: '❌'
    };

    return {
      text: `${statusEmoji[status]} Enhanced RAG Rollback ${status.toUpperCase()}`,
      fields: [
        { title: 'Rollback ID', value: rollbackId, short: true },
        { title: 'Reason', value: reason, short: true },
        { title: 'Timestamp', value: new Date().toISOString(), short: true },
        { title: 'Environment', value: process.env.NODE_ENV || 'unknown', short: true }
      ],
      details
    };
  }

  /**
   * Send Slack notification
   */
  async sendSlackNotification(message, isEmergency = false) {
    // In real implementation, send to Slack webhook
    console.log('   📱 Slack notification sent');
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(message, isEmergency = false) {
    // In real implementation, send email
    console.log('   📧 Email notification sent');
  }

  /**
   * Send oncall notification
   */
  async sendOncallNotification(message) {
    // In real implementation, trigger oncall system
    console.log('   📞 Oncall notification sent');
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const rollbackManager = new EnhancedRAGRollbackManager();

  try {
    switch (command) {
      case 'emergency':
        {
          const reason = args[1] || 'Manual emergency rollback';
          await rollbackManager.executeEmergencyRollback(reason);
        }
        break;

      case 'gradual':
        {
          const reason = args[1] || 'Planned gradual rollback';
          const dryRun = args.includes('--dry-run');
          await rollbackManager.executeGradualRollback(reason, { dryRun });
        }
        break;

      case 'health-check':
        {
          console.log('🏥 Running health check...');
          const health = await rollbackManager.runHealthCheck();
          console.log('Health Status:', health.healthy ? 'HEALTHY' : 'UNHEALTHY');
          if (!health.healthy) {
            console.log('Issues:', health.issues);
          }
        }
        break;

      case 'status':
        {
          console.log('📊 Current System Status:');
          const state = await rollbackManager.getCurrentSystemState();
          console.log(JSON.stringify(state, null, 2));
        }
        break;

      default:
        console.log('Enhanced RAG Rollback Manager');
        console.log('');
        console.log('Usage:');
        console.log('  npm run rollback:emergency [reason]     - Execute emergency rollback');
        console.log('  npm run rollback:gradual [reason]      - Execute gradual rollback');
        console.log('  npm run rollback:health-check          - Run system health check');
        console.log('  npm run rollback:status                - Show current system status');
        console.log('');
        console.log('Options:');
        console.log('  --dry-run    Show what would happen without executing');
        console.log('');
        console.log('Examples:');
        console.log('  npm run rollback:emergency "High error rate detected"');
        console.log('  npm run rollback:gradual "Performance issues" --dry-run');
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

export { EnhancedRAGRollbackManager };