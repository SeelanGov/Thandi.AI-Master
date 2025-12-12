// lib/rag/metadata-filter.js
// Enhanced Metadata Filter for Career Chunks
// Implements flexible career identification with multiple methods

/**
 * Enhanced metadata filter for career chunks
 * Supports multiple identification methods to increase career coverage
 */
export class MetadataFilter {
  constructor(options = {}) {
    this.options = {
      strictMode: false,
      logLevel: 'info',
      ...options
    };
  }

  /**
   * Filter career chunks using enhanced criteria
   * @param {Array} chunks - Array of career chunks to filter
   * @param {Object} options - Filtering options
   * @returns {Array} - Filtered chunks that represent careers
   */
  filter(chunks, options = {}) {
    const { logDetails = false } = options;
    
    if (!Array.isArray(chunks)) {
      console.error('[MetadataFilter] Invalid input: chunks must be an array');
      return [];
    }

    const filtered = [];
    const rejectedReasons = {};

    for (const chunk of chunks) {
      const validation = this.validateCareerChunk(chunk);
      
      if (validation.isValid) {
        // Add validation metadata to chunk
        chunk._filterMetadata = {
          identificationMethod: validation.method,
          confidence: validation.confidence,
          extractedTitle: validation.extractedTitle
        };
        filtered.push(chunk);
      } else if (logDetails) {
        rejectedReasons[validation.reason] = (rejectedReasons[validation.reason] || 0) + 1;
      }
    }

    if (logDetails) {
      console.log(`[MetadataFilter] Filtered ${chunks.length} → ${filtered.length} chunks`);
      if (Object.keys(rejectedReasons).length > 0) {
        console.log(`[MetadataFilter] Rejection reasons:`, rejectedReasons);
      }
    }

    return filtered;
  }

  /**
   * Validate if a chunk represents a career
   * @param {Object} chunk - Chunk to validate
   * @returns {Object} - Validation result with method and confidence
   */
  validateCareerChunk(chunk) {
    if (!chunk || typeof chunk !== 'object') {
      return { isValid: false, reason: 'invalid_chunk', confidence: 0 };
    }

    const metadata = chunk.chunk_metadata || {};
    const text = chunk.chunk_text || '';

    // Method 1: Primary metadata fields (highest confidence)
    const primaryResult = this._checkPrimaryMetadata(metadata);
    if (primaryResult.isValid) {
      return primaryResult;
    }

    // Method 2: Secondary metadata fields (high confidence)
    const secondaryResult = this._checkSecondaryMetadata(metadata);
    if (secondaryResult.isValid) {
      return secondaryResult;
    }

    // Method 3: Source-based identification (medium confidence)
    const sourceResult = this._checkSourceTags(metadata);
    if (sourceResult.isValid) {
      return sourceResult;
    }

    // Method 4: Text pattern matching (medium confidence)
    const textResult = this._checkTextPatterns(text);
    if (textResult.isValid) {
      return textResult;
    }

    // Method 5: Category-based identification (lower confidence)
    const categoryResult = this._checkCategoryMetadata(metadata);
    if (categoryResult.isValid) {
      return categoryResult;
    }

    // Method 6: Fallback heuristics (lowest confidence)
    if (!this.options.strictMode) {
      const heuristicResult = this._checkHeuristics(chunk);
      if (heuristicResult.isValid) {
        return heuristicResult;
      }
    }

    return { 
      isValid: false, 
      reason: 'no_career_indicators', 
      confidence: 0 
    };
  }

  /**
   * Check primary metadata fields
   * @private
   */
  _checkPrimaryMetadata(metadata) {
    // Check for explicit career identifiers
    if (metadata.career_code) {
      return {
        isValid: true,
        method: 'career_code',
        confidence: 0.95,
        extractedTitle: metadata.career_title || metadata.career_name
      };
    }

    if (metadata.career_title) {
      return {
        isValid: true,
        method: 'career_title',
        confidence: 0.90,
        extractedTitle: metadata.career_title
      };
    }

    if (metadata.career_name) {
      return {
        isValid: true,
        method: 'career_name',
        confidence: 0.90,
        extractedTitle: metadata.career_name
      };
    }

    return { isValid: false };
  }

  /**
   * Check secondary metadata fields
   * @private
   */
  _checkSecondaryMetadata(metadata) {
    // Check for career field variations
    if (metadata.career) {
      return {
        isValid: true,
        method: 'career_field',
        confidence: 0.85,
        extractedTitle: metadata.career
      };
    }

    if (metadata.occupation) {
      return {
        isValid: true,
        method: 'occupation',
        confidence: 0.80,
        extractedTitle: metadata.occupation
      };
    }

    if (metadata.job_title) {
      return {
        isValid: true,
        method: 'job_title',
        confidence: 0.80,
        extractedTitle: metadata.job_title
      };
    }

    return { isValid: false };
  }

