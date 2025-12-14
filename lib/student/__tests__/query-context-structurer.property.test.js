/**
 * Property-Based Tests for QueryContextStructurer
 * 
 * Tests universal properties for optimal LLM query context construction
 * 
 * Property 2: Structured Context Organization
 * Property 3: Personalization Reflection  
 * Property 5: Context Validation Completeness
 */

const fc = require('fast-check');
const StudentProfileBuilder = require('../StudentProfileBuilder');
const QueryContextStructurer = require('../QueryContextStructurer');

describe('QueryContextStructurer - Property-Based Tests', () => {
  let profileBuilder;
  let contextStructurer;

  beforeEach(() => {
    profileBuilder = new StudentProfileBuilder();
    contextStructurer = new QueryContextStructurer();
  });

  /**
   * Property 2: Structured Context Organization
   * For any student profile, the query context should organize information 
   * into logical sections that optimize LLM comprehension
   */
  describe('Property 2: Structured Context Organization', () => {
    test('context follows logical hierarchical structure', () => {
      fc.assert(fc.property(
        fc.record({
          grade: fc.integer(10, 12),
          subjects: fc.array(fc.string(1, 20), 1, 5),
          motivation: fc.string(5, 200),
          concerns: fc.string(5, 200),
          careerInterests: fc.string(5, 100),
          marks: fc.option(fc.dictionary(
            fc.string(1, 20), 
            fc.float(30, 100)
          ))
        }),
        (formData) => {
          const profile = profileBuilder.buildProfile(formData);
          const context = contextStructurer.buildContext(profile);
          
          const contextText = context.formattedContext;
          
          // Verify sections appear in logical order
          const demographicsIndex = contextText.indexOf('STUDENT DEMOGRAPHICS');
          const academicIndex = contextText.indexOf('ACADEMIC PERFORMANCE');
          const careerIndex = contextText.indexOf('CAREER PRIORITIES');
          const motivationIndex = contextText.indexOf('MOTIVATION ALIGNMENT');
          const concernsIndex = contextText.indexOf('CONCERNS AND GUIDANCE');
          
          // Demographics should come first
          expect(demographicsIndex).toBeGreaterThanOrEqual(0);
          expect(demographicsIndex).toBeLessThan(academicIndex);
          
          // Academic should come before career priorities
          expect(academicIndex).toBeLessThan(careerIndex);
          
          // If motivation section exists, it should come after career priorities
          if (motivationIndex >= 0) {
            expect(careerIndex).toBeLessThan(motivationIndex);
          }
          
          // If concerns section exists, it should come after motivation
          if (concernsIndex >= 0 && motivationIndex >= 0) {
            expect(motivationIndex).toBeLessThan(concernsIndex);
          }
          
          // Verify instructions section exists
          expect(contextText).toContain('GUIDANCE INSTRUCTIONS');
          expect(contextText).toContain('RESPONSE STRUCTURE');
          expect(contextText).toContain('VALIDATION CRITERIA');
        }
      ), { numRuns: 100 });
    });

    test('sections contain appropriate content based on profile data', () => {
      fc.assert(fc.property(
        fc.record({
          grade: fc.integer(10, 12),
          subjects: fc.array(fc.string(1, 15), 1, 4),
          motivation: fc.option(fc.string(10, 150)),
          concerns: fc.option(fc.string(10, 150)),
          careerInterests: fc.option(fc.string(5, 80))
        }),
        (formData) => {
          const profile = profileBuilder.buildProfile(formData);
          const context = contextStructurer.buildContext(profile);
          
          const contextText = context.formattedContext;
          
          // Demographics section should contain grade
          expect(contextText).toContain(`Grade: ${formData.grade}`);
          
          // Academic section should contain subjects
          formData.subjects.forEach(subject => {
            if (subject.trim()) {
              expect(contextText).toContain(subject.trim());
            }
          });
          
          // If motivation provided, should be in motivation section
          if (formData.motivation && formData.motivation.trim()) {
            expect(contextText).toContain('MOTIVATION ALIGNMENT');
            expect(contextText).toContain(formData.motivation.trim());
          }
          
          // If concerns provided, should be in concerns section
          if (formData.concerns && formData.concerns.trim()) {
            expect(contextText).toContain('CONCERNS AND GUIDANCE');
            expect(contextText).toContain(formData.concerns.trim());
          }
          
          // If career interests provided, should be in career section
          if (formData.careerInterests && formData.careerInterests.trim()) {
            expect(contextText).toContain('CAREER PRIORITIES');
            expect(contextText).toContain(formData.careerInterests.trim());
          }
        }
      ), { numRuns: 100 });
    });

    test('instructions are tailored to available profile data', () => {
      fc.assert(fc.property(
        fc.record({
          grade: fc.integer(10, 12),
          subjects: fc.array(fc.string(1, 20), 1, 3),
          motivation: fc.option(fc.string(10, 100)),
          concerns: fc.option(fc.string(10, 100)),
          careerInterests: fc.option(fc.string(5, 50)),
          marks: fc.option(fc.dictionary(fc.string(1, 15), fc.float(40, 95)))
        }),
        (formData) => {
          const profile = profileBuilder.buildProfile(formData);
          const context = contextStructurer.buildContext(profile);
          
          const instructionsText = context.formattedContext;
          
          // Should always have base instruction
          expect(instructionsText).toContain('Provide personalized career guidance');
          
          // Motivation-specific instruction if motivation provided
          if (formData.motivation && formData.motivation.trim()) {
            expect(instructionsText).toContain('Reflect the student\'s stated motivations');
          }
          
          // Concerns-specific instruction if concerns provided
          if (formData.concerns && formData.concerns.trim()) {
            expect(instructionsText).toContain('Directly address each concern mentioned');
          }
          
          // Academic performance instruction if marks provided
          if (formData.marks && Object.keys(formData.marks).length > 0) {
            expect(instructionsText).toContain('APS scores and marks');
          }
          
          // Career interest instruction if interests provided
          if (formData.careerInterests && formData.careerInterests.trim()) {
            expect(instructionsText).toContain('Prioritize the student\'s stated career interests');
          }
        }
      ), { numRuns: 100 });
    });
  });

  /**
   * Property 5: Context Validation Completeness
   * For any student assessment submission, the system should validate 
   * that all non-empty questionnaire fields are included in the query context
   */
  describe('Property 5: Context Validation Completeness', () => {
    test('validation catches all data utilization accurately', () => {
      fc.assert(fc.property(
        fc.record({
          grade: fc.integer(10, 12),
          subjects: fc.array(fc.string(1, 20), 1, 4),
          motivation: fc.string(5, 200),
          concerns: fc.string(5, 200),
          careerInterests: fc.string(5, 100)
        }),
        (formData) => {
          const profile = profileBuilder.buildProfile(formData);
          const context = contextStructurer.buildContext(profile);
          const validation = contextStructurer.validateContext(context, profile);
          
          // All provided fields should be validated as included
          expect(validation.dataUtilization.motivation).toBe(true);
          expect(validation.dataUtilization.concerns).toBe(true);
          expect(validation.dataUtilization.careerInterests).toBe(true);
          
          // Quality score should be 100% when all data is utilized
          expect(validation.qualityScore).toBe(100);
          
          // Should be valid with no warnings
          expect(validation.isValid).toBe(true);
          expect(validation.warnings.length).toBe(0);
        }
      ), { numRuns: 100 });
    });

    test('validation detects missing data utilization', () => {
      fc.assert(fc.property(
        fc.record({
          grade: fc.integer(10, 12),
          subjects: fc.array(fc.string(1, 20), 1, 3),
          motivation: fc.option(fc.string(5, 100)),
          concerns: fc.option(fc.string(5, 100)),
          careerInterests: fc.option(fc.string(5, 50))
        }),
        (formData) => {
          const profile = profileBuilder.buildProfile(formData);
          const context = contextStructurer.buildContext(profile);
          const validation = contextStructurer.validateContext(context, profile);
          
          // Count expected fields
          let expectedFields = 0;
          let expectedUtilized = 0;
          
          if (profile.motivations.hasMotivation) {
            expectedFields++;
            if (validation.dataUtilization.motivation) expectedUtilized++;
          }
          
          if (profile.concerns.hasConcerns) {
            expectedFields++;
            if (validation.dataUtilization.concerns) expectedUtilized++;
          }
          
          if (profile.careerInterests.hasCareerInterests) {
            expectedFields++;
            if (validation.dataUtilization.careerInterests) expectedUtilized++;
          }
          
          // Quality score should match actual utilization
          const expectedScore = expectedFields > 0 ? (expectedUtilized / expectedFields) * 100 : 100;
          expect(validation.qualityScore).toBe(expectedScore);
          
          // Validation should be valid only if all fields are utilized
          expect(validation.isValid).toBe(expectedUtilized === expectedFields);
        }
      ), { numRuns: 100 });
    });

    test('metadata accurately reflects context characteristics', () => {
      fc.assert(fc.property(
        fc.record({
          grade: fc.integer(10, 12),
          subjects: fc.array(fc.string(1, 20), 1, 5),
          motivation: fc.option(fc.string(10, 150)),
          concerns: fc.option(fc.string(10, 150)),
          careerInterests: fc.option(fc.string(5, 80)),
          marks: fc.option(fc.dictionary(fc.string(1, 15), fc.float(50, 90)))
        }),
        (formData) => {
          const profile = profileBuilder.buildProfile(formData);
          const context = contextStructurer.buildContext(profile);
          
          // Context length should be positive and reasonable
          expect(context.metadata.contextLength).toBeGreaterThan(0);
          expect(context.metadata.contextLength).toBeLessThan(10000); // Reasonable upper limit
          
          // Expected personalization score should increase with more data
          let expectedMinScore = 40; // Base score
          
          if (profile.careerInterests.hasCareerInterests) expectedMinScore += 20;
          if (profile.motivations.hasMotivation) expectedMinScore += 20;
          if (profile.concerns.hasConcerns) expectedMinScore += 15;
          if (profile.academic.hasMarks) expectedMinScore += 5;
          
          expect(context.metadata.expectedPersonalizationScore).toBeGreaterThanOrEqual(expectedMinScore);
          expect(context.metadata.expectedPersonalizationScore).toBeLessThanOrEqual(100);
          
          // Sections included should match available data
          const expectedSections = ['demographics', 'academicPerformance'];
          if (profile.careerInterests.hasCareerInterests) expectedSections.push('careerPriorities');
          if (profile.motivations.hasMotivation) expectedSections.push('motivationAlignment');
          if (profile.concerns.hasConcerns) expectedSections.push('concernsGuidance');
          if (profile.constraints.hasConstraints) expectedSections.push('constraintsConsideration');
          
          expect(context.metadata.sectionsIncluded).toEqual(
            expect.arrayContaining(expectedSections)
          );
        }
      ), { numRuns: 100 });
    });
  });

  /**
   * Context Quality and Formatting Properties
   */
  describe('Context Quality Properties', () => {
    test('context maintains consistent formatting structure', () => {
      fc.assert(fc.property(
        fc.record({
          grade: fc.integer(10, 12),
          subjects: fc.array(fc.string(1, 20), 1, 4),
          motivation: fc.string(10, 200),
          concerns: fc.string(10, 200),
          careerInterests: fc.string(5, 100)
        }),
        (formData) => {
          const profile = profileBuilder.buildProfile(formData);
          const context = contextStructurer.buildContext(profile);
          
          const contextText = context.formattedContext;
          
          // Should have proper header structure
          expect(contextText).toMatch(/=== STUDENT CAREER GUIDANCE REQUEST ===/);
          expect(contextText).toMatch(/=== GUIDANCE INSTRUCTIONS ===/);
          expect(contextText).toMatch(/=== SUGGESTED RESPONSE STRUCTURE ===/);
          expect(contextText).toMatch(/=== RESPONSE VALIDATION CRITERIA ===/);
          
          // Section headers should be properly formatted
          expect(contextText).toMatch(/STUDENT DEMOGRAPHICS:/);
          expect(contextText).toMatch(/ACADEMIC PERFORMANCE:/);
          
          // Instructions should be numbered
          expect(contextText).toMatch(/1\. Provide personalized career guidance/);
          
          // Should not have excessive whitespace
          expect(contextText).not.toMatch(/\n{4,}/); // No more than 3 consecutive newlines
        }
      ), { numRuns: 100 });
    });

    test('handles edge cases in profile data gracefully', () => {
      fc.assert(fc.property(
        fc.record({
          grade: fc.integer(10, 12),
          subjects: fc.array(fc.string(0, 50), 0, 8), // Include empty strings and long subjects
          motivation: fc.option(fc.string(0, 1000)), // Include very long motivation
          concerns: fc.option(fc.string(0, 1000)),
          careerInterests: fc.option(fc.string(0, 500))
        }),
        (formData) => {
          const profile = profileBuilder.buildProfile(formData);
          
          // Should not throw errors regardless of edge cases
          expect(() => {
            const context = contextStructurer.buildContext(profile);
            
            // Context should always have required structure
            expect(context).toHaveProperty('formattedContext');
            expect(context).toHaveProperty('metadata');
            expect(context).toHaveProperty('sections');
            expect(context).toHaveProperty('instructions');
            
            // Formatted context should be a non-empty string
            expect(typeof context.formattedContext).toBe('string');
            expect(context.formattedContext.length).toBeGreaterThan(0);
            
          }).not.toThrow();
        }
      ), { numRuns: 100 });
    });

    test('prioritizes critical information appropriately', () => {
      fc.assert(fc.property(
        fc.record({
          grade: fc.integer(10, 12),
          subjects: fc.array(fc.string(1, 20), 1, 3),
          motivation: fc.string(20, 100),
          concerns: fc.string(20, 100),
          careerInterests: fc.string(10, 50)
        }),
        (formData) => {
          const profile = profileBuilder.buildProfile(formData);
          const context = contextStructurer.buildContext(profile);
          
          const contextText = context.formattedContext;
          
          // Career interests should be marked as CRITICAL
          expect(contextText).toContain('CRITICAL STUDENT REQUEST');
          
          // Motivation should have IMPORTANT emphasis
          expect(contextText).toContain('IMPORTANT: Please ensure career recommendations align');
          
          // Concerns should have CRITICAL emphasis
          expect(contextText).toContain('CRITICAL: Please directly address these specific concerns');
          
          // Instructions should emphasize personalization
          expect(contextText).toContain('CRITICAL: Reflect the student\'s stated motivations');
          expect(contextText).toContain('CRITICAL: Directly address each concern mentioned');
        }
      ), { numRuns: 100 });
    });
  });

  /**
   * Fallback and Error Handling Properties
   */
  describe('Fallback Handling Properties', () => {
    test('provides meaningful fallback context for minimal data', () => {
      fc.assert(fc.property(
        fc.record({
          grade: fc.option(fc.integer(10, 12)),
          subjects: fc.option(fc.array(fc.string(1, 20), 0, 2))
        }),
        (formData) => {
          // Create minimal profile that might trigger fallback
          const minimalProfile = {
            demographics: { grade: formData.grade || 12 },
            academic: { enjoyedSubjects: formData.subjects || [] },
            motivations: { hasMotivation: false },
            concerns: { hasConcerns: false },
            careerInterests: { hasCareerInterests: false },
            constraints: { hasConstraints: false }
          };
          
          const context = contextStructurer.buildContext(minimalProfile);
          
          // Should still produce valid context
          expect(context.formattedContext).toContain('STUDENT CAREER GUIDANCE REQUEST');
          expect(context.formattedContext).toContain('Grade:');
          expect(context.formattedContext).toContain('Provide personalized career guidance');
          
          // Metadata should reflect limited data
          expect(context.metadata.expectedPersonalizationScore).toBeLessThanOrEqual(60);
        }
      ), { numRuns: 50 });
    });
  });
});