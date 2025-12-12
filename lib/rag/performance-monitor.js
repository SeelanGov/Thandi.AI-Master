// lib/rag/performance-monitor.js
// Performance Monitoring and Alerting for RAG System
// Provides real-time performance tracking and threshold alerts

/**
 * Performance monitor for RAG system
 * Tracks response times, error rates, and system health
 */
export class PerformanceMonitor {
  constructor(options = {}) {
    this.options = {
      alertThresholds: {
        maxResponseTime: 15000, // 15 seconds
        maxErrorRate: 5, // 5%
        minCacheHitRate: 20, // 20%
        maxMemoryUsage: 512 * 1024 * 1024 // 512MB
      },
      sampleWindow: 100, // Number of requests to track
      enableAlerts: true,
      ...options
    };
    
    this.samples = [];
    this.alerts = [];
    this.startTime = Date.now();
  }

  /**
   * Record a performance sample
   * @param {Object} sample - Performance sample data
   */
  recordSample(sample) {
    const timestamp = Date.now();
    
    const enrichedSample = {
      timestamp,
      duration: sample.duration,
      success: sample.success,
      operation: sample.operation,
      careerCount: sample.careerCount || 0,
      cacheHit: sample.cacheHit || false,
      memoryUsage: this._getMemoryUsage(),
      ...sample
    };
    
    this.samples.push(enrichedSample);
    
    // Keep only recent samples
    if (this.samples.length > this.options.sampleWindow) {
      this.samples.shift();
    }
    
    // Check for alerts
    if (this.options.enableAlerts) {
      this._checkAlerts(enrichedSample);
    }
  }

  /**
   * Get current performance metrics
   * @returns {Object} - Performance metrics
   */
  getMetrics() {
    if (this.samples.length === 0) {
      return {
        sampleCount: 0,
        avgResponseTime: 0,
        errorRate: 0,
        cacheHitRate: 0,
        throughput: 0,
        uptime: Date.now() - this.startTime
      };
    }

    const recentSamples = this.samples.slice(-this.options.sampleWindow);
    const successfulSamples = recentSamples.filter(s => s.success);
    const cacheHits = recentSamples.filter(s => s.cacheHit).length;
    
    // Calculate metrics
    const avgResponseTime = successfulSamples.length > 0 
      ? successfulSamples.reduce((sum, s) => sum + s.duration, 0) / successfulSamples.length
      : 0;
    
    const errorRate = recentSamples.length > 0
      ? ((recentSamples.length - successfulSamples.length) / recentSamples.length) * 100
      : 0;
    
    const cacheHitRate = recentSamples.length > 0
      ? (cacheHits / recentSamples.length) * 100
      : 0;
    
    // Calculate throughput (requests per minute)
    const timeWindow = 60000; // 1 minute
    const cutoff = Date.now() - timeWindow;
    const recentRequests = recentSamples.filter(s => s.timestamp > cutoff);
    const throughput = (recentRequests.length / timeWindow) * 60000;
    
    return {
      sampleCount: recentSamples.length,
      avgResponseTime: Math.round(avgResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      throughput: Math.round(throughput * 100) / 100,
      uptime: Date.now() - this.startTime,
      memoryUsage: this._getMemoryUsage(),
      lastSample: recentSamples[recentSamples.length - 1]
    };
  }

  /**
   * Get performance alerts
   * @returns {Array} - Array of active alerts
   */
  getAlerts() {
    // Return only recent alerts (last 5 minutes)
    const cutoff = Date.now() - 300000;
    return this.alerts.filter(alert => alert.timestamp > cutoff);
  }

  /**
   * Check for performance alerts
   * @private
   */
  _checkAlerts(sample) {
    const metrics = this.getMetrics();
    const thresholds = this.options.alertThresholds;
    
    // Response time alert
    if (sample.duration > thresholds.maxResponseTime) {
      this._addAlert({
        type: 'response_time',
        severity: 'warning',
        message: `Response time (${sample.duration}ms) exceeds threshold (${thresholds.maxResponseTime}ms)`,
        value: sample.duration,
        threshold: thresholds.maxResponseTime
      });
    }
    
    // Error rate alert
    if (metrics.errorRate > thresholds.maxErrorRate && metrics.sampleCount >= 10) {
      this._addAlert({
        type: 'error_rate',
        severity: 'error',
        message: `Error rate (${metrics.errorRate}%) exceeds threshold (${thresholds.maxErrorRate}%)`,
        value: metrics.errorRate,
        threshold: thresholds.maxErrorRate
      });
    }
    
    // Cache hit rate alert
    if (metrics.cacheHitRate < thresholds.minCacheHitRate && metrics.sampleCount >= 20) {
      this._addAlert({
        type: 'cache_performance',
        severity: 'info',
        message: `Cache hit rate (${metrics.cacheHitRate}%) below threshold (${thresholds.minCacheHitRate}%)`,
        value: metrics.cacheHitRate,
        threshold: thresholds.minCacheHitRate
      });
    }
    
    // Memory usage alert
    if (metrics.memoryUsage > thresholds.maxMemoryUsage) {
      this._addAlert({
        type: 'memory_usage',
        severity: 'warning',
        message: `Memory usage (${Math.round(metrics.memoryUsage / 1024 / 1024)}MB) exceeds threshold (${Math.round(thresholds.maxMemoryUsage / 1024 / 1024)}MB)`,
        value: metrics.memoryUsage,
        threshold: thresholds.maxMemoryUsage
      });
    }
  }

  /**
   * Add performance alert
   * @private
   */
  _addAlert(alert) {
    const enrichedAlert = {
      ...alert,
      timestamp: Date.now(),
      id: `${alert.type}_${Date.now()}`
    };
    
    this.alerts.push(enrichedAlert);
    
    // Keep only recent alerts
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }
    
    // Log alert
    const logLevel = alert.severity === 'error' ? 'error' : 
                    alert.severity === 'warning' ? 'warn' : 'info';
    console[logLevel](`[PerformanceMonitor] ${alert.message}`);
  }

