/**
 * VERCEL DEPLOYMENT MONITOR
 * 
 * Monitors Vercel deployment status and tests live URLs
 */

const https = require('https');
const fs = require('fs');

class VercelDeploymentMonitor {
  constructor() {
    this.testUrls = [
      'https://thandi-ai.vercel.app',
      'https://thandi-ai-master.vercel.app',
      'https://thandi-ai-seelangovs-projects.vercel.app',
      'https://thandi-ai-git-main-seelangovs-projects.vercel.app',
      'https://thandi-ai-384b8a51-seelangovs-projects.vercel.app' // Latest commit
    ];
    
    this.results = {
      deploymentStatus: 'monitoring',
      workingUrls: [],
      failedUrls: [],
      mobileUITests: [],
      timestamp: new Date().toISOString()
    };
  }

  async monitorDeployment() {
    console.log('🔍 MONITORING VERCEL DEPLOYMENT...');
    console.log('==================================');
    console.log(`📅 Started: ${new Date().toLocaleString()}`);
    console.log(`🔗 Commit: 384b8a51 (deployment fixes)`);
    console.log(`📱 Testing: Mobile UI fixes + deployment configuration\n`);

    // Wait for deployment to process (Vercel typically takes 2-5 minutes)
    console.log('⏳ Waiting for deployment to complete...');
    await this.waitWithProgress(120); // 2 minutes initial wait

    // Test URLs every 30 seconds for up to 10 minutes
    const maxAttempts = 20; // 10 minutes total
    let attempt = 1;
    let deploymentFound = false;

    while (attempt <= maxAttempts && !deploymentFound) {
      console.log(`\n🔍 Attempt ${attempt}/${maxAttempts} - Testing deployment URLs...`);
      
      const testResults = await this.testAllUrls();
      
      if (testResults.workingUrls.length > 0) {
        deploymentFound = true;
        this.results.deploymentStatus = 'success';
        this.results.workingUrls = testResults.workingUrls;
        
        console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
        console.log(`✅ Found ${testResults.workingUrls.length} working URL(s)`);
        
        // Test mobile UI features
        await this.testMobileUIFeatures(testResults.workingUrls[0]);
        
        break;
      } else {
        console.log(`❌ No working URLs found (attempt ${attempt}/${maxAttempts})`);
        
        if (attempt < maxAttempts) {
          console.log('⏳ Waiting 30 seconds before next attempt...');
          await this.waitWithProgress(30);
        }
      }
      
      attempt++;
    }

    if (!deploymentFound) {
      this.results.deploymentStatus = 'failed';
      console.log('\n❌ DEPLOYMENT MONITORING TIMEOUT');
      console.log('No working URLs found after 10 minutes');
    }

    // Generate final report
    this.generateFinalReport();
  }

  async testAllUrls() {
    const results = { workingUrls: [], failedUrls: [] };
    
    for (const url of this.testUrls) {
      try {
        console.log(`  Testing: ${url}`);
        
        const response = await this.makeRequest(url);
        
        if (response.statusCode === 200) {
          console.log(`  ✅ ${url} - Working!`);
          
          // Test assessment page
          const assessmentUrl = `${url}/assessment`;
          const assessmentResponse = await this.makeRequest(assessmentUrl);
          
          if (assessmentResponse.statusCode === 200) {
            console.log(`  ✅ ${assessmentUrl} - Assessment page working!`);
            
            results.workingUrls.push({
              baseUrl: url,
              assessmentUrl: assessmentUrl,
              status: 'working',
              hasAssessment: true
            });
          } else {
            console.log(`  ⚠️  ${assessmentUrl} - Assessment page issue (${assessmentResponse.statusCode})`);
            results.workingUrls.push({
              baseUrl: url,
              assessmentUrl: assessmentUrl,
              status: 'partial',
              hasAssessment: false
            });
          }
        } else {
          console.log(`  ❌ ${url} - Status ${response.statusCode}`);
          results.failedUrls.push({
            url: url,
            status: response.statusCode,
            error: `HTTP ${response.statusCode}`
          });
        }
        
      } catch (error) {
        console.log(`  ❌ ${url} - Error: ${error.message}`);
        results.failedUrls.push({
          url: url,
          status: 'error',
          error: error.message
        });
      }
    }
    
    return results;
  }

