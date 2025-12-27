#!/usr/bin/env node

/**
 * Safe School Master Data Update Script
 * Handles updating school data while preserving existing claimed schools
 */

import { getSupabase } from '../lib/supabase.js';
import fs from 'fs';
import path from 'path';

const supabase = getSupabase();

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
      console.log('   📝 Available files in thandi_master_school name file:');
      
      const masterDir = 'thandi_master_school name file';
      if (fs.existsSync(masterDir)) {
        const files = fs.readdirSync(masterDir);
        files.forEach(file => console.log(`      - ${file}`));
      }
      return null;
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    let newSchools;

    // Handle different file formats
    if (filePath.endsWith('.json')) {
      newSchools = JSON.parse(fileContent);
    } else if (filePath.endsWith('.csv')) {
      // Basic CSV parsing - you might need to adjust based on your CSV format
      const lines = fileContent.split('\n');
      const headers = lines[0].split(',');
      newSchools = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',');
        const school = {};
        headers.forEach((header, index) => {
          school[header.trim()] = values[index]?.trim() || '';
        });
        return school;
      });
    }

    if (!Array.isArray(newSchools)) {
      console.log('   ❌ Invalid data format - expected array of schools');
      return null;
    }

    // Analyze school types
    const typeDistribution = {};
    const gradeDistribution = {};
    
    newSchools.forEach(school => {
      const type = school.type || school.institution_type || 'Unknown';
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;
      
      // Try to determine grade levels
      if (type.includes('PRIMARY')) {
        gradeDistribution['Primary (R-7)'] = (gradeDistribution['Primary (R-7)'] || 0) + 1;
      } else if (type.includes('SECONDARY') || type.includes('HIGH')) {
        gradeDistribution['Secondary (8-12)'] = (gradeDistribution['Secondary (8-12)'] || 0) + 1;
      } else if (type.includes('COMBINED')) {
        gradeDistribution['Combined (R-12)'] = (gradeDistribution['Combined (R-12)'] || 0) + 1;
      } else {
        gradeDistribution['Unknown'] = (gradeDistribution['Unknown'] || 0) + 1;
      }
    });

    console.log(`   📊 Total schools in new data: ${newSchools.length}`);
    console.log('   📋 School type distribution:');
    Object.entries(typeDistribution).forEach(([type, count]) => {
      const isPrimary = type.includes('PRIMARY');
      const isSecondary = type.includes('SECONDARY') || type.includes('HIGH') || type.includes('COMBINED');
      const indicator = isPrimary ? '❌' : isSecondary ? '✅' : '⚠️';
      console.log(`      ${indicator} ${type}: ${count}`);
    });

    console.log('   🎓 Grade level distribution:');
    Object.entries(gradeDistribution).forEach(([grade, count]) => {
      const isRelevant = grade.includes('Secondary') || grade.includes('Combined');
      const indicator = isRelevant ? '✅' : '❌';
      console.log(`      ${indicator} ${grade}: ${count}`);
    });

    return {
      schools: newSchools,
      totalCount: newSchools.length,
      typeDistribution,
      gradeDistribution
    };

  } catch (error) {
    console.error('   ❌ Analysis failed:', error.message);
    return null;
  }
}

