#!/usr/bin/env node

/**
 * Setup Vercel Environment Variables with Values
 * Extracts values from .env.local and provides setup commands
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('⚙️ Vercel Environment Variables Setup');
console.log('='.repeat(50));

function extractEnvValues() {
  const envPath = path.join(__dirname, '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const requiredVars = [
    'GROQ_API_KEY',
    'ANTHROPIC_API_KEY', 
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN'
  ];
  
  const envValues = {};
  
  requiredVars.forEach(varName => {
    const match = envContent.match(new RegExp(`${varName}=(.+)`));
    if (match) {
      envValues[varName] = match[1].trim();
    }
  });
  
  return envValues;
}

function createSetupInstructions() {
  const envValues = extractEnvValues();
  
  console.log('\n📋 Environment Variables for Vercel Dashboard:');
  console.log('\nGo to: https://vercel.com/dashboard');
  console.log('Select your project → Settings → Environment Variables');
  console.log('Add these variables for "Production" environment:\n');
  
  Object.entries(envValues).forEach(([key, value]) => {
    console.log(`${key}`);
    console.log(`Value: ${value}`);
    console.log('Environment: Production');
    console.log('---');
  });
  
  // Create a JSON file for easy copying
  const envForVercel = {};
  Object.entries(envValues).forEach(([key, value]) => {
    envForVercel[key] = value;
  });
  
  fs.writeFileSync(
    path.join(__dirname, 'vercel-env-values.json'), 
    JSON.stringify(envForVercel, null, 2)
  );
  
  console.log('\n✅ Created vercel-env-values.json for reference');
  
  // Create CLI commands
  const cliCommands = Object.entries(envValues).map(([key, value]) => 
    `echo "${value}" | vercel env add ${key} production`
  ).join('\n');
  
  fs.writeFileSync(path.join(__dirname, 'vercel-env-cli.sh'), cliCommands);
  console.log('✅ Created vercel-env-cli.sh for CLI setup');
  
  return envValues;
}

function main() {
  console.log('🔧 Extracting environment variables...\n');
  
  const envValues = createSetupInstructions();
  
  console.log('\n' + '='.repeat(50));
  console.log('⚙️ ENVIRONMENT SETUP READY!');
  
  console.log('\n🎯 Choose your setup method:');
  console.log('\n1. 🌐 Vercel Dashboard (Recommended):');
  console.log('   • Go to https://vercel.com/dashboard');
  console.log('   • Select project → Settings → Environment Variables');
  console.log('   • Copy values from above or vercel-env-values.json');
  
  console.log('\n2. 💻 CLI Method:');
  console.log('   • Run: chmod +x vercel-env-cli.sh');
  console.log('   • Run: ./vercel-env-cli.sh');
  
  console.log('\n📋 After setting up environment variables:');
  console.log('   1. Redeploy: vercel --prod');
  console.log('   2. Test: node test-production-deployment.js');
  console.log('   3. Visit: https://thandiai-fvcp1qw1u-thandiai-projects.vercel.app');
  
  console.log(`\n🎉 Found ${Object.keys(envValues).length} environment variables ready for setup!`);
}

main();