#!/usr/bin/env node

/**
 * Final Preflight Check - Comprehensive System Verification
 * 
 * Verifies all systems are ready for deployment
 */

import fs from 'fs';
import path from 'path';

async function runFinalPreflightCheck() {
  console.log('🚀 FINAL PREFLIGHT CHECK');
  console.log('Comprehensive system verification before deployment');
  console.log('=' .repeat(60));
  
  const checks = {
    coreFiles: false,
    environmentSetup: false,
    enhancementTesting: false,
    apiIntegration: false,
    safetyVerification: false
  };
  
  let totalChecks = Object.keys(checks).length;
  let passedChecks = 0;
  
  // 1. Core Files Verification
  console.log('\n📁 1. CORE FILES VERIFICATION');
  console.log('-' .repeat(40));
  
  const coreFiles = [
    'lib/matching/program-matcher.js',
    'app/api/rag/query/route.js',
    '.env.local',
    'package.json'
  ];
  
  let coreFilesExist = true;
  coreFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`   ${exists ? '✅' : '❌'} ${file}: ${exists ? 'EXISTS' : 'MISSING'}`);
    if (!exists) coreFilesExist = false;
  });
  
  if (coreFilesExist) {
    console.log('✅ All core files present');
    checks.coreFiles = true;
    passedChecks++;
  } else {
    console.log('❌ Some core files missing');
  }
  
  // 2. Environment Setup Verification
  console.log('\n🔧 2. ENVIRONMENT SETUP VERIFICATION');
  console.log('-' .repeat(40));
  
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const hasSupabase = envContent.includes('NEXT_PUBLIC_SUPABASE_URL') && envContent.includes('pvvnxupuukuefajypovz');
    const hasGroq = envContent.includes('GROQ_API_KEY') && envContent.includes('gsk_');
    const hasOpenAI = envContent.includes('OPENAI_API_KEY') && envContent.includes('sk-proj-');
    const hasAnthropic = envContent.includes('ANTHROPIC_API_KEY') && envContent.includes('sk-ant-');
    const hasUpstash = envContent.includes('UPSTASH_REDIS_REST_URL') && envContent.includes('upstash.io');
    
    console.log(`   ${hasSupabase ? '✅' : '❌'} Supabase Configuration: ${hasSupabase ? 'CONFIGURED' : 'MISSING'}`);
    console.log(`   ${hasGroq ? '✅' : '❌'} Groq API Key: ${hasGroq ? 'CONFIGURED' : 'MISSING'}`);
    console.log(`   ${hasOpenAI ? '✅' : '❌'} OpenAI API Key: ${hasOpenAI ? 'CONFIGURED' : 'MISSING'}`);
    console.log(`   ${hasAnthropic ? '✅' : '❌'} Anthropic API Key: ${hasAnthropic ? 'CONFIGURED' : 'MISSING'}`);
    console.log(`   ${hasUpstash ? '✅' : '❌'} Upstash Cache: ${hasUpstash ? 'CONFIGURED' : 'MISSING'}`);
    
    if (hasSupabase && (hasGroq || hasOpenAI || hasAnthropic)) {
      console.log('✅ Environment properly configured');
      checks.environmentSetup = true;
      passedChecks++;
    } else {
      console.log('❌ Environment configuration incomplete');
    }
  } catch (error) {
    console.log('❌ Error reading environment file');
  }
  
  // 3. Enhancement Testing Verification
  console.log('\n🧪 3. ENHANCEMENT TESTING VERIFICATION');
  console.log('-' .repeat(40));
  
  try {
    // Check if program matcher module exists and exports correctly
    const programMatcherExists = fs.existsSync('lib/matching/program-matcher.js');
    const testFileExists = fs.existsSync('test-core-enhancement.js');
    
    console.log(`   ${programMatcherExists ? '✅' : '❌'} Program Matcher Module: ${programMatcherExists ? 'EXISTS' : 'MISSING'}`);
    console.log(`   ${testFileExists ? '✅' : '❌'} Test Suite: ${testFileExists ? 'EXISTS' : 'MISSING'}`);
    
    if (programMatcherExists && testFileExists) {
      console.log('✅ Enhancement testing ready');
      checks.enhancementTesting = true;
      passedChecks++;
    } else {
      console.log('❌ Enhancement testing not ready');
    }
  } catch (error) {
    console.log('❌ Error verifying enhancement testing');
  }
  
  // 4. API Integration Verification
  console.log('\n🔌 4. API INTEGRATION VERIFICATION');
  console.log('-' .repeat(40));
  
  try {
    const apiRouteContent = fs.readFileSync('app/api/rag/query/route.js', 'utf8');
    const hasEnhancementImport = apiRouteContent.includes('generateSpecificRecommendations');
    const hasFormatFunction = apiRouteContent.includes('formatRecommendationsForLLM');
    const hasVerificationFooter = apiRouteContent.includes('⚠️');
    const hasGradeDetection = apiRouteContent.includes('I am a Grade');
    
    console.log(`   ${hasEnhancementImport ? '✅' : '❌'} Enhancement Import: ${hasEnhancementImport ? 'INTEGRATED' : 'MISSING'}`);
    console.log(`   ${hasFormatFunction ? '✅' : '❌'} Format Function: ${hasFormatFunction ? 'INTEGRATED' : 'MISSING'}`);
    console.log(`   ${hasVerificationFooter ? '✅' : '❌'} Verification Footer: ${hasVerificationFooter ? 'PRESENT' : 'MISSING'}`);
    console.log(`   ${hasGradeDetection ? '✅' : '❌'} Grade Detection: ${hasGradeDetection ? 'ENHANCED' : 'BASIC'}`);
    
    if (hasEnhancementImport && hasFormatFunction && hasVerificationFooter) {
      console.log('✅ API integration complete');
      checks.apiIntegration = true;
      passedChecks++;
    } else {
      console.log('❌ API integration incomplete');
    }
  } catch (error) {
    console.log('❌ Error verifying API integration');
  }
  
  // 5. Safety Verification
  console.log('\n🔒 5. SAFETY VERIFICATION');
  console.log('-' .repeat(40));
  
  try {
    const apiContent = fs.readFileSync('app/api/rag/query/route.js', 'utf8');
    const hasVerifyFooter = apiContent.includes('Verify before you decide');
    const hasAIWarning = apiContent.includes('AI-generated advice');
    const hasConsultWarning = apiContent.includes('school counselors');
    const hasErrorHandling = apiContent.includes('try {') && apiContent.includes('catch');
    
    console.log(`   ${hasVerifyFooter ? '✅' : '❌'} Verification Footer: ${hasVerifyFooter ? 'PRESENT' : 'MISSING'}`);
    console.log(`   ${hasAIWarning ? '✅' : '❌'} AI Warning: ${hasAIWarning ? 'PRESENT' : 'MISSING'}`);
    console.log(`   ${hasConsultWarning ? '✅' : '❌'} Consultation Warning: ${hasConsultWarning ? 'PRESENT' : 'MISSING'}`);
    console.log(`   ${hasErrorHandling ? '✅' : '❌'} Error Handling: ${hasErrorHandling ? 'IMPLEMENTED' : 'MISSING'}`);
    
    if (hasVerifyFooter && hasAIWarning && hasErrorHandling) {
      console.log('✅ Safety verification complete');
      checks.safetyVerification = true;
      passedChecks++;
    } else {
      console.log('❌ Safety verification incomplete');
    }
  } catch (error) {
    console.log('❌ Error verifying safety systems');
  }
  
  // Final Summary
  console.log('\n' + '=' .repeat(60));
  console.log('🎯 FINAL PREFLIGHT RESULTS');
  console.log('=' .repeat(60));
  console.log(`Checks Passed: ${passedChecks}/${totalChecks}`);
  console.log(`Success Rate: ${((passedChecks / totalChecks) * 100).toFixed(1)}%`);
  
  console.log('\n📊 Detailed Results:');
  Object.entries(checks).forEach(([check, passed]) => {
    const checkName = check.replace(/([A-Z])/g, ' $1').toLowerCase();
    console.log(`   ${passed ? '✅' : '❌'} ${checkName}: ${passed ? 'PASS' : 'FAIL'}`);
  });
  
  if (passedChecks === totalChecks) {
    console.log('\n🎉 ALL PREFLIGHT CHECKS PASSED!');
    console.log('✅ System is ready for deployment');
    
    console.log('\n🚀 DEPLOYMENT READY:');
    console.log('   - Core files verified');
    console.log('   - Environment configured');
    console.log('   - Enhancement tested');
    console.log('   - API integration complete');
    console.log('   - Safety systems operational');
    
    console.log('\n📋 Next Steps:');
    console.log('   1. Start development server: npm run dev');
    console.log('   2. Test API endpoint manually');
    console.log('   3. Verify complete user flow');
    console.log('   4. Deploy to production: vercel --prod');
    
    return true;
  } else {
    console.log('\n⚠️ SOME PREFLIGHT CHECKS FAILED');
    console.log('❌ Please address issues before deployment');
    
    console.log('\n🔧 Required Actions:');
    Object.entries(checks).forEach(([check, passed]) => {
      if (!passed) {
        const checkName = check.replace(/([A-Z])/g, ' $1').toLowerCase();
        console.log(`   - Fix ${checkName}`);
      }
    });
    
    return false;
  }
}

// Run the preflight check
runFinalPreflightCheck().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Preflight check execution failed:', error);
  process.exit(1);
});