/**
 * CAG Quality Layer - Rule-Based Checker
 * 
 * Fast, deterministic validation checks for LLM-generated career guidance.
 * This component performs rule-based validation without making LLM calls.
 * 
 * @typedef {import('./types').RuleCheckResult} RuleCheckResult
 * @typedef {import('./types').Issue} Issue
 * @typedef {import('./types').RAGChunk} RAGChunk
 * @typedef {import('./types').StudentProfile} StudentProfile
 */

const CAGConfig = require('../../config/cag.config.cjs');
const fs = require('fs').promises;
const path = require('path');

/**
 * Rule-Based Checker Component
 * 
 * Performs fast, deterministic validation of LLM outputs using:
 * - Entity verification (institutions, careers, qualifications)
 * - Data validation (salary formats, dates, URLs)
 * - Policy rule application (SA compliance)
 * - Structural checks (format, completeness)
 * 
 * Validates Requirements: 1.1, 1.2, 1.3, 1.4, 6.2, 6.3, 6.4, 2.4, 5.4, 7.1, 7.2, 7.5, 1.5
 */
class RuleBasedChecker {
  constructor(config = {}, supabaseClient = null) {
    this.config = { ...CAGConfig, ...config };
    this.supabase = supabaseClient;
    this.policyRules = [];
    this.rulesLoaded = false;
  }

  /**
   * Main check method - performs all rule-based validation
   * Task 2.1: Create RuleBasedChecker class with check() method
   * 
   * @param {Object} input - Input data
   * @param {string} input.draftAnswer - LLM-generated draft answer
   * @param {RAGChunk[]} input.ragChunks - Retrieved knowledge chunks
   * @param {StudentProfile} input.studentProfile - Student context
   * @param {string} [input.query] - Original student query
   * @returns {Promise<RuleCheckResult>} Rule check results
   */
  async check({ draftAnswer, ragChunks, studentProfile, query }) {
    const startTime = Date.now();
    const issues = [];

    try {
      // Load policy rules if not already loaded
      if (!this.rulesLoaded) {
        await this.loadPolicyRules();
      }

      // Run all checks in parallel for performance
      const [structuralIssues, entityIssues, dataIssues, policyIssues] = await Promise.all([
        // 2.5: Structural checks
        this._checkStructure(draftAnswer),
        // 2.2: Entity verification
        this._verifyEntities(draftAnswer, ragChunks),
        // 2.3: Data validation
        this._validateData(draftAnswer),
        // 2.4: Policy rule checks
        this._checkPolicyCompliance(draftAnswer, studentProfile, query)
      ]);

      issues.push(...structuralIssues, ...entityIssues, ...dataIssues, ...policyIssues);

      // Calculate confidence score
      const confidence = this._calculateConfidence(issues);
      const passed = issues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0;

      const processingTime = Date.now() - startTime;

      // Log performance warning if exceeding target
      if (processingTime > this.config.performanceTargets.ruleChecks) {
        console.warn(`[CAG] Rule checks exceeded target: ${processingTime}ms > ${this.config.performanceTargets.ruleChecks}ms`);
      }

      return {
        passed,
        issues,
        confidence,
        metadata: {
          processingTime,
          rulesApplied: this.policyRules.length,
          checksPerformed: ['structural', 'entity', 'data', 'policy']
        }
      };
    } catch (error) {
      console.error('[CAG] Rule checking failed:', error);
      return {
        passed: false,
        issues: [{
          type: 'structure',
          severity: 'critical',
          location: 'rule_checker',
          problem: `Rule checking failed: ${error.message}`,
          correction: null
        }],
        confidence: 0,
        metadata: {
          processingTime: Date.now() - startTime,
          error: error.message
        }
      };
    }
  }

