/**
 * PRODUCTION DEPLOYMENT VERIFICATION
 * Dev Lead Responsibility: Complete systematic production testing
 * Final step in PDF generation system implementation
 */

const fs = require('fs');

async function productionDeploymentVerification() {
  console.log('🚀 PRODUCTION DEPLOYMENT VERIFICATION');
  console.log('====================================');
  console.log('Dev Lead Responsibility: Complete systematic production testing\n');

  const results = {
    phase1: { name: 'Production Environment Check', status: 'pending', details: [] },
    phase2: { name: 'Live API Endpoint Testing', status: 'pending', details: [] },
    phase3: { name: 'Production PDF Generation', status: 'pending', details: [] },
    phase4: { name: 'End-to-End User Flow', status: 'pending', details: [] },
    phase5: { name: 'Performance Verification', status: 'pending', details: [] },
    phase6: { name: 'Error Handling Validation', status: 'pending', details: [] }
  };

  try {
    // PHASE 1: PRODUCTION ENVIRONMENT CHECK
    console.log('📋 PHASE 1: PRODUCTION ENVIRONMENT CHECK');
    console.log('----------------------------------------');
    
    // Check production URL accessibility
    const productionUrls = [
      'https://thandi.online',
      'https://www.thandi.online',
      'https://thandi-online.vercel.app'
    ];
    
    let productionUrl = null;
    for (const url of productionUrls) {
      try {
        console.log(`🔄 Testing ${url}...`);
        const response = await fetch(url, { 
          method: 'HEAD',
          timeout: 10000 
        });
        
        if (response.ok) {
          console.log(`✅ ${url} is accessible (${response.status})`);
          results.phase1.details.push(`✅ ${url} accessible`);
          productionUrl = url;
          break;
        } else {
          console.log(`❌ ${url} returned ${response.status}`);
          results.phase1.details.push(`❌ ${url} failed: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${url} error: ${error.message}`);
        results.phase1.details.push(`❌ ${url} error: ${error.message}`);
      }
    }
    
    if (!productionUrl) {
      console.log('❌ No production URL accessible');
      results.phase1.status = 'failed';
      return results;
    }
    
    // Check critical production routes
    const criticalRoutes = [
      '/assessment',
      '/results',
      '/api/pdf/generate'
    ];
    
    let routesValid = true;
    for (const route of criticalRoutes) {
      try {
        const fullUrl = `${productionUrl}${route}`;
        console.log(`🔄 Testing route: ${route}`);
        
        const response = await fetch(fullUrl, {
          method: route === '/api/pdf/generate' ? 'GET' : 'HEAD',
          timeout: 10000
        });
        
        if (response.ok || response.status === 405) { // 405 is OK for POST-only endpoints
          console.log(`✅ Route ${route} accessible`);
          results.phase1.details.push(`✅ Route ${route} accessible`);
        } else {
          console.log(`❌ Route ${route} failed: ${response.status}`);
          results.phase1.details.push(`❌ Route ${route} failed: ${response.status}`);
          routesValid = false;
        }
      } catch (error) {
        console.log(`❌ Route ${route} error: ${error.message}`);
        results.phase1.details.push(`❌ Route ${route} error: ${error.message}`);
        routesValid = false;
      }
    }
    
    results.phase1.status = routesValid ? 'passed' : 'failed';
    
    if (!routesValid) {
      console.log('\n❌ PHASE 1 FAILED - Production environment not ready');
      return results;
    }

    // PHASE 2: LIVE API ENDPOINT TESTING
    console.log('\n📋 PHASE 2: LIVE API ENDPOINT TESTING');
    console.log('------------------------------------');
    
    try {
      // Load mock data for testing
      const mockData = JSON.parse(fs.readFileSync('mock-assessment-results.json', 'utf8'));
      
      console.log('🔄 Testing live PDF generation API...');
      
      const apiResponse = await fetch(`${productionUrl}/api/pdf/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          results: mockData,
          sessionId: Date.now().toString()
        }),
        timeout: 30000 // 30 second timeout for PDF generation
      });

      if (apiResponse.ok) {
        const contentType = apiResponse.headers.get('content-type');
        const contentLength = apiResponse.headers.get('content-length');
        
        console.log(`✅ Live API responded successfully (${apiResponse.status})`);
        console.log(`✅ Content-Type: ${contentType}`);
        console.log(`✅ Content-Length: ${contentLength} bytes`);
        
        results.phase2.details.push(`✅ API response: ${apiResponse.status}`);
        results.phase2.details.push(`✅ Content-Type: ${contentType}`);
        results.phase2.details.push(`✅ Size: ${contentLength} bytes`);
        
        // Verify it's actually a PDF
        if (contentType && contentType.includes('application/pdf')) {
          console.log('✅ Live API returns valid PDF content');
          results.phase2.details.push('✅ Valid PDF content');
          
          // Verify PDF size is reasonable
          const pdfSize = parseInt(contentLength);
          if (pdfSize > 10000) {
            console.log('✅ PDF has reasonable content size');
            results.phase2.details.push('✅ Reasonable PDF size');
            results.phase2.status = 'passed';
          } else {
            console.log('⚠️ PDF seems small - may be missing content');
            results.phase2.details.push('⚠️ Small PDF size');
            results.phase2.status = 'warning';
          }
        } else {
          console.log('❌ Live API does not return PDF content');
          results.phase2.details.push('❌ Invalid content type');
          results.phase2.status = 'failed';
        }
        
      } else {
        const errorText = await apiResponse.text();
        console.log(`❌ Live API failed: ${apiResponse.status} - ${errorText}`);
        results.phase2.details.push(`❌ API failed: ${apiResponse.status}`);
        results.phase2.status = 'failed';
      }
      
    } catch (error) {
      console.log(`❌ Live API test error: ${error.message}`);
      results.phase2.details.push(`❌ API error: ${error.message}`);
      results.phase2.status = 'failed';
    }

    // PHASE 3: PRODUCTION PDF GENERATION
    console.log('\n📋 PHASE 3: PRODUCTION PDF GENERATION');
    console.log('------------------------------------');
    
    if (results.phase2.status === 'passed' || results.phase2.status === 'warning') {
      try {
        console.log('🔄 Testing production PDF generation quality...');
        
        // Test with different grade levels
        const testGrades = ['10', '11', '12'];
        let allGradesPass = true;
        
        for (const grade of testGrades) {
          console.log(`🔄 Testing Grade ${grade} PDF generation...`);
          
          const testData = {
            ...mockData,
            grade: grade,
            metadata: { ...mockData.metadata, grade: grade }
          };
          
          const gradeResponse = await fetch(`${productionUrl}/api/pdf/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              results: testData,
              sessionId: `grade-${grade}-${Date.now()}`
            }),
            timeout: 30000
          });
          
          if (gradeResponse.ok) {
            const contentLength = gradeResponse.headers.get('content-length');
            console.log(`✅ Grade ${grade} PDF generated (${contentLength} bytes)`);
            results.phase3.details.push(`✅ Grade ${grade}: ${contentLength} bytes`);
          } else {
            console.log(`❌ Grade ${grade} PDF generation failed: ${gradeResponse.status}`);
            results.phase3.details.push(`❌ Grade ${grade} failed: ${gradeResponse.status}`);
            allGradesPass = false;
          }
        }
        
        results.phase3.status = allGradesPass ? 'passed' : 'failed';
        
      } catch (error) {
        console.log(`❌ Production PDF generation test error: ${error.message}`);
        results.phase3.details.push(`❌ PDF generation error: ${error.message}`);
        results.phase3.status = 'failed';
      }
    } else {
      console.log('⏭️ Skipping PDF generation test - API test failed');
      results.phase3.status = 'skipped';
      results.phase3.details.push('⏭️ Skipped due to API failure');
    }

    // PHASE 4: END-TO-END USER FLOW
    console.log('\n📋 PHASE 4: END-TO-END USER FLOW');
    console.log('-------------------------------');
    
    try {
      console.log('🔄 Testing complete production user flow...');
      
      // Test results page accessibility
      const resultsResponse = await fetch(`${productionUrl}/results`, {
        timeout: 15000
      });
      
      if (resultsResponse.ok) {
        const resultsHTML = await resultsResponse.text();
        
        // Check for critical UI elements
        const uiChecks = [
          { name: 'Download PDF button', pattern: /Download PDF/i },
          { name: 'Results container', pattern: /results-container/i },
          { name: 'Warning banner', pattern: /READ THIS FIRST/i },
          { name: 'Footer warning', pattern: /VERIFY THIS INFORMATION/i },
          { name: 'Card layout support', pattern: /ResultsCardLayout|card-layout/i }
        ];
        
        let uiValid = true;
        for (const check of uiChecks) {
          if (check.pattern.test(resultsHTML)) {
            console.log(`✅ ${check.name} found in production`);
            results.phase4.details.push(`✅ ${check.name} present`);
          } else {
            console.log(`❌ ${check.name} missing in production`);
            results.phase4.details.push(`❌ ${check.name} missing`);
            uiValid = false;
          }
        }
        
        // Test JavaScript functionality
        const jsChecks = [
          { name: 'PDF download function', pattern: /downloadPDF|pdf.*generate/i },
          { name: 'Results parsing', pattern: /ResultsParser|parseResults/i },
          { name: 'Error handling', pattern: /catch.*error|error.*handling/i }
        ];
        
        for (const check of jsChecks) {
          if (check.pattern.test(resultsHTML)) {
            console.log(`✅ ${check.name} found in production`);
            results.phase4.details.push(`✅ ${check.name} present`);
          } else {
            console.log(`⚠️ ${check.name} not visible in HTML (may be in JS bundles)`);
            results.phase4.details.push(`⚠️ ${check.name} not in HTML`);
          }
        }
        
        results.phase4.status = uiValid ? 'passed' : 'failed';
        
      } else {
        console.log(`❌ Results page failed to load: ${resultsResponse.status}`);
        results.phase4.details.push(`❌ Results page failed: ${resultsResponse.status}`);
        results.phase4.status = 'failed';
      }
      
    } catch (error) {
      console.log(`❌ User flow test error: ${error.message}`);
      results.phase4.details.push(`❌ User flow error: ${error.message}`);
      results.phase4.status = 'failed';
    }

    // PHASE 5: PERFORMANCE VERIFICATION
    console.log('\n📋 PHASE 5: PERFORMANCE VERIFICATION');
    console.log('-----------------------------------');
    
    if (results.phase2.status === 'passed' || results.phase2.status === 'warning') {
      try {
        console.log('🔄 Testing production performance...');
        
        // Test PDF generation speed
        const performanceTests = [];
        const testCount = 3;
        
        for (let i = 0; i < testCount; i++) {
          const startTime = Date.now();
          
          const perfResponse = await fetch(`${productionUrl}/api/pdf/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              results: mockData,
              sessionId: `perf-test-${i}-${Date.now()}`
            }),
            timeout: 30000
          });
          
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          if (perfResponse.ok) {
            performanceTests.push(duration);
            console.log(`✅ Performance test ${i + 1}: ${duration}ms`);
          } else {
            console.log(`❌ Performance test ${i + 1} failed: ${perfResponse.status}`);
          }
        }
        
        if (performanceTests.length > 0) {
          const avgTime = performanceTests.reduce((a, b) => a + b, 0) / performanceTests.length;
          const maxTime = Math.max(...performanceTests);
          const minTime = Math.min(...performanceTests);
          
          console.log(`📊 Performance Results:`);
          console.log(`   Average: ${avgTime.toFixed(0)}ms`);
          console.log(`   Min: ${minTime}ms`);
          console.log(`   Max: ${maxTime}ms`);
          
          results.phase5.details.push(`📊 Average: ${avgTime.toFixed(0)}ms`);
          results.phase5.details.push(`📊 Min: ${minTime}ms`);
          results.phase5.details.push(`📊 Max: ${maxTime}ms`);
          
          // Performance thresholds
          if (avgTime < 10000) { // Under 10 seconds
            console.log('✅ Performance is acceptable');
            results.phase5.details.push('✅ Performance acceptable');
            results.phase5.status = 'passed';
          } else if (avgTime < 20000) { // Under 20 seconds
            console.log('⚠️ Performance is slow but acceptable');
            results.phase5.details.push('⚠️ Performance slow');
            results.phase5.status = 'warning';
          } else {
            console.log('❌ Performance is too slow');
            results.phase5.details.push('❌ Performance too slow');
            results.phase5.status = 'failed';
          }
        } else {
          console.log('❌ All performance tests failed');
          results.phase5.status = 'failed';
        }
        
      } catch (error) {
        console.log(`❌ Performance test error: ${error.message}`);
        results.phase5.details.push(`❌ Performance error: ${error.message}`);
        results.phase5.status = 'failed';
      }
    } else {
      console.log('⏭️ Skipping performance test - API test failed');
      results.phase5.status = 'skipped';
      results.phase5.details.push('⏭️ Skipped due to API failure');
    }

    // PHASE 6: ERROR HANDLING VALIDATION
    console.log('\n📋 PHASE 6: ERROR HANDLING VALIDATION');
    console.log('------------------------------------');
    
    try {
      console.log('🔄 Testing production error handling...');
      
      // Test invalid requests
      const errorTests = [
        {
          name: 'Empty request body',
          body: {},
          expectedStatus: 400
        },
        {
          name: 'Missing results data',
          body: { sessionId: 'test' },
          expectedStatus: 400
        },
        {
          name: 'Invalid results format',
          body: { results: 'invalid', sessionId: 'test' },
          expectedStatus: 400
        }
      ];
      
      let errorHandlingValid = true;
      for (const test of errorTests) {
        try {
          console.log(`🔄 Testing: ${test.name}`);
          
          const errorResponse = await fetch(`${productionUrl}/api/pdf/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(test.body),
            timeout: 10000
          });
          
          if (errorResponse.status === test.expectedStatus) {
            console.log(`✅ ${test.name}: Correct error status ${errorResponse.status}`);
            results.phase6.details.push(`✅ ${test.name}: Status ${errorResponse.status}`);
          } else {
            console.log(`❌ ${test.name}: Expected ${test.expectedStatus}, got ${errorResponse.status}`);
            results.phase6.details.push(`❌ ${test.name}: Wrong status ${errorResponse.status}`);
            errorHandlingValid = false;
          }
          
        } catch (error) {
          console.log(`❌ ${test.name}: Error ${error.message}`);
          results.phase6.details.push(`❌ ${test.name}: Error ${error.message}`);
          errorHandlingValid = false;
        }
      }
      
      results.phase6.status = errorHandlingValid ? 'passed' : 'failed';
      
    } catch (error) {
      console.log(`❌ Error handling test error: ${error.message}`);
      results.phase6.details.push(`❌ Error handling error: ${error.message}`);
      results.phase6.status = 'failed';
    }

    return results;

  } catch (error) {
    console.error('💥 Production deployment verification failed:', error);
    return results;
  }
}

