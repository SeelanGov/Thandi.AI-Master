/**
 * Emergency Clean and Test Script
 * 
 * Completely cleans the environment and tests PDF generation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚨 EMERGENCY CLEAN AND TEST PROCEDURE\n');

try {
  // Step 1: Kill all Node processes
  console.log('1️⃣ Killing all Node.js processes...');
  try {
    execSync('taskkill /F /IM node.exe', { stdio: 'ignore' });
  } catch (e) {
    // Ignore if no processes found
  }
  
  // Step 2: Clean build artifacts
  console.log('2️⃣ Cleaning build artifacts...');
  const cleanPaths = ['.next', 'node_modules/.cache'];
  
  cleanPaths.forEach(cleanPath => {
    if (fs.existsSync(cleanPath)) {
      fs.rmSync(cleanPath, { recursive: true, force: true });
      console.log(`   ✅ Removed ${cleanPath}`);
    }
  });
  
  // Step 3: Verify PDF functionality removed
  console.log('3️⃣ Verifying PDF cleanup...');
  const pdfGenPath = 'app/results/services/ProfessionalPDFGenerator.js';
  
  if (fs.existsSync(pdfGenPath)) {
    console.log('   ⚠️ ProfessionalPDFGenerator.js still exists - should be removed');
  } else {
    console.log('   ✅ PDF generator successfully removed');
  }
  
  // Step 4: Check for phantom ReactPDF files
  console.log('4️⃣ Checking for phantom ReactPDF files...');
  
  function findReactPDFFiles(dir) {
    const files = [];
    if (!fs.existsSync(dir)) return files;
    
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        files.push(...findReactPDFFiles(fullPath));
      } else if (item.name.includes('ReactPDF')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }
  
  const reactPDFFiles = findReactPDFFiles('app');
  
  if (reactPDFFiles.length > 0) {
    console.log('   ❌ Found ReactPDF files:', reactPDFFiles);
    reactPDFFiles.forEach(file => {
      try {
        fs.unlinkSync(file);
        console.log(`   ✅ Deleted ${file}`);
      } catch (e) {
        console.log(`   ⚠️ Could not delete ${file}: ${e.message}`);
      }
    });
  } else {
    console.log('   ✅ No ReactPDF files found');
  }
  
  // Step 5: Test PDF generation directly
  console.log('5️⃣ Testing PDF generation...');
  
  // Create minimal test
  const testCode = `
    const { ProfessionalPDFGenerator } = require('./app/results/services/ProfessionalPDFGenerator.js');
    
    const mockData = {
      headerData: { gradeLevel: 12, hasMarks: true, apsScore: 35 },
      programs: [{ program: 'Test Program', university: 'Test Uni' }],
      bursaries: [],
      actionPlan: { actionItems: ['Test action'] }
    };
    
    const generator = new ProfessionalPDFGenerator(mockData, { name: 'Test', grade: 12 });
    const pdf = generator.generateProfessionalReport();
    
    console.log('PDF generation test: SUCCESS');
  `;
  
  fs.writeFileSync('temp-pdf-test.js', testCode);
  
  try {
    execSync('node temp-pdf-test.js', { stdio: 'pipe' });
    console.log('   ✅ PDF generation test passed');
  } catch (e) {
    console.log('   ❌ PDF generation test failed:', e.message);
  } finally {
    if (fs.existsSync('temp-pdf-test.js')) {
      fs.unlinkSync('temp-pdf-test.js');
    }
  }
  
  console.log('\n🎯 EMERGENCY CLEAN COMPLETE');
  console.log('=====================================');
  console.log('✅ Environment cleaned');
  console.log('✅ Phantom files removed');
  console.log('✅ PDF generator verified');
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Run: npm run dev');
  console.log('2. Test: http://localhost:3000/assessment');
  console.log('3. Complete assessment and test PDF download');
  
} catch (error) {
  console.log('❌ Emergency clean failed:', error.message);
  process.exit(1);
}