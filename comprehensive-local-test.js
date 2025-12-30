#!/usr/bin/env node

/**
 * COMPREHENSIVE LOCAL TEST
 * Test everything locally before any deployment
 */

const { spawn, execSync } = require('child_process');
const http = require('http');
const fs = require('fs');

async function step1_VerifyCodeFixes() {
  console.log('🔍 STEP 1: VERIFYING CODE FIXES');
  console.log('================================');
  
  // Check AssessmentForm.jsx fix
  console.log('\n📄 Checking AssessmentForm.jsx:');
  const assessmentForm = fs.readFileSync('app/assessment/components/AssessmentForm.jsx', 'utf8');
  
  const hasCorrectDefault = assessmentForm.includes('return 0.5; // Default: start with registration');
  const hasOldDefault = assessmentForm.includes('return 0; // Default: start with grade selection');
  
  console.log(`   ✅ Correct default (0.5): ${hasCorrectDefault ? 'Yes' : 'No'}`);
  console.log(`   ❌ Old default (0): ${hasOldDefault ? 'Yes' : 'No'}`);
  
  if (!hasCorrectDefault) {
    console.log('   🔧 FIXING: Setting currentStep default to 0.5');
    // Apply the fix
    const fixed = assessmentForm.replace(
      /return 0; \/\/ Default: start with grade selection/,
      'return 0.5; // Default: start with registration'
    );
    fs.writeFileSync('app/assessment/components/AssessmentForm.jsx', fixed);
    console.log('   ✅ Fixed currentStep default');
  }
  
  // Check BulletproofStudentRegistration.jsx
  console.log('\n📄 Checking BulletproofStudentRegistration.jsx:');
  const registration = fs.readFileSync('components/BulletproofStudentRegistration.jsx', 'utf8');
  
  const hasThandiUI = registration.includes('Thandi') && registration.includes('teal');
  const hasPrivacyNotice = registration.includes('POPIA') && registration.includes('consent');
  const hasFormFields = registration.includes('First Name') && registration.includes('School');
  
  console.log(`   ✅ Thandi UI: ${hasThandiUI ? 'Yes' : 'No'}`);
  console.log(`   ✅ Privacy Notice: ${hasPrivacyNotice ? 'Yes' : 'No'}`);
  console.log(`   ✅ Form Fields: ${hasFormFields ? 'Yes' : 'No'}`);
  
  // Check next.config.js
  console.log('\n📄 Checking next.config.js:');
  const nextConfig = fs.readFileSync('next.config.js', 'utf8');
  
  const isMinimal = !nextConfig.includes('experimental') && !nextConfig.includes('generateBuildId');
  const hasReactStrict = nextConfig.includes('reactStrictMode: true');
  
  console.log(`   ✅ Minimal config: ${isMinimal ? 'Yes' : 'No'}`);
  console.log(`   ✅ React strict mode: ${hasReactStrict ? 'Yes' : 'No'}`);
  
  const allFixesPresent = hasCorrectDefault && hasThandiUI && hasPrivacyNotice && hasFormFields && isMinimal;
  
  console.log(`\n📊 Code Fixes Status: ${allFixesPresent ? '✅ ALL PRESENT' : '❌ MISSING FIXES'}`);
  
  return allFixesPresent;
}

async function step2_TestBuild() {
  console.log('\n🔍 STEP 2: TESTING BUILD');
  console.log('========================');
  
  try {
    console.log('🏗️ Running npm run build...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build successful');
    return true;
  } catch (error) {
    console.log('❌ Build failed');
    console.log(`Error: ${error.message}`);
    return false;
  }
}

async function step3_StartDevServer() {
  console.log('\n🔍 STEP 3: STARTING DEV SERVER');
  console.log('===============================');
  
  return new Promise((resolve) => {
    console.log('🚀 Starting development server...');
    
    const devServer = spawn('npm', ['run', 'dev'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    });
    
    let output = '';
    let serverReady = false;
    
    devServer.stdout.on('data', (data) => {
      output += data.toString();
      console.log(data.toString().trim());
      
      if (data.toString().includes('Ready in') || data.toString().includes('Local:')) {
        serverReady = true;
        setTimeout(() => {
          resolve({ server: devServer, ready: serverReady });
        }, 3000); // Wait 3 seconds after "Ready"
      }
    });
    
    devServer.stderr.on('data', (data) => {
      console.log('Error:', data.toString().trim());
    });
    
    devServer.on('error', (error) => {
      console.log(`❌ Server error: ${error.message}`);
      resolve({ server: null, ready: false });
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      if (!serverReady) {
        console.log('⏰ Server startup timeout');
        devServer.kill();
        resolve({ server: null, ready: false });
      }
    }, 30000);
  });
}

