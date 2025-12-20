#!/usr/bin/env node

/**
 * Investigate Cache and Session Issues
 * Analyzes why APS data isn't persisting for individual students
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Investigating Cache and Session Issues');
console.log('='.repeat(60));

function analyzeCacheSystem() {
  console.log('\n💾 Analyzing Cache System');
  
  // Check cache implementation
  const cacheFile = path.join(__dirname, 'lib/cache/rag-cache.js');
  if (fs.existsSync(cacheFile)) {
    const cacheContent = fs.readFileSync(cacheFile, 'utf8');
    
    console.log('🔍 Cache System Analysis:');
    
    // Check cache key generation
    const hasCacheKey = cacheContent.includes('cacheKey') || cacheContent.includes('generateKey');
    console.log(`   Cache key generation: ${hasCacheKey ? '✅' : '❌'}`);
    
    // Check if cache includes user-specific data
    const hasUserSpecific = cacheContent.includes('profile') || cacheContent.includes('marks') || cacheContent.includes('student');
    console.log(`   User-specific caching: ${hasUserSpecific ? '✅' : '❌'}`);
    
    // Check cache invalidation
    const hasCacheInvalidation = cacheContent.includes('delete') || cacheContent.includes('clear') || cacheContent.includes('invalidate');
    console.log(`   Cache invalidation: ${hasCacheInvalidation ? '✅' : '❌'}`);
    
    // Look for potential issues
    if (cacheContent.includes('query') && !cacheContent.includes('profile')) {
      console.log('   ⚠️ POTENTIAL ISSUE: Cache may be keyed only on query, not user data');
    }
    
    if (cacheContent.includes('global') || cacheContent.includes('shared')) {
      console.log('   ⚠️ POTENTIAL ISSUE: Cache may be shared across users');
    }
    
  } else {
    console.log('   ❌ Cache file not found');
  }
}

function analyzeSessionHandling() {
  console.log('\n👤 Analyzing Session Handling');
  
  const assessmentForm = fs.readFileSync(
    path.join(__dirname, 'app/assessment/components/AssessmentForm.jsx'), 
    'utf8'
  );
  
  console.log('🔍 Session Analysis:');
  
  // Check localStorage usage
  const hasLocalStorage = assessmentForm.includes('localStorage');
  console.log(`   localStorage usage: ${hasLocalStorage ? '✅' : '❌'}`);
  
  // Check session identification
  const hasSessionId = assessmentForm.includes('sessionId') || assessmentForm.includes('userId') || assessmentForm.includes('timestamp');
  console.log(`   Session identification: ${hasSessionId ? '✅' : '❌'}`);
  
  // Check data persistence
  const hasDataPersistence = assessmentForm.includes('STORAGE_KEY') && assessmentForm.includes('setItem');
  console.log(`   Data persistence: ${hasDataPersistence ? '✅' : '❌'}`);
  
  // Check if marks data is properly saved
  const marksDataSaving = assessmentForm.includes('marksData') && assessmentForm.includes('localStorage');
  console.log(`   Marks data saving: ${marksDataSaving ? '✅' : '❌'}`);
}

function analyzeAPIDataFlow() {
  console.log('\n🔌 Analyzing API Data Flow');
  
  const apiRoute = fs.readFileSync(
    path.join(__dirname, 'app/api/rag/query/route.js'), 
    'utf8'
  );
  
  console.log('🔍 API Data Flow Analysis:');
  
  // Check if API receives profile data
  const receivesProfile = apiRoute.includes('profile') && apiRoute.includes('marksData');
  console.log(`   Receives profile data: ${receivesProfile ? '✅' : '❌'}`);
  
  // Check cache key generation in API
  const cacheKeyGeneration = apiRoute.includes('cacheProfile') || apiRoute.includes('getCachedResponse');
  console.log(`   Cache key generation: ${cacheKeyGeneration ? '✅' : '❌'}`);
  
  // Check if marks are extracted properly
  const marksExtraction = apiRoute.includes('exactMarks') && apiRoute.includes('marksData');
  console.log(`   Marks extraction: ${marksExtraction ? '✅' : '❌'}`);
  
  // Look for cache key issues
  if (apiRoute.includes('getCachedResponse') && !apiRoute.includes('profile')) {
    console.log('   ⚠️ POTENTIAL ISSUE: Cache key may not include user profile');
  }
}

function identifyRootCause() {
  console.log('\n🎯 Root Cause Analysis');
  
  console.log('🔍 Potential Issues Identified:');
  
  const issues = [
    {
      issue: 'Cache Collision',
      description: 'Multiple students getting same cached response',
      likelihood: 'HIGH',
      impact: 'CRITICAL'
    },
    {
      issue: 'Session Data Loss',
      description: 'Marks data not persisting between steps',
      likelihood: 'MEDIUM',
      impact: 'HIGH'
    },
    {
      issue: 'API Data Mapping',
      description: 'Frontend marks data not reaching API correctly',
      likelihood: 'HIGH',
      impact: 'CRITICAL'
    },
    {
      issue: 'Cache Key Generation',
      description: 'Cache keys not unique per student assessment',
      likelihood: 'HIGH',
      impact: 'CRITICAL'
    }
  ];
  
  issues.forEach((issue, index) => {
    console.log(`\n   ${index + 1}. ${issue.issue} (${issue.likelihood} likelihood, ${issue.impact} impact)`);
    console.log(`      ${issue.description}`);
  });
}

function createFixPlan() {
  console.log('\n🛠️ Immediate Fix Plan');
  
  console.log('📋 Priority Fixes:');
  console.log('   1. 🔥 URGENT: Add unique session ID to cache keys');
  console.log('   2. 🔥 URGENT: Disable cache for assessment submissions');
  console.log('   3. 🔥 URGENT: Add marks data validation in API');
  console.log('   4. 📊 HIGH: Add debug logging for data flow');
  console.log('   5. 🧪 MEDIUM: Create real-time testing tool');
  
  console.log('\n🚀 Implementation Steps:');
  console.log('   Step 1: Modify cache key generation to include session data');
  console.log('   Step 2: Add cache bypass for assessment submissions');
  console.log('   Step 3: Add comprehensive logging for debugging');
  console.log('   Step 4: Test with multiple concurrent users');
  console.log('   Step 5: Deploy and verify fix');
}

function main() {
  console.log('🔍 Starting Cache and Session Investigation...\n');
  
  analyzeCacheSystem();
  analyzeSessionHandling();
  analyzeAPIDataFlow();
  identifyRootCause();
  createFixPlan();
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 INVESTIGATION COMPLETE');
  
  console.log('\n🚨 CRITICAL FINDING:');
  console.log('   The APS issue is likely caused by CACHE COLLISION');
  console.log('   Multiple students may be getting the same cached response');
  console.log('   regardless of their individual marks data.');
  
  console.log('\n🛠️ IMMEDIATE ACTION REQUIRED:');
  console.log('   1. Fix cache key generation to include user data');
  console.log('   2. Add session-specific cache invalidation');
  console.log('   3. Implement cache bypass for assessment submissions');
  
  return true;
}

main();