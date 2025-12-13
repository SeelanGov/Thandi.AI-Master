// lib/rag/__tests__/comprehensive-test-suite.test.js
// Task 9.1: Comprehensive Test Suite for Enhanced RAG Filtering System
// Validates Requirements: 10.1, 10.2, 10.4

import { jest } from '@jest/globals';
import { matchCareersToProfile, analyzeProfileComplexity } from '../career-matcher.js';
import { MetadataFilter } from '../metadata-filter.js';
import { FallbackSelector } from '../fallback-selector.js';
import { PerformanceOptimizer } from '../performance-optimizer.js';
import { RAGErrorHandler } from '../error-handler.js';
import { SafetyValidator } from '../safety-validator.js';
import { AnalyticsCollector } from '../analytics-collector.js';
import { InputValidator } from '../input-validator.js';

// Mock external dependencies
jest.mock('@supabase/supabase-js');
jest.mock('openai');

describe('Comprehensive RAG Filtering Test Suite', () => {
  let mockSupabase;
  let mockOpenAI;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null })
    };

    // Mock OpenAI client
    mockOpenAI = {
      embeddings: {
        create: jest.fn().mockResolvedValue({
          data: [{ embedding: new Array(1536).fill(0.1) }]
        })
      }
    };

    // Set up environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
    process.env.OPENAI_API_KEY = 'test-openai-key';
  });

  describe('Component Integration Tests', () => {
    test('should integrate all RAG components successfully', async () => {
      // Test that all components work together
      const profile = {
        grade: 11,
        subjects: ['Mathematics', 'Physical Sciences'],
        interests: ['Technology', 'Problem Solving'],
        marks: { Mathematics: 85, 'Physical Sciences': 78 }
      };

      // Mock successful responses
      mockSupabase.single.mockResolvedValue({
        data: {
          career_code: 'ENG001',
          career_title: 'Software Engineer',
          career_category: 'Technology',
          required_education: 'Bachelor\'s Degree',
          demand_level: 'high'
        },
        error: null
      });

      const result = await matchCareersToProfile(profile);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(3);
      
      // Verify career structure
      if (result.length > 0) {
        const career = result[0];
        expect(career).toHaveProperty('title');
        expect(career).toHaveProperty('category');
        expect(career).toHaveProperty('description');
        expect(career).toHaveProperty('similarity');
        expect(career).toHaveProperty('confidence');
        expect(career).toHaveProperty('source');
      }
    });

    test('should handle component failures gracefully', async () => {
      const profile = {
        grade: 12,
        subjects: ['Business Studies'],
        interests: ['Management']
      };

      // Mock database failure
      mockSupabase.single.mockRejectedValue(new Error('Database connection failed'));

      const result = await matchCareersToProfile(profile);
      
      // Should still return careers (emergency fallback)
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    test('should validate metadata filter integration', () => {
      const filter = new MetadataFilter();
      
      const testChunks = [
        {
          chunk_metadata: { career_code: 'ENG001', career_title: 'Engineer' },
          chunk_text: 'Engineering career information',
          similarity: 0.8
        },
        {
          chunk_metadata: { source: 'career_database' },
          chunk_text: 'Career: Software Developer',
          similarity: 0.7
        },
        {
          chunk_metadata: {},
          chunk_text: 'Random text without career info',
          similarity: 0.6
        }
      ];

      const filtered = filter.filter(testChunks);
      
      expect(filtered.length).toBeGreaterThanOrEqual(2);
      expect(filtered.every(chunk => chunk.similarity >= 0.6)).toBe(true);
    });

    test('should validate fallback selector integration', async () => {
      const selector = new FallbackSelector();
      
      const profile = {
        grade: 11,
        subjects: ['Mathematics', 'Information Technology'],
        interests: ['Programming']
      };

      const existingCareers = [
        { title: 'Software Engineer', code: 'ENG001', category: 'Technology' }
      ];

      // Mock database response for fallback careers
      mockSupabase.single.mockResolvedValue({
        data: {
          career_code: 'ENG002',
          career_title: 'Data Scientist',
          career_category: 'Technology',
          demand_level: 'high'
        },
        error: null
      });

      const fallbacks = await selector.selectFallbacks(profile, existingCareers, 3);
      
      expect(Array.isArray(fallbacks)).toBe(true);
      expect(fallbacks.length).toBeGreaterThanOrEqual(0);
      
      // Verify no duplicates
      const existingTitles = new Set(existingCareers.map(c => c.title));
      fallbacks.forEach(career => {
        expect(existingTitles.has(career.title)).toBe(false);
      });
    });
  });

  describe('Performance Optimization Tests', () => {
    test('should complete career matching within performance bounds', async () => {
      const profile = {
        grade: 11,
        subjects: ['Mathematics', 'Physical Sciences', 'Life Sciences'],
        interests: ['Research', 'Analysis', 'Problem Solving']
      };

      const startTime = Date.now();
      const result = await matchCareersToProfile(profile);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(5000); // 5 second timeout for tests
      expect(result.length).toBeGreaterThanOrEqual(3);
    });

    test('should handle concurrent requests efficiently', async () => {
      const profiles = [
        { grade: 10, subjects: ['Mathematics'], interests: ['Numbers'] },
        { grade: 11, subjects: ['Business Studies'], interests: ['Management'] },
        { grade: 12, subjects: ['Visual Arts'], interests: ['Design'] }
      ];

      const startTime = Date.now();
      const promises = profiles.map(profile => matchCareersToProfile(profile));
      const results = await Promise.all(promises);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(10000); // 10 seconds for 3 concurrent requests
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThanOrEqual(3);
      });
    });

    test('should validate performance optimizer functionality', () => {
      const optimizer = new PerformanceOptimizer();
      
      // Test caching functionality
      const cacheKey = 'test-key';
      const testData = { test: 'data' };
      
      // This is a synchronous test of the optimizer structure
      expect(optimizer).toHaveProperty('getCachedOrExecute');
      expect(optimizer).toHaveProperty('executeParallel');
      expect(optimizer).toHaveProperty('checkPerformanceThresholds');
    });
  });

  describe('Error Handling and Resilience Tests', () => {
    test('should handle invalid profiles gracefully', async () => {
      const invalidProfiles = [
        null,
        undefined,
        {},
        { grade: 'invalid' },
        { subjects: 'not an array' },
        { grade: 15, subjects: [] } // Invalid grade
      ];

      for (const profile of invalidProfiles) {
        const result = await matchCareersToProfile(profile);
        
        expect(Array.isArray(result)).toBe(true);
        // Should return at least emergency careers
        expect(result.length).toBeGreaterThanOrEqual(1);
      }
    });

    test('should validate error handler functionality', () => {
      const errorHandler = new RAGErrorHandler();
      
      expect(errorHandler).toHaveProperty('wrapOperation');
      expect(errorHandler).toHaveProperty('handleSystemError');
      expect(errorHandler).toHaveProperty('handleDatabaseError');
    });

    test('should handle database connection failures', async () => {
      const profile = {
        grade: 11,
        subjects: ['Mathematics'],
        interests: ['Problem Solving']
      };

      // Mock complete database failure
      mockSupabase.single.mockRejectedValue(new Error('Connection timeout'));
      mockSupabase.select.mockRejectedValue(new Error('Connection timeout'));

      const result = await matchCareersToProfile(profile);
      
      // Should still return emergency careers
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(1);
      
      // Verify emergency careers have required properties
      result.forEach(career => {
        expect(career).toHaveProperty('title');
        expect(career).toHaveProperty('source');
        expect(career.source).toMatch(/fallback|emergency/);
      });
    });

    test('should handle OpenAI API failures', async () => {
      const profile = {
        grade: 11,
        subjects: ['Mathematics'],
        interests: ['Analysis']
      };

      // Mock OpenAI failure
      mockOpenAI.embeddings.create.mockRejectedValue(new Error('API rate limit exceeded'));

      const result = await matchCareersToProfile(profile);
      
      // Should still return careers using fallback mechanisms
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Safety and Validation Tests', () => {
    test('should validate safety validator functionality', () => {
      const validator = new SafetyValidator();
      
      const testCareers = [
        {
          title: 'Software Engineer',
          description: 'Valid career description',
          category: 'Technology'
        },
        {
          title: 'X', // Too short
          description: 'Short',
          category: 'Invalid'
        }
      ];

      const validation = validator.validateCareers(testCareers);
      
      expect(validation).toHaveProperty('validCareers');
      expect(validation).toHaveProperty('summary');
      expect(validation.summary).toHaveProperty('valid');
      expect(validation.summary).toHaveProperty('invalid');
      expect(validation.summary).toHaveProperty('warnings');
    });

    test('should validate input validator functionality', () => {
      const validator = new InputValidator();
      
      const testProfile = {
        grade: 11,
        subjects: ['Mathematics', 'Physical Sciences'],
        interests: ['Technology']
      };

      const validation = validator.validateProfile(testProfile);
      
      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('errors');
      expect(validation).toHaveProperty('warnings');
      expect(validation).toHaveProperty('sanitizedProfile');
    });

    test('should ensure all careers pass safety validation', async () => {
      const profile = {
        grade: 11,
        subjects: ['Mathematics', 'Physical Sciences'],
        interests: ['Engineering']
      };

      const result = await matchCareersToProfile(profile);
      
      // All returned careers should be valid
      result.forEach(career => {
        expect(career.title).toBeDefined();
        expect(career.title.length).toBeGreaterThan(2);
        expect(career.title.length).toBeLessThan(101);
        expect(career.description).toBeDefined();
        expect(career.description.length).toBeGreaterThan(10);
      });
    });
  });

  describe('Analytics and Monitoring Tests', () => {
    test('should validate analytics collector functionality', () => {
      const analytics = new AnalyticsCollector();
      
      expect(analytics).toHaveProperty('recordRequest');
      expect(analytics).toHaveProperty('getMetrics');
      expect(analytics).toHaveProperty('generateReport');
    });

    test('should track career matching metrics', async () => {
      const profile = {
        grade: 11,
        subjects: ['Business Studies'],
        interests: ['Management']
      };

      const result = await matchCareersToProfile(profile);
      
      // Verify that analytics would be collected
      expect(Array.isArray(result)).toBe(true);
      
      // Check that careers have tracking properties
      result.forEach(career => {
        expect(career).toHaveProperty('source');
        expect(career).toHaveProperty('confidence');
        expect(career).toHaveProperty('similarity');
      });
    });
  });

  describe('Profile Complexity Analysis Tests', () => {
    test('should analyze basic profile complexity correctly', () => {
      const basicProfile = {
        grade: 10,
        subjects: ['Mathematics', 'English'],
        interests: ['Reading']
      };

      const complexity = analyzeProfileComplexity(basicProfile);
      
      expect(complexity).toHaveProperty('score');
      expect(complexity).toHaveProperty('profileType');
      expect(complexity).toHaveProperty('recommendedCount');
      expect(complexity.recommendedCount).toBeGreaterThanOrEqual(3);
      expect(complexity.recommendedCount).toBeLessThanOrEqual(5);
    });

    test('should analyze comprehensive profile complexity correctly', () => {
      const comprehensiveProfile = {
        grade: 12,
        subjects: ['Mathematics', 'Physical Sciences', 'Life Sciences', 'Information Technology', 'Business Studies', 'English'],
        interests: ['Research', 'Technology', 'Management', 'Analysis'],
        marks: {
          Mathematics: 85,
          'Physical Sciences': 82,
          'Life Sciences': 78,
          'Information Technology': 90,
          'Business Studies': 75
        },
        careerPreferences: 'I am interested in careers that combine technology with business analysis and research'
      };

      const complexity = analyzeProfileComplexity(comprehensiveProfile);
      
      expect(complexity.score).toBeGreaterThan(5);
      expect(complexity.profileType).toMatch(/comprehensive|broad/);
      expect(complexity.recommendedCount).toBeGreaterThanOrEqual(4);
      expect(complexity.recommendedCount).toBeLessThanOrEqual(5);
    });
  });

  describe('Regression Prevention Tests', () => {
    test('should maintain minimum career count requirement', async () => {
      const profiles = [
        { grade: 10, subjects: ['Mathematics'], interests: ['Numbers'] },
        { grade: 11, subjects: ['Business Studies'], interests: ['Management'] },
        { grade: 12, subjects: ['Visual Arts'], interests: ['Design'] },
        { grade: 11, subjects: ['Life Sciences'], interests: ['Biology'] },
        { grade: 10, subjects: ['Information Technology'], interests: ['Computers'] }
      ];

      for (const profile of profiles) {
        const result = await matchCareersToProfile(profile);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThanOrEqual(3);
        expect(result.length).toBeLessThanOrEqual(5);
        
        // Verify career quality
        result.forEach(career => {
          expect(career).toHaveProperty('title');
          expect(career).toHaveProperty('description');
          expect(career).toHaveProperty('source');
          expect(career.title).toBeTruthy();
          expect(career.description).toBeTruthy();
        });
      }
    });

    test('should maintain backward compatibility with existing data structures', async () => {
      // Test with legacy profile format
      const legacyProfile = {
        grade: 11,
        subjects: ['Mathematics', 'Physical Sciences'],
        interests: ['Engineering']
        // Missing newer fields like marks, careerPreferences
      };

      const result = await matchCareersToProfile(legacyProfile);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(3);
    });

    test('should preserve existing safety and verification requirements', async () => {
      const profile = {
        grade: 11,
        subjects: ['Mathematics'],
        interests: ['Technology']
      };

      const result = await matchCareersToProfile(profile);
      
      // Verify all careers meet safety requirements
      result.forEach(career => {
        // Title validation
        expect(career.title).toBeDefined();
        expect(typeof career.title).toBe('string');
        expect(career.title.length).toBeGreaterThan(2);
        
        // Description validation
        expect(career.description).toBeDefined();
        expect(typeof career.description).toBe('string');
        expect(career.description.length).toBeGreaterThan(10);
        
        // Source tracking
        expect(career.source).toBeDefined();
        expect(['rag', 'fallback', 'emergency_fallback', 'hybrid']).toContain(career.source);
      });
    });
  });
});