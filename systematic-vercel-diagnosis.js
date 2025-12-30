#!/usr/bin/env node

/**
 * SYSTEMATIC VERCEL DIAGNOSIS
 * Logical step-by-step analysis of what's actually wrong
 */

const https = require('https');
const fs = require('fs');

async function step1_CheckActualDeploymentState() {
  console.log('🔍 STEP 1: CHECKING ACTUAL DEPLOYMENT STATE');
  console.log('============================================');
  
  // Get the actual HTML content
  const result = await new Promise((resolve) => {
    const req = https.get('https://www.thandi.online/assessment', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          success: res.statusCode === 200,
          statusCode: res.statusCode,
          headers: res.headers,
          content: data
        });
      });
    });
    req.on('error', () => resolve({ success: false }));
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ success: false });
    });
  });
  
  if (!result.success) {
    console.log('❌ CRITICAL: Site not accessible');
    return false;
  }
  
  console.log(`✅ Site accessible: ${result.statusCode}`);
  console.log(`📏 Content size: ${result.content.length} bytes`);
  console.log(`🕒 Server date: ${result.headers.date}`);
  console.log(`⚡ Cache status: ${result.headers['x-vercel-cache'] || 'Unknown'}`);
  console.log(`🌐 CDN ID: ${result.headers['x-vercel-id'] || 'Unknown'}`);
  
  // Save the actual HTML for analysis
  fs.writeFileSync('actual-deployment-content.html', result.content);
  console.log('💾 Saved actual HTML content to: actual-deployment-content.html');
  
  return { content: result.content, headers: result.headers };
}

async function step2_AnalyzeHTMLStructure(content) {
  console.log('\n🔍 STEP 2: ANALYZING HTML STRUCTURE');
  console.log('===================================');
  
  // Check for Next.js indicators
  const hasNextData = content.includes('__NEXT_DATA__');
  const hasNextScripts = content.includes('_next/static/chunks/');
  const hasReactRoot = content.includes('__next');
  const hasHydration = content.includes('ReactDOM') || content.includes('hydrateRoot');
  
  console.log(`⚛️ Next.js Data: ${hasNextData ? '✅' : '❌'}`);
  console.log(`📜 Next.js Scripts: ${hasNextScripts ? '✅' : '❌'}`);
  console.log(`🌳 React Root: ${hasReactRoot ? '✅' : '❌'}`);
  console.log(`💧 Hydration: ${hasHydration ? '✅' : '❌'}`);
  
  // Check for our specific components
  const hasAssessmentForm = content.includes('AssessmentForm') || content.includes('assessment-container');
  const hasRegistration = content.includes('BulletproofStudentRegistration') || content.includes('Student Registration');
  const hasGradeSelector = content.includes('GradeSelector') || content.includes('Select your grade');
  
  console.log(`📋 Assessment Form: ${hasAssessmentForm ? '✅' : '❌'}`);
  console.log(`📝 Registration: ${hasRegistration ? '✅' : '❌'}`);
  console.log(`🎯 Grade Selector: ${hasGradeSelector ? '✅' : '❌'}`);
  
  // Check for error indicators
  const hasError = content.includes('Error') || content.includes('error');
  const hasLoading = content.includes('Loading') || content.includes('loading');
  const has404 = content.includes('404') || content.includes('Not Found');
  const has500 = content.includes('500') || content.includes('Internal Server Error');
  
  console.log(`❌ Errors: ${hasError ? '⚠️' : '✅'}`);
  console.log(`⏳ Loading: ${hasLoading ? '⚠️' : '✅'}`);
  console.log(`🚫 404 Error: ${has404 ? '❌' : '✅'}`);
  console.log(`💥 500 Error: ${has500 ? '❌' : '✅'}`);
  
  // Extract the actual page title and meta
  const titleMatch = content.match(/<title>(.*?)<\/title>/);
  const title = titleMatch ? titleMatch[1] : 'No title found';
  console.log(`📄 Page Title: "${title}"`);
  
  // Look for the actual body content
  const bodyMatch = content.match(/<body[^>]*>(.*?)<\/body>/s);
  const bodyContent = bodyMatch ? bodyMatch[1] : 'No body found';
  const bodyPreview = bodyContent.substring(0, 200).replace(/\s+/g, ' ').trim();
  console.log(`🏗️ Body Preview: "${bodyPreview}..."`);
  
  return {
    isNextApp: hasNextData && hasNextScripts,
    hasComponents: hasAssessmentForm || hasRegistration,
    hasErrors: hasError || has404 || has500,
    isLoading: hasLoading,
    title,
    bodyPreview
  };
}

