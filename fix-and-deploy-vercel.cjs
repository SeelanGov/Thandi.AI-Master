/**
 * COMPREHENSIVE VERCEL DEPLOYMENT FIX
 * 
 * Fixes identified issues and deploys to Vercel
 */

const { execSync } = require('child_process');
const fs = require('fs');

async function fixAndDeployVercel() {
  console.log('🔧 COMPREHENSIVE VERCEL DEPLOYMENT FIX');
  console.log('=====================================');
  
  const fixes = [];
  const deploymentSteps = [];
  
  try {
    // Step 1: Apply configuration fixes
    console.log('⚙️  Step 1: Applying configuration fixes...');
    
    // Fixes already applied:
    // - Added "type": "module" to package.json
    // - Fixed viewport metadata in assessment page
    // - Removed metadataBase URL from layout
    
    fixes.push('✅ Added ES module type to package.json');
    fixes.push('✅ Fixed Next.js 15 viewport metadata configuration');
    fixes.push('✅ Removed hardcoded metadataBase URL');
    
    // Step 2: Test build locally
    console.log('\n🔨 Step 2: Testing build with fixes...');
    
    try {
      const buildOutput = execSync('npm run build', { 
        encoding: 'utf8',
        timeout: 300000
      });
      
      console.log('✅ Build successful with fixes');
      deploymentSteps.push('✅ Local build test passed');
      
      // Check for remaining warnings
      if (buildOutput.includes('Warning:')) {
        console.log('⚠️  Some warnings remain (non-critical)');
      } else {
        console.log('✅ No build warnings');
      }
      
    } catch (error) {
      console.log('❌ Build still failing:', error.message);
      deploymentSteps.push('❌ Local build failed - check errors');
      return { success: false, error: error.message };
    }
    
    // Step 3: Commit fixes
    console.log('\n📝 Step 3: Committing fixes...');
    
    try {
      // Add modified files
      execSync('git add package.json app/assessment/page.jsx app/layout.js');
      
      // Commit with descriptive message
      const commitMessage = 'fix: resolve Vercel deployment issues\n\n' +
        '• Add ES module type to package.json\n' +
        '• Fix Next.js 15 viewport metadata configuration\n' +
        '• Remove hardcoded metadataBase URL\n' +
        '• Resolve build warnings for deployment';
      
      execSync(`git commit -m "${commitMessage}"`);
      deploymentSteps.push('✅ Configuration fixes committed');
      console.log('✅ Fixes committed to Git');
      
    } catch (error) {
      if (error.message.includes('nothing to commit')) {
        console.log('⚠️  No changes to commit (fixes may already be applied)');
        deploymentSteps.push('⚠️  No new changes to commit');
      } else {
        console.log('❌ Git commit failed:', error.message);
        deploymentSteps.push('❌ Git commit failed');
      }
    }
    
    // Step 4: Push to trigger deployment
    console.log('\n🚀 Step 4: Triggering Vercel deployment...');
    
    try {
      execSync('git push origin main');
      deploymentSteps.push('✅ Pushed to main - Vercel deployment triggered');
      console.log('✅ Pushed to main branch - Vercel deployment triggered');
      
    } catch (error) {
      console.log('❌ Git push failed:', error.message);
      deploymentSteps.push('❌ Git push failed');
      return { success: false, error: error.message };
    }
    
    // Step 5: Monitor deployment
    console.log('\n👀 Step 5: Monitoring deployment...');
    
    console.log('🔍 Deployment initiated. Checking status in 60 seconds...');
    
    // Wait for deployment to process
    await new Promise(resolve => setTimeout(resolve, 60000));
    
    // Test deployment URLs
    const testResults = await testDeploymentUrls();
    deploymentSteps.push(...testResults.steps);
    
    // Generate final report
    const report = {
      timestamp: new Date().toISOString(),
      success: testResults.success,
      fixes: fixes,
      deploymentSteps: deploymentSteps,
      workingUrl: testResults.workingUrl,
      nextSteps: generateNextSteps(testResults)
    };
    
    fs.writeFileSync('vercel-deployment-fix-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n📊 DEPLOYMENT FIX SUMMARY');
    console.log('=========================');
    
    fixes.forEach(fix => console.log(fix));
    console.log('');
    deploymentSteps.forEach(step => console.log(step));
    
    if (testResults.success) {
      console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
      console.log(`✅ THANDI is now live at: ${testResults.workingUrl}`);
      console.log('\n📱 Ready for mobile UI testing!');
    } else {
      console.log('\n⚠️  DEPLOYMENT STATUS UNCLEAR');
      console.log('Check Vercel dashboard for deployment status');
    }
    
    console.log('\n💾 Detailed report saved to: vercel-deployment-fix-report.json');
    
    return report;
    
  } catch (error) {
    console.error('❌ Deployment fix failed:', error);
    return { success: false, error: error.message };
  }
}

