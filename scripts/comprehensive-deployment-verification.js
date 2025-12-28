#!/usr/bin/env node

/**
 * Comprehensive Deployment Verification
 * Complete check of Vercel deployment alignment with local work
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const DEPLOYMENT_URL = 'https://thandiai-1xrwjs0dk-thandiai-projects.vercel.app';

console.log('🔍 COMPREHENSIVE DEPLOYMENT VERIFICATION\n');
console.log(`🌐 Testing: ${DEPLOYMENT_URL}\n`);

// Initialize Supabase client for local comparison
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyFrontendPages() {
  console.log('📱 Frontend Pages Verification\n');
  
  const pages = [
    { path: '/', name: 'Landing Page', expectedContent: ['THANDI', 'From School to Success'] },
    { path: '/assessment', name: 'Assessment Page', expectedContent: ['grade', 'career guidance'] },
    { path: '/results', name: 'Results Page', expectedContent: ['results', 'career'] },
    { path: '/admin', name: 'Admin Portal', expectedContent: ['admin', 'school'] },
    { path: '/school/claim', name: 'School Claim', expectedContent: ['school', 'claim'] }
  ];
  
  const results = [];
  
  for (const page of pages) {
    try {
      console.log(`🔍 Testing: ${page.name}`);
      const response = await fetch(`${DEPLOYMENT_URL}${page.path}`);
      
      const status = response.status === 200 ? '✅' : '❌';
      console.log(`   Status: ${status} ${response.status}`);
      
      if (response.ok) {
        const html = await response.text();
        
        // Check for expected content
        const contentChecks = page.expectedContent.map(content => {
          const found = html.toLowerCase().includes(content.toLowerCase());
          console.log(`   Content "${content}": ${found ? '✅' : '❌'}`);
          return found;
        });
        
        // Check for THANDI branding
        const hasBranding = html.includes('THANDI') || html.includes('thandi');
        console.log(`   THANDI Branding: ${hasBranding ? '✅' : '❌'}`);
        
        results.push({
          ...page,
          status: response.status,
          success: response.ok,
          branding: hasBranding,
          contentScore: contentChecks.filter(Boolean).length / contentChecks.length
        });
      } else {
        results.push({
          ...page,
          status: response.status,
          success: false,
          branding: false,
          contentScore: 0
        });
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
      results.push({
        ...page,
        status: 0,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

async function verifyAPIEndpoints() {
  console.log('🔌 API Endpoints Verification\n');
  
  const endpoints = [
    {
      path: '/api/schools/search?q=high',
      name: 'School Search API',
      method: 'GET',
      expectedKeys: ['schools', 'total']
    },
    {
      path: '/api/rag/query',
      name: 'RAG Query API (GET)',
      method: 'GET',
      expectedKeys: ['message', 'status']
    },
    {
      path: '/api/rag/query',
      name: 'RAG Query API (POST)',
      method: 'POST',
      body: {
        query: 'What careers are available for mathematics students?',
        grade: '12',
        subjects: ['Mathematics', 'Physical Sciences']
      },
      expectedKeys: ['success', 'response']
    },
    {
      path: '/api/student/register',
      name: 'Student Registration API',
      method: 'POST',
      body: {
        firstName: 'Test',
        lastName: 'Student',
        email: 'test@example.com',
        grade: '12',
        consent: true
      },
      expectedKeys: ['success']
    }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testing: ${endpoint.name}`);
      
      const options = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        }
      };
      
      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
      }
      
      const response = await fetch(`${DEPLOYMENT_URL}${endpoint.path}`, options);
      
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        try {
          const data = await response.json();
          console.log(`   ✅ Valid JSON response`);
          
          if (endpoint.expectedKeys) {
            const hasKeys = endpoint.expectedKeys.some(key => key in data);
            console.log(`   Expected keys: ${hasKeys ? '✅' : '❌'}`);
          }
          
          console.log(`   Response keys: ${Object.keys(data).join(', ')}`);
          
          results.push({
            ...endpoint,
            status: response.status,
            success: true,
            responseKeys: Object.keys(data)
          });
          
        } catch (jsonError) {
          console.log(`   ⚠️  Non-JSON response`);
          results.push({
            ...endpoint,
            status: response.status,
            success: true,
            isJson: false
          });
        }
      } else {
        const errorText = await response.text();
        console.log(`   ❌ Error: ${errorText.substring(0, 100)}...`);
        
        results.push({
          ...endpoint,
          status: response.status,
          success: false,
          error: errorText.substring(0, 200)
        });
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ Network Error: ${error.message}\n`);
      results.push({
        ...endpoint,
        status: 0,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

async function verifyDatabaseAlignment() {
  console.log('🗄️  Database Alignment Verification\n');
  
  try {
    // Check local school count
    console.log('📊 Checking local database...');
    const { count: localSchoolCount, error: localError } = await supabase
      .from('school_master')
      .select('*', { count: 'exact', head: true });
    
    if (localError) {
      console.log(`   ❌ Local DB Error: ${localError.message}`);
      return { aligned: false, error: localError.message };
    }
    
    console.log(`   Local schools: ${localSchoolCount}`);
    
    // Test production school search
    console.log('🌐 Testing production school search...');
    const searchResponse = await fetch(`${DEPLOYMENT_URL}/api/schools/search?q=school`);
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      const productionCount = searchData.total || 0;
      console.log(`   Production search results: ${productionCount}`);
      
      // Check alignment
      const aligned = Math.abs(localSchoolCount - productionCount) < 100; // Allow small variance
      console.log(`   Database alignment: ${aligned ? '✅' : '⚠️'}`);
      
      return {
        aligned,
        localCount: localSchoolCount,
        productionCount,
        variance: Math.abs(localSchoolCount - productionCount)
      };
    } else {
      console.log(`   ❌ Production search failed: ${searchResponse.status}`);
      return { aligned: false, error: 'Production search failed' };
    }
    
  } catch (error) {
    console.log(`   ❌ Database check failed: ${error.message}`);
    return { aligned: false, error: error.message };
  }
}

async function verifyEnvironmentAlignment() {
  console.log('🔧 Environment Configuration Verification\n');
  
  const requiredEnvs = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET'
  ];
  
  console.log('📋 Local environment variables:');
  const localEnvStatus = {};
  
  requiredEnvs.forEach(env => {
    const present = !!process.env[env];
    console.log(`   ${env}: ${present ? '✅' : '❌'}`);
    localEnvStatus[env] = present;
  });
  
  // Test if production has environment configured by testing API
  console.log('\n🌐 Production environment test:');
  try {
    const testResponse = await fetch(`${DEPLOYMENT_URL}/api/rag/query`);
    const envWorking = testResponse.ok;
    console.log(`   API connectivity: ${envWorking ? '✅' : '❌'}`);
    
    return {
      local: localEnvStatus,
      production: envWorking,
      aligned: Object.values(localEnvStatus).every(Boolean) && envWorking
    };
    
  } catch (error) {
    console.log(`   ❌ Production test failed: ${error.message}`);
    return {
      local: localEnvStatus,
      production: false,
      aligned: false
    };
  }
}

async function generateComprehensiveReport(frontendResults, apiResults, dbAlignment, envAlignment) {
  console.log('='.repeat(70));
  console.log('📋 COMPREHENSIVE DEPLOYMENT VERIFICATION REPORT');
  console.log('='.repeat(70));
  
  console.log(`\n🌐 Deployment URL: ${DEPLOYMENT_URL}`);
  console.log(`📅 Verification Date: ${new Date().toISOString()}`);
  
  // Frontend Summary
  console.log('\n📱 FRONTEND PAGES SUMMARY:');
  const frontendSuccess = frontendResults.filter(r => r.success).length;
  const frontendTotal = frontendResults.length;
  console.log(`   Success Rate: ${frontendSuccess}/${frontendTotal} (${((frontendSuccess/frontendTotal)*100).toFixed(1)}%)`);
  
  frontendResults.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const branding = result.branding ? '🎨' : '⚠️';
    console.log(`   ${status} ${branding} ${result.name}`);
  });
  
  // API Summary
  console.log('\n🔌 API ENDPOINTS SUMMARY:');
  const apiSuccess = apiResults.filter(r => r.success).length;
  const apiTotal = apiResults.length;
  console.log(`   Success Rate: ${apiSuccess}/${apiTotal} (${((apiSuccess/apiTotal)*100).toFixed(1)}%)`);
  
  apiResults.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`   ${status} ${result.name} (${result.method})`);
  });
  
  // Database Alignment
  console.log('\n🗄️  DATABASE ALIGNMENT:');
  if (dbAlignment.aligned) {
    console.log(`   ✅ Databases aligned (variance: ${dbAlignment.variance || 0})`);
  } else {
    console.log(`   ⚠️  Database alignment issue: ${dbAlignment.error || 'Unknown'}`);
  }
  
  // Environment Alignment
  console.log('\n🔧 ENVIRONMENT ALIGNMENT:');
  console.log(`   Local config: ${envAlignment.aligned ? '✅' : '❌'}`);
  console.log(`   Production config: ${envAlignment.production ? '✅' : '❌'}`);
  
  // Overall Score
  const frontendScore = (frontendSuccess / frontendTotal) * 25;
  const apiScore = (apiSuccess / apiTotal) * 25;
  const dbScore = dbAlignment.aligned ? 25 : 0;
  const envScore = envAlignment.aligned ? 25 : 0;
  const totalScore = frontendScore + apiScore + dbScore + envScore;
  
  console.log('\n📊 OVERALL DEPLOYMENT SCORE:');
  console.log(`   Frontend: ${frontendScore.toFixed(1)}/25`);
  console.log(`   APIs: ${apiScore.toFixed(1)}/25`);
  console.log(`   Database: ${dbScore}/25`);
  console.log(`   Environment: ${envScore}/25`);
  console.log(`   TOTAL: ${totalScore.toFixed(1)}/100`);
  
  // Status determination
  let status, recommendation;
  if (totalScore >= 90) {
    status = '🎉 EXCELLENT - Production Ready';
    recommendation = 'System is fully operational and ready for users';
  } else if (totalScore >= 75) {
    status = '✅ GOOD - Minor Issues';
    recommendation = 'System is functional with minor items to address';
  } else if (totalScore >= 50) {
    status = '⚠️  FAIR - Needs Attention';
    recommendation = 'Several issues need to be resolved before full production use';
  } else {
    status = '🚨 POOR - Major Issues';
    recommendation = 'Significant problems need immediate attention';
  }
  
  console.log(`\n🎯 DEPLOYMENT STATUS: ${status}`);
  console.log(`💡 RECOMMENDATION: ${recommendation}`);
  
  console.log('\n' + '='.repeat(70));
  
  return {
    score: totalScore,
    status,
    recommendation,
    details: {
      frontend: { success: frontendSuccess, total: frontendTotal },
      api: { success: apiSuccess, total: apiTotal },
      database: dbAlignment,
      environment: envAlignment
    }
  };
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting comprehensive deployment verification...\n');
    
    const frontendResults = await verifyFrontendPages();
    const apiResults = await verifyAPIEndpoints();
    const dbAlignment = await verifyDatabaseAlignment();
    const envAlignment = await verifyEnvironmentAlignment();
    
    const report = await generateComprehensiveReport(
      frontendResults,
      apiResults,
      dbAlignment,
      envAlignment
    );
    
    // Exit with appropriate code
    process.exit(report.score >= 75 ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Comprehensive verification failed:', error.message);
    process.exit(1);
  }
}

main();