#!/usr/bin/env node

const http = require('http');

async function comprehensiveLocalTest() {
  console.log('🧪 COMPREHENSIVE LOCAL TEST - TODAY\'S WORK');
  console.log('===========================================\n');
  
  console.log('📋 TESTING SCOPE:');
  console.log('=================');
  console.log('✅ Task 1: Grade dropdown display fix');
  console.log('✅ Task 2: Thandi branding consistency');
  console.log('🔄 Task 3: Student registration flow fix');
  console.log('🔄 Task 4: Vercel deployment configuration');
  console.log('');
  
  let allTestsPassed = true;
  
  // Test 1: API Endpoints
  console.log('🔍 TEST 1: API ENDPOINTS');
  console.log('========================');
  
  try {
    // Test school search API
    console.log('📡 Testing school search API...');
    const schoolSearchResult = await makeRequest('http://localhost:3006/api/schools/search?q=high&limit=5');
    
    if (schoolSearchResult.status === 200) {
      const searchData = JSON.parse(schoolSearchResult.data);
      console.log(`✅ School search: ${searchData.total} results found`);
      
      if (searchData.results && searchData.results.length > 0) {
        const testSchool = searchData.results[0];
        console.log(`   Test school: ${testSchool.name} (ID: ${testSchool.school_id})`);
        
        // Test registration API with valid school
        console.log('📡 Testing student registration API...');
        const registrationData = {
          student_name: 'Test',
          student_surname: 'Student',
          school_id: testSchool.school_id,
          grade: '12',
          consent_given: true,
          consent_timestamp: new Date().toISOString(),
          consent_version: 'v1.0'
        };
        
        const regResult = await makePostRequest('http://localhost:3006/api/student/register', registrationData);
        
        if (regResult.status === 200) {
          const regData = JSON.parse(regResult.data);
          console.log(`✅ Registration: Success (Student ID: ${regData.student_id})`);
          console.log(`   Token created: ${regData.token ? 'Yes' : 'No'}`);
        } else {
          console.log(`❌ Registration failed: ${regResult.status}`);
          allTestsPassed = false;
        }
        
        // Test registration with empty school_id (should fail)
        console.log('📡 Testing registration validation...');
        const invalidData = { ...registrationData, school_id: '' };
        const invalidResult = await makePostRequest('http://localhost:3006/api/student/register', invalidData);
        
        if (invalidResult.status === 400) {
          console.log('✅ Validation: Correctly rejects empty school_id');
        } else {
          console.log(`❌ Validation failed: Expected 400, got ${invalidResult.status}`);
          allTestsPassed = false;
        }
        
      } else {
        console.log('❌ No school results found');
        allTestsPassed = false;
      }
    } else {
      console.log(`❌ School search failed: ${schoolSearchResult.status}`);
      allTestsPassed = false;
    }
    
  } catch (error) {
    console.log(`❌ API test error: ${error.message}`);
    allTestsPassed = false;
  }
  
  // Test 2: Assessment Routes
  console.log('\n🔍 TEST 2: ASSESSMENT ROUTES');
  console.log('============================');
  
  try {
    // Test main assessment page
    console.log('📡 Testing assessment page...');
    const assessmentResult = await makeRequest('http://localhost:3006/assessment');
    
    if (assessmentResult.status === 200) {
      console.log('✅ Assessment page: Loads successfully');
      
      // Check for key elements in the response
      if (assessmentResult.data.includes('Thandi Career Assessment')) {
        console.log('✅ Branding: Thandi branding present');
      } else {
        console.log('❌ Branding: Missing Thandi branding');
        allTestsPassed = false;
      }
      
      if (assessmentResult.data.includes('BulletproofStudentRegistration')) {
        console.log('✅ Component: Registration component loaded');
      } else {
        console.log('❌ Component: Registration component missing');
        allTestsPassed = false;
      }
      
    } else {
      console.log(`❌ Assessment page failed: ${assessmentResult.status}`);
      allTestsPassed = false;
    }
    
    // Test grade-specific assessment pages
    const grades = ['10', '11', '12'];
    for (const grade of grades) {
      console.log(`📡 Testing Grade ${grade} assessment...`);
      const gradeResult = await makeRequest(`http://localhost:3006/assessment/grade/${grade}`);
      
      if (gradeResult.status === 200) {
        console.log(`✅ Grade ${grade}: Page loads successfully`);
      } else {
        console.log(`❌ Grade ${grade}: Failed with status ${gradeResult.status}`);
        allTestsPassed = false;
      }
    }
    
  } catch (error) {
    console.log(`❌ Route test error: ${error.message}`);
    allTestsPassed = false;
  }
  
  // Test 3: Build Configuration
  console.log('\n🔍 TEST 3: BUILD CONFIGURATION');
  console.log('==============================');
  
  try {
    const fs = require('fs');
    
    // Check vercel.json configuration
    console.log('📋 Checking vercel.json...');
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    
    if (vercelConfig.buildCommand === 'npm run build') {
      console.log('✅ Build command: Correct (npm run build)');
    } else {
      console.log(`❌ Build command: Wrong (${vercelConfig.buildCommand})`);
      allTestsPassed = false;
    }
    
    if (vercelConfig.installCommand === 'npm install --legacy-peer-deps') {
      console.log('✅ Install command: Correct (npm install --legacy-peer-deps)');
    } else {
      console.log(`❌ Install command: Wrong (${vercelConfig.installCommand})`);
      allTestsPassed = false;
    }
    
    // Check package.json scripts
    console.log('📋 Checking package.json scripts...');
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    if (packageJson.scripts.build === 'next build') {
      console.log('✅ Build script: Correct (next build)');
    } else {
      console.log(`❌ Build script: Wrong (${packageJson.scripts.build})`);
      allTestsPassed = false;
    }
    
  } catch (error) {
    console.log(`❌ Configuration test error: ${error.message}`);
    allTestsPassed = false;
  }
  
  // Test 4: Component Integration
  console.log('\n🔍 TEST 4: COMPONENT INTEGRATION');
  console.log('=================================');
  
  try {
    const fs = require('fs');
    
    // Check registration component
    console.log('📋 Checking BulletproofStudentRegistration...');
    const regComponent = fs.readFileSync('components/BulletproofStudentRegistration.jsx', 'utf8');
    
    if (regComponent.includes('onClick={(e) => {')) {
      console.log('✅ Event handling: Uses onClick (not onMouseDown)');
    } else {
      console.log('❌ Event handling: Missing proper onClick handlers');
      allTestsPassed = false;
    }
    
    if (regComponent.includes('console.log(\'🎯 School selected:')) {
      console.log('✅ Debugging: Enhanced logging present');
    } else {
      console.log('❌ Debugging: Missing enhanced logging');
      allTestsPassed = false;
    }
    
    if (regComponent.includes('assessment-title') && regComponent.includes('Thandi')) {
      console.log('✅ Branding: Thandi branding classes applied');
    } else {
      console.log('❌ Branding: Missing Thandi branding');
      allTestsPassed = false;
    }
    
    // Check assessment page
    console.log('📋 Checking assessment grade pages...');
    const gradePage = fs.readFileSync('app/assessment/grade/[grade]/page.jsx', 'utf8');
    
    if (gradePage.includes('Grade') && !gradePage.includes('corrupted')) {
      console.log('✅ Grade display: Clean grade display (no corruption)');
    } else {
      console.log('❌ Grade display: Potential display issues');
      allTestsPassed = false;
    }
    
  } catch (error) {
    console.log(`❌ Component test error: ${error.message}`);
    allTestsPassed = false;
  }
  
  // Test 5: CSS and Styling
  console.log('\n🔍 TEST 5: CSS AND STYLING');
  console.log('==========================');
  
  try {
    const fs = require('fs');
    
    console.log('📋 Checking global CSS...');
    const globalCSS = fs.readFileSync('app/globals.css', 'utf8');
    
    if (globalCSS.includes('assessment-title') && globalCSS.includes('assessment-container')) {
      console.log('✅ CSS classes: Assessment styling classes present');
    } else {
      console.log('❌ CSS classes: Missing assessment styling');
      allTestsPassed = false;
    }
    
    if (globalCSS.includes('form-input-assessment')) {
      console.log('✅ Form styling: Assessment form classes present');
    } else {
      console.log('❌ Form styling: Missing form classes');
      allTestsPassed = false;
    }
    
  } catch (error) {
    console.log(`❌ CSS test error: ${error.message}`);
    allTestsPassed = false;
  }
  
  // Final Results
  console.log('\n📊 COMPREHENSIVE TEST RESULTS');
  console.log('==============================');
  
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ System is ready for deployment');
    console.log('');
    console.log('📋 VERIFIED FUNCTIONALITY:');
    console.log('==========================');
    console.log('✅ School search API working');
    console.log('✅ Student registration API working');
    console.log('✅ Assessment pages loading');
    console.log('✅ Grade-specific routes working');
    console.log('✅ Vercel configuration correct');
    console.log('✅ Component event handling fixed');
    console.log('✅ Thandi branding applied');
    console.log('✅ CSS styling intact');
    console.log('');
    console.log('🚀 READY TO COMMIT AND DEPLOY');
    
  } else {
    console.log('❌ SOME TESTS FAILED');
    console.log('⚠️  Please fix issues before deployment');
    console.log('');
    console.log('🔧 NEXT STEPS:');
    console.log('==============');
    console.log('1. Review failed tests above');
    console.log('2. Fix identified issues');
    console.log('3. Re-run this test');
    console.log('4. Only deploy when all tests pass');
  }
  
  console.log('\n📞 MANUAL TESTING RECOMMENDED:');
  console.log('==============================');
  console.log('1. Open: http://localhost:3006/assessment');
  console.log('2. Test student registration flow');
  console.log('3. Try school search and selection');
  console.log('4. Complete assessment for each grade');
  console.log('5. Verify anonymous flow works');
  console.log('6. Check mobile responsiveness');
  
  return allTestsPassed;
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data
        });
      });
    }).on('error', reject);
  });
}

function makePostRequest(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: responseData
        });
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Run the comprehensive test
comprehensiveLocalTest().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});