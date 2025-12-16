// lib/rag/bias-monitoring-dashboard.js
// Real-time monitoring dashboard for bias mitigation effectiveness
// Tracks key metrics during student testing

import fs from 'fs';
import path from 'path';

/**
 * BiasMonitoringDashboard - Real-time tracking of bias mitigation effectiveness
 * 
 * Features:
 * - Real-time bias detection metrics
 * - STEM boosting effectiveness tracking
 * - Diversity enforcement statistics
 * - Performance monitoring
 * - Student profile analysis
 * - Trend analysis and alerts
 */
export class BiasMonitoringDashboard {
  constructor(options = {}) {
    this.config = {
      enableLogging: options.enableLogging !== false,
      enableFileLogging: options.enableFileLogging !== false,
      logDirectory: options.logDirectory || './logs/bias-monitoring',
      alertThresholds: {
        teachingBiasThreshold: options.teachingBiasThreshold || 40, // Alert if >40% teaching
        lowSTEMThreshold: options.lowSTEMThreshold || 20, // Alert if <20% STEM for STEM students
        lowDiversityThreshold: options.lowDiversityThreshold || 30, // Alert if diversity score <30
        highProcessingTime: options.highProcessingTime || 1000, // Alert if >1000ms
        errorRateThreshold: options.errorRateThreshold || 5 // Alert if >5% error rate
      },
      retentionDays: options.retentionDays || 30,
      ...options
    };

    // Real-time metrics storage
    this.metrics = {
      // Session metrics
      totalSessions: 0,
      successfulSessions: 0,
      failedSessions: 0,
      
      // Bias detection metrics
      biasDetectionStats: {
        totalAnalyses: 0,
        biasDetected: 0,
        teachingBiasDetected: 0,
        categoryDominanceDetected: 0,
        stemBiasDetected: 0
      },
      
      // Diversity enforcement metrics
      diversityStats: {
        totalEnforcements: 0,
        diversityCorrections: 0,
        qualityPreservations: 0,
        averageDiversityImprovement: 0,
        categoryBalanceAdjustments: 0
      },
      
      // STEM boosting metrics
      stemStats: {
        totalAnalyses: 0,
        stemStudentsIdentified: 0,
        careersBoostApplied: 0,
        averageBoostValue: 0,
        stemIdentificationRate: 0
      },
      
      // Performance metrics
      performanceStats: {
        totalProcessingTime: 0,
        averageProcessingTime: 0,
        minProcessingTime: Infinity,
        maxProcessingTime: 0,
        timeoutCount: 0
      },
      
      // Student profile analysis
      profileStats: {
        gradeDistribution: {},
        subjectDistribution: {},
        stemProfileCount: 0,
        nonStemProfileCount: 0
      },
      
      // Outcome metrics
      outcomeStats: {
        averageTeachingPercentage: 0,
        averageSTEMPercentage: 0,
        averageCategoryCount: 0,
        averageDiversityScore: 0,
        qualityScores: []
      },
      
      // Active alerts
      activeAlerts: [],
      alertHistory: []
    };

    // Initialize logging
    this.initializeLogging();
  }

  /**
   * Record a bias mitigation session
   * @param {Object} sessionData - Complete session data
   */
  recordSession(sessionData) {
    try {
      this.metrics.totalSessions++;
      
      if (sessionData.success) {
        this.metrics.successfulSessions++;
        this.updateSuccessMetrics(sessionData);
      } else {
        this.metrics.failedSessions++;
        this.updateFailureMetrics(sessionData);
      }
      
      // Check for alerts
      this.checkAlerts(sessionData);
      
      // Log session
      if (this.config.enableLogging) {
        this.logSession(sessionData);
      }
      
      // Save to file if enabled
      if (this.config.enableFileLogging) {
        this.saveSessionToFile(sessionData);
      }
      
    } catch (error) {
      console.error('❌ Error recording session:', error);
    }
  }

