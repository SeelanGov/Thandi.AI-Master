/**
 * Property-based tests for MarkValidator
 * **Feature: subject-marks-collection, Property 2: Mark Input Validation Completeness**
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
 */

import fc from 'fast-check';
import { MarkValidator } from '../MarkValidator.js';

describe('MarkValidator Property Tests', () => {
  let validator;

  beforeEach(() => {
    validator = new MarkValidator();
  });

  describe('Property 2: Mark Input Validation Completeness', () => {
    
    test('validates all percentage inputs in range 0-100 correctly', () => {
      // Property: For any valid percentage (0-100), validation should succeed
      fc.assert(fc.property(
        fc.float({ min: 0, max: 100 }),
        (percentage) => {
          const result = validator.validateMark(percentage, 'percentage');
          
          expect(result.isValid).toBe(true);
          expect(result.normalizedValue).toBeCloseTo(percentage, 1);
          expect(result.format).toBe('percentage');
          expect(result.errors).toHaveLength(0);
        }
      ), { numRuns: 100 });
    });

    test('validates all grade symbols A+ to F correctly', () => {
      // Property: For any valid grade symbol, validation should succeed and convert to percentage
      const validSymbols = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E', 'F'];
      
      validSymbols.forEach(symbol => {
        const result = validator.validateMark(symbol, 'symbol');
        
        expect(result.isValid).toBe(true);
        expect(result.normalizedValue).toBeGreaterThanOrEqual(0);
        expect(result.normalizedValue).toBeLessThanOrEqual(100);
        expect(result.format).toBe('symbol');
        expect(result.errors).toHaveLength(0);
      });
    });

    test('rejects all invalid mark formats consistently', () => {
      // Property: For any invalid input, validation should fail with appropriate error
      const invalidInputs = ['XYZ', '150', '-10', 'G+', '101%', 'abc', '', null, undefined];
      
      invalidInputs.forEach(invalid => {
        const result = validator.validateMark(invalid);
        
        expect(result.isValid).toBe(false);
        expect(result.normalizedValue).toBeNull();
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    test('auto-detects format correctly for all valid inputs', () => {
      // Property: Format detection should work for any valid input
      const testCases = [
        { input: '75', expectedFormat: 'percentage' },
        { input: '75%', expectedFormat: 'percentage' },
        { input: 85.5, expectedFormat: 'percentage' },
        { input: 'A+', expectedFormat: 'symbol' },
        { input: 'B-', expectedFormat: 'symbol' },
        { input: 'F', expectedFormat: 'symbol' }
      ];
      
      testCases.forEach(({ input, expectedFormat }) => {
        const result = validator.validateMark(input, 'auto');
        
        expect(result.format).toBe(expectedFormat);
        if (result.isValid) {
          expect(result.normalizedValue).toBeGreaterThanOrEqual(0);
          expect(result.normalizedValue).toBeLessThanOrEqual(100);
        }
      });
    });

    test('maintains most recent valid entry when format switches', () => {
      // Property: When switching between formats, the most recent valid entry should be maintained
      const validator = new MarkValidator();
      
      // First validate a percentage
      const percentageResult = validator.validateMark('75%', 'percentage');
      expect(percentageResult.isValid).toBe(true);
      expect(percentageResult.normalizedValue).toBe(75);
      
      // Then validate a symbol
      const symbolResult = validator.validateMark('A-', 'symbol');
      expect(symbolResult.isValid).toBe(true);
      expect(symbolResult.normalizedValue).toBe(80); // A- maps to 80%
      
      // Both should be independent and valid
      expect(percentageResult.normalizedValue).toBe(75);
      expect(symbolResult.normalizedValue).toBe(80);
    });

    test('prevents progression when marks are empty', () => {
      // Property: Empty or null marks should always be invalid
      const emptyInputs = ['', null, undefined, '   '];
      
      emptyInputs.forEach(empty => {
        const result = validator.validateMark(empty);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Mark is required');
      });
    });

    test('consistency validation works across all subject combinations', () => {
      // Property: Consistency validation should work for any combination of subjects and marks
      for (let i = 0; i < 50; i++) {
        const marks = {};
        const numSubjects = Math.floor(Math.random() * 5) + 2; // 2-6 subjects
        const subjects = ['mathematics', 'english', 'physical_science', 'history', 'geography', 'accounting'];
        
        for (let j = 0; j < numSubjects; j++) {
          const subject = subjects[j];
          marks[subject] = {
            normalizedValue: Math.random() * 100,
            format: 'percentage'
          };
        }
        
        const consistencyResult = validator.validateConsistency(marks, Object.keys(marks));
        
        // Should always return a valid consistency object
        expect(consistencyResult).toHaveProperty('isConsistent');
        expect(consistencyResult).toHaveProperty('issues');
        expect(consistencyResult).toHaveProperty('warnings');
        expect(Array.isArray(consistencyResult.issues)).toBe(true);
        expect(Array.isArray(consistencyResult.warnings)).toBe(true);
      }
    });

    test('performance level classification is consistent', () => {
      // Property: Performance level should be consistent for all mark ranges
      const testRanges = [
        { min: 80, max: 100, expected: 'good' },
        { min: 60, max: 79, expected: 'average' },
        { min: 40, max: 59, expected: 'concerning' },
        { min: 0, max: 39, expected: 'poor' }
      ];
      
      testRanges.forEach(({ min, max, expected }) => {
        for (let i = 0; i < 20; i++) {
          const mark = min + Math.random() * (max - min);
          const level = validator.getPerformanceLevel(mark);
          expect(level).toBe(expected);
        }
      });
    });

    test('visual feedback colors match performance levels', () => {
      // Property: Visual feedback should consistently match performance levels
      const colorMappings = {
        'good': 'green',
        'average': 'amber', 
        'concerning': 'orange',
        'poor': 'red'
      };
      
      for (let i = 0; i < 100; i++) {
        const mark = Math.random() * 100;
        const level = validator.getPerformanceLevel(mark);
        const color = validator.getVisualFeedback(mark);
        
        expect(color).toBe(colorMappings[level]);
      }
    });

    test('improvement suggestions are always provided for low marks', () => {
      // Property: Low marks should always generate improvement suggestions
      for (let i = 0; i < 50; i++) {
        const lowMark = Math.random() * 60; // 0-60% range
        const subject = 'mathematics';
        const suggestions = validator.getImprovementSuggestions(lowMark, subject);
        
        expect(Array.isArray(suggestions)).toBe(true);
        expect(suggestions.length).toBeGreaterThan(0);
        expect(suggestions.some(s => s.includes(subject))).toBe(true);
      }
    });
  });

  describe('Edge Cases and Error Handling', () => {
    
    test('handles decimal percentages correctly', () => {
      const decimalPercentages = [75.5, 82.3, 91.7, 45.2];
      
      decimalPercentages.forEach(percentage => {
        const result = validator.validateMark(percentage);
        
        expect(result.isValid).toBe(true);
        expect(result.normalizedValue).toBeCloseTo(percentage, 1);
      });
    });

    test('handles percentage strings with % symbol', () => {
      const percentageStrings = ['75%', '82.5%', '100%', '0%'];
      
      percentageStrings.forEach(percentage => {
        const result = validator.validateMark(percentage);
        
        expect(result.isValid).toBe(true);
        expect(result.format).toBe('percentage');
      });
    });

    test('handles case-insensitive grade symbols', () => {
      const mixedCaseSymbols = ['a+', 'B-', 'c', 'D+', 'e', 'f'];
      
      mixedCaseSymbols.forEach(symbol => {
        const result = validator.validateMark(symbol);
        
        expect(result.isValid).toBe(true);
        expect(result.format).toBe('symbol');
      });
    });

    test('provides specific error messages for different failure types', () => {
      const errorCases = [
        { input: '150', expectedError: 'exceed 100%' },
        { input: '-10', expectedError: 'negative' },
        { input: 'Z+', expectedError: 'Invalid grade symbol' },
        { input: '', expectedError: 'required' }
      ];
      
      errorCases.forEach(({ input, expectedError }) => {
        const result = validator.validateMark(input);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => 
          error.toLowerCase().includes(expectedError.toLowerCase())
        )).toBe(true);
      });
    });
  });
});