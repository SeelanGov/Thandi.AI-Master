/**
 * Property-based tests for FallbackManager
 * **Feature: subject-marks-collection, Property 9: Graceful Fallback Handling**
 * **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**
 */

import fc from 'fast-check';
import { FallbackManager } from '../FallbackManager.js';

describe('FallbackManager Property Tests', () => {
  let fallbackManager;

  beforeEach(() => {
    fallbackManager = new FallbackManager();
  });

  describe('Property 9: Graceful Fallback Handling', () => {
    
    test('creates valid fallback marks for all fallback types', () => {
      // Property: For any valid fallback type, a valid fallback mark should be created
      const fallbackTypes = Object.values(fallbackManager.fallbackOptions);
      const subjectIds = ['mathematics', 'english', 'physical_science', 'history'];
      
      fallbackTypes.forEach(fallbackType => {
        subjectIds.forEach(subjectId => {
          const options = fallbackType === 'estimate' 
            ? { estimateLevel: 'good' } 
            : {};
          
          const fallbackMark = fallbackManager.createFallbackMark(subjectId, fallbackType, options);
          
          expect(fallbackMark).toHaveProperty('subjectId', subjectId);
          expect(fallbackMark).toHaveProperty('fallbackType', fallbackType);
          expect(fallbackMark).toHaveProperty('isFallback', true);
          expect(fallbackMark).toHaveProperty('validationState', 'fallback');
          expect(fallbackMark).toHaveProperty('canProgress', true);
          expect(fallbackMark).toHaveProperty('displayValue');
          expect(fallbackMark).toHaveProperty('message');
          expect(Array.isArray(fallbackMark.limitations)).toBe(true);
          expect(Array.isArray(fallbackMark.suggestedActions)).toBe(true);
        });
      });
    });

    test('estimate fallbacks always have valid normalized values', () => {
      // Property: For any estimate level, the normalized value should be within the expected range
      const estimateLevels = ['excellent', 'good', 'average', 'below_average', 'struggling', 'very_low'];
      
      fc.assert(fc.property(
        fc.constantFrom(...estimateLevels),
        fc.constantFrom('mathematics', 'english', 'physical_science'),
        (estimateLevel, subjectId) => {
          const fallbackMark = fallbackManager.createFallbackMark(
            subjectId, 
            'estimate', 
            { estimateLevel }
          );
          
          const range = fallbackManager.estimateRanges[estimateLevel];
          
          expect(fallbackMark.normalizedValue).toBeGreaterThanOrEqual(range.min);
          expect(fallbackMark.normalizedValue).toBeLessThanOrEqual(range.max);
          expect(fallbackMark.estimateLevel).toBe(estimateLevel);
          expect(fallbackMark.isEstimate).toBe(true);
          expect(fallbackMark.estimatedRange).toEqual(range);
        }
      ), { numRuns: 100 });
    });

    test('dont_know and skip fallbacks never have normalized values', () => {
      // Property: Don't know and skip fallbacks should never have normalized values
      const nonValueTypes = ['dont_know', 'skip', 'technical_issue'];
      
      nonValueTypes.forEach(fallbackType => {
        for (let i = 0; i < 20; i++) {
          const subjectId = `subject_${i}`;
          const fallbackMark = fallbackManager.createFallbackMark(subjectId, fallbackType);
          
          expect(fallbackMark.normalizedValue).toBeNull();
          expect(fallbackMark.estimatedRange).toBeNull();
        }
      });
    });

    test('progression validation works correctly for all mark combinations', () => {
      // Property: Progression validation should work for any combination of marks and fallbacks
      fc.assert(fc.property(
        fc.array(fc.constantFrom('math', 'english', 'science', 'history'), { minLength: 2, maxLength: 7 }),
        fc.integer({ min: 0, max: 100 }),
        (selectedSubjects, fallbackPercentage) => {
          const marks = {};
          
          // Create a mix of exact marks and fallbacks based on fallbackPercentage
          selectedSubjects.forEach((subject, index) => {
            const shouldBeFallback = (index * 100 / selectedSubjects.length) < fallbackPercentage;
            
            if (shouldBeFallback) {
              marks[subject] = fallbackManager.createFallbackMark(subject, 'estimate', { estimateLevel: 'good' });
            } else {
              marks[subject] = {
                validationState: 'valid',
                normalizedValue: 75,
                isFallback: false
              };
            }
          });
          
          const result = fallbackManager.validateProgression(marks, selectedSubjects);
          
          expect(result).toHaveProperty('canProgress');
          expect(result).toHaveProperty('totalSubjects', selectedSubjects.length);
          expect(result).toHaveProperty('validMarks');
          expect(result).toHaveProperty('exactMarks');
          expect(result).toHaveProperty('fallbackMarks');
          expect(result).toHaveProperty('completionPercentage');
          expect(result).toHaveProperty('dataQuality');
          expect(Array.isArray(result.limitations)).toBe(true);
          expect(Array.isArray(result.recommendations)).toBe(true);
          
          // Validation logic checks
          expect(result.validMarks).toBeLessThanOrEqual(selectedSubjects.length);
          expect(result.exactMarks + result.fallbackMarks).toBeLessThanOrEqual(result.validMarks);
          expect(result.completionPercentage).toBeGreaterThanOrEqual(0);
          expect(result.completionPercentage).toBeLessThanOrEqual(100);
        }
      ), { numRuns: 100 });
    });

    test('data quality assessment is consistent', () => {
      // Property: Data quality should be consistent based on exact mark percentage
      const qualityLevels = ['high', 'good', 'moderate', 'limited', 'very_limited'];
      
      for (let exactPercentage = 0; exactPercentage <= 100; exactPercentage += 10) {
        const totalSubjects = 10;
        const exactMarks = Math.round((exactPercentage / 100) * totalSubjects);
        const fallbackMarks = totalSubjects - exactMarks;
        
        const quality = fallbackManager.assessDataQuality(exactMarks, fallbackMarks, totalSubjects);
        
        expect(qualityLevels).toContain(quality);
        
        // Verify quality boundaries
        if (exactPercentage >= 80) expect(quality).toBe('high');
        else if (exactPercentage >= 60) expect(quality).toBe('good');
        else if (exactPercentage >= 40) expect(quality).toBe('moderate');
        else if (exactPercentage >= 20) expect(quality).toBe('limited');
        else expect(quality).toBe('very_limited');
      }
    });

    test('APS processing handles fallbacks correctly', () => {
      // Property: APS processing should correctly handle any combination of exact and fallback marks
      fc.assert(fc.property(
        fc.array(fc.constantFrom('math', 'english', 'science', 'history', 'geography'), { minLength: 3, maxLength: 6 }),
        (subjects) => {
          const marks = {};
          
          // Create mixed marks: some exact, some estimates, some unknown
          subjects.forEach((subject, index) => {
            const markType = index % 3;
            
            if (markType === 0) {
              // Exact mark
              marks[subject] = {
                validationState: 'valid',
                normalizedValue: 75,
                isFallback: false
              };
            } else if (markType === 1) {
              // Estimate
              marks[subject] = fallbackManager.createFallbackMark(subject, 'estimate', { estimateLevel: 'good' });
            } else {
              // Unknown
              marks[subject] = fallbackManager.createFallbackMark(subject, 'dont_know');
            }
          });
          
          const processed = fallbackManager.processMarksForAPS(marks);
          
          expect(processed).toHaveProperty('marks');
          expect(processed).toHaveProperty('warnings');
          expect(processed).toHaveProperty('hasEstimates');
          expect(processed).toHaveProperty('exactMarkCount');
          expect(processed).toHaveProperty('estimateCount');
          
          // Verify only marks with normalized values are included
          Object.values(processed.marks).forEach(mark => {
            expect(mark.normalizedValue).not.toBeNull();
            expect(typeof mark.normalizedValue).toBe('number');
          });
          
          // Verify warning count matches estimate count
          expect(processed.warnings.length).toBe(processed.estimateCount);
          expect(processed.hasEstimates).toBe(processed.estimateCount > 0);
        }
      ), { numRuns: 50 });
    });

    test('fallback options are always valid and complete', () => {
      // Property: Fallback options should always be valid for any subject name
      const subjectNames = ['Mathematics', 'English', 'Physical Sciences', 'History', 'Geography'];
      
      subjectNames.forEach(subjectName => {
        const options = fallbackManager.getFallbackOptions(subjectName);
        
        expect(Array.isArray(options)).toBe(true);
        expect(options.length).toBeGreaterThan(0);
        
        options.forEach(option => {
          expect(option).toHaveProperty('id');
          expect(option).toHaveProperty('label');
          expect(option).toHaveProperty('description');
          expect(option).toHaveProperty('icon');
          expect(option).toHaveProperty('recommended');
          expect(typeof option.recommended).toBe('boolean');
          
          // Description should mention the subject name
          expect(option.description.toLowerCase()).toContain(subjectName.toLowerCase());
        });
      });
    });

    test('estimate level options are consistent and valid', () => {
      // Property: Estimate level options should always be consistent
      const estimateOptions = fallbackManager.getEstimateLevelOptions();
      
      expect(Array.isArray(estimateOptions)).toBe(true);
      expect(estimateOptions.length).toBe(6); // Should have 6 levels
      
      estimateOptions.forEach(option => {
        expect(option).toHaveProperty('id');
        expect(option).toHaveProperty('label');
        expect(option).toHaveProperty('description');
        expect(option).toHaveProperty('range');
        
        const range = option.range;
        expect(range).toHaveProperty('min');
        expect(range).toHaveProperty('max');
        expect(range).toHaveProperty('display');
        
        expect(range.min).toBeLessThanOrEqual(range.max);
        expect(range.min).toBeGreaterThanOrEqual(0);
        expect(range.max).toBeLessThanOrEqual(100);
      });
      
      // Verify ranges don't overlap inappropriately
      const sortedRanges = estimateOptions
        .map(opt => opt.range)
        .sort((a, b) => a.min - b.min);
      
      for (let i = 0; i < sortedRanges.length - 1; i++) {
        expect(sortedRanges[i].max).toBeLessThanOrEqual(sortedRanges[i + 1].min);
      }
    });

    test('limitations message generation is consistent', () => {
      // Property: Limitations messages should be consistent for the same data quality
      const dataQualities = ['high', 'good', 'moderate', 'limited', 'very_limited'];
      
      dataQualities.forEach(quality => {
        // Create mock progression result
        const progressionResult = {
          dataQuality: quality,
          exactMarks: quality === 'high' ? 5 : quality === 'good' ? 3 : 1,
          fallbackMarks: quality === 'high' ? 0 : quality === 'good' ? 2 : 4,
          totalSubjects: 5,
          recommendations: ['Test recommendation']
        };
        
        const message = fallbackManager.generateLimitationsMessage(progressionResult);
        
        expect(message).toHaveProperty('title');
        expect(message).toHaveProperty('message');
        expect(message).toHaveProperty('color');
        expect(message).toHaveProperty('details');
        expect(message).toHaveProperty('actionable');
        expect(message).toHaveProperty('suggestions');
        
        expect(typeof message.actionable).toBe('boolean');
        expect(Array.isArray(message.suggestions)).toBe(true);
        
        // High quality should not be actionable
        if (quality === 'high') {
          expect(message.actionable).toBe(false);
        }
      });
    });

    test('technical issue fallbacks include proper error handling', () => {
      // Property: Technical issue fallbacks should always include proper error metadata
      const errorTypes = ['validation_error', 'storage_error', 'network_error', 'unknown'];
      
      errorTypes.forEach(errorType => {
        const fallbackMark = fallbackManager.createFallbackMark(
          'test_subject', 
          'technical_issue',
          { errorType }
        );
        
        expect(fallbackMark.errorType).toBe(errorType);
        expect(fallbackMark).toHaveProperty('technicalDetails');
        expect(fallbackMark.technicalDetails).toHaveProperty('timestamp');
        expect(fallbackMark.technicalDetails).toHaveProperty('errorType', errorType);
        expect(fallbackMark.technicalDetails).toHaveProperty('canRetry', true);
        
        // Should suggest retry in actions
        expect(fallbackMark.suggestedActions.some(action => 
          action.toLowerCase().includes('retry') || action.toLowerCase().includes('refresh')
        )).toBe(true);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    
    test('handles invalid fallback types gracefully', () => {
      expect(() => {
        fallbackManager.createFallbackMark('test', 'invalid_type');
      }).toThrow('Unknown fallback type: invalid_type');
    });

    test('handles invalid estimate levels gracefully', () => {
      expect(() => {
        fallbackManager.createFallbackMark('test', 'estimate', { estimateLevel: 'invalid' });
      }).toThrow('Invalid estimate level: invalid');
    });

    test('handles empty or null inputs gracefully', () => {
      const result = fallbackManager.validateProgression({}, []);
      expect(result.canProgress).toBe(true); // Empty is valid
      expect(result.totalSubjects).toBe(0);
      
      const result2 = fallbackManager.validateProgression(null, null);
      expect(result2.totalSubjects).toBe(0);
    });

    test('progression validation with minimum subjects', () => {
      const marks = {
        'math': { validationState: 'valid', normalizedValue: 75, isFallback: false }
      };
      const subjects = ['math'];
      
      const result = fallbackManager.validateProgression(marks, subjects);
      expect(result.canProgress).toBe(true); // 1 subject should be enough for 1 selected
    });
  });
});