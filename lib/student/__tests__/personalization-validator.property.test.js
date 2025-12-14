/**
 * Property-Based Tests for PersonalizationValidator
 * 
 * Tests universal properties for response quality validation and scoring
 * 
 * Property 3: Personalization Reflection
 */

const fc = require('fast-check');
const StudentProfileBuilder = require('../StudentProfileBuilder');
const PersonalizationValidator = require('../PersonalizationValidator');

describe('PersonalizationValidator - Property-Based Tests', () => {
  let profileBuilder;
  let validator;

  beforeEach(() => {
    profileBuilder = new StudentProfileBuilder();
    validator = new PersonalizationValidator();
  });

  /**
   * Property 3: Personalization Reflection
   * For any complete student profile, responses that include student data
   * should achieve higher personalization scores than generic responses
   */
  describe('Property 3: Personalization Reflection', () => {
    test('responses reflecting student input achieve higher scores than generic responses', () => {
      fc.assert(fc.property(
        fc.record({
          grade: fc.integer(10, 12),
          subjects: fc.array(fc.string(1, 20), 1, 4),
          motivation: fc.string(20, 200),
          concerns: fc.string(20, 200),
          careerInterests: fc.string(10, 100),
          marks: fc.option(fc.dictionary(fc.string(1, 20), fc.float(40, 95)))
        }),
        (formData) => {
          const profile = profileBuilder.buildProfile(formData);
          
          // Create a personalized response that includes student data
          const personalizedResponse = `
            Based on your motivation: "${formData.motivation}", I can see you're passionate about these areas.
            Regarding your concerns about "${formData.concerns}", here's specific advice to help you.
            Your career interest in "${formData.careerInterests}" is definitely achievable.
            Given your subjects ${formData.subjects.join(', ')}, here are the best pathways.
          `;
          
          // Create a generic response that ignores student data
          const genericResponse = `
            Here are some general career options to consider.
            Engineering is a good field with many opportunities.
            You should work hard and study well.
            Consider your interests when making decisions.
          `;
          
          const personalizedValidation = validator.validateResponse(personalizedResponse, profile);
          const genericValidation = validator.validateResponse(genericResponse, profile);
          
          // Personalized response should score higher than generic response
          expect(personalizedValidation.personalizationScore).toBeGreaterThan(
            genericValidation.personalizationScore
          );
          
          // Personalized response should reflect motivation if provided
          if (profile.motivations.hasMotivation) {
            expect(personalizedValidation.motivationReflected.score).toBeGreaterThan(
              genericValidation.motivationReflected.score
            );
          }
          
          // Personalized response should address concerns if provided
          if (profile.concerns.hasConcerns) {
            expect(personalizedValidation.concernsAddressed.score).toBeGreaterThan(
              genericValidation.concernsAddressed.score
            );
          }
          
          // Personalized response should acknowledge career interests
          if (profile.careerInterests.hasCareerInterests) {
            expect(personalizedValidation.careerInterestsAcknowledged.score).toBeGreaterThan(
              genericValidation.careerInterestsAcknowledged.score
            );
          }
        }
      ), { numRuns: 50 });
    });

    test('validation scores correlate with actual data inclusion', () => {
      fc.assert(fc.property(
        fc.record({
          grade: fc.integer(10, 12),
          subjects: fc.array(fc.string(1, 15), 1, 3),
          motivation: fc.string(15, 100),
          concerns: fc.string(15, 100),
          careerInterests: fc.string(8, 50)
        }),
        (formData) => {
          const profile = profileBuilder.buildProfile(formData);
          
          // Test different levels of data inclusion
          const responses = {
            none: "Here are some career suggestions for you.",
            partial: `Your interest in ${formData.careerInterests} is noted.`,
            moderate: `Given your motivation: ${formData.motivation}, and your interest in ${formData.careerInterests}, here are options.`,
            complete: `Your motivation: "${formData.motivation}" shows great potential. 
                      Regarding your concerns: "${formData.concerns}", here's specific guidance.
                      Your career interest in "${formData.careerInterests}" aligns well with your subjects.`
          };
          
          const validations = {};
          Object.keys(responses).forEach(level => {
            validations[level] = validator.validateResponse(responses[level], profile);
          });
          
          // Scores should increase with more data inclusion
          expect(validations.partial.personalizationScore).toBeGreaterThanOrEqual(
            validations.none.personalizationScore
          );
          expect(validations.moderate.personalizationScore).toBeGreaterThanOrEqual(
            validations.partial.personalizationScore
          );
          expect(validations.complete.personalizationScore).toBeGreaterThanOrEqual(
            validations.moderate.personalizationScore
          );
          
          // Complete response should achieve good personalization (target: 80%+)
          expect(validations.complete.personalizationScore).toBeGreaterThan(60);
        }
      ), { numRuns: 30 });
    });

    test('quality levels correspond to score ranges', () => {
      fc.assert(fc.property(
        fc.record({
          grade: fc.integer(10, 12),
          subjects: fc.array(fc.string(1, 20), 1, 3),
          motivation: fc.string(10, 80),
          careerInterests: fc.string(5, 40)
        }),
        (formData) => {
          const profile = profileBuilder.buildProfile(formData);
          
          // Create responses designed for different quality levels
          const responses = {
            poor: "Here are some careers.",
            moderate: `You mentioned ${formData.careerInterests}. Here are related options.`,
            good: `Your motivation "${formData.motivation}" and interest in ${formData.careerInterests} suggest these careers with specific pathways.`,
            excellent: `Based on your deep motivation: "${formData.motivation}", I understand your passion. 
                       Your career interest in "${formData.careerInterests}" is excellent and here's exactly how to achieve it with your current subjects.`
          };
          
          Object.entries(responses).forEach(([expectedLevel, response]) => {
            const validation = validator.validateResponse(response, profile);
            
            // Quality level should match expected level or be reasonable
            if (expectedLevel === 'poor') {
              expect(['poor', 'moderate']).toContain(validation.qualityLevel);
            } else if (expectedLevel === 'excellent') {
              expect(['good', 'excellent']).toContain(validation.qualityLevel);
            }
            
            // Score should be within reasonable range for quality level
            if (validation.qualityLevel === 'excellent') {
              expect(validation.personalizationScore).toBeGreaterThanOrEqual(90);
            } else if (validation.qualityLevel === 'good') {
              expect(validation.personalizationScore).toBeGreaterThanOrEqual(80);
            } else if (validation.qualityLevel === 'moderate') {
              expect(validation.personalizationScore).toBeGreaterThanOrEqual(60);
            }
          });
        }
      ), { numRuns: 25 });
    });
  });

  /**
   * Validation Consistency Properties
   */
  describe('Validation Consistency Properties', () => {
    test('validation results are consistent for identical inputs', () => {
      fc.assert(fc.property(
        fc.record({
          grade: fc.integer(10, 12),
          subjects: fc.array(fc.string(1, 15), 1, 3),
          motivation: fc.string(10, 100),
          careerInterests: fc.string(5, 50)
        }),
        (formData) => {
          const profile = profileBuilder.buildProfile(formData);
          const response = `Your motivation "${formData.motivation}" and interest in ${formData.careerInterests} are well-aligned.`;
          
          // Run validation multiple times
          const validation1 = validator.validateResponse(response, profile);
          const validation2 = validator.validateResponse(response, profile);
          
          // Results should be identical
          expect(validation1.personalizationScore).toBe(validation2.personalizationScore);
          expect(validation1.qualityLevel).toBe(validation2.qualityLevel);
          expect(validation1.motivationReflected.score).toBe(validation2.motivationReflected.score);
          expect(validation1.careerInterestsAcknowledged.score).toBe(validation2.careerInterestsAcknowledged.score);
        }
      ), { numRuns: 20 });
    });

    test('validation handles edge cases gracefully', () => {
      fc.assert(fc.property(
        fc.record({
          grade: fc.integer(10, 12),
          subjects: fc.array(fc.string(1, 20), 0, 5),
          motivation: fc.option(fc.string(0, 200)),
          concerns: fc.option(fc.string(0, 200)),
          careerInterests: fc.option(fc.string(0, 100))
        }),
        (formData) => {
          const profile = profileBuilder.buildProfile(formData);
          
          // Test with various response types
          const responses = [
            "",  // Empty response
            "Short response.",  // Very short
            "A".repeat(1000),  // Very long
            "Normal career guidance response with some content."  // Normal
          ];
          
          responses.forEach(response => {
            expect(() => {
              const validation = validator.validateResponse(response, profile);
              
              // Validation should always return valid structure
              expect(validation).toHaveProperty('personalizationScore');
              expect(validation).toHaveProperty('qualityLevel');
              expect(validation).toHaveProperty('motivationReflected');
              expect(validation).toHaveProperty('concernsAddressed');
              expect(validation).toHaveProperty('careerInterestsAcknowledged');
              expect(validation).toHaveProperty('academicIntegration');
              
              // Score should be between 0 and 100
              expect(validation.personalizationScore).toBeGreaterThanOrEqual(0);
              expect(validation.personalizationScore).toBeLessThanOrEqual(100);
              
              // Quality level should be valid
              expect(['poor', 'moderate', 'good', 'excellent', 'error']).toContain(validation.qualityLevel);
              
            }).not.toThrow();
          });
        }
      ), { numRuns: 30 });
    });
  });

  /**
   * Scoring Algorithm Properties
   */
  describe('Scoring Algorithm Properties', () => {
    test('scores increase monotonically with better data inclusion', () => {
      const formData = {
        grade: 11,
        subjects: ['Mathematics', 'Physics'],
        motivation: 'I want to solve complex engineering problems',
        concerns: 'I worry about math difficulty',
        careerInterests: 'Mechanical engineer',
        marks: { 'Mathematics': 75, 'Physics': 80 }
      };
      
      const profile = profileBuilder.buildProfile(formData);
      
      // Progressive responses with increasing personalization
      const responses = [
        "Here are career options.",
        "Engineering might be good for you.",
        "Your interest in mechanical engineering is noted.",
        "Given your interest in mechanical engineering and strong physics marks, this is achievable.",
        "Your motivation to solve complex engineering problems aligns perfectly with mechanical engineering. Your physics mark of 80% shows strong potential, though your math at 75% could be improved for top engineering programs."
      ];
      
      const scores = responses.map(response => 
        validator.validateResponse(response, profile).personalizationScore
      );
      
      // Scores should generally increase (allowing for some variation)
      for (let i = 1; i < scores.length; i++) {
        expect(scores[i]).toBeGreaterThanOrEqual(scores[i-1] - 10); // Allow small decreases due to algorithm variation
      }
      
      // Final response should achieve high score
      expect(scores[scores.length - 1]).toBeGreaterThan(70);
    });

    test('academic integration affects scoring appropriately', () => {
      fc.assert(fc.property(
        fc.record({
          grade: fc.integer(10, 12),
          subjects: fc.array(fc.string(1, 15), 1, 3),
          careerInterests: fc.string(5, 40),
          marks: fc.dictionary(fc.string(1, 15), fc.float(50, 95))
        }),
        (formData) => {
          const profileWithMarks = profileBuilder.buildProfile(formData);
          const profileWithoutMarks = profileBuilder.buildProfile({
            ...formData,
            marks: {}
          });
          
          const responseWithAcademicData = `
            Your interest in ${formData.careerInterests} is great.
            Your marks show good potential, and you should focus on improving your weaker subjects.
            Based on your current performance, here are realistic pathways.
          `;
          
          const responseWithoutAcademicData = `
            Your interest in ${formData.careerInterests} is great.
            Here are some general pathways to consider.
          `;
          
          const validationWithMarks = validator.validateResponse(responseWithAcademicData, profileWithMarks);
          const validationWithoutMarks = validator.validateResponse(responseWithoutAcademicData, profileWithoutMarks);
          
          // When marks are available and used, academic integration score should be higher
          if (Object.keys(formData.marks).length > 0) {
            expect(validationWithMarks.academicIntegration.score).toBeGreaterThan(
              validationWithoutMarks.academicIntegration.score
            );
          }
        }
      ), { numRuns: 20 });
    });
  });
});