  /**
   * Check source tags for career indicators
   * @private
   */
  _checkSourceTags(metadata) {
    const source = metadata.source || '';
    const sourceType = metadata.source_type || '';

    // ENHANCED: First check for non-career sources
    const nonCareerSources = [
      'test_question', 'question', 'bursary', 'program', 'university',
      'admission', 'general', 'faq', 'help'
    ];

    const lowerSource = source.toLowerCase();
    const lowerSourceType = sourceType.toLowerCase();

    for (const nonCareer of nonCareerSources) {
      if (lowerSource.includes(nonCareer) || lowerSourceType.includes(nonCareer)) {
        return { isValid: false };
      }
    }

    // Check for career-related sources
    const careerSources = [
      'career', 'careers', 'occupation', 'job', 'profession',
      'career_guide', 'career_info', 'job_description'
    ];

    for (const careerSource of careerSources) {
      if (lowerSource.includes(careerSource) || lowerSourceType.includes(careerSource)) {
        return {
          isValid: true,
          method: 'source_tag',
          confidence: 0.75,
          extractedTitle: this._extractTitleFromSource(source)
        };
      }
    }

    return { isValid: false };
  }

  /**
   * Check text patterns for career indicators
   * @private
   */
  _checkTextPatterns(text) {
    if (!text || typeof text !== 'string') {
      return { isValid: false };
    }

    // Pattern 1: "Career:" or "Occupation:" at start
    const careerPattern = /^(Career|Occupation|Job|Profession):\s*([A-Z][^.\n]+)/i;
    const careerMatch = text.match(careerPattern);
    if (careerMatch) {
      return {
        isValid: true,
        method: 'text_pattern_career',
        confidence: 0.80,
        extractedTitle: careerMatch[2].trim()
      };
    }

    // Pattern 2: Title at start followed by description
    const titlePattern = /^([A-Z][A-Za-z\s&-]+?)(?:\s*[-:]\s*|\n)(.{20,})/;
    const titleMatch = text.match(titlePattern);
    if (titleMatch && this._isLikelyCareerTitle(titleMatch[1])) {
      return {
        isValid: true,
        method: 'text_pattern_title',
        confidence: 0.70,
        extractedTitle: titleMatch[1].trim()
      };
    }

    // Pattern 3: Career-related keywords in first 100 characters
    const careerKeywords = [
      'engineer', 'developer', 'analyst', 'manager', 'specialist',
      'consultant', 'coordinator', 'administrator', 'technician',
      'scientist', 'researcher', 'designer', 'architect', 'teacher',
      'nurse', 'doctor', 'lawyer', 'accountant', 'therapist'
    ];

    const firstPart = text.substring(0, 100).toLowerCase();
    for (const keyword of careerKeywords) {
      if (firstPart.includes(keyword)) {
        return {
          isValid: true,
          method: 'text_pattern_keyword',
          confidence: 0.65,
          extractedTitle: this._extractTitleFromText(text)
        };
      }
    }

    return { isValid: false };
  }

  /**
   * Check category metadata for career indicators
   * @private
   */
  _checkCategoryMetadata(metadata) {
    const category = metadata.category || metadata.type || '';
    const lowerCategory = category.toLowerCase();

    // ENHANCED: First exclude non-career categories
    const nonCareerCategories = [
      'question', 'bursary', 'program', 'university', 'admission',
      'general_info', 'faq', 'help', 'guide', 'misconception'
    ];

    for (const nonCareer of nonCareerCategories) {
      if (lowerCategory.includes(nonCareer)) {
        return { isValid: false };
      }
    }

    // Check for career categories
    const careerCategories = [
      'career', 'occupation', 'job', 'profession', 'employment',
      'engineering', 'healthcare', 'technology', 'business', 'education'
    ];

    for (const careerCategory of careerCategories) {
      if (lowerCategory.includes(careerCategory)) {
        return {
          isValid: true,
          method: 'category_metadata',
          confidence: 0.60,
          extractedTitle: metadata.title || this._extractTitleFromText(metadata.description || '')
        };
      }
    }

    return { isValid: false };
  }