async function step4_TestAssessmentPage(port = 3000) {
  console.log('\n🔍 STEP 4: TESTING ASSESSMENT PAGE');
  console.log('===================================');
  
  // Try multiple ports including 3002
  const ports = [3002, 3001, 3000, port];
  
  for (const testPort of ports) {
    console.log(`🌐 Testing: http://localhost:${testPort}/assessment`);
    
    const result = await new Promise((resolve) => {
      const req = http.get(`http://localhost:${testPort}/assessment`, (res) => {
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
            hasThandiUI: data.includes('Thandi') && data.includes('teal'),
            content: data,
            port: testPort
          });
        });
      });
      req.on('error', () => resolve({ success: false, port: testPort }));
      req.setTimeout(5000, () => {
        req.destroy();
        resolve({ success: false, port: testPort });
      });
    });
    
    if (result.success) {
      console.log(`✅ Connected to port ${testPort}`);
      console.log(`📊 Status: ${result.statusCode}`);
      console.log(`📏 Size: ${result.size} bytes`);
      console.log(`⚛️ Next.js Data: ${result.hasNextData ? 'Yes' : 'No'}`);
      console.log(`💧 React Hydration: ${result.hasReactHydration ? 'Yes' : 'No'}`);
      console.log(`📝 Has Registration: ${result.hasRegistration ? 'Yes' : 'No'}`);
      console.log(`🎯 Has Grade Selector: ${result.hasGradeSelector ? 'Yes' : 'No'}`);
      console.log(`🎨 Has Thandi UI: ${result.hasThandiUI ? 'Yes' : 'No'}`);
      
      return result;
    } else {
      console.log(`❌ Port ${testPort} not responding`);
    }
  }
  
  return { success: false };
}

async function step5_AnalyzeResults(testResult) {
  console.log('\n🔍 STEP 5: ANALYZING RESULTS');
  console.log('=============================');
  
  if (!testResult.success) {
    console.log('❌ CRITICAL: Assessment page not loading');
    return { ready: false, issues: ['Page not loading'] };
  }
  
  const issues = [];
  const successes = [];
  
  // Check React hydration
  if (testResult.hasReactHydration) {
    successes.push('React hydration working');
  } else {
    issues.push('React not hydrating - build configuration issue');
  }
  
  // Check registration form
  if (testResult.hasRegistration && !testResult.hasGradeSelector) {
    successes.push('Registration form showing correctly');
  } else if (testResult.hasGradeSelector) {
    issues.push('Still showing grade selector instead of registration');
  } else {
    issues.push('Neither registration nor grade selector detected');
  }
  
  // Check UI fixes
  if (testResult.hasThandiUI) {
    successes.push('Thandi UI fixes present');
  } else {
    issues.push('Thandi UI fixes not visible');
  }
  
  console.log('\n✅ SUCCESSES:');
  successes.forEach(success => console.log(`   ✅ ${success}`));
  
  console.log('\n❌ ISSUES:');
  issues.forEach(issue => console.log(`   ❌ ${issue}`));
  
  const ready = issues.length === 0;
  
  console.log(`\n📊 OVERALL STATUS: ${ready ? '✅ READY FOR DEPLOYMENT' : '❌ NOT READY'}`);
  
  return { ready, issues, successes };
}

async function main() {
  console.log('🧪 COMPREHENSIVE LOCAL TESTING');
  console.log('===============================');
  console.log(`📅 Started: ${new Date().toISOString()}`);
  console.log('🎯 Goal: Verify everything works locally before deployment');
  
  let devServer = null;
  
  try {
    // Step 1: Verify code fixes
    const codeFixesOk = await step1_VerifyCodeFixes();
    if (!codeFixesOk) {
      console.log('\n❌ STOPPING: Code fixes not complete');
      return false;
    }
    
    // Step 2: Test build
    const buildOk = await step2_TestBuild();
    if (!buildOk) {
      console.log('\n❌ STOPPING: Build failed');
      return false;
    }
    
    // Step 3: Start dev server
    const serverResult = await step3_StartDevServer();
    devServer = serverResult.server;
    
    if (!serverResult.ready) {
      console.log('\n❌ STOPPING: Dev server failed to start');
      return false;
    }
    
    // Step 4: Test assessment page
    const testResult = await step4_TestAssessmentPage();
    
    // Step 5: Analyze results
    const analysis = await step5_AnalyzeResults(testResult);
    
    console.log('\n🎯 FINAL DECISION');
    console.log('=================');
    
    if (analysis.ready) {
      console.log('🎉 SUCCESS: All tests passed locally!');
      console.log('✅ Code fixes verified');
      console.log('✅ Build successful');
      console.log('✅ Dev server working');
      console.log('✅ Registration form showing');
      console.log('✅ React hydration working');
      console.log('✅ UI fixes present');
      console.log('\n🚀 READY FOR VERCEL DEPLOYMENT');
      return true;
    } else {
      console.log('❌ FAILED: Issues found in local testing');
      console.log('\n🔧 ISSUES TO FIX:');
      analysis.issues.forEach(issue => console.log(`   🔧 ${issue}`));
      console.log('\n🛑 DO NOT DEPLOY UNTIL ALL ISSUES RESOLVED');
      return false;
    }
    
  } catch (error) {
    console.log(`\n❌ CRITICAL ERROR: ${error.message}`);
    return false;
  } finally {
    // Clean up dev server
    if (devServer) {
      console.log('\n🧹 Stopping dev server...');
      devServer.kill();
    }
  }
}

// Execute comprehensive test
main().then(success => {
  console.log(`\n📅 Completed: ${new Date().toISOString()}`);
  console.log(`🎯 Status: ${success ? 'READY TO DEPLOY' : 'FIX ISSUES FIRST'}`);
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Critical error:', error.message);
  process.exit(1);
});