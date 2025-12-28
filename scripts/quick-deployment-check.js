#!/usr/bin/env node

/**
 * Quick Deployment Check
 * Simple verification of deployment status
 */

console.log('🔍 Quick Deployment Check\n');

const DEPLOYMENT_URL = 'https://thandiai-1xrwjs0dk-thandiai-projects.vercel.app';

async function quickCheck() {
  try {
    console.log(`🌐 Testing: ${DEPLOYMENT_URL}`);
    
    // Test landing page
    const response = await fetch(DEPLOYMENT_URL);
    console.log(`📱 Landing page: ${response.status} ${response.ok ? '✅' : '❌'}`);
    
    if (response.ok) {
      const html = await response.text();
      const hasThandi = html.includes('THANDI') || html.includes('thandi');
      console.log(`🎨 THANDI branding: ${hasThandi ? '✅' : '❌'}`);
      console.log(`📏 Page size: ${(html.length / 1024).toFixed(2)} KB`);
    }
    
    // Test assessment page
    const assessmentResponse = await fetch(`${DEPLOYMENT_URL}/assessment`);
    console.log(`📝 Assessment page: ${assessmentResponse.status} ${assessmentResponse.ok ? '✅' : '❌'}`);
    
    // Test API
    const apiResponse = await fetch(`${DEPLOYMENT_URL}/api/rag/query`);
    console.log(`🔌 RAG API: ${apiResponse.status} ${apiResponse.ok ? '✅' : '❌'}`);
    
    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      console.log(`📊 API response: ${Object.keys(apiData).join(', ')}`);
    }
    
    console.log('\n✅ Quick check completed successfully!');
    
  } catch (error) {
    console.error('❌ Quick check failed:', error.message);
  }
}

quickCheck();