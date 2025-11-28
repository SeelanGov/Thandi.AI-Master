// lib/rag/hybrid-search.js
// Multi-stage hybrid search: Intent + Explicit + Semantic

import { createClient } from '@supabase/supabase-js';
import { extractQueryIntent, serializeIntent } from './intent-extraction.js';
import careerIntentMap from '../../config/career-intent-map.js';
import subjectCareerMap from '../../config/subject-career-map.js';

// Initialize Supabase client (lazy)
let supabase = null;
function getSupabaseClient() {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return supabase;
}

/**
 * Main hybrid search function
 * Combines intent-based, explicit career, and semantic search
 */
export async function hybridSearch(queryText, queryEmbedding, options = {}) {
  const { limit = 10, debug = false } = options;
  
  // Extract intent from query
  const intent = extractQueryIntent(queryText);
  const intentKey = serializeIntent(intent, queryText);
  
  // Detect conflicts
  const { detectConflicts } = await import('./intent-extraction.js');
  const conflicts = detectConflicts(intent, queryText);
  
  if (debug) {
    console.log('🎯 Intent:', intentKey);
    console.log('📋 Details:', intent);
    if (conflicts.length > 0) {
      console.log('⚠️  Conflicts detected:', conflicts.map(c => c.type).join(', '));
    }
  }
  
  let allResults = [];
  
  // Stage 1: Explicit career matches (highest priority)
  if (intent.explicitCareers.length > 0) {
    const explicitResults = await searchExplicitCareers(intent.explicitCareers);
    allResults.push(...explicitResults.map(r => ({ ...r, source: 'explicit', priority: 1 })));
    
    if (debug) {
      console.log(`✅ Explicit matches: ${explicitResults.length} chunks`);
    }
  }
  
  // Stage 2: Intent-based career matching (second priority)
  let intentCareers = careerIntentMap[intentKey] || [];
  let conflictCareers = [];
  
  // If conflicts detected, retrieve careers from BOTH paths separately
  if (conflicts.length > 0) {
    conflicts.forEach(conflict => {
      if (conflict.paths) {
        conflict.paths.forEach(path => {
          if (path !== intentKey) {  // Don't duplicate primary intent
            const pathCareers = careerIntentMap[path] || [];
            conflictCareers = [...conflictCareers, ...pathCareers];
          }
        });
      }
    });
    conflictCareers = [...new Set(conflictCareers)];
    
    if (debug) {
      console.log(`⚠️  Conflict detected - will retrieve both paths separately`);
    }
  }
  
  // Apply subject-based filtering/boosting
  if (intentCareers.length > 0) {
    intentCareers = applySubjectFiltering(intentCareers, intent);
    
    const intentResults = await searchIntentCareers(intentCareers);
    allResults.push(...intentResults.map(r => ({ ...r, source: 'intent-primary', priority: 2 })));
    
    if (debug) {
      console.log(`✅ Intent matches (${intentKey}): ${intentResults.length} chunks`);
      console.log(`   Careers: ${intentCareers.slice(0, 8).join(', ')}${intentCareers.length > 8 ? '...' : ''}`);
    }
  }
  
  // Retrieve conflict path careers separately (equal priority)
  if (conflictCareers.length > 0) {
    conflictCareers = applySubjectFiltering(conflictCareers, intent);
    
    const conflictResults = await searchIntentCareers(conflictCareers);
    allResults.push(...conflictResults.map(r => ({ ...r, source: 'intent-conflict', priority: 2 })));
    
    if (debug) {
      console.log(`✅ Conflict path matches: ${conflictResults.length} chunks`);
      console.log(`   Careers: ${conflictCareers.slice(0, 8).join(', ')}${conflictCareers.length > 8 ? '...' : ''}`);
    }
  }
  
  // Stage 3: Semantic fallback (broad net, lower priority)
  // Only use if we don't have enough high-quality results
  if (allResults.length < 8) {
    const semanticResults = await semanticSearchRaw(queryEmbedding, { 
      threshold: 0.55, 
      limit: 25 
    });
    
    // Filter semantic results for quality
    const qualitySemanticResults = semanticResults.filter(chunk => {
      // Must have career metadata OR be from a career module
      return chunk.chunk_metadata?.career_name || 
             chunk.module_name?.includes('career') ||
             chunk.module_name?.includes('4ir') ||
             chunk.module_name?.includes('engineering') ||
             chunk.module_name?.includes('healthcare') ||
             chunk.module_name?.includes('trades');
    });
    
    allResults.push(...qualitySemanticResults.map(r => ({ ...r, source: 'semantic', priority: 3 })));
    
    if (debug) {
      console.log(`✅ Semantic matches: ${qualitySemanticResults.length} chunks (${semanticResults.length} before filtering)`);
    }
  } else if (debug) {
    console.log(`⏭️  Skipped semantic search (${allResults.length} results already)`);
  }
  
  // Stage 4: Re-rank and deduplicate
  const finalResults = reRankAndDeduplicate(allResults, intent, queryText);
  
  if (debug) {
    console.log(`\n📊 Final results: ${finalResults.length} chunks`);
    finalResults.slice(0, 5).forEach((r, i) => {
      console.log(`${i+1}. [${r.source}] ${r.module_name} - Score: ${r.final_score.toFixed(3)}`);
    });
  }
  
  // Attach conflicts metadata for LLM prompt enhancement
  const resultsWithMetadata = finalResults.slice(0, limit).map(r => ({
    ...r,
    query_conflicts: conflicts
  }));
  
  return resultsWithMetadata;
}

