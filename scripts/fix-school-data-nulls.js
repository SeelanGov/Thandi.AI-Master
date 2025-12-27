#!/usr/bin/env node

/**
 * Fix School Data - Handle Null Names
 * Analyzes and fixes null name issues in school data
 */

import { config } from 'dotenv';
import fs from 'fs';

// Load environment variables
config({ path: '.env.local' });

console.log('🔍 Analyzing School Data for Null Names\n');

function analyzeSchoolData(filePath) {
  console.log(`📁 Reading: ${filePath}`);
  
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const schools = JSON.parse(fileContent);
  
  console.log(`📊 Total schools: ${schools.length}`);
  
  // Find schools with null/empty names
  const nullNameSchools = schools.filter(school => 
    !school.Official_Institution_Name || 
    school.Official_Institution_Name.trim() === ''
  );
  
  console.log(`❌ Schools with null/empty names: ${nullNameSchools.length}`);
  
  if (nullNameSchools.length > 0) {
    console.log('\n🔍 Sample null name schools:');
    nullNameSchools.slice(0, 5).forEach((school, index) => {
      console.log(`   ${index + 1}. NatEmis: ${school.NatEmis}`);
      console.log(`      Name: "${school.Official_Institution_Name}"`);
      console.log(`      Province: ${school.Province}`);
      console.log(`      Phase: ${school.Phase_PED}`);
      console.log('');
    });
  }
  
  // Find schools with other potential issues
  const nullEmisSchools = schools.filter(school => !school.NatEmis);
  const nullProvinceSchools = schools.filter(school => !school.Province);
  const nullPhaseSchools = schools.filter(school => !school.Phase_PED);
  
  console.log(`📋 Data Quality Report:`);
  console.log(`   Missing NatEmis: ${nullEmisSchools.length}`);
  console.log(`   Missing Province: ${nullProvinceSchools.length}`);
  console.log(`   Missing Phase: ${nullPhaseSchools.length}`);
  
  return {
    total: schools.length,
    nullNames: nullNameSchools.length,
    validSchools: schools.filter(school => 
      school.Official_Institution_Name && 
      school.Official_Institution_Name.trim() !== '' &&
      school.NatEmis &&
      school.Province &&
      school.Phase_PED
    )
  };
}

function createCleanDataset(filePath) {
  console.log('\n🧹 Creating clean dataset...');
  
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const schools = JSON.parse(fileContent);
  
  // Filter out schools with missing required data
  const cleanSchools = schools.filter(school => {
    const hasName = school.Official_Institution_Name && school.Official_Institution_Name.trim() !== '';
    const hasEmis = school.NatEmis;
    const hasProvince = school.Province;
    const hasPhase = school.Phase_PED;
    
    return hasName && hasEmis && hasProvince && hasPhase;
  });
  
  console.log(`✅ Clean schools: ${cleanSchools.length}`);
  console.log(`❌ Filtered out: ${schools.length - cleanSchools.length}`);
  
  // Save clean dataset
  const cleanFilePath = filePath.replace('.json', '_CLEAN.json');
  fs.writeFileSync(cleanFilePath, JSON.stringify(cleanSchools, null, 2));
  
  console.log(`💾 Clean dataset saved: ${cleanFilePath}`);
  
  return cleanFilePath;
}

// Main execution
const filePath = process.argv[2] || 'thandi_master_school name file/Thandi_HighSchoolsOnly_v3_1.json';

try {
  const analysis = analyzeSchoolData(filePath);
  
  if (analysis.nullNames > 0) {
    console.log('\n⚠️  Data quality issues found!');
    const cleanFile = createCleanDataset(filePath);
    
    console.log('\n📋 Next Steps:');
    console.log(`   1. Use clean dataset: ${cleanFile}`);
    console.log('   2. Re-run update script with clean data');
    console.log(`   3. Command: node scripts/update-school-data-simple.js "${cleanFile}"`);
  } else {
    console.log('\n✅ Data quality is good - no null names found');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
}