#!/usr/bin/env node

const { execSync } = require('child_process');

function checkVercelDeploymentLogs() {
  console.log('🔍 CHECKING VERCEL DEPLOYMENT LOGS');
  console.log('==================================\n');
  
  console.log('📋 Step 1: Check if Vercel CLI is available...');
  
  try {
    // Check if vercel CLI is installed
    execSync('vercel --version', { stdio: 'pipe' });
    console.log('✅ Vercel CLI is available');
    
    console.log('\n📋 Step 2: Get deployment list...');
    
    try {
      const deployments = execSync('vercel ls --scope=team_thandi', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      console.log('Recent deployments:');
      console.log(deployments);
    } catch (error) {
      console.log('⚠️  Could not get deployment list with team scope, trying without...');
      
      try {
        const deployments = execSync('vercel ls', { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
        console.log('Recent deployments:');
        console.log(deployments);
      } catch (error2) {
        console.log('❌ Could not get deployment list:', error2.message);
      }
    }
    
    console.log('\n📋 Step 3: Check latest deployment logs...');
    
    try {
      const logs = execSync('vercel logs --follow=false', { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 10000
      });
      console.log('Latest deployment logs:');
      console.log(logs);
    } catch (error) {
      console.log('❌ Could not get deployment logs:', error.message);
    }
    
  } catch (error) {
    console.log('❌ Vercel CLI not available');
    console.log('Installing Vercel CLI...');
    
    try {
      execSync('npm install -g vercel', { stdio: 'inherit' });
      console.log('✅ Vercel CLI installed');
      
      console.log('\n📋 Please run: vercel login');
      console.log('Then run this script again');
      
    } catch (installError) {
      console.log('❌ Could not install Vercel CLI');
      console.log('\n📋 MANUAL STEPS TO CHECK DEPLOYMENT:');
      console.log('===================================');
      console.log('1. Go to: https://vercel.com/dashboard');
      console.log('2. Find your Thandi project');
      console.log('3. Click on the latest deployment');
      console.log('4. Check the "Build Logs" tab');
      console.log('5. Look for any errors or failures');
      
      console.log('\n🔍 WHAT TO LOOK FOR:');
      console.log('====================');
      console.log('✅ Build completed successfully');
      console.log('✅ No TypeScript/JavaScript errors');
      console.log('✅ No missing dependencies');
      console.log('❌ Build failed or timed out');
      console.log('❌ Syntax errors in our changes');
      console.log('❌ Import/export errors');
    }
  }
  
  console.log('\n📋 Step 4: Check local build...');
  
  try {
    console.log('Testing local build to check for errors...');
    
    // Try a quick syntax check
    execSync('npm run build', { 
      stdio: 'pipe',
      timeout: 60000
    });
    
    console.log('✅ Local build successful');
    console.log('This means our code is syntactically correct');
    
  } catch (buildError) {
    console.log('❌ Local build failed');
    console.log('Build error:', buildError.message);
    
    if (buildError.stdout) {
      console.log('Build stdout:', buildError.stdout.toString());
    }
    if (buildError.stderr) {
      console.log('Build stderr:', buildError.stderr.toString());
    }
    
    console.log('\n🎯 BUILD ISSUE DETECTED');
    console.log('======================');
    console.log('Our changes have syntax errors that prevent building.');
    console.log('This explains why the deployment failed.');
    console.log('We need to fix the build errors before redeploying.');
  }
  
  console.log('\n📋 Step 5: Alternative deployment check...');
  
  // Check if we can see the deployment status via GitHub
  console.log('Check GitHub Actions or Vercel integration:');
  console.log('1. Go to: https://github.com/SeelanGov/Thandi.AI-Master/actions');
  console.log('2. Look for failed workflows');
  console.log('3. Check Vercel bot comments on recent commits');
  
  console.log('\n🎯 SUMMARY');
  console.log('==========');
  console.log('If local build fails: Fix syntax errors first');
  console.log('If local build succeeds: Check Vercel dashboard for deployment issues');
  console.log('If Vercel shows success but code not deployed: Caching issue');
}

checkVercelDeploymentLogs();