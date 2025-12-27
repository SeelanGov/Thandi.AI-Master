#!/usr/bin/env node

/**
 * Analyze the updated school dataset to verify it's ready for upload
 * Check for primary schools and validate data quality
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Analyzing Updated School Dataset...\n');

async function analyzeDataset() {
  const datasetPath = path.join(process.cwd(), 'thandi_master_school name file', 'SA_Schools_Master_Thandi_v3.json');
  
  if (!fs.existsSync(datasetPath)) {
    console.log('❌ Dataset file not found:', datasetPath);
    return;
  }

  try {
    const rawData = fs.readFileSync(datasetPath, 'utf8');
    const schools = JSON.parse(rawData);
    
    console.log(`📊 Dataset Analysis: ${schools.length} total schools\n`);

    // Analyze by phase/type
    const phaseDistribution = {};
    const typeDistribution = {};
    const sectorDistribution = {};
    const provinceDistribution = {};
    
    let primaryCount = 0;
    let secondaryCount = 0;
    let combinedCount = 0;
    let otherCount = 0;
    
    schools.forEach(school => {
      const phase = school.Phase_PED || 'UNKNOWN';
      const type = school.Type_DoE || 'UNKNOWN';
      const sector = school.Sector || 'UNKNOWN';
      const province = school.Province || 'UNKNOWN';
      
      phaseDistribution[phase] = (phaseDistribution[phase] || 0) + 1;
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;
      sectorDistribution[sector] = (sectorDistribution[sector] || 0) + 1;
      provinceDistribution[province] = (provinceDistribution[province] || 0) + 1;
      
      // Categorize for THANDI relevance
      if (phase.includes('PRIMARY')) {
        primaryCount++;
      } else if (phase.includes('SECONDARY') || phase.includes('HIGH')) {
        secondaryCount++;
      } else if (phase.includes('COMBINED') || phase.includes('COMPREHENSIVE')) {
        combinedCount++;
      } else {
        otherCount++;
      }
    });

    console.log('📋 Phase Distribution:');
    Object.entries(phaseDistribution).forEach(([phase, count]) => {
      const isPrimary = phase.includes('PRIMARY');
      const isSecondary = phase.includes('SECONDARY') || phase.includes('HIGH');
      const isCombined = phase.includes('COMBINED') || phase.includes('COMPREHENSIVE');
      
      let indicator = '⚠️';
      if (isPrimary) indicator = '❌ EXCLUDE';
      else if (isSecondary || isCombined) indicator = '✅ INCLUDE';
      
      console.log(`   ${indicator} ${phase}: ${count} schools`);
    });

    console.log('\n📋 Sector Distribution:');
    Object.entries(sectorDistribution).forEach(([sector, count]) => {
      console.log(`   ${sector}: ${count} schools`);
    });

    console.log('\n📋 Province Distribution:');
    Object.entries(provinceDistribution).forEach(([province, count]) => {
      console.log(`   ${province}: ${count} schools`);
    });

    console.log('\n🎯 THANDI Relevance Analysis:');
    console.log(`   ❌ Primary Schools: ${primaryCount} (EXCLUDE - Grades R-7)`);
    console.log(`   ✅ Secondary Schools: ${secondaryCount} (INCLUDE - Grades 8-12)`);
    console.log(`   ✅ Combined Schools: ${combinedCount} (INCLUDE - Grades R-12)`);
    console.log(`   ⚠️  Other/Unknown: ${otherCount} (REVIEW)`);

    const relevantSchools = secondaryCount + combinedCount;
    const excludeSchools = primaryCount;
    
    console.log('\n📊 Upload Recommendation:');
    if (primaryCount > 0) {
      console.log('   🚨 DATASET NOT READY FOR UPLOAD');
      console.log(`   ❌ Contains ${primaryCount} primary schools that must be filtered out`);
      console.log(`   ✅ Would include ${relevantSchools} relevant schools after filtering`);
      console.log(`   📉 Reduction: ${schools.length} → ${relevantSchools} schools (${Math.round((relevantSchools/schools.length)*100)}%)`);
    } else {
      console.log('   ✅ DATASET READY FOR UPLOAD');
      console.log(`   ✅ Contains only relevant schools for Grades 10-12 students`);
    }

    // Sample some schools for manual verification
    console.log('\n🔍 Sample Schools for Verification:');
    const sampleSize = Math.min(10, schools.length);
    for (let i = 0; i < sampleSize; i++) {
      const school = schools[i];
      const phase = school.Phase_PED || 'UNKNOWN';
      const isPrimary = phase.includes('PRIMARY');
      const indicator = isPrimary ? '❌' : '✅';
      
      console.log(`   ${indicator} ${school.Official_Institution_Name} (${phase})`);
    }

    return {
      total: schools.length,
      primary: primaryCount,
      secondary: secondaryCount,
      combined: combinedCount,
      relevant: relevantSchools,
      readyForUpload: primaryCount === 0
    };

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    return null;
  }
}

async function generateFilteredDataset(analysis) {
  if (analysis.readyForUpload) {
    console.log('\n✅ No filtering needed - dataset is ready!');
    return;
  }

  console.log('\n🔧 Generating Filtered Dataset...');
  
  const datasetPath = path.join(process.cwd(), 'thandi_master_school name file', 'SA_Schools_Master_Thandi_v3.json');
  const outputPath = path.join(process.cwd(), 'thandi_master_school name file', 'SA_Schools_Secondary_Only.json');
  
  try {
    const rawData = fs.readFileSync(datasetPath, 'utf8');
    const schools = JSON.parse(rawData);
    
    // Filter to only secondary and combined schools
    const filteredSchools = schools.filter(school => {
      const phase = school.Phase_PED || '';
      return !phase.includes('PRIMARY') && (
        phase.includes('SECONDARY') || 
        phase.includes('HIGH') || 
        phase.includes('COMBINED') || 
        phase.includes('COMPREHENSIVE')
      );
    });

    // Convert to THANDI format
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

    fs.writeFileSync(outputPath, JSON.stringify(thandiFormat, null, 2));
    
    console.log(`   ✅ Filtered dataset created: ${outputPath}`);
    console.log(`   📊 Schools: ${schools.length} → ${filteredSchools.length} (${Math.round((filteredSchools.length/schools.length)*100)}%)`);
    console.log(`   🎯 Ready for upload to THANDI database`);

  } catch (error) {
    console.error('   ❌ Filtering failed:', error.message);
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

async function runAnalysis() {
  const analysis = await analyzeDataset();
  
  if (analysis) {
    await generateFilteredDataset(analysis);
    
    console.log('\n🎯 Final Recommendation:');
    if (analysis.readyForUpload) {
      console.log('   ✅ Original dataset is ready for upload');
    } else {
      console.log('   🔧 Use the filtered dataset: SA_Schools_Secondary_Only.json');
      console.log('   ⚠️  Original dataset contains primary schools - do not upload directly');
    }
    
    console.log('\n📋 Next Steps:');
    console.log('   1. Review the filtered dataset');
    console.log('   2. Backup current database');
    console.log('   3. Upload filtered dataset only');
    console.log('   4. Test school search functionality');
  }
}

runAnalysis().catch(console.error);