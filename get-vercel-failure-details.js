#!/usr/bin/env node

const { execSync } = require('child_process');

function getVercelFailureDetails() {
  console.log('🔍 GETTING VERCEL FAILURE DETAILS');
  console.log('==================================\n');
  
  console.log('📧 Vercel email notification received: DEPLOYMENT FAILED');
  console.log('This matches the pattern from previous deployment issues.\n');
  
  try {
    console.log('📋 Step 1: Get latest deployment status...');
    
    const deployments = execSync('vercel ls --limit=5', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log('Recent deployments:');
    console.log(deployments);
    
    console.log('\n📋 Step 2: Get specific deployment logs...');
    
    // Try to get logs for the latest deployment
    try {
      const logs = execSync('vercel logs', { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 10000
      });
      
      console.log('Latest deployment logs:');
      console.log(logs);
      
    } catch (logError) {
      console.log('❌ Could not get deployment logs automatically');
      console.log('Error:', logError.message);
    }
    
  } catch (error) {
    console.log('❌ Vercel CLI error:', error.message);
  }
  
  console.log('\n📋 Step 3: Check build status manually...');
  console.log('==========================================');
  console.log('Please check Vercel dashboard manually:');
  console.log('1. Go to: https://vercel.com/dashboard');
  console.log('2. Find your Thandi project');
  console.log('3. Click on the latest (failed) deployment');
  console.log('4. Check the "Build Logs" tab');
  console.log('5. Look for the specific error message');
  
  console.log('\n🔍 EXPECTED ERROR PATTERNS:');
  console.log('===========================');
  console.log('Based on previous failures, likely errors:');
  console.log('');
  console.log('❌ PATTERN 1: Permission Error');
  console.log('   "sh: line 1: /vercel/path0/node_modules/.bin/next: Permission denied"');
  console.log('   Exit code: 126');
  console.log('   Solution: Build configuration issue');
  console.log('');
  console.log('❌ PATTERN 2: Build Timeout');
  console.log('   "Build exceeded maximum duration"');
  console.log('   Solution: Code complexity or infinite loops');
  console.log('');
  console.log('❌ PATTERN 3: Dependency Issues');
  console.log('   "Module not found" or "Cannot resolve"');
  console.log('   Solution: Missing dependencies or import errors');
  console.log('');
  console.log('❌ PATTERN 4: Environment Variables');
  console.log('   "Missing required environment variable"');
  console.log('   Solution: Check Vercel environment settings');
  
  console.log('\n🔧 IMMEDIATE ACTIONS:');
  console.log('=====================');
  console.log('1. Get the exact error message from Vercel dashboard');
  console.log('2. Compare with previous error patterns');
  console.log('3. Apply the specific fix for that error type');
  console.log('4. Do NOT attempt another deployment until we know the cause');
  
  console.log('\n📞 NEXT STEPS:');
  console.log('==============');
  console.log('Please share:');
  console.log('1. Screenshot of Vercel build logs');
  console.log('2. Exact error message from the failed deployment');
  console.log('3. Build duration (if shown)');
  console.log('');
  console.log('This will help identify the specific issue and apply the right fix.');
  
  console.log('\n⚠️  IMPORTANT:');
  console.log('==============');
  console.log('Do not attempt force deployments or multiple retries.');
  console.log('Each failure creates more noise and makes diagnosis harder.');
  console.log('We need to fix the root cause first.');
}

getVercelFailureDetails();