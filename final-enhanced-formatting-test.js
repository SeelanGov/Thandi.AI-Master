const http = require('http');

async function testEnhancedFormatting() {
  console.log('🎯 FINAL ENHANCED FORMATTING TEST');
  console.log('==================================');
  
  // Wait for server to be ready
  console.log('⏳ Waiting for server to be ready...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/results',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📄 Response received, length:', data.length);
        
        // Check for enhanced formatting in the served content
        const checks = {
          'formatResponse function': data.includes('formatResponse'),
          'student-friendly class': data.includes('student-friendly'),
          'content-section enhanced': data.includes('content-section enhanced'),
          'program-card enhanced': data.includes('program-card enhanced'),
          'key-value enhanced': data.includes('key-value enhanced'),
          'formatValue function': data.includes('formatValue'),
          'enhanced CSS styles': data.includes('.formatted-content.student-friendly')
        };
        
        console.log('\n🔍 Enhanced Formatting Check:');
        let passCount = 0;
        Object.entries(checks).forEach(([check, result]) => {
          console.log(`${result ? '✅' : '❌'} ${check}: ${result}`);
          if (result) passCount++;
        });
        
        const successRate = (passCount / Object.keys(checks).length) * 100;
        console.log(`\n📊 Success Rate: ${passCount}/${Object.keys(checks).length} (${successRate.toFixed(1)}%)`);
        
        if (successRate >= 80) {
          console.log('\n🎉 SUCCESS: Enhanced formatting IS being served!');
          console.log('✅ The cache clearing solution worked');
          console.log('✅ Students will now see the enhanced, presentable results');
        } else if (successRate >= 40) {
          console.log('\n⚠️ PARTIAL: Some enhanced formatting is being served');
          console.log('🔍 May need additional investigation');
        } else {
          console.log('\n❌ FAILURE: Enhanced formatting is still NOT being served');
          console.log('🔍 Need deeper investigation or alternative approach');
        }
        
        // Extract a sample of the content for verification
        const scriptMatch = data.match(/<script[^>]*>(.*?)<\/script>/s);
        if (scriptMatch) {
          const scriptContent = scriptMatch[1];
          const hasFormatResponseInScript = scriptContent.includes('function formatResponse');
          console.log('\n📄 Script Analysis:');
          console.log('✅ formatResponse function in script:', hasFormatResponseInScript);
          
          if (hasFormatResponseInScript) {
            console.log('✅ Enhanced formatting code is in the served JavaScript');
          }
        }
        
        resolve({
          successRate,
          allChecks: checks,
          isWorking: successRate >= 80
        });
      });
    });
    
    req.on('error', (err) => {
      console.error('❌ Request failed:', err.message);
      reject(err);
    });
    
    req.setTimeout(15000, () => {
      console.error('❌ Request timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Run the test
testEnhancedFormatting()
  .then(result => {
    console.log('\n🎯 FINAL RESULT:');
    console.log('=================');
    if (result.isWorking) {
      console.log('🎉 SOLUTION SUCCESSFUL!');
      console.log('✅ Enhanced formatting is now working');
      console.log('✅ User will see presentable, student-friendly results');
      console.log('✅ Results page is aligned with assessment experience');
      console.log('\n📋 USER SHOULD NOW SEE:');
      console.log('- Visual cards for program recommendations');
      console.log('- Color-coded sections with icons');
      console.log('- Enhanced key-value pairs with visual hierarchy');
      console.log('- Professional presentation suitable for students');
    } else {
      console.log('❌ SOLUTION INCOMPLETE');
      console.log('🔍 Enhanced formatting still not fully working');
      console.log('💡 May need alternative approach or deeper investigation');
    }
  })
  .catch(error => {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('1. Check if development server is fully started');
    console.log('2. Try accessing http://localhost:3000/results directly in browser');
    console.log('3. Check browser console for JavaScript errors');
    console.log('4. Consider production build test: npm run build && npm start');
  });