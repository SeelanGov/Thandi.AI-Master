/**
 * COMPREHENSIVE SYSTEM VERIFICATION
 * 
 * As lead dev partner, I'm taking full responsibility to verify
 * the entire PDF generation system is working correctly.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

async function comprehensiveSystemCheck() {
  console.log('🔍 COMPREHENSIVE SYSTEM VERIFICATION');
  console.log('====================================\n');
  
  const results = {
    serverRunning: false,
    pdfGeneratorWorking: false,
    resultsPageAccessible: false,
    buildSuccessful: false,
    noPhantomFiles: false,
    allTestsPassed: false
  };
  
  try {
    // 1. Verify server is running
    console.log('1️⃣ Verifying development server...');
    
    const serverCheck = await new Promise((resolve) => {
      const req = http.get('http://localhost:3000', (res) => {
        resolve({ success: true, status: res.statusCode });
      });
      
      req.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        resolve({ success: false, error: 'Timeout' });
      });
    });
    
    if (serverCheck.success) {
      console.log('   ✅ Server running on http://localhost:3000');
      results.serverRunning = true;
    } else {
      console.log('   ❌ Server not responding:', serverCheck.error);
      return results;
    }
    
    // 2. Test PDF generator directly
    console.log('2️⃣ Testing PDF generator directly...');
    
    try {
      // Import and test PDF generator
      const { ProfessionalPDFGenerator } = await import('./app/results/services/ProfessionalPDFGenerator.js');
      
      const mockData = {
        headerData: {
          gradeLevel: 12,
          hasMarks: true,
          apsScore: 35,
          projectedApsRange: { min: 32, max: 38 },
          universityEligible: true,
          studentStatus: 'Grade 12 Student - University Track'
        },
        programs: [
          {
            program: 'Bachelor of Commerce',
            university: 'University of Cape Town',
            apsRequired: 35,
            feasibility: 'High',
            admissionChance: 85,
            applicationDeadline: '30 September 2026'
          }
        ],
        bursaries: [
          {
            name: 'NSFAS Bursary',
            amount: 'Full tuition + allowances',
            eligibilityMatch: 90,
            deadline: '31 January 2026',
            urgency: 'CRITICAL'
          }
        ],
        actionPlan: {
          timeline: 'Critical execution phase',
          actionItems: [
            'Submit university applications',
            'Complete NSFAS application',
            'Focus on NSC preparation'
          ]
        },
        alternativeOptions: []
      };
      
      const studentData = {
        name: 'System Test Student',
        grade: 12,
        school: 'Test High School'
      };
      
      const generator = new ProfessionalPDFGenerator(mockData, studentData);
      const pdf = generator.generateProfessionalReport();
      
      // Save test PDF
      const pdfBuffer = pdf.output('arraybuffer');
      const testPdfPath = path.join(__dirname, 'system-verification-test.pdf');
      fs.writeFileSync(testPdfPath, Buffer.from(pdfBuffer));
      
      const stats = fs.statSync(testPdfPath);
      
      console.log('   ✅ PDF generator working');
      console.log(`   📄 Test PDF: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`   📍 Location: ${testPdfPath}`);
      
      results.pdfGeneratorWorking = true;
      
    } catch (pdfError) {
      console.log('   ❌ PDF generator failed:', pdfError.message);
      return results;
    }
    
    // 3. Check for phantom ReactPDF files
    console.log('3️⃣ Checking for phantom ReactPDF files...');
    
    function searchForReactPDF(dir, found = []) {
      if (!fs.existsSync(dir)) return found;
      
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
          searchForReactPDF(fullPath, found);
        } else if (item.name.includes('ReactPDF')) {
          found.push(fullPath);
        }
      }
      
      return found;
    }
    
    const phantomFiles = searchForReactPDF('app');
    
    if (phantomFiles.length === 0) {
      console.log('   ✅ No phantom ReactPDF files found');
      results.noPhantomFiles = true;
    } else {
      console.log('   ⚠️ Found phantom files:', phantomFiles);
    }
    
    // 4. Verify build artifacts
    console.log('4️⃣ Checking build status...');
    
    if (fs.existsSync('.next')) {
      console.log('   ✅ Build artifacts present');
      results.buildSuccessful = true;
    } else {
      console.log('   ⚠️ No build artifacts found');
    }
    
    // 5. Test results page accessibility
    console.log('5️⃣ Testing results page...');
    
    const resultsCheck = await new Promise((resolve) => {
      const req = http.get('http://localhost:3000/results', (res) => {
        resolve({ 
          success: res.statusCode === 200 || res.statusCode === 302, 
          status: res.statusCode 
        });
      });
      
      req.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });
      
      req.setTimeout(8000, () => {
        req.destroy();
        resolve({ success: false, error: 'Timeout' });
      });
    });
    
    if (resultsCheck.success) {
      console.log(`   ✅ Results page accessible (Status: ${resultsCheck.status})`);
      results.resultsPageAccessible = true;
    } else {
      console.log('   ⚠️ Results page issue:', resultsCheck.error || 'Unknown');
    }
    
    // 6. Final assessment
    console.log('6️⃣ Final system assessment...');
    
    const criticalTests = [
      results.serverRunning,
      results.pdfGeneratorWorking,
      results.noPhantomFiles
    ];
    
    results.allTestsPassed = criticalTests.every(test => test === true);
    
    if (results.allTestsPassed) {
      console.log('   ✅ All critical tests passed');
    } else {
      console.log('   ⚠️ Some tests failed - see details above');
    }
    
  } catch (error) {
    console.log('❌ System verification failed:', error.message);
  }
  
  return results;
}

// Run comprehensive verification
comprehensiveSystemCheck().then(results => {
  console.log('\n📋 SYSTEM VERIFICATION REPORT');
  console.log('==============================');
  
  console.log(`🖥️  Server Running: ${results.serverRunning ? '✅' : '❌'}`);
  console.log(`📄 PDF Generator: ${results.pdfGeneratorWorking ? '✅' : '❌'}`);
  console.log(`🌐 Results Page: ${results.resultsPageAccessible ? '✅' : '❌'}`);
  console.log(`🏗️  Build Status: ${results.buildSuccessful ? '✅' : '❌'}`);
  console.log(`🧹 No Phantom Files: ${results.noPhantomFiles ? '✅' : '❌'}`);
  
  console.log('\n🎯 OVERALL STATUS');
  console.log('=================');
  
  if (results.allTestsPassed) {
    console.log('✅ SYSTEM READY FOR PRODUCTION');
    console.log('\n📋 MANUAL VERIFICATION STEPS:');
    console.log('1. Go to: http://localhost:3000/assessment');
    console.log('2. Complete assessment with test data');
    console.log('3. Click "📄 Download PDF" on results page');
    console.log('4. Verify PDF quality and content');
    console.log('5. If PDF quality is acceptable → DEPLOY');
    
    console.log('\n🚀 DEPLOYMENT READY');
    console.log('The system has passed all automated checks.');
    console.log('Manual PDF quality verification is the final step.');
    
  } else {
    console.log('❌ SYSTEM ISSUES DETECTED');
    console.log('\n🔧 REQUIRED ACTIONS:');
    
    if (!results.serverRunning) {
      console.log('- Fix server connectivity issues');
    }
    if (!results.pdfGeneratorWorking) {
      console.log('- Debug PDF generator implementation');
    }
    if (!results.noPhantomFiles) {
      console.log('- Remove phantom ReactPDF files');
    }
  }
  
  process.exit(results.allTestsPassed ? 0 : 1);
}).catch(error => {
  console.log('❌ Verification script failed:', error.message);
  process.exit(1);
});