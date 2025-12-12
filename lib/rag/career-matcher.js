// lib/rag/career-matcher.js
// Phase 2: Career Matching Algorithm
// Replaces hardcoded career suggestions with intelligent knowledge base queries

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { semanticSearch, hybridSearch } from './search.js';

// Lazy initialization
let supabase = null;
let openai = null;

function getSupabaseClient() {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return supabase;
}

function getOpenAIClient() {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

/**
 * Generate embedding for a text query
 * @param {string} text - Text to embed
 * @returns {Promise<Array>} - 1536-dimensional embedding vector
 */
async function generateEmbedding(text) {
  try {
    const client = getOpenAIClient();
    const response = await client.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error.message);
    throw error;
  }
}

/**
 * Build search query from user profile
 * @param {Object} profile - User profile with subjects, interests, etc.
 * @returns {string} - Search query string
 */
function buildSearchQuery(profile) {
  const parts = [];
  
  // Add subjects
  if (profile.subjects && profile.subjects.length > 0) {
    parts.push(profile.subjects.join(' '));
  }
  
  // Add interests
  if (profile.interests && profile.interests.length > 0) {
    parts.push(profile.interests.join(' '));
  }
  
  // Add career preferences if available
  if (profile.careerPreferences) {
    parts.push(profile.careerPreferences);
  }
  
  // Add context based on grade
  if (profile.grade) {
    parts.push(`grade ${profile.grade} student`);
  }
  
  return parts.join(' ');
}

/**
 * Extract keywords for hybrid search
 * @param {Object} profile - User profile
 * @returns {Array<string>} - Keywords for matching
 */
function extractKeywords(profile) {
  const keywords = [];
  
  // Subject keywords
  if (profile.subjects) {
    keywords.push(...profile.subjects);
  }
  
  // Interest keywords
  if (profile.interests) {
    keywords.push(...profile.interests);
  }
  
  return keywords;
}

/**
 * Match careers to user profile using RAG
 * @param {Object} profile - User profile with subjects, interests, marks, etc.
 * @param {Object} options - Matching options
 * @returns {Promise<Array>} - Matched careers with metadata
 */
export async function matchCareersToProfile(profile, options = {}) {
  const {
    limit = 5,
    minSimilarity = 0.6,  // LOWERED from 0.7 to 0.6 for more matches
    useHybrid = true
  } = options;
  
  try {
    console.log('🔍 Matching careers for profile:', {
      grade: profile.grade,
      subjects: profile.subjects,
      interests: profile.interests
    });
    
    // Build search query
    const searchQuery = buildSearchQuery(profile);
    console.log('📝 Search query:', searchQuery);
    
    // Generate embedding
    const queryEmbedding = await generateEmbedding(searchQuery);
    
    // Perform search (get more results to filter)
    let results;
    if (useHybrid) {
      const keywords = extractKeywords(profile);
      results = await hybridSearch(queryEmbedding, keywords, { limit: limit * 8 });  // INCREASED from 4x to 8x
    } else {
      results = await semanticSearch(queryEmbedding, { limit: limit * 8 });  // INCREASED from 4x to 8x
    }
    
    console.log(`✅ Found ${results.length} potential matches`);
    
    // Filter and rank results
    console.log('🔍 Filtering results...');
    console.log(`   - Before filter: ${results.length} results`);
    if (results.length > 0) {
      const sample = results[0];
      console.log(`   - Sample result metadata:`, sample.chunk_metadata);
    }
    
    // Stage 1: Similarity filter
    const afterSimilarity = results.filter(r => r.similarity >= minSimilarity);
    console.log(`   [FILTER] Stage 1 (similarity >= ${minSimilarity}): ${results.length} → ${afterSimilarity.length}`);
    
    // Stage 2: Metadata filter (MORE FLEXIBLE)
    const afterMetadata = afterSimilarity.filter(r => {
      const metadata = r.chunk_metadata || {};
      // Accept ANY career-related metadata (more flexible than before)
      const hasCareerData = metadata.career_code || 
                           metadata.career_title || 
                           metadata.career_name ||
                           metadata.career ||
                           (metadata.type && metadata.type.includes('career'));
      return hasCareerData;
    });
    console.log(`   [FILTER] Stage 2 (metadata check): ${afterSimilarity.length} → ${afterMetadata.length}`);
    
    const rankedCareers = afterMetadata.slice(0, limit);
    console.log(`   [FILTER] Stage 3 (limit to ${limit}): ${afterMetadata.length} → ${rankedCareers.length}`);
    
    // Enrich with career metadata
    const enrichedCareers = await enrichCareerData(rankedCareers);
    
    console.log(`   [FILTER] Stage 4 (enrichment): ${rankedCareers.length} → ${enrichedCareers.length}`);
    console.log(`🎯 Returning ${enrichedCareers.length} matched careers`);
    
    // Log warning if too few careers
    if (enrichedCareers.length < 3) {
      console.log(`   ⚠️ WARNING: Only ${enrichedCareers.length} careers returned (target: 3-5)`);
      console.log(`   ⚠️ Consider lowering similarity threshold or checking knowledge base content`);
    }
    
    return enrichedCareers;
    
  } catch (error) {
    console.error('❌ Error matching careers:', error);
    throw error;
  }
}

