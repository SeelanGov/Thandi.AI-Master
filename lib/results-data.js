/**
 * Unified Results Data Class
 * Single source of truth for all results data processing
 * Handles parsing, validation, and error tracking
 */

export class ResultsData {
  constructor(rawResponse, grade, metadata = {}) {
    this.raw = rawResponse;
    this.grade = grade;
    this.metadata = metadata;
    this.parsed = null;
    this.validated = false;
    this.errors = [];
    this.warnings = [];
    this.extractedAt = null;
  }

  /**
   * Parse and validate results data in one step
   * Returns structured data with validation status
   */
  async parse() {
    try {
      console.log('🔄 ResultsData: Starting parse for grade', this.grade);
      
      // Dynamic import of parser - fix path for build
      const { parseResults } = await import('../app/results/services/resultsParser.js');
      
      // Parse the raw response
      this.parsed = parseResults(this.raw, this.grade);
      this.extractedAt = new Date().toISOString();
      
      // Validate the parsed data
      this.validated = this.validateParsedData();
      
      // Add metadata
      this.addExtractionMetadata();
      
      console.log('✅ ResultsData: Parse completed successfully');
      console.log('📊 Extracted:', {
        programs: this.parsed.programs?.length || 0,
        bursaries: this.parsed.bursaries?.length || 0,
        actionItems: this.parsed.actionPlan?.actionItems?.length || 0,
        alternatives: this.parsed.alternativeOptions?.length || 0
      });
      
      return this.parsed;
      
    } catch (error) {
      console.error('❌ ResultsData: Parse failed:', error);
      this.errors.push({
        type: 'PARSE_ERROR',
        message: error.message,
        timestamp: new Date().toISOString()
      });
      
      // Create fallback data
      this.parsed = this.createFallbackData();
      this.validated = false;
      this.extractedAt = new Date().toISOString();
      
      return this.parsed;
    }
  }

  /**
   * Validate that all required fields are present and properly structured
   */
  validateParsedData() {
    if (!this.parsed) {
      this.warnings.push('No parsed data available');
      return false;
    }

    const validations = [
      {
        check: Array.isArray(this.parsed.programs),
        message: 'Programs must be an array'
      },
      {
        check: Array.isArray(this.parsed.bursaries),
        message: 'Bursaries must be an array'
      },
      {
        check: this.parsed.actionPlan && Array.isArray(this.parsed.actionPlan.actionItems),
        message: 'Action plan must have actionItems array'
      },
      {
        check: Array.isArray(this.parsed.alternativeOptions),
        message: 'Alternative options must be an array'
      }
    ];

    let isValid = true;
    validations.forEach(validation => {
      if (!validation.check) {
        this.warnings.push(validation.message);
        isValid = false;
      }
    });

    // Check for empty content
    const totalItems = 
      (this.parsed.programs?.length || 0) +
      (this.parsed.bursaries?.length || 0) +
      (this.parsed.actionPlan?.actionItems?.length || 0) +
      (this.parsed.alternativeOptions?.length || 0);

    if (totalItems === 0) {
      this.warnings.push('No structured content extracted from response');
      isValid = false;
    }

    return isValid;
  }

  /**
   * Create fallback data when parsing fails
   */
  createFallbackData() {
    const fallbackMessage = `Content extraction failed for Grade ${this.grade}. Please verify this information with your school counselor.`;
    
    return {
      programs: [{
        name: 'Content Extraction Failed',
        university: 'Please consult your school counselor',
        apsRequired: null,
        admissionChance: null,
        applicationDeadline: 'Unknown',
        description: fallbackMessage
      }],
      bursaries: [{
        name: 'Content Extraction Failed',
        provider: 'Please consult your school counselor',
        amount: 'Unknown',
        eligibilityMatch: 0,
        applicationDeadline: 'Unknown',
        requirements: ['Consult school counselor for accurate information']
      }],
      actionPlan: {
        actionItems: [
          'Speak with your school counselor immediately',
          'Get accurate career guidance from qualified professionals',
          'Do not rely on this AI-generated content'
        ],
        timeline: 'Immediate',
        priority: 'CRITICAL'
      },
      alternativeOptions: [{
        title: 'Consult School Counselor',
        description: 'Get proper career guidance from qualified professionals',
        type: 'Professional Guidance'
      }],
      headerData: {
        apsScore: null,
        universityEligible: false,
        gradeLevel: parseInt(this.grade),
        academicYear: new Date().getFullYear()
      },
      gradeContext: {
        grade: parseInt(this.grade),
        phase: 'Content extraction failed',
        focus: 'Consult school counselor'
      },
      warnings: ['CRITICAL: Content extraction failed - consult school counselor'],
      errors: this.errors
    };
  }

  /**
   * Add extraction metadata to parsed data
   */
  addExtractionMetadata() {
    if (!this.parsed) return;

    this.parsed.extractionMetadata = {
      extractedAt: this.extractedAt,
      grade: this.grade,
      contentLength: this.raw?.length || 0,
      sectionsFound: this.countSections(),
      validated: this.validated,
      warnings: this.warnings,
      errors: this.errors,
      originalMetadata: this.metadata
    };
  }

  /**
   * Count extracted sections for validation
   */
  countSections() {
    if (!this.parsed) return 0;
    
    return (
      (this.parsed.programs?.length || 0) +
      (this.parsed.bursaries?.length || 0) +
      (this.parsed.actionPlan?.actionItems?.length || 0) +
      (this.parsed.alternativeOptions?.length || 0)
    );
  }

  /**
   * Get validation status with details
   */
  getValidationStatus() {
    return {
      validated: this.validated,
      errors: this.errors,
      warnings: this.warnings,
      sectionsFound: this.countSections(),
      extractedAt: this.extractedAt
    };
  }

  /**
   * Check if data is ready for use
   */
  isReady() {
    return this.parsed !== null && this.extractedAt !== null;
  }

  /**
   * Get formatted data for display
   */
  getFormattedData() {
    if (!this.isReady()) {
      throw new Error('Data not ready - call parse() first');
    }
    
    return {
      ...this.parsed,
      validationStatus: this.getValidationStatus()
    };
  }
}