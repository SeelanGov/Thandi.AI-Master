/**
 * MarkValidator - Comprehensive mark validation and normalization
 * 
 * This class handles validation of student marks in both percentage (0-100) 
 * and South African grade symbol formats (A+ to F), with consistency checking
 * for unrealistic mark patterns.
 * 
 * Requirements addressed: 2.1, 2.2, 2.3, 2.4, 2.5
 */

export class MarkValidator {
  constructor() {
    this.validationErrors = [];
    
    // South African grade symbol to percentage mapping
    this.gradeSymbolMap = {
      'A+': 90, 'A': 85, 'A-': 80,
      'B+': 75, 'B': 70, 'B-': 65,
      'C+': 60, 'C': 55, 'C-': 50,
      'D+': 45, 'D': 40, 'D-': 35,
      'E': 30, 'F': 20
    };
    
    // Valid grade symbols for validation
    this.validGradeSymbols = Object.keys(this.gradeSymbolMap);
  }

  /**
   * Validate a mark input and return validation result
   * @param {string|number} mark - The mark to validate
   * @param {string} format - 'auto', 'percentage', or 'symbol'
   * @returns {Object} Validation result with isValid, normalizedValue, errors
   */
  validateMark(mark, format = 'auto') {
    this.validationErrors = [];
    
    if (!mark && mark !== 0) {
      return {
        isValid: false,
        normalizedValue: null,
        format: null,
        errors: ['Mark is required']
      };
    }

    const detectedFormat = format === 'auto' ? this.detectFormat(mark) : format;
    
    try {
      let normalizedValue;
      let isValid = true;

      if (detectedFormat === 'percentage') {
        normalizedValue = this.validatePercentage(mark);
      } else if (detectedFormat === 'symbol') {
        normalizedValue = this.validateGradeSymbol(mark);
      } else {
        this.validationErrors.push('Invalid mark format. Use 0-100% or grade symbols (A+ to F)');
        isValid = false;
        normalizedValue = null;
      }

      return {
        isValid: isValid && this.validationErrors.length === 0,
        normalizedValue,
        format: detectedFormat,
        errors: [...this.validationErrors]
      };
    } catch (error) {
      return {
        isValid: false,
        normalizedValue: null,
        format: detectedFormat,
        errors: [error.message]
      };
    }
  }

  /**
   * Detect the format of a mark input
   * @param {string|number} mark 
   * @returns {string} 'percentage' or 'symbol'
   */
  detectFormat(mark) {
    const markStr = String(mark).trim().toUpperCase();
    
    // Check if it's a grade symbol
    if (this.validGradeSymbols.includes(markStr)) {
      return 'symbol';
    }
    
    // Check if it's a percentage (with or without % symbol)
    const numericValue = parseFloat(markStr.replace('%', ''));
    if (!isNaN(numericValue)) {
      return 'percentage';
    }
    
    return 'unknown';
  }

  /**
   * Validate percentage mark (0-100)
   * @param {string|number} mark 
   * @returns {number} Normalized percentage value
   */
  validatePercentage(mark) {
    const markStr = String(mark).trim();
    const numericValue = parseFloat(markStr.replace('%', ''));
    
    if (isNaN(numericValue)) {
      this.validationErrors.push('Invalid percentage format');
      return null;
    }
    
    if (numericValue < 0) {
      this.validationErrors.push('Percentage cannot be negative');
      return null;
    }
    
    if (numericValue > 100) {
      this.validationErrors.push('Percentage cannot exceed 100%');
      return null;
    }
    
    // Round to 1 decimal place for consistency
    return Math.round(numericValue * 10) / 10;
  }

  /**
   * Validate grade symbol and convert to percentage
   * @param {string} mark 
   * @returns {number} Percentage equivalent
   */
  validateGradeSymbol(mark) {
    const markStr = String(mark).trim().toUpperCase();
    
    if (!this.validGradeSymbols.includes(markStr)) {
      this.validationErrors.push(`Invalid grade symbol. Valid symbols: ${this.validGradeSymbols.join(', ')}`);
      return null;
    }
    
    return this.gradeSymbolMap[markStr];
  }

  /**
   * Convert grade symbol to percentage equivalent
   * @param {string} symbol 
   * @returns {number|null} Percentage equivalent
   */
  normalizeToPercentage(symbol) {
    const symbolStr = String(symbol).trim().toUpperCase();
    return this.gradeSymbolMap[symbolStr] || null;
  }