  /**
   * Task 2.4: Load policy rules from rules/ directory
   * Validates Requirements: 7.1, 7.2
   * @private
   */
  async loadPolicyRules() {
    try {
      const rulesDir = path.join(process.cwd(), 'rules');
      const ruleFiles = [
        'thandi-math-hate-healthcare.md',
        'thandi-nsfas-prioritization.md',
        'thandi-scope-boundary.md',
        'thandi-verification-mandate.md',
        'thandi-dangerous-queries.md'
      ];

      this.policyRules = [];

      for (const ruleFile of ruleFiles) {
        try {
          const rulePath = path.join(rulesDir, ruleFile);
          const ruleContent = await fs.readFile(rulePath, 'utf-8');
          
          // Parse rule file to extract key patterns
          const rule = this._parseRuleFile(ruleFile, ruleContent);
          if (rule) {
            this.policyRules.push(rule);
          }
        } catch (err) {
          console.warn(`[CAG] Could not load rule file ${ruleFile}:`, err.message);
        }
      }

      this.rulesLoaded = true;
      
      if (this.config.enableLogging) {
        console.log(`[CAG] Loaded ${this.policyRules.length} policy rules`);
      }
    } catch (error) {
      console.error('[CAG] Failed to load policy rules:', error);
      // Continue with empty rules rather than failing
      this.policyRules = [];
      this.rulesLoaded = true;
    }
  }

  /**
   * Parse rule markdown file to extract patterns
   * @private
   */
  _parseRuleFile(filename, content) {
    const ruleId = filename.replace('.md', '');
    
    // Extract key patterns based on rule type
    const patterns = {
      'thandi-math-hate-healthcare': {
        id: 'math_hate_healthcare',
        pattern: /(?:medical|doctor|healthcare|nursing|pharmacy)/i,
        checkSubjects: true,
        severity: 'high',
        message: 'Healthcare career suggested without required Math/Science subjects',
        correction: 'Verify student has Math and Physical Science before suggesting healthcare careers'
      },
      'thandi-nsfas-prioritization': {
        id: 'nsfas_prioritization',
        pattern: /(?:expensive|high cost|R\s*[5-9]\d{4,})/i,
        checkBudget: true,
        severity: 'medium',
        message: 'Expensive option suggested for budget-constrained student',
        correction: 'Prioritize NSFAS-eligible and affordable options for students with budget constraints'
      },
      'thandi-scope-boundary': {
        id: 'scope_boundary',
        pattern: /(?:medical advice|legal advice|financial advice|therapy|counseling)/i,
        severity: 'critical',
        message: 'Answer provides advice outside career guidance scope',
        correction: 'Focus on career guidance only, avoid medical, legal, or financial advice'
      },
      'thandi-verification-mandate': {
        id: 'verification_mandate',
        requiresWarning: true,
        severity: 'medium',
        message: 'Missing verification warning',
        correction: 'Include verification warning for students to confirm details with institutions'
      },
      'thandi-dangerous-queries': {
        id: 'dangerous_queries',
        pattern: /(?:harm|suicide|violence|illegal|drugs)/i,
        severity: 'critical',
        message: 'Query contains dangerous or inappropriate content',
        correction: 'Provide supportive response and direct to appropriate resources'
      }
    };

    return patterns[ruleId] || null;
  }

  /**
   * Task 2.5: Structural validation checks
   * Validates Requirements: 7.5, 1.5
   * @private
   */
  async _checkStructure(draftAnswer) {
    const issues = [];

    // Check minimum length
    if (!draftAnswer || draftAnswer.trim().length < 50) {
      issues.push({
        type: 'structure',
        severity: 'critical',
        location: 'answer_length',
        problem: 'Answer is too short or empty',
        correction: 'Provide a more detailed response (minimum 50 characters)'
      });
    }

    // Check for TODO markers or placeholders
    if (/TODO|FIXME|\[\[.*\]\]|<placeholder>/i.test(draftAnswer)) {
      issues.push({
        type: 'structure',
        severity: 'high',
        location: 'content_markers',
        problem: 'Answer contains unfinished content markers',
        correction: 'Remove TODO, FIXME, or placeholder markers'
      });
    }

    // Check for speculative/uncertain language
    const speculativePatterns = [
      /I might be wrong/i,
      /I'm not sure/i,
      /I think maybe/i,
      /probably not accurate/i,
      /this might not be correct/i,
      /I don't have enough information/i
    ];

    for (const pattern of speculativePatterns) {
      if (pattern.test(draftAnswer)) {
        issues.push({
          type: 'tone',
          severity: 'medium',
          location: 'speculative_language',
          problem: 'Answer contains uncertain or speculative language',
          correction: 'Use confident, factual language based on retrieved information'
        });
        break; // Only report once
      }
    }

    // Check for unsupported general claims
    const unsupportedPatterns = [
      /studies show/i,
      /research indicates/i,
      /according to experts/i,
      /it is well known that/i,
      /everyone knows/i
    ];

    for (const pattern of unsupportedPatterns) {
      if (pattern.test(draftAnswer)) {
        issues.push({
          type: 'structure',
          severity: 'high',
          location: 'unsupported_claims',
          problem: 'Answer makes vague claims without citing specific sources',
          correction: 'Only make claims that are directly supported by retrieved documents'
        });
        break;
      }
    }

    // Check for definitive prescriptions (should provide options, not commands)
    const prescriptivePatterns = [
      /you must become/i,
      /you should definitely/i,
      /the only option is/i,
      /you have to study/i
    ];

    for (const pattern of prescriptivePatterns) {
      if (pattern.test(draftAnswer)) {
        issues.push({
          type: 'tone',
          severity: 'medium',
          location: 'prescriptive_language',
          problem: 'Answer uses definitive prescriptions instead of providing options',
          correction: 'Provide career options and guidance, not definitive commands'
        });
        break;
      }
    }

    return issues;
  }

