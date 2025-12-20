#!/usr/bin/env node

/**
 * Diagnose Deployment Failure
 * Checks for common deployment issues and provides solutions
 */

import fs from 'fs';
import { execSync } from 'child_process';

console.log('🔍 Diagnosing Deployment Failure');
console.log('='.repeat(50));

// 1. Check Git Status
console.log('📋 1. Checking Git Status...');
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  if (gitStatus.trim()) {
    console.log('⚠️  Uncommitted changes found:');
    console.log(gitStatus);
    console.log('   Solution: Commit all changes before deployment');
  } else {
    console.log('✅ Git working directory is clean');
  }
} catch (error) {
  console.log('❌ Git status check failed:', error.message);
}

// 2. Check Package.json
console.log('\n📦 2. Checking package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Check build script
  if (packageJson.scripts?.build) {
    console.log('✅ Build script found:', packageJson.scripts.build);
  } else {
    console.log('❌ No build script found in package.json');
  }
  
  // Check start script
  if (packageJson.scripts?.start) {
    console.log('✅ Start script found:', packageJson.scripts.start);
  } else {
    console.log('❌ No start script found in package.json');
  }
  
  // Check Node version
  if (packageJson.engines?.node) {
    console.log('✅ Node version specified:', packageJson.engines.node);
  } else {
    console.log('⚠️  No Node version specified in engines');
  }
  
} catch (error) {
  console.log('❌ Package.json check failed:', error.message);
}

// 3. Check Next.js Config
console.log('\n⚙️  3. Checking Next.js configuration...');
try {
  if (fs.existsSync('next.config.js')) {
    const configContent = fs.readFileSync('next.config.js', 'utf8');
    console.log('✅ next.config.js found');
    
    // Check for experimental features that might cause issues
    if (configContent.includes('experimental')) {
      console.log('⚠️  Experimental features detected - may cause deployment issues');
      if (configContent.includes('esmExternals')) {
        console.log('   - esmExternals found (known to cause warnings)');
      }
    }
  } else {
    console.log('ℹ️  No next.config.js found (using defaults)');
  }
} catch (error) {
  console.log('❌ Next.js config check failed:', error.message);
}

// 4. Check Environment Variables
console.log('\n🔐 4. Checking environment variables...');
try {
  const envExample = fs.existsSync('.env.example');
  const envLocal = fs.existsSync('.env.local');
  const envProduction = fs.existsSync('.env.production.example');
  
  console.log(`✅ .env.example: ${envExample ? 'Found' : 'Missing'}`);
  console.log(`✅ .env.local: ${envLocal ? 'Found' : 'Missing'}`);
  console.log(`✅ .env.production.example: ${envProduction ? 'Found' : 'Missing'}`);
  
  if (envLocal) {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const requiredVars = [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'GROQ_API_KEY',
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN'
    ];
    
    requiredVars.forEach(varName => {
      if (envContent.includes(varName)) {
        console.log(`   ✅ ${varName}: Present`);
      } else {
        console.log(`   ❌ ${varName}: Missing`);
      }
    });
  }
} catch (error) {
  console.log('❌ Environment variables check failed:', error.message);
}

// 5. Check File Syntax
console.log('\n📝 5. Checking critical file syntax...');
const criticalFiles = [
  'app/api/rag/query/route.js',
  'lib/matching/program-matcher.js',
  'app/results/page.jsx',
  'app/assessment/page.jsx'
];

criticalFiles.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Basic syntax checks
      const issues = [];
      
      // Check for unmatched brackets
      const openBrackets = (content.match(/\{/g) || []).length;
      const closeBrackets = (content.match(/\}/g) || []).length;
      if (openBrackets !== closeBrackets) {
        issues.push(`Unmatched brackets: ${openBrackets} open, ${closeBrackets} close`);
      }
      
      // Check for unmatched parentheses
      const openParens = (content.match(/\(/g) || []).length;
      const closeParens = (content.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        issues.push(`Unmatched parentheses: ${openParens} open, ${closeParens} close`);
      }
      
      // Check for unterminated strings
      const singleQuotes = (content.match(/'/g) || []).length;
      const doubleQuotes = (content.match(/"/g) || []).length;
      const backticks = (content.match(/`/g) || []).length;
      
      if (singleQuotes % 2 !== 0) issues.push('Unterminated single quotes');
      if (doubleQuotes % 2 !== 0) issues.push('Unterminated double quotes');
      if (backticks % 2 !== 0) issues.push('Unterminated template literals');
      
      if (issues.length === 0) {
        console.log(`   ✅ ${file}: Syntax OK`);
      } else {
        console.log(`   ❌ ${file}: Issues found`);
        issues.forEach(issue => console.log(`      - ${issue}`));
      }
    } else {
      console.log(`   ⚠️  ${file}: File not found`);
    }
  } catch (error) {
    console.log(`   ❌ ${file}: Check failed - ${error.message}`);
  }
});

// 6. Check Dependencies
console.log('\n📚 6. Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = Object.keys(packageJson.dependencies || {});
  const devDependencies = Object.keys(packageJson.devDependencies || {});
  
  console.log(`✅ Dependencies: ${dependencies.length} packages`);
  console.log(`✅ Dev Dependencies: ${devDependencies.length} packages`);
  
  // Check for common problematic packages
  const problematicPackages = ['node-fetch', '@upstash/redis'];
  problematicPackages.forEach(pkg => {
    if (dependencies.includes(pkg)) {
      console.log(`   ⚠️  ${pkg}: May cause ESM issues`);
    }
  });
  
} catch (error) {
  console.log('❌ Dependencies check failed:', error.message);
}

// 7. Test Local Build
console.log('\n🏗️  7. Testing local build...');
try {
  console.log('   Running npm run build...');
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ Local build successful');
} catch (error) {
  console.log('❌ Local build failed:');
  console.log(error.stdout?.toString() || error.message);
}

// 8. Deployment Recommendations
console.log('\n💡 8. Deployment Recommendations');
console.log('='.repeat(30));

console.log('🔧 Common Solutions:');
console.log('1. Clear Vercel cache: vercel --prod --force');
console.log('2. Check Vercel environment variables match .env.local');
console.log('3. Ensure all dependencies are in package.json');
console.log('4. Remove experimental features from next.config.js');
console.log('5. Check Vercel function timeout limits');

console.log('\n📋 Deployment Checklist:');
console.log('□ All changes committed and pushed');
console.log('□ Environment variables set in Vercel dashboard');
console.log('□ Build script works locally');
console.log('□ No syntax errors in critical files');
console.log('□ Dependencies properly installed');

console.log('\n🚀 Next Steps:');
console.log('1. Fix any issues found above');
console.log('2. Commit and push changes');
console.log('3. Check Vercel dashboard for deployment logs');
console.log('4. Test deployment with: node test-final-deployment-readiness.js');

console.log('\n✅ Diagnosis complete!');