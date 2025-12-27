import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read and analyze the master school data
function analyzeSchoolData() {
  try {
    const filePath = path.join(__dirname, '..', 'thandi_master_school name file', 'SA_Schools_Master_v2.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const schools = JSON.parse(rawData);
    
    console.log('=== MASTER SCHOOL DATA ANALYSIS ===\n');
    
    // Basic stats
    console.log(`Total Schools: ${schools.length.toLocaleString()}`);
    
    // Province breakdown
    const provinceStats = {};
    schools.forEach(school => {
      const province = school.province_name || school.province_code || 'Unknown';
      provinceStats[province] = (provinceStats[province] || 0) + 1;
    });
    
    console.log('\n=== PROVINCE BREAKDOWN ===');
    Object.entries(provinceStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([province, count]) => {
        console.log(`${province}: ${count.toLocaleString()}`);
      });
    
    // Sector breakdown
    const sectorStats = {};
    schools.forEach(school => {
      const sector = school.sector || 'Unknown';
      sectorStats[sector] = (sectorStats[sector] || 0) + 1;
    });
    
    console.log('\n=== SECTOR BREAKDOWN ===');
    Object.entries(sectorStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([sector, count]) => {
        console.log(`${sector}: ${count.toLocaleString()}`);
      });
    
    // Phase breakdown
    const phaseStats = {};
    schools.forEach(school => {
      const phase = school.phase || 'Unknown';
      phaseStats[phase] = (phaseStats[phase] || 0) + 1;
    });
    
    console.log('\n=== PHASE BREAKDOWN ===');
    Object.entries(phaseStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([phase, count]) => {
        console.log(`${phase}: ${count.toLocaleString()}`);
      });
    
    // Sample data structure
    console.log('\n=== SAMPLE SCHOOL RECORD ===');
    const sampleSchool = schools[0];
    console.log('Available fields:');
    Object.keys(sampleSchool).forEach(key => {
      const value = sampleSchool[key];
      const type = typeof value;
      const preview = type === 'string' && value.length > 50 ? 
        value.substring(0, 50) + '...' : value;
      console.log(`  ${key}: ${type} = ${preview}`);
    });
    
    // Data quality check
    console.log('\n=== DATA QUALITY ANALYSIS ===');
    
    const requiredFields = ['school_id', 'school_name', 'province_name', 'sector', 'phase'];
    requiredFields.forEach(field => {
      const missing = schools.filter(school => !school[field] || school[field] === 'nan' || school[field] === '99').length;
      const percentage = ((schools.length - missing) / schools.length * 100).toFixed(1);
      console.log(`${field}: ${percentage}% complete (${missing} missing)`);
    });
    
    // Geographic coverage
    const withCoords = schools.filter(school => 
      school.latitude && school.longitude && 
      school.latitude !== null && school.longitude !== null
    ).length;
    const geoPercentage = (withCoords / schools.length * 100).toFixed(1);
    console.log(`Geographic coordinates: ${geoPercentage}% complete (${withCoords}/${schools.length})`);
    
    // KZN specific analysis (for our dashboard focus)
    console.log('\n=== KZN SCHOOLS ANALYSIS ===');
    const kznSchools = schools.filter(school => 
      school.province_code === 'KZN' || school.province_name === 'KwaZulu-Natal'
    );
    
    console.log(`KZN Total: ${kznSchools.length.toLocaleString()}`);
    
    const kznSectors = {};
    kznSchools.forEach(school => {
      const sector = school.sector || 'Unknown';
      kznSectors[sector] = (kznSectors[sector] || 0) + 1;
    });
    
    console.log('KZN by Sector:');
    Object.entries(kznSectors).forEach(([sector, count]) => {
      console.log(`  ${sector}: ${count.toLocaleString()}`);
    });
    
    const kznPhases = {};
    kznSchools.forEach(school => {
      const phase = school.phase || 'Unknown';
      kznPhases[phase] = (kznPhases[phase] || 0) + 1;
    });
    
    console.log('KZN by Phase:');
    Object.entries(kznPhases).forEach(([phase, count]) => {
      console.log(`  ${phase}: ${count.toLocaleString()}`);
    });
    
    // Dashboard integration recommendations
    console.log('\n=== DASHBOARD INTEGRATION RECOMMENDATIONS ===');
    console.log('1. Use school_id as primary key (NATEMIS numbers)');
    console.log('2. Map sector: PUBLIC -> Public, Independent -> Private');
    console.log('3. Phase mapping needed for our grade-based system');
    console.log('4. Geographic data available for 80%+ of schools');
    console.log('5. Contact info (telephone) available but needs cleaning');
    console.log('6. Learner/educator counts available for capacity planning');
    
    return {
      totalSchools: schools.length,
      provinces: provinceStats,
      sectors: sectorStats,
      phases: phaseStats,
      kznCount: kznSchools.length,
      dataQuality: {
        withCoords: withCoords,
        geoPercentage: geoPercentage
      }
    };
    
  } catch (error) {
    console.error('Error analyzing school data:', error);
    return null;
  }
}

// Run analysis
const results = analyzeSchoolData();
if (results) {
  console.log('\n=== ANALYSIS COMPLETE ===');
  console.log(`Ready to integrate ${results.totalSchools.toLocaleString()} schools into dashboard`);
}