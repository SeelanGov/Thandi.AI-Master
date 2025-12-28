#!/usr/bin/env node

/**
 * Vercel Deployment Troubleshooter
 * Comprehensive diagnosis and step-by-step troubleshooting guide
 */

import fs from 'fs';
import { execSync } from 'child_process';

console.log('🔧 VERCEL DEPLOYMENT TROUBLESHOOTER');
console.log('='.repeat(60));

// Step 1: Check local build
console.log('\n📦 Step 1: Testing Local Build');
console.log('This will help identify if the issue is with the code or Vercel');

try {
  console.log('  🔄 Running local build test...');
  const buildOutput = execSync('npm run build', { 
    encoding: 'utf8', 
    timeout: 120000,
    stdio: 'pipe'
  });
  
  console.log('  ✅ Local build successful');
  
  // Check for specific build outputs
  if (buildOutput.includes('Error')) {
    console.log('  ⚠️  Build warnings detected');
  }
  
  // Check if legal routes are generated
  if (fs.existsSync('.next/server/app/legal')) {
    console.log('  ✅ Legal routes generated in build');
  } else {
    console.log('  ❌ Legal routes missing from build');
  }
  
} catch (error) {
  console.log('  ❌ Local build failed!');
  console.log('  📋 Build Error:');
  console.log(error.message.split('\n').map(line => `    ${line}`).join('\n'));
  console.log('\n  🔧 This is likely the root cause of deployment failures');
}

// Step 2: Check critical files
console.log('\n📁 Step 2: Critical Files Check');
const criticalFiles = [
  { path: 'package.json', required: true },
  { path: 'next.config.js', required: true },
  { path: 'vercel.json', required: false },
  { path: 'app/layout.js', required: true },
  { path: 'app/page.js', required: true },
  { path: 'app/components/Footer.jsx', required: true },
  { path: 'app/legal/[slug]/page.jsx', required: true },
  { path: 'legal/privacy-policy.md', required: true }
];

criticalFiles.forEach(file => {
  if (fs.existsSync(file.path)) {
    const stats = fs.statSync(file.path);
    const size = Math.round(stats.size / 1024);
    console.log(`  ✅ ${file.path} (${size}KB)`);
  } else {
    const status = file.required ? '❌ MISSING' : '⚠️  Optional';
    console.log(`  ${status} ${file.path}`);
  }
});

// Step 3: Check environment variables
console.log('\n🔑 Step 3: Environment Variables Check');
const envFile = '.env.local';
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  const envVars = envContent.split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => line.split('=')[0]);
  
  console.log(`  ✅ .env.local exists with ${envVars.length} variables`);
  
  const requiredVars = [
    'GROQ_API_KEY',
    'ANTHROPIC_API_KEY', 
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN'
  ];
  
  requiredVars.forEach(varName => {
    if (envVars.includes(varName)) {
      console.log(`  ✅ ${varName}`);
    } else {
      console.log(`  ❌ ${varName} - MISSING`);
    }
  });
} else {
  console.log('  ❌ .env.local not found');
}

// Step 4: Check Git status
console.log('\n📊 Step 4: Git Status');
try {
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  if (status.trim()) {
    console.log('  ⚠️  Uncommitted changes detected:');
    status.trim().split('\n').forEach(line => {
      console.log(`    ${line}`);
    });
  } else {
    console.log('  ✅ Working directory clean');
  }
  
  const currentCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  console.log(`  📍 Current commit: ${currentCommit.substring(0, 8)}`);
  
} catch (error) {
  console.log('  ❌ Git check failed');
}

// Step 5: Vercel configuration check
console.log('\n⚙️ Step 5: Vercel Configuration');
if (fs.existsSync('vercel.json')) {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  console.log('  ✅ vercel.json exists');
  console.log(`  📋 Configuration:`);
  console.log(JSON.stringify(vercelConfig, null, 4).split('\n').map(line => `    ${line}`).join('\n'));
} else {
  console.log('  ⚠️  No vercel.json (using defaults)');
}

// Step 6: Package.json check
console.log('\n📦 Step 6: Package.json Analysis');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log(`  📋 Name: ${packageJson.name}`);
console.log(`  📋 Version: ${packageJson.version}`);
console.log(`  📋 Type: ${packageJson.type || 'commonjs'}`);

if (packageJson.engines) {
  console.log(`  📋 Node version: ${packageJson.engines.node || 'not specified'}`);
}