  /**
   * Task 2.2: Entity verification against known SA entities
   * Validates Requirements: 6.2, 6.3, 6.4
   * @private
   */
  async _verifyEntities(draftAnswer, ragChunks) {
    const issues = [];

    // Extract potential entities from the answer
    const entities = this._extractEntities(draftAnswer);
    const ragEntities = this._extractRAGEntities(ragChunks);

    // Check institutions
    for (const institution of entities.institutions) {
      if (!this._isValidEntity(institution, ragEntities.institutions)) {
        issues.push({
          type: 'hallucination',
          severity: 'high',
          location: `institution: "${institution}"`,
          problem: `Institution "${institution}" not found in retrieved knowledge base`,
          correction: 'Only mention institutions that appear in the retrieved documents'
        });
      }
    }

    // Check careers
    for (const career of entities.careers) {
      if (!this._isValidEntity(career, ragEntities.careers)) {
        issues.push({
          type: 'hallucination',
          severity: 'medium',
          location: `career: "${career}"`,
          problem: `Career "${career}" may not be accurately represented in sources`,
          correction: 'Ensure career information matches retrieved documents'
        });
      }
    }

    // Check qualifications
    for (const qualification of entities.qualifications) {
      if (!this._isValidEntity(qualification, ragEntities.qualifications)) {
        issues.push({
          type: 'hallucination',
          severity: 'high',
          location: `qualification: "${qualification}"`,
          problem: `Qualification "${qualification}" not found in retrieved sources`,
          correction: 'Only mention qualifications that appear in retrieved documents'
        });
      }
    }

    return issues;
  }

  /**
   * Task 2.3: Data format validation
   * Validates Requirements: 2.4, 5.4
   * @private
   */
  async _validateData(draftAnswer) {
    const issues = [];

    // Validate salary formats (South African Rands)
    const salaryMatches = draftAnswer.match(/R\s*([0-9,\s]+)/g) || [];
    for (const salary of salaryMatches) {
      if (!this._isValidSalarySA(salary)) {
        issues.push({
          type: 'inaccuracy',
          severity: 'medium',
          location: `salary: ${salary}`,
          problem: 'Salary format or range may be incorrect for South African context',
          correction: 'Use proper South African Rand format with realistic ranges (e.g., R15,000 - R45,000)'
        });
      }
    }

    // Validate APS scores (20-50 range for SA universities)
    const apsMatches = draftAnswer.match(/APS\s*(?:score\s*)?(?:of\s*)?([0-9]+)/gi) || [];
    for (const apsMatch of apsMatches) {
      const score = parseInt(apsMatch.match(/([0-9]+)/)[1]);
      if (score < 18 || score > 50) {
        issues.push({
          type: 'inaccuracy',
          severity: 'high',
          location: `APS score: ${score}`,
          problem: 'APS score is outside valid range for South African universities',
          correction: 'APS scores should typically be between 18-50 for SA universities'
        });
      }
    }

    // Validate URLs (should be HTTPS and from trusted domains)
    const urlMatches = draftAnswer.match(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/g) || [];
    for (const url of urlMatches) {
      if (!this._isValidURL(url)) {
        issues.push({
          type: 'inaccuracy',
          severity: 'low',
          location: `URL: ${url}`,
          problem: 'URL may not be from a trusted South African education source',
          correction: 'Only include URLs from official SA education institutions (.ac.za, .gov.za, etc.)'
        });
      }
    }

    // Validate dates (should be reasonable and in SA format)
    const dateMatches = draftAnswer.match(/\b(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-](\d{4})\b/g) || [];
    for (const date of dateMatches) {
      if (!this._isValidDate(date)) {
        issues.push({
          type: 'inaccuracy',
          severity: 'low',
          location: `date: ${date}`,
          problem: 'Date format or value may be incorrect',
          correction: 'Use valid South African date format (DD/MM/YYYY)'
        });
      }
    }

    return issues;
  }

