// lib/rag/analytics-collector.js
// Analytics and Monitoring for Enhanced RAG System
// Collects metrics on career matching, fallback usage, and diversity

/**
 * Analytics collector for enhanced RAG system
 * Tracks career count, fallback usage, diversity metrics, and performance
 */
export class AnalyticsCollector {
  constructor(options = {}) {
    this.options = {
      enableLogging: true,
      enableMetrics: true,
      retentionDays: 7,
      maxSamples: 1000,
      ...options
    };
    
    this.samples = [];
    this.aggregatedMetrics = {
      totalRequests: 0,
      avgCareerCount: 0,
      fallbackUsageRate: 0,
      diversityScore: 0,
      avgResponseTime: 0,
      errorRate: 0
    };
    
    this.startTime = Date.now();
  }

  /**
   * Record a career matching request
   * @param {Object} requestData - Request analytics data
   */
  recordRequest(requestData) {
    const sample = {
      timestamp: Date.now(),
      requestId: requestData.requestId || this._generateRequestId(),
      
      // Student profile analytics
      profile: {
        grade: requestData.profile?.grade,
        subjectCount: requestData.profile?.subjects?.length || 0,
        subjects: requestData.profile?.subjects || [],
        interestCount: requestData.profile?.interests?.length || 0
      },
      
      // Career matching results
      careers: {
        total: requestData.careers?.length || 0,
        ragCareers: requestData.careers?.filter(c => c.source === 'rag').length || 0,
        fallbackCareers: requestData.careers?.filter(c => c.source === 'fallback').length || 0,
        emergencyCareers: requestData.careers?.filter(c => c.source === 'emergency_fallback').length || 0,
        uniqueCategories: this._countUniqueCategories(requestData.careers || []),
        avgConfidence: this._calculateAvgConfidence(requestData.careers || [])
      },
      
      // Performance metrics
      performance: {
        totalTime: requestData.performance?.totalTime || 0,
        ragTime: requestData.performance?.ragTime || 0,
        filterTime: requestData.performance?.filterTime || 0,
        fallbackTime: requestData.performance?.fallbackTime || 0
      },
      
      // Filter stage analytics
      filterStages: {
        initialResults: requestData.filterStages?.initialResults || 0,
        afterSimilarity: requestData.filterStages?.afterSimilarity || 0,
        afterMetadata: requestData.filterStages?.afterMetadata || 0,
        afterValidation: requestData.filterStages?.afterValidation || 0,
        afterPrioritization: requestData.filterStages?.afterPrioritization || 0
      },
      
      // Error and fallback tracking
      errors: requestData.errors || [],
      fallbacksUsed: requestData.fallbacksUsed || [],
      
      // Success indicators
      success: requestData.success !== false,
      meetsMinimum: (requestData.careers?.length || 0) >= 3,
      hasDiversity: this._countUniqueCategories(requestData.careers || []) >= 2
    };
    
    this.samples.push(sample);
    
    // Maintain sample limit
    if (this.samples.length > this.options.maxSamples) {
      this.samples.shift();
    }
    
    // Update aggregated metrics
    this._updateAggregatedMetrics();
    
    if (this.options.enableLogging) {
      console.log(`[Analytics] Recorded request: ${sample.careers.total} careers, ${sample.performance.totalTime}ms`);
    }
    
    return sample.requestId;
  }