  /**
   * Get memory usage
   * @private
   */
  _getMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }

  /**
   * Generate performance report
   * @returns {Object} - Detailed performance report
   */
  generateReport() {
    const metrics = this.getMetrics();
    const alerts = this.getAlerts();
    
    // Calculate percentiles
    const responseTimes = this.samples
      .filter(s => s.success)
      .map(s => s.duration)
      .sort((a, b) => a - b);
    
    const percentiles = {
      p50: this._getPercentile(responseTimes, 50),
      p90: this._getPercentile(responseTimes, 90),
      p95: this._getPercentile(responseTimes, 95),
      p99: this._getPercentile(responseTimes, 99)
    };
    
    // Calculate career count statistics
    const careerCounts = this.samples
      .filter(s => s.success && s.careerCount > 0)
      .map(s => s.careerCount);
    
    const careerStats = careerCounts.length > 0 ? {
      avg: careerCounts.reduce((sum, c) => sum + c, 0) / careerCounts.length,
      min: Math.min(...careerCounts),
      max: Math.max(...careerCounts),
      total: careerCounts.reduce((sum, c) => sum + c, 0)
    } : null;
    
    return {
      timestamp: Date.now(),
      metrics,
      percentiles,
      careerStats,
      alerts: alerts.length,
      activeAlerts: alerts,
      systemHealth: this._calculateHealthScore(metrics, alerts),
      recommendations: this._generateRecommendations(metrics, alerts)
    };
  }

  /**
   * Calculate percentile
   * @private
   */
  _getPercentile(sortedArray, percentile) {
    if (sortedArray.length === 0) return 0;
    
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, index)];
  }

  /**
   * Calculate system health score (0-100)
   * @private
   */
  _calculateHealthScore(metrics, alerts) {
    let score = 100;
    
    // Deduct for high response times
    if (metrics.avgResponseTime > 10000) score -= 20;
    else if (metrics.avgResponseTime > 5000) score -= 10;
    
    // Deduct for errors
    if (metrics.errorRate > 5) score -= 30;
    else if (metrics.errorRate > 1) score -= 15;
    
    // Deduct for low cache hit rate
    if (metrics.cacheHitRate < 20) score -= 10;
    
    // Deduct for active alerts
    const errorAlerts = alerts.filter(a => a.severity === 'error').length;
    const warningAlerts = alerts.filter(a => a.severity === 'warning').length;
    
    score -= (errorAlerts * 15) + (warningAlerts * 5);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate performance recommendations
   * @private
   */
  _generateRecommendations(metrics, alerts) {
    const recommendations = [];
    
    if (metrics.avgResponseTime > 10000) {
      recommendations.push('Consider optimizing database queries or increasing cache timeout');
    }
    
    if (metrics.errorRate > 2) {
      recommendations.push('Investigate error patterns and improve error handling');
    }
    
    if (metrics.cacheHitRate < 30) {
      recommendations.push('Review cache strategy and increase cache timeout if appropriate');
    }
    
    if (alerts.filter(a => a.type === 'memory_usage').length > 0) {
      recommendations.push('Monitor memory usage and consider implementing memory cleanup');
    }
    
    return recommendations;
  }

  /**
   * Reset monitoring data
   */
  reset() {
    this.samples = [];
    this.alerts = [];
    this.startTime = Date.now();
  }

  /**
   * Get monitor statistics
   * @returns {Object} - Monitor configuration and stats
   */
  getStats() {
    return {
      version: '1.0.0',
      options: this.options,
      sampleCount: this.samples.length,
      alertCount: this.alerts.length,
      uptime: Date.now() - this.startTime,
      features: [
        'response_time_tracking',
        'error_rate_monitoring',
        'cache_performance_tracking',
        'memory_usage_monitoring',
        'automated_alerting',
        'performance_reporting'
      ]
    };
  }
}

// Export singleton instance for convenience
export const performanceMonitor = new PerformanceMonitor();

// Export class for custom instances
export default PerformanceMonitor;