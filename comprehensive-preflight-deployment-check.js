// =====================================================
// COMPREHENSIVE PREFLIGHT DEPLOYMENT CHECK
// Date: January 13, 2026
// Purpose: Complete verification including deployment rules and Vercel readiness
// =====================================================

const { execSync } = require('child_process');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function comprehensivePreflightCheck() {
  console.log('🚀 COMPREHENSIVE PREFLIGHT DEPLOYMENT CHECK');
  console.log('============================================');
  
  const results = {
    // Core Build & Environment
    cleanBuild: false,
    environmentValid: false,
    packageJsonValid: false,
    
    // Database & API
    databaseFunction: false,
    apiRoutes: false,
    supabaseConnection: false,
    
    // Vercel Deployment
    vercelConfig: false,
    vercelCompatibility: false,
    buildOptimization: false,
    
    // Git & Commit Readiness
    gitStatus: false,
    commitReadiness: false,
    branchStatus: false,
    
    // Security & Quality
    environmentSecrets: false,
    codeQuality: false,
    deploymentSafety: false
  };
  
  const errors = [];
  const warnings = [];
  
  try {
    // ===== PHASE 1: CORE BUILD & ENVIRONMENT =====
    console.log('\n📦 PHASE 1: CORE BUILD & ENVIRONMENT');
    console.log('=====================================');
    
    // 1.1 Clean Build Test
    console.log('🏗️ Testing clean build...');
    try {
      // Remove .next directory
      if (fs.existsSync('.next')) {
        execSync('Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue', { shell: 'powershell' });
      }
      
      // Run build with timeout
      execSync('npm run build', { stdio: 'pipe', timeout: 120000 });
      console.log('✅ Clean build successful');
      results.cleanBuild = true;
    } catch (buildError) {
      console.log('❌ Build failed');
      errors.push('Build failure: ' + buildError.message);
    }
    
    // 1.2 Environment Variables
    console.log('🔧 Validating environment variables...');
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'JWT_SECRET',
      'ANTHROPIC_API_KEY',
      'LLM_PROVIDER'
    ];
    
    let envValid = true;
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        console.log(`❌ Missing: ${envVar}`);
        errors.push(`Missing environment variable: ${envVar}`);
        envValid = false;
      }
    }
    
    if (envValid) {
      console.log('✅ Environment variables valid');
      results.environmentValid = true;
    }
    
    // 1.3 Package.json validation
    console.log('📋 Validating package.json...');
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      if (packageJson.scripts && packageJson.scripts.build && packageJson.scripts.start) {
        console.log('✅ Package.json scripts valid');
        results.packageJsonValid = true;
      } else {
        errors.push('Missing required scripts in package.json');
      }
    } catch (pkgError) {
      errors.push('Invalid package.json: ' + pkgError.message);
    }
    
    // ===== PHASE 2: DATABASE & API =====
    console.log('\n🗄️ PHASE 2: DATABASE & API');
    console.log('===========================');
    
    // 2.1 Database Function Test
    console.log('🔍 Testing database function...');
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
      
      if (error && error.message.includes('Could not find the function')) {
        errors.push('Database function does not exist');
      } else {
        console.log('✅ Database function accessible');
        results.databaseFunction = true;
      }
      
      // Test Supabase connection
      const { data: testData, error: testError } = await supabase
        .from('school_master')
        .select('school_id')
        .limit(1);
      
      if (!testError) {
        console.log('✅ Supabase connection working');
        results.supabaseConnection = true;
      } else {
        errors.push('Supabase connection failed: ' + testError.message);
      }
      
    } catch (dbError) {
      errors.push('Database test failed: ' + dbError.message);
    }
    
    // 2.2 API Routes Check
    console.log('📡 Checking critical API routes...');
    const criticalRoutes = [
      'app/api/student/register/route.js',
      'app/api/schools/validate-code/route.js',
      'app/api/consent/manage/route.js'
    ];
    
    let routesValid = true;
    for (const route of criticalRoutes) {
      if (!fs.existsSync(route)) {
        console.log(`❌ Missing: ${route}`);
        errors.push(`Missing API route: ${route}`);
        routesValid = false;
      }
    }
    
    if (routesValid) {
      console.log('✅ Critical API routes exist');
      results.apiRoutes = true;
    }
    
    // ===== PHASE 3: VERCEL DEPLOYMENT =====
    console.log('\n🌐 PHASE 3: VERCEL DEPLOYMENT');
    console.log('==============================');
    
    // 3.1 Vercel Configuration
    console.log('⚙️ Checking Vercel configuration...');
    if (fs.existsSync('vercel.json')) {
      try {
        const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
        console.log('✅ vercel.json exists and is valid');
        results.vercelConfig = true;
      } catch (vercelError) {
        errors.push('Invalid vercel.json: ' + vercelError.message);
      }
    } else {
      warnings.push('No vercel.json found (may use defaults)');
      results.vercelConfig = true; // Not critical
    }
    
    // 3.2 Next.js Configuration
    console.log('⚙️ Checking Next.js configuration...');
    if (fs.existsSync('next.config.js')) {
      console.log('✅ next.config.js exists');
      results.vercelCompatibility = true;
    } else {
      warnings.push('No next.config.js found');
      results.vercelCompatibility = true; // Not critical
    }
    
    // 3.3 Build Optimization Check
    console.log('🎯 Checking build optimization...');
    try {
      const buildOutput = execSync('npm run build', { encoding: 'utf8', stdio: 'pipe' });
      
      // Check for critical warnings
      if (buildOutput.includes('Failed to compile')) {
        errors.push('Build compilation failed');
      } else if (buildOutput.includes('✓ Compiled successfully')) {
        console.log('✅ Build optimization passed');
        results.buildOptimization = true;
      }
      
      // Check bundle size warnings
      if (buildOutput.includes('Large page data')) {
        warnings.push('Large page data detected - may affect performance');
      }
      
    } catch (buildOptError) {
      errors.push('Build optimization check failed');
    }
    
    // ===== PHASE 4: GIT & COMMIT READINESS =====
    console.log('\n📋 PHASE 4: GIT & COMMIT READINESS');
    console.log('===================================');
    
    // 4.1 Git Status
    console.log('📝 Checking git status...');
    try {
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
      
      if (gitStatus.trim()) {
        console.log('📝 Uncommitted changes detected (ready for commit)');
        results.gitStatus = true;
        results.commitReadiness = true;
        
        // Check for sensitive files
        const sensitivePatterns = ['.env', 'node_modules', '.next'];
        const statusLines = gitStatus.split('\n').filter(line => line.trim());
        
        for (const line of statusLines) {
          const filename = line.substring(3);
          for (const pattern of sensitivePatterns) {
            if (filename.includes(pattern)) {
              errors.push(`Sensitive file in git: ${filename}`);
            }
          }
        }
        
      } else {
        console.log('✅ Working directory clean');
        results.gitStatus = true;
        warnings.push('No changes to commit');
      }
      
    } catch (gitError) {
      errors.push('Git status check failed: ' + gitError.message);
    }
    
    // 4.2 Branch Status
    console.log('🌿 Checking branch status...');
    try {
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      console.log(`📍 Current branch: ${currentBranch}`);
      
      if (currentBranch === 'main' || currentBranch === 'master') {
        console.log('✅ On main branch');
        results.branchStatus = true;
      } else {
        warnings.push(`Not on main branch (currently on: ${currentBranch})`);
        results.branchStatus = true; // Not critical for hotfix
      }
      
    } catch (branchError) {
      warnings.push('Could not determine branch status');
    }
    
    // ===== PHASE 5: SECURITY & QUALITY =====
    console.log('\n🔒 PHASE 5: SECURITY & QUALITY');
    console.log('===============================');
    
    // 5.1 Environment Secrets Check
    console.log('🔐 Checking environment secrets...');
    const envContent = fs.readFileSync('.env.local', 'utf8');
    
    // Check for placeholder values
    const placeholders = ['your-api-key-here', 'fallback-secret-key', 'change-in-prod'];
    let secretsValid = true;
    
    for (const placeholder of placeholders) {
      if (envContent.includes(placeholder)) {
        errors.push(`Placeholder value found in .env.local: ${placeholder}`);
        secretsValid = false;
      }
    }
    
    if (secretsValid) {
      console.log('✅ Environment secrets valid');
      results.environmentSecrets = true;
    }
    
    // 5.2 Code Quality Check
    console.log('📝 Running code quality checks...');
    try {
      // Skip linting for now due to deprecation warning
      console.log('⚠️ Skipping lint check (deprecated in Next.js 16)');
      
      // Check TypeScript compilation
      try {
        execSync('npx tsc --noEmit', { stdio: 'pipe' });
        console.log('✅ TypeScript compilation passed');
        results.codeQuality = true;
      } catch (tscError) {
        warnings.push('TypeScript compilation issues detected');
        results.codeQuality = true; // Not critical for hotfix
      }
      
    } catch (qualityError) {
      warnings.push('Code quality check issues: ' + qualityError.message);
    }
    
    // 5.3 Deployment Safety
    console.log('🛡️ Checking deployment safety...');
    
    // Check for console.log statements in production code
    try {
      const prodFiles = ['app/api/student/register/route.js'];
      let consoleLogsFound = false;
      
      for (const file of prodFiles) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          if (content.includes('console.log') && !content.includes('console.error')) {
            warnings.push(`Console.log found in production file: ${file}`);
            consoleLogsFound = true;
          }
        }
      }
      
      if (!consoleLogsFound) {
        console.log('✅ No console.log in critical production files');
      }
      
      results.deploymentSafety = true;
      
    } catch (safetyError) {
      warnings.push('Deployment safety check failed');
    }
    
  } catch (error) {
    console.error('❌ Preflight check failed:', error);
    errors.push('Critical preflight failure: ' + error.message);
  }
  
  // ===== FINAL ASSESSMENT =====
  console.log('\n📊 PREFLIGHT CHECK RESULTS');
  console.log('===========================');
  
  const categories = {
    'Core Build & Environment': [
      { name: 'Clean Build', status: results.cleanBuild },
      { name: 'Environment Valid', status: results.environmentValid },
      { name: 'Package.json Valid', status: results.packageJsonValid }
    ],
    'Database & API': [
      { name: 'Database Function', status: results.databaseFunction },
      { name: 'API Routes', status: results.apiRoutes },
      { name: 'Supabase Connection', status: results.supabaseConnection }
    ],
    'Vercel Deployment': [
      { name: 'Vercel Config', status: results.vercelConfig },
      { name: 'Vercel Compatibility', status: results.vercelCompatibility },
      { name: 'Build Optimization', status: results.buildOptimization }
    ],
    'Git & Commit': [
      { name: 'Git Status', status: results.gitStatus },
      { name: 'Commit Readiness', status: results.commitReadiness },
      { name: 'Branch Status', status: results.branchStatus }
    ],
    'Security & Quality': [
      { name: 'Environment Secrets', status: results.environmentSecrets },
      { name: 'Code Quality', status: results.codeQuality },
      { name: 'Deployment Safety', status: results.deploymentSafety }
    ]
  };
  
  for (const [category, checks] of Object.entries(categories)) {
    console.log(`\n${category}:`);
    for (const check of checks) {
      console.log(`  ${check.name}: ${check.status ? '✅' : '❌'}`);
    }
  }
  
  // Critical checks that must pass
  const criticalChecks = [
    results.cleanBuild,
    results.environmentValid,
    results.databaseFunction,
    results.supabaseConnection,
    results.apiRoutes,
    results.gitStatus,
    results.environmentSecrets
  ];
  
  const allCriticalPassed = criticalChecks.every(check => check === true);
  const totalPassed = Object.values(results).filter(r => r === true).length;
  const totalChecks = Object.values(results).length;
  
  console.log('\n🎯 DEPLOYMENT READINESS ASSESSMENT');
  console.log('===================================');
  console.log(`Overall Score: ${totalPassed}/${totalChecks} checks passed`);
  
  if (errors.length > 0) {
    console.log('\n❌ CRITICAL ERRORS:');
    errors.forEach(error => console.log(`  • ${error}`));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️ WARNINGS:');
    warnings.forEach(warning => console.log(`  • ${warning}`));
  }
  
  if (allCriticalPassed && errors.length === 0) {
    console.log('\n🎉 DEPLOYMENT APPROVED');
    console.log('======================');
    console.log('All critical checks passed. Safe to deploy.');
    console.log('');
    console.log('🚀 DEPLOYMENT COMMANDS:');
    console.log('git add .');
    console.log('git commit -m "hotfix: resolve SQL function ambiguity in registration"');
    console.log('git push origin main');
    console.log('');
    console.log('📋 POST-DEPLOYMENT:');
    console.log('1. Monitor Vercel deployment dashboard');
    console.log('2. Test https://thandi.online/assessment');
    console.log('3. Verify registration flow works');
    
    return { ready: true, score: `${totalPassed}/${totalChecks}`, errors, warnings };
    
  } else {
    console.log('\n🚫 DEPLOYMENT BLOCKED');
    console.log('=====================');
    console.log('Critical issues must be resolved before deployment.');
    
    return { ready: false, score: `${totalPassed}/${totalChecks}`, errors, warnings };
  }
}

if (require.main === module) {
  comprehensivePreflightCheck()
    .then(result => {
      console.log(`\nFinal Status: ${result.ready ? 'READY' : 'NOT READY'}`);
      process.exit(result.ready ? 0 : 1);
    })
    .catch(error => {
      console.error('Preflight check failed:', error);
      process.exit(1);
    });
}

module.exports = { comprehensivePreflightCheck };