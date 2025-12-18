#!/usr/bin/env node

// Copy Environment Variables to Vercel - Helper Script
// Generates commands to set all environment variables in Vercel

console.log('📋 VERCEL ENVIRONMENT VARIABLES SETUP');
console.log('=' .repeat(60));
console.log('🎯 Copy these commands to set up Vercel environment');
console.log('=' .repeat(60));

// Load environment variables
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

// Define all required environment variables
const requiredVars = [
  // Database
  { name: 'NEXT_PUBLIC_SUPABASE_URL', category: 'Database', critical: true },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', category: 'Database', critical: true },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', category: 'Database', critical: true },
  { name: 'SUPABASE_ACCESS_TOKEN', category: 'Database', critical: false },
  
  // LLM Providers
  { name: 'GROQ_API_KEY', category: 'LLM Primary', critical: true },
  { name: 'OPENAI_API_KEY', category: 'LLM Fallback', critical: true },
  { name: 'ANTHROPIC_API_KEY', category: 'LLM CAG', critical: true },
  
  // LLM Configuration
  { name: 'LLM_PROVIDER', category: 'LLM Config', critical: true },
  { name: 'GROQ_MODEL', category: 'LLM Config', critical: true },
  { name: 'OPENAI_MODEL', category: 'LLM Config', critical: false },
  { name: 'ANTHROPIC_MODEL', category: 'LLM Config', critical: false },
  { name: 'OPENAI_EMBEDDING_MODEL', category: 'LLM Config', critical: false },
  
  // Cache
  { name: 'UPSTASH_REDIS_REST_URL', category: 'Cache', critical: false },
  { name: 'UPSTASH_REDIS_REST_TOKEN', category: 'Cache', critical: false },
  
  // Application
  { name: 'NODE_ENV', category: 'Application', critical: false },
];

console.log('\n🔧 VERCEL CLI COMMANDS:');
console.log('-'.repeat(40));
console.log('Run these commands in your terminal:\n');

let currentCategory = '';
let criticalCount = 0;
let totalCount = 0;

requiredVars.forEach(varDef => {
  totalCount++;
  
  // Category header
  if (varDef.category !== currentCategory) {
    currentCategory = varDef.category;
    console.log(`\n# ${varDef.category.toUpperCase()}`);
  }
  
  const value = process.env[varDef.name];
  const hasCritical = varDef.critical;
  
  if (hasCritical) criticalCount++;
  
  if (value) {
    // Escape special characters for shell
    const escapedValue = value.replace(/"/g, '\\"').replace(/\$/g, '\\$');
    const criticalMark = varDef.critical ? ' # CRITICAL' : '';
    
    console.log(`vercel env add ${varDef.name} production "${escapedValue}"${criticalMark}`);
    
    // Also add for preview and development
    if (varDef.critical) {
      console.log(`vercel env add ${varDef.name} preview "${escapedValue}"`);
      console.log(`vercel env add ${varDef.name} development "${escapedValue}"`);
    }
  } else {
    const status = varDef.critical ? '❌ MISSING (CRITICAL)' : '⚠️ Missing (optional)';
    console.log(`# ${varDef.name}: ${status}`);
  }
});

console.log('\n' + '=' .repeat(60));
console.log('📊 ENVIRONMENT SUMMARY');
console.log('=' .repeat(60));

const configuredVars = requiredVars.filter(v => !!process.env[v.name]);
const criticalConfigured = requiredVars.filter(v => v.critical && !!process.env[v.name]);

console.log(`📋 Total Variables: ${configuredVars.length}/${totalCount}`);
console.log(`🔴 Critical Variables: ${criticalConfigured.length}/${criticalCount}`);

// Generate manual setup guide
console.log('\n🌐 MANUAL VERCEL DASHBOARD SETUP:');
console.log('-'.repeat(40));
console.log('If you prefer using the Vercel Dashboard:');
console.log('1. Go to: https://vercel.com/dashboard');
console.log('2. Select your project');
console.log('3. Navigate to: Settings → Environment Variables');
console.log('4. Add each variable below:\n');

requiredVars.forEach(varDef => {
  const value = process.env[varDef.name];
  if (value) {
    const criticalMark = varDef.critical ? ' (CRITICAL)' : '';
    const displayValue = value.length > 50 ? value.substring(0, 47) + '...' : value;
    console.log(`${varDef.name}${criticalMark}`);
    console.log(`  Value: ${displayValue}`);
    console.log(`  Environments: Production, Preview, Development\n`);
  }
});

// Critical updates section
console.log('\n🚨 CRITICAL UPDATES REQUIRED:');
console.log('-'.repeat(40));
console.log('⚠️ GROQ MODEL UPDATE:');
console.log('The Groq model has been updated due to decommissioning.');
console.log('');
console.log('OLD (Decommissioned): llama-3.1-70b-versatile');
console.log('NEW (Active): llama-3.1-8b-instant');
console.log('');
console.log('Ensure GROQ_MODEL is set to: llama-3.1-8b-instant');

// Provider hierarchy confirmation
console.log('\n🎯 PROVIDER HIERARCHY CONFIRMATION:');
console.log('-'.repeat(40));
console.log('Verify these settings in Vercel:');
console.log('');
console.log('PRIMARY: LLM_PROVIDER=groq (Fast & Free)');
console.log('FALLBACK: OpenAI (Automatic fallback + Embeddings)');
console.log('CAG LEVEL: Anthropic Claude (Premium quality)');
console.log('CACHE: Upstash Redis (Performance layer)');

// Verification steps
console.log('\n✅ VERIFICATION STEPS:');
console.log('-'.repeat(40));
console.log('After setting up Vercel environment variables:');
console.log('');
console.log('1. Deploy to Vercel:');
console.log('   git push origin main');
console.log('');
console.log('2. Test production deployment:');
console.log('   node test-vercel-deployment.js');
console.log('');
console.log('3. Verify LLM providers:');
console.log('   node test-production-llm-final.js');

console.log('\n' + '=' .repeat(60));
console.log('📅 Setup guide generated:', new Date().toISOString());
console.log('=' .repeat(60));