// POPIA Sanitiser - Strip PII before external API calls
// Required by POPIA Act 4 of 2013 - R10M fine for non-compliance

/**
 * PII Categories per POPIA:
 * - Direct identifiers: Names, ID numbers, contact details
 * - Quasi-identifiers: School names, specific locations, dates
 * - Sensitive data: Race, health, biometric data
 */

const PII_PATTERNS = {
  // South African ID numbers (13 digits)
  idNumber: /\b\d{13}\b/g,
  
  // Phone numbers (SA format)
  phone: /\b(?:\+27|0)[6-8]\d{8}\b/g,
  
  // Email addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  
  // Names (common SA patterns)
  // Match capitalized words that look like names (2-20 chars)
  possibleName: /\b[A-Z][a-z]{1,19}\s+[A-Z][a-z]{1,19}\b/g,
  
  // School names (common patterns)
  schoolName: /(High School|Primary School|College|Academy|School)\b/gi,
  
  // Specific locations (street addresses)
  address: /\b\d+\s+[A-Z][a-z]+\s+(Street|Road|Avenue|Drive|Lane)\b/gi,
  
  // Dates that could identify individuals
  specificDate: /\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/g
};

export class POPIASanitiser {
  constructor(options = {}) {
    this.strictMode = options.strictMode ?? true;
    this.logSanitisation = options.logSanitisation ?? true;
    this.auditTrail = [];
  }

  /**
   * Sanitise student profile before external API call
   * @param {Object} profile - Student profile with potential PII
   * @returns {Object} - Sanitised profile safe for external processing
   */
  sanitiseProfile(profile) {
    const sanitised = {
      // Keep only non-identifying academic data
      grade: profile.grade,
      mathType: profile.mathType,
      mathMark: this._generaliseMarks(profile.mathMark),
      subjects: profile.subjects || [],
      marks: this._generaliseAllMarks(profile.marks),
      
      // Generalise location to province level only
      province: this._generaliseLocation(profile.location),
      
      // Keep preferences but sanitise text
      budgetLimit: profile.budgetLimit,
      interests: this._sanitiseText(profile.interests),
      careerPreferences: this._sanitiseText(profile.careerPreferences),
      
      // Remove all direct identifiers
      // studentId: REMOVED
      // name: REMOVED
      // surname: REMOVED
      // idNumber: REMOVED
      // email: REMOVED
      // phone: REMOVED
      // schoolName: REMOVED
      // address: REMOVED
    };

    // Audit trail
    this._logSanitisation('profile', profile, sanitised);

    return sanitised;
  }

  /**
   * Sanitise report text before external processing
   * @param {string} text - Report text that may contain PII
   * @returns {string} - Sanitised text
   */
  sanitiseReportText(text) {
    if (!text) return text;

    let sanitised = text;
    const replacements = [];

    // Remove ID numbers
    sanitised = sanitised.replace(PII_PATTERNS.idNumber, (match) => {
      replacements.push({ type: 'ID_NUMBER', original: match });
      return '[ID_REDACTED]';
    });

    // Remove phone numbers
    sanitised = sanitised.replace(PII_PATTERNS.phone, (match) => {
      replacements.push({ type: 'PHONE', original: match });
      return '[PHONE_REDACTED]';
    });

    // Remove emails
    sanitised = sanitised.replace(PII_PATTERNS.email, (match) => {
      replacements.push({ type: 'EMAIL', original: match });
      return '[EMAIL_REDACTED]';
    });

    // Remove school names
    sanitised = sanitised.replace(PII_PATTERNS.schoolName, (match) => {
      replacements.push({ type: 'SCHOOL', original: match });
      return '[SCHOOL_REDACTED]';
    });

    // Remove addresses
    sanitised = sanitised.replace(PII_PATTERNS.address, (match) => {
      replacements.push({ type: 'ADDRESS', original: match });
      return '[ADDRESS_REDACTED]';
    });

    // Remove specific dates
    sanitised = sanitised.replace(PII_PATTERNS.specificDate, (match) => {
      replacements.push({ type: 'DATE', original: match });
      return '[DATE_REDACTED]';
    });

    // In strict mode, also remove possible names
    if (this.strictMode) {
      sanitised = sanitised.replace(PII_PATTERNS.possibleName, (match) => {
        // Don't redact if it's a career name or common word
        if (this._isCareerOrCommonTerm(match)) return match;
        replacements.push({ type: 'NAME', original: match });
        return '[NAME_REDACTED]';
      });
    }

    this._logSanitisation('text', { original: text, replacements }, sanitised);

    return sanitised;
  }

  /**
   * Generalise marks to ranges (POPIA minimisation principle)
   */
  _generaliseMarks(mark) {
    if (mark === undefined || mark === null) return null;
    
    // Round to nearest 5% to prevent re-identification
    return Math.round(mark / 5) * 5;
  }

