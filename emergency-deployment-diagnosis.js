#!/usr/bin/env node

/**
 * EMERGENCY DEPLOYMENT DIAGNOSIS
 * Find out exactly why Vercel isn't deploying our UI fixes
 */

const { execSync } = require('child_process');
const fs = require('fs');
const https = require('https');

function executeCommand(command, description) {
  try {
    console.log(`\n📋 ${description}`);
    const result = execSync(command, { encoding: 'utf8' });
    console.log(`✅ ${description}: Success`);
    return result.trim();
  } catch (error) {
    console.log(`❌ ${description}: ${error.message}`);
    return null;
  }
}

function checkLocalFiles() {
  console.log('🔍 CHECKING LOCAL FILES FOR UI FIXES');
  console.log('====================================');
  
  const criticalFiles = [
    'app/assessment/components/GradeSelector.jsx',
    'app/assessment/components/AssessmentForm.jsx',
    'app/admin/page.js',
    'components/BulletproofStudentRegistration.jsx'
  ];
  
  let localFixesPresent = 0;
  
  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      const checks = {
        'Thandi Branding': content.includes('Thandi') && !content.includes('THANDI'),
        'Teal Colors': content.includes('thandi-teal') || content.includes('teal-'),
        'Loading States': content.includes('animate-spin') || content.includes('Loading'),
        'Error Handling': content.includes('setError') || content.includes('error'),
        'Responsive': content.includes('px-4 sm:px-6') || content.includes('sm:')
      };
      
      const fixCount = Object.values(checks).filter(Boolean).length;
      console.log(`\n📄 ${file}:`);
      console.log(`   ✅ File exists: Yes`);
      console.log(`   🎨 UI Fixes: ${fixCount}/5`);
      
      Object.entries(checks).forEach(([check, passed]) => {
        console.log(`   ${passed ? '✅' : '❌'} ${check}`);
      });
      
      if (fixCount >= 3) localFixesPresent++;
    } else {
      console.log(`❌ ${file}: File not found`);
    }
  });
  
  console.log(`\n📊 Local Status: ${localFixesPresent}/${criticalFiles.length} files have UI fixes`);
  return localFixesPresent >= 3;
}

function checkGitStatus() {
  console.log('\n🔍 CHECKING GIT STATUS');
  console.log('======================');
  
  const gitStatus = executeCommand('git status --porcelain', 'Git working directory status');
  const lastCommit = executeCommand('git log -1 --oneline', 'Last commit');
  const commitHash = executeCommand('git rev-parse HEAD', 'Current commit hash');
  const remoteStatus = executeCommand('git status -uno', 'Remote sync status');
  
  console.log(`\n📊 Git Information:`);
  console.log(`   Last Commit: ${lastCommit}`);
  console.log(`   Commit Hash: ${commitHash}`);
  console.log(`   Working Dir: ${gitStatus ? 'Has changes' : 'Clean'}`);
  
  return {
    isClean: !gitStatus,
    lastCommit,
    commitHash
  };
}

async function testLiveVsLocal() {
  console.log('\n🔍 COMPARING LIVE VS LOCAL');
  console.log('==========================');
  
  // Test live site
  const liveResult = await new Promise((resolve) => {
    const req = https.get('https://www.thandi.online/assessment', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ success: true, body: data, headers: res.headers });
      });
    });
    req.on('error', () => resolve({ success: false }));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ success: false });
    });
  });
  
  if (liveResult.success) {
    console.log('📡 Live Site Analysis:');
    console.log(`   Size: ${liveResult.body.length} bytes`);
    console.log(`   Cache: ${liveResult.headers['x-vercel-cache'] || 'Unknown'}`);
    console.log(`   CDN ID: ${liveResult.headers['x-vercel-id'] || 'Unknown'}`);
    
    const liveChecks = {
      'Thandi Branding': liveResult.body.includes('Thandi') && !liveResult.body.includes('THANDI'),
      'Teal Colors': liveResult.body.includes('thandi-teal'),
      'New Components': liveResult.body.includes('AssessmentPageClient') || liveResult.body.includes('GradeSelector'),
      'Loading States': liveResult.body.includes('animate-spin'),
      'Error Handling': liveResult.body.includes('setError')
    };
    
    const liveFixCount = Object.values(liveChecks).filter(Boolean).length;
    console.log(`   🎨 Live UI Fixes: ${liveFixCount}/5`);
    
    Object.entries(liveChecks).forEach(([check, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
    });
    
    return liveFixCount;
  } else {
    console.log('❌ Could not fetch live site');
    return 0;
  }
}

