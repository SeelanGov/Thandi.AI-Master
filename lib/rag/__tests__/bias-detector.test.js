// lib/rag/__tests__/bias-detector.test.js
// Unit tests for BiasDetector class

import { BiasDetector } from '../bias-detector.js';

describe('BiasDetector', () => {
  let biasDetector;

  beforeEach(() => {
    biasDetector = new BiasDetector({
      enableLogging: false, // Disable logging for tests
      enablePatternTracking: true
    });
  });

  describe('detectTeachingBias', () => {
    test('should detect teaching bias when >60% careers are teaching-related', () => {
      const careers = [
        { title: 'High School Mathematics Teacher', category: 'Education', similarity: 0.9 },
        { title: 'Primary School Teacher', category: 'Teaching', similarity: 0.85 },
        { title: 'University Lecturer', category: 'Education', similarity: 0.8 },
        { title: 'Software Engineer', category: 'Technology', similarity: 0.75 }
      ];

      const result = biasDetector.detectTeachingBias(careers);

      expect(result.hasBias).toBe(true);
      expect(result.severity).toBeGreaterThan(0);
      expect(result.details.teachingPercentage).toBe(75); // 3/4 = 75%
      expect(result.details.teachingCareers).toBe(3);
      expect(result.details.biasType).toBe('teaching_dominance');
    });

    test('should not detect bias when teaching careers are below threshold', () => {
      const careers = [
        { title: 'Software Engineer', category: 'Technology', similarity: 0.9 },
        { title: 'Data Scientist', category: 'Technology', similarity: 0.85 },
        { title: 'High School Teacher', category: 'Education', similarity: 0.8 },
        { title: 'Financial Analyst', category: 'Finance', similarity: 0.75 }
      ];

      const result = biasDetector.detectTeachingBias(careers);

      expect(result.hasBias).toBe(false);
      expect(result.severity).toBe(0);
      expect(result.details.teachingPercentage).toBe(25); // 1/4 = 25%
    });

    test('should handle insufficient data gracefully', () => {
      const careers = [
        { title: 'Teacher', category: 'Education', similarity: 0.9 }
      ];

      const result = biasDetector.detectTeachingBias(careers);

      expect(result.hasBias).toBe(false);
      expect(result.details.reason).toBe('insufficient_data');
      expect(result.details.careerCount).toBe(1);
    });

    test('should detect teaching careers by title keywords', () => {
      const careers = [
        { title: 'Mathematics Instructor', category: 'Other', similarity: 0.9 },
        { title: 'Physics Professor', category: 'Academic', similarity: 0.85 },
        { title: 'Education Specialist', category: 'Consulting', similarity: 0.8 },
        { title: 'Software Engineer', category: 'Technology', similarity: 0.75 }
      ];

      const result = biasDetector.detectTeachingBias(careers);

      expect(result.hasBias).toBe(true);
      expect(result.details.teachingCareers).toBe(3);
    });

    test('should use custom threshold when provided', () => {
      const careers = [
        { title: 'Teacher', category: 'Education', similarity: 0.9 },
        { title: 'Engineer', category: 'Technology', similarity: 0.85 }
      ];

      const result = biasDetector.detectTeachingBias(careers, 0.4); // 40% threshold

      expect(result.hasBias).toBe(true); // 50% > 40%
      expect(result.details.threshold).toBe(40);
    });
  });

  describe('analyzeCategoryDistribution', () => {
    test('should analyze category distribution correctly', () => {
      const careers = [
        { title: 'Software Engineer', category: 'Technology', similarity: 0.9 },
        { title: 'Data Scientist', category: 'Technology', similarity: 0.85 },
        { title: 'Teacher', category: 'Education', similarity: 0.8 },
        { title: 'Doctor', category: 'Healthcare', similarity: 0.75 }
      ];

      const result = biasDetector.analyzeCategoryDistribution(careers);

      expect(result.categories).toContain('Technology');
      expect(result.categories).toContain('Education');
      expect(result.categories).toContain('Healthcare');
      expect(result.dominantCategory).toBe('Technology');
      expect(result.dominancePercentage).toBe(50); // 2/4 = 50%
      expect(result.hasDominance).toBe(false); // 50% < 60% threshold
      expect(result.uniqueCategories).toBe(3);
    });

    test('should detect category dominance when threshold exceeded', () => {
      const careers = [
        { title: 'Software Engineer', category: 'Technology', similarity: 0.9 },
        { title: 'Data Scientist', category: 'Technology', similarity: 0.85 },
        { title: 'Web Developer', category: 'Technology', similarity: 0.8 },
        { title: 'Teacher', category: 'Education', similarity: 0.75 }
      ];

      const result = biasDetector.analyzeCategoryDistribution(careers);

      expect(result.hasDominance).toBe(true); // 75% > 60% threshold
      expect(result.dominantCategory).toBe('Technology');
      expect(result.dominancePercentage).toBe(75);
    });

    test('should handle empty career list', () => {
      const result = biasDetector.analyzeCategoryDistribution([]);

      expect(result.categories).toEqual([]);
      expect(result.dominantCategory).toBeNull();
      expect(result.diversity).toBe(0);
      expect(result.hasDominance).toBe(false);
    });

    test('should handle careers without categories', () => {
      const careers = [
        { title: 'Software Engineer', similarity: 0.9 },
        { title: 'Data Scientist', similarity: 0.85 }
      ];

      const result = biasDetector.analyzeCategoryDistribution(careers);

      expect(result.categories).toContain('Uncategorized');
      expect(result.dominantCategory).toBe('Uncategorized');
    });

    test('should calculate average similarities per category', () => {
      const careers = [
        { title: 'Software Engineer', category: 'Technology', similarity: 0.9 },
        { title: 'Data Scientist', category: 'Technology', similarity: 0.8 },
        { title: 'Teacher', category: 'Education', similarity: 0.7 }
      ];

      const result = biasDetector.analyzeCategoryDistribution(careers);

      expect(result.distribution.Technology.details.avgSimilarity).toBe(0.85); // (0.9 + 0.8) / 2
      expect(result.distribution.Education.details.avgSimilarity).toBe(0.7);
    });
  });

  describe('identifyBiasPatterns', () => {
    test('should identify STEM teaching bias pattern', () => {
      const careers = [
        { title: 'Mathematics Teacher', category: 'Education', similarity: 0.9 },
        { title: 'Physics Teacher', category: 'Education', similarity: 0.85 },
        { title: 'Science Instructor', category: 'Education', similarity: 0.8 },
        { title: 'Software Engineer', category: 'Technology', similarity: 0.75 }
      ];

      const profile = {
        grade: 12,
        subjects: ['Mathematics', 'Physical Sciences']
      };

      const result = biasDetector.identifyBiasPatterns(careers, profile);

      expect(result.patterns).toHaveLength(1);
      expect(result.patterns[0].type).toBe('stem_teaching_bias');
      expect(result.patterns[0].severity).toBeGreaterThan(0);
      expect(result.corrections).toContainEqual(
        expect.objectContaining({
          type: 'limit_teaching_careers',
          priority: 'high'
        })
      );
      expect(result.corrections).toContainEqual(
        expect.objectContaining({
          type: 'boost_stem_careers',
          priority: 'high'
        })
      );
    });

    test('should identify category dominance pattern', () => {
      const careers = [
        { title: 'Software Engineer', category: 'Technology', similarity: 0.9 },
        { title: 'Data Scientist', category: 'Technology', similarity: 0.85 },
        { title: 'Web Developer', category: 'Technology', similarity: 0.8 },
        { title: 'Teacher', category: 'Education', similarity: 0.75 }
      ];

      const profile = {
        grade: 11,
        subjects: ['English', 'History']
      };

      const result = biasDetector.identifyBiasPatterns(careers, profile);

      const dominancePattern = result.patterns.find(p => p.type === 'category_dominance');
      expect(dominancePattern).toBeDefined();
      expect(dominancePattern.evidence.dominantCategory).toBe('Technology');
      expect(dominancePattern.evidence.percentage).toBe(75);
    });

    test('should identify cultural stereotype patterns', () => {
      const careers = [
        { title: 'Mathematics Teacher', category: 'Education', similarity: 0.9 },
        { title: 'High School Teacher', category: 'Education', similarity: 0.85 },
        { title: 'Software Engineer', category: 'Technology', similarity: 0.8 }
      ];

      const profile = {
        grade: 12,
        subjects: ['Mathematics', 'Mathematical Literacy']
      };

      const result = biasDetector.identifyBiasPatterns(careers, profile);

      const culturalPattern = result.patterns.find(p => p.type === 'cultural_stereotype');
      expect(culturalPattern).toBeDefined();
      expect(culturalPattern.evidence.mathTeachingPercentage).toBeGreaterThan(0);
    });

    test('should return no patterns for balanced recommendations', () => {
      const careers = [
        { title: 'Software Engineer', category: 'Technology', similarity: 0.9 },
        { title: 'Financial Analyst', category: 'Finance', similarity: 0.85 },
        { title: 'Doctor', category: 'Healthcare', similarity: 0.8 },
        { title: 'Teacher', category: 'Education', similarity: 0.75 }
      ];

      const profile = {
        grade: 11,
        subjects: ['English', 'History', 'Geography']
      };

      const result = biasDetector.identifyBiasPatterns(careers, profile);

      expect(result.patterns).toHaveLength(0);
      expect(result.corrections).toHaveLength(0);
      expect(result.confidence).toBe(0);
    });

    test('should track patterns when enabled', () => {
      const careers = [
        { title: 'Teacher', category: 'Education', similarity: 0.9 },
        { title: 'Teacher', category: 'Education', similarity: 0.85 },
        { title: 'Teacher', category: 'Education', similarity: 0.8 }
      ];

      const profile = {
        grade: 12,
        subjects: ['Mathematics']
      };

      biasDetector.identifyBiasPatterns(careers, profile);

      const patterns = biasDetector.getRecentPatterns();
      expect(patterns).toHaveLength(1);
      expect(patterns[0].profile.isSTEM).toBe(true);
      expect(patterns[0].patterns).toHaveLength(2); // STEM teaching bias + category dominance
    });
  });

  describe('isSTEMStudent', () => {
    test('should identify STEM students correctly', () => {
      const stemProfile = {
        subjects: ['Mathematics', 'Physical Sciences', 'Information Technology']
      };

      expect(biasDetector.isSTEMStudent(stemProfile)).toBe(true);
    });

    test('should identify non-STEM students correctly', () => {
      const nonStemProfile = {
        subjects: ['English', 'History', 'Geography']
      };

      expect(biasDetector.isSTEMStudent(nonStemProfile)).toBe(false);
    });

    test('should handle missing subjects', () => {
      const emptyProfile = {};
      expect(biasDetector.isSTEMStudent(emptyProfile)).toBe(false);

      const nullSubjects = { subjects: null };
      expect(biasDetector.isSTEMStudent(nullSubjects)).toBe(false);
    });

    test('should detect STEM subjects with partial matches', () => {
      const partialStemProfile = {
        subjects: ['Advanced Programme Mathematics', 'Life Sciences']
      };

      expect(biasDetector.isSTEMStudent(partialStemProfile)).toBe(true);
    });
  });

  describe('getDetectionStats', () => {
    test('should return correct statistics', () => {
      // Simulate some detections
      biasDetector.detectTeachingBias([
        { title: 'Teacher', category: 'Education', similarity: 0.9 },
        { title: 'Teacher', category: 'Education', similarity: 0.85 },
        { title: 'Teacher', category: 'Education', similarity: 0.8 }
      ]);

      biasDetector.detectTeachingBias([
        { title: 'Engineer', category: 'Technology', similarity: 0.9 },
        { title: 'Doctor', category: 'Healthcare', similarity: 0.85 }
      ]);

      const stats = biasDetector.getDetectionStats();

      expect(stats.totalAnalyses).toBe(2);
      expect(stats.biasDetected).toBe(1);
      expect(stats.teachingBiasCount).toBe(1);
      expect(stats.biasDetectionRate).toBe(50); // 1/2 = 50%
      expect(stats.teachingBiasRate).toBe(50);
    });

    test('should handle zero analyses', () => {
      const stats = biasDetector.getDetectionStats();

      expect(stats.totalAnalyses).toBe(0);
      expect(stats.biasDetected).toBe(0);
      expect(stats.biasDetectionRate).toBeUndefined();
    });
  });

  describe('configuration', () => {
    test('should use custom thresholds', () => {
      const customDetector = new BiasDetector({
        teachingBiasThreshold: 0.4,
        categoryDominanceThreshold: 0.5,
        enableLogging: false
      });

      const careers = [
        { title: 'Teacher', category: 'Education', similarity: 0.9 },
        { title: 'Engineer', category: 'Technology', similarity: 0.85 }
      ];

      const teachingResult = customDetector.detectTeachingBias(careers);
      expect(teachingResult.hasBias).toBe(true); // 50% > 40%

      const categoryResult = customDetector.analyzeCategoryDistribution(careers);
      expect(categoryResult.hasDominance).toBe(true); // 50% >= 50%
    });

    test('should update configuration', () => {
      biasDetector.updateConfig({
        teachingBiasThreshold: 0.3,
        minCareersForAnalysis: 2
      });

      expect(biasDetector.config.teachingBiasThreshold).toBe(0.3);
      expect(biasDetector.config.minCareersForAnalysis).toBe(2);
    });
  });

  describe('resetStats', () => {
    test('should reset all statistics', () => {
      // Generate some stats
      biasDetector.detectTeachingBias([
        { title: 'Teacher', category: 'Education', similarity: 0.9 },
        { title: 'Teacher', category: 'Education', similarity: 0.85 },
        { title: 'Teacher', category: 'Education', similarity: 0.8 }
      ]);

      expect(biasDetector.getDetectionStats().totalAnalyses).toBe(1);

      biasDetector.resetStats();

      const stats = biasDetector.getDetectionStats();
      expect(stats.totalAnalyses).toBe(0);
      expect(stats.biasDetected).toBe(0);
      expect(biasDetector.getRecentPatterns()).toHaveLength(0);
    });
  });
});