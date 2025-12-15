// lib/rag/career-matcher.js
// Phase 3: Enhanced Career Matching Algorithm
// Enhanced with flexible metadata filtering and intelligent fallbacks

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { semanticSearch, hybridSearch } from './search.js';
import { MetadataFilter } from './metadata-filter.js';
import { FallbackSelector } from './fallback-selector.js';
import { PerformanceOptimizer } from './performance-optimizer.js';
import { RAGErrorHandler } from './error-handler.js';
import { SafetyValidator } from './safety-validator.js';
import { AnalyticsCollector } from './analytics-collector.js';
import { 
  calculateCategoryRelevance, 
  getPrioritizedCategories,
  analyzeSubjectPortfolio 
} from './subject-category-map.js';
import { InputValidator } from './input-validator.js';
import { isFeatureEnabled, getFeatureFlagManager } from './feature-flags.js';

// Lazy initialization
let supabase = null;
let openai = null;
let metadataFilter = null;
let fallbackSelector = null;
let performanceOptimizer = null;
let errorHandler = null;
let safetyValidator = null;
let analyticsCollector = null;
let inputValidator = null;

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

function getPerformanceOptimizer() {
  if (!performanceOptimizer) {
    performanceOptimizer = new PerformanceOptimizer({
      enableCaching: true,
      cacheTimeout: 300000, // 5 minutes
      maxConcurrency: 3,
      enableMonitoring: true
    });
  }
  return performanceOptimizer;
}

function getErrorHandler() {
  if (!errorHandler) {
    errorHandler = new RAGErrorHandler({
      enableLogging: true,
      enableMetrics: true,
      enableFallbacks: true,
      maxRetries: 3,
      retryDelay: 1000,
      timeoutMs: 30000
    });
  }
  return errorHandler;
}

function getSafetyValidator() {
  if (!safetyValidator) {
    safetyValidator = new SafetyValidator({
      enableLogging: true,
      strictMode: false,
      requireVerificationFooter: true,
      maxCareerTitleLength: 100,
      minCareerDescriptionLength: 20
    });
  }
  return safetyValidator;
}

function getAnalyticsCollector() {
  if (!analyticsCollector) {
    analyticsCollector = new AnalyticsCollector({
      enableLogging: true,
      enableMetrics: true,
      retentionDays: 7,
      maxSamples: 1000
    });
  }
  return analyticsCollector;
}

function getInputValidator() {
  if (!inputValidator) {
    inputValidator = new InputValidator({
      strictMode: false,
      enableLogging: true,
      supportedGrades: [10, 11, 12],
      maxSubjects: 15,
      maxInterests: 10
    });
  }
  return inputValidator;
}

/**
 * Generate embedding for a text query with caching and error handling
 * @param {string} text - Text to embed
 * @returns {Promise<Array>} - 1536-dimensional embedding vector
 */
