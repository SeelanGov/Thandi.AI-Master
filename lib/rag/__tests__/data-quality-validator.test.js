// lib/rag/__tests__/data-quality-validator.test.js
// Task 8.2: Unit tests for data quality validation utilities

import { DataQualityValidator } from '../data-quality-validator.js';
import { DataQualityMonitor } from '../data-quality-monitor.js';

describe('Data Quality Validation Utilities', () => {
  
  describe('DataQualityValidator', () => {
    
    test('should initialize with default options', () => {
      const validator = new DataQualityValidator();
      
      expect(validator.options.enableLogging).toBe(true);
      expect(validator.options.enableMetrics).toBe(true);
      expect(validator.options.batchSize).toBe(100);
      expect(validator.metrics.totalCareers).toBe(0);
    });
    
    test('should initialize with custom options', () => {
      const validator = new DataQualityValidator({
        enableLogging: false,
        batchSize: 50
      });
      
      expect(validator.options.enableLogging).toBe(false);
      expect(validator.options.batchSize).toBe(50);
    });
    
    test('should have required methods', () => {
      const validator = new DataQualityValidator();
      
      expect(typeof validator.analyzeCareeCoverage).toBe('function');
      expect(typeof validator.checkMetadataConsistency).toBe('function');
      expect(typeof validator.validateCareerCompleteness).toBe('function');
      expect(typeof validator.generateQualityReport).toBe('function');
      expect(typeof validator.getMetrics).toBe('function');
    });
    
    test('should return metrics object', () => {
      const validator = new DataQualityValidator();
      const metrics = validator.getMetrics();
      
      expect(metrics).toHaveProperty('totalCareers');
      expect(metrics).toHaveProperty('categoryCoverage');
      expect(metrics).toHaveProperty('metadataCompleteness');
      expect(metrics).toHaveProperty('dataQualityScore');
      expect(metrics).toHaveProperty('lastAnalysis');
    });
    
  });
  
  describe('DataQualityMonitor', () => {
    
    test('should initialize with default options', () => {
      const monitor = new DataQualityMonitor();
      
      expect(monitor.options.enableLogging).toBe(false); // Disabled by default in production
      expect(monitor.options.enableMetrics).toBe(true);
      expect(monitor.options.alertThresholds.qualityScore).toBe(70);
      expect(monitor.options.alertThresholds.completenessScore).toBe(80);
      expect(monitor.options.monitoringInterval).toBe(3600000); // 1 hour
    });
    
    test('should initialize with custom alert thresholds', () => {
      const monitor = new DataQualityMonitor({
        alertThresholds: {
          qualityScore: 85,
          completenessScore: 90,
          invalidCareerRate: 0.05
        }
      });
      
      expect(monitor.options.alertThresholds.qualityScore).toBe(85);
      expect(monitor.options.alertThresholds.completenessScore).toBe(90);
      expect(monitor.options.alertThresholds.invalidCareerRate).toBe(0.05);
    });
    
    test('should have required methods', () => {
      const monitor = new DataQualityMonitor();
      
      expect(typeof monitor.startMonitoring).toBe('function');
      expect(typeof monitor.stopMonitoring).toBe('function');
      expect(typeof monitor.performQuickCheck).toBe('function');
      expect(typeof monitor.recordCareerMatching).toBe('function');
      expect(typeof monitor.getStatus).toBe('function');
      expect(typeof monitor.getMetrics).toBe('function');
      expect(typeof monitor.resetMetrics).toBe('function');
    });
    
    test('should record career matching statistics', () => {
      const monitor = new DataQualityMonitor();
      
      const mockResult = {
        careers: [
          { title: 'Software Engineer', category: 'Technology' },
          { title: 'Data Scientist', category: 'Technology' },
          { title: 'Civil Engineer', category: 'Engineering' }
        ],
        fallbacksUsed: []
      };
      
      monitor.recordCareerMatching(mockResult);
      
      const status = monitor.getStatus();
      expect(status.careerMatchingStats.totalRequests).toBe(1);
      expect(status.careerMatchingStats.successfulMatches).toBe(1);
      expect(status.careerMatchingStats.fallbacksUsed).toBe(0);
      expect(status.careerMatchingStats.averageCareersReturned).toBe(3);
    });
    
    test('should track fallback usage', () => {
      const monitor = new DataQualityMonitor();
      
      const mockResult = {
        careers: [
          { title: 'Teacher', category: 'Education' },
          { title: 'Accountant', category: 'Business' }
        ],
        fallbacksUsed: ['fallback']
      };
      
      monitor.recordCareerMatching(mockResult);
      
      const status = monitor.getStatus();
      expect(status.careerMatchingStats.totalRequests).toBe(1);
      expect(status.careerMatchingStats.successfulMatches).toBe(0); // Less than 3 careers
      expect(status.careerMatchingStats.fallbacksUsed).toBe(1);
      expect(status.careerMatchingStats.fallbackRate).toBe(100);
    });
    
    test('should track category distribution', () => {
      const monitor = new DataQualityMonitor();
      
      const mockResults = [
        {
          careers: [
            { title: 'Software Engineer', category: 'Technology' },
            { title: 'Data Scientist', category: 'Technology' }
          ],
          fallbacksUsed: []
        },
        {
          careers: [
            { title: 'Doctor', category: 'Healthcare' },
            { title: 'Nurse', category: 'Healthcare' }
          ],
          fallbacksUsed: []
        }
      ];
      
      mockResults.forEach(result => monitor.recordCareerMatching(result));
      
      const metrics = monitor.getMetrics();
      expect(metrics.careerMatchingStats.categoryDistribution.Technology).toBe(2);
      expect(metrics.careerMatchingStats.categoryDistribution.Healthcare).toBe(2);
    });
    
    test('should calculate success and fallback rates', () => {
      const monitor = new DataQualityMonitor();
      
      // Add successful match (3+ careers)
      monitor.recordCareerMatching({
        careers: [
          { title: 'Engineer 1', category: 'Engineering' },
          { title: 'Engineer 2', category: 'Engineering' },
          { title: 'Engineer 3', category: 'Engineering' }
        ],
        fallbacksUsed: []
      });
      
      // Add unsuccessful match (< 3 careers)
      monitor.recordCareerMatching({
        careers: [
          { title: 'Teacher', category: 'Education' }
        ],
        fallbacksUsed: ['fallback']
      });
      
      const status = monitor.getStatus();
      expect(status.careerMatchingStats.successRate).toBe(50); // 1 out of 2 successful
      expect(status.careerMatchingStats.fallbackRate).toBe(50); // 1 out of 2 used fallbacks
    });
    
    test('should reset metrics correctly', () => {
      const monitor = new DataQualityMonitor();
      
      // Add some data
      monitor.recordCareerMatching({
        careers: [
          { title: 'Engineer', category: 'Engineering' },
          { title: 'Doctor', category: 'Healthcare' },
          { title: 'Teacher', category: 'Education' }
        ],
        fallbacksUsed: []
      });
      
      // Verify data exists
      let status = monitor.getStatus();
      expect(status.careerMatchingStats.totalRequests).toBe(1);
      
      // Reset metrics
      monitor.resetMetrics();
      
      // Verify data is cleared
      status = monitor.getStatus();
      expect(status.careerMatchingStats.totalRequests).toBe(0);
      expect(status.careerMatchingStats.successfulMatches).toBe(0);
      expect(status.careerMatchingStats.fallbacksUsed).toBe(0);
      expect(status.careerMatchingStats.averageCareersReturned).toBe(0);
    });
    
    test('should manage monitoring lifecycle', () => {
      const monitor = new DataQualityMonitor();
      
      // Initially not monitoring
      expect(monitor.getStatus().isMonitoring).toBe(false);
      
      // Start monitoring
      monitor.startMonitoring();
      expect(monitor.getStatus().isMonitoring).toBe(true);
      
      // Stop monitoring
      monitor.stopMonitoring();
      expect(monitor.getStatus().isMonitoring).toBe(false);
    });
    
  });
  
  describe('Integration Tests', () => {
    
    test('should work together for comprehensive monitoring', () => {
      const validator = new DataQualityValidator({ enableLogging: false });
      const monitor = new DataQualityMonitor({ enableLogging: false });
      
      // Simulate career matching results
      const mockResults = [
        {
          careers: [
            { title: 'Software Engineer', category: 'Technology' },
            { title: 'Data Scientist', category: 'Technology' },
            { title: 'Civil Engineer', category: 'Engineering' }
          ],
          fallbacksUsed: []
        },
        {
          careers: [
            { title: 'Doctor', category: 'Healthcare' },
            { title: 'Nurse', category: 'Healthcare' }
          ],
          fallbacksUsed: ['fallback']
        }
      ];
      
      mockResults.forEach(result => monitor.recordCareerMatching(result));
      
      const status = monitor.getStatus();
      const validatorMetrics = validator.getMetrics();
      
      // Verify monitoring captured the data
      expect(status.careerMatchingStats.totalRequests).toBe(2);
      expect(status.careerMatchingStats.successRate).toBe(50); // 1 out of 2 successful
      
      // Verify validator is ready for analysis
      expect(validatorMetrics).toHaveProperty('totalCareers');
      expect(validatorMetrics).toHaveProperty('categoryCoverage');
    });
    
  });
  
});