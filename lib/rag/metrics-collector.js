// lib/rag/metrics-collector.js
// Task 10.3: Advanced Metrics Collection for Enhanced RAG Production Monitoring
// Comprehensive metrics collection with real-time aggregation and reporting

import { getAlertManager } from './alert-manager.js';

/**
 * Advanced Metrics Collector for Enhanced RAG Filtering
 * Collects, aggregates, and analyzes production metrics in real-time
 */
export class MetricsCollector {
  constructor(config = {}) {
    this.config = {
      // Collection settings
      bufferSize: 1000,
      flushInterval: 30000, // 30 seconds
      retentionPeriod: 24 * 60 * 60 * 1000, // 24 hours
      
      // Aggregation windows
      windows: {
        realtime: 60000,    // 1 minute
        short: 300000,      // 5 minutes
        medium: 900000,     // 15 minutes
        long: 3600000       // 1 hour
      },

      // Metric thresholds for alerting
      alertThresholds: {
        careerCount: { min: 3, target: 4 },
        responseTime: { max: 5000, target: 3000 },
        errorRate: { max: 0.02, target: 0.01 },
        diversityScore: { min: 2.0, target: 2.5 },
        memoryUsage: { max: 100, target: 80 }, // MB
        fallbackRate: { max: 0.3, target: 0.2 }
      },

      // Feature tracking
      trackFeatureFlags: true,
      trackUserSegments: true,
      trackPerformanceBreakdown: true,

      ...config
    };

    this.metricsBuffer = [];
    this.aggregatedMetrics = new Map();
    this.alertManager = getAlertManager();
    this.isCollecting = false;
    this.flushTimer = null;
    this.startTime = Date.now();
  }

  /**
   * Start metrics collection
   */
  start() {
    if (this.isCollecting) {
      console.log('📊 Metrics collection already running');
      return;
    }

    this.isCollecting = true;
    console.log('🚀 Starting Enhanced RAG Metrics Collection');

    // Start periodic flushing
    this.flushTimer = setInterval(() => {
      this.flushMetrics();
    }, this.config.flushInterval);

    // Start aggregation
    this.startAggregation();

    console.log('✅ Metrics collection started');
  }

  /**
   * Stop metrics collection
   */
  stop() {
    this.isCollecting = false;

    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // Final flush
    this.flushMetrics();

    console.log('⏹️ Metrics collection stopped');
  }