  async testMobileUIFeatures(workingUrl) {
    console.log('\n📱 TESTING MOBILE UI FEATURES...');
    console.log('================================');
    
    try {
      const response = await this.makeRequest(workingUrl.assessmentUrl);
      const html = response.body;
      
      const mobileTests = [
        {
          name: 'Mobile Viewport Meta Tag',
          test: () => html.includes('width=device-width'),
          critical: true
        },
        {
          name: 'THANDI Theme Color',
          test: () => html.includes('#114E4E') || html.includes('theme-color'),
          critical: false
        },
        {
          name: 'THANDI Branding Content',
          test: () => html.includes('THANDI') && html.includes('Career Assessment'),
          critical: true
        },
        {
          name: 'Responsive CSS Classes',
          test: () => html.includes('sm:') || html.includes('md:') || html.includes('lg:'),
          critical: false
        },
        {
          name: 'Touch-Friendly Classes',
          test: () => html.includes('touch-manipulation') || html.includes('min-h-[48px]'),
          critical: false
        }
      ];
      
      let passedTests = 0;
      let criticalIssues = 0;
      
      mobileTests.forEach(test => {
        const passed = test.test();
        if (passed) {
          console.log(`✅ ${test.name}`);
          passedTests++;
        } else {
          console.log(`❌ ${test.name}`);
          if (test.critical) criticalIssues++;
        }
        
        this.results.mobileUITests.push({
          name: test.name,
          passed: passed,
          critical: test.critical
        });
      });
      
      const successRate = (passedTests / mobileTests.length) * 100;
      
      console.log(`\n📊 Mobile UI Test Results:`);
      console.log(`Passed: ${passedTests}/${mobileTests.length} (${successRate.toFixed(1)}%)`);
      console.log(`Critical Issues: ${criticalIssues}`);
      
      if (criticalIssues === 0) {
        console.log('🎉 All critical mobile UI features working!');
      } else {
        console.log('⚠️  Some critical mobile UI features need attention');
      }
      
    } catch (error) {
      console.log('❌ Mobile UI testing failed:', error.message);
      this.results.mobileUITests.push({
        name: 'Mobile UI Test Suite',
        passed: false,
        critical: true,
        error: error.message
      });
    }
  }

  async makeRequest(url) {
    return new Promise((resolve, reject) => {
      const options = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 10000
      };

      const req = https.request(url, options, (res) => {
        let body = '';
        
        res.on('data', (chunk) => {
          body += chunk;
        });
        
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  async waitWithProgress(seconds) {
    const totalDots = 20;
    const interval = seconds * 1000 / totalDots;
    
    process.stdout.write('Progress: ');
    
    for (let i = 0; i < totalDots; i++) {
      await new Promise(resolve => setTimeout(resolve, interval));
      process.stdout.write('.');
    }
    
    console.log(' Done!\n');
  }

  generateFinalReport() {
    console.log('\n📊 FINAL DEPLOYMENT REPORT');
    console.log('==========================');
    
    console.log(`📅 Completed: ${new Date().toLocaleString()}`);
    console.log(`🔗 Commit: 384b8a51`);
    console.log(`📊 Status: ${this.results.deploymentStatus.toUpperCase()}`);
    
    if (this.results.workingUrls.length > 0) {
      console.log('\n✅ WORKING URLS:');
      this.results.workingUrls.forEach((url, index) => {
        console.log(`${index + 1}. ${url.baseUrl}`);
        console.log(`   Assessment: ${url.assessmentUrl}`);
        console.log(`   Status: ${url.status}`);
      });
      
      const primaryUrl = this.results.workingUrls[0];
      console.log(`\n🎯 PRIMARY URL FOR TESTING:`);
      console.log(`${primaryUrl.assessmentUrl}`);
      
    } else {
      console.log('\n❌ NO WORKING URLS FOUND');
      console.log('Deployment may have failed or is still in progress');
    }
    
    // Mobile UI test summary
    if (this.results.mobileUITests.length > 0) {
      const passedMobileTests = this.results.mobileUITests.filter(t => t.passed).length;
      const totalMobileTests = this.results.mobileUITests.length;
      
      console.log(`\n📱 MOBILE UI TESTS: ${passedMobileTests}/${totalMobileTests} passed`);
      
      const criticalFailures = this.results.mobileUITests.filter(t => !t.passed && t.critical).length;
      if (criticalFailures === 0) {
        console.log('✅ All critical mobile UI features working');
      } else {
        console.log(`❌ ${criticalFailures} critical mobile UI issues detected`);
      }
    }
    
    // Next steps
    console.log('\n📋 NEXT STEPS:');
    if (this.results.deploymentStatus === 'success') {
      console.log('✅ Deployment successful - ready for mobile testing!');
      console.log('1. Test registration flow on mobile devices');
      console.log('2. Verify THANDI branding alignment');
      console.log('3. Check touch target accessibility');
      console.log('4. Monitor user completion rates');
    } else {
      console.log('❌ Deployment issues detected:');
      console.log('1. Check Vercel dashboard for build errors');
      console.log('2. Verify environment variables');
      console.log('3. Check domain configuration');
      console.log('4. Try manual redeploy if needed');
    }
    
    // Save detailed report
    fs.writeFileSync('vercel-deployment-monitor-results.json', JSON.stringify(this.results, null, 2));
    console.log('\n💾 Detailed results saved to: vercel-deployment-monitor-results.json');
    
    return this.results;
  }
}

// Run monitoring
async function runDeploymentMonitoring() {
  const monitor = new VercelDeploymentMonitor();
  await monitor.monitorDeployment();
}

if (require.main === module) {
  runDeploymentMonitoring().catch(console.error);
}

module.exports = { VercelDeploymentMonitor };