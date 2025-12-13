/**
 * Property-Based Tests for QueryContextStructurer
 * 
 * These tests validate the correctness properties defined in the spec:
 * - Property 2: Structured Context Organization
 * - Property 4: Graceful Degradation (context building)
 * 
 * Requirements validated: 2.1, 2.2, 3.1, 3.2, 3.3, 3.4
 */

import fc from 'fast-check';
import { QueryContextStructurer } from '../QueryContextStructurer.js';
import { StudentProfileBuilder } from '../StudentProfileBuilder.js';

describe('QueryContextStructurer Property Tests', () => {
  let contextStructurer;
  let profileBuilder;

  beforeEach(() => {
    contextStructurer = new QueryContextStructurer();
    profileBuilder = new StudentProfileBuilder();
  });

  /**
   * Property 2: Structured Context Organization
   * For any student profile, the query context should organize information 
   * into logical sections (demographics, academic, motivations, concerns, requests) 
   * that optimize LLM comprehension.
   */
  describe('Property 2: Structured Context Organization', () => {
    test('context follows logical structure and section ordering', () => {
      fc.assert(fc.property(
        fc.record({
          grade: fc.integer({ min: 10, max: 12 }),
          enjoyedSubjects: fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }),
          motivation: fc.string({ minLength: 10, maxLength: 200 }),
          concerns: fc.string({ minLength: 10, maxLength: 200 }),
          careerInterests: fc.string({ minLength: 5, maxLength: 100 })
        }),
        (studentData) => {
          // Arrange
          const formData = {
            grade: studentData.grade,
            enjoyedSubjects: studentData.enjoyedSubjects,
            openQuestions: {
              motivation: studentData.motivation,
              concerns: studentData.concerns,
              careerInterests: studentData.careerInterests
            }
          };

          const profile = profileBuilder.buildProfile(formData);

          // Act
          const context = contextStructurer.buildContext(profile);

          // Assert - Verify logical structure exists
          expect(context.structuredQuery).toBeDefined();
          expect(context.baseContext).toBeDefined();
          expect(context.metadata).toBeDefined();

          // Verify sections appear in logical order in the structured query
          const query = context.structuredQuery;
          
          // Base context (demographics) should appear first
          const gradeIndex = query.indexOf(`Grade ${studentData.grade}`);
          expect(gradeIndex).toBeGreaterThanOrEqual(0);

          // If motivation context exists, it should appear after base context
          if (context.motivationContext) {
            const motivationIndex = query.indexOf('WHAT MOTIVATES ME');
            expect(motivationIndex).toBeGreaterThan(gradeIndex);
          }

          // If concerns context exists, it should appear after motivation
          if (context.concernsContext) {
            const concernsIndex = query.indexOf('MY CONCERNS ABOUT THE FUTURE');
            if (context.motivationContext) {
              const motivationIndex = query.indexOf('WHAT MOTIVATES ME');
              expect(concernsIndex).toBeGreaterThan(motivationIndex);
            } else {
              expect(concernsIndex).toBeGreaterThan(gradeIndex);
            }
          }

          // Career interests should be emphasized if present
          if (studentData.careerInterests.trim()) {
            expect(query).toContain('CRITICAL STUDENT REQUEST');
            expect(query).toContain(studentData.careerInterests);
          }
        }
      ), { numRuns: 50 });
    });

    test('sections are properly formatted for LLM comprehension', () => {
      fc.assert(fc.property(
        fc.record({
          motivation: fc.string({ minLength: 20, maxLength: 100 }),
          concerns: fc.string({ minLength: 20, maxLength: 100 })
        }),
        (questionnaire) => {
          // Arrange
          const formData = {
            grade: 11,
            enjoyedSubjects: ['Mathematics', 'Science'],
            openQuestions: questionnaire
          };

          const profile = profileBuilder.buildProfile(formData);

          // Act
          const context = contextStructurer.buildContext(profile);

          // Assert - Verify proper formatting for LLM
          const query = context.structuredQuery;

          // Should have clear section headers
          if (context.motivationContext) {
            expect(query).toContain('=== WHAT MOTIVATES ME ===');
            expect(query).toContain('INSTRUCTION:');
          }

          if (context.concernsContext) {
            expect(query).toContain('=== MY CONCERNS ABOUT THE FUTURE ===');
            expect(query).toContain('INSTRUCTION:');
          }

          // Should have proper formatting (quotes around student text)
          if (questionnaire.motivation.trim()) {
            expect(query).toContain(`"${questionnaire.motivation.trim()}"`);
          }

          if (questionnaire.concerns.trim()) {
            expect(query).toContain(`"${questionnaire.concerns.trim()}"`);
          }

          // Should have clear instructions for LLM
          expect(query).toMatch(/INSTRUCTION:|Please|Consider/);
        }
      ), { numRuns: 30 });
    });

    test('priority requests are properly structured', () => {
      fc.assert(fc.property(
        fc.record({
          careerInterests: fc.string({ minLength: 5, maxLength: 50 }),
          hasMarks: fc.boolean(),
          hasMotivation: fc.boolean(),
          hasConcerns: fc.boolean()
        }),
        (priorityData) => {
          // Arrange
          const formData = {
            grade: 12,
            enjoyedSubjects: ['Mathematics'],
            openQuestions: {
              careerInterests: priorityData.careerInterests,
              motivation: priorityData.hasMotivation ? 'I love solving problems' : '',
              concerns: priorityData.hasConcerns ? 'I worry about costs' : ''
            }
          };

          if (priorityData.hasMarks) {
            formData.subjectMarks = [{ subject: 'Mathematics', exactMark: 75 }];
          }

          const profile = profileBuilder.buildProfile(formData);

          // Act
          const context = contextStructurer.buildContext(profile);

          // Assert - Verify priority requests structure
          expect(context.priorityRequests).toBeDefined();
          expect(context.metadata.priorityRequestsCount).toBeGreaterThan(0);

          // Career interests should always be prioritized
          expect(context.priorityRequests).toContain('CRITICAL STUDENT REQUEST');
          expect(context.priorityRequests).toContain(priorityData.careerInterests);

          // Marks-based guidance if marks available
          if (priorityData.hasMarks) {
            expect(context.priorityRequests).toContain('ACTUAL marks');
          }

          // Motivation and concerns should be mentioned in priorities
          if (priorityData.hasMotivation) {
            expect(context.priorityRequests).toMatch(/motivation|fulfilling/i);
          }

          if (priorityData.hasConcerns) {
            expect(context.priorityRequests).toMatch(/concerns|address/i);
          }
        }
      ), { numRuns: 40 });
    });
  });

  /**
   * Property 4: Graceful Degradation (Context Building)
   * For any student profile with missing data, the context structurer 
   * should continue to function and produce valid context without errors.
   */
  describe('Property 4: Graceful Degradation - Context Building', () => {
    test('handles incomplete profiles gracefully', () => {
      fc.assert(fc.property(
        fc.record({
          hasGrade: fc.boolean(),
          hasSubjects: fc.boolean(),
          hasMotivation: fc.boolean(),
          hasConcerns: fc.boolean(),
          hasCareerInterests: fc.boolean()
        }),
        (completeness) => {
          // Arrange - Create incomplete profile
          const formData = {
            grade: completeness.hasGrade ? 11 : null,
            enjoyedSubjects: completeness.hasSubjects ? ['Mathematics'] : [],
            openQuestions: {
              motivation: completeness.hasMotivation ? 'I love learning' : '',
              concerns: completeness.hasConcerns ? 'I worry about future' : '',
              careerInterests: completeness.hasCareerInterests ? 'I want to be a doctor' : ''
            }
          };

          const profile = profileBuilder.buildProfile(formData);

          // Act & Assert - Should not throw errors
          expect(() => {
            const context = contextStructurer.buildContext(profile);
            
            // Should always return valid context structure
            expect(context).toBeDefined();
            expect(context.structuredQuery).toBeDefined();
            expect(context.baseContext).toBeDefined();
            expect(context.metadata).toBeDefined();
            
            // Structured query should always have some content
            expect(context.structuredQuery.length).toBeGreaterThan(0);
            
            // Should contain grade information (fallback to default if missing)
            expect(context.structuredQuery).toMatch(/Grade \d+/);
            
            return context;
          }).not.toThrow();
        }
      ), { numRuns: 50 });
    });

    test('empty questionnaire data handled correctly', () => {
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
            enjoyedSubjects: ['Mathematics', 'Science'],
            openQuestions: {
              motivation: emptyData.emptyMotivation,
              concerns: emptyData.emptyConcerns,
              careerInterests: emptyData.emptyCareerInterests
            }
          };

          const profile = profileBuilder.buildProfile(formData);

          // Act
          const context = contextStructurer.buildContext(profile);

          // Assert - Empty sections should be handled gracefully
          expect(context.motivationContext).toBe('');
          expect(context.concernsContext).toBe('');
          
          // Should still have valid base context
          expect(context.baseContext).toContain('Grade 11');
          expect(context.baseContext).toContain('Mathematics, Science');
          
          // Structured query should be valid despite empty questionnaire
          expect(context.structuredQuery.length).toBeGreaterThan(0);
          expect(context.metadata.sectionsIncluded).toBeGreaterThanOrEqual(1);
        }
      ), { numRuns: 30 });
    });

    test('malformed profile data handled gracefully', () => {
      fc.assert(fc.property(
        fc.record({
          corruptedSection: fc.constantFrom('demographics', 'academic', 'motivations', 'concerns')
        }),
        (corruption) => {
          // Arrange - Create profile with corrupted section
          const validProfile = {
            demographics: { grade: 11, timelineContext: 'academic-year-progress' },
            academic: { enjoyedSubjects: ['Math'], marksAvailable: false, currentMarks: [] },
            motivations: { rawText: 'I love learning', hasContent: true, extractedThemes: [] },
            concerns: { rawText: 'I worry about costs', hasContent: true, concernCategories: [] },
            careerInterests: { rawText: 'Doctor', hasContent: true, specificCareers: [] },
            constraints: { hasConstraints: false },
            metadata: { profileCompleteness: 80 }
          };

          // Corrupt one section
          validProfile[corruption.corruptedSection] = null;

          // Act & Assert - Should handle corruption gracefully
          expect(() => {
            const context = contextStructurer.buildContext(validProfile);
            
            // Should return valid context despite corruption
            expect(context).toBeDefined();
            expect(context.structuredQuery).toBeDefined();
            expect(context.structuredQuery.length).toBeGreaterThan(0);
            
            // Should either use fallback or skip corrupted section
            expect(context.metadata.fallback || context.metadata.sectionsIncluded >= 1).toBe(true);
            
            return context;
          }).not.toThrow();
        }
      ), { numRuns: 20 });
    });
  });

  /**
   * Additional Property Tests for Context Quality
   */
  describe('Context Quality Properties', () => {
    test('context completeness correlates with profile completeness', () => {
      fc.assert(fc.property(
        fc.record({
          grade: fc.integer({ min: 10, max: 12 }),
          enjoyedSubjects: fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 3 }),
          motivation: fc.string({ minLength: 20, maxLength: 100 }),
          concerns: fc.string({ minLength: 20, maxLength: 100 }),
          careerInterests: fc.string({ minLength: 10, maxLength: 50 }),
          hasMarks: fc.boolean(),
          hasConstraints: fc.boolean()
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
            }
          };

          if (completeData.hasMarks) {
            formData.subjectMarks = [{ subject: 'Mathematics', exactMark: 80 }];
          }

          if (completeData.hasConstraints) {
            formData.constraints = { money: 'limited', location: 'local' };
          }

          const profile = profileBuilder.buildProfile(formData);

          // Act
          const context = contextStructurer.buildContext(profile);

          // Assert - Complete profiles should have comprehensive contexts
          expect(context.metadata.sectionsIncluded).toBeGreaterThanOrEqual(3);
          expect(context.metadata.priorityRequestsCount).toBeGreaterThanOrEqual(2);
          
          // Should include all questionnaire sections
          expect(context.motivationContext).toContain('WHAT MOTIVATES ME');
          expect(context.concernsContext).toContain('MY CONCERNS ABOUT THE FUTURE');
          
          // Context length should reflect completeness
          expect(context.structuredQuery.length).toBeGreaterThan(200);
        }
      ), { numRuns: 20 });
    });

    test('context validation provides accurate assessment', () => {
      fc.assert(fc.property(
        fc.record({
          hasBaseContext: fc.boolean(),
          hasStructuredQuery: fc.boolean(),
          sectionsCount: fc.integer({ min: 0, max: 6 })
        }),
        (validationData) => {
          // Arrange - Create context with varying completeness
          const context = {
            baseContext: validationData.hasBaseContext ? 'I am a Grade 11 student' : '',
            structuredQuery: validationData.hasStructuredQuery ? 'Complete query text' : '',
            motivationContext: validationData.sectionsCount > 2 ? 'Motivation section' : '',
            concernsContext: validationData.sectionsCount > 3 ? 'Concerns section' : '',
            academicContext: validationData.sectionsCount > 4 ? 'Academic section' : '',
            constraintsContext: validationData.sectionsCount > 5 ? 'Constraints section' : '',
            metadata: {
              sectionsIncluded: validationData.sectionsCount,
              priorityRequestsCount: 1
            }
          };

          // Act
          const validation = contextStructurer.validateContext(context);

          // Assert - Validation should accurately reflect context quality
          expect(validation).toBeDefined();
          expect(typeof validation.isValid).toBe('boolean');
          expect(typeof validation.completeness).toBe('number');
          expect(Array.isArray(validation.errors)).toBe(true);
          expect(Array.isArray(validation.warnings)).toBe(true);

          // Invalid contexts should be flagged
          if (!validationData.hasBaseContext || !validationData.hasStructuredQuery) {
            expect(validation.isValid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);
          }

          // Completeness should match sections included
          const expectedCompleteness = Math.round((validationData.sectionsCount / 6) * 100);
          expect(validation.completeness).toBe(expectedCompleteness);
        }
      ), { numRuns: 30 });
    });
  });
});