  /**
   * Validate consistency across multiple subject marks
   * @param {Object} marks - Object with subject: mark pairs
   * @param {Array} subjects - Array of subject names for context
   * @returns {Object} Consistency validation result
   */
  validateConsistency(marks, subjects = []) {
    const consistencyIssues = [];
    const markValues = [];
    
    // Extract normalized mark values
    Object.entries(marks).forEach(([subject, markData]) => {
      if (markData && typeof markData.normalizedValue === 'number') {
        markValues.push({
          subject,
          value: markData.normalizedValue
        });
      }
    });
    
    if (markValues.length < 2) {
      return {
        isConsistent: true,
        issues: [],
        warnings: []
      };
    }
    
    // Check for extreme variations
    const values = markValues.map(m => m.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
    // Flag if range is very large (>40 points)
    if (range > 40) {
      consistencyIssues.push({
        type: 'large_variation',
        message: `Large variation in marks (${min}% to ${max}%). Please confirm these are correct.`,
        severity: 'warning'
      });
    }
    
    // Check for unrealistic patterns
    const highMarks = markValues.filter(m => m.value >= 80);
    const lowMarks = markValues.filter(m => m.value <= 40);
    
    if (highMarks.length > 0 && lowMarks.length > 0) {
      consistencyIssues.push({
        type: 'mixed_performance',
        message: `Mix of very high (${highMarks.map(m => m.subject).join(', ')}) and very low marks (${lowMarks.map(m => m.subject).join(', ')}). Please verify.`,
        severity: 'warning'
      });
    }
    
    // Check for related subjects with very different marks
    const relatedSubjects = this.findRelatedSubjects(markValues);
    relatedSubjects.forEach(group => {
      if (group.marks.length >= 2) {
        const groupValues = group.marks.map(m => m.value);
        const groupRange = Math.max(...groupValues) - Math.min(...groupValues);
        
        if (groupRange > 25) {
          consistencyIssues.push({
            type: 'related_subject_variation',
            message: `Large variation in related subjects (${group.category}): ${group.marks.map(m => `${m.subject}: ${m.value}%`).join(', ')}`,
            severity: 'info'
          });
        }
      }
    });
    
    return {
      isConsistent: consistencyIssues.filter(i => i.severity === 'error').length === 0,
      issues: consistencyIssues.filter(i => i.severity === 'error'),
      warnings: consistencyIssues.filter(i => i.severity !== 'error')
    };
  }

  /**
   * Find related subjects for consistency checking
   * @param {Array} markValues 
   * @returns {Array} Groups of related subjects
   */
  findRelatedSubjects(markValues) {
    const subjectCategories = {
      sciences: ['mathematics', 'physical_science', 'life_sciences', 'math_literacy'],
      languages: ['english', 'afrikaans', 'isizulu', 'isixhosa', 'french'],
      commerce: ['accounting', 'business_studies', 'economics'],
      humanities: ['history', 'geography'],
      technical: ['it', 'cat', 'egd'],
      creative: ['visual_arts', 'dramatic_arts', 'music', 'dance']
    };
    
    const groups = [];
    
    Object.entries(subjectCategories).forEach(([category, subjects]) => {
      const categoryMarks = markValues.filter(mark => 
        subjects.some(subject => 
          mark.subject.toLowerCase().includes(subject) || 
          subject.includes(mark.subject.toLowerCase())
        )
      );
      
      if (categoryMarks.length > 0) {
        groups.push({
          category,
          marks: categoryMarks
        });
      }
    });
    
    return groups;
  }

  /**
   * Get validation errors from last validation
   * @returns {Array} Array of error messages
   */
  getValidationErrors() {
    return this.validationErrors;
  }

  /**
   * Check if a mark value indicates good performance
   * @param {number} normalizedValue 
   * @returns {string} 'good', 'average', 'concerning', or 'poor'
   */
  getPerformanceLevel(normalizedValue) {
    if (normalizedValue >= 80) return 'good';
    if (normalizedValue >= 60) return 'average';
    if (normalizedValue >= 40) return 'concerning';
    return 'poor';
  }

  /**
   * Get visual feedback color for UI
   * @param {number} normalizedValue 
   * @returns {string} Color indicator for UI
   */
  getVisualFeedback(normalizedValue) {
    const level = this.getPerformanceLevel(normalizedValue);
    const colorMap = {
      'good': 'green',
      'average': 'amber',
      'concerning': 'orange',
      'poor': 'red'
    };
    return colorMap[level];
  }

  /**
   * Generate improvement suggestions based on mark
   * @param {number} normalizedValue 
   * @param {string} subject 
   * @returns {Array} Array of improvement suggestions
   */
  getImprovementSuggestions(normalizedValue, subject) {
    const suggestions = [];
    const level = this.getPerformanceLevel(normalizedValue);
    
    if (level === 'poor' || level === 'concerning') {
      suggestions.push(`Focus on improving ${subject} - current mark (${normalizedValue}%) needs attention`);
      
      if (normalizedValue < 50) {
        suggestions.push('Consider extra tutoring or study groups');
        suggestions.push('Speak with your teacher about additional support');
      }
    }
    
    if (level === 'average') {
      suggestions.push(`Good foundation in ${subject} - aim for 70%+ for better university options`);
    }
    
    if (level === 'good') {
      suggestions.push(`Excellent work in ${subject}! Maintain this performance`);
    }
    
    return suggestions;
  }
}