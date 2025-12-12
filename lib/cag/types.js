/**
 * CAG Quality Layer - Type Definitions
 * 
 * Core TypeScript-style JSDoc type definitions for the CAG (Critic-Auditor-Governance) Layer
 */

/**
 * @typedef {Object} CAGInput
 * @property {string} draftAnswer - LLM-generated draft answer
 * @property {RAGChunk[]} ragChunks - Retrieved knowledge chunks from RAG
 * @property {StudentProfile} studentProfile - Student context information
 * @property {string} [ragDraft] - Original RAG draft (fallback)
 * @property {CAGOptions} [options] - Optional configuration
 * @property {string} [query] - Original student query
 * @property {Object} [timeContext] - Time-sensitive context
 */

/**
 * @typedef {Object} CAGOptions
 * @property {boolean} [skipLLMVerification] - Skip LLM verification stage
 * @property {boolean} [strictMode] - Enable strict verification mode
 * @property {string} [llmModel] - LLM model to use for verification
 */

/**
 * @typedef {Object} RAGChunk
 * @property {string} id - Unique chunk identifier
 * @property {string} chunk_text - Text content of the chunk
 * @property {ChunkMetadata} chunk_metadata - Metadata about the chunk
 * @property {number} similarity - Similarity score to query
 */

/**
 * @typedef {Object} ChunkMetadata
 * @property {string} source - Source document/file
 * @property {string} category - Content category
 * @property {string} [career] - Related career (if applicable)
 * @property {string} [institution] - Related institution (if applicable)
 */

/**
 * @typedef {Object} StudentProfile
 * @property {string} [grade] - Student grade level
 * @property {string[]} [subjects] - Selected subjects
 * @property {string[]} [interests] - Career interests
 * @property {Object} [constraints] - Budget, location, etc.
 */

/**
 * @typedef {Object} VerificationResult
 * @property {boolean} success - Whether verification completed successfully
 * @property {'approved'|'revised'|'rejected'|'fallback'} decision - Final decision
 * @property {string} finalAnswer - Final answer to deliver
 * @property {VerificationMetadata} metadata - Processing metadata
 */

/**
 * @typedef {Object} VerificationMetadata
 * @property {number} processingTime - Time taken in milliseconds
 * @property {string[]} stagesCompleted - Stages that completed
 * @property {Issue[]} issuesDetected - Issues found during verification
 * @property {Revision[]} revisionsApplied - Revisions that were applied
 * @property {string[]} sourcesUsed - RAG chunk IDs used
 * @property {string} [llmModel] - LLM model used (if any)
 * @property {number} [confidence] - Overall confidence score
 * @property {boolean} [requiresHuman] - Whether human review is needed
 * @property {number} [ruleConfidence] - Rule-based confidence score
 * @property {number} [groundingScore] - Source grounding score
 * @property {boolean} [llmApproved] - Whether LLM approved
 * @property {Object} [decisionReasoning] - Decision reasoning details
 * @property {string} [error] - Error message if failed
 * @property {string} [fallbackReason] - Reason for fallback
 */

/**
 * @typedef {Object} Issue
 * @property {'hallucination'|'inaccuracy'|'tone'|'policy'|'structure'|'system'} type - Issue type
 * @property {'critical'|'high'|'medium'|'low'} severity - Issue severity
 * @property {string} location - Where in the text the issue occurs
 * @property {string} problem - Description of the problem
 * @property {string} [correction] - Suggested correction
 */

/**
 * @typedef {Object} Revision
 * @property {string} type - Type of revision
 * @property {string} original - Original text
 * @property {string} corrected - Corrected text
 * @property {string} reason - Reason for revision
 */

/**
 * @typedef {Object} RuleCheckResult
 * @property {boolean} passed - Whether all rule checks passed
 * @property {Issue[]} issues - Issues found during rule checks
 * @property {number} confidence - Confidence score (0-1)
 */

/**
 * @typedef {Object} LLMVerificationResult
 * @property {boolean} skipped - Whether LLM verification was skipped
 * @property {string} [reason] - Reason for skipping (if skipped)
 * @property {boolean} approved - Whether answer is approved by LLM
 * @property {Issue[]} issues - Issues found by LLM
 * @property {string} recommendation - LLM recommendation ('approve', 'revise', 'reject', 'fallback')
 * @property {number} [hallucinationsDetected] - Number of hallucinations detected
 * @property {Object} metadata - Processing metadata
 * @property {Array} [corrections] - Suggested corrections
 */

/**
 * @typedef {Object} DecisionResult
 * @property {string} decision - Final decision ('approved', 'revised', 'rejected', 'fallback')
 * @property {string} finalAnswer - Final answer to deliver to student
 * @property {Issue[]} issues - All issues found during verification
 * @property {Revision[]} revisionsApplied - List of revisions that were applied
 * @property {Object} metadata - Decision metadata
 * @property {number} [confidence] - Confidence score
 * @property {boolean} [requiresHuman] - Whether human review needed
 * @property {Object} [reasoning] - Decision reasoning
 */

export {};
