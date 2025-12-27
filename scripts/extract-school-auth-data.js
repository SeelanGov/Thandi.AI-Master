import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Extract school data for authentication system
function extractSchoolAuthData() {
  try {
    const filePath = path.join(__dirname, '..', 'thandi_master_school name file', 'SA_Schools_Master_v2.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const schools = JSON.parse(rawData);
    
    console.log('=== SCHOOL AUTHENTICATION DATA EXTRACTION ===\n');
    
    // Create the 5-column CSV format for authentication
    const authData = schools.map(school => ({
      school_id: school.school_id || school.natemis,
      institution_name: school.school_name,
      province: school.province_name,
      type: mapSchoolType(school.sector, school.phase),
      onboarding_status: 'unclaimed'
    }));
    
    // Generate CSV content
    const csvHeader = 'school_id,institution_name,province,type,onboarding_status\n';
    const csvRows = authData.map(school => 
      `${school.school_id},"${school.institution_name}",${school.province},"${school.type}",${school.onboarding_status}`
    ).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    // Save to file
    const outputPath = path.join(__dirname, '..', 'school-auth-master.csv');
    fs.writeFileSync(outputPath, csvContent);
    
    console.log(`✅ Created school authentication CSV: ${outputPath}`);
    console.log(`📊 Total schools: ${authData.length.toLocaleString()}`);
    
    // Show sample data
    console.log('\n=== SAMPLE AUTHENTICATION RECORDS ===');
    authData.slice(0, 5).forEach(school => {
      console.log(`${school.school_id} | ${school.institution_name} | ${school.province} | ${school.type}`);
    });
    
    // Province breakdown for auth system
    const provinceStats = {};
    authData.forEach(school => {
      provinceStats[school.province] = (provinceStats[school.province] || 0) + 1;
    });
    
    console.log('\n=== AUTHENTICATION SYSTEM COVERAGE ===');
    Object.entries(provinceStats).forEach(([province, count]) => {
      console.log(`${province}: ${count.toLocaleString()} schools`);
    });
    
    // Type breakdown
    const typeStats = {};
    authData.forEach(school => {
      typeStats[school.type] = (typeStats[school.type] || 0) + 1;
    });
    
    console.log('\n=== SCHOOL TYPE DISTRIBUTION ===');
    Object.entries(typeStats).forEach(([type, count]) => {
      console.log(`${type}: ${count.toLocaleString()} schools`);
    });
    
    // Generate SQL insert statements for immediate database seeding
    console.log('\n=== GENERATING DATABASE SEED SCRIPT ===');
    const sqlPath = path.join(__dirname, '..', 'seed-school-auth.sql');
    const sqlInserts = authData.map(school => 
      `INSERT INTO schools (school_id, name, province, type, status) VALUES ('${school.school_id}', '${school.institution_name.replace(/'/g, "''")}', '${school.province}', '${school.type}', '${school.onboarding_status}');`
    ).join('\n');
    
    const sqlContent = `-- School Authentication System Seed Data
-- Generated: ${new Date().toISOString()}
-- Total Records: ${authData.length.toLocaleString()}

BEGIN;

${sqlInserts}

COMMIT;
`;
    
    fs.writeFileSync(sqlPath, sqlContent);
    console.log(`✅ Created SQL seed file: ${sqlPath}`);
    
    return {
      totalSchools: authData.length,
      provinces: provinceStats,
      types: typeStats,
      csvPath: outputPath,
      sqlPath: sqlPath
    };
    
  } catch (error) {
    console.error('❌ Error extracting school data:', error);
    return null;
  }
}

// Map school sector and phase to our authentication system types
function mapSchoolType(sector, phase) {
  const sectorMap = {
    'PUBLIC': 'Public School',
    'INDEPENDENT': 'Independent School',
    'Independent': 'Independent School'
  };
  
  const phaseMap = {
    'PRIMARY_SCHOOL': 'PRIMARY',
    'SECONDARY_SCHOOL': 'SECONDARY', 
    'COMBINED_SCHOOL': 'COMBINED',
    'INTERMEDIATE_SCHOOL': 'INTERMEDIATE'
  };
  
  const mappedSector = sectorMap[sector] || 'Public School';
  const mappedPhase = phaseMap[phase] || '';
  
  return mappedPhase ? `${mappedSector} (${mappedPhase})` : mappedSector;
}

// Run extraction
const results = extractSchoolAuthData();
if (results) {
  console.log('\n=== EXTRACTION COMPLETE ===');
  console.log(`🎯 Ready to seed ${results.totalSchools.toLocaleString()} schools into authentication system`);
  console.log(`📁 CSV: ${results.csvPath}`);
  console.log(`🗄️  SQL: ${results.sqlPath}`);
  
  console.log('\n=== NEXT STEPS ===');
  console.log('1. Review the generated CSV and SQL files');
  console.log('2. Import into your school dashboard database');
  console.log('3. Test the search and claim functionality');
  console.log('4. Deploy the authentication system');
}