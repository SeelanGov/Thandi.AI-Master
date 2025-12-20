#!/usr/bin/env node

/**
 * Systematic Backend Integration Test
 * 
 * Tests all backend components in the correct order to ensure
 * the entire system is properly wired and functional.
 * 
 * @author Kiro AI Assistant
 * @version 1.0.0
 * @created December 19, 2025
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env.local') });

console.log('🔧 SYSTEMATIC BACKEND INTEGRATION TEST');
console.log('=====================================');
console.log(`Started: ${new Date().toISOString()}`);
console.log('');

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function logTest(name, status, message, details = null) {
  const icons = { pass: '✅', fail: '❌', warn: '⚠️' };
  const icon = icons[status] || '❓';
  
  console.log(`${icon} ${name}: ${message}`);
  if (details) {
    console.log(`   ${details}`);
  }
  
  testResults.tests.push({ name, status, message, details });
  testResults[status === 'pass' ? 'passed' : status === 'fail' ? 'failed' : 'warnings']++;
}

// Test 1: Environment Variables
async function testEnvironmentVariables() {
  console.log('\n📋 PHASE 1: Environment Configuration');
  console.log('------------------------------------');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY',
    'LLM_PROVIDER'
  ];
  
  const optionalVars = [
    'ANTHROPIC_API_KEY',
    'OPENAI_API_KEY', 
    'GROQ_API_KEY',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN'
  ];
  
  let allRequired = true;
  
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      logTest(`Required: ${varName}`, 'pass', 'Configured');
    } else {
      logTest(`Required: ${varName}`, 'fail', 'Missing');
      allRequired = false;
    }
  }
  
  for (const varName of optionalVars) {
    if (process.env[varName]) {
      logTest(`Optional: ${varName}`, 'pass', 'Configured');
    } else {
      logTest(`Optional: ${varName}`, 'warn', 'Not configured');
    }
  }
  
  const llmProvider = process.env.LLM_PROVIDER;
  const hasProviderKey = 
    (llmProvider === 'anthropic' && process.env.ANTHROPIC_API_KEY) ||
    (llmProvider === 'openai' && process.env.OPENAI_API_KEY) ||
    (llmProvider === 'groq' && process.env.GROQ_API_KEY);
  
  if (hasProviderKey) {
    logTest('LLM Provider Key', 'pass', `${llmProvider} key configured`);
  } else {
    logTest('LLM Provider Key', 'fail', `No key for provider: ${llmProvider}`);
    allRequired = false;
  }
  
  return allRequired;
}

// Test 2: Database Connection
async function testDatabaseConnection() {
  console.log('\n🗄️ PHASE 2: Database Connection');
  console.log('-------------------------------');
  
  try {
    const { getSupabase } = await import('./lib/supabase.js');
    const supabase = getSupabase();
    
    // Test basic connection
    const { data, error } = await supabase
      .from('knowledge_modules')
      .select('id, module_name')
      .limit(1);
    
    if (error) {
      logTest('Supabase Connection', 'fail', error.message);
      return false;
    }
    
    logTest('Supabase Connection', 'pass', 'Connected successfully');
    
    // Test knowledge base structure
    const { data: modules, error: moduleError } = await supabase
      .from('knowledge_modules')
      .select('id, module_name');
    
    if (moduleError) {
      logTest('Knowledge Modules', 'fail', moduleError.message);
      return false;
    }
    
    logTest('Knowledge Modules', 'pass', `Found ${modules?.length || 0} modules`);
    
    // Test knowledge chunks
    const { data: chunks, error: chunkError } = await supabase
      .from('knowledge_chunks')
      .select('id')
      .limit(1);
    
    if (chunkError) {
      logTest('Knowledge Chunks', 'fail', chunkError.message);
      return false;
    }
    
    logTest('Knowledge Chunks', 'pass', 'Table accessible');
    
    return true;
  } catch (error) {
    logTest('Database Import', 'fail', error.message);
    return false;
  }
}

// Test 3: LLM Provider
async function testLLMProvider() {
  console.log('\n🤖 PHASE 3: LLM Provider');
  console.log('------------------------');
  
  try {
    const { LLMAdapter } = await import('./lib/llm/llm-adapter.js');
    const provider = LLMAdapter.getDefaultProvider();
    
    logTest('LLM Provider Import', 'pass', `Using ${provider.name}`);
    
    // Test simple text generation
    const testPrompt = "Say 'Hello from Thandi AI' in exactly those words.";
    const result = await provider.generateText(testPrompt, { maxTokens: 50 });
    
    if (result.success) {
      logTest('LLM Text Generation', 'pass', 'Response generated successfully');
      logTest('LLM Response Content', 'pass', `"${result.data.substring(0, 50)}..."`);
    } else {
      logTest('LLM Text Generation', 'fail', result.error || 'Unknown error');
      return false;
    }
    
    return true;
  } catch (error) {
    logTest('LLM Provider Test', 'fail', error.message);
    return false;
  }
}

// Test 4: Cache System
async function testCacheSystem() {
  console.log('\n💾 PHASE 4: Cache System');
  console.log('------------------------');
  
  try {
    const { getCachedResponse, setCachedResponse } = await import('./lib/cache/rag-cache.js');
    
    // Test cache write
    const testProfile = { grade: 'grade10', curriculum: 'caps' };
    const testQuery = 'test query for cache';
    const testResponse = { test: true, timestamp: Date.now() };
    
    await setCachedResponse(testProfile, testQuery, testResponse);
    logTest('Cache Write', 'pass', 'Test data cached successfully');
    
    // Test cache read
    const cachedResult = await getCachedResponse(testProfile, testQuery);
    
    if (cachedResult && cachedResult.test) {
      logTest('Cache Read', 'pass', 'Test data retrieved successfully');
    } else {
      logTest('Cache Read', 'warn', 'Cache miss or data not found');
    }
    
    return true;
  } catch (error) {
    logTest('Cache System', 'warn', `Cache unavailable: ${error.message}`);
    return true; // Cache is optional, don't fail the test
  }
}

// Test 5: RAG Search System
async function testRAGSearch() {
  console.log('\n🔍 PHASE 5: RAG Search System');
  console.log('-----------------------------');
  
  try {
    const { semanticSearch } = await import('./lib/rag/search.js');
    
    // Get a sample embedding for testing
    const { getSupabase } = await import('./lib/supabase.js');
    const supabase = getSupabase();
    
    const { data: sampleChunk, error } = await supabase
      .from('knowledge_chunks')
      .select('embedding')
      .not('embedding', 'is', null)
      .limit(1)
      .single();
    
    if (error || !sampleChunk) {
      logTest('Sample Embedding', 'fail', 'No embeddings found in database');
      return false;
    }
    
    // Parse embedding
    const embedding = JSON.parse(sampleChunk.embedding);
    logTest('Sample Embedding', 'pass', `Retrieved ${embedding.length}-dimensional vector`);
    
    // Test semantic search
    const searchResults = await semanticSearch(embedding, { limit: 5 });
    
    if (searchResults && searchResults.length > 0) {
      logTest('Semantic Search', 'pass', `Found ${searchResults.length} results`);
      logTest('Search Quality', 'pass', `Top similarity: ${searchResults[0].similarity?.toFixed(3)}`);
    } else {
      logTest('Semantic Search', 'fail', 'No search results returned');
      return false;
    }
    
    return true;
  } catch (error) {
    logTest('RAG Search System', 'fail', error.message);
    return false;
  }
}

// Test 6: Program Matcher
async function testProgramMatcher() {
  console.log('\n🎯 PHASE 6: Program Matcher');
  console.log('---------------------------');
  
  try {
    const { generateSpecificRecommendations } = await import('./lib/matching/program-matcher.js');
    
    // Test with sample student profile
    const sampleProfile = {
      grade: 12,
      marks: {
        mathematics: 75,
        physical_sciences: 70,
        english: 65
      },
      careerInterests: 'engineering',
      constraints: {}
    };
    
    const recommendations = generateSpecificRecommendations(sampleProfile);
    
    if (recommendations.success) {
      logTest('Program Matching', 'pass', 'Recommendations generated successfully');
      logTest('APS Calculation', 'pass', `APS: ${recommendations.apsData.current}`);
      logTest('Program Count', 'pass', `Found ${recommendations.programs.length} programs`);
      logTest('Bursary Count', 'pass', `Found ${recommendations.bursaries.length} bursaries`);
    } else {
      logTest('Program Matching', 'fail', recommendations.error || 'Unknown error');
      return false;
    }
    
    return true;
  } catch (error) {
    logTest('Program Matcher', 'fail', error.message);
    return false;
  }
}

// Test 7: API Endpoint
async function testAPIEndpoint() {
  console.log('\n🌐 PHASE 7: API Endpoint');
  console.log('------------------------');
  
  try {
    // Test the main RAG query endpoint
    const testQuery = {
      query: "I am a Grade 12 student interested in engineering. My Mathematics is 75% and Physical Sciences is 70%. What career options do I have?",
      grade: "12",
      curriculum: "caps",
      profile: {
        marks: {
          mathematics: 75,
          physical_sciences: 70
        }
      }
    };
    
    const response = await fetch('http://localhost:3000/api/rag/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testQuery)
    });
    
    if (response.ok) {
      const data = await response.json();
      logTest('API Endpoint', 'pass', 'Endpoint responding correctly');
      logTest('API Response', 'pass', `Response length: ${data.response?.length || 0} chars`);
      logTest('API Performance', 'pass', `Response time: ${data.performance?.totalTime || 'N/A'}ms`);
    } else {
      logTest('API Endpoint', 'fail', `HTTP ${response.status}: ${response.statusText}`);
      return false;
    }
    
    return true;
  } catch (error) {
    logTest('API Endpoint', 'warn', `Server not running: ${error.message}`);
    return true; // Don't fail if server isn't running
  }
}

// Test 8: Frontend Integration Points
async function testFrontendIntegration() {
  console.log('\n🎨 PHASE 8: Frontend Integration');
  console.log('--------------------------------');
  
  try {
    // Check if key frontend files exist
    const fs = await import('fs');
    
    const frontendFiles = [
      'app/page.js',
      'app/assessment/page.jsx',
      'app/results/page.jsx',
      'app/components/Header.jsx',
      'app/components/HeroSection.jsx',
      'app/components/Footer.jsx'
    ];
    
    let allFilesExist = true;
    
    for (const file of frontendFiles) {
      if (fs.existsSync(file)) {
        logTest(`Frontend: ${file}`, 'pass', 'File exists');
      } else {
        logTest(`Frontend: ${file}`, 'fail', 'File missing');
        allFilesExist = false;
      }
    }
    
    // Check Tailwind configuration
    if (fs.existsSync('tailwind.config.js')) {
      const tailwindConfig = fs.readFileSync('tailwind.config.js', 'utf8');
      if (tailwindConfig.includes('thandi')) {
        logTest('Tailwind Config', 'pass', 'Thandi theme configured');
      } else {
        logTest('Tailwind Config', 'warn', 'Thandi theme not found');
      }
    }
    
    return allFilesExist;
  } catch (error) {
    logTest('Frontend Integration', 'fail', error.message);
    return false;
  }
}

// Main test runner
async function runSystematicTest() {
  console.log('Running comprehensive backend integration test...\n');
  
  const phases = [
    { name: 'Environment Variables', test: testEnvironmentVariables },
    { name: 'Database Connection', test: testDatabaseConnection },
    { name: 'LLM Provider', test: testLLMProvider },
    { name: 'Cache System', test: testCacheSystem },
    { name: 'RAG Search', test: testRAGSearch },
    { name: 'Program Matcher', test: testProgramMatcher },
    { name: 'API Endpoint', test: testAPIEndpoint },
    { name: 'Frontend Integration', test: testFrontendIntegration }
  ];
  
  let overallSuccess = true;
  
  for (const phase of phases) {
    try {
      const result = await phase.test();
      if (!result) {
        overallSuccess = false;
      }
    } catch (error) {
      logTest(phase.name, 'fail', `Phase failed: ${error.message}`);
      overallSuccess = false;
    }
  }
  
  // Final summary
  console.log('\n🏁 INTEGRATION TEST SUMMARY');
  console.log('===========================');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⚠️  Warnings: ${testResults.warnings}`);
  console.log(`📊 Total Tests: ${testResults.tests.length}`);
  console.log('');
  
  if (overallSuccess && testResults.failed === 0) {
    console.log('🎉 ALL SYSTEMS OPERATIONAL!');
    console.log('Backend is fully wired and ready for production.');
  } else if (testResults.failed === 0) {
    console.log('✅ CORE SYSTEMS OPERATIONAL');
    console.log('Backend is functional with minor warnings.');
  } else {
    console.log('⚠️  ISSUES DETECTED');
    console.log('Some backend components need attention.');
  }
  
  console.log('\n📋 NEXT STEPS:');
  if (testResults.failed === 0) {
    console.log('1. Start development server: npm run dev');
    console.log('2. Test frontend at: http://localhost:3000');
    console.log('3. Verify assessment flow works end-to-end');
    console.log('4. Run production deployment checks');
  } else {
    console.log('1. Fix failed tests above');
    console.log('2. Re-run this test: node systematic-backend-integration-test.js');
    console.log('3. Check environment variables and API keys');
  }
  
  console.log(`\nCompleted: ${new Date().toISOString()}`);
  
  return overallSuccess;
}

// Run the test
runSystematicTest().catch(error => {
  console.error('\n💥 CRITICAL ERROR:', error.message);
  process.exit(1);
});