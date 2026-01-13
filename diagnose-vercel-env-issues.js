#!/usr/bin/env node

/**
 * DIAGNOSE VERCEL ENVIRONMENT ISSUES
 * 
 * Check for missing environment variables that might cause build failures
 */

const { execSync } = require('child_process');

function checkEnvironmentVariables() {
  console.log('🔍 DIAGNOSING VERCEL ENVIRONMENT ISSUES');
  console.log('='.repeat(60));
  
  const requiredEnvVars = [
    'DATABASE_URL',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'ANTHROPIC_API_KEY',
    'GROQ_API_KEY',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN'
  ];
  
  console.log('📋 Required Environment Variables:');
  let missingVars = [];
  
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    const status = value ? '✅' : '❌';
    const length = value ? `(${value.length} chars)` : '(missing)';
    console.log(`  ${status} ${envVar} ${length}`);
    
    if (!value) {
      missingVars.push(envVar);
    }
  }
  
  console.log('\n📊 Environment Status:');
  console.log(`  Total variables: ${requiredEnvVars.length}`);
  console.log(`  Present: ${requiredEnvVars.length - missingVars.length}`);
  console.log(`  Missing: ${missingVars.length}`);
  
  if (missingVars.length > 0) {
    console.log('\n❌ MISSING ENVIRONMENT VARIABLES:');
    for (const envVar of missingVars) {
      console.log(`  • ${envVar}`);
    }
    
    console.log('\n🔧 SOLUTION:');
    console.log('1. Set missing environment variables in Vercel dashboard');
    console.log('2. Or run: vercel env add <VAR_NAME>');
    console.log('3. Redeploy after setting variables');
    
    return false;
  }
  
  console.log('\n✅ All required environment variables are present');
  return true;
}

function checkVercelProject() {
  console.log('\n🔍 Checking Vercel project configuration...');
  
  try {
    const projectInfo = execSync('vercel project ls', { encoding: 'utf8' });
    console.log('✅ Vercel project accessible');
    
    // Check if we can list environment variables
    try {
      const envList = execSync('vercel env ls', { encoding: 'utf8' });
      console.log('✅ Environment variables accessible');
      console.log('\n📋 Vercel Environment Variables:');
      console.log(envList);
    } catch (error) {
      console.log('⚠️ Cannot access Vercel environment variables');
      console.log('Run: vercel env ls to check manually');
    }
    
  } catch (error) {
    console.log('❌ Vercel project not accessible');
    console.log('Run: vercel link to connect project');
  }
}

function suggestSolutions() {
  console.log('\n💡 TROUBLESHOOTING STEPS:');
  console.log('1. Check Vercel dashboard for build logs');
  console.log('2. Verify all environment variables are set in Vercel');
  console.log('3. Check for any breaking changes in recent commits');
  console.log('4. Try deploying from a clean branch');
  console.log('5. Check Vercel function limits and quotas');
  
  console.log('\n🔧 QUICK FIXES:');
  console.log('• vercel env add MISSING_VAR_NAME');
  console.log('• vercel --prod --force');
  console.log('• git revert HEAD~1 (if recent commit broke build)');
}

// Execute diagnostics
const envOk = checkEnvironmentVariables();
checkVercelProject();
suggestSolutions();

if (!envOk) {
  process.exit(1);
}