  /**
   * Task 2.4: Policy compliance checks
   * Validates Requirements: 7.1, 7.2
   * @private
   */
  async _checkPolicyCompliance(draftAnswer, studentProfile, query) {
    const issues = [];

    // Apply loaded policy rules
    for (const rule of this.policyRules) {
      const violation = await this._checkRule(rule, draftAnswer, studentProfile, query);
      if (violation) {
        issues.push(violation);
      }
    }

    return issues;
  }

  /**
   * Check individual policy rule
   * @private
   */
  async _checkRule(rule, draftAnswer, studentProfile, query) {
    // Check pattern-based rules
    if (rule.pattern && rule.pattern.test(draftAnswer)) {
      // Special handling for subject-dependent rules
      if (rule.checkSubjects && studentProfile?.subjects) {
        const hasMath = studentProfile.subjects.some(s => /math/i.test(s));
        const hasScience = studentProfile.subjects.some(s => /physical science|life science/i.test(s));
        
        if (!hasMath || !hasScience) {
          return {
            type: 'policy',
            severity: rule.severity,
            location: `rule: ${rule.id}`,
            problem: rule.message,
            correction: rule.correction
          };
        }
      }
      
      // Special handling for budget-dependent rules
      if (rule.checkBudget && studentProfile?.constraints?.budget === 'limited') {
        return {
          type: 'policy',
          severity: rule.severity,
          location: `rule: ${rule.id}`,
          problem: rule.message,
          correction: rule.correction
        };
      }
      
      // General pattern match
      if (!rule.checkSubjects && !rule.checkBudget) {
        return {
          type: 'policy',
          severity: rule.severity,
          location: `rule: ${rule.id}`,
          problem: rule.message,
          correction: rule.correction
        };
      }
    }

    // Check for required warnings
    if (rule.requiresWarning) {
      const hasWarning = /verify|confirm|check with|contact.*institution/i.test(draftAnswer);
      if (!hasWarning) {
        return {
          type: 'policy',
          severity: rule.severity,
          location: `rule: ${rule.id}`,
          problem: rule.message,
          correction: rule.correction
        };
      }
    }

    return null;
  }

  /**
   * Calculate confidence score based on issues found
   * @private
   */
  _calculateConfidence(issues) {
    let confidence = 1.0;

    for (const issue of issues) {
      switch (issue.severity) {
        case 'critical':
          confidence -= 0.5;
          break;
        case 'high':
          confidence -= 0.3;
          break;
        case 'medium':
          confidence -= 0.15;
          break;
        case 'low':
          confidence -= 0.05;
          break;
      }
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Extract entities from text
   * @private
   */
  _extractEntities(text) {
    const institutions = new Set();
    const careers = new Set();
    const qualifications = new Set();

    // Common SA institution patterns
    const institutionPatterns = [
      /University of ([A-Z][A-Za-z\s]+)/g,
      /([A-Z][A-Za-z\s]+) University/g,
      /([A-Z][A-Za-z\s]+) (?:College|TVET)/g,
      /(UCT|Wits|UP|Stellenbosch|UJ|UKZN|NWU|UFS|UFH|WSU|CPUT|DUT|TUT|VUT|MUT)/g
    ];

    for (const pattern of institutionPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const inst = (match[1] || match[0]).trim();
        if (inst.length > 2) institutions.add(inst);
      }
    }

    // Career extraction patterns
    const careerPatterns = [
      /(?:become a|work as a|career as a|pursue|study) ([A-Z][A-Za-z\s]+?)(?:\.|,|;|\s+(?:at|in|with|for|and))/g,
      /([A-Z][A-Za-z\s]+?) (?:career|profession|field|industry)/g
    ];

    for (const pattern of careerPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const career = match[1].trim();
        if (career.length > 3 && career.length < 50) careers.add(career);
      }
    }

    // Qualification patterns (SA-specific)
    const qualificationPatterns = [
      /(Bachelor|Diploma|Certificate|Honours|Masters|PhD|Doctorate) (?:of|in|degree) ([A-Z][A-Za-z\s]+)/g,
      /(B\.?[A-Z][a-z]*|M\.?[A-Z][a-z]*|PhD)/g,
      /(NQF Level [0-9]+)/g
    ];

    for (const pattern of qualificationPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const qual = (match[0]).trim();
        if (qual.length > 2) qualifications.add(qual);
      }
    }