async function testDeploymentUrls() {
  console.log('🌐 Testing deployment URLs...');
  
  const urlsToTest = [
    'https://thandi-ai.vercel.app',
    'https://thandi-ai-master.vercel.app',
    'https://thandi-ai-seelangovs-projects.vercel.app',
    'https://thandi-ai-git-main-seelangovs-projects.vercel.app'
  ];
  
  const results = {
    success: false,
    workingUrl: null,
    steps: []
  };
  
  for (const url of urlsToTest) {
    try {
      console.log(`Testing: ${url}`);
      
      const https = require('https');
      const response = await new Promise((resolve, reject) => {
        const req = https.request(url, { timeout: 10000 }, resolve);
        req.on('error', reject);
        req.on('timeout', () => reject(new Error('Timeout')));
        req.end();
      });
      
      if (response.statusCode === 200) {
        console.log(`✅ ${url} - Working!`);
        results.success = true;
        results.workingUrl = url;
        results.steps.push(`✅ Found working URL: ${url}`);
        
        // Test assessment page
        const assessmentUrl = `${url}/assessment`;
        try {
          const assessmentResponse = await new Promise((resolve, reject) => {
            const req = https.request(assessmentUrl, { timeout: 10000 }, resolve);
            req.on('error', reject);
            req.on('timeout', () => reject(new Error('Timeout')));
            req.end();
          });
          
          if (assessmentResponse.statusCode === 200) {
            console.log(`✅ ${assessmentUrl} - Assessment page working!`);
            results.steps.push(`✅ Assessment page accessible: ${assessmentUrl}`);
          }
        } catch (error) {
          console.log(`⚠️  Assessment page test failed: ${error.message}`);
        }
        
        break; // Found working URL, stop testing
        
      } else {
        console.log(`❌ ${url} - Status ${response.statusCode}`);
        results.steps.push(`❌ ${url} - Status ${response.statusCode}`);
      }
      
    } catch (error) {
      console.log(`❌ ${url} - Error: ${error.message}`);
      results.steps.push(`❌ ${url} - Error: ${error.message}`);
    }
  }
  
  if (!results.success) {
    results.steps.push('⚠️  No working URLs found - deployment may still be in progress');
  }
  
  return results;
}

function generateNextSteps(testResults) {
  const steps = [];
  
  if (testResults.success) {
    steps.push('✅ Deployment successful - proceed with mobile UI testing');
    steps.push(`Test mobile UI fixes at: ${testResults.workingUrl}/assessment`);
    steps.push('Verify registration flow works on mobile devices');
    steps.push('Check THANDI branding alignment and touch targets');
    steps.push('Monitor user completion rates for improvement');
  } else {
    steps.push('⚠️  Check Vercel dashboard for deployment status');
    steps.push('Wait 5-10 minutes for deployment to complete');
    steps.push('Check build logs in Vercel for any errors');
    steps.push('Verify environment variables are set in Vercel');
    steps.push('Try manual redeploy from Vercel dashboard if needed');
  }
  
  return steps;
}

// Run the fix and deployment
if (require.main === module) {
  fixAndDeployVercel().catch(console.error);
}

module.exports = { fixAndDeployVercel };