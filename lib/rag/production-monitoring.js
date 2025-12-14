// lib/rag/production-monitoring.js
// Task 10.3: Production Monitoring Dashboard for Enhanced RAG System
// Comprehensive monitoring dashboard with real-time metrics and alerting

import { getMetricsCollector } from './metrics-collector.js';
import { getAlertManager } from './alert-manager.js';
import { getNotificationService } from './notification-service.js';

/**
 * Production Monitoring Dashboard
 * Central monitoring system for Enhanced RAG filtering in production
 */
export class ProductionMonitor {
  constructor(config = {}) {
    this.config = {
      // Monitoring intervals
      healthCheckInterval: 30000,    // 30 seconds
      metricsUpdateInterval: 60000,  // 1 minute
      alertCheckInterval: 15000,     // 15 seconds
      
      // Dashboard settings
      retainDashboardData: 24 * 60 * 60 * 1000, // 24 hours
      maxDataPoints: 1440, // 24 hours at 1-minute intervals
      
      // Health check thresholds
      healthThresholds: {
        responseTime: 5000,
        errorRate: 0.02,
        careerCount: 3,
        memoryUsage: 100,
        diversityScore: 2.0
      },

      // Auto-recovery settings
      autoRecovery: {
        enabled: true,
        maxAttempts: 3,
        backoffMultiplier: 2,
        initialDelay: 5000
      },

      ...config
    };

    this.metricsCollector = getMetricsCollector();
    this.alertManager = getAlertManager();
    this.notificationService = getNotificationService();
    
    this.isMonitoring = false;
    this.dashboardData = {
      timestamp: Date.now(),
      status: 'initializing',
      summary: {},
      metrics: {},
      alerts: {},
      health: {}
    };
    
    this.healthCheckTimer = null;
    this.metricsTimer = null;
    this.alertTimer = null;
    this.recoveryAttempts = new Map();
  }

  /**
   * Start production monitoring
   */
  async start() {
    if (this.isMonitoring) {
      console.log('📊 Production monitoring already running');
      return;
    }

    console.log('🚀 Starting Enhanced RAG Production Monitoring');
    this.isMonitoring = true;

    try {
      // Initialize components
      await this.initializeComponents();
      
      // Start monitoring loops
      this.startHealthChecks();
      this.startMetricsCollection();
      this.startAlertProcessing();
      
      // Initial dashboard update
      await this.updateDashboard();
      
      // Send startup notification
      await this.notificationService.sendNotification({
        type: 'system_startup',
        severity: 'info',
        message: 'Enhanced RAG Production Monitoring started successfully',
        context: {
          environment: process.env.NODE_ENV,
          version: process.env.npm_package_version,
          startTime: new Date().toISOString()
        }
      });

      this.dashboardData.status = 'running';
      console.log('✅ Production monitoring started successfully');
      
    } catch (error) {
      console.error('❌ Failed to start production monitoring:', error.message);
      this.dashboardData.status = 'error';
      throw error;
    }
  }

  /**
   * Stop production monitoring
   */
  async stop() {
    console.log('⏹️ Stopping Enhanced RAG Production Monitoring');
    this.isMonitoring = false;

    // Clear timers
    if (this.healthCheckTimer) clearInterval(this.healthCheckTimer);
    if (this.metricsTimer) clearInterval(this.metricsTimer);
    if (this.alertTimer) clearInterval(this.alertTimer);

    // Stop components
    this.metricsCollector.stop();

    // Send shutdown notification
    await this.notificationService.sendNotification({
      type: 'system_shutdown',
      severity: 'info',
      message: 'Enhanced RAG Production Monitoring stopped',
      context: {
        uptime: Date.now() - this.dashboardData.timestamp,
        finalStatus: this.dashboardData.status
      }
    });

    this.dashboardData.status = 'stopped';
    console.log('✅ Production monitoring stopped');
  }

  /**
   * Initialize monitoring components
   */
  async initializeComponents() {
    // Start metrics collection
    if (!this.metricsCollector.isCollecting) {
      this.metricsCollector.start();
    }

    // Test notification channels
    console.log('🔧 Testing notification channels...');
    const testResults = await this.notificationService.sendTestNotification(['slack', 'email']);
    
    const workingChannels = Object.entries(testResults)
      .filter(([channel, result]) => result.status === 'success')
      .map(([channel]) => channel);

    console.log(`📡 Active notification channels: ${workingChannels.join(', ')}`);
    
    if (workingChannels.length === 0) {
      console.warn('⚠️ No notification channels are working - alerts will only appear in console');
    }
  }

