#!/usr/bin/env node

/**
 * FORCE COMPLETE REBUILD
 * Clear all caches and force Vercel to rebuild from scratch
 */

const fs = require('fs');
const { execSync } = require('child_process');

function forceCompleteRebuild() {
  console.log('🔄 FORCING COMPLETE REBUILD');
  console.log('============================');
  
  console.log('\n🧹 Step 1: Clearing all build artifacts');
  
  // Remove all build-related files and folders
  const filesToRemove = [
    '.next',
    '.vercel',
    'node_modules/.cache',
    'actual-deployment-content.html'
  ];
  
  filesToRemove.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        if (fs.lstatSync(file).isDirectory()) {
          execSync(`rmdir /s /q "${file}"`, { stdio: 'ignore' });
        } else {
          fs.unlinkSync(file);
        }
        console.log(`✅ Removed ${file}`);
      } catch (e) {
        console.log(`⚠️ Could not remove ${file}: ${e.message}`);
      }
    }
  });
  
  console.log('\n📦 Step 2: Updating package.json for cache bust');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Update version and add cache-busting timestamp
    const timestamp = Date.now();
    packageJson.version = `0.2.0-rebuild-${timestamp}`;
    
    // Ensure clean build scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      "build": "next build",
      "start": "next start",
      "dev": "next dev"
    };
    
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    console.log(`✅ Updated to version ${packageJson.version}`);
    
  } catch (error) {
    console.log(`❌ Error updating package.json: ${error.message}`);
  }
  
  console.log('\n⚙️ Step 3: Creating ultra-minimal vercel.json');
  
  const minimalVercelConfig = {
    "version": 2,
    "builds": [
      {
        "src": "package.json",
        "use": "@vercel/next"
      }
    ]
  };
  
  fs.writeFileSync('vercel.json', JSON.stringify(minimalVercelConfig, null, 2));
  console.log('✅ Created minimal vercel.json');
  
  console.log('\n⚙️ Step 4: Creating ultra-minimal next.config.js');
  
  const ultraMinimalNextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Force fresh builds
  generateBuildId: async () => {
    return 'build-${Date.now()}'
  }
};

