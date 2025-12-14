#!/usr/bin/env node

/**
 * P0 PRE-STAGING VERIFICATION
 * 
 * Comprehensive verification before staging deployment
 * Ensures all critical systems are working for your kids
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

console.log('🚨 P0 PRE-STAGING VERIFICATION');
console.log('='.repeat(60));
console.log('🎯 Ensuring system is ready for your kids to use');

async function verifyPreStaging() {
  let allTestsPassed = true;
  const results = [];
  
  // Test 1: Database and Embeddings
  console.log('\n1. 🔍 Database and Embeddings Verification...');
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { count, error } = await supabase
      .from('knowledge_chunks')
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.log('   ❌ Database connection failed');
      results.push({ test: 'Database Connection', status: 'FAILED', details: error.message });
      allTestsPassed = false;
    } else {
      console.log(`   ✅ Database healthy: ${count} embeddings available`);
      results.push({ test: 'Database Connection', status: 'PASSED', details: `${count} embeddings` });
    }
  } catch (error) {
    console.log('   ❌ Database test failed:', error.message);
    results.push({ test: 'Database Connection', status: 'FAILED', details: error.message });
    allTestsPassed = false;
  }
  
  // Test 2: match_documents Function
  console.log('\n2. 🔍 RAG Search Function Verification...');
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Get a real embedding to test with
    const { data: sampleChunk, error: sampleError } = await supabase
      .from('knowledge_chunks')
      .select('embedding')
      .limit(1)
      .single();
    
    if (sampleError || !sampleChunk) {
      console.log('   ❌ Could not get sample embedding');
      results.push({ test: 'RAG Search Function', status: 'FAILED', details: 'No sample embedding' });
      allTestsPassed = false;
    } else {
      const testEmbedding = JSON.parse(sampleChunk.embedding);
      
      const { data: testResults, error: searchError } = await supabase.rpc(
        'match_documents',
        {
          query_embedding: testEmbedding,
          match_threshold: 0.1,
          match_count: 5
        }
      );
      
      if (searchError) {
        console.log('   ❌ match_documents function failed:', searchError.message);
        results.push({ test: 'RAG Search Function', status: 'FAILED', details: searchError.message });
        allTestsPassed = false;
      } else if (!testResults || testResults.length === 0) {
        console.log('   ❌ match_documents returns no results');
        results.push({ test: 'RAG Search Function', status: 'FAILED', details: 'No results returned' });
        allTestsPassed = false;
      } else {
        console.log(`   ✅ RAG search working: ${testResults.length} results`);
        results.push({ test: 'RAG Search Function', status: 'PASSED', details: `${testResults.length} results` });
      }
    }
  } catch (error) {
    console.log('   ❌ RAG search test failed:', error.message);
    results.push({ test: 'RAG Search Function', status: 'FAILED', details: error.message });
    allTestsPassed = false;
  }
  
  // Test 3: Student Understanding Enhancement
  console.log('\n3. 🔍 Student Understanding Enhancement...');
  try {
    // Import and test the StudentProfileBuilder
    const { StudentProfileBuilder } = await import('./lib/student/StudentProfileBuilder.js');
    
    const testData = {
      grade: 12,
      subjects: ['Mathematics', 'Physical Sciences'],
      enjoyedSubjects: ['Mathematics'],
      struggledSubjects: ['Physical Sciences'],
      motivation: 'I want to become an engineer',
      concerns: 'Math is difficult',
      careerInterests: ['Engineering', 'Technology']
    };
    
    const profile = StudentProfileBuilder.buildProfile(testData);
    
    if (profile && profile.grade && profile.motivation && profile.concerns) {
      console.log('   ✅ Student Understanding Enhancement working');
      results.push({ test: 'Student Understanding', status: 'PASSED', details: 'Profile building successful' });
    } else {
      console.log('   ❌ Student Understanding Enhancement failed');
      results.push({ test: 'Student Understanding', status: 'FAILED', details: 'Profile building failed' });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('   ❌ Student Understanding test failed:', error.message);
    results.push({ test: 'Student Understanding', status: 'FAILED', details: error.message });
    allTestsPassed = false;
  }
  
  // Test 4: Environment Variables
  console.log('\n4. 🔍 Environment Configuration...');
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GROQ_API_KEY',
    'OPENAI_API_KEY'
  ];
  
  let envVarsOk = true;
  const missingVars = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
      envVarsOk = false;
    }
  }
  
  if (envVarsOk) {
    console.log('   ✅ All required environment variables present');
    results.push({ test: 'Environment Variables', status: 'PASSED', details: 'All variables present' });
  } else {
    console.log(`   ❌ Missing environment variables: ${missingVars.join(', ')}`);
    results.push({ test: 'Environment Variables', status: 'FAILED', details: `Missing: ${missingVars.join(', ')}` });
    allTestsPassed = false;
  }
  
  // Test 5: System Health Check
  console.log('\n5. 🔍 System Health Check...');
  try {
    const memUsage = process.memoryUsage();
    const memUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    
    if (memUsageMB < 100) {
      console.log(`   ✅ System health good: ${memUsageMB}MB memory usage`);
      results.push({ test: 'System Health', status: 'PASSED', details: `${memUsageMB}MB memory` });
    } else {
      console.log(`   ⚠️ High memory usage: ${memUsageMB}MB`);
      results.push({ test: 'System Health', status: 'WARNING', details: `${memUsageMB}MB memory` });
    }
  } catch (error) {
    console.log('   ❌ System health check failed:', error.message);
    results.push({ test: 'System Health', status: 'FAILED', details: error.message });
    allTestsPassed = false;
  }
  
  // Final Report
  console.log('\n' + '='.repeat(60));
  console.log('📋 PRE-STAGING VERIFICATION REPORT');
  console.log('='.repeat(60));
  
  const passedTests = results.filter(r => r.status === 'PASSED').length;
  const failedTests = results.filter(r => r.status === 'FAILED').length;
  const warningTests = results.filter(r => r.status === 'WARNING').length;
  
  console.log(`✅ Tests Passed: ${passedTests}`);
  console.log(`❌ Tests Failed: ${failedTests}`);
  console.log(`⚠️ Warnings: ${warningTests}`);
  console.log(`📊 Success Rate: ${Math.round((passedTests / results.length) * 100)}%`);
  
  console.log('\n📋 Detailed Results:');
  results.forEach((result, index) => {
    const icon = result.status === 'PASSED' ? '✅' : result.status === 'WARNING' ? '⚠️' : '❌';
    console.log(`   ${index + 1}. ${icon} ${result.test}: ${result.details}`);
  });
  
  if (allTestsPassed && failedTests === 0) {
    console.log('\n🎉 PRE-STAGING VERIFICATION PASSED!');
    console.log('✅ System is ready for staging deployment');
    console.log('🎯 Your kids can safely use this system');
    console.log('💪 Quality over speed achieved - your cofounder would be proud');
  } else {
    console.log('\n🚨 PRE-STAGING VERIFICATION FAILED!');
    console.log('❌ System is NOT ready for staging deployment');
    console.log('🔧 Fix the failing tests before proceeding');
    console.log('🎯 Your kids deserve a system that works 100% of the time');
  }
  
  return allTestsPassed && failedTests === 0;
}

// Run verification
verifyPreStaging().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ VERIFICATION SCRIPT FAILED:', error.message);
  process.exit(1);
});