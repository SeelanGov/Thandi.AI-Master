#!/usr/bin/env node

/**
 * SYSTEMATIC DEPLOYMENT INVESTIGATION
 * 
 * Methodical analysis of why the results page deployment is not working
 * No quick fixes - just careful investigation and proper solution
 */

const https = require('https');
const fs = require('fs');

console.log('🔍 SYSTEMATIC DEPLOYMENT INVESTIGATION');
console.log('=====================================\n');

async function step1_VerifyLocalCode() {
  console.log('STEP 1: Verify Local Code Integrity');
  console.log('-----------------------------------');
  
  try {
    const localContent = fs.readFileSync('app/results/page.jsx', 'utf8');
    
    // Check for critical React functionality
    const checks = {
      'useEffect hook': localContent.includes('useEffect'),
      'useState hook': localContent.includes('useState'),
      'localStorage.getItem': localContent.includes('localStorage.getItem'),
      'thandi_results key': localContent.includes('thandi_results'),
      'setResults function': localContent.includes('setResults'),
      'setLoading function': localContent.includes('setLoading'),
      'results-container div': localContent.includes('results-container'),
      'verification footer': localContent.includes('⚠️') || localContent.includes('Verify before you decide'),
      'PDF download': localContent.includes('downloadPDF'),
      'ResultsCardLayout': localContent.includes('ResultsCardLayout')
    };
    
    console.log('Local Code Analysis:');
    console.log(`File Size: ${localContent.length} bytes`);
    console.log('');
    
    let allPresent = true;
    Object.entries(checks).forEach(([feature, present]) => {
      console.log(`  ${present ? '✅' : '❌'} ${feature}`);
      if (!present) allPresent = false;
    });
    
    console.log('');
    console.log(`Local Code Status: ${allPresent ? '✅ Complete' : '❌ Missing Features'}`);
    
    return { success: true, allPresent, fileSize: localContent.length, checks };
    
  } catch (error) {
    console.log(`❌ Error reading local file: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function step2_CheckGitStatus() {
  console.log('\nSTEP 2: Check Git Repository Status');
  console.log('----------------------------------');
  
  // This would need to be implemented with child_process.exec
  // For now, we'll note what to check manually
  console.log('Manual Git Checks Required:');
  console.log('  □ git status - ensure no uncommitted changes');
  console.log('  □ git log --oneline -3 - check recent commits');
  console.log('  □ git diff HEAD~1 app/results/page.jsx - check if file changed recently');
  console.log('  □ git ls-files app/results/page.jsx - ensure file is tracked');
  
  return { success: true, requiresManualCheck: true };
}

async function step3_TestLiveDeployment() {
  console.log('\nSTEP 3: Test Live Deployment');
  console.log('----------------------------');
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'www.thandi.online',
      path: '/results',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        // Same checks as local code
        const checks = {
          'useEffect hook': data.includes('useEffect'),
          'useState hook': data.includes('useState'),
          'localStorage.getItem': data.includes('localStorage.getItem'),
          'thandi_results key': data.includes('thandi_results'),
          'setResults function': data.includes('setResults'),
          'setLoading function': data.includes('setLoading'),
          'results-container div': data.includes('results-container'),
          'verification footer': data.includes('⚠️') || data.includes('Verify before you decide'),
          'PDF download': data.includes('downloadPDF'),
          'ResultsCardLayout': data.includes('ResultsCardLayout')
        };
        
        console.log('Live Deployment Analysis:');
        console.log(`Status Code: ${res.statusCode}`);
        console.log(`File Size: ${data.length} bytes`);
        console.log('');
        
        let allPresent = true;
        Object.entries(checks).forEach(([feature, present]) => {
          console.log(`  ${present ? '✅' : '❌'} ${feature}`);
          if (!present) allPresent = false;
        });
        
        console.log('');
        console.log(`Live Deployment Status: ${allPresent ? '✅ Complete' : '❌ Missing Features'}`);
        
        resolve({ 
          success: res.statusCode === 200, 
          allPresent, 
          fileSize: data.length, 
          checks,
          statusCode: res.statusCode 
        });
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Error fetching live deployment: ${error.message}`);
      resolve({ success: false, error: error.message });
    });

    req.setTimeout(10000, () => {
      console.log('❌ Timeout fetching live deployment');
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });

    req.end();
  });
}

async function step4_CompareLocalVsLive(localResult, liveResult) {
  console.log('\nSTEP 4: Compare Local vs Live');
  console.log('-----------------------------');
  
  if (!localResult.success || !liveResult.success) {
    console.log('❌ Cannot compare - one or both sources failed');
    return { canCompare: false };
  }
  
  console.log('Comparison Results:');
  console.log(`File Size: Local ${localResult.fileSize} bytes vs Live ${liveResult.fileSize} bytes`);
  console.log('');
  
  const sizeDifference = Math.abs(localResult.fileSize - liveResult.fileSize);
  const significantDifference = sizeDifference > 1000; // More than 1KB difference
  
  console.log(`Size Difference: ${sizeDifference} bytes ${significantDifference ? '(SIGNIFICANT)' : '(minor)'}`);
  console.log('');
  
  // Compare feature by feature
  console.log('Feature Comparison:');
  const allFeatures = Object.keys(localResult.checks);
  let mismatchCount = 0;
  
  allFeatures.forEach(feature => {
    const localHas = localResult.checks[feature];
    const liveHas = liveResult.checks[feature];
    const match = localHas === liveHas;
    
    if (!match) mismatchCount++;
    
    console.log(`  ${match ? '✅' : '❌'} ${feature}: Local ${localHas ? '✅' : '❌'} | Live ${liveHas ? '✅' : '❌'}`);
  });
  
  console.log('');
  console.log(`Feature Mismatches: ${mismatchCount}/${allFeatures.length}`);
  
  return {
    canCompare: true,
    sizeDifference,
    significantDifference,
    mismatchCount,
    totalFeatures: allFeatures.length,
    deploymentIssue: mismatchCount > 0 || significantDifference
  };
}