/**
 * Enrich career chunks with full career data from database
 * @param {Array} careerChunks - Matched career chunks
 * @returns {Promise<Array>} - Enriched career data
 */
async function enrichCareerData(careerChunks) {
  const enriched = [];
  
  for (const chunk of careerChunks) {
    const metadata = chunk.chunk_metadata || {};
    const careerCode = metadata.career_code;
    
    // Try to get full career data from careers table
    let careerData = null;
    if (careerCode) {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('careers')
        .select('*')
        .eq('career_code', careerCode)
        .single();
      
      if (!error && data) {
        careerData = data;
      }
    }
    
    // Extract career title from various metadata formats
    let title = metadata.career_title || 
                metadata.career_name || 
                metadata.career ||
                careerData?.career_title;
    
    // Fallback: Try to extract title from chunk text
    if (!title && chunk.chunk_text) {
      // Look for patterns like "Career: Title" or "Title:" at start
      const titleMatch = chunk.chunk_text.match(/^([A-Z][^:.]+)(?::|\.)/);
      if (titleMatch) {
        title = titleMatch[1].trim();
        console.log(`   ℹ️ Extracted title from text: "${title}"`);
      }
    }
    
    if (!title) {
      console.log(`   ⚠️ Skipping chunk without career title (code: ${careerCode})`);
      continue;
    }
    
    // Build enriched career object
    enriched.push({
      title: title,
      code: careerCode,
      category: metadata.career_category || careerData?.career_category,
      description: chunk.chunk_text,
      similarity: chunk.similarity,
      
      // From database if available
      education: careerData?.required_education,
      qualifications: careerData?.required_qualifications,
      subjects: careerData?.required_subjects,
      salaryRange: careerData ? {
        entry: { min: careerData.salary_entry_min, max: careerData.salary_entry_max },
        mid: { min: careerData.salary_mid_min, max: careerData.salary_mid_max },
        senior: { min: careerData.salary_senior_min, max: careerData.salary_senior_max }
      } : null,
      outlook: careerData?.job_outlook,
      demand: careerData?.demand_level,
      
      // Metadata
      metadata: metadata,
      fullData: careerData
    });
  }
  
  return enriched;
}

/**
 * Fallback: Get broad career suggestions when no good matches
 * @param {Object} profile - User profile
 * @returns {Promise<Array>} - Broad career suggestions
 */
export async function getFallbackCareers(profile) {
  console.log('⚠️ Using fallback career suggestions');
  
  // Get popular careers from different categories
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('careers')
    .select('*')
    .in('demand_level', ['very_high', 'high'])
    .limit(5);
  
  if (error || !data) {
    console.error('Error fetching fallback careers:', error);
    return [];
  }
  
  return data.map(career => ({
    title: career.career_title,
    code: career.career_code,
    category: career.career_category,
    description: career.short_description,
    similarity: 0.5, // Lower similarity for fallback
    education: career.required_education,
    qualifications: career.required_qualifications,
    subjects: career.required_subjects,
    salaryRange: {
      entry: { min: career.salary_entry_min, max: career.salary_entry_max }
    },
    outlook: career.job_outlook,
    demand: career.demand_level,
    fullData: career
  }));
}