  /**
   * Get current analytics metrics
   * @returns {Object} - Current metrics
   */
  getMetrics() {
    const recentSamples = this._getRecentSamples(3600000); // Last hour
    
    return {
      // Overall statistics
      totalRequests: this.samples.length,
      recentRequests: recentSamples.length,
      uptime: Date.now() - this.startTime,
      
      // Career count metrics
      careerCount: {
        avg: this._calculateAverage(this.samples.map(s => s.careers.total)),
        min: Math.min(...this.samples.map(s => s.careers.total)),
        max: Math.max(...this.samples.map(s => s.careers.total)),
        distribution: this._getCareerCountDistribution()
      },
      
      // Fallback usage metrics
      fallbackUsage: {
        rate: this._calculateFallbackUsageRate(),
        ragOnlyRate: this._calculateRAGOnlyRate(),
        emergencyRate: this._calculateEmergencyRate(),
        avgFallbackCareers: this._calculateAverage(this.samples.map(s => s.careers.fallbackCareers + s.careers.emergencyCareers))
      },
      
      // Diversity metrics
      diversity: {
        avgCategories: this._calculateAverage(this.samples.map(s => s.careers.uniqueCategories)),
        diversityScore: this._calculateDiversityScore(),
        categoryDistribution: this._getCategoryDistribution()
      },
      
      // Performance metrics
      performance: {
        avgResponseTime: this._calculateAverage(this.samples.map(s => s.performance.totalTime)),
        p95ResponseTime: this._getPercentile(this.samples.map(s => s.performance.totalTime), 95),
        avgRAGTime: this._calculateAverage(this.samples.map(s => s.performance.ragTime)),
        avgFilterTime: this._calculateAverage(this.samples.map(s => s.performance.filterTime))
      },
      
      // Filter stage analytics
      filterEfficiency: {
        avgInitialResults: this._calculateAverage(this.samples.map(s => s.filterStages.initialResults)),
        avgFinalResults: this._calculateAverage(this.samples.map(s => s.filterStages.afterPrioritization)),
        filterReductionRate: this._calculateFilterReductionRate(),
        stageEfficiency: this._getStageEfficiency()
      },
      
      // Success metrics
      success: {
        rate: this._calculateSuccessRate(),
        minimumComplianceRate: this._calculateMinimumComplianceRate(),
        diversityComplianceRate: this._calculateDiversityComplianceRate(),
        errorRate: this._calculateErrorRate()
      },
      
      // Subject analysis
      subjectAnalysis: {
        popularSubjects: this._getPopularSubjects(),
        subjectCareerCorrelation: this._getSubjectCareerCorrelation(),
        gradeDistribution: this._getGradeDistribution()
      }
    };
  }

  /**
   * Generate analytics report
   * @param {Object} options - Report options
   * @returns {Object} - Detailed analytics report
   */
  generateReport(options = {}) {
    const {
      timeRange = 3600000, // 1 hour default
      includeDetails = false
    } = options;
    
    const samples = this._getRecentSamples(timeRange);
    const metrics = this.getMetrics();
    
    const report = {
      reportGenerated: new Date().toISOString(),
      timeRange: `${timeRange / 1000}s`,
      sampleCount: samples.length,
      
      // Executive summary
      summary: {
        avgCareersPerRequest: metrics.careerCount.avg.toFixed(1),
        fallbackUsageRate: `${metrics.fallbackUsage.rate.toFixed(1)}%`,
        diversityScore: metrics.diversity.diversityScore.toFixed(2),
        successRate: `${metrics.success.rate.toFixed(1)}%`,
        avgResponseTime: `${metrics.performance.avgResponseTime.toFixed(0)}ms`
      },
      
      // Key insights
      insights: this._generateInsights(metrics),
      
      // Recommendations
      recommendations: this._generateRecommendations(metrics),
      
      // Detailed metrics
      metrics: includeDetails ? metrics : null,
      
      // Trends (if enough data)
      trends: samples.length >= 10 ? this._calculateTrends(samples) : null
    };
    
    return report;
  }

  /**
   * Get filter stage performance analytics
   * @returns {Object} - Filter stage analytics
   */
  getFilterStageAnalytics() {
    const stageMetrics = {
      stages: [
        'initialResults',
        'afterSimilarity', 
        'afterMetadata',
        'afterValidation',
        'afterPrioritization'
      ],
      efficiency: {},
      bottlenecks: []
    };
    
    stageMetrics.stages.forEach((stage, index) => {
      const values = this.samples.map(s => s.filterStages[stage]).filter(v => v > 0);
      
      if (values.length > 0) {
        stageMetrics.efficiency[stage] = {
          avg: this._calculateAverage(values),
          min: Math.min(...values),
          max: Math.max(...values),
          reductionRate: index > 0 ? this._calculateStageReduction(index) : 0
        };
      }
    });
    
    // Identify bottlenecks
    const reductions = Object.entries(stageMetrics.efficiency)
      .map(([stage, data]) => ({ stage, reduction: data.reductionRate }))
      .sort((a, b) => b.reduction - a.reduction);
    
    if (reductions.length > 0 && reductions[0].reduction > 50) {
      stageMetrics.bottlenecks.push({
        stage: reductions[0].stage,
        reduction: reductions[0].reduction,
        impact: 'high'
      });
    }
    
    return stageMetrics;
  }

