#!/usr/bin/env node

/**
 * Batch 2 Deployment Script
 * Deploys qualifications 6-20 to Supabase
 * 
 * Usage:
 *   node scripts/deploy-batch2.js [--environment=staging|production] [--dry-run]
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const environment = args.find(arg => arg.startsWith('--environment='))?.split('=')[1] || 'production';
const isDryRun = args.includes('--dry-run');

// Configuration
const BATCH_NAME = 'Batch 2';
const BATCH_NUMBER = 2;
const EXPECTED_INSTITUTION_GATES = 75;
const EXPECTED_G12_LOGISTICS = 15;
const EXPECTED_QUALIFICATIONS = 15;

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Load data files
const sqlFilePath = path.join(__dirname, '../.kiro/data/batch2/qualifications-seed-batch2.sql');
const jsonFilePath = path.join(__dirname, '../.kiro/data/batch2/priority-qualifications-batch2.json');

console.log(`\n🚀 ${BATCH_NAME} Deployment Script`);
console.log(`   Environment: ${environment}`);
console.log(`   Mode: ${isDryRun ? 'DRY RUN' : 'LIVE DEPLOYMENT'}`);
console.log(`   Time: ${new Date().toISOString()}\n`);

async function preDeploymentChecks() {
  console.log('📋 Running pre-deployment checks...\n');
  
  // Check 1: Files exist
  console.log('   ✓ Checking files exist...');
  if (!fs.existsSync(sqlFilePath)) {
    throw new Error(`SQL file not found: ${sqlFilePath}`);
  }
  if (!fs.existsSync(jsonFilePath)) {
    throw new Error(`JSON file not found: ${jsonFilePath}`);
  }
  console.log('     ✓ SQL file found');
  console.log('     ✓ JSON file found');
  
  // Check 2: Parse JSON
  console.log('   ✓ Validating JSON structure...');
  const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
  if (jsonData.length !== EXPECTED_QUALIFICATIONS) {
    throw new Error(`Expected ${EXPECTED_QUALIFICATIONS} qualifications, found ${jsonData.length}`);
  }
  console.log(`     ✓ ${jsonData.length} qualifications found`);
  
  // Check 3: Count SQL records
  console.log('   ✓ Counting SQL records...');
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
  const institutionGatesCount = (sqlContent.match(/INSERT INTO institution_gates/g) || []).length;
  const g12LogisticsCount = (sqlContent.match(/INSERT INTO g12_logistics/g) || []).length;
  
  if (institutionGatesCount !== EXPECTED_INSTITUTION_GATES) {
    throw new Error(`Expected ${EXPECTED_INSTITUTION_GATES} institution_gates, found ${institutionGatesCount}`);
  }
  if (g12LogisticsCount !== EXPECTED_G12_LOGISTICS) {
    throw new Error(`Expected ${EXPECTED_G12_LOGISTICS} g12_logistics, found ${g12LogisticsCount}`);
  }
  console.log(`     ✓ ${institutionGatesCount} institution_gates records`);
  console.log(`     ✓ ${g12LogisticsCount} g12_logistics records`);
  
  // Check 4: Database connection
  console.log('   ✓ Testing database connection...');
  const { data, error } = await supabase.from('institution_gates').select('count', { count: 'exact', head: true });
  if (error) {
    throw new Error(`Database connection failed: ${error.message}`);
  }
  console.log('     ✓ Database connection successful');
  
  // Check 5: Check for duplicates
  console.log('   ✓ Checking for duplicate SAQA IDs...');
  const saqaIds = jsonData.map(q => `SAQA_${q.saqa_id}`);
  const { data: existing } = await supabase
    .from('institution_gates')
    .select('qualification_id')
    .in('qualification_id', saqaIds);
  
  if (existing && existing.length > 0) {
    console.warn(`     ⚠️  Warning: ${existing.length} qualifications already exist:`);
    existing.forEach(e => console.warn(`        - ${e.qualification_id}`));
    if (!isDryRun) {
      throw new Error('Duplicate qualifications found. Remove them first or use --force flag.');
    }
  } else {
    console.log('     ✓ No duplicates found');
  }
  
  console.log('\n✅ All pre-deployment checks passed!\n');
}

async function parseAndInsertData() {
  console.log('📦 Parsing and inserting data...\n');
  
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
  const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
  
  // Parse institution_gates records
  console.log('   ✓ Parsing institution_gates records...');
  const institutionGatesRecords = [];
  const institutionGatesMatches = sqlContent.matchAll(/INSERT INTO institution_gates \(qualification_id, institution_name, qualification_name, aps_min, subject_rules, disqualifiers, provisional_offer_criteria\) VALUES\s*\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*(\d+),\s*'(\[.*?\])',\s*'(\[.*?\])',\s*'([^']+)'\);/gs);
  
  for (const match of institutionGatesMatches) {
    institutionGatesRecords.push({
      qualification_id: match[1],
      institution_name: match[2],
      qualification_name: match[3],
      aps_min: parseInt(match[4]),
      subject_rules: JSON.parse(match[5]),
      disqualifiers: JSON.parse(match[6]),
      provisional_offer_criteria: match[7]
    });
  }
  console.log(`     ✓ Parsed ${institutionGatesRecords.length} institution_gates records`);
  
  // Parse g12_logistics records
  console.log('   ✓ Parsing g12_logistics records...');
  const g12LogisticsRecords = [];
  const g12LogisticsMatches = sqlContent.matchAll(/INSERT INTO g12_logistics \(qualification_id, nbt_required, calculation_method, additional_requirements\) VALUES\s*\('([^']+)',\s*(true|false),\s*'([^']+)',\s*'(\[.*?\])'\);/gs);
  
  for (const match of g12LogisticsMatches) {
    g12LogisticsRecords.push({
      qualification_id: match[1],
      nbt_required: match[2] === 'true',
      calculation_method: match[3],
      additional_requirements: JSON.parse(match[4])
    });
  }
  console.log(`     ✓ Parsed ${g12LogisticsRecords.length} g12_logistics records`);
  
  if (isDryRun) {
    console.log('\n🔍 DRY RUN - No data will be inserted');
    console.log(`   Would insert ${institutionGatesRecords.length} institution_gates records`);
    console.log(`   Would insert ${g12LogisticsRecords.length} g12_logistics records`);
    return { institutionGatesRecords, g12LogisticsRecords };
  }
  
  // Insert institution_gates
  console.log('\n   ✓ Inserting institution_gates records...');
  const { data: insertedGates, error: gatesError } = await supabase
    .from('institution_gates')
    .insert(institutionGatesRecords)
    .select();
  
  if (gatesError) {
    throw new Error(`Failed to insert institution_gates: ${gatesError.message}`);
  }
  console.log(`     ✓ Inserted ${insertedGates.length} institution_gates records`);
  
  // Insert g12_logistics
  console.log('   ✓ Inserting g12_logistics records...');
  const { data: insertedLogistics, error: logisticsError } = await supabase
    .from('g12_logistics')
    .insert(g12LogisticsRecords)
    .select();
  
  if (logisticsError) {
    throw new Error(`Failed to insert g12_logistics: ${logisticsError.message}`);
  }
  console.log(`     ✓ Inserted ${insertedLogistics.length} g12_logistics records`);
  
  return { institutionGatesRecords, g12LogisticsRecords };
}

async function postDeploymentVerification() {
  console.log('\n🔍 Running post-deployment verification...\n');
  
  // Verify record counts
  console.log('   ✓ Verifying record counts...');
  const { count: gatesCount } = await supabase
    .from('institution_gates')
    .select('*', { count: 'exact', head: true });
  
  const { count: logisticsCount } = await supabase
    .from('g12_logistics')
    .select('*', { count: 'exact', head: true });
  
  console.log(`     ✓ institution_gates: ${gatesCount} total records`);
  console.log(`     ✓ g12_logistics: ${logisticsCount} total records`);
  
  // Verify no orphaned records
  console.log('   ✓ Checking for orphaned records...');
  const { data: orphaned } = await supabase
    .from('g12_logistics')
    .select('qualification_id')
    .not('qualification_id', 'in', `(SELECT DISTINCT qualification_id FROM institution_gates)`);
  
  if (orphaned && orphaned.length > 0) {
    console.warn(`     ⚠️  Warning: ${orphaned.length} orphaned g12_logistics records found`);
  } else {
    console.log('     ✓ No orphaned records');
  }
  
  // Test sample queries
  console.log('   ✓ Testing sample queries...');
  const sampleQualifications = ['SAQA_84706', 'SAQA_10218', 'SAQA_94738'];
  
  for (const qualId of sampleQualifications) {
    const { data, error } = await supabase
      .from('institution_gates')
      .select('*')
      .eq('qualification_id', qualId);
    
    if (error || !data || data.length === 0) {
      throw new Error(`Failed to query ${qualId}`);
    }
    console.log(`     ✓ ${qualId}: ${data.length} institutions found`);
  }
  
  console.log('\n✅ All post-deployment verifications passed!\n');
}

async function generateDeploymentReport() {
  console.log('📊 Generating deployment report...\n');
  
  const report = {
    batch: BATCH_NAME,
    batch_number: BATCH_NUMBER,
    environment,
    timestamp: new Date().toISOString(),
    status: 'success',
    records: {
      institution_gates: EXPECTED_INSTITUTION_GATES,
      g12_logistics: EXPECTED_G12_LOGISTICS,
      qualifications: EXPECTED_QUALIFICATIONS
    }
  };
  
  const reportPath = path.join(__dirname, `../. kiro/data/batch2/deployment-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('   ✓ Report saved to:', reportPath);
  console.log('\n' + '='.repeat(60));
  console.log('🎉 DEPLOYMENT COMPLETE!');
  console.log('='.repeat(60));
  console.log(`\n   Batch: ${BATCH_NAME}`);
  console.log(`   Environment: ${environment}`);
  console.log(`   Records Inserted: ${EXPECTED_INSTITUTION_GATES + EXPECTED_G12_LOGISTICS}`);
  console.log(`   Qualifications: ${EXPECTED_QUALIFICATIONS}`);
  console.log(`   Time: ${new Date().toISOString()}`);
  console.log('\n' + '='.repeat(60) + '\n');
}

async function main() {
  try {
    await preDeploymentChecks();
    await parseAndInsertData();
    
    if (!isDryRun) {
      await postDeploymentVerification();
      await generateDeploymentReport();
    } else {
      console.log('\n✅ DRY RUN COMPLETE - No changes made\n');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ DEPLOYMENT FAILED\n');
    console.error(`   Error: ${error.message}`);
    console.error(`\n   Stack trace:\n${error.stack}\n`);
    process.exit(1);
  }
}

main();
