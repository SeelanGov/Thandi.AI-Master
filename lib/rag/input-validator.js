// lib/rag/input-validator.js
// Comprehensive input validation and edge case handling for career matching
// Validates: Requirements 4.5, 8.3, 8.4

/**
 * Comprehensive input validation for student profiles
 * Handles edge cases and malformed data gracefully
 */
export class InputValidator {
  constructor(options = {}) {
    this.strictMode = options.strictMode || false;
    this.enableLogging = options.enableLogging !== false;
    this.supportedGrades = options.supportedGrades || [10, 11, 12];
    this.maxSubjects = options.maxSubjects || 15;
    this.maxInterests = options.maxInterests || 10;
    
    // South African curriculum subjects
    this.validSubjects = new Set([
      'Mathematics', 'Mathematical Literacy', 'Physical Sciences', 'Life Sciences',
      'Information Technology', 'Computer Applications Technology', 'Business Studies',
      'Accounting', 'Economics', 'English', 'Afrikaans', 'isiZulu', 'isiXhosa',
      'Sesotho', 'Setswana', 'Sepedi', 'Xitsonga', 'siSwati', 'Tshivenda', 'isiNdebele',
      'Visual Arts', 'Music', 'Drama', 'Dance Studies', 'Design', 'Geography',
      'History', 'Tourism', 'Consumer Studies', 'Agricultural Sciences',
      'Agricultural Management Practices', 'Agricultural Technology', 'Civil Technology',
      'Electrical Technology', 'Mechanical Technology', 'Engineering Graphics and Design',
      'Hospitality Studies', 'Religion Studies', 'Philosophy'
    ]);
    
    // Common interest categories
    this.validInterests = new Set([
      'technology', 'healthcare', 'business', 'education', 'engineering',
      'creative arts', 'science', 'finance', 'sports', 'environment',
      'research', 'innovation', 'leadership', 'entrepreneurship', 'design',
      'media', 'communications', 'law', 'social work', 'agriculture',
      'tourism', 'hospitality', 'manufacturing', 'construction', 'transport'
    ]);
  }

