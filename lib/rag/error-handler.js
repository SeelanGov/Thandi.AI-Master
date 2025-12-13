// lib/rag/error-handler.js
// Comprehensive Error Handling for RAG System
// Provides graceful degradation and emergency fallbacks

/**
 * Error types for RAG system components
 */
export const ErrorTypes = {
  METADATA_FILTER_ERROR: 'metadata_filter_error',
  FALLBACK_SELECTOR_ERROR: 'fallback_selector_error',
  DATABASE_ERROR: 'database_error',
  EMBEDDING_ERROR: 'embedding_error',
  SEARCH_ERROR: 'search_error',
  PERFORMANCE_ERROR: 'performance_error',
  VALIDATION_ERROR: 'validation_error',
  TIMEOUT_ERROR: 'timeout_error',
  SYSTEM_ERROR: 'system_error'
};

/**
 * Error severity levels
 */
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Comprehensive error handler for RAG system
 * Provides graceful degradation and emergency fallbacks
 */
export class RAGErrorHandler {
  constructor(options = {}) {
    this.options = {
      enableLogging: true,
      enableMetrics: true,
      enableFallbacks: true,
      maxRetries: 3,
      retryDelay: 1000,
      timeoutMs: 30000,
      ...options
    };
    
    this.errorCounts = new Map();
    this.lastErrors = [];
    this.maxErrorHistory = 100;
  }

  /**
   * Handle metadata filter errors with graceful degradation
   * @param {Error} error - The error that occurred
   * @param {Array} chunks - Input chunks for filtering
   * @param {Object} context - Additional context
   * @returns {Object} - Recovery result
   */
  async handleMetadataFilterError(error, chunks = [], context = {}) {
    const errorInfo = this._createErrorInfo(ErrorTypes.METADATA_FILTER_ERROR, error, context);
    this._logError(errorInfo);
    
    try {
      // Strategy 1: Try basic filtering without enhanced methods
      console.log('[ErrorHandler] Attempting basic metadata filtering fallback');
      const basicFiltered = this._basicMetadataFilter(chunks);
      
      if (basicFiltered.length > 0) {
        console.log(`[ErrorHandler] Basic filtering recovered ${basicFiltered.length} chunks`);
        return {
          success: true,
          data: basicFiltered,
          fallbackUsed: 'basic_metadata_filter',
          originalError: error.message
        };
      }
      
      // Strategy 2: Return all chunks with low confidence
      console.log('[ErrorHandler] Using permissive fallback - returning all chunks');
      const permissiveResult = chunks.map(chunk => ({
        ...chunk,
        _filterMetadata: {
          identificationMethod: 'error_fallback',
          confidence: 0.3,
          extractedTitle: this._extractBasicTitle(chunk)
        }
      }));
      
      return {
        success: true,
        data: permissiveResult,
        fallbackUsed: 'permissive_filter',
        originalError: error.message
      };
      
    } catch (fallbackError) {
      console.error('[ErrorHandler] All metadata filter fallbacks failed:', fallbackError);
      return {
        success: false,
        data: [],
        error: `Metadata filter failed: ${error.message}`,
        fallbackError: fallbackError.message
      };
    }
  }

  /**
   * Handle fallback selector errors with emergency careers
   * @param {Error} error - The error that occurred
   * @param {Object} profile - Student profile
   * @param {Array} existingCareers - Already found careers
   * @param {number} targetCount - Target career count
   * @returns {Object} - Recovery result
   */
  async handleFallbackSelectorError(error, profile, existingCareers = [], targetCount = 3) {
    const errorInfo = this._createErrorInfo(ErrorTypes.FALLBACK_SELECTOR_ERROR, error, { profile, targetCount });
    this._logError(errorInfo);
    
    try {
      const neededCount = Math.max(0, targetCount - existingCareers.length);
      
      if (neededCount === 0) {
        return {
          success: true,
          data: [],
          fallbackUsed: 'no_fallback_needed'
        };
      }
      
      // Strategy 1: Use emergency hardcoded careers
      console.log('[ErrorHandler] Using emergency career fallback');
      const emergencyCareers = this._getEmergencyCareers(profile, existingCareers, neededCount);
      
      return {
        success: true,
        data: emergencyCareers,
        fallbackUsed: 'emergency_careers',
        originalError: error.message
      };
      
    } catch (fallbackError) {
      console.error('[ErrorHandler] Emergency career fallback failed:', fallbackError);
      return {
        success: false,
        data: [],
        error: `Fallback selector failed: ${error.message}`,
        fallbackError: fallbackError.message
      };
    }
  }

