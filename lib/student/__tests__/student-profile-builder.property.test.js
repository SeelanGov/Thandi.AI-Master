/**
 * Property-Based Tests for StudentProfileBuilder
 * 
 * Tests universal properties that should hold true across all valid inputs
 * using fast-check for comprehensive random data generation.
 * 
 * Property 1: Complete Data Utilization
 * Property 2: Structured Context Organization  
 * Property 4: Graceful Degradation
 */

const fc = require('fast-check');
const StudentProfileBuilder = require('../StudentProfileBuilder');

describe('StudentProfileBuilder - Property-Based Tests', () => {
  let profileBuilder;

  beforeEach(() => {
    profileBuilder = new StudentProfileBuilder();
  });

  /**
   * Property 1: Complete Data Utilization
   * For any student profile with non-empty questionnaire fields, 
   * all provided motivation, concerns, and career interest data should be included
   */
  describe('Property 1: Complete Data Utilization', () => {
    test('all questionnaire data included in profile', () => {
      fc.assert(fc.property(
        fc.record({
          grade: fc.integer(10, 12),
          subjects: fc.array(fc.string(1, 20), 1, 5),
          motivation: fc.string(0, 500),
          concerns: fc.string(0, 500),
          careerInterests: fc.string(0, 200),
          marks: fc.option(fc.dictionary(
            fc.string(1, 20), 
            fc.float(0, 100)
          ))
        }),
        (formData) => {
          const profile = profileBuilder.buildProfile(formData);
          
          // Verify motivation data utilization
          if (formData.motivation && formData.motivation.trim()) {
            expect(profile.motivations.hasMotivation).toBe(true);
            expect(profile.motivations.rawText).toContain(formData.motivation.trim());
            expect(profile.motivations.rawText.length).toBeGreaterThan(0);
          } else {
            expect(profile.motivations.hasMotivation).toBe(false);
          }
          
          // Verify concerns data utilization
          if (formData.concerns && formData.concerns.trim()) {
            expect(profile.concerns.hasConcerns).toBe(true);
            expect(profile.concerns.rawText).toContain(formData.concerns.trim());
            expect(profile.concerns.rawText.length).toBeGreaterThan(0);
          } else {
            expect(profile.concerns.hasConcerns).toBe(false);
          }
          
          // Verify career interests data utilization
          if (formData.careerInterests && formData.careerInterests.trim()) {
            expect(profile.careerInterests.hasCareerInterests).toBe(true);
            expect(profile.careerInterests.rawText).toContain(formData.careerInterests.trim());
            expect(profile.careerInterests.rawText.length).toBeGreaterThan(0);
          } else {
            expect(profile.careerInterests.hasCareerInterests).toBe(false);
          }
          
          // Verify academic data utilization
          expect(profile.academic.enjoyedSubjects).toEqual(
            expect.arrayContaining(formData.subjects.filter(s => s.trim()))
          );
          
          // Verify marks data utilization if provided
          if (formData.marks && Object.keys(formData.marks).length > 0) {
            const validMarks = Object.entries(formData.marks)
              .filter(([_, mark]) => !isNaN(parseFloat(mark)) && parseFloat(mark) >= 0 && parseFloat(mark) <= 100);
            
            if (validMarks.length > 0) {
              expect(profile.academic.hasMarks).toBe(true);
              expect(profile.academic.currentMarks.length).toBeGreaterThan(0);
            }
          }
        }
      ), { numRuns: 100 });
    });

    test('profile metadata reflects data completeness accurately', () => {
      fc.assert(fc.property(
        fc.record({
          grade: fc.integer(10, 12),
          subjects: fc.array(fc.string(1, 20), 1, 5),
          motivation: fc.option(fc.string(1, 100)),
          concerns: fc.option(fc.string(1, 100)),
          careerInterests: fc.option(fc.string(1, 50)),
          marks: fc.option(fc.dictionary(fc.string(1, 20), fc.float(0, 100)))
        }),
        (formData) => {
          const profile = profileBuilder.buildProfile(formData);
          
          // Completion level should reflect actual data provided
          const expectedFields = ['grade', 'subjects'];
          let providedFields = 2; // grade and subjects always provided in this test
          
          if (formData.motivation) providedFields++;
          if (formData.concerns) providedFields++;
          if (formData.careerInterests) providedFields++;
          if (formData.marks && Object.keys(formData.marks).length > 0) providedFields++;
          
          const expectedCompletion = Math.round((providedFields / 6) * 100);
          expect(profile.metadata.completionLevel).toBe(expectedCompletion);
          
          // Personalization potential should increase with more data
          if (formData.motivation && formData.concerns && formData.careerInterests) {
            expect(['excellent', 'good']).toContain(profile.metadata.personalizationPotential);
          }
        }
      ), { numRuns: 100 });
    });
  });

  /**
   * Property 4: Graceful Degradation
   * For any student profile with missing questionnaire fields,
   * the system should continue to function without errors
   */
  describe('Property 4: Graceful Degradation', () => {
    test('handles missing or malformed data gracefully', () => {
      fc.assert(fc.property(
        fc.record({
          grade: fc.option(fc.oneof(
            fc.integer(10, 12),
            fc.string(),
            fc.constant(null),
            fc.constant(undefined)
          )),
          subjects: fc.option(fc.oneof(
            fc.array(fc.string(1, 20), 0, 5),
            fc.string(),
            fc.constant(null),
            fc.constant([])
          )),
          motivation: fc.option(fc.oneof(
            fc.string(0, 500),
            fc.constant(null),
            fc.constant(undefined),
            fc.constant('')
          )),
          concerns: fc.option(fc.oneof(
            fc.string(0, 500),
            fc.constant(null),
            fc.constant(undefined),
            fc.constant('')
          )),
          careerInterests: fc.option(fc.oneof(
            fc.string(0, 200),
            fc.constant(null),
            fc.constant(undefined),
            fc.constant('')
          )),
          marks: fc.option(fc.oneof(
            fc.dictionary(fc.string(1, 20), fc.float(-10, 110)), // Include invalid marks
            fc.constant(null),
            fc.constant({}),
            fc.string() // Invalid type
          ))
        }),
        (formData) => {
          // Should not throw errors regardless of input
          expect(() => {
            const profile = profileBuilder.buildProfile(formData);
            
            // Profile should always have required structure
            expect(profile).toHaveProperty('demographics');
            expect(profile).toHaveProperty('academic');
            expect(profile).toHaveProperty('motivations');
            expect(profile).toHaveProperty('concerns');
            expect(profile).toHaveProperty('careerInterests');
            expect(profile).toHaveProperty('constraints');
            expect(profile).toHaveProperty('metadata');
            
            // Demographics should have valid grade
            expect(profile.demographics.grade).toBeGreaterThanOrEqual(10);
            expect(profile.demographics.grade).toBeLessThanOrEqual(12);
            
            // Academic should have subjects array (even if empty)
            expect(Array.isArray(profile.academic.enjoyedSubjects)).toBe(true);
            
            // Metadata should be present and valid
            expect(profile.metadata.completionLevel).toBeGreaterThanOrEqual(0);
            expect(profile.metadata.completionLevel).toBeLessThanOrEqual(100);
            expect(profile.metadata.dataQuality).toBeGreaterThanOrEqual(0);
            expect(profile.metadata.dataQuality).toBeLessThanOrEqual(100);
            
          }).not.toThrow();
        }
      ), { numRuns: 100 });
    });

    test('maintains data quality assessment even with partial data', () => {
      fc.assert(fc.property(
        fc.record({
          grade: fc.constant(11),
          subjects: fc.constant(['Mathematics', 'Physics']),
          motivation: fc.option(fc.string(0, 50)),
          concerns: fc.option(fc.string(0, 50)),
          careerInterests: fc.option(fc.string(0, 30))
        }),
        (formData) => {
          const profile = profileBuilder.buildProfile(formData);
          
          // Data quality should be proportional to provided data
          let expectedQuality = 30; // Base for grade and subjects
          
          if (formData.motivation && formData.motivation.length > 20) expectedQuality += 25;
          if (formData.concerns && formData.concerns.length > 20) expectedQuality += 25;
          if (formData.careerInterests && formData.careerInterests.length > 10) expectedQuality += 20;
          
          expect(profile.metadata.dataQuality).toBe(expectedQuality);
          
          // Should always have basic personalization potential
          expect(['basic', 'moderate', 'good', 'excellent']).toContain(
            profile.metadata.personalizationPotential
          );
        }
      ), { numRuns: 100 });
    });
  });

  /**
   * Data Validation and Sanitization Properties
   */
  describe('Data Validation Properties', () => {
    test('sanitizes and validates all text inputs', () => {
      fc.assert(fc.property(
        fc.record({
          grade: fc.integer(10, 12),
          subjects: fc.array(fc.string(1, 50), 1, 3),
          motivation: fc.string(0, 2000), // Test with very long strings
          concerns: fc.string(0, 2000),
          careerInterests: fc.string(0, 1000)
        }),
        (formData) => {
          const profile = profileBuilder.buildProfile(formData);
          
          // Text fields should be sanitized (no excessive whitespace, length limits)
          if (profile.motivations.hasMotivation) {
            expect(profile.motivations.rawText.length).toBeLessThanOrEqual(1000);
            expect(profile.motivations.rawText).not.toMatch(/\s{2,}/); // No multiple spaces
          }
          
          if (profile.concerns.hasConcerns) {
            expect(profile.concerns.rawText.length).toBeLessThanOrEqual(1000);
            expect(profile.concerns.rawText).not.toMatch(/\s{2,}/);
          }
          
          if (profile.careerInterests.hasCareerInterests) {
            expect(profile.careerInterests.rawText.length).toBeLessThanOrEqual(1000);
            expect(profile.careerInterests.rawText).not.toMatch(/\s{2,}/);
          }
          
          // Subjects should be cleaned
          profile.academic.enjoyedSubjects.forEach(subject => {
            expect(subject.trim()).toBe(subject);
            expect(subject.length).toBeGreaterThan(0);
          });
        }
      ), { numRuns: 100 });
    });

    test('APS calculations are accurate when marks provided', () => {
      fc.assert(fc.property(
        fc.record({
          grade: fc.integer(10, 12),
          subjects: fc.array(fc.string(1, 20), 1, 7),
          marks: fc.dictionary(
            fc.string(1, 20),
            fc.float(0, 100),
            1, 7
          )
        }),
        (formData) => {
          const profile = profileBuilder.buildProfile(formData);
          
          if (profile.academic.hasMarks && profile.academic.apsData) {
            // APS should be sum of individual subject APS points
            const expectedAPS = profile.academic.currentMarks.reduce(
              (sum, mark) => sum + mark.apsPoints, 0
            );
            expect(profile.academic.apsData.currentAPS).toBe(expectedAPS);
            
            // APS points should follow South African conversion
            profile.academic.currentMarks.forEach(mark => {
              if (mark.percentage >= 80) expect(mark.apsPoints).toBe(7);
              else if (mark.percentage >= 70) expect(mark.apsPoints).toBe(6);
              else if (mark.percentage >= 60) expect(mark.apsPoints).toBe(5);
              else if (mark.percentage >= 50) expect(mark.apsPoints).toBe(4);
              else if (mark.percentage >= 40) expect(mark.apsPoints).toBe(3);
              else if (mark.percentage >= 30) expect(mark.apsPoints).toBe(2);
              else expect(mark.apsPoints).toBe(1);
            });
            
            // University eligibility should be based on APS >= 21
            expect(profile.academic.apsData.universityEligible).toBe(
              profile.academic.apsData.currentAPS >= 21
            );
          }
        }
      ), { numRuns: 100 });
    });
  });

  /**
   * Theme and Category Extraction Properties
   */
  describe('Theme Extraction Properties', () => {
    test('extracts motivation themes consistently', () => {
      const motivationTexts = [
        'I want to help people and make a difference in healthcare',
        'I love creating art and designing beautiful things',
        'I enjoy solving complex problems and building solutions',
        'I want to lead teams and manage successful businesses',
        'I am passionate about learning and discovering new knowledge'
      ];

      motivationTexts.forEach(motivation => {
        const profile = profileBuilder.buildProfile({
          grade: 11,
          subjects: ['Mathematics'],
          motivation
        });

        expect(profile.motivations.hasMotivation).toBe(true);
        expect(profile.motivations.extractedThemes.length).toBeGreaterThan(0);
        
        // Verify theme extraction logic
        if (motivation.includes('help')) {
          expect(profile.motivations.extractedThemes).toContain('helping others');
        }
        if (motivation.includes('creat') || motivation.includes('art')) {
          expect(profile.motivations.extractedThemes).toContain('creativity');
        }
        if (motivation.includes('solv') || motivation.includes('problem')) {
          expect(profile.motivations.extractedThemes).toContain('problem solving');
        }
      });
    });

    test('categorizes concerns accurately', () => {
      const concernTexts = [
        'I am worried about my grades and failing my exams',
        'My family cannot afford university fees and I need bursaries',
        'I am confused about which career to choose',
        'There is too much competition for good jobs',
        'I struggle with time management and stress'
      ];

      concernTexts.forEach(concerns => {
        const profile = profileBuilder.buildProfile({
          grade: 12,
          subjects: ['English'],
          concerns
        });

        expect(profile.concerns.hasConcerns).toBe(true);
        expect(profile.concerns.concernCategories.length).toBeGreaterThan(0);
        
        // Verify categorization logic
        if (concerns.includes('grade') || concerns.includes('exam')) {
          expect(profile.concerns.concernCategories).toContain('academic performance');
        }
        if (concerns.includes('afford') || concerns.includes('fee')) {
          expect(profile.concerns.concernCategories).toContain('financial constraints');
        }
        if (concerns.includes('confus') || concerns.includes('choose')) {
          expect(profile.concerns.concernCategories).toContain('career uncertainty');
        }
      });
    });
  });
});