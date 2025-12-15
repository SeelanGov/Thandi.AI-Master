// lib/rag/__tests__/stem-booster.unit.test.js
// Unit tests for STEMBooster class

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { STEMBooster } from '../stem-booster.js';

describe('STEMBooster', () => {
  let stemBooster;

  beforeEach(() => {
    stemBooster = new STEMBooster({
      enableLogging: false, // Disable logging for tests
      baseSTEMBoost: 0.15,
      maxSTEMBoost: 0.25,
      minSTEMBoost: 0.05
    });
  });

  afterEach(() => {
    stemBooster.resetStatistics();
  });

  describe('Constructor and Configuration', () => {
    test('should initialize with default configuration', () => {
      const booster = new STEMBooster();
      expect(booster.config.baseSTEMBoost).toBe(0.15);
      expect(booster.config.stemSubjectThreshold).toBe(2);
      expect(booster.config.enableLogging).toBe(true); // Default is true (options.enableLogging !== false)
    });

    test('should accept custom configuration', () => {
      const booster = new STEMBooster({
        baseSTEMBoost: 0.2,
        stemSubjectThreshold: 3,
        enableLogging: true
      });
      
      expect(booster.config.baseSTEMBoost).toBe(0.2);
      expect(booster.config.stemSubjectThreshold).toBe(3);
      expect(booster.config.enableLogging).toBe(true);
    });

    test('should initialize statistics', () => {
      const stats = stemBooster.getStatistics();
      expect(stats.totalAnalyses).toBe(0);
      expect(stats.stemStudentsIdentified).toBe(0);
      expect(stats.careersBoostApplied).toBe(0);
    });
  });
  describe('STEM Student Identification', () => {
    test('should identify STEM students correctly', () => {
      const stemProfile = {
        subjects: ['Mathematics', 'Physical Sciences', 'Information Technology'],
        grade: 11,
        interests: ['technology', 'engineering']
      };
      
      const result = stemBooster.identifySTEMStudent(stemProfile);
      
      expect(result.isSTEMStudent).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.details.stemSubjects).toContain('Mathematics');
      expect(result.details.stemSubjects).toContain('Physical Sciences');
    });

    test('should identify non-STEM students correctly', () => {
      const nonSTEMProfile = {
        subjects: ['English', 'History', 'Geography'],
        grade: 11,
        interests: ['writing', 'politics']
      };
      
      const result = stemBooster.identifySTEMStudent(nonSTEMProfile);
      
      expect(result.isSTEMStudent).toBe(false);
      expect(result.confidence).toBeLessThan(0.6);
      expect(result.details.stemSubjects).toHaveLength(0);
    });

    test('should handle missing profile gracefully', () => {
      const result = stemBooster.identifySTEMStudent(null);
      
      expect(result.isSTEMStudent).toBe(false);
      expect(result.confidence).toBe(0);
      expect(result.reason).toBe('invalid_profile');
    });

    test('should calculate subject scores correctly', () => {
      const profile = {
        subjects: ['Mathematics', 'Physical Sciences', 'English', 'History']
      };
      
      const subjectScore = stemBooster.calculateSubjectScore(profile);
      
      expect(subjectScore).toBeGreaterThan(0);
      expect(subjectScore).toBeLessThanOrEqual(1);
      // 2 STEM subjects out of 4 total = 0.5 base + bonuses
      expect(subjectScore).toBeGreaterThan(0.5);
    });

    test('should calculate performance scores with marks', () => {
      const profile = {
        subjects: ['Mathematics', 'Physical Sciences'],
        marks: {
          'Mathematics': 85,
          'Physical Sciences': 78
        }
      };
      
      const performanceScore = stemBooster.calculatePerformanceScore(profile);
      
      expect(performanceScore).toBeGreaterThan(0.7); // High marks should give high score
      expect(performanceScore).toBeLessThanOrEqual(1);
    });
  });
  describe('STEM Career Recognition', () => {
    test('should identify STEM careers correctly', () => {
      const stemCareer = {
        title: 'Software Developer',
        description: 'Develop software applications using programming languages',
        category: 'Technology'
      };
      
      const relevance = stemBooster.calculateSTEMRelevance(stemCareer);
      
      expect(relevance.isSTEMCareer).toBe(true);
      expect(relevance.relevanceScore).toBeGreaterThan(0.3);
      expect(relevance.category).toBe('technology');
    });

    test('should identify non-STEM careers correctly', () => {
      const nonSTEMCareer = {
        title: 'English Teacher',
        description: 'Teach English language and literature to students',
        category: 'Education'
      };
      
      const relevance = stemBooster.calculateSTEMRelevance(nonSTEMCareer);
      
      expect(relevance.isSTEMCareer).toBe(false);
      expect(relevance.relevanceScore).toBeLessThan(0.3);
    });

    test('should handle malformed career objects', () => {
      const relevance = stemBooster.calculateSTEMRelevance(null);
      
      expect(relevance.isSTEMCareer).toBe(false);
      expect(relevance.relevanceScore).toBe(0);
      expect(relevance.category).toBeNull();
    });

    test('should categorize different STEM fields correctly', () => {
      const careers = [
        { title: 'Mechanical Engineer', category: 'Engineering' },
        { title: 'Data Scientist', category: 'Technology' },
        { title: 'Research Scientist', category: 'Science' },
        { title: 'Mathematician', category: 'Mathematics' }
      ];
      
      const results = careers.map(career => stemBooster.calculateSTEMRelevance(career));
      
      results.forEach(result => {
        expect(result.isSTEMCareer).toBe(true);
        expect(result.category).toBeTruthy();
      });
    });
  });
  describe('STEM Boosting Application', () => {
    test('should apply STEM boosting to relevant careers', () => {
      const stemProfile = {
        subjects: ['Mathematics', 'Physical Sciences'],
        grade: 11,
        interests: ['technology']
      };
      
      const careers = [
        { title: 'Software Engineer', category: 'Technology', similarity: 0.7 },
        { title: 'English Teacher', category: 'Education', similarity: 0.8 },
        { title: 'Data Scientist', category: 'Technology', similarity: 0.6 }
      ];
      
      const boostedCareers = stemBooster.applySTEMBoosting(careers, stemProfile);
      
      // STEM careers should be boosted
      const softwareEngineer = boostedCareers.find(c => c.title === 'Software Engineer');
      const dataScientist = boostedCareers.find(c => c.title === 'Data Scientist');
      const teacher = boostedCareers.find(c => c.title === 'English Teacher');
      
      expect(softwareEngineer.similarity).toBeGreaterThan(0.7);
      expect(dataScientist.similarity).toBeGreaterThan(0.6);
      expect(teacher.similarity).toBe(0.8); // Should remain unchanged
      
      expect(softwareEngineer.stemBoost).toBeDefined();
      expect(dataScientist.stemBoost).toBeDefined();
      expect(teacher.stemBoost).toBeUndefined();
    });

    test('should not apply boosting to non-STEM students', () => {
      const nonSTEMProfile = {
        subjects: ['English', 'History'],
        grade: 11,
        interests: ['writing']
      };
      
      const careers = [
        { title: 'Software Engineer', category: 'Technology', similarity: 0.7 },
        { title: 'English Teacher', category: 'Education', similarity: 0.8 }
      ];
      
      const result = stemBooster.applySTEMBoosting(careers, nonSTEMProfile);
      
      expect(result).toEqual(careers); // Should remain unchanged
    });

    test('should handle empty careers array', () => {
      const stemProfile = {
        subjects: ['Mathematics', 'Physical Sciences'],
        grade: 11
      };
      
      const result = stemBooster.applySTEMBoosting([], stemProfile);
      
      expect(result).toEqual([]);
    });

    test('should re-sort careers after boosting', () => {
      const stemProfile = {
        subjects: ['Mathematics', 'Physical Sciences'],
        grade: 11,
        interests: ['technology']
      };
      
      const careers = [
        { title: 'English Teacher', category: 'Education', similarity: 0.9 },
        { title: 'Software Engineer', category: 'Technology', similarity: 0.6 }
      ];
      
      const boostedCareers = stemBooster.applySTEMBoosting(careers, stemProfile);
      
      // After boosting, Software Engineer might rank higher
      expect(boostedCareers[0].similarity).toBeGreaterThanOrEqual(boostedCareers[1].similarity);
    });
  });
  describe('Subject Analysis', () => {
    test('should identify STEM subjects correctly', () => {
      const subjects = [
        'Mathematics',
        'Physical Sciences',
        'Information Technology',
        'English',
        'History'
      ];
      
      const stemSubjects = stemBooster.identifySTEMSubjects(subjects);
      
      expect(stemSubjects).toContain('Mathematics');
      expect(stemSubjects).toContain('Physical Sciences');
      expect(stemSubjects).toContain('Information Technology');
      expect(stemSubjects).not.toContain('English');
      expect(stemSubjects).not.toContain('History');
    });

    test('should handle various subject naming conventions', () => {
      const subjects = [
        'Math',
        'Physics',
        'Computer Science',
        'IT',
        'Mathematical Literacy'
      ];
      
      const stemSubjects = stemBooster.identifySTEMSubjects(subjects);
      
      expect(stemSubjects.length).toBeGreaterThan(0);
      subjects.forEach(subject => {
        expect(stemSubjects).toContain(subject);
      });
    });

    test('should check subject types correctly', () => {
      expect(stemBooster.isSubjectType('Mathematics', 'mathematics')).toBe(true);
      expect(stemBooster.isSubjectType('Physical Sciences', 'sciences')).toBe(true);
      expect(stemBooster.isSubjectType('Information Technology', 'technology')).toBe(true);
      expect(stemBooster.isSubjectType('English', 'mathematics')).toBe(false);
    });

    test('should calculate core STEM bonus', () => {
      const stemSubjects = ['Mathematics', 'Physical Sciences', 'Information Technology'];
      const bonus = stemBooster.calculateCoreSTEMBonus(stemSubjects);
      
      expect(bonus).toBeGreaterThan(0);
      expect(bonus).toBeLessThanOrEqual(0.2);
    });
  });
  describe('Interest Analysis', () => {
    test('should identify STEM interests', () => {
      const stemInterests = [
        'technology',
        'engineering',
        'programming',
        'science research'
      ];
      
      stemInterests.forEach(interest => {
        expect(stemBooster.isSTEMInterest(interest)).toBe(true);
      });
    });

    test('should identify non-STEM interests', () => {
      const nonSTEMInterests = [
        'writing',
        'art',
        'music',
        'politics'
      ];
      
      nonSTEMInterests.forEach(interest => {
        expect(stemBooster.isSTEMInterest(interest)).toBe(false);
      });
    });

    test('should count STEM keywords in text', () => {
      const stemText = 'I want to become a software engineer and work in technology';
      const nonSTEMText = 'I enjoy writing stories and creating art';
      
      expect(stemBooster.countSTEMKeywords(stemText)).toBeGreaterThan(0);
      expect(stemBooster.countSTEMKeywords(nonSTEMText)).toBe(0);
    });

    test('should calculate interest scores', () => {
      const stemProfile = {
        interests: ['technology', 'engineering'],
        interestText: 'I want to be a software engineer'
      };
      
      const nonSTEMProfile = {
        interests: ['writing', 'art'],
        interestText: 'I love creative writing'
      };
      
      const stemScore = stemBooster.calculateInterestScore(stemProfile);
      const nonSTEMScore = stemBooster.calculateInterestScore(nonSTEMProfile);
      
      expect(stemScore).toBeGreaterThan(nonSTEMScore);
      expect(stemScore).toBeGreaterThan(0.3);
      expect(nonSTEMScore).toBeLessThan(0.3);
    });
  });
  describe('Boost Calculation', () => {
    test('should calculate boost values within limits', () => {
      const stemRelevance = {
        isSTEMCareer: true,
        relevanceScore: 0.8,
        category: 'technology'
      };
      
      const stemIdentification = {
        isSTEMStudent: true,
        confidence: 0.9,
        details: {
          performanceScore: 0.8
        }
      };
      
      const profile = { grade: 11 };
      
      const boostValue = stemBooster.calculateBoostValue(
        stemRelevance,
        stemIdentification,
        profile,
        stemBooster.config
      );
      
      expect(boostValue).toBeGreaterThanOrEqual(stemBooster.config.minSTEMBoost);
      expect(boostValue).toBeLessThanOrEqual(stemBooster.config.maxSTEMBoost);
    });

    test('should apply grade adjustments', () => {
      const grade10Adjustment = stemBooster.getGradeAdjustment(10);
      const grade11Adjustment = stemBooster.getGradeAdjustment(11);
      const grade12Adjustment = stemBooster.getGradeAdjustment(12);
      
      expect(grade10Adjustment).toBe(0.8);
      expect(grade11Adjustment).toBe(1.0);
      expect(grade12Adjustment).toBe(1.2);
    });

    test('should calculate alignment bonuses', () => {
      const stemRelevance = {
        category: 'mathematics',
        relevanceScore: 0.8
      };
      
      const stemIdentification = {
        details: {
          performanceScore: 0.9
        }
      };
      
      const profile = {
        subjects: ['Mathematics', 'Physical Sciences']
      };
      
      const bonus = stemBooster.calculateAlignmentBonus(
        stemRelevance,
        stemIdentification,
        profile
      );
      
      expect(bonus).toBeGreaterThan(0);
      expect(bonus).toBeLessThanOrEqual(0.1);
    });
  });
  describe('Configuration Management', () => {
    test('should update configuration successfully', () => {
      const success = stemBooster.updateConfiguration({
        baseSTEMBoost: 0.2,
        maxSTEMBoost: 0.3
      });

      expect(success).toBe(true);
      expect(stemBooster.config.baseSTEMBoost).toBe(0.2);
      expect(stemBooster.config.maxSTEMBoost).toBe(0.3);
    });

    test('should reject invalid configuration updates', () => {
      const success = stemBooster.updateConfiguration({
        minSTEMBoost: 0.3,
        maxSTEMBoost: 0.2 // Invalid: min > max
      });

      expect(success).toBe(false);
      expect(stemBooster.config.minSTEMBoost).toBe(0.05); // Should remain unchanged
    });

    test('should validate weight sum constraint', () => {
      const validConfig = {
        stemSubjectWeight: 0.6,
        performanceWeight: 0.3,
        interestWeight: 0.1
      };
      
      const invalidConfig = {
        stemSubjectWeight: 0.6,
        performanceWeight: 0.3,
        interestWeight: 0.2 // Sum = 1.1
      };
      
      expect(stemBooster.isValidConfiguration({ ...stemBooster.config, ...validConfig })).toBe(true);
      expect(stemBooster.isValidConfiguration({ ...stemBooster.config, ...invalidConfig })).toBe(false);
    });

    test('should get current configuration', () => {
      const config = stemBooster.getConfiguration();
      
      expect(config).toHaveProperty('baseSTEMBoost');
      expect(config).toHaveProperty('stemSubjectThreshold');
      expect(config.baseSTEMBoost).toBe(0.15);
    });
  });
  describe('Statistics Management', () => {
    test('should track identification statistics', () => {
      const stemProfile = {
        subjects: ['Mathematics', 'Physical Sciences'],
        grade: 11
      };
      
      const nonSTEMProfile = {
        subjects: ['English', 'History'],
        grade: 11
      };
      
      stemBooster.identifySTEMStudent(stemProfile);
      stemBooster.identifySTEMStudent(stemProfile);
      stemBooster.identifySTEMStudent(nonSTEMProfile);
      
      const stats = stemBooster.getStatistics();
      expect(stats.totalAnalyses).toBe(3);
      expect(stats.stemStudentsIdentified).toBe(2);
      expect(stats.stemIdentificationRate).toBe(67);
    });

    test('should track boosting statistics', () => {
      const stemProfile = {
        subjects: ['Mathematics', 'Physical Sciences'],
        grade: 11,
        interests: ['technology']
      };
      
      const careers = [
        { title: 'Software Engineer', category: 'Technology', similarity: 0.7 },
        { title: 'Data Scientist', category: 'Technology', similarity: 0.6 }
      ];
      
      stemBooster.applySTEMBoosting(careers, stemProfile);
      
      const stats = stemBooster.getStatistics();
      expect(stats.careersBoostApplied).toBeGreaterThan(0);
      expect(stats.averageBoostValue).toBeGreaterThan(0);
    });

    test('should track grade distribution', () => {
      const profiles = [
        { subjects: ['Mathematics'], grade: 10 },
        { subjects: ['Mathematics'], grade: 11 },
        { subjects: ['Mathematics'], grade: 11 },
        { subjects: ['Mathematics'], grade: 12 }
      ];
      
      profiles.forEach(profile => stemBooster.identifySTEMStudent(profile));
      
      const stats = stemBooster.getStatistics();
      expect(stats.gradeDistribution[10]).toBe(1);
      expect(stats.gradeDistribution[11]).toBe(2);
      expect(stats.gradeDistribution[12]).toBe(1);
    });

    test('should reset statistics correctly', () => {
      const stemProfile = {
        subjects: ['Mathematics', 'Physical Sciences'],
        grade: 11
      };
      
      stemBooster.identifySTEMStudent(stemProfile);
      expect(stemBooster.getStatistics().totalAnalyses).toBe(1);
      
      stemBooster.resetStatistics();
      const stats = stemBooster.getStatistics();
      expect(stats.totalAnalyses).toBe(0);
      expect(stats.stemStudentsIdentified).toBe(0);
      expect(stats.careersBoostApplied).toBe(0);
    });
  });
  describe('Error Handling and Edge Cases', () => {
    test('should handle malformed profiles gracefully', () => {
      const malformedProfiles = [
        null,
        undefined,
        {},
        { subjects: null },
        { subjects: 'not an array' },
        { grade: 'not a number' }
      ];
      
      malformedProfiles.forEach(profile => {
        expect(() => stemBooster.identifySTEMStudent(profile)).not.toThrow();
        const result = stemBooster.identifySTEMStudent(profile);
        expect(result.isSTEMStudent).toBe(false);
        expect(result.confidence).toBeGreaterThanOrEqual(0);
      });
    });

    test('should handle empty subject arrays', () => {
      const profile = {
        subjects: [],
        grade: 11
      };
      
      const result = stemBooster.identifySTEMStudent(profile);
      
      expect(result.isSTEMStudent).toBe(false);
      expect(result.details.stemSubjects).toHaveLength(0);
    });

    test('should handle careers without similarity scores', () => {
      const stemProfile = {
        subjects: ['Mathematics', 'Physical Sciences'],
        grade: 11,
        interests: ['technology']
      };
      
      const careers = [
        { title: 'Software Engineer', category: 'Technology' }, // No similarity
        { title: 'Data Scientist', category: 'Technology', similarity: null }
      ];
      
      expect(() => stemBooster.applySTEMBoosting(careers, stemProfile)).not.toThrow();
      const result = stemBooster.applySTEMBoosting(careers, stemProfile);
      expect(Array.isArray(result)).toBe(true);
    });

    test('should handle very high similarity scores', () => {
      const stemProfile = {
        subjects: ['Mathematics', 'Physical Sciences'],
        grade: 11,
        interests: ['technology']
      };
      
      const careers = [
        { title: 'Software Engineer', category: 'Technology', similarity: 0.95 }
      ];
      
      const result = stemBooster.applySTEMBoosting(careers, stemProfile);
      
      // Should not exceed 1.0 even with boosting
      expect(result[0].similarity).toBeLessThanOrEqual(1.0);
    });

    test('should handle missing grade information', () => {
      const profile = {
        subjects: ['Mathematics', 'Physical Sciences']
        // No grade specified
      };
      
      const result = stemBooster.identifySTEMStudent(profile);
      
      expect(result.isSTEMStudent).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Integration Tests', () => {
    test('should perform complete STEM analysis workflow', () => {
      // Reset statistics before integration test
      stemBooster.resetStatistics();
      const stemProfile = {
        subjects: ['Mathematics', 'Physical Sciences', 'Information Technology'],
        grade: 11,
        interests: ['technology', 'engineering'],
        marks: {
          'Mathematics': 85,
          'Physical Sciences': 78,
          'Information Technology': 92
        }
      };
      
      const careers = [
        { title: 'Software Engineer', category: 'Technology', similarity: 0.7 },
        { title: 'English Teacher', category: 'Education', similarity: 0.8 },
        { title: 'Data Scientist', category: 'Technology', similarity: 0.6 },
        { title: 'Mechanical Engineer', category: 'Engineering', similarity: 0.65 }
      ];
      
      // Step 1: Apply STEM boosting (which includes identification)
      const boostedCareers = stemBooster.applySTEMBoosting(careers, stemProfile);
      
      // Step 2: Verify results
      expect(boostedCareers.length).toBe(careers.length);
      
      const stemCareers = boostedCareers.filter(c => c.stemBoost);
      expect(stemCareers.length).toBeGreaterThan(0);
      
      // STEM careers should be boosted and potentially re-ranked
      const topCareer = boostedCareers[0];
      expect(topCareer.stemBoost || topCareer.title === 'English Teacher').toBeTruthy();
      
      // Statistics should be updated
      const stats = stemBooster.getStatistics();
      expect(stats.totalAnalyses).toBe(1); // Only one analysis from applySTEMBoosting
      expect(stats.stemStudentsIdentified).toBe(1);
      expect(stats.careersBoostApplied).toBeGreaterThan(0);
    });
  });
});