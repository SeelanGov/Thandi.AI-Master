/**
 * PrivacyManager - Local-only mark storage with session isolation and privacy controls
 * 
 * This class implements privacy-by-design principles for student mark data:
 * - Local-only storage (no server transmission)
 * - Session isolation (data cleared on session end)
 * - Consent-based PDF inclusion
 * - Automatic cleanup mechanisms
 * 
 * Requirements addressed: 5.1, 5.2, 5.4, 5.5
 */

export class PrivacyManager {
  constructor() {
    this.storagePrefix = 'thandi_marks_';
    this.sessionKey = 'thandi_session_id';
    this.consentKey = 'thandi_marks_consent';
    this.cleanupInterval = null;
    
    // Generate unique session ID
    this.sessionId = this.getOrCreateSessionId();
    
    // Set up automatic cleanup
    this.setupAutomaticCleanup();
    
    // Listen for page unload to trigger cleanup
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.cleanupOnExit());
      window.addEventListener('pagehide', () => this.cleanupOnExit());
    }
  }

  /**
   * Store mark data with privacy controls
   * @param {string} key - Storage key
   * @param {Object} data - Mark data to store
   * @param {Object} options - Privacy options
   * @returns {boolean} Success status
   */
  storeMarkData(key, data, options = {}) {
    try {
      if (!this.isStorageAvailable()) {
        console.warn('[PrivacyManager] Local storage not available');
        return false;
      }

      // Add privacy metadata
      const privacyWrappedData = {
        data: data,
        sessionId: this.sessionId,
        timestamp: Date.now(),
        consentGiven: options.consentGiven || false,
        includePDF: options.includePDF || false,
        expiresAt: Date.now() + (options.ttl || 24 * 60 * 60 * 1000), // 24 hours default
        privacyLevel: options.privacyLevel || 'session-only'
      };

      const storageKey = this.getStorageKey(key);
      localStorage.setItem(storageKey, JSON.stringify(privacyWrappedData));
      
      console.log(`[PrivacyManager] Stored mark data: ${key} (session: ${this.sessionId})`);
      return true;
    } catch (error) {
      console.error('[PrivacyManager] Failed to store mark data:', error);
      return false;
    }
  }

  /**
   * Retrieve mark data with privacy validation
   * @param {string} key - Storage key
   * @returns {Object|null} Retrieved data or null
   */
  getMarkData(key) {
    try {
      if (!this.isStorageAvailable()) {
        return null;
      }

      const storageKey = this.getStorageKey(key);
      const storedData = localStorage.getItem(storageKey);
      
      if (!storedData) {
        return null;
      }

      const parsedData = JSON.parse(storedData);
      
      // Validate session isolation
      if (parsedData.sessionId !== this.sessionId) {
        console.log('[PrivacyManager] Data from different session, removing');
        this.removeMarkData(key);
        return null;
      }
      
      // Check expiration
      if (parsedData.expiresAt && Date.now() > parsedData.expiresAt) {
        console.log('[PrivacyManager] Data expired, removing');
        this.removeMarkData(key);
        return null;
      }
      
      return parsedData.data;
    } catch (error) {
      console.error('[PrivacyManager] Failed to retrieve mark data:', error);
      return null;
    }
  }

  /**
   * Remove specific mark data
   * @param {string} key - Storage key
   * @returns {boolean} Success status
   */
  removeMarkData(key) {
    try {
      if (!this.isStorageAvailable()) {
        return false;
      }

      const storageKey = this.getStorageKey(key);
      localStorage.removeItem(storageKey);
      
      console.log(`[PrivacyManager] Removed mark data: ${key}`);
      return true;
    } catch (error) {
      console.error('[PrivacyManager] Failed to remove mark data:', error);
      return false;
    }
  }

  /**
   * Set user consent for data usage
   * @param {Object} consent - Consent preferences
   * @returns {boolean} Success status
   */
  setConsent(consent) {
    try {
      const consentData = {
        includePDF: consent.includePDF || false,
        shareForImprovement: consent.shareForImprovement || false,
        timestamp: Date.now(),
        sessionId: this.sessionId
      };
      
      localStorage.setItem(this.consentKey, JSON.stringify(consentData));
      console.log('[PrivacyManager] Consent preferences updated');
      return true;
    } catch (error) {
      console.error('[PrivacyManager] Failed to set consent:', error);
      return false;
    }
  }

  /**
   * Get current consent preferences
   * @returns {Object|null} Consent preferences
   */
  getConsent() {
    try {
      const consentData = localStorage.getItem(this.consentKey);
      if (!consentData) {
        return null;
      }
      
      const parsed = JSON.parse(consentData);
      
      // Validate session
      if (parsed.sessionId !== this.sessionId) {
        localStorage.removeItem(this.consentKey);
        return null;
      }
      
      return parsed;
    } catch (error) {
      console.error('[PrivacyManager] Failed to get consent:', error);
      return null;
    }
  }

  /**
   * Check if marks can be included in PDF based on consent
   * @returns {boolean} PDF inclusion allowed
   */
  canIncludeInPDF() {
    const consent = this.getConsent();
    return consent ? consent.includePDF : false;
  }

  /**
   * Get all mark data for current session (for PDF generation)
   * @returns {Object} All mark data if consent given
   */
  getAllMarksForPDF() {
    if (!this.canIncludeInPDF()) {
      console.log('[PrivacyManager] PDF inclusion not consented');
      return {};
    }
    
    const allMarks = {};
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storagePrefix)) {
          const originalKey = key.replace(this.storagePrefix, '');
          const data = this.getMarkData(originalKey);
          if (data) {
            allMarks[originalKey] = data;
          }
        }
      }
    } catch (error) {
      console.error('[PrivacyManager] Failed to get marks for PDF:', error);
    }
    
    return allMarks;
  }

  /**
   * Clean up all mark data for current session
   * @returns {boolean} Success status
   */
  cleanupSession() {
    try {
      const keysToRemove = [];
      
      // Find all keys belonging to this session
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storagePrefix)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove consent data
      keysToRemove.push(this.consentKey);
      keysToRemove.push(this.sessionKey);
      
      // Remove all identified keys
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log(`[PrivacyManager] Cleaned up ${keysToRemove.length} items for session ${this.sessionId}`);
      return true;
    } catch (error) {
      console.error('[PrivacyManager] Failed to cleanup session:', error);
      return false;
    }
  }

  /**
   * Clean up expired data from all sessions
   * @returns {number} Number of items cleaned
   */
  cleanupExpiredData() {
    let cleanedCount = 0;
    
    try {
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storagePrefix)) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            if (data.expiresAt && Date.now() > data.expiresAt) {
              keysToRemove.push(key);
            }
          } catch (parseError) {
            // Invalid data, remove it
            keysToRemove.push(key);
          }
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        cleanedCount++;
      });
      
      if (cleanedCount > 0) {
        console.log(`[PrivacyManager] Cleaned up ${cleanedCount} expired items`);
      }
    } catch (error) {
      console.error('[PrivacyManager] Failed to cleanup expired data:', error);
    }
    
    return cleanedCount;
  }

  /**
   * Get privacy compliance report
   * @returns {Object} Privacy compliance status
   */
  getPrivacyReport() {
    const report = {
      sessionId: this.sessionId,
      dataStored: 0,
      consentGiven: false,
      pdfInclusionAllowed: false,
      storageMethod: 'localStorage',
      dataRetention: 'session-only',
      automaticCleanup: true,
      compliance: {
        localOnly: true,
        sessionIsolated: true,
        consentBased: true,
        automaticCleanup: true
      }
    };
    
    try {
      // Count stored items
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storagePrefix)) {
          report.dataStored++;
        }
      }
      
      // Check consent
      const consent = this.getConsent();
      if (consent) {
        report.consentGiven = true;
        report.pdfInclusionAllowed = consent.includePDF;
      }
    } catch (error) {
      console.error('[PrivacyManager] Failed to generate privacy report:', error);
    }
    
    return report;
  }

  // === PRIVATE METHODS ===

  /**
   * Get or create session ID
   * @returns {string} Session ID
   */
  getOrCreateSessionId() {
    try {
      let sessionId = localStorage.getItem(this.sessionKey);
      if (!sessionId) {
        sessionId = this.generateSessionId();
        localStorage.setItem(this.sessionKey, sessionId);
      }
      return sessionId;
    } catch (error) {
      // Fallback to memory-based session ID
      return this.generateSessionId();
    }
  }

  /**
   * Generate unique session ID
   * @returns {string} Unique session ID
   */
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get storage key with prefix
   * @param {string} key - Original key
   * @returns {string} Prefixed key
   */
  getStorageKey(key) {
    return this.storagePrefix + key;
  }

  /**
   * Check if localStorage is available
   * @returns {boolean} Storage availability
   */
  isStorageAvailable() {
    try {
      const test = '__privacy_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Set up automatic cleanup mechanisms
   */
  setupAutomaticCleanup() {
    // Clean up expired data every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredData();
    }, 5 * 60 * 1000);
    
    // Clean up on page visibility change (when user switches tabs)
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.cleanupExpiredData();
        }
      });
    }
  }

  /**
   * Cleanup on page exit
   */
  cleanupOnExit() {
    console.log('[PrivacyManager] Page exit detected, cleaning up session data');
    this.cleanupSession();
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  /**
   * Destroy privacy manager and cleanup
   */
  destroy() {
    this.cleanupSession();
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    console.log('[PrivacyManager] Privacy manager destroyed');
  }
}

// Export singleton instance for convenience
export const privacyManager = new PrivacyManager();