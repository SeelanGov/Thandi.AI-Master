// =====================================================
// DEPLOYMENT MONITORING SCRIPT - January 13, 2026
// Purpose: Monitor Vercel deployment and verify functionality
// =====================================================

const https = require('https');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function monitorDeployment() {
  console.log('🔍 MONITORING DEPLOYMENT - January 13, 2026');
  console.log('==============================================');
  
  const results = {
    deploymentTriggered: false,
    siteAccessible: false,
    registrationWorking: false,
    databaseFunctional: false,
    noErrors: false
  };
  
  const errors = [];
  const warnings = [];
  
  try {
    // Wait a moment for deployment to start
    console.log('⏳ Waiting for deployment to process...');
    await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds
    
    // ===== PHASE 1: SITE ACCESSIBILITY =====
    console.log('\n🌐 PHASE 1: SITE ACCESSIBILITY');
    console.log('===============================');
    
    const productionUrls = [
      'https://thandi-ai-master-mttqfzi2s-thandiai-projects.vercel.app',
      'https://thandi.online'
    ];
    
    for (const url of productionUrls) {
      try {
        console.log(`🔍 Testing: ${url}`);
        
        const response = await new Promise((resolve, reject) => {
          const req = https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, data }));
          });
          req.on('error', reject);
          req.setTimeout(10000, () => reject(new Error('Timeout')));
        });
        
        if (response.statusCode === 200) {
          console.log(`✅ ${url}: Accessible (${response.statusCode})`);
          results.siteAccessible = true;
        } else {
          console.log(`⚠️ ${url}: Status ${response.statusCode}`);
          warnings.push(`${url} returned status ${response.statusCode}`);
        }
        
      } catch (error) {
        console.log(`❌ ${url}: ${error.message}`);
        errors.push(`${url} failed: ${error.message}`);
      }
    }
    
    // ===== PHASE 2: DATABASE FUNCTIONALITY =====
    console.log('\n🗄️ PHASE 2: DATABASE FUNCTIONALITY');
    console.log('===================================');
    
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      
      // Test the fixed function
      console.log('🔍 Testing SQL function...');
      const { data, error } = await supabase
        .rpc('create_student_school_association', {
          p_student_name: 'Test',
          p_student_surname: 'Student',
          p_school_id: 'NONEXISTENT',
          p_grade: 11,
          p_consent_given: true,
          p_consent_method: 'web_form'
        });
      
      if (error) {
        if (error.message.includes('Could not find the function')) {
          errors.push('SQL function not found - deployment may not be complete');
        } else if (error.message.includes('Invalid school')) {
          console.log('✅ SQL function working (expected validation error)');
          results.databaseFunctional = true;
        } else {
          console.log(`⚠️ SQL function error: ${error.message}`);
          warnings.push(`SQL function error: ${error.message}`);
        }
      } else {
        console.log('✅ SQL function executed successfully');
        results.databaseFunctional = true;
      }
      
    } catch (dbError) {
      console.log(`❌ Database test failed: ${dbError.message}`);
      errors.push(`Database test failed: ${dbError.message}`);
    }
    
    // ===== PHASE 3: REGISTRATION API TEST =====
    console.log('\n📡 PHASE 3: REGISTRATION API TEST');
    console.log('==================================');
    
    try {
      const testData = {
        studentName: 'Test',
        studentSurname: 'Student',
        schoolId: 'NONEXISTENT',
        grade: 11,
        consentGiven: true,
        consentMethod: 'web_form'
      };
      
      console.log('🔍 Testing registration API...');
      
      // Test the API endpoint
      const apiResponse = await new Promise((resolve, reject) => {
        const postData = JSON.stringify(testData);
        
        const options = {
          hostname: 'thandi-ai-master-mttqfzi2s-thandiai-projects.vercel.app',
          port: 443,
          path: '/api/student/register',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        };
        
        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              resolve({ 
                statusCode: res.statusCode, 
                data: JSON.parse(data) 
              });
            } catch (e) {
              resolve({ 
                statusCode: res.statusCode, 
                data: data 
              });
            }
          });
        });
        
        req.on('error', reject);
        req.setTimeout(15000, () => reject(new Error('API timeout')));
        req.write(postData);
        req.end();
      });
      
      if (apiResponse.statusCode === 200 || apiResponse.statusCode === 400) {
        console.log(`✅ Registration API responding (${apiResponse.statusCode})`);
        
        if (apiResponse.data && apiResponse.data.error && 
            apiResponse.data.error.includes('Invalid school')) {
          console.log('✅ Registration validation working correctly');
          results.registrationWorking = true;
        } else {
          console.log('⚠️ Unexpected API response:', apiResponse.data);
          warnings.push('Unexpected API response structure');
        }
      } else {
        console.log(`❌ Registration API failed: ${apiResponse.statusCode}`);
        errors.push(`Registration API returned ${apiResponse.statusCode}`);
      }
      
    } catch (apiError) {
      console.log(`❌ Registration API test failed: ${apiError.message}`);
      errors.push(`Registration API test failed: ${apiError.message}`);
    }
    
    // ===== PHASE 4: ERROR MONITORING =====
    console.log('\n🚨 PHASE 4: ERROR MONITORING');
    console.log('=============================');
    
    // Check for the specific error we were fixing
    if (results.databaseFunctional && results.registrationWorking) {
      console.log('✅ No "function name is not unique" errors detected');
      results.noErrors = true;
    } else {
      console.log('⚠️ Some functionality issues detected');
    }
    
  } catch (error) {
    console.error('❌ Monitoring failed:', error);
    errors.push('Critical monitoring failure: ' + error.message);
  }
  
  // ===== FINAL ASSESSMENT =====
  console.log('\n📊 DEPLOYMENT MONITORING RESULTS');
  console.log('=================================');
  
  const checks = [
    { name: 'Site Accessible', status: results.siteAccessible },
    { name: 'Database Functional', status: results.databaseFunctional },
    { name: 'Registration Working', status: results.registrationWorking },
    { name: 'No Critical Errors', status: results.noErrors }
  ];
  
  for (const check of checks) {
    console.log(`  ${check.name}: ${check.status ? '✅' : '❌'}`);
  }
  
  const totalPassed = Object.values(results).filter(r => r === true).length;
  const totalChecks = Object.values(results).length;
  
  console.log(`\nOverall Score: ${totalPassed}/${totalChecks} checks passed`);
  
  if (errors.length > 0) {
    console.log('\n❌ ERRORS DETECTED:');
    errors.forEach(error => console.log(`  • ${error}`));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️ WARNINGS:');
    warnings.forEach(warning => console.log(`  • ${warning}`));
  }
  
  const deploymentSuccessful = results.siteAccessible && 
                              results.databaseFunctional && 
                              results.registrationWorking;
  
  if (deploymentSuccessful) {
    console.log('\n🎉 DEPLOYMENT SUCCESSFUL');
    console.log('========================');
    console.log('✅ Hotfix deployed successfully');
    console.log('✅ SQL function ambiguity resolved');
    console.log('✅ Registration functionality restored');
    console.log('');
    console.log('🔗 Production URLs:');
    console.log('• https://thandi.online/assessment');
    console.log('• https://thandi-ai-master-mttqfzi2s-thandiai-projects.vercel.app/assessment');
    
    return { success: true, score: `${totalPassed}/${totalChecks}`, errors, warnings };
    
  } else {
    console.log('\n⚠️ DEPLOYMENT ISSUES DETECTED');
    console.log('==============================');
    console.log('Some functionality may not be working correctly.');
    console.log('Manual verification recommended.');
    
    return { success: false, score: `${totalPassed}/${totalChecks}`, errors, warnings };
  }
}

if (require.main === module) {
  monitorDeployment()
    .then(result => {
      console.log(`\nFinal Status: ${result.success ? 'SUCCESS' : 'NEEDS ATTENTION'}`);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Monitoring failed:', error);
      process.exit(1);
    });
}

module.exports = { monitorDeployment };