// Execute verification if run directly
if (require.main === module) {
  productionDeploymentVerification()
    .then(results => {
      console.log('\n🚀 PRODUCTION DEPLOYMENT VERIFICATION RESULTS');
      console.log('=============================================');
      
      let allPassed = true;
      let hasWarnings = false;
      
      Object.entries(results).forEach(([phase, data]) => {
        const status = data.status === 'passed' ? '✅' : 
                      data.status === 'failed' ? '❌' : 
                      data.status === 'warning' ? '⚠️' :
                      data.status === 'skipped' ? '⏭️' : '⏸️';
        console.log(`${status} ${data.name}: ${data.status.toUpperCase()}`);
        
        if (data.status === 'failed') allPassed = false;
        if (data.status === 'warning') hasWarnings = true;
      });
      
      console.log('\n📊 FINAL PRODUCTION DEPLOYMENT STATUS:');
      if (allPassed && !hasWarnings) {
        console.log('🎉 PRODUCTION DEPLOYMENT FULLY VERIFIED - SYSTEM READY');
        console.log('\n✅ PDF GENERATION SYSTEM COMPLETE:');
        console.log('   • Infrastructure: Working');
        console.log('   • API Endpoints: Working');
        console.log('   • PDF Generation: Working');
        console.log('   • User Interface: Working');
        console.log('   • Performance: Acceptable');
        console.log('   • Error Handling: Working');
      } else if (allPassed && hasWarnings) {
        console.log('⚠️ PRODUCTION DEPLOYMENT VERIFIED WITH WARNINGS');
        console.log('   System is functional but has performance or minor issues');
      } else {
        console.log('❌ PRODUCTION DEPLOYMENT HAS ISSUES');
        console.log('   Critical issues need resolution before full deployment');
      }
      
      process.exit(allPassed ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Production verification execution error:', error);
      process.exit(1);
    });
}

module.exports = { productionDeploymentVerification };