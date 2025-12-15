// lib/rag/__tests__/diversity-enforcer.unit.test.js
// Unit tests for DiversityEnforcer class

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { DiversityEnforcer } from '../diversity-enforcer.js';

describe('DiversityEnforcer', () => {
  let diversityEnforcer;

  beforeEach(() => {
    diversityEnforcer = new DiversityEnforcer({
      enableLogging: false, // Disable logging for tests
      maxCategoryDominance: 0.6,
      minCategoryRepresentation: 0.15,
      targetCategoryCount: 3
    });
  });

  afterEach(() => {
    diversityEnforcer.resetStatistics();
  });

  describe('Constructor and Configuration', () => {
    test('should initialize with default configuration', () => {
      const enforcer = new DiversityEnforcer();
      expect(enforcer.config.maxCategoryDominance).toBe(0.6);
      expect(enforcer.config.minCategoryRepresentation).toBe(0.15);
      expect(enforcer.config.targetCategoryCount).toBe(3);
      expect(enforcer.config.enableLogging).toBe(true);
    });

    test('should accept custom configuration', () => {
      const enforcer = new DiversityEnforcer({
        maxCategoryDominance: 0.7,
        minCategoryRepresentation: 0.2,
        targetCategoryCount: 4,
        enableLogging: false
      });
      
      expect(enforcer.config.maxCategoryDominance).toBe(0.7);
      expect(enforcer.config.minCategoryRepresentation).toBe(0.2);
      expect(enforcer.config.targetCategoryCount).toBe(4);
      expect(enforcer.config.enableLogging).toBe(false);
    });

    test('should initialize statistics', () => {
      const stats = diversityEnforcer.getStatistics();
      expect(stats.totalEnforcements).toBe(0);
      expect(stats.diversityCorrections).toBe(0);
      expect(stats.qualityPreservations).toBe(0);
      expect(stats.categoryBalanceAdjustments).toBe(0);
    });

    test('should validate configuration on initialization', () => {
      expect(() => {
        new DiversityEnforcer({
          maxCategoryDominance: 1.5, // Invalid: > 1
          minCategoryRepresentation: 0.15
        });
      }).toThrow('Invalid DiversityEnforcer configuration');
    });

    test('should validate weight sum constraint', () => {
      expect(() => {
        new DiversityEnforcer({
          qualityPreservationWeight: 0.6,
          diversityWeight: 0.5 // Sum = 1.1, should be 1.0
        });
      }).toThrow('Invalid DiversityEnforcer configuration');
    });
  });

  describe('Diversity State Analysis', () => {
    test('should analyze diversity state correctly', () => {
      const careers = [
        { title: 'Teacher', category: 'Education', similarity: 0.8 },
        { title: 'Engineer', category: 'Technology', similarity: 0.7 },
        { title: 'Doctor', category: 'Healthcare', similarity: 0.75 },
        { title: 'Analyst', category: 'Technology', similarity: 0.6 }
      ];

      const analysis = diversityEnforcer.analyzeDiversityState(careers);
      
      expect(analysis.categoryCount).toBe(3);
      expect(analysis.categoryDistribution).toHaveProperty('Education');
      expect(analysis.categoryDistribution).toHaveProperty('Technology');
      expect(analysis.categoryDistribution).toHaveProperty('Healthcare');
      expect(analysis.dominantCategory).toBe('Technology');
      expect(analysis.dominancePercentage).toBe(50);
      expect(analysis.diversityScore).toBeGreaterThan(0);
    });

    test('should detect category dominance', () => {
      const careers = [
        { title: 'Teacher 1', category: 'Education', similarity: 0.8 },
        { title: 'Teacher 2', category: 'Education', similarity: 0.7 },
        { title: 'Teacher 3', category: 'Education', similarity: 0.75 },
        { title: 'Engineer', category: 'Technology', similarity: 0.6 }
      ];

      const analysis = diversityEnforcer.analyzeDiversityState(careers);
      
      expect(analysis.hasDominance).toBe(true);
      expect(analysis.dominantCategory).toBe('Education');
      expect(analysis.dominancePercentage).toBe(75);
    });

    test('should handle empty careers array', () => {
      const analysis = diversityEnforcer.analyzeDiversityState([]);
      
      expect(analysis.diversityScore).toBe(0);
      expect(analysis.categoryCount).toBe(0);
      expect(analysis.hasDominance).toBe(false);
      expect(analysis.dominantCategory).toBeNull();
    });

    test('should handle careers without categories', () => {
      const careers = [
        { title: 'Career 1', similarity: 0.8 },
        { title: 'Career 2', similarity: 0.7 }
      ];

      const analysis = diversityEnforcer.analyzeDiversityState(careers);
      
      expect(analysis.categoryDistribution).toHaveProperty('Uncategorized');
      expect(analysis.dominantCategory).toBe('Uncategorized');
      expect(analysis.dominancePercentage).toBe(100);
    });

    test('should calculate quality distribution', () => {
      const careers = [
        { title: 'Career 1', category: 'Tech', similarity: 0.8 },
        { title: 'Career 2', category: 'Tech', similarity: 0.6 },
        { title: 'Career 3', category: 'Health', similarity: 0.9 }
      ];

      const analysis = diversityEnforcer.analyzeDiversityState(careers);
      
      expect(analysis.qualityDistribution).toHaveProperty('Tech');
      expect(analysis.qualityDistribution).toHaveProperty('Health');
      expect(analysis.qualityDistribution.Tech.averageQuality).toBe(0.7);
      expect(analysis.qualityDistribution.Health.averageQuality).toBe(0.9);
    });
  });

  describe('Diversity Enforcement Need Assessment', () => {
    test('should detect need for enforcement due to dominance', () => {
      const analysis = {
        hasDominance: true,
        categoryCount: 3,
        underrepresentedCategories: [],
        diversityScore: 70
      };

      const needsEnforcement = diversityEnforcer.needsDiversityEnforcement(analysis, diversityEnforcer.config);
      expect(needsEnforcement).toBe(true);
    });

    test('should detect need for enforcement due to insufficient categories', () => {
      const analysis = {
        hasDominance: false,
        categoryCount: 2, // Below target of 3
        underrepresentedCategories: [],
        diversityScore: 70
      };

      const needsEnforcement = diversityEnforcer.needsDiversityEnforcement(analysis, diversityEnforcer.config);
      expect(needsEnforcement).toBe(true);
    });

    test('should detect need for enforcement due to underrepresented categories', () => {
      const analysis = {
        hasDominance: false,
        categoryCount: 3,
        underrepresentedCategories: ['Healthcare'],
        diversityScore: 70
      };

      const needsEnforcement = diversityEnforcer.needsDiversityEnforcement(analysis, diversityEnforcer.config);
      expect(needsEnforcement).toBe(true);
    });

    test('should detect need for enforcement due to low diversity score', () => {
      const analysis = {
        hasDominance: false,
        categoryCount: 3,
        underrepresentedCategories: [],
        diversityScore: 50 // Below minimum of 60
      };

      const needsEnforcement = diversityEnforcer.needsDiversityEnforcement(analysis, diversityEnforcer.config);
      expect(needsEnforcement).toBe(true);
    });

    test('should not need enforcement when requirements are met', () => {
      const analysis = {
        hasDominance: false,
        categoryCount: 4,
        underrepresentedCategories: [],
        diversityScore: 80
      };

      const needsEnforcement = diversityEnforcer.needsDiversityEnforcement(analysis, diversityEnforcer.config);
      expect(needsEnforcement).toBe(false);
    });
  });

  describe('Category Dominance Reduction', () => {
    test('should reduce category dominance effectively', () => {
      const careers = [
        { title: 'Teacher 1', category: 'Education', similarity: 0.9 },
        { title: 'Teacher 2', category: 'Education', similarity: 0.8 },
        { title: 'Teacher 3', category: 'Education', similarity: 0.7 },
        { title: 'Teacher 4', category: 'Education', similarity: 0.6 },
        { title: 'Engineer', category: 'Technology', similarity: 0.85 }
      ];

      const analysis = diversityEnforcer.analyzeDiversityState(careers);
      const result = diversityEnforcer.reduceCategoryDominance(careers, analysis, diversityEnforcer.config);
      
      const educationCareers = result.filter(c => c.category === 'Education');
      const maxAllowed = Math.floor(careers.length * diversityEnforcer.config.maxCategoryDominance);
      
      expect(educationCareers.length).toBeLessThanOrEqual(maxAllowed);
      expect(result.length).toBeLessThanOrEqual(careers.length); // May reduce total count
      
      // Should keep highest quality careers from dominant category
      const keptEducationCareers = result.filter(c => c.category === 'Education');
      if (keptEducationCareers.length > 0) {
        expect(keptEducationCareers[0].similarity).toBeGreaterThanOrEqual(0.8);
      }
    });

    test('should not modify careers when no dominance exists', () => {
      const careers = [
        { title: 'Teacher', category: 'Education', similarity: 0.8 },
        { title: 'Engineer', category: 'Technology', similarity: 0.7 },
        { title: 'Doctor', category: 'Healthcare', similarity: 0.75 }
      ];

      const analysis = diversityEnforcer.analyzeDiversityState(careers);
      const result = diversityEnforcer.reduceCategoryDominance(careers, analysis, diversityEnforcer.config);
      
      expect(result).toEqual(careers);
    });

    test('should maintain quality ordering after dominance reduction', () => {
      const careers = [
        { title: 'Teacher 1', category: 'Education', similarity: 0.9 },
        { title: 'Teacher 2', category: 'Education', similarity: 0.8 },
        { title: 'Teacher 3', category: 'Education', similarity: 0.7 },
        { title: 'Engineer', category: 'Technology', similarity: 0.85 }
      ];

      const analysis = diversityEnforcer.analyzeDiversityState(careers);
      const result = diversityEnforcer.reduceCategoryDominance(careers, analysis, diversityEnforcer.config);
      
      // Result should be sorted by similarity in descending order
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].similarity).toBeGreaterThanOrEqual(result[i + 1].similarity);
      }
    });
  });

  describe('Category Representation Balancing', () => {
    test('should balance underrepresented categories', () => {
      const careers = [
        { title: 'Teacher 1', category: 'Education', similarity: 0.8 },
        { title: 'Teacher 2', category: 'Education', similarity: 0.7 },
        { title: 'Teacher 3', category: 'Education', similarity: 0.75 },
        { title: 'Engineer', category: 'Technology', similarity: 0.9 }, // Single tech career
        { title: 'Doctor', category: 'Healthcare', similarity: 0.85 } // Single healthcare career
      ];

      const result = diversityEnforcer.balanceCategoryRepresentation(careers, diversityEnforcer.config);
      
      // Should maintain all careers from underrepresented categories
      const techCareers = result.filter(c => c.category === 'Technology');
      const healthCareers = result.filter(c => c.category === 'Healthcare');
      
      expect(techCareers.length).toBe(1);
      expect(healthCareers.length).toBe(1);
      expect(result.length).toBe(careers.length);
    });

    test('should not modify balanced representations', () => {
      const careers = [
        { title: 'Teacher', category: 'Education', similarity: 0.8 },
        { title: 'Engineer', category: 'Technology', similarity: 0.75 },
        { title: 'Doctor', category: 'Healthcare', similarity: 0.7 }
      ];

      const result = diversityEnforcer.balanceCategoryRepresentation(careers, diversityEnforcer.config);
      
      expect(result.length).toBe(careers.length);
      // Should maintain quality ordering
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].similarity).toBeGreaterThanOrEqual(result[i + 1].similarity);
      }
    });

    test('should handle empty careers array', () => {
      const result = diversityEnforcer.balanceCategoryRepresentation([], diversityEnforcer.config);
      expect(result).toEqual([]);
    });
  });

  describe('Quality-Diversity Balance Optimization', () => {
    test('should preserve quality when degradation is minimal', () => {
      const originalCareers = [
        { title: 'Career 1', category: 'Tech', similarity: 0.9 },
        { title: 'Career 2', category: 'Tech', similarity: 0.8 },
        { title: 'Career 3', category: 'Health', similarity: 0.85 }
      ];

      const enforcedCareers = [
        { title: 'Career 1', category: 'Tech', similarity: 0.9 },
        { title: 'Career 3', category: 'Health', similarity: 0.85 },
        { title: 'Career 4', category: 'Education', similarity: 0.82 }
      ];

      const result = diversityEnforcer.optimizeQualityDiversityBalance(
        enforcedCareers, 
        originalCareers, 
        diversityEnforcer.config
      );
      
      expect(result).toEqual(enforcedCareers);
    });

    test('should create hybrid recommendations when quality loss is significant', () => {
      const originalCareers = [
        { title: 'High Quality 1', category: 'Tech', similarity: 0.95 },
        { title: 'High Quality 2', category: 'Tech', similarity: 0.9 },
        { title: 'High Quality 3', category: 'Tech', similarity: 0.85 }
      ];

      const enforcedCareers = [
        { title: 'Low Quality 1', category: 'Education', similarity: 0.6 },
        { title: 'Low Quality 2', category: 'Health', similarity: 0.55 },
        { title: 'Low Quality 3', category: 'Business', similarity: 0.5 }
      ];

      const result = diversityEnforcer.optimizeQualityDiversityBalance(
        enforcedCareers, 
        originalCareers, 
        diversityEnforcer.config
      );
      
      // Should create hybrid that includes some high-quality careers
      const avgQuality = result.reduce((sum, c) => sum + c.similarity, 0) / result.length;
      const enforcedAvgQuality = enforcedCareers.reduce((sum, c) => sum + c.similarity, 0) / enforcedCareers.length;
      
      expect(avgQuality).toBeGreaterThan(enforcedAvgQuality);
    });

    test('should calculate average quality correctly', () => {
      const careers = [
        { similarity: 0.8 },
        { similarity: 0.6 },
        { similarity: 0.9 }
      ];

      const avgQuality = diversityEnforcer.calculateAverageQuality(careers);
      expect(avgQuality).toBeCloseTo(0.767, 2);
    });

    test('should handle empty careers in quality calculation', () => {
      expect(diversityEnforcer.calculateAverageQuality([])).toBe(0);
      expect(diversityEnforcer.calculateAverageQuality(null)).toBe(0);
    });
  });

  describe('Hybrid Recommendations Creation', () => {
    test('should create hybrid recommendations with proper scoring', () => {
      const originalCareers = [
        { title: 'Original 1', category: 'Tech', similarity: 0.9 },
        { title: 'Original 2', category: 'Tech', similarity: 0.8 }
      ];

      const enforcedCareers = [
        { title: 'Original 1', category: 'Tech', similarity: 0.9 }, // Common career
        { title: 'Enforced 1', category: 'Health', similarity: 0.7 }
      ];

      const result = diversityEnforcer.createHybridRecommendations(
        originalCareers, 
        enforcedCareers, 
        0.7, // qualityWeight
        0.3  // diversityWeight
      );
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(Math.min(originalCareers.length, enforcedCareers.length));
      
      // Should include the common high-quality career
      expect(result.some(c => c.title === 'Original 1')).toBe(true);
    });

    test('should calculate diversity contribution correctly', () => {
      const career = { title: 'Test Career', category: 'Tech', similarity: 0.8 };
      const careers = [
        { title: 'Career 1', category: 'Tech', similarity: 0.7 },
        { title: 'Career 2', category: 'Health', similarity: 0.6 },
        { title: 'Career 3', category: 'Health', similarity: 0.5 }
      ];

      const contribution = diversityEnforcer.calculateDiversityContribution(career, careers);
      
      expect(contribution).toBeGreaterThan(0);
      expect(contribution).toBeLessThanOrEqual(1);
    });

    test('should generate unique career keys', () => {
      const career1 = { title: 'Software Engineer', category: 'Technology' };
      const career2 = { title: 'Software Engineer', category: 'Tech' };
      const career3 = { title: 'Data Engineer', category: 'Technology' };

      const key1 = diversityEnforcer.getCareerKey(career1);
      const key2 = diversityEnforcer.getCareerKey(career2);
      const key3 = diversityEnforcer.getCareerKey(career3);

      expect(key1).not.toBe(key2);
      expect(key1).not.toBe(key3);
      expect(key2).not.toBe(key3);
    });
  });

  describe('Main Enforcement Function', () => {
    test('should enforce diversity when needed', () => {
      const careers = [
        { title: 'Teacher 1', category: 'Education', similarity: 0.9 },
        { title: 'Teacher 2', category: 'Education', similarity: 0.8 },
        { title: 'Teacher 3', category: 'Education', similarity: 0.7 },
        { title: 'Engineer', category: 'Technology', similarity: 0.85 }
      ];

      const result = diversityEnforcer.enforceDiversity(careers);
      
      expect(result.length).toBeLessThanOrEqual(careers.length); // May reduce total count
      expect(result.length).toBeGreaterThan(0); // Should return some careers
      
      // Should reduce education dominance
      const educationCareers = result.filter(c => c.category === 'Education');
      const maxAllowed = Math.floor(careers.length * diversityEnforcer.config.maxCategoryDominance);
      expect(educationCareers.length).toBeLessThanOrEqual(maxAllowed);
      
      // Should update statistics
      const stats = diversityEnforcer.getStatistics();
      expect(stats.totalEnforcements).toBe(1);
    });

    test('should not modify careers when diversity is adequate', () => {
      const careers = [
        { title: 'Teacher', category: 'Education', similarity: 0.8 },
        { title: 'Engineer', category: 'Technology', similarity: 0.7 },
        { title: 'Doctor', category: 'Healthcare', similarity: 0.75 },
        { title: 'Analyst', category: 'Finance', similarity: 0.6 }
      ];

      const result = diversityEnforcer.enforceDiversity(careers);
      
      expect(result).toEqual(careers);
    });

    test('should handle empty careers array', () => {
      const result = diversityEnforcer.enforceDiversity([]);
      expect(result).toEqual([]);
    });

    test('should handle null/undefined careers', () => {
      expect(diversityEnforcer.enforceDiversity(null)).toEqual(null);
      expect(diversityEnforcer.enforceDiversity(undefined)).toEqual(undefined);
    });

    test('should return original careers on error', () => {
      const careers = [
        { title: 'Career 1', category: 'Tech', similarity: 0.8 }
      ];

      // Mock a method to throw an error
      const originalMethod = diversityEnforcer.analyzeDiversityState;
      diversityEnforcer.analyzeDiversityState = () => {
        throw new Error('Test error');
      };

      const result = diversityEnforcer.enforceDiversity(careers);
      expect(result).toEqual(careers);

      // Restore original method
      diversityEnforcer.analyzeDiversityState = originalMethod;
    });
  });

  describe('Configuration Management', () => {
    test('should update configuration successfully', () => {
      const success = diversityEnforcer.updateConfiguration({
        maxCategoryDominance: 0.7,
        targetCategoryCount: 4
      });

      expect(success).toBe(true);
      expect(diversityEnforcer.config.maxCategoryDominance).toBe(0.7);
      expect(diversityEnforcer.config.targetCategoryCount).toBe(4);
    });

    test('should reject invalid configuration updates', () => {
      const success = diversityEnforcer.updateConfiguration({
        maxCategoryDominance: 1.5, // Invalid: > 1
        targetCategoryCount: 4
      });

      expect(success).toBe(false);
      expect(diversityEnforcer.config.maxCategoryDominance).toBe(0.6); // Should remain unchanged
    });

    test('should validate numeric parameters', () => {
      expect(diversityEnforcer.isValidConfiguration({
        maxCategoryDominance: 0.7,
        minCategoryRepresentation: 0.2,
        targetCategoryCount: 3,
        minQualityThreshold: 0.5,
        qualityPreservationWeight: 0.7,
        diversityWeight: 0.3
      })).toBe(true);
    });

    test('should reject configuration with invalid weight sum', () => {
      expect(diversityEnforcer.isValidConfiguration({
        maxCategoryDominance: 0.7,
        minCategoryRepresentation: 0.2,
        targetCategoryCount: 3,
        minQualityThreshold: 0.5,
        qualityPreservationWeight: 0.6,
        diversityWeight: 0.5 // Sum = 1.1
      })).toBe(false);
    });

    test('should reject configuration with logical inconsistencies', () => {
      expect(diversityEnforcer.isValidConfiguration({
        maxCategoryDominance: 0.1,
        minCategoryRepresentation: 0.2, // Greater than max dominance
        targetCategoryCount: 3,
        minQualityThreshold: 0.5,
        qualityPreservationWeight: 0.7,
        diversityWeight: 0.3
      })).toBe(false);
    });

    test('should get current configuration', () => {
      const config = diversityEnforcer.getConfiguration();
      
      expect(config).toHaveProperty('maxCategoryDominance');
      expect(config).toHaveProperty('minCategoryRepresentation');
      expect(config).toHaveProperty('targetCategoryCount');
      expect(config.maxCategoryDominance).toBe(0.6);
    });
  });

  describe('Statistics Management', () => {
    test('should track enforcement statistics', () => {
      const careers = [
        { title: 'Teacher 1', category: 'Education', similarity: 0.9 },
        { title: 'Teacher 2', category: 'Education', similarity: 0.8 },
        { title: 'Teacher 3', category: 'Education', similarity: 0.7 },
        { title: 'Engineer', category: 'Technology', similarity: 0.85 }
      ];

      diversityEnforcer.enforceDiversity(careers);
      diversityEnforcer.enforceDiversity(careers);

      const stats = diversityEnforcer.getStatistics();
      expect(stats.totalEnforcements).toBe(2);
      expect(stats.successRate).toBeGreaterThan(0);
    });

    test('should update diversity improvement statistics', () => {
      const beforeAnalysis = { diversityScore: 40 };
      const afterAnalysis = { diversityScore: 70 };

      diversityEnforcer.updateStatistics(beforeAnalysis, afterAnalysis);

      const stats = diversityEnforcer.getStatistics();
      expect(stats.diversityCorrections).toBe(1);
      expect(stats.averageDiversityImprovement).toBe(30);
    });

    test('should reset statistics correctly', () => {
      // Generate some statistics
      const careers = [
        { title: 'Teacher 1', category: 'Education', similarity: 0.9 },
        { title: 'Teacher 2', category: 'Education', similarity: 0.8 },
        { title: 'Teacher 3', category: 'Education', similarity: 0.7 },
        { title: 'Engineer', category: 'Technology', similarity: 0.85 }
      ];

      diversityEnforcer.enforceDiversity(careers);
      expect(diversityEnforcer.getStatistics().totalEnforcements).toBe(1);

      diversityEnforcer.resetStatistics();
      const stats = diversityEnforcer.getStatistics();
      expect(stats.totalEnforcements).toBe(0);
      expect(stats.diversityCorrections).toBe(0);
      expect(stats.qualityPreservations).toBe(0);
    });

    test('should calculate success rate correctly', () => {
      const beforeAnalysis1 = { diversityScore: 40 };
      const afterAnalysis1 = { diversityScore: 70 };
      const beforeAnalysis2 = { diversityScore: 80 };
      const afterAnalysis2 = { diversityScore: 75 }; // No improvement

      diversityEnforcer.updateStatistics(beforeAnalysis1, afterAnalysis1);
      diversityEnforcer.updateStatistics(beforeAnalysis2, afterAnalysis2);

      const stats = diversityEnforcer.getStatistics();
      expect(stats.totalEnforcements).toBe(2);
      expect(stats.diversityCorrections).toBe(1);
      expect(stats.successRate).toBe(50);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle malformed career objects', () => {
      const careers = [
        null,
        { title: null, category: undefined, similarity: 0.8 },
        { title: 'Valid Career', category: 'Technology', similarity: 0.7 },
        undefined
      ];

      expect(() => diversityEnforcer.enforceDiversity(careers)).not.toThrow();
      const result = diversityEnforcer.enforceDiversity(careers);
      expect(Array.isArray(result)).toBe(true);
    });

    test('should handle careers with missing similarity scores', () => {
      const careers = [
        { title: 'Career 1', category: 'Tech' }, // No similarity
        { title: 'Career 2', category: 'Health', similarity: null },
        { title: 'Career 3', category: 'Education', similarity: 0.8 }
      ];

      expect(() => diversityEnforcer.enforceDiversity(careers)).not.toThrow();
      const result = diversityEnforcer.enforceDiversity(careers);
      expect(result.length).toBe(careers.length);
    });

    test('should handle single career input', () => {
      const careers = [
        { title: 'Single Career', category: 'Technology', similarity: 0.8 }
      ];

      const result = diversityEnforcer.enforceDiversity(careers);
      // Single career may not meet diversity requirements, so enforcement might return empty array
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(careers.length);
    });

    test('should handle careers with identical categories', () => {
      const careers = [
        { title: 'Career 1', category: 'Technology', similarity: 0.8 },
        { title: 'Career 2', category: 'Technology', similarity: 0.7 },
        { title: 'Career 3', category: 'Technology', similarity: 0.6 }
      ];

      const result = diversityEnforcer.enforceDiversity(careers);
      expect(result.length).toBeLessThanOrEqual(careers.length);
      
      // Should still return some careers even with no diversity
      expect(result.length).toBeGreaterThan(0);
    });

    test('should handle very large career lists', () => {
      const careers = Array.from({ length: 100 }, (_, i) => ({
        title: `Career ${i}`,
        category: `Category ${i % 5}`, // 5 categories
        similarity: Math.random()
      }));

      expect(() => diversityEnforcer.enforceDiversity(careers)).not.toThrow();
      const result = diversityEnforcer.enforceDiversity(careers);
      expect(result.length).toBe(careers.length);
    });
  });

  describe('Integration with Configuration Options', () => {
    test('should respect enableStrictEnforcement setting', () => {
      const strictEnforcer = new DiversityEnforcer({
        enableStrictEnforcement: true,
        enableLogging: false
      });

      const lenientEnforcer = new DiversityEnforcer({
        enableStrictEnforcement: false,
        enableLogging: false
      });

      const careers = [
        { title: 'Teacher 1', category: 'Education', similarity: 0.9 },
        { title: 'Teacher 2', category: 'Education', similarity: 0.8 },
        { title: 'Teacher 3', category: 'Education', similarity: 0.7 },
        { title: 'Engineer', category: 'Technology', similarity: 0.85 }
      ];

      const strictResult = strictEnforcer.enforceDiversity(careers);
      const lenientResult = lenientEnforcer.enforceDiversity(careers);

      // Both should enforce, but strict might be more aggressive
      expect(strictResult.length).toBeLessThanOrEqual(careers.length);
      expect(lenientResult.length).toBeLessThanOrEqual(careers.length);
      expect(strictResult.length).toBeGreaterThan(0);
      expect(lenientResult.length).toBeGreaterThan(0);
    });

    test('should respect enableQualityPreservation setting', () => {
      const qualityPreservingEnforcer = new DiversityEnforcer({
        enableQualityPreservation: true,
        enableLogging: false
      });

      const diversityFocusedEnforcer = new DiversityEnforcer({
        enableQualityPreservation: false,
        enableLogging: false
      });

      const highQualityCareers = [
        { title: 'High Quality 1', category: 'Tech', similarity: 0.95 },
        { title: 'High Quality 2', category: 'Tech', similarity: 0.9 },
        { title: 'High Quality 3', category: 'Tech', similarity: 0.85 }
      ];

      const qualityResult = qualityPreservingEnforcer.enforceDiversity(highQualityCareers);
      const diversityResult = diversityFocusedEnforcer.enforceDiversity(highQualityCareers);

      // Quality-preserving should maintain higher average quality
      const qualityAvg = qualityResult.reduce((sum, c) => sum + (c.similarity || 0), 0) / qualityResult.length;
      const diversityAvg = diversityResult.reduce((sum, c) => sum + (c.similarity || 0), 0) / diversityResult.length;

      expect(qualityAvg).toBeGreaterThanOrEqual(diversityAvg);
    });
  });
});