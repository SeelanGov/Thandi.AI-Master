// lib/rag/search.js
// STEP 2: Vector Search Implementation
import { createClient } from '@supabase/supabase-js';

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
 * LAYER 1 FIX: Re-rank chunks with career content boosting
 * Prioritizes structured career chunks over generic framework content
 * @param {Array} chunks - Retrieved chunks
 * @param {Object} options - Search options with query context
 * @returns {Array} - Re-ranked chunks
 */
function reRankWithCareerBoost(chunks, options = {}) {
  const scoredChunks = chunks.map(chunk => {
    let qualityBoost = 0;
    const metadata = chunk.chunk_metadata || {};
    const text = chunk.chunk_text.toLowerCase();
    
    // BOOST: Keyword-rich career summaries (HIGHEST priority)
    if (chunk.source_entity_type === 'career_summary' || 
        metadata.type === 'keyword_rich_summary') {
      qualityBoost += 0.40; // MAXIMUM boost for summaries
    }
    
    // BOOST: Career-specific chunks (have structured career data)
    // INCREASED from 0.15 to 0.30 for stronger prioritization
    else if (metadata.career || metadata.category === 'career' || 
        chunk.module_name === 'careers' || 
        chunk.module_name === '4ir_emerging_jobs' ||
        chunk.module_name === 'engineering_careers' ||
        chunk.module_name === 'healthcare_extended' ||
        chunk.module_name === '4ir_careers_framework' ||
        chunk.module_name === 'trades_careers' ||
        chunk.module_name === 'creative_arts_careers') {
      qualityBoost += 0.30; // STRONG boost for career content
    }
    
    // BOOST: Chunks with salary information (indicates real career data)
    if (/r\d{1,3}[,\s]?\d{3}|salary|earning|\$\d+/i.test(text)) {
      qualityBoost += 0.10; // Increased from 0.08
    }
    
    // BOOST: Chunks with education pathways (actionable career info)
    if (/degree|diploma|apprenticeship|bootcamp|certification|matric|grade/i.test(text)) {
      qualityBoost += 0.08; // Increased from 0.05
    }
    
    // PENALIZE: Generic framework chunks for specific career queries
    // INCREASED penalty from -0.10 to -0.20
    if ((chunk.module_name === 'decision_making_framework' || 
         chunk.module_name === 'career_misconceptions_framework' ||
         chunk.module_name === 'unknown') &&
        !metadata.career) {
      qualityBoost -= 0.20; // STRONG penalty for generic content
    }
    
    // PENALIZE: Bursary-only chunks when query is about careers not funding
    if (chunk.module_name === 'bursaries' && 
        options.queryText && 
        !/bursary|funding|afford|money|financial/i.test(options.queryText)) {
      qualityBoost -= 0.15; // Increased from 0.08
    }
    
    return {
      ...chunk,
      original_similarity: chunk.similarity,
      boosted_similarity: Math.min(chunk.similarity + qualityBoost, 1.0),
      quality_boost: qualityBoost
    };
  });
  
  // Sort by boosted similarity
  scoredChunks.sort((a, b) => b.boosted_similarity - a.boosted_similarity);
  
  // AGGRESSIVE DEDUPLICATION: Remove duplicate chunks (especially "unknown" module duplicates)
  const deduplicated = [];
  const seenTexts = new Set();
  
  for (const chunk of scoredChunks) {
    // Create a fingerprint of the chunk (first 100 chars)
    const fingerprint = chunk.chunk_text.substring(0, 100).toLowerCase().trim();
    
    if (!seenTexts.has(fingerprint)) {
      seenTexts.add(fingerprint);
      deduplicated.push(chunk);
    }
  }
  
  return deduplicated;
}

/**
 * Semantic search using pgvector cosine similarity
 * ENHANCED: Fixed to handle CAPS content without knowledge_modules join
 * @param {number[]} queryEmbedding - 1536-dimensional query vector
 * @param {Object} options - Search options
 * @param {number} options.limit - Number of results to return (default: 10)
 * @param {number} options.threshold - Minimum similarity threshold (default: 0.55)
 * @param {string[]} options.moduleNames - Filter by module names (optional, now less restrictive)
 * @returns {Promise<Array>} - Array of chunks with similarity scores
 */
