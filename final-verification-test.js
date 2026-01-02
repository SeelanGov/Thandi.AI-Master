#!/usr/bin/env node

const http = require('http');

async function finalVerificationTest() {
  console.log('🎯 FINAL VERIFICATION TEST - READY FOR DEPLOYMENT');
  console.log('=================================================\n');
  
  let criticalIssues = 0;
  let warnings = 0;
  
  console.log('🔍 CRITICAL FUNCTIONALITY TESTS');
  console.log('===============================');
  
  // Test 1: Core API endpoints
  console.log('1️⃣ Testing Core API Endpoints...');
  try {
    const schoolSearch = await makeRequest('http://localhost:3006/api/schools/search?q=high&limit=1');
    if (schoolSearch.status === 200) {
      const schoolData = JSON.parse(schoolSearch.data);
      if (schoolData.results && schoolData.results.length > 0) {
        console.log('   ✅ School search API working');
        
        const testSchool = schoolData.results[0];
        const registration = await makePostRequest('http://localhost:3006/api/student/register', {
          student_name: 'Final',
          student_surname: 'Test',
          school_id: testSchool.school_id,
          grade: '12',
          consent_given: true,
          consent_timestamp: new Date().toISOString(),
          consent_version: 'v1.0'
        });
        
        if (registration.status === 200) {
          console.log('   ✅ Student registration API working');
        } else {
          console.log('   ❌ Student registration API failed');
          criticalIssues++;
        }
      } else {
        console.log('   ❌ School search returns no results');
        criticalIssues++;
      }
    } else {
      console.log('   ❌ School search API failed');
      criticalIssues++;
    }
  } catch (error) {
    console.log(`   ❌ API test error: ${error.message}`);
    criticalIssues++;
  }
  
  // Test 2: Assessment pages
  console.log('\n2️⃣ Testing Assessment Pages...');
  try {
    const assessmentPage = await makeRequest('http://localhost:3006/assessment');
    if (assessmentPage.status === 200) {
      console.log('   ✅ Main assessment page loads');
      
      if (assessmentPage.data.includes('Thandi Career Assessment')) {
        console.log('   ✅ Thandi branding present');
      } else {
        console.log('   ⚠️  Thandi branding not detected');
        warnings++;
      }
    } else {
      console.log('   ❌ Assessment page failed to load');
      criticalIssues++;
    }
    
    // Test grade pages
    for (const grade of ['10', '11', '12']) {
      const gradePage = await makeRequest(`http://localhost:3006/assessment/grade/${grade}`);
      if (gradePage.status === 200) {
        console.log(`   ✅ Grade ${grade} page loads`);
      } else {
        console.log(`   ❌ Grade ${grade} page failed`);
        criticalIssues++;
      }
    }
  } catch (error) {
    console.log(`   ❌ Page test error: ${error.message}`);
    criticalIssues++;
  }
  
  // Test 3: Build configuration
  console.log('\n3️⃣ Testing Build Configuration...');
  try {
    const fs = require('fs');
    
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    if (vercelConfig.buildCommand === 'npm run build' && 
        vercelConfig.installCommand === 'npm install --legacy-peer-deps') {
      console.log('   ✅ Vercel configuration correct');
    } else {
      console.log('   ❌ Vercel configuration incorrect');
      criticalIssues++;
    }
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.scripts.build === 'next build') {
      console.log('   ✅ Package.json build script correct');
    } else {
      console.log('   ❌ Package.json build script incorrect');
      criticalIssues++;
    }
  } catch (error) {
    console.log(`   ❌ Config test error: ${error.message}`);
    criticalIssues++;
  }
  
  // Test 4: Component integrity
  console.log('\n4️⃣ Testing Component Integrity...');
  try {
    const fs = require('fs');
    
    const regComponent = fs.readFileSync('components/BulletproofStudentRegistration.jsx', 'utf8');
    if (regComponent.includes('onClick={(e) => {') && 
        regComponent.includes('🎯 School selected:')) {
      console.log('   ✅ Registration component has proper event handling');
    } else {
      console.log('   ❌ Registration component event handling issues');
      criticalIssues++;
    }
    
    if (regComponent.includes('assessment-title') && 
        regComponent.includes('Thandi')) {
      console.log('   ✅ Registration component has Thandi branding');
    } else {
      console.log('   ⚠️  Registration component branding incomplete');
      warnings++;
    }
  } catch (error) {
    console.log(`   ❌ Component test error: ${error.message}`);
    criticalIssues++;
  }
  
  // Test 5: Error handling
  console.log('\n5️⃣ Testing Error Handling...');
  try {
    const invalidReg = await makePostRequest('http://localhost:3006/api/student/register', {
      student_name: '',
      student_surname: '',
      school_id: '',
      grade: '',
      consent_given: false
    });
    
    if (invalidReg.status === 400) {
      console.log('   ✅ Error handling works correctly');
    } else {
      console.log('   ❌ Error handling not working');
      criticalIssues++;
    }
  } catch (error) {
    console.log(`   ❌ Error handling test failed: ${error.message}`);
    criticalIssues++;
  }
  
  // Final Assessment
  console.log('\n📊 FINAL DEPLOYMENT READINESS ASSESSMENT');
  console.log('========================================');
  
  if (criticalIssues === 0) {
    console.log('🎉 SYSTEM IS READY FOR DEPLOYMENT!');
    console.log('');
    console.log('✅ DEPLOYMENT CHECKLIST:');
    console.log('========================');
    console.log('✅ All critical APIs working');
    console.log('✅ All assessment pages loading');
    console.log('✅ Vercel configuration correct');
    console.log('✅ Component event handling fixed');
    console.log('✅ Error handling working');
    
    if (warnings > 0) {
      console.log(`\n⚠️  ${warnings} warning(s) detected - non-critical`);
    }
    
    console.log('\n🚀 READY TO COMMIT AND DEPLOY');
    console.log('=============================');
    console.log('1. git add .');
    console.log('2. git commit -m "Fix school selection UI and Vercel deployment"');
    console.log('3. git push origin main');
    console.log('4. Monitor Vercel deployment');
    
    return true;
    
  } else {
    console.log(`❌ ${criticalIssues} CRITICAL ISSUE(S) FOUND`);
    console.log('⚠️  DO NOT DEPLOY UNTIL ISSUES ARE FIXED');
    console.log('');
    console.log('🔧 REQUIRED ACTIONS:');
    console.log('====================');
    console.log('1. Review failed tests above');
    console.log('2. Fix all critical issues');
    console.log('3. Re-run this verification test');
    console.log('4. Only deploy when all tests pass');
    
    return false;
  }
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

finalVerificationTest().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Final verification failed:', error);
  process.exit(1);
});