  /**
   * Export analytics data
   * @param {string} format - Export format ('json' or 'csv')
   * @returns {string} - Exported data
   */
  exportData(format = 'json') {
    if (format === 'csv') {
      return this._exportCSV();
    } else {
      return JSON.stringify({
        exportedAt: new Date().toISOString(),
        samples: this.samples,
        metrics: this.getMetrics()
      }, null, 2);
    }
  }

  /**
   * Clear old samples based on retention policy
   */
  cleanup() {
    const cutoff = Date.now() - (this.options.retentionDays * 24 * 60 * 60 * 1000);
    const originalLength = this.samples.length;
    
    this.samples = this.samples.filter(sample => sample.timestamp > cutoff);
    
    const removed = originalLength - this.samples.length;
    if (removed > 0 && this.options.enableLogging) {
      console.log(`[Analytics] Cleaned up ${removed} old samples`);
    }
    
    this._updateAggregatedMetrics();
  }

  /**
   * Generate request ID
   * @private
   */
  _generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Count unique categories in careers
   * @private
   */
  _countUniqueCategories(careers) {
    const categories = new Set(careers.map(c => c.category).filter(Boolean));
    return categories.size;
  }

  /**
   * Calculate average confidence
   * @private
   */
  _calculateAvgConfidence(careers) {
    if (careers.length === 0) return 0;
    const confidences = careers.map(c => c.confidence || 0.5);
    return confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
  }

  /**
   * Get recent samples within time range
   * @private
   */
  _getRecentSamples(timeRange) {
    const cutoff = Date.now() - timeRange;
    return this.samples.filter(sample => sample.timestamp > cutoff);
  }

  /**
   * Calculate average of array
   * @private
   */
  _calculateAverage(values) {
    const validValues = values.filter(v => typeof v === 'number' && !isNaN(v));
    if (validValues.length === 0) return 0;
    return validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
  }