/**
 * Apply subject-based filtering to career list
 */
function applySubjectFiltering(careerNames, intent) {
  let filtered = [...careerNames];
  
  // Remove careers that conflict with subject negations
  if (intent.subjectNegations?.math) {
    filtered = filtered.filter(career => !subjectCareerMap.avoid_math.includes(career));
    // Add low-math alternatives if tech is wanted
    if (intent.wantsTech) {
      const lowMathTech = subjectCareerMap.low_math_tech.filter(c => !filtered.includes(c));
      filtered = [...filtered, ...lowMathTech];
    }
  }
  
  if (intent.subjectNegations?.science) {
    filtered = filtered.filter(career => !subjectCareerMap.avoid_science.includes(career));
  }
  
  // Boost careers that match subject preferences (move to front)
  const boosted = [];
  
  if (intent.subjects?.biology) {
    const biologyCareers = subjectCareerMap.biology.filter(c => filtered.includes(c));
    boosted.push(...biologyCareers);
    filtered = filtered.filter(c => !biologyCareers.includes(c));
  }
  
  if (intent.subjects?.maths && !intent.subjectNegations?.math) {
    const mathCareers = subjectCareerMap.mathematics.filter(c => filtered.includes(c));
    boosted.push(...mathCareers);
    filtered = filtered.filter(c => !mathCareers.includes(c));
  }
  
  if (intent.subjects?.physics) {
    const physicsCareers = subjectCareerMap.physical_sciences.filter(c => filtered.includes(c));
    boosted.push(...physicsCareers);
    filtered = filtered.filter(c => !physicsCareers.includes(c));
  }
  
  // Return boosted careers first, then remaining
  return [...new Set([...boosted, ...filtered])];
}

/**
 * Search for explicitly mentioned careers
 */
