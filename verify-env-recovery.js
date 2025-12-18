#!/usr/bin/env node

// Environment Recovery Verification Script
// Helps verify which variables have been successfully copied from Vercel

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 ENVIRONMENT RECOVERY VERIFICATION');
console.log('=' .repeat(50));

// Load environment variables
const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('💡 Run: node setup-environment.js to create it');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');

// Define expected variables with their patterns
const expectedVars = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    pattern: /^https:\/\/[a-z0-9]+\.supabase\.co$/,
    critical: true,
    description: 'Supabase project URL'
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    pattern: /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
    critical: true,
    description: 'Supabase service role JWT'
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    pattern: /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
    critical: false,
    description: 'Supabase anonymous key JWT'
  },
  {
    name: 'SUPABASE_ACCESS_TOKEN',
    pattern: /^sbp_[A-Za-z0-9_-]+$/,
    critical: false,
    description: 'Supabase access token'
  },
  {
    name: 'ANTHROPIC_API_KEY',
    pattern: /^sk-ant-api03-[A-Za-z0-9_-]+$/,
    critical: false,
    description: 'Anthropic Claude API key'
  },
  {
    name: 'OPENAI_API_KEY',
    pattern: /^sk-(proj-)?[A-Za-z0-9_-]+$/,
    critical: false,
    description: 'OpenAI API key'
  },
  {
    name: 'GROQ_API_KEY',
    pattern: /^gsk_[A-Za-z0-9_-]+$/,
    critical: false,
    description: 'Groq API key'
  },
  {
    name: 'LLM_PROVIDER',
    pattern: /^(anthropic|openai|groq)$/,
    critical: true,
    description: 'Primary LLM provider'
  }
];

console.log('\n📋 CHECKING ENVIRONMENT VARIABLES:');
console.log('-'.repeat(50));

let criticalCount = 0;
let criticalConfigured = 0;
let totalCount = 0;
let totalConfigured = 0;
let llmProviderCount = 0;

const results = [];

expectedVars.forEach(varDef => {
  totalCount++;
  if (varDef.critical) criticalCount++;
  
  // Extract variable value from env content
  const regex = new RegExp(`^${varDef.name}=(.*)$`, 'm');
  const match = envContent.match(regex);
  
  let status = '❌ Missing';
  let isConfigured = false;
  
  if (match) {
    const value = match[1].trim();
    
    // Check if it's a placeholder
    if (value.includes('your-') || value.includes('your_') || 
        value === 'https://your-project-id.supabase.co' ||
        value.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-')) {
      status = '⚠️ Placeholder';
    } else if (varDef.pattern && !varDef.pattern.test(value)) {
      status = '⚠️ Invalid format';
    } else if (value.length > 0) {
      status = '✅ Configured';
      isConfigured = true;
      totalConfigured++;
      if (varDef.critical) criticalConfigured++;
      
      // Count LLM providers
      if (['ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'GROQ_API_KEY'].includes(varDef.name)) {
        llmProviderCount++;
      }
    }
  }
  
  const criticalMark = varDef.critical ? '🔴' : '🔵';
  console.log(`${criticalMark} ${varDef.name}: ${status}`);
  console.log(`   ${varDef.description}`);
  
  results.push({
    name: varDef.name,
    configured: isConfigured,
    critical: varDef.critical,
    status
  });
});

// Summary
console.log('\n' + '=' .repeat(50));
console.log('📊 RECOVERY STATUS SUMMARY');
console.log('=' .repeat(50));

const criticalPercentage = criticalCount > 0 ? Math.round((criticalConfigured / criticalCount) * 100) : 0;
const totalPercentage = totalCount > 0 ? Math.round((totalConfigured / totalCount) * 100) : 0;

console.log(`🔴 Critical Variables: ${criticalConfigured}/${criticalCount} (${criticalPercentage}%)`);
console.log(`🔵 Total Variables: ${totalConfigured}/${totalCount} (${totalPercentage}%)`);
console.log(`🤖 LLM Providers: ${llmProviderCount} configured`);

// Status assessment
let overallStatus = '🔴 NOT READY';
let statusMessage = 'Critical variables missing';

if (criticalConfigured === criticalCount && llmProviderCount >= 1) {
  overallStatus = '🟢 READY';
  statusMessage = 'All critical variables configured';
} else if (criticalConfigured >= criticalCount * 0.8) {
  overallStatus = '🟡 PARTIAL';
  statusMessage = 'Most variables configured';
}

console.log(`\n🎯 Overall Status: ${overallStatus}`);
console.log(`💡 ${statusMessage}`);

// Specific recommendations
console.log('\n📋 NEXT STEPS:');

if (criticalConfigured < criticalCount) {
  console.log('\n🚨 CRITICAL VARIABLES NEEDED:');
  results.filter(r => r.critical && !r.configured).forEach(r => {
    console.log(`   • ${r.name}: ${r.status}`);
  });
}

if (llmProviderCount === 0) {
  console.log('\n🤖 LLM PROVIDER NEEDED:');
  console.log('   • Add at least one: ANTHROPIC_API_KEY, OPENAI_API_KEY, or GROQ_API_KEY');
  console.log('   • Set LLM_PROVIDER to match your chosen provider');
}

if (overallStatus === '🟢 READY') {
  console.log('\n🚀 SYSTEM READY:');
  console.log('   • Run: node api-connection-status-report.js');
  console.log('   • Run: npm run dev');
  console.log('   • Test: http://localhost:3000/assessment');
} else {
  console.log('\n🔧 COPY FROM VERCEL:');
  console.log('   1. Go to: https://vercel.com/dashboard');
  console.log('   2. Select your project → Settings → Environment Variables');
  console.log('   3. Copy missing variables to .env.local');
  console.log('   4. Run this script again to verify');
}

console.log('\n' + '=' .repeat(50));
console.log(`📅 Verification completed: ${new Date().toISOString()}`);
console.log('=' .repeat(50));