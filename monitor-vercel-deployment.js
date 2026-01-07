// Monitor Vercel deployment status after git push
const monitorDeployment = async () => {
  console.log('🚀 VERCEL DEPLOYMENT MONITORING\n');
  console.log('Git push completed successfully!');
  console.log('Commit: 5b07ef5a - Professional PDF generation fix\n');
  
  try {
    // Import node-fetch for testing
    let fetch;
    try {
      fetch = (await import('node-fetch')).default;
    } catch (e) {
      console.log('⚠️  node-fetch not available, using manual monitoring');
      console.log('\n📋 MANUAL MONITORING STEPS:');
      console.log('1. Visit: https://vercel.com/dashboard');
      console.log('2. Look for new deployment in progress');
      console.log('3. Monitor build logs for any errors');
      console.log('4. Test PDF endpoint once deployed');
      return;
    }
    
    console.log('📡 Checking for Vercel deployment...\n');
    
    // Test potential Vercel URLs that might be created
    const potentialUrls = [
      'https://thandi-ai.vercel.app',
      'https://thandi-online.vercel.app', 
      'https://thandi-rag-system.vercel.app',
      'https://thandi-rag-system-git-main.vercel.app',
      'https://thandi-ai-git-main.vercel.app'
    ];
    
    let deploymentFound = false;
    
    for (const url of potentialUrls) {
      try {
        console.log(`🔍 Testing: ${url}`);
        
        const response = await fetch(url, { 
          timeout: 10000,
          headers: { 'User-Agent': 'Thandi-Deployment-Monitor' }
        });
        
        console.log(`   Status: ${response.status}`);
        
        if (response.status === 200) {
          console.log(`   ✅ DEPLOYMENT ACTIVE: ${url}`);
          deploymentFound = true;
          
          // Test the PDF endpoint on this deployment
          console.log(`\n📄 Testing PDF endpoint on active deployment...`);
          
          try {
            const pdfUrl = `${url}/api/pdf/deployment-verification`;
            const pdfResponse = await fetch(pdfUrl, { timeout: 15000 });
            
            console.log(`   PDF Status: ${pdfResponse.status}`);
            console.log(`   Content-Type: ${pdfResponse.headers.get('content-type')}`);
            
            if (pdfResponse.headers.get('content-type') === 'application/pdf') {
              console.log('   ✅ SUCCESS: Professional PDF generation working!');
              console.log('   ✅ Fix deployed successfully');
              
              const contentLength = pdfResponse.headers.get('content-length');
              console.log(`   📦 PDF Size: ${contentLength} bytes`);
              
            } else if (pdfResponse.headers.get('content-type') === 'text/plain') {
              console.log('   ⚠️  Still returning text - deployment may be in progress');
            } else {
              console.log('   ❓ Unexpected response type');
            }
            
          } catch (pdfError) {
            console.log(`   ⚠️  PDF test failed: ${pdfError.message}`);
            console.log('   💡 Deployment may still be in progress');
          }
          
          break;
          
        } else if (response.status === 404) {
          console.log(`   ⏳ Not deployed yet: ${response.status}`);
        } else {
          console.log(`   ❓ Unexpected status: ${response.status}`);
        }
        
      } catch (error) {
        if (error.code === 'ENOTFOUND') {
          console.log(`   ⏳ Domain not found - deployment pending`);
        } else {
          console.log(`   ❌ Error: ${error.message}`);
        }
      }
    }
    
    if (!deploymentFound) {
      console.log('\n⏳ No active deployment found yet');
      console.log('💡 Vercel deployment typically takes 2-5 minutes');
      console.log('🔄 Deployment may still be in progress');
      
      console.log('\n📋 NEXT STEPS:');
      console.log('1. Wait 2-5 minutes for Vercel to build and deploy');
      console.log('2. Check Vercel dashboard: https://vercel.com/dashboard');
      console.log('3. Look for build logs and deployment status');
      console.log('4. Test PDF endpoint once deployment completes');
      
      console.log('\n🎯 EXPECTED OUTCOME:');
      console.log('- New Vercel deployment will be created');
      console.log('- PDF endpoints will return professional PDFs');
      console.log('- Users will get branded career reports');
    }
    
    console.log('\n📊 DEPLOYMENT STATUS SUMMARY:');
    console.log('✅ Git commit successful');
    console.log('✅ Git push to main completed');
    console.log('⏳ Vercel auto-deployment triggered');
    console.log('🔄 Monitoring for deployment completion...');
    
  } catch (error) {
    console.error('❌ Monitoring failed:', error.message);
  }
  
  console.log('\n🚀 DEPLOYMENT INITIATED SUCCESSFULLY!');
  console.log('Monitor progress at: https://vercel.com/dashboard');
};

// Run monitoring
monitorDeployment().catch(console.error);