async function searchExplicitCareers(careerNames) {
  const client = getSupabaseClient();
  
  try {
    const results = [];
    
    for (const careerSlug of careerNames) {
      const careerDisplayNames = getCareerDisplayNames(careerSlug);
      
      for (const displayName of careerDisplayNames) {
        const { data, error } = await client
          .from('knowledge_chunks')
          .select(`
            id,
            chunk_text,
            chunk_metadata,
            source_entity_type,
            knowledge_modules!inner(module_name)
          `)
          .ilike('chunk_metadata->>career_name', displayName)
          .limit(5);
        
        if (!error && data) {
          results.push(...data);
        }
      }
    }
    
    // Deduplicate by ID
    const uniqueResults = Array.from(
      new Map(results.map(r => [r.id, r])).values()
    );
    
    return uniqueResults.slice(0, 15).map(chunk => ({
      id: chunk.id,
      chunk_text: chunk.chunk_text,
      chunk_metadata: chunk.chunk_metadata,
      source_entity_type: chunk.source_entity_type,
      module_name: chunk.knowledge_modules?.module_name || 'unknown',
      initial_score: 0.3 // Lower is better
    }));
  } catch (error) {
    console.error('Explicit career search error:', error);
    return [];
  }
}

/**
 * Search for careers based on intent mapping
 */
async function searchIntentCareers(careerNames) {
  const client = getSupabaseClient();
  
  try {
    // Search by career_name in metadata (case-insensitive)
    const results = [];
    
    for (const careerSlug of careerNames) {
      // Convert slug to display name (e.g., 'software_engineer' -> 'Software Engineer')
      const careerDisplayNames = getCareerDisplayNames(careerSlug);
      
      for (const displayName of careerDisplayNames) {
        const { data, error } = await client
          .from('knowledge_chunks')
          .select(`
            id,
            chunk_text,
            chunk_metadata,
            source_entity_type,
            knowledge_modules!inner(module_name)
          `)
          .ilike('chunk_metadata->>career_name', displayName)
          .limit(4);  // Get 4 chunks per career for diversity
        
        if (!error && data) {
          results.push(...data);
        }
      }
    }
    
    // Deduplicate by ID
    const uniqueResults = Array.from(
      new Map(results.map(r => [r.id, r])).values()
    );
    
    return uniqueResults.slice(0, 30).map(chunk => ({  // Increased from 20 to 30
      id: chunk.id,
      chunk_text: chunk.chunk_text,
      chunk_metadata: chunk.chunk_metadata,
      source_entity_type: chunk.source_entity_type,
      module_name: chunk.knowledge_modules?.module_name || 'unknown',
      initial_score: 0.5
    }));
  } catch (error) {
    console.error('Intent career search error:', error);
    return [];
  }
}

// Helper to convert career slugs to display names
function getCareerDisplayNames(slug) {
  const nameMap = {
    'electrician': ['Electrician'],
    'chef': ['Chef'],
    'software_engineer': ['Software Engineer', 'Software Developer'],
    'ux_ui_designer': ['UX/UI Designer', 'UX Designer', 'UI Designer'],
    'graphic_designer': ['Graphic Designer'],
    'content_creator': ['Content Creator'],
    'data_scientist': ['Data Scientist'],
    'ai_ml_engineer': ['AI/ML Engineer', 'Machine Learning Engineer', 'AI Engineer'],
    'cybersecurity_specialist': ['Cybersecurity Specialist', 'Cybersecurity'],
    'blockchain_developer': ['Blockchain Developer'],
    'renewable_energy_engineer': ['Renewable Energy Engineer', 'Solar Technician', 'Renewable Energy Specialist'],
    'medical_doctor': ['Medical Doctor', 'Doctor'],
    'biomedical_engineer': ['Biomedical Engineer', 'Biomedical Engineering'],
    'pharmacist': ['Pharmacist'],
    'physiotherapist': ['Physiotherapist'],
    'occupational_therapist': ['Occupational Therapist'],
    'civil_engineer': ['Civil Engineer'],
    'mechanical_engineer': ['Mechanical Engineer'],
    'electrical_engineer': ['Electrical Engineer'],
    'chemical_engineer': ['Chemical Engineer']
  };
  
  return nameMap[slug] || [slug];
}

/**
 * Raw semantic search without re-ranking
 */
