#!/usr/bin/env node

// Environment Setup Helper Script
// Guides you through setting up your .env.local file

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 THANDI.AI ENVIRONMENT SETUP HELPER');
console.log('=' .repeat(50));

// Check if .env.local already exists
const envLocalPath = path.join(__dirname, '.env.local');
const envTemplatePath = path.join(__dirname, '.env.local.template');

console.log('\n1️⃣ Checking current setup...');

if (fs.existsSync(envLocalPath)) {
  console.log('✅ .env.local file exists');
  
  // Check what variables are configured
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ANTHROPIC_API_KEY',
    'OPENAI_API_KEY',
    'GROQ_API_KEY',
    'LLM_PROVIDER'
  ];
  
  console.log('\n📋 Environment Variables Status:');
  let configuredCount = 0;
  
  requiredVars.forEach(varName => {
    const hasVar = envContent.includes(`${varName}=`) && 
                   !envContent.includes(`${varName}=your-`) && 
                   !envContent.includes(`${varName}=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-`);
    
    if (hasVar) {
      console.log(`✅ ${varName}: Configured`);
      configuredCount++;
    } else {
      console.log(`❌ ${varName}: Not configured`);
    }
  });
  
  const percentage = Math.round((configuredCount / requiredVars.length) * 100);
  console.log(`\n📊 Configuration Status: ${configuredCount}/${requiredVars.length} (${percentage}%)`);
  
  if (percentage >= 80) {
    console.log('🟢 Environment is well configured!');
  } else if (percentage >= 50) {
    console.log('🟡 Environment is partially configured');
  } else {
    console.log('🔴 Environment needs configuration');
  }
  
} else {
  console.log('❌ .env.local file missing');
  
  if (fs.existsSync(envTemplatePath)) {
    console.log('\n2️⃣ Creating .env.local from template...');
    
    try {
      fs.copyFileSync(envTemplatePath, envLocalPath);
      console.log('✅ .env.local created from template');
      console.log('📝 Please edit .env.local and add your API keys');
    } catch (error) {
      console.log('❌ Failed to create .env.local:', error.message);
    }
  } else {
    console.log('❌ Template file missing. Please check SETUP-ENVIRONMENT-VARIABLES.md');
  }
}

console.log('\n3️⃣ Next Steps:');

if (!fs.existsSync(envLocalPath)) {
  console.log('1. Create .env.local file using the template');
  console.log('2. Add your API keys and credentials');
  console.log('3. Run this script again to verify');
} else {
  console.log('1. Edit .env.local and add missing API keys');
  console.log('2. Get credentials from:');
  console.log('   • Supabase: https://supabase.com/dashboard');
  console.log('   • Anthropic: https://console.anthropic.com/');
  console.log('   • OpenAI: https://platform.openai.com/api-keys');
  console.log('   • Groq: https://console.groq.com/keys');
  console.log('3. Run verification: node api-connection-status-report.js');
}

console.log('\n📚 For detailed instructions, see: SETUP-ENVIRONMENT-VARIABLES.md');

console.log('\n' + '=' .repeat(50));
console.log('🎯 Goal: Get to 100% configuration for full functionality');
console.log('💡 Minimum: Supabase + 1 LLM provider for basic functionality');
console.log('=' .repeat(50));