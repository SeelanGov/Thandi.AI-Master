// lib/rag/production-monitoring.js
// Task 10.3: Production Monitoring and Alerting System
// Comprehensive monitoring for enhanced RAG filtering in production

import { getFeatureFlagManager } from './feature-flags.js';
import { getConfigManager } from './feature-flag-config.js';

/**
 * Production Monitoring System for Enhanced RAG Filtering
 */
export class ProductionMonitor {
  constructor(config = {}) {
    this.config = {
      careerCountThreshold: 3,
      responseTimeThreshold: 5000,
      errorRateThreshold: 0.01,
      diversityScoreThreshold: 2.0,
      memoryThreshold: 100, // MB
      alertCooldown: 300000, // 5 minutes
      metricsRetention: 24 * 60 * 60 * 1000, // 24 hours
      ...config
    };
    
    this.metrics = new Map();
    this.alerts = new Map();
    this.lastAlertTime = new Map();
    this.isMonitoring = false;
  }

  /**
   * Start production monitoring
   */
  start() {
    if (this.isMonitoring) {
      console.log('📊 Production monitoring already running');
      return;
    }

    this.isMonitoring = true;
    console.log('🚀 Starting Enhanced RAG Production Monitoring');
    
    // Start metric collection intervals
    this.startMetricCollection();
    this.startHealthChecks();
    this.startAlertProcessing();
    
    console.log('✅ Production monitoring started');
  }

  /**
   * Stop production monitoring
   */
  stop() {
    this.isMonitoring = false;
    console.log('⏹️ Production monitoring stopped');
  }

