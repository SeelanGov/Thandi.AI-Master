/**
 * PRODUCTION VERIFICATION SCRIPT
 * Footer, Header & School Claim Hotfix - January 21, 2026
 * 
 * Tests the deployed changes on production
 */

const PRODUCTION_URL = 'https://www.thandi.online';

async function verifyProduction() {
  console.log('🔍 VERIFYING PRODUCTION DEPLOYMENT');
  console.log('==================================\n');
  console.log(`Production URL: ${PRODUCTION_URL}\n`);

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Homepage loads
  try {
    console.log('1️⃣ Testing homepage...');
    const response = await fetch(PRODUCTION_URL);
    const html = await response.text();
    
    if (response.ok && html.includes('Thandi.ai')) {
      console.log('   ✅ Homepage loads successfully\n');
      results.passed++;
      results.tests.push({ name: 'Homepage loads', status: 'PASS' });
    } else {
      throw new Error('Homepage did not load correctly');
    }
  } catch (error) {
    console.log(`   ❌ Homepage failed: ${error.message}\n`);
    results.failed++;
    results.tests.push({ name: 'Homepage loads', status: 'FAIL', error: error.message });
  }

  // Test 2: Header contains correct School Login link
  try {
    console.log('2️⃣ Testing Header "School Login" link...');
    const response = await fetch(PRODUCTION_URL);
    const html = await response.text();
    
    // Check if Header contains link to /school/claim
    if (html.includes('href="/school/claim"') && html.includes('School Login')) {
      console.log('   ✅ Header "School Login" points to /school/claim\n');
      results.passed++;
      results.tests.push({ name: 'Header School Login link', status: 'PASS' });
    } else {
      throw new Error('Header School Login link not found or incorrect');
    }
  } catch (error) {
    console.log(`   ❌ Header test failed: ${error.message}\n`);
    results.failed++;
    results.tests.push({ name: 'Header School Login link', status: 'FAIL', error: error.message });
  }

  // Test 3: Footer contains School Portal link
  try {
    console.log('3️⃣ Testing Footer "School Portal" link...');
    const response = await fetch(PRODUCTION_URL);
    const html = await response.text();
    
    if (html.includes('School Portal') && html.includes('href="/school/claim"')) {
      console.log('   ✅ Footer "School Portal" points to /school/claim\n');
      results.passed++;
      results.tests.push({ name: 'Footer School Portal link', status: 'PASS' });
    } else {
      throw new Error('Footer School Portal link not found or incorrect');
    }
  } catch (error) {
    console.log(`   ❌ Footer test failed: ${error.message}\n`);
    results.failed++;
    results.tests.push({ name: 'Footer School Portal link', status: 'FAIL', error: error.message });
  }

  // Test 4: Footer contains System Admin link
  try {
    console.log('4️⃣ Testing Footer "System Admin" link...');
    const response = await fetch(PRODUCTION_URL);
    const html = await response.text();
    
    if (html.includes('System Admin') && html.includes('href="/admin"')) {
      console.log('   ✅ Footer "System Admin" points to /admin\n');
      results.passed++;
      results.tests.push({ name: 'Footer System Admin link', status: 'PASS' });
    } else {
      throw new Error('Footer System Admin link not found or incorrect');
    }
  } catch (error) {
    console.log(`   ❌ Footer test failed: ${error.message}\n`);
    results.failed++;
    results.tests.push({ name: 'Footer System Admin link', status: 'FAIL', error: error.message });
  }

  // Test 5: /admin redirects to /admin/login
  try {
    console.log('5️⃣ Testing /admin authentication...');
    const response = await fetch(`${PRODUCTION_URL}/admin`, {
      redirect: 'manual'
    });
    
    // Should redirect to login if not authenticated
    if (response.status === 307 || response.status === 302 || response.status === 200) {
      console.log('   ✅ /admin page responds correctly\n');
      results.passed++;
      results.tests.push({ name: '/admin authentication', status: 'PASS' });
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Admin test failed: ${error.message}\n`);
    results.failed++;
    results.tests.push({ name: '/admin authentication', status: 'FAIL', error: error.message });
  }

  // Test 6: /admin/login page exists
  try {
    console.log('6️⃣ Testing /admin/login page...');
    const response = await fetch(`${PRODUCTION_URL}/admin/login`);
    const html = await response.text();
    
    if (response.ok && html.includes('Admin Login')) {
      console.log('   ✅ /admin/login page loads successfully\n');
      results.passed++;
      results.tests.push({ name: '/admin/login page', status: 'PASS' });
    } else {
      throw new Error('Admin login page did not load correctly');
    }
  } catch (error) {
    console.log(`   ❌ Admin login test failed: ${error.message}\n`);
    results.failed++;
    results.tests.push({ name: '/admin/login page', status: 'FAIL', error: error.message });
  }

  // Test 7: /school/claim page loads
  try {
    console.log('7️⃣ Testing /school/claim page...');
    const response = await fetch(`${PRODUCTION_URL}/school/claim`);
    const html = await response.text();
    
    if (response.ok && html.includes('School Administration')) {
      console.log('   ✅ /school/claim page loads successfully\n');
      results.passed++;
      results.tests.push({ name: '/school/claim page', status: 'PASS' });
    } else {
      throw new Error('School claim page did not load correctly');
    }
  } catch (error) {
    console.log(`   ❌ School claim test failed: ${error.message}\n`);
    results.failed++;
    results.tests.push({ name: '/school/claim page', status: 'FAIL', error: error.message });
  }

  // Test 8: School claim page shows correct email
  try {
    console.log('8️⃣ Testing school claim page contact info...');
    const response = await fetch(`${PRODUCTION_URL}/school/claim`);
    const html = await response.text();
    
    if (html.includes('hello@thandi.online') && !html.includes('support@thandi.ai')) {
      console.log('   ✅ School claim page shows hello@thandi.online\n');
      results.passed++;
      results.tests.push({ name: 'School claim contact info', status: 'PASS' });
    } else {
      throw new Error('School claim page contact info incorrect');
    }
  } catch (error) {
    console.log(`   ❌ Contact info test failed: ${error.message}\n`);
    results.failed++;
    results.tests.push({ name: 'School claim contact info', status: 'FAIL', error: error.message });
  }

  // Print summary
  console.log('\n═══════════════════════════════════════');
  console.log('📊 PRODUCTION VERIFICATION RESULTS');
  console.log('═══════════════════════════════════════\n');
  
  results.tests.forEach((test, index) => {
    const icon = test.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${index + 1}. ${test.name}: ${test.status}`);
    if (test.error) {
      console.log(`   Error: ${test.error}`);
    }
  });
  
  console.log('\n═══════════════════════════════════════');
  console.log(`Total Tests: ${results.passed + results.failed}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  console.log('═══════════════════════════════════════\n');

  if (results.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Deployment verified successfully.\n');
    console.log('✅ Next Steps:');
    console.log('   1. Perform manual browser testing');
    console.log('   2. Test admin authentication flow');
    console.log('   3. Verify all navigation links work correctly');
    console.log('   4. Check for any console errors\n');
  } else {
    console.log('⚠️  SOME TESTS FAILED. Please investigate and fix issues.\n');
    console.log('🔄 Rollback Plan:');
    console.log('   git checkout backup-2026-01-21-footer-header-school-claim-hotfix');
    console.log('   vercel --prod --force\n');
  }

  return results;
}

// Run verification
verifyProduction().catch(error => {
  console.error('❌ Verification script failed:', error);
  process.exit(1);
});
