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
 * @property {string[]} revisionsApplied - Revisions that were applied
 * @property {string[]} sourcesUsed - RAG chunk IDs used
 * @property {string} [llmModel] - LLM model used (if any)
 */

/**
 * @typedef {Object} Issue
 * @property {'hallucination'|'inaccuracy'|'tone'|'policy'|'structure'} type - Issue type
 * @property {'critical'|'high'|'medium'|'low'} severity - Issue severity
 * @property {string} location - Where in the text the issue occurs
 * @property {string} problem - Description of the problem
 * @property {string} [correction] - Suggested correction
 */

/**
 * @typedef {Object} RuleCheckResult
 * @property {boolean} passed - Whether all rule checks passed
 * @property {Issue[]} issues - Issues found during rule checks
 * @property {number} confidence - Confidence score (0-1)
 */

/**
 * @typedef {Object} LLMVerificationResult
 * @property {boolean} approved - Whether LLM approved the draft
 * @property {Issue[]} issues - Issues found by LLM
 * @property {'approve'|'revise'|'reject'} recommendation - LLM recommendation
 * @property {boolean} [skipped] - Whether LLM verification was skipped
 * @property {string} [reason] - Reason for skipping (if applicable)
 */

module.exports = {};


/**
 * @typedef {Object} LLMVerificationResult
 * @property {boolean} skipped - Whether LLM verification was skipped
 * @property {string} [reason] - Reason for skipping (if skipped)
 * @property {boolean} approved - Whether answer is approved by LLM
 * @property {Issue[]} issues - Issues found by LLM
 * @property {string} recommendation - LLM recommendation ('approve', 'revise', 'reject', 'fallback')
 * @property {number} [hallucinationsDetected] - Number of hallucinations detected
 * @property {Object} metadata - Processing metadata
 */


/**
 * @typedef {Object} DecisionResult
 * @property {string} decision - Final decision ('approved', 'revised', 'rejected', 'fallback')
 * @property {string} finalAnswer - Final answer to deliver to student
 * @property {Issue[]} issues - All issues found during verification
 * @property {Array<Object>} revisionsApplied - List of revisions that were applied
 * @property {Object} metadata - Decision metadata
 */


/**
 * @typedef {Object} CAGInput
 * @property {string} draftAnswer - LLM-generated draft answer to verify
 * @property {RAGChunk[]} ragChunks - Retrieved RAG chunks for grounding
 * @property {Object} studentProfile - Student context information
 * @property {string} [query] - Original student query
 * @property {string} [ragDraft] - Fallback RAG-only draft
 * @property {Object} [timeContext] - Time-sensitive context
 * @property {Object} [options] - Verification options
 * @property {boolean} [options.skipLLMVerification] - Skip LLM verification stage
 * @property {boolean} [options.strictMode] - Enable strict validation mode
 * @property {string} [options.llmModel] - Override LLM model for verification
 */

/**
 * @typedef {Object} RAGChunk
 * @property {string} id - Chunk identifier
 * @property {string} chunk_text - Chunk content
 * @property {Object} chunk_metadata - Chunk metadata
 * @property {string} chunk_metadata.source - Source identifier
 * @property {string} chunk_metadata.category - Content category
 * @property {string} [chunk_metadata.career] - Career name if applicable
 * @property {string} [chunk_metadata.institution] - Institution name if applicable
 * @property {number} similarity - Similarity score to query
 */

/**
 * @typedef {Object} VerificationResult
 * @property {boolean} success - Whether verification completed successfully
 * @property {string} decision - Final decision ('approved', 'revised', 'rejected', 'fallback')
 * @property {string} finalAnswer - Final answer to deliver to student
 * @property {Object} metadata - Verification metadata
 * @property {number} metadata.processingTime - Total processing time in ms
 * @property {string[]} metadata.stagesCompleted - Stages that completed
 * @property {Issue[]} metadata.issuesDetected - All issues detected
 * @property {Revision[]} metadata.revisionsApplied - Revisions applied to answer
 * @property {string[]} metadata.sourcesUsed - Sources referenced
 * @property {string} [metadata.llmModel] - LLM model used for verification
 * @property {number} [metadata.confidence] - Overall confidence score
 * @property {boolean} [metadata.requiresHuman] - Whether human review is needed
 * @property {number} [metadata.ruleConfidence] - Rule-based confidence score
 * @property {number} [metadata.groundingScore] - Source grounding score
 * @property {boolean} [metadata.llmApproved] - Whether LLM approved
 * @property {Object} [metadata.decisionReasoning] - Decision reasoning details
 * @property {string} [metadata.error] - Error message if failed
 * @property {string} [metadata.fallbackReason] - Reason for fallback
 */

/**
 * @typedef {Object} Revision
 * @property {string} type - Type of revision
 * @property {string} original - Original text
 * @property {string} corrected - Corrected text
 * @property {string} reason - Reason for revision
 */