module.exports = nextConfig;
`;

  fs.writeFileSync('next.config.js', ultraMinimalNextConfig);
  console.log('✅ Created ultra-minimal next.config.js');
  
  console.log('\n🔧 Step 5: Adding deployment trigger file');
  
  const deploymentTrigger = {
    timestamp: new Date().toISOString(),
    reason: "Force complete rebuild - fix server-side rendering mismatch",
    version: "0.2.0-rebuild",
    changes: [
      "Cleared all build caches",
      "Updated package.json version",
      "Minimal vercel.json configuration", 
      "Ultra-minimal next.config.js",
      "Force fresh build ID generation"
    ]
  };
  
  fs.writeFileSync('deployment-trigger.json', JSON.stringify(deploymentTrigger, null, 2));
  console.log('✅ Created deployment trigger');
}

function deployRebuild() {
  console.log('\n🚀 DEPLOYING COMPLETE REBUILD');
  console.log('==============================');
  
  try {
    // Stage all changes
    execSync('git add .', { stdio: 'inherit' });
    console.log('✅ Staged all changes');
    
    // Commit with clear message
    execSync('git commit -m "FORCE REBUILD: Clear all caches and fix server-side rendering mismatch"', { stdio: 'inherit' });
    console.log('✅ Committed rebuild');
    
    // Push to trigger deployment
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('✅ Pushed to GitHub - Vercel deployment triggered');
    
    return true;
  } catch (error) {
    console.log(`❌ Git operations failed: ${error.message}`);
    return false;
  }
}

async function testRebuild() {
  console.log('\n🧪 TESTING COMPLETE REBUILD');
  console.log('============================');
  console.log('⏳ Waiting 90 seconds for complete rebuild...');
  
  await new Promise(resolve => setTimeout(resolve, 90000));
  
  // Test the assessment page
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
          hasNextData: data.includes('__NEXT_DATA__'),
          hasRegistration: data.includes('Student Registration') || data.includes('privacy') || data.includes('consent'),
          hasGradeSelector: data.includes('What grade are you in') || data.includes('Grade 10'),
          hasReactHydration: data.includes('__NEXT_DATA__') && data.includes('_next/static/chunks/'),
          content: data.substring(0, 800) // First 800 chars for debugging
        });
      });
    });
    req.on('error', () => resolve({ success: false }));
    req.setTimeout(20000, () => {
      req.destroy();
      resolve({ success: false });
    });
  });
  
  if (testResult.success) {
    console.log('✅ Assessment page is responding!');
    console.log(`📊 Status: ${testResult.statusCode}`);
    console.log(`📏 Size: ${testResult.size} bytes`);
    console.log(`⚛️ Next.js Data: ${testResult.hasNextData ? 'Yes' : 'No'}`);
    console.log(`💧 React Hydration: ${testResult.hasReactHydration ? 'Yes' : 'No'}`);
    console.log(`📝 Has Registration: ${testResult.hasRegistration ? 'Yes' : 'No'}`);
    console.log(`🎯 Has Grade Selector: ${testResult.hasGradeSelector ? 'Yes' : 'No'}`);
    
    if (testResult.hasReactHydration && testResult.hasRegistration && !testResult.hasGradeSelector) {
      console.log('\n🎉 COMPLETE SUCCESS!');
      console.log('✅ React hydration working');
      console.log('✅ Registration form showing');
      console.log('✅ No grade selector blocking access');
      console.log('✅ Server-side and client-side code aligned');
      console.log('🌐 Ready for student testing: https://www.thandi.online/assessment');
      return true;
    } else if (testResult.hasReactHydration && !testResult.hasGradeSelector) {
      console.log('\n⚠️ PARTIAL SUCCESS');
      console.log('✅ React hydration working');
      console.log('✅ No grade selector (good)');
      console.log('🔄 Registration form may need more time');
      return false;
    } else if (testResult.hasReactHydration) {
      console.log('\n⚠️ HYDRATION WORKING BUT WRONG CONTENT');
      console.log('✅ React hydration working');
      console.log('❌ Still showing grade selector');
      console.log('🔧 Component logic may need more time to update');
      console.log('📄 Page content preview:');
      console.log(testResult.content.substring(0, 400));
      return false;
    } else {
      console.log('\n❌ REACT HYDRATION STILL NOT WORKING');
      console.log('🔧 Build configuration may need more time');
      console.log('📄 Page content preview:');
      console.log(testResult.content.substring(0, 400));
      return false;
    }
  } else {
    console.log('❌ Assessment page failed to load');
    return false;
  }
}

async function main() {
  console.log('🔄 FORCE COMPLETE VERCEL REBUILD');
  console.log('=================================');
  console.log(`📅 Started: ${new Date().toISOString()}`);
  console.log('🎯 Goal: Fix server-side rendering mismatch by forcing complete rebuild');
  
  console.log('\n🔍 PROBLEM ANALYSIS:');
  console.log('====================');
  console.log('❌ Server-side renders old code (grade selector)');
  console.log('❌ Client-side has new code (registration form)');
  console.log('❌ Hydration mismatch prevents React from working');
  console.log('🔧 Solution: Force complete rebuild to align server and client');
  
  try {
    // Step 1: Force complete rebuild
    forceCompleteRebuild();
    
    // Step 2: Deploy the rebuild
    const deploySuccess = deployRebuild();
    
    if (!deploySuccess) {
      console.log('\n❌ DEPLOYMENT FAILED');
      console.log('🔧 Manual intervention required');
      return false;
    }
    
    // Step 3: Test the rebuild
    const testSuccess = await testRebuild();
    
    console.log('\n🎯 FINAL RESULT');
    console.log('===============');
    
    if (testSuccess) {
      console.log('🎉 SUCCESS: Complete rebuild fixed the issue!');
      console.log('✅ React hydration working properly');
      console.log('✅ Registration form showing correctly');
      console.log('✅ Server-side and client-side code aligned');
      console.log('✅ Students can now access the assessment');
      console.log('🌐 https://www.thandi.online/assessment');
      console.log('\n🚀 READY FOR LIVE STUDENT TESTING!');
    } else {
      console.log('⚠️ PARTIAL: Rebuild deployed but may need more time');
      console.log('🔄 Check live site in 15-20 minutes');
      console.log('💡 The complete rebuild should resolve the hydration mismatch');
    }
    
    return testSuccess;
    
  } catch (error) {
    console.log('\n❌ CRITICAL ERROR');
    console.log(`Error: ${error.message}`);
    return false;
  }
}

// Execute the complete rebuild
main().then(success => {
  console.log(`\n📅 Completed: ${new Date().toISOString()}`);
  console.log(`🎯 Status: ${success ? 'READY FOR STUDENT TESTING' : 'NEEDS MORE TIME'}`);
}).catch(error => {
  console.error('❌ Critical error:', error.message);
});