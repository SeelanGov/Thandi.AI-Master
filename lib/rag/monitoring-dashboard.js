// lib/rag/monitoring-dashboard.js
// Task 10.3: Monitoring Dashboard for Enhanced RAG Filtering
// Real-time dashboard for production monitoring and alerting

import { getProductionMonitor } from './production-monitoring.js';
import { getFeatureFlagManager } from './feature-flags.js';
import { getConfigManager } from './feature-flag-config.js';

/**
 * Monitoring Dashboard for Enhanced RAG Filtering
 */
export class MonitoringDashboard {
  constructor() {
    this.refreshInterval = 30000; // 30 seconds
    this.isRunning = false;
    this.dashboardData = null;
  }

  /**
   * Start the monitoring dashboard
   */
  start() {
    if (this.isRunning) {
      console.log('📊 Monitoring dashboard already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting Enhanced RAG Monitoring Dashboard');
    
    // Initial data load
    this.refreshData();
    
    // Set up auto-refresh
    this.refreshTimer = setInterval(() => {
      this.refreshData();
    }, this.refreshInterval);
    
    console.log('✅ Monitoring dashboard started');
  }

  /**
   * Stop the monitoring dashboard
   */
  stop() {
    this.isRunning = false;
    
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    console.log('⏹️ Monitoring dashboard stopped');
  }

  /**
   * Refresh dashboard data
   */
  refreshData() {
    try {
      const monitor = getProductionMonitor();
      const flagManager = getFeatureFlagManager();
      const configManager = getConfigManager();
      
      this.dashboardData = {
        timestamp: new Date().toISOString(),
        monitoring: monitor.getDashboardData(),
        featureFlags: this.getFeatureFlagSummary(),
        deployment: this.getDeploymentStatus(),
        alerts: this.getActiveAlerts(),
        health: this.getHealthSummary()
      };
      
      // Log dashboard update
      this.logDashboardUpdate();
      
    } catch (error) {
      console.error('❌ Failed to refresh dashboard data:', error.message);
    }
  }

  /**
   * Get feature flag summary
   */
  getFeatureFlagSummary() {
    const flagManager = getFeatureFlagManager();
    const allFlags = flagManager.getAllFlags();
    
    const summary = {
      total: Object.keys(allFlags).length,
      enabled: 0,
      partialRollout: 0,
      disabled: 0,
      flags: {}
    };

    Object.entries(allFlags).forEach(([name, flag]) => {
      summary.flags[name] = {
        enabled: flag.enabled,
        rolloutPercentage: flag.rolloutPercentage,
        isEnabled: flag.isEnabled
      };

      if (flag.enabled) {
        if (flag.rolloutPercentage === 100) {
          summary.enabled++;
        } else {
          summary.partialRollout++;
        }
      } else {
        summary.disabled++;
      }
    });

    return summary;
  }

  /**
   * Get deployment status
   */
  getDeploymentStatus() {
    const configManager = getConfigManager();
    
    return {
      environment: configManager.currentEnvironment,
      stage: this.determineDeploymentStage(),
      recommendations: configManager.getProgressionRecommendations()
    };
  }

  /**
   * Determine current deployment stage
   */
  determineDeploymentStage() {
    const flagManager = getFeatureFlagManager();
    const allFlags = flagManager.getAllFlags();
    
    const coreFlags = ['enhanced_rag_filtering', 'fallback_careers'];
    const coreEnabled = coreFlags.filter(flag => allFlags[flag]?.isEnabled);
    
    if (coreEnabled.length === 0) {
      return 'legacy';
    }
    
    const avgRollout = coreEnabled.reduce((sum, flag) => 
      sum + (allFlags[flag]?.rolloutPercentage || 0), 0
    ) / coreEnabled.length;
    
    if (avgRollout <= 10) return 'canary';
    if (avgRollout <= 50) return 'gradual';
    if (avgRollout < 100) return 'near_complete';
    return 'complete';
  }

  /**
   * Get active alerts
   */
  getActiveAlerts() {
    const monitor = getProductionMonitor();
    const dashboardData = monitor.getDashboardData();
    
    // Get alerts from last hour
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const recentAlerts = (dashboardData.metrics.alerts || [])
      .filter(alert => new Date(alert.timestamp).getTime() > oneHourAgo);
    
    // Group by type and severity
    const alertSummary = {
      total: recentAlerts.length,
      high: recentAlerts.filter(a => a.severity === 'high').length,
      medium: recentAlerts.filter(a => a.severity === 'medium').length,
      low: recentAlerts.filter(a => a.severity === 'low').length,
      byType: {}
    };

    recentAlerts.forEach(alert => {
      if (!alertSummary.byType[alert.type]) {
        alertSummary.byType[alert.type] = 0;
      }
      alertSummary.byType[alert.type]++;
    });

    return {
      summary: alertSummary,
      recent: recentAlerts.slice(-10) // Last 10 alerts
    };
  }

  /**
   * Get health summary
   */
  getHealthSummary() {
    const monitor = getProductionMonitor();
    const dashboardData = monitor.getDashboardData();
    
    const { summary } = dashboardData;
    
    // Calculate health scores
    const healthScores = {
      availability: summary.successRate,
      performance: Math.max(0, 1 - (summary.avgResponseTime / 10000)), // 10s = 0 score
      functionality: Math.min(1, summary.avgCareerCount / 5), // 5 careers = 1.0 score
      diversity: Math.min(1, summary.avgDiversityScore / 4) // 4 categories = 1.0 score
    };

    const overallHealth = Object.values(healthScores).reduce((sum, score) => sum + score, 0) / 4;
    
    return {
      overall: overallHealth,
      scores: healthScores,
      status: this.getHealthStatus(overallHealth),
      recommendations: monitor.getRecommendations(dashboardData)
    };
  }

  /**
   * Get health status based on score
   */
  getHealthStatus(score) {
    if (score >= 0.9) return 'excellent';
    if (score >= 0.8) return 'good';
    if (score >= 0.7) return 'fair';
    if (score >= 0.6) return 'poor';
    return 'critical';
  }

  /**
   * Log dashboard update
   */
  logDashboardUpdate() {
    if (!this.dashboardData) return;
    
    const { monitoring, alerts, health } = this.dashboardData;
    
    console.log('\n📊 Enhanced RAG Monitoring Dashboard Update');
    console.log('=' .repeat(60));
    console.log(`🕐 ${this.dashboardData.timestamp}`);
    console.log(`🎯 Requests (1h): ${monitoring.summary.totalRequests}`);
    console.log(`✅ Success Rate: ${(monitoring.summary.successRate * 100).toFixed(1)}%`);
    console.log(`⏱️ Avg Response: ${monitoring.summary.avgResponseTime.toFixed(0)}ms`);
    console.log(`🎲 Avg Careers: ${monitoring.summary.avgCareerCount.toFixed(1)}`);
    console.log(`🌈 Avg Diversity: ${monitoring.summary.avgDiversityScore.toFixed(1)}`);
    console.log(`🚨 Active Alerts: ${alerts.summary.total} (${alerts.summary.high} high)`);
    console.log(`💚 Health: ${health.status} (${(health.overall * 100).toFixed(1)}%)`);
    
    // Show critical alerts
    if (alerts.summary.high > 0) {
      console.log('\n🚨 HIGH SEVERITY ALERTS:');
      alerts.recent
        .filter(a => a.severity === 'high')
        .slice(-3)
        .forEach(alert => {
          console.log(`   - ${alert.type}: ${alert.message}`);
        });
    }
    
    // Show recommendations
    if (health.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      health.recommendations.slice(0, 3).forEach(rec => {
        console.log(`   - [${rec.priority.toUpperCase()}] ${rec.message}`);
      });
    }
    
    console.log('=' .repeat(60));
  }

  /**
   * Get dashboard data for API/UI
   */
  getDashboardData() {
    return this.dashboardData;
  }

  /**
   * Generate detailed report
   */
  generateDetailedReport() {
    if (!this.dashboardData) {
      this.refreshData();
    }

    const report = {
      ...this.dashboardData,
      generatedAt: new Date().toISOString(),
      reportType: 'detailed_monitoring',
      
      // Add detailed breakdowns
      performanceBreakdown: this.getPerformanceBreakdown(),
      featureFlagAnalysis: this.getFeatureFlagAnalysis(),
      alertAnalysis: this.getAlertAnalysis(),
      trendAnalysis: this.getTrendAnalysis()
    };

    return report;
  }

  /**
   * Get performance breakdown
   */
  getPerformanceBreakdown() {
    const monitor = getProductionMonitor();
    const dashboardData = monitor.getDashboardData();
    const metrics = dashboardData.metrics.careerMatching || [];

    if (metrics.length === 0) {
      return { message: 'No performance data available' };
    }

    // Group by profile type
    const byProfileType = {};
    metrics.forEach(metric => {
      const type = metric.profileType || 'unknown';
      if (!byProfileType[type]) {
        byProfileType[type] = [];
      }
      byProfileType[type].push(metric);
    });

    const breakdown = {};
    Object.entries(byProfileType).forEach(([type, typeMetrics]) => {
      breakdown[type] = {
        count: typeMetrics.length,
        avgResponseTime: typeMetrics.reduce((sum, m) => sum + m.responseTime, 0) / typeMetrics.length,
        avgCareerCount: typeMetrics.reduce((sum, m) => sum + m.careerCount, 0) / typeMetrics.length,
        successRate: typeMetrics.filter(m => m.success).length / typeMetrics.length
      };
    });

    return breakdown;
  }

  /**
   * Get feature flag analysis
   */
  getFeatureFlagAnalysis() {
    const flagManager = getFeatureFlagManager();
    const allFlags = flagManager.getAllFlags();
    
    const analysis = {
      rolloutProgress: {},
      impactAnalysis: {},
      recommendations: []
    };

    Object.entries(allFlags).forEach(([name, flag]) => {
      analysis.rolloutProgress[name] = {
        enabled: flag.enabled,
        rolloutPercentage: flag.rolloutPercentage,
        dependencies: flag.dependencies || []
      };

      // Add rollout recommendations
      if (flag.enabled && flag.rolloutPercentage < 100) {
        if (flag.rolloutPercentage < 25) {
          analysis.recommendations.push({
            flag: name,
            action: 'increase_rollout',
            target: 25,
            reason: 'Initial rollout successful, consider expanding'
          });
        }
      }
    });

    return analysis;
  }

  /**
   * Get alert analysis
   */
  getAlertAnalysis() {
    const monitor = getProductionMonitor();
    const dashboardData = monitor.getDashboardData();
    const alerts = dashboardData.metrics.alerts || [];

    const analysis = {
      frequency: {},
      patterns: {},
      trends: {}
    };

    // Analyze alert frequency by type
    alerts.forEach(alert => {
      if (!analysis.frequency[alert.type]) {
        analysis.frequency[alert.type] = 0;
      }
      analysis.frequency[alert.type]++;
    });

    // Identify patterns (alerts that occur together)
    const timeWindows = this.groupAlertsByTimeWindow(alerts, 300000); // 5-minute windows
    analysis.patterns = this.findAlertPatterns(timeWindows);

    return analysis;
  }

  /**
   * Group alerts by time windows
   */
  groupAlertsByTimeWindow(alerts, windowSize) {
    const windows = {};
    
    alerts.forEach(alert => {
      const timestamp = new Date(alert.timestamp).getTime();
      const windowStart = Math.floor(timestamp / windowSize) * windowSize;
      
      if (!windows[windowStart]) {
        windows[windowStart] = [];
      }
      windows[windowStart].push(alert);
    });

    return windows;
  }

  /**
   * Find alert patterns
   */
  findAlertPatterns(timeWindows) {
    const patterns = {};
    
    Object.values(timeWindows).forEach(windowAlerts => {
      if (windowAlerts.length > 1) {
        const types = windowAlerts.map(a => a.type).sort();
        const patternKey = types.join('+');
        
        if (!patterns[patternKey]) {
          patterns[patternKey] = 0;
        }
        patterns[patternKey]++;
      }
    });

    return patterns;
  }

  /**
   * Get trend analysis
   */
  getTrendAnalysis() {
    const monitor = getProductionMonitor();
    const dashboardData = monitor.getDashboardData();
    const metrics = dashboardData.metrics.careerMatching || [];

    if (metrics.length < 10) {
      return { message: 'Insufficient data for trend analysis' };
    }

    // Calculate trends over time
    const sortedMetrics = metrics.sort((a, b) => a.timestamp - b.timestamp);
    const halfPoint = Math.floor(sortedMetrics.length / 2);
    
    const firstHalf = sortedMetrics.slice(0, halfPoint);
    const secondHalf = sortedMetrics.slice(halfPoint);

    const trends = {
      responseTime: this.calculateTrend(firstHalf, secondHalf, 'responseTime'),
      careerCount: this.calculateTrend(firstHalf, secondHalf, 'careerCount'),
      successRate: this.calculateTrend(firstHalf, secondHalf, 'success'),
      diversityScore: this.calculateTrend(firstHalf, secondHalf, 'diversityScore')
    };

    return trends;
  }

  /**
   * Calculate trend between two data sets
   */
  calculateTrend(firstHalf, secondHalf, metric) {
    const firstAvg = metric === 'success' 
      ? firstHalf.filter(m => m[metric]).length / firstHalf.length
      : firstHalf.reduce((sum, m) => sum + (m[metric] || 0), 0) / firstHalf.length;
    
    const secondAvg = metric === 'success'
      ? secondHalf.filter(m => m[metric]).length / secondHalf.length
      : secondHalf.reduce((sum, m) => sum + (m[metric] || 0), 0) / secondHalf.length;

    const change = secondAvg - firstAvg;
    const percentChange = firstAvg !== 0 ? (change / firstAvg) * 100 : 0;

    return {
      direction: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable',
      change,
      percentChange,
      firstPeriod: firstAvg,
      secondPeriod: secondAvg
    };
  }

  /**
   * Export dashboard data
   */
  exportData(format = 'json') {
    const data = this.generateDetailedReport();
    
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      
      case 'csv':
        return this.convertToCSV(data);
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Convert data to CSV format
   */
  convertToCSV(data) {
    const metrics = data.monitoring.metrics.careerMatching || [];
    
    if (metrics.length === 0) {
      return 'No data available';
    }

    const headers = Object.keys(metrics[0]).join(',');
    const rows = metrics.map(metric => 
      Object.values(metric).map(value => 
        typeof value === 'object' ? JSON.stringify(value) : value
      ).join(',')
    );

    return [headers, ...rows].join('\n');
  }
}

// Global dashboard instance
let globalDashboard = null;

/**
 * Get global monitoring dashboard instance
 */
export function getMonitoringDashboard() {
  if (!globalDashboard) {
    globalDashboard = new MonitoringDashboard();
  }
  return globalDashboard;
}

/**
 * Initialize monitoring dashboard
 */
export function initializeMonitoringDashboard() {
  globalDashboard = new MonitoringDashboard();
  globalDashboard.start();
  return globalDashboard;
}

/**
 * API endpoint handler for dashboard data
 */
export function createDashboardAPI() {
  return {
    // GET /api/monitoring/dashboard
    getDashboard: (req, res) => {
      try {
        const dashboard = getMonitoringDashboard();
        const data = dashboard.getDashboardData();
        
        res.json({
          success: true,
          data,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    },

    // GET /api/monitoring/report
    getDetailedReport: (req, res) => {
      try {
        const dashboard = getMonitoringDashboard();
        const report = dashboard.generateDetailedReport();
        
        res.json({
          success: true,
          report,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    },

    // GET /api/monitoring/export
    exportData: (req, res) => {
      try {
        const dashboard = getMonitoringDashboard();
        const format = req.query.format || 'json';
        const data = dashboard.exportData(format);
        
        const contentType = format === 'csv' ? 'text/csv' : 'application/json';
        const filename = `rag-monitoring-${new Date().toISOString().split('T')[0]}.${format}`;
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(data);
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }
  };
}