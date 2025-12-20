#!/usr/bin/env node

/**
 * Diagnose Deployment Issues
 * Detailed testing of the production deployment
 */

const DEPLOYMENT_URL = 'https://thandiai-j3jdmrcxd-thandiai-projects.vercel.app';

console.log('🔍 Deployment Diagnostics');
console.log('='.repeat(50));
console.log('URL:', DEPLOYMENT_URL);

async function diagnoseDeployment() {
  console.log('\n📊 Running Diagnostic Tests...\n');
  
  // Test 1: Basic connectivity
  console.log('1️⃣ Testing Basic Connectivity');
  try {
    const response = await fetch(DEPLOYMENT_URL);
    console.log(`   Status: ${response.status}`);
    console.log(`   Status Text: ${response.statusText}`);
    console.log(`   Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.status === 401) {
      console.log('   ⚠️ 401 Unauthorized - Possible causes:');
      console.log('      • Vercel password protection enabled');
      console.log('      • Authentication middleware active');
      console.log('      • Project access restrictions');
    }
    
    const text = await response.text();
    console.log(`   Response length: ${text.length} bytes`);
    if (text.length < 500) {
      console.log(`   Response preview: ${text.substring(0, 200)}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test 2: Check if it's a Next.js app
  console.log('\n2️⃣ Testing Next.js Detection');
  try {
    const response = await fetch(DEPLOYMENT_URL + '/_next/static/css/');
    console.log(`   Next.js static assets: ${response.status}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test 3: API endpoint
  console.log('\n3️⃣ Testing API Endpoint');
  try {
    const response = await fetch(DEPLOYMENT_URL + '/api/rag/query', {
      method: 'GET'
    });
    console.log(`   Status: ${response.status}`);
    const text = await response.text();
    console.log(`   Response: ${text.substring(0, 200)}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test 4: Check Vercel deployment info
  console.log('\n4️⃣ Vercel Deployment Info');
  console.log('   Inspect URL: https://vercel.com/thandiai-projects/thandiai/27czw4YtGXpYPrvbYeTs5p9GQEPb');
  console.log('   Dashboard: https://vercel.com/thandiai-projects/thandiai');
  
  console.log('\n📋 Troubleshooting Steps:');
  console.log('   1. Check Vercel Dashboard for deployment status');
  console.log('   2. Verify environment variables are set for Production');
  console.log('   3. Check if password protection is enabled');
  console.log('   4. Review deployment logs for errors');
  console.log('   5. Ensure all required environment variables are present');
  
  console.log('\n🔧 Quick Fixes:');
  console.log('   • Disable password protection: Vercel Dashboard → Settings → Password Protection');
  console.log('   • Check env vars: Vercel Dashboard → Settings → Environment Variables');
  console.log('   • View logs: vercel logs');
  console.log('   • Redeploy: vercel --prod --force');
}

diagnoseDeployment().catch(console.error);