  /**
   * Record career matching request metrics
   */
  recordCareerMatchingRequest(requestData) {
    if (!this.isCollecting) return;

    const timestamp = Date.now();
    const metric = {
      timestamp,
      type: 'career_matching_request',
      
      // Request identification
      requestId: requestData.requestId || this.generateRequestId(),
      sessionId: requestData.sessionId,
      userId: requestData.userId ? this.hashUserId(requestData.userId) : null,

      // Student profile metrics
      profile: {
        grade: requestData.profile?.grade,
        curriculum: requestData.profile?.curriculum,
        subjectCount: requestData.profile?.subjects?.length || 0,
        subjects: requestData.profile?.subjects || [],
        hasMarks: !!requestData.profile?.marks,
        markCount: Object.keys(requestData.profile?.marks || {}).length,
        interestCount: requestData.profile?.interests?.length || 0,
        profileComplexity: this.calculateProfileComplexity(requestData.profile)
      },

      // Career results metrics
      results: {
        totalCareers: requestData.careers?.length || 0,
        ragCareers: requestData.careers?.filter(c => c.source === 'rag').length || 0,
        fallbackCareers: requestData.careers?.filter(c => c.source === 'fallback').length || 0,
        emergencyCareers: requestData.careers?.filter(c => c.source === 'emergency').length || 0,
        uniqueCategories: this.countUniqueCategories(requestData.careers || []),
        avgConfidence: this.calculateAverageConfidence(requestData.careers || []),
        diversityScore: this.calculateDiversityScore(requestData.careers || []),
        meetsMinimum: (requestData.careers?.length || 0) >= 3
      },

      // Performance metrics
      performance: {
        totalTime: requestData.performance?.totalTime || 0,
        ragSearchTime: requestData.performance?.ragSearchTime || 0,
        filteringTime: requestData.performance?.filteringTime || 0,
        fallbackTime: requestData.performance?.fallbackTime || 0,
        enrichmentTime: requestData.performance?.enrichmentTime || 0,
        cacheHit: requestData.performance?.cacheHit || false,
        memoryUsage: this.getCurrentMemoryUsage()
      },

      // Filter stage metrics
      filterStages: {
        initialResults: requestData.filterStages?.initialResults || 0,
        afterSimilarity: requestData.filterStages?.afterSimilarity || 0,
        afterMetadata: requestData.filterStages?.afterMetadata || 0,
        afterValidation: requestData.filterStages?.afterValidation || 0,
        finalResults: requestData.filterStages?.finalResults || 0,
        reductionRate: this.calculateReductionRate(requestData.filterStages)
      },

      // Feature flag context
      featureFlags: this.config.trackFeatureFlags ? this.getCurrentFeatureFlags() : {},

      // Error tracking
      errors: requestData.errors || [],
      warnings: requestData.warnings || [],
      success: requestData.success !== false,

      // Additional context
      context: {
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        deployment: process.env.DEPLOYMENT_STAGE || 'unknown'
      }
    };

    this.metricsBuffer.push(metric);

    // Check for immediate alerts
    this.checkImmediateAlerts(metric);

    // Flush if buffer is full
    if (this.metricsBuffer.length >= this.config.bufferSize) {
      this.flushMetrics();
    }
  }

  /**
   * Record system health metrics
   */
  recordSystemHealth() {
    if (!this.isCollecting) return;

    const timestamp = Date.now();
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const metric = {
      timestamp,
      type: 'system_health',
      
      memory: {
        heapUsed: memUsage.heapUsed / (1024 * 1024), // MB
        heapTotal: memUsage.heapTotal / (1024 * 1024),
        rss: memUsage.rss / (1024 * 1024),
        external: memUsage.external / (1024 * 1024)
      },

      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },

      uptime: process.uptime(),
      
      // Node.js specific metrics
      eventLoopDelay: this.measureEventLoopDelay(),
      activeHandles: process._getActiveHandles?.()?.length || 0,
      activeRequests: process._getActiveRequests?.()?.length || 0
    };

