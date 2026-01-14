#!/usr/bin/env node

/**
 * VERIFY CRITICAL APIS LIVE - JAN 13 2026
 * 
 * Test the critical APIs that are now live in production
 */

const https = require('https');

class LiveAPIVerifier {
  constructor() {
    this.baseURL = 'https://www.thandi.online';
    this.results = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      errors: []
    };
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[${timestamp}] [${level}] ${message}`);
  }

  // Make HTTP request
  makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const req = https.request(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      if (options.method === 'POST' && options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
  }

  // Test API endpoint
  async testAPI(name, path, options = {}) {
    this.log(`🧪 Testing ${name}...`);
    this.results.totalTests++;
    
    try {
      const url = `${this.baseURL}${path}`;
      const response = await this.makeRequest(url, options);
      
      // Check if response is successful
      if (response.statusCode >= 200 && response.statusCode < 300) {
        this.log(`  ✅ ${name} - Status: ${response.statusCode}`);
        
        // Check for cache headers
        if (response.headers['cache-control'] && response.headers['cache-control'].includes('no-cache')) {
          this.log(`  ✅ ${name} - Cache headers present`);
        }
        
        // Try to parse JSON response
        try {
          const jsonData = JSON.parse(response.data);
          this.log(`  ✅ ${name} - Valid JSON response`);
          
          // Log key response fields
          if (jsonData.success !== undefined) {
            this.log(`  ℹ️ ${name} - Success: ${jsonData.success}`);
          }
          if (jsonData.error) {
            this.log(`  ℹ️ ${name} - Error: ${jsonData.error}`);
          }
        } catch (parseError) {
          this.log(`  ⚠️ ${name} - Non-JSON response (might be HTML)`, 'WARNING');
        }
        
        this.results.passedTests++;
        return true;
      } else {
        this.log(`  ❌ ${name} - Status: ${response.statusCode}`, 'ERROR');
        this.results.failedTests++;
        this.results.errors.push(`${name}: HTTP ${response.statusCode}`);
        return false;
      }
    } catch (error) {
      this.log(`  ❌ ${name} - Error: ${error.message}`, 'ERROR');
      this.results.failedTests++;
      this.results.errors.push(`${name}: ${error.message}`);
      return false;
    }
  }

  // Test health endpoints
  async testHealthEndpoints() {
    this.log('🏥 Testing Health Endpoints...');
    console.log('');
    
    await this.testAPI('Health Check', '/api/health');
    await this.testAPI('Cache Health', '/api/cache/health');
    
    console.log('');
  }

  // Test school validation
  async testSchoolValidation() {
    this.log('🏫 Testing School Validation...');
    console.log('');
    
    // Test with invalid school code
    await this.testAPI('School Validation (Invalid)', '/api/schools/validate-code?code=INVALID');
    
    // Test with valid school code format
    await this.testAPI('School Validation (Valid Format)', '/api/schools/validate-code?code=200123456');
    
    console.log('');
  }

  // Test student registration
  async testStudentRegistration() {
    this.log('👨‍🎓 Testing Student Registration...');
    console.log('');
    
    // Test with missing data
    const invalidRegistration = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        student_name: '',
        student_surname: '',
        school_id: '',
        grade: ''
      })
    };
    
    await this.testAPI('Student Registration (Invalid)', '/api/student/register', invalidRegistration);
    
    console.log('');
  }

  // Test consent management
  async testConsentManagement() {
    this.log('📋 Testing Consent Management...');
    console.log('');
    
    // Test with missing data
    const invalidConsent = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        student_id: '',
        consent_given: undefined
      })
    };
    
    await this.testAPI('Consent Management (Invalid)', '/api/consent/manage', invalidConsent);
    
    console.log('');
  }

  // Test grade assessment
  async testGradeAssessment() {
    this.log('📚 Testing Grade Assessment...');
    console.log('');
    
    await this.testAPI('Grade Assessment', '/api/g10-12');
    
    console.log('');
  }

  // Generate comprehensive report
  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 LIVE API VERIFICATION REPORT');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${this.results.totalTests}`);
    console.log(`Passed: ${this.results.passedTests}`);
    console.log(`Failed: ${this.results.failedTests}`);
    console.log(`Success Rate: ${((this.results.passedTests / this.results.totalTests) * 100).toFixed(1)}%`);
    
    if (this.results.failedTests > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.errors.forEach(error => console.log(`  • ${error}`));
    }
    
    console.log('\n🌐 LIVE URLS TO TEST:');
    console.log(`  • Registration: ${this.baseURL}/register`);
    console.log(`  • Assessment: ${this.baseURL}/assessment`);
    console.log(`  • Health Check: ${this.baseURL}/api/health`);
    
    console.log('\n💡 PHASE 0 STATUS:');
    if (this.results.passedTests >= this.results.totalTests * 0.8) {
      console.log('  ✅ Phase 0 critical APIs are working');
      console.log('  ✅ User registration should be functional');
      console.log('  ✅ School validation should work');
      console.log('  ✅ Ready for user testing');
    } else {
      console.log('  ⚠️ Some critical APIs have issues');
      console.log('  ⚠️ May need additional fixes before user testing');
    }
    
    console.log('='.repeat(80));
  }

  // Main execution
  async execute() {
    try {
      this.log('🚀 VERIFYING LIVE CRITICAL APIS');
      console.log(`Target: ${this.baseURL}`);
      console.log('Scope: Test Phase 0 critical functionality');
      console.log('');

      // Test all critical API categories
      await this.testHealthEndpoints();
      await this.testSchoolValidation();
      await this.testStudentRegistration();
      await this.testConsentManagement();
      await this.testGradeAssessment();

      // Generate final report
      this.generateReport();

      const success = this.results.failedTests === 0;
      
      if (success) {
        this.log('🎉 All critical APIs are working live!');
        console.log('\n🎯 READY FOR USER TESTING:');
        console.log('1. Test user registration flow');
        console.log('2. Verify school code validation');
        console.log('3. Complete assessment with registered user');
        console.log('4. Check consent recording');
      } else {
        this.log('⚠️ Some APIs have issues - may need investigation');
      }

      return success;

    } catch (error) {
      this.log(`❌ Verification failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }
}

// Execute verification
const verifier = new LiveAPIVerifier();
verifier.execute()
  .then(success => {
    if (success) {
      console.log('\n✅ Live API verification successful!');
      console.log('🌐 Ready for Phase 0 user testing!');
      process.exit(0);
    } else {
      console.log('\n⚠️ Live API verification completed with issues!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });