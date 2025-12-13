// lib/rag/data-quality-monitor.js
// Task 8.2: Real-time data quality monitoring
// Lightweight monitoring for production use

import { DataQualityValidator } from './data-quality-validator.js';

/**
 * Real-time Data Quality Monitor
 * Provides lightweight monitoring capabilities for production use
 */
export class DataQualityMonitor {
  constructor(options = {}) {
    this.options = {
      enableLogging: options.enableLogging ?? false, // Disabled by default in production
      enableMetrics: options.enableMetrics ?? true,
      alertThresholds: {
        qualityScore: options.alertThresholds?.qualityScore ?? 70,
        completenessScore: options.alertThresholds?.completenessScore ?? 80,
        invalidCareerRate: options.alertThresholds?.invalidCareerRate ?? 0.1
      },
      monitoringInterval: options.monitoringInterval ?? 3600000, // 1 hour
      ...options
    };
    
    this.validator = new DataQualityValidator({
      enableLogging: this.options.enableLogging,
      enableMetrics: this.options.enableMetrics
    });
    
    this.metrics = {
      lastCheck: null,
      qualityTrend: [],
      alerts: [],
      careerMatchingStats: {
        totalRequests: 0,
        successfulMatches: 0,
        fallbacksUsed: 0,
        averageCareersReturned: 0,
        categoryDistribution: new Map()
      }
    };
    
    this.monitoringTimer = null;
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring() {
    if (this.monitoringTimer) {
      this.stopMonitoring();
    }
    
    this._log('Starting data quality monitoring...');
    
    // Run initial check
    this.performQuickCheck().catch(error => {
      this._log(`Initial quality check failed: ${error.message}`, 'error');
    });
    
    // Schedule periodic checks
    this.monitoringTimer = setInterval(() => {
      this.performQuickCheck().catch(error => {
        this._log(`Scheduled quality check failed: ${error.message}`, 'error');
      });
    }, this.options.monitoringInterval);
    
    this._log(`Monitoring started with ${this.options.monitoringInterval / 1000}s interval`);
  }

  /**
   * Stop continuous monitoring
   */
  stopMonitoring() {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
      this._log('Data quality monitoring stopped');
    }
  }

  /**
   * Perform quick quality check (lightweight for production)
   * @returns {Promise<Object>} Quick check results
   */
  async performQuickCheck() {
    try {
      const startTime = Date.now();
      
      // Quick metadata check (sample-based)
      const metadataCheck = await this._quickMetadataCheck();
      
      // Quick completeness check (sample-based)
      const completenessCheck = await this._quickCompletenessCheck();
      
      const duration = Date.now() - startTime;
      
      const results = {
        timestamp: new Date().toISOString(),
        duration: duration,
        qualityScore: metadataCheck.qualityScore,
        completenessScore: completenessCheck.completenessScore,
        sampleSize: metadataCheck.sampleSize,
        alerts: [],
        status: 'healthy'
      };
      
      // Check for alerts
      this._checkAlerts(results);
      
      // Update metrics
      this._updateMetrics(results);
      
      this.metrics.lastCheck = results.timestamp;
      
      if (results.alerts.length > 0) {
        this._log(`Quality check completed with ${results.alerts.length} alerts`, 'warn');
      } else {
        this._log(`Quality check completed: ${results.qualityScore.toFixed(1)}% quality, ${results.completenessScore.toFixed(1)}% completeness`);
      }
      
      return results;
      
    } catch (error) {
      this._log(`Quick quality check failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Quick metadata check using sampling
   * @private
   */
  async _quickMetadataCheck() {
    const client = this.validator._getSupabaseClient();
    
    // Sample 50 random careers for quick check
    const { data: careers, error } = await client
      .from('careers')
      .select('career_code, career_title, career_category, short_description, required_education, demand_level')
      .limit(50);
    
    if (error) {
      throw new Error(`Failed to fetch career sample: ${error.message}`);
    }

    const essentialFields = ['career_code', 'career_title', 'career_category', 'short_description'];
    let totalScore = 0;
    let validCareers = 0;

    careers.forEach(career => {
      let careerScore = 0;
      let fieldsChecked = 0;
      
      essentialFields.forEach(field => {
        fieldsChecked++;
        if (career[field] && career[field].toString().trim() !== '') {
          careerScore++;
        }
      });
      
      const careerCompleteness = careerScore / fieldsChecked;
      totalScore += careerCompleteness;
      
      if (careerCompleteness >= 0.75) {
        validCareers++;
      }
    });

    return {
      qualityScore: careers.length > 0 ? (totalScore / careers.length) * 100 : 0,
      sampleSize: careers.length,
      validCareers: validCareers,
      invalidCareers: careers.length - validCareers
    };
  }

  /**
   * Quick completeness check using sampling
   * @private
   */
  async _quickCompletenessCheck() {
    const client = this.validator._getSupabaseClient();
    
    // Sample 30 random careers for completeness check
    const { data: careers, error } = await client
      .from('careers')
      .select('*')
      .limit(30);
    
    if (error) {
      throw new Error(`Failed to fetch career sample: ${error.message}`);
    }

    const allFields = [
      'career_code', 'career_title', 'career_category', 'short_description',
      'required_education', 'required_subjects', 'demand_level', 'job_outlook'
    ];
    
    let totalCompleteness = 0;

    careers.forEach(career => {
      let completeFields = 0;
      
      allFields.forEach(field => {
        const value = career[field];
        if (value !== null && value !== undefined && value.toString().trim() !== '') {
          completeFields++;
        }
      });
      
      totalCompleteness += completeFields / allFields.length;
    });

    return {
      completenessScore: careers.length > 0 ? (totalCompleteness / careers.length) * 100 : 0,
      sampleSize: careers.length
    };
  }

  /**
   * Check for quality alerts
   * @private
   */
  _checkAlerts(results) {
    const alerts = [];
    
    // Quality score alert
    if (results.qualityScore < this.options.alertThresholds.qualityScore) {
      alerts.push({
        type: 'quality_score_low',
        severity: results.qualityScore < 50 ? 'high' : 'medium',
        message: `Data quality score (${results.qualityScore.toFixed(1)}%) below threshold (${this.options.alertThresholds.qualityScore}%)`,
        value: results.qualityScore,
        threshold: this.options.alertThresholds.qualityScore
      });
    }
    
    // Completeness score alert
    if (results.completenessScore < this.options.alertThresholds.completenessScore) {
      alerts.push({
        type: 'completeness_score_low',
        severity: results.completenessScore < 60 ? 'high' : 'medium',
        message: `Data completeness score (${results.completenessScore.toFixed(1)}%) below threshold (${this.options.alertThresholds.completenessScore}%)`,
        value: results.completenessScore,
        threshold: this.options.alertThresholds.completenessScore
      });
    }
    
    // Set overall status
    if (alerts.some(a => a.severity === 'high')) {
      results.status = 'critical';
    } else if (alerts.length > 0) {
      results.status = 'warning';
    }
    
    results.alerts = alerts;
    
    // Store alerts for tracking
    alerts.forEach(alert => {
      this.metrics.alerts.push({
        ...alert,
        timestamp: results.timestamp
      });
    });
    
    // Keep only recent alerts (last 24 hours)
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    this.metrics.alerts = this.metrics.alerts.filter(alert => 
      new Date(alert.timestamp).getTime() > oneDayAgo
    );
  }

  /**
   * Update monitoring metrics
   * @private
   */
  _updateMetrics(results) {
    // Add to quality trend
    this.metrics.qualityTrend.push({
      timestamp: results.timestamp,
      qualityScore: results.qualityScore,
      completenessScore: results.completenessScore
    });
    
    // Keep only last 24 data points (24 hours if checking hourly)
    if (this.metrics.qualityTrend.length > 24) {
      this.metrics.qualityTrend = this.metrics.qualityTrend.slice(-24);
    }
  }

  /**
   * Record career matching statistics
   * @param {Object} matchingResult - Result from career matching
   */
  recordCareerMatching(matchingResult) {
    const stats = this.metrics.careerMatchingStats;
    
    stats.totalRequests++;
    
    if (matchingResult.careers && matchingResult.careers.length >= 3) {
      stats.successfulMatches++;
    }
    
    if (matchingResult.fallbacksUsed && matchingResult.fallbacksUsed.length > 0) {
      stats.fallbacksUsed++;
    }
    
    if (matchingResult.careers) {
      // Update average careers returned
      const currentAvg = stats.averageCareersReturned;
      const newCount = matchingResult.careers.length;
      stats.averageCareersReturned = ((currentAvg * (stats.totalRequests - 1)) + newCount) / stats.totalRequests;
      
      // Update category distribution
      matchingResult.careers.forEach(career => {
        const category = career.category || 'Unknown';
        stats.categoryDistribution.set(category, (stats.categoryDistribution.get(category) || 0) + 1);
      });
    }
  }

  /**
   * Get current monitoring status
   * @returns {Object} Current monitoring status
   */
  getStatus() {
    const recentAlerts = this.metrics.alerts.filter(alert => {
      const alertTime = new Date(alert.timestamp).getTime();
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      return alertTime > oneHourAgo;
    });
    
    const qualityTrend = this.metrics.qualityTrend.length >= 2 
      ? this.metrics.qualityTrend[this.metrics.qualityTrend.length - 1].qualityScore - 
        this.metrics.qualityTrend[this.metrics.qualityTrend.length - 2].qualityScore
      : 0;
    
    return {
      isMonitoring: this.monitoringTimer !== null,
      lastCheck: this.metrics.lastCheck,
      recentAlerts: recentAlerts.length,
      qualityTrend: qualityTrend > 0 ? 'improving' : qualityTrend < 0 ? 'declining' : 'stable',
      careerMatchingStats: {
        ...this.metrics.careerMatchingStats,
        successRate: this.metrics.careerMatchingStats.totalRequests > 0 
          ? (this.metrics.careerMatchingStats.successfulMatches / this.metrics.careerMatchingStats.totalRequests) * 100
          : 0,
        fallbackRate: this.metrics.careerMatchingStats.totalRequests > 0
          ? (this.metrics.careerMatchingStats.fallbacksUsed / this.metrics.careerMatchingStats.totalRequests) * 100
          : 0
      }
    };
  }

  /**
   * Get detailed metrics
   * @returns {Object} Detailed monitoring metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      careerMatchingStats: {
        ...this.metrics.careerMatchingStats,
        categoryDistribution: Object.fromEntries(this.metrics.careerMatchingStats.categoryDistribution)
      }
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      lastCheck: null,
      qualityTrend: [],
      alerts: [],
      careerMatchingStats: {
        totalRequests: 0,
        successfulMatches: 0,
        fallbacksUsed: 0,
        averageCareersReturned: 0,
        categoryDistribution: new Map()
      }
    };
    
    this._log('Monitoring metrics reset');
  }

  /**
   * Log message if logging is enabled
   * @private
   */
  _log(message, level = 'info') {
    if (this.options.enableLogging) {
      const timestamp = new Date().toISOString();
      const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';
      console.log(`${prefix} [DataQualityMonitor] ${timestamp}: ${message}`);
    }
  }
}