// Check for problematic dependencies
const problematicDeps = ['@next/swc-win32-x64-msvc'];
problematicDeps.forEach(dep => {
  if (packageJson.dependencies && packageJson.dependencies[dep]) {
    console.log(`  ⚠️  Potentially problematic dependency: ${dep}`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('🔍 VERCEL DASHBOARD INVESTIGATION GUIDE');
console.log('='.repeat(60));

console.log('\n📋 Step-by-Step Vercel Dashboard Check:');
console.log('');
console.log('1. 🌐 Go to Vercel Dashboard:');
console.log('   https://vercel.com/dashboard');
console.log('');
console.log('2. 🔍 Find Your Project:');
console.log('   • Look for "Thandi.AI-Master" or similar');
console.log('   • Click on the project name');
console.log('');
console.log('3. 📊 Check Deployments Tab:');
console.log('   • Click "Deployments" in the top menu');
console.log('   • Look for recent deployments from commits:');
console.log('     - 26fd5797 (Force fresh deployment v0.1.2)');
console.log('     - eb44dc7c (Footer legal integration)');
console.log('   • Check deployment status (Building, Ready, Error)');
console.log('');
console.log('4. 🔍 Examine Build Logs:');
console.log('   • Click on the most recent deployment');
console.log('   • Click "View Function Logs" or "Build Logs"');
console.log('   • Look for these common errors:');
console.log('     ❌ "Module not found"');
console.log('     ❌ "Build failed"');
console.log('     ❌ "Environment variable missing"');
console.log('     ❌ "Syntax error"');
console.log('     ❌ "Memory limit exceeded"');
console.log('');
console.log('5. ⚙️ Check Settings:');
console.log('   • Click "Settings" tab');
console.log('   • Go to "Environment Variables"');
console.log('   • Verify all required variables are set:');
console.log('     - GROQ_API_KEY');
console.log('     - ANTHROPIC_API_KEY');
console.log('     - NEXT_PUBLIC_SUPABASE_URL');
console.log('     - NEXT_PUBLIC_SUPABASE_ANON_KEY');
console.log('     - UPSTASH_REDIS_REST_URL');
console.log('     - UPSTASH_REDIS_REST_TOKEN');
console.log('');
console.log('6. 🔧 Check Build & Development Settings:');
console.log('   • Framework Preset: Next.js');
console.log('   • Build Command: npm run build (or auto-detected)');
console.log('   • Output Directory: .next (or auto-detected)');
console.log('   • Install Command: npm install (or auto-detected)');
console.log('');

console.log('🚨 COMMON VERCEL DEPLOYMENT ISSUES:');
console.log('');
console.log('Issue 1: Build Timeout');
console.log('  • Symptom: Build stops after 10+ minutes');
console.log('  • Solution: Optimize build, remove large files');
console.log('');
console.log('Issue 2: Environment Variables Missing');
console.log('  • Symptom: Runtime errors, API failures');
console.log('  • Solution: Add missing env vars in Vercel settings');
console.log('');
console.log('Issue 3: Import/Export Errors');
console.log('  • Symptom: "Module not found" or "Cannot resolve"');
console.log('  • Solution: Check file paths, imports, exports');
console.log('');
console.log('Issue 4: Memory Limit Exceeded');
console.log('  • Symptom: Build fails with memory error');
console.log('  • Solution: Upgrade Vercel plan or optimize code');
console.log('');
console.log('Issue 5: Git Integration Broken');
console.log('  • Symptom: New commits not triggering deployments');
console.log('  • Solution: Reconnect GitHub integration');
console.log('');

console.log('🔧 IMMEDIATE ACTIONS TO TRY:');
console.log('');
console.log('Action 1: Force Redeploy');
console.log('  1. Go to Deployments tab');
console.log('  2. Click "..." on latest deployment');
console.log('  3. Click "Redeploy"');
console.log('  4. UNCHECK "Use existing Build Cache"');
console.log('  5. Click "Redeploy"');
console.log('');
console.log('Action 2: Manual Deploy');
console.log('  1. Click "Deploy" button (top right)');
console.log('  2. Select GitHub branch: main');
console.log('  3. Click "Deploy"');
console.log('');
console.log('Action 3: Check Integration');
console.log('  1. Go to Settings → Git');
console.log('  2. Verify GitHub connection');
console.log('  3. Check webhook status');
console.log('');

console.log('📞 WHAT TO REPORT BACK:');
console.log('');
console.log('Please check the Vercel dashboard and report:');
console.log('  1. Latest deployment status (Building/Ready/Error)');
console.log('  2. Any error messages in build logs');
console.log('  3. Environment variables status');
console.log('  4. Git integration status');
console.log('  5. Any specific error codes or messages');
console.log('');
console.log('This information will help identify the exact issue!');

console.log('\n✅ TROUBLESHOOTING GUIDE COMPLETE');
console.log('Check Vercel dashboard and report findings!');