#!/usr/bin/env node

/**
 * Filter the updated dataset to only include secondary schools
 * Remove all primary schools before upload
 */

import fs from 'fs';
import path from 'path';

console.log('🔧 Filtering Dataset: Secondary Schools Only...\n');

async function filterDataset() {
  const inputPath = path.join(process.cwd(), 'thandi_master_school name file', 'SA_Schools_Master_Thandi_v3.json');
  const outputPath = path.join(process.cwd(), 'SA_Schools_Secondary_Only_READY.json');
  
  if (!fs.existsSync(inputPath)) {
    console.log('❌ Input file not found:', inputPath);
    return;
  }

  try {
    console.log('📖 Reading dataset...');
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const schools = JSON.parse(rawData);
    
    console.log(`📊 Total schools in dataset: ${schools.length}`);

    // Filter to only secondary and combined schools
    console.log('🔍 Filtering schools...');
    const filteredSchools = schools.filter(school => {
      const phase = school.Phase_PED || '';
      
      // Include only secondary, high, combined, and comprehensive schools
      const isRelevant = (
        phase.includes('SECONDARY') || 
        phase.includes('HIGH') || 
        phase.includes('COMBINED') || 
        phase.includes('COMPREHENSIVE')
      ) && !phase.includes('PRIMARY'); // Explicitly exclude primary
      
      return isRelevant;
    });

    console.log(`✅ Filtered to ${filteredSchools.length} relevant schools`);
    console.log(`📉 Removed ${schools.length - filteredSchools.length} primary schools`);

    // Convert to THANDI format
    console.log('🔄 Converting to THANDI format...');
    const thandiFormat = filteredSchools.map(school => ({
      school_id: `ZAF-${school.Sector === 'PUBLIC' ? 'P' : 'I'}-${school.NatEmis}`,
      institution_name: school.Official_Institution_Name,
      province: getFullProvinceName(school.Province),
      type: `${school.Sector === 'PUBLIC' ? 'Public' : 'Independent'} School (${school.Phase_PED})`,
      onboarding_status: 'unclaimed',
      natemis: school.NatEmis,
      learners: school.Learners2024 || 0,
      educators: school.Educators2024 || 0,
      quintile: school.Quintile ? parseInt(school.Quintile.replace('Q', '')) : null,
      urban_rural: school.Urban_Rural || 'Unknown',
      district: school.EIDistrict || 'Unknown',
      phone: school.Telephone || null,
      coordinates: school.GIS_Longitude && school.GIS_Latitude ? 
        `${school.GIS_Latitude},${school.GIS_Longitude}` : null
    }));

    // Save filtered dataset
    fs.writeFileSync(outputPath, JSON.stringify(thandiFormat, null, 2));
    
    console.log(`\n✅ Filtered dataset saved: ${outputPath}`);
    console.log(`📊 Ready for upload: ${thandiFormat.length} schools`);

    // Show sample of filtered schools
    console.log('\n🔍 Sample of filtered schools:');
    thandiFormat.slice(0, 10).forEach(school => {
      console.log(`   ✅ ${school.institution_name} (${school.type})`);
    });

    // Analyze by province
    const provinceCount = {};
    thandiFormat.forEach(school => {
      provinceCount[school.province] = (provinceCount[school.province] || 0) + 1;
    });

    console.log('\n📊 Schools by Province:');
    Object.entries(provinceCount).forEach(([province, count]) => {
      console.log(`   ${province}: ${count} schools`);
    });

    return {
      original: schools.length,
      filtered: thandiFormat.length,
      outputFile: outputPath
    };

  } catch (error) {
    console.error('❌ Filtering failed:', error.message);
    return null;
  }
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

async function runFilter() {
  const result = await filterDataset();
  
  if (result) {
    console.log('\n🎯 FILTERING COMPLETE');
    console.log(`   📊 ${result.original} → ${result.filtered} schools (${Math.round((result.filtered/result.original)*100)}%)`);
    console.log(`   📁 Output: ${result.outputFile}`);
    
    console.log('\n✅ READY FOR UPLOAD');
    console.log('   🔧 Use the filtered file for database upload');
    console.log('   ⚠️  Do NOT upload the original v3 file (contains primary schools)');
    
    console.log('\n📋 Next Steps:');
    console.log('   1. Review the filtered dataset');
    console.log('   2. Backup current database');
    console.log('   3. Upload SA_Schools_Secondary_Only_READY.json');
    console.log('   4. Test school search functionality');
  }
}

runFilter().catch(console.error);