#!/usr/bin/env node

/**
 * Diagnose Production vs Local State
 * Check what's currently deployed vs what we have locally
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');

const PRODUCTION_URL = 'https://thandiai.vercel.app';
const LOCAL_URL = 'http://localhost:3000';

async function testEndpoint(url, label) {
  console.log(`\n🔍 Testing ${label}: ${url}`);
  
  const testQuery = {
    query: 'I am a Grade 10 student interested in engineering. What should I study?',
    grade: 'grade10',
    curriculum: 'caps',
    profile: {
      grade: 'grade10',
      marks: {
        'Mathematics': '75',
        'Physical Sciences': '72'
      },
      sessionId: `test-${Date.now()}`
    }
  };

  try {
    const startTime = Date.now();
    const response = await fetch(`${url}/api/rag/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testQuery)
    });

    const responseTime = Date.now() - startTime;
    console.log(`Status: ${response.status}`);
    console.log(`Response Time: ${responseTime}ms`);

    if (response.ok) {
      const data = await response.json();
      
      const analysis = {
        provider: data.metadata?.provider || 'unknown',
        responseLength: data.response?.length || 0,
        grade: data.grade,
        hasAPS: data.response?.toLowerCase().includes('aps') || false,
        hasUniversities: data.response?.toLowerCase().includes('university') || false,
        hasBursaries: data.response?.toLowerCase().includes('bursary') || data.response?.toLowerCase().includes('nsfas') || false,
        hasAcademicTimeline: data.response?.toLowerCase().includes('academic timeline') || false,
        hasSpecificPrograms: data.response?.toLowerCase().includes('mechanical engineering') || data.response?.toLowerCase().includes('uct') || false,
        isMinimal: data.response?.includes('Technology & Engineering') && data.response?.includes('Software Development') && data.response?.length < 1000
      };

      console.log(`Provider: ${analysis.provider}`);
      console.log(`Response Length: ${analysis.responseLength} characters`);
      console.log(`Grade Detected: ${analysis.grade}`);
      
      console.log('\n📊 Feature Analysis:');
      console.log(`  APS Calculations: ${analysis.hasAPS ? '✅' : '❌'}`);
      console.log(`  University Data: ${analysis.hasUniversities ? '✅' : '❌'}`);
      console.log(`  Bursary Information: ${analysis.hasBursaries ? '✅' : '❌'}`);
      console.log(`  Academic Timeline: ${analysis.hasAcademicTimeline ? '✅' : '❌'}`);
      console.log(`  Specific Programs: ${analysis.hasSpecificPrograms ? '✅' : '❌'}`);
      console.log(`  Is Minimal Version: ${analysis.isMinimal ? '❌ YES' : '✅ NO'}`);

      // Show response preview
      console.log('\n📄 Response Preview (first 300 chars):');
      console.log(data.response?.substring(0, 300) + '...' || 'No response');

      return {
        success: true,
        ...analysis,
        responseTime,
        fullResponse: data.response
      };

    } else {
      const errorText = await response.text();
      console.log(`❌ Error: ${errorText}`);
      return { success: false, error: errorText, status: response.status };
    }

  } catch (error) {
    console.log(`❌ Connection Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function checkLocalFiles() {
  console.log('\n📁 Checking Local Files:');
  
  // Check if comprehensive route exists
  const routeExists = fs.existsSync('app/api/rag/query/route.js');
  console.log(`RAG Route File: ${routeExists ? '✅ EXISTS' : '❌ MISSING'}`);
  
  if (routeExists) {
    const routeContent = fs.readFileSync('app/api/rag/query/route.js', 'utf8');
    const isComprehensive = routeContent.includes('getCachedResponse') && 
                           routeContent.includes('getAcademicContext') && 
                           routeContent.includes('generateSpecificRecommendations');
    const isMinimal = routeContent.includes('Minimal RAG endpoint') || 
                     routeContent.length < 2000;
    
    console.log(`Route Type: ${isComprehensive ? '✅ COMPREHENSIVE' : isMinimal ? '❌ MINIMAL' : '⚠️ UNKNOWN'}`);
    console.log(`Route Size: ${routeContent.length} characters`);
  }

  // Check supporting files
  const supportingFiles = [
    'lib/cache/rag-cache.js',
    'lib/academic/emergency-calendar.js',
    'lib/matching/program-matcher.js'
  ];

  console.log('\n📚 Supporting Files:');
  supportingFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`  ${file}: ${exists ? '✅' : '❌'}`);
  });
}

async function checkGitStatus() {
  console.log('\n🔄 Git Status Check:');
  
  try {
    const { execSync } = require('child_process');
    
    // Check if there are uncommitted changes
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      console.log('⚠️ Uncommitted changes detected:');
      console.log(status);
    } else {
      console.log('✅ Working directory clean');
    }

    // Check last commit
    const lastCommit = execSync('git log -1 --oneline', { encoding: 'utf8' });
    console.log(`Last commit: ${lastCommit.trim()}`);

    // Check if route.js is in the last commit
    const routeInCommit = execSync('git show --name-only HEAD | grep "app/api/rag/query/route.js"', { encoding: 'utf8' }).trim();
    console.log(`Route in last commit: ${routeInCommit ? '✅ YES' : '❌ NO'}`);

  } catch (error) {
    console.log(`Git check error: ${error.message}`);
  }
}

async function runDiagnosis() {
  console.log('🔍 PRODUCTION vs LOCAL DIAGNOSIS');
  console.log('=' .repeat(60));

  // Test local first
  const localResult = await testEndpoint(LOCAL_URL, 'LOCAL');
  
  // Test production
  const prodResult = await testEndpoint(PRODUCTION_URL, 'PRODUCTION');

  // Check local files
  checkLocalFiles();

  // Check git status
  await checkGitStatus();

  // Compare results
  console.log('\n' + '=' .repeat(60));
  console.log('📊 COMPARISON ANALYSIS');
  console.log('=' .repeat(60));

  if (localResult.success && prodResult.success) {
    console.log('\n🔄 Version Comparison:');
    console.log(`Local Provider: ${localResult.provider}`);
    console.log(`Production Provider: ${prodResult.provider}`);
    
    console.log(`\nLocal Response Length: ${localResult.responseLength}`);
    console.log(`Production Response Length: ${prodResult.responseLength}`);
    
    console.log(`\nLocal Is Minimal: ${localResult.isMinimal ? 'YES' : 'NO'}`);
    console.log(`Production Is Minimal: ${prodResult.isMinimal ? 'YES' : 'NO'}`);

    // Feature comparison
    const features = ['hasAPS', 'hasUniversities', 'hasBursaries', 'hasAcademicTimeline', 'hasSpecificPrograms'];
    console.log('\n📊 Feature Comparison:');
    features.forEach(feature => {
      const local = localResult[feature] ? '✅' : '❌';
      const prod = prodResult[feature] ? '✅' : '❌';
      const match = localResult[feature] === prodResult[feature] ? '✅' : '❌';
      console.log(`  ${feature}: Local ${local} | Production ${prod} | Match ${match}`);
    });

    // Determine deployment status
    if (localResult.isMinimal && prodResult.isMinimal) {
      console.log('\n❌ CRITICAL: Both local and production are using minimal version');
      console.log('   Action needed: Restore comprehensive version and deploy');
    } else if (!localResult.isMinimal && prodResult.isMinimal) {
      console.log('\n⚠️ DEPLOYMENT NEEDED: Local has comprehensive version, production has minimal');
      console.log('   Action needed: Deploy local changes to production');
    } else if (localResult.isMinimal && !prodResult.isMinimal) {
      console.log('\n⚠️ LOCAL ISSUE: Production has comprehensive version, local has minimal');
      console.log('   Action needed: Fix local version');
    } else {
      console.log('\n✅ VERSIONS MATCH: Both local and production have comprehensive version');
    }

  } else {
    console.log('\n❌ CONNECTION ISSUES:');
    if (!localResult.success) console.log(`  Local: ${localResult.error}`);
    if (!prodResult.success) console.log(`  Production: ${prodResult.error}`);
  }

  return { localResult, prodResult };
}

runDiagnosis().catch(error => {
  console.error('Diagnosis failed:', error);
  process.exit(1);
});