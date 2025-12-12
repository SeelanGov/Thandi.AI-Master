// lib/rag/career-matcher.js
// Phase 3: Enhanced Career Matching Algorithm
// Enhanced with flexible metadata filtering and intelligent fallbacks

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { semanticSearch, hybridSearch } from './search.js';
import { MetadataFilter } from './metadata-filter.js';
import { FallbackSelector } from './fallback-selector.js';

// Lazy initialization
let supabase = null;
let openai = null;
let metadataFilter = null;
let fallbackSelector = null;

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

function getMetadataFilter() {
  if (!metadataFilter) {
    metadataFilter = new MetadataFilter({
      strictMode: false,
      logLevel: 'info'
    });
  }
  return metadataFilter;
}

function getFallbackSelector() {
  if (!fallbackSelector) {
    fallbackSelector = new FallbackSelector({
      maxFallbacks: 5,
      minConfidence: 0.4
    });
  }
  return fallbackSelector;
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
 * Validate if a career object represents a real career
 * @param {Object} career - Career object to validate
 * @returns {boolean} - Whether the career is valid
 */
function isValidCareer(career) {
  if (!career || typeof career !== 'object') {
    return false;
  }

  const title = career.title || '';
  
  // Check for obviously invalid titles
  const invalidTitles = [
    'question', 'bursary', 'program', 'university', 'college',
    'application', 'admission', 'requirement', 'information',
    'guide', 'help', 'faq', 'test', 'example'
  ];
  
  const lowerTitle = title.toLowerCase();
  for (const invalid of invalidTitles) {
    if (lowerTitle.includes(invalid)) {
      console.log(`   ⚠️ Rejected invalid career title: "${title}"`);
      return false;
    }
  }

  // Check for very short or generic titles
  if (title.length < 3 || title.length > 100) {
    console.log(`   ⚠️ Rejected career with invalid title length: "${title}"`);
    return false;
  }

  // Check for titles that are just single words (likely not careers)
  const words = title.trim().split(/\s+/);
  if (words.length === 1 && !isKnownSingleWordCareer(words[0])) {
    console.log(`   ⚠️ Rejected single-word title: "${title}"`);
    return false;
  }

  return true;
}

/**
 * Check if a single word can be a valid career title
 * @private
 */
function isKnownSingleWordCareer(word) {
  const validSingleWords = [
    'engineer', 'teacher', 'nurse', 'doctor', 'lawyer', 'architect',
    'designer', 'developer', 'analyst', 'consultant', 'manager',
    'accountant', 'therapist', 'scientist', 'researcher', 'technician'
  ];
  
  return validSingleWords.includes(word.toLowerCase());
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
    
    // Perform search (get more results to filter) - ENHANCED: Increased multiplier for better coverage
    let results;
    if (useHybrid) {
      const keywords = extractKeywords(profile);
      results = await hybridSearch(queryEmbedding, keywords, { limit: limit * 10 });  // ENHANCED: Increased from 8x to 10x
    } else {
      results = await semanticSearch(queryEmbedding, { limit: limit * 10 });  // ENHANCED: Increased from 8x to 10x
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
    
    // Stage 2: Enhanced metadata filter (MUCH MORE FLEXIBLE)
    const filter = getMetadataFilter();
    const afterMetadata = filter.filter(afterSimilarity, { logDetails: true });
    console.log(`   [FILTER] Stage 2 (enhanced metadata): ${afterSimilarity.length} → ${afterMetadata.length}`);
    
    const rankedCareers = afterMetadata.slice(0, limit);
    console.log(`   [FILTER] Stage 3 (limit to ${limit}): ${afterMetadata.length} → ${rankedCareers.length}`);
    
    // Enrich with career metadata
    const enrichedCareers = await enrichCareerData(rankedCareers);
    
    console.log(`   [FILTER] Stage 4 (enrichment): ${rankedCareers.length} → ${enrichedCareers.length}`);
    
    // ENHANCED: Validate career quality and trigger intelligent fallback if needed
    const validCareers = enrichedCareers.filter(career => isValidCareer(career));
    console.log(`   [FILTER] Stage 5 (career validation): ${enrichedCareers.length} → ${validCareers.length}`);
    
    let finalCareers = validCareers;
    if (validCareers.length < 3) {
      console.log(`   ⚠️ WARNING: Only ${validCareers.length} valid careers found, triggering intelligent fallback system`);
      
      try {
        const selector = getFallbackSelector();
        const fallbackCareers = await selector.selectFallbacks(profile, validCareers, 5);
        
        finalCareers = [...validCareers, ...fallbackCareers];
        console.log(`   ✅ Added ${fallbackCareers.length} intelligent fallback careers (total: ${finalCareers.length})`);
      } catch (error) {
        console.error(`   ❌ Intelligent fallback system failed: ${error.message}`);
        // Try legacy fallback as backup
        try {
          const legacyFallbacks = await getFallbackCareers(profile, validCareers);
          const neededCount = Math.max(0, 3 - validCareers.length);
          const fallbacksToAdd = legacyFallbacks.slice(0, neededCount);
          
          finalCareers = [...validCareers, ...fallbacksToAdd];
          console.log(`   ⚠️ Used legacy fallback: ${fallbacksToAdd.length} careers added`);
        } catch (legacyError) {
          console.error(`   ❌ Legacy fallback also failed: ${legacyError.message}`);
          // Continue with whatever we have
        }
      }
    }
    
    console.log(`🎯 Returning ${finalCareers.length} matched careers`);
    return finalCareers;
    
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
    
    // ENHANCED: Extract career title using multiple methods
    let title = metadata.career_title || 
                metadata.career_name || 
                metadata.career ||
                careerData?.career_title;
    
    // Use filter metadata if available (from enhanced filtering)
    if (!title && chunk._filterMetadata?.extractedTitle) {
      title = chunk._filterMetadata.extractedTitle;
      console.log(`   ℹ️ Using filter-extracted title: "${title}"`);
    }
    
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
    
    // Build enriched career object with enhanced metadata
    enriched.push({
      title: title,
      code: careerCode,
      category: metadata.career_category || careerData?.career_category,
      description: chunk.chunk_text,
      similarity: chunk.similarity,
      confidence: chunk._filterMetadata?.confidence || chunk.similarity || 0.5,
      source: 'rag', // Mark as RAG-sourced career
      
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
      
      // Enhanced metadata
      metadata: metadata,
      filterMetadata: chunk._filterMetadata,
      fullData: careerData
    });
  }
  
  return enriched;
}

/**
 * ENHANCED: Get intelligent fallback careers when insufficient matches found
 * @param {Object} profile - User profile
 * @param {Array} existingCareers - Already found careers to avoid duplicates
 * @returns {Promise<Array>} - Intelligent fallback career suggestions
 */
export async function getFallbackCareers(profile, existingCareers = []) {
  console.log('⚠️ Using enhanced fallback career system');
  
  const client = getSupabaseClient();
  const existingCodes = new Set(existingCareers.map(c => c.code).filter(Boolean));
  
  try {
    // Strategy 1: Subject-based fallbacks
    let subjectBasedCareers = [];
    if (profile.subjects && profile.subjects.length > 0) {
      const subjectQuery = profile.subjects.join(' OR ');
      const { data: subjectCareers } = await client
        .from('careers')
        .select('*')
        .or(`required_subjects.ilike.%${profile.subjects[0]}%,career_category.ilike.%${getSubjectCategory(profile.subjects[0])}%`)
        .in('demand_level', ['very_high', 'high'])
        .limit(10);
      
      if (subjectCareers) {
        subjectBasedCareers = subjectCareers.filter(c => !existingCodes.has(c.career_code));
      }
    }
    
    // Strategy 2: High-demand careers for grade level
    const { data: demandCareers } = await client
      .from('careers')
      .select('*')
      .in('demand_level', ['very_high', 'high'])
      .order('demand_level', { ascending: false })
      .limit(15);
    
    const gradeLevelCareers = (demandCareers || []).filter(c => 
      !existingCodes.has(c.career_code) && isGradeAppropriate(c, profile.grade)
    );
    
    // Combine and prioritize
    const allFallbacks = [...subjectBasedCareers, ...gradeLevelCareers];
    const uniqueFallbacks = Array.from(
      new Map(allFallbacks.map(c => [c.career_code, c])).values()
    );
    
    // Convert to enriched format
    return uniqueFallbacks.slice(0, 5).map(career => ({
      title: career.career_title,
      code: career.career_code,
      category: career.career_category,
      description: career.short_description || career.description || `${career.career_title} career information`,
      similarity: 0.4, // Lower similarity for fallback
      confidence: 0.6, // Moderate confidence for fallback
      source: 'fallback', // Mark as fallback-sourced
      education: career.required_education,
      qualifications: career.required_qualifications,
      subjects: career.required_subjects,
      salaryRange: career.salary_entry_min ? {
        entry: { min: career.salary_entry_min, max: career.salary_entry_max }
      } : null,
      outlook: career.job_outlook,
      demand: career.demand_level,
      fullData: career
    }));
    
  } catch (error) {
    console.error('Error in enhanced fallback system:', error);
    
    // Emergency fallback: return hardcoded popular careers
    return getEmergencyFallbackCareers(profile, existingCareers);
  }
}

/**
 * Get subject category for fallback matching
 * @private
 */
function getSubjectCategory(subject) {
  const categoryMap = {
    'Mathematics': 'Engineering',
    'Physical Sciences': 'Engineering', 
    'Life Sciences': 'Healthcare',
    'Information Technology': 'Technology',
    'Business Studies': 'Business',
    'Accounting': 'Finance',
    'English': 'Education',
    'Visual Arts': 'Creative'
  };
  
  return categoryMap[subject] || 'General';
}

/**
 * Check if career is appropriate for grade level
 * @private
 */
function isGradeAppropriate(career, grade) {
  // All careers are appropriate, but we can add logic here later
  // For now, just exclude very specialized careers for Grade 10
  if (grade === 10) {
    const specializedKeywords = ['specialist', 'senior', 'lead', 'principal'];
    const title = (career.career_title || '').toLowerCase();
    return !specializedKeywords.some(keyword => title.includes(keyword));
  }
  
  return true;
}

/**
 * Emergency fallback when database queries fail
 * @private
 */
function getEmergencyFallbackCareers(profile, existingCareers) {
  console.log('🚨 Using emergency fallback careers');
  
  const emergencyCareers = [
    {
      title: 'Software Engineer',
      category: 'Technology',
      description: 'Design and develop software applications and systems.',
      similarity: 0.4,
      confidence: 0.5,
      source: 'emergency_fallback'
    },
    {
      title: 'Business Analyst', 
      category: 'Business',
      description: 'Analyze business processes and recommend improvements.',
      similarity: 0.4,
      confidence: 0.5,
      source: 'emergency_fallback'
    },
    {
      title: 'Teacher',
      category: 'Education', 
      description: 'Educate and inspire students in various subjects.',
      similarity: 0.4,
      confidence: 0.5,
      source: 'emergency_fallback'
    }
  ];
  
  const existingTitles = new Set(existingCareers.map(c => c.title));
  return emergencyCareers.filter(c => !existingTitles.has(c.title));
}