async function step3_CheckBuildVersion() {
  console.log('\n🔍 STEP 3: CHECKING BUILD VERSION');
  console.log('=================================');
  
  // Check our local package.json version
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log(`📦 Local Version: ${packageJson.version}`);
    
    // Check last commit
    const { execSync } = require('child_process');
    const lastCommit = execSync('git log -1 --oneline', { encoding: 'utf8' }).trim();
    console.log(`📝 Last Commit: ${lastCommit}`);
    
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    console.log(`🔄 Git Status: ${gitStatus ? 'Uncommitted changes' : 'Clean'}`);
    
    return { version: packageJson.version, lastCommit, isClean: !gitStatus };
  } catch (error) {
    console.log(`❌ Error checking version: ${error.message}`);
    return null;
  }
}

async function step4_TestSpecificEndpoints() {
  console.log('\n🔍 STEP 4: TESTING SPECIFIC ENDPOINTS');
  console.log('=====================================');
  
  const endpoints = [
    { name: 'Health Check', url: 'https://www.thandi.online/api/health' },
    { name: 'School Search', url: 'https://www.thandi.online/api/schools/search?q=test' },
    { name: 'Homepage', url: 'https://www.thandi.online' },
    { name: 'Admin Page', url: 'https://www.thandi.online/admin' }
  ];
  
  const results = {};
  
  for (const endpoint of endpoints) {
    const result = await new Promise((resolve) => {
      const req = https.get(endpoint.url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            success: res.statusCode === 200,
            statusCode: res.statusCode,
            size: data.length,
            isJson: data.trim().startsWith('{') || data.trim().startsWith('[')
          });
        });
      });
      req.on('error', () => resolve({ success: false }));
      req.setTimeout(5000, () => {
        req.destroy();
        resolve({ success: false });
      });
    });
    
    results[endpoint.name] = result;
    console.log(`${result.success ? '✅' : '❌'} ${endpoint.name}: ${result.statusCode || 'Failed'} (${result.size || 0} bytes)`);
  }
  
  return results;
}

async function step5_DiagnoseRootCause(htmlAnalysis, versionInfo, endpointResults) {
  console.log('\n🔍 STEP 5: ROOT CAUSE DIAGNOSIS');
  console.log('===============================');
  
  console.log('📊 ANALYSIS SUMMARY:');
  console.log(`   Next.js App: ${htmlAnalysis.isNextApp ? '✅' : '❌'}`);
  console.log(`   Components: ${htmlAnalysis.hasComponents ? '✅' : '❌'}`);
  console.log(`   Errors: ${htmlAnalysis.hasErrors ? '❌' : '✅'}`);
  console.log(`   Loading State: ${htmlAnalysis.isLoading ? '⚠️' : '✅'}`);
  console.log(`   API Health: ${endpointResults['Health Check']?.success ? '✅' : '❌'}`);
  console.log(`   Git Clean: ${versionInfo?.isClean ? '✅' : '❌'}`);
  
  // Determine the actual problem
  if (!htmlAnalysis.isNextApp) {
    console.log('\n🚨 ROOT CAUSE: NEXT.JS APP NOT BUILDING PROPERLY');
    console.log('   Problem: Missing __NEXT_DATA__ and Next.js scripts');
    console.log('   Solution: Build configuration issue - check next.config.js');
    return 'build_config';
  }
  
  if (htmlAnalysis.isNextApp && !htmlAnalysis.hasComponents) {
    console.log('\n🚨 ROOT CAUSE: REACT COMPONENTS NOT RENDERING');
    console.log('   Problem: Next.js builds but components don\'t render');
    console.log('   Solution: Component import/export issues or runtime errors');
    return 'component_rendering';
  }
  
  if (htmlAnalysis.isLoading && htmlAnalysis.hasComponents) {
    console.log('\n🚨 ROOT CAUSE: STUCK IN LOADING STATE');
    console.log('   Problem: Components render but stuck on loading screen');
    console.log('   Solution: JavaScript runtime error or API failure');
    return 'loading_stuck';
  }
  
  if (htmlAnalysis.hasErrors) {
    console.log('\n🚨 ROOT CAUSE: RUNTIME ERRORS');
    console.log('   Problem: JavaScript errors preventing proper execution');
    console.log('   Solution: Check browser console and fix runtime errors');
    return 'runtime_errors';
  }
  
  if (!endpointResults['Health Check']?.success) {
    console.log('\n🚨 ROOT CAUSE: API BACKEND FAILURE');
    console.log('   Problem: Backend APIs not responding');
    console.log('   Solution: Check API routes and database connections');
    return 'api_failure';
  }
  
  console.log('\n🤔 ROOT CAUSE: UNKNOWN - NEED DEEPER INVESTIGATION');
  console.log('   All basic checks pass but issue persists');
  console.log('   Solution: Manual browser testing and console inspection');
  return 'unknown';
}