async function semanticSearchRaw(queryEmbedding, options = {}) {
  const { threshold = 0.55, limit = 25 } = options;
  
  if (!queryEmbedding || queryEmbedding.length !== 1536) {
    throw new Error('Query embedding must be 1536-dimensional array');
  }
  
  const client = getSupabaseClient();
  
  try {
    const embeddingStr = `[${queryEmbedding.join(',')}]`;
    
    const { data: results, error } = await client.rpc(
      'search_knowledge_chunks',
      {
        query_embedding: embeddingStr,
        match_threshold: threshold,
        match_count: limit,
        filter_module_ids: null
      }
    );
    
    if (error) throw error;
    if (!results || results.length === 0) return [];
    
    // Enrich with module names
    const chunkIds = results.map(r => r.chunk_id);
    const { data: chunksWithModules } = await client
      .from('knowledge_chunks')
      .select(`
        id,
        knowledge_modules!inner(module_name)
      `)
      .in('id', chunkIds);
    
    const moduleMap = new Map();
    if (chunksWithModules) {
      chunksWithModules.forEach(chunk => {
        moduleMap.set(chunk.id, chunk.knowledge_modules?.module_name || 'unknown');
      });
    }
    
    return results.map(result => ({
      id: result.chunk_id,
      chunk_text: result.chunk_text,
      chunk_metadata: result.metadata,
      similarity: result.similarity,
      module_name: moduleMap.get(result.chunk_id) || 'unknown',
      initial_score: 0.7
    }));
  } catch (error) {
    console.error('Semantic search error:', error);
    return [];
  }
}

/**
 * Calculate constraint-based score adjustments
 * Higher weight = higher priority constraint
 */
function calculateConstraintScore(chunk, intent, queryText) {
  let adjustment = 0;
  const text = chunk.chunk_text.toLowerCase();
  const careerName = chunk.chunk_metadata?.career_name;
  const careerSlug = careerName ? careerName.toLowerCase().replace(/[\/\s]+/g, '_') : null;
  
  // PRIORITY 1: NEGATION CONSTRAINTS (weight: 0.4)
  // These are hard constraints - student explicitly doesn't want this
  
  // Math negation
  if (intent.subjectNegations?.math) {
    if (/(mathematics|calculus|algebra|statistics|math\s+required)/.test(text)) {
      adjustment += 0.40; // Heavy penalty
    }
    // Check if career is math-heavy
    if (careerSlug && subjectCareerMap.avoid_math.includes(careerSlug)) {
      adjustment += 0.35;
    }
  }
  
  // University negation (already handled, but reinforce)
  if (intent.hasUniversityNegation) {
    if (/(bachelor|degree|bsc|ba\b|bcom|university required)/.test(text)) {
      adjustment += 0.50;
    }
  }
  
  // Matric negation
  if (intent.hasMatricNegation) {
    if (/(matric required|grade 12 required|nsc required)/.test(text) && 
        !/without matric|no matric/.test(text)) {
      adjustment += 0.40;
    }
  }
  
  // PRIORITY 2: SUBJECT PREFERENCES (weight: 0.25)
  // Student likes these subjects - boost related careers
  
  // Biology preference
  if (intent.subjects?.biology) {
    if (/(biology|life sciences|anatomy|physiology|medical|health)/.test(text)) {
      adjustment -= 0.25; // Strong boost
    }
    if (careerSlug && subjectCareerMap.biology.includes(careerSlug)) {
      adjustment -= 0.20;
    }
  }
  
  // Math preference
  if (intent.subjects?.maths && !intent.subjectNegations?.math) {
    if (/(mathematics|calculus|statistics|quantitative)/.test(text)) {
      adjustment -= 0.20;
    }
    if (careerSlug && subjectCareerMap.mathematics.includes(careerSlug)) {
      adjustment -= 0.15;
    }
  }
  
  // Physics preference
  if (intent.subjects?.physics) {
    if (/(physics|mechanics|thermodynamics|engineering)/.test(text)) {
      adjustment -= 0.20;
    }
    if (careerSlug && subjectCareerMap.physical_sciences.includes(careerSlug)) {
      adjustment -= 0.15;
    }
  }
  
  // PRIORITY 3: SPECIAL COMBINATIONS (weight: 0.15)
  // Handle "hate math but want tech" scenarios
  
  if (intent.subjectNegations?.math && intent.wantsTech) {
    // Boost low-math tech careers
    if (careerSlug && subjectCareerMap.low_math_tech.includes(careerSlug)) {
      adjustment -= 0.15;
    }
  }
  
  // PRIORITY 4: FORMAT CONSTRAINTS (weight: 0.1)
  // These are preferences, not hard requirements
  
  if (intent.wantsRemote) {
    if (/(remote|freelance|work from home|online|anywhere)/.test(text)) {
      adjustment -= 0.10;
    }
  }
  
  if (intent.wantsFastPath) {
    if (/(\d+\s*(week|month)|quick|fast|immediate|apprenticeship)/.test(text)) {
      adjustment -= 0.10;
    }
  }
  
  if (intent.wantsHighIncome || intent.wantsDollars) {
    if (/(r\d{2,3}[,\s]?\d{3}|salary|earning|\$\d+|dollar|high.?income)/.test(text)) {
      adjustment -= 0.08;
    }
  }
  
  return adjustment;
}

