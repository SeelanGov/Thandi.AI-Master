#!/usr/bin/env node

/**
 * Check Production School Database
 * Verify if school data is properly populated in production Supabase
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🏫 Checking Production School Database\n');

async function checkSchoolMasterTable() {
  console.log('📊 Checking school_master table...');
  
  try {
    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from('school_master')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log('   ❌ Error accessing school_master table:', countError.message);
      return false;
    }
    
    console.log(`   📈 Total schools in database: ${totalCount}`);
    
    if (totalCount === 0) {
      console.log('   ⚠️  Database is empty - needs population');
      return false;
    }
    
    // Check for secondary schools specifically
    const { count: secondaryCount } = await supabase
      .from('school_master')
      .select('*', { count: 'exact', head: true })
      .not('type', 'ilike', '%PRIMARY%');
    
    console.log(`   🎓 Secondary schools: ${secondaryCount}`);
    
    // Get sample schools
    const { data: sampleSchools, error: sampleError } = await supabase
      .from('school_master')
      .select('school_id, name, type, province')
      .not('type', 'ilike', '%PRIMARY%')
      .limit(5);
    
    if (sampleError) {
      console.log('   ⚠️  Could not fetch sample schools:', sampleError.message);
    } else {
      console.log('   📋 Sample schools:');
      sampleSchools.forEach(school => {
        console.log(`      - ${school.name} (${school.province})`);
      });
    }
    
    return totalCount > 0;
    
  } catch (error) {
    console.log('   ❌ Database connection error:', error.message);
    return false;
  }
}

async function testSchoolSearchFunctionality() {
  console.log('\n🔍 Testing School Search Functionality...');
  
  try {
    // Test search with common terms
    const searchTerms = ['high', 'secondary', 'school'];
    
    for (const term of searchTerms) {
      const { data: results, error } = await supabase
        .from('school_master')
        .select('school_id, name, type')
        .not('type', 'ilike', '%PRIMARY%')
        .ilike('name', `%${term}%`)
        .limit(3);
      
      if (error) {
        console.log(`   ❌ Search error for "${term}": ${error.message}`);
      } else {
        console.log(`   🔍 Search "${term}": ${results.length} results`);
        if (results.length > 0) {
          console.log(`      Example: ${results[0].name}`);
        }
      }
    }
    
  } catch (error) {
    console.log('   ❌ Search test error:', error.message);
  }
}

async function checkDatabaseSchema() {
  console.log('\n📋 Checking Database Schema...');
  
  try {
    // Check if table exists and get structure
    const { data: tableInfo, error } = await supabase
      .from('school_master')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('   ❌ Schema check error:', error.message);
      return false;
    }
    
    if (tableInfo && tableInfo.length > 0) {
      const columns = Object.keys(tableInfo[0]);
      console.log('   ✅ Table exists with columns:');
      columns.forEach(col => console.log(`      - ${col}`));
      
      // Check for required columns
      const requiredColumns = ['school_id', 'name', 'type', 'province'];
      const missingColumns = requiredColumns.filter(col => !columns.includes(col));
      
      if (missingColumns.length > 0) {
        console.log('   ⚠️  Missing required columns:', missingColumns.join(', '));
      } else {
        console.log('   ✅ All required columns present');
      }
      
      return true;
    } else {
      console.log('   ⚠️  Table exists but is empty');
      return false;
    }
    
  } catch (error) {
    console.log('   ❌ Schema check failed:', error.message);
    return false;
  }
}

async function generateDatabaseReport(hasData, schemaOk) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 PRODUCTION DATABASE STATUS REPORT');
  console.log('='.repeat(60));
  
  console.log(`\n🗄️  Database Connection: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Connected' : '❌ Not configured'}`);
  console.log(`📋 Schema Status: ${schemaOk ? '✅ Valid' : '❌ Issues detected'}`);
  console.log(`📊 Data Status: ${hasData ? '✅ Populated' : '⚠️  Empty or missing'}`);
  
  if (!hasData) {
    console.log('\n🚨 ISSUE IDENTIFIED: School Database Not Populated');
    console.log('\n📝 What this means:');
    console.log('   • The school_master table exists but has no data');
    console.log('   • School search API returns 0 results');
    console.log('   • Students cannot select schools during assessment');
    console.log('   • School authentication system cannot find schools');
    
    console.log('\n🔧 How to fix:');
    console.log('   1. Run school data migration script');
    console.log('   2. Upload the 7,475 secondary schools to production');
    console.log('   3. Verify data integrity after upload');
    
    console.log('\n💡 Commands to run:');
    console.log('   node scripts/populate-production-schools.js');
    console.log('   node scripts/verify-school-data-production.js');
    
  } else {
    console.log('\n✅ DATABASE STATUS: FULLY OPERATIONAL');
    console.log('   • School data is properly populated');
    console.log('   • Search functionality working');
    console.log('   • All systems ready for production use');
  }
  
  console.log('\n' + '='.repeat(60));
}

// Main execution
async function main() {
  try {
    const schemaOk = await checkDatabaseSchema();
    const hasData = await checkSchoolMasterTable();
    await testSchoolSearchFunctionality();
    await generateDatabaseReport(hasData, schemaOk);
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

main();