  /**
   * Check heuristics for career identification
   * @private
   */
  _checkHeuristics(chunk) {
    const metadata = chunk.chunk_metadata || {};
    const text = chunk.chunk_text || '';

    // ENHANCED: Exclude obvious non-career content first
    if (this._isObviouslyNotCareer(metadata, text)) {
      return { isValid: false };
    }

    // Heuristic 1: Has salary information AND career-like content
    if ((metadata.salary || text.includes('salary') || text.includes('R ')) && 
        this._hasCareerLikeContent(text)) {
      return {
        isValid: true,
        method: 'heuristic_salary',
        confidence: 0.50,
        extractedTitle: this._extractTitleFromText(text)
      };
    }

    // Heuristic 2: Has education requirements AND career-like content
    if ((metadata.education || text.includes('degree') || text.includes('qualification')) &&
        this._hasCareerLikeContent(text)) {
      return {
        isValid: true,
        method: 'heuristic_education',
        confidence: 0.50,
        extractedTitle: this._extractTitleFromText(text)
      };
    }

    // Heuristic 3: Has job-related structure AND career-like content
    if ((text.includes('responsibilities') || text.includes('requirements') || 
        text.includes('skills needed') || text.includes('job description')) &&
        this._hasCareerLikeContent(text)) {
      return {
        isValid: true,
        method: 'heuristic_structure',
        confidence: 0.45,
        extractedTitle: this._extractTitleFromText(text)
      };
    }

    return { isValid: false };
  }

  /**
   * Extract title from source string
   * @private
   */
  _extractTitleFromSource(source) {
    // Remove common prefixes and extract career name
    const cleaned = source.replace(/^(career_|job_|occupation_)/, '').replace(/_/g, ' ');
    return this._titleCase(cleaned);
  }

  /**
   * Extract title from text content
   * @private
   */
  _extractTitleFromText(text) {
    if (!text) return null;

    // Try to find a title-like string at the beginning
    const lines = text.split('\n');
    const firstLine = lines[0]?.trim();
    
    if (firstLine && firstLine.length < 50 && this._isLikelyCareerTitle(firstLine)) {
      return firstLine;
    }

    // Fallback: look for capitalized words that might be a title
    const titleMatch = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    return titleMatch ? titleMatch[1] : null;
  }

  /**
   * Check if string looks like a career title
   * @private
   */
  _isLikelyCareerTitle(str) {
    if (!str || str.length < 3 || str.length > 50) return false;
    
    // Should start with capital letter
    if (!/^[A-Z]/.test(str)) return false;
    
    // Should not contain common non-title words
    const nonTitleWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
    const words = str.toLowerCase().split(/\s+/);
    
    // If more than half the words are non-title words, probably not a title
    const nonTitleCount = words.filter(word => nonTitleWords.includes(word)).length;
    return nonTitleCount < words.length / 2;
  }

  /**
   * Convert string to title case
   * @private
   */
  _titleCase(str) {
    if (!str) return str;
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  /**
   * Check if content is obviously not a career
   * @private
   */
  _isObviouslyNotCareer(metadata, text) {
    // Check metadata for non-career indicators
    const nonCareerSources = [
      'test_question', 'question', 'bursary', 'program', 'university_info',
      'admission', 'general_info', 'faq', 'help', 'guide'
    ];
    
    const source = (metadata.source || '').toLowerCase();
    const category = (metadata.category || '').toLowerCase();
    
    for (const indicator of nonCareerSources) {
      if (source.includes(indicator) || category.includes(indicator)) {
        return true;
      }
    }

    // Check text for non-career patterns
    const nonCareerPatterns = [
      /^(Question|Q\d+|Bursary|Program|University|College|School):/i,
      /How to apply/i,
      /Application process/i,
      /Admission requirements/i,
      /Financial aid/i,
      /Scholarship/i
    ];

    for (const pattern of nonCareerPatterns) {
      if (pattern.test(text)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if text has career-like content
   * @private
   */
  _hasCareerLikeContent(text) {
    if (!text) return false;

    const careerIndicators = [
      'work', 'job', 'career', 'profession', 'occupation', 'role',
      'duties', 'tasks', 'responsibilities', 'skills', 'experience',
      'industry', 'field', 'sector', 'employment', 'workplace'
    ];

    const lowerText = text.toLowerCase();
    return careerIndicators.some(indicator => lowerText.includes(indicator));
  }

  /**
   * Get filter statistics
   * @returns {Object} - Filter performance statistics
   */
  getStats() {
    return {
      version: '1.0.0',
      methods: [
        'career_code', 'career_title', 'career_name', 'career_field',
        'occupation', 'job_title', 'source_tag', 'text_pattern_career',
        'text_pattern_title', 'text_pattern_keyword', 'category_metadata',
        'heuristic_salary', 'heuristic_education', 'heuristic_structure'
      ],
      strictMode: this.options.strictMode
    };
  }
}

// Export singleton instance for convenience
export const metadataFilter = new MetadataFilter();

// Export class for custom instances
export default MetadataFilter;