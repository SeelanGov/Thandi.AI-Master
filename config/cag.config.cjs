/**
 * CAG Quality Layer Configuration
 * 
 * Configuration settings for the Critic-Auditor-Governance quality control system
 */

const CAGConfig = {
  // LLM Settings
  llmModel: process.env.CAG_LLM_MODEL || 'gpt-4o-mini',
  llmProvider: process.env.CAG_LLM_PROVIDER || 'openai',
  llmTimeout: 1500, // milliseconds
  
  // Processing Settings
  maxProcessingTime: 2000, // milliseconds - total CAG processing timeout
  skipLLMIfRuleConfidence: 0.95, // Skip LLM verification if rule confidence is this high
  
  // Strictness
  strictMode: process.env.CAG_STRICT_MODE === 'true',
  
  // Fallback Behavior
  enableFallback: true,
  fallbackToRAGDraft: true,
  
  // Logging
  enableLogging: process.env.CAG_ENABLE_LOGGING !== 'false', // Default to true
  logLevel: process.env.CAG_LOG_LEVEL || 'info', // 'debug', 'info', 'warn', 'error'
  
  // Rule-Based Checks
  rules: {
    enableEntityVerification: true,
    enableDataValidation: true,
    enablePolicyChecks: true,
    enableStructuralChecks: true,
  },
  
  // Performance Targets (for monitoring)
  performanceTargets: {
    ruleChecks: 200, // milliseconds
    llmVerification: 1500, // milliseconds
    totalProcessing: 2000, // milliseconds
    fallbackDecision: 50, // milliseconds
  },
  
  // Thresholds for Task 2 (RuleBasedChecker)
  thresholds: {
    minApprovalScore: 0.7, // Minimum confidence score to approve
    criticalIssueThreshold: 0, // Max critical issues allowed
    highIssueThreshold: 2, // Max high severity issues allowed
  },
};

module.exports = CAGConfig;