  /**
   * Update metrics for successful sessions
   * @param {Object} sessionData - Session data
   */
  updateSuccessMetrics(sessionData) {
    const { profile, biasAnalysis, diversityStats, stemStats, performanceStats, outcomes } = sessionData;
    
    // Update bias detection metrics
    if (biasAnalysis) {
      this.metrics.biasDetectionStats.totalAnalyses++;
      if (biasAnalysis.biasDetected) {
        this.metrics.biasDetectionStats.biasDetected++;
      }
      if (biasAnalysis.teachingBias) {
        this.metrics.biasDetectionStats.teachingBiasDetected++;
      }
      if (biasAnalysis.categoryDominance) {
        this.metrics.biasDetectionStats.categoryDominanceDetected++;
      }
      if (biasAnalysis.stemBias) {
        this.metrics.biasDetectionStats.stemBiasDetected++;
      }
    }
    
    // Update STEM metrics
    if (stemStats) {
      this.metrics.stemStats.totalAnalyses++;
      if (stemStats.stemStudentIdentified) {
        this.metrics.stemStats.stemStudentsIdentified++;
      }
      if (stemStats.boostsApplied > 0) {
        this.metrics.stemStats.careersBoostApplied += stemStats.boostsApplied;
      }
      this.metrics.stemStats.stemIdentificationRate = 
        (this.metrics.stemStats.stemStudentsIdentified / this.metrics.stemStats.totalAnalyses) * 100;
    }
    
    // Update performance metrics
    if (performanceStats && performanceStats.processingTime) {
      const processingTime = performanceStats.processingTime;
      this.metrics.performanceStats.totalProcessingTime += processingTime;
      this.metrics.performanceStats.averageProcessingTime = 
        this.metrics.performanceStats.totalProcessingTime / this.metrics.successfulSessions;
      this.metrics.performanceStats.minProcessingTime = 
        Math.min(this.metrics.performanceStats.minProcessingTime, processingTime);
      this.metrics.performanceStats.maxProcessingTime = 
        Math.max(this.metrics.performanceStats.maxProcessingTime, processingTime);
      
      if (processingTime > this.config.alertThresholds.highProcessingTime) {
        this.metrics.performanceStats.timeoutCount++;
      }
    }
    
    // Update profile statistics
    if (profile) {
      if (profile.grade) {
        this.metrics.profileStats.gradeDistribution[profile.grade] = 
          (this.metrics.profileStats.gradeDistribution[profile.grade] || 0) + 1;
      }
      
      if (profile.subjects && Array.isArray(profile.subjects)) {
        profile.subjects.forEach(subject => {
          this.metrics.profileStats.subjectDistribution[subject] = 
            (this.metrics.profileStats.subjectDistribution[subject] || 0) + 1;
        });
      }
      
      if (stemStats && stemStats.stemStudentIdentified) {
        this.metrics.profileStats.stemProfileCount++;
      } else {
        this.metrics.profileStats.nonStemProfileCount++;
      }
    }
    
    // Update outcome statistics
    if (outcomes) {
      if (outcomes.teachingPercentage !== undefined) {
        const currentTotal = this.metrics.outcomeStats.averageTeachingPercentage * 
          (this.metrics.successfulSessions - 1);
        this.metrics.outcomeStats.averageTeachingPercentage = 
          (currentTotal + outcomes.teachingPercentage) / this.metrics.successfulSessions;
      }
      
      if (outcomes.stemPercentage !== undefined) {
        const currentTotal = this.metrics.outcomeStats.averageSTEMPercentage * 
          (this.metrics.successfulSessions - 1);
        this.metrics.outcomeStats.averageSTEMPercentage = 
          (currentTotal + outcomes.stemPercentage) / this.metrics.successfulSessions;
      }
      
      if (outcomes.categoryCount !== undefined) {
        const currentTotal = this.metrics.outcomeStats.averageCategoryCount * 
          (this.metrics.successfulSessions - 1);
        this.metrics.outcomeStats.averageCategoryCount = 
          (currentTotal + outcomes.categoryCount) / this.metrics.successfulSessions;
      }
      
      if (outcomes.diversityScore !== undefined) {
        const currentTotal = this.metrics.outcomeStats.averageDiversityScore * 
          (this.metrics.successfulSessions - 1);
        this.metrics.outcomeStats.averageDiversityScore = 
          (currentTotal + outcomes.diversityScore) / this.metrics.successfulSessions;
      }
      
      if (outcomes.qualityScore !== undefined) {
        this.metrics.outcomeStats.qualityScores.push(outcomes.qualityScore);
        // Keep only last 1000 quality scores
        if (this.metrics.outcomeStats.qualityScores.length > 1000) {
          this.metrics.outcomeStats.qualityScores = 
            this.metrics.outcomeStats.qualityScores.slice(-1000);
        }
      }
    }
  }

  /**
   * Update metrics for failed sessions
   * @param {Object} sessionData - Session data
   */
  updateFailureMetrics(sessionData) {
    // Log failure details
    if (this.config.enableLogging) {
      console.log(`❌ Session failed: ${sessionData.error || 'Unknown error'}`);
    }
  }