  /**
   * Calculate percentile
   * @private
   */
  _getPercentile(values, percentile) {
    const sorted = values.filter(v => typeof v === 'number').sort((a, b) => a - b);
    if (sorted.length === 0) return 0;
    
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Update aggregated metrics
   * @private
   */
  _updateAggregatedMetrics() {
    if (this.samples.length === 0) return;
    
    this.aggregatedMetrics = {
      totalRequests: this.samples.length,
      avgCareerCount: this._calculateAverage(this.samples.map(s => s.careers.total)),
      fallbackUsageRate: this._calculateFallbackUsageRate(),
      diversityScore: this._calculateDiversityScore(),
      avgResponseTime: this._calculateAverage(this.samples.map(s => s.performance.totalTime)),
      errorRate: this._calculateErrorRate()
    };
  }

  /**
   * Calculate fallback usage rate
   * @private
   */
  _calculateFallbackUsageRate() {
    if (this.samples.length === 0) return 0;
    const withFallbacks = this.samples.filter(s => 
      s.careers.fallbackCareers > 0 || s.careers.emergencyCareers > 0
    ).length;
    return (withFallbacks / this.samples.length) * 100;
  }

  /**
   * Calculate RAG-only rate
   * @private
   */
  _calculateRAGOnlyRate() {
    if (this.samples.length === 0) return 0;
    const ragOnly = this.samples.filter(s => 
      s.careers.ragCareers > 0 && s.careers.fallbackCareers === 0 && s.careers.emergencyCareers === 0
    ).length;
    return (ragOnly / this.samples.length) * 100;
  }

  /**
   * Calculate emergency fallback rate
   * @private
   */
  _calculateEmergencyRate() {
    if (this.samples.length === 0) return 0;
    const emergency = this.samples.filter(s => s.careers.emergencyCareers > 0).length;
    return (emergency / this.samples.length) * 100;
  }

  /**
   * Calculate diversity score
   * @private
   */
  _calculateDiversityScore() {
    if (this.samples.length === 0) return 0;
    const avgCategories = this._calculateAverage(this.samples.map(s => s.careers.uniqueCategories));
    const maxPossibleCategories = 5; // Assuming 5 main categories
    return Math.min(1, avgCategories / maxPossibleCategories);
  }

  /**
   * Calculate success rate
   * @private
   */
  _calculateSuccessRate() {
    if (this.samples.length === 0) return 0;
    const successful = this.samples.filter(s => s.success).length;
    return (successful / this.samples.length) * 100;
  }

  /**
   * Calculate minimum compliance rate
   * @private
   */
  _calculateMinimumComplianceRate() {
    if (this.samples.length === 0) return 0;
    const compliant = this.samples.filter(s => s.meetsMinimum).length;
    return (compliant / this.samples.length) * 100;
  }

  /**
   * Calculate diversity compliance rate
   * @private
   */
  _calculateDiversityComplianceRate() {
    if (this.samples.length === 0) return 0;
    const diverse = this.samples.filter(s => s.hasDiversity).length;
    return (diverse / this.samples.length) * 100;
  }

  /**
   * Calculate error rate
   * @private
   */
  _calculateErrorRate() {
    if (this.samples.length === 0) return 0;
    const withErrors = this.samples.filter(s => s.errors.length > 0).length;
    return (withErrors / this.samples.length) * 100;
  }

  /**
   * Generate insights from metrics
   * @private
   */
  _generateInsights(metrics) {
    const insights = [];
    
    if (metrics.careerCount.avg < 3) {
      insights.push('Average career count below minimum requirement - consider improving fallback system');
    }
    
    if (metrics.fallbackUsage.rate > 50) {
      insights.push('High fallback usage indicates RAG system may need improvement');
    }
    
    if (metrics.diversity.diversityScore < 0.5) {
      insights.push('Low diversity score - careers may be too concentrated in few categories');
    }
    
    if (metrics.performance.avgResponseTime > 10000) {
      insights.push('Response times above 10s - consider performance optimization');
    }
    
    if (metrics.success.rate < 90) {
      insights.push('Success rate below 90% - investigate error patterns');
    }
    
    return insights;
  }

  /**
   * Generate recommendations from metrics
   * @private
   */
  _generateRecommendations(metrics) {
    const recommendations = [];
    
    if (metrics.fallbackUsage.emergencyRate > 10) {
      recommendations.push('High emergency fallback usage - improve primary RAG system');
    }
    
    if (metrics.filterEfficiency?.filterReductionRate > 80) {
      recommendations.push('High filter reduction rate - consider relaxing filter criteria');
    }
    
    if (metrics.performance.avgResponseTime > 5000) {
      recommendations.push('Implement caching and parallel processing for better performance');
    }
    
    return recommendations;
  }

  /**
   * Get other helper methods for completeness
   * @private
   */
  _getCareerCountDistribution() {
    const distribution = {};
    this.samples.forEach(s => {
      const count = s.careers.total;
      distribution[count] = (distribution[count] || 0) + 1;
    });
    return distribution;
  }

  _getCategoryDistribution() {
    // Implementation would analyze category distribution across all samples
    return {};
  }

  _getPopularSubjects() {
    // Implementation would analyze most common subjects
    return [];
  }

  _getSubjectCareerCorrelation() {
    // Implementation would analyze subject-career correlations
    return {};
  }

  _getGradeDistribution() {
    // Implementation would analyze grade distribution
    return {};
  }

  _calculateTrends(samples) {
    // Implementation would calculate trends over time
    return {};
  }

  _calculateFilterReductionRate() {
    // Implementation would calculate filter reduction rates
    return 0;
  }

  _getStageEfficiency() {
    // Implementation would analyze stage efficiency
    return {};
  }

  _calculateStageReduction(stageIndex) {
    // Implementation would calculate reduction at specific stage
    return 0;
  }

  _exportCSV() {
    // Implementation would export data as CSV
    return 'CSV export not implemented';
  }
}

// Export singleton instance for convenience
export const analyticsCollector = new AnalyticsCollector();

// Export class for custom instances
export default AnalyticsCollector;