  /**
   * Validate and sanitize a complete student profile
   * @param {Object} profile - Raw student profile
   * @returns {Object} - Validation result with sanitized profile
   */
  validateProfile(profile) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitizedProfile: null,
      edgeCases: []
    };

    try {
      // Handle null/undefined profile
      if (!profile || typeof profile !== 'object') {
        result.isValid = false;
        result.errors.push('Profile is null, undefined, or not an object');
        result.edgeCases.push('empty_profile');
        return this._createEmptyProfileFallback(result);
      }

      // Start with a clean profile
      const sanitized = {};

      // Validate and sanitize grade
      const gradeValidation = this.validateGrade(profile.grade);
      if (gradeValidation.isValid) {
        sanitized.grade = gradeValidation.sanitizedValue;
      } else {
        result.errors.push(...gradeValidation.errors);
        result.warnings.push(...gradeValidation.warnings);
        if (gradeValidation.fallbackValue !== null) {
          sanitized.grade = gradeValidation.fallbackValue;
          result.edgeCases.push('grade_fallback');
        }
      }

      // Validate and sanitize subjects
      const subjectsValidation = this.validateSubjects(profile.subjects);
      if (subjectsValidation.isValid) {
        sanitized.subjects = subjectsValidation.sanitizedValue;
      } else {
        result.errors.push(...subjectsValidation.errors);
        result.warnings.push(...subjectsValidation.warnings);
        if (subjectsValidation.fallbackValue !== null) {
          sanitized.subjects = subjectsValidation.fallbackValue;
          result.edgeCases.push('subjects_fallback');
        }
      }

      // Validate and sanitize interests
      const interestsValidation = this.validateInterests(profile.interests);
      if (interestsValidation.isValid) {
        sanitized.interests = interestsValidation.sanitizedValue;
      } else {
        result.warnings.push(...interestsValidation.warnings);
        sanitized.interests = interestsValidation.fallbackValue || [];
      }

      // Validate and sanitize marks
      const marksValidation = this.validateMarks(profile.marks, sanitized.subjects);
      if (marksValidation.isValid) {
        sanitized.marks = marksValidation.sanitizedValue;
      } else {
        result.warnings.push(...marksValidation.warnings);
        sanitized.marks = marksValidation.fallbackValue || {};
      }

      // Validate and sanitize career preferences
      const preferencesValidation = this.validateCareerPreferences(profile.careerPreferences);
      if (preferencesValidation.isValid) {
        sanitized.careerPreferences = preferencesValidation.sanitizedValue;
      } else {
        result.warnings.push(...preferencesValidation.warnings);
        sanitized.careerPreferences = preferencesValidation.fallbackValue;
      }

      // Validate optional fields
      if (profile.mathMark !== undefined) {
        const mathMarkValidation = this.validateMathMark(profile.mathMark);
        if (mathMarkValidation.isValid) {
          sanitized.mathMark = mathMarkValidation.sanitizedValue;
        }
      }

      if (profile.mathType !== undefined) {
        const mathTypeValidation = this.validateMathType(profile.mathType);
        if (mathTypeValidation.isValid) {
          sanitized.mathType = mathTypeValidation.sanitizedValue;
        }
      }

      // Copy other safe fields
      if (profile.province && typeof profile.province === 'string') {
        sanitized.province = profile.province.trim();
      }

      if (profile.budgetLimit && typeof profile.budgetLimit === 'string') {
        sanitized.budgetLimit = profile.budgetLimit.toLowerCase().trim();
      }

      // Final validation checks
      const finalValidation = this._performFinalValidation(sanitized);
      result.errors.push(...finalValidation.errors);
      result.warnings.push(...finalValidation.warnings);
      result.edgeCases.push(...finalValidation.edgeCases);

      // Determine overall validity
      result.isValid = result.errors.length === 0;
      result.sanitizedProfile = sanitized;

      if (this.enableLogging) {
        this._logValidationResult(result);
      }

      return result;

    } catch (error) {
      result.isValid = false;
      result.errors.push(`Validation error: ${error.message}`);
      result.edgeCases.push('validation_exception');
      return this._createEmptyProfileFallback(result);
    }
  }

  /**
   * Validate grade level
   * @param {*} grade - Grade value to validate
   * @returns {Object} - Validation result
   */
  validateGrade(grade) {
    const result = {
      isValid: false,
      errors: [],
      warnings: [],
      sanitizedValue: null,
      fallbackValue: null
    };

    // Handle missing grade
    if (grade === undefined || grade === null) {
      result.warnings.push('Grade not provided, using default Grade 11');
      result.fallbackValue = 11;
      return result;
    }

    // Convert to number if string
    let numericGrade = grade;
    if (typeof grade === 'string') {
      numericGrade = parseInt(grade.trim(), 10);
      if (isNaN(numericGrade)) {
        result.errors.push(`Invalid grade format: "${grade}"`);
        result.fallbackValue = 11;
        return result;
      }
    }

    // Validate numeric grade
    if (typeof numericGrade !== 'number' || !Number.isInteger(numericGrade)) {
      result.errors.push(`Grade must be an integer, got: ${typeof grade}`);
      result.fallbackValue = 11;
      return result;
    }

    // Check supported grades
    if (!this.supportedGrades.includes(numericGrade)) {
      result.errors.push(`Unsupported grade level: ${numericGrade}. Supported grades: ${this.supportedGrades.join(', ')}`);
      
      // Find closest supported grade
      const closest = this.supportedGrades.reduce((prev, curr) => 
        Math.abs(curr - numericGrade) < Math.abs(prev - numericGrade) ? curr : prev
      );
      result.fallbackValue = closest;
      result.warnings.push(`Using closest supported grade: ${closest}`);
      return result;
    }

    result.isValid = true;
    result.sanitizedValue = numericGrade;
    return result;
  }

  /**
   * Validate subjects array
   * @param {*} subjects - Subjects to validate
   * @returns {Object} - Validation result
   */
  validateSubjects(subjects) {
    const result = {
      isValid: false,
      errors: [],
      warnings: [],
      sanitizedValue: null,
      fallbackValue: null
    };

    // Handle missing subjects
    if (!subjects) {
      result.errors.push('No subjects provided');
      result.fallbackValue = ['Mathematics', 'English'];
      return result;
    }

    // Ensure array
    if (!Array.isArray(subjects)) {
      result.errors.push(`Subjects must be an array, got: ${typeof subjects}`);
      result.fallbackValue = ['Mathematics', 'English'];
      return result;
    }

    // Handle empty array
    if (subjects.length === 0) {
      result.errors.push('Subjects array is empty');
      result.fallbackValue = ['Mathematics', 'English'];
      return result;
    }

    // Validate and sanitize each subject
    const sanitized = [];
    const invalid = [];
    const duplicates = new Set();

    for (const subject of subjects) {
      if (typeof subject !== 'string') {
        invalid.push(`Non-string subject: ${subject}`);
        continue;
      }

      const trimmed = subject.trim();
      if (trimmed.length === 0) {
        invalid.push('Empty subject string');
        continue;
      }

      // Check for duplicates
      if (sanitized.includes(trimmed)) {
        duplicates.add(trimmed);
        continue;
      }

      // Validate against known subjects (with fuzzy matching)
      const matchedSubject = this._findBestSubjectMatch(trimmed);
      if (matchedSubject) {
        sanitized.push(matchedSubject);
        if (matchedSubject !== trimmed) {
          result.warnings.push(`Subject "${trimmed}" corrected to "${matchedSubject}"`);
        }
      } else {
        // Allow unknown subjects but warn
        sanitized.push(trimmed);
        result.warnings.push(`Unknown subject: "${trimmed}"`);
      }
    }

    // Report issues
    if (invalid.length > 0) {
      result.warnings.push(`Invalid subjects ignored: ${invalid.join(', ')}`);
    }

    if (duplicates.size > 0) {
      result.warnings.push(`Duplicate subjects removed: ${Array.from(duplicates).join(', ')}`);
    }

    // Check subject count limits
    if (sanitized.length > this.maxSubjects) {
      result.warnings.push(`Too many subjects (${sanitized.length}), limiting to ${this.maxSubjects}`);
      sanitized.splice(this.maxSubjects);
    }

    // Ensure minimum subjects
    if (sanitized.length === 0) {
      result.errors.push('No valid subjects after validation');
      result.fallbackValue = ['Mathematics', 'English'];
      return result;
    }

    result.isValid = true;
    result.sanitizedValue = sanitized;
    return result;
  }

  /**
   * Validate interests array
   * @param {*} interests - Interests to validate
   * @returns {Object} - Validation result
   */
  validateInterests(interests) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitizedValue: [],
      fallbackValue: []
    };

    // Interests are optional
    if (!interests) {
      return result;
    }

    // Ensure array
    if (!Array.isArray(interests)) {
      result.warnings.push(`Interests must be an array, got: ${typeof interests}`);
      return result;
    }

    // Validate and sanitize each interest
    const sanitized = [];
    const invalid = [];

    for (const interest of interests) {
      if (typeof interest !== 'string') {
        invalid.push(`Non-string interest: ${interest}`);
        continue;
      }

      const trimmed = interest.toLowerCase().trim();
      if (trimmed.length === 0) {
        invalid.push('Empty interest string');
        continue;
      }

      // Check for duplicates
      if (sanitized.includes(trimmed)) {
        continue;
      }

      // Validate against known interests (with fuzzy matching)
      const matchedInterest = this._findBestInterestMatch(trimmed);
      if (matchedInterest) {
        sanitized.push(matchedInterest);
        if (matchedInterest !== trimmed) {
          result.warnings.push(`Interest "${interest}" normalized to "${matchedInterest}"`);
        }
      } else {
        // Allow unknown interests but limit length
        if (trimmed.length <= 50) {
          sanitized.push(trimmed);
        } else {
          result.warnings.push(`Interest too long, ignored: "${interest}"`);
        }
      }
    }

    // Report issues
    if (invalid.length > 0) {
      result.warnings.push(`Invalid interests ignored: ${invalid.join(', ')}`);
    }

    // Check interest count limits
    if (sanitized.length > this.maxInterests) {
      result.warnings.push(`Too many interests (${sanitized.length}), limiting to ${this.maxInterests}`);
      sanitized.splice(this.maxInterests);
    }

    result.sanitizedValue = sanitized;
    return result;
  }

  /**
   * Validate marks object
   * @param {*} marks - Marks to validate
   * @param {Array} subjects - Valid subjects for cross-validation
   * @returns {Object} - Validation result
   */
  validateMarks(marks, subjects = []) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitizedValue: {},
      fallbackValue: {}
    };

    // Marks are optional
    if (!marks) {
      return result;
    }

    // Ensure object
    if (typeof marks !== 'object' || Array.isArray(marks)) {
      result.warnings.push(`Marks must be an object, got: ${typeof marks}`);
      return result;
    }

    const sanitized = {};
    const subjectSet = new Set(subjects);

    for (const [subject, mark] of Object.entries(marks)) {
      // Validate subject
      if (!subjectSet.has(subject)) {
        result.warnings.push(`Mark provided for subject not in subjects list: "${subject}"`);
      }

      // Validate mark value
      let numericMark = mark;
      if (typeof mark === 'string') {
        numericMark = parseFloat(mark.trim());
        if (isNaN(numericMark)) {
          result.warnings.push(`Invalid mark for ${subject}: "${mark}"`);
          continue;
        }
      }

      if (typeof numericMark !== 'number') {
        result.warnings.push(`Mark for ${subject} must be a number, got: ${typeof mark}`);
        continue;
      }

      // Validate mark range (0-100)
      if (numericMark < 0 || numericMark > 100) {
        result.warnings.push(`Mark for ${subject} out of range (0-100): ${numericMark}`);
        continue;
      }

      sanitized[subject] = Math.round(numericMark);
    }

    result.sanitizedValue = sanitized;
    return result;
  }

  /**
   * Validate career preferences
   * @param {*} preferences - Career preferences to validate
   * @returns {Object} - Validation result
   */
  validateCareerPreferences(preferences) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitizedValue: null,
      fallbackValue: null
    };

    // Career preferences are optional
    if (!preferences) {
      return result;
    }

    if (typeof preferences !== 'string') {
      result.warnings.push(`Career preferences must be a string, got: ${typeof preferences}`);
      return result;
    }

    const trimmed = preferences.trim();
    
    // Check length limits
    if (trimmed.length === 0) {
      result.warnings.push('Empty career preferences');
      return result;
    }

    if (trimmed.length > 1000) {
      result.warnings.push(`Career preferences too long (${trimmed.length} chars), truncating to 1000`);
      result.sanitizedValue = trimmed.substring(0, 1000);
      return result;
    }

    result.sanitizedValue = trimmed;
    return result;
  }

  /**
   * Validate math mark
   * @param {*} mathMark - Math mark to validate
   * @returns {Object} - Validation result
   */
  validateMathMark(mathMark) {
    const result = {
      isValid: false,
      errors: [],
      warnings: [],
      sanitizedValue: null,
      fallbackValue: null
    };

    let numericMark = mathMark;
    if (typeof mathMark === 'string') {
      numericMark = parseFloat(mathMark.trim());
      if (isNaN(numericMark)) {
        result.warnings.push(`Invalid math mark: "${mathMark}"`);
        return result;
      }
    }

    if (typeof numericMark !== 'number') {
      result.warnings.push(`Math mark must be a number, got: ${typeof mathMark}`);
      return result;
    }

    if (numericMark < 0 || numericMark > 100) {
      result.warnings.push(`Math mark out of range (0-100): ${numericMark}`);
      return result;
    }

    result.isValid = true;
    result.sanitizedValue = Math.round(numericMark);
    return result;
  }

  /**
   * Validate math type
   * @param {*} mathType - Math type to validate
   * @returns {Object} - Validation result
   */
  validateMathType(mathType) {
    const result = {
      isValid: false,
      errors: [],
      warnings: [],
      sanitizedValue: null,
      fallbackValue: null
    };

    if (typeof mathType !== 'string') {
      result.warnings.push(`Math type must be a string, got: ${typeof mathType}`);
      return result;
    }

    const normalized = mathType.trim().toLowerCase();
    const validTypes = ['mathematics', 'mathematical literacy'];
    
    if (validTypes.includes(normalized)) {
      result.isValid = true;
      result.sanitizedValue = normalized === 'mathematics' ? 'Mathematics' : 'Mathematical Literacy';
    } else {
      result.warnings.push(`Invalid math type: "${mathType}"`);
    }

    return result;
  }

  /**
   * Find best matching subject using fuzzy matching
   * @private
   */
  _findBestSubjectMatch(subject) {
    const normalized = subject.toLowerCase().trim();
    
    // Exact match
    for (const validSubject of this.validSubjects) {
      if (validSubject.toLowerCase() === normalized) {
        return validSubject;
      }
    }

    // Partial match
    for (const validSubject of this.validSubjects) {
      if (validSubject.toLowerCase().includes(normalized) || 
          normalized.includes(validSubject.toLowerCase())) {
        return validSubject;
      }
    }

    // Common abbreviations and alternatives
    const alternatives = {
      'maths': 'Mathematics',
      'math': 'Mathematics',
      'mathlit': 'Mathematical Literacy',
      'physics': 'Physical Sciences',
      'biology': 'Life Sciences',
      'it': 'Information Technology',
      'cat': 'Computer Applications Technology',
      'business': 'Business Studies',
      'acc': 'Accounting',
      'econ': 'Economics',
      'geo': 'Geography',
      'hist': 'History',
      'art': 'Visual Arts',
      'arts': 'Visual Arts'
    };

    return alternatives[normalized] || null;
  }

  /**
   * Find best matching interest using fuzzy matching
   * @private
   */
  _findBestInterestMatch(interest) {
    const normalized = interest.toLowerCase().trim();
    
    // Exact match
    if (this.validInterests.has(normalized)) {
      return normalized;
    }

    // Partial match
    for (const validInterest of this.validInterests) {
      if (validInterest.includes(normalized) || normalized.includes(validInterest)) {
        return validInterest;
      }
    }

    // Common alternatives
    const alternatives = {
      'tech': 'technology',
      'medical': 'healthcare',
      'medicine': 'healthcare',
      'health': 'healthcare',
      'teaching': 'education',
      'art': 'creative arts',
      'arts': 'creative arts',
      'money': 'finance',
      'banking': 'finance',
      'sport': 'sports',
      'nature': 'environment',
      'green': 'environment',
      'study': 'research',
      'studies': 'research',
      'lead': 'leadership',
      'manage': 'leadership',
      'start': 'entrepreneurship',
      'startup': 'entrepreneurship'
    };

    return alternatives[normalized] || null;
  }

  /**
   * Perform final validation checks on sanitized profile
   * @private
   */
  _performFinalValidation(profile) {
    const result = {
      errors: [],
      warnings: [],
      edgeCases: []
    };

    // Check for minimal viable profile
    if (!profile.grade && (!profile.subjects || profile.subjects.length === 0)) {
      result.errors.push('Profile lacks both grade and subjects - insufficient for career matching');
      result.edgeCases.push('insufficient_data');
    }

    // Check for unusual subject combinations
    if (profile.subjects && profile.subjects.length > 0) {
      const subjectCategories = this._categorizeSubjects(profile.subjects);
      
      if (subjectCategories.size > 4) {
        result.warnings.push('Unusually diverse subject combination detected');
        result.edgeCases.push('unusual_subject_combination');
      }

      // Check for conflicting math subjects
      const hasMath = profile.subjects.includes('Mathematics');
      const hasMathLit = profile.subjects.includes('Mathematical Literacy');
      if (hasMath && hasMathLit) {
        result.warnings.push('Both Mathematics and Mathematical Literacy selected - this is unusual');
        result.edgeCases.push('conflicting_math_subjects');
      }
    }

    // Check for grade-subject mismatches
    if (profile.grade && profile.subjects) {
      const advancedSubjects = ['Physical Sciences', 'Life Sciences', 'Mathematics'];
      const hasAdvanced = profile.subjects.some(s => advancedSubjects.includes(s));
      
      if (profile.grade === 10 && hasAdvanced) {
        result.warnings.push('Grade 10 student with advanced subjects - early specialization detected');
        result.edgeCases.push('early_specialization');
      }
    }

    return result;
  }

  /**
   * Categorize subjects into academic areas
   * @private
   */
  _categorizeSubjects(subjects) {
    const categories = new Set();
    
    const categoryMap = {
      'STEM': ['Mathematics', 'Mathematical Literacy', 'Physical Sciences', 'Life Sciences', 'Information Technology', 'Computer Applications Technology'],
      'Business': ['Business Studies', 'Accounting', 'Economics'],
      'Languages': ['English', 'Afrikaans', 'isiZulu', 'isiXhosa', 'Sesotho', 'Setswana', 'Sepedi'],
      'Creative': ['Visual Arts', 'Music', 'Drama', 'Dance Studies', 'Design'],
      'Social': ['Geography', 'History', 'Tourism', 'Religion Studies', 'Philosophy'],
      'Practical': ['Consumer Studies', 'Agricultural Sciences', 'Hospitality Studies']
    };

    for (const subject of subjects) {
      for (const [category, categorySubjects] of Object.entries(categoryMap)) {
        if (categorySubjects.includes(subject)) {
          categories.add(category);
          break;
        }
      }
    }

    return categories;
  }

  /**
   * Create fallback profile for completely invalid input
   * @private
   */
  _createEmptyProfileFallback(result) {
    result.sanitizedProfile = {
      grade: 11,
      subjects: ['Mathematics', 'English'],
      interests: [],
      marks: {},
      careerPreferences: null
    };
    result.edgeCases.push('empty_profile_fallback');
    return result;
  }

  /**
   * Log validation results
   * @private
   */
  _logValidationResult(result) {
    if (result.errors.length > 0) {
      console.log('🔍 Input Validation Errors:', result.errors);
    }
    
    if (result.warnings.length > 0) {
      console.log('⚠️ Input Validation Warnings:', result.warnings);
    }
    
    if (result.edgeCases.length > 0) {
      console.log('🎯 Edge Cases Detected:', result.edgeCases);
    }
    
    console.log(`✅ Profile Validation: ${result.isValid ? 'VALID' : 'INVALID'} (${result.errors.length} errors, ${result.warnings.length} warnings)`);
  }
}

/**
 * Quick validation function for simple use cases
 * @param {Object} profile - Student profile to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export function validateStudentProfile(profile, options = {}) {
  const validator = new InputValidator(options);
  return validator.validateProfile(profile);
}

export default InputValidator;