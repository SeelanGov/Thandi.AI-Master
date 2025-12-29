#!/usr/bin/env node

/**
 * THANDI KNOWLEDGE BASE COVERAGE AUDIT
 * Comprehensive analysis of university degree coverage and 4IR integration
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 THANDI KNOWLEDGE BASE COVERAGE AUDIT');
console.log('=' .repeat(60));
console.log('Analyzing university degree coverage and 4IR integration');
console.log('=' .repeat(60));

// Load current university data
function loadUniversityData() {
  try {
    const filePath = 'thandi_knowledge_base/university_pathways/universities.json';
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return data;
  } catch (error) {
    console.error('❌ Failed to load university data:', error.message);
    return null;
  }
}

// Load 4IR careers data
function load4IRData() {
  try {
    const filePath = 'thandi_knowledge_base/4ir_careers_framework/CONTENT-SPEC.md';
    const content = fs.readFileSync(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error('❌ Failed to load 4IR data:', error.message);
    return null;
  }
}

// Analyze university coverage
function analyzeUniversityCoverage(data) {
  console.log('\n📊 UNIVERSITY COVERAGE ANALYSIS');
  console.log('-'.repeat(50));
  
  if (!data || !data.universities) {
    console.log('❌ No university data available');
    return null;
  }
  
  const universities = data.universities;
  const totalUniversities = universities.length;
  const metadata = data.metadata;
  
  console.log(`📋 Current Coverage:`);
  console.log(`   Universities in database: ${totalUniversities}`);
  console.log(`   Metadata claims: ${metadata.total_universities} universities`);
  console.log(`   Total programs: ${metadata.total_programs}`);
  console.log(`   Last updated: ${metadata.last_updated}`);
  
  // Analyze by university type
  const typeAnalysis = {};
  universities.forEach(uni => {
    const type = uni.university_type;
    if (!typeAnalysis[type]) {
      typeAnalysis[type] = { count: 0, universities: [] };
    }
    typeAnalysis[type].count++;
    typeAnalysis[type].universities.push(uni.university_name);
  });
  
  console.log(`\n📈 University Types:`);
  Object.entries(typeAnalysis).forEach(([type, info]) => {
    console.log(`   ${type}: ${info.count} universities`);
    info.universities.forEach(name => {
      console.log(`      - ${name}`);
    });
  });
  
  // Analyze program distribution
  let totalPrograms = 0;
  const facultyAnalysis = {};
  const degreeTypeAnalysis = {};
  
  universities.forEach(uni => {
    uni.faculties.forEach(faculty => {
      const facultyName = faculty.faculty_name;
      if (!facultyAnalysis[facultyName]) {
        facultyAnalysis[facultyName] = 0;
      }
      facultyAnalysis[facultyName]++;
      
      faculty.programs.forEach(program => {
        totalPrograms++;
        const degreeType = program.degree_type;
        if (!degreeTypeAnalysis[degreeType]) {
          degreeTypeAnalysis[degreeType] = 0;
        }
        degreeTypeAnalysis[degreeType]++;
      });
    });
  });
  
  console.log(`\n📚 Program Analysis:`);
  console.log(`   Total programs counted: ${totalPrograms}`);
  console.log(`   Metadata claims: ${metadata.total_programs}`);
  console.log(`   Discrepancy: ${totalPrograms !== metadata.total_programs ? '⚠️  MISMATCH' : '✅ MATCH'}`);
  
  console.log(`\n🎓 Degree Types:`);
  Object.entries(degreeTypeAnalysis)
    .sort(([,a], [,b]) => b - a)
    .forEach(([type, count]) => {
      console.log(`   ${type}: ${count} programs`);
    });
  
  console.log(`\n🏛️  Faculty Distribution:`);
  Object.entries(facultyAnalysis)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([faculty, count]) => {
      console.log(`   ${faculty}: ${count} universities`);
    });
  
  return {
    totalUniversities,
    totalPrograms,
    typeAnalysis,
    facultyAnalysis,
    degreeTypeAnalysis
  };
}

// Analyze 4IR coverage
function analyze4IRCoverage(content) {
  console.log('\n🤖 4IR CAREERS COVERAGE ANALYSIS');
  console.log('-'.repeat(50));
  
  if (!content) {
    console.log('❌ No 4IR content available');
    return null;
  }
  
  // Extract career chunks from content
  const chunkMatches = content.match(/## CHUNK \d+: (.+?) - (.+)/g) || [];
  const careers = [];
  
  chunkMatches.forEach(match => {
    const parts = match.match(/## CHUNK \d+: (.+?) - (.+)/);
    if (parts) {
      const careerName = parts[1];
      const chunkType = parts[2];
      
      let career = careers.find(c => c.name === careerName);
      if (!career) {
        career = { name: careerName, chunks: [] };
        careers.push(career);
      }
      career.chunks.push(chunkType);
    }
  });
  
  console.log(`📋 4IR Careers Covered:`);
  careers.forEach(career => {
    console.log(`   ${career.name}:`);
    career.chunks.forEach(chunk => {
      console.log(`      - ${chunk}`);
    });
  });
  
  // Identify missing 4IR careers
  const expected4IRCareers = [
    'Cybersecurity Engineer',
    'Cloud Engineer', 
    'Data Scientist',
    'AI/ML Engineer',
    'Robotics Engineer',
    'IoT Specialist',
    'Blockchain Developer',
    'Renewable Energy Engineer',
    'Digital Marketing Specialist',
    'UX/UI Designer',
    'DevOps Engineer',
    'Product Manager (Tech)',
    'Automation Engineer',
    'Quantum Computing Specialist',
    'AR/VR Developer'
  ];
  
  const coveredCareers = careers.map(c => c.name);
  const missingCareers = expected4IRCareers.filter(career => 
    !coveredCareers.includes(career)
  );
  
  console.log(`\n⚠️  Missing 4IR Careers:`);
  missingCareers.forEach(career => {
    console.log(`   - ${career}`);
  });
  
  console.log(`\n📊 4IR Coverage Summary:`);
  console.log(`   Careers covered: ${careers.length}`);
  console.log(`   Expected careers: ${expected4IRCareers.length}`);
  console.log(`   Coverage percentage: ${Math.round((careers.length / expected4IRCareers.length) * 100)}%`);
  console.log(`   Missing careers: ${missingCareers.length}`);
  
  return {
    coveredCareers: careers,
    missingCareers,
    coveragePercentage: Math.round((careers.length / expected4IRCareers.length) * 100)
  };
}

// Identify missing universities
function identifyMissingUniversities(currentData) {
  console.log('\n🏫 MISSING UNIVERSITIES ANALYSIS');
  console.log('-'.repeat(50));
  
  // Complete list of 26 SA universities
  const allSAUniversities = [
    { name: 'University of Cape Town', code: 'UCT', type: 'traditional' },
    { name: 'University of the Witwatersrand', code: 'WITS', type: 'traditional' },
    { name: 'Stellenbosch University', code: 'SU', type: 'traditional' },
    { name: 'University of Pretoria', code: 'UP', type: 'traditional' },
    { name: 'University of KwaZulu-Natal', code: 'UKZN', type: 'traditional' },
    { name: 'University of the Free State', code: 'UFS', type: 'traditional' },
    { name: 'North-West University', code: 'NWU', type: 'traditional' },
    { name: 'Rhodes University', code: 'RU', type: 'traditional' },
    { name: 'University of Limpopo', code: 'UL', type: 'traditional' },
    { name: 'University of Fort Hare', code: 'UFH', type: 'traditional' },
    { name: 'University of Venda', code: 'UNIVEN', type: 'traditional' },
    
    { name: 'Cape Peninsula University of Technology', code: 'CPUT', type: 'technology' },
    { name: 'Central University of Technology', code: 'CUT', type: 'technology' },
    { name: 'Durban University of Technology', code: 'DUT', type: 'technology' },
    { name: 'Mangosuthu University of Technology', code: 'MUT', type: 'technology' },
    { name: 'Tshwane University of Technology', code: 'TUT', type: 'technology' },
    { name: 'Vaal University of Technology', code: 'VUT', type: 'technology' },
    
    { name: 'Nelson Mandela University', code: 'NMU', type: 'comprehensive' },
    { name: 'University of Johannesburg', code: 'UJ', type: 'comprehensive' },
    { name: 'University of the Western Cape', code: 'UWC', type: 'comprehensive' },
    { name: 'Walter Sisulu University', code: 'WSU', type: 'comprehensive' },
    { name: 'University of Zululand', code: 'UNIZULU', type: 'comprehensive' },
    
    { name: 'University of South Africa', code: 'UNISA', type: 'distance' },
    { name: 'Sol Plaatje University', code: 'SPU', type: 'traditional' },
    { name: 'University of Mpumalanga', code: 'UMP', type: 'traditional' },
    { name: 'Sefako Makgatho Health Sciences University', code: 'SMU', type: 'traditional' }
  ];
  
  const currentUniversities = currentData ? currentData.universities.map(u => u.university_code) : [];
  const missingUniversities = allSAUniversities.filter(uni => 
    !currentUniversities.includes(uni.code)
  );
  
  console.log(`📊 University Coverage:`);
  console.log(`   Total SA universities: ${allSAUniversities.length}`);
  console.log(`   Universities in database: ${currentUniversities.length}`);
  console.log(`   Missing universities: ${missingUniversities.length}`);
  console.log(`   Coverage percentage: ${Math.round((currentUniversities.length / allSAUniversities.length) * 100)}%`);
  
  if (missingUniversities.length > 0) {
    console.log(`\n⚠️  Missing Universities:`);
    missingUniversities.forEach(uni => {
      console.log(`   - ${uni.name} (${uni.code}) - ${uni.type}`);
    });
  }
  
  return {
    totalUniversities: allSAUniversities.length,
    currentCount: currentUniversities.length,
    missingUniversities,
    coveragePercentage: Math.round((currentUniversities.length / allSAUniversities.length) * 100)
  };
}

// Analyze degree coverage gaps
function analyzeDegreeGaps(universityData) {
  console.log('\n🎓 DEGREE COVERAGE GAP ANALYSIS');
  console.log('-'.repeat(50));
  
  if (!universityData) {
    console.log('❌ No university data for gap analysis');
    return null;
  }
  
  // Expected major degree categories
  const expectedDegreeCategories = {
    'Engineering': ['Civil', 'Mechanical', 'Electrical', 'Chemical', 'Computer', 'Industrial', 'Mining', 'Aeronautical'],
    'Health Sciences': ['Medicine', 'Nursing', 'Pharmacy', 'Dentistry', 'Physiotherapy', 'Occupational Therapy', 'Radiography'],
    'Business & Commerce': ['Accounting', 'Finance', 'Marketing', 'Management', 'Economics', 'Supply Chain'],
    'Science': ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Environmental Science'],
    'Humanities': ['Psychology', 'Sociology', 'History', 'Languages', 'Philosophy', 'Anthropology'],
    'Education': ['Foundation Phase', 'Intermediate Phase', 'Senior Phase', 'FET Phase', 'Special Needs'],
    'Law': ['LLB', 'Legal Studies'],
    'Agriculture': ['Agricultural Science', 'Veterinary Science', 'Forestry', 'Food Science'],
    'Arts & Design': ['Fine Arts', 'Graphic Design', 'Architecture', 'Music', 'Drama'],
    'Technology & IT': ['Information Technology', 'Software Engineering', 'Cybersecurity', 'Data Science']
  };
  
  // Analyze current coverage
  const currentPrograms = [];
  universityData.universities.forEach(uni => {
    uni.faculties.forEach(faculty => {
      faculty.programs.forEach(program => {
        currentPrograms.push({
          university: uni.university_name,
          faculty: faculty.faculty_name,
          program: program.degree_name,
          type: program.degree_type
        });
      });
    });
  });
  
  console.log(`📊 Current Program Distribution:`);
  const programsByCategory = {};
  
  Object.entries(expectedDegreeCategories).forEach(([category, expectedPrograms]) => {
    const matchingPrograms = currentPrograms.filter(program => 
      expectedPrograms.some(expected => 
        program.program.toLowerCase().includes(expected.toLowerCase()) ||
        program.faculty.toLowerCase().includes(expected.toLowerCase())
      )
    );
    
    programsByCategory[category] = matchingPrograms;
    console.log(`   ${category}: ${matchingPrograms.length} programs`);
  });
  
  // Identify major gaps
  console.log(`\n⚠️  Major Coverage Gaps:`);
  Object.entries(expectedDegreeCategories).forEach(([category, expectedPrograms]) => {
    const currentPrograms = programsByCategory[category];
    const missingPrograms = expectedPrograms.filter(expected => 
      !currentPrograms.some(current => 
        current.program.toLowerCase().includes(expected.toLowerCase())
      )
    );
    
    if (missingPrograms.length > 0) {
      console.log(`   ${category}:`);
      missingPrograms.forEach(missing => {
        console.log(`      - ${missing}`);
      });
    }
  });
  
  return {
    totalPrograms: currentPrograms.length,
    programsByCategory,
    expectedCategories: expectedDegreeCategories
  };
}

// Generate comprehensive report
function generateComprehensiveReport(universityAnalysis, fourIRAnalysis, missingUniversities, degreeGaps) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPREHENSIVE KNOWLEDGE BASE AUDIT REPORT');
  console.log('='.repeat(60));
  
  console.log('\n🎯 EXECUTIVE SUMMARY:');
  
  // University coverage
  if (missingUniversities) {
    console.log(`   University Coverage: ${missingUniversities.coveragePercentage}% (${missingUniversities.currentCount}/${missingUniversities.totalUniversities})`);
  }
  
  // Program coverage
  if (universityAnalysis) {
    console.log(`   Total Programs: ${universityAnalysis.totalPrograms}`);
    console.log(`   Universities with Programs: ${universityAnalysis.totalUniversities}`);
  }
  
  // 4IR coverage
  if (fourIRAnalysis) {
    console.log(`   4IR Career Coverage: ${fourIRAnalysis.coveragePercentage}% (${fourIRAnalysis.coveredCareers.length} careers)`);
  }
  
  console.log('\n🚨 CRITICAL GAPS IDENTIFIED:');
  
  if (missingUniversities && missingUniversities.missingUniversities.length > 0) {
    console.log(`   ❌ Missing ${missingUniversities.missingUniversities.length} universities`);
  }
  
  if (fourIRAnalysis && fourIRAnalysis.missingCareers.length > 0) {
    console.log(`   ❌ Missing ${fourIRAnalysis.missingCareers.length} 4IR careers`);
  }
  
  console.log('\n📋 PHASE 3 PRIORITIES:');
  console.log('   1. Complete missing university coverage');
  console.log('   2. Expand 4IR career content');
  console.log('   3. Standardize degree program data');
  console.log('   4. Enhance career outcome mappings');
  console.log('   5. Integrate 4IR skills with traditional degrees');
  
  console.log('\n🎯 RECOMMENDED ACTIONS:');
  console.log('   • Add missing universities with full program catalogs');
  console.log('   • Develop comprehensive 4IR career content');
  console.log('   • Create degree-to-4IR career mapping system');
  console.log('   • Implement regular content update processes');
  console.log('   • Enhance search and matching algorithms');
  
  console.log('\n📈 SUCCESS METRICS:');
  console.log('   • Achieve 100% university coverage (26/26)');
  console.log('   • Achieve 90%+ 4IR career coverage');
  console.log('   • Map all degrees to career outcomes');
  console.log('   • Integrate 4IR pathways with traditional degrees');
  
  console.log('\n' + '='.repeat(60));
  
  return {
    universityCoverage: missingUniversities?.coveragePercentage || 0,
    fourIRCoverage: fourIRAnalysis?.coveragePercentage || 0,
    totalPrograms: universityAnalysis?.totalPrograms || 0,
    criticalGaps: {
      missingUniversities: missingUniversities?.missingUniversities.length || 0,
      missing4IRCareers: fourIRAnalysis?.missingCareers.length || 0
    }
  };
}

// Main execution
async function main() {
  try {
    console.log('\n⏱️  Starting knowledge base coverage audit...\n');
    
    // Load data
    const universityData = loadUniversityData();
    const fourIRContent = load4IRData();
    
    // Perform analyses
    const universityAnalysis = analyzeUniversityCoverage(universityData);
    const fourIRAnalysis = analyze4IRCoverage(fourIRContent);
    const missingUniversities = identifyMissingUniversities(universityData);
    const degreeGaps = analyzeDegreeGaps(universityData);
    
    // Generate comprehensive report
    const report = generateComprehensiveReport(
      universityAnalysis, 
      fourIRAnalysis, 
      missingUniversities, 
      degreeGaps
    );
    
    // Save report to file
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: report,
      details: {
        universityAnalysis,
        fourIRAnalysis,
        missingUniversities,
        degreeGaps
      }
    };
    
    fs.writeFileSync('knowledge-base-audit-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n💾 Detailed report saved to: knowledge-base-audit-report.json');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Knowledge base audit failed:', error.message);
    process.exit(1);
  }
}

main();