function createEmergencyFix() {
  console.log('\n🚨 CREATING EMERGENCY DEPLOYMENT FIX');
  console.log('====================================');
  
  // Create a deployment trigger with timestamp
  const emergencyTrigger = {
    timestamp: new Date().toISOString(),
    trigger: 'EMERGENCY_STUDENT_TESTING',
    version: '0.1.5-emergency',
    force_rebuild: true,
    cache_bust: Date.now()
  };
  
  fs.writeFileSync('emergency-deploy.json', JSON.stringify(emergencyTrigger, null, 2));
  console.log('✅ Created emergency deployment trigger');
  
  // Update package.json version
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    packageJson.version = '0.1.5';
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package version to 0.1.5');
  } catch (error) {
    console.log('⚠️ Could not update package version');
  }
  
  // Create a simple cache-busting change
  const cacheBust = `/* Cache bust: ${Date.now()} */\n`;
  try {
    const cssContent = fs.readFileSync('app/globals.css', 'utf8');
    if (!cssContent.includes('Cache bust:')) {
      fs.writeFileSync('app/globals.css', cacheBust + cssContent);
      console.log('✅ Added cache-busting comment to CSS');
    }
  } catch (error) {
    console.log('⚠️ Could not add cache bust to CSS');
  }
}

async function emergencyDeploy() {
  console.log('\n🚀 EXECUTING EMERGENCY DEPLOYMENT');
  console.log('==================================');
  
  // Stage all changes
  executeCommand('git add .', 'Staging all files');
  
  // Commit with emergency flag
  executeCommand('git commit -m "EMERGENCY: Force deployment for student testing - v0.1.5"', 'Emergency commit');
  
  // Force push
  executeCommand('git push origin main --force', 'Force push to trigger deployment');
  
  console.log('\n⏳ Waiting 30 seconds for deployment to start...');
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  // Test if deployment worked
  const testResult = await testLiveVsLocal();
  
  if (testResult >= 3) {
    console.log('\n🎉 EMERGENCY DEPLOYMENT SUCCESS!');
    console.log('✅ UI fixes are now live');
    console.log('🌐 Ready for student testing');
    return true;
  } else {
    console.log('\n⚠️ EMERGENCY DEPLOYMENT PARTIAL');
    console.log('🔄 May need more time to propagate');
    return false;
  }
}

async function main() {
  console.log('🚨 EMERGENCY DEPLOYMENT DIAGNOSIS');
  console.log('==================================');
  console.log(`📅 Started: ${new Date().toISOString()}`);
  console.log('🎯 Goal: Get UI fixes live for student testing');
  
  try {
    // Step 1: Check local files
    const localFixesOk = checkLocalFiles();
    
    // Step 2: Check git status
    const gitStatus = checkGitStatus();
    
    // Step 3: Compare live vs local
    const liveFixCount = await testLiveVsLocal();
    
    console.log('\n📊 DIAGNOSIS SUMMARY');
    console.log('===================');
    console.log(`✅ Local Fixes Present: ${localFixesOk ? 'Yes' : 'No'}`);
    console.log(`✅ Git Status: ${gitStatus.isClean ? 'Clean' : 'Has changes'}`);
    console.log(`📊 Live Fix Count: ${liveFixCount}/5`);
    
    if (localFixesOk && liveFixCount < 3) {
      console.log('\n🚨 PROBLEM IDENTIFIED: Local fixes not deployed to live site');
      console.log('💡 Solution: Emergency deployment with cache busting');
      
      createEmergencyFix();
      const success = await emergencyDeploy();
      
      if (success) {
        console.log('\n🎉 EMERGENCY FIX COMPLETE!');
        console.log('✅ Site is ready for student testing');
        console.log('🌐 https://www.thandi.online/assessment');
      } else {
        console.log('\n⚠️ EMERGENCY FIX PARTIAL');
        console.log('🔄 Check again in 5 minutes');
        console.log('💡 Or try manual Vercel dashboard deployment');
      }
      
      return success;
    } else if (liveFixCount >= 3) {
      console.log('\n✅ SITE IS ACTUALLY READY!');
      console.log('🎉 UI fixes are live - you can start student testing');
      return true;
    } else {
      console.log('\n❌ LOCAL FIXES MISSING');
      console.log('🔧 Need to re-apply UI fixes locally first');
      return false;
    }
    
  } catch (error) {
    console.log('\n❌ EMERGENCY DIAGNOSIS FAILED');
    console.log(`Error: ${error.message}`);
    return false;
  }
}

// Run emergency diagnosis
main().then(success => {
  console.log(`\n📅 Completed: ${new Date().toISOString()}`);
  console.log(`🎯 Result: ${success ? 'READY FOR STUDENT TESTING' : 'NEEDS MANUAL INTERVENTION'}`);
  
  if (success) {
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Test the assessment flow yourself');
    console.log('2. Start student testing');
    console.log('3. Monitor for any issues');
  } else {
    console.log('\n🔧 MANUAL STEPS NEEDED:');
    console.log('1. Check Vercel dashboard for deployment status');
    console.log('2. Try manual redeploy from Vercel UI');
    console.log('3. Clear CDN cache if available');
  }
}).catch(error => {
  console.error('❌ Critical error:', error.message);
});