    return {
      institutions: Array.from(institutions),
      careers: Array.from(careers),
      qualifications: Array.from(qualifications)
    };
  }

  /**
   * Extract entities from RAG chunks
   * @private
   */
  _extractRAGEntities(ragChunks) {
    const institutions = new Set();
    const careers = new Set();
    const qualifications = new Set();

    for (const chunk of ragChunks) {
      // Extract from metadata
      if (chunk.chunk_metadata?.institution) {
        institutions.add(chunk.chunk_metadata.institution);
      }
      if (chunk.chunk_metadata?.career) {
        careers.add(chunk.chunk_metadata.career);
      }
      if (chunk.chunk_metadata?.qualification) {
        qualifications.add(chunk.chunk_metadata.qualification);
      }

      // Extract from chunk text
      const chunkEntities = this._extractEntities(chunk.chunk_text);
      chunkEntities.institutions.forEach(inst => institutions.add(inst));
      chunkEntities.careers.forEach(career => careers.add(career));
      chunkEntities.qualifications.forEach(qual => qualifications.add(qual));
    }

    return {
      institutions: Array.from(institutions),
      careers: Array.from(careers),
      qualifications: Array.from(qualifications)
    };
  }

  /**
   * Validate entity against known entities (fuzzy matching)
   * @private
   */
  _isValidEntity(entity, knownEntities) {
    if (knownEntities.length === 0) return true; // Skip if no entities to check against

    const entityLower = entity.toLowerCase();
    
    return knownEntities.some(known => {
      const knownLower = known.toLowerCase();
      // Exact match
      if (entityLower === knownLower) return true;
      // Contains match
      if (entityLower.includes(knownLower) || knownLower.includes(entityLower)) return true;
      // Fuzzy match for common abbreviations
      if (this._fuzzyMatch(entityLower, knownLower)) return true;
      return false;
    });
  }

  /**
   * Fuzzy matching for common abbreviations
   * @private
   */
  _fuzzyMatch(str1, str2) {
    // Handle common SA university abbreviations
    const abbrevMap = {
      'uct': 'university of cape town',
      'wits': 'university of the witwatersrand',
      'up': 'university of pretoria',
      'uj': 'university of johannesburg',
      'ukzn': 'university of kwazulu-natal',
      'nwu': 'north-west university',
      'ufs': 'university of the free state'
    };

    const mapped1 = abbrevMap[str1] || str1;
    const mapped2 = abbrevMap[str2] || str2;

    return mapped1 === mapped2 || mapped1.includes(mapped2) || mapped2.includes(mapped1);
  }

  /**
   * Validate South African salary format
   * @private
   */
  _isValidSalarySA(salary) {
    // Extract numeric value
    const cleanSalary = salary.replace(/[R,\s]/g, '');
    const amount = parseInt(cleanSalary);
    
    // Reasonable salary range for SA (R5,000 - R2,000,000 per month)
    return !isNaN(amount) && amount >= 5000 && amount <= 2000000;
  }

  /**
   * Validate URL trustworthiness
   * @private
   */
  _isValidURL(url) {
    try {
      const urlObj = new URL(url);
      
      // Must be HTTPS
      if (urlObj.protocol !== 'https:') return false;
      
      // Check for trusted SA domains
      const trustedDomains = [
        '.gov.za',
        '.ac.za',
        '.edu.za',
        'dhet.gov.za',
        'saqa.org.za',
        'nsfas.org.za',
        'usaf.ac.za'
      ];
      
      return trustedDomains.some(domain => urlObj.hostname.includes(domain));
    } catch {
      return false;
    }
  }

  /**
   * Validate date format and reasonableness
   * @private
   */
  _isValidDate(dateStr) {
    try {
      const parts = dateStr.split(/[\/\-]/);
      if (parts.length !== 3) return false;
      
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      const year = parseInt(parts[2]);
      
      // Basic validation
      if (day < 1 || day > 31) return false;
      if (month < 1 || month > 12) return false;
      if (year < 2020 || year > 2030) return false; // Reasonable range for education dates
      
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = RuleBasedChecker;
