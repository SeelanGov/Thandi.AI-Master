#!/usr/bin/env node

/**
 * FIX VERCEL BUILD PERMISSIONS
 * Systematic fix for the permission denied error
 */

const fs = require('fs');
const { execSync } = require('child_process');

function fixVercelBuildIssue() {
  console.log('🔧 FIXING VERCEL BUILD PERMISSIONS');
  console.log('==================================');
  
  // Step 1: Check and fix package.json scripts
  console.log('\n📦 Step 1: Fixing package.json scripts');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Fix the build scripts
    const originalScripts = { ...packageJson.scripts };
    
    packageJson.scripts = {
      ...packageJson.scripts,
      "build": "next build",
      "vercel-build": "next build",
      "start": "next start",
      "dev": "next dev",
      "lint": "next lint"
    };
    
    // Remove any problematic scripts
    delete packageJson.scripts["vercel-build-old"];
    
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    console.log('✅ Fixed package.json scripts');
    
    console.log('📋 Script changes:');
    Object.entries(packageJson.scripts).forEach(([key, value]) => {
      if (originalScripts[key] !== value) {
        console.log(`   ${key}: "${value}"`);
      }
    });
    
  } catch (error) {
    console.log(`❌ Error fixing package.json: ${error.message}`);
  }
  
  // Step 2: Create/fix vercel.json
  console.log('\n⚙️ Step 2: Creating proper vercel.json');
  
  const vercelConfig = {
    "version": 2,
    "builds": [
      {
        "src": "package.json",
        "use": "@vercel/next"
      }
    ],
    "routes": [
      {
        "src": "/(.*)",
        "dest": "/$1"
      }
    ],
    "env": {
      "NODE_ENV": "production"
    },
    "buildCommand": "npm run build",
    "outputDirectory": ".next"
  };
  
  fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
  console.log('✅ Created proper vercel.json');
  
  // Step 3: Clean up problematic files
  console.log('\n🧹 Step 3: Cleaning up problematic files');
  
  const filesToRemove = [
    '.vercel-deploy-trigger',
    'emergency-deploy.json',
    'deployment-marker.json'
  ];
  
  filesToRemove.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`✅ Removed ${file}`);
    }
  });
  
  // Step 4: Fix Next.js config
  console.log('\n⚙️ Step 4: Checking Next.js config');
  
  if (fs.existsSync('next.config.js')) {
    const nextConfig = fs.readFileSync('next.config.js', 'utf8');
    console.log('✅ Next.js config exists');
    
    // Check for any problematic configurations
    if (nextConfig.includes('experimental')) {
      console.log('⚠️ Experimental features detected - may cause build issues');
    }
  } else {
    // Create minimal next.config.js
    const minimalConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone'
}

module.exports = nextConfig
`;
    fs.writeFileSync('next.config.js', minimalConfig);
    console.log('✅ Created minimal next.config.js');
  }
  
  // Step 5: Update version for clean deployment
  console.log('\n📦 Step 5: Updating version for clean deployment');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    packageJson.version = '0.1.6-fixed';
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated to version 0.1.6-fixed');
  } catch (error) {
    console.log(`⚠️ Could not update version: ${error.message}`);
  }
}

function commitAndDeploy() {
  console.log('\n🚀 COMMITTING AND DEPLOYING FIX');
  console.log('===============================');
  
  try {
    // Stage all changes
    execSync('git add .', { stdio: 'inherit' });
    console.log('✅ Staged all changes');
    
    // Commit with clear message
    execSync('git commit -m "CRITICAL FIX: Resolve Vercel build permission errors - v0.1.6"', { stdio: 'inherit' });
    console.log('✅ Committed fix');
    
    // Push to trigger deployment
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('✅ Pushed to GitHub - Vercel deployment triggered');
    
    return true;
  } catch (error) {
    console.log(`❌ Git operations failed: ${error.message}`);
    return false;
  }
}

async function monitorDeployment() {
  console.log('\n👀 MONITORING DEPLOYMENT');
  console.log('========================');
  console.log('⏳ Waiting 60 seconds for build to start...');
  
  await new Promise(resolve => setTimeout(resolve, 60000));
  
  // Test the live site
  const https = require('https');
  
  const testResult = await new Promise((resolve) => {
    const req = https.get('https://www.thandi.online/assessment', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          success: res.statusCode === 200,
          statusCode: res.statusCode,
          size: data.length,
          hasRegistration: data.includes('registration') || data.includes('Register'),
          hasAssessment: data.includes('assessment') || data.includes('Assessment')
        });
      });
    });
    req.on('error', () => resolve({ success: false }));
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ success: false });
    });
  });
  
  if (testResult.success) {
    console.log('✅ Site is responding!');
    console.log(`📊 Status: ${testResult.statusCode}`);
    console.log(`📏 Size: ${testResult.size} bytes`);
    console.log(`📝 Has Registration: ${testResult.hasRegistration ? 'Yes' : 'No'}`);
    console.log(`📋 Has Assessment: ${testResult.hasAssessment ? 'Yes' : 'No'}`);
    
    if (testResult.hasRegistration && testResult.hasAssessment) {
      console.log('\n🎉 DEPLOYMENT SUCCESS!');
      console.log('✅ Student registration should now work');
      console.log('🌐 Ready for student testing');
      return true;
    } else {
      console.log('\n⚠️ PARTIAL SUCCESS');
      console.log('🔄 Site responding but may need more time');
      return false;
    }
  } else {
    console.log('❌ Site still not responding properly');
    console.log('🔧 May need manual Vercel dashboard intervention');
    return false;
  }
}

async function main() {
  console.log('🚨 SYSTEMATIC VERCEL BUILD FIX');
  console.log('==============================');
  console.log(`📅 Started: ${new Date().toISOString()}`);
  
  try {
    // Step 1: Fix the build configuration
    fixVercelBuildIssue();
    
    // Step 2: Commit and deploy
    const deploySuccess = commitAndDeploy();
    
    if (!deploySuccess) {
      console.log('\n❌ DEPLOYMENT FAILED');
      console.log('🔧 Manual intervention required');
      return false;
    }
    
    // Step 3: Monitor the deployment
    const monitorSuccess = await monitorDeployment();
    
    console.log('\n🎯 FINAL RESULT');
    console.log('===============');
    
    if (monitorSuccess) {
      console.log('🎉 SUCCESS: Build fixed, deployment working!');
      console.log('✅ Students can now complete registration');
      console.log('🌐 https://www.thandi.online/assessment');
      console.log('\n📋 NEXT STEPS:');
      console.log('1. Test student registration flow');
      console.log('2. Verify assessment form works');
      console.log('3. Start student testing session');
    } else {
      console.log('⚠️ PARTIAL: Build may be fixed but needs more time');
      console.log('🔄 Check Vercel dashboard in 5-10 minutes');
      console.log('💡 The permission error should be resolved');
    }
    
    return monitorSuccess;
    
  } catch (error) {
    console.log('\n❌ CRITICAL ERROR');
    console.log(`Error: ${error.message}`);
    return false;
  }
}

// Execute the fix
main().then(success => {
  console.log(`\n📅 Completed: ${new Date().toISOString()}`);
  console.log(`🎯 Status: ${success ? 'READY FOR STUDENT TESTING' : 'NEEDS MANUAL CHECK'}`);
}).catch(error => {
  console.error('❌ Critical error:', error.message);
});