  _generaliseAllMarks(marks) {
    if (!marks) return null;
    
    const generalised = {};
    for (const [subject, mark] of Object.entries(marks)) {
      generalised[subject] = this._generaliseMarks(mark);
    }
    return generalised;
  }

  /**
   * Generalise location to province level only
   */
  _generaliseLocation(location) {
    if (!location) return null;

    const provinceMap = {
      'gauteng': 'Gauteng',
      'western cape': 'Western Cape',
      'kwazulu-natal': 'KwaZulu-Natal',
      'eastern cape': 'Eastern Cape',
      'free state': 'Free State',
      'limpopo': 'Limpopo',
      'mpumalanga': 'Mpumalanga',
      'northern cape': 'Northern Cape',
      'north west': 'North West'
    };

    const locationLower = location.toLowerCase();
    
    // Check if location contains a province name
    for (const [key, province] of Object.entries(provinceMap)) {
      if (locationLower.includes(key)) {
        return province;
      }
    }

    // If specific city, map to province
    const cityToProvince = {
      'johannesburg': 'Gauteng',
      'pretoria': 'Gauteng',
      'cape town': 'Western Cape',
      'durban': 'KwaZulu-Natal',
      'port elizabeth': 'Eastern Cape',
      'bloemfontein': 'Free State',
      'polokwane': 'Limpopo',
      'nelspruit': 'Mpumalanga',
      'kimberley': 'Northern Cape',
      'mahikeng': 'North West'
    };

    for (const [city, province] of Object.entries(cityToProvince)) {
      if (locationLower.includes(city)) {
        return province;
      }
    }

    // Default: return null (don't include specific location)
    return null;
  }

  /**
   * Check if text is a career name or common term (don't redact)
   */
  _isCareerOrCommonTerm(text) {
    const commonTerms = [
      'Data Scientist', 'Software Developer', 'Medical Doctor',
      'Mechanical Engineer', 'Chartered Accountant', 'Corporate Lawyer',
      'High School', 'Pure Mathematics', 'Physical Sciences',
      'Life Sciences', 'Information Technology'
    ];

    return commonTerms.some(term => 
      text.toLowerCase().includes(term.toLowerCase())
    );
  }

  /**
   * Sanitise free-text fields
   */
  _sanitiseText(text) {
    if (!text) return text;
    return this.sanitiseReportText(text);
  }

  /**
   * Log sanitisation for audit trail (POPIA compliance requirement)
   */
  _logSanitisation(type, original, sanitised) {
    if (!this.logSanitisation) return;

    const entry = {
      timestamp: new Date().toISOString(),
      type,
      piiDetected: this._detectPIITypes(original),
      sanitised: true
    };

    this.auditTrail.push(entry);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[POPIA] Sanitisation:', entry);
    }
  }

  /**
   * Detect types of PII present in data
   */
  _detectPIITypes(data) {
    const types = [];
    const dataStr = JSON.stringify(data);

    if (PII_PATTERNS.idNumber.test(dataStr)) types.push('ID_NUMBER');
    if (PII_PATTERNS.phone.test(dataStr)) types.push('PHONE');
    if (PII_PATTERNS.email.test(dataStr)) types.push('EMAIL');
    if (PII_PATTERNS.schoolName.test(dataStr)) types.push('SCHOOL');
    if (PII_PATTERNS.address.test(dataStr)) types.push('ADDRESS');
    if (PII_PATTERNS.specificDate.test(dataStr)) types.push('DATE');

    return types;
  }

  /**
   * Get audit trail for compliance reporting
   */
  getAuditTrail() {
    return this.auditTrail;
  }

  /**
   * Clear audit trail (call after persisting to database)
   */
  clearAuditTrail() {
    this.auditTrail = [];
  }

  /**
   * Validate that profile is sanitised (pre-flight check)
   */
  validateSanitised(profile) {
    const violations = [];

    // Check for direct identifiers
    if (profile.studentId) violations.push('studentId present');
    if (profile.name) violations.push('name present');
    if (profile.surname) violations.push('surname present');
    if (profile.idNumber) violations.push('idNumber present');
    if (profile.email) violations.push('email present');
    if (profile.phone) violations.push('phone present');
    if (profile.schoolName) violations.push('schoolName present');
    if (profile.address) violations.push('address present');

    // Check for specific location (should be province only)
    if (profile.location && !this._isProvinceOnly(profile.location)) {
      violations.push('specific location present');
    }

    // Check for exact marks (should be generalised)
    if (profile.mathMark && profile.mathMark % 5 !== 0) {
      violations.push('exact marks present (not generalised)');
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  _isProvinceOnly(location) {
    const provinces = [
      'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape',
      'Free State', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West'
    ];
    return provinces.includes(location);
  }
}

// Export singleton instance
export const popiaSanitiser = new POPIASanitiser({
  strictMode: true,
  logSanitisation: true
});
