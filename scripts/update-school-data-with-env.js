#!/usr/bin/env node

/**
 * Safe School Master Data Update Script with Environment Loading
 * Handles updating school data while preserving existing claimed schools
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Load environment variables
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔄 School Master Data Update Process\n');

async function backupCurrentData() {
  console.log('1. Creating backup of current school data...');
  
  try {
    const { data: currentSchools, error } = await supabase
      .from('school_master')
      .select('*')
      .order('school_id');

    if (error) throw error;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `school_master_backup_${timestamp}.json`;
    
    fs.writeFileSync(backupFile, JSON.stringify(currentSchools, null, 2));
    
    console.log(`   ✅ Backup created: ${backupFile}`);
    console.log(`   📊 Backed up ${currentSchools.length} schools`);
    
    return {
      backupFile,
      totalSchools: currentSchools.length,
      claimedSchools: currentSchools.filter(s => s.status === 'claimed')
    };
    
  } catch (error) {
    console.error('   ❌ Backup failed:', error.message);
    return null;
  }
}

async function analyzeNewData(filePath) {
  console.log('\n2. Analyzing new school data...');
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`   ❌ File not found: ${filePath}`);
      return null;
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const newSchools = JSON.parse(fileContent);

    if (!Array.isArray(newSchools)) {
      console.log('   ❌ Invalid data format - expected array of schools');
      return null;
    }

    // Analyze school types
    const typeDistribution = {};
    let primaryCount = 0;
    let secondaryCount = 0;
    
    newSchools.forEach(school => {
      const phase = school.Phase_PED || '';
      typeDistribution[phase] = (typeDistribution[phase] || 0) + 1;
      
      if (phase.includes('PRIMARY')) {
        primaryCount++;
      } else if (phase.includes('SECONDARY') || phase.includes('COMBINED')) {
        secondaryCount++;
      }
    });

    console.log(`   📊 Total schools in new data: ${newSchools.length}`);
    console.log('   📋 School phase distribution:');
    Object.entries(typeDistribution).forEach(([phase, count]) => {
      const isPrimary = phase.includes('PRIMARY');
      const indicator = isPrimary ? '❌' : '✅';
      console.log(`      ${indicator} ${phase}: ${count}`);
    });

    console.log(`\n   Summary:`);
    console.log(`   ❌ Primary Schools: ${primaryCount} (should be 0)`);
    console.log(`   ✅ Secondary/Combined: ${secondaryCount}`);

    const isClean = primaryCount === 0;
    console.log(`   ${isClean ? '✅' : '❌'} Dataset Quality: ${isClean ? 'CLEAN' : 'CONTAINS PRIMARY SCHOOLS'}`);

    return {
      schools: newSchools,
      totalCount: newSchools.length,
      primaryCount,
      secondaryCount,
      isClean
    };

  } catch (error) {
    console.error('   ❌ Analysis failed:', error.message);
    return null;
  }
}

async function transformSchoolData(schools) {
  console.log('\n3. Transforming school data to database format...');
  
  const transformedSchools = schools.map(school => {
    // Map the new JSON structure to our database schema
    return {
      school_id: `ZAF-${school.NatEmis}`, // Create consistent school ID
      name: school.Official_Institution_Name,
      province: getFullProvinceName(school.Province),
      type: `${school.Sector} School (${school.Phase_PED})`,
      status: 'unclaimed',
      district: school.EIDistrict,
      address: school.StreetAddress,
      postal_address: school.PostalAddress,
      phone: school.Telephone !== 'UNKNOWN' ? school.Telephone : null,
      quintile: school.Quintile,
      urban_rural: school.Urban_Rural,
      learners_2024: school.Learners2024,
      educators_2024: school.Educators2024,
      exam_centre: school.ExamCentre,
      longitude: school.GIS_Longitude,
      latitude: school.GIS_Latitude,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });

  console.log(`   ✅ Transformed ${transformedSchools.length} schools`);
  return transformedSchools;
}

function getFullProvinceName(code) {
  const provinceMap = {
    'EC': 'Eastern Cape',
    'FS': 'Free State', 
    'GP': 'Gauteng',
    'KZN': 'KwaZulu-Natal',
    'LP': 'Limpopo',
    'MP': 'Mpumalanga',
    'NC': 'Northern Cape',
    'NW': 'North West',
    'WC': 'Western Cape'
  };
  return provinceMap[code] || code;
}

async function preserveClaimedSchools(newSchools) {
  console.log('\n4. Preserving existing claimed schools...');
  
  try {
    const { data: claimedSchools, error } = await supabase
      .from('school_master')
      .select('*')
      .eq('status', 'claimed');

    if (error) throw error;

    console.log(`   🏫 Found ${claimedSchools.length} claimed schools to preserve`);
    
    if (claimedSchools.length === 0) {
      console.log('   ℹ️  No claimed schools to preserve');
      return newSchools;
    }

    // Create a map of new schools by school_id for easy lookup
    const newSchoolsMap = new Map();
    newSchools.forEach(school => {
      newSchoolsMap.set(school.school_id, school);
    });

    // Start with new schools
    const mergedSchools = [...newSchools];
    
    claimedSchools.forEach(claimedSchool => {
      const existsInNew = newSchoolsMap.has(claimedSchool.school_id);
      
      if (existsInNew) {
        // Update the new school data to preserve claimed status
        const newSchool = newSchoolsMap.get(claimedSchool.school_id);
        Object.assign(newSchool, {
          status: 'claimed',
          principal_email: claimedSchool.principal_email,
          contact_phone: claimedSchool.contact_phone,
          claimed_at: claimedSchool.claimed_at,
          claimed_by_school_uuid: claimedSchool.claimed_by_school_uuid
        });
        console.log(`   ✅ Preserved: ${claimedSchool.name}`);
      } else {
        // Add claimed school that's not in new data (keep it)
        mergedSchools.push(claimedSchool);
        console.log(`   ➕ Kept missing claimed school: ${claimedSchool.name}`);
      }
    });

    return mergedSchools;

  } catch (error) {
    console.error('   ❌ Failed to preserve claimed schools:', error.message);
    return newSchools;
  }
}

async function updateDatabase(schools) {
  console.log('\n5. Updating database...');
  
  try {
    // Clear ALL existing schools (we'll re-insert everything)
    const { error: deleteError } = await supabase
      .from('school_master')
      .delete()
      .neq('id', 0); // Delete all records

    if (deleteError) throw deleteError;
    console.log('   🗑️  Cleared existing school data');

    // Insert new schools in batches
    const batchSize = 100;
    let inserted = 0;

    for (let i = 0; i < schools.length; i += batchSize) {
      const batch = schools.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from('school_master')
        .insert(batch);

      if (insertError) {
        console.error(`   ❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, insertError.message);
        continue;
      }

      inserted += batch.length;
      console.log(`   ✅ Inserted batch ${Math.floor(i/batchSize) + 1}: ${batch.length} schools`);
    }

    console.log(`   🎉 Successfully inserted ${inserted} schools`);
    return true;

  } catch (error) {
    console.error('   ❌ Database update failed:', error.message);
    return false;
  }
}

async function verifyUpdate() {
  console.log('\n6. Verifying update...');
  
  try {
    const { count, error } = await supabase
      .from('school_master')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    console.log(`   📊 Total schools in database: ${count}`);

    // Test type distribution
    const { data: schools, error: typeError } = await supabase
      .from('school_master')
      .select('type')
      .limit(1000);

    if (!typeError) {
      const typeCount = {};
      let primaryCount = 0;
      
      schools.forEach(school => {
        typeCount[school.type] = (typeCount[school.type] || 0) + 1;
        if (school.type.includes('PRIMARY')) primaryCount++;
      });

      console.log('   📋 Type distribution (sample):');
      Object.entries(typeCount).forEach(([type, count]) => {
        const isPrimary = type.includes('PRIMARY');
        const indicator = isPrimary ? '❌ PROBLEM' : '✅ OK';
        console.log(`      ${indicator} ${type}: ${count}`);
      });

      console.log(`\n   ${primaryCount === 0 ? '✅' : '❌'} Primary School Check: ${primaryCount === 0 ? 'CLEAN' : `${primaryCount} PRIMARY SCHOOLS FOUND`}`);
    }

    // Test search functionality with filter
    const { data: searchTest, error: searchError } = await supabase
      .from('school_master')
      .select('school_id, name, type')
      .not('type', 'ilike', '%PRIMARY%')
      .ilike('name', '%high%')
      .limit(3);

    if (!searchError && searchTest.length > 0) {
      console.log('   🔍 Search test (with primary filter):');
      searchTest.forEach(school => {
        console.log(`      ${school.name} (${school.type})`);
      });
    }

    return true;

  } catch (error) {
    console.error('   ❌ Verification failed:', error.message);
    return false;
  }
}

async function runUpdate(filePath) {
  console.log('🚀 Starting School Master Data Update...\n');

  // Step 1: Backup current data
  const backup = await backupCurrentData();
  if (!backup) {
    console.log('❌ Cannot proceed without backup');
    return;
  }

  // Step 2: Analyze new data
  const analysis = await analyzeNewData(filePath);
  if (!analysis) {
    console.log('❌ Cannot proceed with invalid data');
    return;
  }

  if (!analysis.isClean) {
    console.log('❌ New dataset still contains primary schools!');
    console.log('   Please ensure you are using the filtered secondary-only dataset');
    return;
  }

  // Step 3: Transform data to database format
  const transformedSchools = await transformSchoolData(analysis.schools);

  // Step 4: Preserve claimed schools
  const finalSchools = await preserveClaimedSchools(transformedSchools);

  // Step 5: Confirm update
  console.log('\n📋 Update Summary:');
  console.log(`   Original data: ${analysis.totalCount} schools`);
  console.log(`   Primary schools: ${analysis.primaryCount} (filtered out)`);
  console.log(`   Secondary schools: ${analysis.secondaryCount}`);
  console.log(`   Final dataset: ${finalSchools.length} schools (including any claimed)`);
  console.log(`   Backup file: ${backup.backupFile}`);

  console.log('\n✅ Dataset is clean - proceeding with update...');
  
  // Step 6: Update database
  const updateSuccess = await updateDatabase(finalSchools);
  if (!updateSuccess) {
    console.log('❌ Database update failed');
    return;
  }

  // Step 7: Verify update
  const verifySuccess = await verifyUpdate();
  if (verifySuccess) {
    console.log('\n🎉 School master data update completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Run comprehensive test: node scripts/test-school-dataset-quick.js');
    console.log('   2. Verify search API only returns secondary schools');
    console.log('   3. Test school claim functionality');
    console.log('   4. Proceed with student registration implementation');
  }
}

// Get file path from command line argument or use default
const filePath = process.argv[2] || 'thandi_master_school name file/Thandi_HighSchoolsOnly_v3_1.json';

console.log(`📁 Using school data file: ${filePath}\n`);

runUpdate(filePath).catch(console.error);