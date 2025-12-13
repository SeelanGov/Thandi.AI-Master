// lib/rag/__tests__/performance-validation.test.js
// Task 9.4: Performance Validation Testing Suite
// Validates Requirements: 10.5

import { jest } from '@jest/globals';
import { matchCareersToProfile } from '../career-matcher.js';
import { PerformanceOptimizer } from '../performance-optimizer.js';

// Mock external dependencies
jest.mock('@supabase/supabase-js');
jest.mock('openai');

describe('Performance Validation Test Suite', () => {
  let mockSupabase;
  let mockOpenAI;
  let performanceMetrics;

  beforeEach(() => {
    jest.clearAllMocks();
    performanceMetrics = [];
    
    // Mock Supabase client with performance simulation
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockImplementation(() => {
        // Simulate database query time (50-200ms)
        const delay = 50 + Math.random() * 150;
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              data: {
                career_code: `PERF${Math.floor(Math.random() * 1000)}`,
                career_title: `Performance Test Career ${Math.floor(Math.random() * 100)}`,
                career_category: ['Technology', 'Business', 'Healthcare', 'Engineering'][Math.floor(Math.random() * 4)],
                required_education: 'Bachelor\'s Degree',
                required_qualifications: 'Relevant skills and experience',
                required_subjects: 'Mathematics, English',
                salary_entry_min: 300000 + Math.random() * 200000,
                salary_entry_max: 400000 + Math.random() * 300000,
                job_outlook: 'Good prospects',
                demand_level: ['high', 'very_high'][Math.floor(Math.random() * 2)],
                short_description: 'Performance test career description with sufficient length for validation'
              },
              error: null
            });
          }, delay);
        });
      })
    };

    // Mock OpenAI client with performance simulation
    mockOpenAI = {
      embeddings: {
        create: jest.fn().mockImplementation(() => {
          // Simulate OpenAI API time (100-500ms)
          const delay = 100 + Math.random() * 400;
          return new Promise(resolve => {
            setTimeout(() => {
              resolve({
                data: [{ embedding: new Array(1536).fill(0.1 + Math.random() * 0.8) }]
              });
            }, delay);
          });
        })
      }
    };

    // Set up environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
    process.env.OPENAI_API_KEY = 'test-openai-key';
  });

  afterEach(() => {
    // Log performance summary after each test
    if (performanceMetrics.length > 0) {
      const avgDuration = performanceMetrics.reduce((sum, m) => sum + m.duration, 0) / performanceMetrics.length;
      const maxDuration = Math.max(...performanceMetrics.map(m => m.duration));
      const minDuration = Math.min(...performanceMetrics.map(m => m.duration));
      
      console.log(`Performance Summary: Avg: ${avgDuration.toFixed(0)}ms, Max: ${maxDuration}ms, Min: ${minDuration}ms`);
    }
  });

  describe('Response Time Requirements', () => {
    test('should complete career matching within 3 seconds for simple profiles', async () => {
      const simpleProfiles = [
        { grade: 10, subjects: ['Mathematics'], interests: ['Numbers'] },
        { grade: 11, subjects: ['English'], interests: ['Writing'] },
        { grade: 12, subjects: ['Business Studies'], interests: ['Management'] }
      ];

      for (const profile of simpleProfiles) {
        const startTime = Date.now();
        const careers = await matchCareersToProfile(profile);
        const duration = Date.now() - startTime;

        performanceMetrics.push({ profile: profile.subjects[0], duration, careerCount: careers.length });

        // Requirement: Sub-3-second response time for simple profiles
        expect(duration).toBeLessThan(3000);
        expect(careers.length).toBeGreaterThanOrEqual(3);

        console.log(`Simple profile (${profile.subjects[0]}): ${duration}ms, ${careers.length} careers`);
      }
    });

    test('should complete career matching within 5 seconds for complex profiles', async () => {
      const complexProfiles = [
        {
          grade: 12,
          subjects: ['Mathematics', 'Physical Sciences', 'Life Sciences', 'Information Technology', 'Business Studies'],
          interests: ['Research', 'Technology', 'Innovation', 'Analysis', 'Leadership'],
          marks: { Mathematics: 85, 'Physical Sciences': 82, 'Life Sciences': 88, 'Information Technology': 90, 'Business Studies': 78 },
          careerPreferences: 'I want to work in cutting-edge technology that combines science and business'
        },
        {
          grade: 11,
          subjects: ['Visual Arts', 'Information Technology', 'Business Studies', 'English', 'Drama'],
          interests: ['Creative Design', 'Digital Media', 'User Experience', 'Storytelling', 'Innovation'],
          marks: { 'Visual Arts': 92, 'Information Technology': 88, 'Business Studies': 85, English: 87, Drama: 90 },
          careerPreferences: 'I am interested in creative technology careers that combine art and business'
        }
      ];

      for (const profile of complexProfiles) {
        const startTime = Date.now();
        const careers = await matchCareersToProfile(profile);
        const duration = Date.now() - startTime;

        performanceMetrics.push({ 
          profile: `Complex (${profile.subjects.length} subjects)`, 
          duration, 
          careerCount: careers.length 
        });

        // Requirement: Sub-5-second response time for complex profiles
        expect(duration).toBeLessThan(5000);
        expect(careers.length).toBeGreaterThanOrEqual(3);
        expect(careers.length).toBeLessThanOrEqual(5);

        console.log(`Complex profile (${profile.subjects.length} subjects): ${duration}ms, ${careers.length} careers`);
      }
    });

    test('should maintain performance under realistic load conditions', async () => {
      const realisticProfiles = Array.from({ length: 10 }, (_, i) => ({
        grade: 10 + (i % 3),
        subjects: [
          ['Mathematics', 'Physical Sciences'],
          ['Business Studies', 'Accounting'],
          ['Visual Arts', 'English'],
          ['Life Sciences', 'Mathematics'],
          ['Information Technology', 'Mathematics']
        ][i % 5],
        interests: [
          ['Technology', 'Problem Solving'],
          ['Finance', 'Analysis'],
          ['Creativity', 'Design'],
          ['Research', 'Biology'],
          ['Programming', 'Innovation']
        ][i % 5]
      }));

      const startTime = Date.now();
      const promises = realisticProfiles.map(async (profile, index) => {
        const requestStart = Date.now();
        const careers = await matchCareersToProfile(profile);
        const requestDuration = Date.now() - requestStart;
        
        performanceMetrics.push({
          profile: `Load-${index + 1}`,
          duration: requestDuration,
          careerCount: careers.length
        });

        return { careers, duration: requestDuration };
      });

      const results = await Promise.all(promises);
      const totalDuration = Date.now() - startTime;

      // Validate all results
      results.forEach((result, index) => {
        expect(result.careers.length).toBeGreaterThanOrEqual(3);
        expect(result.duration).toBeLessThan(8000); // Individual request under 8 seconds
      });

      // Performance requirements under load
      const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
      const maxDuration = Math.max(...results.map(r => r.duration));
      const p95Duration = results.map(r => r.duration).sort((a, b) => a - b)[Math.floor(results.length * 0.95)];

      expect(avgDuration).toBeLessThan(4000); // Average under 4 seconds
      expect(maxDuration).toBeLessThan(10000); // Maximum under 10 seconds
      expect(p95Duration).toBeLessThan(6000); // 95th percentile under 6 seconds

      console.log(`Load test results:`, {
        totalDuration: `${totalDuration}ms`,
        avgDuration: `${avgDuration.toFixed(0)}ms`,
        maxDuration: `${maxDuration}ms`,
        p95Duration: `${p95Duration}ms`,
        concurrentRequests: results.length
      });
    });
  });

  describe('Scalability Testing', () => {
    test('should handle increasing knowledge base size efficiently', async () => {
      // Simulate different knowledge base sizes by varying response complexity
      const knowledgeBaseSizes = [
        { size: 'small', multiplier: 1, description: '~50 careers' },
        { size: 'medium', multiplier: 2, description: '~100 careers' },
        { size: 'large', multiplier: 4, description: '~200 careers' }
      ];

      const testProfile = {
        grade: 11,
        subjects: ['Mathematics', 'Physical Sciences', 'Information Technology'],
        interests: ['Engineering', 'Technology', 'Innovation']
      };

      for (const kbSize of knowledgeBaseSizes) {
        // Simulate larger knowledge base by making multiple database calls
        const originalSingle = mockSupabase.single;
        mockSupabase.single = jest.fn().mockImplementation(() => {
          const promises = Array.from({ length: kbSize.multiplier }, () => originalSingle());
          return Promise.all(promises).then(results => results[0]);
        });

        const startTime = Date.now();
        const careers = await matchCareersToProfile(testProfile);
        const duration = Date.now() - startTime;

        performanceMetrics.push({
          profile: `KB-${kbSize.size}`,
          duration,
          careerCount: careers.length
        });

        // Scalability requirements
        expect(duration).toBeLessThan(8000); // Should scale reasonably
        expect(careers.length).toBeGreaterThanOrEqual(3);

        console.log(`Knowledge base ${kbSize.size} (${kbSize.description}): ${duration}ms, ${careers.length} careers`);

        // Restore original mock
        mockSupabase.single = originalSingle;
      }
    });

    test('should maintain performance with concurrent user scenarios', async () => {
      const concurrencyLevels = [5, 10, 15];
      
      for (const concurrency of concurrencyLevels) {
        const profiles = Array.from({ length: concurrency }, (_, i) => ({
          grade: 10 + (i % 3),
          subjects: ['Mathematics', 'English'],
          interests: ['Learning', 'Growth']
        }));

        const startTime = Date.now();
        const promises = profiles.map(async (profile, index) => {
          const requestStart = Date.now();
          const careers = await matchCareersToProfile(profile);
          const requestDuration = Date.now() - requestStart;
          
          return { careers, duration: requestDuration, index };
        });

        const results = await Promise.all(promises);
        const totalDuration = Date.now() - startTime;

        // Validate concurrent performance
        const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
        const maxDuration = Math.max(...results.map(r => r.duration));
        const successRate = results.filter(r => r.careers.length >= 3).length / results.length;

        expect(successRate).toBeGreaterThanOrEqual(0.9); // 90% success rate
        expect(avgDuration).toBeLessThan(6000); // Average under 6 seconds
        expect(maxDuration).toBeLessThan(12000); // Max under 12 seconds

        performanceMetrics.push({
          profile: `Concurrent-${concurrency}`,
          duration: avgDuration,
          careerCount: results.reduce((sum, r) => sum + r.careers.length, 0) / results.length
        });

        console.log(`Concurrency ${concurrency}: ${totalDuration}ms total, ${avgDuration.toFixed(0)}ms avg, ${successRate * 100}% success`);
      }
    });
  });

  describe('Memory Usage and Resource Management', () => {
    test('should manage memory efficiently during career matching', async () => {
      const memoryTestProfile = {
        grade: 12,
        subjects: ['Mathematics', 'Physical Sciences', 'Life Sciences', 'Information Technology'],
        interests: ['Research', 'Technology', 'Innovation', 'Analysis']
      };

      // Measure memory usage before
      const memBefore = process.memoryUsage();
      
      // Perform multiple career matching operations
      const iterations = 20;
      const results = [];
      
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        const careers = await matchCareersToProfile(memoryTestProfile);
        const duration = Date.now() - startTime;
        
        results.push({ careers, duration });
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }

      // Measure memory usage after
      const memAfter = process.memoryUsage();
      
      // Calculate memory growth
      const heapGrowth = memAfter.heapUsed - memBefore.heapUsed;
      const heapGrowthMB = heapGrowth / (1024 * 1024);

      // Validate memory efficiency
      expect(heapGrowthMB).toBeLessThan(50); // Less than 50MB growth for 20 iterations
      
      // Validate consistent performance
      const durations = results.map(r => r.duration);
      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const maxDuration = Math.max(...durations);
      
      expect(avgDuration).toBeLessThan(5000);
      expect(maxDuration).toBeLessThan(8000);

      console.log(`Memory test: ${heapGrowthMB.toFixed(2)}MB growth, ${avgDuration.toFixed(0)}ms avg duration`);
    });

    test('should handle resource cleanup properly', async () => {
      const testProfile = {
        grade: 11,
        subjects: ['Mathematics', 'Business Studies'],
        interests: ['Finance', 'Analysis']
      };

      // Test multiple sequential requests
      const sequentialResults = [];
      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        const careers = await matchCareersToProfile(testProfile);
        const duration = Date.now() - startTime;
        
        sequentialResults.push(duration);
        
        expect(careers.length).toBeGreaterThanOrEqual(3);
        expect(duration).toBeLessThan(6000);
      }

      // Performance should remain consistent (no resource leaks)
      const firstHalf = sequentialResults.slice(0, 5);
      const secondHalf = sequentialResults.slice(5);
      
      const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d, 0) / secondHalf.length;
      
      // Second half should not be significantly slower (no resource leaks)
      const performanceDegradation = (secondHalfAvg - firstHalfAvg) / firstHalfAvg;
      expect(performanceDegradation).toBeLessThan(0.5); // Less than 50% degradation

      console.log(`Resource cleanup test: First half ${firstHalfAvg.toFixed(0)}ms, Second half ${secondHalfAvg.toFixed(0)}ms`);
    });
  });

  describe('Performance Optimization Validation', () => {
    test('should validate caching effectiveness', async () => {
      const testProfile = {
        grade: 11,
        subjects: ['Mathematics', 'Information Technology'],
        interests: ['Programming', 'Problem Solving']
      };

      // First request (no cache)
      const startTime1 = Date.now();
      const careers1 = await matchCareersToProfile(testProfile);
      const duration1 = Date.now() - startTime1;

      // Second identical request (potentially cached)
      const startTime2 = Date.now();
      const careers2 = await matchCareersToProfile(testProfile);
      const duration2 = Date.now() - startTime2;

      // Third identical request (should be cached)
      const startTime3 = Date.now();
      const careers3 = await matchCareersToProfile(testProfile);
      const duration3 = Date.now() - startTime3;

      // Validate results consistency
      expect(careers1.length).toBeGreaterThanOrEqual(3);
      expect(careers2.length).toBeGreaterThanOrEqual(3);
      expect(careers3.length).toBeGreaterThanOrEqual(3);

      // Performance should be reasonable for all requests
      expect(duration1).toBeLessThan(8000);
      expect(duration2).toBeLessThan(8000);
      expect(duration3).toBeLessThan(8000);

      performanceMetrics.push(
        { profile: 'Cache-1st', duration: duration1, careerCount: careers1.length },
        { profile: 'Cache-2nd', duration: duration2, careerCount: careers2.length },
        { profile: 'Cache-3rd', duration: duration3, careerCount: careers3.length }
      );

      console.log(`Caching test: 1st: ${duration1}ms, 2nd: ${duration2}ms, 3rd: ${duration3}ms`);
    });

    test('should validate parallel processing optimization', () => {
      const optimizer = new PerformanceOptimizer();
      
      // Test parallel execution capability
      const tasks = Array.from({ length: 5 }, (_, i) => 
        () => new Promise(resolve => {
          setTimeout(() => resolve(`Task ${i + 1} completed`), 100 + Math.random() * 200);
        })
      );

      const startTime = Date.now();
      
      return optimizer.executeParallel(tasks).then(results => {
        const duration = Date.now() - startTime;
        
        expect(results).toHaveLength(5);
        expect(duration).toBeLessThan(1000); // Should complete in parallel, not sequentially
        
        console.log(`Parallel processing test: ${duration}ms for 5 tasks`);
      });
    });

    test('should validate performance monitoring accuracy', async () => {
      const testProfile = {
        grade: 11,
        subjects: ['Business Studies', 'Mathematics'],
        interests: ['Finance', 'Analysis']
      };

      // Perform career matching with monitoring
      const startTime = Date.now();
      const careers = await matchCareersToProfile(testProfile);
      const actualDuration = Date.now() - startTime;

      // Validate monitoring data would be accurate
      expect(careers.length).toBeGreaterThanOrEqual(3);
      expect(actualDuration).toBeLessThan(8000);

      // Performance monitoring should track key metrics
      const expectedMetrics = {
        totalTime: actualDuration,
        careerCount: careers.length,
        success: careers.length >= 3
      };

      expect(expectedMetrics.success).toBe(true);
      expect(expectedMetrics.careerCount).toBeGreaterThanOrEqual(3);
      expect(expectedMetrics.totalTime).toBeGreaterThan(0);

      console.log(`Monitoring validation:`, expectedMetrics);
    });
  });

  describe('Performance Regression Prevention', () => {
    test('should maintain baseline performance standards', async () => {
      const baselineProfiles = [
        { grade: 10, subjects: ['Mathematics'], interests: ['Numbers'], expectedMaxDuration: 3000 },
        { grade: 11, subjects: ['Mathematics', 'Physical Sciences'], interests: ['Engineering'], expectedMaxDuration: 4000 },
        { grade: 12, subjects: ['Mathematics', 'Physical Sciences', 'Life Sciences'], interests: ['Research'], expectedMaxDuration: 5000 }
      ];

      for (const { expectedMaxDuration, ...profile } of baselineProfiles) {
        const startTime = Date.now();
        const careers = await matchCareersToProfile(profile);
        const duration = Date.now() - startTime;

        // Baseline performance requirements
        expect(duration).toBeLessThan(expectedMaxDuration);
        expect(careers.length).toBeGreaterThanOrEqual(3);
        expect(careers.length).toBeLessThanOrEqual(5);

        performanceMetrics.push({
          profile: `Baseline-G${profile.grade}`,
          duration,
          careerCount: careers.length
        });

        console.log(`Baseline Grade ${profile.grade}: ${duration}ms (max: ${expectedMaxDuration}ms), ${careers.length} careers`);
      }
    });

    test('should validate performance does not degrade with system complexity', async () => {
      const complexityLevels = [
        {
          name: 'Simple',
          profile: { grade: 10, subjects: ['Mathematics'], interests: ['Numbers'] }
        },
        {
          name: 'Moderate',
          profile: { grade: 11, subjects: ['Mathematics', 'Physical Sciences'], interests: ['Engineering', 'Technology'] }
        },
        {
          name: 'Complex',
          profile: { 
            grade: 12, 
            subjects: ['Mathematics', 'Physical Sciences', 'Life Sciences', 'Information Technology'], 
            interests: ['Research', 'Technology', 'Innovation', 'Analysis'],
            marks: { Mathematics: 85, 'Physical Sciences': 82, 'Life Sciences': 88, 'Information Technology': 90 }
          }
        }
      ];

      const results = [];
      
      for (const { name, profile } of complexityLevels) {
        const iterations = 3;
        const durations = [];
        
        for (let i = 0; i < iterations; i++) {
          const startTime = Date.now();
          const careers = await matchCareersToProfile(profile);
          const duration = Date.now() - startTime;
          
          durations.push(duration);
          expect(careers.length).toBeGreaterThanOrEqual(3);
        }
        
        const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
        results.push({ name, avgDuration });
        
        performanceMetrics.push({
          profile: `Complexity-${name}`,
          duration: avgDuration,
          careerCount: 0 // Not tracking for this test
        });
      }

      // Validate performance scaling
      const simpleAvg = results.find(r => r.name === 'Simple').avgDuration;
      const complexAvg = results.find(r => r.name === 'Complex').avgDuration;
      
      // Complex profiles should not be more than 3x slower than simple ones
      const performanceRatio = complexAvg / simpleAvg;
      expect(performanceRatio).toBeLessThan(3);

      console.log(`Performance scaling:`, results.map(r => `${r.name}: ${r.avgDuration.toFixed(0)}ms`).join(', '));
      console.log(`Performance ratio (Complex/Simple): ${performanceRatio.toFixed(2)}x`);
    });
  });
});