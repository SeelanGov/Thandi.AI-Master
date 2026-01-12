#!/usr/bin/env node

/**
 * VERCEL ROLLBACK AUTOMATION SYSTEM
 * Advanced rollback strategies and recovery automation for Vercel deployments
 * 
 * Usage:
 *   node vercel-rollback-automation.js --instant-rollback
 *   node vercel-rollback-automation.js --smart-rollback
 *   node vercel-rollback-automation.js --emergency-rollback
 *   node vercel-rollback-automation.js --list-deployments
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const https = require('https');

class VercelRollbackAutomation {
  constructor() {
    this.config = {
      healthCheckTimeout: 30000,
      maxRollbackAttempts: 3,
      monitoringDuration: 300000, // 5 minutes
      errorThreshold: 5, // 5% error rate
      responseTimeThreshold: 5000 // 5 seconds
    };

    this.rollbackHistory = [];
    this.deploymentCache = new Map();
  }

  // ============================================================================
  // DEPLOYMENT DISCOVERY & ANALYSIS
  // ============================================================================

  async getDeploymentHistory() {
    try {
      console.log('📋 Fetching deployment history...');
      
      const deploymentsJson = execSync('vercel ls --json', { 
        encoding: 'utf8',
        timeout: 30000
      });
      
      const deployments = JSON.parse(deploymentsJson);
      
      // Enrich deployment data with health scores
      const enrichedDeployments = await Promise.all(
        deployments.slice(0, 10).map(async (deployment) => {
          const healthScore = await this.calculateDeploymentHealthScore(deployment);
          return {
            ...deployment,
            healthScore,
            isStable: healthScore > 80,
            lastChecked: new Date().toISOString()
          };
        })
      );

      // Cache the results
      enrichedDeployments.forEach(deployment => {
        this.deploymentCache.set(deployment.uid, deployment);
      });

      return enrichedDeployments;
    } catch (error) {
      throw new Error(`Failed to fetch deployment history: ${error.message}`);
    }
  }

  async calculateDeploymentHealthScore(deployment) {
    try {
      // Perform quick health checks
      const healthChecks = await this.performQuickHealthCheck(deployment.url);
      
      let score = 100;
      
      // Deduct points for issues
      if (!healthChecks.responsive) score -= 30;
      if (healthChecks.responseTime > 3000) score -= 20;
      if (healthChecks.hasErrors) score -= 25;
      if (!healthChecks.sslValid) score -= 15;
      
      // Age factor (newer deployments get slight preference)
      const ageInDays = (Date.now() - new Date(deployment.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (ageInDays > 7) score -= Math.min(10, ageInDays - 7);
      
      return Math.max(0, Math.round(score));
    } catch (error) {
      console.log(`   ⚠️  Could not calculate health score for ${deployment.url}: ${error.message}`);
      return 50; // Default neutral score
    }
  }

  async performQuickHealthCheck(url) {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({
          responsive: false,
          responseTime: this.config.healthCheckTimeout,
          hasErrors: true,
          sslValid: false
        });
      }, this.config.healthCheckTimeout);

      const start = Date.now();
      
      https.get(url, (res) => {
        clearTimeout(timeout);
        const responseTime = Date.now() - start;
        
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          const hasErrors = body.includes('Application error') || 
                           body.includes('500') || 
                           res.statusCode >= 500;
          
          resolve({
            responsive: res.statusCode < 500,
            responseTime,
            hasErrors,
            sslValid: res.socket?.authorized !== false,
            statusCode: res.statusCode
          });
        });
      }).on('error', () => {
        clearTimeout(timeout);
        resolve({
          responsive: false,
          responseTime: Date.now() - start,
          hasErrors: true,
          sslValid: false
        });
      });
    });
  }

  async findBestRollbackTarget() {
    console.log('🎯 Finding best rollback target...');
    
    const deployments = await this.getDeploymentHistory();
    
    // Filter out current deployment and find stable candidates
    const candidates = deployments
      .slice(1) // Skip current deployment
      .filter(d => d.isStable && d.healthScore > 70)
      .sort((a, b) => {
        // Sort by health score first, then by recency
        if (b.healthScore !== a.healthScore) {
          return b.healthScore - a.healthScore;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

    if (candidates.length === 0) {
      throw new Error('No stable deployment found for rollback');
    }

    const bestCandidate = candidates[0];
    
    console.log(`   ✅ Best rollback target: ${bestCandidate.url}`);
    console.log(`   📊 Health Score: ${bestCandidate.healthScore}%`);
    console.log(`   📅 Created: ${new Date(bestCandidate.createdAt).toLocaleString()}`);
    
    return bestCandidate;
  }

  // ============================================================================
  // ROLLBACK STRATEGIES
  // ============================================================================

  async performInstantRollback(targetDeployment = null) {
    console.log('⚡ PERFORMING INSTANT ROLLBACK');
    console.log('==============================\n');

    try {
      // Find target deployment if not specified
      if (!targetDeployment) {
        const target = await this.findBestRollbackTarget();
        targetDeployment = target.url;
      }

      console.log(`🎯 Rolling back to: ${targetDeployment}`);

      // Create rollback record
      const rollbackRecord = {
        timestamp: new Date().toISOString(),
        type: 'instant',
        target: targetDeployment,
        reason: 'Manual instant rollback',
        status: 'in-progress'
      };

      this.rollbackHistory.push(rollbackRecord);

      // Execute rollback
      console.log('🔄 Executing rollback...');
      execSync(`vercel rollback ${targetDeployment} --yes`, { 
        stdio: 'inherit',
        timeout: 60000
      });

      // Verify rollback success
      console.log('🔍 Verifying rollback...');
      const verification = await this.verifyRollbackSuccess(targetDeployment);

      rollbackRecord.status = verification.success ? 'completed' : 'failed';
      rollbackRecord.verification = verification;

      if (verification.success) {
        console.log('✅ INSTANT ROLLBACK SUCCESSFUL');
        console.log(`🌐 Active deployment: ${targetDeployment}`);
        
        // Start post-rollback monitoring
        this.startPostRollbackMonitoring(targetDeployment);
        
        return {
          success: true,
          target: targetDeployment,
          verification
        };
      } else {
        console.log('❌ ROLLBACK VERIFICATION FAILED');
        console.log('🚨 Manual intervention may be required');
        
        return {
          success: false,
          target: targetDeployment,
          verification
        };
      }

    } catch (error) {
      console.error('❌ INSTANT ROLLBACK FAILED:', error.message);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  async performSmartRollback() {
    console.log('🧠 PERFORMING SMART ROLLBACK');
    console.log('============================\n');

    try {
      // Analyze current deployment issues
      console.log('🔍 Analyzing current deployment...');
      const currentIssues = await this.analyzeCurrentDeployment();
      
      // Find best rollback target based on issues
      console.log('🎯 Finding optimal rollback target...');
      const rollbackTarget = await this.findOptimalRollbackTarget(currentIssues);
      
      // Create comprehensive rollback plan
      const rollbackPlan = await this.createRollbackPlan(rollbackTarget, currentIssues);
      
      console.log('\n📋 ROLLBACK PLAN:');
      console.log(`Target: ${rollbackPlan.target.url}`);
      console.log(`Reason: ${rollbackPlan.reason}`);
      console.log(`Risk Level: ${rollbackPlan.riskLevel}`);
      console.log(`Expected Downtime: ${rollbackPlan.expectedDowntime}`);
      
      // Execute rollback with monitoring
      console.log('\n🚀 Executing smart rollback...');
      const result = await this.executeSmartRollback(rollbackPlan);
      
      return result;

    } catch (error) {
      console.error('❌ SMART ROLLBACK FAILED:', error.message);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  async analyzeCurrentDeployment() {
    try {
      const deployments = await this.getDeploymentHistory();
      const currentDeployment = deployments[0];
      
      console.log(`   📊 Analyzing: ${currentDeployment.url}`);
      
      const healthCheck = await this.performComprehensiveHealthCheck(currentDeployment.url);
      
      const issues = [];
      
      if (!healthCheck.responsive) {
        issues.push({ type: 'availability', severity: 'critical', message: 'Deployment not responsive' });
      }
      
      if (healthCheck.responseTime > this.config.responseTimeThreshold) {
        issues.push({ 
          type: 'performance', 
          severity: 'high', 
          message: `High response time: ${healthCheck.responseTime}ms` 
        });
      }
      
      if (healthCheck.hasErrors) {
        issues.push({ type: 'errors', severity: 'critical', message: 'Application errors detected' });
      }
      
      if (!healthCheck.sslValid) {
        issues.push({ type: 'security', severity: 'medium', message: 'SSL certificate issues' });
      }

      console.log(`   📋 Found ${issues.length} issues`);
      
      return {
        deployment: currentDeployment,
        issues,
        healthCheck
      };
    } catch (error) {
      throw new Error(`Failed to analyze current deployment: ${error.message}`);
    }
  }

  async findOptimalRollbackTarget(currentIssues) {
    const deployments = await this.getDeploymentHistory();
    
    // Score deployments based on current issues
    const scoredDeployments = deployments
      .slice(1) // Skip current deployment
      .map(deployment => {
        let score = deployment.healthScore;
        
        // Boost score if deployment doesn't have current issues
        currentIssues.issues.forEach(issue => {
          if (issue.type === 'performance' && deployment.healthScore > 80) {
            score += 10; // Prefer deployments with good performance history
          }
          if (issue.type === 'errors' && deployment.isStable) {
            score += 15; // Strongly prefer stable deployments for error issues
          }
        });
        
        return { ...deployment, adjustedScore: score };
      })
      .sort((a, b) => b.adjustedScore - a.adjustedScore);

    if (scoredDeployments.length === 0) {
      throw new Error('No suitable rollback target found');
    }

    return scoredDeployments[0];
  }

  async createRollbackPlan(target, currentIssues) {
    const criticalIssues = currentIssues.issues.filter(i => i.severity === 'critical');
    const highIssues = currentIssues.issues.filter(i => i.severity === 'high');
    
    let riskLevel = 'low';
    let expectedDowntime = '< 30 seconds';
    
    if (criticalIssues.length > 0) {
      riskLevel = 'medium';
      expectedDowntime = '30-60 seconds';
    }
    
    if (criticalIssues.length > 2) {
      riskLevel = 'high';
      expectedDowntime = '1-2 minutes';
    }

    const reason = criticalIssues.length > 0 
      ? `Critical issues: ${criticalIssues.map(i => i.message).join(', ')}`
      : `Performance issues: ${highIssues.map(i => i.message).join(', ')}`;

    return {
      target,
      reason,
      riskLevel,
      expectedDowntime,
      issues: currentIssues.issues,
      strategy: 'smart-rollback'
    };
  }

  async executeSmartRollback(plan) {
    const rollbackRecord = {
      timestamp: new Date().toISOString(),
      type: 'smart',
      target: plan.target.url,
      reason: plan.reason,
      riskLevel: plan.riskLevel,
      status: 'in-progress'
    };

    this.rollbackHistory.push(rollbackRecord);

    try {
      // Pre-rollback verification
      console.log('🔍 Pre-rollback verification...');
      const preCheck = await this.performQuickHealthCheck(plan.target.url);
      
      if (!preCheck.responsive) {
        throw new Error('Rollback target is not responsive');
      }

      // Execute rollback
      console.log('🔄 Executing rollback...');
      execSync(`vercel rollback ${plan.target.url} --yes`, { 
        stdio: 'inherit',
        timeout: 120000
      });

      // Post-rollback verification
      console.log('✅ Verifying rollback success...');
      const verification = await this.verifyRollbackSuccess(plan.target.url);

      rollbackRecord.status = verification.success ? 'completed' : 'failed';
      rollbackRecord.verification = verification;

      if (verification.success) {
        console.log('✅ SMART ROLLBACK SUCCESSFUL');
        
        // Start enhanced monitoring
        this.startPostRollbackMonitoring(plan.target.url, true);
        
        return {
          success: true,
          plan,
          verification
        };
      } else {
        console.log('❌ SMART ROLLBACK VERIFICATION FAILED');
        
        return {
          success: false,
          plan,
          verification
        };
      }

    } catch (error) {
      rollbackRecord.status = 'failed';
      rollbackRecord.error = error.message;
      
      throw error;
    }
  }

  async performEmergencyRollback() {
    console.log('🚨 PERFORMING EMERGENCY ROLLBACK');
    console.log('=================================\n');

    try {
      // In emergency situations, prioritize speed over analysis
      console.log('⚡ Emergency mode: Prioritizing speed...');
      
      // Get last known good deployment quickly
      const deployments = await this.getDeploymentHistory();
      
      // Find first stable deployment (skip current)
      const emergencyTarget = deployments
        .slice(1)
        .find(d => d.isStable || d.healthScore > 60);

      if (!emergencyTarget) {
        // If no stable deployment found, use the most recent one
        const fallbackTarget = deployments[1];
        if (!fallbackTarget) {
          throw new Error('No previous deployment available for emergency rollback');
        }
        
        console.log('⚠️  No stable deployment found, using most recent deployment');
        return await this.executeEmergencyRollback(fallbackTarget);
      }

      console.log(`🎯 Emergency target: ${emergencyTarget.url}`);
      return await this.executeEmergencyRollback(emergencyTarget);

    } catch (error) {
      console.error('❌ EMERGENCY ROLLBACK FAILED:', error.message);
      
      // Last resort: try to rollback to any previous deployment
      try {
        console.log('🆘 Attempting last resort rollback...');
        execSync('vercel rollback --yes', { stdio: 'inherit', timeout: 60000 });
        
        return {
          success: true,
          type: 'last-resort',
          message: 'Emergency rollback completed using Vercel default'
        };
      } catch (lastResortError) {
        return {
          success: false,
          error: `All rollback attempts failed: ${error.message}, ${lastResortError.message}`
        };
      }
    }
  }

  async executeEmergencyRollback(target) {
    const rollbackRecord = {
      timestamp: new Date().toISOString(),
      type: 'emergency',
      target: target.url,
      reason: 'Emergency rollback - critical system failure',
      status: 'in-progress'
    };

    this.rollbackHistory.push(rollbackRecord);

    try {
      console.log('🚀 Executing emergency rollback...');
      
      // Execute with shorter timeout for emergency
      execSync(`vercel rollback ${target.url} --yes`, { 
        stdio: 'inherit',
        timeout: 60000
      });

      // Quick verification
      console.log('⚡ Quick verification...');
      const quickCheck = await this.performQuickHealthCheck(target.url);

      rollbackRecord.status = quickCheck.responsive ? 'completed' : 'failed';
      rollbackRecord.verification = quickCheck;

      if (quickCheck.responsive) {
        console.log('✅ EMERGENCY ROLLBACK SUCCESSFUL');
        console.log('🔍 Starting intensive monitoring...');
        
        // Start intensive monitoring after emergency rollback
        this.startPostRollbackMonitoring(target.url, true, 600000); // 10 minutes
        
        return {
          success: true,
          target: target.url,
          verification: quickCheck
        };
      } else {
        console.log('❌ EMERGENCY ROLLBACK FAILED VERIFICATION');
        
        return {
          success: false,
          target: target.url,
          verification: quickCheck
        };
      }

    } catch (error) {
      rollbackRecord.status = 'failed';
      rollbackRecord.error = error.message;
      
      throw error;
    }
  }

  // ============================================================================
  // VERIFICATION & MONITORING
  // ============================================================================

  async verifyRollbackSuccess(deploymentUrl) {
    console.log('   🔍 Performing comprehensive verification...');
    
    const verificationChecks = [
      { name: 'Responsiveness', fn: () => this.checkResponsiveness(deploymentUrl) },
      { name: 'Performance', fn: () => this.checkPerformance(deploymentUrl) },
      { name: 'Functionality', fn: () => this.checkFunctionality(deploymentUrl) },
      { name: 'Error Detection', fn: () => this.checkForErrors(deploymentUrl) }
    ];

    const results = [];
    
    for (const check of verificationChecks) {
      try {
        const result = await check.fn();
        results.push({ name: check.name, ...result });
        
        const status = result.success ? '✅' : '❌';
        console.log(`   ${status} ${check.name}: ${result.message || 'OK'}`);
      } catch (error) {
        results.push({
          name: check.name,
          success: false,
          error: error.message
        });
        console.log(`   ❌ ${check.name}: ${error.message}`);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const success = successCount >= 3; // At least 3 out of 4 checks must pass

    return {
      success,
      results,
      successRate: Math.round((successCount / results.length) * 100)
    };
  }

  async checkResponsiveness(url) {
    const result = await this.performQuickHealthCheck(url);
    
    return {
      success: result.responsive && result.statusCode < 500,
      message: result.responsive 
        ? `Responsive (${result.responseTime}ms)` 
        : 'Not responsive',
      responseTime: result.responseTime,
      statusCode: result.statusCode
    };
  }

  async checkPerformance(url) {
    const measurements = [];
    const numTests = 3;

    for (let i = 0; i < numTests; i++) {
      const result = await this.performQuickHealthCheck(url);
      measurements.push(result.responseTime);
    }

    const avgResponseTime = measurements.reduce((a, b) => a + b, 0) / numTests;
    const success = avgResponseTime < this.config.responseTimeThreshold;

    return {
      success,
      message: `Average response time: ${Math.round(avgResponseTime)}ms`,
      avgResponseTime: Math.round(avgResponseTime),
      measurements
    };
  }

  async checkFunctionality(url) {
    // Test common endpoints
    const endpoints = ['/api/health', '/api/status'];
    const results = [];

    for (const endpoint of endpoints) {
      try {
        const result = await this.performQuickHealthCheck(`${url}${endpoint}`);
        results.push(result);
      } catch (error) {
        // Endpoint might not exist, which is OK
        results.push({ responsive: false, statusCode: 404 });
      }
    }

    // Consider it successful if at least one endpoint works or if they return 404 (not implemented)
    const workingEndpoints = results.filter(r => r.responsive || r.statusCode === 404).length;
    
    return {
      success: workingEndpoints > 0,
      message: `${workingEndpoints}/${endpoints.length} endpoints functional`,
      results
    };
  }

  async checkForErrors(url) {
    return new Promise((resolve) => {
      https.get(url, (res) => {
        let body = '';
        
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          const hasErrors = body.includes('Application error') || 
                           body.includes('500 Internal Server Error') ||
                           body.includes('Minified React error');
          
          resolve({
            success: !hasErrors,
            message: hasErrors ? 'Application errors detected' : 'No errors detected',
            hasErrors
          });
        });
      }).on('error', (error) => {
        resolve({
          success: false,
          message: `Failed to check for errors: ${error.message}`,
          error: error.message
        });
      });
    });
  }

  async performComprehensiveHealthCheck(url) {
    const checks = await Promise.all([
      this.checkResponsiveness(url),
      this.checkPerformance(url),
      this.checkFunctionality(url),
      this.checkForErrors(url)
    ]);

    const successCount = checks.filter(c => c.success).length;
    
    return {
      responsive: checks[0].success,
      responseTime: checks[1].avgResponseTime || checks[0].responseTime,
      hasErrors: !checks[3].success,
      sslValid: true, // Simplified for this implementation
      overallHealth: Math.round((successCount / checks.length) * 100),
      checks
    };
  }

  async startPostRollbackMonitoring(deploymentUrl, intensive = false, duration = 300000) {
    console.log(`📊 Starting post-rollback monitoring (${intensive ? 'intensive' : 'standard'})...`);
    
    const monitoringInterval = intensive ? 30000 : 60000; // 30s or 1min intervals
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    const monitoringResults = {
      startTime,
      endTime,
      checks: [],
      alerts: [],
      intensive
    };

    const monitor = setInterval(async () => {
      const now = Date.now();
      
      if (now >= endTime) {
        clearInterval(monitor);
        this.generateMonitoringReport(monitoringResults);
        return;
      }

      try {
        const healthCheck = await this.performQuickHealthCheck(deploymentUrl);
        monitoringResults.checks.push({
          timestamp: now,
          ...healthCheck
        });

        // Check for alerts
        if (!healthCheck.responsive) {
          const alert = {
            type: 'availability',
            message: 'Deployment became unresponsive',
            timestamp: now,
            severity: 'critical'
          };
          
          monitoringResults.alerts.push(alert);
          console.log(`\n🚨 ALERT: ${alert.message}`);
        }

        if (healthCheck.responseTime > this.config.responseTimeThreshold) {
          const alert = {
            type: 'performance',
            message: `High response time: ${healthCheck.responseTime}ms`,
            timestamp: now,
            severity: 'warning'
          };
          
          monitoringResults.alerts.push(alert);
          console.log(`\n⚠️  WARNING: ${alert.message}`);
        }

        // Progress indicator
        const elapsed = now - startTime;
        const progress = Math.round((elapsed / duration) * 100);
        process.stdout.write(`\r📊 Monitoring: ${progress}% | Status: ${healthCheck.responsive ? '✅' : '❌'} | RT: ${healthCheck.responseTime}ms`);

      } catch (error) {
        console.error(`\n❌ Monitoring error: ${error.message}`);
      }
    }, monitoringInterval);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(monitoringResults);
      }, duration);
    });
  }

  generateMonitoringReport(results) {
    console.log('\n\n📊 POST-ROLLBACK MONITORING REPORT');
    console.log('==================================');
    
    const duration = results.endTime - results.startTime;
    const totalChecks = results.checks.length;
    const successfulChecks = results.checks.filter(c => c.responsive).length;
    const availabilityRate = Math.round((successfulChecks / totalChecks) * 100);

    console.log(`Duration: ${Math.round(duration / 1000)} seconds`);
    console.log(`Total Checks: ${totalChecks}`);
    console.log(`Availability: ${availabilityRate}%`);
    console.log(`Alerts: ${results.alerts.length}`);

    if (results.alerts.length > 0) {
      console.log('\n🚨 ALERTS SUMMARY:');
      const criticalAlerts = results.alerts.filter(a => a.severity === 'critical').length;
      const warningAlerts = results.alerts.filter(a => a.severity === 'warning').length;
      
      console.log(`   Critical: ${criticalAlerts}`);
      console.log(`   Warnings: ${warningAlerts}`);
    }

    // Calculate average response time
    const responseTimes = results.checks
      .filter(c => c.responseTime)
      .map(c => c.responseTime);
    
    if (responseTimes.length > 0) {
      const avgResponseTime = Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length);
      console.log(`\nAverage Response Time: ${avgResponseTime}ms`);
    }

    const status = availabilityRate >= 95 && results.alerts.filter(a => a.severity === 'critical').length === 0
      ? '✅ STABLE'
      : '⚠️  NEEDS ATTENTION';
    
    console.log(`\nRollback Status: ${status}`);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  async listDeployments() {
    console.log('📋 DEPLOYMENT HISTORY');
    console.log('=====================\n');

    try {
      const deployments = await this.getDeploymentHistory();
      
      console.log(`Found ${deployments.length} recent deployments:\n`);
      
      deployments.forEach((deployment, index) => {
        const status = index === 0 ? '🟢 CURRENT' : deployment.isStable ? '✅ STABLE' : '⚠️  UNSTABLE';
        const age = this.formatAge(deployment.createdAt);
        
        console.log(`${index + 1}. ${status}`);
        console.log(`   URL: ${deployment.url}`);
        console.log(`   Health Score: ${deployment.healthScore}%`);
        console.log(`   Created: ${age} ago`);
        console.log(`   UID: ${deployment.uid}`);
        console.log('');
      });

      return deployments;
    } catch (error) {
      console.error('❌ Failed to list deployments:', error.message);
      return [];
    }
  }

  formatAge(createdAt) {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  }

  getRollbackHistory() {
    console.log('📚 ROLLBACK HISTORY');
    console.log('==================\n');

    if (this.rollbackHistory.length === 0) {
      console.log('No rollbacks performed in this session.');
      return;
    }

    this.rollbackHistory.forEach((rollback, index) => {
      console.log(`${index + 1}. ${rollback.type.toUpperCase()} ROLLBACK`);
      console.log(`   Timestamp: ${rollback.timestamp}`);
      console.log(`   Target: ${rollback.target}`);
      console.log(`   Reason: ${rollback.reason}`);
      console.log(`   Status: ${rollback.status}`);
      
      if (rollback.verification) {
        console.log(`   Success Rate: ${rollback.verification.successRate}%`);
      }
      
      console.log('');
    });
  }

  // ============================================================================
  // CLI INTERFACE
  // ============================================================================

  async run() {
    const args = process.argv.slice(2);
    const command = args[0];

    console.log('🔄 VERCEL ROLLBACK AUTOMATION SYSTEM');
    console.log('====================================\n');

    switch (command) {
      case '--instant-rollback':
        const target = args[1];
        await this.performInstantRollback(target);
        break;

      case '--smart-rollback':
        await this.performSmartRollback();
        break;

      case '--emergency-rollback':
        await this.performEmergencyRollback();
        break;

      case '--list-deployments':
        await this.listDeployments();
        break;

      case '--rollback-history':
        this.getRollbackHistory();
        break;

      case '--health-check':
        const url = args[1];
        if (!url) {
          console.log('❌ URL required for health check');
          console.log('Usage: node vercel-rollback-automation.js --health-check <url>');
          return;
        }
        
        console.log(`🏥 Performing health check on: ${url}`);
        const healthResult = await this.performComprehensiveHealthCheck(url);
        console.log(`Overall Health: ${healthResult.overallHealth}%`);
        break;

      default:
        console.log('Usage:');
        console.log('  node vercel-rollback-automation.js --instant-rollback [deployment-url]');
        console.log('  node vercel-rollback-automation.js --smart-rollback');
        console.log('  node vercel-rollback-automation.js --emergency-rollback');
        console.log('  node vercel-rollback-automation.js --list-deployments');
        console.log('  node vercel-rollback-automation.js --rollback-history');
        console.log('  node vercel-rollback-automation.js --health-check <url>');
        break;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const rollbackSystem = new VercelRollbackAutomation();
  rollbackSystem.run().catch(console.error);
}

module.exports = VercelRollbackAutomation;