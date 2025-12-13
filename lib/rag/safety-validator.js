// lib/rag/safety-validator.js
// Safety Validation for Enhanced RAG Careers
// Ensures all enhanced careers meet safety and compliance requirements

/**
 * Safety validation utility for enhanced RAG careers
 * Ensures compliance with CAG, POPIA, and verification requirements
 */
export class SafetyValidator {
  constructor(options = {}) {
    this.options = {
      enableLogging: true,
      strictMode: false,
      requireVerificationFooter: true,
      maxCareerTitleLength: 100,
      minCareerDescriptionLength: 20,
      ...options
    };
    
    this.validationCounts = {
      passed: 0,
      failed: 0,
      warnings: 0
    };
  }

  /**
   * Validate a single career for safety compliance
   * @param {Object} career - Career object to validate
   * @param {Object} context - Validation context
   * @returns {Object} - Validation result
   */
  validateCareer(career, context = {}) {
    const validationResult = {
      isValid: true,
      warnings: [],
      errors: [],
      sanitizedCareer: null,
      metadata: {
        source: career.source || 'unknown',
        validatedAt: Date.now(),
        context
      }
    };

    try {
      // 1. Basic structure validation
      this._validateBasicStructure(career, validationResult);
      
      // 2. Content safety validation
      this._validateContentSafety(career, validationResult);
      
      // 3. POPIA compliance validation
      this._validatePOPIACompliance(career, validationResult);
      
      // 4. CAG compatibility validation
      this._validateCAGCompatibility(career, validationResult);
      
      // 5. Verification requirements validation
      this._validateVerificationRequirements(career, validationResult);
      
      // 6. Create sanitized career if valid
      if (validationResult.isValid) {
        validationResult.sanitizedCareer = this._sanitizeCareer(career);
      }
      
      // Update statistics
      if (validationResult.isValid) {
        this.validationCounts.passed++;
      } else {
        this.validationCounts.failed++;
      }
      
      if (validationResult.warnings.length > 0) {
        this.validationCounts.warnings++;
      }
      
      return validationResult;
      
    } catch (error) {
      console.error('[SafetyValidator] Validation error:', error);
      validationResult.isValid = false;
      validationResult.errors.push(`Validation failed: ${error.message}`);
      this.validationCounts.failed++;
      return validationResult;
    }
  }

  /**
   * Validate multiple careers for safety compliance
   * @param {Array} careers - Array of career objects
   * @param {Object} context - Validation context
   * @returns {Object} - Batch validation result
   */
  validateCareers(careers, context = {}) {
    const batchResult = {
      validCareers: [],
      invalidCareers: [],
      warnings: [],
      summary: {
        total: careers.length,
        valid: 0,
        invalid: 0,
        warnings: 0
      }
    };

    careers.forEach((career, index) => {
      const careerContext = { ...context, careerIndex: index };
      const validation = this.validateCareer(career, careerContext);
      
      if (validation.isValid) {
        batchResult.validCareers.push(validation.sanitizedCareer);
        batchResult.summary.valid++;
      } else {
        batchResult.invalidCareers.push({
          career,
          errors: validation.errors,
          index
        });
        batchResult.summary.invalid++;
      }
      
      if (validation.warnings.length > 0) {
        batchResult.warnings.push(...validation.warnings.map(w => ({
          ...w,
          careerIndex: index,
          careerTitle: career.title
        })));
        batchResult.summary.warnings++;
      }
    });

    if (this.options.enableLogging) {
      console.log(`[SafetyValidator] Batch validation: ${batchResult.summary.valid}/${batchResult.summary.total} careers valid`);
      if (batchResult.summary.warnings > 0) {
        console.log(`[SafetyValidator] ${batchResult.summary.warnings} warnings generated`);
      }
    }

    return batchResult;
  }

