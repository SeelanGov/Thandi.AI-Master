#!/usr/bin/env node

/**
 * FORCE FRESH VERCEL DEPLOYMENT - JAN 13 2026
 * 
 * Force a fresh Vercel deployment to resolve cache issues
 * Based on systematic troubleshooting approach
 */

const { execSync } = require('child_process');

async function forceFreshDeployment() {
  console.log('🚀 FORCING FRESH VERCEL DEPLOYMENT');
  console.log('='.repeat(60));
  
  try {
    // Step 1: Verify local build works
    console.log('1️⃣ Verifying local build...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Local build successful');
    
    // Step 2: Check Git status
    console.log('\n2️⃣ Checking Git status...');
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    if (gitStatus.trim()) {
      console.log('📝 Uncommitted changes detected, committing...');
      execSync('git add .', { stdio: 'inherit' });
      execSync('git commit -m "fix: force fresh deployment to resolve cache issues"', { stdio: 'inherit' });
    }
    console.log('✅ Git status clean');
    
    // Step 3: Force push to trigger deployment
    console.log('\n3️⃣ Triggering fresh deployment...');
    execSync('git push origin main --force-with-lease', { stdio: 'inherit' });
    console.log('✅ Deployment triggered');
    
    // Step 4: Monitor deployment
    console.log('\n4️⃣ Monitoring deployment status...');
    console.log('⏳ Waiting 30 seconds for deployment to start...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Check deployment status
    const deployments = execSync('vercel ls', { encoding: 'utf8' });
    console.log('\n📊 Latest deployments:');
    console.log(deployments.split('\n').slice(0, 5).join('\n'));
    
    console.log('\n5️⃣ Testing endpoints in 60 seconds...');
    await new Promise(resolve => setTimeout(resolve, 60000));
    
    // Test endpoints
    console.log('\n🧪 Testing Phase 0 endpoints...');
    execSync('node check-deployment-status-jan-13.js', { stdio: 'inherit' });
    
    console.log('\n✅ Fresh deployment process completed!');
    console.log('💡 If endpoints still show 404, wait 2-3 more minutes for CDN propagation');
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check Vercel dashboard for build errors');
    console.log('2. Verify environment variables are set');
    console.log('3. Check for any breaking changes in recent commits');
    console.log('4. Consider rolling back to last working deployment');
    throw error;
  }
}

// Execute
forceFreshDeployment().catch(console.error);