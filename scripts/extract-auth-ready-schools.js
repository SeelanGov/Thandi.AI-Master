import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function extractAuthReadySchools() {
  try {
    const filePath = path.join(__dirname, '..', 'thandi_master_school name file', 'SA_Schools_Master_v2_national_reissue.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const schools = JSON.parse(rawData);
    
    console.log('=== EXTRACTING AUTH-READY SCHOOLS ===');
    
    // Filter for secondary schools (our target market)
    const targetSchools = schools.filter(school => {
      return school.phase === 'SECONDARY_SCHOOL' || 
             school.phase === 'COMBINED_SCHOOL' ||
             (school.phase === 'PRIMARY_SCHOOL' && school.learners_2024 > 500); // Large primaries
    });
    
    console.log(`Filtered to ${targetSchools.length} target schools`);
    
    // Transform to our 5-column format
    const authReadySchools = targetSchools.map(school => {
      // Generate proper school_id format
      let schoolId;
      if (school.sector === 'PUBLIC') {
        schoolId = `ZAF-P-${school.natemis}`;
      } else if (school.sector === 'INDEPENDENT' || school.sector === 'Independent') {
        schoolId = `ZAF-I-${school.natemis}`;
      } else {
        schoolId = `ZAF-U-${school.natemis}`; // Unknown
      }
      
      // Clean up school name
      const cleanName = school.school_name
        .replace(/\s+/g, ' ')
        .trim()
        .toUpperCase();
      
      // Determine type with more detail
      let schoolType;
      if (school.sector === 'PUBLIC') {
        schoolType = `Public School (${school.phase.replace('_', ' ')})`;
      } else if (school.sector === 'INDEPENDENT' || school.sector === 'Independent') {
        schoolType = `Independent School`;
      } else {
        schoolType = `${school.sector} School`;
      }
      
      return {
        school_id: schoolId,
        institution_name: cleanName,
        province: school.province_name,
        type: schoolType,
        onboarding_status: 'unclaimed',
        // Additional metadata for internal use
        natemis: school.natemis,
        learners: school.learners_2024 || 0,
        educators: school.educators_2024 || 0,
        quintile: school.quintile,
        urban_rural: school.urban_rural,
        district: school.education_district,
        phone: school.telephone !== 'UNKNOWN' ? school.telephone : null,
        coordinates: school.latitude && school.longitude ? `${school.latitude},${school.longitude}` : null
      };
    });
    
    // Sort by province, then by name
    authReadySchools.sort((a, b) => {
      if (a.province !== b.province) {
        return a.province.localeCompare(b.province);
      }
      return a.institution_name.localeCompare(b.institution_name);
    });
    
    // Generate statistics
    const stats = {
      total: authReadySchools.length,
      byProvince: {},
      byType: {},
      withPhone: authReadySchools.filter(s => s.phone).length,
      withCoordinates: authReadySchools.filter(s => s.coordinates).length
    };
    
    authReadySchools.forEach(school => {
      stats.byProvince[school.province] = (stats.byProvince[school.province] || 0) + 1;
      stats.byType[school.type] = (stats.byType[school.type] || 0) + 1;
    });
    
    console.log('\n=== EXTRACTION STATISTICS ===');
    console.log(`Total auth-ready schools: ${stats.total}`);
    console.log(`Schools with phone: ${stats.withPhone} (${(stats.withPhone/stats.total*100).toFixed(1)}%)`);
    console.log(`Schools with coordinates: ${stats.withCoordinates} (${(stats.withCoordinates/stats.total*100).toFixed(1)}%)`);
    
    console.log('\n=== BY PROVINCE ===');
    Object.entries(stats.byProvince).forEach(([province, count]) => {
      console.log(`${province}: ${count} schools`);
    });
    
    console.log('\n=== BY TYPE ===');
    Object.entries(stats.byType).forEach(([type, count]) => {
      console.log(`${type}: ${count} schools`);
    });
    
    // Save the 5-column CSV for immediate use
    const csvHeader = 'school_id,institution_name,province,type,onboarding_status\n';
    const csvRows = authReadySchools.map(school => 
      `${school.school_id},"${school.institution_name}",${school.province},"${school.type}",${school.onboarding_status}`
    ).join('\n');
    
    const csvContent = csvHeader + csvRows;
    const csvPath = path.join(__dirname, '..', 'auth_ready_schools.csv');
    fs.writeFileSync(csvPath, csvContent);
    console.log(`\n✅ CSV saved to: ${csvPath}`);
    
    // Save full JSON for development use
    const jsonPath = path.join(__dirname, '..', 'auth_ready_schools.json');
    fs.writeFileSync(jsonPath, JSON.stringify(authReadySchools, null, 2));
    console.log(`✅ Full JSON saved to: ${jsonPath}`);
    
    // Sample schools for verification
    console.log('\n=== SAMPLE SCHOOLS ===');
    const samples = [
      authReadySchools.find(s => s.province === 'KwaZulu-Natal' && s.type.includes('Public')),
      authReadySchools.find(s => s.province === 'Gauteng' && s.type.includes('Independent')),
      authReadySchools.find(s => s.type.includes('COMBINED')),
    ].filter(Boolean);
    
    samples.forEach(school => {
      console.log(`${school.school_id}: ${school.institution_name} (${school.province})`);
    });
    
    return {
      totalExtracted: authReadySchools.length,
      csvPath,
      jsonPath,
      stats
    };
    
  } catch (error) {
    console.error('Error extracting auth-ready schools:', error);
    return null;
  }
}

// Run extraction
const result = extractAuthReadySchools();
if (result) {
  console.log('\n🚀 READY FOR SEEDING!');
  console.log(`Use: node scripts/seed-school-auth-system.js`);
}