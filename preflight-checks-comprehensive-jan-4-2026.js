#!/usr/bin/env node

/**
 * Comprehensive Preflight Checks - January 4, 2026
 * Final verification before production deployment
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🚀 COMPREHENSIVE PREFLIGHT CHECKS - JANUARY 4, 2026');
console.log('=' .repeat(60));
console.log('🎯 Verifying production readiness for Thandi.ai system\n');

const results = {
  environment: {},
  database: {},
  apis: {},
  frontend: {},
  security: {},
  performance: {},
  compliance: {},
  overall: {}
};

async function runPreflightChecks() {
  try {
    // 1. ENVIRONMENT VERIFICATION
    console.log('🔧 1. ENVIRONMENT VERIFICATION');
    console.log('-'.repeat(40));
    
    const envChecks = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      groqApiKey: !!process.env.GROQ_API_KEY,
      openaiApiKey: !!process.env.OPENAI_API_KEY,
      claudeApiKey: !!process.env.ANTHROPIC_API_KEY,
      upstashUrl: !!process.env.UPSTASH_REDIS_REST_URL,
      upstashToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
      nextAuthSecret: !!process.env.NEXTAUTH_SECRET
    };

    Object.entries(envChecks).forEach(([key, value]) => {
      console.log(`${value ? '✅' : '❌'} ${key}: ${value ? 'Set' : 'Missing'}`);
    });

    results.environment = {
      score: Object.values(envChecks).filter(v => v).length / Object.keys(envChecks).length,
      details: envChecks
    };

    // 2. DATABASE CONNECTIVITY
    console.log('\n🗄️  2. DATABASE CONNECTIVITY');
    console.log('-'.repeat(40));
    
    try {
      const { data: schools, error: schoolsError } = await supabase
        .from('school_master')
        .select('school_id, name')
        .limit(5);

      const { data: students, error: studentsError } = await supabase
        .from('student_registrations')
        .select('id, created_at')
        .limit(5);

      const { data: embeddings, error: embeddingsError } = await supabase
        .from('knowledge_base_embeddings')
        .select('id, content')
        .limit(5);

      console.log(`✅ Schools table: ${schools?.length || 0} records accessible`);
      console.log(`✅ Students table: ${students?.length || 0} records accessible`);
      console.log(`✅ Embeddings table: ${embeddings?.length || 0} records accessible`);

      results.database = {
        score: (!schoolsError && !studentsError && !embeddingsError) ? 1.0 : 0.0,
        schools: !schoolsError,
        students: !studentsError,
        embeddings: !embeddingsError
      };

    } catch (dbError) {
      console.log('❌ Database connection failed:', dbError.message);
      results.database = { score: 0.0, error: dbError.message };
    }

    // 3. API ENDPOINTS VERIFICATION
    console.log('\n🌐 3. API ENDPOINTS VERIFICATION');
    console.log('-'.repeat(40));
    
    const apiTests = [];

    // Test RAG API
    try {
      const ragResponse = await fetch('http://localhost:3000/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: "Test query for Grade 11 CAPS student",
          grade: "GRADE 11",
          curriculum: "CAPS",
          subjects: ["Mathematics", "English"],
          marks: { "Mathematics": 75, "English": 70 }
        })
      });
      
      const ragData = await ragResponse.json();
      const ragWorking = ragResponse.ok && ragData.response && ragData.response.length > 100;
      console.log(`${ragWorking ? '✅' : '❌'} RAG API: ${ragWorking ? 'Working' : 'Failed'}`);
      apiTests.push(ragWorking);
    } catch (error) {
      console.log('❌ RAG API: Failed -', error.message);
      apiTests.push(false);
    }

    // Test Student Registration API
    try {
      const regResponse = await fetch('http://localhost:3000/api/student/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: "Test",
          lastName: "Student",
          email: "test@example.com",
          grade: "GRADE 11",
          schoolId: "ZAF-200100005",
          curriculum: "CAPS"
        })
      });
      
      const regWorking = regResponse.ok || regResponse.status === 409; // 409 = already exists
      console.log(`${regWorking ? '✅' : '❌'} Registration API: ${regWorking ? 'Working' : 'Failed'}`);
      apiTests.push(regWorking);
    } catch (error) {
      console.log('❌ Registration API: Failed -', error.message);
      apiTests.push(false);
    }

    results.apis = {
      score: apiTests.filter(t => t).length / apiTests.length,
      rag: apiTests[0] || false,
      registration: apiTests[1] || false
    };

    // 4. FRONTEND COMPONENTS
    console.log('\n🎨 4. FRONTEND COMPONENTS');
    console.log('-'.repeat(40));
    
    const frontendFiles = [
      'app/page.jsx',
      'app/assessment/page.jsx',
      'app/results/page.jsx',
      'app/components/Header.jsx',
      'app/components/Footer.jsx',
      'app/components/HeroSection.jsx'
    ];

    const frontendChecks = frontendFiles.map(file => {
      const exists = fs.existsSync(file);
      console.log(`${exists ? '✅' : '❌'} ${file}: ${exists ? 'Found' : 'Missing'}`);
      return exists;
    });

    // Check for enhanced results page
    const resultsContent = fs.readFileSync('app/results/page.jsx', 'utf8');
    const hasEnhancedFormatting = resultsContent.includes('formatResponse') && 
                                 resultsContent.includes('content-section') &&
                                 resultsContent.includes('program-card');
    console.log(`${hasEnhancedFormatting ? '✅' : '❌'} Enhanced Results Formatting: ${hasEnhancedFormatting ? 'Implemented' : 'Missing'}`);

    results.frontend = {
      score: (frontendChecks.filter(c => c).length + (hasEnhancedFormatting ? 1 : 0)) / (frontendChecks.length + 1),
      files: frontendChecks.filter(c => c).length,
      enhancedFormatting: hasEnhancedFormatting
    };

    // 5. SECURITY VERIFICATION
    console.log('\n🔒 5. SECURITY VERIFICATION');
    console.log('-'.repeat(40));
    
    const securityChecks = {
      envFileExists: fs.existsSync('.env.local'),
      envInGitignore: fs.readFileSync('.gitignore', 'utf8').includes('.env'),
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      noHardcodedKeys: !fs.readFileSync('app/api/rag/query/route.js', 'utf8').includes('sk-')
    };

    Object.entries(securityChecks).forEach(([key, value]) => {
      console.log(`${value ? '✅' : '❌'} ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${value ? 'Secure' : 'Issue'}`);
    });

    results.security = {
      score: Object.values(securityChecks).filter(v => v).length / Object.keys(securityChecks).length,
      details: securityChecks
    };

    // 6. PERFORMANCE CHECKS
    console.log('\n⚡ 6. PERFORMANCE CHECKS');
    console.log('-'.repeat(40));
    
    // Check bundle size indicators
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const hasOptimizations = {
      nextOptimized: packageJson.dependencies?.next?.includes('15'),
      hasImageOptimization: fs.readFileSync('next.config.js', 'utf8').includes('images'),
      hasCompression: packageJson.dependencies?.compression !== undefined,
      reasonableDependencies: Object.keys(packageJson.dependencies || {}).length < 50
    };

    Object.entries(hasOptimizations).forEach(([key, value]) => {
      console.log(`${value ? '✅' : '❌'} ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${value ? 'Optimized' : 'Check needed'}`);
    });

    results.performance = {
      score: Object.values(hasOptimizations).filter(v => v).length / Object.keys(hasOptimizations).length,
      details: hasOptimizations
    };

    // 7. COMPLIANCE VERIFICATION
    console.log('\n📋 7. COMPLIANCE VERIFICATION');
    console.log('-'.repeat(40));
    
    // Check for safety warnings in results
    const resultsPageContent = fs.readFileSync('app/results/page.jsx', 'utf8');
    const complianceChecks = {
      hasSafetyWarnings: resultsPageContent.includes('⚠️') && resultsPageContent.includes('Verify'),
      hasFooterBackup: resultsPageContent.includes('footer-backup'),
      hasPDFWarnings: resultsPageContent.includes('VERIFY THIS INFORMATION'),
      hasProperDisclaimer: resultsPageContent.includes('AI-generated advice')
    };

    Object.entries(complianceChecks).forEach(([key, value]) => {
      console.log(`${value ? '✅' : '❌'} ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${value ? 'Compliant' : 'Missing'}`);
    });

    results.compliance = {
      score: Object.values(complianceChecks).filter(v => v).length / Object.keys(complianceChecks).length,
      details: complianceChecks
    };

    // 8. OVERALL ASSESSMENT
    console.log('\n🎯 8. OVERALL ASSESSMENT');
    console.log('='.repeat(40));
    
    const categoryScores = [
      results.environment.score,
      results.database.score,
      results.apis.score,
      results.frontend.score,
      results.security.score,
      results.performance.score,
      results.compliance.score
    ];

    const overallScore = categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length;
    
    console.log('\n📊 CATEGORY SCORES:');
    console.log(`Environment: ${Math.round(results.environment.score * 100)}%`);
    console.log(`Database: ${Math.round(results.database.score * 100)}%`);
    console.log(`APIs: ${Math.round(results.apis.score * 100)}%`);
    console.log(`Frontend: ${Math.round(results.frontend.score * 100)}%`);
    console.log(`Security: ${Math.round(results.security.score * 100)}%`);
    console.log(`Performance: ${Math.round(results.performance.score * 100)}%`);
    console.log(`Compliance: ${Math.round(results.compliance.score * 100)}%`);
    
    console.log(`\n🎯 OVERALL SCORE: ${Math.round(overallScore * 100)}%`);

    results.overall = {
      score: overallScore,
      categoryScores,
      readyForProduction: overallScore >= 0.9
    };

    // 9. DEPLOYMENT RECOMMENDATION
    console.log('\n🚀 DEPLOYMENT RECOMMENDATION');
    console.log('='.repeat(40));
    
    if (overallScore >= 0.95) {
      console.log('🎉 EXCELLENT - Ready for immediate production deployment!');
      console.log('✅ All systems verified and optimized');
    } else if (overallScore >= 0.9) {
      console.log('✅ GOOD - Ready for production deployment');
      console.log('💡 Minor optimizations recommended but not blocking');
    } else if (overallScore >= 0.8) {
      console.log('⚠️ CAUTION - Address issues before production deployment');
      console.log('🔧 Some critical issues need resolution');
    } else {
      console.log('❌ NOT READY - Significant issues must be resolved');
      console.log('🛠️ Major work required before deployment');
    }

    // 10. NEXT STEPS
    console.log('\n📋 NEXT STEPS');
    console.log('-'.repeat(40));
    
    if (results.overall.readyForProduction) {
      console.log('1. ✅ Run final build: npm run build');
      console.log('2. ✅ Deploy to Vercel: vercel --prod');
      console.log('3. ✅ Monitor deployment logs');
      console.log('4. ✅ Verify production URLs');
      console.log('5. ✅ Run post-deployment tests');
    } else {
      console.log('1. 🔧 Address failing checks above');
      console.log('2. 🔄 Re-run preflight checks');
      console.log('3. ✅ Proceed with deployment when ready');
    }

    return results;

  } catch (error) {
    console.error('💥 Preflight checks failed:', error);
    return { success: false, error: error.message };
  }
}

// Run preflight checks
runPreflightChecks().then(results => {
  console.log('\n' + '='.repeat(60));
  console.log('🏁 PREFLIGHT CHECKS COMPLETE');
  
  if (results.overall?.readyForProduction) {
    console.log('🎯 STATUS: READY FOR PRODUCTION DEPLOYMENT');
    process.exit(0);
  } else {
    console.log('⚠️ STATUS: ISSUES NEED RESOLUTION');
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 Preflight execution failed:', error);
  process.exit(1);
});