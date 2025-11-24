// lib/rag/retrieval.js
// STEP 3: Context Assembly & Student Profile Classification

/**
 * Extract student profile from query text
 * Identifies academic strengths/weaknesses, financial constraints, interests
 * @param {string} query - Student's question
 * @returns {Object} - Student profile with prioritized modules
 */
export function extractStudentProfile(query) {
  const queryLower = query.toLowerCase();
  
  const profile = {
    academicStrengths: [],
    academicWeaknesses: [],
    interests: [],
    financialConstraint: 'unknown', // 'low', 'medium', 'high', 'unknown'
    priorityModules: []
  };

  // Academic strengths detection
  const strengthPatterns = [
    { pattern: /good at (math|mathematics|maths)/i, subject: 'mathematics' },
    { pattern: /strong in (math|mathematics|maths)/i, subject: 'mathematics' },
    { pattern: /love (math|mathematics|maths)/i, subject: 'mathematics' },
    { pattern: /excel at (math|mathematics|maths)/i, subject: 'mathematics' },
    { pattern: /good at (physics|physical science)/i, subject: 'physics' },
    { pattern: /strong in (physics|physical science)/i, subject: 'physics' },
    { pattern: /love (physics|physical science)/i, subject: 'physics' },
    { pattern: /good at (science|life science)/i, subject: 'science' },
    { pattern: /strong in (science|life science)/i, subject: 'science' },
    { pattern: /good at (english|language)/i, subject: 'english' },
    { pattern: /strong in (english|language)/i, subject: 'english' },
    { pattern: /good at (accounting|business)/i, subject: 'accounting' },
    { pattern: /strong in (accounting|business)/i, subject: 'accounting' }
  ];

  strengthPatterns.forEach(({ pattern, subject }) => {
    if (pattern.test(queryLower) && !profile.academicStrengths.includes(subject)) {
      profile.academicStrengths.push(subject);
    }
  });

  // Academic weaknesses detection
  const weaknessPatterns = [
    { pattern: /hate (math|mathematics|maths)/i, subject: 'mathematics' },
    { pattern: /bad at (math|mathematics|maths)/i, subject: 'mathematics' },
    { pattern: /struggle with (math|mathematics|maths)/i, subject: 'mathematics' },
    { pattern: /weak in (math|mathematics|maths)/i, subject: 'mathematics' },
    { pattern: /don't have (math|mathematics|maths)/i, subject: 'mathematics' },
    { pattern: /hate (physics|physical science)/i, subject: 'physics' },
    { pattern: /bad at (physics|physical science)/i, subject: 'physics' },
    { pattern: /struggle with (physics|physical science)/i, subject: 'physics' },
    { pattern: /weak in (physics|physical science)/i, subject: 'physics' },
    { pattern: /don't have (physics|physical science)/i, subject: 'physics' },
    { pattern: /hate (science|life science)/i, subject: 'science' },
    { pattern: /bad at (science|life science)/i, subject: 'science' },
    { pattern: /struggle with (science|life science)/i, subject: 'science' }
  ];

  weaknessPatterns.forEach(({ pattern, subject }) => {
    if (pattern.test(queryLower) && !profile.academicWeaknesses.includes(subject)) {
      profile.academicWeaknesses.push(subject);
    }
  });

  // Financial constraint detection (CRITICAL for bursary prioritization)
  const financialPatterns = {
    low: [
      /can't afford/i,
      /cannot afford/i,
      /can not afford/i,
      /too expensive/i,
      /no money/i,
      /poor family/i,
      /low income/i,
      /need financial help/i,
      /need funding/i,
      /need bursary/i,
      /need scholarship/i,
      /financial difficulty/i,
      /financial struggle/i
    ],
    medium: [
      /limited budget/i,
      /tight budget/i,
      /looking for affordable/i,
      /cost is a concern/i
    ]
  };

  if (financialPatterns.low.some(pattern => pattern.test(queryLower))) {
    profile.financialConstraint = 'low';
  } else if (financialPatterns.medium.some(pattern => pattern.test(queryLower))) {
    profile.financialConstraint = 'medium';
  }

  // Interest detection
  const interestPatterns = [
    { pattern: /interested in (technology|tech|computers|coding|programming)/i, interest: 'technology' },
    { pattern: /love (technology|tech|computers|coding|programming)/i, interest: 'technology' },
    { pattern: /passionate about (technology|tech|computers|coding|programming)/i, interest: 'technology' },
    { pattern: /interested in (business|entrepreneurship|commerce)/i, interest: 'business' },
    { pattern: /love (business|entrepreneurship|commerce)/i, interest: 'business' },
    { pattern: /interested in (healthcare|medicine|nursing|doctor)/i, interest: 'healthcare' },
    { pattern: /love (healthcare|medicine|nursing|doctor)/i, interest: 'healthcare' },
    { pattern: /interested in (engineering|building|design)/i, interest: 'engineering' },
    { pattern: /love (engineering|building|design)/i, interest: 'engineering' },
    { pattern: /interested in (data|analytics|statistics)/i, interest: 'data' },
    { pattern: /love (data|analytics|statistics)/i, interest: 'data' }
  ];

  interestPatterns.forEach(({ pattern, interest }) => {
    if (pattern.test(queryLower) && !profile.interests.includes(interest)) {
      profile.interests.push(interest);
    }
  });

  // Module prioritization logic
  profile.priorityModules = prioritizeModules(profile);

  return profile;
}

/**
 * Prioritize knowledge modules based on student profile
 * CRITICAL: Financial need bumps bursaries to #1 priority
 * @param {Object} profile - Student profile
 * @returns {Array<string>} - Ordered list of module names
 */
function prioritizeModules(profile) {
  const modules = [];

  // RULE 1: Financial need → Bursaries FIRST (CRITICAL)
  if (profile.financialConstraint === 'low' || profile.financialConstraint === 'medium') {
    modules.push('bursaries');
  }

  // RULE 2: Academic strengths/weaknesses → Subject-career mapping
  if (profile.academicStrengths.length > 0 || profile.academicWeaknesses.length > 0) {
    modules.push('subject_career_mapping');
  }

  // RULE 3: Always include careers (core module)
  modules.push('careers');

  // RULE 4: Tech interest → 4IR emerging jobs
  if (profile.interests.includes('technology') || profile.interests.includes('data')) {
    modules.push('4ir_emerging_jobs');
  }

  // RULE 5: Always include universities
  modules.push('sa_universities');

  // RULE 6: Add bursaries if not already added (for non-financial queries)
  if (!modules.includes('bursaries')) {
    modules.push('bursaries');
  }

  // Remove duplicates and return
  return [...new Set(modules)];
}

/**
 * Extract frameworks from retrieved chunks
 * Identifies known decision-making and career frameworks
 * @param {Array} chunks - Retrieved knowledge chunks
 * @returns {Array} - Array of detected frameworks with metadata
 */
export function extractFrameworks(chunks) {
  const frameworks = [];
  
  // Pattern matching for known frameworks
  const frameworkPatterns = {
    'V.I.S. Model': /V\.I\.S\.|Values.*Interest.*Skills|Values, Interests, Skills/i,
    'Career Choice Matrix': /career choice matrix|decision matrix|weighted.*factors.*Interest.*Ability/i,
    'Passion vs Pay': /passion vs pay|passion versus pay|four scenarios.*Dream Job.*Safety Net/i,
    '70/30 Rule': /70\/30|seventy.*thirty|70%.*stable.*30%.*passion/i,
    'AI Augmentation': /AI.*augment|human.*AI collaboration|AI.*enhance.*jobs/i,
    '5 Reality Check Questions': /5.*reality check|five.*questions.*Monday Morning Test/i,
    'Gut Check Method': /gut check|intuition.*rational.*score/i,
    'Risk Tolerance Assessment': /risk tolerance|financial.*risk.*assessment/i
  };
  
  chunks.forEach(chunk => {
    const chunkText = chunk.chunk_text || '';
    const metadata = chunk.chunk_metadata || {};
    
    Object.entries(frameworkPatterns).forEach(([name, pattern]) => {
      if (pattern.test(chunkText)) {
        // Check if we already have this framework
        if (!frameworks.some(f => f.name === name)) {
          frameworks.push({
            name,
            content: chunkText,
            source: metadata.module || chunk.module_name || 'unknown',
            chunkId: metadata.chunk_id || 'unknown'
          });
        }
      }
    });
  });
  
  return frameworks;
}

/**
 * Assemble context from retrieved chunks for LLM
 * NOW WITH FRAMEWORK DETECTION
 * @param {Array} chunks - Retrieved knowledge chunks
 * @param {Object} studentProfile - Student profile
 * @param {Object} options - Assembly options
 * @returns {Object} - Assembled context with metadata and frameworks
 */
export function assembleContext(chunks, studentProfile, options = {}) {
  const {
    maxTokens = 3000,
    includeMetadata = true,
    format = 'structured' // 'structured' or 'plain'
  } = options;

  // Estimate tokens (rough: 1 token ≈ 4 characters)
  const estimateTokens = (text) => Math.ceil(text.length / 4);

  let contextText = '';
  let tokensUsed = 0;
  const includedChunks = [];
  const sources = new Set();

  // Add profile summary
  const profileSummary = formatProfileSummary(studentProfile);
  contextText += profileSummary + '\n\n';
  tokensUsed += estimateTokens(profileSummary);

  // Add chunks with formatting
  contextText += 'Retrieved Knowledge:\n\n';

  for (const chunk of chunks) {
    const formattedChunk = formatChunk(chunk, format);
    const chunkTokens = estimateTokens(formattedChunk);

    // Check if adding this chunk would exceed token limit
    if (tokensUsed + chunkTokens > maxTokens) {
      console.warn(`Token limit reached. Included ${includedChunks.length}/${chunks.length} chunks`);
      break;
    }

    contextText += formattedChunk + '\n\n';
    tokensUsed += chunkTokens;
    includedChunks.push(chunk);

    // Track sources
    if (chunk.chunk_metadata?.source) {
      sources.add(chunk.chunk_metadata.source);
    }
  }

  // Extract frameworks from chunks
  const frameworks = extractFrameworks(includedChunks);
  
  return {
    context: contextText.trim(),
    studentProfile,
    chunks: includedChunks,
    frameworks, // NEW: Detected frameworks
    frameworksDetected: frameworks.length > 0, // NEW: Boolean flag
    metadata: {
      totalChunks: chunks.length,
      includedChunks: includedChunks.length,
      tokensUsed,
      sources: Array.from(sources),
      priorityModules: studentProfile.priorityModules,
      frameworksFound: frameworks.map(f => f.name) // NEW: Framework names
    }
  };
}

/**
 * Format student profile summary for context
 * @param {Object} profile - Student profile
 * @returns {string} - Formatted profile summary
 */
function formatProfileSummary(profile) {
  let summary = 'Student Profile:\n';

  if (profile.academicStrengths.length > 0) {
    summary += `- Academic Strengths: ${profile.academicStrengths.join(', ')}\n`;
  }

  if (profile.academicWeaknesses.length > 0) {
    summary += `- Academic Weaknesses: ${profile.academicWeaknesses.join(', ')}\n`;
  }

  if (profile.interests.length > 0) {
    summary += `- Interests: ${profile.interests.join(', ')}\n`;
  }

  if (profile.financialConstraint !== 'unknown') {
    summary += `- Financial Constraint: ${profile.financialConstraint}\n`;
  }

  summary += `- Priority Modules: ${profile.priorityModules.join(', ')}`;

  return summary;
}

/**
 * Format a single chunk for context
 * @param {Object} chunk - Knowledge chunk
 * @param {string} format - Format type
 * @returns {string} - Formatted chunk text
 */
function formatChunk(chunk, format) {
  const source = chunk.chunk_metadata?.source || 'unknown';
  const moduleType = chunk.module_name || 'general';

  if (format === 'structured') {
    return `[Source: ${source} | Module: ${moduleType}]\n${chunk.chunk_text}`;
  } else {
    return chunk.chunk_text;
  }
}

/**
 * Re-rank chunks based on relevance to student profile
 * @param {Array} chunks - Retrieved chunks
 * @param {Object} studentProfile - Student profile
 * @returns {Array} - Re-ranked chunks
 */
export function reRankChunks(chunks, studentProfile) {
  return chunks.map(chunk => {
    let boostScore = 0;

    const chunkText = chunk.chunk_text.toLowerCase();
    const metadata = chunk.chunk_metadata || {};

    // Boost for matching academic strengths
    studentProfile.academicStrengths.forEach(strength => {
      if (chunkText.includes(strength)) {
        boostScore += 0.1;
      }
    });

    // Boost for matching interests
    studentProfile.interests.forEach(interest => {
      if (chunkText.includes(interest)) {
        boostScore += 0.08;
      }
    });

    // Boost for financial constraint (bursary chunks)
    if (studentProfile.financialConstraint === 'low' || studentProfile.financialConstraint === 'medium') {
      if (chunkText.includes('bursary') || chunkText.includes('scholarship') || chunkText.includes('funding')) {
        boostScore += 0.15;
      }
    }

    // Boost for priority modules
    if (chunk.module_name && studentProfile.priorityModules.includes(chunk.module_name)) {
      const moduleIndex = studentProfile.priorityModules.indexOf(chunk.module_name);
      boostScore += (5 - moduleIndex) * 0.05; // Higher boost for higher priority
    }

    return {
      ...chunk,
      boostedSimilarity: Math.min((chunk.similarity || 0) + boostScore, 1.0),
      boostScore
    };
  }).sort((a, b) => b.boostedSimilarity - a.boostedSimilarity);
}

/**
 * Deduplicate similar chunks
 * @param {Array} chunks - Array of chunks
 * @param {number} threshold - Similarity threshold (default: 0.9)
 * @returns {Array} - Deduplicated chunks
 */
export function deduplicateChunks(chunks, threshold = 0.9) {
  const unique = [];
  
  for (const chunk of chunks) {
    const isDuplicate = unique.some(existing => {
      const similarity = calculateTextSimilarity(chunk.chunk_text, existing.chunk_text);
      return similarity > threshold;
    });
    
    if (!isDuplicate) {
      unique.push(chunk);
    }
  }
  
  return unique;
}

/**
 * Calculate Jaccard similarity between two texts
 * @param {string} text1 
 * @param {string} text2 
 * @returns {number} - Similarity score 0-1
 */
function calculateTextSimilarity(text1, text2) {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}
