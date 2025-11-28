#!/usr/bin/env node

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { execSync } from 'child_process';
import https from 'https';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = 'pvvnxupuukuefajypovz';

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY missing in .env.local');
  process.exit(1);
}

if (!SUPABASE_ACCESS_TOKEN) {
  console.error('❌ SUPABASE_ACCESS_TOKEN missing in .env.local');
  process.exit(1);
}

// Execute SQL via Supabase Management API
async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    
    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body || '{}'));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function deploy() {
  console.log('🚀 Deploying G10-12 Guidance Engine...\n');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // STEP 1: Create database schema
  console.log('1️⃣ Creating tables...');
  
  try {
    const schemaSQL = fs.readFileSync('./scripts/setup-g10-12-schema.sql', 'utf8');
    await executeSQL(schemaSQL);
    console.log('✅ Tables created\n');
  } catch (error) {
    console.log('⚠️  Schema creation via API failed:', error.message.substring(0, 100));
    console.log('   Attempting to continue (tables may already exist)...\n');
  }

  // STEP 2: Clear and seed data
  console.log('2️⃣ Seeding data...');
  
  try {
    // Delete existing data
    await supabase.from('g12_logistics').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('institution_gates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('g10_correction_gates').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert G10 gate
    const { error: g10Error } = await supabase
      .from('g10_correction_gates')
      .insert({
        subject_choice: 'Maths Literacy',
        career_category: 'Engineering',
        reversible_until: 'Term 3, Week 5 (June 15)',
        reversible_date: '2025-06-15',
        minimum_g11_threshold: { core_maths: 60, physical_science: 55 },
        alternative_pathway: 'Consider Engineering Drafting NC(V) at TVET',
        warning_message: {
          en: 'CRITICAL: Switch to Core Maths before June 15. STEM pathways closed thereafter.',
          zu: 'KUBALULEKILE: Shintsha ku-Maths Core ngo-June 15. Amaphrojekthi we-STEM avalekile emva kwalokho.'
        }
      });
    if (g10Error) throw new Error(`G10 seed: ${g10Error.message}`);

    // Insert G11 gate (Wits CS)
    const { error: g11Error } = await supabase
      .from('institution_gates')
      .insert({
        qualification_id: 'SAQA_94721',
        institution_name: 'University of the Witwatersrand',
        qualification_name: 'BSc Computer Science',
        aps_min: 34,
        subject_rules: [
          { subject: 'Core Mathematics', min_mark: 65, required: true },
          { subject: 'Physical Science', min_mark: 60, required: false }
        ],
        disqualifiers: ['Maths Literacy', 'APS < 34', 'Core Maths < 65%']
      });
    if (g11Error) throw new Error(`G11 seed: ${g11Error.message}`);

    // Insert G12 institution gate (Architecture UP)
    const { error: g12InstError } = await supabase
      .from('institution_gates')
      .insert({
        qualification_id: 'SAQA_53477',
        institution_name: 'University of Pretoria',
        qualification_name: 'Architecture',
        aps_min: 30,
        subject_rules: [
          { subject: 'Mathematics', min_mark: 50, required: true }
        ],
        disqualifiers: ['APS < 30']
      });
    if (g12InstError) throw new Error(`G12 institution seed: ${g12InstError.message}`);

    // Insert G12 logistics
    const { error: logisticsError } = await supabase
      .from('g12_logistics')
      .insert({
        qualification_id: 'SAQA_53477',
        lo_excluded: true,
        portfolio_deadline: '2025-08-31',
        nbt_required: false,
        calculation_method: 'G11 finals + G12 Sept results',
        interview_required: true,
        additional_requirements: [
          { item: 'Portfolio', deadline: '2025-08-31', weight: '50%' },
          { item: 'Interview', scheduled: 'October 2025' }
        ]
      });
    if (logisticsError) throw new Error(`G12 logistics seed: ${logisticsError.message}`);

    console.log('✅ Seed data inserted\n');
  } catch (error) {
    console.error('❌ Seed data failed:', error.message);
    console.log('\n💡 Tables may not exist. Creating them now...\n');
    
    // Try to create tables via Management API
    try {
      const schemaSQL = fs.readFileSync('./scripts/setup-g10-12-schema.sql', 'utf8');
      await executeSQL(schemaSQL);
      console.log('✅ Tables created via API\n');
      console.log('🔄 Retrying data seeding...\n');
      
      // Retry seeding
      await deploy();
      return;
    } catch (err) {
      console.error('❌ Could not create tables:', err.message);
      console.log('\n📋 MANUAL STEP REQUIRED:');
      console.log('   1. Visit: https://supabase.com/dashboard/project/pvvnxupuukuefajypovz/sql/new');
      console.log('   2. Copy and execute: scripts/setup-g10-12-schema.sql');
      console.log('   3. Re-run: node scripts/deploy-guidance-engine.js\n');
      process.exit(1);
    }
  }

  // STEP 3: Deploy edge function
  console.log('3️⃣ Deploying edge function...');
  
  try {
    // Copy function file to supabase/functions directory
    const functionSource = './.kiro/specs/g10-12-guidance-engine/requirements-engine.ts';
    const functionDest = './supabase/functions/requirements-engine/index.ts';
    
    if (!fs.existsSync('./supabase/functions/requirements-engine')) {
      fs.mkdirSync('./supabase/functions/requirements-engine', { recursive: true });
    }
    
    fs.copyFileSync(functionSource, functionDest);
    
    // Login and deploy
    execSync(`npx supabase login --token ${SUPABASE_ACCESS_TOKEN}`, { 
      stdio: 'pipe',
      shell: true 
    });
    
    execSync(`npx supabase functions deploy requirements-engine --no-verify-jwt --project-ref ${PROJECT_REF}`, { 
      stdio: 'inherit',
      shell: true 
    });
    
    console.log('✅ Edge function deployed\n');
  } catch (error) {
    console.error('❌ Edge function deployment failed:', error.message);
    process.exit(1);
  }

  // STEP 4: Verify
  console.log('4️⃣ Verifying deployment...');
  
  try {
    const { data: g10Data, error: g10VerifyError } = await supabase
      .from('g10_correction_gates')
      .select('*');
    
    if (g10VerifyError || !g10Data || g10Data.length === 0) {
      throw new Error('g10_correction_gates table is empty');
    }

    const { data: instData, error: instVerifyError } = await supabase
      .from('institution_gates')
      .select('*');
    
    if (instVerifyError || !instData || instData.length === 0) {
      throw new Error('institution_gates table is empty');
    }

    const { data: logData, error: logVerifyError } = await supabase
      .from('g12_logistics')
      .select('*');
    
    if (logVerifyError || !logData || logData.length === 0) {
      throw new Error('g12_logistics table is empty');
    }

    console.log('✅ Verification passed\n');
    console.log('🎉 Deployment complete! All systems operational.\n');
    console.log(`📍 Function URL: https://${PROJECT_REF}.supabase.co/functions/v1/requirements-engine`);
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

deploy().catch((error) => {
  console.error('❌ Deployment failed:', error);
  process.exit(1);
});