  /**
   * Check for alert conditions
   * @param {Object} sessionData - Session data
   */
  checkAlerts(sessionData) {
    const alerts = [];
    
    if (sessionData.success && sessionData.outcomes) {
      // Check teaching bias threshold
      if (sessionData.outcomes.teachingPercentage > this.config.alertThresholds.teachingBiasThreshold) {
        alerts.push({
          type: 'HIGH_TEACHING_BIAS',
          severity: 'WARNING',
          message: `High teaching bias detected: ${sessionData.outcomes.teachingPercentage.toFixed(1)}%`,
          value: sessionData.outcomes.teachingPercentage,
          threshold: this.config.alertThresholds.teachingBiasThreshold
        });
      }
      
      // Check low STEM representation for STEM students
      if (sessionData.stemStats && sessionData.stemStats.stemStudentIdentified && 
          sessionData.outcomes.stemPercentage < this.config.alertThresholds.lowSTEMThreshold) {
        alerts.push({
          type: 'LOW_STEM_REPRESENTATION',
          severity: 'WARNING',
          message: `Low STEM representation for STEM student: ${sessionData.outcomes.stemPercentage.toFixed(1)}%`,
          value: sessionData.outcomes.stemPercentage,
          threshold: this.config.alertThresholds.lowSTEMThreshold
        });
      }
    }
    
    // Add alerts to active alerts
    alerts.forEach(alert => {
      alert.timestamp = new Date().toISOString();
      alert.sessionId = sessionData.sessionId;
      
      this.metrics.activeAlerts.push(alert);
      this.metrics.alertHistory.push(alert);
      
      if (this.config.enableLogging) {
        const icon = alert.severity === 'CRITICAL' ? '🚨' : 
                    alert.severity === 'WARNING' ? '⚠️' : 'ℹ️';
        console.log(`${icon} ALERT [${alert.severity}]: ${alert.message}`);
      }
    });
    
    // Clean up old active alerts (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    this.metrics.activeAlerts = this.metrics.activeAlerts.filter(
      alert => alert.timestamp > oneHourAgo
    );
  }

  /**
   * Get current dashboard data
   * @returns {Object} - Dashboard data
   */
  getDashboardData() {
    const errorRate = this.metrics.totalSessions > 0 ? 
      (this.metrics.failedSessions / this.metrics.totalSessions) * 100 : 0;
    
    const averageQualityScore = this.metrics.outcomeStats.qualityScores.length > 0 ?
      this.metrics.outcomeStats.qualityScores.reduce((sum, score) => sum + score, 0) / 
      this.metrics.outcomeStats.qualityScores.length : 0;
    
    return {
      timestamp: new Date().toISOString(),
      
      // Summary metrics
      summary: {
        totalSessions: this.metrics.totalSessions,
        successRate: this.metrics.totalSessions > 0 ? 
          (this.metrics.successfulSessions / this.metrics.totalSessions) * 100 : 0,
        errorRate,
        averageProcessingTime: this.metrics.performanceStats.averageProcessingTime,
        activeAlerts: this.metrics.activeAlerts.length
      },
      
      // Bias mitigation effectiveness
      biasEffectiveness: {
        biasDetectionRate: this.metrics.biasDetectionStats.totalAnalyses > 0 ?
          (this.metrics.biasDetectionStats.biasDetected / this.metrics.biasDetectionStats.totalAnalyses) * 100 : 0,
        teachingBiasReduction: {
          averageTeachingPercentage: this.metrics.outcomeStats.averageTeachingPercentage,
          target: '<30%',
          status: this.metrics.outcomeStats.averageTeachingPercentage < 30 ? 'GOOD' : 'NEEDS_ATTENTION'
        },
        stemBoostingEffectiveness: {
          stemIdentificationRate: this.metrics.stemStats.stemIdentificationRate,
          averageSTEMPercentage: this.metrics.outcomeStats.averageSTEMPercentage,
          target: '≥40%',
          status: this.metrics.outcomeStats.averageSTEMPercentage >= 40 ? 'GOOD' : 'NEEDS_ATTENTION'
        }
      },
      
      // Performance metrics
      performance: {
        averageProcessingTime: this.metrics.performanceStats.averageProcessingTime,
        minProcessingTime: this.metrics.performanceStats.minProcessingTime === Infinity ? 
          0 : this.metrics.performanceStats.minProcessingTime,
        maxProcessingTime: this.metrics.performanceStats.maxProcessingTime,
        timeoutCount: this.metrics.performanceStats.timeoutCount,
        target: '<500ms',
        status: this.metrics.performanceStats.averageProcessingTime < 500 ? 'EXCELLENT' :
                this.metrics.performanceStats.averageProcessingTime < 1000 ? 'GOOD' : 'NEEDS_OPTIMIZATION'
      },
      
      // Student profile insights
      profileInsights: {
        gradeDistribution: this.metrics.profileStats.gradeDistribution,
        topSubjects: this.getTopSubjects(),
        stemVsNonStem: {
          stemProfiles: this.metrics.profileStats.stemProfileCount,
          nonStemProfiles: this.metrics.profileStats.nonStemProfileCount,
          stemPercentage: (this.metrics.profileStats.stemProfileCount + this.metrics.profileStats.nonStemProfileCount) > 0 ?
            (this.metrics.profileStats.stemProfileCount / 
             (this.metrics.profileStats.stemProfileCount + this.metrics.profileStats.nonStemProfileCount)) * 100 : 0
        }
      },
      
      // Quality metrics
      quality: {
        averageQualityScore,
        status: averageQualityScore > 0.8 ? 'EXCELLENT' :
                averageQualityScore > 0.7 ? 'GOOD' : 'NEEDS_ATTENTION'
      },
      
      // Active alerts
      alerts: {
        active: this.metrics.activeAlerts,
        recent: this.metrics.alertHistory.slice(-10) // Last 10 alerts
      }
    };
  }

  /**
   * Get top subjects by frequency
   * @returns {Array} - Top subjects
   */
  getTopSubjects() {
    return Object.entries(this.metrics.profileStats.subjectDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([subject, count]) => ({ subject, count }));
  }

  /**
   * Log session data
   * @param {Object} sessionData - Session data
   */
  logSession(sessionData) {
    const timestamp = new Date().toISOString();
    const status = sessionData.success ? '✅' : '❌';
    
    console.log(`${status} [${timestamp}] Session ${sessionData.sessionId}`);
    
    if (sessionData.success && sessionData.outcomes) {
      console.log(`   📊 Teaching: ${sessionData.outcomes.teachingPercentage?.toFixed(1)}% | ` +
                 `STEM: ${sessionData.outcomes.stemPercentage?.toFixed(1)}% | ` +
                 `Categories: ${sessionData.outcomes.categoryCount} | ` +
                 `Time: ${sessionData.performanceStats?.processingTime || 'N/A'}ms`);
    }
  }

  /**
   * Save session to file
   * @param {Object} sessionData - Session data
   */
  saveSessionToFile(sessionData) {
    try {
      if (!fs.existsSync(this.config.logDirectory)) {
        fs.mkdirSync(this.config.logDirectory, { recursive: true });
      }
      
      const date = new Date().toISOString().split('T')[0];
      const logFile = path.join(this.config.logDirectory, `bias-monitoring-${date}.jsonl`);
      
      const logEntry = {
        timestamp: new Date().toISOString(),
        ...sessionData
      };
      
      fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      console.error('❌ Error saving session to file:', error);
    }
  }

  /**
   * Initialize logging directory
   */
  initializeLogging() {
    if (this.config.enableFileLogging) {
      try {
        if (!fs.existsSync(this.config.logDirectory)) {
          fs.mkdirSync(this.config.logDirectory, { recursive: true });
        }
      } catch (error) {
        console.error('❌ Error initializing logging directory:', error);
        this.config.enableFileLogging = false;
      }
    }
  }

  /**
   * Reset all metrics (for testing or new deployment)
   */
  resetMetrics() {
    this.metrics = {
      totalSessions: 0,
      successfulSessions: 0,
      failedSessions: 0,
      biasDetectionStats: {
        totalAnalyses: 0,
        biasDetected: 0,
        teachingBiasDetected: 0,
        categoryDominanceDetected: 0,
        stemBiasDetected: 0
      },
      diversityStats: {
        totalEnforcements: 0,
        diversityCorrections: 0,
        qualityPreservations: 0,
        averageDiversityImprovement: 0,
        categoryBalanceAdjustments: 0
      },
      stemStats: {
        totalAnalyses: 0,
        stemStudentsIdentified: 0,
        careersBoostApplied: 0,
        averageBoostValue: 0,
        stemIdentificationRate: 0
      },
      performanceStats: {
        totalProcessingTime: 0,
        averageProcessingTime: 0,
        minProcessingTime: Infinity,
        maxProcessingTime: 0,
        timeoutCount: 0
      },
      profileStats: {
        gradeDistribution: {},
        subjectDistribution: {},
        stemProfileCount: 0,
        nonStemProfileCount: 0
      },
      outcomeStats: {
        averageTeachingPercentage: 0,
        averageSTEMPercentage: 0,
        averageCategoryCount: 0,
        averageDiversityScore: 0,
        qualityScores: []
      },
      activeAlerts: [],
      alertHistory: []
    };
  }
}

// Create singleton instance
export const biasMonitoringDashboard = new BiasMonitoringDashboard({
  enableLogging: true,
  enableFileLogging: true,
  logDirectory: './logs/bias-monitoring'
});

// Helper function to record a session from career matcher
export function recordBiasSession(sessionData) {
  biasMonitoringDashboard.recordSession(sessionData);
}

// Helper function to get dashboard data
export function getDashboardData() {
  return biasMonitoringDashboard.getDashboardData();
}