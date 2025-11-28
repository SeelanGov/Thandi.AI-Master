#!/usr/bin/env node
// Automated Edge Function Deployment
// No manual CLI steps required

// CRITICAL: Load .env.local first
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '.env.local' });

const PROJECT_REF = 'pvvnxupuukuefajypovz';
const FUNCTION_NAME = 'requirements-engine';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

// Verify token is loaded
if (!TOKEN) {
  console.error('❌ SUPABASE_ACCESS_TOKEN not found in .env.local');
  console.error('   Make sure .env.local contains: SUPABASE_ACCESS_TOKEN=your_token');
  process.exit(1);
}

console.log('✅ Token found. Deploying...\n');

try {
  // Step 1: Ensure function directory exists
  const functionDir = path.join('supabase', 'functions', FUNCTION_NAME);
  if (!fs.existsSync(functionDir)) {
    console.log('📁 Creating function directory...');
    fs.mkdirSync(functionDir, { recursive: true });
  }

  // Step 2: Copy function file
  const sourcePath = path.join('.kiro', 'specs', 'g10-12-guidance-engine', 'requirements-engine.ts');
  const targetPath = path.join(functionDir, 'index.ts');
  
  console.log('📄 Copying function file...');
  fs.copyFileSync(sourcePath, targetPath);
  console.log(`   ✓ Copied to ${targetPath}`);

  // Step 3: Deploy using npx (no installation required)
  console.log('\n🔧 Deploying to Supabase...');
  
  const deployCommand = `npx supabase login --token ${TOKEN} && npx supabase functions deploy ${FUNCTION_NAME} --no-verify-jwt --project-ref ${PROJECT_REF}`;
  
  console.log(`   Running deployment...\n`);
  
  execSync(deployCommand, {
    stdio: 'inherit',
    shell: true
  });

  console.log('\n✅ Edge function deployed successfully!');
  console.log(`\n📍 Function URL: https://${PROJECT_REF}.supabase.co/functions/v1/${FUNCTION_NAME}`);
  
  // Step 4: Test deployment
  console.log('\n🧪 Testing deployment...');
  const testCommand = `node scripts/test-requirements-engine.js`;
  console.log(`   Running: ${testCommand}\n`);
  
  try {
    execSync(testCommand, { stdio: 'inherit' });
    console.log('\n✅ Deployment verified!');
  } catch (testError) {
    console.warn('\n⚠️ Deployment succeeded but tests failed. Check manually.');
  }

} catch (error) {
  console.error('\n❌ Deployment failed:', error.message);
  console.error('\nTroubleshooting:');
  console.error('1. Ensure SUPABASE_ACCESS_TOKEN is set in environment');
  console.error('2. Check that you have network access to Supabase');
  console.error('3. Verify project ref is correct:', PROJECT_REF);
  process.exit(1);
}
