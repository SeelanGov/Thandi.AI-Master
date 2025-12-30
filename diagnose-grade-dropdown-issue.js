#!/usr/bin/env node

/**
 * GRADE DROPDOWN ISSUE DIAGNOSTIC
 * Tests the current production deployment for the grade dropdown rendering issue
 */

const https = require('https');

const PRODUCTION_URL = 'https://thandiai-fs5wk1ip5-thandiai-projects.vercel.app';

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

async function diagnoseProblem() {
  console.log('🔍 GRADE DROPDOWN ISSUE DIAGNOSTIC');
  console.log('===================================');
  console.log(`📍 Testing URL: ${PRODUCTION_URL}/assessment`);
  console.log('');
  
  try {
    // Test the assessment page
    const response = await makeRequest(`${PRODUCTION_URL}/assessment`);
    
    console.log(`📊 Response Status: ${response.statusCode}`);
    console.log(`📝 Content-Type: ${response.headers['content-type']}`);
    console.log(`🔤 Content-Encoding: ${response.headers['content-encoding'] || 'none'}`);
    console.log('');
    
    // Check for character encoding issues in the HTML
    const html = response.data;
    
    // Look for the grade dropdown
    const gradeDropdownMatch = html.match(/<select[^>]*>[\s\S]*?<\/select>/i);
    
    if (gradeDropdownMatch) {
      console.log('✅ Grade dropdown found in HTML');
      console.log('📋 Dropdown HTML:');
      console.log(gradeDropdownMatch[0]);
      console.log('');
      
      // Check for option elements
      const optionMatches = html.match(/<option[^>]*>.*?<\/option>/gi);
      if (optionMatches) {
        console.log(`📝 Found ${optionMatches.length} option elements:`);
        optionMatches.forEach((option, index) => {
          console.log(`   ${index + 1}. ${option}`);
        });
      }
    } else {
      console.log('❌ Grade dropdown not found in HTML');
    }
    
    // Check for font-related CSS
    const fontMatches = html.match(/font-family[^;]*;/gi);
    if (fontMatches) {
      console.log('\n🔤 Font declarations found:');
      fontMatches.slice(0, 5).forEach((font, index) => {
        console.log(`   ${index + 1}. ${font}`);
      });
    }
    
    // Check for character encoding meta tag
    const charsetMatch = html.match(/<meta[^>]*charset[^>]*>/i);
    if (charsetMatch) {
      console.log(`\n🔤 Charset declaration: ${charsetMatch[0]}`);
    } else {
      console.log('\n❌ No charset declaration found');
    }
    
    // Check for any unusual characters in the HTML
    const unusualChars = html.match(/[^\x00-\x7F]/g);
    if (unusualChars) {
      const uniqueChars = [...new Set(unusualChars)].slice(0, 10);
      console.log(`\n⚠️  Found ${unusualChars.length} non-ASCII characters (showing first 10 unique):`);
      uniqueChars.forEach(char => {
        console.log(`   "${char}" (Unicode: U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')})`);
      });
    }
    
  } catch (error) {
    console.log(`❌ Error testing URL: ${error.message}`);
  }
  
  console.log('\n🔧 POTENTIAL SOLUTIONS');
  console.log('======================');
  console.log('1. Check if CSS is overriding select font-family');
  console.log('2. Verify character encoding in HTML meta tag');
  console.log('3. Test with different browsers/devices');
  console.log('4. Check for font loading issues');
  console.log('5. Verify Vercel deployment includes all font files');
  
  console.log(`\n📅 Diagnostic completed: ${new Date().toISOString()}`);
}

// Run diagnostic
diagnoseProblem().catch(console.error);