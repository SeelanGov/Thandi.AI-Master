#!/usr/bin/env node

const https = require('https');

async function diagnoseDatabaseIssue() {
  console.log('🔍 SYSTEMATIC DATABASE DIAGNOSIS');
  console.log('================================\n');
  
  console.log('📊 Step 1: Testing database connectivity...');
  
  // Test health endpoint to see if database is connected
  try {
    const healthResult = await makeRequest('https://www.thandi.online/api/health');
    console.log(`Health API: ${healthResult.status}`);
    
    if (healthResult.status === 200) {
      const healthData = JSON.parse(healthResult.data);
      console.log('Environment check:');
      console.log(`  - Supabase URL: ${healthData.environment.hasSupabaseUrl ? 'Present' : 'Missing'}`);
      console.log(`  - Supabase Anon Key: ${healthData.environment.hasSupabaseAnonKey ? 'Present' : 'Missing'}`);
      console.log(`  - Supabase Service Key: ${healthData.environment.hasSupabaseServiceKey ? 'Present' : 'Missing'}`);
    }
  } catch (error) {
    console.log(`❌ Health check failed: ${error.message}`);
  }
  
  console.log('\n📚 Step 2: Testing schools table access...');
  
  // Test if we can get provinces (simpler query)
  try {
    const provincesResult = await makePostRequest(
      'https://www.thandi.online/api/schools/search',
      { action: 'get_provinces' }
    );
    
    console.log(`Provinces API: ${provincesResult.status}`);
    
    if (provincesResult.status === 200) {
      const provincesData = JSON.parse(provincesResult.data);
      console.log(`Provinces found: ${provincesData.provinces ? provincesData.provinces.length : 0}`);
      if (provincesData.provinces && provincesData.provinces.length > 0) {
        console.log(`Sample provinces: ${provincesData.provinces.slice(0, 3).join(', ')}`);
      }
    } else {
      console.log(`Provinces API failed: ${provincesResult.data}`);
    }
  } catch (error) {
    console.log(`❌ Provinces test failed: ${error.message}`);
  }
  
  console.log('\n🏫 Step 3: Testing school search with different queries...');
  
  const testQueries = ['test', 'high', 'school', 'secondary', 'college'];
  
  for (const query of testQueries) {
    try {
      const searchResult = await makeRequest(`https://www.thandi.online/api/schools/search?q=${query}&limit=5`);
      console.log(`Search "${query}": ${searchResult.status}`);
      
      if (searchResult.status === 200) {
        const searchData = JSON.parse(searchResult.data);
        console.log(`  Results: ${searchData.total || 0}`);
        if (searchData.results && searchData.results.length > 0) {
          console.log(`  Sample: ${searchData.results[0].name}`);
        }
      } else {
        console.log(`  Error: ${searchResult.data}`);
      }
    } catch (error) {
      console.log(`  Failed: ${error.message}`);
    }
  }
  
  console.log('\n🔧 Step 4: Testing registration with known good data...');
  
  // Test registration with minimal data to see exact error
  try {
    const minimalRegistration = {
      student_name: 'Test',
      student_surname: 'Student',
      school_id: 'any-school-id',
      grade: '12',
      consent_given: true,
      consent_timestamp: new Date().toISOString(),
      consent_version: 'v1.0'
    };
    
    const regResult = await makePostRequest(
      'https://www.thandi.online/api/student/register',
      minimalRegistration
    );
    
    console.log(`Registration test: ${regResult.status}`);
    console.log(`Response: ${regResult.data}`);
    
    if (regResult.status !== 200) {
      try {
        const errorData = JSON.parse(regResult.data);
        console.log(`Specific error: ${errorData.error}`);
      } catch (e) {
        console.log('Could not parse error response');
      }
    }
    
  } catch (error) {
    console.log(`❌ Registration test failed: ${error.message}`);
  }
  
  console.log('\n📋 DIAGNOSIS SUMMARY:');
  console.log('====================');
  console.log('Based on the tests above, the root cause is likely:');
  console.log('1. Empty school_master table in database');
  console.log('2. Database connection/permission issues');
  console.log('3. Missing database schema/tables');
  console.log('4. Environment variable configuration issues');
  
  console.log('\n🔧 REQUIRED ACTIONS:');
  console.log('1. Check Supabase database for school_master table');
  console.log('2. Verify table has data and proper structure');
  console.log('3. Check database permissions and RLS policies');
  console.log('4. Ensure environment variables are correct');
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
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
      port: 443,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
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

diagnoseDatabaseIssue();