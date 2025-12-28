#!/usr/bin/env node

/**
 * Verify Actual Production URL and Test Name Input Fix
 * Check what URL is actually live and test the UX improvements
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Test multiple possible URLs
const TEST_URLS = [
  'https://thandiai.vercel.app',
  'https://thandiai-4n38piyso-thandiai-projects.vercel.app',
  'https://thandiai-n3ewofq6k-thandiai-projects.vercel.app',
  'https://thandi-rag-system.vercel.app'
];

async function testURL(url) {
  console.log(`\n🔍 Testing: ${url}`);
  
  try {
    const startTime = Date.now();
    const response = await fetch(url, { 
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const responseTime = Date.now() - startTime;
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response Time: ${responseTime}ms`);
    
    if (response.ok) {
      const html = await response.text();
      
      // Check if it's the right site
      const isThandiSite = html.includes('THANDI') || html.includes('Career Assessment') || html.includes('thandi');
      console.log(`   Is THANDI Site: ${isThandiSite ? '✅ YES' : '❌ NO'}`);
      
      if (isThandiSite) {
        // Test assessment page
        try {
          const assessmentResponse = await fetch(`${url}/assessment`);
          console.log(`   Assessment Page: ${assessmentResponse.status === 200 ? '✅ Working' : '❌ Failed'}`);
          
          if (assessmentResponse.ok) {
            const assessmentHtml = await assessmentResponse.text();
            
            // Check for our UX improvements
            const hasAutoFocus = assessmentHtml.includes('autoFocus') || assessmentHtml.includes('autofocus');
            const hasFirstNamePlaceholder = assessmentHtml.includes('Enter your first name');
            const hasLastNamePlaceholder = assessmentHtml.includes('Enter your last name');
            const hasSchoolPlaceholder = assessmentHtml.includes('Start typing your school name');
            
            console.log(`   🎯 AutoFocus: ${hasAutoFocus ? '✅' : '❌'}`);
            console.log(`   📝 First Name Placeholder: ${hasFirstNamePlaceholder ? '✅' : '❌'}`);
            console.log(`   📝 Last Name Placeholder: ${hasLastNamePlaceholder ? '✅' : '❌'}`);
            console.log(`   📝 School Placeholder: ${hasSchoolPlaceholder ? '✅' : '❌'}`);
            
            const uxScore = [hasAutoFocus, hasFirstNamePlaceholder, hasLastNamePlaceholder, hasSchoolPlaceholder].filter(Boolean).length;
            console.log(`   📊 UX Score: ${uxScore}/4 (${Math.round(uxScore/4*100)}%)`);
            
            return {
              url,
              working: true,
              isThandiSite: true,
              assessmentWorking: true,
              uxScore,
              responseTime,
              features: {
                autoFocus: hasAutoFocus,
                firstNamePlaceholder: hasFirstNamePlaceholder,
                lastNamePlaceholder: hasLastNamePlaceholder,
                schoolPlaceholder: hasSchoolPlaceholder
              }
            };
          }
        } catch (assessmentError) {
          console.log(`   Assessment Page: ❌ Error - ${assessmentError.message}`);
        }
        
        return {
          url,
          working: true,
          isThandiSite: true,
          assessmentWorking: false,
          responseTime
        };
      }
      
      return {
        url,
        working: true,
        isThandiSite: false,
        responseTime
      };
    } else {
      console.log(`   ❌ HTTP Error: ${response.status} ${response.statusText}`);
      return {
        url,
        working: false,
        error: `HTTP ${response.status}`,
        responseTime
      };
    }
    
  } catch (error) {
    console.log(`   ❌ Connection Error: ${error.message}`);
    return {
      url,
      working: false,
      error: error.message
    };
  }
}

async function findWorkingProductionURL() {
  console.log('🔍 FINDING ACTUAL PRODUCTION URL');
  console.log('=' .repeat(60));
  
  const results = [];
  
  for (const url of TEST_URLS) {
    const result = await testURL(url);
    results.push(result);
  }
  
  // Find the best working URL
  const workingThandiSites = results.filter(r => r.working && r.isThandiSite);
  const workingAssessmentSites = workingThandiSites.filter(r => r.assessmentWorking);
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 PRODUCTION URL ANALYSIS');
  console.log('=' .repeat(60));
  
  console.log(`\n✅ Working URLs: ${results.filter(r => r.working).length}/${TEST_URLS.length}`);
  console.log(`🎯 THANDI Sites: ${workingThandiSites.length}/${TEST_URLS.length}`);
  console.log(`📝 Assessment Working: ${workingAssessmentSites.length}/${TEST_URLS.length}`);
  
  if (workingAssessmentSites.length > 0) {
    const bestSite = workingAssessmentSites.sort((a, b) => (b.uxScore || 0) - (a.uxScore || 0))[0];
    
    console.log(`\n🎉 BEST PRODUCTION URL FOUND:`);
    console.log(`   URL: ${bestSite.url}`);
    console.log(`   Assessment Page: ✅ Working`);
    console.log(`   UX Score: ${bestSite.uxScore || 0}/4 (${Math.round((bestSite.uxScore || 0)/4*100)}%)`);
    console.log(`   Response Time: ${bestSite.responseTime}ms`);
    
    if (bestSite.features) {
      console.log(`\n📋 UX FEATURES STATUS:`);
      console.log(`   AutoFocus: ${bestSite.features.autoFocus ? '✅ Working' : '❌ Missing'}`);
      console.log(`   First Name Placeholder: ${bestSite.features.firstNamePlaceholder ? '✅ Working' : '❌ Missing'}`);
      console.log(`   Last Name Placeholder: ${bestSite.features.lastNamePlaceholder ? '✅ Working' : '❌ Missing'}`);
      console.log(`   School Placeholder: ${bestSite.features.schoolPlaceholder ? '✅ Working' : '❌ Missing'}`);
    }
    
    console.log(`\n🧪 MANUAL TEST INSTRUCTIONS:`);
    console.log(`   1. Visit: ${bestSite.url}/assessment`);
    console.log(`   2. Select any grade (10, 11, or 12)`);
    console.log(`   3. Click "Continue with Registration"`);
    console.log(`   4. Check if first name field automatically has focus`);
    console.log(`   5. Verify placeholders are visible in input fields`);
    
    if ((bestSite.uxScore || 0) >= 3) {
      console.log(`\n🎉 UX FIX STATUS: SUCCESSFULLY DEPLOYED`);
      console.log(`   Students should now have a better registration experience!`);
    } else if ((bestSite.uxScore || 0) >= 1) {
      console.log(`\n⚠️  UX FIX STATUS: PARTIALLY DEPLOYED`);
      console.log(`   Some improvements are live, others may still be propagating`);
    } else {
      console.log(`\n❌ UX FIX STATUS: NOT YET DEPLOYED`);
      console.log(`   Changes may still be propagating or deployment failed`);
    }
    
    return bestSite;
    
  } else if (workingThandiSites.length > 0) {
    const workingSite = workingThandiSites[0];
    console.log(`\n⚠️  PARTIAL SUCCESS:`);
    console.log(`   URL: ${workingSite.url}`);
    console.log(`   Main site working, but assessment page has issues`);
    return workingSite;
    
  } else {
    console.log(`\n❌ NO WORKING THANDI SITES FOUND`);
    console.log(`   All tested URLs either failed or don't contain THANDI content`);
    
    const workingUrls = results.filter(r => r.working);
    if (workingUrls.length > 0) {
      console.log(`\n🔍 Working URLs (but not THANDI sites):`);
      workingUrls.forEach(r => console.log(`   - ${r.url}`));
    }
    
    return null;
  }
}

findWorkingProductionURL().catch(error => {
  console.error('URL verification failed:', error);
  process.exit(1);
});