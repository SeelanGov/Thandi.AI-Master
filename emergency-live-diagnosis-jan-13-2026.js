// =====================================================
// EMERGENCY LIVE DIAGNOSIS - January 13, 2026
// Purpose: Diagnose why registration is still failing after hotfix
// =====================================================

const https = require('https');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function emergencyLiveDiagnosis() {
  console.log('🚨 EMERGENCY LIVE DIAGNOSIS - January 13, 2026');
  console.log('===============================================');
  console.log('Issue: Registration still failing after hotfix deployment');
  console.log('');
  
  const results = {
    databaseFunction: false,
    apiEndpoint: false,
    productionAPI: false,
    errorDetails: []
  };
  
  try {
    // ===== PHASE 1: DATABASE FUNCTION TEST =====
    console.log('🗄️ PHASE 1: DATABASE FUNCTION DIRECT TEST');
    console.log('==========================================');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Test with a real school to see exact error
    console.log('🔍 Testing with real school data...');
    const { data: schoolData, error: schoolError } = await supabase
      .from('school_master')
      .select('school_id, name')
      .eq('school_id', 'ZAF-200100005')
      .single();
    
    if (schoolError) {
      console.log('❌ School lookup failed:', schoolError.message);
      results.errorDetails.push('School lookup failed: ' + schoolError.message);
    } else {
      console.log('✅ School found:', schoolData.name);
    }
    
    // Test the function with real school
    console.log('🔍 Testing create_student_school_association function...');
    const { data: funcData, error: funcError } = await supabase
      .rpc('create_student_school_association', {
        p_student_name: 'Test',
        p_student_surname: 'Student',
        p_school_id: 'ZAF-200100005',
        p_grade: 11,
        p_consent_given: true,
        p_consent_method: 'web_form'
      });
    
    if (funcError) {
      console.log('❌ Function error:', funcError.message);
      console.log('❌ Function code:', funcError.code);
      console.log('❌ Function details:', funcError.details);
      results.errorDetails.push('Function error: ' + funcError.message);
      
      // Check if it's still the ambiguity error
      if (funcError.message.includes('function name') && funcError.message.includes('not unique')) {
        console.log('🚨 CRITICAL: Function ambiguity error STILL EXISTS!');
        results.errorDetails.push('CRITICAL: SQL function ambiguity not resolved');
      }
    } else {
      console.log('✅ Function executed successfully');
      console.log('✅ Result:', funcData);
      results.databaseFunction = true;
    }
    
    // ===== PHASE 2: API ENDPOINT TEST =====
    console.log('\n📡 PHASE 2: API ENDPOINT TEST');
    console.log('==============================');
    
    // Test the registration API with real data
    const testRegistration = {
      studentName: 'Test',
      studentSurname: 'Student',
      schoolId: 'ZAF-200100005',
      grade: 11,
      consentGiven: true,
      consentMethod: 'web_form'
    };
    
    console.log('🔍 Testing production API endpoint...');
    
    try {
      const apiResponse = await new Promise((resolve, reject) => {
        const postData = JSON.stringify(testRegistration);
        
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
                data: JSON.parse(data),
                headers: res.headers
              });
            } catch (e) {
              resolve({ 
                statusCode: res.statusCode, 
                data: data,
                headers: res.headers
              });
            }
          });
        });
        
        req.on('error', reject);
        req.setTimeout(15000, () => reject(new Error('API timeout')));
        req.write(postData);
        req.end();
      });
      
      console.log('📊 API Response Status:', apiResponse.statusCode);
      console.log('📊 API Response Data:', JSON.stringify(apiResponse.data, null, 2));
      
      if (apiResponse.statusCode === 200) {
        console.log('✅ API endpoint working correctly');
        results.apiEndpoint = true;
      } else {
        console.log('❌ API endpoint failed');
        results.errorDetails.push(`API returned ${apiResponse.statusCode}: ${JSON.stringify(apiResponse.data)}`);
      }
      
    } catch (apiError) {
      console.log('❌ API request failed:', apiError.message);
      results.errorDetails.push('API request failed: ' + apiError.message);
    }
    
    // ===== PHASE 3: CHECK DEPLOYMENT STATUS =====
    console.log('\n🚀 PHASE 3: DEPLOYMENT STATUS CHECK');
    console.log('====================================');
    
    // Check if our latest commit is actually deployed
    try {
      const deploymentCheck = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'thandi-ai-master-mttqfzi2s-thandiai-projects.vercel.app',
          port: 443,
          path: '/api/health',
          method: 'GET'
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
        req.setTimeout(10000, () => reject(new Error('Health check timeout')));
        req.end();
      });
      
      console.log('🔍 Health check response:', deploymentCheck);
      
    } catch (healthError) {
      console.log('⚠️ Health check failed:', healthError.message);
    }
    
    // ===== PHASE 4: SUPABASE FUNCTION VERIFICATION =====
    console.log('\n🔍 PHASE 4: SUPABASE FUNCTION VERIFICATION');
    console.log('===========================================');
    
    // Check if the function exists and what versions
    try {
      const { data: functions, error: funcListError } = await supabase
        .rpc('pg_get_functiondef', { funcoid: 'create_student_school_association'::regproc });
      
      if (funcListError) {
        console.log('⚠️ Could not get function definition:', funcListError.message);
      } else {
        console.log('📋 Function definition exists');
      }
      
    } catch (defError) {
      console.log('⚠️ Function definition check failed:', defError.message);
    }
    
  } catch (error) {
    console.error('❌ Emergency diagnosis failed:', error);
    results.errorDetails.push('Critical diagnosis failure: ' + error.message);
  }
  
  // ===== FINAL ASSESSMENT =====
  console.log('\n📊 EMERGENCY DIAGNOSIS RESULTS');
  console.log('===============================');
  
  console.log('Database Function:', results.databaseFunction ? '✅' : '❌');
  console.log('API Endpoint:', results.apiEndpoint ? '✅' : '❌');
  
  if (results.errorDetails.length > 0) {
    console.log('\n🚨 CRITICAL ERRORS FOUND:');
    results.errorDetails.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  // Determine next steps
  console.log('\n🎯 IMMEDIATE ACTION REQUIRED');
  console.log('============================');
  
  if (results.errorDetails.some(e => e.includes('function name') && e.includes('not unique'))) {
    console.log('🚨 SQL FUNCTION AMBIGUITY STILL EXISTS');
    console.log('The hotfix did not resolve the database issue.');
    console.log('');
    console.log('REQUIRED ACTIONS:');
    console.log('1. Re-apply SQL hotfix to production database');
    console.log('2. Verify function ambiguity is resolved');
    console.log('3. Test registration flow again');
  } else if (!results.databaseFunction) {
    console.log('🚨 DATABASE FUNCTION ISSUE');
    console.log('The database function is not working correctly.');
  } else if (!results.apiEndpoint) {
    console.log('🚨 API ENDPOINT ISSUE');
    console.log('The API endpoint is not processing requests correctly.');
  } else {
    console.log('⚠️ UNKNOWN ISSUE');
    console.log('Registration failing for unknown reasons.');
  }
  
  return {
    success: results.databaseFunction && results.apiEndpoint,
    errors: results.errorDetails,
    databaseWorking: results.databaseFunction,
    apiWorking: results.apiEndpoint
  };
}

if (require.main === module) {
  emergencyLiveDiagnosis()
    .then(result => {
      console.log(`\nDiagnosis Complete: ${result.success ? 'ISSUES IDENTIFIED' : 'CRITICAL ISSUES FOUND'}`);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Emergency diagnosis failed:', error);
      process.exit(1);
    });
}

module.exports = { emergencyLiveDiagnosis };