/**
 * Re-rank and deduplicate results
 */
function reRankAndDeduplicate(results, intent, queryText) {
  // Deduplicate by chunk ID first
  const uniqueMap = new Map();
  results.forEach(chunk => {
    if (!uniqueMap.has(chunk.id) || uniqueMap.get(chunk.id).priority > chunk.priority) {
      uniqueMap.set(chunk.id, chunk);
    }
  });
  
  const unique = Array.from(uniqueMap.values());
  
  // Apply scoring with constraint-based adjustments
  const scored = unique.map(chunk => {
    let score = chunk.initial_score || 0.7;
    const text = chunk.chunk_text.toLowerCase();
    const metadata = chunk.chunk_metadata || {};
    
    // Base boosts for source priority
    if (chunk.source === 'explicit') {
      score -= 0.25;
    }
    // Boost conflict path results to ensure they appear in top results
    if (chunk.source === 'intent-conflict') {
      score -= 0.22;  // Slightly higher than regular intent
    }
    if (chunk.source === 'intent-primary' || chunk.source === 'intent') {
      score -= 0.20;
    }
    if (metadata.career_name || chunk.source_entity_type === 'career_summary') {
      score -= 0.15;
    }
    
    // Apply constraint-based scoring (NEW - handles multi-constraint prioritization)
    const constraintAdjustment = calculateConstraintScore(chunk, intent, queryText);
    score += constraintAdjustment;
    
    // Penalize generic framework content
    if (chunk.module_name === 'decision_making_framework' || 
        chunk.module_name === 'career_misconceptions_framework') {
      score += 0.15;
    }
    
    // Boost high-priority content
    if (metadata.priority === 'high') {
      score -= 0.10;
    }
    
    return {
      ...chunk,
      final_score: Math.max(0, Math.min(score, 1.0)),
      constraint_adjustment: constraintAdjustment  // For debugging
    };
  });
  
  // Sort by final score (lower is better)
  scored.sort((a, b) => {
    // If scores are very close (within 0.05), prioritize diversity
    if (Math.abs(a.final_score - b.final_score) < 0.05) {
      // Alternate between primary and conflict sources for diversity
      if (a.source === 'intent-conflict' && b.source === 'intent-primary') return -1;
      if (a.source === 'intent-primary' && b.source === 'intent-conflict') return 1;
    }
    return a.final_score - b.final_score;
  });
  
  return scored;
}

export { extractQueryIntent, serializeIntent };