async function step6_RecommendSolution(rootCause) {
  console.log('\n🔧 STEP 6: SOLUTION RECOMMENDATION');
  console.log('==================================');
  
  switch (rootCause) {
    case 'build_config':
      console.log('🎯 SOLUTION: Fix Build Configuration');
      console.log('   1. Simplify next.config.js to minimal configuration');
      console.log('   2. Remove experimental features');
      console.log('   3. Clear .next and node_modules');
      console.log('   4. Force fresh deployment');
      break;
      
    case 'component_rendering':
      console.log('🎯 SOLUTION: Fix Component Issues');
      console.log('   1. Check component imports/exports');
      console.log('   2. Verify client-side component markers');
      console.log('   3. Test components locally first');
      console.log('   4. Check for TypeScript/JSX errors');
      break;
      
    case 'loading_stuck':
      console.log('🎯 SOLUTION: Fix Loading State');
      console.log('   1. Check useEffect dependencies');
      console.log('   2. Verify API endpoints are working');
      console.log('   3. Add error boundaries');
      console.log('   4. Test with browser dev tools');
      break;
      
    case 'runtime_errors':
      console.log('🎯 SOLUTION: Fix Runtime Errors');
      console.log('   1. Open browser console on live site');
      console.log('   2. Fix JavaScript errors');
      console.log('   3. Check for missing dependencies');
      console.log('   4. Verify environment variables');
      break;
      
    case 'api_failure':
      console.log('🎯 SOLUTION: Fix API Backend');
      console.log('   1. Check database connections');
      console.log('   2. Verify environment variables');
      console.log('   3. Test API routes individually');
      console.log('   4. Check Supabase/Redis connections');
      break;
      
    default:
      console.log('🎯 SOLUTION: Manual Investigation Required');
      console.log('   1. Test in multiple browsers');
      console.log('   2. Check browser console for errors');
      console.log('   3. Verify network requests');
      console.log('   4. Test on different devices');
  }
}

async function main() {
  console.log('🔍 SYSTEMATIC VERCEL DIAGNOSIS');
  console.log('===============================');
  console.log(`📅 Started: ${new Date().toISOString()}`);
  console.log('🎯 Goal: Understand exactly what is wrong with Vercel deployment');
  
  try {
    // Step 1: Get actual deployment state
    const deploymentState = await step1_CheckActualDeploymentState();
    if (!deploymentState) {
      console.log('\n❌ CRITICAL: Cannot access site - deployment completely failed');
      return;
    }
    
    // Step 2: Analyze HTML structure
    const htmlAnalysis = await step2_AnalyzeHTMLStructure(deploymentState.content);
    
    // Step 3: Check build version
    const versionInfo = await step3_CheckBuildVersion();
    
    // Step 4: Test specific endpoints
    const endpointResults = await step4_TestSpecificEndpoints();
    
    // Step 5: Diagnose root cause
    const rootCause = await step5_DiagnoseRootCause(htmlAnalysis, versionInfo, endpointResults);
    
    // Step 6: Recommend solution
    await step6_RecommendSolution(rootCause);
    
    console.log('\n📊 FINAL DIAGNOSIS');
    console.log('==================');
    console.log(`🔍 Root Cause: ${rootCause.toUpperCase().replace('_', ' ')}`);
    console.log(`📄 Page Title: "${htmlAnalysis.title}"`);
    console.log(`🏗️ Body Content: "${htmlAnalysis.bodyPreview}"`);
    console.log(`📦 Local Version: ${versionInfo?.version || 'Unknown'}`);
    console.log(`📝 Last Commit: ${versionInfo?.lastCommit || 'Unknown'}`);
    
    console.log('\n🎯 NEXT ACTION REQUIRED:');
    console.log('========================');
    
    if (rootCause === 'build_config') {
      console.log('🔧 IMMEDIATE: Fix Next.js configuration and redeploy');
    } else if (rootCause === 'component_rendering') {
      console.log('🔧 IMMEDIATE: Fix component imports and test locally');
    } else if (rootCause === 'loading_stuck') {
      console.log('🔧 IMMEDIATE: Debug loading state with browser tools');
    } else {
      console.log('🔧 IMMEDIATE: Manual browser testing required');
    }
    
  } catch (error) {
    console.log('\n❌ DIAGNOSIS ERROR');
    console.log(`Error: ${error.message}`);
  }
}

// Execute the diagnosis
main().then(() => {
  console.log(`\n📅 Completed: ${new Date().toISOString()}`);
}).catch(error => {
  console.error('❌ Critical error:', error.message);
});