function step5_DiagnoseIssue(comparison) {
  console.log('\nSTEP 5: Diagnose Issue');
  console.log('----------------------');
  
  if (!comparison.canCompare) {
    console.log('❌ DIAGNOSIS: Cannot determine issue - data collection failed');
    console.log('   NEXT STEP: Fix data collection issues first');
    return { diagnosis: 'data_collection_failed' };
  }
  
  if (!comparison.deploymentIssue) {
    console.log('✅ DIAGNOSIS: No deployment issue detected');
    console.log('   The issue may be in JavaScript execution or browser-specific');
    console.log('   NEXT STEP: Debug JavaScript execution in browser');
    return { diagnosis: 'no_deployment_issue' };
  }
  
  if (comparison.significantDifference && comparison.mismatchCount > 5) {
    console.log('🚨 DIAGNOSIS: CRITICAL DEPLOYMENT SYNC FAILURE');
    console.log('   The deployed version is completely different from local code');
    console.log('   This suggests the deployment pipeline is not working correctly');
    console.log('   NEXT STEP: Investigate deployment pipeline (Vercel, Git, Build process)');
    return { diagnosis: 'critical_deployment_failure' };
  }
  
  if (comparison.mismatchCount > 0) {
    console.log('⚠️ DIAGNOSIS: Partial deployment issue');
    console.log('   Some features are missing from the deployed version');
    console.log('   This suggests a build or caching issue');
    console.log('   NEXT STEP: Force rebuild and clear caches');
    return { diagnosis: 'partial_deployment_issue' };
  }
  
  console.log('❓ DIAGNOSIS: Unknown issue');
  console.log('   The comparison didn\'t reveal obvious problems');
  console.log('   NEXT STEP: Manual investigation required');
  return { diagnosis: 'unknown' };
}

function step6_RecommendSolution(diagnosis) {
  console.log('\nSTEP 6: Recommend Solution');
  console.log('--------------------------');
  
  switch (diagnosis.diagnosis) {
    case 'critical_deployment_failure':
      console.log('SOLUTION: Fix Deployment Pipeline');
      console.log('');
      console.log('1. Check Vercel Dashboard:');
      console.log('   - Look for failed deployments');
      console.log('   - Check build logs for errors');
      console.log('   - Verify environment variables');
      console.log('');
      console.log('2. Verify Git Integration:');
      console.log('   - Ensure Vercel is connected to correct branch');
      console.log('   - Check if auto-deployment is enabled');
      console.log('   - Verify webhook configuration');
      console.log('');
      console.log('3. Force Clean Deployment:');
      console.log('   - Clear Vercel build cache');
      console.log('   - Trigger manual deployment');
      console.log('   - Check for build configuration issues');
      break;
      
    case 'partial_deployment_issue':
      console.log('SOLUTION: Force Rebuild');
      console.log('');
      console.log('1. Clear all caches');
      console.log('2. Force new deployment');
      console.log('3. Verify build process');
      break;
      
    case 'no_deployment_issue':
      console.log('SOLUTION: Debug JavaScript Execution');
      console.log('');
      console.log('1. Test in browser with console open');
      console.log('2. Check for runtime errors');
      console.log('3. Verify localStorage functionality');
      break;
      
    default:
      console.log('SOLUTION: Manual Investigation Required');
      console.log('');
      console.log('The automated diagnosis was inconclusive.');
      console.log('Manual investigation of logs and configuration needed.');
  }
}

async function main() {
  console.log('Starting systematic investigation...');
  console.log('This will methodically identify the root cause.\n');
  
  try {
    // Step 1: Verify local code
    const localResult = await step1_VerifyLocalCode();
    
    // Step 2: Check git status (manual for now)
    const gitResult = await step2_CheckGitStatus();
    
    // Step 3: Test live deployment
    const liveResult = await step3_TestLiveDeployment();
    
    // Step 4: Compare results
    const comparison = await step4_CompareLocalVsLive(localResult, liveResult);
    
    // Step 5: Diagnose the issue
    const diagnosis = step5_DiagnoseIssue(comparison);
    
    // Step 6: Recommend solution
    step6_RecommendSolution(diagnosis);
    
    console.log('\n📋 INVESTIGATION SUMMARY');
    console.log('=======================');
    console.log(`Local Code: ${localResult.success && localResult.allPresent ? '✅ Complete' : '❌ Issues'}`);
    console.log(`Live Deployment: ${liveResult.success && liveResult.allPresent ? '✅ Complete' : '❌ Issues'}`);
    console.log(`Diagnosis: ${diagnosis.diagnosis}`);
    console.log('');
    console.log('This systematic analysis provides the foundation for a proper fix.');
    
  } catch (error) {
    console.error('❌ Investigation failed:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { 
  step1_VerifyLocalCode, 
  step3_TestLiveDeployment, 
  step4_CompareLocalVsLive 
};