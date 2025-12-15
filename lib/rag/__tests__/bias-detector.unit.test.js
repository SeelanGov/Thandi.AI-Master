// lib/rag/__tests__/bias-detector.unit.test.js
// Unit tests for BiasDetector class

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { BiasDetector } from '../bias-detector.js';

describe('BiasDetector', () => {
  let biasDetector;

  beforeEach(() => {
    biasDetector = new BiasDetector({
      enableLogging: false, // Disable logging for tests
      enablePatternTracking: true
    });
  });

  afterEach(() => {
    biasDetector.resetStats();
  });

  describe('Constructor and Configuration', () => {
    test('should initialize with default configuration', () => {
      const detector = new BiasDetector();
      expect(detector.config.teachingBiasThreshold).toBe(0.6);
      expect(detector.config.categoryDominanceThreshold).toBe(0.6);
      expect(detector.config.minCareersForAnalysis).toBe(3);
      expect(detector.config.enableLogging).toBe(true);
    });

    test('should accept custom configuration', () => {
      const detector = new BiasDetector({
        teachingBiasThreshold: 0.7,
        categoryDominanceThreshold: 0.5,
        minCareersForAnalysis: 5,
        enableLogging: false
      });
      
      expect(detector.config.teachingBiasThreshold).toBe(0.7);
      expect(detector.config.categoryDominanceThreshold).toBe(0.5);
      expect(detector.config.minCareersForAnalysis).toBe(5);
      expect(detector.config.enableLogging).toBe(false);
    });

    test('should initialize detection statistics', () => {
      const stats = biasDetector.getDetectionStats();
      expect(stats.totalAnalyses).toBe(0);
      expect(stats.biasDetected).toBe(0);
      expect(stats.teachingBiasCount).toBe(0);
    });
  });

  describe('Teaching Bias Detection', () => {
    test('should detect teaching bias when threshold exceeded', () => {
      const careers = [
        { title: 'Mathematics Teacher', category: 'Education', similarity: 0.8 },
        { title: 'Science Teacher', category: 'Education', similarity: 0.7 },
        { title: 'Physics Teacher', category: 'Teaching', similarity: 0.75 },
        { title: 'Software Engineer', category: 'Technology', similarity: 0.6 }
      ];

      const result = biasDetector.detectTeachingBias(careers);
      
      expect(result.hasBias).toBe(true);
      expect(result.severity).toBeGreaterThan(0);
      expect(result.details.teachingCareers).toBe(3);
      expect(result.details.totalCareers).toBe(4);
      expect(result.details.teachingPercentage).toBe(75);
    });

    test('should not detect bias when below threshold', () => {
      const careers = [
        { title: 'Mathematics Teacher', category: 'Education', similarity: 0.8 },
        { title: 'Software Engineer', category: 'Technology', similarity: 0.7 },
        { title: 'Data Scientist', category: 'Technology', similarity: 0.75 },
        { title: 'Financial Analyst', category: 'Finance', similarity: 0.6 }
      ];

      const result = biasDetector.detectTeachingBias(careers);
      
      expect(result.hasBias).toBe(false);
      expect(result.severity).toBe(0);
      expect(result.details.teachingPercentage).toBe(25);
    });

    test('should handle insufficient data gracefully', () => {
      const careers = [
        { title: 'Mathematics Teacher', category: 'Education', similarity: 0.8 }
      ];

      const result = biasDetector.detectTeachingBias(careers);
      
      expect(result.hasBias).toBe(false);
      expect(result.severity).toBe(0);
      expect(result.details.reason).toBe('insufficient_data');
    });

    test('should identify teaching careers by title keywords', () => {
      const careers = [
        { title: 'Math Instructor', category: 'Other', similarity: 0.8 },
        { title: 'Physics Professor', category: 'Other', similarity: 0.7 },
        { title: 'Software Engineer', category: 'Technology', similarity: 0.75 }
      ];

      const result = biasDetector.detectTeachingBias(careers);
      
      expect(result.hasBias).toBe(true);
      expect(result.details.teachingCareers).toBe(2);
    });

    test('should identify teaching careers by description keywords', () => {
      const careers = [
        { title: 'Academic Specialist', description: 'Teaching mathematics to students', similarity: 0.8 },
        { title: 'Education Coordinator', description: 'Educator role in schools', similarity: 0.7 },
        { title: 'Software Engineer', description: 'Develop software applications', similarity: 0.75 }
      ];

      const result = biasDetector.detectTeachingBias(careers);
      
      expect(result.hasBias).toBe(true);
      expect(result.details.teachingCareers).toBe(2);
    });

    test('should calculate severity correctly', () => {
      const careers = [
        { title: 'Teacher 1', category: 'Education', similarity: 0.8 },
        { title: 'Teacher 2', category: 'Education', similarity: 0.7 },
        { title: 'Teacher 3', category: 'Education', similarity: 0.75 },
        { title: 'Teacher 4', category: 'Education', similarity: 0.6 },
        { title: 'Engineer', category: 'Technology', similarity: 0.5 }
      ];

      const result = biasDetector.detectTeachingBias(careers);
      
      expect(result.hasBias).toBe(true);
      expect(result.details.teachingPercentage).toBe(80);
      // Severity should be (0.8 - 0.6) / (1 - 0.6) = 0.5
      expect(result.severity).toBeCloseTo(0.5, 2);
    });

    test('should update detection statistics', () => {
      const careers = [
        { title: 'Teacher 1', category: 'Education', similarity: 0.8 },
        { title: 'Teacher 2', category: 'Education', similarity: 0.7 },
        { title: 'Teacher 3', category: 'Education', similarity: 0.75 },
        { title: 'Engineer', category: 'Technology', similarity: 0.6 }
      ];

      biasDetector.detectTeachingBias(careers);
      
      const stats = biasDetector.getDetectionStats();
      expect(stats.totalAnalyses).toBe(1);
      expect(stats.biasDetected).toBe(1);
      expect(stats.teachingBiasCount).toBe(1);
    });
  });

  describe('Category Distribution Analysis', () => {
    test('should analyze category distribution correctly', () => {
      const careers = [
        { title: 'Teacher', category: 'Education', similarity: 0.8 },
        { title: 'Engineer', category: 'Technology', similarity: 0.7 },
        { title: 'Doctor', category: 'Healthcare', similarity: 0.75 },
        { title: 'Analyst', category: 'Technology', similarity: 0.6 }
      ];

      const result = biasDetector.analyzeCategoryDistribution(careers);
      
      expect(result.categories).toContain('Education');
      expect(result.categories).toContain('Technology');
      expect(result.categories).toContain('Healthcare');
      expect(result.dominantCategory).toBe('Technology');
      expect(result.dominancePercentage).toBe(50);
      expect(result.uniqueCategories).toBe(3);
    });

    test('should detect category dominance', () => {
      const careers = [
        { title: 'Engineer 1', category: 'Technology', similarity: 0.8 },
        { title: 'Engineer 2', category: 'Technology', similarity: 0.7 },
        { title: 'Engineer 3', category: 'Technology', similarity: 0.75 },
        { title: 'Teacher', category: 'Education', similarity: 0.6 }
      ];

      const result = biasDetector.analyzeCategoryDistribution(careers);
      
      expect(result.hasDominance).toBe(true);
      expect(result.dominantCategory).toBe('Technology');
      expect(result.dominancePercentage).toBe(75);
    });

    test('should calculate diversity score', () => {
      const careers = [
        { title: 'Career 1', category: 'Cat1', similarity: 0.8 },
        { title: 'Career 2', category: 'Cat2', similarity: 0.7 },
        { title: 'Career 3', category: 'Cat3', similarity: 0.75 },
        { title: 'Career 4', category: 'Cat4', similarity: 0.6 }
      ];

      const result = biasDetector.analyzeCategoryDistribution(careers);
      
      expect(result.diversity).toBeGreaterThan(0);
      expect(result.uniqueCategories).toBe(4);
      expect(result.hasDominance).toBe(false);
    });

    test('should handle empty careers array', () => {
      const result = biasDetector.analyzeCategoryDistribution([]);
      
      expect(result.categories).toEqual([]);
      expect(result.dominantCategory).toBeNull();
      expect(result.diversity).toBe(0);
      expect(result.hasDominance).toBe(false);
    });

    test('should handle careers without categories', () => {
      const careers = [
        { title: 'Career 1', similarity: 0.8 },
        { title: 'Career 2', similarity: 0.7 }
      ];

      const result = biasDetector.analyzeCategoryDistribution(careers);
      
      expect(result.categories).toContain('Uncategorized');
      expect(result.dominantCategory).toBe('Uncategorized');
      expect(result.dominancePercentage).toBe(100);
    });
  });

  describe('STEM Student Detection', () => {
    test('should identify STEM students correctly', () => {
      const stemProfile = {
        subjects: ['Mathematics', 'Physical Sciences', 'Information Technology']
      };
      
      expect(biasDetector.isSTEMStudent(stemProfile)).toBe(true);
    });

    test('should identify non-STEM students correctly', () => {
      const nonSTEMProfile = {
        subjects: ['English', 'History', 'Geography']
      };
      
      expect(biasDetector.isSTEMStudent(nonSTEMProfile)).toBe(false);
    });

    test('should handle missing subjects gracefully', () => {
      const emptyProfile = {};
      expect(biasDetector.isSTEMStudent(emptyProfile)).toBe(false);
      
      const nullSubjects = { subjects: null };
      expect(biasDetector.isSTEMStudent(nullSubjects)).toBe(false);
    });

    test('should detect STEM subjects with various naming', () => {
      const profiles = [
        { subjects: ['Math', 'Physics'] },
        { subjects: ['mathematics', 'chemistry'] },
        { subjects: ['Mathematical Literacy', 'Life Sciences'] },
        { subjects: ['Computer Science', 'Engineering'] }
      ];
      
      profiles.forEach(profile => {
        expect(biasDetector.isSTEMStudent(profile)).toBe(true);
      });
    });
  });

  describe('Bias Pattern Identification', () => {
    test('should identify STEM teaching bias pattern', () => {
      const careers = [
        { title: 'Mathematics Teacher', category: 'Education', similarity: 0.8 },
        { title: 'Science Teacher', category: 'Education', similarity: 0.7 },
        { title: 'Physics Teacher', category: 'Education', similarity: 0.75 }
      ];
      
      const stemProfile = {
        subjects: ['Mathematics', 'Physical Sciences'],
        grade: 11
      };

      const result = biasDetector.identifyBiasPatterns(careers, stemProfile);
      
      expect(result.patterns.length).toBeGreaterThan(0);
      expect(result.patterns.some(p => p.type === 'stem_teaching_bias')).toBe(true);
      expect(result.corrections.length).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
    });

    test('should identify category dominance pattern', () => {
      const careers = [
        { title: 'Engineer 1', category: 'Technology', similarity: 0.8 },
        { title: 'Engineer 2', category: 'Technology', similarity: 0.7 },
        { title: 'Engineer 3', category: 'Technology', similarity: 0.75 },
        { title: 'Teacher', category: 'Education', similarity: 0.6 }
      ];
      
      const profile = { subjects: ['Mathematics'], grade: 11 };

      const result = biasDetector.identifyBiasPatterns(careers, profile);
      
      expect(result.patterns.some(p => p.type === 'category_dominance')).toBe(true);
      expect(result.corrections.some(c => c.type === 'enforce_category_diversity')).toBe(true);
    });

    test('should handle empty patterns gracefully', () => {
      const careers = [
        { title: 'Engineer', category: 'Technology', similarity: 0.8 },
        { title: 'Doctor', category: 'Healthcare', similarity: 0.7 },
        { title: 'Teacher', category: 'Education', similarity: 0.75 }
      ];
      
      const profile = { subjects: ['English'], grade: 11 };

      const result = biasDetector.identifyBiasPatterns(careers, profile);
      
      expect(result.patterns).toHaveLength(0);
      expect(result.corrections).toHaveLength(0);
      expect(result.confidence).toBe(0);
    });
  });

  describe('Cultural Stereotype Detection', () => {
    test('should detect math-teaching stereotype', () => {
      const careers = [
        { title: 'Mathematics Teacher', category: 'Education', similarity: 0.8 },
        { title: 'Math Instructor', category: 'Education', similarity: 0.7 },
        { title: 'Engineer', category: 'Technology', similarity: 0.6 }
      ];
      
      const mathProfile = {
        subjects: ['Mathematics', 'Physical Sciences'],
        grade: 11
      };

      const result = biasDetector.detectCulturalStereotypes(careers, mathProfile);
      
      expect(result.detected).toBe(true);
      expect(result.stereotypes).toContain('math_teaching_association');
      expect(result.evidence.mathTeachingPercentage).toBeGreaterThan(40);
    });

    test('should detect science-healthcare stereotype', () => {
      const careers = [
        { title: 'Doctor', category: 'Healthcare', similarity: 0.8 },
        { title: 'Nurse', category: 'Medical', similarity: 0.7 },
        { title: 'Medical Technician', category: 'Health', similarity: 0.75 },
        { title: 'Teacher', category: 'Education', similarity: 0.6 }
      ];
      
      const scienceProfile = {
        subjects: ['Life Sciences', 'Chemistry'],
        grade: 11
      };

      const result = biasDetector.detectCulturalStereotypes(careers, scienceProfile);
      
      expect(result.detected).toBe(true);
      expect(result.stereotypes).toContain('science_healthcare_association');
      expect(result.corrections).toHaveLength(0); // No corrections for healthcare bias in this test
    });

    test('should not detect stereotypes when patterns are balanced', () => {
      const careers = [
        { title: 'Engineer', category: 'Technology', similarity: 0.8 },
        { title: 'Analyst', category: 'Finance', similarity: 0.7 },
        { title: 'Manager', category: 'Business', similarity: 0.75 }
      ];
      
      const mathProfile = {
        subjects: ['Mathematics', 'Physical Sciences'],
        grade: 11
      };

      const result = biasDetector.detectCulturalStereotypes(careers, mathProfile);
      
      expect(result.detected).toBe(false);
      expect(result.stereotypes).toHaveLength(0);
    });
  });

  describe('Career Interest Weighting Bias Detection', () => {
    test('should detect over-weighting for Grade 11 students', () => {
      const careers = [
        { title: 'Software Engineer', description: 'Develop software applications', similarity: 0.8 },
        { title: 'Software Developer', description: 'Create software solutions', similarity: 0.7 },
        { title: 'Software Architect', description: 'Design software systems', similarity: 0.75 },
        { title: 'Teacher', description: 'Educate students', similarity: 0.6 }
      ];
      
      const profile = {
        grade: 11,
        careerInterests: {
          hasCareerInterests: true,
          rawText: 'I want to be a software engineer and work in software development'
        }
      };

      const result = biasDetector.detectCareerInterestWeightingBias(careers, profile);
      
      expect(result.detected).toBe(true);
      expect(result.patterns).toContain('career_interest_over_weighting');
      expect(result.evidence.grade).toBe(11);
      expect(result.evidence.expectedPrimaryWeight).toBe(40);
    });

    test('should detect under-weighting for Grade 12 students', () => {
      const careers = [
        { title: 'Teacher', description: 'Educate students', similarity: 0.8 },
        { title: 'Manager', description: 'Manage business operations', similarity: 0.7 },
        { title: 'Analyst', description: 'Analyze business data', similarity: 0.75 },
        { title: 'Software Engineer', description: 'Develop software', similarity: 0.6 }
      ];
      
      const profile = {
        grade: 12,
        careerInterests: {
          hasCareerInterests: true,
          rawText: 'I want to be a software engineer and work in technology'
        }
      };

      const result = biasDetector.detectCareerInterestWeightingBias(careers, profile);
      
      expect(result.detected).toBe(true);
      expect(result.patterns).toContain('excessive_alternatives_for_decision_phase');
      expect(result.evidence.expectedPrimaryWeight).toBe(60);
    });

    test('should not detect bias when no career interests stated', () => {
      const careers = [
        { title: 'Engineer', similarity: 0.8 },
        { title: 'Teacher', similarity: 0.7 }
      ];
      
      const profile = {
        grade: 11,
        careerInterests: {
          hasCareerInterests: false
        }
      };

      const result = biasDetector.detectCareerInterestWeightingBias(careers, profile);
      
      expect(result.detected).toBe(false);
    });
  });

  describe('Statistics and Tracking', () => {
    test('should track detection statistics correctly', () => {
      const careers = [
        { title: 'Teacher 1', category: 'Education', similarity: 0.8 },
        { title: 'Teacher 2', category: 'Education', similarity: 0.7 },
        { title: 'Teacher 3', category: 'Education', similarity: 0.75 },
        { title: 'Engineer', category: 'Technology', similarity: 0.6 }
      ];

      const noBiasCareers = [
        { title: 'Engineer 1', category: 'Technology', similarity: 0.8 },
        { title: 'Engineer 2', category: 'Technology', similarity: 0.7 },
        { title: 'Teacher', category: 'Education', similarity: 0.6 }
      ];

      // Run multiple detections
      biasDetector.detectTeachingBias(careers);
      biasDetector.detectTeachingBias(careers);
      biasDetector.detectTeachingBias(noBiasCareers);

      const stats = biasDetector.getDetectionStats();
      expect(stats.totalAnalyses).toBe(3);
      expect(stats.biasDetected).toBe(2);
      expect(stats.teachingBiasCount).toBe(2);
      expect(stats.biasDetectionRate).toBe(67);
    });

    test('should reset statistics correctly', () => {
      const careers = [
        { title: 'Teacher', category: 'Education', similarity: 0.8 },
        { title: 'Teacher', category: 'Education', similarity: 0.7 },
        { title: 'Teacher', category: 'Education', similarity: 0.75 }
      ];

      biasDetector.detectTeachingBias(careers);
      expect(biasDetector.getDetectionStats().totalAnalyses).toBe(1);

      biasDetector.resetStats();
      const stats = biasDetector.getDetectionStats();
      expect(stats.totalAnalyses).toBe(0);
      expect(stats.biasDetected).toBe(0);
    });

    test('should track bias patterns when enabled', () => {
      const detector = new BiasDetector({ enablePatternTracking: true, enableLogging: false });
      
      const careers = [
        { title: 'Teacher 1', category: 'Education', similarity: 0.8 },
        { title: 'Teacher 2', category: 'Education', similarity: 0.7 },
        { title: 'Teacher 3', category: 'Education', similarity: 0.75 }
      ];
      
      const profile = { subjects: ['Mathematics'], grade: 11 };

      detector.identifyBiasPatterns(careers, profile);
      
      const patterns = detector.getRecentPatterns(5);
      expect(patterns.length).toBeGreaterThan(0);
    });
  });

  describe('Configuration Updates', () => {
    test('should update configuration correctly', () => {
      biasDetector.updateConfig({
        teachingBiasThreshold: 0.8,
        enableLogging: true
      });

      expect(biasDetector.config.teachingBiasThreshold).toBe(0.8);
      expect(biasDetector.config.enableLogging).toBe(true);
      expect(biasDetector.config.categoryDominanceThreshold).toBe(0.6); // Should remain unchanged
    });

    test('should use updated thresholds in detection', () => {
      biasDetector.updateConfig({ teachingBiasThreshold: 0.8 });

      const careers = [
        { title: 'Teacher 1', category: 'Education', similarity: 0.8 },
        { title: 'Teacher 2', category: 'Education', similarity: 0.7 },
        { title: 'Engineer', category: 'Technology', similarity: 0.6 }
      ];

      const result = biasDetector.detectTeachingBias(careers);
      
      // 67% teaching careers should not trigger bias with 80% threshold
      expect(result.hasBias).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle null/undefined careers gracefully', () => {
      expect(() => biasDetector.detectTeachingBias(null)).not.toThrow();
      expect(() => biasDetector.detectTeachingBias(undefined)).not.toThrow();
      
      const result = biasDetector.detectTeachingBias(null);
      expect(result.hasBias).toBe(false);
      expect(result.details.reason).toBe('insufficient_data');
    });

    test('should handle malformed career objects', () => {
      const careers = [
        null,
        { title: null, category: undefined },
        { title: 'Valid Career', category: 'Technology', similarity: 0.8 }
      ];

      expect(() => biasDetector.detectTeachingBias(careers)).not.toThrow();
      expect(() => biasDetector.analyzeCategoryDistribution(careers)).not.toThrow();
    });

    test('should handle malformed profile objects', () => {
      const careers = [
        { title: 'Engineer', category: 'Technology', similarity: 0.8 }
      ];

      expect(() => biasDetector.identifyBiasPatterns(careers, null)).not.toThrow();
      expect(() => biasDetector.identifyBiasPatterns(careers, {})).not.toThrow();
      expect(() => biasDetector.identifyBiasPatterns(careers, { subjects: null })).not.toThrow();
    });
  });

  describe('Comprehensive Bias Analysis', () => {
    test('should perform comprehensive analysis without errors', () => {
      const careers = [
        { title: 'Software Engineer', category: 'Technology', similarity: 0.8 },
        { title: 'Data Scientist', category: 'Technology', similarity: 0.7 },
        { title: 'Teacher', category: 'Education', similarity: 0.75 }
      ];
      
      const profile = {
        subjects: ['Mathematics', 'Physical Sciences'],
        grade: 11
      };

      expect(() => {
        const result = biasDetector.performComprehensiveBiasAnalysis(careers, profile);
        expect(result).toHaveProperty('timestamp');
        expect(result).toHaveProperty('biasPatterns');
        expect(result).toHaveProperty('confidence');
        expect(result).toHaveProperty('riskLevel');
      }).not.toThrow();
    });

    test('should handle empty inputs in comprehensive analysis', () => {
      expect(() => {
        const result = biasDetector.performComprehensiveBiasAnalysis([], {});
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.riskLevel).toBeDefined();
      }).not.toThrow();
    });
  });
});