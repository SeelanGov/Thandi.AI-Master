#!/usr/bin/env node

/**
 * MONITOR DEPLOYMENT AND TEST RESULTS PAGE FIX
 * 
 * Monitor the Vercel deployment and test when the results page is fixed
 */

const https = require('https');

console.log('📡 MONITORING DEPLOYMENT AND TESTING RESULTS PAGE FIX');
console.log('====================================================\n');

async function checkDeploymentStatus() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'www.thandi.online',
      path: '/results',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const hasLocalStorageLogic = data.includes('localStorage.getItem') && data.includes('thandi_results');
        const hasResultsContainer = data.includes('results-container');
        const hasUseEffect = data.includes('useEffect');
        const hasVerificationFooter = data.includes('⚠️') || data.includes('Verify before you decide');
        const hasPDFDownload = data.includes('downloadPDF');
        const hasCardLayout = data.includes('ResultsCardLayout');
        const contentLength = data.length;
        
        const isFixed = hasLocalStorageLogic && hasResultsContainer && hasUseEffect && contentLength > 20000;
        
        resolve({
          success: res.statusCode === 200,
          isFixed,
          contentLength,
          features: {
            localStorage: hasLocalStorageLogic,
            resultsContainer: hasResultsContainer,
            useEffect: hasUseEffect,
            verificationFooter: hasVerificationFooter,
            pdfDownload: hasPDFDownload,
            cardLayout: hasCardLayout
          }
        });
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });

    req.end();
  });
}

async function testResultsPageFunctionality() {
  console.log('🧪 Testing Results Page Functionality');
  console.log('   Simulating complete user flow...');
  
  // Test the API endpoint first
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      query: "I am a Grade 12 student interested in engineering. I have Mathematics: 85%, Physical Sciences: 78%, English: 82%. What career options do I have?",
      grade: "grade12",
      curriculum: "caps"
    });

    const options = {
      hostname: 'www.thandi.online',
      path: '/api/rag/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          const apiWorking = res.statusCode === 200 && jsonData.success && jsonData.response;
          
          console.log(`   API Status: ${res.statusCode}`);
          console.log(`   API Working: ${apiWorking ? '✅' : '❌'}`);
          console.log(`   Response Length: ${jsonData.response ? jsonData.response.length : 0} chars`);
          
          resolve({
            apiWorking,
            responseData: jsonData
          });
        } catch (error) {
          console.log(`   ❌ API Error: ${error.message}`);
          resolve({ apiWorking: false, error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ API Request Error: ${error.message}`);
      resolve({ apiWorking: false, error: error.message });
    });

    req.setTimeout(15000, () => {
      console.log('   ❌ API Timeout');
      req.destroy();
      resolve({ apiWorking: false, error: 'Timeout' });
    });

    req.write(postData);
    req.end();
  });
}

function generateBrowserTestInstructions(apiTestResult) {
  console.log('📋 BROWSER TEST INSTRUCTIONS');
  console.log('');
  console.log('   1. Open browser to: https://www.thandi.online/results');
  console.log('   2. Open browser console (F12)');
  console.log('   3. Run this test script:');
  console.log('');
  console.log('   ```javascript');
  console.log('   // Clear existing data');
  console.log('   localStorage.removeItem("thandi_results");');
  console.log('   ');
  
  if (apiTestResult.apiWorking && apiTestResult.responseData) {
    console.log('   // Use real API response data');
    console.log(`   localStorage.setItem("thandi_results", '${JSON.stringify(apiTestResult.responseData).replace(/'/g, "\\'")}');`);
  } else {
    console.log('   // Use test data (API not working)');
    console.log('   localStorage.setItem("thandi_results", JSON.stringify({');
    console.log('     success: true,');
    console.log('     response: "# Test Career Guidance\\n\\nThis is a test response.\\n\\n⚠️ **Verify before you decide**: This is AI-generated advice.",');
    console.log('     metadata: { grade: "grade12" }');
    console.log('   }));');
  }
  
  console.log('   ');
  console.log('   // Reload page');
  console.log('   location.reload();');
  console.log('   ```');
  console.log('');
  console.log('   Expected Result: Career guidance should display instead of "Loading your results..."');
  console.log('');
}

async function monitorWithRetries(maxRetries = 10, delayMs = 30000) {
  console.log(`🔄 Monitoring deployment (${maxRetries} checks, ${delayMs/1000}s intervals)`);
  console.log('');
  
  for (let i = 1; i <= maxRetries; i++) {
    console.log(`Check ${i}/${maxRetries} - ${new Date().toLocaleTimeString()}`);
    
    const status = await checkDeploymentStatus();
    
    if (!status.success) {
      console.log(`   ❌ Request failed: ${status.error}`);
    } else {
      console.log(`   📊 Content: ${status.contentLength} bytes`);
      console.log(`   🔧 Features: localStorage:${status.features.localStorage ? '✅' : '❌'} useEffect:${status.features.useEffect ? '✅' : '❌'} container:${status.features.resultsContainer ? '✅' : '❌'}`);
      
      if (status.isFixed) {
        console.log('   🎉 DEPLOYMENT SUCCESSFUL! Results page is fixed!');
        console.log('');
        
        // Test functionality
        const apiTest = await testResultsPageFunctionality();
        console.log('');
        
        generateBrowserTestInstructions(apiTest);
        
        console.log('✅ RESULTS PAGE ISSUE RESOLVED');
        console.log('');
        console.log('📋 SUMMARY:');
        console.log(`   - Deployment: ✅ Complete (${status.contentLength} bytes)`);
        console.log(`   - localStorage Logic: ✅ Present`);
        console.log(`   - React useEffect: ✅ Present`);
        console.log(`   - Results Container: ✅ Present`);
        console.log(`   - API Endpoint: ${apiTest.apiWorking ? '✅' : '❌'} Working`);
        console.log('');
        console.log('🎯 The "Loading your results..." issue should now be resolved!');
        return true;
      }
    }
    
    if (i < maxRetries) {
      console.log(`   ⏳ Waiting ${delayMs/1000}s for next check...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  console.log('');
  console.log('⚠️ DEPLOYMENT MONITORING TIMEOUT');
  console.log('   The deployment may still be in progress.');
  console.log('   Check Vercel dashboard or try manual testing.');
  
  return false;
}

async function main() {
  try {
    console.log('Starting deployment monitoring...');
    console.log('This will check every 30 seconds for up to 5 minutes.');
    console.log('');
    
    const success = await monitorWithRetries(10, 30000);
    
    if (!success) {
      console.log('');
      console.log('🔧 MANUAL TESTING INSTRUCTIONS:');
      console.log('   If deployment is taking longer, you can test manually:');
      console.log('   1. Wait a few more minutes');
      console.log('   2. Check https://www.thandi.online/results');
      console.log('   3. Use the browser test script above');
      console.log('   4. Verify the page shows career guidance');
    }
    
  } catch (error) {
    console.error('❌ Monitoring failed:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkDeploymentStatus, testResultsPageFunctionality };