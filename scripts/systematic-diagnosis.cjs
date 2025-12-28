#!/usr/bin/env node

/**
 * SYSTEMATIC DIAGNOSIS: Proper Root Cause Analysis
 * Professional approach to identify and fix the core issue
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
const path = require('path');

async function systematicDiagnosis() {
  console.log('🔬 SYSTEMATIC DIAGNOSIS: ROOT CAUSE ANALYSIS');
  console.log('=' .repeat(60));
  console.log('Professional engineering approach to identify core issues');
  
  const diagnosis = {
    timestamp: new Date().toISOString(),
    environment: 'production',
    url: 'https://thandiai.vercel.app/assessment',
    issues: [],
    rootCauses: [],
    solutions: [],
    testResults: {}
  };
  
  console.log('\n📋 PHASE 1: ENVIRONMENT ANALYSIS');
  
  // Test 1: Page Loading
  try {
    const response = await fetch('https://thandiai.vercel.app/assessment');
    diagnosis.testResults.pageLoad = {
      status: response.status,
      ok: response.ok,
      size: 0
    };
    
    if (response.ok) {
      const html = await response.text();
      diagnosis.testResults.pageLoad.size = html.length;
      
      // Analyze HTML structure
      const htmlAnalysis = {
        hasDoctype: html.includes('<!DOCTYPE'),
        hasHtml: html.includes('<html'),
        hasHead: html.includes('<head>'),
        hasBody: html.includes('<body'),
        hasNextData: html.includes('__NEXT_DATA__'),
        hasReactRoot: html.includes('__next'),
        hasScripts: html.includes('<script'),
        hasStylesheets: html.includes('<link rel="stylesheet"'),
        hasMetaTags: html.includes('<meta'),
        hasTitle: html.includes('<title>')
      };
      
      diagnosis.testResults.htmlStructure = htmlAnalysis;
      
      console.log('   Page Loading: ✅ SUCCESS');
      console.log(`   Page Size: ${html.length} characters`);
      console.log(`   HTML Structure: ${Object.values(htmlAnalysis).filter(Boolean).length}/10 elements present`);
      
      // Check for specific content
      const contentAnalysis = {
        hasStudentRegistration: html.includes('Student Registration'),
        hasInputFields: html.includes('<input'),
        hasFormElements: html.includes('<form'),
        hasButtons: html.includes('<button'),
        hasSelectElements: html.includes('<select'),
        hasJavaScriptErrors: html.includes('error') || html.includes('Error'),
        hasReactComponents: html.includes('react') || html.includes('React')
      };
      
      diagnosis.testResults.contentAnalysis = contentAnalysis;
      
      // Identify issues
      if (!htmlAnalysis.hasNextData) {
        diagnosis.issues.push('Missing __NEXT_DATA__ - Next.js hydration failure');
        diagnosis.rootCauses.push('Server-side rendering not generating client-side data');
      }
      
      if (!contentAnalysis.hasInputFields) {
        diagnosis.issues.push('Missing input fields - Form not rendering');
        diagnosis.rootCauses.push('React components not rendering properly');
      }
      
      if (htmlAnalysis.hasReactRoot && !htmlAnalysis.hasNextData) {
        diagnosis.issues.push('React root present but no hydration data');
        diagnosis.rootCauses.push('Build configuration issue or deployment problem');
      }
      
    } else {
      diagnosis.issues.push(`Page not loading - HTTP ${response.status}`);
      diagnosis.rootCauses.push('Server or deployment issue');
    }
    
  } catch (error) {
    diagnosis.issues.push(`Network error: ${error.message}`);
    diagnosis.rootCauses.push('Connection or DNS issue');
  }
  
  console.log('\n📋 PHASE 2: LOCAL ENVIRONMENT COMPARISON');
  
  // Check local build
  try {
    const localBuildExists = fs.existsSync(path.join(process.cwd(), '.next'));
    diagnosis.testResults.localBuild = {
      exists: localBuildExists,
      buildTime: localBuildExists ? fs.statSync(path.join(process.cwd(), '.next')).mtime : null
    };
    
    console.log(`   Local Build: ${localBuildExists ? '✅ EXISTS' : '❌ MISSING'}`);
    
  } catch (error) {
    diagnosis.testResults.localBuild = { error: error.message };
  }
  
  console.log('\n📋 PHASE 3: CONFIGURATION ANALYSIS');
  
  // Check Next.js configuration
  const nextConfigExists = fs.existsSync(path.join(process.cwd(), 'next.config.js'));
  const packageJsonExists = fs.existsSync(path.join(process.cwd(), 'package.json'));
  const vercelJsonExists = fs.existsSync(path.join(process.cwd(), 'vercel.json'));
  
  diagnosis.testResults.configuration = {
    nextConfig: nextConfigExists,
    packageJson: packageJsonExists,
    vercelJson: vercelJsonExists
  };
  
  console.log(`   Next.js Config: ${nextConfigExists ? '✅' : '❌'}`);
  console.log(`   Package.json: ${packageJsonExists ? '✅' : '❌'}`);
  console.log(`   Vercel Config: ${vercelJsonExists ? '✅' : '❌'}`);
  
  console.log('\n📋 PHASE 4: ROOT CAUSE IDENTIFICATION');
  
  // Determine primary root cause
  let primaryRootCause = 'Unknown';
  let confidence = 'Low';
  
  if (diagnosis.issues.includes('Missing __NEXT_DATA__ - Next.js hydration failure')) {
    primaryRootCause = 'Next.js Build Configuration Issue';
    confidence = 'High';
    diagnosis.solutions.push('Fix Next.js build configuration for proper SSR/hydration');
    diagnosis.solutions.push('Ensure client-side JavaScript is properly bundled');
    diagnosis.solutions.push('Verify Vercel deployment settings');
  }
  
  if (diagnosis.issues.includes('Missing input fields - Form not rendering')) {
    if (primaryRootCause === 'Unknown') {
      primaryRootCause = 'React Component Rendering Failure';
      confidence = 'High';
    }
    diagnosis.solutions.push('Ensure React components are properly exported');
    diagnosis.solutions.push('Verify component imports and dependencies');
    diagnosis.solutions.push('Check for JavaScript errors preventing rendering');
  }
  
  diagnosis.primaryRootCause = primaryRootCause;
  diagnosis.confidence = confidence;
  
  console.log(`   Primary Root Cause: ${primaryRootCause}`);
  console.log(`   Confidence Level: ${confidence}`);
  
  console.log('\n📋 PHASE 5: SOLUTION STRATEGY');
  
  console.log('\n🎯 RECOMMENDED SOLUTIONS (Priority Order):');
  diagnosis.solutions.forEach((solution, index) => {
    console.log(`   ${index + 1}. ${solution}`);
  });
  
  // Save diagnosis report
  const reportPath = path.join(process.cwd(), 'SYSTEMATIC-DIAGNOSIS-REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(diagnosis, null, 2));
  
  console.log(`\n📄 Diagnosis report saved: ${reportPath}`);
  
  console.log('\n🔧 NEXT STEPS:');
  console.log('1. Review diagnosis report');
  console.log('2. Implement systematic fixes based on root cause');
  console.log('3. Test each fix thoroughly');
  console.log('4. Verify student safety and functionality');
  
  return diagnosis;
}

systematicDiagnosis().catch(error => {
  console.error('Systematic diagnosis failed:', error);
  process.exit(1);
});