  /**
   * Validate that enhanced careers are CAG-compatible
   * @param {Array} careers - Enhanced careers
   * @param {Object} originalData - Original RAG data
   * @returns {Object} - CAG compatibility result
   */
  validateCAGCompatibility(careers, originalData = {}) {
    const cagValidation = {
      isCompatible: true,
      issues: [],
      recommendations: [],
      enhancedData: null
    };

    try {
      // Ensure careers have required fields for CAG processing
      careers.forEach((career, index) => {
        if (!career.title) {
          cagValidation.issues.push({
            type: 'missing_title',
            careerIndex: index,
            severity: 'error',
            message: 'Career missing required title field'
          });
          cagValidation.isCompatible = false;
        }
        
        if (!career.description) {
          cagValidation.issues.push({
            type: 'missing_description',
            careerIndex: index,
            severity: 'warning',
            message: 'Career missing description field'
          });
        }
        
        if (!career.source) {
          cagValidation.issues.push({
            type: 'missing_source',
            careerIndex: index,
            severity: 'warning',
            message: 'Career missing source tracking'
          });
        }
      });
      
      // Ensure verification footer requirements are met
      if (this.options.requireVerificationFooter) {
        const hasVerificationGuidance = careers.some(career => 
          career.description && career.description.includes('verify')
        );
        
        if (!hasVerificationGuidance) {
          cagValidation.recommendations.push({
            type: 'add_verification_footer',
            message: 'Consider adding verification guidance to career descriptions'
          });
        }
      }
      
      // Create enhanced data structure for CAG
      cagValidation.enhancedData = {
        careers: careers.map(career => ({
          ...career,
          cagMetadata: {
            validated: true,
            source: career.source || 'enhanced_rag',
            confidence: career.confidence || 0.5,
            safetyChecked: true
          }
        })),
        originalData,
        validationTimestamp: Date.now()
      };
      
    } catch (error) {
      console.error('[SafetyValidator] CAG compatibility check failed:', error);
      cagValidation.isCompatible = false;
      cagValidation.issues.push({
        type: 'validation_error',
        severity: 'error',
        message: `CAG compatibility check failed: ${error.message}`
      });
    }

    return cagValidation;
  }

  /**
   * Validate basic career structure
   * @private
   */
  _validateBasicStructure(career, result) {
    // Check required fields
    if (!career.title || typeof career.title !== 'string') {
      result.errors.push('Career must have a valid title');
      result.isValid = false;
    }
    
    if (!career.description || typeof career.description !== 'string') {
      result.errors.push('Career must have a valid description');
      result.isValid = false;
    }
    
    // Check field lengths
    if (career.title && career.title.length > this.options.maxCareerTitleLength) {
      result.warnings.push({
        type: 'title_too_long',
        message: `Career title exceeds ${this.options.maxCareerTitleLength} characters`,
        value: career.title.length
      });
    }
    
    if (career.description && career.description.length < this.options.minCareerDescriptionLength) {
      result.warnings.push({
        type: 'description_too_short',
        message: `Career description below ${this.options.minCareerDescriptionLength} characters`,
        value: career.description.length
      });
    }
    
    // Check for required metadata
    if (!career.source) {
      result.warnings.push({
        type: 'missing_source',
        message: 'Career missing source tracking information'
      });
    }
  }

  /**
   * Validate content safety
   * @private
   */
  _validateContentSafety(career, result) {
    const unsafePatterns = [
      /\b(hack|crack|illegal|fraud|scam)\b/i,
      /\b(adult|explicit|inappropriate)\b/i,
      /\b(violence|weapon|drug)\b/i
    ];
    
    const contentToCheck = `${career.title} ${career.description}`.toLowerCase();
    
    unsafePatterns.forEach((pattern, index) => {
      if (pattern.test(contentToCheck)) {
        result.errors.push(`Career content contains potentially unsafe material (pattern ${index + 1})`);
        result.isValid = false;
      }
    });
    
    // Check for appropriate professional language
    const unprofessionalPatterns = [
      /\b(awesome|amazing|incredible|unbelievable)\b/i,
      /\b(easy money|get rich|no experience needed)\b/i
    ];
    
    unprofessionalPatterns.forEach(pattern => {
      if (pattern.test(contentToCheck)) {
        result.warnings.push({
          type: 'unprofessional_language',
          message: 'Career content contains unprofessional or promotional language'
        });
      }
    });
  }

