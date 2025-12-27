import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function analyzeNewMasterData() {
  try {
    const filePath = path.join(__dirname, '..', 'thandi_master_school name file', 'SA_Schools_Master_v2_national_reissue.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const schools = JSON.parse(rawData);
    
    console.log('=== NEW MASTER DATA ANALYSIS ===');
    console.log(`Total schools: ${schools.length}`);
    
    // Analyze structure of first school
    const firstSchool = schools[0];
    console.log('\n=== SCHOOL DATA STRUCTURE ===');
    console.log('Available fields:');
    Object.keys(firstSchool).forEach(key => {
      console.log(`- ${key}: ${typeof firstSchool[key]} (${firstSchool[key]})`);
    });
    
    // Analyze provinces
    const provinces = [...new Set(schools.map(s => s.province_name))];
    console.log('\n=== PROVINCES ===');
    provinces.forEach(province => {
      const count = schools.filter(s => s.province_name === province).length;
      console.log(`${province}: ${count} schools`);
    });
    
    // Analyze sectors
    const sectors = [...new Set(schools.map(s => s.sector))];
    console.log('\n=== SECTORS ===');
    sectors.forEach(sector => {
      const count = schools.filter(s => s.sector === sector).length;
      console.log(`${sector}: ${count} schools`);
    });
    
    // Analyze phases
    const phases = [...new Set(schools.map(s => s.phase))];
    console.log('\n=== PHASES ===');
    phases.forEach(phase => {
      const count = schools.filter(s => s.phase === phase).length;
      console.log(`${phase}: ${count} schools`);
    });
    
    // Check for contact information
    const withPhone = schools.filter(s => s.telephone && s.telephone !== 'UNKNOWN' && s.telephone !== 'nan').length;
    const withEmail = schools.filter(s => s.email && s.email !== 'nan').length;
    
    console.log('\n=== CONTACT INFO ===');
    console.log(`Schools with phone: ${withPhone} (${(withPhone/schools.length*100).toFixed(1)}%)`);
    console.log(`Schools with email: ${withEmail} (${(withEmail/schools.length*100).toFixed(1)}%)`);
    
    // Geographic coverage
    const withCoords = schools.filter(s => s.latitude && s.longitude).length;
    console.log(`Schools with coordinates: ${withCoords} (${(withCoords/schools.length*100).toFixed(1)}%)`);
    
    // Sample schools for different categories
    console.log('\n=== SAMPLE SCHOOLS ===');
    
    const publicSecondary = schools.find(s => s.sector === 'PUBLIC' && s.phase === 'SECONDARY_SCHOOL');
    if (publicSecondary) {
      console.log('Public Secondary:', publicSecondary.school_name, '-', publicSecondary.province_name);
    }
    
    const independent = schools.find(s => s.sector === 'INDEPENDENT');
    if (independent) {
      console.log('Independent:', independent.school_name, '-', independent.province_name);
    }
    
    const primary = schools.find(s => s.phase === 'PRIMARY_SCHOOL');
    if (primary) {
      console.log('Primary:', primary.school_name, '-', primary.province_name);
    }
    
    return {
      totalSchools: schools.length,
      provinces: provinces.length,
      sectors,
      phases,
      contactCoverage: {
        phone: withPhone,
        email: withEmail,
        coordinates: withCoords
      }
    };
    
  } catch (error) {
    console.error('Error analyzing master data:', error);
    return null;
  }
}

// Run analysis
const analysis = analyzeNewMasterData();
console.log('\n=== ANALYSIS COMPLETE ===');