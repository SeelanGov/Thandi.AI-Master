#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

async function emergencyDeploymentDiagnosis() {
  console.log('🚨 EMERGENCY DEPLOYMENT DIAGNOSIS');
  console.log('=================================\n');
  
  console.log('📊 SITUATION ANALYSIS');
  console.log('=====================');
  console.log('❌ Deployment failed despite all preflight checks passing');
  console.log('⏰ Monday launch at risk');
  console.log('🎯 Need to identify root cause and fix immediately');
  console.log('');
  
  let issues = [];
  
  // Step 1: Check GitHub Status
  console.log('1️⃣ GITHUB REPOSITORY STATUS');
  console.log('============================');
  
  try {
    const gitStatus = execSync('git status', { encoding: 'utf8' });
    console.log('Git Status:');
    console.log(gitStatus);
    
    const lastCommit = execSync('git log --oneline -1', { encoding: 'utf8' });
    console.log(`Last Commit: ${lastCommit.trim()}`);
    
    const remoteBranch = execSync('git ls-remote origin main', { encoding: 'utf8' });
    console.log(`Remote Main: ${remoteBranch.trim()}`);
    
    // Check if local and remote are in sync
    const localCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    const remoteCommit = remoteBranch.split('\t')[0];
    
    if (localCommit === remoteCommit) {
      console.log('✅ Local and remote are in sync');
    } else {
      console.log('❌ Local and remote are out of sync');
      issues.push('Git sync issue');
    }
    
  } catch (error) {
    console.log(`❌ Git check failed: ${error.message}`);
    issues.push('Git status check failed');
  }
  
  // Step 2: Verify Critical Files
  console.log('\n2️⃣ CRITICAL FILES VERIFICATION');
  console.log('==============================');
  
  const criticalFiles = [
    { path: 'vercel.json', description: 'Vercel configuration' },
    { path: 'package.json', description: 'Package configuration' },
    { path: 'next.config.js', description: 'Next.js configuration' },
    { path: 'components/BulletproofStudentRegistration.jsx', description: 'Registration component' },
    { path: 'app/assessment/page.jsx', description: 'Assessment page' }
  ];
  
  criticalFiles.forEach(({ path, description }) => {
    if (fs.existsSync(path)) {
      console.log(`✅ ${description}: ${path}`);
      
      // Check file content for critical patterns
      const content = fs.readFileSync(path, 'utf8');
      
      if (path === 'vercel.json') {
        try {
          const config = JSON.parse(content);
          console.log(`   Build Command: ${config.buildCommand}`);
          console.log(`   Install Command: ${config.installCommand}`);
          console.log(`   Framework: ${config.framework}`);
          
          if (config.buildCommand !== 'npm run build') {
            console.log('   ❌ Wrong build command');
            issues.push('Incorrect vercel.json build command');
          }
          if (config.installCommand !== 'npm install --legacy-peer-deps') {
            console.log('   ❌ Wrong install command');
            issues.push('Incorrect vercel.json install command');
          }
        } catch (e) {
          console.log('   ❌ Invalid JSON');
          issues.push('Invalid vercel.json format');
        }
      }
      
      if (path === 'package.json') {
        try {
          const pkg = JSON.parse(content);
          console.log(`   Build Script: ${pkg.scripts.build}`);
          if (pkg.scripts.build !== 'next build') {
            console.log('   ❌ Wrong build script');
            issues.push('Incorrect package.json build script');
          }
        } catch (e) {
          console.log('   ❌ Invalid JSON');
          issues.push('Invalid package.json format');
        }
      }
      
    } else {
      console.log(`❌ ${description}: MISSING - ${path}`);
      issues.push(`Missing file: ${path}`);
    }
  });
  
  // Step 3: Check Vercel CLI Status
  console.log('\n3️⃣ VERCEL CLI DIAGNOSIS');
  console.log('========================');
  
  try {
    console.log('🔍 Checking Vercel authentication...');
    const whoami = execSync('vercel whoami', { encoding: 'utf8' });
    console.log(`✅ Logged in as: ${whoami.trim()}`);
    
    console.log('\n🔍 Getting latest deployments...');
    const deployments = execSync('vercel ls --limit=5', { encoding: 'utf8' });
    console.log('Recent deployments:');
    console.log(deployments);
    
    console.log('\n🔍 Getting project info...');
    const projectInfo = execSync('vercel project ls', { encoding: 'utf8' });
    console.log('Projects:');
    console.log(projectInfo);
    
  } catch (error) {
    console.log(`❌ Vercel CLI error: ${error.message}`);
    issues.push('Vercel CLI authentication or access issue');
  }
  
  // Step 4: Test Local Build
  console.log('\n4️⃣ LOCAL BUILD VERIFICATION');
  console.log('============================');
  
  try {
    console.log('🔨 Testing local build...');
    const buildOutput = execSync('npm run build', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (buildOutput.includes('✓ Compiled successfully')) {
      console.log('✅ Local build successful');
    } else {
      console.log('❌ Local build has issues');
      console.log(buildOutput);
      issues.push('Local build issues');
    }
    
  } catch (error) {
    console.log(`❌ Local build failed: ${error.message}`);
    issues.push('Local build failed');
  }
  
  // Step 5: Check Environment Variables
  console.log('\n5️⃣ ENVIRONMENT VARIABLES CHECK');
  console.log('==============================');
  
  if (fs.existsSync('.env.local')) {
    console.log('✅ .env.local exists');
    const envContent = fs.readFileSync('.env.local', 'utf8');
    
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'JWT_SECRET'
    ];
    
    requiredVars.forEach(varName => {
      if (envContent.includes(varName)) {
        console.log(`✅ ${varName} present`);
      } else {
        console.log(`❌ ${varName} missing`);
        issues.push(`Missing environment variable: ${varName}`);
      }
    });
  } else {
    console.log('❌ .env.local missing');
    issues.push('Missing .env.local file');
  }
  
  // Step 6: Check for Common Deployment Blockers
  console.log('\n6️⃣ DEPLOYMENT BLOCKER ANALYSIS');
  console.log('===============================');
  
  // Check for large files
  try {
    const largeFiles = execSync('find . -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | xargs ls -la | awk \'$5 > 1000000\' || true', { 
      encoding: 'utf8' 
    });
    
    if (largeFiles.trim()) {
      console.log('⚠️  Large files detected:');
      console.log(largeFiles);
    } else {
      console.log('✅ No unusually large files');
    }
  } catch (error) {
    console.log('Could not check file sizes');
  }
  
  // Check node_modules
  if (fs.existsSync('node_modules')) {
    console.log('✅ node_modules exists');
  } else {
    console.log('❌ node_modules missing');
    issues.push('node_modules missing');
  }
  
  // Check package-lock.json
  if (fs.existsSync('package-lock.json')) {
    console.log('✅ package-lock.json exists');
  } else {
    console.log('❌ package-lock.json missing');
    issues.push('package-lock.json missing');
  }
  
  // Step 7: Manual Vercel Deployment Test
  console.log('\n7️⃣ MANUAL DEPLOYMENT TEST');
  console.log('=========================');
  
  try {
    console.log('🚀 Attempting manual Vercel deployment...');
    console.log('This will show us the exact error...');
    
    // This will show us what's actually failing
    const deployResult = execSync('vercel --prod --yes', { 
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 120000 // 2 minute timeout
    });
    
    console.log('✅ Manual deployment successful!');
    console.log(deployResult);
    
  } catch (error) {
    console.log('❌ Manual deployment failed');
    console.log('Error output:');
    console.log(error.stdout || error.message);
    console.log('Error details:');
    console.log(error.stderr || 'No stderr');
    
    // This is the critical information we need
    issues.push(`Deployment error: ${error.message}`);
  }
  
  // Final Analysis
  console.log('\n📊 EMERGENCY DIAGNOSIS RESULTS');
  console.log('==============================');
  
  if (issues.length === 0) {
    console.log('🎉 NO CRITICAL ISSUES FOUND');
    console.log('The deployment should be working. Check Vercel dashboard for status.');
  } else {
    console.log(`🚨 ${issues.length} CRITICAL ISSUE(S) IDENTIFIED`);
    console.log('');
    console.log('🔧 BLOCKING ISSUES:');
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }
  
  console.log('\n🎯 IMMEDIATE ACTION PLAN');
  console.log('=======================');
  
  if (issues.length > 0) {
    console.log('1. Fix the issues listed above');
    console.log('2. Test local build again');
    console.log('3. Commit and push fixes');
    console.log('4. Monitor Vercel deployment');
  } else {
    console.log('1. Check Vercel dashboard for deployment status');
    console.log('2. Look for specific error messages in build logs');
    console.log('3. Verify environment variables in Vercel settings');
    console.log('4. Check if deployment is actually successful but taking time');
  }
  
  console.log('\n📞 NEXT STEPS FOR MONDAY LAUNCH');
  console.log('===============================');
  console.log('1. Resolve deployment issues immediately');
  console.log('2. Test live site thoroughly once deployed');
  console.log('3. Have backup plan ready if needed');
  console.log('4. Monitor system closely during launch');
  
  return issues.length === 0;
}

emergencyDeploymentDiagnosis().catch(error => {
  console.error('Emergency diagnosis failed:', error);
  process.exit(1);
});