async function generateEmbedding(text) {
  const optimizer = getPerformanceOptimizer();
  const errorHandler = getErrorHandler();
  const cacheKey = `embedding:${Buffer.from(text).toString('base64').slice(0, 50)}`;
  
  return await optimizer.getCachedOrExecute(cacheKey, async () => {
    const embeddingResult = await errorHandler.wrapOperation(
      async () => {
        const client = getOpenAIClient();
        const response = await client.embeddings.create({
          model: 'text-embedding-ada-002',
          input: text,
        });
        return response.data[0].embedding;
      },
      {
        operationType: 'embedding',
        text
      }
    );
    
    if (embeddingResult.success) {
      return embeddingResult.data;
    } else {
      console.error('Error generating embedding:', embeddingResult.error);
      
      // If we have a fallback embedding, use it
      if (embeddingResult.data) {
        console.log('Using fallback embedding');
        return embeddingResult.data;
      }
      
      // Otherwise throw the error to be handled upstream
      throw new Error(embeddingResult.error);
    }
  });
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
 * Calculate profile complexity score to determine appropriate career count
 * @param {Object} profile - User profile
 * @returns {Object} - Complexity analysis with recommended career count
 */
function calculateProfileComplexity(profile) {
  let complexityScore = 0;
  let factors = [];
  
  // Subject diversity (0-3 points)
  if (profile.subjects && Array.isArray(profile.subjects)) {
    const subjectCount = profile.subjects.length;
    if (subjectCount >= 6) {
      complexityScore += 3;
      factors.push(`${subjectCount} subjects (comprehensive)`);
    } else if (subjectCount >= 4) {
      complexityScore += 2;
      factors.push(`${subjectCount} subjects (moderate)`);
    } else if (subjectCount >= 2) {
      complexityScore += 1;
      factors.push(`${subjectCount} subjects (basic)`);
    }
  }
  
  // Interest diversity (0-2 points)
  if (profile.interests && Array.isArray(profile.interests)) {
    const interestCount = profile.interests.length;
    if (interestCount >= 4) {
      complexityScore += 2;
      factors.push(`${interestCount} interests (diverse)`);
    } else if (interestCount >= 2) {
      complexityScore += 1;
      factors.push(`${interestCount} interests (moderate)`);
    }
  }
  
  // Academic performance diversity (0-2 points)
  if (profile.marks && typeof profile.marks === 'object') {
    const markEntries = Object.entries(profile.marks);
    const highPerformanceSubjects = markEntries.filter(([_, mark]) => mark >= 70).length;
    
    if (highPerformanceSubjects >= 5) {
      complexityScore += 2;
      factors.push(`${highPerformanceSubjects} high-performance subjects`);
    } else if (highPerformanceSubjects >= 3) {
      complexityScore += 1;
      factors.push(`${highPerformanceSubjects} high-performance subjects`);
    }
  }
  
  // Career preferences specificity (0-1 point)
  if (profile.careerPreferences && profile.careerPreferences.length > 50) {
    complexityScore += 1;
    factors.push('detailed career preferences');
  }
  
  // Grade level consideration (0-1 point)
  if (profile.grade >= 11) {
    complexityScore += 1;
    factors.push(`Grade ${profile.grade} (advanced planning)`);
  }
  
  // Determine recommended career count based on complexity
  let recommendedCount;
  let profileType;
  
  if (complexityScore >= 7) {
    recommendedCount = 5;
    profileType = 'comprehensive';
  } else if (complexityScore >= 5) {
    recommendedCount = 4;
    profileType = 'broad';
  } else if (complexityScore >= 3) {
    recommendedCount = 3;
    profileType = 'moderate';
  } else {
    recommendedCount = 3; // Minimum as per requirements
    profileType = 'basic';
  }
  
  return {
    score: complexityScore,
    factors,
    recommendedCount,
    profileType,
    maxAllowed: 5 // Hard limit as per requirements
  };
}

/**
 * Match careers to user profile using RAG with broad profile handling
 * @param {Object} profile - User profile with subjects, interests, marks, etc.
 * @param {Object} options - Matching options
 * @returns {Promise<Array>} - Matched careers with metadata
 */
export async function matchCareersToProfile(profile, options = {}) {
  const startTime = Date.now();
  const optimizer = getPerformanceOptimizer();
  
  // Feature flag context for rollout decisions
  const featureContext = {
    sessionId: options.sessionId,
    userId: options.userId,
    ipAddress: options.ipAddress
  };
  
  try {
    // ENHANCED: Comprehensive input validation and edge case handling (with feature flag)
    console.log('🔍 Validating student profile...');
    
    let validation;
    if (isFeatureEnabled('enhanced_rag_filtering', featureContext)) {
      const validator = getInputValidator();
      validation = validator.validateProfile(profile);
      console.log('🚩 Using enhanced input validation');
    } else {
      // Legacy validation - basic checks only
      validation = {
        isValid: profile && typeof profile === 'object' && profile.grade && profile.subjects,
        errors: [],
        warnings: [],
        edgeCases: [],
        sanitizedProfile: profile
      };
      console.log('📊 Using legacy input validation');
    }
    
    // Handle validation results
    if (!validation.isValid) {
      console.log('❌ Profile validation failed:', validation.errors);
      
      // Use fallback profile if available
      if (validation.sanitizedProfile) {
        console.log('🔄 Using sanitized fallback profile');
        profile = validation.sanitizedProfile;
      } else {
        // Return emergency careers for completely invalid profiles
        console.log('🚨 Using emergency careers for invalid profile');
        const errorHandler = getErrorHandler();
        const emergencyResult = await errorHandler.handleSystemError(
          new Error('Invalid profile - using emergency careers'), 
          { profile: profile || {}, operation: 'profile_validation' }
        );
        
        if (emergencyResult.success && emergencyResult.data.careers) {
          return emergencyResult.data.careers;
        }
        
        // Last resort: hardcoded emergency careers
        return getEmergencyFallbackCareers({}, []);
      }
    } else if (validation.warnings.length > 0 || validation.edgeCases.length > 0) {
      console.log('⚠️ Profile validation warnings:', validation.warnings);
      console.log('🎯 Edge cases detected:', validation.edgeCases);
      
      // Use sanitized profile
      profile = validation.sanitizedProfile;
    } else {
      console.log('✅ Profile validation passed');
      profile = validation.sanitizedProfile;
    }

    // ENHANCED: Calculate profile complexity to determine appropriate career count (with feature flag)
    let complexity;
    if (isFeatureEnabled('profile_complexity_analysis', featureContext)) {
      complexity = calculateProfileComplexity(profile);
      console.log('🚩 Using dynamic profile complexity analysis');
    } else {
      // Legacy: Fixed career count
      complexity = {
        score: 3,
        factors: ['legacy mode'],
        recommendedCount: 3,
        profileType: 'standard',
        maxAllowed: 5
      };
      console.log('📊 Using legacy fixed career count (3)');
    }
    
    const {
      limit = complexity.recommendedCount, // Dynamic limit based on profile complexity
      maxLimit = complexity.maxAllowed,    // Hard maximum limit
      minSimilarity = 0.6,  // LOWERED from 0.7 to 0.6 for more matches
      useHybrid = true
    } = options;
    
    // Validate and enforce limits
    const effectiveLimit = Math.min(Math.max(limit, 3), maxLimit); // Ensure 3-5 range
    
    console.log('📊 Profile Complexity Analysis:', {
      score: complexity.score,
      type: complexity.profileType,
      factors: complexity.factors,
      recommendedCount: complexity.recommendedCount,
      effectiveLimit: effectiveLimit,
      edgeCases: validation.edgeCases
    });
    
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
    
    // Perform search (get more results to filter) - ENHANCED: Dynamic multiplier based on profile complexity
    const searchMultiplier = complexity.profileType === 'comprehensive' ? 15 : 
                           complexity.profileType === 'broad' ? 12 : 10;
    
    let results;
    if (useHybrid) {
      const keywords = extractKeywords(profile);
      results = await hybridSearch(queryEmbedding, keywords, { limit: effectiveLimit * searchMultiplier });
    } else {
      results = await semanticSearch(queryEmbedding, { limit: effectiveLimit * searchMultiplier });
    }
    
    console.log(`🔍 Search strategy: ${searchMultiplier}x multiplier for ${complexity.profileType} profile`);
    
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
    
    // Stage 2: Enhanced metadata filter with error handling (with feature flag)
    let afterMetadata;
    
    if (isFeatureEnabled('enhanced_rag_filtering', featureContext)) {
      const errorHandler = getErrorHandler();
      
      const filterResult = await errorHandler.wrapOperation(
        async () => {
          const filter = getMetadataFilter();
          return filter.filter(afterSimilarity, { logDetails: true });
        },
        {
          operationType: 'metadata_filter',
          chunks: afterSimilarity
        }
      );
      
      if (filterResult.success) {
        afterMetadata = filterResult.data;
        if (filterResult.fallbackUsed) {
          console.log(`   [FILTER] Stage 2 (enhanced metadata with ${filterResult.fallbackUsed}): ${afterSimilarity.length} → ${afterMetadata.length}`);
        } else {
          console.log(`   [FILTER] Stage 2 (enhanced metadata): ${afterSimilarity.length} → ${afterMetadata.length}`);
        }
      } else {
        console.error(`   [FILTER] Stage 2 failed: ${filterResult.error}`);
        afterMetadata = afterSimilarity; // Use unfiltered results as fallback
        console.log(`   [FILTER] Stage 2 (fallback - no filtering): ${afterSimilarity.length} → ${afterMetadata.length}`);
      }
      console.log('🚩 Using enhanced metadata filtering');
    } else {
      // Legacy metadata filtering - basic career_code check only
      afterMetadata = afterSimilarity.filter(chunk => 
        chunk.chunk_metadata?.career_code || chunk.chunk_metadata?.career_title
      );
      console.log(`   [FILTER] Stage 2 (legacy metadata): ${afterSimilarity.length} → ${afterMetadata.length}`);
      console.log('📊 Using legacy metadata filtering');
    }
    
    const rankedCareers = afterMetadata.slice(0, effectiveLimit);
    console.log(`   [FILTER] Stage 3 (limit to ${effectiveLimit}): ${afterMetadata.length} → ${rankedCareers.length}`);
    
    // Enrich with career metadata
    const enrichedCareers = await enrichCareerData(rankedCareers);
    
    console.log(`   [FILTER] Stage 4 (enrichment): ${rankedCareers.length} → ${enrichedCareers.length}`);
    
    // ENHANCED: Validate career quality and trigger intelligent fallback if needed
    const validCareers = enrichedCareers.filter(career => isValidCareer(career));
    console.log(`   [FILTER] Stage 5 (career validation): ${enrichedCareers.length} → ${validCareers.length}`);
    
    // ENHANCED: Apply subject-category prioritization (with feature flag)
    let prioritizedCareers;
    if (isFeatureEnabled('subject_category_prioritization', featureContext)) {
      prioritizedCareers = applySubjectCategoryPrioritization(validCareers, profile);
      console.log(`   [FILTER] Stage 6 (subject-category prioritization): ${validCareers.length} → ${prioritizedCareers.length}`);
      console.log('🚩 Using subject-category prioritization');
    } else {
      // Legacy: No prioritization, just use careers as-is
      prioritizedCareers = validCareers;
      console.log(`   [FILTER] Stage 6 (legacy - no prioritization): ${validCareers.length} → ${prioritizedCareers.length}`);
      console.log('📊 Using legacy career ordering');
    }
    
    let finalCareers = prioritizedCareers;
    
    // ENHANCED: Dynamic fallback targeting based on profile complexity
    const minRequiredCareers = 3; // Absolute minimum as per requirements
    const targetCareerCount = complexity.recommendedCount;
    
    if (prioritizedCareers.length < minRequiredCareers) {
      console.log(`   ⚠️ WARNING: Only ${prioritizedCareers.length} prioritized careers found (minimum: ${minRequiredCareers}), checking fallback system`);
      
      if (isFeatureEnabled('fallback_careers', featureContext)) {
        console.log('🚩 Using intelligent fallback system');
        const errorHandler = getErrorHandler();
        
        const fallbackResult = await errorHandler.wrapOperation(
          async () => {
            const selector = getFallbackSelector();
            return await selector.selectFallbacks(profile, prioritizedCareers, targetCareerCount);
          },
          {
            operationType: 'fallback_selector',
            profile,
            existingCareers: prioritizedCareers,
            targetCount: targetCareerCount
          }
        );
        
        if (fallbackResult.success) {
          const fallbackCareers = fallbackResult.data;
          finalCareers = [...prioritizedCareers, ...fallbackCareers];
          console.log(`   ✅ Added ${fallbackCareers.length} intelligent fallback careers (total: ${finalCareers.length})`);
        } else {
          console.error(`   ❌ Intelligent fallback system failed: ${fallbackResult.error}`);
          finalCareers = [...prioritizedCareers, ...getEmergencyFallbackCareers(profile, prioritizedCareers)];
        }
      } else {
        console.log('📊 Using legacy emergency fallback');
        finalCareers = [...prioritizedCareers, ...getEmergencyFallbackCareers(profile, prioritizedCareers)];
      }
    } else if (prioritizedCareers.length < targetCareerCount && complexity.profileType === 'comprehensive') {
      console.log(`   ℹ️ Comprehensive profile has ${prioritizedCareers.length}/${targetCareerCount} careers, checking for supplementary careers`);
      
      if (isFeatureEnabled('fallback_careers', featureContext)) {
        console.log('🚩 Using intelligent supplementary career selection');
        const errorHandler = getErrorHandler();
        
        const fallbackResult = await errorHandler.wrapOperation(
          async () => {
            const selector = getFallbackSelector();
            const supplementaryCount = targetCareerCount - prioritizedCareers.length;
            return await selector.selectFallbacks(profile, prioritizedCareers, supplementaryCount);
          },
          {
            operationType: 'fallback_selector',
            profile,
            existingCareers: prioritizedCareers,
            targetCount: supplementaryCount
          }
        );
        
        if (fallbackResult.success) {
          const fallbackCareers = fallbackResult.data;
          finalCareers = [...prioritizedCareers, ...fallbackCareers];
          console.log(`   ✅ Added ${fallbackCareers.length} intelligent fallback careers (total: ${finalCareers.length})`);
          
          if (fallbackResult.fallbackUsed) {
            console.log(`   ℹ️ Fallback method used: ${fallbackResult.fallbackUsed}`);
          }
        } else {
          console.error(`   ❌ Intelligent fallback system failed: ${fallbackResult.error}`);
          finalCareers = prioritizedCareers; // Continue with what we have
        }
      } else {
        console.log('📊 Using legacy mode - no supplementary careers');
        finalCareers = prioritizedCareers;
      }
    }
    
    // ENHANCED: Enforce maximum career count limits
    if (finalCareers.length > maxLimit) {
      console.log(`   ⚠️ Limiting careers from ${finalCareers.length} to maximum allowed ${maxLimit}`);
      finalCareers = finalCareers.slice(0, maxLimit);
    }
    
    // ENHANCED: Log final career distribution
    console.log(`🎯 Final Career Distribution:`, {
      total: finalCareers.length,
      ragCareers: finalCareers.filter(c => c.source === 'rag').length,
      fallbackCareers: finalCareers.filter(c => c.source !== 'rag').length,
      profileType: complexity.profileType,
      targetCount: targetCareerCount,
      maxAllowed: maxLimit
    });
    
    // ENHANCED: Safety validation for all careers (with feature flag)
    let validatedCareers;
    if (isFeatureEnabled('enhanced_safety_validation', featureContext)) {
      const safetyValidator = getSafetyValidator();
      const safetyValidation = safetyValidator.validateCareers(finalCareers, {
        profile: profile,
        source: 'enhanced_rag_matching'
      });
      
      console.log(`🛡️ Enhanced safety validation: ${safetyValidation.summary.valid}/${safetyValidation.summary.total} careers passed`);
      
      if (safetyValidation.summary.warnings > 0) {
        console.log(`⚠️ Safety warnings: ${safetyValidation.summary.warnings} issues detected`);
      }
      
      if (safetyValidation.summary.invalid > 0) {
        console.log(`❌ Safety violations: ${safetyValidation.summary.invalid} careers rejected`);
      }
      
      validatedCareers = safetyValidation.validCareers;
      console.log('🚩 Using enhanced safety validation');
    } else {
      // Legacy safety validation - basic checks only
      validatedCareers = finalCareers.filter(career => 
        career.title && career.title.length > 2 && 
        career.description && career.description.length > 10
      );
      console.log(`🛡️ Legacy safety validation: ${validatedCareers.length}/${finalCareers.length} careers passed basic checks`);
      console.log('📊 Using legacy safety validation');
    }
    
    console.log(`🎯 Returning ${validatedCareers.length} safety-validated careers`);
    
    // Log performance metrics
    const duration = Date.now() - startTime;
    console.log(`⏱️ Career matching completed in ${duration}ms`);
    
    // Check performance thresholds
    const alerts = optimizer.checkPerformanceThresholds();
    if (alerts.length > 0) {
      console.warn('⚠️ Performance alerts:', alerts);
    }
    
    // ENHANCED: Record analytics data with profile complexity and validation metrics (with feature flag)
    if (isFeatureEnabled('performance_monitoring', featureContext)) {
      const analytics = getAnalyticsCollector();
      analytics.recordRequest({
        profile: profile,
        careers: validatedCareers,
        profileComplexity: {
          score: complexity.score,
          type: complexity.profileType,
          factors: complexity.factors,
          recommendedCount: complexity.recommendedCount,
          actualCount: validatedCareers.length
        },
        validation: {
          isValid: validation.isValid,
          errorCount: validation.errors.length,
          warningCount: validation.warnings.length,
          edgeCases: validation.edgeCases,
          sanitized: validation.sanitizedProfile !== null
        },
        performance: {
          totalTime: duration,
          ragTime: duration * 0.6, // Estimate
          filterTime: duration * 0.3, // Estimate
          fallbackTime: duration * 0.1 // Estimate
        },
        filterStages: {
          initialResults: results.length,
          afterSimilarity: afterSimilarity.length,
          afterMetadata: afterMetadata.length,
          afterValidation: validCareers.length,
          afterPrioritization: prioritizedCareers.length,
          finalCount: validatedCareers.length
        },
        featureFlags: {
          enhanced_rag_filtering: isFeatureEnabled('enhanced_rag_filtering', featureContext),
          fallback_careers: isFeatureEnabled('fallback_careers', featureContext),
          subject_category_prioritization: isFeatureEnabled('subject_category_prioritization', featureContext),
          profile_complexity_analysis: isFeatureEnabled('profile_complexity_analysis', featureContext),
          enhanced_safety_validation: isFeatureEnabled('enhanced_safety_validation', featureContext)
        },
        success: true,
        fallbacksUsed: finalCareers.filter(c => c.source !== 'rag').map(c => c.source)
      });
      console.log('🚩 Detailed analytics recorded');
    } else {
      console.log('📊 Analytics recording disabled');
    }
    
    // Check feature flag safeguards
    const flagManager = getFeatureFlagManager();
    const metrics = {
      responseTime: duration,
      careerCount: validatedCareers.length,
      averageConfidence: validatedCareers.reduce((sum, c) => sum + (c.confidence || 0.5), 0) / validatedCareers.length,
      memoryUsageMB: process.memoryUsage().heapUsed / (1024 * 1024)
    };
    
    // Check safeguards for enabled features
    ['enhanced_rag_filtering', 'fallback_careers', 'performance_monitoring'].forEach(flagName => {
      if (isFeatureEnabled(flagName, featureContext)) {
        flagManager.autoDisableOnViolation(flagName, metrics);
      }
    });
    
    return validatedCareers;
    
  } catch (error) {
    console.error('❌ Error matching careers:', error);
    
    // Log error metrics
    const duration = Date.now() - startTime;
    optimizer._updateMetrics('career_matching', duration, false);
    
    // Try to provide emergency fallback
    const errorHandler = getErrorHandler();
    const emergencyResult = await errorHandler.handleSystemError(error, {
      profile: profile || {},
      operation: 'career_matching',
      duration,
      validationFailed: true
    });
    
    if (emergencyResult.success) {
      console.log('🚨 Returning emergency career recommendations');
      return emergencyResult.data.careers || [];
    }
    
    // Last resort: return hardcoded emergency careers
    console.log('🚨 Using hardcoded emergency careers');
    return getEmergencyFallbackCareers(profile || {}, []);
  }
}

/**
 * Enrich career chunks with full career data from database (optimized with parallel processing)
 * @param {Array} careerChunks - Matched career chunks
 * @returns {Promise<Array>} - Enriched career data
 */
async function enrichCareerData(careerChunks) {
  const optimizer = getPerformanceOptimizer();
  const client = getSupabaseClient();
  
  // Extract unique career codes for batch processing
  const careerCodes = [...new Set(
    careerChunks
      .map(chunk => chunk.chunk_metadata?.career_code)
      .filter(Boolean)
  )];
  
  // Batch fetch career data in parallel
  let careerDataMap = new Map();
  if (careerCodes.length > 0) {
    const batchQueries = careerCodes.map(code => 
      () => optimizer.getCachedOrExecute(`career:${code}`, async () => {
        const errorHandler = getErrorHandler();
        
        const dbResult = await errorHandler.wrapOperation(
          async () => {
            const { data, error } = await client
              .from('careers')
              .select('*')
              .eq('career_code', code)
              .single();
            
            if (error) throw new Error(`Database query failed: ${error.message}`);
            return data;
          },
          {
            operationType: 'database',
            query: `careers.eq('career_code', '${code}')`
          }
        );
        
        return dbResult.success ? dbResult.data : null;
      })
    );
    
    const careerDataResults = await optimizer.executeParallel(batchQueries);
    
    // Build career data map
    careerCodes.forEach((code, index) => {
      if (careerDataResults[index]) {
        careerDataMap.set(code, careerDataResults[index]);
      }
    });
  }
  
  // Process chunks with fetched data
  const enriched = [];
  
  for (const chunk of careerChunks) {
    const metadata = chunk.chunk_metadata || {};
    const careerCode = metadata.career_code;
    const careerData = careerDataMap.get(careerCode);
    
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
 * ENHANCED: Export profile complexity calculation for testing and external use
 * @param {Object} profile - User profile
 * @returns {Object} - Complexity analysis
 */
export function analyzeProfileComplexity(profile) {
  return calculateProfileComplexity(profile);
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

/**
 * Apply subject-category prioritization to careers
 * @param {Array} careers - Career objects to prioritize
 * @param {Object} profile - Student profile with subjects
 * @returns {Array} - Prioritized and sorted careers
 */
function applySubjectCategoryPrioritization(careers, profile) {
  if (!Array.isArray(careers) || careers.length === 0) {
    return careers;
  }

  if (!profile.subjects || !Array.isArray(profile.subjects) || profile.subjects.length === 0) {
    console.log('   ℹ️ No subjects provided, skipping category prioritization');
    return careers;
  }

  console.log(`   🎯 Applying subject-category prioritization for subjects: ${profile.subjects.join(', ')}`);

  // Get student's prioritized categories
  const prioritizedCategories = getPrioritizedCategories(profile.subjects);
  console.log(`   📊 Top categories: ${prioritizedCategories.slice(0, 3).map(c => `${c.category}(${c.score.toFixed(2)})`).join(', ')}`);

  // Calculate category relevance score for each career
  const scoredCareers = careers.map(career => {
    let categoryScore = 0;
    
    if (career.category) {
      categoryScore = calculateCategoryRelevance(profile.subjects, career.category);
    }
    
    // Combine original similarity with category relevance
    const originalScore = career.similarity || 0.5;
    const combinedScore = (originalScore * 0.7) + (categoryScore * 0.3); // 70% similarity, 30% category relevance
    
    return {
      ...career,
      categoryRelevance: categoryScore,
      combinedScore: combinedScore,
      originalSimilarity: originalScore
    };
  });

  // Sort by combined score (descending)
  const sortedCareers = scoredCareers.sort((a, b) => b.combinedScore - a.combinedScore);

  // Ensure category diversity in top results
  const diversifiedCareers = ensureCategoryDiversity(sortedCareers, 5);

  console.log(`   ✅ Category prioritization complete:`);
  diversifiedCareers.slice(0, 3).forEach((career, index) => {
    console.log(`     ${index + 1}. ${career.title} (${career.category || 'N/A'}) - Combined: ${career.combinedScore.toFixed(3)}, Category: ${career.categoryRelevance.toFixed(3)}`);
  });

  // ENHANCED: Apply diversity enforcement and STEM boosting
  const diversityEnforced = enforceCareerDiversity(diversifiedCareers, profile);
  const stemBoosted = boostSTEMForMathStudents(diversityEnforced, profile);
  
  return stemBoosted;
}
/**
 * ENHANCED: Enforce career diversity to prevent teaching bias
 * Ensures no single career category dominates recommendations
 * @param {Array} careers - Sorted careers
 * @param {Object} profile - Student profile
 * @returns {Array} - Diversity-enforced career list
 */
function enforceCareerDiversity(careers, profile) {
  if (!Array.isArray(careers) || careers.length <= 1) {
    return careers;
  }

  console.log('   🎨 Enforcing career diversity to prevent bias...');
  
  // Group careers by category
  const categoryGroups = {};
  careers.forEach(career => {
    const category = career.category || 'General';
    if (!categoryGroups[category]) {
      categoryGroups[category] = [];
    }
    categoryGroups[category].push(career);
  });
  
  const categories = Object.keys(categoryGroups);
  console.log(`   📊 Found ${categories.length} categories: ${categories.join(', ')}`);
  
  // Check for teaching bias (more than 60% teaching careers)
  const teachingCategories = ['Education', 'Teaching'];
  const teachingCareers = careers.filter(c => 
    teachingCategories.includes(c.category) || 
    /teach|education|instructor|professor/gi.test(c.title || '')
  );
  
  const teachingPercentage = (teachingCareers.length / careers.length) * 100;
  console.log(`   🎓 Teaching careers: ${teachingCareers.length}/${careers.length} (${teachingPercentage.toFixed(1)}%)`);
  
  if (teachingPercentage > 60) {
    console.log('   ⚠️ TEACHING BIAS DETECTED - Applying diversity correction');
    
    // Limit teaching careers to maximum 1 in top 3
    const nonTeachingCareers = careers.filter(c => 
      !teachingCategories.includes(c.category) && 
      !/teach|education|instructor|professor/gi.test(c.title || '')
    );
    
    const diversifiedCareers = [];
    let teachingAdded = 0;
    const maxTeachingInTop3 = 1;
    
    // Add careers ensuring diversity
    for (const career of careers) {
      const isTeaching = teachingCategories.includes(career.category) || 
                        /teach|education|instructor|professor/gi.test(career.title || '');
      
      if (isTeaching) {
        if (teachingAdded < maxTeachingInTop3 || diversifiedCareers.length >= 3) {
          diversifiedCareers.push(career);
          if (diversifiedCareers.length <= 3) teachingAdded++;
        }
      } else {
        diversifiedCareers.push(career);
      }
      
      if (diversifiedCareers.length >= careers.length) break;
    }
    
    console.log(`   ✅ Diversity correction applied: ${teachingAdded} teaching career(s) in top 3`);
    return diversifiedCareers;
  }
  
  // No bias detected, return original order
  console.log('   ✅ No teaching bias detected, maintaining original order');
  return careers;
}

/**
 * ENHANCED: Boost STEM careers for mathematics students
 * @param {Array} careers - Career list
 * @param {Object} profile - Student profile
 * @returns {Array} - STEM-boosted career list
 */
function boostSTEMForMathStudents(careers, profile) {
  if (!profile.subjects || !Array.isArray(profile.subjects)) {
    return careers;
  }
  
  const hasMath = profile.subjects.some(subject => 
    /mathematics|math|physical sciences|physics/gi.test(subject)
  );
  
  if (!hasMath) {
    return careers;
  }
  
  console.log('   🧮 Mathematics student detected - boosting STEM careers');
  
  const stemCategories = ['Engineering', 'Technology', 'Science', 'Mathematics', 'Computer Science'];
  const stemKeywords = /engineer|software|programming|technology|science|research|data|computer|IT|developer|analyst/gi;
  
  const boostedCareers = careers.map(career => {
    const isSTEM = stemCategories.includes(career.category) || 
                   stemKeywords.test(career.title || '') ||
                   stemKeywords.test(career.description || '');
    
    if (isSTEM) {
      return {
        ...career,
        combinedScore: (career.combinedScore || career.similarity || 0.5) + 0.15, // Boost STEM
        stemBoosted: true
      };
    }
    
    return career;
  });
  
  // Re-sort with STEM boost
  boostedCareers.sort((a, b) => (b.combinedScore || b.similarity || 0) - (a.combinedScore || a.similarity || 0));
  
  const stemCount = boostedCareers.filter(c => c.stemBoosted).length;
  console.log(`   ✅ STEM boost applied to ${stemCount} careers`);
  
  return boostedCareers;
}

/**
 * Ensure category diversity in career results
 * @param {Array} careers - Sorted careers
 * @param {number} maxResults - Maximum number of results
 * @returns {Array} - Diversified career list
 */
function ensureCategoryDiversity(careers, maxResults) {
  if (!Array.isArray(careers) || careers.length <= maxResults) {
    return careers;
  }

  const diversified = [];
  const usedCategories = new Set();
  const remainingCareers = [...careers];

  // First pass: select one from each category (highest scoring)
  for (const career of careers) {
    if (diversified.length >= maxResults) break;
    
    const category = career.category || 'General';
    if (!usedCategories.has(category)) {
      diversified.push(career);
      usedCategories.add(category);
      remainingCareers.splice(remainingCareers.indexOf(career), 1);
    }
  }

  // Second pass: fill remaining slots with best remaining careers
  for (const career of remainingCareers) {
    if (diversified.length >= maxResults) break;
    diversified.push(career);
  }

  // Log diversity metrics
  const categories = diversified.map(c => c.category || 'General');
  const uniqueCategories = new Set(categories);
  console.log(`   🎨 Category diversity: ${uniqueCategories.size} categories in ${diversified.length} careers`);

  return diversified.slice(0, maxResults);
}
