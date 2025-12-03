/**
 * CAG Quality Layer - Main Entry Point
 * 
 * Exports the main CAGLayer class and related utilities
 */

// Main CAG Layer orchestrator (to be implemented in Task 6)
// const CAGLayer = require('./cag-layer');

// Component exports
const CAGLayer = require('./cag-layer.cjs'); // Task 6 - Complete
const RuleBasedChecker = require('./rule-based-checker.cjs'); // Task 2 - Complete
const SourceGroundingValidator = require('./source-grounding-validator.cjs'); // Task 3 - Complete
const LLMVerifier = require('./llm-verifier.cjs'); // Task 4 - Complete
const DecisionMaker = require('./decision-maker.cjs'); // Task 5 - Complete

// Configuration
const CAGConfig = require('../../config/cag.config.cjs');

// Types (JSDoc definitions)
require('./types.cjs');

module.exports = {
  CAGLayer, // Task 6 - Complete
  RuleBasedChecker, // Task 2 - Complete
  SourceGroundingValidator, // Task 3 - Complete
  LLMVerifier, // Task 4 - Complete
  DecisionMaker, // Task 5 - Complete
  CAGConfig,
};