    this.metricsBuffer.push(metric);
  }

  /**
   * Record feature flag usage
   */
  recordFeatureFlagUsage(flagName, enabled, rolloutPercentage) {
    if (!this.isCollecting || !this.config.trackFeatureFlags) return;

    const metric = {
      timestamp: Date.now(),
      type: 'feature_flag_usage',
      flagName,
      enabled,
      rolloutPercentage,
      environment: process.env.NODE_ENV || 'development'
    };

    this.metricsBuffer.push(metric);
  }

  /**
   * Flush metrics buffer to aggregated storage
   */
  flushMetrics() {
    if (this.metricsBuffer.length === 0) return;

    const metricsToFlush = [...this.metricsBuffer];
    this.metricsBuffer = [];

    // Process metrics for aggregation
    this.processMetricsForAggregation(metricsToFlush);

    // Clean up old metrics
    this.cleanupOldMetrics();

    console.log(`📊 Flushed ${metricsToFlush.length} metrics`);
  }

  /**
   * Process metrics for aggregation
   */
  processMetricsForAggregation(metrics) {
    const windows = Object.entries(this.config.windows);

    for (const [windowName, windowSize] of windows) {
      const windowKey = `${windowName}_${Math.floor(Date.now() / windowSize)}`;
      
      if (!this.aggregatedMetrics.has(windowKey)) {
        this.aggregatedMetrics.set(windowKey, {
          windowName,
          windowSize,
          startTime: Math.floor(Date.now() / windowSize) * windowSize,
          endTime: Math.floor(Date.now() / windowSize) * windowSize + windowSize,
          metrics: {
            careerMatching: [],
            systemHealth: [],
            featureFlags: []
          }
        });
      }

      const windowData = this.aggregatedMetrics.get(windowKey);
      
      metrics.forEach(metric => {
        switch (metric.type) {
          case 'career_matching_request':
            windowData.metrics.careerMatching.push(metric);
            break;
          case 'system_health':
            windowData.metrics.systemHealth.push(metric);
            break;
          case 'feature_flag_usage':
            windowData.metrics.featureFlags.push(metric);
            break;
        }
      });
    }
  }

  /**
   * Start aggregation processing
   */
  startAggregation() {
    // Process aggregations every minute
    setInterval(() => {
      if (this.isCollecting) {
        this.processAggregations();
      }
    }, 60000);
  }

  /**
   * Process aggregations and generate insights
   */
  processAggregations() {
    const realtimeWindow = this.getLatestWindow('realtime');
    if (!realtimeWindow) return;

    const aggregation = this.calculateAggregation(realtimeWindow);
    
    // Check aggregated thresholds
    this.checkAggregatedThresholds(aggregation);

    // Store aggregation for reporting
    this.storeAggregation(aggregation);
  }

  /**
   * Calculate aggregation for a window
   */
  calculateAggregation(windowData) {
    const careerMetrics = windowData.metrics.careerMatching;
    const systemMetrics = windowData.metrics.systemHealth;

    if (careerMetrics.length === 0) {
      return null;
    }

    return {
      timestamp: Date.now(),
      window: windowData.windowName,
      period: {
        start: windowData.startTime,
        end: windowData.endTime
      },

      // Request volume
      volume: {
        totalRequests: careerMetrics.length,
        requestsPerSecond: careerMetrics.length / (windowData.windowSize / 1000),
        successfulRequests: careerMetrics.filter(m => m.success).length,
        failedRequests: careerMetrics.filter(m => !m.success).length
      },

      // Career metrics
      careers: {
        avgTotal: this.average(careerMetrics.map(m => m.results.totalCareers)),
        avgRAG: this.average(careerMetrics.map(m => m.results.ragCareers)),
        avgFallback: this.average(careerMetrics.map(m => m.results.fallbackCareers)),
        avgEmergency: this.average(careerMetrics.map(m => m.results.emergencyCareers)),
        avgDiversity: this.average(careerMetrics.map(m => m.results.diversityScore)),
        minimumCompliance: careerMetrics.filter(m => m.results.meetsMinimum).length / careerMetrics.length
      },

      // Performance metrics
      performance: {
        avgResponseTime: this.average(careerMetrics.map(m => m.performance.totalTime)),
        p95ResponseTime: this.percentile(careerMetrics.map(m => m.performance.totalTime), 95),
        p99ResponseTime: this.percentile(careerMetrics.map(m => m.performance.totalTime), 99),
        avgRAGTime: this.average(careerMetrics.map(m => m.performance.ragSearchTime)),
        avgFilterTime: this.average(careerMetrics.map(m => m.performance.filteringTime)),
        cacheHitRate: careerMetrics.filter(m => m.performance.cacheHit).length / careerMetrics.length
      },

      // Error metrics
      errors: {
        errorRate: careerMetrics.filter(m => !m.success).length / careerMetrics.length,
        totalErrors: careerMetrics.reduce((sum, m) => sum + m.errors.length, 0),
        totalWarnings: careerMetrics.reduce((sum, m) => sum + m.warnings.length, 0),
        errorTypes: this.getErrorTypes(careerMetrics)
      },

      // System health
      system: systemMetrics.length > 0 ? {
        avgMemoryUsage: this.average(systemMetrics.map(m => m.memory.heapUsed)),
        maxMemoryUsage: Math.max(...systemMetrics.map(m => m.memory.heapUsed)),
        avgCPUUser: this.average(systemMetrics.map(m => m.cpu.user)),
        avgCPUSystem: this.average(systemMetrics.map(m => m.cpu.system))
      } : null,

      // Feature flag usage
      featureFlags: this.aggregateFeatureFlags(windowData.metrics.featureFlags),

      // Filter efficiency
      filterEfficiency: {
        avgInitialResults: this.average(careerMetrics.map(m => m.filterStages.initialResults)),
        avgFinalResults: this.average(careerMetrics.map(m => m.filterStages.finalResults)),
        avgReductionRate: this.average(careerMetrics.map(m => m.filterStages.reductionRate))
      }
    };
  }

  /**
   * Check immediate alerts for single metrics
   */
  checkImmediateAlerts(metric) {
    const thresholds = this.config.alertThresholds;

    // Career count alert
    if (metric.results.totalCareers < thresholds.careerCount.min) {
      this.alertManager.processAlert({
        type: 'careerCount',
        message: `Career count ${metric.results.totalCareers} below minimum threshold ${thresholds.careerCount.min}`,
        value: metric.results.totalCareers,
        threshold: thresholds.careerCount.min,
        severity: 'warning',
        requestId: metric.requestId
      });
    }

    // Response time alert
    if (metric.performance.totalTime > thresholds.responseTime.max) {
      this.alertManager.processAlert({
        type: 'responseTime',
        message: `Response time ${metric.performance.totalTime}ms exceeds threshold ${thresholds.responseTime.max}ms`,
        value: metric.performance.totalTime,
        threshold: thresholds.responseTime.max,
        severity: 'warning',
        requestId: metric.requestId
      });
    }

    // Memory usage alert
    if (metric.performance.memoryUsage > thresholds.memoryUsage.max) {
      this.alertManager.processAlert({
        type: 'memoryUsage',
        message: `Memory usage ${metric.performance.memoryUsage.toFixed(1)}MB exceeds threshold ${thresholds.memoryUsage.max}MB`,
        value: metric.performance.memoryUsage,
        threshold: thresholds.memoryUsage.max,
        severity: 'warning',
        requestId: metric.requestId
      });
    }
  }

  /**
   * Check aggregated thresholds
   */
  checkAggregatedThresholds(aggregation) {
    if (!aggregation) return;

    const thresholds = this.config.alertThresholds;

    // Error rate alert
    if (aggregation.errors.errorRate > thresholds.errorRate.max) {
      this.alertManager.processAlert({
        type: 'errorRate',
        message: `Error rate ${(aggregation.errors.errorRate * 100).toFixed(1)}% exceeds threshold ${(thresholds.errorRate.max * 100).toFixed(1)}%`,
        value: aggregation.errors.errorRate,
        threshold: thresholds.errorRate.max,
        severity: 'critical',
        window: aggregation.window
      });
    }

    // Average career count alert
    if (aggregation.careers.avgTotal < thresholds.careerCount.min) {
      this.alertManager.processAlert({
        type: 'avgCareerCount',
        message: `Average career count ${aggregation.careers.avgTotal.toFixed(1)} below threshold ${thresholds.careerCount.min}`,
        value: aggregation.careers.avgTotal,
        threshold: thresholds.careerCount.min,
        severity: 'warning',
        window: aggregation.window
      });
    }

    // Fallback rate alert
    const fallbackRate = (aggregation.careers.avgFallback + aggregation.careers.avgEmergency) / aggregation.careers.avgTotal;
    if (fallbackRate > thresholds.fallbackRate.max) {
      this.alertManager.processAlert({
        type: 'fallbackRate',
        message: `Fallback usage rate ${(fallbackRate * 100).toFixed(1)}% exceeds threshold ${(thresholds.fallbackRate.max * 100).toFixed(1)}%`,
        value: fallbackRate,
        threshold: thresholds.fallbackRate.max,
        severity: 'warning',
        window: aggregation.window
      });
    }
  }

  /**
   * Get current metrics summary
   */
  getCurrentMetrics() {
    const realtimeWindow = this.getLatestWindow('realtime');
    const shortWindow = this.getLatestWindow('short');
    const mediumWindow = this.getLatestWindow('medium');

    return {
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
      bufferSize: this.metricsBuffer.length,
      
      realtime: realtimeWindow ? this.calculateAggregation(realtimeWindow) : null,
      short: shortWindow ? this.calculateAggregation(shortWindow) : null,
      medium: mediumWindow ? this.calculateAggregation(mediumWindow) : null,
      
      collection: {
        isActive: this.isCollecting,
        totalWindows: this.aggregatedMetrics.size,
        flushInterval: this.config.flushInterval
      }
    };
  }

  /**
   * Generate comprehensive metrics report
   */
  generateReport(timeRange = 'medium') {
    const window = this.getLatestWindow(timeRange);
    if (!window) {
      return {
        error: 'No data available for the specified time range',
        timeRange,
        timestamp: Date.now()
      };
    }

    const aggregation = this.calculateAggregation(window);
    if (!aggregation) {
      return {
        error: 'No metrics data available',
        timeRange,
        timestamp: Date.now()
      };
    }

    return {
      timestamp: Date.now(),
      timeRange,
      period: aggregation.period,
      
      // Executive summary
      summary: {
        totalRequests: aggregation.volume.totalRequests,
        successRate: `${((1 - aggregation.errors.errorRate) * 100).toFixed(1)}%`,
        avgCareersPerRequest: aggregation.careers.avgTotal.toFixed(1),
        avgResponseTime: `${aggregation.performance.avgResponseTime.toFixed(0)}ms`,
        fallbackUsage: `${((aggregation.careers.avgFallback + aggregation.careers.avgEmergency) / aggregation.careers.avgTotal * 100).toFixed(1)}%`
      },

      // Detailed metrics
      metrics: aggregation,

      // Performance insights
      insights: this.generateInsights(aggregation),

      // Recommendations
      recommendations: this.generateRecommendations(aggregation),

      // Health score
      healthScore: this.calculateHealthScore(aggregation)
    };
  }

  /**
   * Helper methods
   */
  calculateProfileComplexity(profile) {
    if (!profile) return 'unknown';
    
    const subjectCount = profile.subjects?.length || 0;
    const hasMarks = !!profile.marks;
    const interestCount = profile.interests?.length || 0;
    
    const complexity = subjectCount + (hasMarks ? 2 : 0) + interestCount;
    
    if (complexity <= 3) return 'simple';
    if (complexity <= 6) return 'moderate';
    return 'complex';
  }

  countUniqueCategories(careers) {
    const categories = new Set(careers.map(c => c.category).filter(Boolean));
    return categories.size;
  }

  calculateAverageConfidence(careers) {
    if (careers.length === 0) return 0;
    const confidences = careers.map(c => c.confidence || 0.5);
    return confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
  }

  calculateDiversityScore(careers) {
    return this.countUniqueCategories(careers);
  }

  calculateReductionRate(filterStages) {
    if (!filterStages || !filterStages.initialResults) return 0;
    const initial = filterStages.initialResults;
    const final = filterStages.finalResults || 0;
    return initial > 0 ? (initial - final) / initial : 0;
  }

  getCurrentMemoryUsage() {
    return process.memoryUsage().heapUsed / (1024 * 1024); // MB
  }

  getCurrentFeatureFlags() {
    // This would integrate with your feature flag system
    return {};
  }

  measureEventLoopDelay() {
    // Simple event loop delay measurement
    const start = process.hrtime.bigint();
    setImmediate(() => {
      const delay = Number(process.hrtime.bigint() - start) / 1000000; // ms
      return delay;
    });
    return 0; // Placeholder
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  hashUserId(userId) {
    // Simple hash for privacy
    return userId ? `user_${userId.toString().slice(-8)}` : null;
  }

  average(values) {
    const validValues = values.filter(v => typeof v === 'number' && !isNaN(v));
    return validValues.length > 0 ? validValues.reduce((sum, v) => sum + v, 0) / validValues.length : 0;
  }

  percentile(values, p) {
    const sorted = values.filter(v => typeof v === 'number').sort((a, b) => a - b);
    if (sorted.length === 0) return 0;
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  getLatestWindow(windowName) {
    const windows = Array.from(this.aggregatedMetrics.values())
      .filter(w => w.windowName === windowName)
      .sort((a, b) => b.startTime - a.startTime);
    
    return windows[0] || null;
  }

  storeAggregation(aggregation) {
    // Store aggregation for historical analysis
    // Implementation would depend on your storage backend
  }

  aggregateFeatureFlags(flagMetrics) {
    const flagUsage = {};
    flagMetrics.forEach(metric => {
      if (!flagUsage[metric.flagName]) {
        flagUsage[metric.flagName] = { enabled: 0, disabled: 0 };
      }
      if (metric.enabled) {
        flagUsage[metric.flagName].enabled++;
      } else {
        flagUsage[metric.flagName].disabled++;
      }
    });
    return flagUsage;
  }

  getErrorTypes(metrics) {
    const errorTypes = {};
    metrics.forEach(metric => {
      metric.errors.forEach(error => {
        const type = error.type || 'unknown';
        errorTypes[type] = (errorTypes[type] || 0) + 1;
      });
    });
    return errorTypes;
  }

  generateInsights(aggregation) {
    const insights = [];
    
    if (aggregation.careers.avgTotal < 3) {
      insights.push('Average career count below minimum - investigate fallback system');
    }
    
    if (aggregation.errors.errorRate > 0.02) {
      insights.push('Error rate elevated - review error patterns');
    }
    
    if (aggregation.performance.avgResponseTime > 5000) {
      insights.push('Response times high - consider performance optimization');
    }
    
    return insights;
  }

  generateRecommendations(aggregation) {
    const recommendations = [];
    
    const fallbackRate = (aggregation.careers.avgFallback + aggregation.careers.avgEmergency) / aggregation.careers.avgTotal;
    if (fallbackRate > 0.3) {
      recommendations.push('High fallback usage - improve primary RAG system');
    }
    
    if (aggregation.performance.cacheHitRate < 0.5) {
      recommendations.push('Low cache hit rate - review caching strategy');
    }
    
    return recommendations;
  }

  calculateHealthScore(aggregation) {
    let score = 100;
    
    // Deduct for errors
    score -= aggregation.errors.errorRate * 100 * 2; // 2x weight
    
    // Deduct for low career count
    if (aggregation.careers.avgTotal < 3) score -= 20;
    
    // Deduct for high response time
    if (aggregation.performance.avgResponseTime > 5000) score -= 15;
    
    // Deduct for high fallback usage
    const fallbackRate = (aggregation.careers.avgFallback + aggregation.careers.avgEmergency) / aggregation.careers.avgTotal;
    if (fallbackRate > 0.3) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  cleanupOldMetrics() {
    const cutoff = Date.now() - this.config.retentionPeriod;
    const originalSize = this.aggregatedMetrics.size;
    
    for (const [key, window] of this.aggregatedMetrics.entries()) {
      if (window.endTime < cutoff) {
        this.aggregatedMetrics.delete(key);
      }
    }
    
    const cleaned = originalSize - this.aggregatedMetrics.size;
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} old metric windows`);
    }
  }
}

// Global metrics collector instance
let globalMetricsCollector = null;

/**
 * Get global metrics collector instance
 */
export function getMetricsCollector() {
  if (!globalMetricsCollector) {
    globalMetricsCollector = new MetricsCollector();
  }
  return globalMetricsCollector;
}

/**
 * Initialize metrics collector
 */
export function initializeMetricsCollector(config = {}) {
  globalMetricsCollector = new MetricsCollector(config);
  globalMetricsCollector.start();
  return globalMetricsCollector;
}

/**
 * Record metrics (convenience function)
 */
export function recordMetrics(requestData) {
  const collector = getMetricsCollector();
  collector.recordCareerMatchingRequest(requestData);
}