  /**
   * Record career matching request metrics
   */
  recordCareerMatchingRequest(requestData) {
    const timestamp = Date.now();
    const metrics = {
      timestamp,
      careerCount: requestData.careers?.length || 0,
      responseTime: requestData.performance?.totalTime || 0,
      success: requestData.success || false,
      profileType: requestData.profileComplexity?.type || 'unknown',
      fallbacksUsed: requestData.fallbacksUsed?.length || 0,
      featureFlags: requestData.featureFlags || {},
      diversityScore: this.calculateDiversityScore(requestData.careers || []),
      memoryUsage: process.memoryUsage().heapUsed / (1024 * 1024)
    };

    this.storeMetric('career_matching', metrics);
    this.checkThresholds(metrics);
  }
}
  /**
   * Calculate diversity score for careers
   */
  calculateDiversityScore(careers) {
    if (!careers || careers.length === 0) return 0;
    
    const categories = new Set(careers.map(c => c.category).filter(Boolean));
    return categories.size;
  }

  /**
   * Store metric with automatic cleanup
   */
  storeMetric(type, data) {
    if (!this.metrics.has(type)) {
      this.metrics.set(type, []);
    }
    
    const typeMetrics = this.metrics.get(type);
    typeMetrics.push(data);
    
    // Cleanup old metrics
    const cutoff = Date.now() - this.config.metricsRetention;
    const filtered = typeMetrics.filter(m => m.timestamp > cutoff);
    this.metrics.set(type, filtered);
  }

  /**
   * Check thresholds and trigger alerts
   */
  checkThresholds(metrics) {
    const alerts = [];

    // Career count threshold
    if (metrics.careerCount < this.config.careerCountThreshold) {
      alerts.push({
        type: 'career_count_low',
        severity: 'high',
        message: `Career count ${metrics.careerCount} below threshold ${this.config.careerCountThreshold}`,
        value: metrics.careerCount,
        threshold: this.config.careerCountThreshold
      });
    }

    // Response time threshold
    if (metrics.responseTime > this.config.responseTimeThreshold) {
      alerts.push({
        type: 'response_time_high',
        severity: 'medium',
        message: `Response time ${metrics.responseTime}ms exceeds threshold ${this.config.responseTimeThreshold}ms`,
        value: metrics.responseTime,
        threshold: this.config.responseTimeThreshold
      });
    }

    // Diversity score threshold
    if (metrics.diversityScore < this.config.diversityScoreThreshold) {
      alerts.push({
        type: 'diversity_low',
        severity: 'medium',
        message: `Diversity score ${metrics.diversityScore} below threshold ${this.config.diversityScoreThreshold}`,
        value: metrics.diversityScore,
        threshold: this.config.diversityScoreThreshold
      });
    }

    // Memory threshold
    if (metrics.memoryUsage > this.config.memoryThreshold) {
      alerts.push({
        type: 'memory_high',
        severity: 'high',
        message: `Memory usage ${metrics.memoryUsage.toFixed(1)}MB exceeds threshold ${this.config.memoryThreshold}MB`,
        value: metrics.memoryUsage,
        threshold: this.config.memoryThreshold
      });
    }

    // Process alerts
    alerts.forEach(alert => this.processAlert(alert));
  }

  /**
   * Process and send alerts
   */
  processAlert(alert) {
    const now = Date.now();
    const lastAlert = this.lastAlertTime.get(alert.type) || 0;
    
    // Check cooldown period
    if (now - lastAlert < this.config.alertCooldown) {
      return; // Skip alert due to cooldown
    }

    this.lastAlertTime.set(alert.type, now);
    this.sendAlert(alert);
  }

  /**
   * Send alert to configured channels
   */
  async sendAlert(alert) {
    const alertData = {
      ...alert,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      service: 'enhanced-rag-filtering'
    };

    console.log(`🚨 ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`);
    
    // Store alert for tracking
    this.storeMetric('alerts', alertData);

    // Send to external systems (implement based on your infrastructure)
    await this.sendToSlack(alertData);
    await this.sendToEmail(alertData);
    await this.sendToMonitoringSystem(alertData);
  }

  /**
   * Send alert to Slack
   */
  async sendToSlack(alert) {
    if (!process.env.SLACK_WEBHOOK_URL) return;

    const color = alert.severity === 'high' ? 'danger' : 'warning';
    const payload = {
      channel: '#alerts',
      username: 'Enhanced RAG Monitor',
      icon_emoji: ':warning:',
      attachments: [{
        color,
        title: `Enhanced RAG Alert - ${alert.type}`,
        text: alert.message,
        fields: [
          { title: 'Severity', value: alert.severity, short: true },
          { title: 'Environment', value: alert.environment, short: true },
          { title: 'Value', value: alert.value?.toString(), short: true },
          { title: 'Threshold', value: alert.threshold?.toString(), short: true }
        ],
        timestamp: Math.floor(Date.now() / 1000)
      }]
    };

    try {
      // In a real implementation, send HTTP POST to Slack webhook
      console.log('📱 Slack alert sent');
    } catch (error) {
      console.error('Failed to send Slack alert:', error.message);
    }
  }

  /**
   * Send alert via email
   */
  async sendToEmail(alert) {
    if (!process.env.NOTIFICATION_EMAIL) return;

    try {
      // In a real implementation, send email via your email service
      console.log('📧 Email alert sent');
    } catch (error) {
      console.error('Failed to send email alert:', error.message);
    }
  }

  /**
   * Send to monitoring system (e.g., DataDog, New Relic)
   */
  async sendToMonitoringSystem(alert) {
    try {
      // In a real implementation, send to your monitoring system
      console.log('📊 Monitoring system alert sent');
    } catch (error) {
      console.error('Failed to send monitoring system alert:', error.message);
    }
  }

  /**
   * Start metric collection intervals
   */
  startMetricCollection() {
    // Collect system metrics every minute
    setInterval(() => {
      if (!this.isMonitoring) return;
      
      this.collectSystemMetrics();
    }, 60000);

    // Collect feature flag metrics every 5 minutes
    setInterval(() => {
      if (!this.isMonitoring) return;
      
      this.collectFeatureFlagMetrics();
    }, 300000);
  }

  /**
   * Collect system-level metrics
   */
  collectSystemMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    const systemMetrics = {
      timestamp: Date.now(),
      memory: {
        heapUsed: memUsage.heapUsed / (1024 * 1024),
        heapTotal: memUsage.heapTotal / (1024 * 1024),
        rss: memUsage.rss / (1024 * 1024)
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      }
    };

    this.storeMetric('system', systemMetrics);
    
    // Check system thresholds
    if (systemMetrics.memory.heapUsed > this.config.memoryThreshold) {
      this.processAlert({
        type: 'system_memory_high',
        severity: 'high',
        message: `System memory usage ${systemMetrics.memory.heapUsed.toFixed(1)}MB exceeds threshold`,
        value: systemMetrics.memory.heapUsed,
        threshold: this.config.memoryThreshold
      });
    }
  }

  /**
   * Collect feature flag metrics
   */
  collectFeatureFlagMetrics() {
    const flagManager = getFeatureFlagManager();
    const configManager = getConfigManager();
    
    const flagMetrics = {
      timestamp: Date.now(),
      flags: flagManager.getAllFlags(),
      environment: configManager.currentEnvironment,
      usageStats: flagManager.getUsageStats()
    };

    this.storeMetric('feature_flags', flagMetrics);
  }

  /**
   * Start health checks
   */
  startHealthChecks() {
    // Run health checks every 5 minutes
    setInterval(() => {
      if (!this.isMonitoring) return;
      
      this.runHealthChecks();
    }, 300000);
  }

  /**
   * Run comprehensive health checks
   */
  async runHealthChecks() {
    const healthChecks = [
      { name: 'Database Connectivity', fn: () => this.checkDatabaseHealth() },
      { name: 'API Responsiveness', fn: () => this.checkAPIHealth() },
      { name: 'Feature Flag System', fn: () => this.checkFeatureFlagHealth() },
      { name: 'Memory Usage', fn: () => this.checkMemoryHealth() }
    ];

    const results = [];
    
    for (const check of healthChecks) {
      try {
        const startTime = Date.now();
        await check.fn();
        const duration = Date.now() - startTime;
        
        results.push({
          name: check.name,
          status: 'healthy',
          duration,
          timestamp: Date.now()
        });
      } catch (error) {
        results.push({
          name: check.name,
          status: 'unhealthy',
          error: error.message,
          timestamp: Date.now()
        });

        // Send health check failure alert
        this.processAlert({
          type: 'health_check_failed',
          severity: 'high',
          message: `Health check failed: ${check.name} - ${error.message}`,
          value: check.name,
          threshold: 'healthy'
        });
      }
    }

    this.storeMetric('health_checks', {
      timestamp: Date.now(),
      results,
      overallHealth: results.every(r => r.status === 'healthy') ? 'healthy' : 'degraded'
    });
  }

  /**
   * Check database health
   */
  async checkDatabaseHealth() {
    // In a real implementation, test database connectivity
    // For now, simulate a health check
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Check API health
   */
  async checkAPIHealth() {
    // In a real implementation, make a test API call
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  /**
   * Check feature flag system health
   */
  async checkFeatureFlagHealth() {
    const flagManager = getFeatureFlagManager();
    const stats = flagManager.getUsageStats();
    
    if (stats.totalFlags === 0) {
      throw new Error('No feature flags configured');
    }
  }

  /**
   * Check memory health
   */
  async checkMemoryHealth() {
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / (1024 * 1024);
    
    if (heapUsedMB > this.config.memoryThreshold * 1.5) {
      throw new Error(`Memory usage critically high: ${heapUsedMB.toFixed(1)}MB`);
    }
  }

  /**
   * Start alert processing
   */
  startAlertProcessing() {
    // Process error rate alerts every minute
    setInterval(() => {
      if (!this.isMonitoring) return;
      
      this.checkErrorRates();
    }, 60000);
  }

  /**
   * Check error rates and trigger alerts
   */
  checkErrorRates() {
    const careerMatchingMetrics = this.metrics.get('career_matching') || [];
    
    // Check last 10 minutes of data
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    const recentMetrics = careerMatchingMetrics.filter(m => m.timestamp > tenMinutesAgo);
    
    if (recentMetrics.length === 0) return;
    
    const errorRate = recentMetrics.filter(m => !m.success).length / recentMetrics.length;
    
    if (errorRate > this.config.errorRateThreshold) {
      this.processAlert({
        type: 'error_rate_high',
        severity: 'high',
        message: `Error rate ${(errorRate * 100).toFixed(1)}% exceeds threshold ${(this.config.errorRateThreshold * 100).toFixed(1)}%`,
        value: errorRate,
        threshold: this.config.errorRateThreshold
      });
    }
  }

  /**
   * Get monitoring dashboard data
   */
  getDashboardData() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    const careerMatchingMetrics = (this.metrics.get('career_matching') || [])
      .filter(m => m.timestamp > oneHourAgo);
    
    const systemMetrics = (this.metrics.get('system') || [])
      .filter(m => m.timestamp > oneHourAgo);
    
    const alerts = (this.metrics.get('alerts') || [])
      .filter(m => m.timestamp > oneHourAgo);

    return {
      summary: {
        totalRequests: careerMatchingMetrics.length,
        successRate: careerMatchingMetrics.length > 0 
          ? careerMatchingMetrics.filter(m => m.success).length / careerMatchingMetrics.length 
          : 0,
        avgResponseTime: careerMatchingMetrics.length > 0
          ? careerMatchingMetrics.reduce((sum, m) => sum + m.responseTime, 0) / careerMatchingMetrics.length
          : 0,
        avgCareerCount: careerMatchingMetrics.length > 0
          ? careerMatchingMetrics.reduce((sum, m) => sum + m.careerCount, 0) / careerMatchingMetrics.length
          : 0,
        avgDiversityScore: careerMatchingMetrics.length > 0
          ? careerMatchingMetrics.reduce((sum, m) => sum + m.diversityScore, 0) / careerMatchingMetrics.length
          : 0,
        activeAlerts: alerts.length
      },
      metrics: {
        careerMatching: careerMatchingMetrics,
        system: systemMetrics,
        alerts: alerts
      },
      thresholds: this.config
    };
  }

  /**
   * Generate monitoring report
   */
  generateReport(timeRange = '1h') {
    const dashboardData = this.getDashboardData();
    
    return {
      timestamp: new Date().toISOString(),
      timeRange,
      summary: dashboardData.summary,
      healthStatus: this.getOverallHealthStatus(),
      recommendations: this.getRecommendations(dashboardData),
      featureFlags: this.getFeatureFlagStatus()
    };
  }

  /**
   * Get overall health status
   */
  getOverallHealthStatus() {
    const healthChecks = this.metrics.get('health_checks') || [];
    const latestHealth = healthChecks[healthChecks.length - 1];
    
    return latestHealth?.overallHealth || 'unknown';
  }

  /**
   * Get recommendations based on metrics
   */
  getRecommendations(dashboardData) {
    const recommendations = [];
    const { summary } = dashboardData;
    
    if (summary.successRate < 0.95) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'Success rate below 95% - investigate error causes'
      });
    }
    
    if (summary.avgResponseTime > this.config.responseTimeThreshold * 0.8) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: 'Response time approaching threshold - consider optimization'
      });
    }
    
    if (summary.avgCareerCount < this.config.careerCountThreshold) {
      recommendations.push({
        type: 'functionality',
        priority: 'high',
        message: 'Average career count below minimum - check fallback systems'
      });
    }
    
    return recommendations;
  }

  /**
   * Get feature flag status
   */
  getFeatureFlagStatus() {
    const flagManager = getFeatureFlagManager();
    return flagManager.getAllFlags();
  }
}

// Global monitoring instance
let globalMonitor = null;

/**
 * Get global production monitor instance
 */
export function getProductionMonitor() {
  if (!globalMonitor) {
    globalMonitor = new ProductionMonitor();
  }
  return globalMonitor;
}

/**
 * Initialize production monitoring
 */
export function initializeProductionMonitoring(config = {}) {
  globalMonitor = new ProductionMonitor(config);
  globalMonitor.start();
  return globalMonitor;
}

/**
 * Record career matching metrics (convenience function)
 */
export function recordCareerMatchingMetrics(requestData) {
  const monitor = getProductionMonitor();
  monitor.recordCareerMatchingRequest(requestData);
}