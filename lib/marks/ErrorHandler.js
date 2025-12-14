/**
 * ErrorHandler - Comprehensive error handling for mark collection system
 * 
 * This class provides centralized error handling for APS calculation failures,
 * local storage errors, validation errors, and other issues that may occur
 * during mark collection and processing.
 * 
 * Requirements addressed: 9.4, 9.5
 */

export class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
    this.errorTypes = {
      APS_CALCULATION: 'aps_calculation',
      STORAGE: 'storage',
      VALIDATION: 'validation',
      NETWORK: 'network',
      PRIVACY: 'privacy',
      COMPONENT: 'component',
      UNKNOWN: 'unknown'
    };
    
    this.severityLevels = {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
      CRITICAL: 'critical'
    };
  }

  /**
   * Handle APS calculation errors
   * @param {Error} error - The error that occurred
   * @param {Object} context - Context information (marks, grade, etc.)
   * @returns {Object} Error handling result with recovery options
   */
  handleAPSCalculationError(error, context = {}) {
    const errorInfo = {
      type: this.errorTypes.APS_CALCULATION,
      severity: this.severityLevels.MEDIUM,
      message: 'APS calculation failed',
      originalError: error.message,
      context: this.sanitizeContext(context),
      timestamp: new Date().toISOString(),
      recoveryOptions: []
    };

    // Determine specific APS error type and recovery options
    if (error.message.includes('At least 6 valid subject marks required')) {
      errorInfo.userMessage = "You need at least 6 subject marks for APS calculation. Add more marks or use estimates.";
      errorInfo.recoveryOptions = [
        {
          action: 'add_more_marks',
          label: 'Add more subject marks',
          description: 'Enter marks for additional subjects to reach the minimum of 6'
        },
        {
          action: 'use_estimates',
          label: 'Use estimates for unknown marks',
          description: 'Provide rough estimates for subjects you\'re unsure about'
        },
        {
          action: 'continue_without_aps',
          label: 'Continue without APS calculation',
          description: 'Proceed with career guidance based on subject preferences only'
        }
      ];
    } else if (error.message.includes('Invalid marks data')) {
      errorInfo.userMessage = "There's an issue with your mark data. Please check your entries.";
      errorInfo.recoveryOptions = [
        {
          action: 'review_marks',
          label: 'Review your marks',
          description: 'Check that all marks are between 0-100% or valid grade symbols'
        },
        {
          action: 'clear_invalid_marks',
          label: 'Clear problematic marks',
          description: 'Remove marks that might be causing issues'
        }
      ];
    } else {
      errorInfo.userMessage = "APS calculation encountered an unexpected error. You can continue without it.";
      errorInfo.recoveryOptions = [
        {
          action: 'retry_calculation',
          label: 'Try again',
          description: 'Attempt the APS calculation again'
        },
        {
          action: 'continue_without_aps',
          label: 'Continue without APS',
          description: 'Proceed with general career guidance'
        }
      ];
    }

    this.logError(errorInfo);
    return this.createErrorResponse(errorInfo);
  }

  /**
   * Handle local storage errors
   * @param {Error} error - The storage error
   * @param {Object} context - Context (operation, data size, etc.)
   * @returns {Object} Error handling result
   */
  handleStorageError(error, context = {}) {
    const errorInfo = {
      type: this.errorTypes.STORAGE,
      severity: this.severityLevels.HIGH,
      message: 'Local storage operation failed',
      originalError: error.message,
      context: this.sanitizeContext(context),
      timestamp: new Date().toISOString(),
      recoveryOptions: []
    };

    // Determine storage error type
    if (error.message.includes('QuotaExceededError') || error.message.includes('quota')) {
      errorInfo.userMessage = "Your browser's storage is full. Some data may not be saved.";
      errorInfo.recoveryOptions = [
        {
          action: 'clear_old_data',
          label: 'Clear old data',
          description: 'Remove old assessment data to free up space'
        },
        {
          action: 'continue_without_storage',
          label: 'Continue without saving',
          description: 'Proceed without saving marks (they won\'t persist between sessions)'
        }
      ];
    } else if (error.message.includes('SecurityError') || error.message.includes('access')) {
      errorInfo.userMessage = "Cannot access browser storage. Your marks won't be saved between sessions.";
      errorInfo.recoveryOptions = [
        {
          action: 'enable_storage',
          label: 'Enable storage',
          description: 'Check your browser settings to allow local storage'
        },
        {
          action: 'continue_without_storage',
          label: 'Continue anyway',
          description: 'Proceed without saving (marks will be lost if you refresh)'
        }
      ];
    } else {
      errorInfo.userMessage = "There's an issue saving your data. Your progress might not be saved.";
      errorInfo.recoveryOptions = [
        {
          action: 'retry_storage',
          label: 'Try saving again',
          description: 'Attempt to save your data again'
        },
        {
          action: 'continue_without_storage',
          label: 'Continue without saving',
          description: 'Proceed but be aware data won\'t persist'
        }
      ];
    }

    this.logError(errorInfo);
    return this.createErrorResponse(errorInfo);
  }

  /**
   * Handle validation errors
   * @param {Error} error - The validation error
   * @param {Object} context - Context (field, value, etc.)
   * @returns {Object} Error handling result
   */
  handleValidationError(error, context = {}) {
    const errorInfo = {
      type: this.errorTypes.VALIDATION,
      severity: this.severityLevels.LOW,
      message: 'Input validation failed',
      originalError: error.message,
      context: this.sanitizeContext(context),
      timestamp: new Date().toISOString(),
      recoveryOptions: []
    };

    // Provide specific guidance based on validation error
    if (error.message.includes('percentage cannot exceed 100')) {
      errorInfo.userMessage = "Marks cannot be higher than 100%. Please enter a valid percentage.";
      errorInfo.recoveryOptions = [
        {
          action: 'correct_mark',
          label: 'Enter correct mark',
          description: 'Provide a mark between 0-100%'
        },
        {
          action: 'use_grade_symbol',
          label: 'Use grade symbol instead',
          description: 'Enter a grade symbol like A+, B, C, etc.'
        }
      ];
    } else if (error.message.includes('negative')) {
      errorInfo.userMessage = "Marks cannot be negative. Please enter a positive value.";
      errorInfo.recoveryOptions = [
        {
          action: 'correct_mark',
          label: 'Enter positive mark',
          description: 'Provide a mark between 0-100%'
        }
      ];
    } else if (error.message.includes('Invalid grade symbol')) {
      errorInfo.userMessage = "That's not a valid grade symbol. Use symbols like A+, A, B+, B, C, etc.";
      errorInfo.recoveryOptions = [
        {
          action: 'use_valid_symbol',
          label: 'Use valid grade symbol',
          description: 'Enter A+, A, A-, B+, B, B-, C+, C, C-, D+, D, D-, E, or F'
        },
        {
          action: 'use_percentage',
          label: 'Use percentage instead',
          description: 'Enter your mark as a percentage (0-100%)'
        }
      ];
    } else {
      errorInfo.userMessage = "There's an issue with your input. Please check and try again.";
      errorInfo.recoveryOptions = [
        {
          action: 'retry_input',
          label: 'Try again',
          description: 'Check your input and enter it again'
        },
        {
          action: 'skip_field',
          label: 'Skip this field',
          description: 'Leave this mark blank for now'
        }
      ];
    }

    this.logError(errorInfo);
    return this.createErrorResponse(errorInfo);
  }

  /**
   * Handle privacy-related errors
   * @param {Error} error - The privacy error
   * @param {Object} context - Context information
   * @returns {Object} Error handling result
   */
  handlePrivacyError(error, context = {}) {
    const errorInfo = {
      type: this.errorTypes.PRIVACY,
      severity: this.severityLevels.HIGH,
      message: 'Privacy operation failed',
      originalError: error.message,
      context: this.sanitizeContext(context),
      timestamp: new Date().toISOString(),
      recoveryOptions: []
    };

    errorInfo.userMessage = "There was an issue with privacy settings. Your data security is our priority.";
    errorInfo.recoveryOptions = [
      {
        action: 'retry_privacy_operation',
        label: 'Try again',
        description: 'Attempt the privacy operation again'
      },
      {
        action: 'continue_with_defaults',
        label: 'Use default privacy settings',
        description: 'Continue with the most secure privacy settings'
      }
    ];

    this.logError(errorInfo);
    return this.createErrorResponse(errorInfo);
  }

  /**
   * Handle component rendering errors
   * @param {Error} error - The component error
   * @param {Object} context - Component context
   * @returns {Object} Error handling result
   */
  handleComponentError(error, context = {}) {
    const errorInfo = {
      type: this.errorTypes.COMPONENT,
      severity: this.severityLevels.MEDIUM,
      message: 'Component error occurred',
      originalError: error.message,
      context: this.sanitizeContext(context),
      timestamp: new Date().toISOString(),
      recoveryOptions: []
    };

    errorInfo.userMessage = "Something went wrong with the interface. Please try refreshing the page.";
    errorInfo.recoveryOptions = [
      {
        action: 'refresh_page',
        label: 'Refresh page',
        description: 'Reload the page to reset the interface'
      },
      {
        action: 'continue_anyway',
        label: 'Continue anyway',
        description: 'Try to continue despite the error'
      }
    ];

    this.logError(errorInfo);
    return this.createErrorResponse(errorInfo);
  }

  /**
   * Handle network-related errors
   * @param {Error} error - The network error
   * @param {Object} context - Request context
   * @returns {Object} Error handling result
   */
  handleNetworkError(error, context = {}) {
    const errorInfo = {
      type: this.errorTypes.NETWORK,
      severity: this.severityLevels.MEDIUM,
      message: 'Network operation failed',
      originalError: error.message,
      context: this.sanitizeContext(context),
      timestamp: new Date().toISOString(),
      recoveryOptions: []
    };

    errorInfo.userMessage = "Network connection issue. Some features may not work properly.";
    errorInfo.recoveryOptions = [
      {
        action: 'retry_request',
        label: 'Try again',
        description: 'Retry the network request'
      },
      {
        action: 'continue_offline',
        label: 'Continue offline',
        description: 'Use local features only'
      }
    ];

    this.logError(errorInfo);
    return this.createErrorResponse(errorInfo);
  }

  /**
   * Handle unknown/generic errors
   * @param {Error} error - The unknown error
   * @param {Object} context - Any available context
   * @returns {Object} Error handling result
   */
  handleUnknownError(error, context = {}) {
    const errorInfo = {
      type: this.errorTypes.UNKNOWN,
      severity: this.severityLevels.MEDIUM,
      message: 'Unexpected error occurred',
      originalError: error.message,
      context: this.sanitizeContext(context),
      timestamp: new Date().toISOString(),
      recoveryOptions: []
    };

    errorInfo.userMessage = "Something unexpected happened. Please try again or refresh the page.";
    errorInfo.recoveryOptions = [
      {
        action: 'retry_operation',
        label: 'Try again',
        description: 'Attempt the operation again'
      },
      {
        action: 'refresh_page',
        label: 'Refresh page',
        description: 'Reload the page to start fresh'
      },
      {
        action: 'continue_anyway',
        label: 'Continue anyway',
        description: 'Try to proceed despite the error'
      }
    ];

    this.logError(errorInfo);
    return this.createErrorResponse(errorInfo);
  }

  /**
   * Create standardized error response
   * @param {Object} errorInfo - Error information
   * @returns {Object} Standardized error response
   */
  createErrorResponse(errorInfo) {
    return {
      hasError: true,
      errorType: errorInfo.type,
      severity: errorInfo.severity,
      userMessage: errorInfo.userMessage,
      technicalMessage: errorInfo.message,
      recoveryOptions: errorInfo.recoveryOptions,
      errorId: this.generateErrorId(),
      timestamp: errorInfo.timestamp,
      canContinue: errorInfo.severity !== this.severityLevels.CRITICAL,
      shouldNotify: errorInfo.severity === this.severityLevels.HIGH || errorInfo.severity === this.severityLevels.CRITICAL
    };
  }

  /**
   * Log error for monitoring (without sensitive data)
   * @param {Object} errorInfo - Error information to log
   */
  logError(errorInfo) {
    // Remove sensitive data before logging
    const sanitizedError = {
      ...errorInfo,
      context: this.sanitizeContext(errorInfo.context)
    };
    
    this.errorLog.push(sanitizedError);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorHandler]', sanitizedError);
    }
  }

  /**
   * Sanitize context to remove sensitive data
   * @param {Object} context - Context object
   * @returns {Object} Sanitized context
   */
  sanitizeContext(context) {
    if (!context || typeof context !== 'object') {
      return {};
    }
    
    const sanitized = { ...context };
    
    // Remove potentially sensitive fields
    const sensitiveFields = ['password', 'token', 'key', 'secret', 'auth'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    // Limit mark data to prevent large logs
    if (sanitized.marks && typeof sanitized.marks === 'object') {
      const markCount = Object.keys(sanitized.marks).length;
      sanitized.marks = `[${markCount} marks]`;
    }
    
    return sanitized;
  }

  /**
   * Generate unique error ID for tracking
   * @returns {string} Unique error ID
   */
  generateErrorId() {
    return 'err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  }

  /**
   * Get error statistics for monitoring
   * @returns {Object} Error statistics
   */
  getErrorStatistics() {
    const stats = {
      totalErrors: this.errorLog.length,
      errorsByType: {},
      errorsBySeverity: {},
      recentErrors: this.errorLog.slice(-10),
      timeRange: {
        oldest: this.errorLog.length > 0 ? this.errorLog[0].timestamp : null,
        newest: this.errorLog.length > 0 ? this.errorLog[this.errorLog.length - 1].timestamp : null
      }
    };
    
    // Count by type and severity
    this.errorLog.forEach(error => {
      stats.errorsByType[error.type] = (stats.errorsByType[error.type] || 0) + 1;
      stats.errorsBySeverity[error.severity] = (stats.errorsBySeverity[error.severity] || 0) + 1;
    });
    
    return stats;
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
  }

  /**
   * Check if system is experiencing critical errors
   * @returns {boolean} True if critical errors detected
   */
  hasCriticalErrors() {
    const recentErrors = this.errorLog.slice(-10);
    return recentErrors.some(error => error.severity === this.severityLevels.CRITICAL);
  }

  /**
   * Get user-friendly error message for display
   * @param {string} errorType - Type of error
   * @param {string} severity - Error severity
   * @returns {Object} Display message information
   */
  getDisplayMessage(errorType, severity) {
    const messages = {
      [this.errorTypes.APS_CALCULATION]: {
        icon: '🧮',
        title: 'APS Calculation Issue',
        color: 'amber'
      },
      [this.errorTypes.STORAGE]: {
        icon: '💾',
        title: 'Storage Issue',
        color: 'red'
      },
      [this.errorTypes.VALIDATION]: {
        icon: '⚠️',
        title: 'Input Error',
        color: 'orange'
      },
      [this.errorTypes.PRIVACY]: {
        icon: '🔒',
        title: 'Privacy Error',
        color: 'red'
      },
      [this.errorTypes.COMPONENT]: {
        icon: '🔧',
        title: 'Interface Issue',
        color: 'blue'
      },
      [this.errorTypes.NETWORK]: {
        icon: '🌐',
        title: 'Connection Issue',
        color: 'gray'
      },
      [this.errorTypes.UNKNOWN]: {
        icon: '❓',
        title: 'Unexpected Error',
        color: 'gray'
      }
    };
    
    return messages[errorType] || messages[this.errorTypes.UNKNOWN];
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();