export async function semanticSearch(queryEmbedding, options = {}) {
  const {
    limit = 10,
    threshold = 0.55, // LOWERED from 0.7 to cast wider net
    moduleNames = null
  } = options;
  
  // Retrieve more candidates for re-ranking
  const retrievalLimit = Math.max(limit * 2.5, 25); // Get 25 chunks minimum

  if (!queryEmbedding || queryEmbedding.length !== 1536) {
    throw new Error('Query embedding must be 1536-dimensional array');
  }

  const client = getSupabaseClient();

  try {
    // Get module IDs if filtering by module names
    let filterModuleIds = null;
    if (moduleNames && moduleNames.length > 0) {
      const { data: modules, error: moduleError } = await client
        .from('knowledge_modules')
        .select('id')
        .in('module_name', moduleNames);
      
      if (!moduleError && modules) {
        filterModuleIds = modules.map(m => m.id);
      }
    }

    // Use pgvector RPC function for semantic search
    const embeddingStr = `[${queryEmbedding.join(',')}]`;
    
    let results = [];
    let searchError = null;
    
    // Try the RPC function first
    const { data: rpcResults, error: rpcError } = await client.rpc(
      'search_knowledge_chunks',
      {
        query_embedding: embeddingStr,
        match_threshold: threshold,
        match_count: retrievalLimit, // Retrieve more for re-ranking
        filter_module_ids: filterModuleIds
      }
    );
    
    if (rpcError) {
      console.error('Vector search RPC error:', rpcError);
      searchError = rpcError;
    } else {
      results = rpcResults || [];
    }
    
    // ENHANCED: If no module filter is specified and we have few results, 
    // also search CAPS content directly (which has NULL module_id)
    if (!filterModuleIds && results.length < retrievalLimit / 2) {
      console.log('🔍 Searching CAPS content directly (NULL module_id workaround)');
      
      try {
        // Direct query for CAPS content with manual similarity calculation
        const { data: capsChunks, error: capsError } = await client
          .from('knowledge_chunks')
          .select('id, chunk_text, chunk_metadata, source_entity_type, embedding')
          .eq('source_entity_type', 'caps_subject')
          .limit(50); // Get more CAPS chunks to calculate similarity
        
        if (!capsError && capsChunks && capsChunks.length > 0) {
          console.log(`   Found ${capsChunks.length} CAPS chunks for similarity calculation`);
          
          // Calculate similarity manually for CAPS chunks
          const capsResults = [];
          
          for (const chunk of capsChunks) {
            if (!chunk.embedding) continue;
            
            try {
              const chunkEmbedding = JSON.parse(chunk.embedding);
              
              // Calculate cosine similarity
              let dotProduct = 0;
              let normA = 0;
              let normB = 0;
              
              for (let i = 0; i < queryEmbedding.length; i++) {
                dotProduct += queryEmbedding[i] * chunkEmbedding[i];
                normA += queryEmbedding[i] * queryEmbedding[i];
                normB += chunkEmbedding[i] * chunkEmbedding[i];
              }
              
              const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
              
              if (similarity >= threshold) {
                capsResults.push({
                  chunk_id: chunk.id,
                  chunk_text: chunk.chunk_text,
                  similarity: similarity,
                  metadata: chunk.chunk_metadata,
                  source_entity_type: chunk.source_entity_type
                });
              }
            } catch (e) {
              console.warn(`   Warning: Could not parse embedding for chunk ${chunk.id}`);
            }
          }
          
          // Sort CAPS results by similarity
          capsResults.sort((a, b) => b.similarity - a.similarity);
          
          console.log(`   ✅ Found ${capsResults.length} CAPS chunks above threshold ${threshold}`);
          
          // Merge with existing results
          results = [...results, ...capsResults];
          
          // Remove duplicates and re-sort
          const uniqueResults = Array.from(
            new Map(results.map(r => [r.chunk_id, r])).values()
          );
          
          uniqueResults.sort((a, b) => b.similarity - a.similarity);
          results = uniqueResults.slice(0, retrievalLimit);
          
          console.log(`   📊 Total results after CAPS merge: ${results.length}`);
        }
      } catch (capsSearchError) {
        console.warn('Warning: CAPS direct search failed:', capsSearchError.message);
      }
    }

    if (searchError && results.length === 0) {
      throw new Error(`Vector search failed: ${searchError.message}`);
    }

    if (!results || results.length === 0) {
      console.warn('No results found for query');
      return [];
    }

    // ENHANCED: Enrich results with module names using LEFT JOIN to include CAPS content
    const chunkIds = results.map(r => r.chunk_id);
    const { data: chunksWithModules, error: enrichError } = await client
      .from('knowledge_chunks')
      .select(`
        id,
        module_id,
        source_entity_type,
        chunk_metadata,
        knowledge_modules (
          module_name
        )
      `)
      .in('id', chunkIds);

    if (enrichError) {
      console.warn('Error enriching with module names:', enrichError);
    }

    // Create a map for quick lookup
    const moduleMap = new Map();
    if (chunksWithModules) {
      chunksWithModules.forEach(chunk => {
        let moduleName = 'unknown';
        
        // Try to get module name from knowledge_modules table
        if (chunk.knowledge_modules?.module_name) {
          moduleName = chunk.knowledge_modules.module_name;
        }
        // ENHANCED: For CAPS content, derive module name from metadata
        else if (chunk.source_entity_type === 'caps_subject' && chunk.chunk_metadata?.subject) {
          moduleName = `caps_${chunk.chunk_metadata.subject.toLowerCase().replace(/\s+/g, '_')}`;
        }
        // For other content types, try to derive from metadata
        else if (chunk.chunk_metadata?.curriculum) {
          moduleName = `${chunk.chunk_metadata.curriculum.toLowerCase()}_content`;
        }
        
        moduleMap.set(chunk.id, moduleName);
      });
    }

    // Enrich results with module names
    const enrichedResults = results.map(result => ({
      id: result.chunk_id,
      chunk_text: result.chunk_text,
      chunk_metadata: result.metadata,
      similarity: result.similarity,
      module_name: moduleMap.get(result.chunk_id) || 'unknown',
      source_entity_type: result.source_entity_type
    }));

    console.log(`🔍 Search results: ${enrichedResults.length} chunks found`);
    
    // Log breakdown by source type
    const sourceBreakdown = enrichedResults.reduce((acc, chunk) => {
      const source = chunk.source_entity_type || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`📊 Source breakdown:`, sourceBreakdown);

    // LAYER 1 FIX: Re-rank with career content boosting
    const reRankedResults = reRankWithCareerBoost(enrichedResults, options);

    // Return top N after re-ranking
    return reRankedResults.slice(0, limit);

  } catch (error) {
    console.error('Semantic search error:', error.message);
    throw new Error(`Semantic search failed: ${error.message}`);
  }
}

/**
 * Hybrid search: Semantic + keyword matching
 * @param {number[]} queryEmbedding - Query vector
 * @param {string[]} keywords - Keywords to match
 * @param {Object} options - Search options
 * @returns {Promise<Array>} - Ranked chunks
 */
export async function hybridSearch(queryEmbedding, keywords, options = {}) {
  const { limit = 10 } = options;

  // Get semantic results
  const semanticResults = await semanticSearch(queryEmbedding, { 
    ...options, 
    limit: limit * 2 // Get more for re-ranking
  });

  // Keyword boost: increase score if keywords found in chunk
  const keywordPattern = new RegExp(keywords.join('|'), 'gi');
  
  const boostedResults = semanticResults.map(chunk => {
    const keywordMatches = (chunk.chunk_text.match(keywordPattern) || []).length;
    const keywordBoost = Math.min(keywordMatches * 0.05, 0.15); // Max 15% boost
    
    return {
      ...chunk,
      similarity: Math.min(chunk.similarity + keywordBoost, 1.0),
      keyword_matches: keywordMatches
    };
  });

  // Re-sort by boosted similarity
  boostedResults.sort((a, b) => b.similarity - a.similarity);

  return boostedResults.slice(0, limit);
}

/**
 * Filter chunks by module names
 * @param {Array} chunks - Array of chunks
 * @param {string[]} moduleNames - Module names to keep
 * @returns {Array} - Filtered chunks
 */
export function filterByModule(chunks, moduleNames) {
  if (!moduleNames || moduleNames.length === 0) {
    return chunks;
  }

  return chunks.filter(chunk => 
    moduleNames.includes(chunk.module_name)
  );
}

/**
 * Deduplicate similar chunks
 * @param {Array} chunks - Array of chunks
 * @param {number} similarityThreshold - Threshold for considering chunks similar (default: 0.95)
 * @returns {Array} - Deduplicated chunks
 */
export function deduplicateChunks(chunks, similarityThreshold = 0.95) {
  const unique = [];
  
  for (const chunk of chunks) {
    const isDuplicate = unique.some(existing => {
      // Simple text similarity check
      const similarity = calculateTextSimilarity(chunk.chunk_text, existing.chunk_text);
      return similarity > similarityThreshold;
    });
    
    if (!isDuplicate) {
      unique.push(chunk);
    }
  }
  
  return unique;
}

/**
 * Calculate simple text similarity (Jaccard similarity)
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

/**
 * Test function for vector search
 */
export async function testVectorSearch() {
  console.log('🧪 Testing vector search...');
  
  // Get a sample embedding from database
  const client = getSupabaseClient();
  const { data: sampleChunk, error } = await client
    .from('knowledge_chunks')
    .select('embedding')
    .limit(1)
    .single();

  if (error || !sampleChunk) {
    console.error('❌ Could not get sample embedding');
    return { success: false };
  }

  try {
    // Parse embedding (it's stored as string)
    const embedding = JSON.parse(sampleChunk.embedding);
    
    const start = Date.now();
    const results = await semanticSearch(embedding, { limit: 5 });
    const duration = Date.now() - start;
    
    console.log(`✅ Vector search working`);
    console.log(`   Retrieved: ${results.length} chunks`);
    console.log(`   Time: ${duration}ms`);
    console.log(`   Top result similarity: ${results[0]?.similarity?.toFixed(3) || 'N/A'}`);
    
    return { success: true, results, duration };
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}
