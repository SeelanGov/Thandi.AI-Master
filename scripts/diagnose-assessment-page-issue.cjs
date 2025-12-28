#!/usr/bin/env node

/**
 * URGENT: Diagnose Assessment Page Issue
 * The assessment page appears to be broken - let's find out why
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const PRODUCTION_URL = 'https://thandiai.vercel.app';

async function diagnoseAssessmentPage() {
  console.log('🚨 URGENT: DIAGNOSING ASSESSMENT PAGE ISSUE');
  console.log('=' .repeat(60));
  
  try {
    console.log('\n📄 Testing Assessment Page...');
    const response = await fetch(`${PRODUCTION_URL}/assessment`);
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const html = await response.text();
      console.log(`Response Length: ${html.length} characters`);
      
      // Check for critical elements
      const checks = {
        hasHtml: html.includes('<html'),
        hasBody: html.includes('<body'),
        hasTitle: html.includes('<title>'),
        hasNextData: html.includes('__NEXT_DATA__'),
        hasReactRoot: html.includes('__next'),
        hasGradeSelector: html.includes('Grade 10') || html.includes('Grade 11') || html.includes('Grade 12'),
        hasAssessmentContent: html.includes('assessment') || html.includes('Assessment'),
        hasJavaScript: html.includes('<script'),
        hasCSS: html.includes('<style') || html.includes('.css'),
        hasError: html.includes('error') || html.includes('Error') || html.includes('404') || html.includes('500')
      };
      
      console.log('\n🔍 Page Structure Analysis:');
      Object.entries(checks).forEach(([check, result]) => {
        console.log(`   ${check}: ${result ? '✅' : '❌'}`);
      });
      
      // Look for specific error messages
      if (checks.hasError) {
        console.log('\n🚨 ERROR CONTENT DETECTED:');
        const errorMatches = html.match(/(error|Error|404|500)[^<]{0,100}/gi);
        if (errorMatches) {
          errorMatches.slice(0, 3).forEach(match => {
            console.log(`   - ${match}`);
          });
        }
      }
      
      // Show page content snippet
      console.log('\n📄 Page Content (first 500 chars):');
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        const bodyContent = bodyMatch[1].replace(/\s+/g, ' ').trim();
        console.log(bodyContent.substring(0, 500) + '...');
      } else {
        console.log(html.substring(0, 500) + '...');
      }
      
      // Check if it's a Next.js error page
      if (html.includes('Application error') || html.includes('Internal Server Error')) {
        console.log('\n🚨 NEXT.JS APPLICATION ERROR DETECTED');
        console.log('   This suggests a server-side rendering issue');
      }
      
      // Check if it's a build issue
      if (!checks.hasNextData && !checks.hasReactRoot) {
        console.log('\n🚨 REACT/NEXT.JS STRUCTURE MISSING');
        console.log('   This suggests a build or deployment issue');
      }
      
    } else {
      console.log(`❌ Assessment page failed: HTTP ${response.status}`);
      const errorText = await response.text();
      console.log('Error response:', errorText.substring(0, 500));
    }
    
  } catch (error) {
    console.log(`❌ Connection error: ${error.message}`);
  }
  
  // Also check the main page for comparison
  console.log('\n🏠 Testing Main Page for Comparison...');
  try {
    const mainResponse = await fetch(PRODUCTION_URL);
    console.log(`Main page status: ${mainResponse.status}`);
    
    if (mainResponse.ok) {
      const mainHtml = await mainResponse.text();
      const mainHasNext = mainHtml.includes('__NEXT_DATA__');
      const mainHasReact = mainHtml.includes('__next');
      
      console.log(`Main page has Next.js structure: ${mainHasNext ? '✅' : '❌'}`);
      console.log(`Main page has React root: ${mainHasReact ? '✅' : '❌'}`);
      
      if (mainHasNext && mainHasReact) {
        console.log('✅ Main page structure is OK - issue is specific to /assessment');
      } else {
        console.log('❌ Main page also has structural issues - deployment problem');
      }
    }
  } catch (error) {
    console.log(`Main page test failed: ${error.message}`);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('🔧 LIKELY CAUSES AND SOLUTIONS:');
  console.log('1. Build error in assessment page component');
  console.log('2. Missing or broken assessment route');
  console.log('3. React component compilation issue');
  console.log('4. Deployment didn\'t include latest changes');
  console.log('5. Server-side rendering error');
  
  console.log('\n📋 IMMEDIATE ACTIONS NEEDED:');
  console.log('1. Check local build: npm run build');
  console.log('2. Test local dev server: npm run dev');
  console.log('3. Verify assessment page files exist');
  console.log('4. Check for JavaScript errors');
  console.log('5. Redeploy if necessary');
}

diagnoseAssessmentPage().catch(error => {
  console.error('Diagnosis failed:', error);
  process.exit(1);
});