  /**
   * Handle database errors with retry logic
   * @param {Error} error - The error that occurred
   * @param {Function} operation - The operation to retry
   * @param {Object} context - Additional context
   * @returns {Object} - Recovery result
   */
  async handleDatabaseError(error, operation, context = {}) {
    const errorInfo = this._createErrorInfo(ErrorTypes.DATABASE_ERROR, error, context);
    this._logError(errorInfo);
    
    const maxRetries = this.options.maxRetries;
    let lastError = error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[ErrorHandler] Database retry attempt ${attempt}/${maxRetries}`);
        
        // Add exponential backoff
        if (attempt > 1) {
          const delay = this.options.retryDelay * Math.pow(2, attempt - 1);
          await this._sleep(delay);
        }
        
        const result = await operation();
        console.log(`[ErrorHandler] Database operation succeeded on attempt ${attempt}`);
        
        return {
          success: true,
          data: result,
          retriesUsed: attempt - 1,
          fallbackUsed: attempt > 1 ? 'retry_success' : 'none'
        };
        
      } catch (retryError) {
        lastError = retryError;
        console.log(`[ErrorHandler] Database retry ${attempt} failed: ${retryError.message}`);
      }
    }
    
    console.error(`[ErrorHandler] All database retries failed after ${maxRetries} attempts`);
    return {
      success: false,
      data: null,
      error: `Database operation failed after ${maxRetries} retries: ${lastError.message}`,
      retriesUsed: maxRetries
    };
  }

  /**
   * Handle embedding generation errors
   * @param {Error} error - The error that occurred
   * @param {string} text - Text that failed to embed
   * @param {Object} context - Additional context
   * @returns {Object} - Recovery result
   */
  async handleEmbeddingError(error, text, context = {}) {
    const errorInfo = this._createErrorInfo(ErrorTypes.EMBEDDING_ERROR, error, { text: text?.substring(0, 100) });
    this._logError(errorInfo);
    
    try {
      // Strategy 1: Try with simplified text
      if (text && text.length > 100) {
        console.log('[ErrorHandler] Attempting embedding with simplified text');
        const simplifiedText = this._simplifyText(text);
        
        // This would need to be implemented by the caller with their embedding function
        return {
          success: false,
          data: null,
          fallbackUsed: 'simplified_text',
          simplifiedText,
          originalError: error.message,
          suggestion: 'Retry with simplified text'
        };
      }
      
      // Strategy 2: Use default embedding (zeros)
      console.log('[ErrorHandler] Using zero embedding fallback');
      const defaultEmbedding = new Array(1536).fill(0); // OpenAI embedding size
      
      return {
        success: true,
        data: defaultEmbedding,
        fallbackUsed: 'zero_embedding',
        originalError: error.message,
        warning: 'Using zero embedding - results may be poor'
      };
      
    } catch (fallbackError) {
      console.error('[ErrorHandler] Embedding fallback failed:', fallbackError);
      return {
        success: false,
        data: null,
        error: `Embedding generation failed: ${error.message}`,
        fallbackError: fallbackError.message
      };
    }
  }

  /**
   * Handle timeout errors with graceful degradation
   * @param {Error} error - The timeout error
   * @param {Object} context - Additional context
   * @returns {Object} - Recovery result
   */
  async handleTimeoutError(error, context = {}) {
    const errorInfo = this._createErrorInfo(ErrorTypes.TIMEOUT_ERROR, error, context);
    this._logError(errorInfo);
    
    console.log('[ErrorHandler] Operation timed out, implementing graceful degradation');
    
    return {
      success: false,
      data: null,
      error: `Operation timed out: ${error.message}`,
      fallbackUsed: 'timeout_degradation',
      suggestion: 'Reduce query complexity or increase timeout'
    };
  }

  /**
   * Handle system-wide errors with emergency mode
   * @param {Error} error - The system error
   * @param {Object} context - Additional context
   * @returns {Object} - Recovery result
   */
  async handleSystemError(error, context = {}) {
    const errorInfo = this._createErrorInfo(ErrorTypes.SYSTEM_ERROR, error, context);
    this._logError(errorInfo);
    
    console.error('[ErrorHandler] System-wide error detected, entering emergency mode');
    
    // Emergency response with minimal functionality
    const emergencyResponse = {
      careers: this._getEmergencyCareers({}, [], 3),
      message: 'System temporarily unavailable. Showing basic career options.',
      emergencyMode: true,
      timestamp: new Date().toISOString()
    };
    
    return {
      success: true,
      data: emergencyResponse,
      fallbackUsed: 'emergency_mode',
      originalError: error.message,
      warning: 'System in emergency mode - limited functionality'
    };
  }

  /**
   * Wrap an async operation with comprehensive error handling
   * @param {Function} operation - The operation to wrap
   * @param {Object} errorContext - Context for error handling
   * @returns {Promise<Object>} - Operation result with error handling
   */
  async wrapOperation(operation, errorContext = {}) {
    const startTime = Date.now();
    
    try {
      // Set up timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Operation timeout')), this.options.timeoutMs);
      });
      
      const result = await Promise.race([operation(), timeoutPromise]);
      
      const duration = Date.now() - startTime;
      if (this.options.enableMetrics) {
        this._recordSuccess(errorContext.operationType, duration);
      }
      
      return {
        success: true,
        data: result,
        duration
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (this.options.enableMetrics) {
        this._recordError(errorContext.operationType, error, duration);
      }
      
      // Route to appropriate error handler based on error type
      if (error.message.includes('timeout')) {
        return await this.handleTimeoutError(error, errorContext);
      } else if (errorContext.operationType === 'metadata_filter') {
        return await this.handleMetadataFilterError(error, errorContext.chunks, errorContext);
      } else if (errorContext.operationType === 'fallback_selector') {
        return await this.handleFallbackSelectorError(error, errorContext.profile, errorContext.existingCareers, errorContext.targetCount);
      } else if (errorContext.operationType === 'database') {
        return await this.handleDatabaseError(error, operation, errorContext);
      } else if (errorContext.operationType === 'embedding') {
        return await this.handleEmbeddingError(error, errorContext.text, errorContext);
      } else {
        return await this.handleSystemError(error, errorContext);
      }
    }
  }

  /**
   * Get error statistics and health metrics
   * @returns {Object} - Error statistics
   */
  getErrorStats() {
    const totalErrors = Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0);
    const recentErrors = this.lastErrors.filter(e => Date.now() - e.timestamp < 300000); // Last 5 minutes
    
    return {
      totalErrors,
      recentErrors: recentErrors.length,
      errorsByType: Object.fromEntries(this.errorCounts),
      lastErrors: this.lastErrors.slice(-10),
      systemHealth: this._calculateSystemHealth(),
      recommendations: this._generateRecommendations()
    };
  }

  /**
   * Basic metadata filter fallback
   * @private
   */
  _basicMetadataFilter(chunks) {
    return chunks.filter(chunk => {
      const metadata = chunk.chunk_metadata || {};
      const text = chunk.chunk_text || '';
      
      // Very basic checks
      return (
        metadata.career_code ||
        metadata.career_title ||
        metadata.career_name ||
        text.toLowerCase().includes('career') ||
        text.toLowerCase().includes('engineer') ||
        text.toLowerCase().includes('analyst')
      );
    });
  }

  /**
   * Extract basic title from chunk
   * @private
   */
  _extractBasicTitle(chunk) {
    const metadata = chunk.chunk_metadata || {};
    const text = chunk.chunk_text || '';
    
    return metadata.career_title || 
           metadata.career_name || 
           metadata.career ||
           text.split('\n')[0]?.substring(0, 50) || 
           'Career Option';
  }

  /**
   * Get emergency careers when all else fails
   * @private
   */
  _getEmergencyCareers(profile, existingCareers, count) {
    const emergencyCareers = [
      {
        title: 'Software Engineer',
        category: 'Technology',
        description: 'Design and develop software applications and systems.',
        source: 'emergency_fallback',
        confidence: 0.4
      },
      {
        title: 'Business Analyst',
        category: 'Business',
        description: 'Analyze business processes and recommend improvements.',
        source: 'emergency_fallback',
        confidence: 0.4
      },
      {
        title: 'Teacher',
        category: 'Education',
        description: 'Educate and inspire students in various subjects.',
        source: 'emergency_fallback',
        confidence: 0.4
      },
      {
        title: 'Nurse',
        category: 'Healthcare',
        description: 'Provide healthcare services and patient care.',
        source: 'emergency_fallback',
        confidence: 0.4
      },
      {
        title: 'Civil Engineer',
        category: 'Engineering',
        description: 'Design and oversee construction of infrastructure projects.',
        source: 'emergency_fallback',
        confidence: 0.4
      }
    ];
    
    const existingTitles = new Set(existingCareers.map(c => c.title));
    return emergencyCareers
      .filter(c => !existingTitles.has(c.title))
      .slice(0, count);
  }

  /**
   * Simplify text for embedding retry
   * @private
   */
  _simplifyText(text) {
    return text
      .substring(0, 200) // Truncate
      .replace(/[^\w\s]/g, ' ') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Create error information object
   * @private
   */
  _createErrorInfo(type, error, context) {
    return {
      type,
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
      severity: this._determineSeverity(type, error)
    };
  }

  /**
   * Log error information
   * @private
   */
  _logError(errorInfo) {
    if (!this.options.enableLogging) return;
    
    const logLevel = errorInfo.severity === ErrorSeverity.CRITICAL ? 'error' : 'warn';
    console[logLevel](`[RAGErrorHandler] ${errorInfo.type}: ${errorInfo.message}`);
    
    // Store error for statistics
    this.errorCounts.set(errorInfo.type, (this.errorCounts.get(errorInfo.type) || 0) + 1);
    this.lastErrors.push(errorInfo);
    
    // Keep error history manageable
    if (this.lastErrors.length > this.maxErrorHistory) {
      this.lastErrors.shift();
    }
  }

  /**
   * Determine error severity
   * @private
   */
  _determineSeverity(type, error) {
    if (type === ErrorTypes.SYSTEM_ERROR) return ErrorSeverity.CRITICAL;
    if (type === ErrorTypes.DATABASE_ERROR) return ErrorSeverity.HIGH;
    if (type === ErrorTypes.TIMEOUT_ERROR) return ErrorSeverity.HIGH;
    if (type === ErrorTypes.EMBEDDING_ERROR) return ErrorSeverity.MEDIUM;
    return ErrorSeverity.LOW;
  }

  /**
   * Record successful operation
   * @private
   */
  _recordSuccess(operationType, duration) {
    // Implementation would depend on metrics system
    console.log(`[RAGErrorHandler] Success: ${operationType} completed in ${duration}ms`);
  }

  /**
   * Record error occurrence
   * @private
   */
  _recordError(operationType, error, duration) {
    // Implementation would depend on metrics system
    console.log(`[RAGErrorHandler] Error: ${operationType} failed after ${duration}ms - ${error.message}`);
  }

  /**
   * Calculate system health score
   * @private
   */
  _calculateSystemHealth() {
    const recentErrors = this.lastErrors.filter(e => Date.now() - e.timestamp < 300000);
    const criticalErrors = recentErrors.filter(e => e.severity === ErrorSeverity.CRITICAL);
    
    if (criticalErrors.length > 0) return 'critical';
    if (recentErrors.length > 10) return 'degraded';
    if (recentErrors.length > 5) return 'warning';
    return 'healthy';
  }

  /**
   * Generate recommendations based on error patterns
   * @private
   */
  _generateRecommendations() {
    const recommendations = [];
    const recentErrors = this.lastErrors.filter(e => Date.now() - e.timestamp < 300000);
    
    const errorTypeCounts = {};
    recentErrors.forEach(e => {
      errorTypeCounts[e.type] = (errorTypeCounts[e.type] || 0) + 1;
    });
    
    if (errorTypeCounts[ErrorTypes.DATABASE_ERROR] > 3) {
      recommendations.push('Consider checking database connection and query optimization');
    }
    
    if (errorTypeCounts[ErrorTypes.TIMEOUT_ERROR] > 2) {
      recommendations.push('Consider increasing timeout values or optimizing slow operations');
    }
    
    if (errorTypeCounts[ErrorTypes.EMBEDDING_ERROR] > 2) {
      recommendations.push('Check OpenAI API key and rate limits');
    }
    
    return recommendations;
  }

  /**
   * Sleep utility for retry delays
   * @private
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance for convenience
export const ragErrorHandler = new RAGErrorHandler();

// Export class for custom instances
export default RAGErrorHandler;