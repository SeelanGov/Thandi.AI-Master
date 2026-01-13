// =====================================================
// EMERGENCY SIMPLE DIAGNOSIS - January 13, 2026
// Purpose: Quick diagnosis of registration failure
// =====================================================

const https = require('https');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function emergencySimpleDiagnosis() {
  console.log('🚨 EMERGENCY DIAGNOSIS - Registration Still Failing');
  console.log('===================================================');
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Test the function that should be fixed
    console.log('🔍 Testing SQL function with real school...');
    const { data, error } = await supabase
      .rpc('create_student_school_association', {
        p_student_name: 'Test',
        p_student_surname: 'Student', 
        p_school_id: 'ZAF-200100005',
        p_grade: 11,
        p_consent_given: true,
        p_consent_method: 'web_form'
      });
    
    if (error) {
      console.log('❌ FUNCTION ERROR:', error.message);
      console.log('❌ ERROR CODE:', error.code);
      console.log('❌ ERROR DETAILS:', error.details);
      
      if (error.message.includes('function name') && error.message.includes('not unique')) {
        console.log('');
        console.log('🚨 CRITICAL FINDING: SQL FUNCTION AMBIGUITY STILL EXISTS!');
        console.log('🚨 The hotfix did NOT resolve the database issue!');
        console.log('');
        console.log('IMMEDIATE ACTION REQUIRED:');
        console.log('1. The SQL hotfix needs to be re-applied to production');
        console.log('2. Multiple function versions still exist in production database');
        console.log('3. Registration will continue failing until this is fixed');
        
        return { 
          success: false, 
          issue: 'SQL_FUNCTION_AMBIGUITY_STILL_EXISTS',
          error: error.message 
        };
      } else {
        console.log('');
        console.log('⚠️ Different database error:', error.message);
        return { 
          success: false, 
          issue: 'OTHER_DATABASE_ERROR',
          error: error.message 
        };
      }
    } else {
      console.log('✅ Function working:', data);
      
      // If function works, test the API
      console.log('');
      console.log('🔍 Function works, testing API endpoint...');
      
      const testData = {
        studentName: 'Test',
        studentSurname: 'Student',
        schoolId: 'ZAF-200100005', 
        grade: 11,
        consentGiven: true,
        consentMethod: 'web_form'
      };
      
      try {
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
          req.setTimeout(15000, () => reject(new Error('Timeout')));
          req.write(postData);
          req.end();
        });
        
        console.log('📊 API Status:', apiResponse.statusCode);
        console.log('📊 API Response:', JSON.stringify(apiResponse.data, null, 2));
        
        if (apiResponse.statusCode === 200 && apiResponse.data.success) {
          console.log('✅ API working correctly');
          return { success: true, issue: 'NONE' };
        } else {
          console.log('❌ API failing');
          return { 
            success: false, 
            issue: 'API_ERROR',
            error: JSON.stringify(apiResponse.data)
          };
        }
        
      } catch (apiError) {
        console.log('❌ API request failed:', apiError.message);
        return { 
          success: false, 
          issue: 'API_REQUEST_FAILED',
          error: apiError.message 
        };
      }
    }
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
    return { 
      success: false, 
      issue: 'DIAGNOSIS_FAILED',
      error: error.message 
    };
  }
}

if (require.main === module) {
  emergencySimpleDiagnosis()
    .then(result => {
      console.log('\n' + '='.repeat(50));
      console.log('DIAGNOSIS RESULT:', result.issue);
      if (!result.success) {
        console.log('ERROR:', result.error);
      }
      console.log('='.repeat(50));
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Emergency diagnosis failed:', error);
      process.exit(1);
    });
}

module.exports = { emergencySimpleDiagnosis };