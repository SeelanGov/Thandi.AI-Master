// Comprehensive system diagnostic for THANDI School Dashboard
import { config } from 'dotenv';
import { getSupabaseAdmin } from '../lib/supabase.js';
import { Redis } from '@upstash/redis';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabase = getSupabaseAdmin();

async function runSystemDiagnostic() {
  console.log('🔍 THANDI SCHOOL DASHBOARD - SYSTEM DIAGNOSTIC');
  console.log('==============================================\n');
  
  const results = {
    environment: { status: 'unknown', details: [] },
    database: { status: 'unknown', details: [] },
    redis: { status: 'unknown', details: [] },
    files: { status: 'unknown', details: [] },
    dependencies: { status: 'unknown', details: [] }
  };
  
  // 1. ENVIRONMENT VARIABLES CHECK
  console.log('1️⃣ ENVIRONMENT VARIABLES');
  console.log('------------------------');
  
  const requiredEnvVars = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
    'UPSTASH_REDIS_REST_URL': process.env.UPSTASH_REDIS_REST_URL,
    'UPSTASH_REDIS_REST_TOKEN': process.env.UPSTASH_REDIS_REST_TOKEN,
    'MAGIC_LINK_SECRET': process.env.MAGIC_LINK_SECRET,
    'ANTHROPIC_API_KEY': process.env.ANTHROPIC_API_KEY,
    'GROQ_API_KEY': process.env.GROQ_API_KEY
  };
  
  let envIssues = 0;
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      console.log(`❌ ${key}: MISSING`);
      results.environment.details.push(`Missing: ${key}`);
      envIssues++;
    } else {
      const masked = value.substring(0, 8) + '...' + value.substring(value.length - 4);
      console.log(`✅ ${key}: ${masked}`);
    }
  }
  
  results.environment.status = envIssues === 0 ? 'pass' : 'fail';
  console.log(`Environment Status: ${envIssues === 0 ? '✅ PASS' : '❌ FAIL'}\n`);
  
  // 2. DATABASE CONNECTION & TABLES
  console.log('2️⃣ DATABASE CONNECTION & TABLES');
  console.log('-------------------------------');
  
  try {
    // Test basic connection
    const { data: connectionTest, error: connError } = await supabase
      .from('students')
      .select('id')
      .limit(1);
    
    if (connError) throw new Error(`Connection failed: ${connError.message}`);
    
    console.log('✅ Supabase connection working');
    results.database.details.push('Connection: OK');
    
    // Check required tables
    const requiredTables = ['students', 'assessments', 'schools', 'school_users'];
    
    for (const tableName of requiredTables) {
      try {
        const { error: tableError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (tableError) {
          console.log(`❌ Table '${tableName}': ${tableError.message}`);
          results.database.details.push(`Table ${tableName}: MISSING`);
        } else {
          console.log(`✅ Table '${tableName}': EXISTS`);
          results.database.details.push(`Table ${tableName}: OK`);
        }
      } catch (error) {
        console.log(`❌ Table '${tableName}': ${error.message}`);
        results.database.details.push(`Table ${tableName}: ERROR`);
      }
    }
    
    // Check for required columns
    console.log('\n📋 Checking critical columns...');
    
    // Check if students has school_id
    try {
      const { error: studentSchoolError } = await supabase
        .from('students')
        .select('school_id')
        .limit(1);
      
      if (studentSchoolError && studentSchoolError.message.includes('school_id')) {
        console.log('❌ students.school_id: MISSING');
        results.database.details.push('students.school_id: MISSING');
      } else {
        console.log('✅ students.school_id: EXISTS');
        results.database.details.push('students.school_id: OK');
      }
    } catch (error) {
      console.log(`⚠️  students.school_id: ${error.message}`);
    }
    
    // Check if assessments has career_matches
    try {
      const { error: careerMatchesError } = await supabase
        .from('assessments')
        .select('career_matches')
        .limit(1);
      
      if (careerMatchesError && careerMatchesError.message.includes('career_matches')) {
        console.log('❌ assessments.career_matches: MISSING');
        results.database.details.push('assessments.career_matches: MISSING');
      } else {
        console.log('✅ assessments.career_matches: EXISTS');
        results.database.details.push('assessments.career_matches: OK');
      }
    } catch (error) {
      console.log(`⚠️  assessments.career_matches: ${error.message}`);
    }
    
    // Test dashboard function
    try {
      const { data: statsData, error: statsError } = await supabase.rpc('get_dashboard_stats', {
        school_id: '00000000-0000-0000-0000-000000000000'
      });
      
      if (statsError) {
        console.log(`❌ get_dashboard_stats function: ${statsError.message}`);
        results.database.details.push('get_dashboard_stats: ERROR');
      } else {
        console.log('✅ get_dashboard_stats function: WORKING');
        results.database.details.push('get_dashboard_stats: OK');
      }
    } catch (error) {
      console.log(`❌ get_dashboard_stats function: ${error.message}`);
      results.database.details.push('get_dashboard_stats: ERROR');
    }
    
    results.database.status = results.database.details.some(d => d.includes('MISSING') || d.includes('ERROR')) ? 'fail' : 'pass';
    
  } catch (error) {
    console.log(`❌ Database connection failed: ${error.message}`);
    results.database.status = 'fail';
    results.database.details.push(`Connection error: ${error.message}`);
  }
  
  console.log(`Database Status: ${results.database.status === 'pass' ? '✅ PASS' : '❌ FAIL'}\n`);
  
  // 3. REDIS CONNECTION
  console.log('3️⃣ REDIS CONNECTION');
  console.log('-------------------');
  
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN
    });
    
    // Test basic operations
    await redis.set('diagnostic:test', 'working', { ex: 10 });
    const testValue = await redis.get('diagnostic:test');
    
    if (testValue === 'working') {
      console.log('✅ Redis connection: WORKING');
      console.log('✅ Redis set/get: WORKING');
      results.redis.status = 'pass';
      results.redis.details.push('Connection: OK', 'Operations: OK');
      
      await redis.del('diagnostic:test');
    } else {
      throw new Error('Redis test value mismatch');
    }
    
  } catch (error) {
    console.log(`❌ Redis failed: ${error.message}`);
    results.redis.status = 'fail';
    results.redis.details.push(`Error: ${error.message}`);
  }
  
  console.log(`Redis Status: ${results.redis.status === 'pass' ? '✅ PASS' : '❌ FAIL'}\n`);
  
  // 4. CRITICAL FILES CHECK
  console.log('4️⃣ CRITICAL FILES');
  console.log('-----------------');
  
  const criticalFiles = [
    'middleware.js',
    'app/school/dashboard/page.js',
    'app/api/school/dashboard/stats/route.js',
    'app/api/school/students/route.js',
    'scripts/provision-counselor.js',
    'lib/supabase.js',
    'lib/auth-helpers.js',
    'components/school/StatsCard.js',
    'components/ui/Card.js',
    'components/ui/Button.js'
  ];
  
  let fileIssues = 0;
  for (const filePath of criticalFiles) {
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${filePath}: EXISTS`);
      results.files.details.push(`${filePath}: OK`);
    } else {
      console.log(`❌ ${filePath}: MISSING`);
      results.files.details.push(`${filePath}: MISSING`);
      fileIssues++;
    }
  }
  
  results.files.status = fileIssues === 0 ? 'pass' : 'fail';
  console.log(`Files Status: ${fileIssues === 0 ? '✅ PASS' : '❌ FAIL'}\n`);
  
  // 5. DEPENDENCIES CHECK
  console.log('5️⃣ DEPENDENCIES');
  console.log('---------------');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = [
      '@supabase/supabase-js',
      '@upstash/redis',
      'next',
      'react',
      'dotenv'
    ];
    
    let depIssues = 0;
    for (const dep of requiredDeps) {
      if (packageJson.dependencies[dep] || packageJson.devDependencies?.[dep]) {
        console.log(`✅ ${dep}: INSTALLED`);
        results.dependencies.details.push(`${dep}: OK`);
      } else {
        console.log(`❌ ${dep}: MISSING`);
        results.dependencies.details.push(`${dep}: MISSING`);
        depIssues++;
      }
    }
    
    results.dependencies.status = depIssues === 0 ? 'pass' : 'fail';
    
  } catch (error) {
    console.log(`❌ Could not read package.json: ${error.message}`);
    results.dependencies.status = 'fail';
    results.dependencies.details.push(`package.json error: ${error.message}`);
  }
  
  console.log(`Dependencies Status: ${results.dependencies.status === 'pass' ? '✅ PASS' : '❌ FAIL'}\n`);
  
  // FINAL SUMMARY
  console.log('🎯 DIAGNOSTIC SUMMARY');
  console.log('====================');
  
  const allSystems = Object.entries(results);
  const passingSystems = allSystems.filter(([_, result]) => result.status === 'pass').length;
  const totalSystems = allSystems.length;
  
  console.log(`Overall Health: ${passingSystems}/${totalSystems} systems passing\n`);
  
  for (const [system, result] of allSystems) {
    const status = result.status === 'pass' ? '✅ PASS' : '❌ FAIL';
    console.log(`${system.toUpperCase()}: ${status}`);
    
    if (result.status === 'fail') {
      console.log('  Issues:');
      result.details.forEach(detail => {
        if (detail.includes('MISSING') || detail.includes('ERROR')) {
          console.log(`    - ${detail}`);
        }
      });
    }
  }
  
  // RECOMMENDATIONS
  console.log('\n💡 RECOMMENDATIONS');
  console.log('==================');
  
  if (results.database.status === 'fail') {
    console.log('🔧 Database Issues:');
    if (results.database.details.some(d => d.includes('career_matches'))) {
      console.log('   - Run: ALTER TABLE assessments ADD COLUMN IF NOT EXISTS career_matches JSONB;');
    }
    if (results.database.details.some(d => d.includes('school_id'))) {
      console.log('   - Run: ALTER TABLE students ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id);');
    }
    if (results.database.details.some(d => d.includes('get_dashboard_stats'))) {
      console.log('   - Re-run the dashboard function SQL from supabase/migrations/20251221_add_school_dashboard.sql');
    }
  }
  
  if (results.files.status === 'fail') {
    console.log('🔧 Missing Files:');
    console.log('   - Some critical files are missing. Check the file paths.');
  }
  
  if (results.dependencies.status === 'fail') {
    console.log('🔧 Missing Dependencies:');
    console.log('   - Run: npm install');
  }
  
  if (passingSystems === totalSystems) {
    console.log('🚀 ALL SYSTEMS GO! Ready to proceed with school dashboard implementation.');
  } else {
    console.log(`⚠️  ${totalSystems - passingSystems} system(s) need attention before proceeding.`);
  }
  
  return results;
}

runSystemDiagnostic().catch(console.error);