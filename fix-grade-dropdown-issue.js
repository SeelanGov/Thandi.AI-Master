#!/usr/bin/env node

/**
 * Fix Grade Dropdown Display Issue
 * The dropdown is showing corrupted text instead of proper grade options
 */

const https = require('https');

async function testGradeDropdownIssue() {
  console.log('🔍 Investigating Grade Dropdown Issue...\n');
  
  // Test the assessment page to see the actual HTML
  const url = 'https://www.thandi.online/assessment';
  
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('📋 Assessment Page Analysis:');
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Content Length: ${data.length} bytes`);
        
        // Check for grade dropdown in HTML
        const hasGradeSelect = data.includes('Select your grade');
        const hasGradeOptions = data.includes('Grade 10') && data.includes('Grade 11') && data.includes('Grade 12');
        const hasFontIssues = data.includes('font-family') || data.includes('Poppins');
        
        console.log(`   📝 Has grade selector: ${hasGradeSelect ? 'Yes' : 'No'}`);
        console.log(`   🎯 Has grade options: ${hasGradeOptions ? 'Yes' : 'No'}`);
        console.log(`   🔤 Has font styling: ${hasFontIssues ? 'Yes' : 'No'}`);
        
        // Look for specific issues
        if (data.includes('Select your grade')) {
          console.log('\n🔍 Grade Dropdown Found in HTML');
          
          // Extract the select element
          const selectMatch = data.match(/<select[^>]*>[\s\S]*?<\/select>/i);
          if (selectMatch) {
            console.log('   📄 Select element structure looks correct');
          } else {
            console.log('   ❌ Select element structure may be malformed');
          }
        }
        
        // Check for JavaScript errors that might affect rendering
        const hasReactErrors = data.includes('Error') || data.includes('undefined');
        console.log(`   ⚠️ Potential JS errors: ${hasReactErrors ? 'Possible' : 'None detected'}`);
        
        console.log('\n💡 Likely Issues:');
        console.log('   1. Font rendering problem (Poppins font not loading properly)');
        console.log('   2. CSS styling conflict with select element');
        console.log('   3. React hydration mismatch');
        console.log('   4. Browser-specific rendering issue');
        
        console.log('\n🔧 Recommended Fixes:');
        console.log('   1. Remove custom font styling from select element');
        console.log('   2. Add fallback fonts for better compatibility');
        console.log('   3. Simplify select element CSS');
        console.log('   4. Test form validation logic');
        
        resolve();
      });
    }).on('error', (error) => {
      console.log(`❌ Error testing page: ${error.message}`);
      resolve();
    });
  });
}

testGradeDropdownIssue();