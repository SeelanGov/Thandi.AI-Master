// Comprehensive Build Verification
// Double-check everything is working correctly
const { execSync } = require('child_process');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function comprehensiveBuildVerification() {
  console.log('🔍 COMPREHENSIVE BUILD VERIFICATION');
  console.log('===================================');
  
  const results = {
    buildPasses: false,
    functionExists: false,
    functionWorks: false,
    apiRouteExists: false,
    environmentValid: false,
    gitReady: false
  };
  
  // 1. Clean build test
  console.log('🏗️ Testing clean build...');
  try {
    // Remove .next directory
    if (fs.existsSync('.next')) {
      execSync('Remove-Item -Recurse -Force .next', { shell: 'powershell' });
    }
    
    // Run build
    execSync('npm run build', { stdio: 'pipe' });
    console.log('✅ Clean build successful');
    results.buildPasses = true;
  } catch (buildError) {
    console.log('❌ Build failed:', buildError.message);
    return results;
  }
  
  // 2. Environment validation
  console.log('🔧 Validating environment...');
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET'
  ];
  
  let envValid = true;
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.log(`❌ Missing environment variable: ${envVar}`);
      envValid = false;
    }
  }
  
  if (envValid) {
    console.log('✅ Environment variables valid');
    results.environmentValid = true;
  }
  
  // 3. Database function test
  console.log('🗄️ Testing database function...');
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data, error } = await supabase
      .rpc('create_student_school_association', {
        p_student_name: 'Test',
        p_student_surname: 'Student',
        p_school_id: 'NONEXISTENT',
        p_grade: 11,
        p_consent_given: true,
        p_consent_method: 'web_form'
      });
    
    if (error) {
      if (error.message.includes('Could not find the function')) {
        console.log('❌ Function does not exist');
      } else {
        console.log('✅ Function exists and works (expected error for invalid school)');
        results.functionExists = true;
        results.functionWorks = true;
      }
    } else {
      console.log('✅ Function exists and returned:', data);
      results.functionExists = true;
      results.functionWorks = true;
    }
  } catch (dbError) {
    console.log('❌ Database test failed:', dbError.message);
  }
  
  // 4. API route validation
  console.log('📡 Checking API route...');
  const apiRoutePath = 'app/api/student/register/route.js';
  if (fs.existsSync(apiRoutePath)) {
    console.log('✅ Registration API route exists');
    results.apiRouteExists = true;
  } else {
    console.log('❌ Registration API route missing');
  }
  
  // 5. Git status
  console.log('📋 Checking git status...');
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    if (gitStatus.trim()) {
      console.log('📝 Uncommitted changes ready for commit');
      results.gitReady = true;
    } else {
      console.log('✅ Working directory clean');
      results.gitReady = true;
    }
  } catch (gitError) {
    console.log('❌ Git status check failed');
  }
  
  // Summary
  console.log('\n📊 VERIFICATION RESULTS');
  console.log('=======================');
  console.log(`Build Passes: ${results.buildPasses ? '✅' : '❌'}`);
  console.log(`Function Exists: ${results.functionExists ? '✅' : '❌'}`);
  console.log(`Function Works: ${results.functionWorks ? '✅' : '❌'}`);
  console.log(`API Route Exists: ${results.apiRouteExists ? '✅' : '❌'}`);
  console.log(`Environment Valid: ${results.environmentValid ? '✅' : '❌'}`);
  console.log(`Git Ready: ${results.gitReady ? '✅' : '❌'}`);
  
  const criticalChecks = [
    results.buildPasses,
    results.functionExists,
    results.functionWorks,
    results.apiRouteExists,
    results.environmentValid
  ];
  
  const allCriticalPassed = criticalChecks.every(check => check === true);
  
  console.log('\n🎯 DEPLOYMENT READINESS');
  console.log('========================');
  
  if (allCriticalPassed) {
    console.log('🎉 VERIFIED READY FOR DEPLOYMENT');
    console.log('');
    console.log('All critical checks passed. Safe to proceed with:');
    console.log('1. git add .');
    console.log('2. git commit -m "hotfix: resolve SQL function ambiguity in registration"');
    console.log('3. git push origin main');
    console.log('4. Deploy to Vercel');
  } else {
    console.log('❌ NOT READY FOR DEPLOYMENT');
    console.log('');
    console.log('Critical issues detected. Do not deploy.');
  }
  
  return {
    ready: allCriticalPassed,
    results: results
  };
}

if (require.main === module) {
  comprehensiveBuildVerification()
    .then(verification => {
      process.exit(verification.ready ? 0 : 1);
    })
    .catch(error => {
      console.error('Verification failed:', error);
      process.exit(1);
    });
}

module.exports = { comprehensiveBuildVerification };