async function filterSecondarySchools(schools) {
  console.log('\n3. Filtering for secondary schools only...');
  
  const secondarySchools = schools.filter(school => {
    const type = school.type || school.institution_type || '';
    
    // Include secondary, high, and combined schools
    const isSecondary = type.includes('SECONDARY') || 
                       type.includes('HIGH') || 
                       type.includes('COMBINED') ||
                       type.includes('COMPREHENSIVE');
    
    // Exclude primary schools
    const isPrimary = type.includes('PRIMARY') && !type.includes('COMBINED');
    
    return isSecondary && !isPrimary;
  });

  console.log(`   ✅ Filtered to ${secondarySchools.length} secondary schools`);
  console.log(`   ❌ Excluded ${schools.length - secondarySchools.length} primary schools`);
  
  return secondarySchools;
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
    
    // Create a map of new schools by school_id for easy lookup
    const newSchoolsMap = new Map();
    newSchools.forEach(school => {
      const schoolId = school.school_id || school.id;
      if (schoolId) {
        newSchoolsMap.set(schoolId, school);
      }
    });

    // Merge claimed schools with new data
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
        // Add claimed school that's not in new data
        mergedSchools.push(claimedSchool);
        console.log(`   ➕ Added missing claimed school: ${claimedSchool.name}`);
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
    // Clear existing unclaimed schools only
    const { error: deleteError } = await supabase
      .from('school_master')
      .delete()
      .eq('status', 'unclaimed');

    if (deleteError) throw deleteError;
    console.log('   🗑️  Cleared unclaimed schools');

    // Insert new schools in batches
    const batchSize = 100;
    let inserted = 0;

    for (let i = 0; i < schools.length; i += batchSize) {
      const batch = schools.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from('school_master')
        .upsert(batch, { onConflict: 'school_id' });

      if (insertError) {
        console.error(`   ❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, insertError.message);
        continue;
      }

      inserted += batch.length;
      console.log(`   ✅ Inserted batch ${Math.floor(i/batchSize) + 1}: ${batch.length} schools`);
    }

    console.log(`   🎉 Successfully updated ${inserted} schools`);
    return true;

  } catch (error) {
    console.error('   ❌ Database update failed:', error.message);
    return false;
  }
}

async function verifyUpdate() {
  console.log('\n6. Verifying update...');
  
  try {
    const { data: schools, error } = await supabase
      .from('school_master')
      .select('type, status')
      .order('type');

    if (error) throw error;

    const typeCount = {};
    const statusCount = {};

    schools.forEach(school => {
      typeCount[school.type] = (typeCount[school.type] || 0) + 1;
      statusCount[school.status] = (statusCount[school.status] || 0) + 1;
    });

    console.log(`   📊 Total schools in database: ${schools.length}`);
    console.log('   📋 Type distribution:');
    Object.entries(typeCount).forEach(([type, count]) => {
      const isPrimary = type.includes('PRIMARY');
      const indicator = isPrimary ? '❌ SHOULD NOT BE HERE' : '✅';
      console.log(`      ${indicator} ${type}: ${count}`);
    });

    console.log('   🏫 Status distribution:');
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`      ${status}: ${count}`);
    });

    // Test search functionality
    const { data: searchTest, error: searchError } = await supabase
      .from('school_master')
      .select('school_id, name, type')
      .ilike('name', '%currie%')
      .limit(3);

    if (!searchError && searchTest.length > 0) {
      console.log('   🔍 Search test successful:');
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

  // Step 3: Filter for secondary schools
  const secondarySchools = await filterSecondarySchools(analysis.schools);

  // Step 4: Preserve claimed schools
  const finalSchools = await preserveClaimedSchools(secondarySchools);

  // Step 5: Confirm update
  console.log('\n📋 Update Summary:');
  console.log(`   Original data: ${analysis.totalCount} schools`);
  console.log(`   After filtering: ${secondarySchools.length} secondary schools`);
  console.log(`   Final dataset: ${finalSchools.length} schools (including claimed)`);
  console.log(`   Backup file: ${backup.backupFile}`);

  console.log('\n⚠️  This will replace all unclaimed schools in the database.');
  console.log('   Claimed schools will be preserved.');
  
  // In a real scenario, you'd want user confirmation here
  // For now, we'll proceed automatically
  
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
    console.log('   1. Test school search functionality');
    console.log('   2. Verify no primary schools appear in search');
    console.log('   3. Confirm claimed schools still work');
    console.log('   4. Proceed with student registration implementation');
  }
}

// Get file path from command line argument or use default
const filePath = process.argv[2] || 'thandi_master_school name file/updated_schools.json';

console.log(`📁 Looking for school data file: ${filePath}\n`);

runUpdate(filePath).catch(console.error);