  /**
   * Validate POPIA compliance
   * @private
   */
  _validatePOPIACompliance(career, result) {
    // Check for potential PII in career content
    const piiPatterns = [
      /\b\d{13}\b/, // SA ID numbers
      /\b\d{10}\b/, // Phone numbers
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email addresses
      /\b\d{1,5}\s+[A-Za-z\s]+\s+(Street|Road|Avenue|Drive)\b/i // Addresses
    ];
    
    const contentToCheck = `${career.title} ${career.description}`;
    
    piiPatterns.forEach((pattern, index) => {
      if (pattern.test(contentToCheck)) {
        result.errors.push(`Career content may contain PII (pattern ${index + 1})`);
        result.isValid = false;
      }
    });
    
    // Ensure no personal references
    const personalPatterns = [
      /\b(my|mine|personal|private)\b/i,
      /\b(john|jane|smith|doe)\b/i // Common placeholder names
    ];
    
    personalPatterns.forEach(pattern => {
      if (pattern.test(contentToCheck)) {
        result.warnings.push({
          type: 'personal_reference',
          message: 'Career content may contain personal references'
        });
      }
    });
  }

  /**
   * Validate CAG compatibility
   * @private
   */
  _validateCAGCompatibility(career, result) {
    // Ensure career has fields required by CAG
    const requiredFields = ['title', 'description'];
    const recommendedFields = ['category', 'source', 'confidence'];
    
    requiredFields.forEach(field => {
      if (!career[field]) {
        result.errors.push(`Career missing required field for CAG: ${field}`);
        result.isValid = false;
      }
    });
    
    recommendedFields.forEach(field => {
      if (!career[field]) {
        result.warnings.push({
          type: 'missing_recommended_field',
          message: `Career missing recommended field for CAG: ${field}`
        });
      }
    });
    
    // Check confidence levels
    if (career.confidence !== undefined) {
      if (career.confidence < 0 || career.confidence > 1) {
        result.warnings.push({
          type: 'invalid_confidence',
          message: 'Career confidence should be between 0 and 1',
          value: career.confidence
        });
      }
    }
  }

  /**
   * Validate verification requirements
   * @private
   */
  _validateVerificationRequirements(career, result) {
    if (!this.options.requireVerificationFooter) return;
    
    // Check if career description includes verification guidance
    const verificationKeywords = [
      'verify', 'confirm', 'check', 'validate', 'counselor', 'institution'
    ];
    
    const hasVerificationGuidance = verificationKeywords.some(keyword =>
      career.description && career.description.toLowerCase().includes(keyword)
    );
    
    if (!hasVerificationGuidance) {
      result.warnings.push({
        type: 'missing_verification_guidance',
        message: 'Career description should include verification guidance'
      });
    }
  }

  /**
   * Sanitize career for safe output
   * @private
   */
  _sanitizeCareer(career) {
    return {
      title: this._sanitizeText(career.title),
      description: this._sanitizeText(career.description),
      category: career.category || 'General',
      source: career.source || 'enhanced_rag',
      confidence: Math.max(0, Math.min(1, career.confidence || 0.5)),
      
      // Preserve other safe fields
      education: career.education,
      qualifications: career.qualifications,
      subjects: career.subjects,
      salaryRange: career.salaryRange,
      outlook: career.outlook,
      demand: career.demand,
      
      // Add safety metadata
      safetyValidated: true,
      validatedAt: Date.now(),
      
      // Preserve original metadata if safe
      metadata: career.metadata,
      filterMetadata: career.filterMetadata
    };
  }

  /**
   * Sanitize text content
   * @private
   */
  _sanitizeText(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s.,!?()-]/g, '') // Remove special characters
      .substring(0, 1000); // Limit length
  }

  /**
   * Get validation statistics
   * @returns {Object} - Validation statistics
   */
  getValidationStats() {
    const total = this.validationCounts.passed + this.validationCounts.failed;
    
    return {
      ...this.validationCounts,
      total,
      passRate: total > 0 ? (this.validationCounts.passed / total) * 100 : 0,
      warningRate: total > 0 ? (this.validationCounts.warnings / total) * 100 : 0
    };
  }

  /**
   * Reset validation statistics
   */
  resetStats() {
    this.validationCounts = {
      passed: 0,
      failed: 0,
      warnings: 0
    };
  }
}

// Export singleton instance for convenience
export const safetyValidator = new SafetyValidator();

// Export class for custom instances
export default SafetyValidator;