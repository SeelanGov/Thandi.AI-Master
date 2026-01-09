/**
 * DEPLOY PDF API FIX
 * Quick deployment to fix missing /api/pdf/generate route
 */

const { execSync } = require('child_process');

async function deployPDFApiFix() {
  console.log('🚀 DEPLOYING PDF API FIX');
  console.log('========================');
  
  try {
    // Check if PDF API route exists locally
    const fs = require('fs');
    const apiRoutePath = 'app/api/pdf/generate/route.js';
    
    if (!fs.existsSync(apiRoutePath)) {
      console.log('❌ PDF API route file missing locally');
      return false;
    }
    
    console.log('✅ PDF API route exists locally');
    
    // Quick Vercel deployment
    console.log('🔄 Deploying to Vercel...');
    
    try {
      // Force deployment with specific focus on API routes
      const deployResult = execSync('vercel --prod --force', { 
        encoding: 'utf8',
        timeout: 120000 // 2 minute timeout
      });
      
      console.log('✅ Deployment completed');
      console.log('📋 Deploy output:', deployResult);
      
      // Wait a moment for deployment to propagate
      console.log('⏳ Waiting for deployment to propagate...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Test the deployed API
      console.log('🔄 Testing deployed PDF API...');
      
      const testResponse = await fetch('https://thandi.online/api/pdf/generate', {
        method: 'GET',
        timeout: 10000
      });
      
      if (testResponse.status === 200 || testResponse.status === 405) {
        console.log('✅ PDF API is now accessible in production');
        return true;
      } else {
        console.log(`❌ PDF API still returns ${testResponse.status}`);
        return false;
      }
      
    } catch (deployError) {
      console.log('❌ Deployment failed:', deployError.message);
      return false;
    }
    
  } catch (error) {
    console.log('❌ Deploy fix failed:', error.message);
    return false;
  }
}

// Execute if run directly
if (require.main === module) {
  deployPDFApiFix()
    .then(success => {
      if (success) {
        console.log('\n🎉 PDF API DEPLOYMENT SUCCESSFUL');
        console.log('✅ Task can now be completed');
      } else {
        console.log('\n❌ PDF API DEPLOYMENT FAILED');
        console.log('📋 Alternative: Document working implementation');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Deploy execution error:', error);
      process.exit(1);
    });
}

module.exports = { deployPDFApiFix };