  /**
   * Start health check monitoring
   */
  startHealthChecks() {
    this.healthCheckTimer = setInterval(async () => {
      if (this.isMonitoring) {
        await this.performHealthCheck();
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Start metrics collection monitoring
   */
  startMetricsCollection() {
    this.metricsTimer = setInterval(async () => {
      if (this.isMonitoring) {
        await this.updateDashboard();
        this.metricsCollector.recordSystemHealth();
      }
    }, this.config.metricsUpdateInterval);
  }

  /**
   * Start alert processing
   */
  startAlertProcessing() {
    this.alertTimer = setInterval(async () => {
      if (this.isMonitoring) {
        await this.processAlerts();
      }
    }, this.config.alertCheckInterval);
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck() {
    const healthCheck = {
      timestamp: Date.now(),
      overall: 'healthy',
      components: {},
      issues: []
    };

    try {
      // Check metrics collector
      healthCheck.components.metricsCollector = {
        status: this.metricsCollector.isCollecting ? 'healthy' : 'unhealthy',
        bufferSize: this.metricsCollector.metricsBuffer?.length || 0
      };

      // Check alert manager
      const alertStats = this.alertManager.getAlertStatistics();
      healthCheck.components.alertManager = {
        status: 'healthy',
        activeAlerts: alertStats.active,
        recentAlerts: alertStats.lastHour
      };

      // Check notification service
      const notificationStats = this.notificationService.getStatistics();
      healthCheck.components.notificationService = {
        status: 'healthy',
        channels: notificationStats.channels,
        queueSize: notificationStats.queue.pending
      };

      // Check system resources
      const memUsage = process.memoryUsage();
      const memUsageMB = memUsage.heapUsed / (1024 * 1024);
      
      healthCheck.components.systemResources = {
        status: memUsageMB > this.config.healthThresholds.memoryUsage ? 'warning' : 'healthy',
        memoryUsage: memUsageMB,
        uptime: process.uptime()
      };

      // Check recent performance
      const currentMetrics = this.metricsCollector.getCurrentMetrics();
      if (currentMetrics.realtime) {
        const rt = currentMetrics.realtime;
        
        healthCheck.components.performance = {
          status: this.assessPerformanceHealth(rt),
          avgResponseTime: rt.performance?.avgResponseTime || 0,
          errorRate: rt.errors?.errorRate || 0,
          avgCareerCount: rt.careers?.avgTotal || 0
        };
      }

      // Determine overall health
      const componentStatuses = Object.values(healthCheck.components).map(c => c.status);
      if (componentStatuses.includes('unhealthy')) {
        healthCheck.overall = 'unhealthy';
      } else if (componentStatuses.includes('warning')) {
        healthCheck.overall = 'warning';
      }

      // Collect issues
      healthCheck.issues = this.identifyHealthIssues(healthCheck.components);

      // Update dashboard
      this.dashboardData.health = healthCheck;

      // Trigger alerts for health issues
      if (healthCheck.overall !== 'healthy') {
        await this.alertManager.processAlert({
          type: 'system_health',
          severity: healthCheck.overall === 'unhealthy' ? 'critical' : 'warning',
          message: `System health check failed: ${healthCheck.issues.join(', ')}`,
          context: healthCheck.components
        });
      }

    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      healthCheck.overall = 'unhealthy';
      healthCheck.issues.push(`Health check error: ${error.message}`);
      this.dashboardData.health = healthCheck;
    }
  }

  /**
   * Assess performance health
   */
  assessPerformanceHealth(metrics) {
    const thresholds = this.config.healthThresholds;
    
    if (metrics.performance?.avgResponseTime > thresholds.responseTime ||
        metrics.errors?.errorRate > thresholds.errorRate ||
        metrics.careers?.avgTotal < thresholds.careerCount) {
      return 'unhealthy';
    }
    
    if (metrics.performance?.avgResponseTime > thresholds.responseTime * 0.8 ||
        metrics.errors?.errorRate > thresholds.errorRate * 0.5 ||
        metrics.careers?.avgTotal < thresholds.careerCount * 1.2) {
      return 'warning';
    }
    
    return 'healthy';
  }

  /**
   * Identify health issues
   */
  identifyHealthIssues(components) {
    const issues = [];
    
    Object.entries(components).forEach(([name, component]) => {
      if (component.status === 'unhealthy') {
        issues.push(`${name} is unhealthy`);
      } else if (component.status === 'warning') {
        issues.push(`${name} has warnings`);
      }
    });
    
    return issues;
  }

  /**
   * Process alerts and check for patterns
   */
  async processAlerts() {
    try {
      const alertStats = this.alertManager.getAlertStatistics();
      
      // Check for alert storms
      if (alertStats.lastHour > 20) {
        await this.alertManager.processAlert({
          type: 'alert_storm',
          severity: 'critical',
          message: `Alert storm detected: ${alertStats.lastHour} alerts in the last hour`,
          context: {
            totalAlerts: alertStats.total,
            activeAlerts: alertStats.active,
            bySeverity: alertStats.bySeverity
          }
        });
      }

      // Check for recurring issues
      const recurringIssues = this.identifyRecurringIssues(alertStats);
      for (const issue of recurringIssues) {
        await this.alertManager.processAlert({
          type: 'recurring_issue',
          severity: 'warning',
          message: `Recurring issue detected: ${issue.type} (${issue.count} times in last hour)`,
          context: issue
        });
      }

      // Update dashboard
      this.dashboardData.alerts = {
        timestamp: Date.now(),
        statistics: alertStats,
        recurringIssues
      };

    } catch (error) {
      console.error('❌ Alert processing failed:', error.message);
    }
  }

  /**
   * Identify recurring issues
   */
  identifyRecurringIssues(alertStats) {
    const recurringThreshold = 5; // 5 or more of same type in an hour
    const recurringIssues = [];
    
    Object.entries(alertStats.byType).forEach(([type, count]) => {
      if (count >= recurringThreshold) {
        recurringIssues.push({
          type,
          count,
          severity: count >= 10 ? 'critical' : 'warning'
        });
      }
    });
    
    return recurringIssues;
  }

  /**
   * Update dashboard with latest metrics
   */
  async updateDashboard() {
    try {
      const currentMetrics = this.metricsCollector.getCurrentMetrics();
      const alertStats = this.alertManager.getAlertStatistics();
      
      // Generate summary
      const summary = this.generateSummary(currentMetrics);
      
      // Update dashboard data
      this.dashboardData = {
        ...this.dashboardData,
        timestamp: Date.now(),
        summary,
        metrics: currentMetrics,
        alerts: {
          statistics: alertStats,
          recent: this.getRecentAlerts()
        }
      };

      // Check for auto-recovery opportunities
      if (this.config.autoRecovery.enabled) {
        await this.checkAutoRecovery();
      }

    } catch (error) {
      console.error('❌ Dashboard update failed:', error.message);
    }
  }

  /**
   * Generate dashboard summary
   */
  generateSummary(metrics) {
    const summary = {
      status: this.dashboardData.status,
      uptime: Date.now() - this.dashboardData.timestamp,
      totalRequests: 0,
      successRate: 0,
      avgResponseTime: 0,
      avgCareerCount: 0,
      activeAlerts: 0,
      healthScore: 100
    };

    if (metrics.realtime) {
      const rt = metrics.realtime;
      summary.totalRequests = rt.volume?.totalRequests || 0;
      summary.successRate = 1 - (rt.errors?.errorRate || 0);
      summary.avgResponseTime = rt.performance?.avgResponseTime || 0;
      summary.avgCareerCount = rt.careers?.avgTotal || 0;
    }

    if (this.dashboardData.alerts?.statistics) {
      summary.activeAlerts = this.dashboardData.alerts.statistics.active;
    }

    if (this.dashboardData.health) {
      summary.healthScore = this.calculateHealthScore();
    }

    return summary;
  }

  /**
   * Calculate overall health score
   */
  calculateHealthScore() {
    let score = 100;
    
    if (this.dashboardData.health?.overall === 'unhealthy') {
      score -= 50;
    } else if (this.dashboardData.health?.overall === 'warning') {
      score -= 20;
    }
    
    // Deduct for active alerts
    const activeAlerts = this.dashboardData.alerts?.statistics?.active || 0;
    score -= Math.min(activeAlerts * 5, 30);
    
    // Deduct for performance issues
    const metrics = this.dashboardData.metrics?.realtime;
    if (metrics) {
      if (metrics.errors?.errorRate > 0.02) score -= 15;
      if (metrics.performance?.avgResponseTime > 5000) score -= 10;
      if (metrics.careers?.avgTotal < 3) score -= 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get recent alerts for dashboard
   */
  getRecentAlerts() {
    // This would get recent alerts from alert manager
    return [];
  }

  /**
   * Check for auto-recovery opportunities
   */
  async checkAutoRecovery() {
    const health = this.dashboardData.health;
    if (!health || health.overall === 'healthy') {
      return;
    }

    // Check if we should attempt recovery
    for (const issue of health.issues) {
      const recoveryKey = this.getRecoveryKey(issue);
      const attempts = this.recoveryAttempts.get(recoveryKey) || 0;
      
      if (attempts < this.config.autoRecovery.maxAttempts) {
        await this.attemptAutoRecovery(issue, recoveryKey, attempts);
      }
    }
  }

  /**
   * Attempt automatic recovery
   */
  async attemptAutoRecovery(issue, recoveryKey, currentAttempts) {
    console.log(`🔧 Attempting auto-recovery for: ${issue} (attempt ${currentAttempts + 1})`);
    
    try {
      let recovered = false;
      
      // Recovery strategies based on issue type
      if (issue.includes('metricsCollector')) {
        // Restart metrics collector
        this.metricsCollector.stop();
        await this.sleep(2000);
        this.metricsCollector.start();
        recovered = true;
      }
      
      if (issue.includes('memory')) {
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
          recovered = true;
        }
      }
      
      if (recovered) {
        console.log(`✅ Auto-recovery successful for: ${issue}`);
        this.recoveryAttempts.delete(recoveryKey);
        
        await this.notificationService.sendNotification({
          type: 'auto_recovery_success',
          severity: 'info',
          message: `Auto-recovery successful: ${issue}`,
          context: { attempts: currentAttempts + 1 }
        });
      } else {
        // Increment attempt counter
        this.recoveryAttempts.set(recoveryKey, currentAttempts + 1);
        
        // Wait before next attempt
        const delay = this.config.autoRecovery.initialDelay * 
                     Math.pow(this.config.autoRecovery.backoffMultiplier, currentAttempts);
        await this.sleep(delay);
      }
      
    } catch (error) {
      console.error(`❌ Auto-recovery failed for ${issue}:`, error.message);
      this.recoveryAttempts.set(recoveryKey, currentAttempts + 1);
    }
  }

  /**
   * Get recovery key for issue
   */
  getRecoveryKey(issue) {
    return issue.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  }

  /**
   * Get dashboard data
   */
  getDashboardData() {
    return {
      ...this.dashboardData,
      timestamp: Date.now()
    };
  }

  /**
   * Get detailed monitoring report
   */
  getMonitoringReport() {
    const metricsReport = this.metricsCollector.generateReport('medium');
    const alertStats = this.alertManager.getAlertStatistics();
    const notificationStats = this.notificationService.getStatistics();
    
    return {
      timestamp: Date.now(),
      status: this.dashboardData.status,
      uptime: Date.now() - this.dashboardData.timestamp,
      
      // System health
      health: this.dashboardData.health,
      
      // Metrics summary
      metrics: metricsReport,
      
      // Alert summary
      alerts: {
        statistics: alertStats,
        recent: this.getRecentAlerts()
      },
      
      // Notification status
      notifications: notificationStats,
      
      // Recovery status
      recovery: {
        enabled: this.config.autoRecovery.enabled,
        activeAttempts: this.recoveryAttempts.size,
        attempts: Object.fromEntries(this.recoveryAttempts)
      },
      
      // Configuration
      configuration: {
        healthCheckInterval: this.config.healthCheckInterval,
        metricsUpdateInterval: this.config.metricsUpdateInterval,
        alertCheckInterval: this.config.alertCheckInterval
      }
    };
  }

  /**
   * Utility method for delays
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global production monitor instance
let globalProductionMonitor = null;

/**
 * Get global production monitor instance
 */
export function getProductionMonitor() {
  if (!globalProductionMonitor) {
    globalProductionMonitor = new ProductionMonitor();
  }
  return globalProductionMonitor;
}

/**
 * Initialize production monitor
 */
export function initializeProductionMonitor(config = {}) {
  globalProductionMonitor = new ProductionMonitor(config);
  return globalProductionMonitor;
}

/**
 * Start production monitoring
 */
export async function startProductionMonitoring(config = {}) {
  const monitor = initializeProductionMonitor(config);
  await monitor.start();
  return monitor;
}

/**
 * Get monitoring dashboard data
 */
export function getMonitoringDashboard() {
  const monitor = getProductionMonitor();
  return monitor.getDashboardData();
}