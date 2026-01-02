#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

async function comprehensivePreflightChecks() {
  console.log('🚀 COMPREHENSIVE PREFLIGHT CHECKS');
  console.log('=================================\n');
  
  let criticalIssues = 0;
  let warnings = 0;
  let blockers = [];
  
  console.log('📋 PRE-COMMIT VERIFICATION CHECKLIST');
  console.log('====================================');
  
  // Check 1: Git Status and Staging
  console.log('\n1️⃣ GIT STATUS AND STAGING');
  console.log('==========================');
  
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    const modifiedFiles = gitStatus.split('\n').filter(line => line.trim());
    
    if (modifiedFiles.length > 0) {
      console.log(`📝 ${modifiedFiles.length} files have changes:`);
      modifiedFiles.forEach(file => {
        if (file.trim()) {
          console.log(`   ${file}`);
        }
      });
      
      // Check for critical files
      const criticalFiles = [
        'components/BulletproofStudentRegistration.jsx',
        'vercel.json',
        'app/assessment/grade/[grade]/page.jsx'
      ];
      
      const modifiedCriticalFiles = criticalFiles.filter(file => 
        modifiedFiles.some(modFile => modFile.includes(file))
      );
      
      if (modifiedCriticalFiles.length > 0) {
        console.log('✅ Critical files modified (expected)');
      }
      
    } else {
      console.log('⚠️  No changes detected - this might be unexpected');
      warnings++;
    }
    
    // Check current branch
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    console.log(`📍 Current branch: ${currentBranch}`);
    
    if (currentBranch !== 'main') {
      console.log('⚠️  Not on main branch - ensure this is intentional');
      warnings++;
    }
    
  } catch (error) {
    console.log(`❌ Git status check failed: ${error.message}`);
    criticalIssues++;
    blockers.push('Git status check failed');
  }
  
  // Check 2: Build Verification
  console.log('\n2️⃣ BUILD VERIFICATION');
  console.log('=====================');
  
  try {
    console.log('🔨 Running production build...');
    const buildOutput = execSync('npm run build', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (buildOutput.includes('✓ Compiled successfully')) {
      console.log('✅ Build successful');
      
      // Check build size
      if (buildOutput.includes('First Load JS')) {
        console.log('✅ Build output includes bundle analysis');
      }
      
      // Check for warnings
      if (buildOutput.includes('⚠')) {
        console.log('⚠️  Build warnings present (non-critical)');
        warnings++;
      }
      
    } else {
      console.log('❌ Build may have issues');
      criticalIssues++;
      blockers.push('Build verification failed');
    }
    
  } catch (error) {
    console.log(`❌ Build failed: ${error.message}`);
    criticalIssues++;
    blockers.push('Build failed');
  }
  
  // Check 3: Configuration Files
  console.log('\n3️⃣ CONFIGURATION FILES');
  console.log('======================');
  
  try {
    // Check vercel.json
    console.log('📋 Verifying vercel.json...');
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    
    const expectedVercelConfig = {
      buildCommand: 'npm run build',
      installCommand: 'npm install --legacy-peer-deps',
      framework: 'nextjs'
    };
    
    let vercelConfigCorrect = true;
    Object.keys(expectedVercelConfig).forEach(key => {
      if (vercelConfig[key] !== expectedVercelConfig[key]) {
        console.log(`❌ vercel.json ${key}: Expected "${expectedVercelConfig[key]}", got "${vercelConfig[key]}"`);
        vercelConfigCorrect = false;
        criticalIssues++;
      }
    });
    
    if (vercelConfigCorrect) {
      console.log('✅ vercel.json configuration correct');
    } else {
      blockers.push('Incorrect vercel.json configuration');
    }
    
    // Check package.json
    console.log('📋 Verifying package.json...');
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    if (packageJson.scripts.build === 'next build') {
      console.log('✅ package.json build script correct');
    } else {
      console.log(`❌ package.json build script incorrect: ${packageJson.scripts.build}`);
      criticalIssues++;
      blockers.push('Incorrect package.json build script');
    }
    
    // Check for required dependencies
    const requiredDeps = ['next', 'react', 'react-dom', '@supabase/supabase-js'];
    const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
    
    if (missingDeps.length === 0) {
      console.log('✅ All required dependencies present');
    } else {
      console.log(`❌ Missing dependencies: ${missingDeps.join(', ')}`);
      criticalIssues++;
      blockers.push('Missing required dependencies');
    }
    
  } catch (error) {
    console.log(`❌ Configuration check failed: ${error.message}`);
    criticalIssues++;
    blockers.push('Configuration file check failed');
  }
  
  // Check 4: Critical Component Integrity
  console.log('\n4️⃣ CRITICAL COMPONENT INTEGRITY');
  console.log('===============================');
  
  try {
    // Check BulletproofStudentRegistration
    console.log('📋 Verifying BulletproofStudentRegistration.jsx...');
    const regComponent = fs.readFileSync('components/BulletproofStudentRegistration.jsx', 'utf8');
    
    const requiredPatterns = [
      { pattern: /onClick=\{.*\}/, description: 'onClick event handlers' },
      { pattern: /🎯 School selected:/, description: 'Enhanced debugging' },
      { pattern: /assessment-title/, description: 'Thandi branding classes' },
      { pattern: /preventDefault\(\)/, description: 'Proper event handling' },
      { pattern: /setStudentData/, description: 'State management' }
    ];
    
    let componentIntegrityGood = true;
    requiredPatterns.forEach(({ pattern, description }) => {
      if (pattern.test(regComponent)) {
        console.log(`   ✅ ${description} present`);
      } else {
        console.log(`   ❌ ${description} missing`);
        componentIntegrityGood = false;
        criticalIssues++;
      }
    });
    
    if (!componentIntegrityGood) {
      blockers.push('Registration component integrity issues');
    }
    
    // Check assessment page
    console.log('📋 Verifying assessment page...');
    const assessmentPage = fs.readFileSync('app/assessment/page.jsx', 'utf8');
    
    if (assessmentPage.includes('BulletproofStudentRegistration')) {
      console.log('   ✅ Registration component imported');
    } else {
      console.log('   ❌ Registration component not imported');
      criticalIssues++;
      blockers.push('Assessment page missing registration component');
    }
    
  } catch (error) {
    console.log(`❌ Component integrity check failed: ${error.message}`);
    criticalIssues++;
    blockers.push('Component integrity check failed');
  }
  
  // Check 5: Environment Variables
  console.log('\n5️⃣ ENVIRONMENT VARIABLES');
  console.log('========================');
  
  try {
    console.log('📋 Checking environment configuration...');
    
    // Check .env.local exists
    if (fs.existsSync('.env.local')) {
      console.log('✅ .env.local file exists');
      
      const envContent = fs.readFileSync('.env.local', 'utf8');
      const requiredEnvVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY',
        'JWT_SECRET'
      ];
      
      let envVarsPresent = true;
      requiredEnvVars.forEach(envVar => {
        if (envContent.includes(envVar)) {
          console.log(`   ✅ ${envVar} configured`);
        } else {
          console.log(`   ❌ ${envVar} missing`);
          envVarsPresent = false;
          criticalIssues++;
        }
      });
      
      if (!envVarsPresent) {
        blockers.push('Missing required environment variables');
      }
      
    } else {
      console.log('⚠️  .env.local file not found');
      warnings++;
    }
    
    // Check .env.example exists for reference
    if (fs.existsSync('.env.example')) {
      console.log('✅ .env.example file exists for reference');
    } else {
      console.log('⚠️  .env.example file missing');
      warnings++;
    }
    
  } catch (error) {
    console.log(`❌ Environment check failed: ${error.message}`);
    criticalIssues++;
  }
  
  // Check 6: Security and Best Practices
  console.log('\n6️⃣ SECURITY AND BEST PRACTICES');
  console.log('==============================');
  
  try {
    console.log('📋 Security checks...');
    
    // Check for sensitive data in code
    const sensitivePatterns = [
      { pattern: /password\s*=\s*["'][^"']+["']/, file: 'hardcoded passwords' },
      { pattern: /api[_-]?key\s*=\s*["'][^"']+["']/, file: 'hardcoded API keys' },
      { pattern: /secret\s*=\s*["'][^"']+["']/, file: 'hardcoded secrets' }
    ];
    
    let securityIssuesFound = false;
    
    // Check main component files
    const filesToCheck = [
      'components/BulletproofStudentRegistration.jsx',
      'app/api/student/register/route.js',
      'app/api/schools/search/route.js'
    ];
    
    filesToCheck.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        sensitivePatterns.forEach(({ pattern, file }) => {
          if (pattern.test(content)) {
            console.log(`   ❌ Potential security issue in ${filePath}: ${file}`);
            securityIssuesFound = true;
            criticalIssues++;
          }
        });
      }
    });
    
    if (!securityIssuesFound) {
      console.log('✅ No obvious security issues found');
    } else {
      blockers.push('Security issues detected');
    }
    
    // Check for console.log statements (should be minimal in production)
    const regComponent = fs.readFileSync('components/BulletproofStudentRegistration.jsx', 'utf8');
    const consoleLogCount = (regComponent.match(/console\.log/g) || []).length;
    
    if (consoleLogCount > 0) {
      console.log(`⚠️  ${consoleLogCount} console.log statements found (debugging)`);
      warnings++;
    }
    
  } catch (error) {
    console.log(`❌ Security check failed: ${error.message}`);
    criticalIssues++;
  }
  
  // Check 7: File Structure and Dependencies
  console.log('\n7️⃣ FILE STRUCTURE AND DEPENDENCIES');
  console.log('==================================');
  
  try {
    console.log('📋 Checking critical file structure...');
    
    const criticalFiles = [
      'components/BulletproofStudentRegistration.jsx',
      'app/assessment/page.jsx',
      'app/assessment/grade/[grade]/page.jsx',
      'app/api/student/register/route.js',
      'app/api/schools/search/route.js',
      'vercel.json',
      'package.json',
      'next.config.js'
    ];
    
    let missingFiles = [];
    criticalFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`   ✅ ${file}`);
      } else {
        console.log(`   ❌ ${file} missing`);
        missingFiles.push(file);
        criticalIssues++;
      }
    });
    
    if (missingFiles.length > 0) {
      blockers.push(`Missing critical files: ${missingFiles.join(', ')}`);
    }
    
    // Check node_modules
    if (fs.existsSync('node_modules')) {
      console.log('✅ node_modules directory exists');
    } else {
      console.log('❌ node_modules missing - run npm install');
      criticalIssues++;
      blockers.push('node_modules missing');
    }
    
  } catch (error) {
    console.log(`❌ File structure check failed: ${error.message}`);
    criticalIssues++;
  }
  
  // Final Assessment
  console.log('\n📊 PREFLIGHT CHECK RESULTS');
  console.log('==========================');
  
  if (criticalIssues === 0) {
    console.log('🎉 ALL PREFLIGHT CHECKS PASSED!');
    console.log('');
    console.log('✅ READY FOR COMMIT AND DEPLOYMENT');
    console.log('==================================');
    console.log('✅ Build successful');
    console.log('✅ Configuration correct');
    console.log('✅ Component integrity verified');
    console.log('✅ No critical security issues');
    console.log('✅ File structure intact');
    
    if (warnings > 0) {
      console.log(`\n⚠️  ${warnings} warning(s) detected (non-blocking)`);
    }
    
    console.log('\n🚀 COMMIT COMMANDS:');
    console.log('==================');
    console.log('git add .');
    console.log('git commit -m "Fix school selection UI and Vercel deployment configuration"');
    console.log('git push origin main');
    
    console.log('\n📋 POST-DEPLOYMENT MONITORING:');
    console.log('==============================');
    console.log('1. Monitor Vercel deployment logs');
    console.log('2. Test live registration flow');
    console.log('3. Verify school selection works');
    console.log('4. Check all grade assessments');
    
    return true;
    
  } else {
    console.log(`❌ ${criticalIssues} CRITICAL ISSUE(S) FOUND`);
    console.log('🚫 DO NOT COMMIT UNTIL ISSUES ARE RESOLVED');
    console.log('');
    console.log('🔧 BLOCKING ISSUES:');
    console.log('==================');
    blockers.forEach((blocker, index) => {
      console.log(`${index + 1}. ${blocker}`);
    });
    
    if (warnings > 0) {
      console.log(`\n⚠️  ${warnings} warning(s) also detected`);
    }
    
    console.log('\n📋 REQUIRED ACTIONS:');
    console.log('====================');
    console.log('1. Fix all critical issues listed above');
    console.log('2. Re-run preflight checks');
    console.log('3. Only commit when all checks pass');
    
    return false;
  }
}

// Run preflight checks
comprehensivePreflightChecks().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Preflight checks failed:', error);
  process.exit(1);
});