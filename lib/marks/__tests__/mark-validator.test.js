/**
 * Unit tests for MarkValidator
 * **Feature: subject-marks-collection, Property 2: Mark Input Validation Completeness**
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
 */

import { MarkValidator } from '../MarkValidator.js';

describe('MarkValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new MarkValidator();
  });

  describe('Basic Validation', () => {
    test('validates percentage marks correctly', () => {
      const result = validator.validateMark(75, 'percentage');
      
      expect(result.isValid).toBe(true);
      expect(result.normalizedValue).toBe(75);
      expect(result.format).toBe('percentage');
      expect(result.errors).toHaveLength(0);
    });

    test('validates grade symbols correctly', () => {
      const result = validator.validateMark('A+', 'symbol');
      
      expect(result.isValid).toBe(true);
      expect(result.normalizedValue).toBe(90);
      expect(result.format).toBe('symbol');
      expect(result.errors).toHaveLength(0);
    });

    test('rejects invalid marks', () => {
      const result = validator.validateMark('XYZ');
      
      expect(result.isValid).toBe(false);
      expect(result.normalizedValue).toBeNull();
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('auto-detects format correctly', () => {
      const percentageResult = validator.validateMark('75%', 'auto');
      expect(percentageResult.format).toBe('percentage');
      
      const symbolResult = validator.validateMark('B+', 'auto');
      expect(symbolResult.format).toBe('symbol');
    });
  });

  describe('Edge Cases', () => {
    test('handles boundary values', () => {
      expect(validator.validateMark(0).isValid).toBe(true);
      expect(validator.validateMark(100).isValid).toBe(true);
      expect(validator.validateMark(-1).isValid).toBe(false);
      expect(validator.validateMark(101).isValid).toBe(false);
    });

    test('handles empty inputs', () => {
      expect(validator.validateMark('').isValid).toBe(false);
      expect(validator.validateMark(null).isValid).toBe(false);
      expect(validator.validateMark(undefined).isValid).toBe(false);
    });
  });

  describe('Performance Level Classification', () => {
    test('classifies performance levels correctly', () => {
      expect(validator.getPerformanceLevel(85)).toBe('good');
      expect(validator.getPerformanceLevel(65)).toBe('average');
      expect(validator.getPerformanceLevel(45)).toBe('concerning');
      expect(validator.getPerformanceLevel(25)).toBe('poor');
    });

    test('provides appropriate visual feedback', () => {
      expect(validator.getVisualFeedback(85)).toBe('green');
      expect(validator.getVisualFeedback(65)).toBe('amber');
      expect(validator.getVisualFeedback(45)).toBe('orange');
      expect(validator.getVisualFeedback(25)).toBe('red');
    });
  });

  describe('Consistency Validation', () => {
    test('validates consistent marks', () => {
      const marks = {
        mathematics: { normalizedValue: 75, format: 'percentage' },
        english: { normalizedValue: 78, format: 'percentage' },
        science: { normalizedValue: 72, format: 'percentage' }
      };
      
      const result = validator.validateConsistency(marks);
      expect(result.isConsistent).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    test('flags inconsistent marks', () => {
      const marks = {
        mathematics: { normalizedValue: 90, format: 'percentage' },
        english: { normalizedValue: 30, format: 'percentage' }
      };
      
      const result = validator.validateConsistency(marks);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Improvement Suggestions', () => {
    test('provides suggestions for low marks', () => {
      const suggestions = validator.getImprovementSuggestions(35, 'mathematics');
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.includes('mathematics'))).toBe(true);
    });

    test('provides encouragement for good marks', () => {
      const suggestions = validator.getImprovementSuggestions(85, 'mathematics');
      
      expect(suggestions.some(s => s.includes('Excellent'))).toBe(true);
    });
  });
});