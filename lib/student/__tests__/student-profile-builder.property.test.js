/**
 * Property-Based Tests for StudentProfileBuilder
 * 
 * These tests validate the correctness properties defined in the spec:
 * - Property 1: Complete Data Utilization
 * - Property 4: Graceful Degradation
 * 
 * Requirements validated: 1.1, 1.2, 1.3, 1.5
 */

import fc from 'fast-check';
import { StudentProfileBuilder } from '../StudentProfileBuilder.js';

describe('StudentProfileBuilder Property Tests', () => {
  let profileBuilder;

  beforeEach(() => {
    profileBuilder = new StudentProfileBuilder();
  });

  /**
   * Property 1: Complete Data Utilization
   * For any student profile with non-empty questionnaire fields, 
   * the generated profile should include all provided motivation, 
   * concerns, and career interest data with appropriate emphasis.
   */
  describe('Property 1: Complete Data Utilization', () => {
    test('all questionnaire data included in profile', () => {
      fc.assert(fc.property(
        fc.record({
          motivation: fc.string({ minLength: 1, maxLength: 500 }),
          concerns: fc.string({ minLength: 1, maxLength: 500 }),
          careerInterests: fc.string({ minLength: 1, maxLength: 200 })
        }),
        (questionnaire) => {
          // Arrange
          const formData = {
            grade: 11,
            enjoyedSubjects: ['Mathematics', 'Science'],
            openQuestions: questionnaire,
            curriculumProfile: { framework: 'CAPS' }
          };

          // Act
          const profile = profileBuilder.buildProfile(formData);

          // Assert - All non-empty questionnaire data should be preserved
          if (questionnaire.motivation.trim()) {
            expect(profile.motivations.rawText).toBe(questionnaire.motivation.trim());
            expect(profile.motivations.hasContent).toBe(true);
            expect(profile.motivations.characterCount).toBeGreaterThan(0);
          }

          if (questionnaire.concerns.trim()) {
            expect(profile.concerns.rawText).toBe(questionnaire.concerns.trim());
            expect(profile.concerns.hasContent).toBe(true);
            expect(profile.concerns.characterCount).toBeGreaterThan(0);
          }

          if (questionnaire.careerInterests.trim()) {
            expect(profile.careerInterests.rawText).toBe(questionnaire.careerInterests.trim());
            expect(profile.careerInterests.hasContent).toBe(true);
            expect(profile.careerInterests.characterCount).toBeGreaterThan(0);
          }
        }
      ), { numRuns: 100 });
    });

    test('extracted themes reflect questionnaire content', () => {
      fc.assert(fc.property(
        fc.record({
          motivation: fc.constantFrom(
            'I love solving complex problems and building things',
            'I want to help people in my community',
            'I am passionate about technology and innovation',
            'I enjoy creative work and artistic expression'
          ),
          concerns: fc.constantFrom(
            'I am worried about affording university costs',
            'I am concerned about finding good job opportunities',
            'I worry about my academic performance',
            'I am anxious about family expectations'
          )
        }),
        (questionnaire) => {
          // Arrange
          const formData = {
            grade: 11,
            openQuestions: questionnaire
          };

          // Act
          const profile = profileBuilder.buildProfile(formData);

          // Assert - Themes should be extracted from content
          if (questionnaire.motivation.includes('problem')) {
            expect(profile.motivations.extractedThemes).toContain('problem-solving');
          }
          if (questionnaire.motivation.includes('help')) {
            expect(profile.motivations.extractedThemes).toContain('helping-others');
          }
          if (questionnaire.motivation.includes('creative')) {
            expect(profile.motivations.extractedThemes).toContain('creativity');
          }

          if (questionnaire.concerns.includes('afford')) {
            expect(profile.concerns.concernCategories).toContain('financial');
          }
          if (questionnaire.concerns.includes('job')) {
            expect(profile.concerns.concernCategories).toContain('career-uncertainty');
          }
          if (questionnaire.concerns.includes('academic')) {
            expect(profile.concerns.concernCategories).toContain('academic-performance');
          }
        }
      ), { numRuns: 50 });
    });
  });

  /**
   * Property 4: Graceful Degradation
   * For any student profile with missing questionnaire fields, 
   * the system should continue to function with available data 
   * without errors or reduced quality for present fields.
   */
  describe('Property 4: Graceful Degradation', () => {
    test('handles missing questionnaire data gracefully', () => {
      fc.assert(fc.property(
        fc.record({
          motivation: fc.option(fc.string()),
          concerns: fc.option(fc.string()),
          careerInterests: fc.option(fc.string()),
          grade: fc.option(fc.integer({ min: 10, max: 12 })),
          enjoyedSubjects: fc.option(fc.array(fc.string()))
        }),
        (partialData) => {
          // Arrange - Create form data with potentially missing fields
          const formData = {
            grade: partialData.grade,
            enjoyedSubjects: partialData.enjoyedSubjects,
            openQuestions: {
              motivation: partialData.motivation,
              concerns: partialData.concerns,
              careerInterests: partialData.careerInterests
            }
          };

          // Act & Assert - Should not throw errors
          expect(() => {
            const profile = profileBuilder.buildProfile(formData);
            
            // Profile should always be returned
            expect(profile).toBeDefined();
            expect(profile.metadata).toBeDefined();
            expect(profile.demographics).toBeDefined();
            expect(profile.academic).toBeDefined();
            expect(profile.motivations).toBeDefined();
            expect(profile.concerns).toBeDefined();
            expect(profile.careerInterests).toBeDefined();
            expect(profile.constraints).toBeDefined();

            // Completeness should be calculated
            expect(typeof profile.metadata.profileCompleteness).toBe('number');
            expect(profile.metadata.profileCompleteness).toBeGreaterThanOrEqual(0);
            expect(profile.metadata.profileCompleteness).toBeLessThanOrEqual(100);

            return profile;
          }).not.toThrow();
        }
      ), { numRuns: 100 });
    });

    test('empty questionnaire fields handled correctly', () => {
      fc.assert(fc.property(
        fc.record({
          emptyMotivation: fc.constantFrom('', '   ', null, undefined),
          emptyConcerns: fc.constantFrom('', '   ', null, undefined),
          emptyCareerInterests: fc.constantFrom('', '   ', null, undefined)
        }),
        (emptyData) => {
          // Arrange
          const formData = {
            grade: 11,
            enjoyedSubjects: ['Mathematics'],
            openQuestions: {
              motivation: emptyData.emptyMotivation,
              concerns: emptyData.emptyConcerns,
              careerInterests: emptyData.emptyCareerInterests
            }
          };

          // Act
          const profile = profileBuilder.buildProfile(formData);

          // Assert - Empty fields should be handled gracefully
          expect(profile.motivations.hasContent).toBe(false);
          expect(profile.motivations.rawText).toBe('');
          expect(profile.motivations.extractedThemes).toEqual([]);

          expect(profile.concerns.hasContent).toBe(false);
          expect(profile.concerns.rawText).toBe('');
          expect(profile.concerns.concernCategories).toEqual([]);

          expect(profile.careerInterests.hasContent).toBe(false);
          expect(profile.careerInterests.rawText).toBe('');
          expect(profile.careerInterests.specificCareers).toEqual([]);

          // Profile should still be valid
          expect(profile.metadata.dataQuality).not.toBe('poor');
        }
      ), { numRuns: 50 });
    });

    test('malformed input data handled gracefully', () => {
      fc.assert(fc.property(
        fc.record({
          invalidGrade: fc.oneof(
            fc.constant('invalid'),
            fc.constant(-1),
            fc.constant(15),
            fc.constant(null)
          ),
          invalidSubjects: fc.oneof(
            fc.constant('not an array'),
            fc.constant(123),
            fc.constant(null)
          )
        }),
        (invalidData) => {
          // Arrange
          const formData = {
            grade: invalidData.invalidGrade,
            enjoyedSubjects: invalidData.invalidSubjects,
            openQuestions: {
              motivation: 'I love learning',
              concerns: 'I worry about the future',
              careerInterests: 'I want to be a doctor'
            }
          };

          // Act & Assert - Should handle gracefully
          expect(() => {
            const profile = profileBuilder.buildProfile(formData);
            
            // Should return valid profile structure
            expect(profile).toBeDefined();
            expect(profile.demographics.grade).toBeGreaterThanOrEqual(10);
            expect(profile.demographics.grade).toBeLessThanOrEqual(12);
            expect(Array.isArray(profile.academic.enjoyedSubjects)).toBe(true);

            // Questionnaire data should still be preserved
            expect(profile.motivations.rawText).toBe('I love learning');
            expect(profile.concerns.rawText).toBe('I worry about the future');
            expect(profile.careerInterests.rawText).toBe('I want to be a doctor');

            return profile;
          }).not.toThrow();
        }
      ), { numRuns: 50 });
    });
  });

  /**
   * Additional Property Tests for Data Integrity
   */
  describe('Data Integrity Properties', () => {
    test('profile completeness calculation is consistent', () => {
      fc.assert(fc.property(
        fc.record({
          grade: fc.integer({ min: 10, max: 12 }),
          enjoyedSubjects: fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }),
          motivation: fc.string({ minLength: 10, maxLength: 100 }),
          concerns: fc.string({ minLength: 10, maxLength: 100 }),
          careerInterests: fc.string({ minLength: 5, maxLength: 50 })
        }),
        (completeData) => {
          // Arrange
          const formData = {
            grade: completeData.grade,
            enjoyedSubjects: completeData.enjoyedSubjects,
            openQuestions: {
              motivation: completeData.motivation,
              concerns: completeData.concerns,
              careerInterests: completeData.careerInterests
            },
            constraints: {
              money: 'limited budget',
              location: 'prefer local'
            }
          };

          // Act
          const profile = profileBuilder.buildProfile(formData);

          // Assert - Complete profiles should have high completeness
          expect(profile.metadata.profileCompleteness).toBeGreaterThanOrEqual(80);
          expect(profile.metadata.dataQuality).toMatch(/good|excellent/);
        }
      ), { numRuns: 30 });
    });

    test('text sanitization preserves meaningful content', () => {
      fc.assert(fc.property(
        fc.record({
          motivation: fc.string({ minLength: 1, maxLength: 200 }),
          concerns: fc.string({ minLength: 1, maxLength: 200 })
        }),
        (textData) => {
          // Arrange
          const formData = {
            grade: 11,
            openQuestions: textData
          };

          // Act
          const profile = profileBuilder.buildProfile(formData);

          // Assert - Sanitized text should preserve core content
          if (textData.motivation.trim()) {
            expect(profile.motivations.rawText.length).toBeGreaterThan(0);
            expect(profile.motivations.rawText.length).toBeLessThanOrEqual(textData.motivation.trim().length);
          }

          if (textData.concerns.trim()) {
            expect(profile.concerns.rawText.length).toBeGreaterThan(0);
            expect(profile.concerns.rawText.length).toBeLessThanOrEqual(textData.concerns.trim().length);
          }
        }
      ), { numRuns: 50 });
    });
  });
});